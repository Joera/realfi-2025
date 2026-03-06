// vite.config.js
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { fileURLToPath } from 'url';
import path from 'path';
import { config } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.resolve(__dirname, '../.env') });
config(); 

export default defineConfig({
  root: '.',
  server: {
    port: 7783,
    open: false
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    },
    assetsInlineLimit: 0,
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  plugins: [
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      buffer: 'buffer',
      'react': path.resolve(__dirname, 'src/empty-module.ts'),
      'react-dom': path.resolve(__dirname, 'src/empty-module.ts')
    },
  },
  optimizeDeps: {
    include: [],
    exclude: ["@s3ntiment/shared"],
    esbuildOptions: {
      target: 'esnext',
      define: {
        global: 'globalThis',
      },
    },
  },
});