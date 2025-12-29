import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/markup/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'codemirror': ['@uiw/react-codemirror', '@codemirror/lang-json', '@codemirror/lang-xml', '@codemirror/lang-html', '@codemirror/lang-css', '@codemirror/lang-javascript', '@codemirror/theme-one-dark'],
          'react-vendor': ['react', 'react-dom'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
})
