import { useRuntimeConfig } from '#imports'

export function useApi() {
  const config = useRuntimeConfig()

  function getXsrfFromCookie() {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
    if (!match || typeof match[1] !== 'string') return null
    return decodeURIComponent(match[1])
  }

  async function ensureCsrf() {
    // Fetch Sanctum CSRF cookie to initialize session and XSRF-TOKEN
    try {
      await fetch(config.public.apiBase + '/sanctum/csrf-cookie', { credentials: 'include' })
    } catch (e) {
      // ignore: caller should handle fail
    }
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

  // POST JSON and include the current Echo socket id (if available) as X-Socket-Id
  async function postJsonWithSocket(path: string, body: any) {
    await ensureCsrf()
    const xsrf = getXsrfFromCookie()
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
    if (xsrf) headers['X-XSRF-TOKEN'] = xsrf
    try {
      if (typeof window !== 'undefined' && (window as any).Echo) {
        const echo = (window as any).Echo
        let socketId = null
        if (typeof echo.socketId === 'function') socketId = echo.socketId()
        else if (echo.connector && typeof echo.connector.socketId === 'function') socketId = echo.connector.socketId()
        if (socketId) headers['X-Socket-Id'] = socketId
      }
    } catch (e) {}

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
    const xsrf = getXsrfFromCookie()
    const headers: Record<string, string> = { 'X-Requested-With': 'XMLHttpRequest' }
    if (xsrf) headers['X-XSRF-TOKEN'] = xsrf
    const resp = await fetch(config.public.apiBase + path, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData
    })
    return resp
  }

  async function del(path: string) {
    await ensureCsrf()
    const xsrf = getXsrfFromCookie()
    const headers: Record<string, string> = { 'X-Requested-With': 'XMLHttpRequest' }
    if (xsrf) headers['X-XSRF-TOKEN'] = xsrf
    const resp = await fetch(config.public.apiBase + path, {
      method: 'DELETE',
      credentials: 'include',
      headers
    })
    return resp
  }

  // Handle authentication-related response codes. Returns true if handled (redirect initiated).
  function handleAuthStatus(resp: Response) {
    if (!resp) return false
    if (resp.status === 419 || resp.status === 401) {
      try { console.warn('[useApi] auth error', resp.status) } catch (e) {}
      // Friendly redirect to login for SPAs
      try {
        // prefer client-side navigation if available
        if (typeof window !== 'undefined') {
          // show a small delay to allow callers to show a message first
          window.setTimeout(() => { window.location.href = '/login' }, 700)
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
    await ensureCsrf()
    const resp = await fetch(config.public.apiBase + path, {
      method: 'PATCH',
      credentials: 'include',
      headers: defaultJsonHeaders(),
      body: JSON.stringify(body),
    })
    return resp
  }

  return { ensureCsrf, getXsrfFromCookie, get, postJson, postFormData, patchJson, del, handleAuthStatus }
}

export default useApi
