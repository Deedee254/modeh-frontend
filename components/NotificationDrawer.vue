<template>
  <div>
    <div v-if="store.drawerOpen" class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" @click="store.closeDrawer"></div>
    <div
      class="fixed top-0 right-0 z-50 h-full w-full sm:w-96 bg-white dark:bg-slate-900 shadow-xl transition-transform duration-300 ease-in-out"
  :class="store.drawerOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Notifications</h2>
        <div class="flex items-center gap-2">
          <button @click="store.markAllAsRead" :disabled="store.unreadCount === 0" class="duration-300 justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 h-9 rounded-md px-3 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check h-4 w-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>
            <span>Mark all read</span>
          </button>
          <button @click="store.closeDrawer" class="inline-flex items-center duration-300 justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800 size-10 text-slate-600 dark:text-slate-400" aria-label="Close notifications">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x h-5 w-5" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
          </button>
        </div>
      </div>
      <div class="h-[calc(100vh-64px)] overflow-y-auto bg-white dark:bg-slate-900">
        <!-- Loading State -->
        <div v-if="loading" class="p-2 space-y-4">
          <div v-for="i in 5" :key="i" class="flex items-start gap-3 p-3 animate-pulse">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-300 dark:bg-slate-600"></div>
            <div class="flex-1 space-y-2">
              <div class="flex items-center justify-between">
                <div class="h-4 bg-slate-300 dark:bg-slate-600 rounded w-32"></div>
                <div class="h-3 bg-slate-300 dark:bg-slate-600 rounded w-16"></div>
              </div>
              <div class="h-3 bg-slate-300 dark:bg-slate-600 rounded w-full"></div>
              <div class="h-3 bg-slate-300 dark:bg-slate-600 rounded w-2/3"></div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="(store.items || []).length === 0" class="p-4 text-center text-slate-600 dark:text-slate-300">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bell h-8 w-8 text-slate-600 dark:text-slate-400"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
          </div>
          <p class="text-slate-700 dark:text-slate-200">No notifications yet</p>
        </div>

        <!-- Notification List -->
        <div v-else class="p-2">
          <!-- New Notifications -->
          <template v-if="newItems.length">
            <div class="px-3 py-2">
              <h3 class="text-sm font-medium text-slate-600 dark:text-slate-400">New</h3>
            </div>
            <div class="space-y-3">
              <div v-for="item in newItems" :key="item.id" @click="store.onNotificationClick(item)" class="flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors border-l-2 border-brand-600">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" v-html="item.icon"></div>
                <div class="flex-1 space-y-1 overflow-hidden">
                  <div class="flex items-center justify-between">
                    <p class="font-semibold text-slate-900 dark:text-white">{{ item.title }}</p>
                    <div class="inline-flex items-center rounded-full border border-slate-300 dark:border-slate-600 px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-slate-700 dark:text-slate-300 text-xs font-medium bg-slate-100 dark:bg-slate-800">{{ item.time_ago }}</div>
                  </div>
                  <p class="text-sm text-slate-700 dark:text-slate-300">{{ item.message }}</p>
                </div>
              </div>
            </div>
          </template>

          <!-- Earlier Notifications -->
          <template v-if="earlierItems.length">
            <div class="px-3 py-2 mt-2">
              <h3 class="text-sm font-medium text-slate-600 dark:text-slate-400">Earlier</h3>
            </div>
            <div class="space-y-3">
              <div v-for="item in earlierItems" :key="item.id" @click="store.onNotificationClick(item)" class="flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors opacity-70">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" v-html="item.icon"></div>
                <div class="flex-1 space-y-1 overflow-hidden">
                  <div class="flex items-center justify-between">
                    <p class="font-semibold text-slate-900 dark:text-white">{{ item.title }}</p>
                    <div class="inline-flex items-center rounded-full border border-slate-300 dark:border-slate-600 px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-slate-700 dark:text-slate-300 text-xs font-medium bg-slate-100 dark:bg-slate-800">{{ item.time_ago }}</div>
                  </div>
                  <p class="text-sm text-slate-700 dark:text-slate-300">{{ item.message }}</p>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useNotificationsStore } from '~/stores/notifications'

const store = useNotificationsStore()
const loading = ref(false)

// Exclude chat/message notifications from the drawer since chat has its own drawer.
const nonChatItems = computed(() => (store.items || []).filter(i => (i.type || '').toString().toLowerCase() !== 'message'))
const newItems = computed(() => nonChatItems.value.filter(i => !i.read))
const earlierItems = computed(() => nonChatItems.value.filter(i => i.read))

// Watch for drawer open/close
watch(() => store.drawerOpen, async (open) => {
  if (open) {
    loading.value = true
    await store.fetchNotifications()
    loading.value = false
  }
})

// Attach listeners when component mounts
onMounted(() => {
  store.attachEchoListeners()
})

// Clean up listeners when component unmounts
onUnmounted(() => {
  store.detachEchoListeners()
})

defineExpose({
  store // expose store to parent component if needed
})
</script>

<style scoped>
/* small drawer styles can be tuned by Tailwind in template */
</style>

