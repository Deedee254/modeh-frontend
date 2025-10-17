<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-medium">Subscription Settings</h3>
      <p class="text-sm text-muted-foreground">Manage your subscription plan and billing information.</p>
    </div>

    <!-- Current Subscription Status -->
    <div v-if="isActive" class="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg shadow-sm border border-emerald-200 dark:border-emerald-800">
      <div class="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div class="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
          <Icon name="heroicons:check-badge-solid" class="w-8 h-8 text-emerald-600" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-emerald-800 dark:text-emerald-200">You have an Active Subscription!</h2>
          <p class="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Your <strong>{{ activePackageName }}</strong> plan is active.
          </p>
        </div>
      </div>
    </div>

    <!-- Plan Manager -->
    <SubscriptionPlanManager class="mb-8" />

    <!-- Subscription History -->
    <SubscriptionHistory />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import useApi from '~/composables/useApi'
import SubscriptionPlanManager from '~/components/subscription/SubscriptionPlanManager.vue'
import SubscriptionHistory from '~/components/subscription/SubscriptionHistory.vue'

const api = useApi()
const loading = ref(true)
const isActive = ref(false)
const activePackageName = ref('')

async function checkSubscription() {
  loading.value = true
  try {
    const data = await api.getJson('/api/subscriptions/mine')
    const sub = data?.subscription || data?.data?.subscription || null
    isActive.value = !!(sub && (sub.status === 'active' || sub.status === 'paid'))
    activePackageName.value = sub?.package?.name || ''
  } catch (e) {
    isActive.value = false
  } finally {
    loading.value = false
  }
}

onMounted(checkSubscription)
</script>