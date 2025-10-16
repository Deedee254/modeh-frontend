<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
    <div class="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
      <h2 class="text-2xl font-semibold mb-3 text-slate-900 dark:text-slate-100">Payments & subscriptions</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">You need an active subscription to view detailed results. Choose a package or pay only for this quiz/battle.</p>

      <div v-if="loading" class="p-4 text-sm text-slate-600 dark:text-slate-300">Checking subscription status...</div>

      <div v-else>
        <div v-if="isActive" class="mb-4 p-4 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
          <div class="text-emerald-700 dark:text-emerald-200 font-medium">Subscription active 🎉</div>
          <p class="text-sm text-slate-600 dark:text-slate-300 mt-1">You can now view your full results and feedback. Active package: <strong>{{ activePackageName }}</strong></p>
        </div>

        <div v-else class="mb-4 p-4 rounded-md bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800">
          <div class="text-amber-700 dark:text-amber-200 font-medium">No active subscription</div>
          <p class="text-sm text-slate-600 dark:text-slate-300 mt-1">Subscribe for unlimited access or pay only for this item.</p>
        </div>

        <!-- Phone input / selection -->
        <div class="mb-4">
          <label class="block text-sm text-slate-600 dark:text-slate-300 mb-1">Phone number for payment</label>
          <div class="flex flex-col sm:flex-row gap-2">
            <select v-if="phones.length" v-model="selectedPhonePreset" class="border rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 w-full sm:w-auto">
              <option value="">Enter a new number</option>
              <option v-for="p in phones" :key="p" :value="p">{{ p }}</option>
            </select>
            <input v-model="phoneInputLocal" type="text" placeholder="2547..." class="flex-1 border rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 w-full" />
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">We'll use this phone to initiate STK push (Mpesa). Make sure it's in international format.</p>
        </div>

        <!-- Packages list -->
        <div class="mb-4">
          <label class="block text-sm text-slate-600 dark:text-slate-300 mb-2">Choose a package</label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-for="pkg in packages" :key="pkg.id" @click="selectPackage(pkg)" :class="['p-3 rounded border cursor-pointer', selectedPackage && selectedPackage.id === pkg.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700']">
              <div class="flex justify-between items-center">
                <div>
                  <div class="font-medium text-slate-900 dark:text-slate-100">{{ pkg.title || pkg.name }}</div>
                  <div class="text-xs text-slate-500 dark:text-slate-400">{{ pkg.description || pkg.subtitle || '' }}</div>
                </div>
                <div class="text-right">
                  <div class="font-semibold text-slate-900 dark:text-slate-100">{{ pkg.currency || 'KES' }} {{ pkg.price }}</div>
                  <div class="text-xs text-slate-500 dark:text-slate-400">/ month</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 mt-4 items-center">
          <div v-if="itemPrice !== null" class="mr-4 self-center text-sm">
            <div class="text-slate-700 dark:text-slate-200">One-off price: <span class="font-semibold">{{ item?.currency || 'KES' }} {{ itemPrice }}</span></div>
          </div>

          <div v-if="checkout.status === 'processing'" class="flex items-center gap-2 text-sm text-slate-600">
            <svg class="w-5 h-5 animate-spin text-indigo-600" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25"/><path d="M22 12a10 10 0 00-10-10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
            <div>Waiting for payment confirmation...</div>
          </div>

          <div v-if="checkout.status === 'success'" class="px-3 py-2 rounded bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-700">
            Payment confirmed ✓
          </div>

          <button v-if="canSeeResults" @click="seeResults" class="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded">See Results</button>

          <button v-if="!isActive && checkout.status !== 'processing'" @click="openPayment" class="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded">Subscribe</button>

          <button v-if="!isActive" @click="payForThisItem" :class="[ 'w-full sm:w-auto px-4 py-2 rounded', phoneForPayment ? 'bg-emerald-600 text-white' : 'border']" :disabled="checkout.processing || checkout.status === 'processing'">Pay {{ itemPrice ? (item?.currency || 'KES') + ' ' + itemPrice : 'for this ' + (type === 'quiz' ? 'quiz' : 'battle') }}</button>

          <button @click="retry" class="w-full sm:w-auto px-4 py-2 border rounded">Retry</button>
          <button v-if="canRedo" @click="redo" class="w-full sm:w-auto px-4 py-2 border rounded">Redo</button>
        </div>

        <div v-if="checkout.processing" class="mt-4 text-sm text-slate-600 dark:text-slate-300">Processing payment... please wait.</div>
        <div v-if="checkout.pendingMessage" class="mt-3 p-3 rounded text-sm" :class="checkout.status === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200' : 'bg-yellow-50 dark:bg-yellow-900/10 text-yellow-800 dark:text-yellow-200'">{{ checkout.pendingMessage }}</div>

      </div>
    </div>

    <PaymentModal v-if="showPaymentModal" :pkg="selectedPackage || {}" :open="showPaymentModal" :phones="phones" @close="showPaymentModal = false" @paid="onPaid" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PaymentModal from '~/components/PaymentModal.vue'
import { useSubscriptionsStore } from '~/stores/subscriptions'
import { useCheckoutStore } from '~/stores/checkout'

const route = useRoute()
const router = useRouter()
const q = route.query

const type = (q.type || 'quiz')
const id = q.id || null
const attemptId = q.attempt_id || null

const loading = ref(true)
const isActive = ref(false)
const showPaymentModal = ref(false)
const selectedPackage = ref(null)
const phones = ref([])
const packages = ref([])
const item = ref(null)
const itemPrice = ref(null)

const selectedPhonePreset = ref('')
const phoneInputLocal = ref('')

const checkout = useCheckoutStore()

const subscriptionsStore = useSubscriptionsStore()

const canRedo = ref(false)
const canSeeResults = computed(() => {
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

async function openPayment() {
  await loadPackages()
  showPaymentModal.value = true
}

async function onPaid() {
  await checkSubscription()
  showPaymentModal.value = false
}

function seeResults() {
  checkout.markResults({ type, id, attemptId })
}

function retry() { window.location.reload() }
function redo() { router.push(type === 'quiz' && id ? `/quizee/quizzes/take/${id}` : '/quizee') }

async function payForThisItem() {
  const amount = itemPrice.value ?? selectedPackage.value?.price ?? null
  await checkout.payForThisItem({
    phone: phoneForPayment.value,
    packageId: selectedPackage.value?.id,
    type,
    itemId: id,
    amount
  })
}

onMounted(async () => {
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
  canSeeResults.value = !!(isActive.value && (attemptId || id))
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
