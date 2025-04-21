import { apiUrl } from "./Api";
import { domain } from "./Dns";

const web = new sst.aws.StaticSite("Web", {
  path: "packages/web",
  environment: {
    // when adding new env vars, you may have to rm -rf node_modules
    VITE_API_URL: apiUrl.apply((url) => {
      if (typeof url !== "string") {
        throw new Error("API URL must be a string");
      }
      return url;
    }),
    VITE_SST_STAGE: $app.stage,
  },
  build: {
    command: "vite build",
    output: "./dist",
  },
  domain: {
    dns: sst.cloudflare.dns(),
    name: domain,
  },
});

export const outputs = {
  web: web.url,
};
