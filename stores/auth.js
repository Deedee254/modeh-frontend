import { defineStore } from 'pinia'
import { ref } from 'vue'
import useApi from '~/composables/useApi'
import { useInstitutionsStore } from '~/stores/institutions'

let notificationsModule = null
if (typeof window !== 'undefined' && import.meta && import.meta.client) {
  import('~/stores/notifications').then(m => (notificationsModule = m))
}

let _auth_storage_handler = null
let _auth_beforeunload = null

// Helper: Convert snake_case keys to camelCase for backward compatibility
function convertToCamelCase(obj) {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(convertToCamelCase)

  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    // Convert snake_case to camelCase: quizee_profile -> quizeeProfile, quiz_master_profile -> quizMasterProfile
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    result[camelKey] = convertToCamelCase(value)
  }
  return result
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const role = ref(null)
  const api = useApi()

  async function login(email, password, remember = false) {
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
          try { const txt = await res.text(); if (txt) message = txt } catch (e) {}
        }
        throw new Error(message)
      }
      const json = await res.json()
      const returnedUser = json && (json.user || json.data || json)
      if (returnedUser) setUser(returnedUser)
      try { if (typeof window !== 'undefined') window.__modeh_auth_redirected = false } catch (e) {}
      if (typeof window !== 'undefined' && import.meta && import.meta.client) {
        try { const notif = notificationsModule && notificationsModule.useNotificationsStore && notificationsModule.useNotificationsStore(); if (notif && notif.attachEchoListeners) notif.attachEchoListeners() } catch (e) {}
        try { localStorage.setItem('modeh:auth:event', JSON.stringify({ type: 'login', ts: Date.now() })) } catch (e) {}
        try { const nuxtApp = useNuxtApp(); if (nuxtApp && typeof nuxtApp.$processPostLoginIntent === 'function') { try { nuxtApp.$processPostLoginIntent().catch(() => {}) } catch (err) {} } } catch (e) {}
      }
      return { data: json, ok: true }
    } catch (error) {
      throw error
    }
  }

  async function logout() {
    clear()
    // Clear cached CSRF and session state
    if (typeof api.clearAuthCache === 'function') {
      api.clearAuthCache()
    }
    if (typeof window !== 'undefined' && import.meta && import.meta.client) {
      try { localStorage.setItem('modeh:auth:event', JSON.stringify({ type: 'logout', ts: Date.now() })) } catch (e) {}
    }
    try { await api.postJson('/api/logout', {}) } catch (error) {}
  }

  async function fetchUser() {
    try {
      const res = await api.get('/api/me')
      if (!res.ok) throw new Error('Failed to fetch user')
      setUser(await res.json())
      if (typeof window !== 'undefined' && import.meta && import.meta.client) {
        try { const notif = notificationsModule && notificationsModule.useNotificationsStore && notificationsModule.useNotificationsStore(); if (notif && notif.attachEchoListeners) notif.attachEchoListeners() } catch (e) {}
        try { const nuxtApp = useNuxtApp(); if (nuxtApp && typeof nuxtApp.$processPostLoginIntent === 'function') { try { nuxtApp.$processPostLoginIntent().catch(() => {}) } catch (err) {} } } catch (e) {}
      }
    } catch (error) {
      clear()
    }
  }

  function setUser(newUser) {
    // Normalize snake_case keys from backend to camelCase for frontend consistency
    if (newUser) {
      newUser = convertToCamelCase(newUser)
    }
    user.value = newUser
    role.value = newUser && newUser.role ? newUser.role : null
    try {
      if (typeof window !== 'undefined' && newUser) {
        const instStore = useInstitutionsStore()
        if (newUser.institutions && Array.isArray(newUser.institutions) && newUser.institutions.length) {
          instStore.institution.value = newUser.institutions[0]
        } else if (newUser.institution_id) {
          instStore.fetchInstitution(newUser.institution_id).catch(() => {})
        }
      }
    } catch (e) {}
    try {
      if (typeof window !== 'undefined' && newUser && newUser.is_profile_completed === false) {
        const skipped = (() => { try { return localStorage.getItem('modeh:onboarding:skipped') === '1' } catch (e) { return false } })()
        if (!skipped) {
          const router = useRouter()
          setTimeout(() => {
            try {
              const isSocial = Boolean(newUser.social_provider || newUser.social_id)
              if (isSocial) router.push('/onboarding')
              else router.push('/complete-profile')
            } catch (e) {}
          }, 50)
        }
      }
    } catch (e) {}
  }

  function clear() {
    user.value = null
    role.value = null
  }

  // Cross-tab auth sync: listen for storage events to handle token changes or explicit auth events
  if (typeof window !== 'undefined' && import.meta && import.meta.client) {
    if (!_auth_storage_handler) {
      _auth_storage_handler = (e) => {
        try {
          if (e.key === 'modeh:auth:event' && e.newValue) {
            const payload = JSON.parse(e.newValue)
            if (payload && payload.type === 'logout') clear()
            else if (payload && payload.type === 'login') fetchUser().catch(() => {})
            return
          }
        } catch (err) {}
      }
      window.addEventListener('storage', _auth_storage_handler)
      _auth_beforeunload = () => {
        try { window.removeEventListener('storage', _auth_storage_handler) } catch (e) {}
        try { window.removeEventListener('beforeunload', _auth_beforeunload) } catch (e) {}
      }
      window.addEventListener('beforeunload', _auth_beforeunload)
    }
  }

  return { user, role, login, logout, fetchUser, setUser, clear }
})
