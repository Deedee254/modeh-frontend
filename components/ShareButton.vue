<!-- ShareButton.vue -->
<template>
  <button
    @click="copyToClipboard"
    class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-500"
  >
    <ShareIcon class="w-4 h-4" />
    {{ copied ? 'Copied!' : 'Share' }}
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { ShareIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  url: {
    type: String,
    required: true
  }
})

const copied = ref(false)

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.url)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>
