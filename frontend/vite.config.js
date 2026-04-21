import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backend = 'http://localhost:8000'
const proxyPaths = ['/api']
const proxy = Object.fromEntries(
  proxyPaths.map(p => [p, { target: backend, changeOrigin: true }])
)

export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    proxy,
  },
})
