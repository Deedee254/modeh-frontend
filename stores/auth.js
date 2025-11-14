import { defineStore } from 'pinia';
import { ref } from 'vue';
import useApi from '~/composables/useApi';

let notificationsModule = null;
if (import.meta.client) {
  import('~/stores/notifications').then(m => (notificationsModule = m));
}
// Named references so we can remove listeners later and avoid anonymous handlers
let _auth_storage_handler = null;
let _auth_beforeunload = null;

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const role = ref(null);
  const api = useApi();

  async function login(email, password, remember = false) {
    const payload = { email, password, remember };
    try {
      const res = await api.postJson('/api/login', payload);

      if (!res.ok) {
        // Try to extract a helpful error message from the response body
        let message = 'Login failed';
        try {
          const errBody = await res.json();
          if (errBody) {
            if (errBody.message) message = errBody.message;
            else if (errBody.errors) {
              const vals = Object.values(errBody.errors).flat();
              if (vals.length) message = vals.join('; ');
            } else if (typeof errBody === 'string') message = errBody;
          }
        } catch (e) {
          try {
            const txt = await res.text();
            if (txt) message = txt;
          } catch (e) {}
        }
        throw new Error(message);
      }

      const json = await res.json();
      // backend returns the authenticated user directly from login; normalize
      const returnedUser = json?.user || json?.data || json || null;
      if (returnedUser) setUser(returnedUser);

      // If we previously triggered a global auth redirect flag, clear it
      try { if (import.meta.client) { window.__modeh_auth_redirected = false } } catch (e) {}

      // After login, attempt to attach Echo listeners for realtime notifications
      if (import.meta.client) {
        try {
          const notif = notificationsModule?.useNotificationsStore();
          notif?.attachEchoListeners();
        } catch (e) {
          // ignore
        }
        // notify other tabs about login so they can refresh their auth state
        try { localStorage.setItem('modeh:auth:event', JSON.stringify({ type: 'login', ts: Date.now() })); } catch (e) {}
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

      return { data: json, ok: true };
    } catch (error) {
      // rethrow so callers can handle
      throw error;
    }
  }

  async function logout() {
    // Always clear local state first for a responsive UI,
    // then attempt to log out from the server.
    clear();
    if (import.meta.client) {
      // notify other tabs about logout
      try { localStorage.setItem('modeh:auth:event', JSON.stringify({ type: 'logout', ts: Date.now() })); } catch (e) {}
    }
    try {
      await api.postJson('/api/logout', {});
    } catch (error) {
      // Silently ignore network errors on logout. The client-side state is already cleared.
      // The server session will eventually expire.
    }
  }

  async function fetchUser() {
    try {
      const res = await api.get('/api/me')
      if (!res.ok) throw new Error('Failed to fetch user');
      setUser(await res.json());
      // ensure realtime listeners attached after fetching user on page load
      if (import.meta.client) {
        try {
          const notif = notificationsModule?.useNotificationsStore();
          notif?.attachEchoListeners();
        } catch (e) {}
        // Process any post-login intent (e.g. subscribe intent saved before login)
        try {
          const nuxtApp = useNuxtApp();
          if (nuxtApp?.$processPostLoginIntent) {
            nuxtApp.$processPostLoginIntent().catch(() => {});
          }
        } catch (e) {}
      }
    } catch (error) {
      clear();
    }
  }

  function setUser(newUser) {
    user.value = newUser;
    role.value = newUser?.role || null;

    // If running in the browser and the user profile is incomplete, route to the
    // appropriate profile completion flow. We send social-registered/new users
    // to `/onboarding` (used for social signups that need role selection), and
    // non-social users to `/complete-profile` which supports skipping.
    try {
      if (import.meta.client && newUser && newUser.is_profile_completed === false) {
        // Respect a client-side skip flag so the user can opt to go directly to the dashboard
        const skipped = (() => { try { return localStorage.getItem('modeh:onboarding:skipped') === '1'; } catch (e) { return false; } })();
        if (!skipped) {
          const router = useRouter();
          // small timeout so other post-login navigation finishes first
          setTimeout(() => {
            try {
              const isSocial = Boolean(newUser.social_provider || newUser.social_id);
              if (isSocial) {
                // Social signups may need the onboarding role flow
                router.push('/onboarding');
              } else {
                // Existing non-social accounts should go to the full complete-profile flow
                router.push('/complete-profile');
              }
            } catch (e) { /* ignore navigation errors */ }
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
  if (import.meta.client) {
    // Avoid registering multiple handlers if this module is imported/re-evaluated
    if (!_auth_storage_handler) {
      _auth_storage_handler = (e) => {
        try {
          // An explicit auth event was fired from another tab.
          if (e.key === 'modeh:auth:event' && e.newValue) {
            const payload = JSON.parse(e.newValue);
            if (payload?.type === 'logout') {
              // Another tab logged out, so clear local auth state.
              clear();
            } else if (payload?.type === 'login') {
              // Another tab logged in, so refresh the user from the server.
              fetchUser().catch(() => {});
            }
            return; // Handled by explicit event, no need to check token key.
          }


        } catch (err) {
          // ignore malformed events
        }
      };

      window.addEventListener('storage', _auth_storage_handler);

      // Ensure we remove the handler on page unload to avoid lingering references in some environments.
      _auth_beforeunload = () => {
        try { window.removeEventListener('storage', _auth_storage_handler); } catch (e) {}
        try { window.removeEventListener('beforeunload', _auth_beforeunload); } catch (e) {}
      };
      window.addEventListener('beforeunload', _auth_beforeunload);
    }
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
