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
      // if we recently parsed the cookie, reuse the cached token briefly (100ms)
      // to avoid repeated parsing in tight loops, but don't hold it long enough
      // to miss a token refresh (e.g. after login).
      if (_lastXsrf && Date.now() - _lastXsrfAt < 100) return _lastXsrf
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
    // Also skip a new fetch if the cookie is already present (e.g. from a backend redirect).
    try {
      if (typeof document !== 'undefined') {
        const xsrf = getXsrfFromCookie()
        if (xsrf) {
          // If we have a cookie, we consider CSRF initialized. 
          // We don't strictly need the 30s check here if we just want to avoid the redundant call.
          _csrfFetchedAt = Date.now()
          return
        }
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
      // Use an AbortController to avoid hanging forever if the backend is unreachable.
      const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null
      // Give the backend a bit more time for slow dev environments
      const timeoutMs = 15000
      let timeoutId: any = null
      try {
        if (controller) {
          timeoutId = setTimeout(() => controller.abort(), timeoutMs)
        }
        await fetch(config.public.apiBase + '/sanctum/csrf-cookie', { credentials: 'include', signal: controller?.signal })

        // If we're in a browser, wait up to 1s, checking every 50ms for the
        // XSRF-TOKEN cookie to appear. If it appears earlier we return immediately.
        if (typeof document !== 'undefined') {
          const start = Date.now()
          // Shorter poll window: usually the cookie is set immediately; keep
          // a brief poll for rare races but don't block the UI for 1s in dev.
          const timeout = 200
          const interval = 25
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
      } catch (e: any) {
        // If the fetch was aborted (timeout), don't log the raw AbortError stack to the console
        // — surface a friendlier, catchable error instead so callers can show an appropriate UI message.
        try {
          if (e && e.name === 'AbortError') {
            // console.warn instead of console.error to reduce noise during dev
            try { console.warn('CSRF fetch aborted (timeout).') } catch (_) { }
          } else {
            try { console.error('Failed to fetch CSRF cookie', e) } catch (err) { }
          }
        } catch (err) { }
        // Re-throw a friendly error message for callers to handle.
        throw new Error('Unable to reach API to initialize CSRF token. Please check that the backend is running and reachable.');
      } finally {
        if (timeoutId) clearTimeout(timeoutId)
        // allow a subsequent call to create a new promise if needed
        _ensureCsrfPromise = null
      }
    })()

    return _ensureCsrfPromise
  }

  // Previously this function attempted to renew the session by calling /api/me
  // on a timer. That behavior caused login and other auth flows to fail when
  // the renewal returned 401 and threw before the intended request ran.
  // To avoid those issues we make ensureSession a no-op; CSRF initialization
  // is still performed when needed via ensureCsrf().
  async function ensureSession() {
    return
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

  async function getPublic(path: string) {
    // Does not require session or CSRF
    return fetch(config.public.apiBase + path, {
      method: 'GET',
      credentials: 'omit',
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
  }

  async function postJson(path: string, body: any) {
    // Skip session renewal check for authentication endpoints (login/register/logout)
    const skipSession = typeof path === 'string' && (path === '/api/login' || path === '/login' || path === '/api/logout' || path.endsWith('/login'))
    if (!skipSession) await ensureSession()
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

  // POST JSON without attempting CSRF or session initialization. Useful for
  // public endpoints that don't require Sanctum/session cookies (guest-only APIs).
  async function postJsonPublic(path: string, body: any) {
    const resp = await fetch(config.public.apiBase + path, {
      method: 'POST',
      // Do NOT include credentials or CSRF headers for public guest endpoints.
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify(body),
    })
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
      // would surface as SSR warnings in the devtools. Only log on the client.
      try { if (typeof window !== 'undefined') console.warn('[useApi] auth error', resp.status) } catch (e) { }
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
            try { globalAny.__modeh_auth_redirected = true; window.location.href = '/login' } catch (err) { }
          }
        }
      } catch (e) { }
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

  // Reset all cached auth state (called on logout)
  function clearAuthCache() {
    _lastXsrf = null
    _lastXsrfAt = 0
    _csrfFetchedAt = 0
    _ensureCsrfPromise = null
    _lastSessionRenewal = 0
    _sessionRenewalPromise = null
  }

  // Backwards-compatible aliases: many callers expect `api.post` rather than `postJson`.
  const post = (...args: Parameters<typeof postJson>) => postJson(...args)
  const postWithSocket = (...args: Parameters<typeof postJsonWithSocket>) => postJsonWithSocket(...args)

  return { ensureCsrf, ensureSession, getXsrfFromCookie, get, getPublic, post, postJson, postJsonPublic, postWithSocket, postJsonWithSocket, postFormData, patchJson, del, handleAuthStatus, parseResponse, clearAuthCache }
}

export default useApi

