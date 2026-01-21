<template>
  <div v-if="showInstallPrompt" class="sticky top-0 left-0 right-0 z-50 flex items-center justify-center bg-primary/5 py-1 backdrop-blur-sm">
    <div class="flex items-center gap-2">
      <span class="text-sm">Install Modeh for a better experience</span>
      <UButton
        size="xs"
        color="primary"
        @click="installPWA"
        icon="i-heroicons-arrow-down-tray"
        class="!bg-brand-600 hover:!bg-brand-700"
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
let appInstalledHandler = null

onMounted(() => {
  // Handler for the browser event. We `preventDefault()` and keep the event so we can
  // call `prompt()` later in response to user action. Show the banner promptly so the
  // user can see the option.
  beforeInstallHandler = (e) => {
    try { e.preventDefault() } catch (err) {}
    deferredPrompt = e
    // show promptly (short delay to avoid jank); if you still want a longer delay change this
    setTimeout(() => {
      showInstallPrompt.value = true
      // helpful debug when troubleshooting why prompt isn't shown
      try { } catch {}
    }, 1000)
  }

  window.addEventListener('beforeinstallprompt', beforeInstallHandler)

  // If the app is already installed, don't show the banner
  try {
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      showInstallPrompt.value = false
    }
  } catch (err) {}

  // Hide the banner when the app is installed (user accepted or install completed)
  appInstalledHandler = () => {
    deferredPrompt = null
    showInstallPrompt.value = false
    try { } catch {}
  }
  window.addEventListener('appinstalled', appInstalledHandler)
})

onBeforeUnmount(() => {
  if (beforeInstallHandler) {
    window.removeEventListener('beforeinstallprompt', beforeInstallHandler)
  }
  if (appInstalledHandler) {
    window.removeEventListener('appinstalled', appInstalledHandler)
  }
})

const installPWA = async () => {
  if (!deferredPrompt) {
    // nothing to do — helpful debug
    try { } catch {}
    return
  }

  try {
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    const outcome = choice?.outcome
    if (outcome === 'accepted') {
      showInstallPrompt.value = false
      deferredPrompt = null
      try { } catch {}
    } else {
      // user dismissed; keep the prompt object cleared so we don't show again until browser fires
      deferredPrompt = null
      try { } catch {}
    }
  } catch (err) {
    try { console.error('[PWA] prompt failed', err) } catch {}
    deferredPrompt = null
  }
}
</script>
