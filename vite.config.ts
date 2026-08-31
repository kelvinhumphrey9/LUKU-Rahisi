import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Bolt Optimization: Drop console/debugger statements in production and code-split core vendor dependencies
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react-native": "react-native-web",
    },
  },
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
  build: {
    outDir: "build",
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Note: Under pnpm, virtual paths may contain _react-dom and _react in react-native-web folder name.
          // Therefore react-native-web check must strictly precede react-dom and react checks.
          if (id.includes("react-native-web")) {
            return "vendor-react-native-web";
          }
          if (id.includes("react-dom")) {
            return "vendor-react-dom";
          }
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/.pnpm/react@")
          ) {
            return "vendor-react";
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
}));
