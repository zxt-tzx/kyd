/**
 * Shared types and interfaces for agent functionality
 */

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
