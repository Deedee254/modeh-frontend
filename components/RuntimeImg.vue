<template>
  <div :class="wrapperClass" :style="wrapperStyle">
    <img v-if="showImg && srcToUse" :src="srcToUse" :alt="alt" :class="imgClass" @error="onError" />
    <div v-else class="flex items-center justify-center" :style="{ backgroundColor: fillColor }">
      <slot>
        <span v-if="placeholderText" :class="placeholderClass">{{ placeholderText }}</span>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import resolveAssetUrl from '~/composables/useAssets'

const props = defineProps({
  src: { type: String, required: false },
  alt: { type: String, default: '' },
  fillColor: { type: String, default: '#eef2ff' },
  placeholderText: { type: String, default: '' },
  imgClass: { type: String, default: 'w-full h-full object-contain' },
  wrapperClass: { type: String, default: '' },
  wrapperStyle: { type: Object, default: () => ({}) },
  placeholderClass: { type: String, default: 'text-brand-600 text-sm font-semibold' }
})

const showImg = ref(false)
const srcToUse = ref(null)

function onError() {
  showImg.value = false
  srcToUse.value = null
}

onMounted(async () => {
  if (!props.src || !process.client) {
    showImg.value = false
    return
  }

  // Resolve relative backend storage paths to absolute API base URLs
  const resolved = resolveAssetUrl(props.src)
  const finalSrc = resolved || props.src

  try {
    // Use HEAD to avoid fetching full asset; if HEAD not allowed, fallback to GET attempt
    const head = await fetch(finalSrc, { method: 'HEAD' })
    if (head.ok) {
      srcToUse.value = finalSrc
      showImg.value = true
      return
    }
    // Some servers don't support HEAD; try GET but don't read body completely
    const get = await fetch(finalSrc, { method: 'GET' })
    if (get.ok) {
      srcToUse.value = finalSrc
      showImg.value = true
      return
    }
  } catch (e) {
    // network error or not present
  }
  showImg.value = false
})
</script>

<style scoped>
.w-full { width: 100%; }
.h-full { height: 100%; }
</style>

