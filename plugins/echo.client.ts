import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

declare global {
  interface Window {
    Echo: Echo<any>;
    Pusher: typeof Pusher;
  }
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const isDev = process.env.NODE_ENV !== 'production'

  // Only initialize Echo in the browser environment
  if (import.meta.client) {
    // Enable Pusher logging in development
    if (isDev) {
      Pusher.logToConsole = true
    }

    window.Pusher = Pusher

    const echo = new Echo<any>({
      broadcaster: 'pusher',
      key: config.public.pusherKey,
      cluster: config.public.pusherCluster,
      wsHost: config.public.wsHost,
      wsPort: config.public.wsPort,
      forceTLS: true,
      encrypted: true,
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
      auth: {
        headers: {
          'X-CSRF-TOKEN': typeof document !== 'undefined' ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' : '',
        }
      }
    })

    window.Echo = echo

    // Wait for next tick to ensure Echo is properly initialized
    nextTick(() => {
      const pusher = (echo.connector as any)?.pusher
      
      if (pusher?.connection) {
        pusher.connection.bind('connected', () => {
          console.log('Echo connection established successfully')
        })

        pusher.connection.bind('error', (err: any) => {
          console.error('Echo connection error:', err)
          if (isDev) {
            console.log('Echo connection options:', echo.options)
          }
        })

        pusher.connection.bind('disconnected', () => {
          console.log('Echo disconnected, attempting to reconnect...')
        })
      } else if (isDev) {
        console.warn('Pusher connection not available')
      }
    })

    return {
      provide: {
        echo
      }
    }
  }

  // On the server provide a null echo to avoid undefined injections
  return {
    provide: {
      echo: null
    }
  }
})