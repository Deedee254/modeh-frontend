<template>
  <PageHero
    title="Invite History"
    description="View accepted invitations and member join history"
    theme="blue"
  />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

    <div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
      <div class="p-6 sm:p-8 border-b border-gray-200 dark:border-slate-700">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Accepted Invitations</h2>
      </div>
      <div class="p-6 sm:p-8">
        <div v-if="loading" class="text-center text-gray-500 dark:text-gray-400">Loading accepted invites...</div>
        <div v-else>
          <div v-if="rows.length === 0" class="text-center text-gray-500 dark:text-gray-400">No accepted invites found.</div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
                  <th class="px-4 py-3 font-semibold">Invited Email</th>
                  <th class="px-4 py-3 font-semibold">Role</th>
                  <th class="px-4 py-3 font-semibold">Invited by</th>
                  <th class="px-4 py-3 font-semibold">Accepted by</th>
                  <th class="px-4 py-3 font-semibold">Accepted at</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in rows" :key="r.id" class="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td class="px-4 py-3 text-gray-900 dark:text-gray-100">{{ r.invited_email }}</td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-400">
                    <span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs font-medium">
                      {{ r.role }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ r.invited_by_name || '-' }}</td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ r.accepted_by_name || r.accepted_by_email || '-' }}</td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{{ formatDate(r.accepted_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
definePageMeta({ layout: 'institution' })
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import useApi from '~/composables/useApi'
import PageHero from '~/components/institution/PageHero.vue'

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

