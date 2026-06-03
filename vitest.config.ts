import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.js'],
    setupFiles: ['src/tests/setup.js'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/data': path.resolve(__dirname, 'src/data'),
    },
  },
})
