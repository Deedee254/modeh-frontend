<template>
  <nav
    v-show="isMobile && !ui.sidebarOpen"
    class="fixed inset-x-0 bottom-0 z-50 safe-area-bottom"
    role="navigation"
    aria-label="primary mobile"
  >
    <!-- Overlays for menus -->
    <transition enter-active-class="transition duration-150" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showLeftMenu || showRightMenu" class="fixed inset-0 z-40 bg-black/10" @click="closeMenus" />
    </transition>

    <!-- Bottom nav bar container -->
    <div class="relative w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-700/60 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between gap-4">
          <!-- Left button section -->
          <div class="flex-1 flex justify-start">
            <slot name="left">
              <component v-if="bottomNav.leftSlot" :is="bottomNav.leftSlot" />
              <button
                v-else
                ref="leftButtonRef"
                @click="toggleLeftMenu"
                :aria-expanded="String(showLeftMenu)"
                aria-controls="left-menu"
                class="group flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
              >
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition group-hover:bg-indigo-50 group-hover:text-indigo-600">
                  <Icon name="heroicons:bars-3" class="h-5 w-5" />
                </div>
                Explore
              </button>
            </slot>
          </div>

          <!-- Center button -->
          <div class="flex-0">
            <slot name="center">
              <component v-if="bottomNav.centerSlot" :is="bottomNav.centerSlot" />
              <button
                v-else
                @click="centerAction"
                class="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 via-sky-500 to-cyan-400 text-white shadow-[0_20px_45px_-20px] shadow-indigo-600/80 transition hover:scale-105"
                aria-label="Start"
              >
                <Icon name="heroicons:play-solid" class="h-6 w-6" />
              </button>
            </slot>
          </div>

          <!-- Right button section -->
          <div class="flex-1 flex justify-end">
            <slot name="right">
              <component v-if="bottomNav.rightSlot" :is="bottomNav.rightSlot" />
              <button
                v-else
                ref="rightButtonRef"
                @click="toggleRightMenu"
                :aria-expanded="String(showRightMenu)"
                aria-controls="right-menu"
                class="group relative flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
              >
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition group-hover:bg-indigo-50 group-hover:text-indigo-600">
                  <Icon name="heroicons:bars-2" class="h-5 w-5" />
                </div>
                Categories
                <span
                  v-if="unread > 0"
                  class="absolute -top-1 -right-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold leading-none text-white shadow-sm"
                >{{ unread > 99 ? '99+' : unread }}</span>
              </button>
            </slot>
          </div>
        </div>
      </div>

      <!-- Left dropdown menu (positioned absolutely) -->
      <transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 translate-y-2 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 translate-y-0 scale-100" leave-to-class="opacity-0 translate-y-2 scale-95">
        <div v-if="showLeftMenu" id="left-menu" ref="leftMenuRef" role="menu" class="absolute bottom-full left-4 mb-2 w-56 rounded-lg bg-white dark:bg-slate-800 border shadow-lg p-1 ring-1 ring-black/5 z-50 max-h-[60vh] overflow-y-auto">
              <!-- Left drop-up should mirror the topbar mobile nav for each role -->
              <template v-if="isInstitutionManager">
                <button role="menuitem" @click="goTo(resolveInstPath('/institution-manager/institutions/[slug]/analytics'))" class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-gray-50">
                  <div class="flex items-center gap-3">
                    <Icon name="heroicons:chart-pie" class="h-5 w-5 text-slate-600" />
                    <span class="text-sm text-slate-700">Dashboard</span>
                  </div>
                  <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-400" />
                </button>
                <div class="border-t border-gray-100 my-1" />
                <button role="menuitem" @click="goTo({ path: '/institution-manager/subscriptions', query: instStore.activeInstitutionSlug ? { institutionSlug: String(instStore.activeInstitutionSlug) } : {} })" class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-gray-50">
                  <div class="flex items-center gap-3">
                    <Icon name="heroicons:credit-card" class="h-5 w-5 text-slate-600" />
                    <span class="text-sm text-slate-700">Subscriptions</span>
                  </div>
                  <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-400" />
                </button>
                <div class="border-t border-gray-100 my-1" />
                <button role="menuitem" @click="goTo(resolveInstPath('/institution-manager/institutions/[slug]/members'))" class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-gray-50">
                  <div class="flex items-center gap-3">
                    <Icon name="heroicons:user-group" class="h-5 w-5 text-slate-600" />
                    <span class="text-sm text-slate-700">Members</span>
                  </div>
                  <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-400" />
                </button>
              </template>
              <template v-else-if="isquizee">
                <button role="menuitem" @click="goTo('/grades')" class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-gray-50">
                  <div class="flex items-center gap-3">
                    <Icon name="heroicons:scale" class="h-5 w-5 text-slate-600" />
                    <span class="text-sm text-slate-700">Grades</span>
                  </div>
                  <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-400" />
                </button>
                <div class="border-t border-gray-100 my-1" />
                <button role="menuitem" @click="goTo('/subjects')" class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-gray-50">
                  <div class="flex items-center gap-3">
                    <Icon name="heroicons:bookmark" class="h-5 w-5 text-slate-600" />
                    <span class="text-sm text-slate-700">Subjects</span>
                  </div>
                  <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-400" />
                </button>
                <div class="border-t border-gray-100 my-1" />
                <button role="menuitem" @click="goTo('/levels')" class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-gray-50">
                  <div class="flex items-center gap-3">
                    <Icon name="heroicons:chart-pie" class="h-5 w-5 text-slate-600" />
                    <span class="text-sm text-slate-700">Levels</span>
                  </div>
                  <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-400" />
                </button>
                <div class="border-t border-gray-100 my-1" />
                <button role="menuitem" @click="goTo('/topics')" class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-gray-50">
                  <div class="flex items-center gap-3">
                    <Icon name="heroicons:book-open" class="h-5 w-5 text-slate-600" />
                    <span class="text-sm text-slate-700">Topics</span>
                  </div>
                  <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-400" />
                </button>
                <div class="border-t border-gray-100 my-1" />
                <button role="menuitem" @click="goTo('/quizee/quiz-masters')" class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-gray-50">
                  <div class="flex items-center gap-3">
                    <Icon name="heroicons:user-group" class="h-5 w-5 text-slate-600" />
                    <span class="text-sm text-slate-700">Quiz Masters</span>
                  </div>
                  <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-400" />
                </button>
              </template>
              <template v-else>
                <button role="menuitem" @click="goTo('/grades')" class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-gray-50">
                  <div class="flex items-center gap-3">
                    <Icon name="heroicons:scale" class="h-5 w-5 text-slate-600" />
                    <span class="text-sm text-slate-700">Grades</span>
                  </div>
                  <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-400" />
                </button>
                <div class="border-t border-gray-100 my-1" />
                <button role="menuitem" @click="goTo('/quiz-master/quizzes')" class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-gray-50">
                  <div class="flex items-center gap-3">
                    <Icon name="heroicons:clipboard-document-list" class="h-5 w-5 text-slate-600" />
                    <span class="text-sm text-slate-700">Quizzes</span>
                  </div>
                  <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-400" />
                </button>
                <div class="border-t border-gray-100 my-1" />
                <button role="menuitem" @click="goTo('/quiz-master/quizees')" class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-gray-50">
                  <div class="flex items-center gap-3">
                    <Icon name="heroicons:user-group" class="h-5 w-5 text-slate-600" />
                    <span class="text-sm text-slate-700">Quizees</span>
                  </div>
                  <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-400" />
                </button>
                <div class="border-t border-gray-100 my-1" />
                <button role="menuitem" @click="goTo('/levels')" class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-gray-50">
                  <div class="flex items-center gap-3">
                    <Icon name="heroicons:chart-pie" class="h-5 w-5 text-slate-600" />
                    <span class="text-sm text-slate-700">Levels</span>
                  </div>
                  <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-400" />
                </button>
                <div class="border-t border-gray-100 my-1" />
                <button role="menuitem" @click="goTo('/quiz-master/analytics')" class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-gray-50">
                  <div class="flex items-center gap-3">
                    <Icon name="heroicons:presentation-chart-bar" class="h-5 w-5 text-slate-600" />
                    <span class="text-sm text-slate-700">Analytics</span>
                  </div>
                  <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-400" />
                </button>
              </template>
        </div>
      </transition>

      <!-- Right dropdown menu (positioned absolutely) -->
      <transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 translate-y-2 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 translate-y-0 scale-100" leave-to-class="opacity-0 translate-y-2 scale-95">
        <div v-if="showRightMenu" id="right-menu" ref="rightMenuRef" role="menu" class="absolute bottom-full right-4 mb-2 w-56 rounded-lg bg-white dark:bg-slate-800 border shadow-lg p-1 ring-1 ring-black/5 z-50 max-h-[60vh] overflow-y-auto">
          <template v-if="isInstitutionManager">
            <button role="menuitem" @click="goTo(resolveInstPath('/institution-manager/institutions/[slug]/members'))" class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-gray-50">
              <div class="flex items-center gap-3">
                <Icon name="heroicons:user-group" class="h-5 w-5 text-slate-600" />
                <span class="text-sm text-slate-700">Members</span>
              </div>
              <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-400" />
            </button>
            <div class="border-t border-gray-100 my-1" />
            <button role="menuitem" @click="goTo('/institution-manager/quiz-masters')" class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-gray-50">
              <div class="flex items-center gap-3">
                <Icon name="heroicons:user" class="h-5 w-5 text-slate-600" />
                <span class="text-sm text-slate-700">Quiz Masters</span>
              </div>
              <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-400" />
            </button>
            <div class="border-t border-gray-100 my-1" />
            <button role="menuitem" @click="goTo('/institution-manager/subscriptions')" class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-gray-50">
              <div class="flex items-center gap-3">
                <Icon name="heroicons:credit-card" class="h-5 w-5 text-slate-600" />
                <span class="text-sm text-slate-700">Subscriptions</span>
              </div>
              <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-400" />
            </button>
            <div class="border-t border-gray-100 my-1" />
            <button role="menuitem" @click="goTo('/institution-manager/settings')" class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-gray-50">
              <div class="flex items-center gap-3">
                <Icon name="heroicons:cog-6-tooth" class="h-5 w-5 text-slate-600" />
                <span class="text-sm text-slate-700">Settings</span>
              </div>
              <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-400" />
            </button>
          </template>
          <template v-else>
            <button role="menuitem" @click="goTo('/levels')" class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-gray-50">
              <div class="flex items-center gap-3">
                <Icon name="heroicons:scale" class="h-5 w-5 text-slate-600" />
                <span class="text-sm text-slate-700">Levels</span>
              </div>
              <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-400" />
            </button>
            <div class="border-t border-gray-100 my-1" />
            <button role="menuitem" @click="goTo('/grades')" class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-gray-50">
              <div class="flex items-center gap-3">
                <Icon name="heroicons:academic-cap" class="h-5 w-5 text-slate-600" />
                <span class="text-sm text-slate-700">Grades</span>
              </div>
              <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-400" />
            </button>
            <div class="border-t border-gray-100 my-1" />
            <button role="menuitem" @click="goTo('/subjects')" class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-gray-50">
              <div class="flex items-center gap-3">
                <Icon name="heroicons:bookmark" class="h-5 w-5 text-slate-600" />
                <span class="text-sm text-slate-700">Subjects</span>
              </div>
              <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-400" />
            </button>
            <div class="border-t border-gray-100 my-1" />
            <button role="menuitem" @click="goTo('/topics')" class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-gray-50">
              <div class="flex items-center gap-3">
                <Icon name="heroicons:book-open" class="h-5 w-5 text-slate-600" />
                <span class="text-sm text-slate-700">Topics</span>
              </div>
              <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-400" />
            </button>
            <div class="border-t border-gray-100 my-1" />
            <button role="menuitem" @click="goTo('/courses')" class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-gray-50">
              <div class="flex items-center gap-3">
                <Icon name="heroicons:clipboard-list" class="h-5 w-5 text-slate-600" />
                <span class="text-sm text-slate-700">Courses</span>
              </div>
              <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-400" />
            </button>
          </template>
        </div>
      </transition>
    </div>
  </nav>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import { useRouter, useRoute } from '#imports'
