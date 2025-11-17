import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['date-fns'],
    esbuildOptions: {
      resolveExtensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs'],
    },
  },
  resolve: {
    dedupe: ['date-fns'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})
