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
