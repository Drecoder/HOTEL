import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  root: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, '../../dist/apps/frontend'),
    emptyOutDir: true,
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  plugins: [react(), visualizer()],
  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  optimizeDeps: {
    include: ['@apollo/client', 'graphql', 'zustand'],
    esbuildOptions: {
      // make sure esbuild sees react in this monorepo
      resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
