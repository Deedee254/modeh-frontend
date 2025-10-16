import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Modules
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxt/ui',
    '@vite-pwa/nuxt'
  ],

  // Tailwind
  tailwindcss: { exposeConfig: true },

  // PWA configuration for @vite-pwa/nuxt
  pwa: {
    registerType: 'autoUpdate',
  // ensure index.html is precached so Workbox's navigation fallback can bind to it
  includeAssets: ['index.html', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
    manifest: {
      name: 'Modeh',
      short_name: 'Modeh',
      description: 'Your ultimate learning platform',
      theme_color: '#ffffff',
      lang: 'en',
      icons: [
        { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
      ]
    },
    workbox: {
      // createHandlerBoundToURL requires the fallback URL to be precached.
      // point to the explicit 'index.html' file which we also include in precache.
      navigateFallback: '/index.html',
      runtimeCaching: [
        {
          urlPattern: 'https://fonts.googleapis.com/.*',
          handler: 'CacheFirst',
          method: 'GET',
          options: { cacheableResponse: { statuses: [0, 200] } }
        },
        {
          urlPattern: 'https://fonts.gstatic.com/.*',
          handler: 'CacheFirst',
          method: 'GET',
          options: { cacheableResponse: { statuses: [0, 200] } }
        }
      ]
    }
  },

  // Vite aliases
  vite: {
    resolve: {
      alias: {
        'tiptap-extension-math-katex': new URL('./shims/tiptap-extension-math-katex.js', import.meta.url).pathname,
        '#tailwind-config': new URL('./tailwind-config/', import.meta.url).pathname,
        '#tailwind-config/theme/colors': new URL('./tailwind-config/theme/colors.js', import.meta.url).pathname,
        '#tailwind-config/theme': new URL('./tailwind-config/theme', import.meta.url).pathname
      }
    }
  },

  // Nitro
  nitro: {},

  // Global CSS
  css: ['katex/dist/katex.min.css'],

  // Runtime config (public)
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'https://admin.modeh.co.ke',
      pusherKey: process.env.NUXT_PUBLIC_PUSHER_KEY ?? '',
      pusherCluster: process.env.NUXT_PUBLIC_PUSHER_CLUSTER ?? '',
      pusherForceTLS: process.env.NUXT_PUBLIC_PUSHER_FORCE_TLS === 'true',
      wsHost: process.env.NUXT_PUBLIC_WS_HOST ?? '127.0.0.1',
  wsPort: Number(process.env.NUXT_PUBLIC_WS_PORT ?? 6001),
      wsProtocol: process.env.NUXT_PUBLIC_WS_PROTOCOL ?? 'ws'
    }
  }
})