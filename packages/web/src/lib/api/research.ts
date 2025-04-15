import { type InferResponseType } from "hono/client";

import { client, handleResponse } from "./client";

export async function newDevResearch(username: string) {
  const res = await client.research.$post({
    json: { username },
  });
  return handleResponse(res);
}

export type NewDevResearchResponse = InferResponseType<
  typeof client.research.$post
>;

const _get_nanoId = client.research[":nanoId"].$get;
type ResearchNanoIdResponse = InferResponseType<typeof _get_nanoId>;

export async function getResearchByNanoId(nanoId: string) {
  const res = await client.research[":nanoId"].$get({
    param: { nanoId },
  });
  const { data } = await handleResponse<ResearchNanoIdResponse>(
    res,
    "Failed to get research",
  );
  return data;
}
