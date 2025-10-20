import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Modules
  modules: [
    '@pinia/nuxt',
    ['nuxt-tiptap-editor', { prefix: 'Tiptap' }],
    '@nuxt/ui',
    '@vite-pwa/nuxt'
  ],

  // UI configuration
  ui: {
    global: true,
    safelistColors: ['primary']
  },

  colorMode: {
    preference: 'light'
  },

  // PWA configuration for @vite-pwa/nuxt
  pwa: {
    registerType: 'autoUpdate',
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
      globPatterns: ['**/*.{js,css,png,svg,ico,woff2}'],
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/(?!api\/)/],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }, // 1 year
            cacheableResponse: { statuses: [0, 200] }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'gstatic-fonts-cache',
            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }, // 1 year
            cacheableResponse: { statuses: [0, 200] }
          }
        },
        {
          urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            cacheableResponse: { statuses: [0, 200] }
          }
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

  // tiptap module is registered in `modules` with options above

  // PostCSS Configuration
  postcss: {
    plugins: {
      'tailwindcss/nesting': {},
      tailwindcss: {},
      autoprefixer: {},
    }
  },

  // Runtime config (public)
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'https://admin.modeh.co.ke',
      // Pusher/Echo configuration
      pusherKey: process.env.NUXT_PUBLIC_PUSHER_KEY ?? 'c631b05ce9d7217de73e',
      pusherCluster: process.env.NUXT_PUBLIC_PUSHER_CLUSTER ?? 'ap2',
      wsHost: process.env.NUXT_PUBLIC_WS_HOST ?? 'api-ap2.pusher.com',
      wsPort: process.env.NUXT_PUBLIC_WS_PORT ? parseInt(process.env.NUXT_PUBLIC_WS_PORT, 10) : 443,
      // Use secure WebSocket for Pusher cloud
      wsProtocol: process.env.NUXT_PUBLIC_WS_PROTOCOL ?? 'wss'
    }
  }
})