<template>
  <UCard class="hover:shadow-lg transition-all duration-200">
    <div class="flex flex-col items-center text-center">
      <!-- Avatar -->
      <div class="w-24 h-24 rounded-full overflow-hidden mb-4">
        <img 
          v-if="quizMaster.avatar" 
          :src="quizMaster.avatar" 
          :alt="quizMaster.name" 
          class="w-full h-full object-cover"
        >
        <div 
          v-else 
          class="w-full h-full bg-indigo-100 text-indigo-700 grid place-items-center font-bold text-3xl"
        >
          {{ (quizMaster.name || '').charAt(0).toUpperCase() }}
        </div>
      </div>

      <!-- Name and Headline -->
      <h3 class="font-semibold text-lg text-gray-800">{{ quizMaster.name }}</h3>
      <p v-if="quizMaster.headline" class="text-sm text-gray-500 mt-1">{{ quizMaster.headline }}</p>

      <!-- Institution and Grade -->
      <div v-if="quizMaster.institution || quizMaster.grade || displayLevel" class="mt-2 text-sm text-gray-600">
        <p v-if="quizMaster.institution">{{ quizMaster.institution }}</p>
        <p v-if="quizMaster.grade?.name">
          <span v-if="isCourse">Course {{ quizMaster.grade.name }}</span>
          <span v-else>Grade {{ quizMaster.grade.name }}</span>
        </p>
        <p v-if="displayLevel" class="text-xs text-slate-500">{{ displayLevel }}</p>
      </div>

      <!-- Subjects -->
      <div v-if="quizMaster.subjects?.length" class="mt-3 flex flex-wrap justify-center gap-1">
        <span
          v-for="subject in displaySubjects"
          :key="subject.id"
          class="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs"
        >
          {{ subject.name }}
        </span>
        <span 
          v-if="quizMaster.subjects.length > maxDisplaySubjects" 
          class="px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full text-xs"
        >
          +{{ quizMaster.subjects.length - maxDisplaySubjects }} more
        </span>
      </div>

      <!-- Actions -->
      <div class="mt-4 flex items-center gap-3 justify-center">
        <NuxtLink 
          :to="`/quizee/quiz-masters/${quizMaster.id}`" 
          class="text-indigo-600 font-medium text-sm hover:underline"
        >
          View Profile
        </NuxtLink>
        <button 
          @click="$emit('follow', quizMaster.id)"
          :disabled="loading"
          class="px-3 py-1 text-sm rounded-md border transition-colors"
          :class="isFollowing ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-gray-700 border-gray-200 hover:border-indigo-200'"
        >
          <span v-if="isFollowing">Following</span>
          <span v-else>Follow</span>
        </button>
      </div>
    </div>
  </UCard>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
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
  },
  maxDisplaySubjects: {
    type: Number,
    default: 3
  }
})

const emit = defineEmits(['follow'])

const displaySubjects = computed(() => props.quizMaster.subjects?.slice(0, props.maxDisplaySubjects) || [])

const displayLevel = computed(() => {
  const g = props.quizMaster.grade || null
  if (g && typeof g === 'object') {
    const lvl = g.level || g.level_id || g.levelId
    if (lvl) return (typeof lvl === 'string' || typeof lvl === 'number') ? String(lvl) : (lvl.name || String(lvl.id || ''))
  }
  return ''
})

const isCourse = computed(() => {
  const g = props.quizMaster.grade || null
  if (!g || typeof g !== 'object') return false
  return String(g.type || '').toLowerCase() === 'course'
})
</script>