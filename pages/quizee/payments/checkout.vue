<template>
  <div class="bg-slate-50 dark:bg-slate-900 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <template v-if="isTournamentCheckout">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100">Tournament Registration</h1>
          <p class="text-slate-600 dark:text-slate-400 mt-2">Secure your spot and join the competition</p>
        </template>
        <template v-else-if="type === 'battle'">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100">Unlock Your Battle Results</h1>
          <p class="text-slate-600 dark:text-slate-400 mt-2">View your battle performance and opponent analysis</p>
        </template>
        <template v-else>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100">Unlock Your Quiz Results</h1>
          <p class="text-slate-600 dark:text-slate-400 mt-2">View detailed performance insights and answer reviews</p>
        </template>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <svg class="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25" stroke-width="4"/><path d="M22 12a10 10 0 00-10-10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
          <p class="text-slate-600 dark:text-slate-400">Checking subscription status...</p>
        </div>
      </div>

      <!-- Two-Column Layout -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <!-- RIGHT COLUMN: Payment & Subscription Options (now on LEFT) -->
  <div class="lg:col-span-2 order-2 lg:order-1">
          <!-- Subscription Status Cards -->
          <div v-if="isActive || institutionSubscriptions.length > 0" class="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Your Active Subscriptions</h3>
            <div class="space-y-3">
              <!-- Personal Subscription -->
              <div v-if="isActive" @click="selectActiveSubscription('personal')" :class="['p-4 rounded-lg border-2 cursor-pointer transition-all', activeSubscriptionType === 'personal' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'border-emerald-200 dark:border-emerald-700 hover:border-emerald-400 dark:hover:border-emerald-500']">
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0">
                    <div v-if="activeSubscriptionType === 'personal'" class="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
                      <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                    </div>
                    <svg v-else class="w-6 h-6 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-emerald-800 dark:text-emerald-200">{{ activePackageName }} (Personal)</p>
                    <p class="text-sm text-emerald-700 dark:text-emerald-300">{{ personalRemaining ?? 'Unlimited' }} reveals remaining today</p>
                  </div>
                </div>
              </div>

              <!-- Institution Subscriptions -->
              <div v-for="instSub in institutionSubscriptions" :key="instSub.id" @click="selectActiveSubscription('institution-' + instSub.institution_id, instSub)" :class="['p-4 rounded-lg border-2 cursor-pointer transition-all', activeSubscriptionType === ('institution-' + instSub.institution_id) ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500']">
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0">
                    <div v-if="activeSubscriptionType === ('institution-' + instSub.institution_id)" class="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                      <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                    </div>
                    <svg v-else class="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-blue-800 dark:text-blue-200">🏢 {{ instSub.institution_name }}</p>
                    <p class="text-sm text-blue-700 dark:text-blue-300">{{ instSub.remaining ?? 'Unlimited' }} reveals remaining today</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Section -->
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6">
            <!-- Heading -->
            <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              <template v-if="isTournamentCheckout">Complete Your Registration</template>
              <template v-else-if="type === 'battle'">Get Battle Insights</template>
              <template v-else>Access Quiz Results</template>
            </h2>
            <p class="text-slate-600 dark:text-slate-400 mb-6">
              <template v-if="isTournamentCheckout">Secure your tournament spot with a subscription or one-time payment</template>
              <template v-else-if="type === 'battle'">Unlock detailed battle analytics and opponent performance metrics</template>
              <template v-else>View your answer breakdown and performance analysis</template>
            </p>

            <!-- Referral Code Section (appears above results button) -->
            <div v-if="!isTournamentCheckout" class="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <p class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">Referral Code</p>
              <div v-if="referralCodeStored" class="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                <p class="font-mono font-semibold text-emerald-800 dark:text-emerald-200 text-lg">{{ referralCodeStored }}</p>
                <p class="text-xs text-emerald-700 dark:text-emerald-300 mt-2">✓ Referrer will earn commission</p>
              </div>
              <div v-else-if="showReferralInput" class="space-y-2">
                <input 
                  v-model="referralCodeInput" 
                  type="text" 
                  placeholder="Enter referral code"
                  class="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                />
                <p class="text-xs text-slate-500 dark:text-slate-400">Support a referrer and help them earn rewards</p>
                <div class="flex items-center justify-end gap-2">
                  <button @click="applyReferralCode" :disabled="!referralCodeInput" class="px-3 py-2 bg-brand-600 text-white rounded-lg disabled:opacity-50">Apply</button>
                  <button @click="showReferralInput = false" class="px-3 py-2 border rounded-lg">Cancel</button>
                </div>
              </div>
              <button v-else @click="showReferralInput = true" class="text-sm text-brand-600 dark:text-brand-400 hover:underline font-medium">
                + Add Referral Code
              </button>
            </div>

            <!-- Ready to See Your Results Section -->
            <div v-if="canSeeResults && !isTournamentCheckout" class="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Ready to See Your Results?</h3>
              <p class="text-slate-600 dark:text-slate-400 mb-4">You have access to view your detailed performance report</p>
              <button @click="seeResults" class="w-full px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold rounded-lg hover:opacity-90 transition-colors">
                View My Results
              </button>
            </div>

            <!-- Prominent fee near the pay button for tournaments -->
              <div v-if="isTournamentCheckout && tournamentEntryFee !== null" class="mb-4 flex items-center justify-between">
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400 uppercase">Entry Fee</p>
                <p class="text-2xl font-bold text-brand-600 dark:text-brand-400">{{ tournament?.currency || 'KES' }} {{ Number(tournamentEntryFee).toFixed(2) }}</p>
              </div>
              <div v-if="isFreeForSubscribers">
                <span class="inline-flex items-center px-2 py-1 rounded bg-emerald-50 text-emerald-800 text-sm font-medium border border-emerald-200">Free for subscribers</span>
              </div>
            </div>

            <!-- If tournament is open to subscribers and user already has a usable subscription
                 we should not force them to pick or buy a package. Show a clear banner and
                 allow direct registration. -->
            <div v-if="isTournamentCheckout && isFreeForSubscribers && hasUsableSubscriptionForTournament()" class="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="font-semibold">You're eligible to register</p>
                  <p class="text-sm">This tournament is open to subscribers and our records show you have an active subscription — you can register without paying.</p>
                </div>
                <div class="flex-shrink-0">
                  <button @click="registerForTournamentDirect" :disabled="checkout.processing" class="px-4 py-2 bg-emerald-600 text-white rounded-lg">
                    <template v-if="checkout.processing">Processing...</template>
                    <template v-else>Register for Tournament</template>
                  </button>
                </div>
              </div>
            </div>



            <!-- Free Item Option -->
            <div v-if="itemPrice === 0 && !isTournamentCheckout" class="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
              <p class="font-semibold text-emerald-900 dark:text-emerald-100">This {{ type }} is Free!</p>
              <p class="text-sm text-emerald-700 dark:text-emerald-300 mt-1">No payment needed. View results immediately.</p>
              <button @click="viewFreeResults" :disabled="checkout.processing" class="w-full mt-3 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                View Results
              </button>
            </div>

            <!-- Paid One-Off Option -->
            <div v-else-if="itemPrice && itemPrice > 0 && !isTournamentCheckout" class="mb-6 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <p class="font-semibold text-slate-900 dark:text-slate-100">Pay for this item only</p>
                  <p class="text-sm text-slate-600 dark:text-slate-400">One-time payment to unlock results</p>
                </div>
                <p class="text-2xl font-bold text-brand-600">{{ item?.currency || 'KES' }} {{ itemPrice }}</p>
              </div>
              <button @click="payForThisItem" :disabled="checkout.processing" class="w-full px-4 py-2 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors">
                <template v-if="checkout.processing">Processing...</template>
                <template v-else>Pay Now</template>
              </button>
            </div>

            <!-- Subscription Packages -->
            <div v-if="showPackages" class="space-y-4 mb-6">
              <h4 class="font-semibold text-slate-900 dark:text-slate-100">
                <template v-if="isTournamentCheckout">Subscribe to Participate</template>
                <template v-else-if="type === 'battle'">Subscribe for Battle Analytics</template>
                <template v-else>Subscribe for Full Access</template>
              </h4>
              <div v-for="pkg in packages" :key="pkg.id" @click="selectPackage(pkg)" :class="['p-4 rounded-lg border-2 cursor-pointer transition-all', selectedPackage && selectedPackage.id === pkg.id ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300']">
                <div class="flex items-start gap-3">
                  <div class="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5" :class="selectedPackage && selectedPackage.id === pkg.id ? 'border-brand-600 bg-brand-600' : 'border-slate-400'">
                    <svg v-if="selectedPackage && selectedPackage.id === pkg.id" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-slate-900 dark:text-slate-100">{{ pkg.title || pkg.name }}</p>
                    <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">{{ pkg.description || '' }}</p>
                    <p class="text-lg font-bold text-brand-600 dark:text-brand-400 mt-2">{{ pkg.currency || 'KES' }} {{ pkg.price }}<span class="text-xs text-slate-600 dark:text-slate-400">/mo</span></p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Subscription / Tournament Action Button -->
            <div v-if="isTournamentCheckout || !isActive" class="pt-4 border-t border-slate-200 dark:border-slate-700">
              <!-- Badge: show when tournament explicitly allows subscribers free entry -->
              <div v-if="isTournamentCheckout && isFreeForSubscribers" class="mb-3">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">Free for subscribers</span>
              </div>
              <button @click="isTournamentCheckout ? attemptTournamentRegistration() : openPayment()"
                :disabled="checkout.processing || (isTournamentCheckout ? false : !selectedPackage)"
                class="w-full px-6 py-3 font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                <template v-if="checkout.processing">
                  <svg class="w-4 h-4 animate-spin inline-block mr-2" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25" stroke-width="4"/><path d="M22 12a10 10 0 00-10-10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
                  Processing...
                </template>
                <template v-else>
                  <template v-if="isTournamentCheckout">
                    <template v-if="hasUsableSubscriptionForTournament()">Register for Tournament</template>
                    <template v-else-if="tournamentEntryFee && tournamentEntryFee > 0">Pay & Register (KES {{ tournamentEntryFee }})</template>
                    <template v-else>Complete Registration</template>
                  </template>
                  <template v-else>Subscribe with {{ selectedPackage?.name }}</template>
                </template>
              </button>
            </div>

            <!-- Payment Status Messages -->
            <div v-if="checkout.pendingMessage" class="mt-6 p-4 rounded-lg text-sm" :class="checkout.status === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800' : 'bg-yellow-50 dark:bg-yellow-900/10 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800'">
              {{ checkout.pendingMessage }}
            </div>

            <!-- Action Buttons -->
            <div class="mt-6 flex gap-3 justify-end">
              <button v-if="checkout.status === 'error'" @click="retry" class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                Retry
              </button>
              <button v-if="canRedo" @click="redo" class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                Try Another
              </button>
            </div>
          </div>
        </div>

  <!-- LEFT COLUMN: Order Summary (now on RIGHT) -->
  <div class="lg:col-span-1 order-1 lg:order-2">
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6 sticky top-6 space-y-6">
            <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">Order Summary</h2>

            <!-- Item Details -->
            <div v-if="!isTournamentCheckout" class="pb-6 border-b border-slate-200 dark:border-slate-700">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{{ type }} Results</p>
                  <p v-if="item?.title || item?.name" class="text-sm text-slate-600 dark:text-slate-400 mt-2">{{ item.title || item.name }}</p>
                </div>
                <span v-if="itemPrice && itemPrice > 0" class="text-sm font-semibold text-brand-600 dark:text-brand-400 whitespace-nowrap">{{ item?.currency || 'KES' }} {{ itemPrice }}</span>
                <span v-else class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Free</span>
              </div>
            </div>

            <!-- Tournament Details -->
            <div v-else class="pb-6 border-b border-slate-200 dark:border-slate-700">
              <p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tournament Entry</p>
              <p v-if="item?.title || item?.name" class="text-sm text-slate-600 dark:text-slate-400">{{ item.title || item.name }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-500 mt-2">Secures your participation for the entire tournament</p>
              <!-- Prominent entry fee display -->
              <div v-if="tournamentEntryFee !== null" class="mt-4 flex items-center justify-between">
                <div>
                  <p class="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Entry Fee</p>
                  <p class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ tournament?.currency || 'KES' }} {{ Number(tournamentEntryFee).toFixed(2) }}</p>
                </div>
                <div v-if="isFreeForSubscribers" class="text-right">
                  <span class="inline-flex items-center px-2 py-1 rounded bg-emerald-50 text-emerald-800 text-sm font-medium border border-emerald-200">Free for subscribers</span>
                </div>
              </div>
              <div v-else class="mt-4">
                <p class="text-sm text-emerald-700 dark:text-emerald-300 font-semibold">No entry fee</p>
              </div>
            </div>

            <!-- Selected Package -->
            <div v-if="displaySelectedPackage" :key="packageVersion" class="pb-6 border-b border-slate-200 dark:border-slate-700">
              <p class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">Selected Plan</p>
              <div class="p-4 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-700">
                <p class="font-semibold text-slate-900 dark:text-slate-100">{{ displaySelectedPackage.title || displaySelectedPackage.name }}</p>
                <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">{{ displaySelectedPackage.description || '' }}</p>
                <p class="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-3">{{ displaySelectedPackage.currency || 'KES' }} {{ displaySelectedPackage.price }}<span class="text-sm text-slate-600 dark:text-slate-400">/mo</span></p>
                
                <!-- Subscription Context -->
                <div class="mt-4 pt-4 border-t border-brand-200 dark:border-brand-600">
                  <p class="text-xs text-slate-600 dark:text-slate-400 mb-2">Using: <span class="font-semibold text-slate-900 dark:text-slate-100">{{ subscriptionContext.type }}</span></p>
                  <p class="text-xs text-slate-600 dark:text-slate-400">{{ subscriptionContext.remaining }} reveals remaining today</p>
                </div>
              </div>
            </div>

            <!-- Referral Code was moved to payment column to appear near the action button -->

            <!-- Limit Info Alert -->
            <div v-if="limitInfo" class="p-4 rounded-lg" :class="limitInfo.reached ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700' : 'bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700'">
              <p v-if="limitInfo.reached" class="font-semibold text-red-800 dark:text-red-200">Daily Limit Reached</p>
              <p v-else class="font-semibold text-amber-800 dark:text-amber-200">Approaching Limit</p>
              <p v-if="limitInfo.reached" class="text-sm text-red-700 dark:text-red-300 mt-1">You've used all {{ limitInfo.limit }} {{ limitInfo.type || 'reveals' }} today</p>
              <p v-else class="text-sm text-amber-700 dark:text-amber-300 mt-1">{{ limitInfo.remaining || 0 }} of {{ limitInfo.limit }} remaining</p>
              <button @click="refreshLimit" :disabled="limitRefreshing" class="text-xs text-slate-600 dark:text-slate-400 hover:underline mt-2 font-medium">
                <svg v-if="limitRefreshing" class="w-3 h-3 animate-spin inline-block mr-1" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25" stroke-width="2"/><path d="M22 12a10 10 0 00-10-10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <ReviewAnswers :open="showReview" :loading="reviewLoading" :error="reviewError" :details="reviewDetails" @close="showReview = false"></ReviewAnswers>
    <PaymentModal :open="showPaymentModal" :pkg="paymentModalPackage" :item="paymentModalItem" :phones="phones" @close="showPaymentModal = false" @paid="onPaymentAttemptClosed"></PaymentModal>
    <PaymentAwaitingModal :tx="(checkout as any).tx" :open="showAwaitingModal" @update:open="v => showAwaitingModal = v" @close="onPaymentAttemptClosed"></PaymentAwaitingModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import useApi from '~/composables/useApi'
