import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useApi } from '~/composables/useApi'

interface Package {
    id: number
    name: string
    price: number
    description?: string
    duration_days: number
    [key: string]: any
}

export const useSubscriptionsStore = defineStore('subscriptions', () => {
    const packages = ref<Package[]>([])
    const loading = ref(false)
    const api = useApi()

    async function fetchPackages() {
        loading.value = true
        try {
            const res = await api.get('/api/packages')
            if (!res.ok) return
            const data = await res.json()
            packages.value = (data?.packages || data?.data || []) as Package[]
        } catch (e) {
            packages.value = []
        } finally {
            loading.value = false
        }
    }

    async function subscribeToPackage(pkg: Package, opts: Record<string, any> = {}) {
        // expects server route POST /api/packages/{package}/subscribe
        const res = await api.postJson(`/api/packages/${pkg.id}/subscribe`, opts)
        if (!res.ok) throw new Error('Failed to subscribe to package')
        return await res.json()
    }

    return { packages, loading, fetchPackages, subscribeToPackage }
})
