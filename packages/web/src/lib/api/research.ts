import { type InferResponseType } from "hono/client";

import { client, handleResponse } from "./client";

export async function newDevResearch(
  username: string,
  prompt: string | undefined,
) {
  const res = await client.research.$post({
    json: { username, prompt },
  });
  return handleResponse(res);
}

export type NewDevResearchResponse = InferResponseType<
  typeof client.research.$post
>;
