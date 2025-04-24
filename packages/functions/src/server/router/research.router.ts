import { zValidator } from "@hono/zod-validator";
import { agentFetch } from "agents/client";
import dedent from "dedent";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { Resource } from "sst";

import type { AgentMessageBody } from "@/core/agent/shared";
import {
  AgentMessageBodySchema,
  getAgentClientFetchOpts,
} from "@/core/agent/shared";
import { eq } from "@/core/db";
import { researches } from "@/core/db/schema/entities/research.sql";
import { researchInputSchema } from "@/core/github/schema.validation";
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
  .post("/", zValidator("json", researchInputSchema), async (c) => {
    const { username, prompt: userPrompt } = c.req.valid("json");
    // TODO: replace this with authed fetch, higher rate limit, lower likelihood of something going wrong
    const user = await fetchUser(username);
    if (!isUser(user)) {
      throw new HTTPException(400, {
        message: IS_USER_MESSAGE,
      });
    }
    const htmlUrl = user.html_url;
    const prompt = dedent`
        You are a sophisticated AI agent that is tasked to conduct research on a particular developer.
        ${userPrompt ? `The user who would like to do this research has provided this additional information:${userPrompt}` : ""}
      `;
    const { db } = getDeps();
    const cloudflareSecretKey = Resource.Keys.cloudflareSecretKey;
    const nanoId = await createNewResearch({
      research: {
        prompt,
      },
      dev: {
        nodeId: user.node_id,
        login: user.login,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatar_url,
        htmlUrl,
        company: user.company,
        location: user.location,
        bio: user.bio,
      },
      db,
    });

    // Create and validate the request body
    const messageBody: AgentMessageBody = {
      action: "initialize",
      prompt,
      githubUsername: username,
    };

    // TODO: wrap this in db transaction?
    const response = await agentFetch(
      // Using shared configuration function
      getAgentClientFetchOpts({ nanoId, stage: Resource.App.stage }),
      {
        method: "POST",
        headers: {
          cloudflareSecretKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(AgentMessageBodySchema.parse(messageBody)),
      },
    );
    if (!response.ok) {
      throw new HTTPException(response.status as ContentfulStatusCode, {
        message: "Failed to call agent fetch",
      });
    }
    return c.json(
      createSuccessResponse({
        data: { username, nanoId },
        message:
          "Please wait while our AI agents research this developer's GitHub activity.",
      }),
    );
  });
