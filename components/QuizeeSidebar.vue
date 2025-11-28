<template>
  <div>
  <aside :class="[ui.sidebarCollapsed ? 'w-20' : 'w-64', 'bg-white border-r flex flex-col py-4 transition-all duration-300 hidden lg:flex sticky']" :style="{ top: 'var(--topbar-height)', height: 'calc(100vh - var(--topbar-height))' }">
    <div class="mb-6 flex items-center px-4" :class="[ui.sidebarCollapsed ? 'justify-center' : '']">
      <img src="/logo/modeh-logo.png" alt="Modeh" :class="[ui.sidebarCollapsed ? 'h-8' : 'h-10']" class="transition-all duration-300" />
    </div>

  <nav class="flex-1 w-full overflow-y-auto" :class="[ui.sidebarCollapsed ? 'px-2' : 'px-2']">
      <ul class="flex flex-col gap-1">
        <li v-for="item in navItems" :key="item.to">
          <NuxtLink :to="item.to" :class="linkClass(item.to)" :title="item.label">
            <component :is="item.icon" class="w-5 h-5" />
            <span v-if="!ui.sidebarCollapsed" class="ml-2">{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  <!-- Profile shown in the mobile drawer only to avoid duplication with the TopBar on desktop -->

    <div class="px-2 mt-auto" />
  </aside>
  <!-- Mobile drawer -->
  <div v-if="ui.sidebarOpen" class="fixed inset-0 z-50 lg:hidden">
    <div class="absolute inset-0 bg-black/40" @click="ui.sidebarOpen = false"></div>
  <aside class="absolute left-0 top-0 h-screen w-64 bg-white border-r p-4 overflow-auto">
        <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <img src="/logo/modeh-logo.png" alt="Modeh" class="h-8" />
        </div>
        <button @click="ui.sidebarOpen = false" class="p-2 rounded hover:bg-gray-100">
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>
      <nav>
        <ul class="flex flex-col gap-2">
          <li v-for="item in navItems" :key="item.to">
            <NuxtLink @click="onMobileNavClick" :to="item.to" :class="linkClass(item.to)">
              <component :is="item.icon" class="w-5 h-5 inline-block mr-2" />
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
      <div class="mt-6">
        <NuxtLink to="/quizee/profile" class="flex items-center gap-3">
          <img :src="userAvatar" class="w-8 h-8 rounded-full" />
          <div>
            <div class="font-medium">{{ user.name }}</div>
            <div class="text-sm text-gray-500">View profile</div>
          </div>
        </NuxtLink>
      </div>
    </aside>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'
// Heroicons outline
import { HomeIcon, ClipboardDocumentListIcon, TrophyIcon, FlagIcon, StarIcon, CreditCardIcon, UserGroupIcon, CogIcon, Bars3Icon, XMarkIcon, ChatBubbleLeftRightIcon, CalendarDaysIcon, LinkIcon } from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const ui = useUiStore()
const user = computed(() => auth.user || {})
import { resolveAssetUrl } from '~/composables/useAssets'
// Prefer `avatar_url` then `avatar`, resolve any relative backend path
const userAvatar = computed(() => resolveAssetUrl(auth.user?.avatar_url || auth.user?.avatar) || '/logo/avatar-placeholder.png')

const route = useRoute()

const navItems = [
  { to: '/quizee/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/quizee/quizzes', label: 'Quizzes', icon: ClipboardDocumentListIcon },
  { to: '/quizee/daily-challenges', label: 'Daily Challenges', icon: CalendarDaysIcon },
  { to: '/quizee/battles', label: 'Battles', icon: TrophyIcon },
  { to: '/quizee/tournaments', label: 'Tournaments', icon: FlagIcon },
  { to: '/quizee/leaderboard', label: 'Leaderboard', icon: TrophyIcon },
  // Link to the daily challenge leaderboard (placed below the main leaderboard)
  { to: '/quizee/daily-challenges/leaderboard', label: 'Daily Challenge Leaderboard', icon: CalendarDaysIcon },
  { to: '/quizee/points', label: 'Points', icon: StarIcon },
  { to: '/quizee/badges', label: 'Badges', icon: StarIcon },
  { to: '/quizee/subscription', label: 'Subscription', icon: CreditCardIcon },
  { to: '/quizee/affiliate', label: 'Affiliate Program', icon: LinkIcon },
  { to: '/quizee/chat', label: 'Messages', icon: ChatBubbleLeftRightIcon },
  { to: '/quizee/quiz-masters', label: 'Quiz Masters', icon: UserGroupIcon },
  { to: '/quizee/settings', label: 'Settings', icon: CogIcon },
]

function linkClass(path) {
  const active = route.path.startsWith(path)
  return [
    'p-3 rounded flex items-center text-gray-700 transition-colors w-full',
    active ? 'bg-brand-100 text-brand-700' : 'hover:bg-gray-100',
    ui.sidebarCollapsed ? 'justify-center' : ''
  ]
}

function onMobileNavClick() {
  ui.sidebarOpen = false
}
</script>

<style scoped></style>
