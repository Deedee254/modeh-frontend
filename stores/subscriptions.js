import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useApi } from '~/composables/useApi'

export const useSubscriptionsStore = defineStore('subscriptions', () => {
  const packages = ref([])
  const loading = ref(false)
  const api = useApi()

  async function fetchPackages() {
    loading.value = true
    try {
      const res = await api.get('/api/packages')
      if (!res.ok) return
      const data = await res.json()
      packages.value = data?.packages || data?.data || []
    } catch (e) {
      packages.value = []
    } finally {
      loading.value = false
    }
  }

  async function subscribeToPackage(pkg, opts = {}) {
    // expects server route POST /api/packages/{package}/subscribe
    const res = await api.postJson(`/api/packages/${pkg.id}/subscribe`, opts)
    if (!res.ok) throw new Error('Failed to subscribe to package')
    return await res.json()
  }

  return { packages, loading, fetchPackages, subscribeToPackage }
})
