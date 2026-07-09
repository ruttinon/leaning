import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return
          }

          if (id.includes('react-pdf') || id.includes('pdfjs-dist')) {
            return 'pdf'
          }

          if (id.includes('@stripe')) {
            return 'stripe'
          }

          if (id.includes('@tanstack/react-query') || id.includes('zustand')) {
            return 'state'
          }

          if (
            id.includes('/react/') ||
            id.includes('\\react\\') ||
            id.includes('react-dom') ||
            id.includes('react-router')
          ) {
            return 'react-core'
          }

          if (id.includes('lucide-react')) {
            return 'icons'
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/public': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/student': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/teacher': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
