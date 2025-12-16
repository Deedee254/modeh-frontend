// ~/composables/useAffiliate.ts
import { ref, computed } from 'vue'
import useApi from './useApi'

interface AffiliateStats {
  totalEarned: number
  pendingPayouts: number
  activeReferrals: number
  conversionRate: number
  referralCode: string
}

interface AffiliateReferral {
  id: number
  user_name: string
  type: 'signup' | 'purchase'
  earnings: number
  status: string
  created_at: string
}

export default function useAffiliate() {
  const api = useApi()
  const stats = ref<AffiliateStats | null>(null)
  const referrals = ref<AffiliateReferral[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch current user's affiliate stats
   */
  async function fetchStats() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/api/affiliates/stats')
      if (api.handleAuthStatus(response)) return
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to fetch affiliate stats')
      }
      stats.value = data
    } catch (e: any) {
      error.value = e?.message || 'Failed to fetch affiliate stats'
      console.error('[useAffiliate] fetchStats error:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch list of referred users
   */
  async function fetchReferrals() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/api/affiliates/referrals')
      if (api.handleAuthStatus(response)) return
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to fetch referrals')
      }
      referrals.value = data
    } catch (e: any) {
      error.value = e?.message || 'Failed to fetch referrals'
      console.error('[useAffiliate] fetchReferrals error:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Generate affiliate code for current user
   */
  async function generateCode(): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const response = await api.postJson('/api/affiliates/generate-code', {})
      if (!response || typeof response !== 'object') {
        throw new Error('Failed to generate affiliate code')
      }
      
      const data = response as any
      
      // Refresh stats to get new code
      if (data.referral_code) {
        if (!stats.value) stats.value = {} as AffiliateStats
        stats.value.referralCode = data.referral_code
      }
      
      return true
    } catch (e: any) {
      error.value = e?.message || 'Failed to generate affiliate code'
      console.error('[useAffiliate] generateCode error:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Request payout
   */
  async function requestPayout(): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const response = await api.postJson('/api/affiliates/payout-request', {})
      if (!response || typeof response !== 'object') {
        throw new Error('Failed to request payout')
      }
      
      const data = response as any
      if (!data || data.error) {
        throw new Error(data?.message || 'Failed to request payout')
      }
      
      return true
    } catch (e: any) {
      error.value = e?.message || 'Failed to request payout'
      console.error('[useAffiliate] requestPayout error:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Get share link for affiliate code
   */
  function getShareLink(): string {
    if (!stats.value?.referralCode) {
      return ''
    }
    const baseUrl = window.location.origin
    return `${baseUrl}/?ref=${stats.value.referralCode}`
  }

  /**
   * Copy share link to clipboard
   */
  async function copyShareLink(): Promise<boolean> {
    try {
      const link = getShareLink()
      await navigator.clipboard.writeText(link)
      return true
    } catch (e) {
      console.error('[useAffiliate] copyShareLink error:', e)
      return false
    }
  }

  /**
   * Share via social media or other methods
   */
  function shareLink(platform: 'whatsapp' | 'twitter' | 'facebook' | 'email') {
    const link = getShareLink()
    const text = `Check out Modeh! Join my affiliate program and earn commissions. Use my code: ${stats.value?.referralCode}`

    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + link)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
      email: `mailto:?subject=Join Modeh Affiliate Program&body=${encodeURIComponent(text + '\n\n' + link)}`
    }

    const url = urls[platform]
    if (url) {
      if (platform === 'email') {
        window.location.href = url
      } else {
        window.open(url, '_blank')
      }
    }
  }

  return {
    stats,
    referrals,
    loading,
    error,
    fetchStats,
    fetchReferrals,
    generateCode,
    requestPayout,
    getShareLink,
    copyShareLink,
    shareLink
  }
}
