import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2025-11-07',
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
    // ensure index.html is included in the precache so navigation fallback works
    includeAssets: ['index.html'],
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
      // Ensure the root URL and index.html are explicitly added to the precache.
      // Some Nuxt/Vite build outputs don't include `/` or `index.html` in the
      // generated precache by default which makes
      // `createHandlerBoundToURL('/')` throw `non-precached-url` at runtime.
      // Adding these here guarantees the navigation handler has a cached URL.
      additionalManifestEntries: [
        { url: '/', revision: null },
        { url: '/index.html', revision: null }
      ],
      // include html files (index.html) in precache so '/' is a precached URL
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
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
        },
        {
          // This is the new rule to handle navigation requests.
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages',
            networkTimeoutSeconds: 10, // Optional: fallback to cache after 10s
            cacheableResponse: { statuses: [200] }
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