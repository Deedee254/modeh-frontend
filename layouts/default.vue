<template>
  <!-- Base layout keeps global chrome minimal; role layouts add their own navigation -->
  <div class="min-h-screen flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
    <NuxtRouteAnnouncer />
    <GlobalAlert />
    <template v-if="$route.path !== '/login' && $route.path !== '/register'">
      <ClientOnly>
        <PwaInstallButton />
      </ClientOnly>
      <Header v-if="!$route.meta.hideTopBar" />
      <main class="flex-1 w-full">
        <slot />
      </main>
    </template>
    <template v-else>
      <slot></slot>
    </template>

    <Footer />

    <ClientOnly>
      <GoogleOneTap />
    </ClientOnly>

    <!-- Public bottom navigation for unauthenticated users -->
    <!-- Render BottomNav without slot content; the component handles public vs authed rendering internally -->
    <BottomNav v-if="!isAuthed && !$route.meta.hideBottomNav" />

    <!-- Chat is intentionally omitted from the global default layout.
         Chat widgets should be added to authenticated role layouts (quizee/quiz-master) only.
         This prevents server-side composable invocation errors and keeps public pages minimal. -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import PwaInstallButton from '~/components/PwaInstallButton.vue'
import GlobalAlert from '~/components/GlobalAlert.vue'
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
import BottomNav from '~/components/ui/BottomNav.vue'
import GoogleOneTap from '~/components/Auth/GoogleOneTap.vue'
// ChatDirectMessages intentionally not imported here; role layouts include chat when authenticated.

const chatOpen = ref(false)
const router = useRouter()
const auth = useAuthStore()
const isAuthed = computed(() => !!auth?.user?.id)
const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
  // auth.fetchUser() is redundant here as it is called by auth-init.client.js plugin
})
</script>

<style scoped>
</style>

