const path = require('path')

module.exports = {
  test: {
    globals: true,
    environment: 'jsdom'
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname),
      '~/': path.resolve(__dirname) + '/',
      '@': path.resolve(__dirname),
      '@/': path.resolve(__dirname) + '/'
    }
  }
}
