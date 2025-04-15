/**
 * Represents the state of an agent
 */
export interface AgentState {
  status: "inactive" | "running" | "complete";
  initialPrompt: string;
  steps: Array<{
    title: string;
    thoughts: string;
    context: string;
  }>;
  title?: string;
  thoughts?: string;
  context?: string;
}

/**
 * Represents a message in the agent conversation
 */
export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  type: "incoming" | "outgoing";
}

/**
 * Agent configuration type
 */

/**
 * Environment stage type
 */
export type Stage = "local" | "stg" | "prod";

/**
 * Get agent configuration based on nanoId and stage
 * @param nanoId - The unique identifier for the research
 * @param stage - The environment stage (local, dev, staging, prod)
 * @returns The agent configuration object
 */
export function getAgentClientFetchOpts(
  nanoId: string,
  stage: Stage = "local",
) {
  // Default agent name
  const agent = "dev-research-agent";

  // Determine host based on stage
  let host: string;
  switch (stage) {
    case "local":
      host = "http://localhost:4141";
      break;
    case "stg":
      host = "https://dev-agent.example.com";
      break;
    case "prod":
      host = "https://agent.example.com";
      break;
    default:
      host = "http://localhost:4141";
  }

  return {
    agent,
    name: nanoId,
    host,
  };
}
