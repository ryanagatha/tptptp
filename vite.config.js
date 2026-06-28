import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/tptptp/',
  server: {
    fs: {
      allow: [
        '.',
        '/Users/macbook/Documents/apps_tesis/tesis_preparation/data_preparation/data',
      ],
    },
  },
})
