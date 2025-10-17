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
    return fetch(config.public.apiBase + path, {
      method: 'POST',
      credentials: 'include',
      headers: defaultJsonHeaders(),
      body: JSON.stringify(body),
    })
  }

  async function postFormData(path: string, formData: FormData) {
    await ensureCsrf()
    const xsrf = getXsrfFromCookie()
    const headers: Record<string, string> = { 'X-Requested-With': 'XMLHttpRequest' }
    if (xsrf) headers['X-XSRF-TOKEN'] = xsrf
    return fetch(config.public.apiBase + path, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData
    })
  }

  async function del(path: string) {
    await ensureCsrf()
    const xsrf = getXsrfFromCookie()
    const headers: Record<string, string> = { 'X-Requested-With': 'XMLHttpRequest' }
    if (xsrf) headers['X-XSRF-TOKEN'] = xsrf
    return fetch(config.public.apiBase + path, {
      method: 'DELETE',
      credentials: 'include',
      headers
    })
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

  async function patchJson(path: string, body: any) {
    await ensureCsrf()
    return fetch(config.public.apiBase + path, {
      method: 'PATCH',
      credentials: 'include',
      headers: defaultJsonHeaders(),
      body: JSON.stringify(body),
    })
  }

  return { ensureCsrf, getXsrfFromCookie, get, postJson, postFormData, patchJson, del, handleAuthStatus }
}

export default useApi
