<template>
  <button @click="toggleTheme" class="p-2 rounded-full text-gray-500 hover:bg-gray-100" :aria-label="`Toggle theme`">
    <template v-if="isDark">
      <SunIcon class="w-6 h-6" />
    </template>
    <template v-else>
      <MoonIcon class="w-6 h-6" />
    </template>
  </button>
</template>

<script setup>
import { useAppTheme } from '~/composables/useAppTheme'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'
const { isDark, toggleTheme } = useAppTheme()
</script>

