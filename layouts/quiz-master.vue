<template>
  <div>
    <!-- If authenticated show quiz-master sidebar/topbar layout, else show public header -->
    <div v-if="isAuthed" class="min-h-screen flex bg-gray-100">
      <!-- Sidebar wrapper -->
      <div :class="['transition-all duration-300', { 'hidden lg:block': !ui.sidebarOpen, 'fixed inset-y-0 left-0 z-40 lg:static': ui.sidebarOpen }]">
        <ClientOnly>
          <QuizMasterSidebar />
        </ClientOnly>
      </div>

      <div v-if="ui.sidebarOpen" @click="ui.sidebarOpen = false" class="fixed inset-0 bg-black/50 z-30 lg:hidden"></div>

      <!-- Main content area -->
  <div class="flex-1 flex flex-col h-screen transition-all duration-300 lg:ml-0">
        <TopBar v-if="!route.meta.hideTopBar" />
        <main class="flex-1 overflow-y-auto pb-20 md:pb-6">
        <slot></slot>
        </main>
      </div>
    </div>

    <div v-else>
      <Header />
      <main class="p-6">
        <Container>
          <slot />
        </Container>
      </main>
      <Footer />
    </div>

    <GlobalAlert />
    <NotificationDrawer />
    <!-- Add bottom navigation for mobile -->
    <BottomNav v-if="isAuthed" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'
import QuizMasterSidebar from '~/components/QuizMasterSidebar.vue'
import BottomNav from '~/components/ui/BottomNav.vue'
import TopBar from '~/components/TopBar.vue'
import GlobalAlert from '~/components/GlobalAlert.vue'
import NotificationDrawer from '~/components/NotificationDrawer.vue'
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
import Container from '~/components/ui/Container.vue'

const auth = useAuthStore?.() || null
const route = useRoute()
const ui = useUiStore()
const isAuthed = computed(() => !!(auth && auth.user && Object.keys(auth.user).length))

onMounted(() => {
  if (auth && typeof auth.fetchUser === 'function') {
    auth.fetchUser()
  }
})
</script>

<style scoped>
/* minimal layout styles; project likely uses Tailwind */
</style>
