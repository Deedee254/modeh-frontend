<template>
  <div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <PageHero
        title="Your Topics"
        :breadcrumbs="[
          { text: 'Dashboard', href: '/quizee/dashboard' },
          { text: 'Your Topics', current: true }
        ]"
      />
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

      <!-- Removed grade/level selectors — sorting now via buttons above -->

      <div v-if="loading" class="mt-6 flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
      <div v-else-if="error" class="mt-6 text-red-600">Failed to load topics.</div>

      <div v-else class="mt-6">
        <div v-if="filteredTopics.length === 0" class="p-6 border rounded-xl text-sm text-gray-600 bg-white shadow-sm">
          No topics available for your level.
        </div>
        <div v-else>
          <!-- Horizontal on mobile -->
          <div class="sm:hidden space-y-3">
            <TopicCard
              v-for="topic in paginatedTopics"
              :key="topic.id"
              :title="topic.name"
              :slug="topic.slug"
              :to="`/quizee/topics/${topic.slug}`"
              :quizzesCount="topic.quizzes_count"
              :subject="topic.subject?.name || topic.subject_name || ''"
              :grade="getGradeName(topic)"
              :course="getCourseName(topic)"
              :isHorizontal="true"
            />
          </div>

          <!-- Vertical grid on tablet and desktop -->
          <div class="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <TopicCard
              v-for="topic in paginatedTopics"
              :key="topic.id"
              :title="topic.name"
              :slug="topic.slug"
              :to="`/quizee/topics/${topic.slug}`"
              :quizzesCount="topic.quizzes_count"
              :subject="topic.subject?.name || topic.subject_name || ''"
              :grade="getGradeName(topic)"
              :course="getCourseName(topic)"
            />
          </div>

          <!-- Pagination Controls -->
          <div class="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
            <div class="text-sm text-gray-600">
              Showing <span class="font-semibold">{{ (currentPage - 1) * perPage + 1 }}</span> to 
              <span class="font-semibold">{{ Math.min(currentPage * perPage, filteredTopics.length) }}</span> of
              <span class="font-semibold">{{ filteredTopics.length }}</span> topics
            </div>
            <div class="flex items-center gap-2">
              <button
                :disabled="currentPage === 1 || loading"
                @click="currentPage = Math.max(1, currentPage - 1)"
                :class="[
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  currentPage === 1 || loading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                ]"
              >
                Previous
              </button>
              <div class="flex items-center gap-1">
                <span class="text-sm text-gray-600">Page</span>
                <span class="font-semibold text-gray-900">{{ currentPage }}</span>
                <span class="text-sm text-gray-600">of {{ totalPages }}</span>
              </div>
              <button
                :disabled="currentPage === totalPages || loading"
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :class="[
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  currentPage === totalPages || loading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-brand-600 text-white hover:bg-brand-700'
                ]"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import useTaxonomy from '~/composables/useTaxonomy'
import { useTaxonomyStore } from '~/stores/taxonomyStore'
import useApi from '~/composables/useApi'
import TopicCard from '~/components/ui/TopicCard.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import PageHero from '~/components/ui/PageHero.vue'

definePageMeta({
  layout: 'quizee',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Explore topics aligned to your learning level.' }
  ]
})

const auth = useAuthStore()
const api = useApi()
const taxonomy = useTaxonomy()
const taxonomyStore = useTaxonomyStore()

const loading = ref(false)
const error = ref(false)
const allTopics = ref<any[]>([])
const sortOption = ref('newest')
const allGrades = ref<any[]>([])
const allLevels = ref<any[]>([])
const allCourses = ref<any[]>([])
const selectedGradeId = ref<number | null>(null)
const selectedLevelId = ref<number | null>(null)
const currentPage = ref(1)
const perPage = ref(12)

function extractId(val: any) {
  if (val === null || val === undefined) return null
  if (typeof val === 'object') return val.id ?? val.value ?? null
  return val
}

// Wrap auth.user in a computed to ensure reactivity
const userProfile = computed(() => {
  // auth.user may be a ref or a plain object depending on store wiring.
  // Use `any` to avoid TS narrowing to `never` when checking `.value`.
  const rawUser: any = (auth as any).user
  if (!rawUser) return {}
  const unwrapped = (rawUser && typeof rawUser === 'object' && 'value' in rawUser) ? rawUser.value : rawUser
  return unwrapped || {}
})

// Compute level with default fallback - ensure consistent SSR/client rendering
const userLevel = computed(() => {
  const u = userProfile.value
  const profile = u.profile || u
  const name = profile?.level?.name || profile?.level_name
  // Always return a string, never undefined
  return name || 'Your Level'
})

// Compute grade with default fallback - ensure consistent SSR/client rendering
const userGrade = computed(() => {
  const u = userProfile.value
  const profile = u.profile || u
  const name = profile?.grade?.name || profile?.grade_name
  // Always return a string, never undefined
  return name || 'Your Grade'
})

const filteredTopics = computed(() => {
  let topics = allTopics.value || []
  // no client-side search filter (filter bar removed)
  const sort = sortOption.value
  if (sort === 'name') {
    topics = topics.slice().sort((a: any, b: any) => String(a.name || '').localeCompare(String(b.name || '')))
  } else if (sort === 'most_quizzes') {
  topics = topics.slice().sort((a: any, b: any) => Number(b.quizzes_count || 0) - Number(a.quizzes_count || 0))
  } else {
    topics = topics.slice().sort((a: any, b: any) => {
      const ta = a?.created_at ? Date.parse(String(a.created_at)) : 0
      const tb = b?.created_at ? Date.parse(String(b.created_at)) : 0
      return tb - ta
    })
  }
  return topics
})

