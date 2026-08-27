import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react-native': 'react-native-web',
    },
  },
  optimizeDeps: {
    exclude: ['expo-clipboard'],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  // Bolt Performance Optimization:
  // Drop console and debugger statements during production builds to eliminate
  // console overhead and reduce runtime thread blocking on mobile and web clients.
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  build: {
    target: 'esnext',
    outDir: 'build',
    // Bolt Performance Optimization:
    // Configure Rollup split chunks boundaries to segment vendor dependencies.
    // Separates React and React Native Web vendor libraries from application bundle
    // to improve browser parallel requests and leverage browser persistent caching.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Due to pnpm's virtual store peer-dependency structure, the match for
            // 'react-native-web' must precede other vendor checks to avoid false-positive matches.
            if (id.includes('react-native-web')) {
              return 'vendor-react-native-web';
            }
            if (id.includes('react-dom') || id.includes('react/')) {
              return 'vendor-react';
            }
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