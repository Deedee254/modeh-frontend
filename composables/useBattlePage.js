import { ref, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'

/**
 * Composable for managing the state and logic of the battles page.
 */
export function useBattlePage() {
  const cfg = useRuntimeConfig()
  const auth = useAuthStore()

  // --- State ---
  const battles = ref([])
  const loading = ref(true)
  const battleHistory = ref([])
  const historyLoading = ref(false)
  const activeTab = ref('join')

  const tabs = [
    { name: 'join', label: 'Join Battle' },
    { name: 'history', label: 'My Battles' }
  ]

  // --- Data Fetching ---
  async function fetchActiveBattles() {
    loading.value = true
    try {
      const res = await $fetch('/api/battles', { baseURL: cfg.public.apiBase, credentials: 'include' })
      battles.value = res.battles || res || []
    } catch (e) {
      console.error("Failed to fetch active battles", e)
      battles.value = [] // Ensure it's an array on failure
    } finally {
      loading.value = false
    }
  }

  async function fetchMyBattles() {
    if (!auth.user) return
    historyLoading.value = true
    try {
      const res = await $fetch('/api/me/battles', { baseURL: cfg.public.apiBase, credentials: 'include' })
      battleHistory.value = res.data || res || []
    } catch (e) {
      console.error("Failed to fetch battle history", e)
      battleHistory.value = [] // Ensure it's an array on failure
    } finally {
      historyLoading.value = false
    }
  }

  // --- Lifecycle & Watchers ---
  watch(activeTab, (newTab) => {
    if (newTab === 'join' && battles.value.length === 0) fetchActiveBattles()
    if (newTab === 'history' && battleHistory.value.length === 0) fetchMyBattles()
  })

  watch(() => auth.user, (newUser) => { if (newUser && battleHistory.value.length === 0) fetchMyBattles() })

  return { battles, loading, battleHistory, historyLoading, activeTab, tabs, fetchActiveBattles, fetchMyBattles }
}