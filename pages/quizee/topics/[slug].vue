<template>
  <div>
    <div class="max-w-7xl mx-auto px-4 py-6">
      <nav class="text-sm text-gray-600 mb-4">
        <NuxtLink :to="`/quizee/subjects/${topic?.subject?.slug}`" v-if="topic?.subject?.slug" class="hover:text-brand-600">{{ topic?.subject?.name || 'Subject' }}</NuxtLink>
        <span v-if="topic?.subject?.slug" class="mx-2">›</span>
        <span>{{ topic?.name || 'Topic' }}</span>
      </nav>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ topic?.name || 'Topic' }}</h1>
      <p v-if="topic?.description" class="text-gray-600 mb-6">{{ topic.description }}</p>
    </div>

    <div class="bg-gray-50 min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div v-if="loading" class="text-center py-12"><UiSkeleton :count="1" /></div>
        <div v-else-if="error" class="mt-6 text-red-600">Failed to load this topic.</div>

        <div v-else>
          <!-- Quizzes Grid -->
          <div>
            <h3 class="text-2xl font-bold text-gray-900 mb-6">Available Quizzes</h3>
            <!-- Sort pills for quizzes -->
            <div class="mb-6 flex items-center gap-3">
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
                  :class="[ 'px-3 py-1 rounded-full text-sm font-medium', sortOption === 'most_questions' ? 'bg-brand-700 text-white' : 'bg-white border border-gray-200 text-gray-700' ]"
                  @click="sortOption = 'most_questions'"
                >
                  Most questions
                </button>
              </div>
            </div>
            <div v-if="quizzesLoading" class="mt-6">
              <UiSkeleton :count="1" />
            </div>
            <div v-else-if="quizzesError" class="text-red-600">
              Failed to load quizzes.
            </div>
            <div v-else-if="quizzes.length === 0" class="p-6 border rounded-xl text-sm text-gray-600 bg-white shadow-sm">
              No quizzes found for this topic yet.
            </div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <QuizCard
                v-for="quiz in displayQuizzes"
                :key="quiz.id"
                :quiz-id="quiz.id"
                :title="quiz.title || quiz.name"
                :description="quiz.description"
                :likes="quiz.likes_count"
                :questions-count="quiz.questions_count"
                :difficulty="quiz.difficulty"
                :cover="quiz.cover_image"
                :to="`/quizee/quizzes/${quiz.slug}`"
                :quiz="quiz"
              />
            </div>
            <div v-if="quizzesPaginator && (quizzesPaginator.last_page || 1) > 1" class="mt-8">
              <Pagination :paginator="quizzesPaginator" @change-page="onPageChange" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import useApi from '~/composables/useApi'
import useSeo from '~/composables/useSeo'
import QuizCard from '~/components/ui/QuizCard.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import Pagination from '~/components/Pagination.vue'

definePageMeta({
  layout: 'quizee',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Explore this topic and take related quizzes.' }
  ]
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const api = useApi()
const seo = useSeo()

const slug = computed(() => route.params.slug)
const loading = ref(false)
const error = ref(false)
const topic = ref<any>(null)

const quizzes = ref<any[]>([])
const sortOption = ref('newest')
const quizzesLoading = ref(false)
const quizzesError = ref(false)
const quizzesPaginator = ref<any>(null)
const page = ref(Number(route.query.page) || 1)

async function fetchTopic() {
  loading.value = true
  error.value = false
  try {
    const res = await api.get(`/api/topics?slug=${slug.value}`)
    if (!res.ok) {
      error.value = true
      loading.value = false
      return
    }
    const data = await res.json()
    topic.value = (Array.isArray(data.data) ? data.data[0] : data.data) || data.topic || data
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

async function fetchQuizzes(requestedPage = page.value) {
  if (!topic.value?.id) return
  quizzesLoading.value = true
  quizzesError.value = false
  try {
    const query = new URLSearchParams({ page: requestedPage.toString() })
    const res = await api.get(`/api/topics/${topic.value.id}/quizzes?${query}`)
    if (!res.ok) {
      quizzesError.value = true
      return
    }
    const data = await api.parseResponse(res)
    // Backend returns { quizzes: { data: [...], meta: {...} } } (Laravel paginator)
    const paginatedQuizzes = data?.quizzes || data?.data || data || {}
    const items = paginatedQuizzes.data || paginatedQuizzes.items || paginatedQuizzes.quizzes || []
    const meta = paginatedQuizzes.meta || {
      current_page: paginatedQuizzes.current_page ?? requestedPage,
      last_page: paginatedQuizzes.last_page ?? 1,
      per_page: paginatedQuizzes.per_page ?? (Array.isArray(items) ? items.length : 0),
      total: paginatedQuizzes.total ?? (Array.isArray(items) ? items.length : 0)
    }
    quizzes.value = Array.isArray(items) ? items : []
    quizzesPaginator.value = meta
  } catch (e) {
    console.error('Error fetching quizzes:', e)
    quizzesError.value = true
  } finally {
    quizzesLoading.value = false
  }
}

// search removed for topic detail

const displayQuizzes = computed(() => {
  let arr = Array.isArray(quizzes.value) ? quizzes.value.slice() : []
  const s = sortOption.value
  if (s === 'name') {
    arr.sort((a: any, b: any) => String(a.title || a.name || '').localeCompare(String(b.title || b.name || '')))
  } else if (s === 'most_questions') {
    arr.sort((a: any, b: any) => Number(b.questions_count || 0) - Number(a.questions_count || 0))
  } else {
    arr.sort((a: any, b: any) => {
      const ta = a?.created_at ? Date.parse(String(a.created_at)) : 0
      const tb = b?.created_at ? Date.parse(String(b.created_at)) : 0
      return tb - ta
    })
  }
  return arr
})

onMounted(async () => {
  if (slug.value) {
    await fetchTopic()
    if (topic.value) {
      fetchQuizzes(page.value)
      
      // Setup SEO for topic page
      if (topic.value?.id && topic.value?.slug) {
        seo.setupPageSeo(
          {
            id: topic.value.id,
            name: topic.value.name || 'Topic',
            slug: topic.value.slug,
            description: topic.value.description || topic.value.summary
          },
          'topic',
          window.location.origin
        )
      }
    }
  }
})

function onPageChange(p: number) {
  if (!p || p < 1 || p === page.value) return
  const q = { ...route.query }
  q.page = String(p)
  router.push({ path: route.path, query: q })
}

watch(() => route.query.page, (val) => {
  const next = Math.max(1, Number(val) || 1)
  if (next === page.value) return
  page.value = next
  fetchQuizzes(page.value)
})
</script>
