<script setup lang="ts">
import { useRoute } from 'vue-router';
definePageMeta({ layout: 'institution' as any })
import { ref, watch } from 'vue';
import { ClientOnly } from '#components'
import { useApi } from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import ErrorAlert from '~/components/ui/ErrorAlert.vue'
import useTaxonomy from '~/composables/useTaxonomy'
import MemberList from '~/components/institution/MemberList.vue'
import PageHero from '~/components/institution/PageHero.vue'

const api = useApi()
const route = useRoute();
// Prefer route param slug (when using the nested route), fallback to query.institutionSlug
const institutionId = ref(route.params.slug || route.query.institutionSlug || null);

const members = ref([] as any[])
const membersMeta = ref({ total: 0, per_page: 8, current_page: 1, last_page: 1 })
const selectedLevel = ref(null as any)
const selectedGrade = ref(null as any)
const requests = ref([] as any[])
const requestsMeta = ref({ total: 0, per_page: 8, current_page: 1, last_page: 1 })
const loadingMembers = ref(false)
const loadingRequests = ref(false)
const errorMembers = ref(null as any)
const errorRequests = ref(null as any)
const appAlert = useAppAlert()
const { fetchLevels, fetchGrades, fetchGradesByLevel, levels, grades } = useTaxonomy()

async function loadMembers(page = 1) {
  if (!institutionId.value) return
  loadingMembers.value = true
  errorMembers.value = null
  try {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('per_page', String(membersMeta.value.per_page))
    // filter by role and taxonomy if provided
    params.set('role', 'quizee')
    if (selectedLevel.value) params.set('level_id', String(selectedLevel.value))
    if (selectedGrade.value) params.set('grade_id', String(selectedGrade.value))

  const resp = await api.get(`/api/institutions/${institutionId.value}/members?${params.toString()}`)
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    members.value = json?.members || []
    if (json?.meta) membersMeta.value = json.meta
  } catch (e: any) {
    errorMembers.value = e
  } finally {
    loadingMembers.value = false
  }
}

async function loadRequests(page = 1) {
  if (!institutionId.value) return
  loadingRequests.value = true
  errorRequests.value = null
  try {
  const resp = await api.get(`/api/institutions/${institutionId.value}/requests?page=${page}&per_page=${requestsMeta.value.per_page}`)
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    requests.value = json?.requests || []
    if (json?.meta) requestsMeta.value = json.meta
  } catch (e: any) {
    errorRequests.value = e
  } finally {
    loadingRequests.value = false
  }
}

function clearFilters() {
  selectedLevel.value = null
  selectedGrade.value = null
  void loadMembers(1)
}

async function accept(userId: number) {
  try {
  const resp = await api.postJson(`/api/institutions/${institutionId.value}/members/accept`, { user_id: userId })
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    if (resp.ok) {
      // optimistic update
      await loadMembers()
      await loadRequests()
      appAlert.push({ message: json?.message || 'Accepted', type: 'success' })
    } else {
      appAlert.push({ message: json?.message || 'Failed to accept', type: 'error' })
    }
  } catch (e: any) {
    appAlert.push({ message: 'Failed: ' + (e?.message ?? e), type: 'error' })
  }
}

// initial load when we have an institution slug
if (institutionId.value) {
  await Promise.all([loadMembers(), loadRequests(), fetchLevels(), fetchGrades()])
}

