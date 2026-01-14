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
import { nextTick } from 'vue'

declare global {
  interface Window {
    // Use `any` here to avoid conflicts with other ambient declarations
    // in the codebase that type `window.Echo`/`window.Pusher` as `any`.
    Echo: any;
    Pusher: any;
  }
}

// Helper function to get XSRF token from cookies
function getXsrfToken(): string | null {
  try {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
    if (!match || typeof match[1] !== 'string') return null
    return decodeURIComponent(match[1])
  } catch (e) {
    return null
  }
}

export default defineNuxtPlugin(() => {
  // Only initialize Echo in the browser environment
  if (import.meta.client) {
    // Wait for next tick to ensure config is available
    nextTick(() => {
      const config = useRuntimeConfig()
      const isDev = import.meta.dev
      
      console.log('[Echo] Runtime config in nextTick:', config.public)
      
      initializeEcho(config, isDev)
    })
  } else {
    // On the server provide a null echo to avoid undefined injections
    // Cast to `any` so the provided shape is compatible with the client
    // branch and with other ambient typings in the project.
    return {
      provide: {
        echo: null as any
      }
    }
  }
})

function initializeEcho(config: any, isDev: boolean) {
  console.log('[Echo] Starting initialization')
  
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
          try {
            // Use useApi for consistent CSRF and auth handling (with built-in caching)
            const api = useApi()
            const { status } = useAuth()

            // Always ensure CSRF is available (needed for both authenticated and unauthenticated users)
            try {
              await api.ensureCsrf()
            } catch (e) {
              console.warn('[Echo] Failed to ensure CSRF token:', e)
            }

            // Get auth headers: Bearer token + XSRF token
            const xsrf = api.getXsrfFromCookie()
            const bearerToken = api.getAuthToken()
            
            const authHeaders: Record<string, string> = {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            }

            if (xsrf) {
              authHeaders['X-XSRF-TOKEN'] = xsrf
            }

            // Include Bearer token if available
            if (bearerToken) {
              authHeaders['Authorization'] = `Bearer ${bearerToken}`
            }

            const resp = await fetch(`${config.public.apiBase}/api/broadcasting/auth`, {
              method: 'POST',
              credentials: 'include', // Include session cookies for Sanctum
              headers: authHeaders,
              body: JSON.stringify({
                socket_id: socketId,
                channel_name: channel.name
              })
            })

            if (!resp || !resp.ok) {
              let bodyText = ''
              try { bodyText = await resp?.text() ?? '' } catch (e) { bodyText = '<failed to read response body>' }

              return callback(new Error(`Auth failed: ${resp?.status} ${resp?.statusText} - ${bodyText}`), null)
            }

            const data = await resp.json()
            if (!data || (typeof data.auth !== 'string' && !data.auth)) {

              return callback(new Error('Auth response missing auth info'), null)
            }

            return callback(null, data)
          } catch (error) {

            return callback(error, null)
          }
        })()
      }
    }
  }

  console.log('[Echo] Initializing with hardcoded key and cluster')

  try {
    const pusherKey = config.public?.pusherKey || '5a6916ce972fd4a06074'
    const pusherCluster = config.public?.pusherCluster || 'ap2'
    
    console.log('[Echo] Runtime config pusherKey:', config.public?.pusherKey)
    console.log('[Echo] Using Pusher key:', pusherKey)
    console.log('[Echo] Using Pusher cluster:', pusherCluster)
    
    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
      authorizer: authorizer // Use the custom authorizer we defined above
    })
    console.log('[Echo] Pusher instance created successfully')
    
    const echo = new Echo<any>({
      broadcaster: 'pusher',
      client: pusher
    })
    console.log('[Echo] Echo instance created successfully with Pusher client')
    
    window.Echo = echo

    // Don't connect immediately - wait for authentication
    // Connection will be established when channels are actually subscribed to

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

    // Since this is called asynchronously, we can't return from the plugin
    // The echo instance is available globally via window.Echo
  } catch (error) {
    console.error('[Echo] Failed to create Echo instance:', error)
    // Set a null echo to prevent other code from failing
    window.Echo = null
  }
}
