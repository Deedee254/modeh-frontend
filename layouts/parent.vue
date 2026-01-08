<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
    <TopBar @toggle-sidebar="ui.sidebarOpen = !ui.sidebarOpen">
      <template #actions>
        <div class="flex items-center gap-3 hidden sm:flex">
          <NuxtLink to="/parent/settings" class="text-sm text-slate-600 hover:text-slate-900 dark:hover:text-slate-100">Settings</NuxtLink>
        </div>
      </template>
    </TopBar>

    <div class="flex">
      <div class="hidden md:block">
        <ParentSidebar />
      </div>

      <ClientOnly>
        <div v-if="ui.sidebarOpen" class="md:hidden fixed inset-0 z-50 bg-black/50" @click="ui.sidebarOpen = false">
          <div @click.stop class="w-64 h-full bg-white dark:bg-slate-800 overflow-y-auto">
            <ParentSidebar />
          </div>
        </div>
      </ClientOnly>

      <main class="flex-1 p-6">
        <NuxtPage />
      </main>
    </div>

    <ClientOnly>
      <BottomNav />
      <ChatWidget v-if="isAuthed" />
      <NotificationDrawer />
    </ClientOnly>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'
import TopBar from '~/components/TopBar.vue'
import BottomNav from '~/components/ui/BottomNav.vue'
import ChatWidget from '~/components/chat/ChatWidget.vue'
import NotificationDrawer from '~/components/NotificationDrawer.vue'
import ParentSidebar from '~/components/parent/ParentSidebar.vue'

const route = useRoute()
const auth = useAuthStore()
const ui = useUiStore()
const isAuthed = computed(() => !!(auth && auth.user && Object.keys(auth.user).length))
</script>

<style scoped>
.md\:hidden {
  transition: all 0.2s ease;
}
</style>
