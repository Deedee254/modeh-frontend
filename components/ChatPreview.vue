<template>
  <div class="p-4 border rounded bg-white">
    <h3 class="font-medium mb-2">Messages</h3>
    <div v-if="loading" class="text-sm text-gray-500">Loading...</div>
    <div v-else>
      <div v-if="thread" class="flex items-center justify-between">
        <div>
          <div class="font-semibold">{{ thread.other_name || ('User ' + thread.other_user_id) }}</div>
          <div class="text-sm text-gray-500 truncate">{{ thread.last_preview || 'No messages yet' }}</div>
        </div>
        <div class="text-xs text-gray-400">
          <span v-if="thread.unread_count && thread.unread_count>0" class="bg-red-500 text-white px-2 py-0.5 rounded text-xs">{{ thread.unread_count }}</span>
        </div>
      </div>
      <div v-else class="text-sm text-gray-500">No recent conversations</div>
    </div>
    <NuxtLink to="/chat" class="mt-3 inline-block text-sm text-indigo-600">Open chat</NuxtLink>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const thread = ref(null)
const loading = ref(true)
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

async function load() {
  loading.value = true
  try {
    const res = await fetch(apiBase + '/api/chat/threads', { credentials: 'include' })
    if (res.ok) {
      const json = await res.json()
      thread.value = (json.conversations && json.conversations[0]) || null
    }
  } catch (e) {}
  loading.value = false
}

onMounted(load)
</script>
