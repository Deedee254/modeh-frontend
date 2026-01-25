<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
    <PageHero
      title="Wallet & Earnings"
      description="Manage your earnings, withdrawals, and transaction history."
      :breadcrumbs="[{ text: 'Dashboard', href: '/quiz-master/dashboard' }, { text: 'Wallet', current: true }]"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Wallet Balance Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Available Balance -->
        <div class="rounded-2xl bg-brand-600 hover:bg-brand-700 text-white p-6 shadow-lg transition-colors duration-200">
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm font-medium opacity-90 uppercase tracking-wide">Available Balance</div>
            <div class="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
          <div v-if="loading" class="h-10 bg-white/20 rounded animate-pulse"></div>
          <div v-else class="text-3xl md:text-4xl font-black">KES {{ formatMoney(wallet.available) }}</div>
          <p class="mt-2 text-sm opacity-90">Ready to withdraw</p>
          <button
            @click="showWithdrawModal = true"
            :disabled="!canWithdraw"
            class="mt-4 w-full px-4 py-2 bg-white text-brand-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Withdraw Now
          </button>
        </div>

        <!-- Pending Balance -->
        <div class="rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide">Pending</div>
            <div class="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
          <div v-if="loading" class="h-10 bg-blue-200 dark:bg-blue-900/40 rounded animate-pulse"></div>
          <div v-else class="text-3xl md:text-4xl font-black text-blue-900 dark:text-blue-200">KES {{ formatMoney(wallet.pending) }}</div>
          <p class="mt-2 text-sm text-blue-700 dark:text-blue-300">Processing</p>
        </div>

        <!-- Lifetime Earnings -->
        <div class="rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm font-medium text-purple-700 dark:text-purple-400 uppercase tracking-wide">Lifetime Earned</div>
            <div class="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1m2-1v2.5M4 7l2 1m-2-1l2-1m-2 1v2.5m6 4l2 1m-2-1l-2 1m2-1v2.5m6-4l2 1m-2-1l2-1m2 1v2.5"></path></svg>
            </div>
          </div>
          <div v-if="loading" class="h-10 bg-purple-200 dark:bg-purple-900/40 rounded animate-pulse"></div>
          <div v-else class="text-3xl md:text-4xl font-black text-purple-900 dark:text-purple-200">KES {{ formatMoney(wallet.lifetime_earned) }}</div>
          <p class="mt-2 text-sm text-purple-700 dark:text-purple-300">Total earned</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Recent Transactions -->
          <div class="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
              <span v-if="!loading" class="text-sm text-gray-500 dark:text-gray-400">{{ transactions.length }} total</span>
            </div>

            <div v-if="loading" class="space-y-3">
              <div v-for="i in 3" :key="i" class="h-12 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
            <div v-else-if="transactions.length === 0" class="text-center py-12">
              <svg class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <p class="text-gray-500 dark:text-gray-400">No transactions yet</p>
              <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Earnings will appear here when quizzes are taken</p>
            </div>
            <div v-else class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-200 dark:border-slate-700">
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Quiz</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-slate-700">
                  <tr v-for="(t, idx) in (Array.isArray(transactions) ? transactions.filter(Boolean) : [])" :key="t?.id || idx" class="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-200">{{ formatDate(t.created_at) }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-200">{{ t.quiz_title || t.quiz_id || '—' }}</td>
                    <td class="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">KES {{ formatMoney(t['quiz-master_share']) }}</td>
                    <td class="px-4 py-3 text-sm">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="statusBadgeClass(t.status)">
                        {{ t.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Withdrawal History -->
          <div class="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Withdrawal History</h2>
              <span v-if="!loading" class="text-sm text-gray-500 dark:text-gray-400">{{ withdrawals.length }} requests</span>
            </div>

            <div v-if="loading" class="space-y-3">
              <div v-for="i in 3" :key="i" class="h-16 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
            <div v-else-if="withdrawals.length === 0" class="text-center py-12">
              <svg class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-7"></path></svg>
              <p class="text-gray-500 dark:text-gray-400">No withdrawal requests yet</p>
            </div>
            <div v-else class="space-y-3">
              <div v-for="(w, idx) in (Array.isArray(withdrawals) ? withdrawals.filter(Boolean) : [])" :key="w?.id || idx" class="p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-colors">
                <div class="flex items-start justify-between">
                  <div>
                    <div class="text-lg font-semibold text-gray-900 dark:text-white">KES {{ formatMoney(w.amount) }}</div>
                    <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <span class="inline-flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {{ w.method === 'mpesa' ? 'M-Pesa' : 'Bank Transfer' }}
                      </span>
                      <span class="mx-2">•</span>
                      {{ formatDate(w.created_at) }}
                    </div>
                  </div>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" :class="withdrawalStatusClass(w.status)">
                    {{ w.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="space-y-6">
          <!-- Quick Stats -->
          <div class="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
            <div class="space-y-4">
              <div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Monthly Earnings</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white mt-1">KES 12,500</div>
              </div>
              <div class="pt-4 border-t border-gray-200 dark:border-slate-700">
                <div class="text-sm text-gray-600 dark:text-gray-400">Total Withdrawals</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ withdrawals.length }}</div>
              </div>
              <div class="pt-4 border-t border-gray-200 dark:border-slate-700">
                <div class="text-sm text-gray-600 dark:text-gray-400">Avg per Quiz</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white mt-1">KES 450</div>
              </div>
            </div>
          </div>

          <!-- Info Card -->
          <div class="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 p-6">
            <div class="flex gap-3">
              <div class="flex-shrink-0">
                <svg class="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <h4 class="font-semibold text-blue-900 dark:text-blue-200 text-sm">Withdrawal Policy</h4>
                <p class="text-xs text-blue-800 dark:text-blue-300 mt-1">Minimum withdrawal: KES 500. Processed within 2-3 business days.</p>
              </div>
            </div>
          </div>

          <!-- Help Card -->
          <div class="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <h4 class="font-semibold text-gray-900 dark:text-white text-sm mb-3">Need Help?</h4>
            <p class="text-xs text-gray-600 dark:text-gray-400 mb-4">Have questions about your earnings or withdrawals?</p>
            <a href="mailto:support@modeh.co.ke" class="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300">
              Contact Support
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </a>
          </div>
        </aside>
      </div>
    </div>

    <!-- Withdrawal Modal -->
    <UModal v-model="showWithdrawModal" :ui="{ width: 'w-full sm:max-w-md' }">
      <div class="p-6">
        <div class="mb-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Request Withdrawal</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Withdraw your earnings to your M-Pesa or bank account</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount (KES)</label>
            <input
              v-model.number="amount"
              type="number"
              min="500"
              :max="wallet.available"
              class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Enter amount (min. 500)"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Available: KES {{ formatMoney(wallet.available) }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
            <select
              v-model="method"
              class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="mpesa">M-Pesa</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p class="text-xs text-blue-800 dark:text-blue-200">
              <span class="font-semibold">Note:</span> Withdrawals are processed within 2-3 business days. You'll receive a notification when the transfer is complete.
            </p>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              @click="showWithdrawModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="requestWithdrawal"
              :disabled="!amount || Number(amount) < 500 || Number(amount) > Number(wallet.available)"
              class="flex-1 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Request Withdrawal
            </button>
          </div>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup>

import useApi from '~/composables/useApi'

definePageMeta({ layout: 'quiz-master', title: 'QuizMaster Wallet', meta: [ { name: 'robots', content: 'noindex, nofollow' }, { name: 'description', content: 'Manage your QuizMaster wallet, payouts and earnings.' } ] })

const config = useRuntimeConfig()
const auth = useAuthStore()

const wallet = ref({ available: 0, pending: 0, lifetime_earned: 0 })
const transactions = ref([])
const withdrawals = ref([])
const amount = ref(null)
const method = ref('mpesa')
const loading = ref(false)
const showWithdrawModal = ref(false)

const canWithdraw = computed(() => {
  const avail = Number(wallet.value?.available ?? 0)
  return !isNaN(avail) && avail > 0
})

function formatMoney(v) {
  if (v == null) return '0'
  return Number(v).toLocaleString()
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateStr))
  } catch (e) {
    return dateStr
  }
}

