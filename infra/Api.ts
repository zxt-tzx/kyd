import { domain } from "./Dns";
import { allSecrets } from "./Secret";

const apiFn = new sst.aws.Function("ApiFn", {
  url: true,
  handler: "./packages/functions/src/api.handler",
  link: [...allSecrets],
  runtime: "nodejs22.x",
  environment: {
    SST_STAGE: $app.stage,
  },
});

export const api = new sst.aws.Router("Api", {
  routes: {
    "/*": apiFn.url,
  },
  domain: {
    name: "api." + domain,
    dns: sst.cloudflare.dns(),
  },
});

export const apiUrl = api.url;

export const outputs = {};
