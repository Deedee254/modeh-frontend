<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-6">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-lg shadow-sm border">
        <div class="p-6 border-b">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="text-xl font-semibold text-gray-900">{{ quiz.title || 'Loading...' }}</div>
              <div class="text-sm text-gray-600">{{ quiz.description }}</div>
            </div>
            <div class="text-sm px-3 py-1 rounded-full" :class="[
              quiz.value.timer_seconds && timeLeft.value < 60 
                ? 'bg-red-100 text-red-700' 
                : quiz.value.timer_seconds 
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700'
            ]">
              <span class="font-mono font-semibold">{{ displayTime }}</span>
            </div>
          </div>

          <!-- Progress bar -->
          <div v-if="!loading && quiz.questions.length > 0" class="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" :style="{ width: `${progressPercent}%` }"></div>
          </div>
          <div class="flex items-center justify-between">
            <div class="text-xs text-gray-500">
              Question {{ currentQuestion + 1 }} of {{ quiz.questions.length }}
            </div>
            <!-- Encouragement badge based on progress -->
            <div v-if="encouragementMessage" class="text-sm px-3 py-1 rounded-full bg-gradient-to-r" :class="encouragementStyle">
              {{ encouragementMessage }}
              <span v-if="currentStreak > 1" class="ml-1 font-semibold">🔥 {{ currentStreak }}</span>
            </div>
          </div>
        </div>

        <div v-if="loading" class="p-6"><UiSkeleton :count="5" /></div>

        <div v-else-if="quiz.questions.length > 0" class="p-6">
          <div class="max-w-4xl mx-auto">
            <!-- Question Card -->
            <div class="bg-white rounded-lg shadow-sm border mb-6">
              <div class="p-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <!-- Media Section -->
                  <div v-if="currentQuestionData.media" class="lg:col-span-1">
                    <div class="bg-gray-50 rounded-lg p-4 flex items-center justify-center min-h-[200px]">
                      <img :src="currentQuestionData.media" alt="Question media" class="max-w-full max-h-full object-contain rounded" />
                    </div>
                  </div>
                  <!-- Question Section -->
                  <div :class="currentQuestionData.media ? 'lg:col-span-1' : 'lg:col-span-2'">
                    <div class="font-semibold text-lg text-gray-900 mb-4">Question {{ currentQuestion + 1 }}</div>
                    <div class="text-gray-800 mb-4" v-html="currentQuestionData.body || currentQuestionData.text || currentQuestionData.question"></div>
                    <div class="space-y-3">
                      <!-- Media Section -->
                      <div v-if="currentQuestionData.media_path" class="mb-6">
                        <!-- Image -->
                        <div v-if="isImage(currentQuestionData.media_path)" class="rounded-lg overflow-hidden bg-gray-100">
                          <img :src="currentQuestionData.media_path" class="w-full h-auto max-h-96 object-contain" alt="Question media" loading="lazy" />
                        </div>
                        
                        <!-- Audio -->
                        <div v-else-if="isAudio(currentQuestionData.media_path)" class="p-4 bg-gray-100 rounded-lg">
                          <audio controls class="w-full">
                            <source :src="currentQuestionData.media_path" :type="getAudioType(currentQuestionData.media_path)">
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                        
                        <!-- YouTube Video -->
                        <div v-else-if="isYouTube(currentQuestionData.media_path)" class="aspect-video rounded-lg overflow-hidden">
                          <iframe 
                            :src="formatYouTubeUrl(currentQuestionData.media_path)"
                            class="w-full h-full"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                          ></iframe>
                        </div>
                      </div>

                      <!-- Multiple Choice Questions (MCQ, Image MCQ, Audio MCQ, Video MCQ) -->
                      <template v-if="['mcq', 'image_mcq', 'audio_mcq', 'video_mcq'].includes(currentQuestionData.type)">
                        <div v-for="(opt, i) in currentQuestionData.options" :key="i" class="flex items-center gap-3 p-3 bg-gray-50 border rounded-lg hover:bg-white cursor-pointer transition-colors" @click="selectMcq(currentQuestionData.id, opt)">
                          <input type="radio" :name="'q-'+currentQuestionData.id" :value="opt" v-model="answers[currentQuestionData.id]" @change="autosave(currentQuestionData.id)" class="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                          <span class="text-gray-700" v-html="opt?.body || opt?.text || opt"></span>
                        </div>
                      </template>

                      <!-- Multiple Select -->
                      <template v-if="currentQuestionData.type === 'multi'">
                        <div v-for="(opt, i) in currentQuestionData.options" :key="i" class="flex items-center gap-3 p-3 bg-gray-50 border rounded-lg hover:bg-white cursor-pointer transition-colors" @click="toggleMulti(currentQuestionData.id, opt)">
                          <input type="checkbox" :value="opt" @change="toggleMulti(currentQuestionData.id, opt)" :checked="(answers[currentQuestionData.id] || []).includes(opt)" class="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                          <span class="text-gray-700" v-html="opt?.body || opt?.text || opt"></span>
                        </div>
                      </template>

                      <!-- Fill in the Blanks -->
                      <template v-if="currentQuestionData.type === 'fill_blank'">
                        <div class="space-y-4">
                          <div class="prose max-w-none" v-html="formatFillBlanks(currentQuestionData.body, currentQuestionData.id)"></div>
                        </div>
                      </template>

                      <!-- Short Answer -->
                      <template v-if="currentQuestionData.type === 'short'">
                        <textarea v-model="answers[currentQuestionData.id]" @input="autosave(currentQuestionData.id)" placeholder="Type your answer here..." class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" rows="3"></textarea>
                      </template>

                      <!-- Numeric -->
                      <template v-if="currentQuestionData.type === 'numeric'">
                        <input type="number" v-model.number="answers[currentQuestionData.id]" @input="autosave(currentQuestionData.id)" placeholder="Enter a number..." class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                      </template>
                    </div>
                    <div class="text-xs text-gray-500 mt-3 flex items-center gap-1">
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                      Last saved: {{ lastSaved[currentQuestionData.id] ? new Date(lastSaved[currentQuestionData.id]).toLocaleTimeString() : 'never' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation -->
            <div class="flex items-center justify-between">
              <button type="button" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" :disabled="currentQuestion === 0" @click="previousQuestion">
                Previous
              </button>
              <div class="flex gap-2">
                <button v-if="currentQuestion < quiz.questions.length - 1" type="button" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors" @click="nextQuestion">
                  Next
                </button>
                <button v-else type="button" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors" @click="confirmSubmit">
                  Submit Quiz
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- confirmation modal -->
        <div v-if="showConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div class="p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Submit Quiz</h3>
                  <p class="text-sm text-gray-600">Are you sure you want to submit? You won't be able to change your answers.</p>
                </div>
              </div>
              <div class="flex gap-3 justify-end">
                <button class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" @click="showConfirm = false">Cancel</button>
                <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors" @click="submitAnswers">Submit Quiz</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Results are shown on a dedicated results page. After submit the user is redirected there. -->
      </div>
    </div>
  </div>
</template>

<script setup>
// set page layout meta for quizee
definePageMeta({ layout: 'quizee' })
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const id = route.params.id

// Media type helpers
function isImage(url) {
  if (!url) return false
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.startsWith('data:image/')
}

function isAudio(url) {
  if (!url) return false
  return /\.(mp3|wav|ogg|m4a)$/i.test(url) || url.startsWith('data:audio/')
}

function isYouTube(url) {
  if (!url) return false
  return /youtube\.com|youtu\.be/.test(url)
}

function getAudioType(url) {
  if (!url) return ''
  if (url.endsWith('.mp3')) return 'audio/mpeg'
  if (url.endsWith('.wav')) return 'audio/wav'
  if (url.endsWith('.ogg')) return 'audio/ogg'
  if (url.endsWith('.m4a')) return 'audio/mp4'
  return ''
}

function formatYouTubeUrl(url) {
  if (!url) return ''
  // Convert standard YouTube URLs to embed format
  return url.replace(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/,
    'https://www.youtube.com/embed/$1'
  )
}

function formatFillBlanks(text, qid) {
  if (!text) return ''
  // Find all blanks marked with [blank] or ____ and replace with input fields
  const blankRegex = /\[blank\]|_{2,}/g
  let index = 0
  
  return text.replace(blankRegex, () => {
    const inputId = `blank-${qid}-${index}`
    const value = (answers.value[qid] || [])[index] || ''
    
    // Increment the blank index
    index++
    
    // Return an input field
    return `<input type="text" 
      id="${inputId}" 
      value="${value}"
      @input="updateBlank('${qid}', ${index-1}, $event.target.value)"
      class="mx-1 px-2 py-1 border-b-2 border-indigo-500 focus:outline-none focus:border-indigo-700 min-w-[100px] bg-transparent" 
    />`
  })
}

const quiz = ref({ questions: [] })
const loading = ref(true)
const submitting = ref(false)
const answers = ref({})
const result = ref(null)
const lastSaved = ref({})
const showConfirm = ref(false)
const currentQuestion = ref(0)

const timer = ref(null)
const timeLeft = ref(0)
const currentStreak = ref(0)
const answeredCorrectly = ref({})
const achievements = ref([])

// Computed property for encouragement messages
const encouragementMessage = computed(() => {
  const progress = progressPercent.value
  const questionsLeft = quiz.value.questions.length - currentQuestion.value

  // Streaks and momentum
  if (currentStreak.value >= 3) {
    return "You're on fire!"
  }
  
  // Progress-based encouragement
  if (progress >= 90) return "Almost there!"
  if (progress >= 75) return "You're doing great!"
  if (progress >= 50) return "Halfway there!"
  if (progress >= 25) return "Keep going!"
  
  // Questions-left based encouragement
  if (questionsLeft === 1) return "Last question!"
  if (questionsLeft === 2) return "Almost done!"
  
  return "You've got this!" // Default encouragement
})

// Style classes for the encouragement badge
const encouragementStyle = computed(() => {
  if (currentStreak.value >= 3) {
    return 'from-orange-500 to-red-500 text-white'
  }
  
  const progress = progressPercent.value
  if (progress >= 90) return 'from-green-500 to-emerald-500 text-white'
  if (progress >= 75) return 'from-blue-500 to-indigo-500 text-white'
  if (progress >= 50) return 'from-indigo-500 to-violet-500 text-white'
  return 'from-violet-500 to-fuchsia-500 text-white'
})

// Computed property for score-based messages
const scoreMessage = computed(() => {
  if (!result.value?.score) return ''
  
  const score = result.value.score
  if (score >= 90) return "Outstanding! You've mastered this topic! 🌟"
  if (score >= 80) return "Excellent work! Keep up the great performance! 🎉"
  if (score >= 70) return "Great job! You're showing strong understanding! 👏"
  if (score >= 60) return "Good effort! You're on the right track! 💪"
  if (score >= 50) return "You're making progress! Keep practicing! 📚"
  return "Don't give up! Each attempt helps you learn more! 🌱"
})

function formatTime(sec) {
  const m = Math.floor(sec/60).toString().padStart(2,'0')
  const s = Math.floor(sec%60).toString().padStart(2,'0')
  return `${m}:${s}`
}

const displayTime = computed(() => {
  if (quiz.value.timer_seconds) {
    // For timed quizzes - show time remaining
    return `Time left: ${formatTime(timeLeft.value)}`
  } else {
    // For untimed quizzes - show time elapsed
    return `Time spent: ${formatTime(timeLeft.value)}`
  }
})

const currentQuestionData = computed(() => quiz.value.questions[currentQuestion.value] || {})

const progressPercent = computed(() => {
  const total = Array.isArray(quiz.value.questions) ? quiz.value.questions.length : 0
  if (!total) return 0
  let answered = 0
  for (const q of quiz.value.questions) {
    const val = answers.value[q.id]
    if (val === null || val === undefined) continue
    if (typeof val === 'string' && val === '') continue
    if (Array.isArray(val) && val.length === 0) continue
    answered++
  }
  return Math.round((answered / total) * 100)
})

onMounted(async () => {
  const cfg = useRuntimeConfig()
  try {
    const res = await fetch(cfg.public.apiBase + `/api/quizzes/${id}`, { credentials: 'include' })
    if (res.ok) {
      const body = await res.json()
      quiz.value = body.quiz || body
      // init answers and timer
      quiz.value.questions.forEach(q => { 
        // support different types; restore saved answer if present
        const key = `quiz:${id}:q:${q.id}`
        const saved = process.client ? localStorage.getItem(key) : null
        if (saved) {
          try { answers.value[q.id] = JSON.parse(saved) } catch { answers.value[q.id] = saved }
          lastSaved.value[q.id] = process.client ? Number(localStorage.getItem(key + ':ts')) : null
        } else {
          answers.value[q.id] = (q.type === 'multi') ? [] : null
        }
      })
      // Initialize timer for both timed and untimed quizzes
      if (quiz.value.timer_seconds) {
        // For timed quizzes - count down
        timeLeft.value = quiz.value.timer_seconds
        timer.value = setInterval(() => {
          timeLeft.value = Math.max(0, timeLeft.value - 1)
          if (timeLeft.value === 0) submitAnswers()
        }, 1000)
      } else {
        // For untimed quizzes - count up
        timeLeft.value = 0
        timer.value = setInterval(() => {
          timeLeft.value++
        }, 1000)
      }
    }
  } catch (e) {}
  loading.value = false
})

async function submitAnswers() {
  if (submitting.value) return
  submitting.value = true
  
  // Calculate achievements before submitting
  calculateAchievements()
  
  // optimistic UI: show submitting state
  const optimistic = { score: null }
  result.value = optimistic
  try {
    const cfg = useRuntimeConfig()
    const payload = { answers: Object.keys(answers.value).map(qid => ({ question_id: qid, selected: answers.value[qid] })) }

    // Ensure we have Sanctum CSRF cookie set for session-based authentication.
    // This prevents 419 responses when Laravel expects an XSRF token.
    try {
      await fetch(cfg.public.apiBase + '/sanctum/csrf-cookie', { credentials: 'include' })
    } catch (e) {
      // non-fatal; we'll proceed and the backend will respond appropriately
    }

    // Build headers and include XSRF token from cookie when available
    const headers = { 'Content-Type': 'application/json' }
    try {
      const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
      if (match) {
        headers['X-XSRF-TOKEN'] = decodeURIComponent(match[1])
      }
    } catch (e) {
      // ignore cookie read failures
    }

    const res = await fetch(cfg.public.apiBase + `/api/quizzes/${id}/submit`, { method: 'POST', credentials: 'include', headers, body: JSON.stringify(payload) })
    if (res.ok) {
      const body = await res.json()
      // stop timer
      if (timer.value) { clearInterval(timer.value); timer.value = null }
      // clear saved answers for this quiz
      if (process.client) {
        quiz.value.questions.forEach(q => { localStorage.removeItem(`quiz:${id}:q:${q.id}`); localStorage.removeItem(`quiz:${id}:q:${q.id}:ts`) })
      }

      // If backend returned an attempt id, redirect to the formatted result page
      const attemptId = body?.attempt_id ?? body?.attempt?.id
      if (attemptId) {
        // navigate to result page
        router.push(`/quizee/quizzes/result/${attemptId}`)
        return
      }

      // fallback: set result inline
      result.value = body
    } else {
      // restore optimistic to null to indicate failure
      result.value = null
    }
  } catch (e) {
    result.value = null
  } finally {
    submitting.value = false
    showConfirm.value = false
  }
}

function confirmSubmit() { showConfirm.value = true }

function autosave(qid) {
  if (!process.client) return
  try {
    const key = `quiz:${id}:q:${qid}`
    localStorage.setItem(key, JSON.stringify(answers.value[qid]))
    localStorage.setItem(key + ':ts', String(Date.now()))
    lastSaved.value[qid] = Date.now()
  } catch (e) {}
}

function toggleMulti(qid, opt) {
  const arr = answers.value[qid] || []
  const idx = arr.indexOf(opt)
  if (idx === -1) arr.push(opt)
  else arr.splice(idx, 1)
  answers.value[qid] = arr
  autosave(qid)
}

function selectMcq(qid, opt) {
  answers.value[qid] = opt
  autosave(qid)
}

function cancel() { router.push('/quizee/quizzes') }

function nextQuestion() {
  if (currentQuestion.value < quiz.value.questions.length - 1) {
    currentQuestion.value++
  }
}

function previousQuestion() {
  if (currentQuestion.value > 0) {
    currentQuestion.value--
  }
}

function retakeQuiz() {
  // Clear local storage and reload to retake
  if (process.client) {
    quiz.value.questions.forEach(q => {
      localStorage.removeItem(`quiz:${id}:q:${q.id}`)
      localStorage.removeItem(`quiz:${id}:q:${q.id}:ts`)
    })
  }
  // Reset achievement tracking
  currentStreak.value = 0
  answeredCorrectly.value = {}
  achievements.value = []
  window.location.reload()
}

function calculateAchievements() {
  // Count answered questions robustly (same rules as progressPercent)
  const total = Array.isArray(quiz.value.questions) ? quiz.value.questions.length : 0
  let totalAnswered = 0
  for (const q of quiz.value.questions) {
    const val = answers.value[q.id]
    if (val === null || val === undefined) continue
    if (typeof val === 'string' && val === '') continue
    if (Array.isArray(val) && val.length === 0) continue
    totalAnswered++
  }
  const correctCount = Object.values(answeredCorrectly.value).filter(Boolean).length
  
  // Achievement badges based on performance
  if (currentStreak.value >= 5) {
    achievements.value.push({
      title: "Hot Streak",
      description: "Answered 5 questions correctly in a row!",
      icon: "🔥"
    })
  }
  
  if (totalAnswered === total && total > 0) {
    achievements.value.push({
      title: "Completionist",
      description: "Answered all questions!",
      icon: "🎯"
    })
  }
  
  const accuracy = totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0
  if (accuracy >= 90) {
    achievements.value.push({
      title: "Excellence",
      description: "Achieved 90% or higher accuracy!",
      icon: "🌟"
    })
  }
}

// Function to update streak on each answer
function updateStreak(isCorrect) {
  if (isCorrect) {
    currentStreak.value++
    // Show encouraging toast or message for streaks
    if (currentStreak.value === 3) {
      // You could add a toast notification here
      console.log("3 correct answers in a row! Keep it up! 🔥")
    }
  } else {
    currentStreak.value = 0
  }
}

// Handle fill-in-the-blanks answers
function updateBlank(qid, index, value) {
  // Initialize the answers array if it doesn't exist
  if (!Array.isArray(answers.value[qid])) {
    answers.value[qid] = []
  }
  
  // Update the specific blank's answer
  const currentAnswers = [...answers.value[qid]]
  currentAnswers[index] = value
  answers.value[qid] = currentAnswers
  
  // Auto-save after updating
  autosave(qid)
}
</script>

<style scoped>
</style>
