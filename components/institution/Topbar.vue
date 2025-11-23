<template>
  <header class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 h-14 sticky top-0 z-40">
    <div class="flex items-center gap-3 w-full">
      <button @click="$emit('toggle-sidebar')" class="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>

      <div class="flex items-center gap-3 flex-1 overflow-hidden">
        <NuxtLink to="/" class="text-lg font-semibold">Modeh</NuxtLink>
        <!-- Institution selector: default to first institution when available. -->
        <div class="relative hidden sm:block">
          <template v-if="isInstitutionManager && institutions && institutions.length > 0">
            <select @change="onSelectInstitution" :value="_instSlug" class="text-sm text-slate-600 bg-transparent border border-transparent focus:border-indigo-300 rounded px-2 py-1">
              <option v-for="inst in institutions" :key="inst.slug || inst.id" :value="inst.slug || inst.id">{{ inst.name || inst.slug || inst.id }}</option>
            </select>
          </template>
          <template v-else>
            <span class="text-sm text-slate-500">{{ institutionName }}</span>
          </template>
        </div>
      </div>
    </div>

    <div class="ml-auto flex items-center gap-3">
      <!-- avatar button -->
      <div class="relative" ref="menuRef">
        <button @click.stop="toggleMenu" class="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Open profile menu">
          <img :src="userAvatar" :alt="auth.user?.name || 'User'" class="w-8 h-8 rounded-full object-cover" />
        </button>

        <transition name="fade">
          <div v-if="open" class="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border rounded shadow-lg z-60 text-sm max-h-96 overflow-y-auto">
            <NuxtLink :to="dashboardLink" class="block px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700">Dashboard</NuxtLink>
            <NuxtLink :to="instManageLink" class="block px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700">Manage Institution</NuxtLink>
            <NuxtLink :to="inviteLink" class="block px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700">Invite users</NuxtLink>
            <NuxtLink :to="subscriptionsLink" class="block px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700">Subscriptions</NuxtLink>
            <NuxtLink :to="settingsLink" class="block px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700">Settings</NuxtLink>
            <div class="border-t mt-1"></div>
            <button @click="logout" class="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700">Logout</button>
          </div>
        </transition>
      </div>

      <slot name="actions" />
    </div>
  </header>
</template>

<script setup>
defineProps({});
defineEmits(['toggle-sidebar']);

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import { useInstitutionsStore } from '~/stores/institutions'
import { resolveAssetUrl } from '~/composables/useAssets'

const open = ref(false)
const menuRef = ref(null)
const auth = useAuthStore()
const router = useRouter()
const instStore = useInstitutionsStore()
const institutionName = computed(() => instStore.institution?.name || 'Institution manager')

// list of institutions available on the authenticated user payload (may be undefined)
const institutions = computed(() => (auth.user && Array.isArray(auth.user.institutions)) ? auth.user.institutions : [])

function onSelectInstitution(e) {
  const val = e && e.target ? e.target.value : null
  if (!val) return
  // Set the active institution (the store will fetch details and sync route query)
  instStore.setActiveInstitution(String(val)).catch(() => {})
}

onMounted(() => {
  // If there is no active institution selected but the user has institutions, default to the first one.
  try {
    if ((!instStore.activeInstitutionSlug || instStore.activeInstitutionSlug === null) && institutions.value && institutions.value.length) {
      const first = institutions.value[0]
      const id = first?.slug || first?.id || null
      if (id) instStore.setActiveInstitution(String(id)).catch(() => {})
    }
  } catch (e) {}
})

function toggleMenu() {
  open.value = !open.value
}

function handleDocumentClick(e) {
  try {
    if (!menuRef.value) return
    const el = menuRef.value
    if (el && !el.contains(e.target)) {
      open.value = false
    }
  } catch (err) {}
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})

const isInstitutionManager = computed(() => {
  if (!auth?.user) return false
  if (auth.user.role === 'institution-manager') return true
  if (auth.user.institutions && Array.isArray(auth.user.institutions) && auth.user.institutions.length > 0) return true
  return false
})

const profileLink = computed(() => {
  if (!auth?.user) return '/'
  // If the user is an institution manager or belongs to institutions, point to the institution manager profile
  if (auth.user.role === 'institution-manager' || (auth.user?.institutions && auth.user.institutions.length > 0)) {
    if (instStore.activeInstitutionSlug) return { path: '/institution-manager/profile', query: { institutionSlug: String(instStore.activeInstitutionSlug) } }
    return { path: '/institution-manager/profile' }
  }
  const role = auth.user.role || 'quizee'
  if (role === 'quiz-master') return '/quiz-master/profile'
  return '/quizee/profile'
})

const _instSlug = computed(() => instStore.activeInstitutionSlug || instStore.institution?.slug || null)

const instManageLink = computed(() => {
  if (_instSlug.value) return { path: `/institution-manager/institutions/${String(_instSlug.value)}` }
  return { path: '/institution-manager/institutions' }
})

const dashboardLink = computed(() => {
  if (_instSlug.value) return { path: `/institution-manager/institutions/${String(_instSlug.value)}/analytics` }
  return { path: '/institution-manager/institutions' }
})

const inviteLink = computed(() => {
  if (_instSlug.value) return { path: '/institution-manager/invite', query: { institutionSlug: String(_instSlug.value) } }
  return { path: '/institution-manager/invite' }
})

const subscriptionsLink = computed(() => ({ path: '/institution-manager/subscriptions', query: _instSlug.value ? { institutionSlug: String(_instSlug.value) } : {} }))

const settingsLink = computed(() => ({ path: '/institution-manager/settings', query: _instSlug.value ? { institutionSlug: String(_instSlug.value) } : {} }))

const userAvatar = computed(() => resolveAssetUrl(auth.user?.avatar_url || '/logo/avatar-placeholder.png') || '/logo/avatar-placeholder.png')

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