import { useUserRole } from '~/composables/useUserRole'
import { useAuthStore } from '~/stores/auth'
import { useNotificationsStore } from '~/stores/notifications'
import { useBottomNavStore } from '~/stores/bottomNav'
import { useUiStore } from '~/stores/ui'
import { useInstitutionsStore } from '~/stores/institutions'

const props = defineProps({
  onCenter: { type: Function, required: false }
})

const router = useRouter()
const route = useRoute()
const { isQuizMaster, isquizee } = useUserRole()
const notif = useNotificationsStore()
const bottomNav = useBottomNavStore()
const ui = useUiStore()
const auth = useAuthStore()

const isInstitutionManager = computed(() => {
  if (!auth.user) return false
  if (auth.user.role === 'institution-manager') return true
  if (auth.user.institutions && Array.isArray(auth.user.institutions) && auth.user.institutions.length > 0) return true
  return false
})

const instStore = useInstitutionsStore()

function resolveInstPath(path) {
  try {
    const instSlug = route.query.institutionSlug || instStore.activeInstitutionSlug || instStore.institution?.slug || null
    if (!instSlug) {
      // remove [slug] segment if no slug available
      return String(path).replace('/institutions/[slug]', '/institutions')
    }
    return String(path).replace('[slug]', String(instSlug))
  } catch (e) {
    return path
  }
}

