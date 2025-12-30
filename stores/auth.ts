import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'
import useApi from '~/composables/useApi'
import { useInstitutionsStore } from '~/stores/institutions'
import { useGuestQuizStore } from '~/composables/useGuestQuizStore'
import type { User } from '~/types'

let notificationsModule: any = null
if (typeof window !== 'undefined' && import.meta && import.meta.client) {
  import('~/stores/notifications').then(m => (notificationsModule = m))
}

let _auth_storage_handler: ((e: StorageEvent) => void) | null = null
let _auth_beforeunload: (() => void) | null = null

// Helper: Convert snake_case keys to camelCase for backward compatibility
function convertToCamelCase(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(convertToCamelCase)

  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    // Convert snake_case to camelCase: quizee_profile -> quizeeProfile, quiz_master_profile -> quizMasterProfile
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    result[camelKey] = convertToCamelCase(value)
  }
  return result
}

export const useAuthStore = defineStore('auth', () => {
  // Hydrate from localStorage immediately if available (fast load)
  const storedUser = (typeof window !== 'undefined' && localStorage.getItem('modeh:auth:user'))
    ? JSON.parse(localStorage.getItem('modeh:auth:user')!)
    : null

  const user: Ref<User | null> = ref(storedUser)
  const role: Ref<string | null> = ref(storedUser?.role || null)
  const guestPlayed = ref(false)
  const api = useApi()

  // Ensure role and user refs are synced if hydration happened
  if (storedUser && storedUser.role) {
    role.value = storedUser.role
  }

  async function login(email: string, password: string, remember: boolean = false) {
    const payload = { email, password, remember }
    try {
      const res = await api.postJson('/api/login', payload)
      if (!res.ok) {
        let message = 'Login failed'
        try {
          const errBody = await res.json()
          if (errBody && errBody.message) message = errBody.message
          else if (errBody && errBody.errors) {
            const vals = Object.values(errBody.errors).flat()
            if (vals.length) message = vals.join('; ')
          } else if (typeof errBody === 'string') message = errBody
        } catch (e) {
          try { const txt = await res.text(); if (txt) message = txt } catch (e) { }
        }
        throw new Error(message)
      }

      // Set initial user data from login response
      const json = await res.json()
      const returnedUser = json && (json.user || json.data || json)
      if (returnedUser) setUser(returnedUser)

      // CRITICAL: Fetch full user data from /api/me to get complete profile
      // This ensures we have name, email, role, and all profile data
      try {
        const meRes = await api.get('/api/me')
        if (meRes.ok) {
          const fullUser = await meRes.json()
          if (fullUser) setUser(fullUser)
        }
      } catch (fetchMeError) {
        // Log but don't throw—use the data from login response if /api/me fails
        console.warn('Failed to fetch full user data from /api/me', fetchMeError)
      }

      try { if (typeof window !== 'undefined') (window as any).__modeh_auth_redirected = false } catch (e) { }
      if (typeof window !== 'undefined' && import.meta && import.meta.client) {
        try { const notif = notificationsModule && notificationsModule.useNotificationsStore && notificationsModule.useNotificationsStore(); if (notif && notif.attachEchoListeners) notif.attachEchoListeners() } catch (e) { }
        try { localStorage.setItem('modeh:auth:event', JSON.stringify({ type: 'login', ts: Date.now() })) } catch (e) { }
        try { const nuxtApp = useNuxtApp(); if (nuxtApp && typeof nuxtApp.$processPostLoginIntent === 'function') { try { nuxtApp.$processPostLoginIntent().catch(() => { }) } catch (err) { } } } catch (e) { }

        // Sync guest quiz results to user account
        try {
          await syncGuestQuizResults()
        } catch (syncError) {
          console.warn('Failed to sync guest quiz results', syncError)
        }
      }
      return { data: json, ok: true }
    } catch (error) {
      throw error
    }
  }

  // Register a new user. Payload is expected to contain role and other fields
  // (name, email, password, level_id, grade_id, subjects, etc.). We pick an
  // endpoint based on role to match backend routes.
  async function register(payload: Record<string, any>) {
    try {
      const roleStr = payload?.role ?? ''
      let endpoint = '/api/register'
      if (roleStr === 'quizee') endpoint = '/api/register/quizee'
      else if (roleStr === 'quiz-master' || roleStr === 'quiz_master') endpoint = '/api/register/quiz-master'
      else if (roleStr === 'institution-manager') endpoint = '/api/register/institution-manager'

      const res = await api.postJson(endpoint, payload)
      if (!res.ok) {
        let message = 'Registration failed'
        let parsedErrors: any = null
        try {
          const errBody = await res.json()
          if (errBody && errBody.message) message = errBody.message
          else if (errBody && errBody.errors) {
            parsedErrors = errBody.errors
            const vals = Object.values(errBody.errors).flat()
            if (vals.length) message = vals.join('; ')
          } else if (typeof errBody === 'string') message = errBody
        } catch (e) {
          try { const txt = await res.text(); if (txt) message = txt } catch (e) { }
        }
        const err = new Error(message)
        try { ; (err as any).fields = parsedErrors } catch (e) { }
        throw err
      }

      const json = await res.json().catch(() => null)
      const returnedUser = json && (json.user || json.data || json)
      if (returnedUser) setUser(returnedUser)

      // Fetch full user data to ensure we have canonical profile
      try {
        const meRes = await api.get('/api/me')
        if (meRes.ok) {
          const fullUser = await meRes.json()
          if (fullUser) setUser(fullUser)
        }
      } catch (e) { }

      // Broadcast login event for cross-tab sync
      try { if (typeof window !== 'undefined') localStorage.setItem('modeh:auth:event', JSON.stringify({ type: 'login', ts: Date.now() })) } catch (e) { }

      // Sync any guest quiz results
      try { await syncGuestQuizResults() } catch (e) { console.warn('Failed to sync guest quiz results after register', e) }

      return { data: json, ok: true }
    } catch (error) {
      throw error
    }
  }

  async function logout() {
    // 1. Immediately clear local state to update UI synchronously
    // This prevents any "flash" of logged-in state if the user navigates away or reloads immediately
    clear()

    if (typeof window !== 'undefined' && import.meta && import.meta.client) {
      try { localStorage.setItem('modeh:auth:event', JSON.stringify({ type: 'logout', ts: Date.now() })) } catch (e) { }
    }

    // 2. Call backend logout to invalidate session
    try {
      await api.postJson('/api/logout', {})
    } catch (error) {
      // Log but continue
      console.error('Logout API call failed', error)
    }

    // 3. Clear storage again just to be safe (in case clear() missed something or hydration re-populated)
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('modeh:auth:user')
        localStorage.removeItem('modeh:auth:token')
        sessionStorage.removeItem('modeh:auth:user')
        sessionStorage.removeItem('modeh:auth:token')
      } catch (e) { }
    }

    // Clear any persisted auth-related data from localStorage/sessionStorage
    if (typeof window !== 'undefined') {
      try {
        // Clear auth-related localStorage entries (but preserve postLoginIntent for after next login)
        localStorage.removeItem('modeh:auth:user')
        localStorage.removeItem('modeh:auth:token')
        // Clear any session storage
        sessionStorage.removeItem('modeh:auth:user')
        sessionStorage.removeItem('modeh:auth:token')
      } catch (e) {
        // ignore storage clearing errors
      }
    }

    // CRITICAL: Force a fresh CSRF token fetch for the next login
    // We must do this AFTER clear() so the store doesn't have stale user data
    // This happens synchronously before any UI redirects
    try {
      if (typeof api.clearAuthCache === 'function') {
        // Reset the CSRF cache to force a fresh fetch (sets _csrfFetchedAt = 0)
        api.clearAuthCache()
      }
      if (typeof api.ensureCsrf === 'function') {
        // This will fetch a fresh CSRF token since _csrfFetchedAt = 0
        await api.ensureCsrf()
      }
    } catch (error) {
      // If CSRF refresh fails, log but don't throw—user can still access login page
      console.warn('Failed to refresh CSRF after logout', error)
    }
  }

  async function fetchUser() {
    try {
      const res = await api.get('/api/me')
      if (res.status === 401 || res.status === 419 || res.status === 403) {
        clear()
        return
      }
      if (!res.ok) {
        // Log error but don't clear session yet — could be a temporary server/network issue
        console.warn('Non-auth error fetching user:', res.status)
        return
      }
      const json = await res.json().catch(() => null)
      const userData = json && (json.user || json.data || json)
      if (userData) setUser(userData)

      if (typeof window !== 'undefined' && import.meta && import.meta.client) {
        try { const notif = notificationsModule && notificationsModule.useNotificationsStore && notificationsModule.useNotificationsStore(); if (notif && notif.attachEchoListeners) notif.attachEchoListeners() } catch (e) { }
        try { const nuxtApp = useNuxtApp(); if (nuxtApp && typeof nuxtApp.$processPostLoginIntent === 'function') { try { nuxtApp.$processPostLoginIntent().catch(() => { }) } catch (err) { } } } catch (e) { }
      }
    } catch (error) {
      // Network error or fetch failed — do NOT clear session, as it might just be offline/glitch
      console.warn('Failed to fetch user (network/other error):', error)
    }
  }

  function setUser(newUser: any): void {
    // Normalize snake_case keys from backend to camelCase for frontend consistency
    if (newUser) {
      newUser = convertToCamelCase(newUser)
    }

    // CRITICAL: Prevent setting empty or invalid user objects
    // This fixes the "You are signed in as User (user)" issue where an empty object was being stored
    if (!newUser || typeof newUser !== 'object' || !newUser.id) {
      return
    }

    user.value = newUser
    // Persist to localStorage for fast rehydration
    if (typeof window !== 'undefined' && newUser) {
      try { localStorage.setItem('modeh:auth:user', JSON.stringify(newUser)) } catch (e) { }
    }

    // Ensure role is accessible as a property on user for useUserRole composable
    if (newUser && newUser.role) {
      role.value = newUser.role
    } else {
      role.value = null
    }
    try {
      if (typeof window !== 'undefined' && newUser) {
        const instStore = useInstitutionsStore()
        if (newUser.institutions && Array.isArray(newUser.institutions) && newUser.institutions.length) {
          (instStore.institution as any) = newUser.institutions[0]
        } else if (newUser.institution_id) {
          instStore.fetchInstitution(newUser.institution_id).catch(() => { })
        }
      }
    } catch (e) { }
    try {
      if (typeof window !== 'undefined' && newUser && newUser.isProfileCompleted === false) {
        const skipped = (() => { try { return localStorage.getItem('modeh:onboarding:skipped') === '1' } catch (e) { return false } })()
        if (!skipped) {
          const router = useRouter()
          setTimeout(() => {
            try {
              const isSocial = Boolean(newUser.socialProvider || newUser.socialId)
              if (isSocial) router.push('/onboarding')
              else router.push('/complete-profile')
            } catch (e) { }
          }, 50)
        }
      }
    } catch (e) { }
  }

  function clear(): void {
    user.value = null
    role.value = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('modeh:auth:user')
    }
  }

  // Cross-tab auth sync: listen for storage events to handle token changes or explicit auth events
  if (typeof window !== 'undefined' && import.meta && import.meta.client) {
    if (!_auth_storage_handler) {
      _auth_storage_handler = (e) => {
        try {
          if (e.key === 'modeh:auth:event' && e.newValue) {
            const payload = JSON.parse(e.newValue)
            if (payload && payload.type === 'logout') clear()
            else if (payload && payload.type === 'login') fetchUser().catch(() => { })
            else if (payload && payload.type === 'guest_played') guestPlayed.value = true
            return
          }
        } catch (err) { }
      }
      window.addEventListener('storage', _auth_storage_handler!)
      _auth_beforeunload = () => {
        try { window.removeEventListener('storage', _auth_storage_handler!) } catch (e) { }
        try { window.removeEventListener('beforeunload', _auth_beforeunload!) } catch (e) { }
      }
      window.addEventListener('beforeunload', _auth_beforeunload!)
    }

    // Initialize guestPlayed
    try {
      if (localStorage.getItem('modeh:guest:played') === 'true') {
        guestPlayed.value = true
      }
    } catch (e) { }
  }

  function setGuestPlayed() {
    guestPlayed.value = true
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('modeh:guest:played', 'true')
        localStorage.setItem('modeh:auth:event', JSON.stringify({ type: 'guest_played', ts: Date.now() }))
      } catch (e) { }
    }
  }

  async function syncGuestQuizResults() {
    if (typeof window === 'undefined' || !import.meta.client) return

    try {
      const guestQuizStore = useGuestQuizStore()
      guestQuizStore.initializeStore()

      const guestResults = guestQuizStore.getAllResults()
      if (!guestResults || guestResults.length === 0) return

      // For now, we're just transferring the data to localStorage
      // The actual backend sync would happen via an endpoint
      // that creates QuizAttempt records for the authenticated user
      console.log('Guest quiz results available for sync:', guestResults)

      // In a full implementation, you would:
      // 1. Call POST /api/quizzes/sync-guest-attempts with the results
      // 2. Backend would create QuizAttempt records for the user
      // 3. Clear the guest store after successful sync

      // For now, results remain in localStorage and can be accessed by the user
    } catch (error) {
      console.error('Error syncing guest quiz results:', error)
    }
  }

  return { user, role, guestPlayed, setGuestPlayed, login, register, logout, fetchUser, setUser, clear, syncGuestQuizResults }
})

