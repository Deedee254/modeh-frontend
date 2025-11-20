<template>
  <header class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 h-14">
    <div class="flex items-center gap-3 w-full">
      <button @click="$emit('toggle-sidebar')" class="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>

      <div class="flex items-center gap-3">
        <NuxtLink to="/" class="text-lg font-semibold">Modeh</NuxtLink>
        <span class="text-sm text-slate-500">{{ institutionName }}</span>
      </div>

      <div class="ml-auto flex items-center gap-3">
            <!-- profile / logout -->
            <div class="relative" @click.away="open = false">
              <button @click="open = !open" class="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                <svg class="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 p-1" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 20c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span class="hidden sm:inline text-sm">Profile</span>
              </button>

              <transition name="fade">
                <div v-if="open" class="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 border rounded shadow-md z-50 text-sm">
                  <NuxtLink :to="profileLink" class="block px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700">My Profile</NuxtLink>
                  <button @click="logout" class="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700">Logout</button>
                </div>
              </transition>
            </div>
            <slot name="actions" />
          </div>
    </div>
  </header>
</template>

<script setup>
defineProps({});
defineEmits(['toggle-sidebar']);

import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import { useInstitutionsStore } from '~/stores/institutions'

const open = ref(false)
const auth = useAuthStore()
const router = useRouter()
const instStore = useInstitutionsStore()
const institutionName = computed(() => instStore.institution?.name || 'Institution manager')

const profileLink = computed(() => {
  if (!auth?.user) return '/'
  // If the user is an institution manager and an active institution is selected, point to the institution profile/settings
  if ((auth.user.role === 'institution-manager' || (auth.user?.institutions && auth.user.institutions.length > 0)) && instStore.activeInstitutionSlug) {
    return { path: '/institution-manager/profile', query: { institutionSlug: String(instStore.activeInstitutionSlug) } }
  }
  const role = auth.user.role || 'quizee'
  if (role === 'quiz-master') return '/quiz-master/profile'
  return '/quizee/profile'
})

function logout() {
  open.value = false
  auth.logout().then(() => {
    try { router.push('/') } catch (e) {}
  })
}
</script>

<style scoped>
/* keep minimal — layout controlled by Tailwind */
</style>
