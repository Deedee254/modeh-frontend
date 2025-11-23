<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import useApi from '~/composables/useApi'
import { useInstitutionsStore } from '~/stores/institutions'
import { useAppAlert } from '~/composables/useAppAlert'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import ErrorAlert from '~/components/ui/ErrorAlert.vue'
import PageHero from '~/components/institution/PageHero.vue'

definePageMeta({ layout: 'institution' as any })

const api = useApi()
const route = useRoute()
const institutionId = ref((route.query.institutionSlug || null) as string | null)
const appAlert = useAppAlert()

interface Package {
  id: string | number
  price?: number
  title?: string
  short_description?: string
  price_display?: string
  features?: any
  interval?: string
  popular?: boolean
  [key: string]: any
}

const packages = ref<Package[]>([])
const loading = ref(false)
const error = ref(null as any)
const selectedPackage = ref(null as Package | null)
const showConfirmModal = ref(false)
const subscribing = ref(false)
const showPhoneModal = ref(false)
const phoneNumber = ref('')

const freePackages = computed(() => packages.value.filter(p => !p.price || p.price === 0))
const paidPackages = computed(() => packages.value.filter(p => p.price && p.price > 0))

async function loadPackages() {
  loading.value = true
  error.value = null
  try {
    let url = '/api/packages'
    if (institutionId.value) url += '?audience=institution'
    const resp = await api.get(url)
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    packages.value = json?.packages || []
  } catch (e: any) {
    error.value = e
  } finally {
    loading.value = false
  }
}

function selectPackage(pkg: Package) {
  selectedPackage.value = pkg
  showConfirmModal.value = true
}

async function confirmSubscribe() {
  if (!institutionId.value || !selectedPackage.value) {
    appAlert.push({ message: 'No institution selected. Please navigate from your institution.', type: 'warning' })
    return
  }

  try {
    const instStore = useInstitutionsStore()
    await instStore.setActiveInstitution(String(institutionId.value))
    const inst = (instStore as any).institution?.value || (instStore as any).institution

    const pkg = selectedPackage.value
    const isNumeric = /^\d+$/.test(String(institutionId.value))
    const body: any = {
      owner_type: 'institution',
      gateway: (Number(pkg.price) > 0) ? 'mpesa' : 'free'
    }

    if (inst && (inst as any).id) body.owner_id = (inst as any).id
    else if (isNumeric) body.owner_id = institutionId.value
    else body.owner_slug = institutionId.value

    if (Number(pkg.price) > 0 && body.gateway === 'mpesa') {
      showConfirmModal.value = false
      showPhoneModal.value = true
      return
    }

    subscribing.value = true
    const resp = await api.postJson(`/api/packages/${pkg.id}/subscribe`, body)
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    if (resp.ok) {
      appAlert.push({ message: `Successfully subscribed to ${pkg.title}!`, type: 'success' })
      showConfirmModal.value = false
      selectedPackage.value = null
      await loadPackages()
    } else {
      appAlert.push({ message: json?.message || 'Failed to subscribe', type: 'error' })
    }
  } catch (e: any) {
    appAlert.push({ message: 'Failed to subscribe: ' + (e?.message || e), type: 'error' })
  } finally {
    subscribing.value = false
  }
}

async function submitPhoneAndSubscribe() {
  if (!phoneNumber.value.trim()) {
    appAlert.push({ message: 'Please enter a phone number', type: 'warning' })
    return
  }

  if (!institutionId.value || !selectedPackage.value) return

  try {
    const instStore = useInstitutionsStore()
    await instStore.setActiveInstitution(String(institutionId.value))
    const inst = (instStore as any).institution?.value || (instStore as any).institution

    const pkg = selectedPackage.value
    const isNumeric = /^\d+$/.test(String(institutionId.value))
    const body: any = {
      owner_type: 'institution',
      gateway: 'mpesa',
      phone: phoneNumber.value.trim()
    }

    if (inst && (inst as any).id) body.owner_id = (inst as any).id
    else if (isNumeric) body.owner_id = institutionId.value
    else body.owner_slug = institutionId.value

    subscribing.value = true
    const resp = await api.postJson(`/api/packages/${pkg.id}/subscribe`, body)
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    if (resp.ok) {
      appAlert.push({ message: `Mpesa payment initiated for ${pkg.title}. Check your phone.`, type: 'success' })
      showPhoneModal.value = false
      showConfirmModal.value = false
      phoneNumber.value = ''
      selectedPackage.value = null
      await loadPackages()
    } else {
      appAlert.push({ message: json?.message || 'Failed to initiate payment', type: 'error' })
    }
  } catch (e: any) {
    appAlert.push({ message: 'Failed to process payment: ' + (e?.message || e), type: 'error' })
  } finally {
    subscribing.value = false
  }
}

function formatPrice(price: number | undefined): string {
  if (!price) return 'Free'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES' }).format(Number(price))
}

