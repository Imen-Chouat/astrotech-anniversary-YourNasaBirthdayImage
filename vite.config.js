import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/nasa-proxy': {
        target: 'https://apod.nasa.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nasa-proxy/, ''),
      },
    },
  },
})
