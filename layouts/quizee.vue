<template>
  <div>
    <template v-if="isAuthed">
      <TopBar v-if="!route.meta.hideTopBar" />
      <div class="min-h-screen flex bg-gray-100">
        <!-- Sidebar: permanent on lg+, drawer on smaller screens -->
        <div :class="['transition-all duration-300', { 'hidden lg:block': !ui.sidebarOpen, 'fixed inset-y-0 left-0 z-40 lg:static': ui.sidebarOpen }]">
          <ClientOnly>
            <quizeeSidebar />
          </ClientOnly>
        </div>
        <div v-if="ui.sidebarOpen" @click="ui.sidebarOpen = false" class="fixed inset-0 bg-black/50 z-30 lg:hidden"></div>
        <div class="flex-1 flex flex-col transition-all duration-300 lg:pl-[var(--sidebar-width,256px)]">
          <main :class="['flex-1 overflow-y-auto min-h-0', !route.meta.hideBottomNav && 'pb-20 md:pb-6']">
            <slot></slot>
          </main>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="min-h-screen flex flex-col bg-white">
        <Header />
        <main class="flex-1 py-8"><slot></slot></main>
        <Footer />
      </div>
    </template>

    <ClientOnly>
      <GlobalAlert />
      <NotificationDrawer />
      <GoogleOneTap v-if="!isAuthed" />
      <!-- Mobile bottom navigation for quizee role -->
      <BottomNav v-if="isAuthed && !route.meta.hideBottomNav" />
    </ClientOnly>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
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
import GoogleOneTap from '~/components/Auth/GoogleOneTap.vue'

const route = useRoute()
// ensure we call the auth store so we can detect authenticated users
const auth = useAuthStore()
const ui = useUiStore()
const isAuthed = computed(() => !!(auth && auth.user && Object.keys(auth.user).length))

onMounted(() => {
  // Screen logic moved to CSS classes for better hydration stability
})
</script>

<style scoped>
/* minimal layout styles; project likely uses Tailwind */
</style>
