<template>
  <div>
    <PageHero :title="topic.name || 'Topic'" :description="`Assessments for ${topic.name || ''}`" padding="py-8 sm:py-12" :showSearch="true">
      <template #actions>
        <!-- Search is handled by PageHero's built-in search input -->
      </template>
    </PageHero>

    <div class="bg-gray-50 min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div v-if="loading" class="mt-6"><UiSkeleton :count="1" /></div>
        <div v-else-if="error" class="mt-6 text-red-600">Failed to load quizzes for this topic.</div>

        <div v-else>
          <div v-if="normalizedQuizzes.length === 0" class="p-6 border rounded-lg text-sm text-gray-600 bg-white rounded-xl shadow-sm">No assessments found for this topic.</div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <UiQuizCard
              v-for="qz in displayQuizzes"
              :key="qz.id"
              :quiz="qz"
              :to="`/quizzes/${qz.slug}`"
              :quiz-id="qz.id"
              :liked="qz.liked"
              :likes="qz.likes_count"
              :title="qz.title"
              :startLink="`/quizzes/${qz.slug}`"
              :grade="qz.grade_name"
              :subject="qz.subject_name"
              :topic="qz.topic_name"
              :description="qz.description || ''"
              :show-grade="true"
              :show-subject="true"
              :show-topic="true"
              @like="onQuizLike(qz, $event)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PageHero from '~/components/ui/PageHero.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import UiQuizCard from '~/components/ui/QuizCard.vue'
import { ref, onMounted, computed } from 'vue'
import useApi from '~/composables/useApi'
import useQuizzes from '~/composables/useQuizzes'

const route = useRoute()
const slug = computed(() => route.params.slug)
const { normalizedQuizzes, fetchItems, loading: quizzesLoading } = useQuizzes()

const query = ref('')
const displayQuizzes = computed(() => {
  const q = String(query.value || '').toLowerCase().trim()
  if (!q) return normalizedQuizzes.value
  return (normalizedQuizzes.value || []).filter(qz => (qz.title || '').toLowerCase().includes(q) || (qz.description || '').toLowerCase().includes(q) || String(qz.id || '').includes(q))
})

const topic = ref({})
const topicLoading = ref(true)
const error = ref(null)

const loading = computed(() => topicLoading.value || quizzesLoading.value)

onMounted(async () => {
  try {
    const api = useApi()
    // fetch topic metadata
    const topicRes = await api.get(`/api/topics?slug=${slug.value}`)
    if (!topicRes.ok) throw topicRes
    const t = await topicRes.json()
    topic.value = (t && t.topics && t.topics[0]) ? t.topics[0] : ((t && t.topic) ? t.topic : (t || {}))
    topicLoading.value = false

    // fetch quizzes for this topic using useQuizzes
    const params = { public: true }
    if (topic.value && topic.value.id) {
      params.topic_id = topic.value.id
    } else {
      const tid = Number(slug.value)
      if (!Number.isNaN(tid) && tid > 0) params.topic_id = slug.value
      else params.topic = slug.value
    }

    await fetchItems(params)
  } catch (e) {
    error.value = e
    topicLoading.value = false
  }
})

function onQuizLike(q, payload) {
  if (!q) return
  if (payload && payload.liked === true) {
    q.likes_count = (q.likes_count || 0) + 1
    q.liked = true
  } else if (payload && payload.liked === false) {
    q.likes_count = Math.max(0, (q.likes_count || 0) - 1)
    q.liked = false
  }
}

function onSearch(q) { query.value = q }
</script>
