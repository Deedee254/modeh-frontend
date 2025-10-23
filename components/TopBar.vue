<template>
  <div class="bg-white border-b shadow-sm sticky top-0 z-30" :class="{ 'z-50': ui.mobileNavOpen || ui.sidebarOpen }">
    <div class="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-0 sm:gap-2">
      <div class="flex items-center gap-1 sm:gap-2 w-full">
        <!-- Bars / hamburger: hidden on md+ (desktop). Visible only on small screens -->
        <button class="inline-flex p-1 rounded-md text-gray-500 hover:bg-gray-100 md:hidden" @click="onBarsClick" aria-label="Open menu">
          <Bars3Icon class="w-5 h-5" />
        </button>

        <!-- Logo -->
        <NuxtLink :to="isquizee ? '/quizee/dashboard' : '/quiz-master/dashboard'" class="flex items-center">
          <img src="/logo/modeh-logo.png" alt="Modeh" class="h-6 sm:h-8 w-auto" />
        </NuxtLink>

  <!-- Navigation (hidden on mobile) -->
  <nav class="hidden md:flex items-center gap-2 sm:gap-3 ml-1 sm:ml-6">
          <template v-if="isquizee && auth.user">
            <NuxtLink to="/grades" class="text-sm text-gray-600 hover:text-gray-900 router-link-exact-active:text-indigo-600 router-link-exact-active:font-semibold">Grades</NuxtLink>
            <NuxtLink to="/subjects" class="text-sm text-gray-600 hover:text-gray-900 router-link-exact-active:text-indigo-600 router-link-exact-active:font-semibold">Subjects</NuxtLink>
            <NuxtLink to="/levels" class="text-sm text-gray-600 hover:text-gray-900 router-link-exact-active:text-indigo-600 router-link-exact-active:font-semibold">Levels</NuxtLink>
            <NuxtLink to="/topics" class="text-sm text-gray-600 hover:text-gray-900 router-link-exact-active:text-indigo-600 router-link-exact-active:font-semibold">Topics</NuxtLink>
            <NuxtLink to="/quizee/quiz-masters" class="text-sm text-gray-600 hover:text-gray-900 router-link-exact-active:text-indigo-600 router-link-exact-active:font-semibold">Quiz Masters</NuxtLink>
          </template>
          <template v-else>
            <NuxtLink to="/grades" class="text-sm text-gray-600 hover:text-gray-900 router-link-exact-active:text-indigo-600 router-link-exact-active:font-semibold">Grades</NuxtLink>
            <NuxtLink to="/quiz-master/quizzes" class="text-sm text-gray-600 hover:text-gray-900 router-link-exact-active:text-indigo-600 router-link-exact-active:font-semibold">Quizzes</NuxtLink>
            <NuxtLink to="/quiz-master/quizees" class="text-sm text-gray-600 hover:text-gray-900 router-link-exact-active:text-indigo-600 router-link-exact-active:font-semibold">Quizees</NuxtLink>
            <NuxtLink to="/levels" class="text-sm text-gray-600 hover:text-gray-900 router-link-exact-active:text-indigo-600 router-link-exact-active:font-semibold">Levels</NuxtLink>
            <NuxtLink to="/quiz-master/analytics" class="text-sm text-gray-600 hover:text-gray-900 router-link-exact-active:text-indigo-600 router-link-exact-active:font-semibold">Analytics</NuxtLink>
          </template>
        </nav>
      </div>

      <div class="flex items-center gap-4">
        <!-- Chat Button -->
        <button @click="openChatDrawer" class="inline-flex items-center duration-300 justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input text-primary bg-background hover:bg-accent hover:text-accent-foreground size-10 relative" aria-label="Chat">
          <ChatBubbleOvalLeftEllipsisIcon class="h-5 w-5" />
          <span v-if="unreadChatCount > 0" class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            {{ unreadChatCount }}
          </span>
        </button>

        <!-- Notifications Dropdown -->
        <button @click="onOpenNotifications" class="inline-flex items-center duration-300 justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input text-primary bg-background hover:bg-accent hover:text-accent-foreground size-10 relative" aria-label="Notifications">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bell h-5 w-5" aria-hidden="true">
            <path d="M10.268 21a2 2 0 0 0 3.464 0"></path>
            <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"></path>
          </svg>
          <span v-if="notificationsCount > 0" class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            {{ notificationsCount }}
          </span>
        </button>
        <!-- Theme Toggle -->
        <ThemeToggle />

        <!-- Points & Level (quizee) or Wallet (quiz-master) -->
        <template v-if="auth.user">
          <template v-if="isquizee">
            <NuxtLink to="/quizee/points" class="flex items-center gap-4 max-sm:hidden">
              <div class="flex items-center gap-2 rounded-full border px-3 py-1.5">
                <span class="text-sm font-medium">{{ auth.user.points || 0 }}</span>
                <span class="text-yellow-500">⭐</span>
              </div>
              <UiLevelProgress />
            </NuxtLink>
          </template>
          <NuxtLink v-else to="/quiz-master/wallet" class="flex items-center gap-2 rounded-full border px-3 py-1.5 max-sm:hidden">
            <span class="text-sm font-medium">{{ walletAmount }}</span>
            <span class="text-green-500">💰</span>
          </NuxtLink>
        </template>

        <client-only>
          <div id="topbar-user-menu" class="relative">
            <template v-if="auth.user && auth.user.id">
              <ActionMenu>
                <template #trigger>
                  <button class="inline-flex items-center duration-300 justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground size-10 rounded-full" aria-label="User menu">
                    <span class="relative flex shrink-0 overflow-hidden rounded-full h-8 w-8">
                      <img class="aspect-square h-full w-full object-cover" :alt="userName" :src="userAvatar" />
                    </span>
                  </button>
                </template>

                <template #items="{ close }">
                  <div class="px-4 py-3">
                    <p class="text-sm text-gray-900 dark:text-white">Signed in as {{ userName }}</p>
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ auth.user.email }}</p>
                  </div>
                  <div class="border-t border-gray-200 dark:border-slate-700"></div>
                  <NuxtLink :to="isquizee ? '/quizee/dashboard' : '/quiz-master/dashboard'" class="block px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700">Dashboard</NuxtLink>
                  <NuxtLink :to="isquizee ? '/quizee/profile' : '/quiz-master/profile'" class="block px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700">Profile</NuxtLink>
                  <NuxtLink :to="isquizee ? '/quizee/settings' : '/quiz-master/settings'" class="block px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700">Settings</NuxtLink>
                  <div class="border-t border-gray-200 dark:border-slate-700"></div>
                  <button @click="() => { onLogout(); close && close() }" class="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700">Sign out</button>
                </template>
              </ActionMenu>
            </template>

            <template v-else>
              <div class="flex items-center gap-2">
                <NuxtLink to="/login" class="text-sm text-gray-700 hover:text-gray-900">Sign in</NuxtLink>
                <NuxtLink to="/register" class="hidden sm:block text-sm text-indigo-600 hover:text-indigo-700">Register</NuxtLink>
              </div>
            </template>
          </div>
        </client-only>
      </div>
    </div>

    <!-- Chat Drawer -->
    <ChatDrawer :is-open="isChatDrawerOpen" @close="closeChatDrawer" @view-all="goToChat" :loading="loadingRecentChats" :chats="recentChats" @open-conversation="openConversation" @update:is-open="isChatDrawerOpen = $event" />

    <!-- Notifications Drawer -->
    <NotificationDrawer />

    <!-- Mobile topbar menu (opened by hamburger on small screens) -->
    <div v-if="ui.mobileNavOpen" class="fixed inset-0 z-40 bg-gray-500 bg-opacity-75 sm:hidden" @click="ui.mobileNavOpen = false" role="dialog" aria-modal="true">
      <div class="absolute top-0 left-0 right-0 bg-white p-4">
        <div class="flex items-center justify-between">
          <NuxtLink :to="isquizee ? '/quizee/dashboard' : '/quiz-master/dashboard'" class="flex items-center">
            <img src="/logo/modeh-logo.png" alt="Modeh" class="h-6 w-auto" />
          </NuxtLink>
          <button @click="() => { ui.mobileNavOpen = false }" class="p-2 rounded-md text-gray-500 hover:bg-gray-100" aria-label="Close menu">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
          </button>
        </div>

        <nav class="mt-3 flex flex-col gap-2">
          <template v-if="isquizee && auth.user">
            <NuxtLink @click="ui.mobileNavOpen = false" to="/grades" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Grades</NuxtLink>
            <NuxtLink @click="ui.mobileNavOpen = false" to="/subjects" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Subjects</NuxtLink>
            <NuxtLink @click="ui.mobileNavOpen = false" to="/levels" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Levels</NuxtLink>
            <NuxtLink @click="ui.mobileNavOpen = false" to="/topics" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Topics</NuxtLink>
            <NuxtLink @click="ui.mobileNavOpen = false" to="/quizee/quiz-masters" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Quiz Masters</NuxtLink>
          </template>
          <template v-else>
            <NuxtLink @click="ui.mobileNavOpen = false" to="/grades" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Grades</NuxtLink>
            <NuxtLink @click="ui.mobileNavOpen = false" to="/quiz-master/quizzes" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Quizzes</NuxtLink>
            <NuxtLink @click="ui.mobileNavOpen = false" to="/quiz-master/quizees" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Quizees</NuxtLink>
            <NuxtLink @click="ui.mobileNavOpen = false" to="/levels" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Levels</NuxtLink>
            <NuxtLink @click="ui.mobileNavOpen = false" to="/quiz-master/analytics" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Analytics</NuxtLink>
          </template>

          <div class="border-t border-gray-100 my-2" />

          <!-- Mobile overlay only contains navigation; profile/settings/sign out available from the avatar ActionMenu -->
          <div v-if="!auth.user || !auth.user.id" class="flex flex-col gap-2">
            <NuxtLink @click="ui.mobileNavOpen = false" to="/login" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Sign in</NuxtLink>
            <NuxtLink @click="ui.mobileNavOpen = false" to="/register" class="block px-3 py-2 text-sm text-indigo-600 hover:bg-gray-50 rounded">Register</NuxtLink>
          </div>
        </nav>
      </div>
    </div>

    <!-- Mobile Search Overlay -->
    <div
      v-if="showSearch"
      class="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 sm:hidden"
      role="dialog"
      aria-modal="true"
    >
      <div class="bg-white p-4">
        <div class="relative">
          <label for="mobile-search" class="sr-only">Search</label>
          <input
            id="mobile-search"
            ref="mobileSearchInput"
            v-model="q"
            @keyup.enter="performSearch; showSearch = false"
            :placeholder="searchPlaceholder"
            class="border rounded-md pl-10 pr-4 py-2 w-full"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon class="w-5 h-5 text-gray-400" aria-hidden="true" />
          </div>
        </div>
        <button @click="() => { showSearch = false }" class="mt-2 text-sm text-gray-500">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { MagnifyingGlassIcon, ChatBubbleOvalLeftEllipsisIcon, Bars3Icon } from '@heroicons/vue/24/outline'
