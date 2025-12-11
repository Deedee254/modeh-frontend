<template>
  <div class="bg-slate-50 dark:bg-slate-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div class="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
      <h2 class="text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">Unlock Your Results</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">You need an active subscription to view detailed results. Choose a package or pay only for this quiz/battle.</p>

      <div v-if="attemptId" class="mb-6 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg flex items-center justify-between">
        <p class="text-sm text-slate-600 dark:text-slate-300">Double-check your answers before paying.</p>
        <button @click="openAnswerReview" class="px-4 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">Review Answers</button>
      </div>

      <div v-if="loading" class="p-4 text-sm text-slate-600 dark:text-slate-300">Checking subscription status...</div>

      <div v-else>
        <!-- Limit Info Alert (if provided in query params or fetched from server) -->
        <div v-if="limitInfo" class="mb-6 p-4 rounded-lg border-2" :class="limitInfo.reached ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-300 dark:border-amber-800'">
          <div class="flex items-start gap-3">
            <div :class="['w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', limitInfo.reached ? 'bg-red-200' : 'bg-amber-200']">
              <svg v-if="limitInfo.reached" class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <svg v-else class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 4v2m0 4v.01M7.08 6.47A9.001 9.001 0 1020.92 17.53M9.76 17H14m-2.5-4h5"></path></svg>
            </div>
            <div class="flex-1">
              <h4 v-if="limitInfo.reached" class="font-semibold text-red-900 dark:text-red-100">Daily Limit Reached</h4>
              <h4 v-else class="font-semibold text-amber-900 dark:text-amber-100">Approaching Limit</h4>
              <p v-if="limitInfo.reached" class="text-sm text-red-700 dark:text-red-200 mt-1">You've used all {{ limitInfo.limit }} {{ limitInfo.type || 'reveals' }} for today. Upgrade to continue.</p>
              <p v-else class="text-sm text-amber-700 dark:text-amber-200 mt-1">{{ limitInfo.remaining || 0 }} of {{ limitInfo.limit }} {{ limitInfo.type || 'reveals' }} remaining today.</p>
            </div>
            <div class="flex items-start gap-2 ml-4">
              <button @click="refreshLimit" :disabled="limitRefreshing" class="px-3 py-1 text-xs rounded-md border" :class="limitRefreshing ? 'opacity-60 cursor-wait' : 'hover:bg-slate-100 dark:hover:bg-slate-700'">
                <svg v-if="limitRefreshing" class="w-4 h-4 animate-spin inline-block mr-1" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25" stroke-width="2"/><path d="M22 12a10 10 0 00-10-10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        <!-- Subscription Selection (Personal vs Institution) -->
        <div v-if="isActive || (institutionSubscriptions && institutionSubscriptions.length > 0)" class="mb-6 space-y-3">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">Your Subscriptions</h3>
          
          <!-- Personal Subscription Option -->
          <div v-if="isActive" @click="activeSubscriptionType = 'personal'" :class="['p-4 rounded-lg border-2 cursor-pointer transition-all', activeSubscriptionType === 'personal' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500']">
            <div class="flex items-start gap-3">
              <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0" :class="activeSubscriptionType === 'personal' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-400'">
                <svg v-if="activeSubscriptionType === 'personal'" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-slate-900 dark:text-slate-100">Personal: {{ activePackageName }}</h4>
                <p class="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  You have <strong>{{ personalRemaining ?? 'unlimited' }}</strong> reveals remaining today
                  <span v-if="personalLimit" class="text-xs text-slate-500"> ({{ personalUsed }}/{{ personalLimit }})</span>
                </p>
              </div>
            </div>
          </div>
          
          <!-- Institution Subscription Options -->
          <div v-for="instSub in institutionSubscriptions" :key="instSub.id" @click="activeSubscriptionType = 'institution-' + instSub.institution_id" :class="['p-4 rounded-lg border-2 cursor-pointer transition-all', activeSubscriptionType === ('institution-' + instSub.institution_id) ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500']">
            <div class="flex items-start gap-3">
              <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0" :class="activeSubscriptionType === ('institution-' + instSub.institution_id) ? 'border-blue-600 bg-blue-600' : 'border-slate-400'">
                <svg v-if="activeSubscriptionType === ('institution-' + instSub.institution_id)" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-slate-900 dark:text-slate-100">🏢 {{ instSub.institution_name }}: {{ instSub.package?.title || 'Institutional' }}</h4>
                <p class="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  You have <strong>{{ instSub.remaining ?? 'unlimited' }}</strong> reveals remaining today
                  <span v-if="instSub.limit" class="text-xs text-slate-500"> ({{ instSub.used }}/{{ instSub.limit }})</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Personal Subscription Status -->
        <div v-if="!isActive && !institutionIsActive" class="mb-6 p-4 rounded-lg border-2 bg-amber-50 dark:bg-amber-900/10 border-amber-300 dark:border-amber-800">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-amber-200">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 4v2m0 4v.01M7.08 6.47A9.001 9.001 0 1020.92 17.53"></path></svg>
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-amber-900 dark:text-amber-100">No Active Subscription</h4>
              <p class="text-sm text-amber-700 dark:text-amber-200 mt-1">
                You need either a personal subscription or institutional access to view results.
              </p>
            </div>
          </div>
        </div>

        <!-- Personal Subscription Status (when user has one) -->
        <div v-if="isActive && !institutionIsActive" class="mb-4 p-4 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <div class="text-emerald-700 dark:text-emerald-200 font-semibold">Personal Subscription Active 🎉</div>
              <p class="text-sm text-slate-600 dark:text-slate-300 mt-1">Active package: <strong>{{ activePackageName }}</strong>
                <span v-if="limitInfo" class="block text-sm text-slate-600 dark:text-slate-300 mt-1">You have <strong>{{ limitInfo.remaining ?? 0 }}</strong> of <strong>{{ limitInfo.limit }}</strong> {{ limitInfo.type || 'reveals' }} left today.</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Both Active Status -->
        <div v-if="isActive && institutionIsActive" class="mb-4 p-4 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <div class="text-emerald-700 dark:text-emerald-200 font-semibold">Multiple Subscriptions Active 🎉</div>
              <p class="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Personal: <strong>{{ activePackageName }}</strong> | Institution: <strong>{{ institutionName }}</strong>
              </p>
              <p v-if="limitInfo" class="text-sm text-slate-600 dark:text-slate-300 mt-1">Remaining: <strong>{{ limitInfo.remaining ?? 0 }}</strong> / <strong>{{ limitInfo.limit }}</strong> {{ limitInfo.type || 'reveals' }} today.</p>
            </div>
          </div>
        </div>

        <div v-if="canSeeResults" class="mt-6 flex justify-center">
          <button @click="seeResults" class="px-8 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors">View My Results</button>
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
              <select v-if="phones.length" v-model="selectedPhonePreset" class="border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 w-full sm:w-auto focus:ring-brand-600 focus:border-brand-600">
                <option value="">Enter a new number</option>
                <option v-for="p in phones" :key="p" :value="p">{{ p }}</option>
              </select>
              <input id="phone-input" v-model="phoneInputLocal" type="tel" placeholder="2547..." class="flex-1 border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 w-full focus:ring-brand-600 focus:border-brand-600" />
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">We'll use this phone to initiate an STK push. Make sure it's in international format.</p>
          </div>

          <!-- Payment Options -->
          <div>
            <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Choose Your Payment Option</h3>
            
            <!-- One-off Payment: Free -->
            <div v-if="itemPrice === 0" class="mb-4 p-4 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-between gap-4">
              <div>
                <div class="font-medium text-emerald-900 dark:text-emerald-100">This {{ type }} is Free!</div>
                <div class="text-sm text-emerald-700 dark:text-emerald-200">No payment needed. View your results immediately.</div>
              </div>
              <button @click="viewFreeResults" :disabled="checkout.processing" class="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                View Results
              </button>
            </div>

            <!-- One-off Payment: Paid -->
            <div v-else-if="itemPrice && itemPrice > 0" class="mb-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between gap-4">
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
              <div v-for="pkg in packages" :key="pkg.id" @click="selectPackage(pkg)" :class="['p-4 rounded-lg border cursor-pointer transition-all', selectedPackage && selectedPackage.id === pkg.id ? 'border-brand-600 bg-brand-600/10 dark:bg-brand-600/20 ring-2 ring-brand-600' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600']">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-3">
                    <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center" :class="selectedPackage && selectedPackage.id === pkg.id ? 'border-brand-600' : 'border-slate-400'">
                      <div v-if="selectedPackage && selectedPackage.id === pkg.id" class="w-2.5 h-2.5 rounded-full bg-brand-600"></div>
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
              <button @click="openPayment" :disabled="!phoneForPayment || !selectedPackage || checkout.processing" class="w-full sm:w-auto px-6 py-3 font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-950 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
                Subscribe with {{ selectedPackage?.name }}
              </button>
            </div>
          </div>
        </div>

        <!-- General Actions & Status -->
        <div class="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6">
          <div v-if="checkout.processing" class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <svg class="w-5 h-5 animate-spin text-brand-600" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25"/><path d="M22 12a10 10 0 00-10-10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
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
    
  <ReviewAnswers :open="showReview" :loading="reviewLoading" :error="reviewError" :details="reviewDetails" @close="showReview = false"></ReviewAnswers>

  <PaymentAwaitingModal :tx="checkout.tx" :open="showAwaitingModal" @update:open="v => showAwaitingModal = v" @close="onPaymentAttemptClosed"></PaymentAwaitingModal>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import useApi from '~/composables/useApi'
