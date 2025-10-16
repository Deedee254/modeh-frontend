<template>
  <div class="min-h-screen bg-gray-50 md:p-6">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white md:rounded-lg md:shadow-sm md:border pb-24 md:pb-0">
        <div class="p-4 md:p-6 border-b">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="text-lg md:text-xl font-semibold text-gray-900">{{ quiz.title || 'Loading...' }}</div>
              <div class="text-sm text-gray-600">{{ quiz.description }}</div>

              <!-- Quiz rules badges -->
              <div class="mt-2 flex flex-wrap gap-2 text-sm">
                <div v-if="quiz.attempts_allowed" class="px-2 py-1 bg-gray-100 rounded">🔁 {{ quiz.attempts_allowed === 'unlimited' ? 'Unlimited attempts' : quiz.attempts_allowed + ' attempts' }}</div>
                <div v-if="quiz.shuffle_questions" class="px-2 py-1 bg-gray-100 rounded">🔀 Questions shuffled</div>
                <div v-if="quiz.shuffle_answers" class="px-2 py-1 bg-gray-100 rounded">🔀 Answers shuffled</div>
                <div v-if="quiz.access && quiz.access !== 'free'" class="px-2 py-1 bg-amber-50 text-amber-700 rounded">🔒 Paywalled</div>
              </div>
            </div>

            <!-- Accessible announcements -->
            <div class="sr-only" aria-live="polite">{{ lastAnnouncement }}</div>
            <div class="flex items-center gap-3" v-if="quiz.questions.length > 0">
              <div class="text-sm px-3 py-1 rounded-full" :class="[
                quiz.timer_seconds && timeLeft.value < 60 
                  ? 'bg-red-100 text-red-700' 
                  : quiz.timer_seconds 
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-700'
              ]">
                <span class="font-mono font-semibold">{{ displayTime }}</span>
              </div>


            </div>
          </div>

          <!-- Timer progress (timed quizzes) -->
          <div v-if="quiz.timer_seconds" class="w-full mb-3">
            <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden" role="progressbar" :aria-valuenow="timeLeft" :aria-valuemax="quiz.timer_seconds" :aria-valuetext="`Time remaining ${displayTime}`">
              <div :class="timerColorClass" class="h-2 rounded-full transition-all duration-500" :style="{ width: `${timerPercent}%` }"></div>
            </div>
          </div>

          <!-- Progress bar (questions answered) -->
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

        <div v-else-if="quiz.questions.length > 0" class="p-4 md:p-6">
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
                          <input type="radio" :name="'q-'+currentQuestionData.id" :value="opt" v-model="answers[currentQuestionData.id]" class="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                          <span class="text-gray-700" v-html="opt?.body || opt?.text || opt"></span>
                        </div>
                      </template>

                      <!-- Multiple Select -->
                      <template v-if="currentQuestionData.type === 'multi'">
                        <div v-for="(opt, i) in currentQuestionData.options" :key="i" class="flex items-center gap-3 p-3 bg-gray-50 border rounded-lg hover:bg-white cursor-pointer transition-colors" @click="toggleMulti(currentQuestionData.id, opt)">
                          <input type="checkbox" :value="opt" @change="() => toggleMulti(currentQuestionData.id, opt)" :checked="(answers[currentQuestionData.id] || []).includes(opt)" class="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
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
                        <UTextarea v-model="currentShortAnswer" placeholder="Type your answer here..." class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" :rows="3" />
                      </template>

                      <!-- Numeric -->
                      <template v-if="currentQuestionData.type === 'numeric'">
                        <input type="number" v-model.number="answers[currentQuestionData.id]" placeholder="Enter a number..." class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                      </template>
                    </div>
                    <div class="text-xs text-gray-500 mt-3 flex items-center gap-1">
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>

                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation -->
            <div class="fixed bottom-0 left-0 right-0 md:relative bg-white/80 backdrop-blur-sm md:bg-transparent border-t md:border-0 p-4 md:p-0">
              <div class="max-w-4xl mx-auto flex items-center justify-between">
                <button type="button" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" :disabled="currentQuestion === 0" @click="previousQuestion">
                  Previous
                </button>
                <div class="flex gap-2">
                  <button v-if="currentQuestion < quiz.questions.length - 1" type="button" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors" @click="nextQuestion">
                    Next
                  </button>
                  <button v-else type="button" :disabled="submitting.value" :class="['px-6 py-2 rounded-lg transition-colors', submitting.value ? 'bg-green-500 text-white opacity-60 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700']" @click="confirmSubmit">
                    <svg v-if="submitting.value" class="w-4 h-4 inline-block mr-2 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25"/><path d="M22 12a10 10 0 00-10-10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
                    <span>{{ submitting.value ? 'Submitting…' : 'Submit Quiz' }}</span>
                  </button>
                  <button v-if="lastSubmitFailed" type="button" class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors" @click="submitAnswers" :disabled="submitting.value">
                    Retry
                  </button>
                </div>
                <div v-if="submissionMessage" class="mt-3 text-sm text-slate-600">{{ submissionMessage }}</div>
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
                <button class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" @click="showConfirm = false" :disabled="submitting.value">Cancel</button>
                <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors" @click="submitAnswers" :disabled="submitting.value">
                  <svg v-if="submitting.value" class="w-4 h-4 inline-block mr-2 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25"/><path d="M22 12a10 10 0 00-10-10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
                  Submit Quiz
                </button>
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
import UiTextarea from '~/components/ui/UiTextarea.vue'
// set page layout meta for quizee
definePageMeta({
  layout: 'quizee',
  hideBottomNav: true
})
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppAlert } from '~/composables/useAppAlert'
import { useQuizMedia } from '~/composables/quiz/useQuizMedia'
import { useQuizTimer } from '~/composables/quiz/useQuizTimer'
import { useQuizAnswers } from '~/composables/quiz/useQuizAnswers'
import { useQuizNavigation } from '~/composables/quiz/useQuizNavigation'
import { useQuizEnhancements } from '~/composables/quiz/useQuizEnhancements'

