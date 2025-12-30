/**
 * Echo/Pusher WebSocket Plugin
 * 
 * Note: In development, you may see "socket hang up" or "Premature close" errors
 * in the Vite dev server console. These are harmless and occur when websocket
 * connections are interrupted during Hot Module Reload (HMR). They do not affect
 * functionality and will not appear in production builds.
 */
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import useApi from '~/composables/useApi'

declare global {
  interface Window {
    // Use `any` here to avoid conflicts with other ambient declarations
    // in the codebase that type `window.Echo`/`window.Pusher` as `any`.
    Echo: any;
    Pusher: any;
  }
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const isDev = process.env.NODE_ENV !== 'production'

  // Only initialize Echo in the browser environment
  if (import.meta.client) {
    // Clean up existing Echo instance if it exists (prevents multiple instances on HMR)
    if (window.Echo) {
      try {
        const existingEcho = window.Echo as any
        const pusher = existingEcho?.connector?.pusher

        // Disconnect all channels first
        try {
          if (existingEcho && typeof existingEcho.disconnect === 'function') {
            existingEcho.disconnect()
          }
        } catch (e) {
          // Ignore disconnect errors
        }

        // Disconnect Pusher connection if it exists
        try {
          if (pusher?.connection && typeof pusher.connection.disconnect === 'function') {
            pusher.connection.disconnect()
          }
        } catch (e) {
          // Ignore disconnect errors
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    // Enable Pusher logging in development
    if (isDev) {
      Pusher.logToConsole = true
    }

    window.Pusher = Pusher

    // Custom authorizer using the shared `useApi` composable for consistent CSRF and headers
    const authorizer = (channel: any, options: any) => {
      return {
        authorize: (socketId: string, callback: Function) => {
          // Run the async auth flow in a fire-and-forget IIFE and use the callback
          ;(async () => {
            const api = useApi()
            const url = `${config.public.apiBase}/api/broadcasting/auth`
            try {
              // Ensure CSRF cookie is available (composable handles polling and timeouts)
              await api.ensureCsrf()

              // Use the composable to POST with credentials and standard headers
              const resp = await api.postJson('/api/broadcasting/auth', {
                socket_id: socketId,
                channel_name: channel.name
              })

              if (!resp || !resp.ok) {
                let bodyText = ''
                try { bodyText = await resp?.text() ?? '' } catch (e) { bodyText = '<failed to read response body>' }
                console.error('Pusher auth request failed', { url, status: resp?.status, statusText: resp?.statusText, body: bodyText, socketId, channel: channel.name })
                return callback(new Error(`Auth failed: ${resp?.status} ${resp?.statusText} - ${bodyText}`), null)
              }

              const data = await resp.json()
              if (!data || (typeof data.auth !== 'string' && !data.auth)) {
                console.error('Pusher auth response missing `auth` field', { data, url, socketId, channel: channel.name })
                return callback(new Error('Auth response missing auth info'), null)
              }

              return callback(null, data)
            } catch (error) {
              console.error('Pusher authorize error (useApi):', error)
              return callback(error, null)
            }
          })()
        }
      }
    }

    const echo = new Echo<any>({
      broadcaster: 'pusher',
      key: config.public.pusherKey,
      cluster: config.public.pusherCluster,
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
      authorizer: authorizer
    })

    window.Echo = echo

    // Wait for next tick to ensure Echo is properly initialized
    nextTick(() => {
      const pusher = (echo.connector as any)?.pusher

      if (pusher?.connection) {
        pusher.connection.bind('connected', () => {
          if (isDev) {
            console.log('Echo connection established successfully')
          }
        })

        pusher.connection.bind('error', (err: any) => {
          // Suppress harmless errors in development (common during HMR)
          const errorMessage = err?.message || err?.error?.message || String(err)
          const errorString = errorMessage.toLowerCase()

          // List of harmless errors that occur during HMR/development
          const harmlessErrors = [
            'premature close',
            'websocket',
            'socket hang up',
            'econnreset',
            'econnrefused',
            'etimedout',
            'network error',
            'connection closed'
          ]

          if (isDev && harmlessErrors.some(harmless => errorString.includes(harmless))) {
            // These are harmless during HMR, silently ignore
            return
          }
          console.error('Echo connection error:', err)
          if (isDev) {
            console.log('Echo connection options:', echo.options)
          }
        })

        pusher.connection.bind('disconnected', () => {
          if (isDev) {
            console.log('Echo disconnected, attempting to reconnect...')
          }
        })

        // Handle connection state changes
        pusher.connection.bind('state_change', (states: any) => {
          if (isDev && states.previous !== 'connected' && states.current === 'connected') {
            console.log('Echo reconnected successfully')
          }
        })
      } else if (isDev) {
        console.warn('Pusher connection not available')
      }
    })

    // Cleanup function for HMR/unmount
    const cleanup = () => {
      try {
        const pusher = (echo.connector as any)?.pusher
        if (pusher?.connection && typeof pusher.connection.disconnect === 'function') {
          pusher.connection.disconnect()
        }
        if (typeof echo.disconnect === 'function') {
          echo.disconnect()
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    // Register cleanup on HMR
    if (import.meta.hot) {
      import.meta.hot.dispose(cleanup)
    }

    return {
      provide: {
        echo
      },
      // Cleanup on plugin unmount
      close: cleanup
    }
  }

  // On the server provide a null echo to avoid undefined injections
  // Cast to `any` so the provided shape is compatible with the client
  // branch and with other ambient typings in the project.
  return {
    provide: {
      echo: null as any
    }
  }
})
