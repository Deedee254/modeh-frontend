import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRuntimeConfig } from '#app';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const role = ref(null);

  const config = useRuntimeConfig()

  // Helper: ensure CSRF cookie is obtained from backend
  async function ensureCsrf() {
    // Use global $fetch provided by Nuxt/Nitro. Request must include credentials so cookie is set.
    await $fetch('/sanctum/csrf-cookie', {
      baseURL: config.public.apiBase || '',
      credentials: 'include',
      method: 'GET'
    })
  }

  // Helper: read XSRF token from cookie (client only)
  function readXsrfTokenFromCookie() {
    if (process.client) {
      const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
      return match ? decodeURIComponent(match[1]) : null
    }
    return null
  }

  async function login(email, password) {
    const payload = { email, password }
    try {
      // Ensure CSRF cookie is set
      await ensureCsrf()

      // Read XSRF token from cookie and include as header (fetch doesn't auto-map Laravel cookie)
      const xsrf = readXsrfTokenFromCookie()

      const res = await $fetch('/api/login', {
        baseURL: config.public.apiBase || '',
        method: 'POST',
        credentials: 'include',
        body: payload,
        headers: xsrf ? { 'X-XSRF-TOKEN': xsrf, 'X-Requested-With': 'XMLHttpRequest' } : { 'X-Requested-With': 'XMLHttpRequest' }
      })

      // If backend returns a token, store it (some setups use cookies only)
      const token = res?.token || res?.access_token
      if (process.client && token) {
        localStorage.setItem('token', token)
      }

      // backend returns the authenticated user directly from login; normalize
      const returnedUser = res?.user || res?.data || res || null
      if (returnedUser) setUser(returnedUser)
      // After login, attempt to attach Echo listeners for realtime notifications
      if (process.client) {
        import('~/stores/notifications').then((m) => {
          try {
            const notif = m.useNotificationsStore()
            notif.attachEchoListeners()
          } catch (e) {
            // ignore
          }
        }).catch(() => {})
        // notify other tabs about login so they can refresh their auth state
        try { localStorage.setItem('modeh:auth:event', JSON.stringify({ type: 'login', ts: Date.now() })) } catch (e) {}
        // If a post-login intent processor is provided via a client plugin, run it
        try {
          const nuxtApp = useNuxtApp()
          if (nuxtApp?.$processPostLoginIntent) {
            // fire-and-forget; plugin will handle errors
            nuxtApp.$processPostLoginIntent().catch(() => {})
          }
        } catch (e) {
          // ignore when running in contexts without useNuxtApp
        }
      }
      return { data: res }
    } catch (error) {
      // rethrow so callers can handle
      throw error
    }
  }

  async function logout() {
    try {
      await $fetch('/api/logout', {
        baseURL: config.public.apiBase || '',
        method: 'POST',
        credentials: 'include'
      })
    } catch (e) {
      // ignore network errors on logout
    }
    clear();
    if (process.client) {
      try { localStorage.removeItem('token') } catch (e) {}
      // notify other tabs about logout
      try { localStorage.setItem('modeh:auth:event', JSON.stringify({ type: 'logout', ts: Date.now() })) } catch (e) {}
    }
  }

  async function fetchUser() {
    try {
      const res = await $fetch('/api/me', {
        baseURL: config.public.apiBase || '',
        credentials: 'include',
        method: 'GET'
      })
      setUser(res)
      // ensure realtime listeners attached after fetching user on page load
      if (process.client) {
        import('~/stores/notifications').then((m) => {
          try { const notif = m.useNotificationsStore(); notif.attachEchoListeners() } catch (e) {}
        }).catch(() => {})
        // Process any post-login intent (e.g. subscribe intent saved before login)
        try {
          const nuxtApp = useNuxtApp()
          if (nuxtApp?.$processPostLoginIntent) {
            nuxtApp.$processPostLoginIntent().catch(() => {})
          }
        } catch (e) {}
      }
    } catch (error) {
      clear()
    }
  }

  function setUser(newUser) {
    user.value = newUser;
    role.value = newUser?.role || null;

    // If running in the browser and the user profile is incomplete, route to onboarding
    try {
      if (process.client && newUser && newUser.is_profile_completed === false) {
        // Respect a client-side skip flag so the user can opt to go directly to the dashboard
        const skipped = (() => {
          try { return localStorage.getItem('modeh:onboarding:skipped') === '1' } catch (e) { return false }
        })()
        if (!skipped) {
          const router = useRouter()
          // small timeout so other post-login navigation finishes first
          setTimeout(() => {
            try { router.push('/onboarding') } catch (e) { /* ignore navigation errors */ }
          }, 50)
        }
      }
    } catch (e) {
      // ignore when useRouter not available
    }
  }

  function clear() {
    user.value = null;
    role.value = null;
  }

  // Cross-tab auth sync: listen for storage events to handle token changes or explicit auth events
  if (process.client) {
    window.addEventListener('storage', (e) => {
      try {
        // explicit auth event (login/logout) with structured payload
        if (e.key === 'modeh:auth:event' && e.newValue) {
          const payload = JSON.parse(e.newValue)
          if (payload?.type === 'logout') {
            // another tab logged out -> clear local auth state
            clear()
          } else if (payload?.type === 'login') {
            // another tab logged in -> refresh user from server
            fetchUser().catch(() => {})
          }
        }

        // token key changed: if token removed -> clear; if token added/changed -> attempt fetchUser
        if (e.key === 'token') {
          if (!e.newValue) {
            // token removed
            clear()
          } else {
            // token added/changed
            fetchUser().catch(() => {})
          }
        }
      } catch (err) {
        // ignore malformed events
      }
    })
  }

  return {
    user,
    role,
    login,
    logout,
    fetchUser,
    setUser,
    clear,
  };
});
