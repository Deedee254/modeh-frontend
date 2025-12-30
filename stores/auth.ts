import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import useApi from '~/composables/useApi'
import { useInstitutionsStore } from '~/stores/institutions'
import { useGuestQuizStore } from '~/composables/useGuestQuizStore'
import type { User } from '~/types'
import { useAuth, signOut } from '#auth'

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
    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    result[camelKey] = convertToCamelCase(value)
  }
  return result
}

export const useAuthStore = defineStore('auth', () => {
  const { data, status, getSession } = useAuth()
  
  // Initialize from session data if available
  const initialUser = data.value?.user ? convertToCamelCase(data.value.user) : null
  const user: Ref<User | null> = ref(initialUser)
  const role: Ref<string | null> = ref(initialUser?.role || null)
  const guestPlayed = ref(false)
  const api = useApi()

  // Watch for session changes to update store state
  watch(data, (newData) => {
    if (newData?.user) {
      const normalizedUser = convertToCamelCase(newData.user)
      if (normalizedUser.id) {
        user.value = normalizedUser
        role.value = normalizedUser.role
      }
    } else if (status.value === 'unauthenticated') {
      user.value = null
      role.value = null
    }
  }, { immediate: true })

  async function login(email: string, password: string, remember: boolean = false) {
    // Legacy shim - components should use signIn('credentials', ...)
    const { signIn } = useAuth()
    return signIn('credentials', { email, password, redirect: false })
  }

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

      // After successful registration, log them in via credentials if possible or just fetch session
      await getSession()
      await fetchUser()

      return { ok: true }
    } catch (error) {
      throw error
    }
  }

  async function logout() {
    clear()
    await signOut({ callbackUrl: '/login' })
  }

  async function fetchUser() {
    try {
      const res = await api.get('/api/me')
      if (res.status === 401 || res.status === 419 || res.status === 403) {
        // If API says unauthorized but nuxt-auth says authorized, something is out of sync
        if (status.value === 'authenticated') {
           // We might want to signOut() here but let's just clear local state for now
        }
        clear()
        return
      }
      if (!res.ok) return
      
      const json = await res.json().catch(() => null)
      const userData = json && (json.user || json.data || json)
      if (userData) setUser(userData)
    } catch (error) {
      console.warn('Failed to fetch user:', error)
    }
  }

  function setUser(newUser: any): void {
    if (!newUser || typeof newUser !== 'object' || !newUser.id) return

    newUser = convertToCamelCase(newUser)
    user.value = newUser
    role.value = newUser.role

    // Sync guest results if needed
    if (typeof window !== 'undefined' && import.meta.client) {
       syncGuestQuizResults().catch(() => {})
    }
  }

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

