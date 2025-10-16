<template>
  <div class="bg-white border-b shadow-sm relative" :class="{ 'z-50': mobileNavOpen || sidebarMobileOpen }">
    <div class="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-0 sm:gap-2">
      <div class="flex items-center gap-0 sm:gap-2 w-full">
        <!-- Bars / hamburger: on desktop open sidebar, on mobile open the topbar mobile menu -->
        <button class="inline-flex p-1 rounded-md text-gray-500 hover:bg-gray-100" @click="onBarsClick" aria-label="Open menu">
          <Bars3Icon class="w-5 h-5" />
        </button>

        <!-- Logo -->
        <NuxtLink :to="isquizee ? '/quizee/dashboard' : '/quiz-master/dashboard'" class="flex items-center">
          <img src="/logo/modeh-logo.png" alt="Modeh" class="h-6 sm:h-8 w-auto" />
        </NuxtLink>

  <!-- Navigation (hidden on mobile) -->
  <nav class="hidden md:flex items-center gap-2 sm:gap-3 ml-1 sm:ml-6">
          <template v-if="isquizee">
            <NuxtLink to="/grades" class="text-sm text-gray-600 hover:text-gray-900">Grades</NuxtLink>
            <NuxtLink to="/quizee/quizzes" class="text-sm text-gray-600 hover:text-gray-900">Quizzes</NuxtLink>
            <NuxtLink to="/quizee/battles" class="text-sm text-gray-600 hover:text-gray-900">Battles <span v-if="onlineCount>0" class="ml-2 text-xs text-gray-500">({{ onlineCount }})</span></NuxtLink>
            <NuxtLink to="/quiz-masters" class="text-sm text-gray-600 hover:text-gray-900">quiz-masters</NuxtLink>
          </template>
          <template v-else>
            <NuxtLink to="/grades" class="text-sm text-gray-600 hover:text-gray-900">Grades</NuxtLink>
            <NuxtLink to="/quiz-master/quizzes" class="text-sm text-gray-600 hover:text-gray-900">Quizzes</NuxtLink>
            <NuxtLink to="/quiz-master/quizees" class="text-sm text-gray-600 hover:text-gray-900">quizees</NuxtLink>
            <NuxtLink to="/quiz-master/analytics" class="text-sm text-gray-600 hover:text-gray-900">Analytics</NuxtLink>
          </template>
        </nav>
      </div>

  <div class="flex items-center gap-0 sm:gap-3">
        <!-- Notifications (icon-only) -->
        <NotificationsDropdown @update:unread="(v) => { unreadCount.value = v }" />

        <!-- Points (quizee only) -->
        <template v-if="isquizee">
          <button class="relative p-2 rounded-full text-gray-500 hover:bg-gray-100" title="Points" aria-label="Points">
            <svg class="w-5 h-5 text-yellow-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 5.88L21 9.24l-4.5 4.38L17.8 21 12 17.77 6.2 21l1.3-7.38L3 9.24l6.1-1.36L12 2z"/></svg>
          </button>
        </template>
        <!-- Wallet (quiz-master only) -->
        <template v-else>
          <NuxtLink to="/quiz-master/wallet" class="relative p-2 rounded-full text-gray-500 hover:bg-gray-100" title="Wallet" aria-label="Wallet">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" /><path stroke-linecap="round" stroke-linejoin="round" d="M16 3v4M8 3v4" /></svg>
          </NuxtLink>
        </template>

        <!-- Chat button (smaller on mobile) -->
        <button @click="goToChat" class="p-1.5 sm:p-2 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Chat">
          <ChatBubbleOvalLeftEllipsisIcon class="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <client-only>
          <div id="topbar-user-menu" class="relative">
            <template v-if="auth.user && auth.user.id">
              <ActionMenu>
                <template #trigger>
                  <button class="flex items-center p-0.5 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="User menu">
                    <img :src="userAvatar" class="w-6 h-6 sm:w-8 sm:h-8 rounded-full" alt="User avatar" />
                  </button>
                </template>

                <template #items="{ close }">
                  <NuxtLink :to="isquizee ? '/quizee/dashboard' : '/quiz-master/dashboard'" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</NuxtLink>
                  <NuxtLink :to="isquizee ? '/quizee/profile' : '/quiz-master/profile'" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</NuxtLink>
                  <NuxtLink :to="isquizee ? '/quizee/settings' : '/quiz-master/settings'" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</NuxtLink>
                  <div class="px-4 py-2"><ThemeToggle /></div>
                  <div class="border-t border-gray-200"></div>
                  <button @click="() => { onLogout(); close && close() }" class="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</button>
                </template>
              </ActionMenu>
            </template>

            <template v-else>
              <div class="flex items-center gap-2">
                <NuxtLink to="/login" class="text-sm text-gray-700 hover:text-gray-900">Sign in</NuxtLink>
                <NuxtLink to="/register" class="text-sm text-indigo-600 hover:text-indigo-700">Register</NuxtLink>
                <ThemeToggle />
              </div>
            </template>
          </div>
        </client-only>
      </div>
    </div>

    <!-- Mobile topbar menu (opened by hamburger on small screens) -->
    <div v-if="mobileNavOpen" class="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 sm:hidden" role="dialog" aria-modal="true">
      <div class="absolute top-0 left-0 right-0 bg-white p-4">
        <div class="flex items-center justify-between">
          <NuxtLink :to="isquizee ? '/quizee/dashboard' : '/quiz-master/dashboard'" class="flex items-center">
            <img src="/logo/modeh-logo.png" alt="Modeh" class="h-6 w-auto" />
          </NuxtLink>
          <button @click="() => { mobileNavOpen = false }" class="p-2 rounded-md text-gray-500 hover:bg-gray-100" aria-label="Close menu">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
          </button>
        </div>

        <nav class="mt-3 flex flex-col gap-2">
          <template v-if="isquizee">
            <NuxtLink @click="mobileNavOpen = false" to="/grades" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Grades</NuxtLink>
            <NuxtLink @click="mobileNavOpen = false" to="/quizee/quizzes" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Quizzes</NuxtLink>
            <NuxtLink @click="mobileNavOpen = false" to="/quizee/battles" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Battles</NuxtLink>
            <NuxtLink @click="mobileNavOpen = false" to="/quiz-masters" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">quiz-masters</NuxtLink>
          </template>
          <template v-else>
            <NuxtLink @click="mobileNavOpen = false" to="/grades" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Grades</NuxtLink>
            <NuxtLink @click="mobileNavOpen = false" to="/quiz-master/quizzes" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Quizzes</NuxtLink>
            <NuxtLink @click="mobileNavOpen = false" to="/quiz-master/quizees" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">quizees</NuxtLink>
            <NuxtLink @click="mobileNavOpen = false" to="/quiz-master/analytics" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Analytics</NuxtLink>
          </template>

          <div class="border-t border-gray-100 my-2" />

          <!-- Mobile overlay only contains navigation; profile/settings/sign out available from the avatar ActionMenu -->
          <div v-if="!auth.user || !auth.user.id" class="flex flex-col gap-2">
            <NuxtLink @click="mobileNavOpen = false" to="/login" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Sign in</NuxtLink>
            <NuxtLink @click="mobileNavOpen = false" to="/register" class="block px-3 py-2 text-sm text-indigo-600 hover:bg-gray-50 rounded">Register</NuxtLink>
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
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch, watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { BellIcon, MagnifyingGlassIcon, ChatBubbleOvalLeftEllipsisIcon, Bars3Icon } from '@heroicons/vue/24/outline'
import { useNotificationsStore } from '~/stores/notifications'
import { useAppTheme } from '~/composables/useAppTheme'
import { useUserRole } from '~/composables/useUserRole'
import ActionMenu from '~/components/ui/ActionMenu.vue'
import { useSidebar } from '~/composables/useSidebar'

