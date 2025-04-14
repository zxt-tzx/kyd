import { type InferResponseType } from "hono/client";

import { client, handleResponse } from "./client";

export async function newDevQuery(username: string) {
  const res = await client.query.$post({
    json: { username },
  });
  return handleResponse(res);
}

export type NewDevQueryResponse = InferResponseType<typeof client.query.$post>;

const _get_urlId = client.query[":urlId"].$get;
type QueryUrlIdResponse = InferResponseType<typeof _get_urlId>;

export async function getQueryByUrlId(urlId: string) {
  const res = await client.query[":urlId"].$get({
    param: { urlId },
  });
  const { data } = await handleResponse<QueryUrlIdResponse>(
    res,
    "Failed to get query",
  );
  return data;
}
