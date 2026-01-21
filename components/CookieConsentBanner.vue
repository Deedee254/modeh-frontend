<template>
  <Transition name="slide-up">
    <div
      v-if="!store.bannerDismissed"
      class="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white shadow-2xl"
    >
      <!-- Main Banner -->
      <div v-if="!showSettings" class="px-4 py-6 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto flex flex-col gap-4">
          <!-- Content -->
          <div class="flex-1">
            <h3 class="text-lg font-semibold mb-2">🍪 We Use Cookies</h3>
            <p class="text-sm text-gray-300 mb-4">
              We use cookies and similar technologies to enhance your experience, analyze traffic, and improve our services. 
              Some cookies are essential for the site to function, while others help us understand how you use our platform.
            </p>
            
            <!-- Cookie Types Info -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs">
              <div class="bg-gray-800 rounded p-3">
                <p class="font-semibold text-green-400 mb-1">✓ Essential</p>
                <p class="text-gray-400">Required for basic functionality (always enabled)</p>
              </div>
              <div class="bg-gray-800 rounded p-3">
                <p class="font-semibold text-blue-400 mb-1">📊 Analytics</p>
                <p class="text-gray-400">Help us understand user behavior and improve the app</p>
              </div>
              <div class="bg-gray-800 rounded p-3">
                <p class="font-semibold text-purple-400 mb-1">📢 Marketing</p>
                <p class="text-gray-400">Used for personalized ads and marketing campaigns</p>
              </div>
            </div>

            <!-- Links -->
            <div class="flex flex-wrap gap-2 text-xs">
              <a href="/privacy" target="_blank" class="text-blue-400 hover:underline">Privacy Policy</a>
              <span class="text-gray-600">•</span>
              <a href="/cookie-policy" target="_blank" class="text-blue-400 hover:underline">Cookie Policy</a>
              <span class="text-gray-600">•</span>
              <button @click="showSettings = true" class="text-blue-400 hover:underline">Customize Settings</button>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              @click="rejectAll"
              class="flex-1 px-4 py-2 rounded border border-gray-700 hover:bg-gray-800 transition font-medium text-sm"
            >
              Reject All
            </button>
            <button
              @click="showSettings = true"
              class="flex-1 px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition font-medium text-sm"
            >
              Customize
            </button>
            <button
              @click="acceptAll"
              class="flex-1 px-4 py-2 rounded bg-brand-600 hover:bg-brand-700 transition font-medium text-sm"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>

      <!-- Settings Panel -->
      <div v-else class="px-4 py-6 sm:px-6 lg:px-8">
        <div class="max-w-2xl mx-auto">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold">Cookie Preferences</h3>
            <button
              @click="showSettings = false"
              class="text-gray-400 hover:text-white transition p-1"
            >
              <Icon name="heroicons:x-mark" class="w-5 h-5" />
            </button>
          </div>

          <!-- Cookie Options -->
          <div class="space-y-4 mb-6">
            <!-- Essential Cookies (Always Enabled) -->
            <div class="bg-gray-800 rounded p-4">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h4 class="font-semibold mb-1">Essential Cookies</h4>
                  <p class="text-sm text-gray-400">
                    Required for the website to function properly. Cannot be disabled.
                  </p>
                </div>
                <div class="ml-4 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    class="w-5 h-5 rounded bg-green-600 border-0 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <!-- Analytics Cookies -->
            <div class="bg-gray-800 rounded p-4">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h4 class="font-semibold mb-1">Analytics Cookies</h4>
                  <p class="text-sm text-gray-400">
                    Help us understand how you use Modeh and improve your experience.
                    Includes Google Analytics, page views, and event tracking.
                  </p>
                </div>
                <div class="ml-4 flex-shrink-0">
                  <label class="flex items-center cursor-pointer">
                    <input
                      v-model="preferences.analytics"
                      type="checkbox"
                      class="w-5 h-5 rounded border-gray-600 text-blue-600"
                    />
                  </label>
                </div>
              </div>
            </div>

            <!-- Marketing Cookies -->
            <div class="bg-gray-800 rounded p-4">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h4 class="font-semibold mb-1">Marketing Cookies</h4>
                  <p class="text-sm text-gray-400">
                    Used to display relevant ads and measure marketing campaigns.
                    Helps us understand your interests better.
                  </p>
                </div>
                <div class="ml-4 flex-shrink-0">
                  <label class="flex items-center cursor-pointer">
                    <input
                      v-model="preferences.marketing"
                      type="checkbox"
                      class="w-5 h-5 rounded border-gray-600 text-purple-600"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Info Box -->
          <div class="bg-blue-900/30 border border-blue-700 rounded p-4 mb-6">
            <p class="text-xs text-blue-300">
              <strong>ℹ️ Note:</strong> Your preferences are saved locally in your browser and will be remembered for one year. 
              You can change these settings anytime by clicking the cookie icon in the footer.
            </p>
          </div>

          <!-- Buttons -->
          <div class="flex gap-3">
            <button
              @click="showSettings = false"
              class="flex-1 px-4 py-2 rounded border border-gray-700 hover:bg-gray-800 transition font-medium"
            >
              Cancel
            </button>
            <button
              @click="rejectAll"
              class="flex-1 px-4 py-2 rounded border border-gray-700 hover:bg-gray-800 transition font-medium"
            >
              Reject All
            </button>
            <button
              @click="saveCustom"
              class="flex-1 px-4 py-2 rounded bg-brand-600 hover:bg-brand-700 transition font-medium"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Cookie Settings Toggle Button (Footer) -->
  <button
    v-if="store.bannerDismissed"
    @click="showSettings = true"
    class="fixed bottom-4 right-4 z-40 p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-white shadow-lg transition-all hover:scale-110 group"
    title="Cookie Settings"
  >
    <Icon name="heroicons:cog-6-tooth" class="w-5 h-5" />
    <span class="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
      Cookie Settings
    </span>
  </button>

  <!-- Hidden Settings Modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="showSettings && store.bannerDismissed"
        class="fixed inset-0 bg-black/50 z-40"
        @click="showSettings = false"
      />
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useCookieConsentStore } from '~/stores/cookieConsent'

const store = useCookieConsentStore()
const showSettings = ref(false)
const preferences = reactive({
  analytics: false,
  marketing: false
})

onMounted(() => {
  // Load consent on component mount
  store.loadConsent()
  preferences.analytics = store.preferences.analytics
  preferences.marketing = store.preferences.marketing
})

const acceptAll = () => {
  store.acceptAll()
}

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
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
}

.slide-up-leave-to {
  transform: translateY(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
