<template>
  <div class="bg-white rounded-lg shadow-sm border p-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">Subscription Plans</h2>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UiSkeleton class="h-64 rounded-lg" v-for="i in 3" :key="i" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="plan in plans" :key="plan.id" 
           class="relative border rounded-lg p-6 flex flex-col"
           :class="{'border-indigo-500 ring-2 ring-indigo-500 ring-opacity-50': plan.id === currentPlan?.id}">
        <!-- Popular badge -->
        <div v-if="plan.popular" class="absolute top-0 right-0 -mr-1 -mt-1">
          <span class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
            Popular
          </span>
        </div>

        <h3 class="text-lg font-medium text-gray-900">{{ plan.name }}</h3>
        <p class="mt-2 text-sm text-gray-500">{{ plan.description }}</p>
        
        <div class="mt-4">
          <span class="text-3xl font-extrabold text-gray-900">{{ formatAmount(plan.price) }}</span>
          <span class="text-base font-medium text-gray-500">/{{ plan.interval }}</span>
        </div>

        <ul class="mt-6 space-y-4 flex-1">
          <li v-for="feature in (plan.features?.display || plan.features || [])" :key="feature" class="flex items-start">
            <svg class="flex-shrink-0 h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="ml-3 text-sm text-gray-500">{{ feature }}</span>
          </li>
        </ul>

        <div v-if="plan.features?.limits" class="mt-4 text-sm text-gray-600">
          <h4 class="font-medium text-gray-900">Plan limits</h4>
          <ul class="mt-2 space-y-1">
            <li v-if="plan.features.limits.quiz_results">Quiz results: {{ plan.features.limits.quiz_results === null ? 'Unlimited' : plan.features.limits.quiz_results }} per day</li>
            <li v-if="plan.features.limits.battle_results">Battle results: {{ plan.features.limits.battle_results === null ? 'Unlimited' : plan.features.limits.battle_results }} per day</li>
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
  <UModal v-if="showConfirmation" @close="showConfirmation = false">
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'

const config = useRuntimeConfig()

const alert = useAppAlert()
const loading = ref(true)
const plans = ref([])
const currentPlan = ref(null)
const selectedPlan = ref(null)
const showConfirmation = ref(false)
const processing = ref(false)

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

async function fetchPlans() {
  loading.value = true
  try {
    const packagesRes = await fetch(config.public.apiBase + '/api/packages', { credentials: 'include' })
    const subsRes = await fetch(config.public.apiBase + '/api/subscriptions/mine', { credentials: 'include' })

    if (packagesRes.ok) {
      const data = await packagesRes.json()
      plans.value = data.packages || data.plans || []
    }

    if (subsRes.ok) {
      const data = await subsRes.json()
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
    // Backend expects POST /api/packages/{package}/subscribe
    const res = await fetch(config.public.apiBase + `/api/packages/${selectedPlan.value.id}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ gateway: 'mpesa', phone: selectedPlan.value.phone || null })
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.message || 'Failed to update subscription')
    }

    alert.push({ type: 'success', message: 'Subscription updated successfully', icon: 'heroicons:check-circle' })
    await fetchPlans() // Refresh data
  } catch (e) {
    alert.push({ type: 'error', message: e.message || 'Failed to update subscription', icon: 'heroicons:x-circle' })
  }
  processing.value = false
  showConfirmation.value = false
}

onMounted(fetchPlans)
</script>