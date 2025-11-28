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
      // The backend seems to expect PATCH, but our useApi only has POST.
      // Since PATCH with FormData can be tricky, Laravel supports faking it.
      const payload = isForm ? body as FormData : new FormData()
      if (isForm) {
        payload.append('_method', 'PATCH')
      } else {
        Object.entries(body).forEach(([key, value]) => payload.append(key, value))
        payload.append('_method', 'PATCH')
      }

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
    // This can be a simple wrapper around postJson now.
    // We'll let the caller handle loading/error state for more flexibility.
    const res = await api.postJson('/api/me/password', payload)
    if (!res.ok) throw new Error('Failed to change password')
    return true
  }

  return { loading, error, patchMe, changePassword }
}