import { useRoute, useRouter } from 'vue-router'
import PaymentModal from '~/components/PaymentModal.vue'
import PaymentAwaitingModal from '~/components/PaymentAwaitingModal.vue'
import { useSubscriptionsStore } from '~/stores/subscriptions'
import ReviewAnswers from '~/components/ReviewAnswers.vue'
import { useCheckoutStore } from '~/stores/checkout'
import { useUiStore } from '~/stores/ui'

definePageMeta({
  layout: 'quizee',
  hideBottomNav: true,
})

const route = useRoute()
const router = useRouter()
const q = route.query
const api = useApi()
const subscriptionsStore = useSubscriptionsStore()

const type = (q.type || 'quiz')
const id = q.id || null
const attemptId = q.attempt_id || null

const loading = ref(true)
const isActive = ref(false)
const institutionName = ref('')
const institutionIsActive = ref(false)
const showAwaitingModal = ref(false)
const showPaymentModal = ref(false)
const paymentModalPackage = ref<Record<string, any> | null>(null)
const paymentModalItem = ref<Record<string, any> | null>(null)
const lastPaymentReference = ref<string | null>(null)
const selectedPackage = ref<Record<string, any> | null>(null)
// small version counter to force re-rendering of the Selected Plan card when
// the user picks another package. Incrementing this will change the
// component key and Vue will re-render the card contents immediately.
const packageVersion = ref(0)
const limitRefreshing = ref(false)
const activeSubscriptionType = ref('personal')
const institutionSubscriptions = ref<Record<string, any>[]>([])
const personalRemaining = ref<number | null>(null)
const currentActivePackage = ref<Record<string, any> | null>(null)
const tournament = ref<Record<string, any> | null>(null)
const tournamentEntryFee = ref<number | null>(null)
const tournamentFreeForSubscribers = ref<boolean | null>(null)
// Computed boolean that normalizes tournament open/free flags so template
// and script can check a plain boolean (avoids comparing a Ref to a boolean)
const isFreeForSubscribers = computed(() => {
  return Boolean(tournament.value?.open_to_subscribers) || tournamentFreeForSubscribers.value === true
})
const tournamentRequiresSubscription = ref<boolean | null>(null)
const tournamentIntent = ref(false)

