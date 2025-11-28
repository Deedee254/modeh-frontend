import { ref } from 'vue'

const subscription = ref(null)
let loaded = false

export async function fetchSubscription(cfg) {
  try {
    const s = await $fetch(cfg.public.apiBase + '/api/subscriptions/mine', { credentials: 'include' })
    subscription.value = s?.subscription || s?.data?.subscription || s || null
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

