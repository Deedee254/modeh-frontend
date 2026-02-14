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
    const mySubscription = ref<any>(null)
    const institutionSubscriptions = ref<any[]>([])
    const loading = ref(false)
    const api = useApi()

    async function fetchPackages() {
        // Cache packages if already loaded
        if (packages.value.length > 0) return
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

    async function fetchMySubscription(force = false) {
        if (mySubscription.value && !force) return mySubscription.value
        try {
            const res = await api.get('/api/subscriptions/mine')
            if (res.status === 401 || res.status === 419) {
                mySubscription.value = null
                institutionSubscriptions.value = []
                return null
            }
            const data = await res.json().catch(() => null)
            mySubscription.value = data?.subscription || data?.data?.subscription || null
            institutionSubscriptions.value = data?.institution_subscriptions || data?.data?.institution_subscriptions || []
            return { subscription: mySubscription.value, institution_subscriptions: institutionSubscriptions.value }
        } catch (e) {
            mySubscription.value = null
            institutionSubscriptions.value = []
            return null
        }
    }

    async function subscribeToPackage(pkg: Package, opts: Record<string, any> = {}) {
        // expects server route POST /api/packages/{package}/subscribe
        const res = await api.postJson(`/api/packages/${pkg.id}/subscribe`, opts)
        if (!res.ok) {
            let message = 'Failed to subscribe to package'
            try {
                const err = await res.json()
                message = err?.message || err?.error || message
            } catch (e) {
                try {
                    const txt = await res.text()
                    if (txt) message = txt
                } catch (e2) {}
            }
            throw new Error(message)
        }
        const data = await res.json().catch(() => ({}))
        // Refresh subscription after success
        await fetchMySubscription(true)
        return data
    }

    return { 
        packages, 
        mySubscription, 
        institutionSubscriptions,
        loading, 
        fetchPackages, 
        fetchMySubscription, 
        subscribeToPackage 
    }
})
