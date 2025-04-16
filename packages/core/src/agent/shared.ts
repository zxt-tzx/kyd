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
 * Environment stage type
 */
export type Stage = "stg" | "prod" | (string & {});

/**
 * Get agent configuration based on nanoId and stage
 * @param nanoId - The unique identifier for the research
 * @param stage - The environment stage (local, dev, staging, prod)
 * @returns The agent configuration object
 */
export function getAgentClientFetchOpts({
  nanoId,
  stage = "local",
}: {
  nanoId: string;
  stage: Stage;
}) {
  // Default agent name
  const agent = "dev-research-agent";

  // Determine host based on stage
  let host: string;
  switch (stage) {
    case "stg":
      host = "https://kyd-agent-stg.theintel.io";
      break;
    case "prod":
      host = "https://kyd-agent.theintel.io";
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
