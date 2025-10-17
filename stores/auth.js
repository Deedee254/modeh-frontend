import { defineStore } from 'pinia';
import { ref } from 'vue';
import useApi from '~/composables/useApi';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const role = ref(null);
  const api = useApi();

  async function login(email, password) {
    const payload = { email, password }
    try {
      const res = await api.postJson('/api/login', payload)
      if (!res.ok) throw new Error('Login failed')
      const json = await res.json()

      // If backend returns a token, store it (some setups use cookies only)
      const token = json?.token || json?.access_token
      if (process.client && token) {
        localStorage.setItem('token', token)
      }

      // backend returns the authenticated user directly from login; normalize
      const returnedUser = json?.user || json?.data || json || null
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
      return { data: json }
    } catch (error) {
      // rethrow so callers can handle
      throw error
    }
  }

  async function logout() {
    // Always clear local state first for a responsive UI,
    // then attempt to log out from the server.
    clear();
    if (process.client) {
      try { localStorage.removeItem('token') } catch (e) {}
      // notify other tabs about logout
      try { localStorage.setItem('modeh:auth:event', JSON.stringify({ type: 'logout', ts: Date.now() })) } catch (e) {}
    }
    try {
      await api.postJson('/api/logout', {})
    } catch (error) {
      // Silently ignore network errors on logout. The client-side state is already cleared.
      // The server session will eventually expire.
    }
  }

  async function fetchUser() {
    try {
      const res = await api.get('/api/me')
      if (!res.ok) throw new Error('Failed to fetch user')
      setUser(await res.json())
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
        // An explicit auth event was fired from another tab.
        if (e.key === 'modeh:auth:event' && e.newValue) {
          const payload = JSON.parse(e.newValue)
          if (payload?.type === 'logout') {
            // Another tab logged out, so clear local auth state.
            clear()
          } else if (payload?.type === 'login') {
            // Another tab logged in, so refresh the user from the server.
            fetchUser().catch(() => {})
          }
          return // Handled by explicit event, no need to check token key.
        }

        // Fallback for when the token is changed directly (e.g., by another app or manual intervention).
        if (e.key === 'token') {
          if (!e.newValue) {
            clear()
          } else {
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
