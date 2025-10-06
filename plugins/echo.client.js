// Client-only plugin to initialize Laravel Echo with pusher-js
// Requires 'laravel-echo' and 'pusher-js' to be installed in the project.
import { useRuntimeConfig } from '#app'

export default defineNuxtPlugin(async (nuxtApp) => {
  if (!process.client) return

  const config = useRuntimeConfig()
  const pusherKey = config.public.pusherKey
  const pusherCluster = config.public.pusherCluster
  const wsHost = config.public.wsHost
  const wsPort = config.public.wsPort
  const wsProtocol = config.public.wsProtocol || 'ws'
  const forceTLS = config.public.pusherForceTLS

  // Lazy require so SSR builds don't fail when deps are missing
  let Echo = null
  let Pusher = null
  try {
    const EchoLib = await import('laravel-echo')
    Pusher = (await import('pusher-js')).default
    Echo = EchoLib.default || EchoLib
  } catch (err) {
    // Dependencies not installed. Don't crash; leave window.Echo undefined.
    // Developers should run `npm install laravel-echo pusher-js` to enable realtime.
    // eslint-disable-next-line no-console
    console.warn('Echo/pusher not installed; realtime disabled', err)
    return
  }

  try {
    // configure pusher-js to use provided host/port for local websockets
    const pusherOptions = {
      cluster: pusherCluster || undefined,
      forceTLS: !!forceTLS,
      encrypted: !!forceTLS,
      auth: { headers: { 'X-Requested-With': 'XMLHttpRequest' } },
    }

    // If a websocket host/port is provided (Laravel WebSockets), set up wsHost/wsPort
    if (wsHost) {
      pusherOptions.wsHost = wsHost
      pusherOptions.wsPort = wsPort || (wsProtocol === 'wss' ? 443 : 6001)
      pusherOptions.wssPort = wsPort || (wsProtocol === 'wss' ? 443 : 6001)
      pusherOptions.enabledTransports = ['ws', 'wss']
      pusherOptions.forceTLS = wsProtocol === 'wss' || !!forceTLS
    }

    // Dev-safe override: when developing locally, prefer plain ws (no TLS) to avoid wss handshake failures
    // This helps when the Echo server (laravel-echo-server) is running without TLS on localhost:6001.
    if (process.env.NODE_ENV !== 'production' && wsHost) {
      const hostLower = String(wsHost).toLowerCase()
      if (hostLower.includes('127.0.0.1') || hostLower.includes('localhost')) {
        // prefer ws transport only for localhost in dev
        pusherOptions.forceTLS = false
        pusherOptions.enabledTransports = ['ws']
        // ensure ports are numeric/defined
        pusherOptions.wsPort = Number(wsPort) || (wsProtocol === 'wss' ? 443 : 6001)
        pusherOptions.wssPort = undefined
        // eslint-disable-next-line no-console
        console.info('Echo: dev override active — forcing ws transport for localhost')
      }
    }

    // Add CSRF/XSRF token header (Laravel uses XSRF-TOKEN cookie). This helps avoid 419 responses
    // when the auth POST is issued from the browser. Also request cookies be sent with the auth XHR.
    try {
      // prefer explicit meta tag if present
      let csrfToken = null
      if (typeof document !== 'undefined') {
        const meta = document.querySelector('meta[name="csrf-token"]')
        if (meta && meta.content) csrfToken = meta.content
        // fallback: Laravel sets XSRF-TOKEN cookie (URL-encoded)
        if (!csrfToken) {
          const m = document.cookie.match(new RegExp('(^|; )' + 'XSRF-TOKEN'.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1') + '=([^;]*)'))
          if (m) {
            try { csrfToken = decodeURIComponent(m[2]) } catch (e) { csrfToken = m[2] }
          }
        }
      }

      if (csrfToken) {
        pusherOptions.auth.headers['X-XSRF-TOKEN'] = csrfToken
        pusherOptions.auth.headers['X-CSRF-TOKEN'] = csrfToken
      }
      // Ask the authorizer XHR to include credentials (cookies). Pusher/authorizer may respect this.
      pusherOptions.auth.withCredentials = true
    } catch (e) {
      // ignore
    }

    // Debug: log final pusher options in dev to help troubleshoot auth/transport
    // eslint-disable-next-line no-console
    if (process.env.NODE_ENV !== 'production') console.info('Echo: pusherOptions', pusherOptions)

    // Create the Echo instance and attach to window and nuxtApp for global access
    // eslint-disable-next-line no-undef
    const echoInstance = new Echo({
      broadcaster: 'pusher',
      key: pusherKey,
      cluster: pusherCluster,
      wsHost: pusherOptions.wsHost,
      wsPort: pusherOptions.wsPort,
      wssPort: pusherOptions.wssPort,
      forceTLS: pusherOptions.forceTLS,
      enabledTransports: pusherOptions.enabledTransports,
      auth: {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      },
      // Use the pusher-js client
      // eslint-disable-next-line new-cap
      client: new Pusher(pusherKey, pusherOptions),
    })

    // expose to window for backward compatibility and via Nuxt app
    // eslint-disable-next-line no-undef
    window.Echo = echoInstance
    nuxtApp.provide('echo', echoInstance)
    // eslint-disable-next-line no-console
    console.info('Echo initialized')

    // Small debug: store the last event and show a non-blocking badge in the page
    window.__lastEchoEvent = null
    echoInstance.connector.pusher.connection.bind('connected', () => {
      // eslint-disable-next-line no-console
      console.info('Pusher connected (client)')
    })

    // Attach a global listener that logs all events for debugging while developing
    const origSubscribe = echoInstance.private.bind(echoInstance)
    echoInstance.private = (channelName) => {
      const ch = origSubscribe(channelName)
      // monkey-patch listen to log event names
      const origListen = ch.listen.bind(ch)
      ch.listen = (event, cb) => {
        // eslint-disable-next-line no-console
        console.log('[Echo] Subscribed to', channelName, 'listening for', event)
        return origListen(event, (payload) => {
          try {
            window.__lastEchoEvent = { channel: channelName, event, payload }
            // update the on-page badge
            const el = document.getElementById('nuxt-echo-debug-badge')
            if (el) el.textContent = `${event}: ${JSON.stringify(payload).slice(0,120)}`
          } catch (e) { /* ignore */ }
          // eslint-disable-next-line no-console
          console.log('[Echo] Event', event, 'on', channelName, payload)
          return cb(payload)
        })
      }
      return ch
    }

    // Add a small badge element to the DOM
    try {
      const badge = document.createElement('div')
      badge.id = 'nuxt-echo-debug-badge'
      badge.style.position = 'fixed'
      badge.style.right = '12px'
      badge.style.bottom = '12px'
      badge.style.zIndex = '999999'
      badge.style.background = 'rgba(0,0,0,0.6)'
      badge.style.color = '#fff'
      badge.style.padding = '6px 10px'
      badge.style.borderRadius = '6px'
      badge.style.fontSize = '12px'
      badge.style.maxWidth = '360px'
      badge.style.overflow = 'hidden'
      badge.style.textOverflow = 'ellipsis'
      badge.style.whiteSpace = 'nowrap'
      badge.textContent = 'Echo: no events yet'
      document.body.appendChild(badge)
    } catch (e) {
      // DOM may not be ready in some contexts; ignore
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Failed to initialize Echo', err)
  }
})