const q = ref('')
const showSearch = ref(false)
const unreadCount = ref(0)
const onlineCount = ref(0)
let privateChannel = null
let presenceChannel = null

const notifications = useNotificationsStore()
const notificationsCount = computed(() => unreadCount.value || notifications.unreadCount || 0)
const auth = useAuthStore()
const router = useRouter()
const { isquizee } = useUserRole()

const searchInput = ref(null)
const mobileSearchInput = ref(null)
const { isDark, toggleTheme } = useAppTheme()
const route = useRoute()
const mobileNavOpen = ref(false)
const MOBILE_NAV_KEY = 'topbar:mobileNavOpen'

if (import.meta.client) {
  try {
    const stored = localStorage.getItem(MOBILE_NAV_KEY)
    if (stored !== null) {
      mobileNavOpen.value = stored === 'true'
    }
  } catch (e) {}
}

watch(mobileNavOpen, (value) => {
  if (!import.meta.client) return
  try {
    localStorage.setItem(MOBILE_NAV_KEY, String(value))
  } catch (e) {}
})

const searchPlaceholder = computed(() => isquizee.value ? 'Search quizzes, topics, subjects... (press / to focus)' : 'Search questions, topics, subjects... (press / to focus)')

const { sidebarMobileOpen, toggleSidebar } = useSidebar()

