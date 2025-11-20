<template>
  <div class="bg-white rounded-lg shadow-sm border p-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">Subscription Plans</h2>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UiSkeleton class="h-64 rounded-lg skeleton-item" v-for="i in 3" :key="i" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="plan in plans" :key="plan.id" 
        class="relative border rounded-lg p-6 flex flex-col"
        :class="{'border-indigo-500 ring-2 ring-indigo-500 ring-opacity-50': isActive(plan)}">
        <!-- Popular badge -->
        <div v-if="plan.popular" class="absolute top-0 right-0 -mr-1 -mt-1">
          <span class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
            Popular
          </span>
        </div>

  <h3 class="text-lg font-medium text-gray-900">{{ plan.name }}</h3>
        <p class="mt-2 text-sm text-gray-500">
          <template v-for="(line, idx) in descriptionLines(plan.description)" :key="idx">
            <span>{{ line }}</span>
            <br v-if="idx < descriptionLines(plan.description).length - 1" />
          </template>
        </p>
        
        <div class="mt-4">
          <span class="text-3xl font-extrabold text-gray-900">{{ formatAmount(plan.price) }}</span>
          <span v-if="plan.interval" class="text-base font-medium text-gray-500">/{{ plan.interval }}</span>
        </div>

        <ul class="mt-6 space-y-4 flex-1">
          <li v-for="(feature, idx) in getFeatures(plan)" :key="idx" class="flex items-start">
            <svg class="flex-shrink-0 h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="ml-3 text-sm text-gray-500">{{ feature }}</span>
          </li>
        </ul>

        <div v-if="plan.features?.limits" class="mt-4 text-sm text-gray-600">
          <h4 class="font-medium text-gray-900">Plan limits</h4>
          <ul class="mt-2 space-y-1">
            <li v-if="plan.features.limits && typeof plan.features.limits.quiz_results !== 'undefined'">Quiz results: {{ plan.features.limits.quiz_results === null ? 'Unlimited' : plan.features.limits.quiz_results }} per day</li>
            <li v-if="plan.features.limits && typeof plan.features.limits.battle_results !== 'undefined'">Battle results: {{ plan.features.limits.battle_results === null ? 'Unlimited' : plan.features.limits.battle_results }} per day</li>
          </ul>
        </div>

        <div class="mt-8">
          <button v-if="plan.id === currentPlan?.id"
                  class="w-full bg-gray-100 border border-transparent rounded-md py-3 px-5 text-base font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  disabled>
            Current Plan
          </button>
          <button v-else
                  @click="selectPlan(plan)"
                  class="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-5 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            {{ currentPlan ? 'Switch Plan' : 'Subscribe' }}
          </button>
        </div>
      </div>
    </div>

  <!-- Confirmation Modal -->
  <UModal v-model="showConfirmation">
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Confirm Subscription Change</h3>
        <p class="text-sm text-gray-500 mb-4">
          Are you sure you want to {{ currentPlan ? 'switch to' : 'subscribe to' }} the {{ selectedPlan?.name }} plan?
          <template v-if="currentPlan">
            Your current subscription will be prorated.
          </template>
        </p>
        <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
          <button
            type="button"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            @click="confirmSubscription"
            :disabled="processing"
          >
            {{ processing ? 'Processing...' : 'Confirm' }}
          </button>
          <button
            type="button"
            class="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            @click="showConfirmation = false"
            :disabled="processing"
          >
            Cancel
          </button>
        </div>
      </div>
  </UModal>
  <!-- Phone input modal (shown when backend requires phone) -->
  <UModal v-model="showPhoneModal">
    <div class="p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Enter Phone to Continue</h3>
      <p class="text-sm text-gray-500 mb-4">We need your phone number to initiate the Mpesa payment. Amount: <strong v-if="pendingPackagePrice">{{ formatAmount(pendingPackagePrice) }}</strong></p>
      <div class="space-y-3">
        <input v-model="phoneInput" type="tel" class="w-full border rounded-md px-3 py-2" placeholder="eg. 2547XXXXXXXX" />
        <p v-if="phoneError" class="text-sm text-red-600">{{ phoneError }}</p>
      </div>
      <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
        <button
          type="button"
          class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
          @click="confirmPhoneSubscription"
          :disabled="processing"
        >
          {{ processing ? 'Processing...' : 'Confirm & Pay' }}
        </button>
        <button
          type="button"
          class="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
          @click="showPhoneModal = false"
          :disabled="processing"
        >
          Cancel
        </button>
      </div>
    </div>
  </UModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'

