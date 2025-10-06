<template>
  <div class="container mx-auto py-10">
    <header class="mb-6">
      <h1 class="text-3xl font-bold">Tutor Wallet</h1>
      <p class="text-sm text-gray-600">Overview of your available balance and transactions.</p>
    </header>

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
      <section class="bg-white shadow rounded p-4">
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
              <tr v-for="t in transactions" :key="t.id" class="border-t">
                <td class="px-2 py-3 text-sm text-gray-700">{{ formatDate(t.created_at) }}</td>
                <td class="px-2 py-3 text-sm">{{ t.quiz_title || t.quiz_id || '—' }}</td>
                <td class="px-2 py-3 font-semibold">KES {{ formatMoney(t.tutor_share) }}</td>
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

          <div>
            <label class="block text-sm text-gray-600">Method</label>
            <select v-model="method" class="w-full border rounded px-3 py-2">
              <option value="mpesa">M-Pesa</option>
              <option value="bank">Bank</option>
            </select>
          </div>

          <div>
            <button @click="requestWithdrawal" class="w-full bg-indigo-600 text-white py-2 rounded">Request Withdrawal</button>
          </div>

          <div class="mt-6">
            <h3 class="font-medium">My Withdrawals</h3>
            <ul class="mt-3 space-y-2">
              <li v-for="w in withdrawals" :key="w.id" class="p-3 border rounded flex justify-between items-center">
                <div>
                  <div class="font-semibold">KES {{ formatMoney(w.amount) }}</div>
                  <div class="text-xs text-gray-500">{{ w.method }} · {{ formatDate(w.created_at) }}</div>
                </div>
                <div class="text-sm" :class="w.status === 'approved' ? 'text-green-600' : 'text-gray-700'">{{ w.status }}</div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRuntimeConfig } from '#app'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'tutor', title: 'Tutor Wallet' })

const config = useRuntimeConfig()
const auth = useAuthStore()

const wallet = ref({ available: 0, pending: 0, lifetime_earned: 0 })
const transactions = ref([])
const withdrawals = ref([])
const amount = ref(null)
const method = ref('mpesa')
const loading = ref(false)

function formatMoney(v) {
  if (v == null) return '0'
  return Number(v).toLocaleString()
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try { return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateStr)) }
  catch (e) { return dateStr }
}

function statusClass(s) {
  if (!s) return 'text-gray-700'
  if (s.toLowerCase() === 'completed' || s.toLowerCase() === 'approved') return 'text-green-700'
  if (s.toLowerCase() === 'pending') return 'text-yellow-600'
  return 'text-gray-700'
}

async function apiFetch(path, opts = {}) {
  return await $fetch(path, { baseURL: config.public.apiBase || '', credentials: 'include', ...opts })
}

async function fetchWallet() {
  try {
    const res = await apiFetch('/api/wallet')
    wallet.value = res.wallet || res
  } catch (e) {
    console.error('fetchWallet', e)
  }
}

async function fetchTransactions() {
  loading.value = true
  try {
    const res = await apiFetch('/api/wallet/transactions')
    transactions.value = res.transactions?.data || res.transactions || res
  } catch (e) {
    console.error('fetchTransactions', e)
  } finally { loading.value = false }
}

async function fetchWithdrawals() {
  try { const res = await apiFetch('/api/wallet/withdrawals'); withdrawals.value = res.withdrawals || res } catch (e) { console.error('fetchWithdrawals', e) }
}

async function requestWithdrawal() {
  if (!amount.value || amount.value <= 0) return
  try {
    await apiFetch('/api/wallet/withdraw', { method: 'POST', body: { amount: amount.value, method: method.value } })
    amount.value = null
    await fetchWallet(); await fetchWithdrawals()
  } catch (e) { console.error('requestWithdrawal', e) }
}

function attachEcho() {
  if (!process.client || !window?.Echo || !auth.user?.id) return
  try {
    const channel = window.Echo.private(`users.${auth.user.id}`)
    channel.listen('.WalletUpdated', (payload) => { if (payload?.wallet) wallet.value = payload.wallet })
    channel.listen('.WithdrawalRequestUpdated', (payload) => { if (payload?.withdrawal) withdrawals.value = [payload.withdrawal, ...(withdrawals.value || [])] })
  } catch (e) { console.warn('Echo attach failed', e) }
}

onMounted(async () => {
  if (!auth.user) { try { await auth.fetchUser() } catch (_) {} }
  await fetchWallet(); await fetchTransactions(); await fetchWithdrawals(); attachEcho()
})
</script>

<style scoped>
.container { max-width: 1100px }
</style>