onMounted(() => {
  if (!packages.value.length) loadPackages()
})
</script>

<template>
  <!-- Page Hero -->
  <PageHero
    title="Subscription Plans"
    description="Choose the perfect plan for your institution and unlock advanced features"
    theme="green"
  />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <LoadingSpinner v-if="loading" />
    <ErrorAlert v-else-if="error">Failed to load packages: {{ error.message || error }}</ErrorAlert>

    <div v-else class="space-y-12">
      <!-- Free Plans -->
      <div v-if="freePackages.length > 0">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">Free Plans</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="plan in freePackages" :key="plan.id" class="relative bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-lg hover:border-green-300 dark:hover:border-green-700 transition-all duration-200">
            <div v-if="plan.popular" class="absolute top-0 right-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">POPULAR</div>
            <div class="p-6 sm:p-8 flex flex-col h-full">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ plan.title }}</h3>
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 flex-grow">{{ plan.short_description }}</p>
              <div class="mt-6 mb-8">
                <span class="text-4xl font-bold text-gray-900 dark:text-white">Free</span>
              </div>
              <div v-if="plan.features && typeof plan.features === 'object' && !Array.isArray(plan.features)" class="space-y-3 mb-8 flex-grow">
                <div v-if="(plan.features as any).limits" class="space-y-2">
                  <div v-for="(limit, key) in (plan.features as any).limits" :key="key" class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ key }}: {{ limit }}</span>
                  </div>
                </div>
              </div>
              <button @click="selectPackage(plan)" class="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-200">Get Started</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Premium Plans -->
      <div v-if="paidPackages.length > 0">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">Premium Plans</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="plan in paidPackages" :key="plan.id" class="relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200" :class="{ 'border-2 border-green-500 ring-2 ring-green-500 ring-opacity-50': plan.popular, 'border border-gray-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700': !plan.popular }">
            <div v-if="plan.popular" class="absolute top-0 right-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">POPULAR</div>
            <div class="p-6 sm:p-8 flex flex-col h-full">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ plan.title }}</h3>
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 flex-grow">{{ plan.short_description }}</p>
              <div class="mt-6 mb-8">
                <div class="flex items-baseline">
                  <span class="text-4xl font-bold text-gray-900 dark:text-white">{{ formatPrice(plan.price) }}</span>
                  <span v-if="plan.interval" class="ml-2 text-sm text-gray-600 dark:text-gray-400">/{{ plan.interval }}</span>
                </div>
              </div>
              <div v-if="plan.features && typeof plan.features === 'object' && !Array.isArray(plan.features)" class="space-y-3 mb-8 flex-grow">
                <div v-if="(plan.features as any).limits" class="space-y-2">
                  <div v-for="(limit, key) in (plan.features as any).limits" :key="key" class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ key }}: {{ limit }}</span>
                  </div>
                </div>
              </div>
              <button @click="selectPackage(plan)" :class="{ 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white': plan.popular, 'border border-green-600 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20': !plan.popular }" class="w-full px-4 py-3 font-semibold rounded-lg transition-all duration-200">Subscribe Now</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="packages.length === 0" class="text-center py-12">
        <p class="text-gray-600 dark:text-gray-400">No subscription plans available.</p>
      </div>
    </div>

    <!-- Confirm Modal -->
    <div v-if="showConfirmModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="fixed inset-0 bg-black bg-opacity-50" @click="showConfirmModal = false"></div>
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
          <div class="p-6 sm:p-8">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Subscribe to {{ selectedPackage?.title }}?</h3>
            <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">You will be subscribed to the <strong>{{ selectedPackage?.title }}</strong> plan<span v-if="selectedPackage?.price"> for <strong>{{ formatPrice(selectedPackage.price) }}</strong></span>.</p>
            <div class="mt-6 flex flex-col-reverse sm:flex-row gap-3">
              <button @click="showConfirmModal = false" :disabled="subscribing" class="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200 font-medium disabled:opacity-50">Cancel</button>
              <button @click="confirmSubscribe" :disabled="subscribing" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50">{{ subscribing ? 'Processing...' : 'Confirm' }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Phone Modal -->
    <div v-if="showPhoneModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="fixed inset-0 bg-black bg-opacity-50" @click="showPhoneModal = false"></div>
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
          <div class="p-6 sm:p-8">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Enter Phone Number</h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">We need your phone number to initiate the Mpesa payment of <strong>{{ formatPrice(selectedPackage?.price) }}</strong>.</p>
            <input v-model="phoneNumber" type="tel" placeholder="+254712345678" class="w-full mt-4 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
            <div class="mt-6 flex flex-col-reverse sm:flex-row gap-3">
              <button @click="showPhoneModal = false" :disabled="subscribing" class="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200 font-medium disabled:opacity-50">Cancel</button>
              <button @click="submitPhoneAndSubscribe" :disabled="subscribing || !phoneNumber.trim()" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50">{{ subscribing ? 'Processing...' : 'Pay with Mpesa' }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
