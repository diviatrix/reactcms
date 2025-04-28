import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  define: {
    __API_BASE_URL__: JSON.stringify('http://1337.plus:3001/api'),
  },
  plugins: [react()],
  server: {
    allowedHosts: ['1337.plus']
  }  
})