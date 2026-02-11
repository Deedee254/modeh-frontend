<template>
  <div class="flex items-stretch gap-6 p-6 rounded-lg border border-red-200 dark:border-red-900/30 bg-gradient-to-r from-red-50 to-white dark:from-red-950/20 dark:to-slate-900 hover:shadow-md hover:border-red-300 dark:hover:border-red-800 transition">
    <!-- Profile Image (Left) - Full Height Rectangle -->
    <div class="flex-shrink-0 -m-6 mr-0 rounded-l-lg overflow-hidden w-40">
      <img 
        :src="resolveAvatar(quizMaster.avatar_url || quizMaster.avatar || quizMaster.photo || quizMaster.image || quizMaster.profile_image || quizMaster.avatarUrl, quizMaster.name)" 
        :alt="quizMaster.name" 
        class="w-full h-full object-cover"
      >
    </div>

    <!-- Content (Right) -->
    <div class="flex-1 flex flex-col justify-between">
      <!-- Header Info -->
      <div class="mb-2">
        <h3 class="font-bold text-base text-gray-900 dark:text-white mb-0.5">{{ quizMaster.name }}</h3>
        <p class="text-xs text-red-700 dark:text-red-400 font-medium mb-1">{{ quizMaster.headline || 'Experienced quiz-master' }}</p>
        <p v-if="quizMaster.institution" class="text-xs text-gray-600 dark:text-gray-400">
          {{ quizMaster.institution }}
        </p>
      </div>

      <!-- Bio/Description -->
      <div v-if="quizMaster.bio || quizMaster.description" class="mb-2">
        <p class="text-xs text-gray-700 dark:text-gray-300 line-clamp-1">
          {{ quizMaster.bio || quizMaster.description }}
        </p>
      </div>

      <!-- Subjects -->
      <div v-if="quizMaster.subjects && quizMaster.subjects.length" class="mb-3 flex flex-wrap gap-1">
        <span v-for="subject in quizMaster.subjects.slice(0, 2)" :key="subject.id" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-600/15 text-red-700 dark:bg-red-600/20 dark:text-red-400 border border-red-200/50 dark:border-red-700/50">
          {{ subject.name }}
        </span>
        <span v-if="quizMaster.subjects.length > 2" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400">
          +{{ quizMaster.subjects.length - 2 }}
        </span>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 pt-3 border-t border-red-200/50 dark:border-red-700/30">
        <NuxtLink 
          :to="`/quiz-masters/${quizMaster.slug || quizMaster.id}`" 
          class="flex-1 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium text-xs text-center transition shadow-sm hover:shadow-md"
        >
          View Profile
        </NuxtLink>
        <button 
          @click="() => $emit('follow')"
          :disabled="loading"
          :class="[
            'flex-1 px-3 py-1.5 rounded-md font-medium text-xs text-center transition',
            isFollowing
              ? 'bg-red-100 hover:bg-red-200 dark:bg-red-600/20 dark:hover:bg-red-600/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-600'
              : 'border border-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400'
          ]"
        >
          <span v-if="isFollowing">Following</span>
          <span v-else>Follow</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { resolveAvatar } from '~/composables/useAssets'

defineProps({
  quizMaster: {
    type: Object,
    required: true
  },
  isFollowing: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['follow'])
</script>
