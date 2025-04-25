import { openai } from "@ai-sdk/openai";

// generate title
export const smallQuickModel = openai.responses("gpt-4.1-nano-2025-04-14");

// evaluate relevance?
export const workhorseModel = openai.responses("gpt-4.1-mini-2025-04-14");

export const workhorseReasoningModel = openai.responses("o4-mini-2025-04-16");

// synthesise final report
export const bigReasoningModel = openai.responses("o3-2025-04-16");
