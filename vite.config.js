import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/ol-study-planner-ai/',
  plugins: [react()],
})
