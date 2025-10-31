<template>
  <ClientOnly>
    <div class="p-2">
    <BattleTaxonomySelectors
      v-model:level="level"
      v-model:grade="grade"
      v-model:subject="subject"
      v-model:topic="topic"
    />

    <div class="space-y-4">
      <div>
        <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Difficulty</label>
        <USelect v-model="difficulty" :options="difficulties" />
      </div>
      <div>
        <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Number of Questions</label>
        <USelect v-model="totalQuestions" :options="questionCountOptions" />
      </div>
      <div>
        <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Total Battle Time (minutes)</label>
        <UInput v-model.number="totalTimeMinutes" type="number" min="1" placeholder="e.g., 10" />
        <p class="text-xs text-gray-500 mt-1">Optional — if set, each question will be given an equal share of this time.</p>
      </div>
    </div>

    <div class="mt-6">
      <button
        @click="startBattle"
        :disabled="starting || !canStart"
        class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        Create 1 vs 1 Battle
      </button>
    </div>

    <div v-if="starting" class="mt-3 text-sm text-center text-gray-500 dark:text-gray-400">Creating battle...</div>
    </div>
  </ClientOnly>
</template>

<script setup>
import { ref } from 'vue'
import { useBattleCreation } from '~/composables/useBattleCreation'
import BattleTaxonomySelectors from '~/components/battle/BattleTaxonomySelectors.vue'

const emit = defineEmits(['battleCreated'])

const { level, grade, subject, topic, difficulty, totalQuestions, difficulties, questionCountOptions, starting, canStart, createBattle } = useBattleCreation({ battleType: '1v1' })
const totalTimeMinutes = ref(null)

async function startBattle() {
  const totalTimeSeconds = totalTimeMinutes && totalTimeMinutes.value ? Math.max(0, Math.floor(totalTimeMinutes.value * 60)) : null
  const { battle, error } = await createBattle({ totalTimeSeconds })
  emit('battleCreated', battle || { error })
}
</script>
