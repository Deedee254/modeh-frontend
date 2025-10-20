<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto p-6 max-w-7xl grid grid-cols-1 lg:grid-cols-4 gap-6">
      <aside class="lg:col-span-1">
        <div class="sticky top-6">
          <FiltersSidebar
            :grade-options="grades"
            :subject-options="subjects"
            :grade="gradeFilter"
            :subject="subjectFilter"
            storageKey="filters:quiz-masters"
            @update:grade="val => gradeFilter = val"
            @update:subject="val => subjectFilter = val"
          />
        </div>
      </aside>

      <main class="lg:col-span-3">
      <PageHero
        :breadcrumbs="[{ text: 'Home', href: '/' }, { text: 'Quiz masters', current: true }]"
        title="Our quiz-masters"
        description="Meet our team of dedicated and experienced quiz-masters."
        align="center"
        padding="py-12"
      />

      <div v-if="pending" class="text-center text-gray-500">
        Loading quiz-masters...
      </div>
      <div v-else-if="error" class="text-center text-red-500">
        Failed to load quiz-masters. Please try again later.
      </div>
      <div v-else-if="quizMasters.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard v-for="quizMaster in quizMasters" :key="quizMaster.id" class="hover:shadow-lg transition">
          <div class="flex flex-col items-center text-center">
            <div class="w-24 h-24 rounded-full overflow-hidden mb-4">
              <img v-if="quizMaster.avatar" :src="quizMaster.avatar" :alt="quizMaster.name" class="w-full h-full object-cover">
              <div v-else class="w-full h-full bg-indigo-100 text-indigo-700 grid place-items-center font-bold text-3xl">
                {{ (quizMaster.name || '').charAt(0).toUpperCase() }}
              </div>
            </div>
            <h3 class="font-semibold text-lg text-gray-800">{{ quizMaster.name }}</h3>
            <p class="text-sm text-gray-500">{{ quizMaster.headline || 'Experienced quiz-master' }}</p>
            <p v-if="quizMaster.institution" class="text-xs text-gray-400 mt-1">
              {{ quizMaster.institution }}
            </p>
            <p v-if="quizMaster.subjects && quizMaster.subjects.length" class="mt-2 flex flex-wrap justify-center gap-1">
              <span v-for="subject in quizMaster.subjects.slice(0, 2)" :key="subject.id" class="bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {{ subject.name }}
              </span>
              <span v-if="quizMaster.subjects.length > 2" class="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                +{{ quizMaster.subjects.length - 2 }}
              </span>
            </p>
            <div class="mt-4">
              <div class="flex items-center gap-3 justify-center">
                <NuxtLink :to="`/quiz-masters/${quizMaster.id}`" class="text-indigo-600 font-medium text-sm hover:underline">
                  View Profile
                </NuxtLink>
                <button @click="() => toggleFollow(quizMaster)" :disabled="followLoading[quizMaster.id]" class="px-3 py-1 text-sm rounded-md border" :class="following[quizMaster.id] ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'">
                  <span v-if="following[quizMaster.id]">Following</span>
                  <span v-else>Follow</span>
                </button>
              </div>
            </div>
          </div>
        </UCard>
      </div>
      <div v-else class="text-center text-gray-500">
        No quiz-masters found.
      </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import PageHero from '~/components/ui/PageHero.vue'
import FiltersSidebar from '~/components/FiltersSidebar.vue'
import { ref, computed, watch } from 'vue'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import useTaxonomy from '~/composables/useTaxonomy'

const config = useRuntimeConfig()

// --- Filtering ---
const gradeFilter = ref('')
const subjectFilter = ref('')
const { grades, subjects, fetchGrades, fetchAllSubjects } = useTaxonomy()

onMounted(async () => {
  await Promise.all([fetchGrades(), fetchAllSubjects()])
})

const filterParams = computed(() => {
  const params = {}
  if (gradeFilter.value) params.grade_id = gradeFilter.value
  if (subjectFilter.value) params.subject_id = subjectFilter.value
  return params
})

// --- Data Fetching ---
const { data: quizMastersData, pending, error } = await useAsyncData(
  'quiz-masters',
  () => $fetch(config.public.apiBase + '/api/quiz-masters', { params: filterParams.value }),
  { watch: [filterParams] }
)

const quizMasters = computed(() => {
  if (!quizMastersData.value) return []
  // Handle paginated response
  return quizMastersData.value.data || []
})

// --- Follow Logic ---
const following = ref({})
const followLoading = ref({})
const auth = useAuthStore()
const router = useRouter()
const api = useApi()
const alert = useAppAlert()

async function toggleFollow(quizMaster) {
  if (!auth.user) return router.push('/login')
  const id = quizMaster.id
  const current = !!following.value[id]
  // optimistic
  following.value = { ...following.value, [id]: !current }
  followLoading.value = { ...followLoading.value, [id]: true }
  try {
    let res
    if (!current) {
      res = await api.postJson(`/api/quiz-masters/${id}/follow`, {})
    } else {
      res = await api.postJson(`/api/quiz-masters/${id}/unfollow`, {})
    }
    if (api.handleAuthStatus(res)) return
    if (!res.ok) {
      // rollback
      following.value = { ...following.value, [id]: current }
      console.error('Follow toggle failed', await res.text())
      alert.push({ message: 'Failed to follow/unfollow. Please try again.', type: 'error' })
    }
  } catch (err) {
    // rollback
    following.value = { ...following.value, [id]: current }
    console.error('Follow toggle failed', err)
  } finally {
    followLoading.value = { ...followLoading.value, [id]: false }
  }
}

// initialize following map from API payload when available (if backend provides is_following)
watchEffect(() => {
  const list = quizMasters.value || []
  const map = {}
  list.forEach(q => {
    map[q.id] = !!(q.is_following || q.is_following_by_current_user || q.isFollowing || q.is_following === true)
  })
  following.value = map
})

useHead({
  title: 'Our quiz-masters',
  meta: [
    { name: 'description', content: 'Browse our list of expert quiz-masters.' }
  ]
})
</script>