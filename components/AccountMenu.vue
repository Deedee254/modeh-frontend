<template>
  <div class="flex items-center gap-2">
    <template v-if="isMounted">
      <!-- Guest: Login Button -->
      <template v-if="!isAuthed">
        <!-- Desktop: Login and Register buttons -->
        <div class="hidden md:flex items-center gap-3">
          <button
            @click="showLoginModal = true"
            class="px-4 py-2 text-sm font-semibold text-brand-600 bg-transparent hover:bg-brand-50 rounded-lg transition-colors"
          >
            Login
          </button>
          <NuxtLink
            to="/register/quizee"
            class="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
          >
            Register
          </NuxtLink>
        </div>

        <!-- Mobile: Icon button that shows popup -->
        <div ref="mobileAuthMenuRef" class="relative">
          <button
            @click="showMobileAuthMenu = !showMobileAuthMenu"
            class="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Authentication menu"
          >
            <svg class="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>

          <!-- Mobile auth menu dropdown -->
          <transition name="fade">
            <div
              v-if="showMobileAuthMenu"
              class="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg z-50 border dark:border-slate-700 overflow-hidden"
              @click.stop
            >
              <button
                @click="showLoginModal = true; showMobileAuthMenu = false"
                class="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-b dark:border-slate-700"
              >
                Sign In
              </button>
              <NuxtLink
                to="/register/quizee"
                class="block px-4 py-3 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 transition-colors"
                @click="showMobileAuthMenu = false"
              >
                Create Account
              </NuxtLink>
            </div>
          </transition>
        </div>
      </template>

      <!-- Authenticated: Account Menu with Avatar -->
      <template v-else>
        <div class="relative" ref="wrapper">
          <button
            ref="button"
            @click="toggle"
            :aria-expanded="open"
            :aria-controls="menuId"
            class="ml-2 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg p-1 transition-colors"
          >
            <img 
              :src="userAvatarUrl" 
              :alt="userInitials"
              class="w-8 h-8 rounded-full object-cover"
            />
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
                <NuxtLink :to="profileLink" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" @click="close">Profile</NuxtLink>
                <button @click="handleLogout" class="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Logout</button>

                <div class="border-t mt-2 pt-2 px-4">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </transition>
        </div>
      </template>
    </template>

    <!-- Login Modal -->
    <Teleport to="body" v-if="isMounted && showLoginModal">
      <div
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="showLoginModal = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4">
          <div class="flex items-center justify-between p-6 border-b dark:border-slate-700">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Sign In</h2>
            <button
              @click="showLoginModal = false"
              class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div class="p-6">
            <LoginForm :compact="true" @login-success="handleLoginSuccess" />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount, computed } from 'vue'
import ThemeToggle from '~/components/ThemeToggle.vue'
import LoginForm from '~/components/Auth/LoginForm.vue'
import { useAuthStore } from '~/stores/auth'
import { resolveAssetUrl } from '~/composables/useAssets'

const props = defineProps({
  isAuthed: { type: Boolean, default: false },
  userInitials: { type: String, default: 'U' },
  profileLink: { type: [String, Object], default: '/' }
})

const emit = defineEmits(['logout'])

const open = ref(false)
const showLoginModal = ref(false)
const showMobileAuthMenu = ref(false)
const wrapper = ref(null)
const menu = ref(null)
const button = ref(null)
const mobileAuthMenuRef = ref(null)
const menuId = `account-menu-${Math.random().toString(36).slice(2, 9)}`
const isMounted = ref(false)

const auth = useAuthStore()

// Use asset composable to resolve avatar URL. Prefer camelCase `avatarUrl` normalized by the auth store.
const userAvatarUrl = computed(() => {
  return resolveAssetUrl(auth?.userAvatar || auth?.user?.image || auth?.user?.avatarUrl || auth?.user?.avatar || auth?.user?.avatar_url || auth?.user?.photo) || '/logo/avatar-placeholder.png'
})

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

function handleLoginSuccess() {
  showLoginModal.value = false
  showMobileAuthMenu.value = false
}

function handleDocClick(e) {
  const target = e.target
  if (open.value && wrapper.value && !wrapper.value.contains(target)) {
    close()
  }
  // Close mobile auth menu when clicking outside
  if (showMobileAuthMenu.value && mobileAuthMenuRef.value && !mobileAuthMenuRef.value.contains(target)) {
    showMobileAuthMenu.value = false
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
    focusFirst()
    document.addEventListener('click', handleDocClick)
    document.addEventListener('keydown', handleDocKeydown)
  } else {
    button.value?.focus()
    document.removeEventListener('click', handleDocClick)
    document.removeEventListener('keydown', handleDocKeydown)
  }
})

onMounted(() => {
  isMounted.value = true
  // Ensure listeners are attached when component mounts
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

.fade-enter-active, .fade-leave-active {
  transition: opacity 150ms ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

