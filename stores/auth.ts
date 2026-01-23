import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Ref } from 'vue'
import useApi from '~/composables/useApi'
import { useInstitutionsStore } from '~/stores/institutions'
import { useGuestQuizStore } from '~/composables/useGuestQuizStore'
import type { User } from '~/types'

let _auth_storage_handler: ((e: StorageEvent) => void) | null = null
let _auth_beforeunload: (() => void) | null = null

// Note: Do not convert API keys. Frontend consumes backend-provided shape.

export const useAuthStore = defineStore('auth', () => {
  const { data, status, getSession } = useAuth()
  
  // Initialize from session data if available (use raw API shape)
  const initialUser = data.value?.user || null
  const user: Ref<User | null> = ref(initialUser)
  const role: Ref<string | null> = ref(initialUser?.role || null)
  const guestPlayed = ref(false)
  const api = useApi()
  const router = useRouter()
  const isFetchingUser = ref(false)
  // Deduplicate concurrent fetchUser calls
  let _fetchUserPromise: Promise<any> | null = null

  // Watch for session changes and always validate against the authoritative API (/api/me)
  // Treat `auth.data` as provisional; promote into the store only after `/api/me` succeeds.
  watch([data, status], ([newData, newStatus]) => {
    if (newStatus === 'authenticated') {
      // Always validate the session with a fresh API fetch before trusting session data
      // Do not rely on `data.value.user` as the source of truth.
      // Use non-forced fetch so concurrent calls are deduplicated by
      // the internal `_fetchUserPromise` guard. Passing `true` bypasses
      // that guard and allowed multiple concurrent requests when
      // session status toggled rapidly.
      fetchUser().catch(() => {})
    } else if (newStatus === 'unauthenticated') {
      user.value = null
      role.value = null
    }
  }, { immediate: true })

  async function register(payload: Record<string, any>) {
    try {
      const roleStr = payload?.role ?? ''
      let endpoint = '/api/register'
      if (roleStr === 'quizee') endpoint = '/api/register/quizee'
      else if (roleStr === 'quiz-master' || roleStr === 'quiz_master') endpoint = '/api/register/quiz-master'
      else if (roleStr === 'institution-manager') endpoint = '/api/register/institution-manager'

      // Use stateful POST so CSRF cookie and session are established by the backend
      // The backend registers the user and sets the session cookie when 'web' middleware is used
      const res = await api.postJson(endpoint, payload)
      
      // Parse response body once
      let responseData: any = null
      try {
        responseData = await res.json()
      } catch (e) {
        // If we can't parse JSON, try to get text
        try { 
          const txt = await res.text()
          if (txt) responseData = { message: txt }
        } catch (e) { }
      }
      
      if (!res.ok) {
        let message = 'Registration failed'
        let parsedErrors: any = null
        
        if (responseData && responseData.message) message = responseData.message
        else if (responseData && responseData.errors) {
          parsedErrors = responseData.errors
          const vals = Object.values(responseData.errors).flat()
          if (vals.length) message = vals.join('; ')
        }
        
        const err = new Error(message)
        try { ; (err as any).fields = parsedErrors } catch (e) { }
        throw err
      }

      // After successful registration, the backend has:
      // 1. Established a Laravel session (Auth::login() called)
      // 2. Created a personal access token ('nuxt-auth')
      // 3. Returned the user data + token in the response
      
      // Directly update the auth store with the user data from registration response
      // This immediately populates the store without waiting for additional API calls
      if (responseData && responseData.user) {
        setUser(responseData.user)
      }
      
      // Fetch fresh user data to ensure we have the latest from the API
      // This also syncs the Nuxt-Auth session if needed
      try {
        // Wait a moment for the session to be fully established
        await new Promise(resolve => setTimeout(resolve, 300))
        await fetchUser()
      } catch (e) {
        // User fetch might fail if not synced yet, but we have the data from registration response
      }

      return { ok: true }
    } catch (error) {
      throw error
    }
  }

  async function login(email: string, password: string, remember: boolean = false) {
    // Shim for any code that might still call this directly
    const { signIn } = useAuth()
    return signIn('credentials', { email, password, redirect: false })
  }

  async function logout() {
    // CRITICAL: Clear local state FIRST before calling signOut
    // This prevents the session watcher from seeing the old user briefly
    clear()
    
    try {
      // useAuth is auto-imported by @sidebase/nuxt-auth
      const auth = useAuth()
      if (auth && typeof auth.signOut === 'function') {
        // Use client-side redirect so router state is consistent and so
        // we avoid a full page reload when possible. Ask the server not to
        // perform a redirect by passing redirect: false, then navigate.
        // IMPORTANT: This invalidates the session on the server side
        await auth.signOut({ redirect: false })
        try { await router.push('/') } catch (e) { window.location.href = '/' }
      } else {
        // Fallback: just redirect to homepage
        try { await router.push('/') } catch (e) { window.location.href = '/' }
      }
    } catch (e) {
      // Fallback: just redirect to homepage
      try { await router.push('/') } catch (err) { window.location.href = '/' }
    }
  }

  async function fetchUser(force = false) {
    // Always fetch fresh data to ensure we have latest from database
    // The force parameter is kept for API compatibility but we now always fetch
    
    // Avoid concurrent fetches: return the in-flight promise if present
    if (_fetchUserPromise && !force) return _fetchUserPromise
    isFetchingUser.value = true

    _fetchUserPromise = (async () => {
      try {
        // Store current user ID before fetching to detect mid-flight user switches
        const userIdBeforeFetch = user.value?.id
        
        // First, refresh the session to sync with latest server state
        // This ensures nuxt-auth's session data is up-to-date
        try {
          await getSession()
        } catch (e) {
          // Session refresh might fail, but we can still fetch from /api/me
        }
        
        // Always fetch fresh user data from the API
        const res = await api.get('/api/me')
        if (res.status === 401) {
          // If API says unauthenticated but nuxt-auth says authenticated, something is out of sync
          if (status.value === 'authenticated') {
             const { signOut } = useAuth()
             signOut({ redirect: false }).catch(() => {})
          }
          clear()
          return null
        }
        if (res.status === 419 || res.status === 403) {
          // CSRF or Forbidden - don't force logout, just return null for now
          return null
        }
        if (!res.ok) return
        
        const json = await res.json().catch(() => null)
        const userData = json && (json.user || json.data || json)
        
        if (userData) {
          // If user switched during the fetch, retry once to ensure we get the authoritative user
          const userIdAfterFetch = userData.id
          if (userIdBeforeFetch && userIdBeforeFetch !== userIdAfterFetch) {
            _fetchUserPromise = null
            return fetchUser(true)
          }

          // Safe to update user data from authoritative API
          setUser(userData)
        }
        return user.value
      } catch (error) {
        // fetch error silently
        return null
      } finally {
        _fetchUserPromise = null
        isFetchingUser.value = false
      }
    })()

    return _fetchUserPromise
  }

  function setUser(newUser: any): void {
    if (!newUser || typeof newUser !== 'object' || !newUser.id) return
    // Use the API-provided object shape as-is
    user.value = newUser
    role.value = newUser.role

    // Sync guest results if needed
    if (typeof window !== 'undefined' && import.meta.client) {
       syncGuestQuizResults().catch(() => {})
    }
  }

  const userAvatar = computed(() => {
    const u = user.value as any
    if (!u) return null
    return u.image || u.avatar || u.avatarUrl || u.avatar_url || u.photo || null
  })

  function clear(): void {
    user.value = null
    role.value = null
  }

  // Cross-tab sync is now mostly handled by nuxt-auth, but we keep the guestPlayed sync
  if (typeof window !== 'undefined' && import.meta && import.meta.client) {
    _auth_storage_handler = (e) => {
      if (e.key === 'modeh:guest:played' && e.newValue === 'true') {
        guestPlayed.value = true
      }
    }
    window.addEventListener('storage', _auth_storage_handler!)
    
    if (localStorage.getItem('modeh:guest:played') === 'true') {
      guestPlayed.value = true
    }
  }

  function setGuestPlayed() {
    guestPlayed.value = true
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('modeh:guest:played', 'true') } catch (e) { }
    }
  }

  async function syncGuestQuizResults() {
    if (typeof window === 'undefined' || !import.meta.client) return

    try {
      const guestQuizStore = useGuestQuizStore()
      guestQuizStore.initializeStore()

      const guestResults = guestQuizStore.getAllResults()
      if (!guestResults || guestResults.length === 0) return

      // Guest results available for potential syncing with backend

      // In a full implementation, you would:
      // 1. Call POST /api/quizzes/sync-guest-attempts with the results
      // 2. Backend would create QuizAttempt records for the user
      // 3. Clear the guest store after successful sync

      // For now, results remain in localStorage and can be accessed by the user
    } catch (error) {
      // sync error silently
    }
  }

  return { user, role, guestPlayed, setGuestPlayed, logout, fetchUser, setUser, clear, syncGuestQuizResults, isFetchingUser, register, userAvatar }
})

