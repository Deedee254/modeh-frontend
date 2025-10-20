<template>
  <div class="bg-white rounded-lg shadow-sm border p-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">Subscription History</h2>
    
    <div v-if="loading" class="space-y-4">
      <UiSkeleton class="h-16 rounded-lg" v-for="i in 3" :key="i" />
    </div>

    <div v-else-if="!history.length" class="text-center py-6">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No subscription history</h3>
      <p class="mt-1 text-sm text-gray-500">You haven't subscribed to any plans yet.</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="item in history" :key="item.id" 
           class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
        <div>
          <h3 class="font-medium text-gray-900">{{ item.plan_name }}</h3>
          <p class="text-sm text-gray-500">
            {{ new Date(item.start_date).toLocaleDateString() }} - 
            {{ item.end_date ? new Date(item.end_date).toLocaleDateString() : 'Current' }}
          </p>
          <div v-if="item.package?.features?.limits" class="text-sm text-gray-600 mt-2">
            <strong>Limits:</strong>
            <div>Quiz results: {{ item.package.features.limits.quiz_results === null ? 'Unlimited' : item.package.features.limits.quiz_results }} / day</div>
            <div>Battle results: {{ item.package.features.limits.battle_results === null ? 'Unlimited' : item.package.features.limits.battle_results }} / day</div>
          </div>
          <div v-if="item.previous_subscription" class="text-sm text-gray-500 mt-2">
            <em>Switched from: {{ item.previous_subscription.package?.title || item.previous_subscription.plan_name || '—' }}</em>
          </div>
          <span :class="[getStatusClass(item.status), 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2']">
            {{ item.status }}
          </span>
        </div>
        <div class="text-right">
          <p class="font-medium text-gray-900">{{ formatAmount(item.amount) }}</p>
          <p class="text-sm text-gray-500">{{ item.payment_method }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'

const alert = useAppAlert()
const loading = ref(true)
const history = ref([])

function getStatusClass(status) {
  const classes = {
    active: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800'
  }
  const key = (status || '').toString().toLowerCase()
  return classes[key] || 'bg-gray-100 text-gray-800'
}

function formatAmount(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KES'
  }).format(amount)
}

async function fetchHistory() {
  loading.value = true
  try {
    const res = await fetch(useRuntimeConfig().public.apiBase + '/api/subscriptions/history', {
      credentials: 'include'
    })
    if (res.ok) {
      const data = await res.json()
      // backend returns { ok: true, subscriptions: [...], subscription: {...} }
      history.value = data.subscriptions || []
    } else {
      alert.push({ type: 'error', message: 'Failed to load subscription history', icon: 'heroicons:exclamation-circle' })
    }
  } catch (e) {
    alert.push({ type: 'error', message: 'Network error', icon: 'heroicons:x-circle' })
  }
  loading.value = false
}

onMounted(fetchHistory)
</script>