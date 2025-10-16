<template>
  <aside :class="[collapsed ? 'w-20' : 'w-64']" class="bg-white border-r h-screen sticky top-0 flex flex-col py-4 transition-all duration-300">
    <div class="mb-6 flex items-center px-4" :class="[collapsed ? 'justify-center' : '']">
      <img src="/logo/modeh-logo.png" alt="Modeh" :class="[collapsed ? 'h-8' : 'h-10']" class="transition-all duration-300" />
    </div>

    <nav class="flex-1 w-full" :class="[collapsed ? 'px-0' : 'px-2']">
      <ul class="flex flex-col gap-1 px-2">
          <li>
            <NuxtLink to="/quiz-master/dashboard" :class="linkClass('/quiz-master/dashboard')" title="Dashboard">
              <HomeIcon class="w-5 h-5" />
              <span class="ml-2 nav-label">Dashboard</span>
            </NuxtLink>
          </li>

        <li>
          <NuxtLink to="/quiz-master/subjects" :class="linkClass('/quiz-master/subjects')" title="Subjects">
            <BookOpenIcon class="w-5 h-5" />
            <span class="ml-2 nav-label">Subjects</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/quiz-master/topics" :class="linkClass('/quiz-master/topics')" title="Topics">
            <RectangleStackIcon class="w-5 h-5" />
            <span class="ml-2 nav-label">Topics</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/quiz-master/quizzes" :class="linkClass('/quiz-master/quizzes')" title="My Quizzes">
            <ClipboardDocumentListIcon class="w-5 h-5" />
            <span class="ml-2 nav-label">My Quizzes</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/quiz-master/quizzes/create" :class="linkClass('/quiz-master/quizzes/create')" title="Create Quiz">
            <PlusIcon class="w-5 h-5" />
            <span class="ml-2 nav-label">Create Quiz</span>
          </NuxtLink>
        </li>


        <li>
          <NuxtLink to="/quiz-master/questions" :class="linkClass('/quiz-master/questions')" title="Question Bank">
            <QuestionMarkCircleIcon class="w-5 h-5" />
            <span class="ml-2 nav-label">Question Bank</span>
          </NuxtLink>
        </li>
        
        <li>
          <NuxtLink to="/quiz-master/wallet" :class="linkClass('/quiz-master/wallet')" title="Wallet">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 3v4M8 3v4" />
            </svg> 
            <span class="ml-2 nav-label">Wallet</span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/quiz-master/settings" :class="linkClass('/quiz-master/settings')" title="Settings">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m0 14v1m8-8h1M4 12H3m15.364-6.364l.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span class="ml-2 nav-label">Settings</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  <!-- Desktop profile removed to avoid duplication with TopBar; profile remains in mobile drawer -->

    <div class="px-2">
    <button @click="toggleCollapse" class="w-full p-2 rounded text-sm text-gray-600 hover:bg-gray-100 flex items-center" :class="[collapsed ? 'justify-center' : '']">
      <XMarkIcon v-if="!collapsed" class="w-4 h-4 inline-block mr-2" />
      <Bars3Icon v-else class="w-4 h-4 inline-block" />
      <span v-if="!collapsed">Collapse</span>
    </button>
  </div>
  </aside>
  <!-- Mobile drawer -->
  <div v-if="sidebarMobileOpen" class="fixed inset-0 z-50 lg:hidden">
    <div class="absolute inset-0 bg-black/40" @click="setSidebar(false)"></div>
  <aside class="absolute left-0 top-0 h-screen w-64 bg-white border-r p-4 overflow-auto">
        <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <img src="/logo/modeh-logo.png" alt="Modeh" class="h-8" />
        </div>
        <button @click="setSidebar(false)" class="p-2 rounded hover:bg-gray-100">
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>
      <nav>
        <ul class="flex flex-col gap-2">
          <li><NuxtLink @click="onMobileNavClick" to="/quiz-master/dashboard" :class="linkClass('/quiz-master/dashboard')">Dashboard</NuxtLink></li>
          <li><NuxtLink @click="onMobileNavClick" to="/quiz-master/subjects" :class="linkClass('/quiz-master/subjects')">Subjects</NuxtLink></li>
          <li><NuxtLink @click="onMobileNavClick" to="/quiz-master/topics" :class="linkClass('/quiz-master/topics')">Topics</NuxtLink></li>
          <li><NuxtLink @click="onMobileNavClick" to="/quiz-master/quizzes" :class="linkClass('/quiz-master/quizzes')">My Quizzes</NuxtLink></li>
          <li><NuxtLink @click="onMobileNavClick" to="/quiz-master/quizzes/create" :class="linkClass('/quiz-master/quizzes/create')">Create Quiz</NuxtLink></li>
          <li><NuxtLink @click="onMobileNavClick" to="/quiz-master/questions" :class="linkClass('/quiz-master/questions')">Question Bank</NuxtLink></li>
          <li><NuxtLink @click="onMobileNavClick" to="/quiz-master/wallet" :class="linkClass('/quiz-master/wallet')">Wallet</NuxtLink></li>
          <li><NuxtLink @click="onMobileNavClick" to="/quiz-master/settings" :class="linkClass('/quiz-master/settings')">Settings</NuxtLink></li>
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
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
// Heroicons outline
import { HomeIcon, BookOpenIcon, RectangleStackIcon, ClipboardDocumentListIcon, PlusIcon, QuestionMarkCircleIcon, Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const user = computed(() => auth.user || {})
const userAvatar = computed(() => auth.user?.avatar_url || '/logo/avatar-placeholder.png')

const collapsed = ref(false)
const STORAGE_KEY = 'sidebar:collapsed:quiz-master'
const route = useRoute()
const { sidebarMobileOpen, toggleSidebar, setSidebar } = useSidebar()

function linkClass(path) {
  const active = route.path.startsWith(path)
  return [
    'p-3 rounded flex items-center text-gray-700 transition-colors',
    active ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100',
    collapsed.value ? 'justify-center' : ''
  ]
}

function toggleCollapse() {
  collapsed.value = !collapsed.value
  if (process.client) {
    try { localStorage.setItem(STORAGE_KEY, String(collapsed.value)) } catch (e) {}
  }
}

if (process.client) {
  onMounted(() => {
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
      if (window.innerWidth < 1024) {
        toggleSidebar()
      } else {
        toggleCollapse()
      }
    })
  })
}

function onMobileNavClick() {
  setSidebar(false)
  try { window.dispatchEvent(new CustomEvent('sidebar-closed')) } catch (e) {}
}
</script>

<style scoped>
.nav-label {
  display: v-bind("collapsed ? 'none' : ''");
}
</style>
