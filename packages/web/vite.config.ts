import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({}),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Know Your Dev",
        short_name: "KYD",
        description: "Quick due diligence on software developers",
        theme_color: "#36CC32",
        background_color: "#36CC32",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        // Note: Instead of using 'permissions' which is not supported in ManifestOptions,
        // we'll request these permissions in the app code when needed
      },
      includeAssets: [
        "favicon.svg",
        "apple-touch-icon-180x180.png",
        "maskable-icon-512x512.png",
      ],
      // workbox: {
      //   globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      //   runtimeCaching: [
      //     {
      //       urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      //       handler: "CacheFirst",
      //       options: {
      //         cacheName: "google-fonts-cache",
      //         expiration: {
      //           maxEntries: 10,
      //           maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
      //         },
      //         cacheableResponse: {
      //           statuses: [0, 200],
      //         },
      //       },
      //     },
      //   ],
      // },
    }),
  ],
  assetsInclude: ["**/*.md"],
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
    port: 3000,
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
