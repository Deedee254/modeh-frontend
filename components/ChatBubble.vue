<template>
  <div class="relative">
    <button @click="open = !open" class="fixed right-6 bottom-6 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center" title="Open Chat">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.18 0-2.312-.174-3.334-.5L3 20l1.5-4.5A7.966 7.966 0 014 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
    </button>

    <div v-if="open" class="fixed right-6 bottom-20 z-50 w-80 bg-white rounded-lg shadow-lg border overflow-hidden">
      <div class="p-3 border-b flex items-center justify-between">
        <div class="font-semibold">Chats</div>
        <button class="text-xs text-gray-500" @click="open = false">Close</button>
      </div>
      <div class="p-3">
        <div class="text-sm text-gray-600 mb-2">Recent chats</div>
        <div class="space-y-2">
          <template v-if="threads.length">
            <div v-for="t in threads" :key="t.other_user_id" class="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer" @click="openThread(t)">
              <div class="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                <img class="w-8 h-8" :src="t.avatar || avatarSrc" />
              </div>
              <div class="flex-1 text-sm">
                <div class="font-medium">{{ t.other_name || ('User ' + t.other_user_id) }}</div>
                <div class="text-xs text-gray-500">{{ t.last_message }}</div>
              </div>
              <div class="text-xs text-gray-400">{{ t.last_at ? new Date(t.last_at).toLocaleTimeString() : '' }}</div>
              <div v-if="t.unread_count" class="ml-2 bg-red-500 text-white text-xs rounded-full px-1">{{ t.unread_count }}</div>
            </div>
          </template>
          <div v-else class="p-2 text-center text-sm text-gray-500">No recent chats</div>
        </div>
      </div>
      <div class="p-3 border-t">
        <NuxtLink to="/student/chat" class="block text-center px-3 py-2 bg-blue-600 text-white rounded">Open full chat</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
const open = ref(false)
const threads = ref([])

const avatarSrc = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect fill='%23e5e7eb' width='100%' height='100%'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='24'>?</text></svg>"

let privateChannel = null

async function loadThreads() {
  try {
    const cfg = useRuntimeConfig()
    const res = await fetch(cfg.public.apiBase + '/api/chat/threads', { credentials: 'include' })
    if (res.ok) {
      const body = await res.json()
      threads.value = body.conversations || body.conversations || []
      // merge groups as well
      if (body.groups && body.groups.length) {
        threads.value = threads.value.concat(body.groups.map(g => ({ other_user_id: 'group-'+g.id, other_name: g.name ?? ('Group '+g.id), last_message: g.last_message, last_at: g.last_at, unread_count: g.unread_count })))
      }
    }
  } catch (e) {
    // ignore
  }
}

function openThread(t) {
  // navigate to full chat page with user_id or group_id
  if (typeof window !== 'undefined') {
    if (String(t.other_user_id).startsWith('group-')) {
      const gid = String(t.other_user_id).replace('group-', '')
      window.location.href = '/student/chat?group_id=' + gid
    } else {
      window.location.href = '/student/chat?user_id=' + t.other_user_id
    }
  }
}

function bindEcho() {
  const echo = (typeof window !== 'undefined' && window.Echo) || null
  if (!echo) return
  try {
  // prefer `users.{id}` private channel naming
  privateChannel = echo.private('users.' + (window.__authUserId || ''))
    privateChannel.listen('MessageSent', (payload) => {
      // payload.message contains created message; update threads list
      const msg = payload.message ?? payload
      const other = msg.sender_id === window.__authUserId ? msg.recipient_id : msg.sender_id
      const idx = threads.value.findIndex(t => String(t.other_user_id) === String(other))
      if (idx !== -1) {
        threads.value[idx].last_message = msg.content
        threads.value[idx].last_at = msg.created_at
        if (msg.sender_id !== window.__authUserId) threads.value[idx].unread_count = (threads.value[idx].unread_count || 0) + 1
      } else {
  threads.value.unshift({ other_user_id: other, other_name: msg.sender_name || ('User '+other), last_message: msg.content, last_at: msg.created_at, unread_count: msg.sender_id !== window.__authUserId ? 1 : 0 })
      }
    })
  } catch (e) {}
}

onMounted(() => {
  // load threads when component mounts
  loadThreads()
  bindEcho()
})

onBeforeUnmount(() => {
  try { if (privateChannel && privateChannel.unsubscribe) privateChannel.unsubscribe() } catch (e) {}
})
</script>

<style scoped>
/* small responsive tweak: hide the fixed bubble on very small screens if necessary */
</style>
