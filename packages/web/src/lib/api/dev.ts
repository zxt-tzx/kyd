import { type InferResponseType } from "hono/client";

import { client, handleResponse } from "./client";

export const newDevQuery = async (username: string) => {
  const res = await client.query.$post({
    json: { username },
  });
  return handleResponse(res);
};

export type NewDevQueryResponse = InferResponseType<typeof client.query.$post>;
