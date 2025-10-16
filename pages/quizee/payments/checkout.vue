<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
    <div class="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
      <h2 class="text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">Unlock Your Results</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">You need an active subscription to view detailed results. Choose a package or pay only for this quiz/battle.</p>

      <div v-if="attemptId" class="mb-6 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg flex items-center justify-between">
        <p class="text-sm text-slate-600 dark:text-slate-300">Double-check your answers before paying.</p>
        <button @click="openAnswerReview" class="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Review Answers</button>
      </div>

      <div v-if="loading" class="p-4 text-sm text-slate-600 dark:text-slate-300">Checking subscription status...</div>

      <div v-else>
        <div v-if="isActive" class="mb-4 p-4 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <div class="text-emerald-700 dark:text-emerald-200 font-semibold">Subscription Active 🎉</div>
              <p class="text-sm text-slate-600 dark:text-slate-300 mt-1">You can now view your full results. Active package: <strong>{{ activePackageName }}</strong></p>
            </div>
          </div>
        </div>

        <div v-if="canSeeResults" class="mt-6 flex justify-center">
          <button @click="seeResults" class="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">View My Results</button>
        </div>

        <div v-if="!isActive" class="space-y-6">
          <div class="p-4 rounded-md bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800">
            <div class="text-amber-700 dark:text-amber-200 font-medium">No Active Subscription</div>
            <p class="text-sm text-slate-600 dark:text-slate-300 mt-1">Subscribe for unlimited access or pay only for this item.</p>
          </div>

          <!-- Phone input / selection -->
          <div class="mb-4">
            <label for="phone-input" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone number for M-Pesa</label>
            <div class="flex flex-col sm:flex-row gap-2">
              <select v-if="phones.length" v-model="selectedPhonePreset" class="border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 w-full sm:w-auto focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Enter a new number</option>
                <option v-for="p in phones" :key="p" :value="p">{{ p }}</option>
              </select>
              <input id="phone-input" v-model="phoneInputLocal" type="tel" placeholder="2547..." class="flex-1 border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 w-full focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">We'll use this phone to initiate an STK push. Make sure it's in international format.</p>
          </div>

          <!-- Payment Options -->
          <div>
            <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Choose Your Payment Option</h3>
            
            <!-- One-off Payment -->
            <div v-if="itemPrice !== null" class="mb-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between gap-4">
              <div>
                <div class="font-medium text-slate-800 dark:text-slate-200">Pay for this item only</div>
                <div class="text-sm text-slate-500 dark:text-slate-400">One-time payment to unlock results for this {{ type }}.</div>
              </div>
              <div class="flex items-center gap-4">
                <div class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ item?.currency || 'KES' }} {{ itemPrice }}</div>
                <button @click="payForThisItem" :disabled="!phoneForPayment || checkout.processing" class="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                  Pay Now
                </button>
              </div>
            </div>

            <!-- Subscription Packages -->
            <div class="space-y-3">
              <h4 class="font-medium text-slate-800 dark:text-slate-200">Or, Subscribe for Unlimited Access</h4>
              <div v-for="pkg in packages" :key="pkg.id" @click="selectPackage(pkg)" :class="['p-4 rounded-lg border cursor-pointer transition-all', selectedPackage && selectedPackage.id === pkg.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600']">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-3">
                    <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center" :class="selectedPackage && selectedPackage.id === pkg.id ? 'border-indigo-600' : 'border-slate-400'">
                      <div v-if="selectedPackage && selectedPackage.id === pkg.id" class="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                    </div>
                    <div>
                      <div class="font-semibold text-slate-900 dark:text-slate-100">{{ pkg.title || pkg.name }}</div>
                      <div class="text-sm text-slate-500 dark:text-slate-400">{{ pkg.description || pkg.subtitle || '' }}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-bold text-slate-900 dark:text-slate-100">{{ pkg.currency || 'KES' }} {{ pkg.price }}</div>
                    <div class="text-xs text-slate-500 dark:text-slate-400">/ month</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 flex justify-end">
              <button @click="openPayment" :disabled="!phoneForPayment || !selectedPackage || checkout.processing" class="w-full sm:w-auto px-6 py-3 font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
                Subscribe with {{ selectedPackage?.name }}
              </button>
            </div>
          </div>
        </div>

        <!-- General Actions & Status -->
        <div class="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6">
          <div v-if="checkout.processing" class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <svg class="w-5 h-5 animate-spin text-indigo-600" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25"/><path d="M22 12a10 10 0 00-10-10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
            <span>Processing payment... please wait. A prompt should appear on your phone.</span>
          </div>

          <div v-if="checkout.pendingMessage" class="mt-3 p-3 rounded-lg text-sm" :class="checkout.status === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800' : 'bg-yellow-50 dark:bg-yellow-900/10 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800'">
            {{ checkout.pendingMessage }}
          </div>

          <div class="flex gap-3 justify-end mt-4">
            <button v-if="checkout.status === 'error'" @click="retry" class="px-4 py-2 border rounded-lg text-sm">Retry Payment</button>
            <button v-if="canRedo" @click="redo" class="px-4 py-2 border rounded-lg text-sm">Take Another Quiz</button>
          </div>
        </div>

      </div>
    </div>
    
    <ReviewAnswers :open="showReview" :loading="reviewLoading" :error="reviewError" :details="reviewDetails" @close="showReview = false" />

    <PaymentAwaitingModal :tx="checkout.tx" :open="showAwaitingModal" @update:open="v => showAwaitingModal = v" @close="onPaymentAttemptClosed" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PaymentAwaitingModal from '~/components/PaymentAwaitingModal.vue'
