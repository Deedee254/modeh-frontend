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

    // Custom authorizer function that uses our API composable to handle CORS properly
    const authorizer = (channel: any, options: any) => {
      return {
        authorize: (socketId: string, callback: Function) => {
          // Use $fetch or fetch with credentials to handle CORS properly
          const url = `${config.public.apiBase}/api/broadcasting/auth`

          // Get CSRF token from cookie (same as useApi)
          const getXsrfFromCookie = () => {
            try {
              if (typeof document === 'undefined') return null
              const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
              if (!match || typeof match[1] !== 'string') return null
              return decodeURIComponent(match[1])
            } catch (e) {
              return null
            }
          }

          const csrfToken = getXsrfFromCookie() || ''

          // Use fetch with credentials to include cookies and handle CORS
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-XSRF-TOKEN': csrfToken,
              'X-Requested-With': 'XMLHttpRequest',
              'Accept': 'application/json'
            },
            credentials: 'include', // Important: include cookies for authentication
            body: JSON.stringify({
              socket_id: socketId,
              channel_name: channel.name
            })
          })
            .then(response => {
              if (!response.ok) {
                throw new Error(`Auth failed: ${response.status}`)
              }
              return response.json()
            })
            .then(data => {
              callback(null, data)
            })
            .catch(error => {
              callback(error, null)
            })
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
