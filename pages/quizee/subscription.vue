<script setup>
// set page layout meta for quizee
definePageMeta({ layout: 'quizee' })
import { ref, onMounted } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'
const config = useRuntimeConfig()
const api = useApi()
const alert = useAppAlert()

const subscription = ref(null)
const packages = ref([])
const loading = ref(true)
const subscribing = ref(null)

// Fetch current subscription
async function fetchSubscription() {
  try {
    const s = await $fetch(config.public.apiBase + '/api/subscriptions/mine', { credentials: 'include' })
    // support different shapes
    subscription.value = s?.subscription || s?.data?.subscription || s || null
  } catch (e) {
    subscription.value = null
  }
}

// Fetch all packages
async function fetchPackages() {
  loading.value = true
  try {
    const res = await $fetch(config.public.apiBase + '/api/packages', { credentials: 'include' })
    packages.value = res?.packages || res?.data || res || []  // Ensure we always have an array, even if empty
  } catch (e) {
    console.error('Failed to fetch packages:', e)
    packages.value = []
  } finally {
    loading.value = false
  }
}

function isActive(pkg) {
  if (!subscription.value) return false
  const subPkg = subscription.value.package || subscription.value.plan || null
  if (!subPkg) return false
  // compare by id if present, otherwise by slug or title
  if (subPkg.id && pkg.id) return String(subPkg.id) === String(pkg.id)
  if (subPkg.slug && pkg.slug) return String(subPkg.slug) === String(pkg.slug)
  return String(subPkg.title || '').toLowerCase() === String(pkg.title || '').toLowerCase()
}

function statusClass(status) {
  // return a badge style to ensure good contrast
  if (status === 'active') return 'inline-block bg-green-700 text-white px-2 py-1 rounded text-xs font-semibold'
  if (status === 'pending') return 'inline-block bg-amber-600 text-white px-2 py-1 rounded text-xs font-semibold'
  return 'inline-block bg-gray-300 text-gray-900 px-2 py-1 rounded text-xs font-semibold'
}

async function doSubscribe(pkg) {
  subscribing.value = pkg.id
  try {
    // Subscribe to package
      const res = await api.postJson(`/api/packages/${pkg.id}/subscribe`, {})
      if (api.handleAuthStatus(res)) return
      if (res.ok) {
      await fetchSubscription()
      useAppAlert().push({ message: 'Subscription created!', type: 'success' })
    } else {
      useAppAlert().push({ message: res?.message || 'Failed to subscribe', type: 'error' })
    }
  } catch (e) {
    useAppAlert().push({ message: 'Failed to subscribe', type: 'error' })
  } finally {
    subscribing.value = null
  }
}

async function initiate() {
  if (!subscription.value) return
  const res = await api.postJson(`/api/payments/subscriptions/${subscription.value.id}/mpesa/initiate`, {});
    if (api.handleAuthStatus(res)) return
    if (res.ok) alert.push({ message: 'Payment initiated (simulated)', type: 'success' })
    else alert.push({ message: 'Failed to initiate payment', type: 'error' })
}

onMounted(async () => {
  await Promise.all([fetchSubscription(), fetchPackages()])
})
</script>

<template>
  <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6">
    <h1 class="text-2xl font-bold mb-4">Subscription Packages</h1>

    <ClientOnly>
      <div class="mb-6">
        <div v-if="subscription" class="p-4 sm:p-6 border rounded bg-gray-50">
          <div class="sm:flex sm:items-center sm:justify-between">
            <div>
              <div class="font-semibold text-base">Current Package</div>
              <div class="text-lg font-bold">{{ subscription.package?.title || '—' }}</div>
              <div class="mt-2">
                <div class="text-sm text-gray-600">Status</div>
                <div class="mt-1"><span :class="statusClass(subscription.status)">{{ subscription.status }}</span></div>
              </div>
            </div>
            <div class="mt-4 sm:mt-0 sm:ml-4">
              <button v-if="subscription.status==='pending'" @click="initiate" class="bg-green-600 text-white px-4 py-2 rounded w-full sm:w-auto">Pay</button>
            </div>
          </div>
        </div>

        <div v-else class="p-4 sm:p-6 border rounded bg-white">
          <p class="text-gray-600">No active subscription. Select a package below to subscribe.</p>
        </div>
      </div>

      <div v-if="loading" class="mt-2 text-center"><span>Loading packages...</span></div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <div v-for="pkg in (packages || [])" :key="pkg.id" :class="['border rounded p-4 flex flex-col h-full', isActive(pkg) ? 'border-l-4 border-green-600 bg-white shadow-md' : 'bg-white']">
          <div>
            <h2 class="text-lg font-semibold mb-1">{{ pkg.title }}</h2>
            <p class="text-sm text-gray-600 mb-3">{{ pkg.description }}</p>
            <ul v-if="pkg.features && pkg.features.length" class="text-xs text-gray-500 mb-3 list-disc pl-5">
              <li v-for="(f, idx) in pkg.features" :key="idx">{{ f }}</li>
            </ul>
          </div>

          <div class="mt-auto">
            <div class="font-semibold text-lg mb-3">{{ pkg.price }} {{ pkg.currency }}</div>
            <button
              v-if="!isActive(pkg)"
              @click.prevent="doSubscribe(pkg)"
              class="w-full bg-indigo-600 text-white py-3 rounded-lg touch-manipulation"
              :disabled="subscribing === pkg.id"
            >
              <span v-if="subscribing === pkg.id">Subscribing...</span>
              <span v-else>Subscribe</span>
            </button>
            <div v-else class="mt-2">
            <span class="inline-block px-3 py-1 bg-gray-800 text-white rounded text-sm font-semibold">Active</span>
          </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
