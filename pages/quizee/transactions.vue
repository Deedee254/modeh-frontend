<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <!-- Breadcrumb -->
      <nav class="text-sm text-gray-600 mb-6">
        <NuxtLink to="/quizee/dashboard" class="hover:text-brand-600">Dashboard</NuxtLink>
        <span class="mx-2">›</span>
        <span class="text-gray-900 font-medium">Transactions & Invoices</span>
      </nav>

      <!-- Header Section -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Transactions & Invoices</h1>
        <p class="text-lg text-gray-600">Track your spending, manage renewals, and download invoices.</p>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Total Spent -->
        <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm font-medium text-gray-600">Total Spent</p>
            <Icon name="heroicons:currency-dollar" class="w-5 h-5 text-brand-600" />
          </div>
          <p class="text-3xl font-bold text-gray-900">KES {{ formatCurrency(totalSpent) }}</p>
          <p class="text-xs text-gray-500 mt-2">{{ totalTransactions }} transaction{{ totalTransactions !== 1 ? 's' : '' }}</p>
        </div>

        <!-- Active Subscription -->
        <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm font-medium text-gray-600">Active Subscription</p>
            <Icon name="heroicons:sparkles" class="w-5 h-5 text-green-600" />
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ activeSubscription ? activeSubscription.package?.name : 'None' }}</p>
          <p class="text-xs text-gray-500 mt-2" v-if="activeSubscription">
            Renews {{ formatDate(activeSubscription.renews_at) }}
          </p>
          <p class="text-xs text-gray-500 mt-2" v-else>No active subscription</p>
        </div>

        <!-- Upcoming Renewals -->
        <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm font-medium text-gray-600">Upcoming Renewals</p>
            <Icon name="heroicons:calendar" class="w-5 h-5 text-blue-600" />
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ upcomingRenewals.length }}</p>
          <p class="text-xs text-gray-500 mt-2">Within 30 days</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-lg border border-gray-200 mb-6">
        <div class="border-b border-gray-200">
          <div class="flex gap-0.5 px-6" role="tablist">
            <button
              @click="activeTab = 'transactions'"
              :class="[
                'px-4 py-3 text-sm font-medium border-b-2 transition',
                activeTab === 'transactions'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              ]"
              role="tab"
              :aria-selected="activeTab === 'transactions'"
            >
              <Icon name="heroicons:document-text" class="w-4 h-4 inline-block mr-2" />
              All Transactions
            </button>
            <button
              @click="activeTab = 'renewals'"
              :class="[
                'px-4 py-3 text-sm font-medium border-b-2 transition',
                activeTab === 'renewals'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              ]"
              role="tab"
              :aria-selected="activeTab === 'renewals'"
            >
              <Icon name="heroicons:clock" class="w-4 h-4 inline-block mr-2" />
              Upcoming Renewals
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <!-- Filters -->
          <div class="flex flex-col sm:flex-row gap-4 mb-6">
            <div class="flex-1">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search invoices..."
                class="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            <select
              v-model="filterStatus"
              class="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              v-model="filterType"
              class="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="subscription">Subscription</option>
              <option value="one_off">One-Off Purchase</option>
            </select>
          </div>

          <!-- Transactions Tab -->
          <div v-if="activeTab === 'transactions'">
            <!-- Loading State -->
            <div v-if="loading" class="space-y-4">
              <div v-for="i in 3" :key="i" class="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredTransactions.length === 0" class="text-center py-12">
              <Icon name="heroicons:inbox" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 class="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
              <p class="text-gray-600">Start by subscribing to a plan to see your transactions.</p>
              <NuxtLink
                to="/quizee/subscription"
                class="inline-block mt-4 px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition font-medium text-sm"
              >
                Browse Plans
              </NuxtLink>
            </div>

            <!-- Transactions List -->
            <div v-else class="space-y-3">
              <div
                v-for="invoice in filteredTransactions"
                :key="invoice.id"
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer group"
                @click="selectInvoice(invoice)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <!-- Invoice Header -->
                    <div class="flex items-center gap-4 mb-2">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                          <p class="font-semibold text-gray-900">{{ invoice.invoice_number }}</p>
                          <span
                            :class="[
                              'px-3 py-1 rounded-full text-xs font-medium',
                              invoice.status === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : invoice.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                            ]"
                          >
                            {{ formatStatus(invoice.status) }}
                          </span>
                        </div>
                        <p class="text-sm text-gray-600">
                          {{ getInvoiceableLabel(invoice) }}
                        </p>
                      </div>
                      <div class="text-right">
                        <p class="text-lg font-bold text-gray-900">KES {{ formatCurrency(invoice.amount) }}</p>
                        <p class="text-xs text-gray-500">{{ formatDate(invoice.created_at) }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Action Button -->
                  <div class="ml-4 flex items-center gap-2">
                    <button
                      @click.stop="downloadInvoice(invoice)"
                      class="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition"
                      title="Download PDF"
                    >
                      <Icon name="heroicons:arrow-down-tray" class="w-5 h-5" />
                    </button>
                    <Icon
                      name="heroicons:chevron-right"
                      class="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="!loading && filteredTransactions.length > 0" class="mt-6 flex justify-center gap-2">
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                class="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span class="px-4 py-2 text-sm text-gray-600">Page {{ currentPage }} of {{ totalPages }}</span>
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>

          <!-- Renewals Tab -->
          <div v-if="activeTab === 'renewals'">
            <!-- Loading State -->
            <div v-if="loadingRenewals" class="space-y-4">
              <div v-for="i in 3" :key="i" class="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>

            <!-- Empty State -->
            <div v-else-if="upcomingRenewals.length === 0" class="text-center py-12">
              <Icon name="heroicons:check-circle" class="w-16 h-16 text-green-300 mx-auto mb-4" />
              <h3 class="text-lg font-medium text-gray-900 mb-2">No upcoming renewals</h3>
              <p class="text-gray-600">You don't have any subscriptions renewing soon.</p>
            </div>

            <!-- Renewals List -->
            <div v-else class="space-y-3">
              <div
                v-for="invoice in upcomingRenewals"
                :key="invoice.id"
                class="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-4"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-semibold text-gray-900 mb-1">{{ invoice.invoiceable?.package?.name }} Renewal</p>
                    <p class="text-sm text-gray-600">Renews {{ formatDate(invoice.invoiceable?.renews_at) }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-lg font-bold text-gray-900">KES {{ formatCurrency(invoice.amount) }}</p>
                    <p class="text-xs text-gray-500">{{ daysUntilRenewal(invoice.invoiceable?.renews_at) }} days away</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Invoice Detail Modal -->
    <Teleport to="body" v-if="selectedInvoice">
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="selectedInvoice = null">
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
          <!-- Header -->
          <div class="sticky top-0 bg-gradient-to-r from-brand-50 to-blue-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-900">{{ selectedInvoice.invoice_number }}</h2>
            <button
              @click="selectedInvoice = null"
              class="p-1 hover:bg-white rounded-lg transition"
            >
              <Icon name="heroicons:x-mark" class="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-4">
            <!-- Invoice Info -->
            <div class="grid grid-cols-2 gap-6">
              <div>
                <p class="text-xs font-semibold text-gray-500 uppercase">Invoice Number</p>
                <p class="text-lg font-semibold text-gray-900">{{ selectedInvoice.invoice_number }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-500 uppercase">Status</p>
                <span
                  :class="[
                    'inline-block px-3 py-1 rounded-full text-sm font-medium',
                    selectedInvoice.status === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : selectedInvoice.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  ]"
                >
                  {{ formatStatus(selectedInvoice.status) }}
                </span>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-500 uppercase">Amount</p>
                <p class="text-lg font-semibold text-gray-900">KES {{ formatCurrency(selectedInvoice.amount) }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-500 uppercase">Date</p>
                <p class="text-lg font-semibold text-gray-900">{{ formatDate(selectedInvoice.created_at) }}</p>
              </div>
            </div>

            <!-- Description -->
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Description</p>
              <p class="text-gray-700">{{ selectedInvoice.description }}</p>
            </div>

            <!-- Payment Details -->
            <div v-if="selectedInvoice.status === 'paid'" class="bg-green-50 border border-green-200 rounded-lg p-4">
              <p class="text-sm font-semibold text-green-900 mb-2">Payment Confirmed</p>
              <p class="text-xs text-green-800">
                Paid on {{ formatDate(selectedInvoice.paid_at) }}
                <span v-if="selectedInvoice.payment_method">via {{ selectedInvoice.payment_method }}</span>
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end bg-gray-50">
            <button
              @click="selectedInvoice = null"
              class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition font-medium text-sm"
            >
              Close
            </button>
            <button
              @click="downloadInvoice(selectedInvoice)"
              class="px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition font-medium text-sm flex items-center gap-2"
            >
              <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAsyncData } from '#app'

// Page meta for layout
definePageMeta({
  layout: 'quizee',
  title: 'Transactions & Invoices — Modeh',
  meta: [
    {
      name: 'description',
      content: 'View your transaction history, manage subscriptions, and download invoices.'
    }
  ]
})

// State
const activeTab = ref<'transactions' | 'renewals'>('transactions')
const searchQuery = ref('')
const filterStatus = ref('')
const filterType = ref('')
const currentPage = ref(1)
const selectedInvoice = ref<any>(null)
const loading = ref(false)
const loadingRenewals = ref(false)

const transactions = ref<any[]>([])
const upcomingRenewals = ref<any[]>([])
const pagination = ref<any>({})
const activeSubscription = ref<any>(null)

// API
const api = useApi()

// Computed
const filteredTransactions = computed(() => {
  return transactions.value.filter(invoice => {
    const matchesSearch = !searchQuery.value || 
      invoice.invoice_number.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesStatus = !filterStatus.value || invoice.status === filterStatus.value
    const matchesType = !filterType.value || invoice.invoiceable_type.includes(filterType.value)
    
    return matchesSearch && matchesStatus && matchesType
  })
})

const totalSpent = computed(() => {
  return transactions.value
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0)
})

const totalTransactions = computed(() => transactions.value.length)
const totalPages = computed(() => pagination.value.last_page || 1)

// Methods
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

const formatStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const getInvoiceableLabel = (invoice: any): string => {
  if (invoice.invoiceable_type.includes('Subscription')) {
    return `${invoice.invoiceable?.package?.name} Subscription - ${invoice.invoiceable?.package?.duration_days} days`
  }
  return invoice.description
}

const daysUntilRenewal = (renewsAt: string | Date): number => {
  const now = new Date()
  const renewal = new Date(renewsAt)
  const diff = Math.ceil((renewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

const selectInvoice = (invoice: any): void => {
  selectedInvoice.value = invoice
}

const downloadInvoice = async (invoice: any): Promise<void> => {
  try {
    const response = await api.get(`/api/transactions/${invoice.id}/download`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const blob = await response.blob()
    
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${invoice.invoice_number}.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Failed to download invoice:', error)
  }
}

const fetchTransactions = async (): Promise<void> => {
  loading.value = true
  try {
    const queryParams = new URLSearchParams()
    queryParams.append('page', currentPage.value.toString())
    if (filterStatus.value) queryParams.append('status', filterStatus.value)
    if (filterType.value) queryParams.append('type', filterType.value)
    
    const response = await api.get(`/api/transactions?${queryParams.toString()}`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const data = await response.json()
    transactions.value = data.data || data.invoices || []
    pagination.value = data.pagination || { last_page: 1 }
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
    transactions.value = []
  } finally {
    loading.value = false
  }
}

const fetchRenewals = async (): Promise<void> => {
  loadingRenewals.value = true
  try {
    const response = await api.get('/api/transactions/renewals?days_ahead=30')
    if (!response.ok) {
      console.error('Renewals API error:', response.status, response.statusText)
      upcomingRenewals.value = []
      return
    }
    const data = await response.json()
    upcomingRenewals.value = data.data || data.renewals || []
  } catch (error) {
    console.error('Failed to fetch renewals:', error)
    upcomingRenewals.value = []
  } finally {
    loadingRenewals.value = false
  }
}

const nextPage = (): void => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchTransactions()
  }
}

const previousPage = (): void => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchTransactions()
  }
}

// Lifecycle
onMounted(async () => {
  await fetchTransactions()
  await fetchRenewals()
  
  // Find active subscription from transactions
  const activeSub = transactions.value.find(inv => 
    inv.invoiceable_type.includes('Subscription') && 
    inv.invoiceable?.status === 'active'
  )
  if (activeSub) {
    activeSubscription.value = activeSub.invoiceable
  }
})

// Watch for filter changes
watch(
  [searchQuery, filterStatus, filterType],
  () => {
    currentPage.value = 1
  }
)
</script>

<style scoped>
/* Smooth transitions */
.transition {
  transition: all 0.3s ease;
}

/* Status badge animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>