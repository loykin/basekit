import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: '@loykin/datetime-range/styles', replacement: resolve(__dirname, '../packages/datetime-range/src/styles/index.css') },
      { find: '@loykin/filter-input/styles', replacement: resolve(__dirname, '../packages/filter-input/src/styles/index.css') },
      { find: '@loykin/side-panel/styles', replacement: resolve(__dirname, '../packages/side-panel/src/styles/index.css') },
      { find: '@loykin/datetime-range', replacement: resolve(__dirname, '../packages/datetime-range/src/index.ts') },
      { find: '@loykin/filter-input', replacement: resolve(__dirname, '../packages/filter-input/src/index.ts') },
      { find: '@loykin/side-panel', replacement: resolve(__dirname, '../packages/side-panel/src/index.ts') },
      { find: '@loykin/unit', replacement: resolve(__dirname, '../packages/unit/src/index.ts') },
      { find: '@', replacement: resolve(__dirname, 'src') },
    ],
  },
})