const showReview = ref(false)
const isTournamentCheckout = computed(() => type === 'tournament' && !!id)
const tournamentJoinAttempted = ref(false)
const tournamentJoinSucceeded = ref(false)
const reviewLoading = ref(false)
const reviewError = ref('')
const reviewDetails = ref<Record<string, any>[]>([])

const phones = ref<string[]>([])
const packages = ref<Record<string, any>[]>([])
const item = ref<Record<string, any> | null>(null)
const itemPrice = ref<number | null>(null)

// Referral code state
const referralCodeStored = ref('')
const showReferralInput = ref(false)
const referralCodeInput = ref('')

const checkout = useCheckoutStore()
const ui = useUiStore()

const canRedo = ref(false)
const canSeeResults = computed(() => {
  const hasPersonalSubscription = isActive.value
  const hasInstitutionSubscription = institutionSubscriptions.value && institutionSubscriptions.value.length > 0
  const hasAnySubscription = hasPersonalSubscription || hasInstitutionSubscription
  return !!(( hasAnySubscription || checkout.status === 'success') && (attemptId || id))
})

const activePackageName = ref('')

const limitState = ref<Record<string, any> | null>(null)
const limitInfo = computed(() => {
  const reason = q.reason
  const qLimitRaw = q.limit
  const qRemainingRaw = q.remaining
  const qLimit = typeof qLimitRaw === 'string' ? parseInt(qLimitRaw, 10) : Array.isArray(qLimitRaw) && qLimitRaw[0] ? parseInt(qLimitRaw[0], 10) : null
  const qRemaining = typeof qRemainingRaw === 'string' ? parseInt(qRemainingRaw, 10) : Array.isArray(qRemainingRaw) && qRemainingRaw[0] ? parseInt(qRemainingRaw[0], 10) : null
  const qLimitType = q.limit_type || q.type || 'reveals'
  if (reason === 'limit' || reason === 'result_limit') {
    return {
      reached: !qRemaining || qRemaining === 0,
      limit: qLimit || 10,
      remaining: qRemaining,
      type: qLimitType
    }
  }

  if (limitState.value) {
    return {
      reached: !!(limitState.value.remaining !== null && limitState.value.remaining <= 0),
      limit: limitState.value.limit ?? limitState.value.total ?? null,
      remaining: limitState.value.remaining ?? null,
      type: limitState.value.type || 'reveals'
    }
  }

  return null
})

