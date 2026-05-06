import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
  ],

  server: {
    proxy: {
      "/api": { target: "http://localhost:8000", changeOrigin: true },
      "/ws":  { target: "ws://localhost:8000",  ws: true, changeOrigin: true },
    },
  },

  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core':  ['react', 'react-dom', 'react-router-dom'],
          'ui-icons':    ['react-icons'],
          'charts':      ['recharts'],
          'editor':      ['@monaco-editor/react'],
          'motion':      ['framer-motion'],
        },
      },
    },
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
