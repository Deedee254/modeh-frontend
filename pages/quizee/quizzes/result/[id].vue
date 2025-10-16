<template>
  <div class="min-h-screen p-6">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-6">
        <h1 class="text-3xl font-bold">Quiz Results</h1>
        <p class="text-sm text-gray-600">Review your performance and achievements</p>
      </div>

      <div v-if="loading" class="p-6 bg-white rounded shadow">Loading...</div>

      <div v-else-if="!user.isSubscribed && !attempt.id" class="p-6 bg-white rounded shadow text-center">
        <h3 class="text-lg font-semibold">Subscribe to view results</h3>
        <p class="text-sm text-gray-600 mt-2">You need to subscribe to view your quiz results.</p>
        <button @click="showPaymentModal = true" class="mt-4 bg-indigo-600 text-white px-4 py-2 rounded">Subscribe Now</button>
      </div>

      <div v-else class="bg-white rounded shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-4xl font-extrabold">{{ attempt.score }}%</div>
            <div class="text-sm text-gray-500">Score</div>
          </div>
          <div class="text-right">
            <div class="text-lg font-medium">Points (Total)</div>
            <div class="text-2xl font-semibold">{{ points }}</div>
            <div class="text-sm text-gray-500">Earned this attempt: <span class="font-medium">{{ attempt.points_earned ?? 0 }}</span></div>
          </div>
        </div>

        <div class="mt-6">
          <h3 class="font-semibold">Per-question breakdown</h3>
          <div class="mt-3 space-y-3">
            <div v-for="d in attempt.details" :key="d.question_id" class="p-3 border rounded-lg flex items-start gap-3" :class="d.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'">
              <div class="w-8 h-8 flex items-center justify-center rounded-full" :class="d.correct ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'">
                {{ d.correct ? '✓' : '✕' }}
              </div>
              <div class="flex-1">
                <div class="font-medium" v-html="d.body"></div>
                <div class="text-sm text-gray-600 mt-2">Your answer: <span class="font-medium">{{ formatProvided(d.provided) }}</span></div>
                <div class="text-sm text-gray-600">Correct answer: <span class="font-medium">{{ formatProvided(d.correct_answers) }}</span></div>
                <div class="text-sm text-gray-500 mt-2">Explanation: <span class="font-medium">{{ d.explanation ?? 'None' }}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="badges.length" class="mt-6">
          <h3 class="font-semibold flex items-center justify-between">
            <span>New badges <small class="text-xs text-gray-500">(earned in this attempt)</small></span>
            <NuxtLink to="/quizee/badges" class="text-sm text-indigo-600">View all</NuxtLink>
          </h3>

          <div class="mt-3 flex gap-3 flex-wrap">
            <div v-for="b in badges" :key="b.id" class="p-4 bg-gradient-to-tr from-indigo-50 to-white rounded-lg shadow-md transform transition-transform hover:-translate-y-1" style="min-width:160px;">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-lg font-semibold">{{ (b.title || '').charAt(0) }}</div>
                <div class="flex-1">
                  <div class="font-medium text-sm">{{ b.title }}</div>
                  <div class="text-xs text-gray-500">{{ b.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6">
          <h3 class="font-semibold">Share your result</h3>
          <div class="mt-2 flex gap-2">
            <button class="px-3 py-2 bg-blue-600 text-white rounded" @click="share('twitter')">Share on Twitter</button>
            <button class="px-3 py-2 bg-blue-700 text-white rounded" @click="share('facebook')">Share on Facebook</button>
            <button class="px-3 py-2 bg-gray-800 text-white rounded" @click="copyLink">Copy Link</button>
          </div>
        </div>

        <div class="mt-6 flex gap-2">
          <NuxtLink to="/quizee/quizzes" class="px-4 py-2 bg-gray-100 rounded">Back to quizzes</NuxtLink>
          <NuxtLink :to="`/quizee/quizzes/take/${quizId}`" class="px-4 py-2 bg-indigo-600 text-white rounded">Retake</NuxtLink>
        </div>
      </div>
    </div>

    <PaymentModal :open="showPaymentModal" :pkg="paymentPackage" :phones="userPhones" @close="onPaymentModalClose" @paid="onPaymentModalPaid" />
    <PaymentAwaitingModal :open="showAwaitingPaymentModal" @complete="onPaymentComplete" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import confetti from 'canvas-confetti'
import PaymentModal from '~/components/PaymentModal.vue'
import PaymentAwaitingModal from '~/components/PaymentAwaitingModal.vue'
import { useUserStore } from '~/stores/auth'

// ensure this page uses the quizee layout
definePageMeta({ layout: 'quizee' })

const route = useRoute()
const attemptId = route.params.id
const attempt = ref({ details: [] })
const badges = ref([])
const points = ref(0)
const loading = ref(true)
const quizId = ref(null)
const showPaymentModal = ref(false)
const showAwaitingPaymentModal = ref(false)
const paymentPackage = ref(null)
const userPhones = ref([])
const user = useUserStore()

async function fetchResults() {
  try {
    const cfg = useRuntimeConfig()
    const res = await fetch(cfg.public.apiBase + `/quiz-attempts/${attemptId}`, { credentials: 'include' })
    if (res.ok) {
      const body = await res.json()
      if (body.ok) {
        attempt.value = body.attempt
        badges.value = body.badges || []
        points.value = body.points || 0
        // derive quizId from attempt details if available
        quizId.value = body.attempt.quiz_id || null

        // polished confetti animation
        try {
          const myConfetti = confetti.create(document.body, { resize: true })
          myConfetti({ particleCount: 200, spread: 160, origin: { y: 0.6 } })
          // a few bursts
          setTimeout(() => myConfetti({ particleCount: 120, spread: 120, origin: { y: 0.6 } }), 300)
          setTimeout(() => myConfetti({ particleCount: 80, spread: 100, origin: { y: 0.6 } }), 600)
        } catch (e) {
          // ignore
        }
      }
    }
  } catch (e) {}
  loading.value = false
}

onMounted(async () => {
  // check subscription
  if (user.isSubscribed) {
    await fetchResults()
  } else {
    // fetch default package
    const cfg = useRuntimeConfig()
    const pkgRes = await fetch(cfg.public.apiBase + '/packages/default', { credentials: 'include' })
    if (pkgRes.ok) {
      const body = await pkgRes.json()
      if (body.ok) {
        paymentPackage.value = body.package
      }
    }
    // fetch user phones
    const phonesRes = await fetch(cfg.public.apiBase + '/user/phones', { credentials: 'include' })
    if (phonesRes.ok) {
      const body = await phonesRes.json()
      if (body.ok) {
        userPhones.value = body.phones
      }
    }
    showPaymentModal.value = true
  }
})

function onPaymentModalClose() {
  showPaymentModal.value = false
}

function onPaymentModalPaid() {
  showPaymentModal.value = false
  showAwaitingPaymentModal.value = true
}

async function onPaymentComplete() {
  showAwaitingPaymentModal.value = false
  await user.fetchUser() // refresh user store
  await fetchResults()
}

function formatProvided(p) {
  if (p === null || p === undefined) return 'No answer'
  if (Array.isArray(p)) return p.join(', ')
  return p
}

// share helpers
function share(provider) {
  const url = window.location.href
  const text = `I scored ${attempt.value.score}% on this quiz!`;
  if (provider === 'twitter') {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
  } else if (provider === 'facebook') {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
  }
}

function copyLink() {
  navigator.clipboard?.writeText(window.location.href)
}
</script>

<style scoped>
</style>
