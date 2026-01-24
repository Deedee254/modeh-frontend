<template>
  <div>
    <PageHero
      title="Subject Library"
      description="Manage approved subjects and create assessments aligned to each subject. Organize content to support clear learning objectives and assessment design."
      :showSearch="true"
      :flush="true"
      @search="onServerSearch"
    >
      <template #eyebrow>
        Subject Management
      </template>
    </PageHero>

    <div class="min-h-[calc(100vh-240px)] bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <!-- Sticky Filter Bar -->
      <div class="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 px-4 sm:px-6 lg:px-8 mb-6">
        <div class="max-w-7xl mx-auto">
          <div class="space-y-4">
            <!-- Compact filters header -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="w-full sm:w-auto inline-flex rounded-lg border border-slate-200 shadow-sm bg-white p-1" role="tablist" aria-label="subject-filters">
                <button @click="setFilter('')" :class="filterBtnClass('')" :aria-pressed="activeFilter === ''">All Subjects</button>
                <button @click="setFilter('top')" :class="filterBtnClass('top')" :aria-pressed="activeFilter === 'top'">Most Used</button>
                <button @click="setFilter('new')" :class="filterBtnClass('new')" :aria-pressed="activeFilter === 'new'">Recent</button>
              </div>
              <div class="w-full sm:w-auto sm:ml-auto text-sm text-gray-600 text-center sm:text-right font-medium">
                Showing <span class="text-brand-600 font-semibold">{{ filtered.length }}</span> subjects
              </div>
            </div>

            <!-- Mobile Filter Drawer & Desktop Filters -->
            <div class="flex items-center gap-3">
              <!-- Mobile Filter Drawer -->
              <MobileFilterDrawer
                @apply="() => handlePageChange(1)"
                @clear="() => { selectedGrade = null; handlePageChange(1) }"
              >
                <FiltersSidebar 
                  storageKey="filters:subjects" 
                  :grade-options="grades" 
                  :grade="selectedGrade"
                  @update:grade="val => selectedGrade = val" 
                  class="w-full"
                />
              </MobileFilterDrawer>

              <!-- Desktop Filters -->
              <div class="hidden lg:block w-full">
                <FiltersSidebar 
                  storageKey="filters:subjects" 
                  :grade-options="grades" 
                  :grade="selectedGrade"
                  @update:grade="val => selectedGrade = val" 
                  class="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <main>
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                <UiSkeleton :count="1" />
              </div>
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                <SubjectCard
                  v-for="(subject, idx) in (Array.isArray(filtered) ? filtered.filter(Boolean) : [])"
                  :key="subject?.id || idx"
                  :title="subject?.name"
                  :subtitle="`${subject?.quizzes_count || 0} quizzes`"
                  :image="resolveIcon(subject)"
                  :badgeText="(subject?.name || '').charAt(0).toUpperCase()"
                  :topicsCount="subject?.topics_count || subject?.topics?.length || 0"
                  :startLink="`/quiz-master/subjects/${subject?.id}`"
                  :description="subject?.description || subject?.summary || ''"
                  :grade="subject?.grade?.name || subject?.grade_id || ''"
                  startLabel="View Details"
                >
                  <div class="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-200">
                    <div class="text-sm text-brand-600 font-medium">
                      <span>{{ subject.is_approved ? '✓ Approved' : '⏳ Pending Approval' }}</span>
                    </div>
                    <div>
                      <NuxtLink :to="`/quiz-master/quizzes/create?subject_id=${subject?.id}`" class="inline-flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors w-full">
                        <Icon name="heroicons:plus" class="w-4 h-4" />
                        Add quiz
                      </NuxtLink>
                    </div>
                  </div>
                </SubjectCard>

                <div v-if="filtered.length === 0" class="col-span-full text-center py-16">
                  <div class="text-gray-400 mb-2">
                    <Icon name="heroicons:inbox-20-solid" class="w-12 h-12 mx-auto opacity-50" />
                  </div>
                  <p class="text-gray-600 font-medium">No subjects found</p>
                  <p class="text-gray-500 text-sm mt-1">Try adjusting your filters or search again.</p>
                </div>
              </div>
              
              <!-- Pagination -->
              <div v-if="subjectsResponse?.subjects?.meta && filtered.length > 0" class="mt-8 pt-6 border-t border-slate-200">
                <Pagination 
                  :paginator="subjectsResponse.subjects" 
                  @change-page="handlePageChange"
                />
              </div>
            </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaxonomyStore } from '~/stores/taxonomyStore'