import { useNotificationsStore } from '~/stores/notifications'
import { useUserRole } from '~/composables/useUserRole'
import { useUiStore } from '~/stores/ui'
import ActionMenu from '~/components/ui/ActionMenu.vue'
import UiLevelProgress from '~/components/ui/LevelProgress.vue'
import NotificationDrawer from '~/components/NotificationDrawer.vue'
import ChatDrawer from '~/components/ChatDrawer.vue'

// Standard runtime config reference
const config = useRuntimeConfig()

const q = ref('')
const showSearch = ref(false)
const isChatDrawerOpen = ref(false)
const recentChats = ref([])
const loadingRecentChats = ref(false)
const unreadChatCount = ref(0)
const onlineCount = ref(0)
let privateChannel = null
let presenceChannel = null

const notifications = useNotificationsStore()
const notificationsCount = computed(() => unreadChatCount.value || notifications.unreadCount || 0)
const auth = useAuthStore()
const router = useRouter()
const { isquizee } = useUserRole()

const searchInput = ref(null)
const mobileSearchInput = ref(null)
const ui = useUiStore()
const route = useRoute()

const searchPlaceholder = computed(() => isquizee.value ? 'Search quizzes, topics, subjects... (press / to focus)' : 'Search questions, topics, subjects... (press / to focus)')

