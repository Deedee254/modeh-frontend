<template>
  <div :class="['w-full sm:w-64 flex flex-col items-center text-center p-4 rounded-lg', isActive ? 'ring-2 ring-indigo-500 bg-indigo-50/30' : '']">
    <div class="relative">
      <img 
        :src="player.profile?.avatar || '/avatars/default.png'"
        :alt="player.first_name"
        class="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
      />
      <div v-if="isActive" class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" aria-hidden="true"></div>
      <div v-else class="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-200 rounded-full border-2 border-white dark:border-gray-800" aria-hidden="true"></div>

      <div v-if="typeof score === 'number'" class="absolute -top-2 -right-2 bg-white dark:bg-gray-800 border rounded-full px-2 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow">
        {{ score }}
      </div>
    </div>
    <h4 class="mt-3 font-semibold text-gray-800 dark:text-gray-200 truncate w-full">{{ player.first_name }} {{ player.last_name }}</h4>
    <p class="text-sm text-gray-500 dark:text-gray-400">{{ role }}</p>
    <div v-if="typeof answered === 'number'" class="text-xs text-gray-500 mt-2">Answered: <span class="font-medium text-gray-700">{{ answered }}</span></div>
  </div>
</template>

<script setup>
const props = defineProps({
  player: { type: Object, required: true },
  role: { type: String, default: 'Player' },
  score: { type: Number, default: null },
  isActive: { type: Boolean, default: false },
  answered: { type: Number, default: null }
})
</script>