import { useSubscriptionsStore } from '~/stores/subscriptions'
import ReviewAnswers from '~/components/ReviewAnswers.vue'
import { useCheckoutStore } from '~/stores/checkout'

definePageMeta({
  layout: 'quizee',
  hideBottomNav: true,
})

const route = useRoute()
const router = useRouter()
const q = route.query

const type = (q.type || 'quiz')
const id = q.id || null
const attemptId = q.attempt_id || null

const loading = ref(true)
const isActive = ref(false)
const showAwaitingModal = ref(false)
const selectedPackage = ref(null)

const showReview = ref(false)
const reviewLoading = ref(false)
const reviewError = ref('')
const reviewDetails = ref([])

const phones = ref([])
const packages = ref([])
const item = ref(null)
const itemPrice = ref(null)

const selectedPhonePreset = ref('')
const phoneInputLocal = ref('')

const checkout = useCheckoutStore()

const subscriptionsStore = useSubscriptionsStore()

const canRedo = ref(false)
const canSeeResults = computed(() => { // Renamed from canSeeResults for clarity
  return !!((isActive.value || checkout.status === 'success') && (attemptId || id))
})

const activePackageName = ref('')

const phoneForPayment = computed(() => selectedPhonePreset.value || phoneInputLocal.value)

async function loadPackages() {
  try {
    await subscriptionsStore.fetchPackages()
    packages.value = subscriptionsStore.packages
    if (Array.isArray(packages.value) && packages.value.length) selectedPackage.value = packages.value[0]
  } catch (e) {
    packages.value = []
  }
}

async function checkSubscription() {
  loading.value = true
  const cfg = useRuntimeConfig()
  try {
    const { fetchSubscription, subscription } = await import('~/composables/useSubscription.js').then(m => m.useSubscription())
    await fetchSubscription(cfg)
    const sub = subscription.value
    isActive.value = !!(sub && (sub.status === 'active' || sub.status === 'paid'))
    activePackageName.value = sub?.package?.title || sub?.package?.name || ''
  } catch (e) {
    isActive.value = false
    activePackageName.value = ''
  } finally {
    loading.value = false
  }
}

function selectPackage(pkg) { selectedPackage.value = pkg }

