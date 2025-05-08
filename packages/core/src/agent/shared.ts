import { z } from "zod";

// Base schema for common fields in active agent states
const AgentActiveStateBase = z.object({
  githubUsername: z.string(),
  initiatedAt: z.coerce.date(),
  prompt: z.string(),
  title: z.string(),
  log: z.string(),
  findings: z.string(),
});

export const AgentStateSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("loading") }),
  z.object({ status: z.literal("inactive") }),
  AgentActiveStateBase.extend({
    status: z.literal("running"),
    report: z.null(),
  }),
  AgentActiveStateBase.extend({
    status: z.literal("complete"),
    report: z.string(),
  }),
]);

/**
 * Schema for the agent message body fields
 * Used to validate the POST request body in the research router
 */
export const AgentMessageBodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("initialize"),
    prompt: z.string(),
    githubUsername: z.string(),
  }),
  z.object({
    action: z.literal("cancel"),
  }),
]);

export type AgentState = z.infer<typeof AgentStateSchema>;
export type AgentMessageBody = z.infer<typeof AgentMessageBodySchema>;

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
