import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Custom domain (205055.xyz) → "/"
  // Without custom domain on GitHub Pages → "/My-Skills-Hub/"
  base: "/",
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ["recharts"],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
    watch: {
      // Exclude dist/ from file watching — prevents hang when dist/ has thousands of subdirs
      ignored: ['**/dist/**', '**/node_modules/**'],
    },
  },
})
