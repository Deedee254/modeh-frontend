<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Available Quizzes</h1>
      <p class="text-gray-600">Test your knowledge and earn points!</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1 relative">
          <svg class="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input v-model="q" @keyup.enter="fetchItems" placeholder="Search quizzes..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
        <select v-model.number="perPage" @change="fetchItems" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          <option :value="5">5 per page</option>
          <option :value="10">10 per page</option>
          <option :value="20">20 per page</option>
        </select>
        <select v-model.number="topicId" @change="fetchItems" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          <option :value="0">All topics</option>
          <option v-for="t in topics" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <UiSkeleton v-for="i in 3" :key="i" class="h-32 rounded-lg" />
    </div>

    <!-- Results -->
    <div v-else>
      <div v-if="!paginator?.data || paginator.data.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No quizzes found</h3>
        <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <QuizCard
          v-for="qitem in normalizedQuizzes"
          :key="qitem.id || qitem.quiz_id"
          :to="`/quizee/quizzes/take/${qitem.id}`"
          :title="qitem.title"
          :topic="qitem.topic?.name || qitem.topic_name || 'General'"
          :cover="qitem.cover_image || qitem.cover || qitem.image || ''"
          :marks="qitem.marks"
          :difficulty="qitem.difficulty"
          :quiz-master="qitem.quiz-master?.name || qitem.user?.name"
          :palette="pickPaletteClass(qitem.topic_id || qitem.topic?.id || qitem.id)"
        />
      </div>

      <!-- Pagination -->
      <div class="mt-8" v-if="paginator?.data?.length > 0">
        <Pagination :paginator="paginator" @change-page="onPageChange" />
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'quizee' })
import { ref, onMounted } from 'vue'
import UiGrid from '~/components/ui/UiGrid.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import UiCard from '~/components/ui/UiCard.vue'
import QuizCard from '~/components/ui/QuizCard.vue'
import Pagination from '~/components/Pagination.vue'
import { useAppAlert } from '~/composables/useAppAlert'
const alert = useAppAlert()

function pickPaletteClass(id) {
  const palettes = [
    'bg-gradient-to-br from-indigo-200 via-indigo-100 to-sky-100 text-indigo-800',
    'bg-gradient-to-br from-rose-200 via-rose-100 to-pink-100 text-rose-800',
    'bg-gradient-to-br from-emerald-200 via-emerald-100 to-lime-100 text-emerald-800',
    'bg-gradient-to-br from-yellow-200 via-amber-100 to-amber-50 text-amber-800',
    'bg-gradient-to-br from-fuchsia-200 via-fuchsia-100 to-pink-50 text-fuchsia-800',
    'bg-gradient-to-br from-sky-200 via-sky-100 to-indigo-50 text-sky-800'
  ]
  return palettes[(id || 0) % palettes.length]
}

const paginator = ref(null)
const topics = ref([])
const loading = ref(false)
const q = ref('')
const perPage = ref(10)
const page = ref(1)
const topicId = ref(0)

const normalizedQuizzes = computed(() => {
  const raw = paginator.value?.data || paginator.value || []
  if (!Array.isArray(raw)) return []
  return raw.map(item => ({
    ...item,
    id: item?.id ?? item?.quiz_id ?? item?.quiz?.id ?? null
  }))
})

onMounted(async () => { await Promise.all([fetchItems(), fetchTopics()]) })

async function fetchTopics() {
  try {
    const res = await fetch(useRuntimeConfig().public.apiBase + '/api/topics?approved=1', { credentials: 'include' })
    if (res.ok) {
      const json = await res.json()
      topics.value = json.topics || json.data || []
    }
  } catch (e) {}
}

async function fetchItems() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (q.value) params.set('q', q.value)
    if (topicId.value) params.set('topic_id', topicId.value)
    params.set('per_page', perPage.value)
    params.set('page', page.value)
    const res = await fetch(useRuntimeConfig().public.apiBase + '/api/quizzes?approved=1&' + params.toString(), { credentials: 'include' })
    if (res.ok) {
      const json = await res.json()
      paginator.value = json.quizzes || json.data || json
    } else {
      alert.push({ type: 'error', message: 'Failed to load quizzes', icon: 'heroicons:exclamation-circle' })
    }
  } catch (e) {
  alert.push({ type: 'error', message: 'Network error', icon: 'heroicons:x-circle' })
  }
  loading.value = false
}

function onPageChange(p) { page.value = p; fetchItems() }
</script>

<style scoped></style>