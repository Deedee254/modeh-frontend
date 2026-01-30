<template>
  <UiCard class="rounded-xl border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/30 flex items-center justify-center">
          <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div class="flex-1 font-semibold text-lg">Recent Transactions</div>
        <NuxtLink to="/quizee/transactions" class="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300">View all →</NuxtLink>
      </div>
    </template>
    <div class="p-6">
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="animate-pulse flex items-center gap-4 p-3 rounded-lg bg-gray-100 dark:bg-slate-700/50">
          <div class="w-10 h-10 bg-gray-200 dark:bg-slate-600 rounded"></div>
          <div class="flex-1">
            <div class="h-4 bg-gray-200 dark:bg-slate-600 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-200 dark:bg-slate-600 rounded w-1/2"></div>
          </div>
        </div>
      </div>
      <div v-else-if="transactions.length" class="space-y-3">
        <div v-for="tx in transactions.slice(0, 5)" :key="tx.id" class="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 group">
          <!-- Icon based on type -->
          <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" :class="getIconBg(tx)">
            <svg :class="getIconClass(tx)" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="isSubscription(tx)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1m2 1v2.5M4 7l2 1m-2-1l2-1m-2 1v2.5"></path>
            </svg>
          </div>
          
          <!-- Details -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ tx.description || getDescription(tx) }}</p>
            <div class="flex items-center gap-2 mt-1">
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(tx.paid_at) }}</p>
              <span :class="['text-xs px-2 py-0.5 rounded-full font-semibold', getStatusBadge(tx.status)]">
                {{ formatStatus(tx.status) }}
              </span>
            </div>
          </div>
          
          <!-- Amount and download -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <span class="text-sm font-bold text-gray-900 dark:text-white">{{ formatCurrency(tx.amount) }}</span>
            <button @click="downloadInvoice(tx)" class="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-600" title="Download PDF">
              <svg class="w-4 h-4 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 16v-4m0 0V8m0 4h4m-4 0H8"></path></svg>
            </button>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8">
        <svg class="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <p class="text-sm text-gray-500 dark:text-gray-400">No transactions yet</p>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Subscribe to unlock features</p>
        <NuxtLink to="/quizee/subscription" class="inline-block mt-3 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-all duration-200">
          Get Started
        </NuxtLink>
      </div>
    </div>
  </UiCard>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import useApi from '~/composables/useApi'
import UiCard from '~/components/ui/UiCard.vue'

const api = useApi()

const transactions = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    loading.value = true
    const response = await api.get('/api/transactions?page=1&per_page=5')
    if (!response.ok) {
      console.error('Failed to fetch transactions:', response.status, response.statusText)
      transactions.value = []
      loading.value = false
      return
    }
    const data = await response.json()
    transactions.value = data.data || data.invoices || []
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
    transactions.value = []
  } finally {
    loading.value = false
  }
})

function isSubscription(tx) {
  return tx.invoiceable_type?.includes('Subscription')
}

function getIconBg(tx) {
  if (isSubscription(tx)) {
    return 'bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30'
  }
  return 'bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/30'
}

function getIconClass(tx) {
  if (isSubscription(tx)) {
    return 'text-blue-600 dark:text-blue-400'
  }
  return 'text-purple-600 dark:text-purple-400'
}

function getDescription(tx) {
  if (tx.description) return tx.description
  if (isSubscription(tx)) {
    return `Subscription - ${tx.invoiceable?.package?.title || 'Plan'}`
  }
  return 'Purchase'
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })
}

function formatStatus(status) {
  const map = {
    'paid': 'Paid',
    'pending': 'Pending',
    'overdue': 'Overdue',
    'cancelled': 'Cancelled'
  }
  return map[status] || status
}

function getStatusBadge(status) {
  const map = {
    'paid': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'overdue': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    'cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
  return map[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
}

async function downloadInvoice(tx) {
  try {
    const response = await api.get(`/transactions/${tx.id}/download`)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${tx.invoice_number || tx.id}.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Failed to download invoice:', error)
  }
}
</script>
