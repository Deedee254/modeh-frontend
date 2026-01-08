<template>
  <div class="relative">
    <button @click="open = !open" class="relative inline-flex items-center p-2 rounded hover:bg-gray-100">
      <span class="sr-only">Notifications</span>
      <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
      <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs px-1.5">{{ unreadCount }}</span>
    </button>

    <div v-if="open" class="absolute right-0 mt-2 w-96 bg-white border rounded-lg shadow-lg z-50">
      <div class="p-4 border-b flex items-center justify-between">
        <div>
          <div class="font-semibold text-gray-900">Notifications</div>
          <div class="text-xs text-gray-500 mt-0.5">Recent activity</div>
        </div>
        <button v-if="notifications.length > 0" @click="markAllRead" class="text-xs px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 font-medium">
          ✓ Mark all read
        </button>
        <button @click="open = false" class="text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div v-if="loading" class="divide-y">
        <div v-for="i in 1" :key="i" class="p-4 flex gap-3">
          <div class="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-3 bg-gray-200 rounded w-3/4"></div>
            <div class="h-2 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
      
      <div v-else-if="notifications.length === 0" class="p-8 text-center">
        <svg class="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        <div class="text-sm text-gray-600">No notifications yet</div>
      </div>

      <div v-else class="flex flex-col h-full">
        <ul class="divide-y max-h-96 overflow-y-auto flex-1">
          <li 
            v-for="n in notifications" 
            :key="n.id" 
            class="p-4 hover:bg-blue-50 transition-colors cursor-pointer group"
            :class="{ 'bg-blue-50': !n.read }"
            @click="markRead(n)"
          >
            <div class="flex items-start gap-3">
              <div v-if="!n.read" class="w-2 h-2 bg-brand-600 rounded-full mt-2 flex-shrink-0"></div>
              <div v-else class="w-2 h-2 flex-shrink-0"></div>
              
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-gray-900">{{ n.title }}</div>
                <div class="text-sm text-gray-600 mt-1 line-clamp-2">{{ n.body || n.message }}</div>
                <div class="text-xs text-gray-500 mt-2">{{ formatDate(n.created_at) }}</div>
              </div>
            </div>
          </li>
        </ul>

        <div class="p-4 text-center border-t bg-gray-50">
          <NuxtLink to="/quizee/notifications" class="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
            View all notifications
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRuntimeConfig } from '#app'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'

const open = ref(false)
const loading = ref(false)
const notifications = ref([])
const unreadCount = ref(0)
const emit = defineEmits(['update:unread'])

const config = useRuntimeConfig()
const api = useApi()
const alert = useAppAlert()

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
    const res = await api.postJson(`/api/notifications/${n.id}/mark-read`, {})
    if (api.handleAuthStatus(res)) return
    if (res.ok) {
      n.read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
      emit('update:unread', unreadCount.value)
    } else {
      alert.push({ message: 'Could not mark notification as read', type: 'error' })
    }
  } catch (e) {
    alert.push({ message: 'Network error', type: 'error' })
  }
}

async function markAllRead() {
  const unread = notifications.value.filter(n => !n.read)
  if (unread.length === 0) return
  
  for (const n of unread) {
    await markRead(n)
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

