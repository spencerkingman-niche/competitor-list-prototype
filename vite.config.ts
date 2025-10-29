import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/competitor-list-prototype/',
  server: {
    port: 3000,
    open: true
  }
})