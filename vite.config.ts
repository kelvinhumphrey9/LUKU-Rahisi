import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Bolt Optimization: Strip console.* and debugger statements in production builds only
  esbuild: mode === 'production' ? { drop: ['console', 'debugger'] } : undefined,
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      'react-native': 'react-native-web',
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
    // Bolt Optimization: Split core framework libraries into dedicated vendor chunks for improved browser caching
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Check react-native-web first due to pnpm virtual store peer dependency naming
          if (id.includes('react-native-web')) {
            return 'react-native-web-vendor';
          }
          if (id.includes('react-dom') || id.includes('react')) {
            return 'react-vendor';
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
