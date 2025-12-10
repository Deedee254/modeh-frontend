<template>
  <div class="bg-slate-50 dark:bg-slate-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div v-if="loading" class="text-center p-10 bg-white dark:bg-slate-800 rounded-xl shadow-md">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
        <p class="mt-4 text-slate-500 dark:text-slate-400">Calculating your results...</p>
      </div>

      <div v-else-if="error" class="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md text-center">
        <h3 class="text-lg font-semibold text-red-600 dark:text-red-400">Could not load results</h3>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">{{ error }}</p>
        <button @click="fetchResults" class="mt-4 bg-brand-600 text-white px-4 py-2 rounded-lg">Retry</button>
      </div>

      <div v-else-if="!attempt.id" class="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md text-center">
        <h3 class="text-lg font-semibold">Unlock Your Results!</h3>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">An active subscription is needed to view your detailed quiz results.</p>
        <NuxtLink to="/quizee/payments/checkout" class="mt-4 inline-block bg-brand-600 text-white px-6 py-2 rounded-lg font-semibold">
          Go to Checkout
        </NuxtLink>
      </div>

      <div v-else class="space-y-6">
        <!-- Header -->
        <div class="text-center">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100">Assessment Results</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">A detailed summary of your performance and opportunities for focused improvement.</p>
        </div>

        <!-- Time summary -->
        <div class="flex items-center justify-center gap-4">
          <div class="text-sm text-slate-600">Total time:</div>
          <div class="font-medium">{{ attempt.total_time_seconds ? formatTime(attempt.total_time_seconds) : '-' }}</div>
          <div class="text-sm text-slate-400">•</div>
          <div class="text-sm text-slate-600">Avg per question:</div>
          <div class="font-medium">{{ attempt.per_question_time ? formatTime(Math.round((Array.isArray(attempt.per_question_time) ? attempt.per_question_time.reduce((a,b)=>a+b,0) : Object.values(attempt.per_question_time || {}).reduce((a,b)=>a+b,0)) / (Array.isArray(attempt.per_question_time) ? attempt.per_question_time.length : Object.keys(attempt.per_question_time || {}).length || 1))) : '-' }}</div>
        </div>

        <!-- Score & Rank Summary -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-center flex flex-col justify-center">
            <div class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-600 dark:text-brand-400">{{ Math.round(attempt.score || 0) }}<span class="text-xl sm:text-2xl text-slate-400 dark:text-slate-500">%</span></div>
            <div class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Your Score</div>
          </div>
          <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-center flex flex-col justify-center">
            <div class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-emerald-600 dark:text-emerald-400">{{ attempt.points_earned ?? 0 }}</div>
            <div class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Points Earned</div>
          </div>
          <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-center flex flex-col justify-center">
            <div class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-600 dark:text-blue-400">
              {{ correctCount }}/{{ totalCount }}
            </div>
            <div class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Accuracy</div>
          </div>
          <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-center flex flex-col justify-center">
            <div class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-amber-600 dark:text-amber-400">
              <span v-if="rank">{{ rank }}</span>
              <span v-else>-</span>
            </div>
            <div class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Your Rank <span v-if="totalParticipants"> (/ {{ totalParticipants }})</span>
            </div>
          </div>
        </div>

        <!-- Performance Insights -->
        <div v-if="percentile !== null || responseAnalysis" class="grid grid-cols-1 md:grid-cols-2 gap-4">
           <!-- Social Motivation -->
           <div v-if="percentile !== null" class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md p-6 text-white flex flex-col justify-center items-center text-center">
              <div class="text-lg font-medium opacity-90">You performed better than</div>
              <div class="text-4xl font-extrabold my-2">{{ percentile }}%</div>
              <div class="text-sm opacity-80">of other students</div>
           </div>

           <!-- Response Time Analysis -->
           <div v-if="responseAnalysis" class="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
              <h3 class="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                Response Time Analysis
              </h3>
              <div class="space-y-4">
                 <div v-if="responseAnalysis.fastest" class="flex gap-3">
                    <div class="text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-lg">
                       <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <div>
                       <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">Fastest Answer</div>
                       <div class="font-bold text-slate-900 dark:text-slate-100">{{ formatTime(responseAnalysis.fastest.time) }}</div>
                       <div class="text-xs text-slate-500 truncate mt-0.5 max-w-[200px]" v-html="responseAnalysis.fastest.body"></div>
                    </div>
                 </div>
                 <div v-if="responseAnalysis.slowest" class="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <div class="text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-2 rounded-lg">
                       <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                       <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">Slowest Answer</div>
                       <div class="font-bold text-slate-900 dark:text-slate-100">{{ formatTime(responseAnalysis.slowest.time) }}</div>
                       <div class="text-xs text-slate-500 truncate mt-0.5 max-w-[200px]" v-html="responseAnalysis.slowest.body"></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <!-- Badges -->
        <div v-if="badges.length" class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
          <h3 class="font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span>New Badges Earned ✨</span>
            <NuxtLink to="/quizee/badges" class="text-sm text-brand-600 dark:text-brand-400 hover:underline">View all</NuxtLink>
          </h3>
          <div class="mt-4 grid grid-cols-2 gap-3">
            <div v-for="b in badges" :key="b.id" class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center gap-3 transform transition-transform hover:-translate-y-1">
              <div class="w-12 h-12 rounded-full bg-brand-600/10 dark:bg-brand-600/50 flex items-center justify-center text-brand-600 dark:text-accent-500 text-2xl font-bold">
                {{ (b.title || '').charAt(0) }}
              </div>
              <div>
                <div class="font-medium text-sm text-slate-800 dark:text-slate-200">{{ b.title }}</div>
                <div class="text-xs text-slate-500 dark:text-slate-400">{{ b.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Question Breakdown -->
        <div class="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
          <h3 class="font-semibold text-slate-900 dark:text-slate-100">Question Breakdown</h3>
          <div class="mt-4 space-y-4">
            <div v-for="d in attempt.details" :key="d.question_id" class="p-4 border-l-4 rounded-r-lg" :class="d.correct ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500' : 'bg-red-50 dark:bg-red-900/20 border-red-500'">
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full text-sm font-bold" :class="d.correct ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'">
                  {{ d.correct ? '✓' : '✕' }}
                </div>
                <div class="flex-1">
                  <div class="font-medium text-slate-800 dark:text-slate-200" v-html="d.body"></div>
                  <div class="text-sm text-slate-600 dark:text-slate-400 mt-2">Your answer: <span class="font-semibold text-slate-700 dark:text-slate-300" v-html="formatProvided(d.provided)"></span></div>
            <div v-if="attempt.per_question_time" class="text-xs text-slate-500 dark:text-slate-400 mt-1">Time taken: <span class="font-medium">{{ formatTime(getPerQuestionTime(d.question_id)) }}</span></div>
                  <div v-if="!d.correct" class="text-sm text-emerald-700 dark:text-emerald-400">Correct answer: <span class="font-semibold" v-html="formatProvided(d.correct_answers)"></span></div>
                  <div v-if="d.explanation" class="text-sm text-slate-500 dark:text-slate-400 mt-2 p-2 bg-slate-100 dark:bg-slate-700/50 rounded"><strong>Explanation:</strong> {{ d.explanation }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 class="font-semibold text-slate-900 dark:text-slate-100">Share Your Success!</h4>
              <div class="mt-2 flex gap-2">
                <button class="px-3 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700" @click="share('twitter')">Share on Twitter</button>
                <button class="px-3 py-2 text-sm bg-brand-900 text-white rounded-lg hover:bg-brand-900" @click="share('facebook')">Share on Facebook</button>
                <button class="px-3 py-2 text-sm bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600" @click="copyLink">Copy Link</button>
              </div>
            </div>
            <div class="flex gap-2">
              <NuxtLink to="/quizee/quizzes" class="px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">Back to Quizzes</NuxtLink>
              <NuxtLink v-if="quizId" :to="`/quizee/quizzes/take/${quizId}`" class="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700">Retake Assessment</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import confetti from 'canvas-confetti'
import { useAnswerStore } from '~/stores/answerStore'

// ensure this page uses the quizee layout. Results are user-specific — mark noindex.
definePageMeta({ layout: 'quizee', meta: [ { name: 'robots', content: 'noindex, nofollow' }, { name: 'description', content: 'View your quiz results and detailed breakdowns on Modeh.' } ] })

const route = useRoute()
const attemptId = route.params.id
const attempt = ref({ details: [], score: 0 })
const badges = ref([])
const points = ref(0)
const rank = ref(null)
const totalParticipants = ref(null)
const loading = ref(true)
const error = ref('')
const quizId = ref(null)
const percentile = ref(null)
const responseAnalysis = ref(null)

const correctCount = computed(() => {
  if (!attempt.value || !attempt.value.details) return 0
  return attempt.value.details.filter(d => d.correct).length
})

const totalCount = computed(() => {
  if (!attempt.value || !attempt.value.details) return 0
  return attempt.value.details.length
})

const answerStore = useAnswerStore()

async function fetchResults() {
  loading.value = true
  error.value = ''

  // Check if we have cached results first
  if (answerStore.hasAttemptForReview(attemptId)) {
    const cached = answerStore.getAttemptForReview(attemptId)
    if (cached?.attempt) {
      attempt.value = cached.attempt
      badges.value = cached.badges ?? []
      points.value = cached.points ?? 0
      rank.value = cached.rank ?? null
      totalParticipants.value = cached.total_participants ?? null
      quizId.value = cached.quiz_id ?? null
      percentile.value = cached.percentile ?? null
      responseAnalysis.value = cached.response_analysis ?? null
    }

    // polished confetti animation
    if (process.client) {
      triggerConfetti()
    }
    loading.value = false
    return
  }

  try {
    const cfg = useRuntimeConfig()
    // Use $fetch and handle potential 404/missing attempt gracefully
    try {
      const res = await $fetch(cfg.public.apiBase + `/api/quiz-attempts/${attemptId}`, { credentials: 'include' })
      // $fetch may return the parsed JSON directly
      attempt.value = res.attempt || res
      badges.value = res.badges || []
      points.value = res.points || 0
      rank.value = res.rank || null
      totalParticipants.value = res.total_participants || null
      quizId.value = (res.attempt && res.attempt.quiz_id) || res.quiz_id || null
      percentile.value = res.percentile ?? null
      responseAnalysis.value = res.response_analysis ?? null

      // Cache the results for future use
      answerStore.storeAttemptForReview(attemptId, {
        attempt: res.attempt || res,
        badges: res.badges,
        points: res.points,
        points_earned: res.points ?? res.points_earned,
        rank: res.rank,
        percentile: res.percentile ?? null,
        response_analysis: res.response_analysis ?? null,
        total_participants: res.total_participants,
        quiz_id: (res.attempt && res.attempt.quiz_id) || res.quiz_id
      })

      // polished confetti animation
      if (process.client) {
        triggerConfetti()
      }
    } catch (err) {
      // Distinguish not-found vs other errors
      const status = err?.status || err?.response?.status || null
      const resData = err?.data || {}
      
      if (status === 404) {
        error.value = 'Results not found. The attempt may no longer exist.'
      } else if (status >= 400 && status < 500) {
        error.value = resData?.message || err?.message || 'Could not load results. You may need an active subscription.'
      } else {
        error.value = 'An unexpected error occurred. Please try again later.'
      }
      console.error("Failed to fetch results:", err)
    }
  } catch (e) {
    error.value = e.data?.message || e.message || 'An unexpected error occurred. You may need an active subscription to view results.'
    console.error("Failed to fetch results:", e)
  } finally {
    loading.value = false
  }
}

function triggerConfetti() {
  try {
    const myCanvas = document.createElement('canvas');
    myCanvas.style.position = 'fixed';
    myCanvas.style.top = '0';
    myCanvas.style.left = '0';
    myCanvas.style.width = '100vw';
    myCanvas.style.height = '100vh';
    myCanvas.style.pointerEvents = 'none';
    myCanvas.style.zIndex = '9999';
    document.body.appendChild(myCanvas);

    const myConfetti = confetti.create(myCanvas, { resize: true, useWorker: true });
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      myConfetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
      myConfetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      } else {
        // cleanup
        setTimeout(() => document.body.removeChild(myCanvas), 3000);
      }
    }());
  } catch (e) {
    console.warn("Confetti animation failed:", e)
  }
}