const route = useRoute()
const router = useRouter()
const id = route.params.id

// --- Core State ---
const quiz = ref({ questions: [] })
const loading = ref(true)
const submitting = ref(false)
const lastSubmitFailed = ref(false)
const submissionMessage = ref('')
let submissionInterval = null
const { push: pushAlert } = useAppAlert()
import useApi from '~/composables/useApi'
const api = useApi()
const showConfirm = ref(false)



// Cache the quiz questions length to avoid recomputing
const quizQuestionsLength = ref(0)
watch(() => quiz.value?.questions?.length, len => {
  quizQuestionsLength.value = len || 0
})

// Optimize progress calculation to use cached length
const progressPercent = computed(() => {
  const total = quizQuestionsLength.value
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

// --- Composables ---
const { isImage, isAudio, isYouTube, getAudioType, formatYouTubeUrl } = useQuizMedia()
const { timeLeft, displayTime, timerPercent, timerColorClass, lastAnnouncement, startTimer, stopTimer } = useQuizTimer(quiz, () => submitAnswers())
const { answers, initializeAnswers, selectMcq, toggleMulti, updateBlank, clearSavedAnswers } = useQuizAnswers(quiz, id)
const { currentQuestion, nextQuestion, previousQuestion } = useQuizNavigation(computed(() => quiz.value.questions))
const { currentStreak, achievements, encouragementMessage, encouragementStyle, calculateAchievements, resetAchievements } = useQuizEnhancements(quiz, progressPercent, currentQuestion, answers)

const currentQuestionData = computed(() => quiz.value.questions[currentQuestion.value] || {})
// For short-answer questions, expose a computed value with getter/setter so v-model doesn't bind to a read-only expression
const currentShortAnswer = computed({
  get() {
    const q = currentQuestionData.value
    if (!q || !q.id) return ''
    return answers.value[q.id] ?? ''
  },
  set(v) {
    const q = currentQuestionData.value
    if (!q || !q.id) return
    answers.value[q.id] = v
  }
})
// centralized checkout handles payments and result viewing

// --- Methods ---

function formatFillBlanks(text, qid) {
  if (!text) return ''
  const blankRegex = /\[blank\]|_{2,}/g
  let index = 0
  
  return text.replace(blankRegex, () => {
    const inputId = `blank-${qid}-${index}`
    const value = (answers.value[qid] || [])[index] || ''
    index++
    
    // The input now calls the method from the composable
    return `<input type="text" 
      id="${inputId}" 
      value="${value}"
      oninput="this.dispatchEvent(new CustomEvent('updateblank', { bubbles: true, detail: { qid: '${qid}', index: ${index-1}, value: this.value } }))"
      class="mx-1 px-2 py-1 border-b-2 border-indigo-500 focus:outline-none focus:border-indigo-700 min-w-[100px] bg-transparent" 
    />`
  })
}

onMounted(async () => {
  const cfg = useRuntimeConfig()
  try {
    const res = await fetch(cfg.public.apiBase + `/api/quizzes/${id}`, { credentials: 'include' })
    if (res.ok) {
      const body = await res.json()
      quiz.value = body.quiz || body
      initializeAnswers()
      startTimer()

      // Add event listener for fill-in-the-blanks custom event
      if (process.client) {
        document.addEventListener('updateblank', (e) => {
          const { qid, index, value } = e.detail
          updateBlank(qid, index, value)
        })
      }

    } else {
      // Handle quiz not found or other errors
      console.error("Failed to load quiz", res.status)
      // Optionally redirect or show an error message
    }
  } catch (e) {}
  loading.value = false
})

async function submitAnswers() {
  if (submitting.value) return
  submitting.value = true
  lastSubmitFailed.value = false
  // Calculate achievements before submitting
  calculateAchievements()

  // show a short saving message while answers persist; actual marking happens on checkout
  submissionMessage.value = 'Saving answers...'
  try {
    const cfg = useRuntimeConfig()
  const payload = { answers: Object.keys(answers.value).map(qid => ({ question_id: qid, selected: answers.value[qid] })), defer_marking: true }

    const res = await api.postJson(`/api/quizzes/${id}/submit`, payload)
    if (api.handleAuthStatus(res)) { pushAlert({ message: 'Session expired — please sign in again', type: 'warning' }); lastSubmitFailed.value = true; submissionMessage.value = ''; submitting.value = false; showConfirm.value = false; return }
    if (res.ok) {
      // stop saving message
      submissionMessage.value = ''
      const body = await res.json()
      stopTimer()
      clearSavedAnswers()

      // If backend returned an attempt id, redirect to centralized checkout so user can see results after checkout
      const attemptId = body?.attempt_id ?? body?.attempt?.id
      if (attemptId) {
        router.push(`/quizee/payments/checkout?type=quiz&attempt_id=${attemptId}`)
        return
      }

      // No attempt id returned — redirect to checkout with quiz id so user can continue to payment flow
      router.push(`/quizee/payments/checkout?type=quiz&quiz_id=${id}`)
      return
  } else {
      // restore optimistic to null to indicate failure
  if (submissionInterval) { clearInterval(submissionInterval); submissionInterval = null }
  submissionMessage.value = ''
  // ensure no inline result is shown — stay on page with answers preserved for retry
      // show error alert and keep answers saved to allow retry
  let errMsg = 'Failed to submit quiz. Please try again.'
  try { const errBody = await res.json(); if (errBody?.message) errMsg = errBody.message } catch(e) {}
  pushAlert({ message: errMsg, type: 'error' })
      // Keep answers in-place so user can retry; showConfirm dialog will be closed and user can press Retry
    }
  } catch (e) {
    if (submissionInterval) { clearInterval(submissionInterval); submissionInterval = null }
    submissionMessage.value = ''
  // keep answers saved locally so user can retry
    pushAlert({ message: 'Network error while submitting quiz. Your answers are still saved — try again.', type: 'error' })
    lastSubmitFailed.value = true
  } finally {
    submitting.value = false
    showConfirm.value = false
  }
}

function confirmSubmit() { showConfirm.value = true }

function cancel() { router.push('/quizee/quizzes') }

function retakeQuiz() {
  // Clear local storage and reload to retake
  clearSavedAnswers()
  // Reset achievement tracking
  resetAchievements()
  window.location.reload()
}

</script>



<style scoped>
</style>
