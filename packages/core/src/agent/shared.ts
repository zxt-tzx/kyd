import { z } from "zod";

export const AgentInfo = z.object({
  initiatedAt: z.coerce.date(),
  title: z.string(),
  initialPrompt: z.string(),
  scratchpad: z.string(),
});

export const AgentStepSchema = z.object({
  title: z.string(),
  thoughts: z.string(),
  context: z.string(),
});

export const AgentStateSchema = z.union([
  z.object({ status: z.literal("inactive") }),
  z.object({
    status: z.union([z.literal("running"), z.literal("complete")]),
    agentInfo: AgentInfo,
    steps: z.array(AgentStepSchema),
  }),
]);

export type AgentInfo = z.infer<typeof AgentInfo>;
export type AgentStep = z.infer<typeof AgentStepSchema>;
export type AgentState = z.infer<typeof AgentStateSchema>;

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