import { useTaxonomyHydration, useMetricsDebug } from '~/composables/useTaxonomyHydration'
import { useRuntimeConfig } from '#app'
import useApi from '~/composables/useApi'
import PageHero from '~/components/ui/PageHero.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import SubjectCard from '~/components/ui/SubjectCard.vue'
import FiltersSidebar from '~/components/FiltersBar.vue'
import MobileFilterDrawer from '~/components/MobileFilterDrawer.vue'
import Pagination from '~/components/Pagination.vue'

definePageMeta({
  layout: 'quiz-master',
})

const config = useRuntimeConfig()
const store = useTaxonomyStore()
const api = useApi()
const { print: printMetrics } = useMetricsDebug()

// SSR hydration: pre-fetch grades and subjects
const { data } = await useTaxonomyHydration({
  fetchGrades: true,
  fetchSubjects: true
})

const selectedGrade = ref('')
const isLoading = ref(true)

const page = ref(1)
const perPage = ref(12)

// Use the store to get subjects. We keep the response shape compatible so the
// template doesn't need changes.
const subjectsResponse = ref({ subjects: { data: [], meta: null } })
const subjects = computed(() => subjectsResponse.value?.subjects?.data || [])

const grades = computed(() => Array.isArray(store.grades) ? store.grades : [])

onMounted(async () => {
  // Load the first page of subjects using the store pagination method
  try {
    const resp = await store.fetchSubjectsPage({ page: page.value, perPage: perPage.value })
    if (resp) {
      subjectsResponse.value = { subjects: { data: resp.items || [], meta: resp.meta || null } }
    }
  } catch (e) {
    // ignore
  }
  
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => printMetrics(), 2000)
  }
})

// Refresh helper with auth handling
async function refresh() {
  try {
    const params = new URLSearchParams()
    params.set('page', page.value)
    params.set('per_page', perPage.value)
    if (selectedGrade.value) params.set('grade_id', selectedGrade.value)
    if (query.value) params.set('q', query.value)
    
    const res = await api.get(`/api/subjects?${params.toString()}`)
    if (api.handleAuthStatus(res)) return
    if (!res.ok) throw new Error('Failed to fetch subjects')
    const data = await res.json().catch(() => null)
    subjectsResponse.value = { subjects: { data: data?.subjects?.data || data?.data || [], meta: data?.subjects?.meta || null } }
  } catch (e) {
    // ignore for now
  }
}

async function handlePageChange(newPage) {
  page.value = newPage
  await refresh()
}

// Filter functionality
const activeFilter = ref('')
const query = ref('')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  let list = subjects.value || []
  
  if (q) {
    list = list.filter(s => (s.name || '').toLowerCase().includes(q))
  }
  
  if (selectedGrade.value) {
    list = list.filter(s => String(s.grade_id) === String(selectedGrade.value))
  }

  return list
})

function setFilter(v) {
  if (activeFilter.value === v) {
    activeFilter.value = ''
  } else {
    activeFilter.value = v
  }

  const list = [...subjects.value]
  if (activeFilter.value === 'top') {
    list.sort((a, b) => (b.quizzes_count || 0) - (a.quizzes_count || 0))
  } else if (activeFilter.value === 'new') {
    list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  }
}

function filterBtnClass(v) {
  const active = activeFilter.value === v
  const base = 'px-4 py-2 text-sm font-medium first:rounded-l-lg last:rounded-r-lg border-r last:border-r-0 transition-colors'
  return `${base} ${active ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700 border-slate-200 hover:bg-slate-50'}`
}

async function onServerSearch(q) {
  try {
    // Use API composable to search subjects (server-side pagination)
    page.value = 1
    query.value = q
    
    const params = new URLSearchParams()
    params.set('page', page.value)
    params.set('per_page', perPage.value)
    if (q) params.set('q', q)
    if (selectedGrade.value) params.set('grade_id', selectedGrade.value)
    
    const res = await api.get(`/api/subjects?${params.toString()}`)
    if (api.handleAuthStatus(res)) return
    if (!res.ok) throw new Error('Failed to fetch subjects')
    const data = await res.json().catch(() => null)
    subjectsResponse.value = { subjects: { data: data?.subjects?.data || data?.data || [], meta: data?.subjects?.meta || null } }
  } catch (e) {
    // ignore network errors
  }
}

function resolveIcon(s) {
  if (!s) return '/images/subject.png'
  return s.image || s.cover_image || '/images/subject.png'
}

// mark loading as complete (useFetch used with top-level await above)
isLoading.value = false
</script>