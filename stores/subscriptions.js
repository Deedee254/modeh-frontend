import { defineStore } from 'pinia'
import { ref } from 'vue'
const config = useRuntimeConfig()

export const useSubscriptionsStore = defineStore('subscriptions', () => {
  const packages = ref([])
  const loading = ref(false)

  async function fetchPackages() {
    loading.value = true
    try {
      const res = await $fetch(config.public.apiBase + '/api/packages', { method: 'GET', credentials: 'include' })
        packages.value = res?.packages || res?.data || []
    } catch (e) {
      packages.value = []
    } finally {
      loading.value = false
    }
  }

  async function subscribeToPackage(pkg, opts = {}) {
    // expects server route POST /api/packages/{package}/subscribe
    const res = await $fetch(config.public.apiBase + `/api/packages/${pkg.id}/subscribe`, {
      method: 'POST',
      credentials: 'include',
      body: opts,
    })
    return res
  }

  return { packages, loading, fetchPackages, subscribeToPackage }
})
