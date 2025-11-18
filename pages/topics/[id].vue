<template>
  <div>
  <PageHero :title="topic.name || 'Topic'" :description="`Assessments for ${topic.name || ''}`" padding="py-12" :showSearch="true">
    <template #actions>
  <!-- Search is handled by PageHero's built-in search input -->
    </template>
    </PageHero>

    <div class="max-w-7xl mx-auto px-4 py-10">
      <div v-if="loading" class="mt-6"><UiSkeleton :count="6" /></div>
      <div v-else-if="error" class="mt-6 text-red-600">Failed to load quizzes for this topic.</div>

      <div v-else>
  <div v-if="quizzes.length === 0" class="p-6 border rounded-md text-sm text-gray-600 bg-white">No assessments found for this topic.</div>
  <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
          <UiQuizCard
          v-for="qz in displayQuizzes"
          :key="qz.id"
          :to="`/quizee/quizzes/${qz.id}`"
          :quiz-id="qz.id"
          :liked="qz.liked"
          :likes="qz.likes_count ?? qz.likes ?? 0"
          :title="qz.title"
          :startLink="`/quizee/quizzes/${qz.id}`"
          :grade="qz.grade"
          :subject="qz.subject"
          :topic="qz.topic"
          :description="qz.description || qz.summary || ''"
          :show-grade="true"
          :show-subject="true"
          :show-topic="true"
          @like="onQuizLike(qz, $event)"
        />
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PageHero from '~/components/ui/PageHero.vue'
// HeroFilterBar removed — PageHero provides built-in search
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import UiQuizCard from '~/components/ui/QuizCard.vue'
import { ref, onMounted } from 'vue'
import useApi from '~/composables/useApi'
import { getHeroClass } from '~/utils/heroPalettes'

const route = useRoute()
const topicId = route.params.id
const config = useRuntimeConfig()
const quizzes = ref([])
const query = ref('')

const displayQuizzes = computed(() => {
  const q = String(query.value || '').toLowerCase().trim()
  if (!q) return quizzes.value
  return (quizzes.value || []).filter(qz => (qz.title || '').toLowerCase().includes(q) || (qz.description || '').toLowerCase().includes(q) || String(qz.id || '').includes(q))
})
const topic = ref({})
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
  // fetch topic metadata using shared API composable (preserves auth/session)
  const api = useApi()
  const topicRes = await api.get(`/api/topics/${topicId}`)
  if (!topicRes.ok) throw topicRes
  const t = await topicRes.json()
  topic.value = (t && t.topic) ? t.topic : (t || {})

    // fetch quizzes for this topic and normalize paginator vs array
    // prefer numeric topic_id (from fetched topic) otherwise fall back to the route param
    const quizParams = {}
    if (topic.value && topic.value.id) {
      quizParams.topic_id = topic.value.id
    } else {
      const tid = Number(topicId)
      if (!Number.isNaN(tid) && tid > 0) quizParams.topic_id = topicId
      else quizParams.topic = topicId
    }

  // Build query string and fetch quizzes through the shared API (includes cookies)
  const qs = new URLSearchParams()
  Object.keys(quizParams).forEach(k => { if (quizParams[k] !== undefined && quizParams[k] !== null) qs.set(k, String(quizParams[k])) })
  const quizzesRes = await api.get(`/api/quizzes?${qs.toString()}`)
  if (!quizzesRes.ok) throw quizzesRes
  const res = await quizzesRes.json()
  const raw = (res && res.quizzes && Array.isArray(res.quizzes.data)) ? res.quizzes.data : (Array.isArray(res?.quizzes) ? res.quizzes : (Array.isArray(res) ? res : []))
    quizzes.value = raw.map(q => ({
      ...q,
      // normalize nested topic/subject/grade
      topic: q.topic && (q.topic.name || q.topic.title) ? q.topic.name || q.topic.title : (typeof q.topic === 'string' ? q.topic : ''),
      subject: q.topic && q.topic.subject && (q.topic.subject.name || q.topic.subject.title) ? (q.topic.subject.name || q.topic.subject.title) : (q.subject || ''),
      grade: q.topic && q.topic.subject && q.topic.subject.grade_id ? q.topic.subject.grade_id : (q.grade || q.grade_id || ''),
      questions_count: q.questions_count || q.questions || 0,
      likes_count: q.likes_count || q.likes || 0,
      liked: !!q.liked,
      // explicit links (fallback to id-based routes)
      takeLink: q.take_path || q.take_link || `/quizee/quizzes/take/${q.id}`,
      startLink: q.view_path || q.view_link || `/quizee/quizzes/${q.id}`
    }))
  } catch (e) {
    error.value = e
  } finally {
    loading.value = false
  }
})

function onQuizLike(q, payload) {
  try {
    if (!q) return
    if (payload && payload.liked === true) {
      q.likes_count = (q.likes_count || q.likes || 0) + 1
      q.liked = true
    } else if (payload && payload.liked === false) {
      q.likes_count = Math.max(0, (q.likes_count || q.likes || 0) - 1)
      q.liked = false
    }
  } catch (e) {}
}

function onSearch(q) { query.value = q }
</script>
