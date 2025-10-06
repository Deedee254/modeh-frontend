import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSubscriptionsStore = defineStore('subscriptions', () => {
  const packages = ref([])
  const loading = ref(false)

  async function fetchPackages() {
    loading.value = true
    try {
      const res = await $fetch('/api/packages', { method: 'GET' })
      packages.value = res?.packages || []
    } catch (e) {
      packages.value = []
    } finally {
      loading.value = false
    }
  }

  async function subscribeToPackage(pkg, opts = {}) {
    // expects server route POST /api/packages/{package}/subscribe
    const res = await $fetch(`/api/packages/${pkg.id}/subscribe`, {
      method: 'POST',
      body: opts,
    })
    return res
  }

  return { packages, loading, fetchPackages, subscribeToPackage }
})
