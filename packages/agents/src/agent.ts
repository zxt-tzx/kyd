import { getAgentByName, routeAgentRequest, type Connection } from "agents";
import { AIChatAgent } from "agents/ai-chat-agent";
import { generateText, streamText } from "ai";
import dedent from "dedent";

import { AgentMessageBodySchema, type AgentState } from "@/core/agent/shared";
import { fetchUser } from "@/core/github/user";
import { createContext } from "@/core/util/context";

import { smallQuickModel } from "./models";

export const agentContext = createContext<DevResearchAgent>();
/**
 * Chat Agent implementation that handles real-time AI chat interactions
 */
export class DevResearchAgent extends AIChatAgent<Env, AgentState> {
  initialState: AgentState = {
    status: "inactive",
  };
  onStateUpdate(state: AgentState, source: Connection | "server") {
    console.log("State updated:", state);
  }
  onConnect(connection: Connection) {
    console.log("Client connected:", this.name);
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
  async initialize(data: { prompt: string; githubUsername: string }) {
    const { prompt, githubUsername } = data;
    const { text: title } = await generateText({
      model: smallQuickModel,
      system:
        "You are a helpful assistant that creates concise, descriptive summaries.",
      messages: [
        {
          role: "user",
          content: `Create a short, descriptive title (5-7 words max) for a research task with this prompt: "${prompt}"`,
        },
      ],
      temperature: 0.3,
    });
    this.setState({
      githubUsername,
      title,
      status: "running",
      initiatedAt: new Date(),
      prompt: data.prompt,
      findings: `# Key Findings re: ${githubUsername}`,
      log: "Initializing research...",
      report: null,
    });

    void this.research();

    return { success: true, message: "Agent initialized successfully" };
  }
  async research() {
    if (this.state.status !== "running") {
      this.appendLog("Agent is not running, terminating startResearch");
      return;
    }
    // get basic user info from API
    this.appendLog("Fetching basic user info...");
    const user = await fetchUser(this.state.githubUsername);
    const basicUserInfo = dedent`
    # Basic user info
    - Login: ${user.login}
    ${user.name ? `- Name: ${user.name}` : ""}
    - Joined on ${user.created_at}
    ${user.company ? `- Company: ${user.company}` : ""}
    ${user.location ? `- Location: ${user.location}` : ""}
    ${user.bio ? `- Bio: ${user.bio}` : ""}
    ${user.hireable !== null ? `- Hireable: ${user.hireable}` : ""}
    Number of public repos: ${user.public_repos}
    Number of public gists: ${user.public_gists}
    Number of followers: ${user.followers}
    Number of following: ${user.following}
    `;
    this.appendFindings({
      newInfo: basicUserInfo,
      message: "Adding basic user info to findings...",
    });
  }

  /**
   * Helper method to update the scratchpad with new information
   * @param newInfo - New information to append to the scratchpad
   */

  appendLog(newInfo: string) {
    if (this.state.status !== "running") return;
    const updatedLog = this.state.log + "\n\n" + newInfo;
    this.setState({
      ...this.state,
      log: updatedLog,
    });
  }

  appendFindings({
    newInfo,
    message: logMessage,
  }: {
    newInfo: string;
    message: string;
  }) {
    if (this.state.status !== "running") return;
    const updatedFindings = this.state.findings + "\n\n" + newInfo;
    this.appendLog(logMessage);
    this.setState({
      ...this.state,
      findings: updatedFindings,
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
          const { githubUsername, prompt } = messageBody;

          // Create a stub of the agent to interact with the Durable Object
          const agent = await getAgentByName(env.DevResearchAgent, agentName);
          await agent.initialize({ githubUsername, prompt });

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
