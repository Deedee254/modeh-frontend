<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-4">Invite history (Accepted invites)</h1>

    <div class="bg-white p-4 rounded shadow">
      <div v-if="loading" class="text-gray-500">Loading accepted invites...</div>
      <div v-else>
        <div v-if="rows.length === 0" class="text-sm text-gray-600">No accepted invites found.</div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="text-left text-gray-600 border-b">
              <th class="py-2">Invited Email</th>
              <th class="py-2">Role</th>
              <th class="py-2">Invited by</th>
              <th class="py-2">Accepted by</th>
              <th class="py-2">Accepted at</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id" class="border-b">
              <td class="py-2">{{ r.invited_email }}</td>
              <td class="py-2">{{ r.role }}</td>
              <td class="py-2">{{ r.invited_by_name || '-' }}</td>
              <td class="py-2">{{ r.accepted_by_name || r.accepted_by_email || '-' }}</td>
              <td class="py-2">{{ formatDate(r.accepted_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import useApi from '~/composables/useApi'

const route = useRoute()
const api = useApi()

const institutionId = route.query.institutionSlug || route.params.institution || null

const loading = ref(false)
const rows = ref([])

function formatDate(v) {
  if (!v) return '-' 
  try { return new Date(v).toLocaleString() } catch (e) { return v }
}

async function load() {
  if (!institutionId) return
  loading.value = true
  try {
    const res = await api.get(`/api/institutions/${encodeURIComponent(institutionId)}/members/invites/accepted`)
    if (api.handleAuthStatus(res)) return
    const data = await api.parseResponse(res)
    rows.value = data?.accepted || []
  } catch (e) {
    console.error('Failed to load accepted invites', e)
    rows.value = []
  } finally {
    loading.value = false
  }
}

if (institutionId) load()
</script>

<style scoped>
.btn { padding: .5rem 1rem; border-radius: .375rem; font-weight: 600 }
</style>