const unread = computed(() => notif.unreadCount || 0)

// local menu state for drop-ups
const showLeftMenu = ref(false)
const showRightMenu = ref(false)

// refs for measuring toggle buttons and menus so we can position popups precisely
const leftButtonRef = ref(null)
const rightButtonRef = ref(null)
const leftMenuRef = ref(null)
const rightMenuRef = ref(null)

// inline style objects applied to menu containers when positioning them
const width = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const isMobile = computed(() => width.value < 768)

function updateWidth() {
  if (typeof window === 'undefined') return
  width.value = window.innerWidth
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function closeMenus() {
  showLeftMenu.value = false
  showRightMenu.value = false
}

function toggleLeftMenu() {
  // Toggle the left drop-up menu. This keeps the bottom-left control as a
  // drop-up (matching the topbar mobile nav links) instead of opening the
  // left sidebar drawer. The TopBar hamburger will continue to open the
  // left sidebar via `ui.toggleSidebar()`.
  showRightMenu.value = false
  showLeftMenu.value = !showLeftMenu.value
  // ensure any full-screen mobile nav overlay is closed
  ui.mobileNavOpen = false
  if (showLeftMenu.value) {
    // focus first menuitem for keyboard users
    nextTick(() => {
      const el = document.querySelector('#left-menu [role="menuitem"]')
      if (el instanceof HTMLElement) el.focus()
    })
  }
}

function toggleRightMenu() {
  showLeftMenu.value = false
  showRightMenu.value = !showRightMenu.value
  ui.mobileNavOpen = false
  if (showRightMenu.value) {
    nextTick(() => {
      const el = document.querySelector('#right-menu [role="menuitem"]')
      if (el instanceof HTMLElement) el.focus()
    })
  }
}

function goTo(path) {
  closeMenus()
  // Allow path to be an object or string. If string contains [slug], resolve it.
  if (typeof path === 'string') {
    const p = resolveInstPath(path)
    router.push(p)
    return
  }
  // object route
  if (path && typeof path === 'object' && path.path && typeof path.path === 'string') {
    const np = { ...path }
    np.path = resolveInstPath(path.path)
    router.push(np)
    return
  }
  router.push(path)
}

onMounted(() => {
  updateWidth()
  if (typeof window !== 'undefined') window.addEventListener('resize', updateWidth)
  // close menus on Escape key
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', onGlobalKeydown)
  }
  // close menus when route changes
  watch(() => router.currentRoute.value.fullPath, () => {
    closeMenus()
  })
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') window.removeEventListener('resize', updateWidth)
  if (typeof window !== 'undefined') window.removeEventListener('keydown', onGlobalKeydown)
})

function onGlobalKeydown(e) {
  if (e.key === 'Escape' || e.key === 'Esc') {
    closeMenus()
    return
  }
  // allow Enter/Space on focused control to toggle via native button behavior
}


function centerAction() {
  if (typeof props.onCenter === 'function') return props.onCenter()
  if (typeof bottomNav.centerHandler === 'function' || typeof bottomNav.centerHandler?.value === 'function') return (bottomNav.centerHandler?.value || bottomNav.centerHandler)()
  if (isInstitutionManager.value) return router.push('/institution-manager/institutions/create')
  if (isQuizMaster.value) return router.push('/quiz-master/quizzes/create')
  if (isquizee.value) return router.push('/quizee/quizzes')
}

// Note: left/right actions were removed in favor of in-component drop-up menus
</script>

<style scoped>
@media (min-width: 768px) {
  nav { display: none; }
}

/* Add padding to the bottom of the page to prevent content from being hidden under the nav */
:global(body) {
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 5rem);
}

/* Handle safe area insets for mobile devices */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
