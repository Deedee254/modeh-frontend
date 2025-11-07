&lt;template>
  &lt;div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    &lt;div class="mb-8">
      &lt;h2 class="text-2xl font-bold text-gray-900">Affiliate Dashboard&lt;/h2>
      &lt;p class="mt-1 text-sm text-gray-500">Track your referrals and earnings&lt;/p>
    &lt;/div>

    &lt;!-- Stats Grid -->
    &lt;div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      &lt;div v-for="stat in stats" :key="stat.name" class="bg-white overflow-hidden shadow rounded-lg">
        &lt;div class="p-5">
          &lt;div class="flex items-center">
            &lt;div class="flex-shrink-0">
              &lt;component :is="stat.icon" class="h-6 w-6 text-gray-400" aria-hidden="true" />
            &lt;/div>
            &lt;div class="ml-5 w-0 flex-1">
              &lt;dl>
                &lt;dt class="text-sm font-medium text-gray-500 truncate">{{ stat.name }}&lt;/dt>
                &lt;dd class="flex items-baseline">
                  &lt;div class="text-2xl font-semibold text-gray-900">{{ stat.value }}&lt;/div>
                &lt;/dd>
              &lt;/dl>
            &lt;/div>
          &lt;/div>
        &lt;/div>
      &lt;/div>
    &lt;/div>

    &lt;!-- Affiliate Link Section -->
    &lt;div class="bg-white shadow sm:rounded-lg mb-8">
      &lt;div class="px-4 py-5 sm:p-6">
        &lt;h3 class="text-lg font-medium leading-6 text-gray-900">Your Affiliate Link&lt;/h3>
        &lt;div class="mt-2 max-w-xl text-sm text-gray-500">
          &lt;p>Share this link to earn from referrals&lt;/p>
        &lt;/div>
        &lt;div class="mt-3 sm:flex sm:items-center">
          &lt;div class="w-full sm:max-w-xs">
            &lt;input
              type="text"
              :value="affiliateLink"
              readonly
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          &lt;/div>
          &lt;button
            @click="copyToClipboard(affiliateLink)"
            class="mt-3 inline-flex items-center sm:mt-0 sm:ml-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            &lt;ClipboardIcon v-if="!copied" class="h-5 w-5 mr-2" />
            &lt;CheckIcon v-else class="h-5 w-5 mr-2 text-green-500" />
            {{ copied ? 'Copied!' : 'Copy' }}
          &lt;/button>
        &lt;/div>
      &lt;/div>
    &lt;/div>

    &lt;!-- Recent Referrals -->
    &lt;div class="bg-white shadow sm:rounded-lg">
      &lt;div class="px-4 py-5 sm:p-6">
        &lt;h3 class="text-lg font-medium leading-6 text-gray-900">Recent Referrals&lt;/h3>
        &lt;div class="mt-4">
          &lt;div class="flex flex-col">
            &lt;div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              &lt;div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                &lt;table class="min-w-full divide-y divide-gray-300">
                  &lt;thead>
                    &lt;tr>
                      &lt;th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">User&lt;/th>
                      &lt;th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type&lt;/th>
                      &lt;th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date&lt;/th>
                      &lt;th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Earnings&lt;/th>
                      &lt;th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status&lt;/th>
                    &lt;/tr>
                  &lt;/thead>
                  &lt;tbody class="divide-y divide-gray-200">
                    &lt;tr v-for="referral in affiliate.referrals" :key="referral.id">
                      &lt;td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {{ referral.user_name }}
                      &lt;/td>
                      &lt;td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ referral.type }}&lt;/td>
                      &lt;td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ formatDate(referral.created_at) }}&lt;/td>
                      &lt;td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ formatCurrency(referral.earnings) }}&lt;/td>
                      &lt;td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        &lt;span :class="getStatusClass(referral.status)">
                          {{ referral.status }}
                        &lt;/span>
                      &lt;/td>
                    &lt;/tr>
                    &lt;tr v-if="affiliate.referrals.length === 0">
                      &lt;td colspan="5" class="text-center py-4 text-sm text-gray-500">No referrals yet&lt;/td>
                    &lt;/tr>
                  &lt;/tbody>
                &lt;/table>
              &lt;/div>
            &lt;/div>
          &lt;/div>
        &lt;/div>
      &lt;/div>
    &lt;/div>

    &lt;!-- Payout Request Button -->
    &lt;div class="mt-6 flex justify-end">
      &lt;button
        @click="requestPayout"
        :disabled="!canRequestPayout"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Request Payout
      &lt;/button>
    &lt;/div>
  &lt;/div>
&lt;/template>

&lt;script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useAffiliateStore } from '~/stores/affiliate'
import {
  BanknotesIcon,
  UsersIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClipboardIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const affiliate = useAffiliateStore()
const copied = ref(false)

// Computed values
const affiliateLink = computed(() => {
  const config = useRuntimeConfig()
  return `${config.public.baseUrl}?ref=${auth.user?.affiliate_code || ''}`
})

const stats = computed(() => [
  {
    name: 'Total Earned',
    value: formatCurrency(affiliate.stats.totalEarned),
    icon: BanknotesIcon
  },
  {
    name: 'Pending Payout',
    value: formatCurrency(affiliate.stats.pendingPayouts),
    icon: CurrencyDollarIcon
  },
  {
    name: 'Active Referrals',
    value: affiliate.stats.activeReferrals,
    icon: UsersIcon
  },
  {
    name: 'Conversion Rate',
    value: `${affiliate.stats.conversionRate}%`,
    icon: ChartBarIcon
  }
])

const canRequestPayout = computed(() => {
  const availableForPayout = affiliate.stats.totalEarned - affiliate.stats.pendingPayouts
  return availableForPayout >= 1000 // Minimum payout threshold
})

// Methods
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES'
  }).format(amount)
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'text-yellow-600',
    completed: 'text-green-600',
    failed: 'text-red-600'
  }
  return classes[status.toLowerCase()] || 'text-gray-600'
}

const requestPayout = async () => {
  try {
    await affiliate.requestPayout()
    // Show success message
  } catch (error) {
    // Show error message
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    affiliate.fetchAffiliateStats(),
    affiliate.fetchReferrals()
  ])
})
&lt;/script>