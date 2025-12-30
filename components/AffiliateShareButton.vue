<template>
  <div>
    <button
      @click="handleShare"
      :class="btnClassComputed"
    >
      <ShareIcon class="w-4 h-4" />
      <span v-if="!iconOnly" class="ml-2">Share</span>
    </button>

    <!-- Share Modal -->
    <TransitionRoot appear :show="showShareModal" as="template">
      <Dialog as="div" @close="showShareModal = false" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <!-- No Affiliate Code State -->
                <div v-if="!hasAffiliateCode">
                  <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                    Start Earning with Referrals
                  </DialogTitle>
                  <div class="mt-4">
                    <p class="text-sm text-gray-500 mb-4">
                      Generate your affiliate code to start earning commissions when you share content!
                    </p>
                    <div class="space-y-4">
                      <div class="bg-gray-50 rounded-lg p-4">
                        <h4 class="text-sm font-medium text-gray-900 mb-2">Benefits:</h4>
                        <ul class="space-y-2 text-sm text-gray-600">
                          <li class="flex items-start">
                            <CheckCircleIcon class="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            <span>Earn 10% commission on referral purchases</span>
                          </li>
                          <li class="flex items-start">
                            <CheckCircleIcon class="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            <span>Track your earnings in real-time</span>
                          </li>
                          <li class="flex items-start">
                            <CheckCircleIcon class="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            <span>Get paid monthly</span>
                          </li>
                        </ul>
                      </div>
                      <button
                        @click="goToAffiliateDashboard"
                        class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700"
                      >
                        Get Started
                      </button>
                      <!-- Plain shareable URL (no affiliate code) -->
                      <div class="mt-3">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Share this {{ itemType.toLowerCase() }} (direct URL)</label>
                        <div class="flex gap-2">
                          <input type="text" readonly :value="directLink" class="flex-1 block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-sm" />
                          <button @click="copyToClipboard(directLink)" class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Has Affiliate Code State -->
                <div v-else>
                  <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                    Share {{ itemType }}
                  </DialogTitle>

                  <div class="mt-4">
                    <p class="text-sm text-gray-500 mb-4">
                      Share this {{ itemType.toLowerCase() }} with your network and earn when they subscribe!
                    </p>

                    <div class="flex flex-col gap-4">
                    <!-- Affiliate Link -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Your Affiliate Link</label>
                      <div class="flex gap-2">
                        <input
                          type="text"
                          readonly
                          :value="affiliateLink"
                          class="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-600 sm:text-sm"
                        />
                        <button
                          @click="copyToClipboard(affiliateLink)"
                          class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-600"
                        >
                          <ClipboardIcon v-if="!copied" class="w-4 h-4" />
                          <CheckIcon v-else class="w-4 h-4 text-green-500" />
                        </button>
                      </div>
                    </div>

                    <!-- Social Share Buttons -->
                    <div class="flex gap-2 justify-center mt-2">
                      <button
                        @click="shareToSocial('whatsapp')"
                        class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        WhatsApp
                      </button>
                      <button
                        @click="shareToSocial('twitter')"
                        class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Twitter
                      </button>
                      <button
                        @click="shareToSocial('facebook')"
                        class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Facebook
                      </button>
                    </div>
                    <!-- Plain shareable URL (no affiliate code) -->
                    <div class="mt-3">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Direct link (no affiliate)</label>
                      <div class="flex gap-2">
                        <input type="text" readonly :value="directLink" class="flex-1 block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-sm" />
                        <button @click="copyToClipboard(directLink)" class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { ShareIcon, ClipboardIcon, CheckIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '~/stores/auth'
import { useRuntimeConfig, navigateTo } from '#imports'
import useApi from '~/composables/useApi'

const props = defineProps({
  itemType: {
    type: String,
    default: 'Item',
    validator: (value) => value === undefined || value === null || ['Quiz', 'Tournament', 'Battle', 'Item'].includes(value)
  },
  itemId: {
    type: [String, Number],
    default: null,
    required: false
  },
  baseUrl: {
    type: String,
    default: null
  },
  btnClass: {
    type: String,
    default: null
  },
  iconOnly: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: false
  }
})

// Compute button classes; allow parent to override via btnClass, otherwise use default small button
const btnClassComputed = computed(() => {
  if (props.btnClass) return props.btnClass + (props.fullWidth ? ' w-full justify-center' : '')
  // default fallback matches original appearance
  const gap = props.iconOnly ? 'gap-0' : 'gap-2'
  const pxpy = props.iconOnly ? 'p-2' : 'px-3 py-2'
  return (`inline-flex items-center ${gap} ${pxpy} text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2`)
})

// Handle share button click
const handleShare = () => {
  showShareModal.value = true
}

