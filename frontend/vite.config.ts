import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    sourcemap: false,
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
  esbuild: {
    sourcemap: false,
  },
  css: {
    devSourcemap: false,
  },
})
