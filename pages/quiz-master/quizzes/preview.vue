<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-5xl mx-auto space-y-6">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">Preview Quiz</h1>
            <p class="text-sm text-gray-500">Review your quiz settings and questions before saving.</p>
          </div>
          <div class="flex items-center gap-3">
            <UButton size="sm" color="white" @click="editQuiz">Edit</UButton>
            <UButton size="sm" color="primary" :loading="saving" @click="saveQuiz">Save Quiz</UButton>
          </div>
        </div>

        <div class="mt-4">
          <div class="bg-gray-50 rounded-lg p-4">
            <nav class="flex space-x-4" aria-label="Tabs">
              <button @click="activeTab = 'details'" :class="tabClass('details')">Details</button>
              <button @click="activeTab = 'questions'" :class="tabClass('questions')">Questions ({{ questions.length }})</button>
            </nav>
          </div>

          <div class="mt-6 bg-white rounded-lg p-6 border">
            <div v-if="activeTab === 'details'">
              <h3 class="text-lg font-semibold mb-2">Quiz details</h3>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div class="text-xs text-gray-500">Title</div>
                  <div class="font-medium text-gray-900">{{ draft.title }}</div>
                </div>
                <div>
                  <div class="text-xs text-gray-500">Topic</div>
                  <div class="font-medium text-gray-900">{{ topicName }}</div>
                </div>
                <div>
                  <div class="text-xs text-gray-500">Time limit</div>
                  <div class="font-medium text-gray-900">{{ draft.timer_minutes || 'None' }}</div>
                </div>
                <div>
                  <div class="text-xs text-gray-500">Attempts</div>
                  <div class="font-medium text-gray-900">{{ draft.attempts_allowed || 1 }}</div>
                </div>
                <div class="sm:col-span-2">
                  <div class="text-xs text-gray-500">Description</div>
                  <div class="prose max-w-none" v-html="draft.description"></div>
                </div>
              </div>
            </div>

            <div v-else>
              <h3 class="text-lg font-semibold mb-4">Questions</h3>
              <div class="space-y-4">
                <div v-for="(q, idx) in questions" :key="q.uid" class="rounded-lg border p-4 bg-gray-50">
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="text-sm text-gray-500">Question {{ idx + 1 }}</div>
                      <div class="mt-2 text-gray-900" v-html="q.text || q.body"></div>
                    </div>
                    <div class="text-sm text-gray-600">Difficulty: {{ q.difficulty }}</div>
                  </div>

                  <div class="mt-3">
                    <div v-if="q.media || q.image_url || q.audio_url || q.video_url" class="mb-3">
                      <div v-if="q.image_url || q.media" class="mb-2">
                        <img :src="q.image_url || q.media" class="max-w-full rounded" />
                      </div>
                      <div v-if="q.audio_url" class="mb-2">
                        <audio controls :src="q.audio_url" class="w-full"></audio>
                      </div>
                      <div v-if="q.video_url" class="mb-2">
                        <iframe :src="formatYouTubeUrl(q.video_url)" class="w-full aspect-video" frameborder="0" allowfullscreen></iframe>
                      </div>
                    </div>

                    <div v-if="q.options && q.options.length">
                      <div class="text-sm text-gray-500 mb-1">Options</div>
                      <ul class="list-disc list-inside space-y-1">
                        <li v-for="(opt, oi) in q.options" :key="oi" v-html="opt"></li>
                      </ul>
                    </div>

                    <div v-if="q.answers && q.answers.length" class="mt-2 text-sm text-gray-600">
                      <div class="text-xs text-gray-500">Answers</div>
                      <div class="font-medium">{{ q.answers.join(', ') }}</div>
                    </div>

                    <div v-if="q.explanation" class="mt-3 text-sm text-gray-700">
                      <div class="text-xs text-gray-500">Explanation</div>
                      <div v-html="q.explanation"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRuntimeConfig } from '#imports'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'
const router = useRouter()
const cfg = useRuntimeConfig()

