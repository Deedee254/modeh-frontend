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
                    <NuxtLink to="/levels" class="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 py-2 px-2 rounded-md transition">
                      <span>Levels</span>
                      <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </NuxtLink>

                    <transition name="fade">
                      <div v-if="showQuizzesDropdown" class="absolute top-full left-0 mt-2 w-60 bg-white dark:bg-slate-800 rounded-md shadow-lg z-50 border dark:border-slate-700 p-3">
                        <div class="max-h-64 overflow-auto">
                          <ul class="space-y-1">
                            <li v-for="lvl in headerLevels" :key="lvl.id">
                              <NuxtLink :to="`/levels/${lvl.id}`" class="block px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700" @click="showQuizzesDropdown=false">{{ lvl.name }}</NuxtLink>
                            </li>
                            <li v-if="!headerLevels || headerLevels.length === 0" class="text-sm text-slate-500 px-2 py-1">No levels found</li>
                          </ul>
                        </div>
                        <div class="border-t mt-2 pt-2">
                          <NuxtLink to="/courses" class="block text-sm px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700" @click="showQuizzesDropdown=false">Courses</NuxtLink>
                        </div>
                      </div>
                    </transition>
                  </div>

                      <!-- Categories dropdown -->
                      <div class="relative" @mouseenter="showCategoriesDropdown = true" @mouseleave="showCategoriesDropdown = false">
                        <button class="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 py-2 px-2 rounded-md transition">
                          <span>Categories</span>
                          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>

                        <transition name="fade">
                          <div v-if="showCategoriesDropdown" class="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg z-50 border dark:border-slate-700 p-3">
                            <ul class="space-y-1">
                              <li>
                                <NuxtLink to="/grades" class="block px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">Grades</NuxtLink>
                              </li>
                              <li>
                                <NuxtLink to="/subjects" class="block px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">Subjects</NuxtLink>
                              </li>
                              <li>
                                <NuxtLink to="/topics" class="block px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">Topics</NuxtLink>
                              </li>
                              <li>
                                <NuxtLink to="/quizzes" class="block px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">Quizzes</NuxtLink>
                              </li>
                            </ul>
                          </div>
                        </transition>
                      </div>

          <NuxtLink to="/quiz-masters" class="hover:text-blue-600 dark:hover:text-blue-400 py-2">Quiz Masters</NuxtLink>
          <NuxtLink to="/pricing" class="hover:text-blue-600 dark:hover:text-blue-400 py-2">Pricing</NuxtLink>
        </nav>

        <!-- Auth buttons and User menu (hidden on institution-manager pages to avoid duplicate profile controls) -->
        <div class="flex items-center gap-3">
                  <AccountMenu v-if="!route.path.startsWith('/institution-manager')" :is-authed="isAuthed" :user-initials="userInitials" :profile-link="profileLink" @logout="logout" />
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
              <NuxtLink v-if="!isAuthed" to="/levels" class="block p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-center" @click="closeMobileMenu">
                <div class="font-semibold">Levels</div>
                <div class="text-xs text-slate-500">Browse by level</div>
              </NuxtLink>
              <NuxtLink to="/courses" class="block p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-center" @click="closeMobileMenu">
                <div class="font-semibold">Courses</div>
                <div class="text-xs text-slate-500">Tertiary courses</div>
              </NuxtLink>
              <div class="relative">
                <button @click="showMobileCategoriesDropdown = !showMobileCategoriesDropdown" class="block w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-center">
                  <div class="font-semibold">Categories</div>
                  <div class="text-xs text-slate-500">Browse categories</div>
                </button>
                <transition name="fade">
                  <div v-if="showMobileCategoriesDropdown" class="absolute top-full left-0 mt-2 w-full bg-white dark:bg-slate-800 rounded-md shadow-lg z-50 border dark:border-slate-700 p-3">
                    <ul class="space-y-1">
                      <li>
                        <NuxtLink to="/grades" class="block px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700" @click="closeMobileMenu">Grades</NuxtLink>
                      </li>
                      <li>
                        <NuxtLink to="/subjects" class="block px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700" @click="closeMobileMenu">Subjects</NuxtLink>
                      </li>
                      <li>
                        <NuxtLink to="/topics" class="block px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700" @click="closeMobileMenu">Topics</NuxtLink>
                      </li>
                      <li>
                        <NuxtLink to="/quizzes" class="block px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700" @click="closeMobileMenu">Quizzes</NuxtLink>
                      </li>
                    </ul>
                  </div>
                </transition>
              </div>
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
            <div class="flex gap-3">
              <NuxtLink to="/login" class="flex-1 text-center px-4 py-3 border rounded text-sm">Login</NuxtLink>
              <NuxtLink to="/register?role=quizee" class="flex-1 text-center px-4 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700">Register</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import AccountMenu from '~/components/AccountMenu.vue'
import { useRoute } from '#imports'
import useTaxonomy from '~/composables/useTaxonomy'
import { useAuthStore } from '~/stores/auth'
import { useInstitutionsStore } from '~/stores/institutions'

const auth = useAuthStore()
const isAuthed = computed(() => !!(auth && auth.user && Object.keys(auth.user).length))
const showDropdown = ref(false)
const showMobileMenu = ref(false)
const showQuizzesDropdown = ref(false)
const showCategoriesDropdown = ref(false)
const showMobileCategoriesDropdown = ref(false)
const showSearch = ref(false)
const route = useRoute()
// account menu functionality moved into AccountMenu component

// preload taxonomy levels so unauthenticated users can navigate to levels/filters
const { fetchLevels, levels, headerLevels } = useTaxonomy()
onMounted(async () => {
  try {
    await fetchLevels()
  } catch (e) {
    // non-fatal: navigation can still work without levels
    console.debug('Failed to preload levels in header', e)
  }
})

const userInitials = computed(() => {
  if (!auth?.user) return 'U'
  const name = auth.user.name || auth.user.email || ''
  return name.charAt(0).toUpperCase()
})

const instStore = useInstitutionsStore()

const profileLink = computed(() => {
  if (!auth?.user) return '/' 
  // If user is an institution manager or belongs to institutions, route to institution manager profile
  if (auth.user.role === 'institution-manager' || (auth.user.institutions && Array.isArray(auth.user.institutions) && auth.user.institutions.length > 0)) {
    const qs = instStore.activeInstitutionSlug ? { institutionSlug: String(instStore.activeInstitutionSlug) } : {}
    return { path: '/institution-manager/profile', query: qs }
  }
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
