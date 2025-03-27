import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { githubUsernameSchema } from "@/core/github/schema.validation";
import type { Context } from "@/server/app";

import { createSuccessResponse } from "../response";

export const devRouter = new Hono<Context>().post(
  "/research",
  zValidator("json", z.object({ username: githubUsernameSchema })),
  async (c) => {
    const username = c.req.valid("json").username;
    // insert row into db
    return c.json(
      createSuccessResponse({
        data: { username },
        message:
          "Please wait while our AI agents research this developer's GitHub activity.",
      }),
    );
  },
);
