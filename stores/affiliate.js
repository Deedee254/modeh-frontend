import { defineStore } from 'pinia'
import { useRuntimeConfig } from '#app'

export const useAffiliateStore = defineStore('affiliate', {
  state: () => ({
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
      const config = useRuntimeConfig()
      this.isLoading = true
      try {
        const response = await fetch(`${config.public.apiBase}/api/affiliates/stats`, {
          credentials: 'include'
        })
        const data = await response.json()
        this.stats = data
      } catch (err) {
        this.error = 'Failed to fetch affiliate statistics'
        console.error('Affiliate stats error:', err)
      } finally {
        this.isLoading = false
      }
    },

    async fetchReferrals() {
      const config = useRuntimeConfig()
      this.isLoading = true
      try {
        const response = await fetch(`${config.public.apiBase}/api/affiliates/referrals`, {
          credentials: 'include'
        })
        const data = await response.json()
        this.referrals = data
      } catch (err) {
        this.error = 'Failed to fetch referrals'
        console.error('Referrals fetch error:', err)
      } finally {
        this.isLoading = false
      }
    },

    async requestPayout() {
      const config = useRuntimeConfig()
      this.isLoading = true
      try {
        const response = await fetch(`${config.public.apiBase}/api/affiliates/payout-request`, {
          method: 'POST',
          credentials: 'include'
        })
        const data = await response.json()
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