function statusClass(s) {
  if (!s) return 'text-gray-700'
  const lower = String(s).toLowerCase()
  if (lower === 'completed' || lower === 'approved') return 'text-green-700'
  if (lower === 'pending') return 'text-yellow-600'
  return 'text-gray-700'
}

function statusBadgeClass(s) {
  if (!s) return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
  const lower = String(s).toLowerCase()
  if (lower === 'completed' || lower === 'approved') return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
  if (lower === 'pending') return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
  return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
}

function withdrawalStatusClass(s) {
  if (!s) return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
  const lower = String(s).toLowerCase()
  if (lower === 'completed' || lower === 'approved') return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
  if (lower === 'pending') return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
  if (lower === 'rejected' || lower === 'failed') return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
  return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
}

const api = useApi()

async function fetchWallet() {
  try {
    const resp = await api.get('/api/wallet')
    const res = await resp.json()
    wallet.value = res.wallet || res
  } catch (e) {
    console.error('fetchWallet', e)
  }
}

async function fetchTransactions() {
  loading.value = true
  try {
    const resp = await api.get('/api/wallet/transactions')
    const res = await resp.json()
    transactions.value = res.transactions?.data || res.transactions || res
  } catch (e) {
    console.error('fetchTransactions', e)
  } finally {
    loading.value = false
  }
}

