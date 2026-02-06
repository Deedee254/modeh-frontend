
<template>
  <div class="container mx-auto p-4 sm:p-6 lg:p-8">
    <!-- Sticky Share Button -->
    <StickyShareButton
      itemType="Quiz"
      :itemId="quiz.id"
      :itemSlug="quiz.slug"
      :itemTitle="`${quiz.title} - Check it out on Modeh!`"
      :disabled="!quiz.id"
    />

    <div class="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold text-gray-800">{{ quiz.title || 'Quiz Details' }}</h1>
        <div class="space-x-2">
          <NuxtLink :to="`/quiz-master/quizzes/${quiz.slug}/edit`" class="px-3 py-2 bg-brand-600 text-white rounded text-sm">Edit Quiz</NuxtLink>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b mb-6">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <a
            href="#"
            @click.prevent="activeTab = 'details'"
            :class="[ 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'details' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' ]"
          >
            Details
          </a>
          <a
            href="#"
            @click.prevent="activeTab = 'settings'"
            :class="[ 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'settings' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' ]"
          >
            Settings
          </a>
          <a
            href="#"
            @click.prevent="activeTab = 'questions'"
            :class="[ 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'questions' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' ]"
          >
            Questions
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
              <img v-if="quiz.cover_image" :src="coverImageUrl" alt="Cover" class="w-32 h-32 object-cover rounded" />
              <div v-else class="w-32 h-32 bg-gray-200 rounded flex items-center justify-center text-gray-500">No image</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings -->
      <div v-show="activeTab === 'settings'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Timer Settings -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Timer Mode</label>
            <div class="p-3 bg-gray-50 rounded text-sm">
              <div v-if="quiz.use_per_question_timer" class="space-y-1">
                <div class="font-medium text-gray-900">Per-Question Timer</div>
                <div class="text-gray-600">{{ quiz.per_question_seconds }} seconds per question</div>
              </div>
              <div v-else class="space-y-1">
                <div class="font-medium text-gray-900">Total Timer</div>
                <div class="text-gray-600">{{ quiz.timer_minutes ? quiz.timer_minutes + ' minutes' : 'No time limit' }}</div>
              </div>
            </div>
          </div>

          <!-- Attempts Allowed -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Attempts Allowed</label>
            <div class="p-3 bg-gray-50 rounded text-sm text-gray-900">
              {{ quiz.attempts_allowed === null || quiz.attempts_allowed === '' ? 'Unlimited' : quiz.attempts_allowed }}
            </div>
          </div>

          <!-- Access Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Access</label>
            <div class="p-3 bg-gray-50 rounded text-sm text-gray-900 capitalize">
              {{ quiz.access === 'paywall' ? 'Premium' : 'Free' }}
            </div>
          </div>

          <!-- Visibility -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
            <div class="p-3 bg-gray-50 rounded text-sm text-gray-900 capitalize">
              {{ quiz.visibility || 'Draft' }}
            </div>
            <div v-if="quiz.visibility === 'scheduled' && quiz.scheduled_at" class="mt-2 text-xs text-gray-600">
              Scheduled: {{ quiz.scheduled_at }}
            </div>
          </div>
        </div>

        <!-- Boolean Options -->
        <div class="border-t pt-6">
          <label class="block text-sm font-medium text-gray-700 mb-4">Options</label>
          <div class="space-y-3">
            <div class="flex items-center p-3 bg-gray-50 rounded">
              <Icon 
                :name="quiz.shuffle_questions ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                :class="quiz.shuffle_questions ? 'text-green-600' : 'text-gray-400'"
                class="w-5 h-5 mr-3"
              />
              <span class="text-sm text-gray-900">Shuffle Questions</span>
            </div>
            <div class="flex items-center p-3 bg-gray-50 rounded">
              <Icon 
                :name="quiz.shuffle_answers ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                :class="quiz.shuffle_answers ? 'text-green-600' : 'text-gray-400'"
                class="w-5 h-5 mr-3"
              />
              <span class="text-sm text-gray-900">Shuffle Answer Choices</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Questions -->
      <div v-show="activeTab === 'questions'">
        <div class="mb-6 flex items-center justify-between">
          <div class="text-sm text-gray-600 font-medium">Questions: {{ quiz.questions_count ?? (quiz.questions ? quiz.questions.length : 0) }}</div>
          <NuxtLink :to="`/quiz-master/quizzes/${quiz.slug}/edit`" class="px-4 py-2 bg-brand-600 text-white rounded text-sm font-medium hover:bg-brand-700 transition">
            Add Question
          </NuxtLink>
        </div>

        <div v-if="!quiz.questions || quiz.questions.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
          <Icon name="heroicons:inbox-20-solid" class="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p class="text-gray-600 font-medium">No questions yet</p>
          <p class="text-gray-500 text-sm mt-1">Add questions to get started</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="(q, idx) in quiz.questions" :key="q.id || idx" class="border rounded-lg p-5 hover:shadow-md transition bg-white">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <div class="font-semibold text-gray-900">Question {{ idx + 1 }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ q.marks || 0 }} marks • {{ difficultyLabel(q.difficulty) }}</div>
              </div>
              <div class="flex gap-2 ml-4 flex-shrink-0">
                <button
                  @click="editQuestion(q, idx)"
                  class="px-3 py-1.5 bg-blue-100 text-blue-600 rounded text-sm font-medium hover:bg-blue-200 transition"
                >
                  Edit
                </button>
                <button
                  @click="deleteQuestion(idx)"
                  class="px-3 py-1.5 bg-red-100 text-red-600 rounded text-sm font-medium hover:bg-red-200 transition"
                >
                  Delete
                </button>
              </div>
            </div>

            <!-- Question Body -->
            <div class="mb-3 prose prose-sm max-w-none text-gray-800" v-html="q.body || ''"></div>

            <!-- Options/Answers Display -->
            <div v-if="(q.options && q.options.length) || (q.answers && q.answers.length)" class="space-y-2 mt-4 bg-gray-50 p-3 rounded">
              <div v-for="(opt, oidx) in (q.options || [])" :key="oidx" class="text-sm text-gray-700 flex items-start">
                <span v-if="(opt && opt.is_correct) || (Array.isArray(q.answers) && q.answers.includes(String(oidx)))" class="font-bold text-green-600 mr-2">✓</span>
                <span v-else class="text-gray-400 mr-2">○</span>
                <span v-html="(opt && opt.text) || String(opt || '')"></span>
              </div>
              <!-- Fallback: when answers exist but no options -->
              <div v-if="(!q.options || !q.options.length) && q.answers && q.answers.length" class="text-sm text-gray-700">
                <div v-for="(a, ai) in q.answers" :key="ai" class="flex items-start">
                  <span class="font-bold text-green-600 mr-2">✓</span>
                  {{ a }}
                </div>
              </div>
            </div>

            <!-- Explanation -->
            <div v-if="q.explanation" class="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div class="text-xs font-semibold text-amber-900 mb-1">Explanation</div>
              <div class="text-sm text-amber-900 prose prose-sm max-w-none" v-html="q.explanation"></div>
            </div>

            <!-- Media Display -->
            <div v-if="q.media || q.youtube_url" class="mt-4">
              <div v-if="q.youtube_url" class="space-y-2">
                <div class="text-xs font-semibold text-gray-600">Video</div>
                <iframe 
                  v-if="extractYoutubeId(q.youtube_url)" 
                  :src="`https://www.youtube.com/embed/${extractYoutubeId(q.youtube_url)}`"
                  class="w-full h-48 rounded"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen>
                </iframe>
              </div>
              <div v-if="q.media" class="space-y-2">
                <div class="text-xs font-semibold text-gray-600">Media</div>
                <img v-if="q.media_type === 'image'" :src="q.media" class="max-w-xs rounded" />
                <audio v-else-if="q.media_type === 'audio'" :src="q.media" controls class="w-full max-w-xs"></audio>
                <video v-else-if="q.media_type === 'video'" :src="q.media" controls class="max-w-xs rounded"></video>
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
import { useRuntimeConfig, useRoute, navigateTo } from '#imports'
import useApi from '~/composables/useApi'
import useSeo from '~/composables/useSeo'
import { computed } from 'vue'
import useTaxonomy from '~/composables/useTaxonomy'
import { useAppAlert } from '~/composables/useAppAlert'

