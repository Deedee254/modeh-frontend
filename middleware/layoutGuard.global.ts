import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  // This global middleware only acts when a page explicitly sets a layout meta
  const layout = to.meta?.layout as string | undefined
  if (!layout) return

  const auth = useAuthStore()

  // On server-side requests, try to populate the auth store by forwarding
  // the incoming request cookie to the backend. This allows cookie-based
  // sessions (for example Laravel Sanctum) to be recognized during SSR.
  // Cache the result on the request event to avoid calling `/api/me` for
  // every guarded route within the same SSR render.
  if (process.server && !auth.user) {
    try {
      const event = useRequestEvent()
      const CACHE_KEY = '__modeh_auth_user'
      // If another middleware/handler already fetched the user for this request, reuse it
      const cached = (event as any)[CACHE_KEY]
      if (cached) {
        try { auth.setUser && auth.setUser(cached) } catch (e) { /* ignore */ }
      } else {
        const headers = useRequestHeaders(['cookie']) || {}
        const config = useRuntimeConfig()
  const cfg = useRuntimeConfig()
  const res = await $fetch(cfg.public.apiBase + '/api/me', {
          baseURL: config.public.apiBase || '',
          method: 'GET',
          // forward client's cookie so backend can read the session
          headers: headers.cookie ? { cookie: headers.cookie } : undefined,
        })
        if (res) {
          // store in the event so subsequent guarded routes reuse it
          try { (event as any)[CACHE_KEY] = res } catch (e) { /* ignore */ }
          try { auth.setUser && auth.setUser(res) } catch (e) { /* ignore */ }
        }
      }
    } catch (e) {
      // ignore server-side fetch errors; treat as unauthenticated
    }
  }

  // If running in the browser and there's a token but no user loaded yet, try to fetch
  if (process.client && !auth.user && typeof localStorage !== 'undefined' && localStorage.getItem('token')) {
    try { await auth.fetchUser() } catch (e) { /* ignore fetch errors; handled below */ }
  }

  // If not authenticated, redirect to login with next param
  if (!auth.user) {
    const next = encodeURIComponent(to.fullPath || '/')
    return navigateTo(`/login?next=${next}`)
  }

  // auth store is JS; cast to any to avoid TS issues when accessing refs
  const a: any = auth
  const role = (a.role && a.role.value) || a.user?.role || null

  // Allow admins to access everything on the frontend
  if (role === 'admin') return

  // Map layout names to required roles. Add more mappings here if needed.
  const layoutRoleMap: Record<string, string> = {
    'quiz-master': 'quiz-master',
    'quizee': 'quizee'
  }

  const requiredRole = layoutRoleMap[layout]
  if (!requiredRole) return // no specific role required for this layout

  if (role !== requiredRole) {
    // Redirect to login so the user can re-authenticate or sign in with the correct role.
    const next = encodeURIComponent(to.fullPath || '/')
    return navigateTo(`/login?next=${next}`)
  }
})

