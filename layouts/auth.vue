<template>
  <div>
    <div v-if="isAuthed && isquizee" class="min-h-screen flex bg-gray-100">
      <div class="hidden lg:block">
        <quizeeSidebar />
      </div>
      <div class="flex-1 flex flex-col">
        <quizeeTopBar />
        <main class="p-6 flex-1 overflow-auto pb-20 md:pb-6">
          <slot />
        </main>
      </div>
    </div>

    <div v-else-if="isAuthed && isquiz-master" class="min-h-screen flex bg-gray-100">
      <div class="hidden lg:block">
        <quiz-masterSidebar />
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
import quizeeSidebar from '~/components/quizeeSidebar.vue'
import quizeeTopBar from '~/components/quizeeTopBar.vue'
import quiz-masterSidebar from '~/components/quiz-masterSidebar.vue'
import TopBar from '~/components/TopBar.vue'
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
import Container from '~/components/ui/Container.vue'
import GlobalAlert from '~/components/GlobalAlert.vue'
import NotificationDrawer from '~/components/NotificationDrawer.vue'
import BottomNav from '~/components/ui/BottomNav.vue'

const auth = useAuthStore?.() || null
const isAuthed = computed(() => !!(auth && auth.user && Object.keys(auth.user).length))
const isquizee = computed(() => !!auth.user && (auth.user.role === 'quizee' || (auth.user.roles && auth.user.roles.includes('quizee'))))
const isquiz-master = computed(() => !!auth.user && (auth.user.role === 'quiz-master' || (auth.user.roles && auth.user.roles.includes('quiz-master'))))
</script>

<style scoped></style>
