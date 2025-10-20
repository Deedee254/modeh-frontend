<template>
  <nav
    v-show="isMobile && !ui.sidebarOpen"
    class="fixed inset-x-0 bottom-0 z-50 safe-area-bottom"
    role="navigation"
    aria-label="primary mobile"
  >
    <div class="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-700/60 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between gap-4">
          <!-- Menu / Explorer -->
          <div class="flex-1">
            <slot name="left">
              <component v-if="bottomNav.leftSlot" :is="bottomNav.leftSlot" />
              <button
                v-else
                @click="leftAction"
                class="group flex w-full flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
              >
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition group-hover:bg-indigo-50 group-hover:text-indigo-600">
                  <Icon name="heroicons:bars-3" class="h-5 w-5" />
                </div>
                Explore
              </button>
            </slot>
          </div>

          <!-- Primary CTA -->
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

          <!-- Notifications / Profile -->
          <div class="flex-1">
            <slot name="right">
              <component v-if="bottomNav.rightSlot" :is="bottomNav.rightSlot" />
              <button
                v-else
                @click="rightAction"
                class="group relative flex w-full flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
              >
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition group-hover:bg-indigo-50 group-hover:text-indigo-600">
                  <Icon name="heroicons:bell-alert" class="h-5 w-5" />
                </div>
                Alerts
                <span
                  v-if="unread > 0"
                  class="absolute -top-1 -right-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold leading-none text-white shadow-sm"
                >{{ unread > 99 ? '99+' : unread }}</span>
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from '#imports'
import { useUserRole } from '~/composables/useUserRole'
import { useAuthStore } from '~/stores/auth'
import { useNotificationsStore } from '~/stores/notifications'
import { useBottomNavStore } from '~/stores/bottomNav'
import { useUiStore } from '~/stores/ui'

const props = defineProps({
  onLeft: { type: Function, required: false },
  onCenter: { type: Function, required: false },
  onRight: { type: Function, required: false }
})

const router = useRouter()
const { isQuizMaster, isQuizee } = useUserRole()
const notif = useNotificationsStore()
const bottomNav = useBottomNavStore()
const ui = useUiStore()

const unread = computed(() => notif.unreadCount || 0)

const width = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const isMobile = computed(() => width.value < 768)

function updateWidth() {
  if (typeof window === 'undefined') return
  width.value = window.innerWidth
}

onMounted(() => {
  updateWidth()
  if (typeof window !== 'undefined') window.addEventListener('resize', updateWidth)
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') window.removeEventListener('resize', updateWidth)
})

function leftAction() {
  if (typeof props.onLeft === 'function') return props.onLeft()
  if (typeof bottomNav.leftHandler === 'function' || typeof bottomNav.leftHandler?.value === 'function') return (bottomNav.leftHandler?.value || bottomNav.leftHandler)()
  
  // Default action on mobile is to toggle the main sidebar/drawer
  ui.toggleSidebar()
}

function centerAction() {
  if (typeof props.onCenter === 'function') return props.onCenter()
  if (typeof bottomNav.centerHandler === 'function' || typeof bottomNav.centerHandler?.value === 'function') return (bottomNav.centerHandler?.value || bottomNav.centerHandler)()
  if (isQuizMaster.value) return router.push('/quiz-master/quizzes/create')
  if (isQuizee.value) return router.push('/quizee/quizzes')
}

function rightAction() {
  if (typeof props.onRight === 'function') return props.onRight()
  if (typeof bottomNav.rightHandler === 'function' || typeof bottomNav.rightHandler?.value === 'function') return (bottomNav.rightHandler?.value || bottomNav.rightHandler)()
  if (isQuizMaster.value) return router.push('/quiz-master/chat')
  if (isQuizee.value) return router.push('/quizee/chat')
  return router.push('/profile') // Fallback for any other case
}
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
