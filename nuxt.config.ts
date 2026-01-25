import { defineNuxtConfig } from 'nuxt/config'

const stripTrailingSlash = (value?: string) => value?.replace(/\/$/, '') ?? ''
const defaultPublicOrigin = process.env.NUXT_PUBLIC_BASE_URL ?? (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://modeh.co.ke')
const publicBaseUrl = stripTrailingSlash(defaultPublicOrigin)
const envAuthBaseUrl = process.env.NUXT_AUTH_BASE_URL ? stripTrailingSlash(process.env.NUXT_AUTH_BASE_URL) : undefined
const authBaseUrl = envAuthBaseUrl ?? `${publicBaseUrl}/api/auth`
const defaultApiBase = stripTrailingSlash(process.env.NUXT_PUBLIC_API_BASE ?? (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://admin.modeh.co.ke'))
// Default Google Analytics ID fallback (used when env var not provided)
const defaultGoogleAnalyticsId = process.env.NUXT_PUBLIC_GOOGLE_ANALYTICS_ID || 'G-0ZY24VS3D2'
// Default Google Tag Manager ID fallback
const defaultGtmId = process.env.NUXT_PUBLIC_GTM_ID || 'GTM-P6CXDVPF'

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
      ,
      script: [
        // Google Tag Manager (head snippet) — loads GTM container
        {
          children: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'? '&l='+l: ''; j.async=true; j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl; f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${defaultGtmId}');`,
          type: 'text/javascript'
        } as any
      ],
      // Insert GTM noscript immediately after opening <body>
      noscript: [
        {
          children: `<iframe src="https://www.googletagmanager.com/ns.html?id=${defaultGtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
        } as any
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

  // Nuxt-level aliases (ensure server-side imports resolve the same as Vite)
  alias: {
    'next-auth/core': new URL('./node_modules/next-auth/core/index.js', import.meta.url).pathname,
    'next-auth/jwt': new URL('./node_modules/next-auth/jwt/index.js', import.meta.url).pathname
  },

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
          urlPattern: ({ request }: any) => request.mode === 'navigate',
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
            // Filter out Nuxt internal runtime files (often under node_modules/nuxt/dist)
            // to avoid precaching dynamic dev modules that cause failed dynamic imports.
            const filtered = entries.filter((entry: any) => {
              if (!entry || !entry.url) return false
              // Skip precaching any build files that live under node_modules/nuxt/dist
              if (entry.url.includes('node_modules/nuxt/dist')) return false
              return true
            })

            const manifest = filtered.map((entry: any) => {
              const isJS = entry.url.endsWith('.js')
              const isCSS = entry.url.endsWith('.css')

              if (isJS || isCSS) entry.revision = null
              return entry
            })

            const warnings: string[] = []
            const removed = entries.length - filtered.length
            if (removed > 0) warnings.push(`Excluded ${removed} entries from precache (node_modules/nuxt/dist)`)

            return { manifest, warnings }
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
        '#tailwind-config': new URL('./tailwind-config/', import.meta.url).pathname,
        '#tailwind-config/theme/colors': new URL('./tailwind-config/theme/colors.js', import.meta.url).pathname,
        '#tailwind-config/theme': new URL('./tailwind-config/theme', import.meta.url).pathname,
        'next-auth/core': new URL('./node_modules/next-auth/core/index.js', import.meta.url).pathname,
        'next-auth/jwt': new URL('./node_modules/next-auth/jwt/index.js', import.meta.url).pathname
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

  // Runtime Config
  // -----------------------------
  runtimeConfig: {
    pusherSecret: process.env.NUXT_PUBLIC_PUSHER_SECRET || '',
    // Temporary: expose google OAuth client secrets to runtime config so the
    // server auth handler can read them during testing. These values are read
    // from environment at build time — do NOT commit secrets to source.
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    public: {
      // Backend API
      apiBase: defaultApiBase,
      baseUrl: publicBaseUrl,
      siteUrl: publicBaseUrl,
      
      // Google Analytics (GA4) - use env var or safe fallback
      googleAnalyticsId: process.env.NUXT_PUBLIC_GOOGLE_ANALYTICS_ID || defaultGoogleAnalyticsId,
      googleTagManagerId: process.env.NUXT_PUBLIC_GTM_ID || defaultGtmId,
      
      // Pusher (for real-time features)
      pusherKey: process.env.NUXT_PUBLIC_PUSHER_KEY || '5a6916ce972fd4a06074',
      pusherAppKey: process.env.NUXT_PUBLIC_PUSHER_KEY || '5a6916ce972fd4a06074',
      pusherCluster: process.env.NUXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
      pusherAppCluster: process.env.NUXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
      
      // WebSocket (for Laravel Echo)
      wsHost: process.env.NUXT_PUBLIC_WS_HOST ?? 'https://admin.modeh.co.ke',
      wsPort: process.env.NUXT_PUBLIC_WS_PORT ? parseInt(process.env.NUXT_PUBLIC_WS_PORT) : 443,
      wsProtocol: process.env.NUXT_PUBLIC_WS_PROTOCOL ?? 'wss'
    }
  },

  // Auth Configuration (sidebase/nuxt-auth with AuthJS provider)
  // -------................................. 
  // CRITICAL: For production OAuth to work:
  // 1. Set NUXT_AUTH_BASE_URL=https://yourdomain.com/api/auth in production .env
  // 2. Ensure this matches the redirect URI in Google Cloud Console
  // 3. Set NUXT_AUTH_SECRET to a secure random string
  // -------................................. 
  auth: {
    baseURL: authBaseUrl,
    originEnvKey: 'NUXT_AUTH_BASE_URL',
    secret: process.env.NUXT_AUTH_SECRET ?? 'DyQkwB8DMfLQ3KbDW9dNgdZFNYb9RVxPLCWfwWXqQPM=',
    provider: {
      type: 'authjs',
      trustHost: true,
      // CRITICAL: In production, explicitly set the origin to avoid mismatches
      // This ensures Google receives the correct redirect URI
      ...(process.env.NUXT_PUBLIC_BASE_URL && {
        origin: process.env.NUXT_PUBLIC_BASE_URL
      }),
      defaultProvider: 'google',
      addDefaultCallbackUrl: true
    }
  }
})
