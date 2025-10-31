<template>
  <ClientOnly>
    <template #placeholder>
      <!-- SSR-safe placeholder matching the client-side wrapper to avoid hydration mismatches -->
      <div class="p-2">
        <div class="space-y-3">
          <div class="h-4 bg-slate-200 rounded w-2/3"></div>
          <div class="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    </template>
    <div class="p-2">
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Create a private battle room and invite your friends to join.</p>
      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Battle Name</label>
          <UInput v-model="battleName" placeholder="e.g., 'Friday Night Trivia'" />
        </div>

        <BattleTaxonomySelectors
          v-model:level="level"
          v-model:grade="grade"
          v-model:subject="subject"
          v-model:topic="topic"
        />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Difficulty</label>
            <USelect v-model="difficulty" :options="difficulties" />
          </div>
          <div class="md:col-span-2">
            <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Number of Questions</label>
            <USelect v-model="totalQuestions" :options="questionCountOptions" />
          </div>
          <div class="md:col-span-2">
            <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Total Battle Time (minutes)</label>
            <UInput v-model.number="totalTimeMinutes" type="number" min="1" placeholder="e.g., 10" />
            <p class="text-xs text-gray-500 mt-1">Optional — if set, each question will be given an equal share of this time.</p>
          </div>
          <div class="md:col-span-2">
            <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Max Players</label>
            <USelect v-model="maxPlayers" :options="maxPlayerOptions" />
          </div>
        </div>
      </div>

      <div class="mt-6">
        <button
          @click="startBattle"
          :disabled="starting || !canStart"
          class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Create Group Battle
        </button>
      </div>

      <div v-if="starting" class="mt-3 text-sm text-center text-gray-500 dark:text-gray-400">Creating group battle...</div>
    </div>
  </ClientOnly>

</template>

<script setup>
import { ref } from 'vue'
import { useBattleCreation } from '~/composables/useBattleCreation'
import BattleTaxonomySelectors from '~/components/battle/BattleTaxonomySelectors.vue'

const emit = defineEmits(['battleCreated'])

const battleName = ref('')
const maxPlayers = ref(4)
const totalTimeMinutes = ref(null)

const maxPlayerOptions = [
  { label: '2 Players', value: 2 },
  { label: '4 Players', value: 4 },
  { label: '6 Players', value: 6 },
  { label: '8 Players', value: 8 },
  { label: '10 Players', value: 10 },
  { label: '16 Players', value: 16 },
]

const { level, grade, subject, topic, difficulty, totalQuestions, difficulties, questionCountOptions, starting, canStart, createBattle } = useBattleCreation({ battleType: 'group', battleName, maxPlayers })

async function startBattle() {
  const totalTimeSeconds = totalTimeMinutes && totalTimeMinutes.value ? Math.max(0, Math.floor(totalTimeMinutes.value * 60)) : null
  const { battle, error } = await createBattle({ totalTimeSeconds })
  emit('battleCreated', battle || { error })
}
</script>