import { defineNuxtConfig } from 'nuxt/config'

const env = (import.meta as any).env ?? {}

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
    includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
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
      apiBase: env.NUXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8000',
      pusherKey: env.NUXT_PUSHER_KEY ?? env.VITE_PUSHER_KEY ?? '',
      pusherCluster: env.NUXT_PUSHER_CLUSTER ?? env.VITE_PUSHER_CLUSTER ?? '',
      pusherForceTLS: (env.NUXT_PUSHER_FORCE_TLS ?? env.VITE_PUSHER_FORCE_TLS) === 'true' || false,
      wsHost: env.NUXT_WS_HOST ?? env.VITE_WS_HOST ?? '127.0.0.1',
      wsPort: env.NUXT_WS_PORT ?? env.VITE_WS_PORT ?? 6001,
      wsProtocol: env.NUXT_WS_PROTOCOL ?? env.VITE_WS_PROTOCOL ?? 'ws'
    }
  }
} as any)