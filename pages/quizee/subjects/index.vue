<template>
  <div>
    <PageHero
      title="Your Subjects"
      description="Explore subjects relevant to your grade level."
      :showSearch="true"
      :flush="true"
      @search="onSearch"
    >
      <template #eyebrow>
        Your learning subjects
      </template>

      <template #actions>
        <div class="flex flex-wrap items-center gap-3">
          <NuxtLink
            to="/quizee/grades"
            class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-lg shadow-brand-950/30 transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            Browse grades
          </NuxtLink>
          <NuxtLink
            to="/quizee/topics"
            class="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            Explore topics
          </NuxtLink>
        </div>
      </template>

      <template #highlight>
        <div>
          <p class="text-xs uppercase tracking-wide text-white/70">Your learning path</p>
          <p class="mt-1 text-2xl font-semibold text-white">{{ userGrade }}</p>
          <p class="mt-2 text-sm text-white/70">{{ userLevel }} • {{ filteredSubjects.length || 0 }} subjects</p>
        </div>
      </template>

      <template #highlight-icon>
        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h10M4 18h6" />
        </svg>
      </template>

      <template #stats>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Subjects</p>
          <p class="mt-2 text-xl font-semibold">{{ filteredSubjects.length || 0 }}</p>
        </div>
      </template>
    </PageHero>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Sort Bar (button group) -->
      <div class="mb-8 flex items-center gap-3">
        <div class="text-sm text-gray-600">Sort:</div>
        <div class="flex items-center gap-2">
          <button
            :class="[ 'px-3 py-1 rounded-full text-sm font-medium', sortOption === 'newest' ? 'bg-brand-700 text-white' : 'bg-white border border-gray-200 text-gray-700' ]"
            @click="sortOption = 'newest'"
          >
            Newest
          </button>
          <button
            :class="[ 'px-3 py-1 rounded-full text-sm font-medium', sortOption === 'name' ? 'bg-brand-700 text-white' : 'bg-white border border-gray-200 text-gray-700' ]"
            @click="sortOption = 'name'"
          >
            Name (A–Z)
          </button>
          <button
            :class="[ 'px-3 py-1 rounded-full text-sm font-medium', sortOption === 'most_quizzes' ? 'bg-brand-700 text-white' : 'bg-white border border-gray-200 text-gray-700' ]"
            @click="sortOption = 'most_quizzes'"
          >
            Most quizzes
          </button>
        </div>
      </div>

      <!-- Removed course/grade/level selectors — sorting now via buttons above -->

      <div v-if="loading" class="mt-6"><UiSkeleton :count="6" /></div>
      <div v-else-if="error" class="mt-6 text-red-600">Failed to load subjects.</div>

      <div v-else class="mt-6">
        <div v-if="filteredSubjects.length === 0" class="p-6 border rounded-xl text-sm text-gray-600 bg-white shadow-sm">
          No subjects available for your grade level.
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <SubjectCard
            v-for="subject in filteredSubjects"
            :key="subject.id"
            :title="subject.name"
            :description="subject.description || subject.summary"
            :slug="subject.slug"
            :to="`/quizee/subjects/${subject.slug || subject.id}`"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import useTaxonomy from '~/composables/useTaxonomy'
import useApi from '~/composables/useApi'
import PageHero from '~/components/ui/PageHero.vue'
import SubjectCard from '~/components/ui/SubjectCard.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'

definePageMeta({
  layout: 'quizee',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Browse subjects relevant to your grade level.' }
  ]
})

const auth = useAuthStore()
const api = useApi()
const taxonomy = useTaxonomy()

const loading = ref(false)
const error = ref(false)
const searchTerm = ref('')
const allGrades = ref<any[]>([])
const allLevels = ref<any[]>([])
const allCourses = ref<any[]>([])
const selectedGradeId = ref<number | null>(null)
const selectedLevelId = ref<number | null>(null)
const sortOption = ref('newest')

