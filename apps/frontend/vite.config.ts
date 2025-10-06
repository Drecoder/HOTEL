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
      '@apollo/client': path.resolve(__dirname, '../../node_modules/@apollo/client'),
    },
  },
  optimizeDeps: {
    include: ['@apollo/client'],
  },
});