const config = useRuntimeConfig()
defineProps({
  ownerType: { type: String, default: null },
  ownerId: { type: [String, Number], default: null }
})

const alert = useAppAlert()
const loading = ref(true)
const plans = ref([])
const currentPlan = ref(null)
const selectedPlan = ref(null)
const showConfirmation = ref(false)
const processing = ref(false)
const showPhoneModal = ref(false)
const phoneInput = ref('')
const phoneError = ref('')
const pendingPackagePrice = ref(null)

function formatAmount(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KES'
  }).format(amount)
}

function selectPlan(plan) {
  selectedPlan.value = plan
  showConfirmation.value = true
}

function getFeatures(plan) {
  if (!plan || !plan.features) return []
  const f = plan.features
  // Prefer an explicit display array
  if (Array.isArray(f.display)) return f.display.filter(Boolean)
  // If features is already an array
  if (Array.isArray(f)) return f.filter(Boolean)
  // If it's an object, collect string values skipping known keys like 'limits'
  if (typeof f === 'object' && f !== null) {
    const out = []
    Object.keys(f).sort().forEach((k) => {
      if (k === 'limits') return
      const v = f[k]
      if (typeof v === 'string' && v.trim() !== '') out.push(v)
      else if (Array.isArray(v)) {
        v.forEach((i) => { if (typeof i === 'string' && i.trim() !== '') out.push(i) })
      }
    })
    return out
  }
  return []
}

function stripHtml(input) {
  if (!input) return ''
  try {
    // Remove HTML tags
    let s = String(input).replace(/<[^>]*>/g, '')
    // Collapse multiple spaces and trim
    s = s.replace(/\s+/g, ' ').trim()
    // Preserve basic line breaks (convert \n to <br>)
    s = s.replace(/\n/g, '<br/>')
    return s
  } catch (e) {
    return String(input)
  }
}

function formatDescription(desc) {
  const cleaned = stripHtml(desc)
  // v-html expects safe HTML; we've stripped tags and only allow <br/>
  return cleaned
}

function descriptionLines(desc) {
  const cleaned = stripHtml(desc)
  // split on <br/> or line breaks
  const parts = cleaned.split(/<br\/?\s*>|\n/gi).map(s => s.trim()).filter(Boolean)
  return parts.length ? parts : [cleaned]
}

const api = useApi()

async function fetchPlans() {
  loading.value = true
  try {
    // Request packages for the appropriate audience when ownerType is provided
    let pkgUrl = '/api/packages'
    if (typeof ownerType !== 'undefined' && ownerType === 'institution') {
      pkgUrl += '?audience=institution'
    } else if (typeof ownerType !== 'undefined' && ownerType === 'user') {
      pkgUrl += '?audience=quizee'
    }
    const packagesRes = await api.get(pkgUrl)
    const subsRes = await api.get('/api/subscriptions/mine')

    if (packagesRes && packagesRes.ok) {
      const data = await packagesRes.json().catch(() => ({}))
      plans.value = data.packages || data.plans || []
    }

    if (subsRes && subsRes.ok) {
      const data = await subsRes.json().catch(() => ({}))
      currentPlan.value = data.subscription || null
    }
  } catch (e) {
    alert.push({ type: 'error', message: 'Failed to load subscription data', icon: 'heroicons:x-circle' })
  }
  loading.value = false
}