const subscriptionContext = computed(() => {
  // Force re-computation when selectedPackage or activeSubscriptionType changes
  const pkg = selectedPackage.value
  const subType = activeSubscriptionType.value
  
  return {
    type: subType === 'personal' ? 'Personal Subscription' : subType.startsWith('institution-') ? 'Institution Subscription' : 'New Subscription',
    remaining: subType === 'personal' ? (personalRemaining.value ?? 'Unlimited') : subType.startsWith('institution-') ? (institutionSubscriptions.value.find(s => subType === ('institution-' + s.institution_id))?.remaining ?? 'Unlimited') : 'Unlimited'
  }
})

// Create a display package object that forces re-renders when selectedPackage changes
const displaySelectedPackage = computed(() => {
  if (!selectedPackage.value) return null
  // Return a new object reference each time to force Vue to update
  return Object.assign({}, selectedPackage.value)
})

// Decide whether to show subscription packages in the UI
const showPackages = computed(() => {
  // For tournament checkout, only show packages when:
  // - the tournament explicitly allows subscribers OR requires a subscription,
  // AND
  // - the current user does NOT already have a usable subscription for the tournament.
  if (isTournamentCheckout.value) {
    const hasTournament = !!tournament.value
    const openToSubscribers = isFreeForSubscribers.value
    const requiresSub = tournamentRequiresSubscription.value === true
    // If the tournament is open to subscribers but the user already has a usable
    // subscription, they don't need to pick a package — hide the package list.
    if (openToSubscribers && hasUsableSubscriptionForTournament()) return false
    return hasTournament && (openToSubscribers || requiresSub)
  }

  // For regular (non-tournament) checkouts, show packages when user has no active subscription
  return !isActive.value
})

