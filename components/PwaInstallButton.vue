<template>
  <div v-if="showInstallPrompt" class="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-primary/5 py-1">
    <div class="flex items-center gap-2">
      <span class="text-sm">Install Modeh for a better experience</span>
      <UButton
        size="xs"
        color="primary"
        @click="installPWA"
        icon="i-heroicons-arrow-down-tray"
      >
        Install
      </UButton>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const showInstallPrompt = ref(false)
let deferredPrompt = null
let beforeInstallHandler = null

onMounted(() => {
  beforeInstallHandler = (e) => {
    e.preventDefault()
    deferredPrompt = e
    showInstallPrompt.value = true
  }

  window.addEventListener('beforeinstallprompt', beforeInstallHandler)

  // Hide button if PWA is already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    showInstallPrompt.value = false
  }
})

onBeforeUnmount(() => {
  if (beforeInstallHandler) {
    window.removeEventListener('beforeinstallprompt', beforeInstallHandler)
  }
})

const installPWA = async () => {
  if (!deferredPrompt) return

  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice

  if (outcome === 'accepted') {
    showInstallPrompt.value = false
  }

  deferredPrompt = null
}
</script>