import { useSubscription } from '~/composables/useSubscription'
const api = useApi()
import { useRoute, useRouter } from 'vue-router'
import PaymentAwaitingModal from '~/components/PaymentAwaitingModal.vue'
import { useSubscriptionsStore } from '~/stores/subscriptions'
import ReviewAnswers from '~/components/ReviewAnswers.vue'
import { useCheckoutStore } from '~/stores/checkout'
import { useUiStore } from '~/stores/ui'

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
const hasInstitution = ref(false)
const institutionName = ref('')
const institutionIsActive = ref(false)
const showAwaitingModal = ref(false)
const selectedPackage = ref(null)
const limitRefreshing = ref(false)
const activeSubscriptionType = ref('personal') // 'personal' or 'institution-{id}'
const institutionSubscriptions = ref([])
const personalLimit = ref(null)
const personalUsed = ref(0)
const personalRemaining = ref(null)

const showReview = ref(false)
const isTournamentCheckout = computed(() => type === 'tournament' && !!id)
const tournamentJoinAttempted = ref(false)
const tournamentJoinSucceeded = ref(false)
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
const ui = useUiStore()

const canRedo = ref(false)
const canSeeResults = computed(() => { // Renamed from canSeeResults for clarity
  return !!((isActive.value || checkout.status === 'success') && (attemptId || id))
})

