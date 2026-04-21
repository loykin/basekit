import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@loykin/datetime-range': resolve(__dirname, '../packages/datetime-range/src/index.ts'),
      '@loykin/unit': resolve(__dirname, '../packages/unit/src/index.ts'),
      '@': resolve(__dirname, '../packages/datetime-range/src'),
    },
  },
})
