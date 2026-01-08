<template>
  <div class="w-full">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Subscriptions</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">Manage your quizees' subscriptions and access packages</p>
    </div>

    <LoadingSpinner v-if="loading" />
    <ErrorAlert v-if="error" :message="error" @dismiss="error = null" />

    <template v-else>
      <div v-if="subscriptions.length > 0" class="grid grid-cols-1 gap-4">
        <div v-for="sub in subscriptions" :key="sub.id" class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ sub.package?.title || 'Package' }}</h3>
                <span :class="['px-3 py-1 rounded-full text-xs font-medium', statusClass(sub.status)]">
                  {{ sub.status }}
                </span>
              </div>
              <p class="text-gray-600 dark:text-gray-400 mb-3">{{ sub.package?.description }}</p>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Price</p>
                  <p class="text-lg font-bold text-gray-900 dark:text-white">{{ sub.package?.price_display || 'Free' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                  <p class="text-lg font-bold text-gray-900 dark:text-white">{{ sub.package?.duration_days || 30 }} days</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Expires</p>
                  <p class="text-lg font-bold text-gray-900 dark:text-white">{{ formatDate(sub.ends_at) }}</p>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <NuxtLink
                to="/parent/quizees"
                class="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                View Details
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center">
        <Icon name="heroicons:credit-card" class="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No subscriptions yet</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">Purchase a subscription for your quizees to unlock premium features</p>
        <NuxtLink
          to="/parent/quizees"
          class="inline-block px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors"
        >
          Manage Quizees
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import useApi from '~/composables/useApi'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import ErrorAlert from '~/components/ui/ErrorAlert.vue'

definePageMeta({ layout: 'parent' })

const api = useApi()
const loading = ref(false)
const error = ref(null)
const subscriptions = ref([])

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function statusClass(status) {
  const classes = {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
    expired: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
    cancelled: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400',
  }
  return classes[status] || classes.pending
}

async function loadSubscriptions() {
  loading.value = true
  error.value = null
  try {
    const res = await api.get('/api/parent/subscriptions')
    if (api.handleAuthStatus(res)) return
    const data = await api.parseResponse(res)
    if (data && data.subscriptions) {
      subscriptions.value = data.subscriptions
    }
  } catch (e) {
    console.error('Failed to load subscriptions:', e)
    error.value = e?.message || 'Failed to load subscriptions'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSubscriptions()
})
</script>
