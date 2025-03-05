import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import environment from "vite-plugin-environment";
import dotenv from "dotenv";

dotenv.config();

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
    fs: {
      strict: false, // ✅ Allow reading file outside of project
    },
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
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
  ],
  resolve: {
    preserveSymlinks: true, // ✅ Ensure proper module resolution
  },
});
