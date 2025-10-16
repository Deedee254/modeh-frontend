<template>
  <aside ref="asideRef" class="w-64 w-20 bg-white border-r h-screen sticky top-0 flex flex-col py-4 transition-all duration-300">
    <div class="mb-6 flex items-center px-6">
      <img src="/logo/modeh-logo.png" alt="Modeh" class="h-8 h-10 transition-all duration-300" />
    </div>

    <nav class="flex-1 w-full">
      <ul class="flex flex-col gap-1 px-2">
        <li>
          <NuxtLink to="/quizee/dashboard" :class="linkClass('/quizee/dashboard')" title="Dashboard">
            <HomeIcon class="w-5 h-5" />
            <span class="ml-2 nav-label">Dashboard</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/quizee/quizzes" :class="linkClass('/quizee/quizzes')" title="Quizzes">
            <ClipboardDocumentListIcon class="w-5 h-5" />
            <span class="ml-2 nav-label">Quizzes</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/quizee/daily-challenges" :class="linkClass('/quizee/daily-challenges')" title="Daily Challenges">
            <CalendarDaysIcon class="w-5 h-5" />
            <span class="ml-2 nav-label">Daily Challenges</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/quizee/battles" :class="linkClass('/quizee/battles')" title="Battles">
            <TrophyIcon class="w-5 h-5" />
            <span class="ml-2 nav-label">Battles</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/quizee/tournaments" :class="linkClass('/quizee/tournaments')" title="Tournaments">
            <FlagIcon class="w-5 h-5" />
            <span class="ml-2 nav-label">Tournaments</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/quizee/points" :class="linkClass('/quizee/points')" title="Points">
            <StarIcon class="w-5 h-5" />
            <span class="ml-2 nav-label">Points</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/quizee/subscription" :class="linkClass('/quizee/subscription')" title="Subscription">
            <CreditCardIcon class="w-5 h-5" />
            <span class="ml-2 nav-label">Subscription</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/quizee/chat" :class="linkClass('/quizee/chat')" title="Messages">
            <ChatBubbleLeftRightIcon class="w-5 h-5" />
            <span class="ml-2 nav-label">Messages</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/quizee/quiz-masters" :class="linkClass('/quizee/quiz-masters')" title="quiz-masters">
            <UserGroupIcon class="w-5 h-5" />
            <span class="ml-2 nav-label">Quiz Masters</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/quizee/settings" :class="linkClass('/quizee/settings')" title="Settings">
            <CogIcon class="w-5 h-5" />
            <span class="ml-2 nav-label">Settings</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  <!-- Profile shown in the mobile drawer only to avoid duplication with the TopBar on desktop -->

    <div class="px-2">
    <button @click="toggleCollapse" class="w-full p-2 rounded text-sm text-gray-600 hover:bg-gray-100 control-btn">
      <XMarkIcon class="w-4 h-4 inline-block mr-2 icon-close" />
      <Bars3Icon class="w-4 h-4 inline-block mr-2 icon-open" />
      <span class="control-label">Collapse</span>
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
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
// Heroicons outline
import { HomeIcon, ClipboardDocumentListIcon, TrophyIcon, FlagIcon, StarIcon, CreditCardIcon, UserGroupIcon, CogIcon, Bars3Icon, XMarkIcon, ChatBubbleLeftRightIcon, CalendarDaysIcon } from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const user = computed(() => auth.user || {})
const userAvatar = computed(() => auth.user?.avatar_url || '/logo/avatar-placeholder.png')

const collapsed = ref(false)
const STORAGE_KEY = 'sidebar:collapsed:quizee'
const route = useRoute()
const { sidebarMobileOpen, toggleSidebar, setSidebar } = useSidebar()

const asideRef = ref(null)

function linkClass(path) {
  const active = route.path.startsWith(path)
  return [
    'p-3 rounded flex items-center text-gray-700 transition-colors',
    active ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
  ]
}

function toggleCollapse() {
  collapsed.value = !collapsed.value
  // persist preference across reloads in local storage
  if (process.client) {
    try { localStorage.setItem(STORAGE_KEY, String(collapsed.value)) } catch (e) {}
  }
  applyCollapseToDom(collapsed.value)
}

// apply collapse/visual changes to the DOM (client-only)
function applyCollapseToDom(isCollapsed) {
  const aside = asideRef.value
  if (!aside) return

  // set explicit width to override Tailwind classes
  aside.style.width = isCollapsed ? '5rem' : '16rem'

  // toggle center alignment for nav links container
  const navLinks = aside.querySelectorAll('a')
  navLinks.forEach(a => {
    a.classList.toggle('justify-center', isCollapsed)
  })

  // show/hide nav labels
  const labels = aside.querySelectorAll('.nav-label')
  labels.forEach(l => {
    if (l instanceof HTMLElement) l.style.display = isCollapsed ? 'none' : ''
  })

  // adjust avatar visibility
  const avatar = aside.querySelector('.avatar-img')
  if (avatar && avatar instanceof HTMLElement) avatar.style.display = isCollapsed ? 'block' : 'inline-block'

  // control icons and control label
  const iconOpen = aside.querySelector('.icon-open')
  const iconClose = aside.querySelector('.icon-close')
  if (iconOpen && iconOpen instanceof HTMLElement) iconOpen.style.display = isCollapsed ? '' : 'none'
  if (iconClose && iconClose instanceof HTMLElement) iconClose.style.display = isCollapsed ? 'none' : ''
  const controlLabel = aside.querySelector('.control-label')
  if (controlLabel && controlLabel instanceof HTMLElement) controlLabel.style.display = isCollapsed ? 'none' : ''
}

if (process.client) {
  onMounted(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw !== null) collapsed.value = raw === 'true'
      else if (window.innerWidth < 768) collapsed.value = true
    } catch (e) {
      if (window.innerWidth < 768) collapsed.value = true
    }

    // apply initial visual state after mount to avoid hydration mismatches
    nextTick(() => applyCollapseToDom(collapsed.value))

    window.addEventListener('toggle-sidebar', () => {
      // small screens use drawer, larger screens toggle collapse
      if (window.innerWidth < 1024) {
        toggleSidebar()
      } else {
        toggleCollapse()
      }
    })
  })
}

function onMobileNavClick() {
  // hide mobile sidebar and inform other UI (bottom nav) that sidebar closed
  setSidebar(false)
  try { window.dispatchEvent(new CustomEvent('sidebar-closed')) } catch (e) {}
}
</script>

<style scoped>
.transition-width {
  transition: width 0.3s ease-in-out;
}
</style>