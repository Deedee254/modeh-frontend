<template>
  <div>
  <aside :class="[ui.sidebarCollapsed ? 'w-20' : 'w-64']" class="bg-white border-r h-screen sticky top-0 flex-col py-4 transition-all duration-300 hidden lg:flex">
    <div class="mb-6 flex items-center px-4" :class="[ui.sidebarCollapsed ? 'justify-center' : '']">
      <img src="/logo/modeh-logo.png" alt="Modeh" :class="[ui.sidebarCollapsed ? 'h-8' : 'h-10']" class="transition-all duration-300" />
    </div>

    <nav class="flex-1 w-full px-2">
      <ul class="flex flex-col gap-1">
        <li v-for="item in navItems" :key="item.to">
          <NuxtLink :to="item.to" :class="linkClass(item.to)" :title="item.label">
            <component :is="item.icon" class="w-5 h-5" />
            <span v-if="!ui.sidebarCollapsed" class="ml-2">{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  <!-- Desktop profile removed to avoid duplication with TopBar; profile remains in mobile drawer -->

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
        <template v-if="user && user.id">
          <NuxtLink to="/quiz-master/profile" class="flex items-center gap-3">
            <img :src="userAvatar" class="w-8 h-8 rounded-full" />
            <div>
              <div class="font-medium">{{ user.name }}</div>
              <div class="text-sm text-gray-500">View profile</div>
            </div>
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="block w-full text-center px-3 py-2 bg-indigo-600 text-white rounded">Login</NuxtLink>
        </template>
      </div>
    </aside>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'
// Heroicons outline
import { HomeIcon, BookOpenIcon, RectangleStackIcon, ClipboardDocumentListIcon, PlusIcon, QuestionMarkCircleIcon, Bars3Icon, XMarkIcon, ChatBubbleLeftRightIcon, CreditCardIcon, CogIcon, LinkIcon } from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const ui = useUiStore()
const user = computed(() => auth.user || {})
import { resolveAssetUrl } from '~/composables/useAssets'
const userAvatar = computed(() => resolveAssetUrl(auth.user?.avatar_url || '/logo/avatar-placeholder.png') || '/logo/avatar-placeholder.png')

const route = useRoute()

const navItems = [
  { to: '/quiz-master/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/quiz-master/subjects', label: 'Subjects', icon: BookOpenIcon },
  { to: '/quiz-master/topics', label: 'Topics', icon: RectangleStackIcon },
  { to: '/quiz-master/quizzes', label: 'My Quizzes', icon: ClipboardDocumentListIcon },
  { to: '/quiz-master/quizzes/create', label: 'Create Quiz', icon: PlusIcon },
  { to: '/quiz-master/questions', label: 'Question Bank', icon: QuestionMarkCircleIcon },
  { to: '/quiz-master/chat', label: 'Chat', icon: ChatBubbleLeftRightIcon },
  { to: '/quiz-master/wallet', label: 'Wallet', icon: CreditCardIcon },
  { to: '/quiz-master/affiliate', label: 'Affiliate Program', icon: LinkIcon },
  { to: '/quiz-master/settings', label: 'Settings', icon: CogIcon },
]

function linkClass(path) {
  const active = route.path.startsWith(path)
  return [
    'p-3 rounded flex items-center text-gray-700 transition-colors w-full',
    active ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100',
    ui.sidebarCollapsed ? 'justify-center' : ''
  ]
}

function onMobileNavClick() {
  ui.sidebarOpen = false
}
</script>
