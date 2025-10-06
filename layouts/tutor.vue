<template>
  <div>
    <!-- If authenticated show tutor sidebar/topbar layout, else show public header -->
    <div v-if="isAuthed" class="min-h-screen flex bg-gray-100">
      <!-- hide permanent sidebar on small screens; mobile drawer remains available -->
      <div class="hidden lg:block">
        <TutorSidebar />
      </div>
      <div class="flex-1 flex flex-col">
        <TopBar />
        <main class="p-6 flex-1 overflow-auto pb-20 md:pb-6">
          <slot />
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TutorSidebar from '~/components/TutorSidebar.vue'
import TopBar from '~/components/TopBar.vue'
import GlobalAlert from '~/components/GlobalAlert.vue'
import NotificationDrawer from '~/components/NotificationDrawer.vue'
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
import Container from '~/components/ui/Container.vue'

const auth = useAuthStore?.() || null
const isAuthed = computed(() => !!(auth && auth.user && Object.keys(auth.user).length))
</script>

<style scoped>
/* minimal layout styles; project likely uses Tailwind */
</style>
