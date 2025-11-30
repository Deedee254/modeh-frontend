<template>
  <nav
    v-if="isMobile && !ui.sidebarOpen"
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
          class="fixed inset-0 z-30 bg-black/10"
          @click="closeAllMenus"
        />
      </Transition>

      <!-- Bottom nav bar -->
      <div class="relative w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-700/60 shadow-lg z-40">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between gap-2">
          <!-- Left: Explore Menu -->
          <div class="flex-1 flex justify-start">
            <BottomNavDropdown
              ref="exploreDropdown"
              button-label="Explore"
              icon="heroicons:squares-2x2"
              dropdown-align="left"
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
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition group-hover:bg-brand-50 dark:group-hover:bg-brand-900/30 group-hover:text-brand-600 dark:group-hover:text-brand-400">
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
            class="group relative flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30 group-hover:text-brand-600 dark:group-hover:text-brand-400">
              <Icon name="heroicons:plus" class="h-5 w-5" />
            </div>
            Create
          </button>

          <!-- Right: Role-Specific Direct Link -->
          <div class="flex-1 flex justify-end">
            <button
              @click="handleRightMenuClick"
              :aria-label="rightMenuLabel"
              class="group relative flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <div :class="['flex h-10 w-10 items-center justify-center rounded-full text-slate-600 dark:text-slate-400 transition', rightMenuBgClass]">
                <Icon :name="rightMenuIcon" class="h-5 w-5" />
              </div>
              {{ rightMenuLabel }}
            </button>
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
import { useUserRole } from '~/composables/useUserRole'
import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'
import BottomNavMenuItem from './BottomNavMenuItem.vue'
import BottomNavDropdown from './BottomNavDropdown.vue'

const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const { currentRoleMenus } = useBottomNavMenus()

const width = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const isMobile = computed(() => width.value < 768)

const exploreDropdown = ref(null)

// Message unread count (from notifications or auth user data)
const unread = computed(() => {
  try {
    // Try to get from notifications store if it exists
    return (auth.user?.notifications_count || auth.user?.unread_count || 0)
  } catch {
    return 0
  }
})

// Right menu label and icon based on user role
const rightMenuLabel = computed(() => {
  if (isQuizMaster.value) return 'Wallet'
  if (isInstitutionManager.value) return 'Explore'
  // default for quizee
  return 'Points'
})

const rightMenuIcon = computed(() => {
  if (isQuizMaster.value) return 'heroicons:wallet'
  if (isInstitutionManager.value) return 'heroicons:magnifying-glass'
  // default for quizee
  return 'heroicons:star'
})

const rightMenuBgClass = computed(() => {
  if (isQuizMaster.value) return 'bg-emerald-50 dark:bg-emerald-900/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
  if (isInstitutionManager.value) return 'bg-purple-50 dark:bg-purple-900/30 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 group-hover:text-purple-600 dark:group-hover:text-purple-400'
  // default for quizee
  return 'bg-yellow-50 dark:bg-yellow-900/30 group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/50 group-hover:text-yellow-600 dark:group-hover:text-yellow-400'
})

const rightMenuLink = computed(() => {
  if (isQuizMaster.value) return '/quiz-master/wallet'
  if (isInstitutionManager.value) return '/institution-manager/institutions/new'
  // default for quizee
  return '/quizee/points'
})

// Add role detection
const { isQuizMaster, isQuizee, isInstitutionManager } = useUserRole()

const anyMenuOpen = computed(() => {
  return (exploreDropdown.value?.isOpen)
})

function updateWidth() {
  if (typeof window === 'undefined') return
  width.value = window.innerWidth
}

function closeAllMenus() {
  if (exploreDropdown.value) exploreDropdown.value.close()
}

function closeOtherMenus(current) {
  if (current !== 'explore' && exploreDropdown.value) {
    exploreDropdown.value.close()
  }
}

function handleCenterAction() {
  if (auth.user?.role === 'institution-manager') {
    router.push('/institution-manager/institutions/new')
  } else if (auth.user?.role === 'quiz-master') {
    router.push('/quiz-master/quizzes/create')
  } else {
    router.push('/quizee/battles')
  }
  closeAllMenus()
}

function handleRightMenuClick() {
  router.push(rightMenuLink.value)
  closeAllMenus()
}

function goToMessages() {
  router.push('/quizee/chat')
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
</style>
