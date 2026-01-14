<template>
  <div>
    <PageHero
      :flush="true"
      title="QuizMaster Wallet"
      description="Overview of your available balance, transactions and withdrawal requests."
      :breadcrumbs="[{ text: 'Dashboard', href: '/quiz-master/dashboard' }, { text: 'Wallet', current: true }]"
    >
      <template #eyebrow>Quiz‑master tools</template>

      <template #actions>
        <div class="flex flex-wrap gap-3">
          <NuxtLink to="/quiz-master/wallet" class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-md text-sm text-white">Wallet</NuxtLink>
          <NuxtLink to="/quiz-master/quizzes" class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-sm border border-white/10 text-white">My Quizzes</NuxtLink>
          <button
            @click.prevent="scrollToWithdraw"
            :disabled="!canWithdraw"
            class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-600 shadow-lg shadow-brand-600/30 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Withdraw
          </button>
        </div>
      </template>

      <template #highlight>
        <div class="p-6">
          <header class="mb-6 rounded-3xl p-4 sm:p-6" style="background: linear-gradient(160deg, #0c4a6e 0%, #07274d 100%); color: white;">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p class="text-xs uppercase tracking-wide text-white/80">Balance</p>
                <p class="mt-1 text-2xl font-semibold text-white">KES {{ formatMoney(wallet.available) }}</p>
                <p class="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
                  <Icon name="heroicons:wallet" class="h-4 w-4" />
                  My Wallet
                </p>
                <h1 class="text-2xl sm:text-3xl font-semibold mt-2">Earnings & Transactions</h1>
                <p class="text-sm text-white/80 max-w-2xl">Track your revenue, manage withdrawals, and view your transaction history.</p>
              </div>
            </div>
          </header>
        </div>
      </template>

      <template #stats>
        <div class="flex items-center gap-6">
          <div>
            <div class="text-sm text-white/80">Available</div>
            <div class="mt-1 text-lg font-semibold text-white">KES {{ formatMoney(wallet.available) }}</div>
          </div>

          <div>
            <div class="text-sm text-white/80">Pending</div>
            <div class="mt-1 text-lg font-semibold text-white">KES {{ formatMoney(wallet.pending) }}</div>
          </div>

          <div>
            <div class="text-sm text-white/80">Lifetime</div>
            <div class="mt-1 text-lg font-semibold text-white">KES {{ formatMoney(wallet.lifetime_earned) }}</div>
          </div>

          <div>
            <UButton
              size="sm"
              color="primary"
              @click="showWithdrawModal = true"
              icon="i-heroicons-arrow-down-tray"
              class="shadow-lg shadow-brand-600/30 transition-transform hover:scale-105 !bg-brand-600 hover:!bg-brand-700"
            >
              Request Withdrawal
            </UButton>
          </div>
        </div>
      </template>
    </PageHero>

    <div class="container mx-auto py-10">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="p-4 bg-white shadow rounded">
          <div class="text-sm text-gray-500">Available</div>
          <div class="text-2xl font-semibold">KES {{ formatMoney(wallet.available) }}</div>
        </div>
        <div class="p-4 bg-white shadow rounded">
          <div class="text-sm text-gray-500">Pending</div>
          <div class="text-2xl font-semibold">KES {{ formatMoney(wallet.pending) }}</div>
        </div>
        <div class="p-4 bg-white shadow rounded">
          <div class="text-sm text-gray-500">Lifetime</div>
          <div class="text-2xl font-semibold">KES {{ formatMoney(wallet.lifetime_earned) }}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section id="withdraw-section" class="bg-white shadow rounded p-4">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-medium">Transactions</h2>
          </div>

          <div v-if="loading" class="text-sm text-gray-500">Loading...</div>

          <div v-else>
            <div v-if="transactions.length === 0" class="text-sm text-gray-500">No transactions yet.</div>

            <table v-else class="w-full text-left table-auto">
              <thead>
                <tr class="text-xs text-gray-500">
                  <th class="px-2 py-2">Date</th>
                  <th class="px-2 py-2">Quiz</th>
                  <th class="px-2 py-2">Amount</th>
                  <th class="px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(t, idx) in (Array.isArray(transactions) ? transactions.filter(Boolean) : [])" :key="t?.id || idx" class="border-t">
                  <td class="px-2 py-3 text-sm text-gray-700">{{ formatDate(t.created_at) }}</td>
                  <td class="px-2 py-3 text-sm">{{ t.quiz_title || t.quiz_id || '—' }}</td>
                  <td class="px-2 py-3 font-semibold">KES {{ formatMoney(t['quiz-master_share']) }}</td>
                  <td class="px-2 py-3 text-sm"><span class="px-2 py-1 rounded text-xs" :class="statusClass(t.status)">{{ t.status }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="bg-white shadow rounded p-4">
          <h2 class="text-lg font-medium">Request Withdrawal</h2>

          <div class="mt-3 space-y-3">
            <div>
              <label class="block text-sm text-gray-600">Amount (KES)</label>
              <input v-model.number="amount" type="number" min="1" class="w-full border rounded px-3 py-2" placeholder="Enter amount" />
            </div>

            <div class="space-y-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <UCard>
                  <template #header>
                    <div class="text-sm font-medium text-gray-500">Available Balance</div>
                  </template>

                  <div v-if="loading" class="h-8">
                    <USkeleton class="h-full w-1/2" />
                  </div>
                  <div v-else class="text-3xl font-bold text-gray-800">
                    KES {{ wallet?.available ?? '0.00' }}
                  </div>

                  <div class="mt-3">
                    <label class="block text-sm text-gray-600">Method</label>
                    <select v-model="method" class="w-full border rounded px-3 py-2">
                      <option value="mpesa">M-Pesa</option>
                      <option value="bank">Bank</option>
                    </select>
                  </div>

                  <div class="mt-4">
                    <button
                      @click="requestWithdrawal"
                      :disabled="!amount || Number(amount) <= 0 || Number(amount) > Number(wallet.available)"
                      class="w-full bg-brand-600 text-white py-2 rounded disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Request Withdrawal
                    </button>
                  </div>
                </UCard>

                <UCard>
                  <template #header>
                    <div class="text-sm font-medium text-gray-500">Pending Clearance</div>
                  </template>
                  <div v-if="loading" class="h-8">
                    <USkeleton class="h-full w-1/2" />
                  </div>
                  <div v-else class="text-3xl font-bold text-gray-800">
                    KES {{ wallet?.pending ?? '0.00' }}
                  </div>
                </UCard>

                <UCard>
                  <template #header>
                    <div class="text-sm font-medium text-gray-500">Lifetime Earned</div>
                  </template>
                  <div v-if="loading" class="h-8">
                    <USkeleton class="h-full w-1/2" />
                  </div>
                  <div v-else class="text-3xl font-bold text-gray-800">
                    KES {{ wallet?.lifetime_earned ?? '0.00' }}
                  </div>
                </UCard>
              </div>

              <div class="mt-6">
                <h3 class="font-medium">My Withdrawals</h3>
                <ul class="mt-3 space-y-2">
                  <li v-for="(w, idx) in (Array.isArray(withdrawals) ? withdrawals.filter(Boolean) : [])" :key="w?.id || idx" class="p-3 border rounded flex justify-between items-center">
                    <div>
                      <div class="font-semibold">KES {{ formatMoney(w.amount) }}</div>
                      <div class="text-xs text-gray-500">{{ w.method }} · {{ formatDate(w.created_at) }}</div>
                    </div>
                    <div class="text-sm" :class="w.status === 'approved' ? 'text-green-600' : 'text-gray-700'">{{ w.status }}</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      <UModal v-model="showWithdrawModal">
        <UCard>
          <template #header>
            <h3 class="font-semibold">Request Withdrawal</h3>
          </template>
          <p>Withdrawal form will go here.</p>
        </UCard>
      </UModal>
    </div>
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
    console.warn('Echo attach failed', e)
  }
}

function scrollToWithdraw() {
  if (import.meta.client) {
    try {
      const el = document.getElementById('withdraw-section')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch (e) {
      console.warn('scrollToWithdraw failed', e)
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
