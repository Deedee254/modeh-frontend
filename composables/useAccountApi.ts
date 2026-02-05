import { ref } from 'vue'
import useApi from '~/composables/useApi'
import { useAuthStore } from '~/stores/auth'

export function useAccountApi() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const api = useApi()

  async function patchMe(body: FormData | Record<string, any>) {
    loading.value = true
    error.value = null
    try {
      const isForm = typeof FormData !== 'undefined' && body instanceof FormData
      
      // Convert to FormData if needed
      let payload = isForm ? body : new FormData()
      
      if (!isForm) {
        // Convert object to FormData
        Object.entries(body).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            payload.append(key, value)
          }
        })
      }
      
      // Add Laravel's _method=PATCH to support faking PATCH with POST
      payload.append('_method', 'PATCH')

      const res = await api.postFormData('/api/me', payload)

      if (!res.ok) {
        let msg = 'Update failed'
        let fieldErrors = null
        try { 
          // Clone response to avoid "body stream already read" error
          const clonedRes = res.clone()
          const j = await clonedRes.json()
          msg = j?.message || msg
          fieldErrors = j?.errors || null
        } catch (parseErr) {
          // If we can't parse error response, use generic message
          msg = `Update failed (${res.status})`
        }
        const error = new Error(msg) as any
        if (fieldErrors) error.fieldErrors = fieldErrors
        throw error
      }
      
      // Clone and parse JSON to be safe
      try {
        const clonedRes = res.clone()
        const parsed = await clonedRes.json()
        // If the server returned an updated user payload, sync it into
        // the central auth store so components relying on `useAuthStore`
        // see the updated values without needing an explicit fetch.
        try {
          const auth = useAuthStore()
          const payload = parsed && (parsed.user || parsed.data || parsed)
          if (payload && typeof payload === 'object' && payload.id) {
            auth.setUser(payload)
          }
        } catch (e) {
          // non-fatal if syncing fails
        }
        return parsed
      } catch (parseErr) {
        console.error('Failed to parse response JSON:', parseErr)
        throw new Error('Failed to parse server response')
      }
    } catch (e: any) {
      if (!api.handleAuthStatus(e.response)) {
        error.value = e?.data?.message || e?.message || 'Request failed'
      }
      throw e
    } finally {
      loading.value = false
    }
  }

  async function changePassword(payload: { current_password: string; password: string; password_confirmation: string }) {
    const res = await api.postJson('/api/me/password', payload)
    if (!res.ok) throw new Error('Failed to change password')
    return true
  }

  return { loading, error, patchMe, changePassword }
}
