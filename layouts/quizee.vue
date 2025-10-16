<template>
  <div>
    <div v-if="isAuthed" class="min-h-screen flex bg-gray-100">
      <!-- hide permanent sidebar on small screens; use mobile drawer triggered from topbar instead -->
      <div class="hidden lg:block">
        <quizeeSidebar />
      </div>
      <div class="flex-1 flex flex-col">
        <TopBar />
        <main class="p-6 flex-1 overflow-auto pb-20 md:pb-6">
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
    <BottomNav v-if="isAuthed" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import quizeeSidebar from '~/components/QuizeeSidebar.vue'
import TopBar from '~/components/TopBar.vue'
import GlobalAlert from '~/components/GlobalAlert.vue'
import NotificationDrawer from '~/components/NotificationDrawer.vue'
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
import Container from '~/components/ui/Container.vue'
import BottomNav from '~/components/ui/BottomNav.vue'

// ensure we call the auth store so we can detect authenticated users
const auth = useAuthStore ? useAuthStore() : null
const isAuthed = computed(() => !!(auth && auth.user && Object.keys(auth.user).length))
</script>

<style scoped>
/* minimal layout styles; project likely uses Tailwind */
</style>