import { useRuntimeConfig } from '#imports'

// Module-scoped memoization so all callers (and multiple composable instances)
// share the same CSRF init state and avoid duplicate /sanctum/csrf-cookie calls.
let _ensureCsrfPromise: Promise<void> | null = null
let _csrfFetchedAt = 0
// cache XSRF token reads briefly to avoid repeated document.cookie parsing
let _lastXsrf: string | null = null
let _lastXsrfAt = 0

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
          // Poll briefly for the cookie to appear. A slightly longer window
          // helps in slow dev environments where the cookie may be set a
          // little while after the fetch resolves. Keep this short enough
          // to avoid blocking the UI but long enough to avoid flaky races.
          const timeout = 1000 // ms
          const interval = 50 // ms
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
          if (getXsrfFromCookie()) {
            _csrfFetchedAt = Date.now()
            return
          }
          // If we reach here, we failed to observe the XSRF cookie in the document
          // even though the backend responded to /sanctum/csrf-cookie. Surface
          // a clear, actionable error so callers can show a helpful message.
          throw new Error('CSRF cookie not present after /sanctum/csrf-cookie. Ensure the backend sets XSRF-TOKEN (check SANCTUM_STATEFUL_DOMAINS, CORS and cookie settings: SESSION_DOMAIN, SESSION_SECURE_COOKIE, SESSION_SAME_SITE).')
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
    await ensureCsrf()
    const resp = await fetch(config.public.apiBase + path, {
      method: 'DELETE',
      credentials: 'include',
      headers: commonHeaders()
    })
    return resp
  }

  // Handle authentication-related response codes via nuxt-auth
  async function handleAuthStatus(resp: Response) {
    if (!resp) return false
    if (resp.status === 419 || resp.status === 401) {
      if (typeof window !== 'undefined') {
        const globalAny = window as any
        if (globalAny.__modeh_auth_redirected) return true
        globalAny.__modeh_auth_redirected = true
        
        // Attempt to clear auth state and redirect to login
        // We don't directly import #auth to avoid build-time resolution issues.
        // Instead, we rely on the page/composable that calls handleAuthStatus to handle auth cleanup.
        // The window.location redirect here signals the caller (via the 401/419 status check)
        // that they should also clear their local auth state if needed.
        try {
          window.location.href = '/login'
        } catch (_) {
          // fallback: do nothing if window access fails
        }
      }
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
  }

  // Backwards-compatible aliases: many callers expect `api.post` rather than `postJson`.
  const post = (...args: Parameters<typeof postJson>) => postJson(...args)
  const postWithSocket = (...args: Parameters<typeof postJsonWithSocket>) => postJsonWithSocket(...args)

  return { ensureCsrf, getXsrfFromCookie, get, getPublic, post, postJson, postJsonPublic, postWithSocket, postJsonWithSocket, postFormData, patchJson, del, handleAuthStatus, parseResponse, clearAuthCache }
}

export default useApi