async function fetchLimitInfo() {
  try {
    const res = await api.get('/api/subscriptions/mine')
    if (res?.ok) {
      const data = await res.json()
      const usage = data?.subscription?.usage || data?.usage || data?.limit || null
      if (usage) {
        limitState.value = {
          limit: usage.limit ?? usage.total ?? null,
          remaining: usage.remaining ?? usage.left ?? null,
          type: usage.type || 'reveals'
        }
      }
    }
  } catch (e) {
    console.debug('Could not fetch usage info:', e)
  }
}

async function loadPackages() {
  try {
    await subscriptionsStore.fetchPackages()
    const allPackages = (subscriptionsStore.packages as Record<string, any>[] || [])
    packages.value = allPackages.filter((pkg: Record<string, any>) => !pkg.audience || pkg.audience === 'quizee')
    if (Array.isArray(packages.value) && packages.value.length) selectedPackage.value = Object.assign({}, packages.value[0] as Record<string, any>)
  } catch (e) {
    packages.value = []
  }
}

async function checkSubscription() {
  loading.value = true
  try {
    const data: any = await subscriptionsStore.fetchMySubscription()
    if (data) {
      const sub = data.subscription
      isActive.value = !!(sub && (sub.status === 'active' || sub.status === 'paid'))
      activePackageName.value = sub?.package?.title || sub?.package?.name || ''
      
      if (sub) {
          personalRemaining.value = sub.remaining
          // remember the active package object if provided by the API
          currentActivePackage.value = sub.package || null
      }
      
      const instSubs = data.institution_subscriptions || []
      institutionSubscriptions.value = instSubs
      
      if (instSubs.length > 0) {
        const primaryInst = instSubs[0] as Record<string, any>
        institutionName.value = primaryInst.institution_name || 'Your Institution'
        institutionIsActive.value = primaryInst.status === 'active'
        
        if (institutionIsActive.value) {
          activeSubscriptionType.value = 'institution-' + primaryInst.institution_id
        }
        // if institution subscription includes package info, keep it as active package
        if (!currentActivePackage.value && primaryInst?.package) currentActivePackage.value = primaryInst.package
      }
    } else {
      throw new Error('Failed to fetch subscription status')
    }
  } catch (e) {
    console.error('Subscription check failed:', e)
    isActive.value = false
    activePackageName.value = ''
    institutionName.value = ''
    institutionIsActive.value = false
    institutionSubscriptions.value = []
  } finally {
    loading.value = false
  }
}