async function confirmSubscription() {
  if (!selectedPlan.value) return

  processing.value = true
  try {
    // Use centralized API composable which handles CSRF/session for us
    const pkgPrice = selectedPlan.value?.price ?? pendingPackagePrice.value ?? 0
    const gatewayToUse = (Number(pkgPrice) === 0) ? 'free' : 'mpesa'
    const payload = {
      gateway: gatewayToUse,
      phone: selectedPlan.value.phone || null
    }
    if (typeof ownerType !== 'undefined' && ownerType && ownerId) {
      payload.owner_type = ownerType
      payload.owner_id = ownerId
    }
    const res = await api.postJson(`/api/packages/${selectedPlan.value.id}/subscribe`, payload)

    if (!res.ok) {
      // Helpful handling for CSRF/session expiration (Laravel returns 419)
      if (res.status === 419) {
        throw new Error('Session expired or invalid CSRF token. Please refresh the page and try again.')
      }

      // If backend indicates a phone is required, open the phone modal so the user can
      // enter their phone and retry. Backend responds with 422 and { require_phone: true }
      if (res.status === 422) {
        const data = await res.json().catch(() => ({}))
        if (data && data.require_phone) {
          // prefill phone if backend returned one in subscription.gateway_meta
          phoneInput.value = (data.subscription && data.subscription.gateway_meta && data.subscription.gateway_meta.phone) || ''
          pendingPackagePrice.value = data.package?.price ?? selectedPlan.value.price ?? null
          showConfirmation.value = false
          showPhoneModal.value = true
          processing.value = false
          return
        }
      }

      // Try to extract a helpful message from JSON or plain text
      let parsed = null
      try {
        parsed = await res.json()
      } catch (e) {
        try { parsed = await res.text() } catch (err) { parsed = null }
      }

      let message = null
      if (parsed) {
        if (typeof parsed === 'string') message = parsed
        else if (parsed.message) message = parsed.message
        else message = JSON.stringify(parsed)
      }
      if (!message) message = `Failed to update subscription (status ${res.status})`
      throw new Error(message)
    }

    alert.push({ type: 'success', message: 'Subscription updated successfully', icon: 'heroicons:check-circle' })
    await fetchPlans() // Refresh data
  } catch (e) {
    alert.push({ type: 'error', message: e.message || 'Failed to update subscription', icon: 'heroicons:x-circle' })
  }
  processing.value = false
  showConfirmation.value = false
}

async function confirmPhoneSubscription() {
  phoneError.value = ''
  if (!phoneInput.value || phoneInput.value.trim().length < 6) {
    phoneError.value = 'Please enter a valid phone number'
    return
  }
  processing.value = true
  try {
    const pkgPrice = selectedPlan.value?.price ?? pendingPackagePrice.value ?? 0
    const gatewayToUse = (Number(pkgPrice) === 0) ? 'free' : 'mpesa'
    const payload = {
      gateway: gatewayToUse,
      phone: phoneInput.value.trim()
    }
    if (typeof ownerType !== 'undefined' && ownerType && ownerId) {
      payload.owner_type = ownerType
      payload.owner_id = ownerId
    }
    const res = await api.postJson(`/api/packages/${selectedPlan.value.id}/subscribe`, payload)

    if (!res.ok) {
      if (res.status === 419) {
        throw new Error('Session expired or invalid CSRF token. Please refresh the page and try again.')
      }

      let parsed = null
      try {
        parsed = await res.json()
      } catch (e) {
        try { parsed = await res.text() } catch (err) { parsed = null }
      }
      let message = null
      if (parsed) {
        if (typeof parsed === 'string') message = parsed
        else if (parsed.message) message = parsed.message
        else message = JSON.stringify(parsed)
      }
      if (!message) message = `Failed to update subscription (status ${res.status})`
      throw new Error(message)
    }

    alert.push({ type: 'success', message: 'Subscription updated successfully', icon: 'heroicons:check-circle' })
    showPhoneModal.value = false
    await fetchPlans()
  } catch (e) {
    alert.push({ type: 'error', message: e.message || 'Failed to update subscription', icon: 'heroicons:x-circle' })
  }
  processing.value = false
}

onMounted(fetchPlans)

function isActive(plan) {
  try {
    // Normalize IDs to string before comparison to avoid type mismatches
    return String(plan.id) === String(currentPlan?.id)
  } catch (e) {
    return false
  }
}
</script>

<style scoped>
/* Show only the first skeleton on small screens, and up to 3 on md+ */
@media (max-width: 767px) {
  .skeleton-item:nth-child(n+2) {
    display: none;
  }
}
@media (min-width: 768px) {
  .skeleton-item {
    display: block;
  }
}
</style>