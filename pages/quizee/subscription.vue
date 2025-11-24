<template>
  <div class="min-h-screen bg-gray-50">
    <PageHero
      title="Subscription Plans"
      description="Unlock your full potential with unlimited access to quiz results, detailed analytics, and more. Choose a plan that works for you."
      :breadcrumbs="[{ text: 'Dashboard', href: '/quizee/dashboard' }, { text: 'Subscription', current: true }]"
      padding="py-8 sm:py-12"
    />

    <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <!-- Current Subscription Status -->
      <div v-if="loading" class="mb-8 p-6 bg-white rounded-lg shadow-sm border text-center">
        <p>Loading subscription status...</p>
      </div>
      <div v-else-if="isActive" class="mb-8 p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg shadow-sm border border-emerald-200 dark:border-emerald-800">
        <div class="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div class="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
            <Icon name="heroicons:check-badge-solid" class="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-emerald-800 dark:text-emerald-200">You have an Active Subscription!</h2>
            <p class="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Your <strong>{{ activePackageName }}</strong> plan is active. You have unlimited access to all features.
            </p>
          </div>
        </div>
      </div>
      <div v-else class="mb-8 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-lg shadow-sm border border-amber-200 dark:border-amber-800">
        <div class="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div class="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Icon name="heroicons:exclamation-triangle" class="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-amber-800 dark:text-amber-200">No Active Subscription</h2>
            <p class="text-sm text-slate-600 dark:text-slate-300 mt-1">Choose a plan below to unlock premium features and view your detailed results.</p>
          </div>
        </div>
      </div>

      <!-- Plan Manager -->
      <SubscriptionPlanManager class="mb-8" />

      <!-- Subscription History -->
      <SubscriptionHistory />
    </div>

    <PaymentModal 
      :open="showPaymentModal"
      :pkg="selectedPackage"
      :phones="phones"
      @close="showPaymentModal = false"
      @paid="onPaymentSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'
import { useSubscriptionsStore } from '~/stores/subscriptions'
import { useAuthStore } from '~/stores/auth'
import PageHero from '~/components/ui/PageHero.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import PaymentModal from '~/components/PaymentModal.vue'
import SubscriptionHistory from '~/components/subscription/SubscriptionHistory.vue'
import SubscriptionPlanManager from '~/components/subscription/SubscriptionPlanManager.vue'

definePageMeta({ layout: 'quizee' })

const alert = useAppAlert()
const subscriptionsStore = useSubscriptionsStore()
const authStore = useAuthStore()
const config = useRuntimeConfig()

const loading = ref(true)
const loadingPackages = ref(true)
const isActive = ref(false)
const activePackageName = ref('')
const packages = ref([])
const phones = ref([])
const userPhones = computed(() => authStore.user?.phones || [])

const selectedPackage = ref(null)
const showPaymentModal = ref(false)
const upgradeMessage = ref(null)

async function checkSubscription() {
  loading.value = true
  try {
    const data = await $fetch(config.public.apiBase + '/api/subscriptions/mine', { credentials: 'include' })
    const sub = data?.subscription || data?.data?.subscription || null
    isActive.value = !!(sub && (sub.status === 'active' || sub.status === 'paid'))
    activePackageName.value = sub?.package?.name || ''
  } catch (e) {
    isActive.value = false
  } finally {
    loading.value = false
  }
}

async function loadData() {
  loadingPackages.value = true
  await Promise.all([
    checkSubscription(),
    subscriptionsStore.fetchPackages().then(() => { packages.value = subscriptionsStore.packages }),
    authStore.fetchUser().then(() => { phones.value = userPhones.value })
  ])
  loadingPackages.value = false
}

onMounted(loadData)

// If redirected after hitting limits, show upgrade prompt
if (process.client) {
  const qs = new URLSearchParams(window.location.search)
  if (qs.get('reason') === 'limit') {
    upgradeMessage.value = qs.get('message') || 'You have reached your current plan limits. Consider upgrading.'
  }
}

function selectPackage(pkg) {
  selectedPackage.value = pkg
}

function openPaymentModal(pkg) {
  if (isActive.value) return
  selectPackage(pkg)
  showPaymentModal.value = true
}

function onPaymentSuccess() {
  showPaymentModal.value = false
  alert.push({ type: 'success', message: 'Payment successful! Your subscription is now active.' })
  // Re-check subscription status to update the UI
  checkSubscription()
}
</script>
