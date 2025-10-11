<template>
  <header class="bg-white border-b">
    <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <NuxtLink to="/" class="text-2xl font-bold">Modeh</NuxtLink>
        <nav class="hidden md:flex gap-4 text-sm">
          <NuxtLink to="/subjects" class="text-gray-600 hover:text-gray-900">Subjects</NuxtLink>
          <NuxtLink to="/topics" class="text-gray-600 hover:text-gray-900">Topics</NuxtLink>
          <NuxtLink to="/quizzes" class="text-gray-600 hover:text-gray-900">Quizzes</NuxtLink>
          <NuxtLink to="/quizee/battles" class="text-gray-600 hover:text-gray-900">Battles</NuxtLink>
          <NuxtLink to="/pricing" class="text-gray-600 hover:text-gray-900">Pricing</NuxtLink>
          <NuxtLink to="/quiz-masters" class="text-gray-600 hover:text-gray-900">quiz-masters</NuxtLink>
          <NuxtLink to="/about" class="text-gray-600 hover:text-gray-900">About</NuxtLink>
        </nav>
        <button @click="showMobileMenu = !showMobileMenu" class="md:hidden">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>
      </div>

      <div v-if="showMobileMenu" class="absolute top-16 left-0 w-full bg-white border-b md:hidden">
        <nav class="flex flex-col gap-4 p-4">
          <NuxtLink to="/subjects" class="text-gray-600 hover:text-gray-900">Subjects</NuxtLink>
          <NuxtLink to="/topics" class="text-gray-600 hover:text-gray-900">Topics</NuxtLink>
          <NuxtLink to="/quizzes" class="text-gray-600 hover:text-gray-900">Quizzes</NuxtLink>
          <NuxtLink to="/quizee/battles" class="text-gray-600 hover:text-gray-900">Battles</NuxtLink>
          <NuxtLink to="/pricing" class="text-gray-600 hover:text-gray-900">Pricing</NuxtLink>
          <NuxtLink to="/quiz-masters" class="text-gray-600 hover:text-gray-900">quiz-masters</NuxtLink>
          <NuxtLink to="/about" class="text-gray-600 hover:text-gray-900">About</NuxtLink>
        </nav>
      </div>

      <div class="flex items-center gap-3">
        <ThemeToggle />
        <template v-if="!isAuthed">
          <NuxtLink to="/login" class="px-3 py-1 border rounded text-sm">Sign in</NuxtLink>
          <NuxtLink to="/register?role=quizee" class="px-3 py-1 bg-blue-600 text-white rounded text-sm">Get started</NuxtLink>
        </template>
        <template v-else>
          <div class="relative">
            <button @click="showDropdown = !showDropdown" class="flex items-center gap-2 px-3 py-1 border rounded text-sm hover:bg-gray-50">
              <div class="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold">
                {{ userInitials }}
              </div>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <div v-if="showDropdown" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border">
              <div class="py-1">
                <NuxtLink :to="profileLink" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</NuxtLink>
                <button @click="logout" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <!-- banner intentionally removed per request -->
  </header>
</template>

<script setup>
import ThemeToggle from '~/components/ThemeToggle.vue'
import { ref, computed } from 'vue'

const auth = useAuthStore?.() || null
const isAuthed = computed(() => !!(auth && auth.user && Object.keys(auth.user).length))
const showDropdown = ref(false)
const showMobileMenu = ref(false)

const userInitials = computed(() => {
  if (!auth?.user) return 'U'
  const name = auth.user.name || auth.user.email || ''
  return name.charAt(0).toUpperCase()
})

const profileLink = computed(() => {
  if (!auth?.user) return '/'
  const role = auth.user.role || 'quizee'
  return role === 'quiz-master' ? '/quiz-master/profile' : '/quizee/profile'
})

function logout() {
  // Assuming auth store has logout method
  if (auth && auth.logout) {
    auth.logout()
  }
  // Redirect to home or login
  navigateTo('/')
}
</script>
