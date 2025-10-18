import { defineConfig } from 'vite'

export default defineConfig({
  base: '/resource-tracker/',
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist'
  }
})