function selectActiveSubscription(typeStr: string, instSub?: Record<string, any>) {
  activeSubscriptionType.value = typeStr
  // If we have a package object for the active subscription, show it
  if (typeStr === 'personal') {
    if (currentActivePackage.value) {
      selectedPackage.value = Object.assign({}, currentActivePackage.value)
    } else if (packages.value && packages.value.length) {
      // fallback to the first available package
      selectedPackage.value = Object.assign({}, packages.value[0])
    }
  } else if (typeStr.startsWith('institution-')) {
    if (instSub && instSub.package) {
      selectedPackage.value = Object.assign({}, instSub.package)
    } else if (packages.value && packages.value.length) {
      selectedPackage.value = Object.assign({}, packages.value[0])
    }
  }
  packageVersion.value = (packageVersion.value || 0) + 1
}

function selectPackage(pkg: Record<string, any>) { 
  // update selected package and bump version to force Selected Plan re-render
  // assign a shallow clone so Vue sees a new object reference
  selectedPackage.value = Object.assign({}, pkg)
  // bump the version counter to force a key-based re-render where used
  packageVersion.value = (packageVersion.value || 0) + 1
  // keep a short debug log (can be removed later)
  try { console.debug('selectedPackage ->', pkg?.title || pkg?.name, 'packageVersion=', packageVersion.value) } catch (e) {}
}

// Load and manage referral code
function loadReferralCode() {
  try {
    const stored = localStorage.getItem('modeh:referral_code')
    if (stored) {
      referralCodeStored.value = stored
    }
  } catch (e) {
    console.debug('Could not load referral code from storage', e)
  }
}

function applyReferralCode() {
  if (!referralCodeInput.value) return
  try {
    localStorage.setItem('modeh:referral_code', referralCodeInput.value)
  } catch (e) {
    console.debug('Could not save referral code', e)
  }
  referralCodeStored.value = referralCodeInput.value
  showReferralInput.value = false
}

async function joinTournamentAfterPayment() {
  if (!isTournamentCheckout.value) return false
  if (tournamentJoinAttempted.value) return tournamentJoinSucceeded.value
  tournamentJoinAttempted.value = true
  try {
    const payload: Record<string, any> = {}
    if (lastPaymentReference.value) payload.payment_reference = lastPaymentReference.value
    const res = await api.postJson(`/api/tournaments/${id}/join`, payload)
    if (api.handleAuthStatus(res)) return false

    if (res?.ok || res?.status === 204 || res?.status === 200) {
      tournamentJoinSucceeded.value = true
      return true
    }
    if (res?.status === 409) {
      tournamentJoinSucceeded.value = true
      return true
    }

    if (res?.status === 202) {
      try {
        const data = typeof res.json === 'function' ? await res.json() : res
        if (data?.code === 'pending_payment' || data?.status === 'pending_payment') {
          return 'pending'
        }
      } catch (e) {}
    }

    if (res && typeof res.json === 'function') {
      try {
        const data = await res.json()
        if (data?.code === 'already_registered' || data?.isRegistered) {
          tournamentJoinSucceeded.value = true
          return true
        }
      } catch (e) {}
    }
  } catch (e) {
    return false
  }
  return false
}

// Direct join (no payment) for tournaments
async function registerForTournamentDirect() {
  if (!isTournamentCheckout.value) return false
  try {
    checkout.processing = true
    checkout.status = 'processing'
    checkout.pendingMessage = 'Registering for tournament...'

    const payload: Record<string, any> = {}
    const res = await api.postJson(`/api/tournaments/${id}/join`, payload)
    if (api.handleAuthStatus(res)) {
      checkout.processing = false
      checkout.status = 'error'
      checkout.pendingMessage = 'Authentication required.'
      return false
    }

    if (res?.ok || res?.status === 204 || res?.status === 200) {
      // joined
      checkout.processing = false
      checkout.status = 'success'
      checkout.pendingMessage = 'Successfully registered for the tournament.'
      // Redirect to tournament details with a flag indicating recent registration
      router.push({ path: `/quizee/tournaments/${id}`, query: { registered: '1' } })
      return true
    }

    if (res?.status === 409) {
      // already registered
      checkout.processing = false
      checkout.status = 'success'
      checkout.pendingMessage = 'You are already registered for this tournament.'
      router.push({ path: `/quizee/tournaments/${id}`, query: { registered: '1' } })
      return true
    }

    if (res?.status === 202) {
      try {
        const data = typeof res.json === 'function' ? await res.json() : res
        if (data?.code === 'pending_payment' || data?.status === 'pending_payment') {
          checkout.processing = false
          checkout.status = 'error'
          checkout.pendingMessage = 'Registration recorded — awaiting payment confirmation.'
          return 'pending'
        }
      } catch (e) {}
    }

    if (res && typeof res.json === 'function') {
      try {
        const data = await res.json()
        checkout.processing = false
        if (data?.code === 'already_registered' || data?.isRegistered) {
          checkout.status = 'success'
          router.push({ path: `/quizee/tournaments/${id}`, query: { registered: '1' } })
          return true
        }
        // surface backend message
        checkout.status = 'error'
        checkout.pendingMessage = data?.message || 'Failed to register for the tournament.'
        return false
      } catch (e) {
        checkout.processing = false
      }
    }
  } catch (err: any) {
    checkout.processing = false
    checkout.status = 'error'
    checkout.pendingMessage = (err && err.message) ? err.message : 'An error occurred while registering.'
    return false
  }
}

