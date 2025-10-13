<template>
  <div class="relative">
    <button @click="open = !open" class="relative inline-flex items-center p-2 rounded hover:bg-gray-100">
      <span class="sr-only">Notifications</span>
      <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
      <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs px-1.5">{{ unreadCount }}</span>
    </button>

    <div v-if="open" class="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
      <div class="p-3 border-b">
        <div class="font-medium">Notifications</div>
        <div class="text-xs text-gray-500">Recent activity</div>
      </div>
      <div v-if="loading" class="p-4"><UiSkeleton :count="3" /></div>
      <div v-else>
        <div v-if="notifications.length === 0" class="p-4 text-sm text-gray-600">No notifications</div>
        <ul>
          <li v-for="n in notifications" :key="n.id" class="p-3 border-b hover:bg-gray-50 flex items-start gap-3">
            <div class="flex-1">
              <div class="text-sm font-medium">{{ n.title }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ n.message }}</div>
              <div class="text-xs text-gray-400 mt-1">{{ formatDate(n.created_at) }}</div>
            </div>
            <div class="flex items-center gap-2">
              <button v-if="!n.read" @click="markRead(n)" class="text-xs px-2 py-1 bg-indigo-600 text-white rounded">Mark read</button>
            </div>
          </li>
        </ul>
      </div>
      <div class="p-2 text-center text-xs text-gray-500 border-t">
        <NuxtLink to="/quizee/notifications" class="text-indigo-600">View all</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRuntimeConfig } from '#app'

const open = ref(false)
const loading = ref(false)
const notifications = ref([])
const unreadCount = ref(0)
const emit = defineEmits(['update:unread'])

const config = useRuntimeConfig()

function formatDate(s) {
  try { return new Date(s).toLocaleString() } catch { return s }
}

async function load() {
  loading.value = true
  try {
    const res = await fetch(config.public.apiBase + '/api/notifications?limit=20', { credentials: 'include' })
    if (res.ok) {
      const body = await res.json()
  notifications.value = body.notifications || body || []
  unreadCount.value = notifications.value.filter(n => !n.read).length
  emit('update:unread', unreadCount.value)
    } else {
      notifications.value = []
    }
  } catch (e) {
    notifications.value = []
  } finally {
    loading.value = false
  }
}

async function markRead(n) {
  try {
    const res = await fetch(config.public.apiBase + `/api/notifications/${n.id}/mark-read`, { method: 'POST', credentials: 'include' })
    if (res.ok) {
      n.read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
      emit('update:unread', unreadCount.value)
    }
  } catch (e) {
    // ignore
  }
}

// subscribe to real-time notification events via Echo when available (client-only)
onMounted(() => {
  try {
    const echo = (typeof window !== 'undefined' && window.Echo) || null
    if (!echo) return
    const ch = echo.private('users.' + (window.__authUserId || ''))
    ch.listen('NotificationSent', (payload) => {
      const n = payload.notification
      if (n) {
        notifications.value.unshift(n)
        unreadCount.value = Math.max(0, unreadCount.value + 1)
        emit('update:unread', unreadCount.value)
      }
    })
  } catch (e) { /* ignore */ }
})

// load when dropdown opens
watch(open, (v) => { if (v) load() })
</script>

<style scoped>
.w-80 { width: 20rem; }
</style>
