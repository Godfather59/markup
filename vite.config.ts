import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/markup/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // CodeMirror and its language packages
          if (id.includes('@codemirror') || id.includes('@uiw/react-codemirror')) {
            return 'codemirror';
          }
          // React and React DOM
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          // Formatters utilities (lazy loaded)
          if (id.includes('/utils/formatters')) {
            return 'formatters';
          }
          // js-yaml library
          if (id.includes('js-yaml')) {
            return 'yaml-lib';
          }
          // Other node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
})