async function initiatePayment(type, details) {
  if (!phoneForPayment.value) {
    checkout.setError('Please provide a phone number.');
    return;
  }
  checkout.startProcessing();

  try {
    const cfg = useRuntimeConfig();
    let res;
    if (type === 'subscription') {
      res = await $fetch(`${cfg.public.apiBase}/api/packages/${details.id}/subscribe`, { method: 'POST', credentials: 'include', body: { phone: phoneForPayment.value } });
    } else { // one-off
      const payload = { item_type: q.type || 'quiz', item_id: details.id, amount: details.price, phone: phoneForPayment.value };
      res = await $fetch(`${cfg.public.apiBase}/api/one-off-purchases`, { method: 'POST', credentials: 'include', body: payload });
    }

    if (res?.ok && (res.tx || res.purchase?.gateway_meta?.tx)) {
      checkout.setTx(res.tx || res.purchase.gateway_meta.tx);
      showAwaitingModal.value = true;
    } else {
      throw new Error(res.message || 'Failed to initiate payment.');
    }
  } catch (e) {
    checkout.setError(e.data?.message || e.message || 'An unexpected error occurred.');
  }
}

function openPayment() {
  if (selectedPackage.value) {
    initiatePayment('subscription', selectedPackage.value);
  }
}

async function onPaymentAttemptClosed() {
  await checkSubscription()
  // If subscription is now active, user can see results.
  if(isActive.value) checkout.status = 'success'
  showAwaitingModal.value = false
}

async function openAnswerReview() {
  if (!attemptId) return;
  showReview.value = true;
  reviewLoading.value = true;
  reviewError.value = '';
  try {
    const cfg = useRuntimeConfig();
    // NOTE: This assumes an endpoint exists to fetch attempt details without correctness info.
    // If your existing endpoint `/api/quiz-attempts/${attemptId}` already provides this
    // without `correct` or `correct_answers` fields for un-paid attempts, you can use it.
    // Otherwise, a new endpoint like `/api/quiz-attempts/${attemptId}/review` might be needed.
    const data = await $fetch(cfg.public.apiBase + `/api/quiz-attempts/${attemptId}`, { credentials: 'include' });
    reviewDetails.value = data?.attempt?.details || [];
    if (!reviewDetails.value.length) {
      reviewError.value = "Could not load the details for this attempt.";
    }
  } catch (e) {
    reviewError.value = "Failed to fetch your answers. Please try again.";
    console.error("Failed to fetch attempt review:", e);
  } finally {
    reviewLoading.value = false;
  }
}

function seeResults() {
  checkout.markResults({ type, id, attemptId })
}

function retry() { window.location.reload() }
function redo() { router.push(type === 'quiz' && id ? `/quizee/quizzes/take/${id}` : '/quizee') }

function payForThisItem() {
  if (item.value && itemPrice.value !== null) {
    initiatePayment('one-off', { ...item.value, price: itemPrice.value });
  }
}

onMounted(async () => {
  checkout.reset();
  await loadPackages()
  await checkSubscription()
  // fetch quiz or battle to display one_off_price if available
  try {
    if (id) {
      const cfg = useRuntimeConfig()
      const res = await $fetch(cfg.public.apiBase + `/api/${type === 'quiz' ? 'quizzes' : 'battles'}/${id}`, { credentials: 'include' }).catch(() => null)
      if (res) {
        item.value = res.quiz || res.battle || res || null
        itemPrice.value = item.value?.one_off_price ?? null
      }
    }
  } catch (e) {
    item.value = null
    itemPrice.value = null
  }
  // basic perms
  canRedo.value = !!(id && type === 'quiz')
  // try to extract phone presets from user profile or local storage
  try {
    const cfg = useRuntimeConfig()
    const res = await $fetch(cfg.public.apiBase + '/api/me', { credentials: 'include' }).catch(() => null)
    if (res && res.phones) phones.value = res.phones
  } catch (e) { phones.value = [] }
})
</script>

<style scoped>
</style>
