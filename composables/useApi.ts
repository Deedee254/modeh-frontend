import { useRuntimeConfig } from '#imports'

// Module-scoped memoization so all callers (and multiple composable instances)
// share the same CSRF init state and avoid duplicate /sanctum/csrf-cookie calls.
let _ensureCsrfPromise: Promise<void> | null = null
let _csrfFetchedAt = 0
// cache XSRF token reads briefly to avoid repeated document.cookie parsing
let _lastXsrf: string | null = null
let _lastXsrfAt = 0
// Session renewal tracking
let _lastSessionRenewal = 0
let _sessionRenewalPromise: Promise<void> | null = null

export function useApi() {
  const config = useRuntimeConfig()

  function getXsrfFromCookie() {
    try {
      if (typeof document === 'undefined') return null
      // if we recently parsed the cookie, reuse the cached token for 5s
      if (_lastXsrf && Date.now() - _lastXsrfAt < 5_000) return _lastXsrf
      const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
      if (!match || typeof match[1] !== 'string') return null
      _lastXsrf = decodeURIComponent(match[1])
      _lastXsrfAt = Date.now()
      return _lastXsrf
    } catch (e) {
      return null
    }
  }



  async function ensureCsrf() {
    // Avoid repeated network calls: if an ensure is in-flight, reuse its promise.
    // Also skip a new fetch if we recently fetched and the cookie appears present.
    try {
      if (typeof document !== 'undefined') {
        const xsrf = getXsrfFromCookie()
        if (xsrf && Date.now() - _csrfFetchedAt < 30_000) return
      }
    } catch (e) {
      // ignore cookie read errors and fall through to fetch
    }

    if (_ensureCsrfPromise) return _ensureCsrfPromise

    // Start the CSRF fetch and then poll briefly until the XSRF cookie is visible
    // in document.cookie. Some browsers/sites may not expose the cookie immediately
    // to document.cookie right when fetch resolves; polling helps avoid a race
    // where the subsequent login POST runs before the cookie is usable.
    _ensureCsrfPromise = (async () => {
      try {
        await fetch(config.public.apiBase + '/sanctum/csrf-cookie', { credentials: 'include' })

        // If we're in a browser, wait up to 1s, checking every 50ms for the
        // XSRF-TOKEN cookie to appear. If it appears earlier we return immediately.
        if (typeof document !== 'undefined') {
          const start = Date.now()
          const timeout = 1000
          const interval = 50
          while (Date.now() - start < timeout) {
            const xs = getXsrfFromCookie()
            if (xs) {
              _csrfFetchedAt = Date.now()
              return
            }
            // small sleep
            // eslint-disable-next-line no-await-in-loop
            await new Promise((r) => setTimeout(r, interval))
          }
          // final attempt
          if (getXsrfFromCookie()) _csrfFetchedAt = Date.now()
        } else {
          // server / SSR: mark as fetched so subsequent calls don't refetch repeatedly
          _csrfFetchedAt = Date.now()
        }
      } catch (e) {
        // keep the original behavior of logging the failure
        try { console.error('Failed to fetch CSRF cookie', e) } catch (err) {}
      } finally {
        // allow a subsequent call to create a new promise if needed
        _ensureCsrfPromise = null
      }
    })()

    return _ensureCsrfPromise
  }

  // Renew session if it's been more than 30 minutes since last renewal
  async function ensureSession() {
    const now = Date.now()
    if (now - _lastSessionRenewal < 30 * 60 * 1000) return // 30 minutes

    if (_sessionRenewalPromise) return _sessionRenewalPromise

    _sessionRenewalPromise = (async () => {
      try {
        // Use direct fetch to avoid recursion - call /api/me directly
        const res = await fetch(config.public.apiBase + '/api/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        })

        if (res.ok) {
          _lastSessionRenewal = now
        } else if (res.status === 401) {
          // Session is expired, but if this is the first renewal attempt (before login),
          // don't throw to allow login to proceed
          if (_lastSessionRenewal !== 0) {
            throw new Error('Session expired')
          }
        }
      } catch (e) {
        // If session renewal fails, the next API call will handle the 401
        throw e
      } finally {
        _sessionRenewalPromise = null
      }
    })()

    return _sessionRenewalPromise
  }

  // Build common non-JSON headers (GET, DELETE, form-data)
  function commonHeaders() {
    const headers: Record<string, string> = { 'X-Requested-With': 'XMLHttpRequest' }
    const xsrf = getXsrfFromCookie()
    if (xsrf) headers['X-XSRF-TOKEN'] = xsrf
    return headers
  }

  function defaultJsonHeaders() {
    const xsrf = getXsrfFromCookie()
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
    if (xsrf) headers['X-XSRF-TOKEN'] = xsrf
    return headers
  }
  
  async function get(path: string) {
    await ensureSession()
    // Does not require ensureCsrf() for GET requests
    return fetch(config.public.apiBase + path, {
      method: 'GET',
      credentials: 'include',
      headers: commonHeaders()
    })
  }

  async function postJson(path: string, body: any) {
    await ensureSession()
    await ensureCsrf()
    const resp = await fetch(config.public.apiBase + path, {
      method: 'POST',
      credentials: 'include',
      headers: defaultJsonHeaders(),
      body: JSON.stringify(body),
    })
    // Return the raw Response so callers can inspect status and call .json() as needed.
    return resp
  }

  // POST JSON and include the current Echo socket id (if available) as X-Socket-Id
  async function postJsonWithSocket(path: string, body: any) {
    await ensureCsrf()
    const headers = defaultJsonHeaders()
    
    // Add Echo socket ID if available
    try {
      if (typeof window !== 'undefined' && (window as any).Echo) {
        const echo = (window as any).Echo
        let socketId = null
        if (typeof echo.socketId === 'function') socketId = echo.socketId()
        else if (echo.connector && typeof echo.connector.socketId === 'function') socketId = echo.connector.socketId()
        if (socketId) headers['X-Socket-Id'] = socketId
      }
    } catch (e) {
      // ignore Echo errors
    }

    const resp = await fetch(config.public.apiBase + path, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify(body),
    })
    return resp
  }

  async function postFormData(path: string, formData: FormData) {
    await ensureSession()
    await ensureCsrf()
    const resp = await fetch(config.public.apiBase + path, {
      method: 'POST',
      credentials: 'include',
      headers: commonHeaders(),
      body: formData
    })
    return resp
  }

  async function del(path: string) {
    await ensureSession()
    await ensureCsrf()
    const resp = await fetch(config.public.apiBase + path, {
      method: 'DELETE',
      credentials: 'include',
      headers: commonHeaders()
    })
    return resp
  }

  // Handle authentication-related response codes. Returns true if handled (redirect initiated).
  function handleAuthStatus(resp: Response) {
    if (!resp) return false
    if (resp.status === 419 || resp.status === 401) {
      try { console.warn('[useApi] auth error', resp.status) } catch (e) {}
      // Simple router-based redirect to login. Use a global flag to avoid
      // duplicate redirects when multiple requests fail at once.
      try {
        if (typeof window !== 'undefined') {
          const globalAny: any = window as any
          if (globalAny.__modeh_auth_redirected) return true
          // If we're already on the login page, don't redirect again
          const isLoginPath = window.location && window.location.pathname && window.location.pathname.startsWith('/login')
          if (isLoginPath) return true

          // Attempt to use the app router for SPA navigation. If unavailable,
          // fall back to a hard navigation (very rare in a Nuxt client).
          try {
            const router = (typeof useRouter === 'function') ? useRouter() : null
            globalAny.__modeh_auth_redirected = true
            if (router && typeof router.push === 'function') {
              // Simple push to login (no returnTo query)
              router.push('/login')
            } else {
              window.location.href = '/login'
            }
          } catch (e) {
            // If router usage fails, do a direct navigation.
            try { globalAny.__modeh_auth_redirected = true; window.location.href = '/login' } catch (err) {}
          }
        }
      } catch (e) {}
      return true
    }
    return false
  }

  // Parse JSON responses and detect structured limit errors (do NOT auto-redirect)
  async function parseResponse(resp: Response) {
    if (!resp) return null
    const ct = resp.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      try {
        const json = await resp.json()
        // If backend returned a structured limit error, return it directly for callers to handle
        if (resp.status === 403 && json && json.code === 'limit_reached') {
          return json
        }
        return json
      } catch (e) {
        return null
      }
    }
    // Non-JSON responses return the raw Response
    return resp
  }

  async function patchJson(path: string, body: any) {
    await ensureSession()
    await ensureCsrf()
    const resp = await fetch(config.public.apiBase + path, {
      method: 'PATCH',
      credentials: 'include',
      headers: defaultJsonHeaders(),
      body: JSON.stringify(body),
    })
    return resp
  }

  return { ensureCsrf, ensureSession, getXsrfFromCookie, get, postJson, postFormData, patchJson, del, handleAuthStatus }
}

export default useApi