const activePackageName = ref('')

const phoneForPayment = computed(() => selectedPhonePreset.value || phoneInputLocal.value)

// Limit info: prefer explicit query params (redirect), otherwise fall back to server-provided usage
const limitState = ref(null)
const limitInfo = computed(() => {
  // 1) Query params (explicit redirect from results page)
  const reason = q.reason
  const qLimit = q.limit ? parseInt(q.limit) : null
  const qRemaining = q.remaining ? parseInt(q.remaining) : null
  const qLimitType = q.limit_type || q.type || 'reveals'
  if (reason === 'limit' || reason === 'result_limit') {
    return {
      reached: !qRemaining || qRemaining === 0,
      limit: qLimit || 10,
      remaining: qRemaining,
      type: qLimitType
    }
  }

  // 2) Fallback to usage fetched from API during mount
  if (limitState.value) {
    return {
      reached: !!(limitState.value.remaining !== null && limitState.value.remaining <= 0),
      limit: limitState.value.limit ?? limitState.value.total ?? null,
      remaining: limitState.value.remaining ?? null,
      type: limitState.value.type || 'reveals'
    }
  }

  return null
})

// Fetch remaining quota/usage from backend using subscriptions/mine endpoint
async function fetchLimitInfo() {
  try {
    const res = await api.get('/api/subscriptions/mine')
    if (res?.ok) {
      const data = await res.json()
      // possible shapes: { subscription: { usage: { limit, remaining, type } } }
      const usage = data?.subscription?.usage || data?.usage || data?.limit || null
      if (usage) {
        limitState.value = {
          limit: usage.limit ?? usage.total ?? null,
          remaining: usage.remaining ?? usage.left ?? null,
          type: usage.type || 'reveals'
        }
      }
    }
  } catch (e) {
    // nothing we can do - leave limitState null
    console.debug('Could not fetch usage info:', e)
  }
}

