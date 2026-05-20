import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    // headers: {
    //   'X-Frame-Options': 'DENY',
    //   'X-Content-Type-Options': 'nosniff',
    //   'Content-Security-Policy':
    //     "default-src 'self'; " +
    //     "script-src 'self' 'unsafe-inline'; " +
    //     "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; " +
    //     "font-src 'self' https://fonts.gstatic.com; " +
    //     "img-src 'self' data:; " +
    //     "connect-src 'self' ws://localhost:5173; " +
    //     "frame-ancestors 'none'",
    // },
    proxy: {
      '/api': {
        target: 'http://localhost:8085',
        changeOrigin: true,
      },
    },
  },
})
