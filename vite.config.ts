import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import path from 'path'
import fs from 'fs'

const saveMapPlugin = () => ({
  name: 'save-map-plugin',
  configureServer(server) {
    server.middlewares.use('/api/save-map', async (req, res) => {
      if (req.method === 'POST') {
        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', async () => {
          try {
            const mapData = JSON.parse(body)
            const jsonPath = path.resolve(__dirname, 'example_roadmap.json')
            fs.writeFileSync(jsonPath, JSON.stringify(mapData, null, 2))
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true }))
          } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Failed to save' }))
          }
        })
      }
    })
  }
})

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [] }),
    saveMapPlugin()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@@': path.resolve(__dirname, './@'),
    },
  },
})
