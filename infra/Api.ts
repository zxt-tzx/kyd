import { domain } from "./Dns";
import { allSecrets } from "./Secret";

const apiFn = new sst.aws.Function("ApiFn", {
  url: true,
  handler: "./packages/functions/src/api.handler",
  link: [...allSecrets],
  runtime: "nodejs22.x",
});

export const apiUrl = apiFn.url;

export const outputs = {
  apiFn: apiFn.url,
};

export const api = new sst.aws.Router("Api", {
  routes: {
    "/*": apiFn.url,
  },
  domain: {
    name: "api." + domain,
    dns: sst.cloudflare.dns(),
  },
});