definePageMeta({ layout: 'quiz-master', meta: [ { name: 'robots', content: 'noindex, nofollow' }, { name: 'description', content: 'Quiz details (quiz-master view) — manage quiz settings and preview.' } ] })

const config = useRuntimeConfig()
const route = useRoute()
const slug = route.params.slug

const quiz = ref({})
const activeTab = ref('details')
const loading = ref(true)

const alert = useAppAlert()

// taxonomy: load levels so we can display quiz.level properly and link into edit flow
const { fetchLevels, levels } = useTaxonomy()
const api = useApi()
const seo = useSeo()

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

function resolveAssetUrl(value) {
  if (!value || typeof value !== 'string') return null
  if (/^(?:https?:)?\/\//.test(value)) return value
  if (/^(?:data:|blob:)/.test(value)) return value
  const base = config?.public?.apiBase || ''
  if (!base) return value.startsWith('/') ? value : `/${value}`
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
  const cleanPath = value.startsWith('/') ? value : `/${value}`
  return `${cleanBase}${cleanPath}`
}

const coverImageUrl = computed(() => {
  const stored = quiz.value?.cover_image
  if (typeof stored === 'string' && stored) return resolveAssetUrl(stored)
  return null
})

function tabClass(tab) {
  return activeTab.value === tab
    ? 'border-brand-500 text-brand-600'
    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
}

function difficultyLabel(diff) {
  const labels = { 1: 'Easy', 2: 'Medium', 3: 'Hard', 4: 'Very Hard', 5: 'Expert' }
  return labels[diff] || 'Unknown'
}

function extractYoutubeId(url) {
  if (!url || typeof url !== 'string') return null
  const m1 = url.match(/[?&]v=([^&]+)/)
  if (m1 && m1[1]) return m1[1]
  const m2 = url.match(/youtu\.be\/([^?&]+)/)
  if (m2 && m2[1]) return m2[1]
  const m3 = url.match(/youtube\.com\/embed\/([^?&]+)/)
  if (m3 && m3[1]) return m3[1]
  return null
}

function editQuestion(question, index) {
  // Redirect to edit page where all questions can be edited
  navigateTo(`/quiz-master/quizzes/${quiz.value.slug}/edit?focus=${index}`)
}

async function deleteQuestion(index) {
  if (!confirm('Delete this question?')) return
  
  const q = quiz.value.questions[index]
  if (!q?.id) {
    alert('Cannot delete unsaved question')
    return
  }
  
  try {
    const res = await api.delete(`/api/questions/${q.id}`)
    if (api.handleAuthStatus(res)) return
    if (res.ok) {
      quiz.value.questions.splice(index, 1)
      quiz.value.questions_count = (quiz.value.questions_count || 0) - 1
      alert.push({ type: 'success', message: 'Question deleted', icon: 'heroicons:check-circle' })
    } else {
      alert.push({ type: 'error', message: 'Failed to delete question', icon: 'heroicons:exclamation-circle' })
    }
  } catch (e) {
    alert.push({ type: 'error', message: 'Network error', icon: 'heroicons:x-circle' })
  }
}

async function loadQuiz() {
  loading.value = true
  try {
    // Parallelize levels loading and quiz fetching
    const [_, res] = await Promise.all([
      fetchLevels().catch(() => {}),
      api.get(`/api/quizzes?slug=${encodeURIComponent(slug)}`)
    ])
    
    if (api.handleAuthStatus(res)) return
    if (res && res.ok) {
      const json = await res.json()
      const serverQuiz = (Array.isArray(json?.data) ? json.data[0] : json?.data) || json?.quiz || {}

      // Normalize into UI-friendly shape
      const loaded = { ...serverQuiz }

      // timer_seconds -> timer_minutes for display
      const ts = serverQuiz.timer_seconds ?? serverQuiz.timer_minutes ?? null
      loaded.timer_minutes = ts ? Math.floor(Number(ts) / 60) : serverQuiz.timer_minutes ?? null

      // Handle per-question timer settings
      loaded.per_question_seconds = serverQuiz.per_question_seconds ?? null
      loaded.use_per_question_timer = Boolean(serverQuiz.use_per_question_timer)

      // Normalize attempts and shuffle settings - handle both boolean and string values
      loaded.attempts_allowed = serverQuiz.attempts_allowed
      
      // Convert string "1"/"0" or number 1/0 to proper boolean
      const normalizeBoolean = (val) => {
        if (typeof val === 'boolean') return val
        if (typeof val === 'string') return val === '1' || val === 'true'
        if (typeof val === 'number') return val === 1
        return Boolean(val)
      }
      
      loaded.shuffle_questions = normalizeBoolean(serverQuiz.shuffle_questions)
      loaded.shuffle_answers = normalizeBoolean(serverQuiz.shuffle_answers)
      
      loaded.access = serverQuiz.access ?? (serverQuiz.is_paid ? 'paywall' : 'free')
      loaded.visibility = serverQuiz.visibility ?? serverQuiz.status ?? null

  // normalize taxonomy display fields (support nested objects, name-only fields, or id-only fields)
  loaded.topic_id = serverQuiz.topic_id ?? serverQuiz.topic?.id ?? serverQuiz.topicId ?? null
  loaded.subject_id = serverQuiz.subject_id ?? serverQuiz.subject?.id ?? serverQuiz.subjectId ?? null
  loaded.grade_id = serverQuiz.grade_id ?? serverQuiz.grade?.id ?? serverQuiz.gradeId ?? null
  // accept level coming either as top-level level or nested under grade.level
  loaded.level_id = serverQuiz.level_id ?? serverQuiz.level?.id ?? serverQuiz.grade?.level?.id ?? serverQuiz.levelId ?? null

  // prefer nested object if present, else use name fields if available
  loaded.topic = serverQuiz.topic || (serverQuiz.topic_name ? { id: loaded.topic_id, name: serverQuiz.topic_name } : (serverQuiz.topicName ? { id: loaded.topic_id, name: serverQuiz.topicName } : null))
  loaded.subject = serverQuiz.subject || (serverQuiz.subject_name ? { id: loaded.subject_id, name: serverQuiz.subject_name } : (serverQuiz.subjectName ? { id: loaded.subject_id, name: serverQuiz.subjectName } : null))
  loaded.grade = serverQuiz.grade || (serverQuiz.grade_name ? { id: loaded.grade_id, name: serverQuiz.grade_name } : (serverQuiz.gradeName ? { id: loaded.grade_id, name: serverQuiz.gradeName } : null))
  loaded.level = serverQuiz.level || serverQuiz.grade?.level || (serverQuiz.level_name ? { id: loaded.level_id, name: serverQuiz.level_name } : (serverQuiz.levelName ? { id: loaded.level_id, name: serverQuiz.levelName } : null))

      // Fetch questions separately since index endpoint doesn't include them
      loaded.questions = []
      if (loaded.id) {
        try {
          // Use the authenticated questions endpoint - filter by quiz_id
          const questionsRes = await api.get(`/api/questions?quiz_id=${loaded.id}&limit=1000`)
          if (questionsRes.ok) {
            const questionsJson = await questionsRes.json()
            const questionsData = questionsJson.questions || questionsJson.data || []
            
            // Store backend questions directly without transformation
            // Backend sends: body, options[].text, answers[], etc.
            loaded.questions = Array.isArray(questionsData)
              ? questionsData.map((q, qi) => {
                  const src = q || {}
                  
                  // Normalize numeric fields
                  const marks = typeof src.marks !== 'undefined' ? Number(src.marks) : (typeof src.mark !== 'undefined' ? Number(src.mark) : 1)
                  const difficulty = typeof src.difficulty !== 'undefined' ? Number(src.difficulty) : 2

                  // Normalize answers to array of string indexes (if present)
                  let answers = []
                  if (Array.isArray(src.answers) && src.answers.length) answers = src.answers.map(a => String(a))
                  else if (typeof src.answers === 'string' && src.answers.trim()) answers = [src.answers.trim()]

                  // Keep options as-is from backend (should have 'text' and 'is_correct' fields)
                  const options = Array.isArray(src.options) ? src.options : (Array.isArray(src.options_list) ? src.options_list : [])
                  
                  // Return object with canonical fields from backend
                  return {
                    id: src.id,
                    uid: src.uid || `q-${src.id ?? qi}-${Math.random().toString(36).slice(2)}`,
                    body: src.body || '',  // Backend canonical field
                    marks,
                    difficulty,
                    options,
                    answers,
                    explanation: src.explanation || '',
                    media: src.media || src.media_path || null,
                    media_type: src.media_type || null,
                    youtube_url: src.youtube_url || src.youtube || null,
                    open: true,
                  }
                })
              : []
          }
        } catch (e) {
          console.error('Failed to load questions:', e)
        }
      }

      quiz.value = loaded
      
      // Setup SEO for quiz detail page after loading
      if (loaded?.id && loaded?.slug) {
        seo.setupPageSeo(
          {
            id: loaded.id,
            name: loaded.title || loaded.name || 'Quiz',
            slug: loaded.slug,
            description: loaded.description || loaded.summary,
            image: loaded.cover_image
          },
          'quiz',
          window.location.origin
        )
      }
    }
  } catch (e) {
    console.error('Failed to load quiz', e)
    try { alert.push({ type: 'error', message: 'Failed to load quiz details' }) } catch (err) {}
  }
  loading.value = false
}

onMounted(() => {
  loadQuiz()
})
</script>

<style scoped>
.prose :deep(p) { margin: 0 0 0.75rem 0 }
</style>