<template>
  <div class="flex items-center gap-2">
    <div class="flex items-center gap-2">
      <div 
        class="w-8 h-8 rounded-full flex items-center justify-center text-xl"
        :style="{ backgroundColor: levelData?.color_scheme + '20', color: levelData?.color_scheme }"
      >
        {{ levelData?.icon || '🎯' }}
      </div>
      <div class="hidden md:block">
        <p class="text-sm font-medium">{{ levelData?.name || 'Novice' }}</p>
        <div class="flex items-center gap-1">
          <div class="w-24 h-1.5 bg-gray-200 rounded-full">
            <div 
              class="h-full rounded-full transition-all duration-500"
              :style="{ 
                width: `${levelData?.progress || 0}%`,
                backgroundColor: levelData?.color_scheme 
              }"
            ></div>
          </div>
          <span class="text-xs text-gray-600">{{ levelData?.progress || 0 }}%</span>
        </div>
      </div>
    </div>
    
    <!-- Level Up Modal -->
    <TransitionRoot appear :show="isLevelUpModalOpen" as="template">
      <Dialog as="div" @close="closeLevelUpModal" class="relative z-50">
        <TransitionChild
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/50" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <Dialog.Panel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div class="text-center">
                  <div 
                    class="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-4"
                    :style="{ backgroundColor: newLevel?.color_scheme + '20', color: newLevel?.color_scheme }"
                  >
                    {{ newLevel?.icon }}
                  </div>
                  <Dialog.Title as="h3" class="text-2xl font-bold text-gray-900 mb-2">
                    Level Up! 🎉
                  </Dialog.Title>
                  <p class="text-lg text-gray-600 mb-4">
                    You've reached {{ newLevel?.name }}
                  </p>
                  <p class="text-sm text-gray-500 mb-6">
                    {{ newLevel?.description }}
                  </p>
                  <button
                    class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none"
                    @click="closeLevelUpModal"
                  >
                    Continue
                  </button>
                </div>
              </Dialog.Panel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import useApi from '~/composables/useApi'

const api = useApi()
const levelData = ref(null)
const previousLevel = ref(null)
const isLevelUpModalOpen = ref(false)
const newLevel = ref(null)

const fetchStats = async () => {
  try {
    const response = await api.get('/api/user/stats')
    // api.get returns a raw Response object; parse JSON safely
    let json = null
    try {
      json = response && response.ok ? await response.json() : null
    } catch (e) {
      json = null
    }
    // Store previous level for comparison
    previousLevel.value = levelData.value?.name
    levelData.value = json?.level || null
    
    // Check for level up
    if (previousLevel.value && levelData.value?.name !== previousLevel.value) {
      newLevel.value = levelData.value
      isLevelUpModalOpen.value = true
    }
  } catch (error) {
    console.error('Failed to fetch user stats:', error)
  }
}

const closeLevelUpModal = () => {
  isLevelUpModalOpen.value = false
}

// Fetch initially and then every 5 minutes
onMounted(() => {
  fetchStats()
  setInterval(fetchStats, 300000) // 5 minutes
})

// Listen for point updates through websockets or events
// Add your event listener here if you have real-time updates
</script>