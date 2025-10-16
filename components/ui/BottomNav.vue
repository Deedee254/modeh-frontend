<template>
  <nav
    v-show="isMobile && !sidebarOpen"
    class="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[420px] px-4 pb-6"
    role="navigation"
    aria-label="primary mobile"
  >
    <div class="relative flex items-center gap-3 rounded-3xl bg-white/95 p-3 shadow-xl shadow-indigo-100/60 backdrop-blur-md">
      <!-- Ring accent -->
      <span class="pointer-events-none absolute inset-0 rounded-3xl border border-indigo-100/60"></span>

      <!-- Menu / Explorer -->
      <div class="flex-1">
        <slot name="left">
          <template v-if="bottomNav.leftSlot">
            <component :is="bottomNav.leftSlot" />
          </template>
          <template v-else>
            <button
              @click="leftAction"
              class="group flex w-full flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
            >
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition group-hover:bg-indigo-50 group-hover:text-indigo-600">
                <Icon name="heroicons:bars-3" class="h-5 w-5" />
              </div>
              Explore
            </button>
          </template>
        </slot>
      </div>

      <!-- Primary CTA -->
      <div class="flex-0">
        <slot name="center">
          <template v-if="bottomNav.centerSlot">
            <component :is="bottomNav.centerSlot" />
          </template>
          <template v-else>
            <button
              @click="centerAction"
              class="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 via-sky-500 to-cyan-400 text-white shadow-[0_20px_45px_-20px] shadow-indigo-600/80 transition hover:scale-105"
              aria-label="Start"
            >
              <Icon name="heroicons:play-solid" class="h-6 w-6" />
            </button>
          </template>
        </slot>
      </div>

      <!-- Notifications / Profile -->
      <div class="flex-1">
        <slot name="right">
          <template v-if="bottomNav.rightSlot">
            <component :is="bottomNav.rightSlot" />
          </template>
          <template v-else>
            <button
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
          </template>
        </slot>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from '#imports'
import { useAuthStore } from '~/stores/auth'
import { useNotificationsStore } from '~/stores/notifications'
import { useBottomNavStore } from '~/stores/bottomNav'
import { useSidebar } from '~/composables/useSidebar'

const props = defineProps({
  onLeft: { type: Function, required: false },
  onCenter: { type: Function, required: false },
  onRight: { type: Function, required: false }
})

const router = useRouter()
const auth = useAuthStore?.() || null
const notif = useNotificationsStore()
const bottomNav = useBottomNavStore()

const unread = computed(() => notif.unreadCount || 0)

const width = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const { sidebarMobileOpen, toggleSidebar, setSidebar } = useSidebar()
const sidebarOpen = computed(() => sidebarMobileOpen.value)
const isMobile = computed(() => width.value < 768)

function updateWidth() {
  if (typeof window === 'undefined') return
  width.value = window.innerWidth
}

// named handlers so we can remove them on unmount
const onSidebarClosedEvent = () => { if (process.client) setSidebar(false) }
const onToggleSidebarEvent = () => { if (process.client) toggleSidebar() }

onMounted(() => {
  updateWidth()
  if (typeof window !== 'undefined') window.addEventListener('resize', updateWidth)
  if (typeof window !== 'undefined') {
    window.addEventListener('toggle-sidebar', onToggleSidebarEvent)
    window.addEventListener('sidebar-closed', onSidebarClosedEvent)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateWidth)
    window.removeEventListener('toggle-sidebar', onToggleSidebarEvent)
    window.removeEventListener('sidebar-closed', onSidebarClosedEvent)
  }
})

function leftAction() {
  if (typeof props.onLeft === 'function') return props.onLeft()
  if (typeof bottomNav.leftHandler === 'function' || typeof bottomNav.leftHandler?.value === 'function') return (bottomNav.leftHandler?.value || bottomNav.leftHandler)()
  // If on mobile, open the sidebar drawer via the shared composable
  if (isMobile.value) {
    try { window.dispatchEvent(new CustomEvent('toggle-sidebar')) } catch (e) {}
    // Also call the composable toggle as a fallback so the sidebar changes even if
    // no listener handled the custom event (ensures mobile Explore reliably opens it)
    try { toggleSidebar() } catch (e) {}
    return
  }
  // route to role-specific listing when not mobile
  const role = auth?.role || auth?.user?.role || null
  if (role === 'quiz-master') return router.push('/quiz-master/quizzes')
  if (role === 'quizee') return router.push('/quizee/quizzes')
  return router.push('/quizzes')
}

function centerAction() {
  if (typeof props.onCenter === 'function') return props.onCenter()
  if (typeof bottomNav.centerHandler === 'function' || typeof bottomNav.centerHandler?.value === 'function') return (bottomNav.centerHandler?.value || bottomNav.centerHandler)()
  const role = auth?.role || auth?.user?.role || null
  // ensure quiz-master gets routed to the create-quiz page consistent with sidebar
  if (role === 'quiz-master') return router.push('/quiz-master/quizzes/create')
  return router.push('/quizee/quizzes')
}

function rightAction() {
  if (typeof props.onRight === 'function') return props.onRight()
  if (typeof bottomNav.rightHandler === 'function' || typeof bottomNav.rightHandler?.value === 'function') return (bottomNav.rightHandler?.value || bottomNav.rightHandler)()
  const role = auth?.role || auth?.user?.role || null
  // route to role-appropriate chat page (consistent with TopBar behaviour)
  if (role === 'quiz-master') return router.push('/quiz-master/chat')
  if (role === 'quizee') return router.push('/quizee/chat')
  return router.push('/profile')
}
</script>

<style scoped>
@media (min-width: 768px) {
  nav { display: none; }
}
</style>
