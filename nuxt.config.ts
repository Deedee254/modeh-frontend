// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // Using @nuxtjs/tailwindcss module for auto-configuration
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxt/ui',
  ],
  tailwindcss: {
    exposeConfig: true
  },
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
  nitro: {
    // No dev proxy: during development the frontend will call the backend directly.
    // Keep nitro config object available for future customizations.
  },
  css: [
    'katex/dist/katex.min.css'
  ],
  runtimeConfig: {
    public: {
      // Base URL for API requests. Prefer the environment variable (NUXT_API_BASE_URL)
      // provided by Vite/Nuxt via import.meta.env. Fall back to 127.0.0.1 for local dev.
      apiBase: import.meta.env?.NUXT_API_BASE_URL ?? 'http://127.0.0.1:8000',
      // Pusher / Echo runtime keys (used by plugins/echo.client.js)
      pusherKey: import.meta.env?.NUXT_PUSHER_KEY ?? import.meta.env?.VITE_PUSHER_KEY ?? '',
      pusherCluster: import.meta.env?.NUXT_PUSHER_CLUSTER ?? import.meta.env?.VITE_PUSHER_CLUSTER ?? '',
      pusherForceTLS: (import.meta.env?.NUXT_PUSHER_FORCE_TLS ?? import.meta.env?.VITE_PUSHER_FORCE_TLS) === 'true' || false,
      wsHost: import.meta.env?.NUXT_WS_HOST ?? import.meta.env?.VITE_WS_HOST ?? '127.0.0.1',
      wsPort: import.meta.env?.NUXT_WS_PORT ?? import.meta.env?.VITE_WS_PORT ?? 6001,
      wsProtocol: import.meta.env?.NUXT_WS_PROTOCOL ?? import.meta.env?.VITE_WS_PROTOCOL ?? 'ws'
    }
  }
})