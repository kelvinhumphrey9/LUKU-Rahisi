import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  return {
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
              // Bolt Performance Optimization:
              // Due to pnpm's virtual store naming conventions, the resolved module paths ('id')
              // for react-native-web contain peer dependencies like '_react-dom@' and '_react@'.
              // Placing react-native-web check first ensures these modules are not falsely matched
              // by react-dom or react-core-vendor.
              if (id.includes("react-native-web")) {
                return "react-native-web-vendor";
              }
              if (id.includes("react-dom")) {
                return "react-dom-vendor";
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
    // Exclude native Expo modules from Vite web pre-bundling to prevent build errors.
    optimizeDeps: {
      exclude: ["expo-clipboard", "expo-modules-core"],
      esbuildOptions: {
        loader: {
          ".js": "jsx",
        },
      },
    },
    // Bolt Performance Optimization:
    // Drop console and debugger statements during production builds only.
    esbuild: {
      ...(mode === "production" ? { drop: ["console", "debugger"] as const } : {}),
    },
    server: {
      port: 3000,
      open: true,
    },
  };
});