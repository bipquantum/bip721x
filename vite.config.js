import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import environment from "vite-plugin-environment";
import dotenv from "dotenv";

dotenv.config();

process.env.II_URL =
  process.env.DFX_NETWORK === "local"
    ? `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`
    : `https://identity.ic0.app`;

export default defineConfig({
  root: "src/frontend",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
      },
    },
    watch: {
      usePolling: true, // ✅ Fix for file change detection
      interval: 300, // ✅ Poll every 300ms
    },
    hmr: {
      overlay: true, // ✅ Show errors in browser
    },
  },
  plugins: [
    react(),
    environment(["II_URL"]),
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
  ],
  resolve: {
    preserveSymlinks: true, // ✅ Ensure proper module resolution
  },
});
