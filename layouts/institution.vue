<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
    <Topbar @toggle-sidebar="ui.toggleSidebar()">
      <template #actions>
        <div class="flex items-center gap-3 hidden sm:flex">
          <NuxtLink :to="{ path: '/institution-manager/settings', query: { institutionSlug: instStore.activeInstitutionSlug } }" class="text-sm">Profile</NuxtLink>
        </div>
      </template>
    </Topbar>

    <div class="flex">
      <!-- Desktop Sidebar (always visible) -->
      <div class="hidden md:block">
        <Sidebar />
      </div>

      <!-- Mobile Drawer Overlay (not in DOM tree during SSR, only on client) -->
      <ClientOnly>
        <div v-if="ui.sidebarOpen" class="md:hidden fixed inset-0 z-50 bg-black/50" @click="ui.sidebarOpen = false">
          <div @click.stop class="w-64 h-full bg-white dark:bg-slate-800 overflow-y-auto">
            <Sidebar />
          </div>
        </div>
      </ClientOnly>

      <main class="flex-1 flex flex-col">
        <ClientOnly>
          <ProfileIncompleteBanner />
        </ClientOnly>
        <div class="flex-1 p-6 overflow-y-auto">
          <NuxtPage />
        </div>
      </main>
    </div>
    <!-- Mobile bottom navigation -->
    <ClientOnly>
      <BottomNav />
    </ClientOnly>
  </div>
</template>

<script setup>
import Topbar from '~/components/institution/Topbar.vue'
import Sidebar from '~/components/institution/Sidebar.vue'
import BottomNav from '~/components/ui/BottomNav.vue'
import ProfileIncompleteBanner from '~/components/ProfileIncompleteBanner.vue'
import { useUiStore } from '~/stores/ui'
import { useInstitutionsStore } from '~/stores/institutions'
import { useRouter, useRoute } from 'vue-router'
import { watch, onMounted } from 'vue'

const ui = useUiStore()
const instStore = useInstitutionsStore()
const router = useRouter()
const route = useRoute()

// Use the UI store's sidebarOpen so the state is shared and persisted appropriately
const sidebarOpen = ui.sidebarOpen

// Sync logic: keep route query ?institutionSlug and instStore.activeInstitutionSlug in sync.
// When route query changes, set active institution; when store changes, update route (replace) if different.
onMounted(() => {
  // initialize from route if available (route query may carry slug)
  const qSlug = route.query?.institutionSlug
  if (qSlug) {
    instStore.setActiveInstitution(String(qSlug)).catch(() => {})
  }
})

// watch route query changes
watch(() => route.query?.institutionSlug, (newSlug) => {
  const slug = newSlug ? String(newSlug) : null
  // avoid redundant fetch if store already has same slug
  if (slug && String(instStore.institution?.slug) === slug) return
  instStore.setActiveInstitution(slug).catch(() => {})
})

// watch store changes and update route query when needed
watch(() => instStore.activeInstitutionSlug, (newSlug) => {
  const qSlug = route.query?.institutionSlug ? String(route.query.institutionSlug) : null
  const slug = newSlug ? String(newSlug) : null
  if (qSlug === slug) return
  // use replace so navigation history isn't polluted
  const query = { ...route.query }
  if (slug) query.institutionSlug = String(slug)
  else delete query.institutionSlug
  router.replace({ path: route.path, query }).catch(() => {})
})
</script>

<style scoped>
/* Mobile drawer uses CSS transitions */
.md\:hidden {
  transition: all 0.2s ease;
}
</style>

