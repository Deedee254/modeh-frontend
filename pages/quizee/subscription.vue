<template>
  <div>
    <PageHero
      title="Choose Your Learning Plan"
      description="Unlock unlimited access to quizzes, detailed analytics, and compete in tournaments."
      :breadcrumbs="[{ text: 'Dashboard', href: '/quizee/dashboard' }, { text: 'Subscription', current: true }]"
      padding="py-12 sm:py-16"
    ></PageHero>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Upgrade Alert/Active Subscription Status -->
      <transition name="slide-fade">
        <div v-if="upgradeMessage" class="mb-8 p-4 bg-brand-50 border-l-4 border-brand-600 rounded-r-lg">
          <div class="flex gap-3">
            <Icon name="heroicons:information-circle" class="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <p class="font-semibold text-gray-900">{{ upgradeMessage }}</p>
              <p class="text-sm text-slate-600 mt-1">Upgrade to continue enjoying unlimited access.</p>
            </div>
          </div>
        </div>
      </transition>

      <div v-if="isActive" class="mb-12 p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-2xl shadow-sm">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
            <Icon name="heroicons:check-solid" class="w-6 h-6 text-white" />
          </div>
          <div class="flex-grow">
            <h3 class="text-lg font-bold text-emerald-900">Premium Access Active</h3>
            <p class="text-emerald-800 mt-2">Your <span class="font-semibold">{{ activePackageName }}</span> subscription is active. Enjoy unlimited quizzes, detailed analytics, and tournament access!</p>
            <div class="mt-4 flex flex-wrap gap-3">
              <button @click="navigateTo('/quizee/dashboard')" class="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition">
                Go to Dashboard
              </button>
              <NuxtLink to="/quizee/profile" class="px-6 py-3 border border-emerald-600 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition">
                View Subscription Details
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Pricing Section -->
      <div class="mb-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Plans Built for Success</h2>
          <p class="text-lg text-slate-600 max-w-2xl mx-auto">Start free and upgrade anytime. No credit card required to get started.</p>
        </div>

        <!-- Loading State -->
        <div v-if="loadingPackages" class="grid gap-8 md:grid-cols-3">
          <div v-for="i in 3" :key="i" class="rounded-2xl bg-white p-8 shadow-md animate-pulse">
            <div class="h-8 bg-slate-200 rounded mb-4"></div>
            <div class="h-4 bg-slate-200 rounded mb-6"></div>
            <div class="h-12 bg-slate-200 rounded mb-6"></div>
            <div class="space-y-3">
              <div class="h-4 bg-slate-200 rounded"></div>
              <div class="h-4 bg-slate-200 rounded"></div>
              <div class="h-4 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>

        <!-- Pricing Cards -->
        <div v-else class="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          <div
            v-for="pkg in quizeePackages"
            :key="pkg.id"
            class="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            :class="[
              pkg.popular
                ? 'md:scale-105 md:shadow-xl bg-white ring-2 ring-brand-600'
                : 'bg-white shadow-lg'
            ]"
          >
            <!-- Card Top Accent -->
            <div
              class="h-1.5"
              :class="pkg.popular ? 'bg-gradient-to-r from-brand-600 to-brand-700' : 'bg-slate-200'"
            ></div>

            <div class="flex flex-col flex-grow p-8">
              <!-- Header -->
              <div class="mb-6">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <h3 class="text-2xl font-bold text-gray-900">{{ pkg.name }}</h3>
                    <p class="text-sm text-slate-500 mt-1">{{ pkg.short_description }}</p>
                  </div>
                  <div v-if="pkg.popular" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold whitespace-nowrap">
                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    Most Popular
                  </div>
                </div>
              </div>

              <!-- Price -->
              <div class="mb-8">
                <div class="flex items-baseline gap-1">
                  <span class="text-5xl font-extrabold text-brand-600">{{ pkg.price ? pkg.currency + pkg.price : 'Free' }}</span>
                  <span v-if="pkg.price" class="text-slate-500">/month</span>
                </div>
                <p v-if="!pkg.price" class="text-sm text-slate-500 mt-2">Perfect to start your journey</p>
                <p v-else class="text-sm text-slate-500 mt-2">Always cancel anytime</p>
              </div>

              <!-- CTA Button -->
              <button
                @click="handleSubscribeClick(pkg)"
                :disabled="isActive && activePackageName === pkg.name"
                :class="[
                  'w-full py-3 px-4 rounded-xl font-semibold transition-all mb-8',
                  pkg.popular
                    ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:shadow-lg hover:from-brand-700 hover:to-brand-800 disabled:opacity-50'
                    : 'border-2 border-brand-600 text-brand-600 hover:bg-brand-50 disabled:opacity-50'
                ]"
              >
                <span v-if="isActive && activePackageName === pkg.name">Your Current Plan</span>
                <span v-else-if="pkg.price">{{ pkg.price ? 'Upgrade Now' : 'Get Started' }}</span>
                <span v-else>Get Started Free</span>
              </button>

              <!-- Features List -->
              <div class="flex-grow">
                <p class="text-xs uppercase font-semibold text-slate-400 mb-4">What's Included</p>
                <ul class="space-y-3">
                  <li v-for="(feat, idx) in (pkg.features?.display || pkg.features || []).slice(0, 6)" :key="idx" class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-brand-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z"/>
                    </svg>
                    <span class="text-sm text-slate-700">{{ feat }}</span>
                  </li>
                </ul>
              </div>

              <!-- Limits Section -->
              <div v-if="pkg.features?.limits" class="mt-6 pt-6 border-t border-slate-200">
                <p class="text-xs uppercase font-semibold text-slate-400 mb-3">Daily Limits</p>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between items-center">
                    <span class="text-slate-600">Quiz Attempts</span>
                    <span class="font-semibold text-slate-900">
                      {{ pkg.features.limits.quiz_results === null ? 'Unlimited' : pkg.features.limits.quiz_results }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-600">Battle Attempts</span>
                    <span class="font-semibold text-slate-900">
                      {{ pkg.features.limits.battle_results === null ? 'Unlimited' : pkg.features.limits.battle_results }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trust Section -->
      <div class="bg-gradient-to-br from-slate-50 to-brand-50/30 rounded-2xl border border-slate-200 p-8 mb-16">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div class="text-3xl font-bold text-brand-600 mb-2">500+</div>
            <p class="text-slate-600">Quizzes Available</p>
          </div>
          <div>
            <div class="text-3xl font-bold text-brand-600 mb-2">10K+</div>
            <p class="text-slate-600">Active Learners</p>
          </div>
          <div>
            <div class="text-3xl font-bold text-brand-600 mb-2">100%</div>
            <p class="text-slate-600">Secure & Private</p>
          </div>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="max-w-3xl mx-auto mb-16">
        <h3 class="text-2xl font-bold text-gray-900 mb-8 text-center">Common Questions</h3>
        <div class="space-y-3">
          <details class="group rounded-lg border border-slate-200 bg-white p-6 hover:border-brand-300 transition cursor-pointer">
            <summary class="flex items-center justify-between font-semibold text-gray-900 select-none">
              Can I change or cancel my subscription?
              <svg class="w-5 h-5 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
              </svg>
            </summary>
            <p class="mt-4 text-slate-600">Yes! You can upgrade, downgrade, or cancel your subscription at any time from your profile. Changes take effect immediately.</p>
          </details>
          <details class="group rounded-lg border border-slate-200 bg-white p-6 hover:border-brand-300 transition cursor-pointer">
            <summary class="flex items-center justify-between font-semibold text-gray-900 select-none">
              What payment methods do you accept?
              <svg class="w-5 h-5 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
              </svg>
            </summary>
            <p class="mt-4 text-slate-600">We accept all major credit cards and M-Pesa payments. Your payment information is secure and never stored.</p>
          </details>
          <details class="group rounded-lg border border-slate-200 bg-white p-6 hover:border-brand-300 transition cursor-pointer">
            <summary class="flex items-center justify-between font-semibold text-gray-900 select-none">
              Do I need a subscription to use Modeh?
              <svg class="w-5 h-5 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
              </svg>
            </summary>
            <p class="mt-4 text-slate-600">No! You can use Modeh free with basic features. Upgrade to unlock unlimited access, tournaments, and advanced analytics.</p>
          </details>
        </div>
      </div>

      <!-- Support Section -->
      <div class="text-center">
        <p class="text-slate-600 mb-4">Have questions about our plans?</p>
        <NuxtLink to="/contact" class="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition">
          <Icon name="heroicons:envelope" class="w-4 h-4" />
          Contact Our Team
        </NuxtLink>
      </div>
    </div>

    <!-- Payment Modal -->
    <PaymentModal
      :open="showPaymentModal"
      :pkg="selectedPackage"
      :phones="phones"
      @close="showPaymentModal = false"
      @paid="onPaymentSuccess"
    ></PaymentModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'
import { useSubscriptionsStore } from '~/stores/subscriptions'
import { useAuthStore } from '~/stores/auth'
import useApi from '~/composables/useApi'
import PageHero from '~/components/ui/PageHero.vue'
import PaymentModal from '~/components/PaymentModal.vue'

definePageMeta({ layout: 'quizee' })

const alert = useAppAlert()
const subscriptionsStore = useSubscriptionsStore()
const authStore = useAuthStore()
const api = useApi()
const config = useRuntimeConfig()
const router = useRouter()

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

// Computed property to filter only Quizee packages
const quizeePackages = computed(() => {
  return packages.value.filter(pkg => {
    const pkgType = pkg.type || pkg.category || (pkg.name?.toLowerCase().includes('institution') ? 'institution' : 'quizee')
    return pkgType.includes('quizee') || pkgType === 'individual'
  }).sort((a, b) => {
    // Sort so popular plan is in the middle
    if (a.popular) return 1
    if (b.popular) return -1
    return 0
  })
})

async function checkSubscription() {
  loading.value = true
  try {
    const res = await api.get('/api/subscriptions/mine')
    if (res.status === 401 || res.status === 419) {
      // If unauthenticated, don't necessarily log out the whole app here
      // but acknowledge we are not active
      isActive.value = false
      return
    }
    const data = await res.json().catch(() => null)
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

function handleSubscribeClick(pkg) {
  if (isActive.value && activePackageName.value === pkg.name) {
    return // Button is disabled
  }
  selectedPackage.value = pkg
  showPaymentModal.value = true
}

function onPaymentSuccess() {
  showPaymentModal.value = false
  alert.push({ type: 'success', message: 'Payment successful! Your subscription is now active.' })
  // Re-check subscription status to update the UI
  checkSubscription()
}
</script>