async function loadPackages() {
  try {
    await subscriptionsStore.fetchPackages()
    const allPackages = subscriptionsStore.packages || []
    packages.value = allPackages.filter(pkg => !pkg.audience || pkg.audience === 'quizee')
    if (Array.isArray(packages.value) && packages.value.length) selectedPackage.value = packages.value[0]
  } catch (e) {
    packages.value = []
  }
}

async function checkSubscription() {
  loading.value = true
  try {
    // Check personal and institution subscriptions
    const res = await api.get('/api/subscriptions/mine')
    if (res?.ok) {
      const data = await res.json()
      
      // Personal subscription
      const sub = data?.subscription || data?.data?.subscription || null
      isActive.value = !!(sub && (sub.status === 'active' || sub.status === 'paid'))
      activePackageName.value = sub?.package?.title || sub?.package?.name || ''
      
      // Extract personal subscription limits
      if (sub) {
        personalLimit.value = sub.limit
        personalUsed.value = sub.used || 0
        personalRemaining.value = sub.remaining
      }
      
      // Institution subscriptions
      const instSubs = data?.institution_subscriptions || []
      institutionSubscriptions.value = instSubs
      hasInstitution.value = !!data?.has_institution
      
      if (instSubs.length > 0) {
        // Use the first institution as primary display
        const primaryInst = instSubs[0]
        institutionName.value = primaryInst.institution_name || 'Your Institution'
        institutionIsActive.value = primaryInst.status === 'active'
        
        // If institution is active, prefer it for results view
        if (institutionIsActive.value) {
          activeSubscriptionType.value = 'institution-' + primaryInst.institution_id
        }
      }
    } else {
      throw new Error('Failed to fetch subscription status')
    }
  } catch (e) {
    console.error('Subscription check failed:', e)
    isActive.value = false
    activePackageName.value = ''
    hasInstitution.value = false
    institutionName.value = ''
    institutionIsActive.value = false
    institutionSubscriptions.value = []
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
    let res
    if (type === 'subscription') {
      res = await api.postJson(`/api/packages/${details.id}/subscribe`, { phone: phoneForPayment.value })
    } else {
      const payload = { item_type: q.type || 'quiz', item_id: details.id, amount: details.price, phone: phoneForPayment.value }
      res = await api.postJson('/api/one-off-purchases', payload)
    }

    // `api.postJson` now returns parsed JSON (or a structured error), not a Response
    if (!res) {
      throw new Error('Failed to initiate payment.')
    }

    // If backend returned a structured limit error, navigate user to subscription flow
    if (res.code === 'limit_reached') {
      const qs = new URLSearchParams({ reason: 'limit', type: res.limit?.type || 'unknown', value: String(res.limit?.value || '') })
      router.push('/quizee/subscription?' + qs.toString())
      return
    }

    const body = res
    const tx = body?.tx || body?.purchase?.gateway_meta?.tx
    if (tx) {
      checkout.setTx(tx)
      showAwaitingModal.value = true
    } else {
      throw new Error(body?.message || 'Failed to initiate payment.')
    }
  } catch (e) {
    checkout.setError(e.data?.message || e.message || 'An unexpected error occurred.');
  }
}

async function joinTournamentAfterPayment() {
  if (!isTournamentCheckout.value) return false
  if (tournamentJoinAttempted.value) return tournamentJoinSucceeded.value
  tournamentJoinAttempted.value = true
  try {
    const res = await api.postJson(`/api/tournaments/${id}/join`, {})
    if (api.handleAuthStatus(res)) return false
    if (res?.ok || res?.status === 204) {
      tournamentJoinSucceeded.value = true
      return true
    }
    if (res?.status === 409) {
      tournamentJoinSucceeded.value = true
      return true
    }
    if (res && typeof res.json === 'function') {
      try {
        const data = await res.json()
        if (data?.code === 'already_registered' || data?.isRegistered) {
          tournamentJoinSucceeded.value = true
          return true
        }
      } catch (e) {}
    }
  } catch (e) {
    return false
  }
  return false
}

function openPayment() {
  if (selectedPackage.value) {
    initiatePayment('subscription', selectedPackage.value);
  }
}

async function onPaymentAttemptClosed() {
  const joined = await joinTournamentAfterPayment()
  await checkSubscription()
  if (joined) {
    checkout.status = 'success'
  }
  if(isActive.value) checkout.status = 'success'
  showAwaitingModal.value = false
  if (joined) {
    router.push(`/quizee/tournaments/${id}`)
    return
  }
  if (isTournamentCheckout.value) {
    checkout.status = 'error'
    checkout.pendingMessage = 'Unable to register for the tournament automatically. Please try joining from the tournament page.'
  }
}