// Get user profile with proper fallbacks
const userProfile = computed(() => {
  // auth.user may be a ref or a plain object depending on store wiring.
  // Use `any` to avoid TS narrowing to `never` when checking `.value`.
  const rawUser: any = (auth as any).user
  if (!rawUser) return {}
  const unwrapped = (rawUser && typeof rawUser === 'object' && 'value' in rawUser) ? rawUser.value : rawUser
  return unwrapped || {}
})

// Compute grade with default fallback - ensure consistent SSR/client rendering
const userGrade = computed(() => {
  const profile = userProfile.value
  const name = profile?.grade?.name || profile?.grade_name
  // Always return a string, never undefined
  return name || 'Your Grade'
})

// Compute level with default fallback - ensure consistent SSR/client rendering
const userLevel = computed(() => {
  const profile = userProfile.value
  const name = profile?.level?.name || profile?.level_name
  // Always return a string, never undefined
  return name || 'Your Level'
})


const filteredSubjects = computed(() => {
  let subjects = taxonomy.subjects.value || []
  if (searchTerm.value) {
    const q = searchTerm.value.toLowerCase()
    subjects = subjects.filter((s: any) => (s.name || '').toLowerCase().includes(q))
  }
  // apply sorting
  const sort = sortOption.value
  if (sort === 'name') {
    subjects = subjects.slice().sort((a: any, b: any) => (String(a.name || '').localeCompare(String(b.name || ''))))
  } else if (sort === 'most_quizzes') {
    subjects = subjects.slice().sort((a: any, b: any) => (Number(b.quizzes_count || b.quizzes || 0) - Number(a.quizzes_count || a.quizzes || 0)))
  } else {
    // newest: fallback to created_at if present
    subjects = subjects.slice().sort((a: any, b: any) => {
      const ta = a?.created_at ? Date.parse(String(a.created_at)) : 0
      const tb = b?.created_at ? Date.parse(String(b.created_at)) : 0
      return tb - ta
    })
  }
  return subjects
})

async function loadSubjectsByGrade() {
  loading.value = true
  error.value = false
  try {
    // Use selected values if available, otherwise fall back to user profile
    const gradeId = selectedGradeId.value || userProfile.value?.grade?.id || userProfile.value?.grade_id
    const levelId = selectedLevelId.value || userProfile.value?.level?.id || userProfile.value?.level_id
    
    if (!gradeId || !levelId) {
      // fallback: load all subjects so the page still shows content for browsing
      try {
        await taxonomy.fetchAllSubjects()
      } catch (e) {
        // ignore
      }
      loading.value = false
      return
    }
    await taxonomy.fetchSubjectsByGrade(gradeId, levelId)
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

function onSearch(query: string) {
  searchTerm.value = query
}

// selector helper functions removed — UI no longer exposes course/grade/level selectors

onMounted(async () => {
  // Load all grades and levels for filter dropdowns using api composable
  try {
    const gradesRes = await api.get('/api/grades')
    if (gradesRes.ok) {
      const gradesData = await api.parseResponse(gradesRes)
      allGrades.value = Array.isArray(gradesData) ? gradesData : (gradesData?.data || gradesData || [])
    }
  } catch (e) {
    console.error('Failed to load grades:', e)
  }

  try {
    const levelsRes = await api.get('/api/levels')
    if (levelsRes.ok) {
      const levelsData = await api.parseResponse(levelsRes)
      allLevels.value = Array.isArray(levelsData) ? levelsData : (levelsData?.data || levelsData || [])
    }
  } catch (e) {
    console.error('Failed to load levels:', e)
  }

  // Load all courses using api composable
  try {
    const coursesRes = await api.get('/api/subjects')
    if (coursesRes.ok) {
      const coursesData = await api.parseResponse(coursesRes)
      allCourses.value = Array.isArray(coursesData) ? coursesData : (coursesData?.data || coursesData?.subjects || [])
    }
  } catch (e) {
    console.error('Failed to load courses:', e)
  }

  // Initialize selected grade/level from user profile
  if (userProfile.value?.grade?.id) {
    selectedGradeId.value = userProfile.value.grade.id
  }
  if (userProfile.value?.level?.id) {
    selectedLevelId.value = userProfile.value.level.id
  }

  loadSubjectsByGrade()
})
</script>
