<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Affiliate Dashboard</h1>
      <p class="text-base text-gray-600">Track your referrals and earnings</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
      <div v-for="stat in stats" :key="stat.name" class="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-200">
        <div class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="p-2 bg-indigo-50 rounded-lg">
                <component :is="stat.icon" class="h-6 w-6 text-indigo-600" aria-hidden="true" />
              </div>
            </div>
            <div class="ml-4 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-600 truncate mb-1">{{ stat.name }}</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-bold text-gray-900">{{ stat.value }}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Affiliate Link Section -->
    <div class="bg-white shadow-sm border border-gray-200 sm:rounded-xl mb-8">
      <div class="px-6 py-6 sm:px-8">
        <div class="flex items-center mb-4">
          <div class="p-2 bg-green-50 rounded-lg mr-3">
            <svg class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">Your Affiliate Link</h3>
        </div>
        <div class="mb-4 text-sm text-gray-600">
          <p>Share this link to earn commissions from referrals</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <input
              type="text"
              :value="affiliateLink"
              :placeholder="affiliateCode ? 'No affiliate code yet' : ''"
              readonly
              class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-4 py-3 bg-gray-50"
            />
          </div>
          <button
            @click="copyToClipboard(affiliateLink)"
            :disabled="!affiliateCode"
            class="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ClipboardIcon v-if="!copied" class="h-4 w-4 mr-2" />
            <CheckIcon v-else class="h-4 w-4 mr-2" />
            {{ copied ? 'Copied!' : 'Copy Link' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Recent Referrals -->
    <div class="bg-white shadow-sm border border-gray-200 sm:rounded-xl">
      <div class="px-6 py-6 sm:px-8">
        <div class="flex items-center mb-6">
          <div class="p-2 bg-blue-50 rounded-lg mr-3">
            <UsersIcon class="h-5 w-5 text-blue-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900">Recent Referrals</h3>
        </div>
        <!-- Mobile Card Layout -->
        <div class="block sm:hidden">
          <div v-if="!affiliate.referrals || affiliate.referrals.length === 0" class="text-center py-12">
            <UsersIcon class="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p class="text-sm text-gray-500">No referrals yet</p>
            <p class="text-xs text-gray-400 mt-1">Start sharing your affiliate link to earn commissions</p>
          </div>
          <div v-else class="space-y-3">
            <div v-for="referral in affiliate.referrals" :key="referral.id" class="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
              <div class="flex justify-between items-start mb-3">
                <h4 class="text-base font-semibold text-gray-900">{{ referral.user_name }}</h4>
                <span :class="[getStatusClass(referral.status), 'text-xs font-semibold px-3 py-1 rounded-full border bg-white border-gray-200']">
                  {{ referral.status }}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="text-gray-500 text-xs uppercase tracking-wide font-medium">Type</p>
                  <p class="text-gray-900 font-medium">{{ referral.type }}</p>
                </div>
                <div>
                  <p class="text-gray-500 text-xs uppercase tracking-wide font-medium">Date</p>
                  <p class="text-gray-900 font-medium">{{ formatDate(referral.created_at) }}</p>
                </div>
                <div class="col-span-2">
                  <p class="text-gray-500 text-xs uppercase tracking-wide font-medium">Earnings</p>
                  <p class="text-green-600 font-bold text-base">{{ formatCurrency(referral.earnings) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop Table Layout -->
        <div class="hidden sm:block">
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
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ referral.user_name }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ referral.type }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ formatDate(referral.created_at) }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ formatCurrency(referral.earnings) }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><span :class="getStatusClass(referral.status)">{{ referral.status }}</span></td>
                    </tr>
                    <tr v-if="!affiliate.referrals || affiliate.referrals.length === 0">
                      <td colspan="5" class="text-center py-12">
                        <UsersIcon class="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p class="text-sm text-gray-500 mb-1">No referrals yet</p>
                        <p class="text-xs text-gray-400">Start sharing your affiliate link to earn commissions</p>
                      </td>
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
    <div class="mt-8 flex justify-end">
      <button
        @click="requestPayout"
        :disabled="!canRequestPayout"
        class="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <CurrencyDollarIcon class="h-4 w-4 mr-2" />
        Request Payout
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useAffiliateStore } from '~/stores/affiliate'
import useApi from '~/composables/useApi'
import {
  BanknotesIcon,
  UsersIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClipboardIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

// accept userType from pages that render this component (quizee / quiz-master)
const props = defineProps<{ userType?: string }>()

// Auth store may be implemented in JS; cast to `any` so TypeScript template
// checks don't infer `user` as `never` when the store has no types.
const auth = useAuthStore() as any
// Pinia store is implemented in JS; cast to `any` so template type-checking
// doesn't treat it as a ComponentPublicInstance and cause TS errors.
const affiliate = useAffiliateStore() as any
const api = useApi()
const copied = ref(false)

// Computed values
// Build a robust affiliate link. If runtime config doesn't provide a base URL
// (which would cause `undefined?ref=`), fall back to the current origin when
// running in the browser. Also URL-encode the affiliate code.
// Compute affiliate code with multiple fallbacks. Backend/user object shapes vary so
// check common locations: user.affiliate_code, user.affiliate?.code, user.data?.affiliate_code
const fetchedAffiliateCode = ref<string | null>(null)

const affiliateCode = computed(() => {
  const u = auth?.user
  if (!u) return fetchedAffiliateCode.value ?? ''
  return (
    // Prefer the affiliate relation's referral_code (backend uses `referral_code`),
    // then any appended affiliate_code on user, then other shapes, then fetched value.
    u.affiliate?.referral_code ||
    u.affiliate_code ||
    (u.affiliate && (u.affiliate.code || u.affiliate_code)) ||
    (u.data && (u.data.affiliate_code || u.data?.affiliate?.code)) ||
    fetchedAffiliateCode.value ||
    ''
  )
})

const affiliateLink = computed(() => {
  const config = useRuntimeConfig()
  const baseFromConfig = config && config.public && config.public.baseUrl
  const base = baseFromConfig || (typeof window !== 'undefined' ? window.location.origin : '')
  const code = affiliateCode.value ?? ''
  if (!base) return code ? `?ref=${encodeURIComponent(code)}` : ''
  return code ? `${base}?ref=${encodeURIComponent(code)}` : base
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
const copyToClipboard = async (text: string) => {
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

const formatDate = (date?: string | number | Date) => {
  try {
    if (!date) return ''
    return new Date(date).toLocaleDateString()
  } catch (e) {
    return ''
  }
}

const formatCurrency = (amount: number | string | undefined) => {
  try {
    const value = Number(amount ?? 0)
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(value)
  } catch (e) {
    return String(amount ?? '')
  }
}

const getStatusClass = (status?: string) => {
  if (!status) return 'text-gray-600'
  const classes: Record<string, string> = {
    pending: 'text-yellow-600',
    completed: 'text-green-600',
    failed: 'text-red-600'
  }
  return classes[String(status).toLowerCase()] || 'text-gray-600'
}

const requestPayout = async () => {
  try {
    // Prefer using the API composable directly so the component controls UX flow.
    const res = await api.postJson('/api/affiliates/payout-request', {})
    if (!res || !res.ok) {
      // Fallback to the store action which contains error handling
      await affiliate.requestPayout()
      return
    }
    const data = await res.json().catch(() => ({}))
    if (data && data.success) {
      // Update local store stats to reflect the payout request
      affiliate.stats.pendingPayouts = affiliate.stats.totalEarned || 0
    }
    // Optionally show a success toast here
  } catch (error) {
    console.error('Payout request failed:', error)
    // Fallback to store action as a secondary attempt
    try { await affiliate.requestPayout() } catch (e) { /* swallow */ }
  }
}

// Lifecycle
onMounted(async () => {
  // Ensure we have affiliate_code available; if not present on the user, fetch a small payload.
  const ensureAffiliate = async () => {
    try {
      const existing = auth.user?.affiliate?.referral_code ?? auth.user?.affiliate_code
      if (existing) {
        fetchedAffiliateCode.value = existing
      } else {
        const af = await api.get('/api/affiliates/me')
        if (af && af.referral_code !== undefined) {
          fetchedAffiliateCode.value = af.referral_code
        } else if (af && af.referral_code === undefined && af.referral_code !== undefined) {
          // defensive: if API returned full object with referral_code not at top, try to read it
          fetchedAffiliateCode.value = af.referral_code ?? null
        } else {
          // API returned null or unexpected shape
          fetchedAffiliateCode.value = null
        }
      }
    } catch (e) {
      fetchedAffiliateCode.value = null
    }
  }
  await ensureAffiliate()
  // Try using the API composable directly first (keeps UI logic here).
  try {
    const [statsRes, refsRes] = await Promise.all([
      api.get('/api/affiliates/stats'),
      api.get('/api/affiliates/referrals')
    ])

    if (statsRes && statsRes.ok) {
      const statsJson = await statsRes.json().catch(() => null)
      if (statsJson) affiliate.stats = statsJson
    } else {
      // fallback to store action
      await affiliate.fetchAffiliateStats()
    }

    if (refsRes && refsRes.ok) {
      const refsJson = await refsRes.json().catch(() => null)
      if (refsJson) affiliate.referrals = refsJson
    } else {
      await affiliate.fetchReferrals()
    }
  } catch (e) {
    // If direct API call fails, use the store methods which also use the composable
    await Promise.all([
      affiliate.fetchAffiliateStats(),
      affiliate.fetchReferrals()
    ])
  }
})
</script>
                          