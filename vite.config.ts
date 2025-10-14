import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";


export default defineConfig(async ({ command, mode }) => {
  // isProduction = true for build and preview
  const isProduction = mode === "production" && process.env.NETLIFY !== "true";
  const basePath = isProduction ? "/Tic-Tac-Toe-By-Using-Mini-Max/" : "/";

  return {
    base: basePath,
    root: path.resolve(import.meta.dirname, "client"),

    plugins: [
      react(),
      runtimeErrorOverlay(),
      ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
        ? [
            await import("@replit/vite-plugin-cartographer").then((m) =>
              m.cartographer()
            ),
            await import("@replit/vite-plugin-dev-banner").then((m) =>
              m.devBanner()
            ),
          ]
        : []),
    ],

    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },

    build: {
      outDir: path.resolve(import.meta.dirname, "dist"),
      emptyOutDir: true,
    },

    server: {
      open: true,
      fs: { strict: true, deny: ["**/.*"] },
      // This allows SPA routing for dev
      historyApiFallback: true,
    },

    preview: {
      port: 4173,
      // Important! Serve the preview at the same base as production
      open: true,
    },
  };
});