async function openAnswerReview() {
  if (!attemptId) return;
  showReview.value = true;
  reviewLoading.value = true;
  reviewError.value = '';
  
  let retries = 3;
  while (retries > 0) {
    try {
      const res = await api.get(`/api/quiz-attempts/${attemptId}/review`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (res?.ok) {
        const data = await res.json();
        // Backend returns 'answers' array in attempt
        const answers = data?.attempt?.answers || data?.attempt?.details || [];
        if (Array.isArray(answers)) {
          // Fetch quiz to get question details
          try {
            const quizRes = await api.get(`/api/quizzes/${data.attempt.quiz_id}`);
            if (quizRes?.ok) {
              const quizData = await quizRes.json();
              const quiz = quizData.quiz || quizData;
              const questionMap = {};
              (quiz.questions || []).forEach(q => {
                questionMap[q.id] = q;
              });
              
              // Merge answers with question details
              const enriched = answers.map(ans => ({
                ...ans,
                question_id: ans.question_id,
                body: questionMap[ans.question_id]?.body || questionMap[ans.question_id]?.question || 'Question',
                provided: ans.selected || null
              }));
              
              reviewDetails.value = enriched;
              reviewError.value = '';
              break;
            } else {
              throw new Error('Could not fetch quiz');
            }
          } catch (quizErr) {
            // If quiz fetch fails, still show answers without question text
            const enriched = answers.map(ans => ({
              ...ans,
              body: 'Question',
              provided: ans.selected || null
            }));
            reviewDetails.value = enriched;
            reviewError.value = '';
            break;
          }
        }
      } else if (res?.status === 404) {
        // Review endpoint doesn't exist for this attempt — don't retry
        reviewError.value = 'Review not available for this attempt.';
        break;
      } else if (res && res.status >= 400 && res.status < 500) {
        // Other client errors are likely non-retryable (e.g., unauthorized, forbidden)
        reviewError.value = 'Unable to fetch review: ' + (res.statusText || 'Client error');
        break;
      }
      
      // If we got a response but no details, show specific error
      if (retries === 1) {
        reviewError.value = "No answers found for this attempt. Please try again later.";
      }
    } catch (e) {
      console.error("Failed to fetch attempt review:", e);
      if (retries === 1) {
        reviewError.value = "Failed to fetch your answers. Please try again.";
      }
    }
    
    retries--;
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  reviewLoading.value = false;
}

function seeResults() {
  checkout.markResults({ type, id, attemptId })
}

async function refreshLimit() {
  limitRefreshing.value = true
  try {
    await fetchLimitInfo()
  } catch (e) {
    console.debug('refreshLimit failed', e)
  } finally {
    // add tiny delay so spinner is visible
    await new Promise(r => setTimeout(r, 250))
    limitRefreshing.value = false
  }
}

function retry() { window.location.reload() }
function redo() { router.push(type === 'quiz' && id ? `/quizee/quizzes/take/${id}` : '/quizee') }

function payForThisItem() {
  if (item.value && itemPrice.value !== null && itemPrice.value > 0) {
    initiatePayment('one-off', { ...item.value, price: itemPrice.value });
  }
}

async function viewFreeResults() {
  checkout.status = 'success'
  checkout.pendingMessage = 'This item is free! Redirecting to results...'
  setTimeout(async () => {
    if (attemptId) {
      router.push(`/quizee/results/${attemptId}`)
    } else if (type === 'battle' && id) {
      router.push(`/quizee/battles/${id}/result`)
    }
  }, 500)
}

onMounted(async () => {
  checkout.reset();
  await loadPackages()
  // Fetch the latest usage/quota information so checkout can show remaining uses
  await fetchLimitInfo()
  await checkSubscription()
  // fetch quiz or battle to display one_off_price if available
  try {
    if (id) {
      const res = await api.get(`/api/${type === 'quiz' ? 'quizzes' : 'battles'}/${id}`)
      if (res?.ok) {
        const data = await res.json()
        item.value = data.quiz || data.battle || data || null
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
    const res = await api.get('/api/me')
    if (res?.ok) {
      const data = await res.json()
      if (data && data.phones) phones.value = data.phones
    }
  } catch (e) { phones.value = [] }
})
</script>

<style scoped>
</style>
