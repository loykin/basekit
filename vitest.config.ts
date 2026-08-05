import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [react()],
        test: {
          name: 'datetime-range',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./vitest.setup.ts'],
          include: [
            'packages/datetime-range/**/*.test.ts',
            'packages/datetime-range/**/*.test.tsx',
          ],
        },
      },
      {
        plugins: [react()],
        test: {
          name: 'packages',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./vitest.setup.ts'],
          include: [
            'packages/filter-input/**/*.test.ts',
            'packages/filter-input/**/*.test.tsx',
            'packages/side-panel/**/*.test.ts',
            'packages/side-panel/**/*.test.tsx',
            'packages/unit/**/*.test.ts',
            'packages/unit/**/*.test.tsx',
          ],
        },
      },
      {
        plugins: [react()],
        resolve: {
          alias: { '@': resolve(__dirname, 'packages/cron-input/src') },
        },
        test: {
          name: 'cron-input',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./vitest.setup.ts'],
          include: [
            'packages/cron-input/**/*.test.ts',
            'packages/cron-input/**/*.test.tsx',
          ],
        },
      },
      {
        plugins: [react()],
        test: {
          name: 'control-bar',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./vitest.setup.ts'],
          include: [
            'packages/control-bar/**/*.test.ts',
            'packages/control-bar/**/*.test.tsx',
          ],
        },
      },
    ],
  },
})
