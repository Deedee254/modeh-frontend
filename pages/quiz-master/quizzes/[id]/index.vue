<template>
  <div class="container mx-auto p-4 sm:p-6 lg:p-8">
    <div class="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold text-gray-800">{{ quiz.title || 'Quiz Details' }}</h1>
        <div class="space-x-2">
          <NuxtLink :to="`/quiz-master/quizzes/${quiz.id}/edit`" class="px-3 py-2 bg-blue-600 text-white rounded text-sm">Edit Quiz</NuxtLink>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b mb-6">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <a
            href="#"
            @click.prevent="activeTab = 'details'"
            :class="[ 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' ]"
          >
            Quiz Details
          </a>
          <a
            href="#"
            @click.prevent="activeTab = 'questions'"
            :class="[ 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'questions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' ]"
          >
            Questions
          </a>
          <a
            href="#"
            @click.prevent="activeTab = 'settings'"
            :class="[ 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'settings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' ]"
          >
            Settings
          </a>
        </nav>
      </div>

      <!-- Details -->
      <div v-show="activeTab === 'details'">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">Level</label>
            <div class="mt-1 p-2 bg-gray-50 rounded">{{ quiz.level?.name || '—' }}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Grade</label>
            <div class="mt-1 p-2 bg-gray-50 rounded">{{ quiz.grade?.name || '—' }}</div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Subject</label>
            <div class="mt-1 p-2 bg-gray-50 rounded">{{ quiz.topic?.subject?.name || quiz.subject?.name || '—' }}</div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Topic</label>
            <div class="mt-1 p-2 bg-gray-50 rounded">{{ quiz.topic?.name || '—' }}</div>
          </div>
        </div>

        <div class="mt-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Title</label>
            <div class="mt-1 p-2 bg-gray-50 rounded">{{ quiz.title }}</div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <div class="mt-1 p-3 bg-gray-50 rounded whitespace-pre-wrap">{{ quiz.description }}</div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">YouTube Video URL</label>
            <div class="mt-1 p-2 bg-gray-50 rounded">{{ quiz.youtube_url || '—' }}</div>
          </div>

              <div v-if="youtubeEmbedUrl" class="mt-2">
                <label class="block text-sm font-medium text-gray-700">YouTube Preview</label>
                <div class="mt-1">
                  <iframe :src="youtubeEmbedUrl" width="560" height="315" class="w-full h-64 rounded" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
              </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Cover Image</label>
            <div class="mt-1">
              <img v-if="quiz.cover_image" :src="quiz.cover_image" alt="Cover" class="w-32 h-32 object-cover rounded" />
              <div v-else class="w-32 h-32 bg-gray-200 rounded flex items-center justify-center text-gray-500">No image</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Questions -->
      <div v-show="activeTab === 'questions'">
        <div class="mb-2 flex items-center justify-between">
          <div class="text-sm text-gray-600">Questions: {{ quiz.questions_count ?? (quiz.questions ? quiz.questions.length : 0) }}</div>
        </div>

        <div class="space-y-4">
          <div v-for="(q, idx) in quiz.questions || []" :key="q.id || idx" class="border rounded p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="font-medium">Question {{ idx + 1 }}</div>
              <div class="text-sm text-gray-500">{{ q.marks || 0 }} marks • {{ difficultyLabel(q.difficulty) }}</div>
            </div>
            <div class="mb-3 prose max-w-none" v-html="q.question"></div>
            <div v-if="q.options && q.options.length" class="space-y-1">
              <div v-for="(opt, oidx) in q.options" :key="oidx" class="text-sm">
                <span v-if="opt.is_correct" class="font-medium text-green-600">✓ </span>
                <span v-html="opt.option"></span>
              </div>
            </div>
            <div v-if="q.explanation" class="mt-3 p-2 bg-blue-50 rounded text-sm">
              <strong>Explanation:</strong> <span v-html="q.explanation"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings -->
      <div v-show="activeTab === 'settings'">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ClientOnly>
            <div v-if="quiz.use_per_question_timer">
              <label class="block text-sm font-medium text-gray-700">Per-question time limit (seconds)</label>
              <div class="mt-1 p-2 bg-gray-50 rounded">{{ quiz.per_question_seconds || 'Not set' }}</div>
            </div>
          </ClientOnly>
          <div>
            <label class="block text-sm font-medium text-gray-700">Timer (minutes)</label>
            <div class="mt-1 p-2 bg-gray-50 rounded">{{ quiz.use_per_question_timer ? 'Disabled (per-question timer is active)' : (quiz.timer_minutes || 'No timer') }}</div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Attempts Allowed</label>
            <div class="mt-1 p-2 bg-gray-50 rounded">{{ quiz.attempts_allowed === null || quiz.attempts_allowed === '' ? 'Unlimited' : quiz.attempts_allowed }}</div>
          </div>

          <div class="col-span-1 md:col-span-2">
            <label class="block text-sm font-medium text-gray-700">Options</label>
            <div class="mt-1 space-y-1">
              <div><input type="checkbox" :checked="quiz.use_per_question_timer" disabled /> Use per-question timer</div>
              <div><input type="checkbox" :checked="quiz.shuffle_questions" disabled /> Shuffle Questions</div>
              <div><input type="checkbox" :checked="quiz.shuffle_answers" disabled /> Shuffle Answer Choices</div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Access</label>
            <div class="mt-1 p-2 bg-gray-50 rounded capitalize">{{ quiz.access === 'paywall' ? 'Premium' : quiz.access }}</div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Visibility</label>
            <div class="mt-1 p-2 bg-gray-50 rounded">{{ quiz.visibility }}</div>
            <div v-if="quiz.visibility === 'scheduled'" class="mt-2">
              <label class="block text-sm text-gray-700">Scheduled At</label>
              <div class="p-2 bg-gray-50 rounded">{{ quiz.scheduled_at }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRuntimeConfig, useRoute } from '#imports'
