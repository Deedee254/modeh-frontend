<template>
  <div>
    <PageHero
      title="Your Topics"
      description="Discover topics aligned to your learning level."
      :flush="true"
    >
      <template #eyebrow>
        Your learning topics
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
            to="/quizee/subjects"
            class="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            Browse subjects
          </NuxtLink>
        </div>
      </template>

      <template #highlight>
        <div>
          <p class="text-xs uppercase tracking-wide text-white/70">Your learning path</p>
          <p class="mt-1 text-2xl font-semibold text-white">{{ userGrade }}</p>
          <p class="mt-2 text-sm text-white/70">{{ userLevel }} • {{ filteredTopics.length || 0 }} topics</p>
        </div>
      </template>

      <template #highlight-icon>
        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h10M4 18h6" />
        </svg>
      </template>

      <template #stats>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Topics</p>
          <p class="mt-2 text-xl font-semibold">{{ filteredTopics.length || 0 }}</p>
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

      <!-- Removed grade/level selectors — sorting now via buttons above -->

      <div v-if="loading" class="mt-6"><UiSkeleton :count="6" /></div>
      <div v-else-if="error" class="mt-6 text-red-600">Failed to load topics.</div>

      <div v-else class="mt-6">
        <div v-if="filteredTopics.length === 0" class="p-6 border rounded-xl text-sm text-gray-600 bg-white shadow-sm">
          No topics available for your level.
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <TopicCard
                  v-for="topic in filteredTopics"
                  :key="topic.id"
                  :title="topic.name"
                  :slug="topic.slug"
                  :to="`/quizee/topics/${topic.slug || topic.id}`"
                  :quizzes-count="topic.quizzes_count"
                  :subject="topic.subject?.name || topic.subject_name || ''"
                  :grade="getGradeName(topic)"
                  :course="getCourseName(topic)"
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
import { useTaxonomyStore } from '~/stores/taxonomyStore'
import useApi from '~/composables/useApi'
import PageHero from '~/components/ui/PageHero.vue'
import TopicCard from '~/components/ui/TopicCard.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'

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
  const profile = u.quizeeProfile || u
  const name = profile?.level?.name || profile?.level_name
  // Always return a string, never undefined
  return name || 'Your Level'
})

// Compute grade with default fallback - ensure consistent SSR/client rendering
const userGrade = computed(() => {
  const u = userProfile.value
  const profile = u.quizeeProfile || u
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

async function loadTopicsByLevel() {
  loading.value = true
  error.value = false
  try {
    // Use selected values if available, otherwise fall back to user profile
    const levelId = selectedLevelId.value || userProfile.value?.level?.id || userProfile.value?.level_id
    const gradeId = selectedGradeId.value || userProfile.value?.grade?.id || userProfile.value?.grade_id
    
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

  // fetch courses via taxonomy store (uses caching)
  try {
    await taxonomyStore.fetchCourses()
    // taxonomyStore.courses may be a ref or plain array depending on Pinia config
    allCourses.value = Array.isArray((taxonomyStore as any).courses) ? (taxonomyStore as any).courses : (Array.isArray((taxonomyStore as any).courses?.value) ? (taxonomyStore as any).courses.value : [])
  } catch (e) {
    try {
      // fallback: fetch directly
      const coursesRes = await api.get('/api/courses')
      if (coursesRes.ok) {
        const coursesData = await api.parseResponse(coursesRes)
        allCourses.value = Array.isArray(coursesData) ? coursesData : (coursesData?.data || coursesData?.courses || [])
      }
    } catch (err) {
      // ignore
    }
  }

  // Initialize selected grade/level from user profile
  if (userProfile.value?.grade?.id) {
    selectedGradeId.value = userProfile.value.grade.id
  }
  if (userProfile.value?.level?.id) {
    selectedLevelId.value = userProfile.value.level.id
  }

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
    const found = (allCourses.value || []).find((c: any) => String(c.id) === String(courseId) || String(c.id) === String(c?.id))
    if (found) return found.name || found.title || ''
    // try taxonomy store grades/courses as fallback
    try {
      const cs = (taxonomyStore as any).courses
      const arr = Array.isArray(cs) ? cs : (Array.isArray(cs?.value) ? cs.value : [])
      const f2 = arr.find((c: any) => String(c.id) === String(courseId))
      if (f2) return f2.name || f2.title || ''
    } catch (e) {
      // ignore
    }
  }
  return ''
}
</script>
