// vite.config.js
import { defineConfig } from 'vite';
import { copyFileSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  root: '.',
  server: {
    port: 9999,
    open: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    },
    // Copy WASM files to output
    assetsInlineLimit: 0 // Don't inline WASM files
  },
  // plugins: [
  //   {
  //     name: 'copy-wasm',
  //     buildStart() {
  //       // Copy WASM file during build
  //       const wasmSrc = './node_modules/@holonym-foundation/mishtiwasm/pkg/esm/mishtiwasm_bg.wasm'
  //       const wasmDest = 'public/mishtiwasm_bg.wasm'
  //       copyFileSync(wasmSrc, wasmDest)
  //     }
  //   }
  // ]
})

