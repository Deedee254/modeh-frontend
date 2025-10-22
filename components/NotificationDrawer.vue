<template>
  <div>
    <div v-if="store.drawerOpen" class="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" @click="store.closeDrawer"></div>
    <div
      class="fixed top-0 right-0 z-50 h-full w-full sm:w-96 bg-background shadow-xl transition-transform duration-300 ease-in-out"
  :class="store.drawerOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <div class="flex items-center justify-between p-4 border-b">
        <h2 class="text-lg font-semibold">Notifications</h2>
        <div class="flex items-center gap-2">
          <button @click="store.markAllAsRead" :disabled="store.unreadCount === 0" class="duration-300 justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input text-primary bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check h-4 w-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>
            <span>Mark all read</span>
          </button>
          <button @click="store.closeDrawer" class="inline-flex items-center duration-300 justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground size-10" aria-label="Close notifications">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x h-5 w-5" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
          </button>
        </div>
      </div>
      <div class="h-[calc(100vh-64px)] overflow-y-auto bg-muted/20">
        <!-- Loading State -->
        <div v-if="loading" class="p-2 space-y-4">
          <div v-for="i in 5" :key="i" class="flex items-start gap-3 p-3 animate-pulse">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted"></div>
            <div class="flex-1 space-y-2">
              <div class="flex items-center justify-between">
                <div class="h-4 bg-muted rounded w-32"></div>
                <div class="h-3 bg-muted rounded w-16"></div>
              </div>
              <div class="h-3 bg-muted rounded w-full"></div>
              <div class="h-3 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </div>

  <!-- Empty State -->
  <div v-else-if="(store.items || []).length === 0" class="p-4 text-center text-muted-foreground">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bell h-8 w-8 text-muted-foreground/50"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
          </div>
          <p>No notifications yet</p>
        </div>

        <!-- Notification List -->
        <div v-else class="p-2">
          <!-- New Notifications -->
          <template v-if="newItems.length">
            <div class="px-3 py-2">
              <h3 class="text-sm font-medium text-muted-foreground">New</h3>
            </div>
            <div class="space-y-3">
              <div v-for="item in newItems" :key="item.id" @click="store.onNotificationClick(item)" class="flex items-start gap-3 p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors border-l-2 border-primary">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted" v-html="item.icon"></div>
                <div class="flex-1 space-y-1 overflow-hidden">
                  <div class="flex items-center justify-between">
                    <p class="font-medium">{{ item.title }}</p>
                    <div class="inline-flex items-center rounded-full border px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs font-normal">{{ item.time_ago }}</div>
                  </div>
                  <p class="text-sm text-muted-foreground">{{ item.message }}</p>
                </div>
              </div>
            </div>
          </template>

          <!-- Earlier Notifications -->
          <template v-if="earlierItems.length">
            <div class="px-3 py-2 mt-2">
              <h3 class="text-sm font-medium text-muted-foreground">Earlier</h3>
            </div>
            <div class="space-y-3">
              <div v-for="item in earlierItems" :key="item.id" @click="store.onNotificationClick(item)" class="flex items-start gap-3 p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors opacity-70">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted" v-html="item.icon"></div>
                <div class="flex-1 space-y-1 overflow-hidden">
                  <div class="flex items-center justify-between">
                    <p class="font-medium">{{ item.title }}</p>
                    <div class="inline-flex items-center rounded-full border px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs font-normal">{{ item.time_ago }}</div>
                  </div>
                  <p class="text-sm text-muted-foreground">{{ item.message }}</p>
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

const newItems = computed(() => (store.items || []).filter(i => !i.read))
const earlierItems = computed(() => (store.items || []).filter(i => i.read))

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