const auth = useAuthStore()
const api = useApi()
const config = useRuntimeConfig()
const showShareModal = ref(false)
const copied = ref(false)
const fetchedAffiliateCode = ref(null)

// Computed property to check if user has an affiliate code
const hasAffiliateCode = computed(() => {
  return Boolean(
    auth.user?.affiliate?.referral_code || 
    auth.user?.affiliate_code || 
    fetchedAffiliateCode.value
  )
})

// Compute the base URL (use prop if provided, otherwise from config)
const computedBaseUrl = computed(() => {
  if (props.baseUrl) {
    return props.baseUrl.endsWith('/') ? props.baseUrl.slice(0, -1) : props.baseUrl
  }
  // Default base URL based on item type
  const base = `${config.public.baseUrl}/${props.itemType.toLowerCase()}s`
  return base.endsWith('/') ? base.slice(0, -1) : base
})

// Compute the affiliate link with the user's referral code
const affiliateLink = computed(() => {
  const base = computedBaseUrl.value
  // Prefer the affiliate relation's referral_code, then any appended affiliate_code on user,
  // then a cached value fetched from /api/affiliates/me. If none, return base without query.
  const code = auth.user?.affiliate?.referral_code ?? auth.user?.affiliate_code ?? fetchedAffiliateCode.value ?? ''
  const idPart = props.itemId !== null && props.itemId !== undefined ? `/${props.itemId}` : ''
  if (!code) return `${base}${idPart}`
  return `${base}${idPart}?ref=${encodeURIComponent(code)}`
})

// Compute a direct link (no affiliate query) for users who want to share the plain URL
const directLink = computed(() => {
  const base = computedBaseUrl.value
  const idPart = props.itemId !== null && props.itemId !== undefined ? `/${props.itemId}` : ''
  return `${base}${idPart}`
})

// When the modal opens, fetch the affiliate code if it's not already present on the user
const fetchAffiliateIfMissing = async () => {
  try {
    // If user already has affiliate code, nothing to do
    const existing = auth.user?.affiliate?.referral_code ?? auth.user?.affiliate_code
    if (existing) {
      fetchedAffiliateCode.value = existing
      return
    }

    const res = await api.get('/api/affiliates/me')
    if (!res || !res.ok) {
      fetchedAffiliateCode.value = null
      return
    }
    
    const data = await res.json().catch(() => null)
    if (!data) {
      fetchedAffiliateCode.value = null
      return
    }
    
    // API returns either the affiliate object or a consistent shape like { referral_code: null }
    if (data.referral_code !== undefined) {
      fetchedAffiliateCode.value = data.referral_code
      return
    }
    // If the API returned full affiliate object, it should have referral_code
    fetchedAffiliateCode.value = data.referral_code ?? null
  } catch (err) {
    // network or auth error: leave as null
    console.error('Failed to fetch affiliate code:', err)
    fetchedAffiliateCode.value = null
  }
}

watch(showShareModal, (val) => {
  if (val) fetchAffiliateIfMissing()
})

// Expose an imperative method for other components (e.g., StickyShareButton) to open the modal
defineExpose({
  openShareModal() {
    showShareModal.value = true
  }
})

// Copy to clipboard function
const copyToClipboard = async (text) => {
  try {
    if (!text) return
    
    // Try modern API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      // Fallback for older browsers or non-secure contexts
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
    // Show user-friendly fallback message
    alert('Failed to copy. Please copy manually: ' + text)
  }
}

// Social sharing function
const shareToSocial = (platform) => {
  const url = encodeURIComponent(affiliateLink.value)
  const title = encodeURIComponent(`Check out this ${props.itemType?.toLowerCase?.() || 'item'} on Modeh!`)
  
  const urls = {
    whatsapp: `https://wa.me/?text=${title}%20${url}`,
    twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`
  }
  
  window.open(urls[platform], '_blank')
}

// Navigate to affiliate dashboard (or send unauthenticated users to login with next)
const goToAffiliateDashboard = () => {
  showShareModal.value = false

  // Determine the correct dashboard path based on user role
  const userRole = auth.user?.role || auth.role
  let dashboardPath = '/affiliate/'

  if (userRole === 'quizee') {
    dashboardPath = '/quizee/affiliate/'
  } else if (userRole === 'quiz-master') {
    dashboardPath = '/quiz-master/affiliate/'
  }

  // If user is not logged in, send them to login with a `next` param pointing to the affiliate dashboard
  if (!auth.user || !auth.user.id) {
    // Use navigateTo so Nuxt handles client-side routing; include affiliate flag for clarity
    navigateTo({ path: '/login', query: { next: dashboardPath, affiliate: '1' } })
    return
  }

  navigateTo(dashboardPath)
}
</script>
