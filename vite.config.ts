import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Alias 'react-native' to 'react-native-web' for Vite web builds
      "react-native": "react-native-web",
    },
  },
  build: {
    target: "esnext",
    outDir: "build",
    rollupOptions: {
      output: {
        // Bolt Performance Optimization:
        // Separate heavy vendor dependencies from application code into custom chunks.
        // This splits libraries (like React, React-DOM, and React Native Web) so they can be
        // cached independently by the user's browser, leading to faster subsequent page loads
        // and a dramatically reduced primary index entry chunk size.
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom")) {
              return "react-dom-vendor";
            }
            if (id.includes("react-native-web")) {
              return "react-native-web-vendor";
            }
            if (id.includes("react")) {
              return "react-core-vendor";
            }
            return "vendor";
          }
        },
      },
    },
  },
  // Bolt Performance Optimization:
  // Drop console and debugger statements during production builds.
  // This reduces the output bundle size and eliminates runtime performance overhead from logs/warnings/debug statements.
  esbuild: {
    drop: ["console", "debugger"],
  },
  server: {
    port: 3000,
    open: true,
  },
});
