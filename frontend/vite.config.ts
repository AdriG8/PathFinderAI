import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [] })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@@': path.resolve(__dirname, './@'),
    },
  },
  optimizeDeps: {
    include: ['html2canvas'],
  },
})