// react to route changes (params or query) and reload
watch(
  () => route.params.slug || route.query.institutionSlug,
  async (newVal, oldVal) => {
    institutionId.value = newVal || null
    if (institutionId.value) {
      await Promise.all([loadMembers(), loadRequests(), fetchLevels(), fetchGrades()])
    }
  }
)
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-slate-900">
    <!-- Page Hero -->
    <PageHero
      title="Quizees"
      description="Manage and view quizees in your institution"
      theme="emerald"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="!institutionId" class="p-4 bg-yellow-50 border rounded">
        <p class="text-sm">No institution selected. Add ?institutionSlug=SLUG to the URL.</p>
      </div>

      <ClientOnly>
      <div v-if="institutionId">
        <div class="mb-6">
          <h2 class="text-lg font-medium">Pending Requests</h2>
          <div class="mt-4">
            <LoadingSpinner v-if="loadingRequests" />
            <ErrorAlert v-else-if="errorRequests">Failed to load requests: {{ errorRequests.message || errorRequests }}</ErrorAlert>
            <div v-else>
              <ul class="mt-2 space-y-2">
                <li v-for="r in requests" :key="r.id" class="flex flex-col sm:flex-row items-start sm:items-center justify-between border p-2 rounded gap-2">
                  <div>
                    <div class="font-medium">{{ r.name }}</div>
                    <div class="text-sm text-gray-600">{{ r.email }} — {{ r.global_role }}</div>
                  </div>
                  <div>
                    <button class="px-3 py-1 bg-green-600 text-white rounded w-full sm:w-auto text-center" @click="accept(r.id)">Accept</button>
                  </div>
                </li>
              </ul>
              <div v-if="(!requests || requests.length === 0)" class="text-sm text-gray-600">No pending requests.</div>
              <div class="mt-2 flex items-center justify-between">
                <div class="text-sm text-gray-600">Page {{ requestsMeta.current_page }} / {{ requestsMeta.last_page }} ({{ requestsMeta.total }} total)</div>
                <div>
                  <button :disabled="requestsMeta.current_page <= 1" @click="loadRequests(requestsMeta.current_page - 1)" class="px-3 py-1 bg-gray-200 rounded">Prev</button>
                  <button :disabled="requestsMeta.current_page >= requestsMeta.last_page" @click="loadRequests(requestsMeta.current_page + 1)" class="px-3 py-1 bg-gray-200 rounded">Next</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 class="text-lg font-medium">Members</h2>
          <div class="mt-4">
            <!-- Filters with Dropdowns -->
            <div class="mb-6 grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
              <!-- Level Dropdown -->
              <div class="lg:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Filter by Level</label>
                <select
                  v-model="selectedLevel"
                  @change="() => { selectedGrade = null; if (selectedLevel) fetchGradesByLevel(selectedLevel); loadMembers(1) }"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">All Levels</option>
                  <option v-for="level in levels" :key="level.id" :value="level.id">{{ level.name }}</option>
                </select>
              </div>

              <!-- Grade Dropdown -->
              <div class="lg:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Filter by Grade</label>
                <select
                  v-model="selectedGrade"
                  @change="() => loadMembers(1)"
                  :disabled="!selectedLevel && grades.length === 0"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All Grades</option>
                  <option v-for="grade in grades" :key="grade.id" :value="grade.id">{{ grade.name }}</option>
                </select>
              </div>

              <!-- Clear Filters Button -->
              <div class="lg:col-span-4">
                <button
                  v-if="selectedLevel || selectedGrade"
                  @click="clearFilters"
                  class="w-full px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white font-medium hover:bg-gray-300 dark:hover:bg-slate-600 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            <!-- Selected Filters Display -->
            <div v-if="selectedLevel || selectedGrade" class="mb-6 p-4 rounded-lg bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
              <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Active Filters:</p>
              <div class="flex flex-wrap gap-2">
                <span v-if="selectedLevel" class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-600 text-white text-sm font-medium">
                  📚 {{ levels.find((l: any) => l.id === selectedLevel)?.name }}
                  <button @click="() => { selectedLevel = null; selectedGrade = null; loadMembers(1) }" class="ml-1 hover:opacity-75">✕</button>
                </span>
                <span v-if="selectedGrade" class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600 text-white text-sm font-medium">
                  🎓 {{ grades.find((g: any) => g.id === selectedGrade)?.name }}
                  <button @click="() => { selectedGrade = null; loadMembers(1) }" class="ml-1 hover:opacity-75">✕</button>
                </span>
              </div>
            </div>

            <LoadingSpinner v-if="loadingMembers" />
            <ErrorAlert v-else-if="errorMembers">Failed to load members: {{ errorMembers.message || errorMembers }}</ErrorAlert>
            <div v-else>
              <MemberList :members="members" :meta="membersMeta" @page-change="loadMembers" />
            </div>
          </div>
        </div>
      </div>
      </ClientOnly>
    </div>
  </div>
</template>
