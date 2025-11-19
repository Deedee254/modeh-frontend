<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
    <Topbar @toggle-sidebar="sidebarOpen = !sidebarOpen">
      <template #actions>
        <div class="flex items-center gap-3">
          <NuxtLink to="/profile" class="text-sm">Profile</NuxtLink>
        </div>
      </template>
    </Topbar>

    <div class="flex">
      <transition name="slide-fade">
        <Sidebar v-if="sidebarOpen" class="hidden md:block" />
      </transition>

      <main class="flex-1 p-6">
        <NuxtPage />
      </main>
    </div>
  </div>
</template>

<script setup>
import Topbar from '~/components/institution/Topbar.vue'
import Sidebar from '~/components/institution/Sidebar.vue'
import { ref } from 'vue'

const sidebarOpen = ref(true)
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all .2s ease;
}
.slide-fade-leave-active {
  transition: all .15s ease;
}
.slide-fade-enter-from {
  transform: translateX(-8px);
  opacity: 0;
}
.slide-fade-enter-to {
  transform: translateX(0);
  opacity: 1;
}
.slide-fade-leave-from {
  transform: translateX(0);
  opacity: 1;
}
.slide-fade-leave-to {
  transform: translateX(-8px);
  opacity: 0;
}
</style>
