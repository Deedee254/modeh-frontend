<template>
  <div class="relative" ref="root">
    <div @click.stop="toggle">
      <slot name="trigger">
        <button @click.stop="toggle" aria-haspopup="true" :aria-expanded="open" class="p-2 rounded-md hover:bg-gray-100">
          <svg class="w-5 h-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6 10a2 2 0 110-4 2 2 0 010 4zm4 0a2 2 0 110-4 2 2 0 010 4zm4 0a2 2 0 110-4 2 2 0 010 4z"/></svg>
        </button>
      </slot>
    </div>

    <div v-if="open" class="mt-2" @click.stop>
      <div :class="['absolute z-50 w-40 bg-white border rounded shadow-lg py-1', alignClass]" ref="menu">
        <slot name="items" :close="close"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

const props = defineProps({ align: { type: String, default: 'right' } })
const open = ref(false)
const root = ref(null)

const alignClass = computed(() => {
  // support left/right alignment for menu placement if needed
  return props.align === 'left' ? 'origin-top-left left-0' : 'origin-top-right right-0'
})

function toggle() { open.value = !open.value }
function close() { open.value = false }

function onDocClick(e) {
  if (!root.value) return
  if (!root.value.contains(e.target)) close()
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<style scoped>
/* nothing fancy here; positioning is handled by parent usually */
</style>
