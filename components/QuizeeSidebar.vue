<template>
  <aside :class="[ui.sidebarCollapsed ? 'w-20' : 'w-64']" class="bg-white border-r h-screen sticky top-0 flex-col py-4 transition-all duration-300 hidden lg:flex">
    <div class="mb-6 flex items-center px-4" :class="[ui.sidebarCollapsed ? 'justify-center' : '']">
      <img src="/logo/modeh-logo.png" alt="Modeh" :class="[ui.sidebarCollapsed ? 'h-8' : 'h-10']" class="transition-all duration-300" />
    </div>

    <nav class="flex-1 w-full" :class="[ui.sidebarCollapsed ? 'px-2' : 'px-2']">
      <ul class="flex flex-col gap-1">
        <li>
          <NuxtLink to="/quizee/dashboard" :class="linkClass('/quizee/dashboard')" title="Dashboard">
            <HomeIcon class="w-5 h-5" />
            <span v-if="!ui.sidebarCollapsed" class="ml-2">Dashboard</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/quizee/quizzes" :class="linkClass('/quizee/quizzes')" title="Quizzes">
            <ClipboardDocumentListIcon class="w-5 h-5" />
            <span v-if="!ui.sidebarCollapsed" class="ml-2">Quizzes</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/quizee/daily-challenges" :class="linkClass('/quizee/daily-challenges')" title="Daily Challenges">
            <CalendarDaysIcon class="w-5 h-5" />
            <span v-if="!ui.sidebarCollapsed" class="ml-2">Daily Challenges</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/quizee/battles" :class="linkClass('/quizee/battles')" title="Battles">
            <TrophyIcon class="w-5 h-5" />
            <span v-if="!ui.sidebarCollapsed" class="ml-2">Battles</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/quizee/tournaments" :class="linkClass('/quizee/tournaments')" title="Tournaments">
            <FlagIcon class="w-5 h-5" />
            <span v-if="!ui.sidebarCollapsed" class="ml-2">Tournaments</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/quizee/points" :class="linkClass('/quizee/points')" title="Points">
            <StarIcon class="w-5 h-5" />
            <span v-if="!ui.sidebarCollapsed" class="ml-2">Points</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/quizee/subscription" :class="linkClass('/quizee/subscription')" title="Subscription">
            <CreditCardIcon class="w-5 h-5" />
            <span v-if="!ui.sidebarCollapsed" class="ml-2">Subscription</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/quizee/chat" :class="linkClass('/quizee/chat')" title="Messages">
            <ChatBubbleLeftRightIcon class="w-5 h-5" />
            <span v-if="!ui.sidebarCollapsed" class="ml-2">Messages</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/quizee/quiz-masters" :class="linkClass('/quizee/quiz-masters')" title="quiz-masters">
            <UserGroupIcon class="w-5 h-5" />
            <span v-if="!ui.sidebarCollapsed" class="ml-2">Quiz Masters</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/quizee/settings" :class="linkClass('/quizee/settings')" title="Settings">
            <CogIcon class="w-5 h-5" />
            <span v-if="!ui.sidebarCollapsed" class="ml-2">Settings</span>
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
          <li><NuxtLink @click="onMobileNavClick" to="/quizee/dashboard" :class="linkClass('/quizee/dashboard')">Dashboard</NuxtLink></li>
          <li><NuxtLink @click="onMobileNavClick" to="/quizee/quizzes" :class="linkClass('/quizee/quizzes')">Quizzes</NuxtLink></li>
          <li><NuxtLink @click="onMobileNavClick" to="/quizee/daily-challenges" :class="linkClass('/quizee/daily-challenges')">Daily Challenges</NuxtLink></li>
          <li><NuxtLink @click="onMobileNavClick" to="/quizee/battles" :class="linkClass('/quizee/battles')">Battles</NuxtLink></li>
          <li><NuxtLink @click="onMobileNavClick" to="/quizee/points" :class="linkClass('/quizee/points')">Points</NuxtLink></li>
          <li><NuxtLink @click="onMobileNavClick" to="/quiz-masters" :class="linkClass('/quiz-masters')">quiz-masters</NuxtLink></li>
          <li><NuxtLink @click="onMobileNavClick" to="/quizee/subscription" :class="linkClass('/quizee/subscription')">Subscription</NuxtLink></li>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'
// Heroicons outline
import { HomeIcon, ClipboardDocumentListIcon, TrophyIcon, FlagIcon, StarIcon, CreditCardIcon, UserGroupIcon, CogIcon, Bars3Icon, XMarkIcon, ChatBubbleLeftRightIcon, CalendarDaysIcon } from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const ui = useUiStore()
const user = computed(() => auth.user || {})
const userAvatar = computed(() => auth.user?.avatar_url || '/logo/avatar-placeholder.png')

const route = useRoute()

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

<style scoped></style>