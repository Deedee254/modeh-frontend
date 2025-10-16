<template>
  <header class="bg-white dark:bg-slate-800 border-b dark:border-slate-700 relative shadow-md">
    <!-- Top bar -->
    <div class="bg-slate-900 text-white py-2 px-4">
      <div class="max-w-6xl mx-auto flex justify-between items-center text-xs">
        <div class="flex items-center gap-3">
          <span>info@modeh.com</span>
          <span>+1 234 567 890</span>
        </div>
        <div class="flex items-center gap-4">
          <a href="#" class="hover:text-slate-300">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" /></svg>
          </a>
          <a href="#" class="hover:text-slate-300">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
          </a>
        </div>
      </div>
    </div>

    <!-- Main header -->
  <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center">
        <NuxtLink to="/" class="flex items-center gap-2">
          <!-- slightly smaller logo for compact header -->
          <img src="/logo/modeh-logo.png" alt="Modeh" class="h-12 w-auto" />
        </NuxtLink>
      </div>

      <!-- Search bar -->
  <div class="flex-1 flex justify-center px-6 hidden md:flex">
        <div class="w-full max-w-md">
          <div class="relative">
            <input type="search" placeholder="Search for quizzes, topics..." class="w-full pl-10 pr-4 py-2 border rounded-full bg-slate-50 dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            <div class="absolute left-3 top-1/2 -translate-y-1/2">
              <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side -->
  <div class="flex items-center gap-3">
        <!-- Desktop Navigation -->
          <nav class="hidden md:flex gap-3 text-sm font-medium text-slate-700 dark:text-slate-300 items-center">
          <div class="relative" @mouseenter="showQuizzesDropdown = true" @mouseleave="showQuizzesDropdown = false">
            <NuxtLink to="/quizzes" class="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 py-2 px-2 rounded-md transition">
              <span>Quizzes</span>
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </NuxtLink>

            <!-- Modern dropdown card (larger, 4-column layout) -->
            <transition name="fade">
              <div v-if="showQuizzesDropdown" class="absolute top-full left-1/2 mt-4 -translate-x-1/2 w-[95vw] max-w-5xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl z-50 border dark:border-slate-700 py-6 px-6">
                <!-- responsive: 1 col (xs), 2 cols (sm), 4 cols (md+) -->
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  <NuxtLink to="/quizzes" class="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 min-h-[72px]" @click="showQuizzesDropdown = false">
                    <div class="w-12 h-12 bg-indigo-100 text-indigo-700 rounded flex items-center justify-center font-semibold text-lg">Q</div>
                    <div>
                      <div class="text-base font-semibold text-slate-800 dark:text-slate-100">All Quizzes</div>
                      <div class="text-sm text-slate-500 dark:text-slate-400">Browse and discover quizzes</div>
                    </div>
                  </NuxtLink>

                  <NuxtLink to="/grades" class="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 min-h-[72px]" @click="showQuizzesDropdown = false">
                    <div class="w-12 h-12 bg-indigo-50 text-indigo-700 rounded flex items-center justify-center font-semibold text-lg">G</div>
                    <div>
                      <div class="text-base font-semibold text-slate-800 dark:text-slate-100">Grades</div>
                      <div class="text-sm text-slate-500 dark:text-slate-400">Find quizzes by grade level</div>
                    </div>
                  </NuxtLink>

                  <NuxtLink to="/subjects" class="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 min-h-[72px]" @click="showQuizzesDropdown = false">
                    <div class="w-12 h-12 bg-emerald-50 text-emerald-700 rounded flex items-center justify-center font-semibold text-lg">S</div>
                    <div>
                      <div class="text-base font-semibold text-slate-800 dark:text-slate-100">Subjects</div>
                      <div class="text-sm text-slate-500 dark:text-slate-400">Browse by subject</div>
                    </div>
                  </NuxtLink>

                  <NuxtLink to="/topics" class="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 min-h-[72px]" @click="showQuizzesDropdown = false">
                    <div class="w-12 h-12 bg-amber-50 text-amber-700 rounded flex items-center justify-center font-semibold text-lg">T</div>
                    <div>
                      <div class="text-base font-semibold text-slate-800 dark:text-slate-100">Topics</div>
                      <div class="text-sm text-slate-500 dark:text-slate-400">Narrow down to topics</div>
                    </div>
                  </NuxtLink>
                </div>
                <div class="mt-6 pt-4 border-t dark:border-t-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <NuxtLink to="/quizee/quizzes" class="inline-block w-full sm:w-auto text-sm px-4 py-2 bg-indigo-600 text-white rounded-md text-center" @click="showQuizzesDropdown = false">Take a quiz</NuxtLink>
                  <NuxtLink to="/quizzes" class="inline-block w-full sm:w-auto text-sm px-4 py-2 border rounded-md text-center" @click="showQuizzesDropdown = false">Browse quizzes</NuxtLink>
                </div>
              </div>
            </transition>
          </div>

          <NuxtLink to="/quiz-masters" class="hover:text-blue-600 dark:hover:text-blue-400 py-2">Quiz Masters</NuxtLink>
          <NuxtLink to="/pricing" class="hover:text-blue-600 dark:hover:text-blue-400 py-2">Pricing</NuxtLink>
        </nav>

        <!-- Auth buttons and User menu -->
        <div class="flex items-center gap-3">
          <ThemeToggle />
          <template v-if="!isAuthed">
            <NuxtLink to="/register?role=quizee" class="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700">Register</NuxtLink>
          </template>
          <template v-else>
            <div class="relative">
              <button @click="showDropdown = !showDropdown" class="flex items-center gap-2">
                <div class="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center font-semibold text-slate-700 dark:text-slate-200">
                  {{ userInitials }}
                </div>
                <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div v-if="showDropdown" class="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg z-50 border dark:border-slate-700">
                <div class="py-1">
                  <NuxtLink :to="profileLink" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Profile</NuxtLink>
                  <button @click="logout" class="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Logout</button>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Mobile menu button -->
    <div class="flex items-center md:hidden">
      <button @click="showSearch = !showSearch" class="mr-3">
        <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </button>
      <button @click="showMobileMenu = !showMobileMenu" class="relative z-60">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
      </button>
    </div>
      </div>
    </div>

    <!-- Mobile Search -->
    <div v-if="showSearch" class="md:hidden px-4 pb-4">
        <div class="relative">
            <input type="search" placeholder="Search..." class="w-full pl-10 pr-4 py-2 border rounded-full bg-slate-50 dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            <div class="absolute left-3 top-1/2 -translate-y-1/2">
                <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
        </div>
    </div>

    <!-- Mobile Menu -->
    <transition name="fade">
      <div v-if="showMobileMenu" class="absolute top-0 left-0 w-full h-screen bg-white dark:bg-slate-900 z-50 md:hidden">
        <div class="p-4">
          <div class="flex justify-between items-center">
            <NuxtLink to="/" class="flex items-center gap-2">
                <img src="/logo/modeh-logo.png" alt="Modeh" class="h-10 w-auto" />
            </NuxtLink>
            <button @click="closeMobileMenu">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <nav class="mt-6">
            <div class="grid grid-cols-2 gap-3">
              <NuxtLink to="/quizzes" class="block p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-center" @click="closeMobileMenu">
                <div class="font-semibold">Quizzes</div>
                <div class="text-xs text-slate-500">All quizzes</div>
              </NuxtLink>
              <NuxtLink to="/grades" class="block p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-center" @click="closeMobileMenu">
                <div class="font-semibold">Grades</div>
                <div class="text-xs text-slate-500">By grade</div>
              </NuxtLink>
              <NuxtLink to="/subjects" class="block p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-center" @click="closeMobileMenu">
                <div class="font-semibold">Subjects</div>
                <div class="text-xs text-slate-500">Browse subjects</div>
              </NuxtLink>
              <NuxtLink to="/topics" class="block p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-center" @click="closeMobileMenu">
                <div class="font-semibold">Topics</div>
                <div class="text-xs text-slate-500">Narrow topics</div>
              </NuxtLink>
              <NuxtLink to="/quiz-masters" class="block p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-center" @click="closeMobileMenu">
                <div class="font-semibold">Quiz Masters</div>
                <div class="text-xs text-slate-500">Our creators</div>
              </NuxtLink>
              <NuxtLink to="/pricing" class="block p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-center" @click="closeMobileMenu">
                <div class="font-semibold">Pricing</div>
                <div class="text-xs text-slate-500">Plans & pricing</div>
              </NuxtLink>
            </div>
          </nav>
          <div class="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <NuxtLink to="/register?role=quizee" class="block w-full text-center px-4 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700">Register</NuxtLink>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import ThemeToggle from '~/components/ThemeToggle.vue'
import { ref, computed, watch } from 'vue'
import { useRoute } from '#imports'

const auth = useAuthStore?.() || null
const isAuthed = computed(() => !!(auth && auth.user && Object.keys(auth.user).length))
const showDropdown = ref(false)
const showMobileMenu = ref(false)
const showQuizzesDropdown = ref(false)
const showSearch = ref(false)
const route = useRoute()

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

function closeMobileMenu() {
  showMobileMenu.value = false
}

watch(
  () => route.fullPath,
  () => {
    closeMobileMenu()
  }
)

function logout() {
  // Assuming auth store has logout method
  if (auth && auth.logout) {
    auth.logout()
  }
  // Redirect to home or login
  closeMobileMenu()
  navigateTo('/')
}
</script>
