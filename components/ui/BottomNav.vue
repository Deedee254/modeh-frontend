<template>
  <nav class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[92%] max-w-md px-4" role="navigation" aria-label="Bottom quick actions">
    <div class="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg px-2 py-2 flex items-center justify-between">
      <!-- left action group: allow override via prop or slot -->
      <div class="flex-1 flex items-center justify-center">
        <slot name="left">
          <template v-if="bottomNav.leftSlot">
            <component :is="bottomNav.leftSlot" />
          </template>
          <template v-else>
            <button @click="leftAction" class="p-2 rounded-md hover:bg-gray-50 transition flex items-center justify-center w-full">
              <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18"></path></svg>
            </button>
          </template>
        </slot>
      </div>

      <!-- center big action: slot preferred, fallback to default primary -->
      <div class="-mx-6 flex-0">
        <slot name="center">
          <template v-if="bottomNav.centerSlot">
            <component :is="bottomNav.centerSlot" />
          </template>
          <template v-else>
            <button @click="centerAction" class="bg-indigo-600 text-white rounded-full p-4 shadow-lg transform -translate-y-2 hover:scale-105 transition" aria-label="Primary action">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            </button>
          </template>
        </slot>
      </div>

      <!-- right action group: include unread badge -->
      <div class="flex-1 flex items-center justify-center">
        <slot name="right">
          <template v-if="bottomNav.rightSlot">
            <component :is="bottomNav.rightSlot" />
          </template>
          <template v-else>
            <button @click="rightAction" class="p-2 rounded-md hover:bg-gray-50 transition flex items-center justify-center w-full relative" aria-label="Notifications">
              <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              <span v-if="unread > 0" class="absolute -top-1 -right-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold leading-none text-white bg-red-500 rounded-full">{{ unread > 99 ? '99+' : unread }}</span>
            </button>
          </template>
        </slot>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from '#imports'
import { useAuthStore } from '~/stores/auth'
import { useNotificationsStore } from '~/stores/notifications'
import { useBottomNavStore } from '~/stores/bottomNav'
import { computed } from 'vue'

// Props: allow pages to override actions by passing functions
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

function leftAction() {
  if (typeof props.onLeft === 'function') return props.onLeft()
  if (typeof bottomNav.leftHandler === 'function' || typeof bottomNav.leftHandler?.value === 'function') return (bottomNav.leftHandler?.value || bottomNav.leftHandler)()
  return router.push('/quizzes')
}

function centerAction() {
  if (typeof props.onCenter === 'function') return props.onCenter()
  if (typeof bottomNav.centerHandler === 'function' || typeof bottomNav.centerHandler?.value === 'function') return (bottomNav.centerHandler?.value || bottomNav.centerHandler)()
  const role = auth?.role || auth?.user?.role || null
  if (role === 'tutor') return router.push('/create/editor')
  return router.push('/student/quizzes')
}

function rightAction() {
  if (typeof props.onRight === 'function') return props.onRight()
  if (typeof bottomNav.rightHandler === 'function' || typeof bottomNav.rightHandler?.value === 'function') return (bottomNav.rightHandler?.value || bottomNav.rightHandler)()
  return router.push('/notifications').catch(() => router.push('/profile'))
}
</script>

<style scoped>
/* Slightly larger hit area on mobile */
@media (min-width: 768px) {
  nav { display: none; }
}
</style>
