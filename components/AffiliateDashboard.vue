&lt;template>
  &lt;div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    &lt;div class="mb-8">
      &lt;h2 class="text-2xl font-bold text-gray-900">Affiliate Dashboard&lt;/h2>
      &lt;p class="mt-1 text-sm text-gray-500">Track your referrals and earnings&lt;/p>
    &lt;/div>

    &lt;!-- Stats Grid -->
    <template>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900">Affiliate Dashboard</h2>
          <p class="mt-1 text-sm text-gray-500">Track your referrals and earnings</p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div v-for="stat in stats" :key="stat.name" class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <component :is="stat.icon" class="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">{{ stat.name }}</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">{{ stat.value }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Affiliate Link Section -->
        <div class="bg-white shadow sm:rounded-lg mb-8">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium leading-6 text-gray-900">Your Affiliate Link</h3>
            <div class="mt-2 max-w-xl text-sm text-gray-500">
              <p>Share this link to earn from referrals</p>
            </div>
            <div class="mt-3 sm:flex sm:items-center">
              <div class="w-full sm:max-w-xs">
                <input
                  type="text"
                  :value="affiliateLink"
                  readonly
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <button
                @click="copyToClipboard(affiliateLink)"
                class="mt-3 inline-flex items-center sm:mt-0 sm:ml-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ClipboardIcon v-if="!copied" class="h-5 w-5 mr-2" />
                <CheckIcon v-else class="h-5 w-5 mr-2 text-green-500" />
                {{ copied ? 'Copied!' : 'Copy' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Recent Referrals -->
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium leading-6 text-gray-900">Recent Referrals</h3>
            <div class="mt-4">
              <div class="flex flex-col">
                <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <table class="min-w-full divide-y divide-gray-300">
                      <thead>
                        <tr>
                          <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">User</th>
                          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Earnings</th>
                          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200">
                        <tr v-for="referral in affiliate.referrals" :key="referral.id">
                          <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {{ referral.user_name }}
                          </td>
                          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ referral.type }}</td>
                          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ formatDate(referral.created_at) }}</td>
                          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ formatCurrency(referral.earnings) }}</td>
                          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span :class="getStatusClass(referral.status)">
                              {{ referral.status }}
                            </span>
                          </td>
                        </tr>
                        <tr v-if="!affiliate.referrals || affiliate.referrals.length === 0">
                          <td colspan="5" class="text-center py-4 text-sm text-gray-500">No referrals yet</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Payout Request Button -->
        <div class="mt-6 flex justify-end">
          <button
            @click="requestPayout"
            :disabled="!canRequestPayout"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Request Payout
          </button>
        </div>
      </div>
    </template>

    <script setup>
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
        value: formatCurrency(affiliate.stats?.totalEarned || 0),
        icon: BanknotesIcon
      },
      {
        name: 'Pending Payout',
        value: formatCurrency(affiliate.stats?.pendingPayouts || 0),
        icon: CurrencyDollarIcon
      },
      {
        name: 'Active Referrals',
        value: affiliate.stats?.activeReferrals || 0,
        icon: UsersIcon
      },
      {
        name: 'Conversion Rate',
        value: `${affiliate.stats?.conversionRate ?? 0}%`,
        icon: ChartBarIcon
      }
    ])

    const canRequestPayout = computed(() => {
      const total = affiliate.stats?.totalEarned ?? 0
      const pending = affiliate.stats?.pendingPayouts ?? 0
      const availableForPayout = total - pending
      return availableForPayout >= 1000 // Minimum payout threshold
    })

    // Methods
    const copyToClipboard = async (text) => {
      try {
        if (!text) return
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
      try {
        return new Date(date).toLocaleDateString()
      } catch (e) {
        return ''
      }
    }

    const formatCurrency = (amount) => {
      try {
        return new Intl.NumberFormat('en-KE', {
          style: 'currency',
          currency: 'KES'
        }).format(amount)
      } catch (e) {
        return String(amount)
      }
    }

    const getStatusClass = (status) => {
      if (!status) return 'text-gray-600'
      const classes = {
        pending: 'text-yellow-600',
        completed: 'text-green-600',
        failed: 'text-red-600'
      }
      return classes[String(status).toLowerCase()] || 'text-gray-600'
    }

    const requestPayout = async () => {
      try {
        await affiliate.requestPayout()
        // Optionally show a success toast here
      } catch (error) {
        // Optionally show an error toast here
        console.error(error)
      }
    }

    // Lifecycle
    onMounted(async () => {
      await Promise.all([
        affiliate.fetchAffiliateStats(),
        affiliate.fetchReferrals()
      ])
    })
    </script>