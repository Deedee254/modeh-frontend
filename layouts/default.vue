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

    <!-- Public bottom navigation for unauthenticated users -->
    <BottomNav 
      v-if="!isAuthed && !$route.meta.hideBottomNav"
      :onLeft="() => router.push('/quizzes')"
        :onCenter="() => router.push('/register')"
        :onRight="() => router.push('/login')"
      >
        <template #left>
          <button
            @click="() => router.push('/quizzes')"
            class="group flex w-full flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition group-hover:bg-brand-50 group-hover:text-brand-600">
              <Icon name="heroicons:magnifying-glass" class="h-5 w-5" />
            </div>
            Explore
          </button>
        </template>
        
        <template #center>
          <button
            @click="() => router.push('/register')"
            class="flex h-16 w-16 items-center justify-center rounded-full text-white shadow-[0_20px_45px_-20px] transition hover:scale-105"
            style="background: linear-gradient(to bottom right, #891f21, #f7b932); box-shadow: 0 20px 45px -20px rgba(137, 31, 33, 0.8)"
          >
            <Icon name="heroicons:user-plus" class="h-6 w-6" />
          </button>
        </template>
        
        <template #right>
          <button
            @click="() => router.push('/login')"
            class="group flex w-full flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition group-hover:bg-brand-50 group-hover:text-brand-600">
              <Icon name="heroicons:arrow-right-on-rectangle" class="h-5 w-5" />
            </div>
            Login
          </button>
        </template>
      </BottomNav>

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

