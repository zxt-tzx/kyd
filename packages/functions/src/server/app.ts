import { Hono } from "hono";
import type { Env } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { Resource } from "sst";

import type { ErrorResponse } from "./response";
import { queryRouter } from "./router/query.router";

export interface Context extends Env {
  // Variables: {
  //   user: User | null;
  // };
}

export interface AuthedContext extends Context {
  Variables: Omit<Context["Variables"], "user"> & {
    // user: User;
  };
}

export const app = new Hono<Context>();

// CORS middleware
// app.use("*", async (c, next) => {
//   const { currStage } = getDeps();
//   return cors(getApiServerCORS(currStage))(c, next);
// });

// Logger middleware
app.use(logger());

app.get("/", async (c) => {
  return c.redirect("/");
});

const _routes = app
  // Create the base app with /api prefix
  .basePath("/api")
  .route("/query", queryRouter);
// Protected user-specific routes
// .use("/me/*", authMiddleware) // Apply middleware to all /me routes

// Export the type for client usage
export type ApiRoutes = typeof _routes;

app.notFound((c) => {
  return c.json<ErrorResponse>(
    {
      success: false,
      error: `Not Found: ${c.req.path}`,
    },
    404,
  );
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json<ErrorResponse>(
      {
        success: false,
        error: err.message,
        // isFormError:
        //   err.cause && typeof err.cause === "object" && "form" in err.cause
        //     ? err.cause.form === true
        //     : false,
      },
      err.status,
    );
  }
  const isProd = Resource.App.stage === "prod";
  return c.json<ErrorResponse>(
    {
      success: false,
      error: isProd ? "Internal Server Error" : (err.stack ?? err.message),
    },
    500,
  );
});