const totalPages = computed(() => Math.ceil((allTopics.value?.length || 0) / perPage.value))

const paginatedTopics = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredTopics.value.slice(start, end)
})

// Reset to page 1 when sort option changes
watch(() => sortOption.value, () => {
  currentPage.value = 1
})

async function loadTopicsByLevel() {
  loading.value = true
  error.value = false
  try {
    // Use selected values if available, otherwise fall back to user profile
    // Safely extract IDs using helper to handle both objects and primitives
    const levelId = extractId(selectedLevelId.value) || extractId(userProfile.value?.level) || extractId(userProfile.value?.level_id)
    const gradeId = extractId(selectedGradeId.value) || extractId(userProfile.value?.grade) || extractId(userProfile.value?.grade_id)
    
    if (!levelId || !gradeId) {
      // fallback: fetch all topics so page shows content for browsing
      try {
        await taxonomy.fetchAllTopics()
        allTopics.value = Array.isArray(taxonomy.topics.value) ? taxonomy.topics.value : []
      } catch (e) {
        // best-effort: leave allTopics empty
      }
      loading.value = false
      return
    }

    // Fetch topics filtered by both level and grade
    const res = await api.get(`/api/topics?level_id=${encodeURIComponent(levelId)}&grade_id=${encodeURIComponent(gradeId)}`)
    
    // Handle auth errors
    if (api.handleAuthStatus(res)) {
      return
    }
    
    if (!res.ok) {
      error.value = true
      loading.value = false
      return
    }
    
    const data = await api.parseResponse(res)
    allTopics.value = Array.isArray(data) ? data : (data?.data || data?.topics || [])
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

function onSearch(query: string) {
  // search removed for this page
}

// selector functions removed — UI no longer exposes grade/level selectors

onMounted(async () => {
  // Load all grades and levels for filter dropdowns using api composable
  const taxonomyStore = useTaxonomyStore()

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

  // fetch courses (which are grades with type='course') from the grades endpoint
  try {
    await taxonomyStore.fetchGrades()
    // Filter grades with type='course' to get courses
    const gradesList = Array.isArray((taxonomyStore as any).grades) ? (taxonomyStore as any).grades : (Array.isArray((taxonomyStore as any).grades?.value) ? (taxonomyStore as any).grades.value : [])
    allCourses.value = gradesList.filter((g: any) => g.type === 'course')
  } catch (e) {
    console.error('Failed to load courses:', e)
  }

  // Initialize selected grade/level from user profile
  const pGrade = extractId(userProfile.value?.grade) || extractId(userProfile.value?.grade_id)
  if (pGrade) selectedGradeId.value = pGrade
  
  const pLevel = extractId(userProfile.value?.level) || extractId(userProfile.value?.level_id)
  if (pLevel) selectedLevelId.value = pLevel

  loadTopicsByLevel()
})

// Helper to derive grade name for a topic from available data
function getGradeName(topic: any) {
  if (!topic) return ''
  // direct grade object or flat name from API
  if (topic.grade && typeof topic.grade === 'object' && (topic.grade.name || topic.grade.display_name)) return topic.grade.name || topic.grade.display_name || ''
  if (topic.grade_name) return topic.grade_name
  if (topic.grade) return String(topic.grade)

  // Try subject -> grade_id
  // Resolve subjects from taxonomy store safely (Pinia may expose either array or ref)
  const subjectsArr = Array.isArray((taxonomyStore as any).subjects) ? (taxonomyStore as any).subjects : (Array.isArray((taxonomyStore as any).subjects?.value) ? (taxonomyStore as any).subjects.value : [])
  const subject = topic.subject || (topic.subject_id ? subjectsArr.find((s: any) => String(s.id) === String(topic.subject_id)) : null)
  const gradeId = subject && (subject.grade_id || subject.grade) ? String(subject.grade_id || subject.grade) : null
  if (!gradeId) return ''
  const found = (allGrades.value || []).find((g: any) => String(g.id) === String(gradeId) || String(g.id) === String(g?.id))
  if (found) return found.name || found.display_name || found.title || ''
  // Fallback to taxonomy computed grades if available
  const gradesArr = Array.isArray((taxonomyStore as any).grades) ? (taxonomyStore as any).grades : (Array.isArray((taxonomyStore as any).grades?.value) ? (taxonomyStore as any).grades.value : [])
  const rg = gradesArr.find((g: any) => String(g.id) === String(gradeId))
  if (rg) return rg.name || rg.display_name || ''
  return ''
}

function getCourseName(topic: any) {
  if (!topic) return ''
  if (topic.course && typeof topic.course === 'object' && (topic.course.name || topic.course.title)) return topic.course.name || topic.course.title || ''
  if (topic.course_name) return topic.course_name
  // try course id mapping from fetched courses
  const courseId = topic.course_id || (topic.course && topic.course.id) || topic.courseId || null
  if (courseId) {
    const found = (allCourses.value || []).find((c: any) => String(c.id) === String(courseId))
    if (found) return found.name || found.display_name || ''
  }
  return ''
}
</script>
