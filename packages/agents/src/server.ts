import { AsyncLocalStorage } from "node:async_hooks";
import { openai } from "@ai-sdk/openai";
import { routeAgentRequest, type Connection, type Schedule } from "agents";
import { AIChatAgent } from "agents/ai-chat-agent";
import { unstable_getSchedulePrompt } from "agents/schedule";
import {
  createDataStreamResponse,
  generateId,
  streamText,
  type StreamTextOnFinishCallback,
} from "ai";

import { type AgentState } from "@/core/agent/shared";

import { executions, tools } from "./tools";
import { processToolCalls } from "./utils";

const model = openai("gpt-4o-2024-11-20");

// we use async local storage to expose the agent context to the tools
export const agentContext = new AsyncLocalStorage<DevResearchAgent>();
/**
 * Chat Agent implementation that handles real-time AI chat interactions
 */
export class DevResearchAgent extends AIChatAgent<Env, AgentState> {
  initialState: AgentState = {
    status: "inactive",
  };
  onConnect(connection: Connection) {
    console.log("Client connected:", this.name);
    // connection.send(`Welcome! You are connected with ID: ${connection.id}`);
  }

  onClose(connection: Connection) {
    console.log("Client disconnected:", this.name);
  }

  async onRequest(request: Request) {
    const action = request.headers.get("action");
    const prompt = request.headers.get("prompt");
    if (action === "initialize" && prompt) {
      const name = this.name;
      this.setState({
        status: "running",
        agentInfo: {
          initialPrompt: prompt,
          initiatedAt: new Date(),
          scratchpad:
            "Use this scratchpad to save information relating to the research. We will use all the information in this scratchpad to generate a writeup at the end.",
          title: `Research Agent #${name}`,
        },
        steps: [],
      });

      // Schedule the startResearch task to begin in 100 milliseconds
      await this.schedule(0.1, "startResearch", { prompt });
      // Task scheduled, will execute soon

      return new Response(
        JSON.stringify({
          success: true,
          message: "Agent initialized successfully",
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
    const timestamp = new Date().toLocaleTimeString();
    return new Response(
      `Server time: ${timestamp} - We received your request!`,
      {
        headers: {
          "Content-Type": "text/plain",
        },
      },
    );
  }
  /**
   * Handles incoming chat messages and manages the response stream
   * @param onFinish - Callback function executed when streaming completes
   */

  async onChatMessage(onFinish: StreamTextOnFinishCallback<{}>) {
    // Create a streaming response that handles both text and tool outputs
    return agentContext.run(this, async () => {
      const dataStreamResponse = createDataStreamResponse({
        execute: async (dataStream) => {
          // Process any pending tool calls from previous messages
          // This handles human-in-the-loop confirmations for tools
          const processedMessages = await processToolCalls({
            messages: this.messages,
            dataStream,
            tools,
            executions,
          });

          // Stream the AI response using GPT-4
          const result = streamText({
            model,
            system: `You are a helpful assistant that can do various tasks...

${unstable_getSchedulePrompt({ date: new Date() })}

If the user asks to schedule a task, use the schedule tool to schedule the task.
`,
            messages: processedMessages,
            tools,
            onFinish,
            onError: (error) => {
              console.error("Error while streaming:", error);
            },
            maxSteps: 10,
          });

          // Merge the AI response stream with tool execution outputs
          result.mergeIntoDataStream(dataStream);
        },
      });

      return dataStreamResponse;
    });
  }
  async executeTask(description: string, task: Schedule<string>) {
    await this.saveMessages([
      ...this.messages,
      {
        id: generateId(),
        role: "user",
        content: `Running scheduled task: ${description}`,
        createdAt: new Date(),
      },
    ]);

    // Handle different scheduled tasks based on their description
    if (description === "startResearch") {
      // Parse the payload from the task
      const payload =
        typeof task.payload === "string"
          ? JSON.parse(task.payload)
          : task.payload;
      await this.startResearch(payload);
    }
  }

  /**
   * Starts the research process and generates steps
   * @param data - Data passed to the task, including the initial prompt
   */
  async startResearch(data: { prompt: string }) {
    // Starting research process with the provided prompt
    const currentState = this.state;
    if (currentState.status !== "running") return;

    // Generate initial research steps
    const initialSteps = [
      {
        stepTitle: "Research Initialization",
        details:
          "Analyzing prompt and preparing research strategy based on: " +
          data.prompt,
      },
      {
        stepTitle: "Gathering Initial Information",
        details:
          "Collecting relevant information and resources to address the research topic.",
      },
    ];

    // Update agent state with initial steps
    this.setState({
      ...currentState,
      steps: initialSteps,
    });

    // Example of updating scratchpad with interesting information
    // Simulate a delayed update (in a real implementation, this would be based on actual research)
    setTimeout(() => {
      this.updateScratchpad(
        "Initial research shows several promising avenues to explore...",
      );

      // Add a new step to demonstrate progress
      this.addResearchStep({
        stepTitle: "Analyzing Key Concepts",
        details:
          "Breaking down the main concepts in the research topic and identifying connections between them.",
      });
    }, 3000);
  }

  /**
   * Helper method to add a new research step
   * @param step - The research step to add
   */
  addResearchStep(step: { stepTitle: string; details: string }) {
    const currentState = this.state;
    if (currentState.status !== "running") return;

    this.setState({
      ...currentState,
      steps: [...currentState.steps, step],
    });
  }

  /**
   * Helper method to update the scratchpad with new information
   * @param newInfo - New information to append to the scratchpad
   */
  updateScratchpad(newInfo: string) {
    const currentState = this.state;
    if (currentState.status !== "running" || !currentState.agentInfo) return;

    const updatedScratchpad =
      currentState.agentInfo.scratchpad + "\n\n" + newInfo;

    this.setState({
      ...currentState,
      agentInfo: {
        ...currentState.agentInfo,
        scratchpad: updatedScratchpad,
      },
    });
  }
}

/**
 * Worker entry point that routes incoming requests to the appropriate handler
 */
export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
    return (
      // Route the request to our agent or return 404 if not found
      (await routeAgentRequest(request, env, {
        // prefix: "dev-research-agent",
        cors: true,
        onBeforeConnect: (connection) => {
          // for websocket connection, future TODO: cookie auth?
          // console.log("connection no auth required for now!!");
          return connection;
        },
        onBeforeRequest: (request) => {
          // Check if cloudflareSecretKey in headers matches process.env.CLOUDFLARE_SECRET_KEY
          const cloudflareSecretKey = request.headers.get(
            "cloudflareSecretKey",
          );
          if (
            !cloudflareSecretKey ||
            cloudflareSecretKey !== env.CLOUDFLARE_SECRET_KEY
          ) {
            return new Response("Unauthorized", {
              status: 401,
            });
          }
          return request;
        },
      })) || new Response("Not found", { status: 404 })
    );
  },
} satisfies ExportedHandler<Env>;
