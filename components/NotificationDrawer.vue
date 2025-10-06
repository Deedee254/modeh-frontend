<template>
  <div>
    <div v-if="store.drawerOpen" class="fixed inset-0 z-40">
      <div class="fixed inset-0 bg-black opacity-40" @click="store.closeDrawer"></div>
      <aside class="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-lg p-4 overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Notifications</h2>
          <button @click="store.closeDrawer" class="text-gray-500 hover:text-gray-700">Close</button>
        </div>

        <div v-if="loading" class="text-gray-500">Loading...</div>
        <ul v-else class="space-y-3">
          <li v-for="n in store.items" :key="n.id" class="p-3 border rounded">
            <div class="flex items-start justify-between">
              <div>
                <div class="font-medium">{{ n.title }}</div>
                <div class="text-sm text-gray-600">{{ n.body }}</div>
                <div class="text-xs text-gray-400 mt-1">{{ formatDate(n.created_at) }}</div>
              </div>
              <div class="ml-3 text-right">
                <button v-if="!n.read" @click="mark(n.id)" class="text-xs text-indigo-600">Mark read</button>
                <div v-else class="text-xs text-gray-400">Read</div>
              </div>
            </div>
          </li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useNotificationsStore } from '~/stores/notifications'

const store = useNotificationsStore()
const loading = ref(false)

watch(() => store.drawerOpen, async (open) => {
  if (open) {
    loading.value = true
    // ensure we receive realtime notifications for this user/channel
    try { store.attachEchoListeners() } catch (e) {}
    await store.fetchNotifications()
    loading.value = false
  } else {
    try { store.detachEchoListeners() } catch (e) {}
  }
})

function mark(id) {
  store.markRead(id)
}

function formatDate(s) {
  try { return new Date(s).toLocaleString() } catch (e) { return s }
}
</script>

<style scoped>
/* small drawer styles can be tuned by Tailwind in template */
</style>
