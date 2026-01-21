import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useApi } from '~/composables/useApi'

export const useTournamentStore = defineStore('tournament', () => {
  const api = useApi()
  const currentTournament = ref<any>(null)
  const loading = ref(false)
  const tournamentsCache = ref<Record<string, any>>({})
  const registrationStatusCache = ref<Record<string, any>>({})
  const leaderboardCache = ref<Record<string, any>>({})
  const qualificationStatusCache = ref<Record<string, any>>({})

  async function fetchTournament(id: string | number, force = false) {
    if (tournamentsCache.value[id] && !force) {
      currentTournament.value = tournamentsCache.value[id]
      return currentTournament.value
    }

    loading.value = true
    try {
      const res = await api.get(`/api/tournaments/${id}`)
      if (res.ok) {
        const json = await res.json()
        const data = json?.tournament ?? json?.data ?? json
        tournamentsCache.value[id] = data
        currentTournament.value = data
        return data
      }
    } catch (e) {
      // fetch error silently
    } finally {
      loading.value = false
    }
    return null
  }

  async function fetchRegistrationStatus(id: string | number, force = false) {
    if (registrationStatusCache.value[id] && !force) {
      return registrationStatusCache.value[id]
    }

    try {
      const res = await api.get(`/api/tournaments/${id}/registration-status`)
      if (res.ok) {
        const json = await res.json()
        registrationStatusCache.value[id] = json
        return json
      }
    } catch (e) {
      // fetch error silently
    }
    return null
  }

  async function fetchLeaderboard(id: string | number, force = false) {
    if (leaderboardCache.value[id] && !force) {
      return leaderboardCache.value[id]
    }

    try {
      const res = await api.get(`/api/tournaments/${id}/leaderboard`)
      if (res.ok) {
        const json = await res.json()
        leaderboardCache.value[id] = json
        return json
      }
    } catch (e) {
      // fetch error silently
    }
    return null
  }

  async function fetchQualificationStatus(id: string | number, force = false) {
    if (qualificationStatusCache.value[id] && !force) {
      return qualificationStatusCache.value[id]
    }

    try {
      const res = await api.get(`/api/tournaments/${id}/qualification-status`)
      if (res.ok) {
        const json = await res.json()
        qualificationStatusCache.value[id] = json
        return json
      }
    } catch (e) {
      // fetch error silently
    }
    return null
  }

  function clearCache() {
    tournamentsCache.value = {}
    registrationStatusCache.value = {}
    leaderboardCache.value = {}
    qualificationStatusCache.value = {}
  }

  return {
    currentTournament,
    loading,
    fetchTournament,
    fetchRegistrationStatus,
    fetchLeaderboard,
    fetchQualificationStatus,
    clearCache
  }
})
