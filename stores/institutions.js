import { defineStore } from 'pinia'
import { ref } from 'vue'
import useApi from '~/composables/useApi'

export const useInstitutionsStore = defineStore('institutions', () => {
  const institution = ref(null)
  const members = ref([])
  const requests = ref([])
  const loading = ref(false)
  const api = useApi()

  async function fetchInstitution(id) {
    loading.value = true
    try {
      const res = await api.get(`/api/institutions/${id}`)
      if (!res.ok) throw new Error('Failed to fetch institution')
      institution.value = await res.json()
    } catch (e) {
      institution.value = null
    } finally { loading.value = false }
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
    const res = await api.delete(`/api/institutions/${institutionId}/members/${userId}`)
    if (!res.ok) throw new Error('Failed to remove member')
    return await res.json()
  }

  return { institution, members, requests, loading, fetchInstitution, fetchMembers, fetchRequests, acceptMember, removeMember }
})
