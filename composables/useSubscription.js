import { ref } from 'vue'
import useApi from '~/composables/useApi'

const subscription = ref(null)
let loaded = false

export async function fetchSubscription(cfg) {
  const api = useApi()
  try {
    const res = await api.get('/api/subscriptions/mine')
    if (api.handleAuthStatus(res)) {
      subscription.value = null
      return null
    }
    if (res.ok) {
      const data = await res.json()
      subscription.value = data?.subscription || data?.data?.subscription || data || null
    } else {
      subscription.value = null
    }
  } catch (e) {
    subscription.value = null
  }
  loaded = true
  return subscription.value
}

export function useSubscription() {
  return {
    subscription,
    fetchSubscription: fetchSubscription,
    loaded: () => loaded
  }
}

