<template>
  <Transition name="slide-up">
  <!-- Increase bottom offset on mobile to account for the mobile BottomNav (h-16 / 4rem) -->
  <div v-if="!store.bannerDismissed" class="fixed left-6 bottom-[calc(4rem_+_1.5rem_+_4rem)] z-50 md:bottom-6 md:top-auto top-auto">
      <div class="text-white rounded-2xl shadow-2xl p-6 max-w-lg w-[min(92vw,520px)]" style="background-color: #8A1F22">
        <!-- Brief banner -->
        <div v-if="!showSettings" class="space-y-4">
          <div>
            <h3 class="text-xl font-semibold">Hello traveller, it's cookie time!</h3>
            <p class="text-sm text-gray-300 mt-2">Our website uses essential cookies to ensure its proper operation and tracking cookies to understand how you interact with it. The latter will be set only after consent. <button @click="showSettings = true" class="underline text-gray-200">Manage preferences</button></p>
          </div>

          <div class="pt-3 border-t border-white/10"></div>

          <div class="flex gap-3">
            <button @click="acceptAll" class="flex-1 rounded-lg px-4 py-2 font-medium text-gray-900" style="background-color: #F8B92E">Accept all</button>
            <button @click="rejectAll" class="flex-1 rounded-lg px-4 py-2 font-medium text-gray-900" style="background-color: #F8B92E">Reject all</button>
          </div>
        </div>

        <!-- Settings panel -->
        <div v-else class="max-w-2xl mx-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Cookie Preferences</h3>
            <button @click="cancelSettings" class="text-gray-400 hover:text-gray-200 px-2 py-1">Close</button>
          </div>

          <div class="space-y-4 mb-4">
            <div class="bg-white/5 rounded p-4">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h4 class="font-semibold mb-1">Essential Cookies</h4>
                  <p class="text-sm text-gray-300">Required for the website to function properly. These include authentication and session cookies that enable core features. They cannot be disabled.</p>
                </div>
                <div class="ml-4 flex-shrink-0">
                  <input type="checkbox" checked disabled class="w-5 h-5 rounded bg-gray-300 cursor-not-allowed" />
                </div>
              </div>
            </div>

            <div class="bg-white/5 rounded p-4">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h4 class="font-semibold mb-1">Analytics Cookies</h4>
                  <p class="text-sm text-gray-300">Help us understand how you use the site so we can improve performance and content. Includes Google Analytics, page view tracking and event logging.</p>
                </div>
                <div class="ml-4 flex-shrink-0">
                  <label class="flex items-center cursor-pointer">
                    <input v-model="preferences.analytics" type="checkbox" class="w-5 h-5 rounded border-gray-300 text-blue-600" />
                  </label>
                </div>
              </div>
            </div>

            <div class="bg-white/5 rounded p-4">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h4 class="font-semibold mb-1">Marketing Cookies</h4>
                  <p class="text-sm text-gray-300">Used to deliver relevant advertising and measure campaign effectiveness. These may be set by third-party advertising networks.</p>
                </div>
                <div class="ml-4 flex-shrink-0">
                  <label class="flex items-center cursor-pointer">
                    <input v-model="preferences.marketing" type="checkbox" class="w-5 h-5 rounded border-gray-300 text-purple-600" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded p-3 text-sm text-gray-900 mb-4" style="background-color: #F8B92E">
            <strong class="mr-1">ℹ️ Note:</strong> Your preferences are saved locally in your browser and will be remembered for one year. You can change these settings anytime.
          </div>

          <div class="flex gap-3">
            <button @click="cancelSettings" class="flex-1 px-4 py-2 rounded border border-white/20 text-white">Cancel</button>
            <button @click="rejectAll" class="flex-1 px-4 py-2 rounded border border-white/20 text-white">Reject All</button>
            <button @click="saveCustom" class="flex-1 px-4 py-2 rounded text-gray-900 font-medium" style="background-color: #F8B92E">Save Preferences</button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useCookieConsentStore } from '~/stores/cookieConsent'

const store = useCookieConsentStore()

const showSettings = ref(false)
const preferences = reactive({
  analytics: false,
  marketing: false,
  functional: true
})

onMounted(() => {
  store.loadConsent()
  // initialize preferences from store
  preferences.analytics = store.preferences.analytics
  preferences.marketing = store.preferences.marketing
})

const acceptAll = () => store.acceptAll()
const rejectAll = () => {
  store.rejectAll()
  showSettings.value = false
}

const saveCustom = () => {
  store.updatePreference('analytics', preferences.analytics)
  store.updatePreference('marketing', preferences.marketing)
  store.savePreferences()
  showSettings.value = false
}

const cancelSettings = () => {
  // revert local preferences to store values
  preferences.analytics = store.preferences.analytics
  preferences.marketing = store.preferences.marketing
  showSettings.value = false
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active { transition: transform 0.25s ease, opacity 0.2s ease; }
.slide-up-enter-from { transform: translateY(30%); opacity: 0 }
.slide-up-leave-to { transform: translateY(30%); opacity: 0 }
</style>
