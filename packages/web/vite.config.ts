import fs from "fs";
import path from "path";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite({}), react()],
  resolve: {
    alias: {
      "@/core": path.resolve(__dirname, "../core/src"),
      "@/functions": path.resolve(__dirname, "../functions/src"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-core": ["react", "react-dom"],
          tanstack: [
            "@tanstack/react-router",
            "@tanstack/react-query",
            "@tanstack/react-form",
            "@tanstack/router-zod-adapter",
            "@tanstack/zod-form-adapter",
          ],
          "ui-components": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-dialog",
            "@radix-ui/react-icons",
            "@radix-ui/react-slot",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
            "lucide-react",
            "cmdk",
          ],
          styling: [
            "tailwindcss",
            "tailwind-merge",
            "tailwindcss-animate",
            "class-variance-authority",
            "clsx",
          ],
        },
      },
      onwarn(warning, warn) {
        // Suppress warnings about Node.js module externalization
        if (
          warning.code === "PLUGIN_WARNING" &&
          warning.plugin === "vite:resolve" &&
          warning.message.includes(
            "has been externalized for browser compatibility",
          )
        ) {
          return;
        }
        warn(warning);
      },
    },
  },
  server: {
    host: "local.kyd.theintel.io",
    port: 3001,
    https: {
      key: fs.readFileSync(
        path.resolve(__dirname, "./certs/local.kyd.theintel.io-key.pem"),
      ),
      cert: fs.readFileSync(
        path.resolve(__dirname, "./certs/local.kyd.theintel.io.pem"),
      ),
    },
  },
});
