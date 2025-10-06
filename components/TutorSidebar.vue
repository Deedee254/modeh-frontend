<template>
  <aside :class="[collapsed ? 'w-20' : 'w-64', 'bg-white border-r min-h-screen flex flex-col py-4 transition-all duration-300']">
    <div class="mb-6 flex items-center" :class="{'justify-center': collapsed, 'px-6': !collapsed}">
      <img src="/logo/modeh-logo.png" alt="Modeh" class="h-8 transition-all duration-300" :class="{'h-8': collapsed, 'h-10': !collapsed}" />
      <span v-if="!collapsed" class="ml-3 text-xl font-bold">Modeh</span>
    </div>

    <nav class="flex-1 w-full">
      <ul class="flex flex-col gap-2 px-2">
        <li>
          <NuxtLink to="/tutor/dashboard" :class="linkClass('/tutor/dashboard')" title="Dashboard">
            <HomeIcon class="w-6 h-6" />
            <span v-if="!collapsed" class="ml-3">Dashboard</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/tutor/subjects" :class="linkClass('/tutor/subjects')" title="Subjects">
            <BookOpenIcon class="w-6 h-6" />
            <span v-if="!collapsed" class="ml-3">Subjects</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/tutor/topics" :class="linkClass('/tutor/topics')" title="Topics">
            <RectangleStackIcon class="w-6 h-6" />
            <span v-if="!collapsed" class="ml-3">Topics</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/tutor/quizzes" :class="linkClass('/tutor/quizzes')" title="My Quizzes">
            <ClipboardDocumentListIcon class="w-6 h-6" />
            <span v-if="!collapsed" class="ml-3">My Quizzes</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/tutor/quizzes/create" :class="linkClass('/tutor/quizzes/create')" title="Create Quiz">
            <PlusIcon class="w-6 h-6" />
            <span v-if="!collapsed" class="ml-3">Create Quiz</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/tutor/questions" :class="linkClass('/tutor/questions')" title="Question Bank">
            <QuestionMarkCircleIcon class="w-6 h-6" />
            <span v-if="!collapsed" class="ml-3">Question Bank</span>
          </NuxtLink>
        </li>
        
        <li>
          <NuxtLink to="/tutor/wallet" :class="linkClass('/tutor/wallet')" title="Wallet">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 3v4M8 3v4" />
            </svg>
            <span v-if="!collapsed" class="ml-3">Wallet</span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/tutor/settings" :class="linkClass('/tutor/settings')" title="Settings">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m0 14v1m8-8h1M4 12H3m15.364-6.364l.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span v-if="!collapsed" class="ml-3">Settings</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  <div class="mb-4 w-full px-2">
    <template v-if="user && user.id">
      <NuxtLink to="/tutor/profile" class="p-2 rounded flex items-center w-full" :class="[collapsed ? 'justify-center' : '', 'hover:bg-gray-100']">
        <img :src="userAvatar" class="w-8 h-8 rounded-full" />
        <span v-if="!collapsed" class="ml-3 text-sm font-medium">{{ user.name }}</span>
      </NuxtLink>
    </template>
    <template v-else>
      <NuxtLink to="/login" class="block w-full text-center px-3 py-2 bg-indigo-600 text-white rounded">Login</NuxtLink>
    </template>
  </div>

    <div class="px-2">
    <button @click="toggleCollapse" class="w-full p-2 rounded text-sm text-gray-600 hover:bg-gray-100">
    <XMarkIcon v-if="!collapsed" class="w-4 h-4 inline-block mr-2" />
    <Bars3Icon v-else class="w-4 h-4 inline-block mr-2" />
    <span v-if="!collapsed">Collapse</span>
    </button>
  </div>
  </aside>
  <!-- Mobile drawer -->
  <div v-if="mobileOpen" class="fixed inset-0 z-50 lg:hidden">
    <div class="absolute inset-0 bg-black/40" @click="mobileOpen = false"></div>
    <aside class="absolute left-0 top-0 h-full w-64 bg-white border-r p-4 overflow-auto">
        <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <img src="/logo/modeh-logo.png" alt="Modeh" class="h-8" />
          <span class="ml-3 text-lg font-bold">Modeh</span>
        </div>
        <button @click="mobileOpen = false" class="p-2 rounded hover:bg-gray-100">
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>
      <nav>
        <ul class="flex flex-col gap-2">
          <li><NuxtLink to="/tutor/dashboard" :class="linkClass('/tutor/dashboard')">Dashboard</NuxtLink></li>
          <li><NuxtLink to="/tutor/subjects" :class="linkClass('/tutor/subjects')">Subjects</NuxtLink></li>
          <li><NuxtLink to="/tutor/topics" :class="linkClass('/tutor/topics')">Topics</NuxtLink></li>
          <li><NuxtLink to="/tutor/quizzes" :class="linkClass('/tutor/quizzes')">My Quizzes</NuxtLink></li>
          <li><NuxtLink to="/tutor/quizzes/create" :class="linkClass('/tutor/quizzes/create')">Create Quiz</NuxtLink></li>
          <li><NuxtLink to="/tutor/questions" :class="linkClass('/tutor/questions')">Question Bank</NuxtLink></li>
          <li><NuxtLink to="/tutor/wallet" :class="linkClass('/tutor/wallet')">Wallet</NuxtLink></li>
          <li><NuxtLink to="/tutor/settings" :class="linkClass('/tutor/settings')">Settings</NuxtLink></li>
        </ul>
      </nav>
      <div class="mt-6">
        <NuxtLink to="/tutor/profile" class="flex items-center gap-3">
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
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
// Heroicons outline
import { HomeIcon, BookOpenIcon, RectangleStackIcon, ClipboardDocumentListIcon, PlusIcon, QuestionMarkCircleIcon, Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const user = computed(() => auth.user || {})
const userAvatar = computed(() => auth.user?.avatar_url || '/logo/avatar-placeholder.png')

const collapsed = ref(false)
const STORAGE_KEY = 'sidebar:collapsed:tutor'
const route = useRoute()
const mobileOpen = ref(false)
const MOBILE_KEY = 'sidebar:mobileOpen:tutor'

function linkClass(path) {
  const active = route.path.startsWith(path)
  return [
    'p-3 rounded flex items-center text-gray-700 transition-colors',
    collapsed.value ? 'justify-center' : '',
    active ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
  ]
}

function toggleCollapse() {
  collapsed.value = !collapsed.value
  // persist preference across reloads
  if (process.client) {
    try { localStorage.setItem(STORAGE_KEY, String(collapsed.value)) } catch (e) {}
  }
}

if (process.client) {
  // restore persisted collapsed state if available, otherwise default to small-screen behaviour
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== null) {
      collapsed.value = raw === 'true'
    } else {
      if (window.innerWidth < 768) collapsed.value = true
    }
  } catch (e) {
    if (window.innerWidth < 768) collapsed.value = true
  }

  window.addEventListener('toggle-sidebar', () => {
    // small screens use drawer, larger screens toggle collapse
    if (window.innerWidth < 1024) {
      mobileOpen.value = !mobileOpen.value
    } else {
      toggleCollapse()
    }
  })

  // also keep collapse default for very small viewports if no persisted value
}

// persist mobile drawer changes
watch(mobileOpen, (v) => {
  if (process.client) {
    try { localStorage.setItem(MOBILE_KEY, String(v)) } catch (e) {}
  }
})
</script>

<style scoped>
.transition-width {
  transition: width 0.3s ease-in-out;
}
</style>
