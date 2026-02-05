import useApi from '~/composables/useApi'
import { useAuthStore } from '~/stores/auth'

export default function useMeApi() {
  const api = useApi()
  const auth = useAuthStore()

  async function post(body: any, path = '/api/me') {
    const res = await api.postJson(path, body)
    await syncIfUserPayload(res)
    return res
  }

  async function patch(body: any, path = '/api/me') {
    const res = await api.patchJson(path, body)
    await syncIfUserPayload(res)
    return res
  }

  async function get(path = '/api/me') {
    const res = await api.get(path)
    // If the response includes a user payload, sync it into the auth store
    await syncIfUserPayload(res)
    return res
  }

  async function syncIfUserPayload(res: Response) {
    if (!res || !res.ok) return
    try {
      const json = await res.clone().json().catch(() => null)
      const payload = json && (json.user || json.data || json)
      if (payload && typeof payload === 'object' && payload.id) {
        auth.setUser(payload)
      }
    } catch (e) {
      // ignore parsing errors
    }
  }

  return { get, post, patch }
}
