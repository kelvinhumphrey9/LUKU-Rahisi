import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: {
      'react-native': 'react-native-web',
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    // Drop console and debugger in production builds for optimal runtime performance
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  build: {
    target: 'esnext',
    outDir: 'build',
  },
  server: {
    port: 3000,
    open: true,
  },
}));
