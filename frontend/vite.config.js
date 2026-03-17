import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
            return 'vendor-react'
          }

          if (id.includes('react-router')) {
            return 'vendor-router'
          }

          if (id.includes('@reduxjs') || id.includes('react-redux')) {
            return 'vendor-redux'
          }

          if (id.includes('recharts') || id.includes('d3-')) {
            return 'vendor-charts'
          }

          if (id.includes('face-api.js')) {
            return 'vendor-faceapi'
          }

          if (id.includes('@tensorflow')) {
            return 'vendor-tensorflow'
          }

          if (id.includes('jspdf')) {
            return 'vendor-jspdf'
          }

          if (id.includes('html2canvas')) {
            return 'vendor-html2canvas'
          }

          if (id.includes('canvg')) {
            return 'vendor-canvg'
          }

          if (id.includes('lucide-react') || id.includes('react-icons')) {
            return 'vendor-icons'
          }

          const path = id.split('node_modules/')[1]
          if (!path) return 'vendor-misc'

          const parts = path.split('/')
          let packageName = parts[0]
          if (packageName && packageName.startsWith('@') && parts.length > 1) {
            packageName = `${packageName}/${parts[1]}`
          }

          const safeName = packageName
            .replace('@', '')
            .replace('/', '-')
            .replace(/[^a-zA-Z0-9-]/g, '')

          return `vendor-${safeName || 'misc'}`
        },
      },
    },
  },
})
