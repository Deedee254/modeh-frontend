<template>
  <div class="bg-white border-b shadow-sm">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <NuxtLink to="/quizee/dashboard" class="flex items-center gap-3">
          <div class="w-10 h-10 rounded bg-indigo-100 flex items-center justify-center overflow-hidden">
            <img :src="logoSrc" alt="logo" class="w-8 h-8 object-contain" />
          </div>
          <div>
            <div class="text-lg font-semibold">Dashboard</div>
            <div class="text-xs text-gray-500">quizee</div>
          </div>
        </NuxtLink>
        <nav class="hidden md:flex items-center gap-3 ml-6">
          <NuxtLink to="#" class="text-sm text-gray-600 hover:text-gray-900">Overview</NuxtLink>
          <NuxtLink to="/quizee/quizzes" class="text-sm text-gray-600 hover:text-gray-900">Quizzes</NuxtLink>
          <NuxtLink to="/quizee/battles" class="text-sm text-gray-600 hover:text-gray-900">Battles <span v-if="onlineCount>0" class="ml-2 text-xs text-gray-500">({{ onlineCount }})</span></NuxtLink>
          <NuxtLink to="/quiz-masters" class="text-sm text-gray-600 hover:text-gray-900">quiz-masters</NuxtLink>

        </nav>
        <button @click="onMobileToggle" class="md:hidden">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>
      </div>

      <div class="flex items-center gap-3">
        <NotificationsDropdown @update:unread="(v) => { unreadCount.value = v }" />

        <button class="relative p-2 rounded hover:bg-gray-100" title="Points">
          <svg class="w-5 h-5 text-yellow-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 5.88L21 9.24l-4.5 4.38L17.8 21 12 17.77 6.2 21l1.3-7.38L3 9.24l6.1-1.36L12 2z"/></svg>
          <span class="ml-2 text-sm font-medium text-gray-700">{{ points }}</span>
        </button>

        <!-- Chat icon to open quizee chat page -->
        <NuxtLink to="/quizee/chat" class="p-2 rounded-full text-gray-600 hover:bg-gray-100" aria-label="Chat">
          <ChatBubbleOvalLeftEllipsisIcon class="w-6 h-6" />
        </NuxtLink>

        <div class="ml-3 relative">
          <client-only>
            <div id="quizee-topbar-user-menu">
              <ActionMenu>
                <template #trigger>
                  <button class="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="User menu">
                    <div class="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                      <RuntimeImg :src="avatarSrc" imgClass="w-9 h-9 object-cover" wrapperClass="w-9 h-9 rounded-full overflow-hidden" />
                    </div>
                    <span class="text-sm text-gray-700">{{ displayName }}</span>
                  </button>
                </template>

                <template #items="{ close }">
                  <NuxtLink to="/quizee/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</NuxtLink>
                  <button @click="() => { onLogout(); close && close() }" class="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</button>
                </template>
              </ActionMenu>
            </div>
          </client-only>
        </div>

        <!-- floating chat bubble (client-only) -->
        <ClientOnly>
          <ChatBubble />
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, inject } from 'vue'
import ChatBubble from '~/components/ChatBubble.vue'
import NotificationsDropdown from '~/components/NotificationsDropdown.vue'
import RuntimeImg from '~/components/RuntimeImg.vue'
import ActionMenu from '~/components/ui/ActionMenu.vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/vue/24/outline'

// inline SVG fallback for avatar (keeps layout stable when assets missing)
const avatarSrc = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect fill='%23e5e7eb' width='100%' height='100%'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='24'>?</text></svg>"
const logoSrc = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect fill='%23eef2ff' width='100%' height='100%'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23638' font-size='18'>M</text></svg>"

const displayName = ref('quizee')
const points = ref(0)
const unreadCount = ref(0)
const onlineCount = ref(0)
const showMobileMenu = ref(false)
let privateChannel = null
let presenceChannel = null

function onMobileToggle() {
  // open the sidebar drawer if available, otherwise toggle local mobile menu
  if (process.client) {
    try {
      window.dispatchEvent(new CustomEvent('toggle-sidebar'))
      return
    } catch (e) {}
  }
  showMobileMenu.value = !showMobileMenu.value
}


function bindEcho(userId) {
  let echo = null
  // Only call inject inside setup or lifecycle
  if (process.client) {
    try {
      echo = window.Echo || null
    } catch (e) { echo = null }
  }
  if (!echo) return
  try {
    // align with backend naming: users.{id}
    privateChannel = echo.private(`users.${userId}`)
    privateChannel.listen('NotificationSent', (payload) => {
      unreadCount.value += 1
    })

    presenceChannel = echo.join('presence-battle-arena')
    presenceChannel.here((users) => { onlineCount.value = users.length })
    presenceChannel.joining((user) => { onlineCount.value += 1 })
    presenceChannel.leaving((user) => { onlineCount.value = Math.max(0, onlineCount.value - 1) })
  } catch (e) {
    // echo not available or subscribe failed
  }
}

onMounted(async () => {
  // try global user id first
  let userId = (typeof window !== 'undefined' && window.__authUserId) || null
  if (!userId) {
    try {
      const cfg = useRuntimeConfig()
  const res = await fetch(cfg.public.apiBase + '/api/me', { credentials: 'include' })
      if (res.ok) {
        const json = await res.json()
        userId = json.id
        displayName.value = json.name || displayName.value
        points.value = json.points || 0
      }
    } catch (e) { /* ignore */ }
  }

  if (userId) bindEcho(userId)
})

onBeforeUnmount(() => {
  try { if (privateChannel && privateChannel.unsubscribe) privateChannel.unsubscribe() } catch (e) {}
  try { if (presenceChannel && presenceChannel.leave) presenceChannel.leave() } catch (e) {}
})

// wire logout using auth store
const auth = useAuthStore()
const router = useRouter()
function onLogout() {
  if (auth.logout) auth.logout()
  router.push('/login')
}
</script>

<style scoped>
</style>
