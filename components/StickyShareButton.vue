<template>
  <div class="fixed right-0 top-1/2 z-40 -translate-y-1/2 transform">
    <!-- Sticky Button Container with smooth animation -->
    <transition
      enter-active-class="transition ease-in-out duration-300"
      enter-from-class="translate-x-24"
      enter-to-class="translate-x-0"
      leave-active-class="transition ease-in-out duration-300"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-24"
    >
      <div v-if="isVisible" class="flex items-center gap-2 pr-2">
        <!-- Tooltip on hover -->
        <div class="absolute right-full mr-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white shadow-lg opacity-0 transition-opacity hover:opacity-100 whitespace-nowrap pointer-events-none group-hover:opacity-100">
          Share {{ itemType }}
          <div class="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-gray-900"></div>
        </div>

        <!-- Share Button Group (can expand) -->
        <div v-if="expanded" class="flex flex-col gap-2 mr-2 animate-in slide-in-from-right">
          <button
            @click="shareOnFacebook"
            aria-label="Share on Facebook"
            class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white shadow-md hover:shadow-lg hover:bg-blue-700 transition-all hover:scale-110"
            title="Share on Facebook"
          >
            <Icon name="mdi:facebook" class="w-6 h-6" />
          </button>
          <button
            @click="shareOnTwitter"
            aria-label="Share on Twitter/X"
            class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-black text-white shadow-md hover:shadow-lg hover:bg-gray-800 transition-all hover:scale-110"
            title="Share on Twitter"
          >
            <Icon name="mdi:twitter" class="w-6 h-6" />
          </button>
          <button
            @click="shareOnLinkedIn"
            aria-label="Share on LinkedIn"
            class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-700 text-white shadow-md hover:shadow-lg hover:bg-blue-800 transition-all hover:scale-110"
            title="Share on LinkedIn"
          >
            <Icon name="mdi:linkedin" class="w-6 h-6" />
          </button>
          <button
            @click="copyLink"
            aria-label="Copy link"
            class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-700 text-white shadow-md hover:shadow-lg hover:bg-gray-800 transition-all hover:scale-110"
            title="Copy link to clipboard"
          >
            <Icon name="heroicons:link" class="w-6 h-6" />
          </button>
        </div>

        <!-- Main Floating Button (always visible) -->
        <button
          @click="toggleExpand"
          class="group inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg hover:shadow-xl hover:from-brand-600 hover:to-brand-700 transition-all hover:scale-110 active:scale-95"
          :aria-label="expanded ? 'Close share menu' : 'Open share menu'"
          :title="expanded ? 'Close' : 'Share'"
        >
          <transition
            enter-active-class="transition ease-in-out duration-200"
            enter-from-class="rotate-0 scale-100"
            enter-to-class="rotate-90 scale-100"
            leave-active-class="transition ease-in-out duration-200"
            leave-from-class="rotate-90 scale-100"
            leave-to-class="rotate-0 scale-100"
          >
            <Icon
              v-if="expanded"
              name="heroicons:x-mark"
              class="w-7 h-7 absolute"
            />
            <Icon
              v-else
              name="heroicons:share-solid"
              class="w-7 h-7 absolute"
            />
          </transition>
        </button>
      </div>
    </transition>
    <!-- Invisible AffiliateShareButton instance so we can open its modal programmatically -->
    <AffiliateShareButton
      ref="affiliateRef"
      class="hidden"
      :itemType="itemType"
      :itemId="itemId"
      :itemTitle="itemTitle"
      :baseUrl="baseUrl"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AffiliateShareButton from '~/components/AffiliateShareButton.vue'

interface Props {
  itemType?: string
  itemId?: number | string
  itemTitle?: string
  baseUrl?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  itemType: 'Item',
  baseUrl: typeof window !== 'undefined' ? window.location.origin : '',
  disabled: false
})

const expanded = ref(false)
const affiliateRef = ref<any>(null)
const isVisible = ref(false)

// Determine the share URL
const shareUrl = computed(() => {
  if (!props.itemId) return props.baseUrl
  const path = props.itemType.toLowerCase() === 'quiz'
    ? `/quizzes/${props.itemId}`
    : `/tournaments/${props.itemId}`
  return `${props.baseUrl}${path}`
})

const shareTitle = computed(() => {
  return props.itemTitle || `Check out this ${props.itemType.toLowerCase()} on Modeh!`
})

// Show/hide button on scroll (optional: hide when scrolled to bottom)
const handleScroll = () => {
  // Button stays visible at all times but can be customized
  isVisible.value = !props.disabled
}

// Toggle expanded menu (open affiliate modal instead)
const toggleExpand = () => {
  try {
    if (affiliateRef && affiliateRef.value && typeof affiliateRef.value.openShareModal === 'function') {
      affiliateRef.value.openShareModal()
      expanded.value = false
      return
    }
  } catch (e) {}
  // fallback to local expand behavior
  expanded.value = !expanded.value
}

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (expanded.value && !target.closest('[role="button"]')) {
    expanded.value = false
  }
}

// Social share functions
const shareOnFacebook = () => {
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`
  window.open(facebookUrl, '_blank', 'width=600,height=400')
  expanded.value = false
}

const shareOnTwitter = () => {
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl.value)}&text=${encodeURIComponent(shareTitle.value)}`
  window.open(twitterUrl, '_blank', 'width=600,height=400')
  expanded.value = false
}

const shareOnLinkedIn = () => {
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl.value)}`
  window.open(linkedInUrl, '_blank', 'width=600,height=400')
  expanded.value = false
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    // Optional: show toast notification
    console.log('Link copied to clipboard')
    expanded.value = false
  } catch (err) {
    console.error('Failed to copy link', err)
  }
}

onMounted(() => {
  isVisible.value = !props.disabled
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Smooth animations */
.animate-in {
  animation: slideInFromRight 0.3s ease-out;
}

@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Ensure button doesn't interfere with page scrolling on mobile */
@media (max-width: 768px) {
  /* Buttons remain accessible but smaller on mobile */
}
</style>
