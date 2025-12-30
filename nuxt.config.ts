import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2025-11-07',
  devtools: { enabled: true },

  // Ensure the browser sees the manifest via an explicit <link rel="manifest"> in the HTML head.
  // Some PWA modules inject this automatically, but adding it here guarantees the link is present.
  app: {
    head: {
      link: [
        // Point explicitly to the .webmanifest file so the browser picks up the PWA manifest
        { rel: 'manifest', href: '/manifest.webmanifest' }
      ]
    }
  },

  // -----------------------------
  // Modules
  // -----------------------------
  modules: [
    '@pinia/nuxt',
    ['nuxt-tiptap-editor', { prefix: 'Tiptap' }],
    '@nuxt/ui',
    '@vite-pwa/nuxt',
    '@sidebase/nuxt-auth'
  ],

  // -----------------------------
  // UI Framework
  // -----------------------------
  ui: {
    global: true,
    safelistColors: ['primary']
  },

  colorMode: {
    preference: 'light'
  },

  // -----------------------------
  // PWA (Vite PWA Optimized for SSR)
  // -----------------------------
  pwa: {
    // Use `prompt` so users aren't unexpectedly hard-refreshed when a new
    // service worker is available. `autoUpdate` will activate and reload
    // clients automatically which can cause the global refresh behaviour.
    registerType: 'prompt',

    includeAssets: [
      'favicon.ico',
      'robots.txt',
      'apple-touch-icon.png'
    ],

    manifest: {
      name: 'Modeh',
      short_name: 'Modeh',
      description: 'Your ultimate learning platform',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      lang: 'en',
      scope: '/',
      start_url: '/',
      display: 'standalone',
      orientation: 'portrait-primary',
      icons: [
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable'
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },

    workbox: {
  // Do not force waiting SW to skip waiting and claim clients. Let the
  // application control when to update (via updateServiceWorker) to
  // avoid unexpected full-page reloads for users.
  skipWaiting: false,
  clientsClaim: false,

      // Nitro renders HTML dynamically → DO NOT fall back to index.html
      navigateFallback: null,
      navigateFallbackAllowlist: [],

      // Cache static assets
      globPatterns: [
        '**/*.{js,css,woff2,png,svg,ico}'
      ],

      runtimeCaching: [
        // Navigation requests — SSR first, fallback to cache
        {
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages',
            networkTimeoutSeconds: 10,
            cacheableResponse: { statuses: [0, 200] }
          }
        },

        // Google fonts
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            cacheableResponse: { statuses: [0, 200] }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'gstatic-fonts-cache',
            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            cacheableResponse: { statuses: [0, 200] }
          }
        }
      ],

      manifestTransforms: [
        (entries: any) => {
          const manifest = entries.map((entry: any) => {
            const isJS = entry.url.endsWith('.js')
            const isCSS = entry.url.endsWith('.css')

            if (isJS || isCSS) entry.revision = null
            return entry
          })

          return { manifest, warnings: [] }
        }
      ]
    }
  },

  // -----------------------------
  // Vite Aliases
  // -----------------------------
  vite: {
    resolve: {
      alias: {
        'tiptap-extension-math-katex': new URL('./shims/tiptap-extension-math-katex.js', import.meta.url).pathname,
        '#tailwind-config': new URL('./tailwind-config/', import.meta.url).pathname,
        '#tailwind-config/theme/colors': new URL('./tailwind-config/theme/colors.js', import.meta.url).pathname,
        '#tailwind-config/theme': new URL('./tailwind-config/theme', import.meta.url).pathname
      }
    },

    ssr: {
      external: ['papaparse']
    }
  },

  // -----------------------------
  // CSS
  // -----------------------------
  css: ['katex/dist/katex.min.css'],

  // -----------------------------
  // PostCSS
  // -----------------------------
  postcss: {
    plugins: {
      'tailwindcss/nesting': {},
      tailwindcss: {},
      autoprefixer: {}
    }
  },

  // -----------------------------
  // Runtime Config
  // -----------------------------
  runtimeConfig: {
    public: {
      // Backend API
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'https://admin.modeh.co.ke',
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL ?? 'https://modeh.co.ke',
      
      // Pusher (for real-time features)
      pusherKey: process.env.NUXT_PUBLIC_PUSHER_KEY ?? '5a6916ce972fd4a06074',
      pusherCluster: process.env.NUXT_PUBLIC_PUSHER_CLUSTER ?? 'ap2',
      
      // WebSocket (for Laravel Echo)
      wsHost: process.env.NUXT_PUBLIC_WS_HOST ?? 'https://admin.modeh.co.ke',
      wsPort: process.env.NUXT_PUBLIC_WS_PORT ? parseInt(process.env.NUXT_PUBLIC_WS_PORT) : 443,
      wsProtocol: process.env.NUXT_PUBLIC_WS_PROTOCOL ?? 'wss'
    }
  },

  // Auth Configuration (sidebase/nuxt-auth with AuthJS provider)
  // -------................................. 
  // Defaults are production values
  // For development, set AUTH_ORIGIN and AUTH_BASE_URL via .env file
  // -------................................. 
  auth: {
    secret: process.env.NUXT_AUTH_SECRET ?? '+ETBM7kmRHoTlgfIjHRazzGqa+y+3n3gIFt3pEHAE8g=',
    baseURL: process.env.AUTH_BASE_URL ?? 'https://admin.modeh.co.ke/api/auth',
    originEnvKey: 'AUTH_ORIGIN',
    provider: {
      type: 'authjs',
      trustHost: process.env.NODE_ENV === 'production' ? true : false,
      defaultProvider: 'google',
      addDefaultCallbackUrl: true
    }
  }
})
