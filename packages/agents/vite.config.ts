import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [cloudflare()],
  resolve: {
    alias: {
      "@/core": path.resolve(__dirname, "../core/src"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 4141, // AI ftw
  },
});