const activeTab = ref('details')
const saving = ref(false)
const draft = ref({})
const questions = ref([])
const api = useApi()

function tabClass(name) {
  return [
    'px-3 py-2 rounded-md text-sm font-medium',
    activeTab.value === name ? 'bg-white border border-gray-200 text-indigo-700' : 'text-gray-600 hover:text-gray-800'
  ].join(' ')
}

function editQuiz() {
  router.push('/quiz-master/quizzes/create')
}

function formatYouTubeUrl(u) {
  if (!u) return ''
  if (u.includes('youtube') || u.includes('youtu.be')) {
    // quick embed conversion
    try {
      const id = u.split('v=')[1] || u.split('/').pop()
      return `https://www.youtube.com/embed/${id}`
    } catch (e) { return u }
  }
  return u
}

async function saveQuiz() {
  saving.value = true
  try {
    // Draft holds quiz fields; questions array may contain files references in window._tmpFiles
    // Upload remaining files referenced in questions
    const filesMap = window._tmpFiles || {}
    // Build final FormData and post to /api/quizzes. Attach any question files as question_media[...] so backend stores them.
    const fd = new FormData()
    const fields = ['topic_id','title','description','youtube_url','timer_minutes','attempts_allowed','shuffle_questions','shuffle_answers','access','visibility']
    fields.forEach(f => { if (draft.value[f] !== undefined && draft.value[f] !== null) fd.append(f, String(draft.value[f])) })

    // Attach any files used as top-level quiz cover
    if (draft.value.cover && window._tmpFiles && window._tmpFiles[draft.value.cover]) {
      fd.append('cover', window._tmpFiles[draft.value.cover])
    }

    // Attach per-question files under question_media[index] or question_media[uid]
    const mediaMap = window._tmpFiles || {}
    const questionsCopy = JSON.parse(JSON.stringify(questions.value))
    for (let i = 0; i < questionsCopy.length; i++) {
      const q = questionsCopy[i]
      // if original in-memory had file refs, attach them
      if (q._imageFileKey && mediaMap[q._imageFileKey]) {
        // prefer uid key when available
        const key = q.uid ?? i
        fd.append(`question_media[${key}]`, mediaMap[q._imageFileKey])
        // remove temporary key before sending JSON
        delete q._imageFileKey
      }
      if (q._audioFileKey && mediaMap[q._audioFileKey]) {
        const key = q.uid ?? i
        fd.append(`question_media[${key}]`, mediaMap[q._audioFileKey])
        delete q._audioFileKey
      }
    }

    fd.append('questions', JSON.stringify(questionsCopy))

    const res = await api.postFormData('/api/quizzes', fd)
    if (api.handleAuthStatus(res)) return
    if (res.ok) {
      // clear temp store
      try { sessionStorage.removeItem('quiz:draft') } catch(e){}
      window._tmpFiles = {}
      const alert = useAppAlert(); alert.push({ message: 'Quiz saved', type: 'success' })
      router.push('/quiz-master/quizzes')
    } else {
      const t = await res.text().catch(()=>'')
      const alert = useAppAlert(); alert.push({ message: 'Failed to save quiz: ' + t, type: 'error' })
    }
  } catch (e) {
    const alert = useAppAlert(); alert.push({ message: 'Network error', type: 'error' })
  } finally {
    saving.value = false
  }
}

async function uploadFile(file, type = 'file') {
  try {
    const fdata = new FormData()
    fdata.append('file', file)
    fdata.append('type', type)
    const res = await api.postFormData('/api/uploads', fdata)
    if (api.handleAuthStatus(res)) return null
    if (res.ok) return await res.json()
  } catch (e) {}
  return null
}

onMounted(() => {
  try {
    const raw = sessionStorage.getItem('quiz:draft')
    if (raw) {
      const parsed = JSON.parse(raw)
      draft.value = parsed.form || {}
      questions.value = parsed.questions || []
    }
  } catch (e) {}
})
</script>

<style scoped>
/* Minimal styling to match quiz-master look */
</style>
