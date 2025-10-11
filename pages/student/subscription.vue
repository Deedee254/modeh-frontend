<script setup>
// set page layout meta for quizee
definePageMeta({ layout: 'quizee' })
import { ref, onMounted } from 'vue'

const subscription = ref(null)
const packages = ref([])
const loading = ref(true)
const subscribing = ref(null)

// Fetch current subscription
async function fetchSubscription() {
  try {
    const s = await $fetch('/api/subscriptions/mine')
    subscription.value = s.subscription
  } catch (e) {
    subscription.value = null
  }
}

// Fetch all packages
async function fetchPackages() {
  loading.value = true
  try {
    const res = await $fetch('/api/packages')
    packages.value = res.packages
  } finally {
    loading.value = false
  }
}

function isActive(pkg) {
  return subscription.value && subscription.value.package && subscription.value.package.id === pkg.id
}

function statusClass(status) {
  if (status === 'active') return 'text-green-600 font-semibold'
  if (status === 'pending') return 'text-yellow-600 font-semibold'
  return 'text-gray-600'
}

async function doSubscribe(pkg) {
  subscribing.value = pkg.id
  try {
    // Subscribe to package
    const res = await $fetch(`/api/packages/${pkg.id}/subscribe`, { method: 'POST' })
    if (res.ok) {
      await fetchSubscription()
      alert('Subscription created!')
    } else {
      alert(res.message || 'Failed to subscribe')
    }
  } catch (e) {
    alert('Failed to subscribe')
  } finally {
    subscribing.value = null
  }
}

async function initiate() {
  if (!subscription.value) return
  const res = await $fetch(`/api/payments/subscriptions/${subscription.value.id}/mpesa/initiate`, { method: 'POST' })
  if (res.ok) alert('Payment initiated (simulated)')
  else alert('Failed to initiate payment')
}

onMounted(async () => {
  await Promise.all([fetchSubscription(), fetchPackages()])
})
</script>

<template>
  <div class="max-w-5xl mx-auto py-10">
    <h1 class="text-2xl font-bold mb-6">Subscription Packages</h1>
    <div v-if="subscription" class="mb-8 p-6 border rounded bg-gray-50">
      <div class="flex justify-between items-center">
        <div>
          <div class="font-semibold text-lg">Current Package: {{ subscription.package.title }}</div>
          <div class="text-sm text-gray-600">Status: <span :class="statusClass(subscription.status)">{{ subscription.status }}</span></div>
        </div>
        <div>
          <button v-if="subscription.status==='pending'" @click="initiate" class="bg-green-600 text-white px-4 py-2 rounded">Pay</button>
        </div>
      </div>
    </div>
    <div v-else class="mb-8">
      <p class="text-gray-600">No active subscription. Select a package below to subscribe.</p>
    </div>
    <div v-if="loading" class="mt-2"><span>Loading packages...</span></div>
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="pkg in packages" :key="pkg.id" :class="['border rounded p-6 flex flex-col', isActive(pkg) ? 'border-green-600 bg-green-50' : '']">
        <h2 class="text-lg font-bold mb-1">{{ pkg.title }}</h2>
        <p class="text-sm text-gray-600 mb-2">{{ pkg.description }}</p>
        <ul v-if="pkg.features && pkg.features.length" class="text-xs text-gray-500 mb-2 list-disc pl-4">
          <li v-for="f in pkg.features" :key="f">{{ f }}</li>
        </ul>
        <div class="mt-auto">
          <div class="font-semibold text-lg mb-2">{{ pkg.price }} {{ pkg.currency }}</div>
          <button
            v-if="!isActive(pkg)"
            @click.prevent="doSubscribe(pkg)"
            class="btn btn-primary w-full"
            :disabled="subscribing === pkg.id"
          >
            <span v-if="subscribing === pkg.id">Subscribing...</span>
            <span v-else>Subscribe</span>
          </button>
          <span v-else class="inline-block px-3 py-1 bg-green-600 text-white rounded">Active</span>
        </div>
      </div>
    </div>
  </div>
</template>