onMounted(async () => {
  await fetchResults()
})

function formatProvided(p) {
  // Normalize null/undefined
  if (p === null || p === undefined) return 'Not provided'

  // Handle arrays: filter out empty entries and render readable fallback when empty
  if (Array.isArray(p)) {
    const filtered = p.filter(item => item !== null && item !== undefined && String(item).trim() !== '')
    if (!filtered.length) return 'Not provided'
    return filtered.map(item => `<code>${item}</code>`).join(', ')
  }

  // Non-array values
  if (String(p).trim() === '') return 'Not provided'
  return `<code>${p}</code>`
}

// share helpers
function share(provider) {
  // Prefer sharing the quiz's public page rather than the result URL
  const url = (typeof window !== 'undefined' && quizId.value)
    ? `${window.location.origin}/quizee/quizzes/${quizId.value}`
    : window.location.href
  const text = `I scored ${attempt.value.score}% on this quiz!`;
  if (provider === 'twitter') {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer')
  } else if (provider === 'facebook') {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer')
  }
}

function copyLink() {
  const shareUrl = (typeof window !== 'undefined' && quizId.value)
    ? `${window.location.origin}/quizee/quizzes/${quizId.value}`
    : window.location.href
  navigator.clipboard?.writeText(shareUrl)
    .then(() => {
      // You can add a toast notification here to confirm the copy
      alert('Link copied to clipboard!');
    })
    .catch(err => {
      console.error('Could not copy text: ', err);
    });
}

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return null
  const s = Number(seconds) || 0
  const mins = Math.floor(s / 60)
  const secs = s % 60
  if (mins > 0) return `${mins}m ${secs}s`
  return `${secs}s`
}

function getPerQuestionTime(qid) {
  if (!attempt.value.per_question_time) return null
  const pqt = attempt.value.per_question_time
  if (Array.isArray(pqt)) {
    // assume array index may not map to id; try object fallback
    return null
  }
  // object mapping
  return pqt[qid] ?? null
}
</script>

<style scoped>
</style>