function onToggleSidebar() {
  // keep sidebar toggle for desktop; on mobile we open the topbar mobile nav instead
  if (import.meta.client && window.innerWidth < 640) {
    mobileNavOpen.value = true
    return
  }
  toggleSidebar()
}

function onBarsClick() {
  // On small screens, open the topbar mobile nav. On larger screens, open the sidebar.
  if (import.meta.client && window.innerWidth < 640) {
    mobileNavOpen.value = true
    return
  }
  toggleSidebar()
}

function onLogout() {
  if (auth.logout) {
    auth.logout()
  }
  mobileNavOpen.value = false
  router.push('/login')
}

function performSearch() {
  const term = (q.value || '').trim()
  if (!term) return
  const base = isquizee.value ? '/quizee/search' : '/quiz-master/search'
  router.push({ path: base, query: { q: term } })
}

function goToChat() {
  router.push(isquizee.value ? '/quizee/chat' : '/quiz-master/chat')
}

function onOpenNotifications() {
  notifications.openDrawer()
  notifications.fetchNotifications().catch(() => {})
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
      notifications.fetchNotifications() // refetch on new notification
    })

    presenceChannel = echo.join('presence-battle-arena')
    presenceChannel.here((users) => { onlineCount.value = users.length })
    presenceChannel.joining((user) => { onlineCount.value += 1 })
    presenceChannel.leaving((user) => { onlineCount.value = Math.max(0, onlineCount.value - 1) })
  } catch (e) {
    // echo not available or subscribe failed
  }
}

function onFocusSearch() {
  nextTick(() => {
    try {
      const width = import.meta.client ? window.innerWidth : 0
      if (width >= 640 && searchInput.value) {
        searchInput.value.focus()
        return
      }
      if (mobileSearchInput.value) mobileSearchInput.value.focus()
    } catch (e) {}
  })
}

function onKeyDown(e) {
  try {
    const activeTag = (document.activeElement && document.activeElement.tagName) || ''
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(activeTag)) {
      e.preventDefault()
      showSearch.value = true
      onFocusSearch()
      return
    }
  } catch (err) {}

  if (e.key === 'Escape') {
    showSearch.value = false
    try {
      if (searchInput.value) searchInput.value.blur()
    } catch (e) {}
    try {
      if (mobileSearchInput.value) mobileSearchInput.value.blur()
    } catch (e) {}
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  if (import.meta.client) {
    try {
      let userId = auth.user?.id
      if (userId) {
        bindEcho(userId)
      } else {
        auth.fetchUser().then(() => {
          if(auth.user?.id) bindEcho(auth.user.id)
        })
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

  watch(
    () => auth.user,
    (u) => {
      if (import.meta.client && u) {
        notifications.attachEchoListeners()
      } else {
        notifications.detachEchoListeners()
      }
    }
  )
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

watch(() => route.fullPath, () => { mobileNavOpen.value = false })

const showUserMenu = ref(false)
function toggleUserMenu() { showUserMenu.value = !showUserMenu.value }
function closeUserMenu() { showUserMenu.value = false }

onMounted(() => {
  if (import.meta.client) {
    const onDocClick = (e) => {
      const el = document.querySelector('#topbar-user-menu')
      if (!el) return
      if (!el.contains(e.target)) closeUserMenu()
    }
    document.addEventListener('click', onDocClick)
    onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
  }
})
</script>