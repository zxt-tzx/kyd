import { Hono } from "hono";

import type { Context } from "@/server/app";

import { createSuccessResponse } from "../response";

export const dummyRouter = new Hono<Context>().get("/get", async (c) => {
  return c.json(
    createSuccessResponse({
      data: { message: "Hello, world!" },
      message: "Successfully fetched dummy data",
    }),
  );
});
