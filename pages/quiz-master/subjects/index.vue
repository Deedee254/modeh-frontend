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

    <div class="max-w-7xl mx-auto px-4 py-12">
      <!-- Compact filters -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div class="w-full sm:w-auto inline-flex rounded-md shadow-sm" role="tablist" aria-label="subject-filters">
          <button @click="setFilter('')" :class="filterBtnClass('')" :aria-pressed="activeFilter === ''">All</button>
          <button @click="setFilter('top')" :class="filterBtnClass('top')" :aria-pressed="activeFilter === 'top'">Most Used</button>
          <button @click="setFilter('new')" :class="filterBtnClass('new')" :aria-pressed="activeFilter === 'new'">Recent</button>
        </div>
        <div class="w-full sm:w-auto sm:ml-auto text-sm text-gray-500 text-center sm:text-right">
          Showing {{ filtered.length }} subjects
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <aside class="lg:col-span-1 order-2 lg:order-1">
          <div class="sticky top-4">
            <FiltersSidebar 
              storageKey="filters:subjects" 
              :grade-options="grades" 
              :grade="selectedGrade"
              @update:grade="val => selectedGrade = val" 
              class="w-full"
            />
          </div>
        </aside>

        <main class="lg:col-span-3 order-1 lg:order-2">
          <div v-if="isLoading"><UiSkeleton :count="6" /></div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
              <div class="flex flex-col gap-2">
                <div class="text-sm text-indigo-600">
                  <span>{{ subject.is_approved ? 'Approved' : 'Pending Approval' }}</span>
                </div>
                <div>
                  <NuxtLink :to="`/quiz-master/quizzes/create?subject_id=${subject?.id}`" class="inline-flex items-center px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-semibold">Add quiz</NuxtLink>
                </div>
              </div>
            </SubjectCard>

            <div v-if="filtered.length === 0" class="col-span-full text-center py-12 text-gray-500">
              No subjects found. Try adjusting your filters.
            </div>
          </div>
          
          <div v-if="subjectsResponse?.subjects?.meta" class="mt-6">
            <Pagination 
              :paginator="subjectsResponse.subjects" 
              @change-page="handlePageChange"
            />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import useTaxonomy from '~/composables/useTaxonomy'
import { useRuntimeConfig } from '#app'
import PageHero from '~/components/ui/PageHero.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import SubjectCard from '~/components/ui/SubjectCard.vue'
import FiltersSidebar from '~/components/FiltersSidebar.vue'
import Pagination from '~/components/Pagination.vue'

definePageMeta({
  layout: 'quiz-master',
})

const config = useRuntimeConfig()
const selectedGrade = ref('')
const isLoading = ref(true)

const page = ref(1)
const perPage = ref(12)

const { data: subjectsResponse, pending, error, refresh } = await useFetch(config.public.apiBase + '/api/subjects', {
  credentials: 'include',
  params: {
    page: page.value,
    per_page: perPage.value
  }
})

const subjects = computed(() => subjectsResponse.value?.subjects?.data || [])

const { fetchGrades, fetchAllSubjects, grades: taxGrades } = useTaxonomy()
const grades = computed(() => Array.isArray(taxGrades.value) ? taxGrades.value : [])

onMounted(async () => {
  await Promise.all([fetchGrades(), fetchAllSubjects()])
})

async function handlePageChange(newPage) {
  page.value = newPage
  await refresh()
}

// grades are provided from the taxonomy composable (taxGrades). No separate grades fetch required here.

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
  const base = 'px-3 py-1.5 text-sm first:rounded-l-md last:rounded-r-md border'
  return `${base} ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200'}`
}

async function onServerSearch(q) {
  try {
    const res = await $fetch(config.public.apiBase + '/api/subjects', {
      params: { query: q },
      credentials: 'include'
    })
    query.value = q
    // update the subjects response so the UI reflects search results
    if (res) {
      subjectsResponse.value = res
    }
  } catch (e) {
    // ignore network errors
  }
}

function resolveIcon(s) {
  if (!s) return '/images/subject-icon.svg'
  return s.icon || s.image || s.cover_image || '/images/subject-icon.svg'
}

// mark loading as complete (useFetch used with top-level await above)
isLoading.value = false
</script>