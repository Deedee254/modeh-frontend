<template>
  <div class="relative" ref="root">
    <div @click.stop="toggle">
      <slot name="trigger">
        <button @click.stop="toggle" :aria-expanded="open" aria-haspopup="true" class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
          <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6 10a2 2 0 110-4 2 2 0 010 4zm4 0a2 2 0 110-4 2 2 0 010 4zm4 0a2 2 0 110-4 2 2 0 010 4z"/></svg>
        </button>
      </slot>
    </div>

    <!-- Backdrop overlay - only on mobile -->
    <div v-if="open" class="fixed inset-0 z-40 md:hidden transition-opacity duration-200" @click="close" />

    <!-- Menu dropdown -->
    <div
      v-show="open"
      class="absolute z-50 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 origin-top overflow-hidden transition-all duration-200"
      :class="[
        alignClass,
        open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      ]"
      ref="menu"
      @click.stop
    >
      <slot name="items" :close="close"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({ 
  align: { 
    type: String, 
    default: 'right',
    validator: (v) => ['left', 'right'].includes(v)
  } 
})

const open = ref(false)
const root = ref(null)

const alignClass = computed(() => {
  return props.align === 'left' ? 'left-0' : 'right-0'
})

function toggle() { 
  open.value = !open.value
}

function close() { 
  open.value = false
}

function onDocClick(e) {
  try {
    // If menu isn't open we don't need to do anything
    if (!open.value) return
    const rootEl = root.value
    if (!rootEl || !e?.target) return
    // If the click happened inside our root (trigger or menu) do nothing
    if (rootEl.contains(e.target)) return
    // Otherwise close the menu
    close()
  } catch (err) {
    // Silently ignore errors during event handling
  }
}

function onKeyDown(e) {
  try {
    if (!e?.key) return
    if (e.key === 'Escape' || e.key === 'Esc') {
      close()
    }
  } catch (err) {
    // Silently ignore errors
  }
}

let listeners = false
let removeAfterEach = null

onMounted(() => {
  if (listeners) return
  listeners = true
  try {
    // Use bubble-phase click listener so clicks on the trigger (which may
    // stop propagation) are handled first by component handlers. Using the
    // capture phase here caused the document listener to fire before the
    // trigger's click handler and immediately close the menu.
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKeyDown, true)
  } catch (err) {
    // Ignore mount errors
  }
  // Close menu on route navigation so menus don't remain open after link click
  try {
    const router = useRouter()
    // router.afterEach returns an unregister function
    removeAfterEach = router.afterEach(() => {
      if (open.value) close()
    })
  } catch (err) {
    // ignore router hook errors (SSR or missing router)
  }
})

onBeforeUnmount(() => {
  if (!listeners) return
  try {
    document.removeEventListener('click', onDocClick)
    document.removeEventListener('keydown', onKeyDown, true)
  } catch (err) {
    // Ignore unmount errors
  }
  listeners = false
  try {
    if (removeAfterEach && typeof removeAfterEach === 'function') removeAfterEach()
  } catch (err) {}
})
</script>

<style scoped>
/* Responsive menu width on mobile */
@media (max-width: 640px) {
  :deep(.absolute) {
    right: 0.5rem !important;
    left: auto !important;
    width: auto;
    max-width: calc(100vw - 1rem);
  }
}
</style>
