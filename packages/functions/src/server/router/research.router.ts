import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { eq } from "@/core/db";
import { researches } from "@/core/db/schema/entities/research.sql";
import { githubUsernameSchema } from "@/core/github/schema.validation";
import { fetchUser, IS_USER_MESSAGE, isUser } from "@/core/github/user";
import { createNewResearch } from "@/core/research";
import { getDeps } from "@/deps";
import type { Context } from "@/server/app";

import { createSuccessResponse } from "../response";

export const researchRouter = new Hono<Context>()
  .get("/:nanoId", async (c) => {
    const { nanoId } = c.req.param();
    const { db } = getDeps();
    const [research] = await db
      .select({
        id: researches.id,
        nanoId: researches.nanoId,
        prompt: researches.prompt,
        devId: researches.devId,
      })
      .from(researches)
      .where(eq(researches.nanoId, nanoId));
    if (!research) {
      throw new HTTPException(404, {
        message: "Research not found",
      });
    }
    return c.json(
      createSuccessResponse({
        data: { research },
        message: "Research fetched successfully",
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
      const nanoId = await createNewResearch({
        research: {
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
          data: { username, nanoId },
          message:
            "Please wait while our AI agents research this developer's GitHub activity.",
        }),
      );
    },
  );
