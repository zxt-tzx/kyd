/// <reference path="./.sst/platform/config.d.ts" />
import { readdirSync } from "fs";

export default $config({
  app(input) {
    return {
      name: "know-your-dev",
      removal: input.stage === "prod" ? "retain" : "remove",
      protected: input.stage === "prod",
      home: "aws",
      providers: {
        random: true,
        cloudflare: true,
        aws: {
          profile: input.stage === "prod" ? "theintel-prod" : "theintel-dev",
          region: "ap-southeast-1",
        },
      },
    };
  },
  async run() {
    const outputs = {};
    for (const value of readdirSync("./infra/")) {
      const result = await import("./infra/" + value);
      if (result.outputs) Object.assign(outputs, result.outputs);
    }
    return outputs;
  },
});
