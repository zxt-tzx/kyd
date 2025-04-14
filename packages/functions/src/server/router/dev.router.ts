import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { githubUsernameSchema } from "@/core/github/schema.validation";
import { fetchUser, IS_USER_MESSAGE, isUser } from "@/core/github/user";
import { createNewQuery } from "@/core/query";
import { getDeps } from "@/deps";
import type { Context } from "@/server/app";

import { createSuccessResponse } from "../response";

export const devRouter = new Hono<Context>().post(
  "/research",
  zValidator("json", z.object({ username: githubUsernameSchema })),
  async (c) => {
    const username = c.req.valid("json").username;
    const user = await fetchUser(username);
    if (!isUser(user)) {
      throw new HTTPException(400, {
        message: IS_USER_MESSAGE,
      });
    }
    const { db } = getDeps();
    const queryId = await createNewQuery({
      query: {
        prompt: "", // TODO: prompt
      },
      dev: {
        nodeId: user.node_id,
        login: user.login,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatar_url,
        htmlUrl: user.html_url,
        company: user.company,
        location: user.location,
        bio: user.bio,
      },
      db,
    });

    return c.json(
      createSuccessResponse({
        data: { username, queryId },
        message:
          "Please wait while our AI agents research this developer's GitHub activity.",
      }),
    );
  },
);
