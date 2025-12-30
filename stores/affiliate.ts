import { defineStore } from 'pinia'
import useApi from '~/composables/useApi'

interface AffiliateStats {
    totalEarned: number
    pendingPayouts: number
    activeReferrals: number
    conversionRate: number
}

interface Referral {
    id: number
    user_id: number
    user_name?: string
    status: string
    created_at: string
    earnings: number
    [key: string]: any
}

interface AffiliateState {
    earnings: number
    referrals: Referral[]
    stats: AffiliateStats
    isLoading: boolean
    error: string | null
}

export const useAffiliateStore = defineStore('affiliate', {
    state: (): AffiliateState => ({
        earnings: 0,
        referrals: [],
        stats: {
            totalEarned: 0,
            pendingPayouts: 0,
            activeReferrals: 0,
            conversionRate: 0
        },
        isLoading: false,
        error: null
    }),

    actions: {
        async fetchAffiliateStats() {
            this.isLoading = true
            const api = useApi()
            try {
                const res = await api.get('/api/affiliates/stats')
                if (!res.ok) {
                    this.error = 'Failed to fetch affiliate statistics'
                    return
                }
                const data = await res.json()
                this.stats = data
            } catch (err) {
                this.error = 'Failed to fetch affiliate statistics'
                console.error('Affiliate stats error:', err)
            } finally {
                this.isLoading = false
            }
        },

        async fetchReferrals() {
            this.isLoading = true
            const api = useApi()
            try {
                const res = await api.get('/api/affiliates/referrals')
                if (!res.ok) {
                    this.error = 'Failed to fetch referrals'
                    return
                }
                const data = await res.json()
                this.referrals = data
            } catch (err) {
                this.error = 'Failed to fetch referrals'
                console.error('Referrals fetch error:', err)
            } finally {
                this.isLoading = false
            }
        },

        async requestPayout() {
            this.isLoading = true
            const api = useApi()
            try {
                const res = await api.postJson('/api/affiliates/payout-request', {})
                if (!res.ok) {
                    this.error = 'Failed to request payout'
                    throw new Error('Failed to request payout')
                }
                const data = await res.json()
                if (data.success) {
                    this.stats.pendingPayouts += this.stats.totalEarned - this.stats.pendingPayouts
                }
                return data
            } catch (err) {
                this.error = 'Failed to request payout'
                console.error('Payout request error:', err)
                throw err
            } finally {
                this.isLoading = false
            }
        }
    }
})
