import { resolve } from "path";
import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.jsonc" },
      },
    },
  },
  resolve: {
    alias: {
      "@/core": resolve(__dirname, "../core/src"),
      "@": resolve(__dirname, "./src"),
      // Force use of our mocks
      "node-html-parser": resolve(
        __dirname,
        "./tests/__mocks__/node-html-parser/index.js",
      ),
      "css-select": resolve(__dirname, "./tests/__mocks__/css-select/index.js"),
    },
  },
});
