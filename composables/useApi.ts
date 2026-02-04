import { useRuntimeConfig, watch } from '#imports'

// Module-scoped memoization so all callers (and multiple composable instances)
// share the same CSRF init state and avoid duplicate /sanctum/csrf-cookie calls.
let _ensureCsrfPromise: Promise<void> | null = null
let _csrfFetchedAt = 0
// cache XSRF token reads briefly to avoid repeated document.cookie parsing
let _lastXsrf: string | null = null
let _lastXsrfAt = 0
// Single-flight in-flight request map to dedupe identical GET requests
let _inFlightRequests: Record<string, Promise<Response> | null> = {}

export function useApi() {
  const config = useRuntimeConfig()
  // useAuth is auto-imported by Nuxt
  const auth = useAuth()

  function getAuthToken() {
    try {
      // Get the API token from Nuxt-Auth session (set by the backend during login)
      const session = auth.data?.value as any
      
      if (session?.user?.apiToken) {
        return session.user.apiToken as string
      }
    } catch (e) {
      console.error('[useApi] getAuthToken: Error accessing auth data:', e)
    }
    return null
  }

  async function getAuthTokenAsync() {
    try {
      // Wait for auth to be ready if it's still loading
      if (auth && auth.status.value === 'loading') {
        await new Promise<void>((resolve) => {
          const stop = watch(auth.status, (newStatus) => {
            if (newStatus !== 'loading') {
              stop()
              resolve()
            }
          })
        })
      }

      return getAuthToken()
    } catch (e) {
      console.error('[useApi] getAuthTokenAsync: Error getting auth token async:', e)
      return null
    }
  }

  function getXsrfFromCookie() {
    try {
      if (typeof document === 'undefined') return null
      // if we recently parsed the cookie, reuse the cached token briefly (100ms)
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

  async function ensureCsrf(force = false) {
    if (force) {
      _csrfFetchedAt = 0
      _ensureCsrfPromise = null
      _lastXsrf = null
    }

    try {
      if (typeof document !== 'undefined' && !force) {
        const xsrf = getXsrfFromCookie()
        if (xsrf) {
          _csrfFetchedAt = Date.now()
          return
        }
      }
    } catch (e) { }

    if (_ensureCsrfPromise) return _ensureCsrfPromise

    _ensureCsrfPromise = (async () => {
      const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null
      const timeoutMs = 15000
      let timeoutId: any = null
      try {
        if (controller) timeoutId = setTimeout(() => controller.abort(), timeoutMs)
        
        const fetchResp = await fetch(config.public.apiBase + '/sanctum/csrf-cookie', { 
          credentials: 'include', 
          signal: controller?.signal 
        })

        if (!fetchResp.ok) {
          throw new Error(`CSRF endpoint returned ${fetchResp.status}`)
        }

        if (typeof document !== 'undefined') {
          const start = Date.now()
          const timeout = 2000
          const interval = 100
          while (Date.now() - start < timeout) {
            const xs = getXsrfFromCookie()
            if (xs) {
              _csrfFetchedAt = Date.now()
              return
            }
            await new Promise((r) => setTimeout(r, interval))
          }
          if (getXsrfFromCookie()) {
            _csrfFetchedAt = Date.now()
            return
          }
          throw new Error('CSRF cookie not present after fetch')
        } else {
          _csrfFetchedAt = Date.now()
        }
      } catch (e: any) {
        console.error('[useApi] CSRF initialization failed:', e.message)
        throw e
      } finally {
        if (timeoutId) clearTimeout(timeoutId)
        _ensureCsrfPromise = null
      }
    })()

    return _ensureCsrfPromise
  }

  async function commonHeadersAsync() {
    const headers: Record<string, string> = { 
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json'
    }
    const token = await getAuthTokenAsync()
    if (token) headers['Authorization'] = `Bearer ${token}`
    
    const xsrf = getXsrfFromCookie()
    if (xsrf) headers['X-XSRF-TOKEN'] = xsrf
    
    return headers
  }

  async function defaultJsonHeadersAsync() {
    const headers = await commonHeadersAsync()
    headers['Content-Type'] = 'application/json'
    return headers
  }

  /**
   * Core request wrapper with 419 retry logic
   */
  async function request(path: string, options: RequestInit = {}, retryCount = 0): Promise<Response> {
    const isStateful = options.method && !['GET', 'HEAD', 'OPTIONS'].includes(options.method.toUpperCase())
    
    if (isStateful && retryCount === 0) {
      try { await ensureCsrf() } catch (e) { }
    }

    // Refresh headers for each attempt (to get latest XSRF token)
    const headers = options.headers as Record<string, string> || {}
    const authHeaders = options.body instanceof FormData 
      ? await commonHeadersAsync() 
      : await defaultJsonHeadersAsync()
    
    options.headers = { ...authHeaders, ...headers }
    options.credentials = options.credentials || 'include'

    // Ensure we have a usable public apiBase on the client — fall back to empty string.
    const base = (config && config.public && config.public.apiBase) ? String(config.public.apiBase) : ''
    try { console.debug('[useApi] request:', base + path, options) } catch (e) {}
    const resp = await fetch(base + path, options)

    // Handle 419 CSRF error by retrying once
    if (resp.status === 419 && retryCount < 1) {
      await ensureCsrf(true)
      return request(path, options, retryCount + 1)
    }

    return resp
  }

  async function get(path: string) {
    // Deduplicate concurrent GET requests for the same path (especially /api/me)
    // NOTE: When returning a cached promise, we must clone the response
    // to avoid "body already read" errors when multiple callers consume it
    try {
      const inFlight = _inFlightRequests[path]
      if (inFlight) {
        // Wait for the in-flight request to complete
        const resp = await inFlight
        // Return a cloned response so each caller gets their own body stream
        // This prevents "Failed to execute 'clone' on 'Response': Response body is already used" errors
        return resp.clone()
      }
      
      const p = request(path, { method: 'GET' })
      _inFlightRequests[path] = p
      // Ensure cleanup regardless of success/failure
      p.finally(() => { _inFlightRequests[path] = null })
      return p
    } catch (e) {
      // Fallback to direct request if something goes wrong
      return request(path, { method: 'GET' })
    }
  }

  async function getAsync(path: string) {
    // Alias to `get` which already dedupes
    return get(path)
  }

  async function getPublic(path: string) {
    return fetch(config.public.apiBase + path, {
      method: 'GET',
      credentials: 'omit',
      headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' }
    })
  }

  async function postJson(path: string, body: any) {
    return request(path, {
      method: 'POST',
      body: JSON.stringify(body)
    })
  }

  async function postJsonAsync(path: string, body: any) {
    return postJson(path, body)
  }

  async function postJsonPublic(path: string, body: any) {
    return fetch(config.public.apiBase + path, {
      method: 'POST',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
      body: JSON.stringify(body)
    })
  }

  async function postJsonWithSocket(path: string, body: any) {
    const headers: Record<string, string> = {}
    try {
      if (typeof window !== 'undefined' && (window as any).Echo) {
        const echo = (window as any).Echo
        let socketId = null
        if (typeof echo.socketId === 'function') socketId = echo.socketId()
        else if (echo.connector && typeof echo.connector.socketId === 'function') socketId = echo.connector.socketId()
        if (socketId) headers['X-Socket-Id'] = socketId
      }
    } catch (e) { }

    return request(path, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })
  }

  async function postFormData(path: string, formData: FormData) {
    return request(path, {
      method: 'POST',
      body: formData
    })
  }

  async function postFormDataAsync(path: string, formData: FormData) {
    return postFormData(path, formData)
  }

  async function patchJson(path: string, body: any) {
    return request(path, {
      method: 'PATCH',
      body: JSON.stringify(body)
    })
  }

  async function putJson(path: string, body: any) {
    return request(path, {
      method: 'PUT',
      body: JSON.stringify(body)
    })
  }

  async function del(path: string) {
    return request(path, { method: 'DELETE' })
  }

  function handleAuthStatus(resp: Response) {
    if (!resp) return false
    if (resp.status === 419 || resp.status === 401) {
      if (typeof window !== 'undefined') {
        const globalAny = window as any
        if (globalAny.__modeh_auth_redirected) return true
        globalAny.__modeh_auth_redirected = true
        
        try {
          const rt = (typeof useRouter === 'function') ? useRouter() : null
          if (rt && typeof rt.push === 'function') {
            rt.push('/login')
          } else {
            window.location.href = '/login'
          }
        } catch (_) {
          window.location.href = '/login'
        }
      }
      return true
    }
    return false
  }

  async function parseResponse(resp: Response) {
    if (!resp) return null
    const ct = resp.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      try {
        // Clone response to avoid "body stream already read" error
        const clonedResp = resp.clone()
        const json = await clonedResp.json()
        return json
      } catch (e) {
        console.error('Failed to parse JSON response:', e)
        return null
      }
    }
    return resp
  }

  function clearAuthCache() {
    _lastXsrf = null
    _lastXsrfAt = 0
    _csrfFetchedAt = 0
    _ensureCsrfPromise = null
  }

  const post = (...args: Parameters<typeof postJson>) => postJson(...args)
  const postWithSocket = (...args: Parameters<typeof postJsonWithSocket>) => postJsonWithSocket(...args)

  return { 
    ensureCsrf, 
    getXsrfFromCookie, 
    getAuthToken, 
    getAuthTokenAsync, 
    get, 
    getAsync, 
    getPublic, 
    post, 
    postJson, 
    postJsonAsync, 
    postJsonPublic, 
    postWithSocket, 
    postJsonWithSocket, 
    postFormData, 
    postFormDataAsync, 
    patchJson, 
    putJson, 
    del, 
    handleAuthStatus, 
    parseResponse, 
    clearAuthCache 
  }
}

export default useApi
