import { handle } from "hono/aws-lambda";

import { app } from "./server/app";

// Export the main API handler
export const handler = handle(app);

// Export the streams API handler with a different name
// export { handler as streamsHandler } from "./streams";