import { computed } from 'vue'
import useTaxonomy from '~/composables/useTaxonomy'

definePageMeta({ layout: 'quiz-master' })

const config = useRuntimeConfig()
const route = useRoute()
const id = route.params.id

const quiz = ref({})
const activeTab = ref('details')
const loading = ref(true)

// taxonomy: load levels so we can display quiz.level properly and link into edit flow
const { fetchLevels, levels } = useTaxonomy()

const youtubeEmbedUrl = computed(() => {
  const url = quiz.value?.youtube_url
  if (!url || typeof url !== 'string') return null
  try {
    // extract v= or youtu.be/ or embed/ forms
    const m1 = url.match(/[?&]v=([^&]+)/)
    if (m1 && m1[1]) return `https://www.youtube.com/embed/${m1[1]}`
    const m2 = url.match(/youtu\.be\/([^?&]+)/)
    if (m2 && m2[1]) return `https://www.youtube.com/embed/${m2[1]}`
    const m3 = url.match(/youtube\.com\/embed\/([^?&]+)/)
    if (m3 && m3[1]) return `https://www.youtube.com/embed/${m3[1]}`
    return null
  } catch (e) { return null }
})

function tabClass(tab) {
  return activeTab.value === tab
    ? 'border-blue-500 text-blue-600'
    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
}

function difficultyLabel(diff) {
  const labels = { 1: 'Easy', 2: 'Medium', 3: 'Hard' }
  return labels[diff] || 'Unknown'
}

onMounted(async () => {
  try {
    // ensure levels are loaded first so we can map level ids to names
    try { await fetchLevels() } catch (e) {}
    // Prefer the authenticated quiz-master details endpoint which includes relations
    let res = await fetch(config.public.apiBase + '/api/quizzes/' + encodeURIComponent(id) + '/detail', { credentials: 'include' })
    // fallback to public attempt-oriented endpoint if detail is not available
    if (!res.ok) {
      res = await fetch(config.public.apiBase + '/api/quizzes/' + encodeURIComponent(id), { credentials: 'include' })
    }
    if (res.ok) {
      const json = await res.json()
      const serverQuiz = json.quiz || json || {}

      // Normalize into UI-friendly shape
      const loaded = { ...serverQuiz }

      // timer_seconds -> timer_minutes for display
      const ts = serverQuiz.timer_seconds ?? serverQuiz.timer_minutes ?? null
      loaded.timer_minutes = ts ? Math.floor(Number(ts) / 60) : serverQuiz.timer_minutes ?? null

      loaded.per_question_seconds = serverQuiz.per_question_seconds ?? null
      loaded.use_per_question_timer = !!serverQuiz.use_per_question_timer

      // attempts/shuffle/access/visibility
      loaded.attempts_allowed = serverQuiz.attempts_allowed ?? serverQuiz.attempts_allowed
      loaded.shuffle_questions = typeof serverQuiz.shuffle_questions !== 'undefined' ? !!serverQuiz.shuffle_questions : !!serverQuiz.shuffle
      loaded.shuffle_answers = typeof serverQuiz.shuffle_answers !== 'undefined' ? !!serverQuiz.shuffle_answers : !!serverQuiz.shuffle_answers
      loaded.access = serverQuiz.access ?? (serverQuiz.is_paid ? 'paywall' : 'free')
      loaded.visibility = serverQuiz.visibility ?? serverQuiz.status ?? null

  // normalize taxonomy display fields (support nested objects, name-only fields, or id-only fields)
  loaded.topic_id = serverQuiz.topic_id ?? serverQuiz.topic?.id ?? serverQuiz.topicId ?? null
  loaded.subject_id = serverQuiz.subject_id ?? serverQuiz.subject?.id ?? serverQuiz.subjectId ?? null
  loaded.grade_id = serverQuiz.grade_id ?? serverQuiz.grade?.id ?? serverQuiz.gradeId ?? null
  loaded.level_id = serverQuiz.level_id ?? serverQuiz.level?.id ?? serverQuiz.levelId ?? null

  // prefer nested object if present, else use name fields if available
  loaded.topic = serverQuiz.topic || (serverQuiz.topic_name ? { id: loaded.topic_id, name: serverQuiz.topic_name } : (serverQuiz.topicName ? { id: loaded.topic_id, name: serverQuiz.topicName } : null))
  loaded.subject = serverQuiz.subject || (serverQuiz.subject_name ? { id: loaded.subject_id, name: serverQuiz.subject_name } : (serverQuiz.subjectName ? { id: loaded.subject_id, name: serverQuiz.subjectName } : null))
  loaded.grade = serverQuiz.grade || (serverQuiz.grade_name ? { id: loaded.grade_id, name: serverQuiz.grade_name } : (serverQuiz.gradeName ? { id: loaded.grade_id, name: serverQuiz.gradeName } : null))
    loaded.level = serverQuiz.level || (serverQuiz.level_name ? { id: loaded.level_id, name: serverQuiz.level_name } : (serverQuiz.levelName ? { id: loaded.level_id, name: serverQuiz.levelName } : null))

      // normalize questions shape so templates can display consistently
      loaded.questions = Array.isArray(serverQuiz.questions) ? serverQuiz.questions.map((q) => ({
        ...q,
        question: q.question || q.text || q.body || '',
        options: q.options || q.answers || q.options_list || []
      })) : []

      quiz.value = loaded
    }
  } catch (e) {
    console.error('Failed to load quiz', e)
  }
  loading.value = false
})
</script>

<style scoped>
.prose :deep(p) { margin: 0 0 0.75rem 0 }
</style>