<template>
  <div class="bg-white border-b shadow-sm relative" :class="{ 'z-50': mobileNavOpen || sidebarMobileOpen }">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <button
          class="p-2 rounded-md text-gray-500 hover:bg-gray-100 lg:hidden relative z-60"
          @click="onToggleSidebar"
        >
          <Bars3Icon class="w-6 h-6" />
        </button>

        <div class="hidden lg:block">
          <button class="p-2 rounded-md text-gray-500 hover:bg-gray-100" @click="onToggleSidebar">
            <Bars3Icon class="w-6 h-6" />
          </button>
        </div>

        <NuxtLink
          :to="isquizee ? '/quizee/dashboard' : '/quiz-master/dashboard'"
          class="flex items-center gap-3"
        >
          <img src="/logo/modeh-logo.png" alt="Modeh" class="h-8 w-auto" />
        </NuxtLink>

        <nav class="hidden md:flex items-center gap-3 ml-6">
          <template v-if="isquizee">
            <NuxtLink to="/grades" class="text-sm text-gray-600 hover:text-gray-900">Grades</NuxtLink>
            <NuxtLink to="/quizee/quizzes" class="text-sm text-gray-600 hover:text-gray-900">Quizzes</NuxtLink>
            <NuxtLink to="/quizee/battles" class="text-sm text-gray-600 hover:text-gray-900">Battles</NuxtLink>
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

      <div class="flex items-center gap-4">
        <div class="relative hidden sm:block">
          <label for="topbar-search" class="sr-only">Search</label>
          <div class="relative">
            <input
              id="topbar-search"
              ref="searchInput"
              v-model="q"
              @keyup.enter="performSearch"
              :placeholder="searchPlaceholder"
              class="border rounded-md pl-10 pr-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon class="w-5 h-5 text-gray-400" aria-hidden="true" />
            </div>
          </div>
        </div>

        <button class="p-2 rounded-full text-gray-500 hover:bg-gray-100 sm:hidden" @click="showSearch = true">
          <MagnifyingGlassIcon class="w-6 h-6" />
        </button>

        <!-- Wallet for quiz-masters -->
        <button v-if="!isquizee" class="relative p-2 rounded hover:bg-gray-100" title="Wallet">
          <svg class="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM3 6h18v12H3V6zm1 12h16v-2H4v2zm0-4h16V8H4v6z" />
          </svg>
          <span class="ml-2 text-sm font-medium text-gray-700">{{ walletAmount }}</span>
        </button>

        <button
          @click="onOpenNotifications"
          class="relative p-2 rounded-full text-gray-500 hover:bg-gray-100"
          :aria-label="`Notifications (${notificationsCount})`"
        >
          <BellIcon class="w-6 h-6" aria-hidden="true" />
          <span
            v-if="notificationsCount > 0"
            class="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-white bg-red-600 rounded-full"
            aria-hidden="true"
          >
            {{ notificationsCount }}
          </span>
        </button>
        <button @click="goToChat" class="p-2 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Chat">
          <ChatBubbleOvalLeftEllipsisIcon class="w-6 h-6" />
        </button>

        <!-- Theme toggle -->
        <button @click="toggleTheme" class="p-2 rounded-full text-gray-500 hover:bg-gray-100" :aria-label="`Toggle theme`">
          <template v-if="isDark">
            <SunIcon class="w-6 h-6" />
          </template>
          <template v-else>
            <MoonIcon class="w-6 h-6" />
          </template>
        </button>

        <client-only>
          <div id="topbar-user-menu" class="relative">
            <ActionMenu>
              <template #trigger>
                <button
                  class="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="User menu"
                >
                  <img :src="userAvatar" class="w-8 h-8 rounded-full" alt="User avatar" />
                  <div class="text-sm hidden md:block">{{ userName }}</div>
                  <ChevronDownIcon class="w-5 h-5 text-gray-500 hidden md:block" aria-hidden="true" />
                </button>
              </template>

              <template #items="{ close }">
                <NuxtLink
                  :to="isquizee ? '/quizee/profile' : '/quiz-master/profile'"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Your Profile
                </NuxtLink>
                <button
                  @click="() => { onLogout(); close && close() }"
                  class="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </template>
            </ActionMenu>
          </div>
        </client-only>
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
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch,
  watchEffect
} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import {
  BellIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon
} from '@heroicons/vue/24/outline'
import { useNotificationsStore } from '~/stores/notifications'
import { useAppTheme } from '~/composables/useAppTheme'
import { useUserRole } from '~/composables/useUserRole'
import ActionMenu from '~/components/ui/ActionMenu.vue'

const q = ref('')
const showSearch = ref(false)

const notifications = useNotificationsStore()
const notificationsCount = computed(() => notifications.unreadCount || 0)

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

const searchPlaceholder = computed(() =>
  isquizee.value
    ? 'Search quizzes, topics, subjects... (press / to focus)'
    : 'Search questions, topics, subjects... (press / to focus)'
)

function onToggleSidebar() {
  mobileNavOpen.value = true
  if (import.meta.client) {
    window.dispatchEvent(new CustomEvent('toggle-sidebar'))
  }
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
})

const userName = computed(() => auth.user?.name || 'User')
const userAvatar = computed(() => auth.user?.avatar_url || '/logo/avatar-placeholder.png')
const logoSrc = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect fill='%23eef2ff' width='100%' height='100%'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23638' font-size='18'>M</text></svg>"
const walletAmount = computed(() => (auth.user?.wallet ? `$${auth.user.wallet}` : '$0'))

watch(
  () => route.fullPath,
  () => {
    mobileNavOpen.value = false
  }
)

const showUserMenu = ref(false)
function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function closeUserMenu() {
  showUserMenu.value = false
}

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
