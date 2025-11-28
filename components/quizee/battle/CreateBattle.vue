<template>
  <ClientOnly>
    <div class="p-2">
    <BattleTaxonomySelectors
      v-model:level="level"
      v-model:grade="grade"
      v-model:subject="subject"
      v-model:topic="topic"
    />

    <!-- Error Alert -->
    <div v-if="errorMessage" class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <p class="text-sm text-red-700 dark:text-red-200">{{ errorMessage }}</p>
    </div>

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
        class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 font-semibold rounded-lg text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
const errorMessage = ref(null)

async function startBattle() {
  errorMessage.value = null
  try {
    const totalTimeSeconds = totalTimeMinutes && totalTimeMinutes.value ? Math.max(0, Math.floor(totalTimeMinutes.value * 60)) : null
    const result = await createBattle({ totalTimeSeconds })
    if (result && result.battle) {
      emit('battleCreated', result.battle)
    } else if (result && result.error) {
      errorMessage.value = result.error
    }
  } catch (err) {
    errorMessage.value = err.message || 'Failed to create battle'
  }
}
</script>

