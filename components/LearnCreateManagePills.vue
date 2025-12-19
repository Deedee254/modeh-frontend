<template>
  <section v-if="!isLoggedIn" class="py-6">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="rounded-2xl bg-gradient-to-r from-[#3f1516]/10 via-[#891f21]/8 to-[#b23a3f]/8 p-4 sm:p-6 flex items-center justify-center">
        <div class="w-full max-w-4xl flex items-center gap-3 flex-wrap justify-center">
          <div class="text-lg font-semibold text-[#891f21] mr-4 hidden sm:block">What brings you to Modeh today?</div>

          <NuxtLink
            to="/register?role=quizee"
            class="inline-flex items-center gap-3 rounded-full bg-[#891f21] text-white px-4 py-2 shadow-sm hover:opacity-95 transition"
          >
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#891f21]">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2"/></svg>
            </span>
            <span class="font-medium">Learn</span>
          </NuxtLink>

          <div class="hidden sm:block h-6 w-px bg-white/20 mx-1"></div>

          <NuxtLink
            to="/register?role=quiz-master"
            class="inline-flex items-center gap-3 rounded-full bg-[#891f21] text-white px-4 py-2 shadow-sm hover:opacity-95 transition"
          >
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#891f21]">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            </span>
            <span class="font-medium">Create</span>
          </NuxtLink>

          <div class="hidden sm:block h-6 w-px bg-white/20 mx-1"></div>

          <NuxtLink
            to="/register?role=institution-manager"
            class="inline-flex items-center gap-3 rounded-full bg-[#891f21] text-white px-4 py-2 shadow-sm hover:opacity-95 transition"
          >
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#891f21]">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M7 17h10"/></svg>
            </span>
            <span class="font-medium">Manage</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const isLoggedIn = computed(() => !!auth.user)
</script>

<style scoped>
.rounded-2xl { border-radius: 16px }
</style>
