import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { eq } from "@/core/db";
import { queries } from "@/core/db/schema/entities/query.sql";
import { githubUsernameSchema } from "@/core/github/schema.validation";
import { fetchUser, IS_USER_MESSAGE, isUser } from "@/core/github/user";
import { createNewQuery } from "@/core/query";
import { getDeps } from "@/deps";
import type { Context } from "@/server/app";

import { createSuccessResponse } from "../response";

export const queryRouter = new Hono<Context>()
  .get("/:urlId", async (c) => {
    const { urlId } = c.req.param();
    const { db } = getDeps();
    const [query] = await db
      .select({
        id: queries.id,
        urlId: queries.urlId,
        prompt: queries.prompt,
        devId: queries.devId,
      })
      .from(queries)
      .where(eq(queries.urlId, urlId));
    if (!query) {
      throw new HTTPException(404, {
        message: "Query not found",
      });
    }
    return c.json(
      createSuccessResponse({
        data: { query },
        message: "Query fetched successfully",
      }),
    );
  })
  .post(
    "/",
    zValidator("json", z.object({ username: githubUsernameSchema })),
    async (c) => {
      const username = c.req.valid("json").username;
      // TODO: replace this with authed fetch, higher rate limit, lower likelihood of something going wrong
      const user = await fetchUser(username);
      if (!isUser(user)) {
        throw new HTTPException(400, {
          message: IS_USER_MESSAGE,
        });
      }
      const { db } = getDeps();
      const urlId = await createNewQuery({
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
          data: { username, urlId },
          message:
            "Please wait while our AI agents research this developer's GitHub activity.",
        }),
      );
    },
  );