// Toggle sidebar / mobile bars
function onBarsClick() {
  if (import.meta.client) {
    if (window.innerWidth < 768) {
      ui.mobileNavOpen = true
    } else {
      try { window.dispatchEvent(new Event('toggle-sidebar')) } catch (e) {}
    }
  }
}

function onLogout() {
  if (auth.logout) auth.logout()
  ui.mobileNavOpen = false
  router.push('/login')
}

function performSearch() {
  closeAllDrawers()
  const term = (q.value || '').trim()
  if (!term) return
  const base = isquizee.value ? '/quizee/search' : '/quiz-master/search'
  router.push({ path: base, query: { q: term } })
}

function goToChat() {
  closeAllDrawers()
  router.push(isquizee.value ? '/quizee/chat' : '/quiz-master/chat')
}

async function updateUnreadCount() {
  try {
    const res = await fetch(config.public.apiBase + '/api/chat/threads', { credentials: 'include' })
    if (res.ok) {
      const json = await res.json()
      let count = 0
      const convs = json.conversations || []
      for (const c of convs) count += Number(c.unread_count || 0)
      const groups = json.groups || []
      for (const g of groups) count += Number(g.unread_count || 0)
      unreadChatCount.value = count
    }
  } catch (e) {
    // non-fatal
    console.error('Error fetching unread count:', e)
  }
}

