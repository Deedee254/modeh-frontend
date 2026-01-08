<template>
  <div>
    <aside
      :class="[ui.sidebarCollapsed ? 'w-20' : 'w-64', 'bg-white dark:bg-slate-800 border-r dark:border-slate-700 flex flex-col py-4 transition-all duration-300 hidden lg:flex fixed']"
      :style="{ top: 'var(--topbar-height)', height: 'calc(100vh - var(--topbar-height))', zIndex: '40', left: '0' }"
    >
      <nav class="flex-1 w-full overflow-y-auto" :class="[ui.sidebarCollapsed ? 'px-2' : 'px-2']">
        <ul class="flex flex-col gap-1">
          <li v-for="item in navItems" :key="item.to">
            <NuxtLink :to="item.to" :class="linkClass(item.to)" :title="item.label">
              <component :is="item.icon" class="w-5 h-5 shrink-0" />
              <span v-if="!ui.sidebarCollapsed" class="ml-3">{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="px-2 mt-auto" />
    </aside>

    <div v-if="ui.sidebarOpen" class="fixed inset-0 z-50 lg:hidden">
      <div class="absolute inset-0 bg-black/40" @click="ui.sidebarOpen = false"></div>
      <aside class="absolute left-0 top-0 h-screen w-64 bg-white dark:bg-slate-800 border-r dark:border-slate-700 p-4 overflow-auto">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <img src="/logo/modeh-logo.png" alt="Modeh" class="h-8" />
          </div>
          <button @click="ui.sidebarOpen = false" class="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
        <nav>
          <ul class="flex flex-col gap-2">
            <li v-for="item in navItems" :key="item.to">
              <NuxtLink @click="onMobileNavClick" :to="item.to" :class="linkClass(item.to)">
                <component :is="item.icon" class="w-5 h-5 inline-block mr-2 shrink-0" />
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
        <div class="mt-6 pt-4 border-t dark:border-slate-700">
          <NuxtLink to="/parent/profile" class="flex items-center gap-3">
            <img :src="userAvatar" class="w-8 h-8 rounded-full object-cover" />
            <div>
              <div class="font-medium text-sm">{{ user.name }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">View profile</div>
            </div>
          </NuxtLink>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'
import { resolveAssetUrl } from '~/composables/useAssets'
import {
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CreditCardIcon,
  CogIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const user = computed(() => auth.user || {})
const userAvatar = computed(
  () => resolveAssetUrl(auth.user?.avatarUrl || auth.user?.avatar || auth.user?.avatar_url) || '/logo/avatar-placeholder.png'
)

const navItems = [
  { to: '/parent/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/parent/quizees', label: 'My Quizees', icon: UserGroupIcon },
  { to: '/parent/analytics', label: 'Analytics', icon: ChartBarIcon },
  { to: '/parent/subscriptions', label: 'Subscriptions', icon: CreditCardIcon },
  { to: '/parent/chat', label: 'Chat', icon: ChatBubbleLeftRightIcon },
  { to: '/parent/settings', label: 'Settings', icon: CogIcon },
]

function linkClass(to) {
  const isActive = route.path === to || route.path.startsWith(to + '/')
  return [
    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200',
    isActive
      ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-medium'
      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700',
  ]
}

function onMobileNavClick() {
  ui.sidebarOpen = false
}
</script>

<style scoped>
aside {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

aside::-webkit-scrollbar {
  width: 6px;
}

aside::-webkit-scrollbar-track {
  background: transparent;
}

aside::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

aside::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.7);
}
</style>
