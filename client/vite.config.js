import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  plugins: [
    react({ fastRefresh: false }),
    {
      name: 'spa-fallback',
      configureServer(server) {
        return () => {
          server.middlewares.use((req, res, next) => {
            if (req.url.startsWith('/api')) return next()
            if (/\.[^.\/]+$/.test(req.url)) return next() // has file extension
            if (req.method !== 'GET') return next()
            
            req.url = '/index.html'
            next()
          })
        }
      }
    }
  ],
  appType: 'spa',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})