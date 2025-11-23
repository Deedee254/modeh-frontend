<template>
  <nav
    v-show="isMobile && !ui.sidebarOpen"
    class="fixed inset-x-0 bottom-0 z-50 safe-area-bottom"
    role="navigation"
    aria-label="Primary mobile navigation"
  >
    <!-- Overlay backdrop -->
    <Transition
      enter-active-class="transition duration-150"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="anyMenuOpen"
        class="fixed inset-0 z-40 bg-black/10"
        @click="closeAllMenus"
      />
    </Transition>

    <!-- Bottom nav bar -->
    <div class="relative w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-700/60 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between gap-2">
          <!-- Left: Explore Menu -->
          <div class="flex-1 flex justify-start">
            <BottomNavDropdown
              ref="exploreDropdown"
              button-label="Explore"
              @open="closeOtherMenus('explore')"
            >
              <BottomNavMenuItem
                v-for="item in currentRoleMenus.explore"
                :key="item.id"
                :label="item.label"
                :icon="item.icon"
                :to="item.to"
                @click="closeAllMenus"
              />
            </BottomNavDropdown>
          </div>

          <!-- Center-Left: Messages -->
          <button
            @click="goToMessages"
            :aria-label="`Messages${unread > 0 ? ` (${unread} unread)` : ''}`"
            class="group relative flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              <Icon name="heroicons:chat-bubble-left" class="h-5 w-5" />
            </div>
            Messages
            <span
              v-if="unread > 0"
              class="absolute -top-1 -right-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold leading-none text-white shadow-sm"
            >
              {{ unread > 99 ? '99+' : unread }}
            </span>
          </button>

          <!-- Center: Create Action -->
          <button
            @click="handleCenterAction"
            aria-label="Create new"
            class="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 via-sky-500 to-cyan-400 text-white shadow-[0_20px_45px_-20px] shadow-indigo-600/80 transition hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <Icon name="heroicons:plus" class="h-6 w-6" />
          </button>

          <!-- Right: Settings Menu -->
          <div class="flex-1 flex justify-end">
            <BottomNavDropdown
              ref="settingsDropdown"
              button-label="Settings"
              @open="closeOtherMenus('settings')"
            >
              <BottomNavMenuItem
                v-for="item in currentRoleMenus.settings"
                :key="item.id"
                :label="item.label"
                :icon="item.icon"
                :to="item.to"
                @click="closeAllMenus"
              />
              <div class="border-t border-gray-100 dark:border-slate-700 my-1" />
              <button
                role="menuitem"
                @click.stop="handleLogout"
                class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition text-left"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <Icon
                    name="heroicons:arrow-left-on-rectangle"
                    class="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0"
                  />
                  <span class="text-sm text-red-700 dark:text-red-200 truncate">Logout</span>
                </div>
                <Icon
                  name="heroicons:chevron-right"
                  class="h-4 w-4 text-red-400 dark:text-red-500 flex-shrink-0"
                />
              </button>
            </BottomNavDropdown>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBottomNavMenus } from '~/composables/useBottomNavMenus'
import { useAuthStore } from '~/stores/auth'
import { useNotificationsStore } from '~/stores/notifications'
import { useUiStore } from '~/stores/ui'
import BottomNavDropdown from './BottomNavDropdown.vue'
import BottomNavMenuItem from './BottomNavMenuItem.vue'

const router = useRouter()
const auth = useAuthStore()
const notif = useNotificationsStore()
const ui = useUiStore()
const { currentRoleMenus } = useBottomNavMenus()

const width = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const isMobile = computed(() => width.value < 768)

const exploreDropdown = ref(null)
const settingsDropdown = ref(null)

const unread = computed(() => notif.unreadCount || 0)

const anyMenuOpen = computed(() => {
  return (exploreDropdown.value?.isOpen) || (settingsDropdown.value?.isOpen)
})

function updateWidth() {
  if (typeof window === 'undefined') return
  width.value = window.innerWidth
}

function closeAllMenus() {
  if (exploreDropdown.value) exploreDropdown.value.isOpen = false
  if (settingsDropdown.value) settingsDropdown.value.isOpen = false
}

function closeOtherMenus(current) {
  if (current !== 'explore' && exploreDropdown.value) {
    exploreDropdown.value.isOpen = false
  }
  if (current !== 'settings' && settingsDropdown.value) {
    settingsDropdown.value.isOpen = false
  }
}

function handleCenterAction() {
  if (auth.user?.role === 'institution-manager') {
    router.push('/institution-manager/institutions/create')
  } else if (auth.user?.role === 'quiz-master') {
    router.push('/quiz-master/quizzes/create')
  } else {
    router.push('/quizee/quizzes')
  }
  closeAllMenus()
}

function goToMessages() {
  router.push('/messages')
  closeAllMenus()
}

function handleLogout() {
  closeAllMenus()
  auth.logout()
  router.push('/login')
}

onMounted(() => {
  updateWidth()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateWidth)
    window.addEventListener('keydown', onGlobalKeydown)
  }
  
  watch(() => router.currentRoute.value.fullPath, () => {
    closeAllMenus()
  })
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateWidth)
    window.removeEventListener('keydown', onGlobalKeydown)
  }
})

function onGlobalKeydown(e) {
  if (e.key === 'Escape' || e.key === 'Esc') {
    closeAllMenus()
  }
}
</script>

<style scoped>
@media (min-width: 768px) {
  nav {
    display: none;
  }
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

:global(body) {
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 5rem);
}
</style>