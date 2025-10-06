import { ref } from 'vue'
import { useRuntimeConfig } from '#imports'

export function useAccountApi() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function patchMe(body: FormData | Record<string, any>) {
    loading.value = true
    error.value = null
    try {
      const cfg = useRuntimeConfig()
      const isForm = typeof FormData !== 'undefined' && body instanceof FormData
      const res = await fetch(cfg.public.apiBase + '/api/me', {
        method: 'PATCH',
        credentials: 'include',
        body: isForm ? (body as FormData) : JSON.stringify(body),
        headers: isForm ? undefined : { 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        let msg = 'Update failed'
        try { const j = await res.json(); msg = j?.message || msg } catch {}
        throw new Error(msg)
      }
      return await res.json()
    } catch (e: any) {
      error.value = e?.message || 'Request failed'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function changePassword(payload: { current_password: string; password: string; password_confirmation: string }) {
    loading.value = true
    error.value = null
    try {
      const cfg = useRuntimeConfig()
      const res = await fetch(cfg.public.apiBase + '/api/me/password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        let msg = 'Failed to change password'
        try { const j = await res.json(); msg = j?.message || msg } catch {}
        throw new Error(msg)
      }
      return true
    } finally {
      loading.value = false
    }
  }

  return { loading, error, patchMe, changePassword }
}