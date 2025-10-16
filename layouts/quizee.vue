<template>
  <div>
    <div v-if="isAuthed" class="min-h-screen flex bg-gray-100">
      <!-- Sidebar: permanent on lg+, drawer on smaller screens -->
      <div>
        <quizeeSidebar />
      </div>
      <div v-if="ui.sidebarOpen" @click="ui.sidebarOpen = false" class="fixed inset-0 bg-black/50 z-30 lg:hidden"></div>
      <div class="flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300" :class="[ui.sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64']">
        <TopBar v-if="!route.meta.hideTopBar" />
        <main class="p-6 flex-1 pb-20 md:pb-6">
          <slot />
        </main>
      </div>
    </div>

    <div v-else class="min-h-screen flex flex-col bg-white">
      <Header />
      <main class="flex-1 py-8">
        <slot />
      </main>
      <Footer />
    </div>

    <GlobalAlert />
    <NotificationDrawer />
    <!-- Mobile bottom navigation for quizee role -->
    <BottomNav v-if="isAuthed && !route.meta.hideBottomNav" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'
import quizeeSidebar from '~/components/QuizeeSidebar.vue'
import TopBar from '~/components/TopBar.vue'
import GlobalAlert from '~/components/GlobalAlert.vue'
import NotificationDrawer from '~/components/NotificationDrawer.vue'
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
import Container from '~/components/ui/Container.vue'
import BottomNav from '~/components/ui/BottomNav.vue'

const route = useRoute()
// ensure we call the auth store so we can detect authenticated users
const auth = useAuthStore ? useAuthStore() : null
const ui = useUiStore()
const isAuthed = computed(() => !!(auth && auth.user && Object.keys(auth.user).length))
</script>

<style scoped>
/* minimal layout styles; project likely uses Tailwind */
</style>