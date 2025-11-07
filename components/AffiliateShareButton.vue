<template>
  <div>
    <button
      @click="showShareModal = true"
      class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      <ShareIcon class="w-4 h-4" />
      Share
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
                          class="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        <button
                          @click="copyToClipboard(affiliateLink)"
                          class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
import { ref, computed } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { ShareIcon, ClipboardIcon, CheckIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '~/stores/auth'

const props = defineProps({
  itemType: {
    type: String,
    required: true,
    validator: (value) => ['Quiz', 'Tournament', 'Battle'].includes(value)
  },
  itemId: {
    type: [String, Number],
    required: true
  },
  baseUrl: {
    type: String,
    required: true
  }
})

const auth = useAuthStore()
const showShareModal = ref(false)
const copied = ref(false)

// Compute the affiliate link with the user's referral code
const affiliateLink = computed(() => {
  const baseUrl = props.baseUrl?.endsWith('/') ? props.baseUrl.slice(0, -1) : (props.baseUrl || '')
  const refCode = auth.user?.affiliate_code || ''
  return `${baseUrl}/${props.itemId}?ref=${refCode}`
})

// Copy to clipboard function
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
</script>