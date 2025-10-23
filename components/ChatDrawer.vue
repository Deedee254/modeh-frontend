<template>
  <div>
  <div v-if="isOpen" class="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" @click="close"></div>
    <div role="dialog" aria-modal="true" aria-labelledby="chat-drawer-title"
      class="fixed top-0 right-0 z-50 h-full w-full sm:w-96 bg-background shadow-xl transition-transform duration-300 ease-in-out"
      :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <div class="flex items-center justify-between p-4 border-b">
        <h2 class="text-lg font-semibold">Recent Messages</h2>
        <div class="flex items-center gap-2">
          <button @click="goToChat" class="inline-flex items-center duration-300 justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input text-primary bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
            View All
          </button>
          <button @click="close" class="inline-flex items-center duration-300 justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground size-10" aria-label="Close messages">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x h-5 w-5" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
          </button>
        </div>
      </div>
      <div class="h-[calc(100vh-64px)] overflow-y-auto bg-muted/20 p-2">
        <!-- Loading State -->
        <div v-if="loading" class="space-y-4">
          <div v-for="i in 5" :key="i" class="flex items-start gap-3 p-3 animate-pulse">
            <div class="rounded-full bg-muted w-12 h-12"></div>
            <div class="flex-1 space-y-2">
              <div class="flex items-center justify-between">
                <div class="h-4 bg-muted rounded w-24"></div>
                <div class="h-3 bg-muted rounded w-12"></div>
              </div>
              <div class="h-3 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!chats.length" class="p-4 text-center text-muted-foreground">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle h-8 w-8 text-muted-foreground/50"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          </div>
          <p>No messages yet</p>
        </div>

        <!-- Chat List -->
        <div v-else>
          <div
            v-for="chat in chats"
            :key="chat.id"
            @click="openConversation(chat)"
            class="flex items-start gap-3 p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
          >
            <div class="relative">
              <span class="size-10">
                <img class="size-10 rounded-full object-cover object-center" :alt="chat.name" :src="chat.avatar" />
              </span>
              <span v-if="((chat.unread_count ?? chat.unread) || 0) > 0" class="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary border-2 border-background"></span>
            </div>
            <div class="flex-1 space-y-1 overflow-hidden">
              <div class="flex items-center justify-between">
                <p class="font-medium" :class="((chat.unread_count ?? chat.unread) || 0) > 0 ? 'text-foreground' : 'text-muted-foreground'">{{ chat.name }}</p>
                <span class="text-xs text-muted-foreground">{{ chat.time }}</span>
              </div>
              <p class="text-sm truncate" :class="((chat.unread_count ?? chat.unread) || 0) > 0 ? 'text-foreground' : 'text-muted-foreground'">{{ chat.message }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserRole } from '~/composables/useUserRole'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:isOpen'])

const router = useRouter()
const { isquizee } = useUserRole()
const loading = ref(false)
const chats = ref([])

function close() {
  emit('update:isOpen', false)
}

function goToChat() {
  close()
  router.push(isquizee.value ? '/quizee/chat' : '/quiz-master/chat')
}

function openConversation(chat) {
  close()
  const basePath = isquizee.value ? '/quizee/chat' : '/quiz-master/chat'
  router.push({
    path: basePath,
    query: {
      user_id: chat.id,
      type: chat.type || 'direct'
    }
  })
}

async function fetchRecentChats() {
  loading.value = true
  try {
    const config = useRuntimeConfig()
    const res = await fetch(config.public.apiBase + '/api/chat/threads?limit=5', { credentials: 'include' })
    if (res.ok) {
      const json = await res.json()
      chats.value = (json.conversations || []).map(conv => ({
        id: conv.other_user_id || conv.otherId || conv.id,
        type: 'direct',
        name: conv.other_name || conv.otherName || conv.name || 'User',
        message: conv.last_message || conv.last_preview || 'No messages',
        time: formatTimeAgo(conv.last_at || conv.updated_at),
        unread: (conv.unread_count ?? conv.unread) > 0,
        avatar: conv.avatar_url || `/logo/avatar-placeholder.png`
      })).slice(0, 5)
    }
  } catch (e) {
    console.error('Error fetching recent chats:', e)
  } finally {
    loading.value = false
  }
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return 'just now'
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago'
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago'
  return date.toLocaleDateString()
}

watch(() => props.isOpen, async (open) => {
  if (open) {
    await fetchRecentChats()
  }
})
</script>