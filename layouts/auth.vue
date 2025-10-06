<template>
  <div>
    <div v-if="isAuthed && isStudent" class="min-h-screen flex bg-gray-100">
      <div class="hidden lg:block">
        <StudentSidebar />
      </div>
      <div class="flex-1 flex flex-col">
        <StudentTopBar />
        <main class="p-6 flex-1 overflow-auto pb-20 md:pb-6">
          <slot />
        </main>
      </div>
    </div>

    <div v-else-if="isAuthed && isTutor" class="min-h-screen flex bg-gray-100">
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
    <!-- bottom mobile nav for logged-in users -->
    <BottomNav v-if="isAuthed" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import StudentSidebar from '~/components/StudentSidebar.vue'
import StudentTopBar from '~/components/StudentTopBar.vue'
import TutorSidebar from '~/components/TutorSidebar.vue'
import TopBar from '~/components/TopBar.vue'
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
import Container from '~/components/ui/Container.vue'
import GlobalAlert from '~/components/GlobalAlert.vue'
import NotificationDrawer from '~/components/NotificationDrawer.vue'
import BottomNav from '~/components/ui/BottomNav.vue'

const auth = useAuthStore?.() || null
const isAuthed = computed(() => !!(auth && auth.user && Object.keys(auth.user).length))
const isStudent = computed(() => !!auth.user && (auth.user.role === 'student' || (auth.user.roles && auth.user.roles.includes('student'))))
const isTutor = computed(() => !!auth.user && (auth.user.role === 'tutor' || (auth.user.roles && auth.user.roles.includes('tutor'))))
</script>

<style scoped></style>
