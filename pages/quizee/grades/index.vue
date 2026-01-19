<template>
  <div>
    <div class="max-w-7xl mx-auto px-4 py-6">
      <nav class="text-sm text-gray-600 mb-4">
        <NuxtLink to="/quizee/dashboard" class="hover:text-brand-600">Dashboard</NuxtLink>
        <span class="mx-2">›</span>
        <span>Grades</span>
      </nav>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Your Grade Levels</h1>
      <p class="text-gray-600 mb-6">Explore assessments and topics specific to your grade level.</p>
    </div>

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
            :class="[ 'px-3 py-1 rounded-full text-sm font-medium', sortOption === 'most_subjects' ? 'bg-brand-700 text-white' : 'bg-white border border-gray-200 text-gray-700' ]"
            @click="sortOption = 'most_subjects'"
          >
            Most subjects
          </button>
        </div>
      </div>
      <div v-if="loading" class="mt-6"><UiSkeleton :count="1" /></div>
      <div v-else-if="error" class="mt-6 text-red-600">Failed to load grades.</div>

      <div v-else class="mt-6 space-y-10">
        <div v-if="filteredGrades.length === 0" class="p-6 border rounded-xl text-sm text-gray-600 bg-white shadow-sm">
          No grades available for your level. Please check back later or adjust your profile settings.
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <GradeCard
            v-for="grade in filteredGrades"
            :key="grade.id"
            :title="grade.name"
            :description="grade.description || grade.summary"
            :slug="grade.slug"
            :to="`/quizee/grades/${grade.slug}`"
            :icon="grade.icon"
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
import GradeCard from '~/components/ui/GradeCard.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: 'quizee',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Browse grade levels aligned to your profile and explore assessments.' }
  ]
})

const auth = useAuthStore()
const router = useRouter()
const taxonomy = useTaxonomy()

const loading = ref(false)
const error = ref(false)
const subjectsCount = ref(0)
const topicsCount = ref(0)
const totalQuizzes = ref(0)
const sortOption = ref('newest')

const userProfile = computed(() => {
  const u = (auth as any).user
  return (u && typeof u === 'object' && 'value' in u) ? u.value : (u || {})
})
const userLevel = computed(() => userProfile.value?.level?.name || userProfile.value?.level_name || 'Your Level')

const filteredGrades = computed(() => {
  let grades = taxonomy.grades.value || []
  // client-side search removed for this page
  const sort = sortOption.value
  if (sort === 'name') {
    grades = grades.slice().sort((a: any, b: any) => String(a.name || '').localeCompare(String(b.name || '')))
  } else if (sort === 'most_subjects') {
    grades = grades.slice().sort((a: any, b: any) => {
      const aCount = Array.isArray(a.subjects) ? a.subjects.length : (a.subjects_count || 0)
      const bCount = Array.isArray(b.subjects) ? b.subjects.length : (b.subjects_count || 0)
      return bCount - aCount
    })
  } else {
    grades = grades.slice().sort((a: any, b: any) => {
      const ta = a?.created_at ? Date.parse(String(a.created_at)) : 0
      const tb = b?.created_at ? Date.parse(String(b.created_at)) : 0
      return tb - ta
    })
  }
  return grades
})

async function loadGradesByLevel() {
  loading.value = true
  error.value = false
  try {
    const levelId = userProfile.value?.level?.id || userProfile.value?.level_id
    if (!levelId) {
      // fallback: fetch all grades so the page still shows content for browsing
      try {
        await taxonomy.fetchGrades()
      } catch (e) {
        // ignore
      }
      loading.value = false
      return
    }
    await taxonomy.fetchGradesByLevel(levelId)
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

// search removed for this page

onMounted(() => {
  loadGradesByLevel()
})
</script>