async function fetchWithdrawals() {
  try {
    const resp = await api.get('/api/wallet/withdrawals')
    const res = await resp.json()
    withdrawals.value = res.withdrawals || res
  } catch (e) {
    console.error('fetchWithdrawals', e)
  }
}

async function requestWithdrawal() {
  const a = Number(amount.value)
  if (!a || a <= 0) {
    useAppAlert().push({ message: 'Enter a valid withdrawal amount', type: 'error' })
    return
  }
  const avail = Number(wallet.value?.available ?? 0)
  if (isNaN(avail) || a > avail) {
    useAppAlert().push({ message: 'Insufficient available balance for this withdrawal', type: 'error' })
    return
  }
  try {
    const resp = await api.postJson('/api/wallet/withdraw', { amount: a, method: method.value })
    if (!resp.ok) throw new Error('Withdrawal request failed')
    amount.value = null
    await fetchWallet()
    await fetchWithdrawals()
    useAppAlert().push({ message: 'Withdrawal requested — we will process it shortly', type: 'success' })
  } catch (e) {
    console.error('requestWithdrawal', e)
  }
}

function attachEcho() {
  if (!import.meta.client || !window?.Echo || !auth.user?.id) return
  try {
    const channel = window.Echo.private(`users.${auth.user.id}`)
    channel.listen('.WalletUpdated', (payload) => { if (payload?.wallet) wallet.value = payload.wallet })
    channel.listen('.WithdrawalRequestUpdated', (payload) => { if (payload?.withdrawal) withdrawals.value = [payload.withdrawal, ...(withdrawals.value || [])] })
  } catch (e) {
    // Echo attach failed
  }
}

function scrollToWithdraw() {
  if (import.meta.client) {
    try {
      const el = document.getElementById('withdraw-section')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch (e) {
      // Scroll to withdraw failed
    }
  }
}

onMounted(async () => {
  // Parallelize auth check and wallet data fetching
  await Promise.all([
    (async () => {
      if (!auth.user) {
        try { await auth.fetchUser() } catch (_) {}
      }
    })(),
    fetchWallet(),
    fetchTransactions(),
    fetchWithdrawals()
  ])
  
  attachEcho()
})
</script>

<style scoped>
.container { max-width: 1100px }
</style>
