import { ref } from 'vue'
import useApi from '~/composables/useApi'

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
        try { const j = await res.json(); msg = j?.message || msg } catch {}
        throw new Error(msg)
      }
      return await res.json()
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
