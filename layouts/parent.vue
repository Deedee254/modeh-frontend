<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
    <!-- Parent TopBar with custom navigation -->
    <header class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 h-14">
      <div class="flex items-center justify-between px-4 h-full">
        <div class="flex items-center gap-4">
          <button @click="ui.sidebarOpen = !ui.sidebarOpen" class="md:hidden p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <NuxtLink to="/parent/dashboard" class="flex items-center">
            <img src="/logo/modeh-logo.png" alt="Modeh" class="h-6" />
          </NuxtLink>
          <!-- Navigation links for desktop -->
          <nav class="hidden md:flex items-center gap-6 ml-6">
            <NuxtLink to="/parent/dashboard" class="text-sm text-slate-600 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Dashboard</NuxtLink>
            <NuxtLink to="/parent/quizees" class="text-sm text-slate-600 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">My Quizees</NuxtLink>
            <NuxtLink to="/parent/analytics" class="text-sm text-slate-600 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Analytics</NuxtLink>
            <NuxtLink to="/parent/subscriptions" class="text-sm text-slate-600 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Subscriptions</NuxtLink>
          </nav>
        </div>
        <div class="flex items-center gap-4">
          <NuxtLink to="/parent/settings" class="text-sm text-slate-600 hover:text-slate-900 dark:hover:text-slate-100 transition-colors hidden sm:inline">Settings</NuxtLink>
          <client-only>
            <ActionMenu v-if="auth.user && auth.user.id">
              <template #trigger>
                <button class="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                  <img :src="userAvatar" :alt="auth.user.name" class="w-8 h-8 rounded-full object-cover" />
                </button>
              </template>
              <template #items="{ close }">
                <div class="px-4 py-3">
                  <p class="text-sm font-medium">{{ auth.user.name }}</p>
                  <p class="text-xs text-slate-500">{{ auth.user.email }}</p>
                </div>
                <div class="border-t dark:border-slate-700"></div>
                <NuxtLink to="/parent/profile" class="block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700">Profile</NuxtLink>
                <NuxtLink to="/parent/settings" class="block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 md:hidden">Settings</NuxtLink>
                <div class="border-t dark:border-slate-700"></div>
                <button @click="() => { auth.logout(); close?.() }" class="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700">Sign out</button>
              </template>
            </ActionMenu>
          </client-only>
        </div>
      </div>
    </header>

    <ClientOnly>
      <ProfileIncompleteBanner />
    </ClientOnly>

    <div class="flex" :style="{ height: 'calc(100vh - 56px)' }">
      <div class="hidden md:block md:w-64 flex-shrink-0">
        <ParentSidebar />
      </div>

      <ClientOnly>
        <div v-if="ui.sidebarOpen" class="md:hidden fixed inset-0 z-50 bg-black/50" @click="ui.sidebarOpen = false">
          <div @click.stop class="w-64 h-screen bg-white dark:bg-slate-800 overflow-y-auto">
            <ParentSidebar />
          </div>
        </div>
      </ClientOnly>

      <main class="flex-1 overflow-y-auto p-4 md:p-6">
        <NuxtPage />
      </main>
    </div>

    <ClientOnly>
      <NotificationDrawer />
    </ClientOnly>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'
import { resolveAssetUrl } from '~/composables/useAssets'
import ActionMenu from '~/components/ui/ActionMenu.vue'
import NotificationDrawer from '~/components/NotificationDrawer.vue'
import ParentSidebar from '~/components/parent/ParentSidebar.vue'
import ProfileIncompleteBanner from '~/components/ProfileIncompleteBanner.vue'

const auth = useAuthStore()
const ui = useUiStore()
const userAvatar = computed(() => resolveAssetUrl(auth.userAvatar) || '/logo/avatar-placeholder.png')
</script>

<style scoped>
.md\:hidden {
  transition: all 0.2s ease;
}
</style>
