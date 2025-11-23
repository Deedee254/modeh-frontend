<template>
  <div class="relative" ref="wrapper">
    <button
      ref="button"
      @click="toggle"
      :aria-expanded="open"
      :aria-controls="menuId"
      class="ml-2 px-3 py-2 border rounded text-sm flex items-center gap-2"
    >
      <template v-if="!isAuthed">
        <span>My account</span>
      </template>
      <template v-else>
        <div class="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center font-semibold text-slate-700 dark:text-slate-200">{{ userInitials }}</div>
      </template>
      <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
    </button>

    <transition name="fade-scale">
      <div
        v-if="open"
        :id="menuId"
        ref="menu"
        class="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg z-50 border dark:border-slate-700 focus:outline-none"
        role="menu"
        tabindex="-1"
      >
        <div class="py-1">
          <template v-if="!isAuthed">
            <NuxtLink to="/login" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" @click="close">Login</NuxtLink>
            <NuxtLink to="/register" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" @click="close">Register</NuxtLink>
          </template>
          <template v-else>
            <NuxtLink :to="profileLink" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" @click="close">Profile</NuxtLink>
            <button @click="handleLogout" class="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Logout</button>
          </template>

          <div class="border-t mt-2 pt-2 px-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import ThemeToggle from '~/components/ThemeToggle.vue'
import { useAuthStore } from '~/stores/auth'

const props = defineProps({
  isAuthed: { type: Boolean, default: false },
  userInitials: { type: String, default: 'U' },
  // Accept either a string or a route object for flexibility
  profileLink: { type: [String, Object], default: '/' }
})

const emit = defineEmits(['logout'])

const open = ref(false)
const wrapper = ref(null)
const menu = ref(null)
const button = ref(null)
const menuId = `account-menu-${Math.random().toString(36).slice(2,9)}`

const auth = useAuthStore?.() || null

function toggle() {
  open.value = !open.value
}
function close() {
  open.value = false
}

function handleDocClick(e) {
  const target = e.target
  if (open.value && wrapper.value && !wrapper.value.contains(target)) {
    close()
  }
}

function handleDocKeydown(e) {
  if ((e.key === 'Escape' || e.key === 'Esc') && open.value) {
    close()
  }
}

async function focusFirst() {
  await nextTick()
  const container = menu.value
  if (!container) return
  const focusable = container.querySelectorAll('a,button,[tabindex]:not([tabindex="-1"])')
  if (focusable && focusable.length) focusable[0].focus()
}

watch(open, (val) => {
  if (val) {
    // open
    focusFirst()
    document.addEventListener('click', handleDocClick)
    document.addEventListener('keydown', handleDocKeydown)
  } else {
    // closed: restore focus to toggle button
    button.value?.focus()
    document.removeEventListener('click', handleDocClick)
    document.removeEventListener('keydown', handleDocKeydown)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocClick)
  document.removeEventListener('keydown', handleDocKeydown)
})

function handleLogout() {
  if (auth && auth.logout) {
    auth.logout()
  }
  emit('logout')
  close()
}
</script>

<style scoped>
.fade-scale-enter-active, .fade-scale-leave-active {
  transition: all 140ms cubic-bezier(.4,0,.2,1);
}
.fade-scale-enter-from, .fade-scale-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(.98);
}
.fade-scale-enter-to, .fade-scale-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
