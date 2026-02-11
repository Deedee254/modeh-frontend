import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'node:url'

const stripTrailingSlash = (value?: string) => value?.replace(/\/$/, '') ?? ''
// Public base URL must be provided via NUXT_PUBLIC_BASE_URL
const defaultPublicOrigin = process.env.NUXT_PUBLIC_BASE_URL
const publicBaseUrl = defaultPublicOrigin ? stripTrailingSlash(defaultPublicOrigin) : undefined
const envAuthBaseUrl = process.env.NUXT_AUTH_BASE_URL ? stripTrailingSlash(process.env.NUXT_AUTH_BASE_URL) : undefined
const authBaseUrl = envAuthBaseUrl ?? undefined
// API base from NUXT_PUBLIC_API_BASE
const defaultApiBase = process.env.NUXT_PUBLIC_API_BASE ? stripTrailingSlash(process.env.NUXT_PUBLIC_API_BASE) : undefined
// Analytics IDs from env
const googleAnalyticsId = process.env.NUXT_PUBLIC_GOOGLE_ANALYTICS_ID
const gtmId = process.env.NUXT_PUBLIC_GTM_ID

export default defineNuxtConfig({
  compatibilityDate: '2025-11-07',
  devtools: { enabled: true },

  // Route-level code splitting (lazy load pages)
  routeRules: {
    // This enables auto code-splitting for all routes
  },

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
        ...(gtmId ? [{
          children: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'? '&l='+l: ''; j.async=true; j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl; f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`,
          type: 'text/javascript'
        } as any] : [])
      ],
      // Insert GTM noscript immediately after opening <body>
      noscript: [
        ...(gtmId ? [{
          children: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
        } as any] : [])
      ]
    }
  },

  // Modules
  modules: [
    '@pinia/nuxt',
    ['nuxt-tiptap-editor', { prefix: 'Tiptap' }],
    '@nuxt/ui',
    '@vite-pwa/nuxt',
    '@sidebase/nuxt-auth'
  ],

  alias: {
    'next-auth/core': fileURLToPath(new URL('./node_modules/next-auth/core/index.js', import.meta.url)),
    'next-auth/jwt': fileURLToPath(new URL('./node_modules/next-auth/jwt', import.meta.url)),
    '@panva/hkdf': fileURLToPath(new URL('./shims/hkdf.ts', import.meta.url)),
    // Use ESM Babel helpers to avoid namespace/default interop issues in Nitro bundles
    '@babel/runtime/helpers/interopRequireDefault': fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/interopRequireDefault.js', import.meta.url)),
    '@babel/runtime/helpers/defineProperty': fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/defineProperty.js', import.meta.url)),
    '@babel/runtime/helpers/asyncToGenerator': fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js', import.meta.url)),
    '@babel/runtime/helpers/classCallCheck': fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/classCallCheck.js', import.meta.url)),
    '@babel/runtime/helpers/createClass': fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/createClass.js', import.meta.url)),
    '@babel/runtime/helpers/possibleConstructorReturn': fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js', import.meta.url)),
    '@babel/runtime/helpers/getPrototypeOf': fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js', import.meta.url)),
    '@babel/runtime/helpers/inherits': fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/inherits.js', import.meta.url)),
    '@babel/runtime/helpers/wrapNativeSuper': fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/wrapNativeSuper.js', import.meta.url)),
    '@babel/runtime/helpers/extends': fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/extends.js', import.meta.url)),
    '@babel/runtime/regenerator': fileURLToPath(new URL('./node_modules/@babel/runtime/regenerator/index.js', import.meta.url))
  },

  ui: {
    global: true,
    safelistColors: ['primary']
  },

  colorMode: {
    preference: 'light'
  },

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

  // Vite config
  vite: {
    resolve: {
      alias: {
        '#tailwind-config': fileURLToPath(new URL('./tailwind-config/', import.meta.url)),
        '#tailwind-config/theme/colors': fileURLToPath(new URL('./tailwind-config/theme/colors.js', import.meta.url)),
        '#tailwind-config/theme': fileURLToPath(new URL('./tailwind-config/theme', import.meta.url)),
        'next-auth/core': fileURLToPath(new URL('./node_modules/next-auth/core/index.js', import.meta.url)),
        'next-auth/jwt': fileURLToPath(new URL('./node_modules/next-auth/jwt/index.js', import.meta.url)),
        '@panva/hkdf': fileURLToPath(new URL('./shims/hkdf.ts', import.meta.url)),
        // Ensure Vite SSR build uses ESM Babel helpers as well
        '@babel/runtime/helpers/interopRequireDefault': fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/interopRequireDefault.js', import.meta.url)),
        '@babel/runtime/helpers/defineProperty': fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/defineProperty.js', import.meta.url)),
        '@babel/runtime/helpers/asyncToGenerator': fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js', import.meta.url)),
        '@babel/runtime/helpers/classCallCheck': fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/classCallCheck.js', import.meta.url)),
        '@babel/runtime/helpers/createClass': fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/createClass.js', import.meta.url)),
        '@babel/runtime/helpers/possibleConstructorReturn': fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js', import.meta.url)),
        '@babel/runtime/helpers/getPrototypeOf': fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js', import.meta.url)),
        '@babel/runtime/helpers/inherits': fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/inherits.js', import.meta.url)),
        '@babel/runtime/helpers/wrapNativeSuper': fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/wrapNativeSuper.js', import.meta.url)),
        '@babel/runtime/helpers/extends': fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/extends.js', import.meta.url)),
        '@babel/runtime/regenerator': fileURLToPath(new URL('./node_modules/@babel/runtime/regenerator/index.js', import.meta.url))
      }
    },

    ssr: {
      external: ['papaparse', 'next-auth', 'next-auth/jwt', 'next-auth/core', '@sidebase/nuxt-auth']
    },

    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Split large dependencies into separate chunks
            if (id.includes('node_modules/@nuxt/ui')) {
              return 'ui-library'
            }
            if (id.includes('node_modules/@sidebase/nuxt-auth') || id.includes('node_modules/next-auth')) {
              return 'auth'
            }
            if (id.includes('node_modules/@tiptap')) {
              return 'editor'
            }
            if (id.includes('node_modules/@vite-pwa')) {
              return 'pwa'
            }
            if (id.includes('node_modules/pinia')) {
              return 'pinia'
            }
            if (id.includes('node_modules/katex')) {
              return 'katex'
            }
          }
        }
      }
    }
  },

  css: ['katex/dist/katex.min.css'],

  runtimeConfig: {
    auth: {
      secret: process.env.NUXT_AUTH_SECRET ?? undefined
    },
    pusherSecret: process.env.NUXT_PUBLIC_PUSHER_SECRET ?? undefined,
    // Google OAuth credentials (from env)
    googleClientId: process.env.GOOGLE_CLIENT_ID ?? undefined,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? undefined,
    public: {
      // Public runtime values (from env)
      apiBase: defaultApiBase ?? undefined,
      baseUrl: publicBaseUrl ?? undefined,
      siteUrl: publicBaseUrl ?? undefined,

      googleAnalyticsId: googleAnalyticsId ?? undefined,
      googleTagManagerId: gtmId ?? undefined,

      pusherKey: process.env.NUXT_PUBLIC_PUSHER_KEY ?? undefined,
      pusherAppKey: process.env.NUXT_PUBLIC_PUSHER_KEY ?? undefined,
      pusherCluster: process.env.NUXT_PUBLIC_PUSHER_CLUSTER ?? undefined,
      pusherAppCluster: process.env.NUXT_PUBLIC_PUSHER_CLUSTER ?? undefined,

      wsHost: process.env.NUXT_PUBLIC_WS_HOST ?? undefined,
      wsPort: process.env.NUXT_PUBLIC_WS_PORT ? parseInt(process.env.NUXT_PUBLIC_WS_PORT) : undefined,
      wsProtocol: process.env.NUXT_PUBLIC_WS_PROTOCOL ?? undefined
    }
  },

  nitro: {
    externals: {
      external: [],
      inline: ['next-auth', 'next-auth/jwt', 'next-auth/core', '@panva/hkdf']
    },
    rollupConfig: {
      output: {
        inlineDynamicImports: false
      }
    }
  },

  hooks: {
    'nitro:config'(nitroConfig: any) {
      nitroConfig.alias = nitroConfig.alias || {}
      nitroConfig.alias['next-auth/core'] = fileURLToPath(new URL('./node_modules/next-auth/core/index.js', import.meta.url))
      nitroConfig.alias['next-auth/jwt'] = fileURLToPath(new URL('./node_modules/next-auth/jwt/index.js', import.meta.url))
      nitroConfig.alias['@panva/hkdf'] = fileURLToPath(new URL('./shims/hkdf.ts', import.meta.url))
      // Force ESM Babel helpers inside Nitro bundle to avoid namespace default issues
      nitroConfig.alias['@babel/runtime/helpers/interopRequireDefault'] = fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/interopRequireDefault.js', import.meta.url))
      nitroConfig.alias['@babel/runtime/helpers/defineProperty'] = fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/defineProperty.js', import.meta.url))
      nitroConfig.alias['@babel/runtime/helpers/asyncToGenerator'] = fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js', import.meta.url))
      nitroConfig.alias['@babel/runtime/helpers/classCallCheck'] = fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/classCallCheck.js', import.meta.url))
      nitroConfig.alias['@babel/runtime/helpers/createClass'] = fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/createClass.js', import.meta.url))
      nitroConfig.alias['@babel/runtime/helpers/possibleConstructorReturn'] = fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js', import.meta.url))
      nitroConfig.alias['@babel/runtime/helpers/getPrototypeOf'] = fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js', import.meta.url))
      nitroConfig.alias['@babel/runtime/helpers/inherits'] = fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/inherits.js', import.meta.url))
      nitroConfig.alias['@babel/runtime/helpers/wrapNativeSuper'] = fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/wrapNativeSuper.js', import.meta.url))
      nitroConfig.alias['@babel/runtime/helpers/extends'] = fileURLToPath(new URL('./node_modules/@babel/runtime/helpers/esm/extends.js', import.meta.url))
      nitroConfig.alias['@babel/runtime/regenerator'] = fileURLToPath(new URL('./node_modules/@babel/runtime/regenerator/index.js', import.meta.url))
    }
  },

  auth: {
    baseURL: authBaseUrl || 'https://modeh.co.ke/api/auth',
    originEnvKey: 'NUXT_AUTH_BASE_URL',
    provider: {
      type: 'authjs',
      trustHost: true,
      defaultProvider: 'google',
      addDefaultCallbackUrl: true
    }
  }
})
