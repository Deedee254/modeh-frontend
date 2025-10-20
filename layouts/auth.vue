<template>
  <div>
    <div v-if="isAuthed && isquizee" class="min-h-screen flex bg-gray-100">
      <div class="hidden lg:block">
        <ClientOnly>
          <QuizeeSidebar />
        </ClientOnly>
      </div>
      <div class="flex-1 flex flex-col">
        <TopBar />
        <main class="p-6 flex-1 overflow-auto pb-20 md:pb-6">
      <slot></slot>
        </main>
      </div>
    </div>

    <div v-else-if="isAuthed && isQuizMaster" class="min-h-screen flex bg-gray-100">
      <div class="hidden lg:block">
        <ClientOnly>
          <QuizMasterSidebar />
        </ClientOnly>
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
    <!-- Role-aware bottom mobile nav -->
    <BottomNav v-if="isAuthed" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useSidebar } from '~/composables/useSidebar'
import QuizeeSidebar from '~/components/QuizeeSidebar.vue'
import QuizMasterSidebar from '~/components/QuizMasterSidebar.vue'
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
const isQuizMaster = computed(() => !!auth.user && (auth.user.role === 'quiz-master' || (auth.user.roles && auth.user.roles.includes('quiz-master'))))

const router = useRouter()
const { toggleSidebar } = useSidebar()

onMounted(() => {
  if (auth && typeof auth.fetchUser === 'function') {
    auth.fetchUser()
  }
})
</script>

<style scoped></style>
