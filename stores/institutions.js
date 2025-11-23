import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import useApi from '~/composables/useApi'

export const useInstitutionsStore = defineStore('institutions', () => {
  const institution = ref(null)
  const members = ref([])
  const requests = ref([])
  const loading = ref(false)
  const api = useApi()

  // Keep track of the active institution slug (we prefer slugs for routing) for synchronization with the route
  const STORAGE_KEY = 'modeh.activeInstitutionSlug'
  const initialSlug = (typeof window !== 'undefined') ? (localStorage.getItem(STORAGE_KEY) || null) : null
  const activeInstitutionSlug = ref(initialSlug)

  // Persist any changes to the active slug to localStorage so selection survives reloads
  try {
    if (typeof window !== 'undefined') {
      watch(activeInstitutionSlug, (val) => {
        try {
          if (val) localStorage.setItem(STORAGE_KEY, String(val))
          else localStorage.removeItem(STORAGE_KEY)
        } catch (e) {}
      }, { immediate: false })
    }
  } catch (e) {}

  async function fetchInstitution(id) {
    loading.value = true
    try {
      const res = await api.get(`/api/institutions/${id}`)
      if (!res.ok) throw new Error('Failed to fetch institution')
      institution.value = await res.json()
      // prefer slug for route/query synchronization
      activeInstitutionSlug.value = institution.value?.slug ?? institution.value?.id ?? null
      try {
        if (typeof window !== 'undefined') {
          if (activeInstitutionSlug.value) localStorage.setItem(STORAGE_KEY, String(activeInstitutionSlug.value))
          else localStorage.removeItem(STORAGE_KEY)
        }
      } catch (e) {}
    } catch (e) {
      institution.value = null
    } finally { loading.value = false }
  }

  // Set active institution by id (id may be null to clear)
  async function setActiveInstitution(id) {
    if (!id) {
      institution.value = null
      activeInstitutionSlug.value = null
      try { if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY) } catch (e) {}
      return
    }
    // If the id is already loaded, do nothing
    if (institution.value && String(institution.value.slug) === String(id)) {
      activeInstitutionSlug.value = institution.value.slug
      try { if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, String(activeInstitutionSlug.value)) } catch (e) {}
      return
    }
    // otherwise fetch the institution
    await fetchInstitution(id).catch(() => {})
  }

  async function fetchMembers(id) {
    loading.value = true
    try {
      const res = await api.get(`/api/institutions/${id}/members`)
      if (!res.ok) {
        members.value = []
        return
      }
      const json = await res.json()
      members.value = json.members || []
    } catch (e) {
      members.value = []
    } finally { loading.value = false }
  }

  async function fetchRequests(id) {
    loading.value = true
    try {
      const res = await api.get(`/api/institutions/${id}/requests`)
      if (!res.ok) { requests.value = []; return }
      const json = await res.json()
      requests.value = json.requests || []
    } catch (e) {
      requests.value = []
    } finally { loading.value = false }
  }

  async function acceptMember(institutionId, userId) {
    const res = await api.postJson(`/api/institutions/${institutionId}/members/accept`, { user_id: userId })
    if (!res.ok) throw new Error('Failed to accept member')
    return await res.json()
  }

  async function removeMember(institutionId, userId) {
    const res = await api.del(`/api/institutions/${institutionId}/members/${userId}`)
    if (!res.ok) throw new Error('Failed to remove member')
    return await res.json()
  }

  return { institution, members, requests, loading, activeInstitutionSlug, fetchInstitution, fetchMembers, fetchRequests, acceptMember, removeMember, setActiveInstitution }
})
