import { AsyncLocalStorage } from "node:async_hooks";
import { openai } from "@ai-sdk/openai";
import { getAgentByName, routeAgentRequest, type Connection } from "agents";
import { AIChatAgent } from "agents/ai-chat-agent";
import { unstable_getSchedulePrompt } from "agents/schedule";
import {
  createDataStreamResponse,
  generateText,
  streamText,
  type StreamTextOnFinishCallback,
} from "ai";

import { AgentMessageBodySchema, type AgentState } from "@/core/agent/shared";

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
  async initialize(data: { prompt: string; htmlUrl: string }) {
    // TODO: abstract and clean this up
    let title;
    try {
      // Use generateText from the AI SDK (non-streaming approach)
      const { text: titleText } = await generateText({
        model,
        system: "You are a helpful assistant that creates concise, descriptive titles.",
        messages: [{
          role: "user",
          content: `Create a short, descriptive title (5-7 words max) for a research task with this prompt: "${data.prompt}"`
        }],
        temperature: 0.7,
        maxTokens: 50
      });

      // Clean up the title
      title = titleText.trim().replace(/^["']|["']$/g, '');
      if (!title) {
        title = `Research Agent #${this.name}`; // Fallback if empty
      }
    } catch (error) {
      console.error("Error generating title:", error);
      title = `Research Agent #${this.name}`; // Fallback on error
    }

    this.setState({
      status: "running",
      agentInfo: {
        initialPrompt: data.prompt,
        initiatedAt: new Date(),
        scratchpad: "",
        title,
      },
      steps: [],
    });

    await this.startResearch({ prompt: data.prompt, htmlUrl: data.htmlUrl });

    return { success: true, message: "Agent initialized successfully" };
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
  /**
   * Starts the research process and generates steps
   * @param data - Data passed to the task, including the initial prompt and GitHub URL
   */
  async startResearch(data: { prompt: string; htmlUrl: string }) {
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
        details: `Collecting relevant information from GitHub profile: ${data.htmlUrl}`,
      },
    ];

    // Update agent state with initial steps
    this.setState({
      ...currentState,
      steps: initialSteps,
    });
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
    // from backend, check API key
    // TODO: from frontend, check auth cookie
    // Check if cloudflareSecretKey in headers matches process.env.CLOUDFLARE_SECRET_KEY
    // Handle POST requests with JSON body for initialization
    if (
      request.method === "POST" &&
      request.headers.get("content-type")?.includes("application/json")
    ) {
      try {
        const cloudflareSecretKey = request.headers.get("cloudflareSecretKey");
        if (
          !cloudflareSecretKey ||
          cloudflareSecretKey !== env.CLOUDFLARE_SECRET_KEY
        ) {
          return new Response("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const messageBody = AgentMessageBodySchema.parse(body);

        if (messageBody.action === "initialize") {
          // Get the agent ID from the URL
          const url = new URL(request.url);
          const pathParts = url.pathname.split("/");
          const agentName = pathParts[pathParts.length - 1];
          if (!agentName) {
            throw new Response("Missing agent name", { status: 400 });
          }
          const { htmlUrl, prompt } = messageBody;

          // Create a stub of the agent to interact with the Durable Object
          const agent = await getAgentByName(env.DevResearchAgent, agentName);
          await agent.initialize({ htmlUrl, prompt });

          return new Response("Agent initialized successfully", {
            headers: { "Content-Type": "text/plain" },
            status: 200,
          });
        }
      } catch (error) {
        console.error("Error processing request:", error);
        return new Response(
          JSON.stringify({
            success: false,
            message: error instanceof Error ? error.message : "Unknown error",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }

    return (
      // Route other requests to our agent or return 404 if not found
      (await routeAgentRequest(request, env, {
        cors: true,
        onBeforeConnect: (connection) => {
          // for websocket connection, future TODO: cookie auth?
          return connection;
        },
        onBeforeRequest: (request) => {
          return request;
        },
      })) || new Response("Not found", { status: 404 })
    );
  },
} satisfies ExportedHandler<Env>;
