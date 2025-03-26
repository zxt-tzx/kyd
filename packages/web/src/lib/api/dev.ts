import { type InferResponseType } from "hono/client";

import { client, handleResponse } from "./client";

export const researchDev = async (username: string) => {
  const res = await client.dev.research.$post({
    json: { username },
  });
  return handleResponse(res);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const $post_dev = client.dev.research.$post;
export type ResearchDevResponse = InferResponseType<typeof $post_dev>;
