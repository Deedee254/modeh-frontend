<template>
  <div>
    <PageHero
      title="Your Grade Levels"
      description="Explore assessments and topics specific to your grade level."
      :flush="true"
    >
      <template #eyebrow>
        Your learning path
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
          <p class="text-xs uppercase tracking-wide text-white/70">Your level</p>
          <p class="mt-1 text-2xl font-semibold text-white">{{ userLevel }}</p>
          <p class="mt-2 text-sm text-white/70">{{ filteredGrades.length || 0 }} grade levels available</p>
        </div>
      </template>

      <template #highlight-icon>
        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h10M4 18h6" />
        </svg>
      </template>

      <template #stats>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Grades</p>
          <p class="mt-2 text-xl font-semibold">{{ filteredGrades.length || 0 }}</p>
        </div>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Subjects</p>
          <p class="mt-2 text-xl font-semibold">{{ subjectsCount }}</p>
        </div>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Topics</p>
          <p class="mt-2 text-xl font-semibold">{{ topicsCount }}</p>
        </div>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Quizzes</p>
          <p class="mt-2 text-xl font-semibold">{{ totalQuizzes }}</p>
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
            :class="[ 'px-3 py-1 rounded-full text-sm font-medium', sortOption === 'most_subjects' ? 'bg-brand-700 text-white' : 'bg-white border border-gray-200 text-gray-700' ]"
            @click="sortOption = 'most_subjects'"
          >
            Most subjects
          </button>
        </div>
      </div>
      <div v-if="loading" class="mt-6"><UiSkeleton :count="6" /></div>
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
            :to="`/quizee/grades/${grade.slug || grade.id}`"
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
import PageHero from '~/components/ui/PageHero.vue'
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
