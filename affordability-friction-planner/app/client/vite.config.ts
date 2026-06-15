import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { appKitTypesPlugin } from '@databricks/appkit';

// https://vite.dev/config/
export default defineConfig({
  root: __dirname,
  plugins: [
    react(),
    tailwindcss(),
    appKitTypesPlugin({
      watchFolders: ['config/queries'],
      outFile: 'shared/appkit-types/analytics.d.ts',
    }),
  ],
  server: {
    middlewareMode: true,
  },
  build: {
    outDir: path.resolve(__dirname, './dist'),
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === 'development',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-dev-runtime', 'react/jsx-runtime', 'recharts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
