import { defineConfig } from 'vitest/config'
import path from 'path'

// Map Nuxt style aliases (~, @) to project root so vitest resolves imports like '~/utils/*'
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom'
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname),
      '@': path.resolve(__dirname)
    }
  }
})