async function openChatDrawer() {
  await updateUnreadCount()
  isChatDrawerOpen.value = true
  await nextTick()
  try {
    const width = import.meta.client ? window.innerWidth : 0
    if (width >= 640 && searchInput.value) {
      searchInput.value.focus()
      return
    }
    if (mobileSearchInput.value) mobileSearchInput.value.focus()
  } catch (e) {}
}

function closeChatDrawer() {
  isChatDrawerOpen.value = false
}

function onOpenNotifications() {
  notifications.openDrawer()
}

function closeAllDrawers() {
  isChatDrawerOpen.value = false
  notifications.closeDrawer()
  ui.mobileNavOpen = false
}

function onKeyDown(e) {
  // slash to focus search
  if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
    e.preventDefault()
    showSearch.value = true
    nextTick(() => { if (mobileSearchInput.value) mobileSearchInput.value.focus(); else if (searchInput.value) searchInput.value.focus() })
    return
  }
  if (e.key === 'Escape') {
    showSearch.value = false
    try { if (searchInput.value) searchInput.value.blur() } catch (err) {}
    try { if (mobileSearchInput.value) mobileSearchInput.value.blur() } catch (err) {}
  }
}

function bindEcho(userId) {
  let echo = null
  if (process.client) {
    try { echo = window.Echo || null } catch (e) { echo = null }
  }
  if (!echo) return
  try {
    privateChannel = echo.private(`users.${userId}`)
    privateChannel.listen('NotificationSent', (payload) => {
      // increment notification count and refetch notifications
      notifications.fetchNotifications()
    })

    presenceChannel = echo.join('presence-battle-arena')
    presenceChannel.here((users) => { onlineCount.value = users.length })
    presenceChannel.joining((user) => { onlineCount.value += 1 })
    presenceChannel.leaving((user) => { onlineCount.value = Math.max(0, onlineCount.value - 1) })
  } catch (e) {
    // ignore
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  // initial unread count
  updateUnreadCount()

  if (import.meta.client) {
    try {
      let userId = auth.user?.id
      if (userId) {
        bindEcho(userId)
      } else {
        auth.fetchUser().then(() => { if (auth.user?.id) bindEcho(auth.user.id) })
      }
      if (auth.user) notifications.attachEchoListeners()
    } catch (e) {}
  }

  watchEffect(() => {
    if (showSearch.value) {
      nextTick(() => {
        if (mobileSearchInput.value) mobileSearchInput.value.focus()
      })
    }
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  notifications.detachEchoListeners()
  try { if (privateChannel && privateChannel.unsubscribe) privateChannel.unsubscribe() } catch (e) {}
  try { if (presenceChannel && presenceChannel.leave) presenceChannel.leave() } catch (e) {}
})

const userName = computed(() => auth.user?.name || 'User')
const userAvatar = computed(() => auth.user?.avatar_url || '/logo/avatar-placeholder.png')
const walletAmount = computed(() => (auth.user?.wallet ? `$${auth.user.wallet}` : '$0'))

</script>