function hasUsableSubscriptionForTournament() {
  // If the active subscription (personal) has remaining > 0
  if (activeSubscriptionType.value === 'personal') {
    if (personalRemaining.value !== null && personalRemaining.value > 0) return true
    // personalRemaining null means unlimited
    if (personalRemaining.value === null) return true
  }

  if (activeSubscriptionType.value && activeSubscriptionType.value.startsWith('institution-')) {
    const inst = institutionSubscriptions.value.find(s => activeSubscriptionType.value === ('institution-' + s.institution_id))
    if (inst) {
      if (inst.remaining !== null && inst.remaining > 0) return true
      if (inst.remaining === null) return true
    }
  }

  return false
}

// Decides whether to attempt free registration or open payment modal for tournament
function attemptTournamentRegistration() {
  // If tournament is free for subscribers and user has usable subscription, register directly
  if (isFreeForSubscribers.value && hasUsableSubscriptionForTournament()) {
    registerForTournamentDirect()
    return
  }

  // If user already has a usable subscription, allow direct join (no payment)
  if (hasUsableSubscriptionForTournament()) {
    registerForTournamentDirect()
    return
  }

  // If this tournament has an entry fee, open payment flow
  if (tournamentEntryFee.value && tournamentEntryFee.value > 0) {
    // mark intent so onPaymentAttemptClosed can handle join
    tournamentIntent.value = true
    // initiate a one-off purchase for the tournament
    initiatePayment('one-off', { item_type: 'tournament', item_id: tournament.value?.id ?? id, amount: tournamentEntryFee.value, price: tournamentEntryFee.value })
    return
  }

  // Fallback: if no subscription and no fee, try to register directly
  registerForTournamentDirect()
}

async function openPayment() {
  if (!selectedPackage.value) return

  // If the package is free (price is 0 or falsy), subscribe automatically
  const priceNum = Number(selectedPackage.value?.price || 0)
  if (!priceNum) {
    try {
      console.log('[Payment] Free package - subscribing directly without payment modal')
      // Call store subscribe which returns parsed data and refreshes subscription
      await subscriptionsStore.subscribeToPackage(selectedPackage.value, {})
      await subscriptionsStore.fetchMySubscription(true)
      // notify user
      useAppAlert().push({ type: 'success', message: `You're now subscribed to ${selectedPackage.value.name || 'the free plan'}.` })
      // Check subscription and proceed with tournament if applicable
      await checkSubscription()
      if (isTournamentCheckout.value) {
        const joined = await joinTournamentAfterPayment()
        if (joined === true) {
          checkout.status = 'success'
          router.push({ path: `/quizee/tournaments/${id}`, query: { registered: '1' } })
          return
        }
      }
    } catch (err) {
      useAppAlert().push({ type: 'error', message: err.message || 'Failed to subscribe to free plan.' })
    }
    return
  }

  // For paid packages, show payment modal
  paymentModalPackage.value = selectedPackage.value
  paymentModalItem.value = null
  showPaymentModal.value = true
}

async function onPaymentAttemptClosed() {
  // Refresh subscription state first so active subscriptions are visible to the join endpoint
  await checkSubscription()
  const joined = await joinTournamentAfterPayment()
  if (joined === true) {
    checkout.status = 'success'
    showAwaitingModal.value = false
    router.push({ path: `/quizee/tournaments/${id}`, query: { registered: '1' } })
    return
  }

  if (joined === 'pending') {
    checkout.status = 'error'
    checkout.pendingMessage = 'Registration recorded — awaiting payment confirmation. Your entry will be activated once payment is confirmed. If you do not see confirmation within a minute, check your Purchases page or try joining again from the tournament page.'
    showAwaitingModal.value = false
    router.push({ path: `/quizee/tournaments/${id}`, query: { registered: 'pending' } })
    return
  }

  if (isActive.value) checkout.status = 'success'
  showAwaitingModal.value = false
  if (isTournamentCheckout.value) {
    checkout.status = 'error'
    checkout.pendingMessage = 'Unable to register for the tournament automatically. Please try joining from the tournament page.'
  }
}

