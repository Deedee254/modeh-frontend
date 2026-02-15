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
  // Cast to any first since nuxt-auth data shape may differ from User type
  const initialUser = (data.value?.user as any) || null
  const user: Ref<User | null> = ref(initialUser as User | null)
  const role: Ref<string | null> = ref((initialUser as any)?.role || null)
  const guestPlayed = ref(false)
  const api = useApi()
  const router = useRouter()
  const isFetchingUser = ref(false)
  // Deduplicate concurrent fetchUser calls
  let _fetchUserPromise: Promise<any> | null = null
  // Simple in-memory cache: avoid refetching /api/me too often
  const USER_CACHE_TTL = 30 * 1000 // 30 seconds
  let _lastUserFetchedAt = 0

  // No automatic watcher. Instead, fetchUser() is called explicitly:
  // - After successful login/register
  // - Via middleware on initial app load
  // - When components explicitly need fresh user data
  // This is more predictable and avoids cascading API calls.

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

      // Sync any guest quiz attempts to the user's account
      try {
        await syncGuestQuizResults()
      } catch (e) {
        console.warn('Failed to sync guest quiz results after registration:', e)
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

    // CRITICAL: Clear PWA persistent session storage
    // This ensures the user is fully logged out on all devices
    try {
      // Dynamic import the composable so it stays code-split.
      const { usePwaSession } = await import('~/composables/usePwaSession')
      const pwaSession = usePwaSession()
      await pwaSession.clearStoredSession()
    } catch (e) {
      // PWA session clear is non-fatal
      console.warn('[auth] PWA session clear failed:', e)
    }

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

  async function fetchUser(force = false): Promise<User | null> {
    // Use a short-lived in-memory cache to avoid flooding /api/me with frequent calls.
    // If `force` is true we bypass the cache and request fresh data.
    try {
      if (!force && Date.now() - _lastUserFetchedAt < USER_CACHE_TTL && user.value) {
        return user.value
      }
    } catch (e) { }

    // Prefer server session payload (nuxt-auth) when available and it contains
    // authoritative user fields. This lets the session act as the primary
    // source-of-truth and avoids unnecessary network requests to /api/me.
    try {
      const sessUser = (data && (data.value as any) && (data.value as any).user) ? (data.value as any).user : null
      const hasMeaningfulFields = sessUser && (sessUser.name || sessUser.email || sessUser.profile || sessUser.avatar_url)
      if (!force && hasMeaningfulFields) {
        try { setUser(sessUser) } catch (e) { }
        _lastUserFetchedAt = Date.now()
        return user.value
      }
    } catch (e) { }

    // Avoid concurrent fetches: return the in-flight promise if present
    if (_fetchUserPromise && !force) return _fetchUserPromise
    isFetchingUser.value = true

    _fetchUserPromise = (async (): Promise<User | null> => {
      try {
        // Store current user ID before fetching to detect mid-flight user switches
        const userIdBeforeFetch = user.value?.id

        // Fetch fresh user data from the authoritative API endpoint
        // This is called explicitly from middleware and after login/register, not automatically

        // Always fetch fresh user data from the API
        const res = await api.get('/api/me')
        if (res.status === 401) {
          // If API says unauthenticated but nuxt-auth says authenticated, something is out of sync
          if (status.value === 'authenticated') {
            const { signOut } = useAuth()
            signOut({ redirect: false }).catch(() => { })
          }
          clear()
          return user.value
        }
        if (res.status === 419 || res.status === 403) {
          // CSRF or Forbidden - don't force logout, just return null for now
          return user.value
        }
        if (!res.ok) return user.value

        const json = await res.json().catch(() => null)
        const userData = json && (json.user || json.data || json)

        if (userData) {
          // If user switched during the fetch, clear the promise guard to allow immediate retry
          const userIdAfterFetch = userData.id
          if (userIdBeforeFetch && userIdBeforeFetch !== userIdAfterFetch) {
            // Clear the promise guard BEFORE recursing to prevent deadlock
            _fetchUserPromise = null
            isFetchingUser.value = false
            // Force a fresh fetch without deduplication
            return fetchUser(true)
          }

          // Safe to update user data from authoritative API
          setUser(userData)
          _lastUserFetchedAt = Date.now()
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

    // Merge the incoming user fields into the existing user object instead of
    // replacing it. This prevents accidental client-side overwrites (for
    // example clearing the role) when components or responses include partial
    // user objects.
    const existing = (user.value as any) || {}
    user.value = { ...existing, ...newUser }

    // Only update the role if the incoming user payload includes a role.
    // This reduces the risk of client-driven role clobbers.
    if ((newUser as any).role !== undefined && (newUser as any).role !== null) {
      role.value = (newUser as any).role
    }

    // Sync guest results if needed
    if (typeof window !== 'undefined' && import.meta.client) {
      syncGuestQuizResults().catch(() => { })
    }
  }

  const userAvatar = computed(() => {
    const u = user.value as any
    if (!u) return null
    // Prioritize top-level fields (likely from OAuth or direct user object)
    // Add 'picture' which is common for Google OAuth in Auth.js
    const avatar = u.avatar_url || u.avatar || u.avatarUrl || u.image || u.picture || u.photo
    if (avatar) return avatar

    // Check nested profile fields (likely from Laravel API)
    const profile = u.profile
    if (profile) {
      return profile.avatar_url || profile.avatar || profile.image || profile.photo || null
    }

    return null
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

      // Sync each guest result to the backend as a QuizAttempt
      for (const result of guestResults) {
        try {
          const payload = {
            quiz_id: result.quiz_id,
            score: result.score,
            percentage: result.percentage,
            correct_count: result.correct_count,
            incorrect_count: result.incorrect_count,
            total_questions: result.total_questions,
            time_taken: result.time_taken,
            results: result.results || []
          }

          const res = await api.postJson('/api/quizzes/sync-guest-attempt', payload)

          // If sync successful, remove from guest store
          if (res.ok) {
            guestQuizStore.clearQuizResult(result.quiz_id)
          }
        } catch (e) {
          // Continue syncing other attempts even if one fails
          console.warn(`Failed to sync quiz attempt for quiz ${result.quiz_id}:`, e)
        }
      }
    } catch (error) {
      console.warn('Failed to sync guest quiz results:', error)
    }
  }

  return { user, role, guestPlayed, setGuestPlayed, logout, fetchUser, setUser, clear, syncGuestQuizResults, isFetchingUser, register, userAvatar }
})

