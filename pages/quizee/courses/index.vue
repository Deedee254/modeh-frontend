<template>
  <div>
    <PageHero
      title="Your Courses"
      description="Explore courses relevant to your field of study."
      :showSearch="true"
      :flush="true"
      @search="onSearch"
    >
      <template #eyebrow>
        Your learning courses
      </template>

      <template #actions>
        <div class="flex flex-wrap items-center gap-3">
          <NuxtLink
            to="/quizee/subjects"
            class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-lg shadow-brand-950/30 transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            Browse subjects
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
          <p class="text-xs uppercase tracking-wide text-white/70">Your current course</p>
          <p class="mt-1 text-2xl font-semibold text-white">{{ userCourse }}</p>
          <p class="mt-2 text-sm text-white/70">{{ allCourses.length || 0 }} courses available</p>
        </div>
      </template>

      <template #highlight-icon>
        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h10M4 18h6" />
        </svg>
      </template>

      <template #stats>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Courses</p>
          <p class="mt-2 text-xl font-semibold">{{ filteredCourses.length || 0 }}</p>
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

      <div v-if="loading" class="mt-6"><UiSkeleton :count="6" /></div>
      <div v-else-if="error" class="mt-6 text-red-600">Failed to load courses.</div>

      <div v-else class="mt-6">
        <div v-if="filteredCourses.length === 0" class="p-6 border rounded-xl text-sm text-gray-600 bg-white shadow-sm">
          No courses available. Please check back later or adjust your profile settings.
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <SubjectCard
            v-for="course in filteredCourses"
            :key="course?.id || Math.random()"
            :title="course?.name || 'Unknown'"
            :description="course?.description || course?.summary || ''"
            :slug="course?.slug"
            :to="`/quizee/courses/${course?.slug || course?.id}`"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import useApi from '~/composables/useApi'
import PageHero from '~/components/ui/PageHero.vue'
import SubjectCard from '~/components/ui/SubjectCard.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'

definePageMeta({
  layout: 'quizee',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Browse courses for your field of study.' }
  ]
})

const auth = useAuthStore()
const api = useApi()

const loading = ref(false)
const error = ref(false)
const searchTerm = ref('')
const allCourses = ref<any[]>([])
const sortOption = ref('newest')

const userProfile = computed(() => {
  const u = (auth as any).user
  return (u && typeof u === 'object' && 'value' in u) ? u.value : (u || {})
})

// For tertiary level, the "grade" is the course/subject area (e.g., "Law", "Medicine")
const userCourse = computed(() => {
  const profile = userProfile.value
  return profile?.grade?.name || profile?.grade_name || 'Your Course'
})

const filteredCourses = computed(() => {
  let courses = allCourses.value || []
  if (searchTerm.value) {
    const q = searchTerm.value.toLowerCase()
    courses = courses.filter((c: any) => (c.name || '').toLowerCase().includes(q))
  }
  const sort = sortOption.value
  if (sort === 'name') {
    courses = courses.slice().sort((a: any, b: any) => String(a.name || '').localeCompare(String(b.name || '')))
  } else if (sort === 'most_quizzes') {
    courses = courses.slice().sort((a: any, b: any) => Number(b.quizzes_count || b.quizzes || 0) - Number(a.quizzes_count || a.quizzes || 0))
  } else {
    courses = courses.slice().sort((a: any, b: any) => {
      const ta = a?.created_at ? Date.parse(String(a.created_at)) : 0
      const tb = b?.created_at ? Date.parse(String(b.created_at)) : 0
      return tb - ta
    })
  }
  return courses
})

async function loadAllCourses() {
  loading.value = true
  error.value = false
  try {
    // Fetch all courses from backend
    const res = await api.get('/api/subjects')
    
    // Handle auth errors
    if (api.handleAuthStatus(res)) {
      loading.value = false
      return
    }
    
    if (!res.ok) {
      console.error('Failed to fetch courses, status:', res.status)
      error.value = true
      loading.value = false
      return
    }
    
    const data = await api.parseResponse(res)
    
    // Ensure allCourses is always an array
    if (Array.isArray(data)) {
      allCourses.value = data
    } else if (data?.data && Array.isArray(data.data)) {
      allCourses.value = data.data
    } else if (data?.subjects && Array.isArray(data.subjects)) {
      allCourses.value = data.subjects
    } else {
      console.warn('Unexpected courses data structure:', data)
      allCourses.value = []
    }
  } catch (e) {
    console.error('Failed to load courses:', e)
    error.value = true
    allCourses.value = []
  } finally {
    loading.value = false
  }
}

// selectCourse removed — UI no longer exposes course selector

function onSearch(query: string) {
  searchTerm.value = query
}

onMounted(() => {
  try {
    loadAllCourses()
    
  } catch (e) {
    console.error('Error in onMounted:', e)
  }
})
</script>
