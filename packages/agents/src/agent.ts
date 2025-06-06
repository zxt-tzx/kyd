import { getAgentByName, routeAgentRequest, type Connection } from "agents";
import { AIChatAgent } from "agents/ai-chat-agent";
import { generateText } from "ai";
import dedent from "dedent";

import { AgentMessageBodySchema, type AgentState } from "@/core/agent/shared";
import { extractFromGithubRepo, fetchPinnedRepos } from "@/core/github/repo";
import { getRestOctokit } from "@/core/github/shared";
import { createContext } from "@/core/util/context";

import { bigReasoningModel, smallQuickModel, workhorseModel } from "./models";

export const agentContext = createContext<DevResearchAgent>();
/**
 * Chat Agent implementation that handles real-time AI chat interactions
 */
export class DevResearchAgent extends AIChatAgent<Env, AgentState> {
  initialState: AgentState = {
    status: "inactive",
  };
  onStateUpdate(state: AgentState, source: Connection | "server") {
    // console.log("State updated:", state);
  }
  onConnect(connection: Connection) {
    console.log("Client connected:", this.name);
  }

  onClose(connection: Connection) {
    console.log("Client disconnected:", this.name);
  }

  async onMessage(connection: Connection, message: string) {
    try {
      const data = JSON.parse(message);

      // Validate message using our schema
      const result = AgentMessageBodySchema.safeParse(data);

      if (result.success) {
        const messageBody = result.data;

        if (messageBody.action === "cancel") {
          this.cancel();
          return;
        } else if (messageBody.action === "initialize") {
          // Handle initialize action if needed for websocket connections
          // This would be rare since initialization usually happens via HTTP
          const { githubUsername, prompt } = messageBody;
          await this.initialize({ githubUsername, prompt });
          return;
        }
      }
    } catch {
      // not JSON or invalid schema format; ignore
    }
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
          content: `Create a short, descriptive title for a research task with this prompt: "${prompt}"`,
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
      log: `Initializing research of ${githubUsername}...`,
      report: null,
    });

    void this.research();

    return { success: true, message: "Agent initialized successfully" };
  }

  /**
   * Gracefully cancel running research.
   */
  cancel() {
    if (this.state.status === "running") {
      this.appendLog("Research cancelled by user.");
      this.setState({ status: "inactive" });
    }
  }
  async research() {
    try {
      if (this.state.status !== "running") {
        this.appendLog("Agent is not running, terminating startResearch");
        return;
      }
      // get basic user info from API
      this.appendLog("Fetching basic user info...");
      const restOctokit = getRestOctokit({
        type: "token",
        token: this.env.GITHUB_PERSONAL_ACCESS_TOKEN,
      });
      const { data: user } = await restOctokit.rest.users.getByUsername({
        username: this.state.githubUsername,
      });

      this.appendLog(`Successfully fetched user info`);
      const basicUserInfo = dedent`
    ## Basic user info
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

      // 1. Pinned repositories
      this.appendLog("Getting user's pinned repos...");
      const pinnedRepos = await fetchPinnedRepos(this.state.githubUsername);
      if (pinnedRepos.length > 0) {
        this.appendFindings({
          newInfo: "## Pinned Repositories",
          message: "Successfully fetched pinned repositories.",
        });

        // Analysing each pinned repo sequentially to avoid API-rate limits
        for (const repo of pinnedRepos) {
          // Safety check – ensure the agent is still running
          if (this.state.status !== "running") return;

          this.appendLog(
            `Analysing pinned repo ${repo.author}/${repo.name}...`,
          );

          const keyRepoInfo = await extractFromGithubRepo({
            url: repo.url,
            model: workhorseModel,
            instructions: {
              whatThisIs: `This repository is pinned by ${this.state.githubUsername}. The purpose of the overall research is: ${this.state.prompt}`,
              whatToExtract:
                "Summarise the repository in 2-3 concise paragraphs focusing on its purpose, key technologies and any notable achievements. Do not include code blocks.",
            },
          });

          const pinnedRepoInfo = dedent`
            ### [${repo.author}/${repo.name}](${repo.url})
            - Description: ${repo.description || "(no description)"}
            - Primary language: ${repo.language || "Unknown"}
            ${repo.stars ? `- Stars: ${repo.stars}` : ""}
            ${repo.forks ? `- Forks: ${repo.forks}` : ""}
            - Key details: ${keyRepoInfo.trim()}
          `;

          this.appendFindings({
            newInfo: pinnedRepoInfo,
            message: `Added analysis of pinned repo ${repo.name}`,
          });
        }
      } else {
        this.appendFindings({
          newInfo: "*No pinned repositories found*",
          message: "No pinned repos found.",
        });
      }

      // 2. Starred repositories (top 5 by stargazers count)
      this.appendLog("Fetching user's starred repositories...");
      const { data: starredRepos } =
        await restOctokit.rest.activity.listReposStarredByUser({
          username: this.state.githubUsername,
          per_page: 100,
        });

      if (starredRepos.length > 0) {
        // Sort by popularity and take the top 5 for a lighter analysis
        const topStarred = [...starredRepos]
          .sort((a, b) => {
            const aCount =
              "repo" in a ? a.repo.stargazers_count : a.stargazers_count!;
            const bCount =
              "repo" in b ? b.repo.stargazers_count : b.stargazers_count!;
            return bCount - aCount;
          })
          .slice(0, 5);

        this.appendFindings({
          newInfo: "## Notable Starred Repositories",
          message: "Processing top starred repositories...",
        });

        for (const repo of topStarred) {
          if (this.state.status !== "running") return;

          const repoData = "repo" in repo ? repo.repo : repo;
          const starredInfo = dedent`
            ### [${repoData.full_name}](https://github.com/${repoData.full_name})
            - Stars: ${repoData.stargazers_count}
            - Primary language: ${repoData.language || "Unknown"}
            - Description: ${repoData.description || "(no description)"}
          `;

          this.appendFindings({
            newInfo: starredInfo,
            message: `Added info for starred repo ${repoData.full_name}`,
          });
        }
      } else {
        this.appendFindings({
          newInfo: "*No starred repositories found*",
          message: "No starred repos found.",
        });
      }

      // 3. Watched repositories (list first 5)
      this.appendLog("Fetching user's watched repositories...");
      const { data: watchedRepos } =
        await restOctokit.rest.activity.listReposWatchedByUser({
          username: this.state.githubUsername,
          per_page: 100,
        });

      if (watchedRepos.length > 0) {
        this.appendFindings({
          newInfo: "## Watched Repositories (sample)",
          message: "Adding watched repositories to findings...",
        });

        watchedRepos.slice(0, 5).forEach((repo) => {
          const watchedInfo = `- [${repo.full_name}](https://github.com/${repo.full_name}) (${repo.language || "Unknown"})`;
          this.appendFindings({
            newInfo: watchedInfo,
            message: `Added watched repo ${repo.full_name}`,
          });
        });
      } else {
        this.appendFindings({
          newInfo: "*No watched repositories found*",
          message: "No watched repos found.",
        });
      }

      // 4. Public gists (list first 5)
      this.appendLog("Fetching user's public gists...");
      const { data: publicGists } = await restOctokit.rest.gists.listForUser({
        username: this.state.githubUsername,
        per_page: 100,
      });

      if (publicGists.length > 0) {
        this.appendFindings({
          newInfo: "## Public Gists (sample)",
          message: "Adding public gists to findings...",
        });

        publicGists.slice(0, 5).forEach((gist) => {
          const gistInfo = `- ${gist.description || "(no description)"} – ${Object.keys(gist.files).length} files`;
          this.appendFindings({
            newInfo: gistInfo,
            message: `Added gist ${gist.id}`,
          });
        });
      } else {
        this.appendFindings({
          newInfo: "*No public gists found*",
          message: "No gists found.",
        });
      }

      // 5. Language usage breakdown across pinned + starred repos
      const languageCounts: Record<string, number> = {};
      [...pinnedRepos, ...starredRepos].forEach((repo) => {
        const repoData = "repo" in repo ? repo.repo : repo;
        const lang = repoData.language || "Unknown";
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      });

      const languageBreakdown = Object.entries(languageCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([lang, count]) => `- ${lang}: ${count}`)
        .join("\n");

      if (languageBreakdown) {
        this.appendFindings({
          newInfo: dedent`
            ## Language Usage Snapshot
            ${languageBreakdown}
          `,
          message: "Added language usage breakdown to findings...",
        });
      }

      // All data gathered – generate final report
      await this.completeResearch();
    } catch (error) {
      console.error("Error: ", error);
      this.appendLog(`Error fetching user info: ${error}`);
    }
  }
  async completeResearch() {
    try {
      if (this.state.status !== "running") {
        this.appendLog("Agent is not running, terminating completeResearch");
        return;
      }

      this.appendLog("Generating final research report...");

      const { text: report } = await generateText({
        model: bigReasoningModel,
        system:
          "You are a professional researcher that synthesizes information into clear, well-organized reports.",
        messages: [
          {
            role: "user",
            content: dedent`
              Based on the following research prompt and findings, create a comprehensive research report in markdown format. Please adhere closely to the provided prompt and format the report to be maximally useful to the
              <prompt>
              ${this.state.prompt}
              </prompt>

              <findings>
              ${this.state.findings}
              </findings>

              Your report should be well-structured with clear sections, professional tone, and actionable insights, in accordance with the prompt. Avoid using emojis and progress bars as this breaks formatting. Tables are fine. Don't use the \`\`\`markdown\`\`\` tags and avoid "end of report" tags.
            `,
          },
        ],
        temperature: 0.2,
      });

      this.appendLog("Research report generated successfully");

      this.setState({
        ...this.state,
        report,
        status: "complete",
      });
    } catch (error) {
      console.error("Error: ", error);
      this.appendLog(`Error completing research: ${error}`);
    }
  }

  appendLog(newInfo: string) {
    if (this.state.status !== "running") return;
    const updatedLog = this.state.log + "\n\n" + newInfo;
    console.log("Log updated:", newInfo, "\n\n");
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
    console.log("Findings updated:", newInfo, "\n\n");
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

        // Get the agent ID from the URL
        const url = new URL(request.url);
        const pathParts = url.pathname.split("/");
        const agentName = pathParts[pathParts.length - 1];
        if (!agentName) {
          throw new Response("Missing agent name", { status: 400 });
        }

        // Create a stub of the agent to interact with the Durable Object
        const agent = await getAgentByName(env.DevResearchAgent, agentName);

        if (messageBody.action === "initialize") {
          const { githubUsername, prompt } = messageBody;
          await agent.initialize({ githubUsername, prompt });

          return new Response("Agent initialized successfully", {
            headers: { "Content-Type": "text/plain" },
            status: 200,
          });
        } else if (messageBody.action === "cancel") {
          await agent.cancel();

          return new Response("Agent cancelled successfully", {
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