async function openAnswerReview() {
  if (!attemptId) return;
  showReview.value = true;
  reviewLoading.value = true;
  reviewError.value = '';
  
  let retries = 3;
  while (retries > 0) {
    try {
      const res = await api.get(`/api/quiz-attempts/${attemptId}/review`);
      if (res?.ok) {
        const data = await res.json();
        const answers = data?.attempt?.answers || data?.attempt?.details || [];
        if (Array.isArray(answers)) {
          try {
            const quizRes = await api.get(`/api/quizzes/${data.attempt.quiz_id}`);
            if (quizRes?.ok) {
              const quizData = await quizRes.json();
              const quiz = quizData.quiz || quizData;
              const questionMap: Record<string, any> = {};
              (quiz.questions || []).forEach((q: Record<string, any>) => {
                questionMap[q.id] = q;
              });
              
              const enriched = answers.map((ans: Record<string, any>) => ({
                ...ans,
                question_id: ans.question_id,
                body: questionMap[ans.question_id]?.body || questionMap[ans.question_id]?.question || 'Question',
                provided: ans.selected || null
              }));
              
              reviewDetails.value = enriched;
              reviewError.value = '';
              break;
            } else {
              throw new Error('Could not fetch quiz');
            }
          } catch (quizErr) {
            const enriched = answers.map((ans: Record<string, any>) => ({
              ...ans,
              body: 'Question',
              provided: ans.selected || null
            }));
            reviewDetails.value = enriched;
            reviewError.value = '';
            break;
          }
        }
      } else if (res?.status === 404) {
        reviewError.value = 'Review not available for this attempt.';
        break;
      } else if (res && res.status >= 400 && res.status < 500) {
        reviewError.value = 'Unable to fetch review: ' + (res.statusText || 'Client error');
        break;
      }
      
      if (retries === 1) {
        reviewError.value = "No answers found for this attempt. Please try again later.";
      }
    } catch (e) {
      console.error("Failed to fetch attempt review:", e);
      if (retries === 1) {
        reviewError.value = "Failed to fetch your answers. Please try again.";
      }
    }
    
    retries--;
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  reviewLoading.value = false;
}

function seeResults() {
  const idVal = Array.isArray(id) ? id[0] : id
  const attemptIdVal = Array.isArray(attemptId) ? attemptId[0] : attemptId
  checkout.markResults({ type: String(type), id: idVal ? Number(idVal) || String(idVal) : undefined, attemptId: attemptIdVal ? Number(attemptIdVal) || String(attemptIdVal) : undefined })
}

async function refreshLimit() {
  limitRefreshing.value = true
  try {
    await fetchLimitInfo()
  } catch (e) {
    console.debug('refreshLimit failed', e)
  } finally {
    await new Promise(r => setTimeout(r, 250))
    limitRefreshing.value = false
  }
}

function retry() { router.go(0) }
function redo() { router.push(type === 'quiz' && id ? `/quizee/quizzes/take/${id}` : '/quizee') }

function payForThisItem() {
  if (item.value && itemPrice.value !== null && itemPrice.value > 0) {
    paymentModalPackage.value = null
    paymentModalItem.value = { ...item.value, price: itemPrice.value }
    showPaymentModal.value = true
  }
}

async function viewFreeResults() {
  await seeResults()
}

onMounted(async () => {
  checkout.reset();
  loadReferralCode()
  await loadPackages()
  await fetchLimitInfo()
  await checkSubscription()
  // If this is a tournament checkout, fetch tournament details
  if (isTournamentCheckout.value && id) {
    try {
      const res = await api.get(`/api/tournaments/${id}`)
      if (res?.ok) {
        const data = await res.json()
        tournament.value = data.tournament || data || null
        // heuristics for entry fee and rules
        tournamentEntryFee.value = tournament.value?.entry_fee ?? tournament.value?.fee ?? tournament.value?.price ?? tournament.value?.one_off_price ?? null
        // Normalize the API field into a tri-state ref. If the API explicitly
        // provides free_for_subscribers (true/false) use it, otherwise leave
        // as null so the computed `isFreeForSubscribers` can use other flags.
        if (typeof tournament.value?.free_for_subscribers === 'boolean') {
          tournamentFreeForSubscribers.value = tournament.value.free_for_subscribers
        } else {
          tournamentFreeForSubscribers.value = null
        }
        tournamentRequiresSubscription.value = tournament.value?.requires_subscription ?? null
        // if tournament provides an explicit price, set item and itemPrice for order summary
        if (tournamentEntryFee.value !== null) {
          item.value = tournament.value
          itemPrice.value = tournamentEntryFee.value
        }
      }
    } catch (e) {
      console.debug('Could not fetch tournament details', e)
    }
  }
  try {
    if (id) {
      const res = await api.get(`/api/${type === 'quiz' ? 'quizzes' : 'battles'}/${id}`)
      if (res?.ok) {
        const data = await res.json()
        item.value = data.quiz || data.battle || data || null
        itemPrice.value = item.value?.one_off_price ?? null
      }
    }
  } catch (e) {
    item.value = null
    itemPrice.value = null
  }
  canRedo.value = !!(id && type === 'quiz')
  try {
    const res = await api.get('/api/me')
    if (res?.ok) {
      const data = await res.json()
      if (data && data.phones) phones.value = data.phones
    }
  } catch (e) { phones.value = [] }
})
</script>

<style scoped>
</style>
