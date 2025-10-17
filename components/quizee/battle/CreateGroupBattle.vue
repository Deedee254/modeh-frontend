<template>
  <div class="p-2">
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Create a private battle room and invite your friends to join.</p>
    <div class="space-y-4">
      <div>
        <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Battle Name</label>
        <UInput v-model="battleName" placeholder="e.g., 'Friday Night Trivia'" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Grade</label>
          <USelect v-model="grade" :options="grades" placeholder="Select grade" />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Subject</label>
          <USelect v-model="subject" :options="subjects" placeholder="Select subject" :disabled="!grade" />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Topic</label>
          <USelect v-model="topic" :options="topics" placeholder="Select topic" :disabled="!subject" />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Difficulty</label>
          <USelect v-model="difficulty" :options="difficulties" />
        </div>
        <div class="md:col-span-2">
          <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Number of Questions</label>
          <USelect v-model="totalQuestions" :options="questionCountOptions" />
        </div>
        <div class="md:col-span-2">
          <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Max Players</label>
          <USelect v-model="maxPlayers" :options="maxPlayerOptions" />
        </div>
      </div>
    </div>

    <div class="mt-6">
      <UButton color="primary" class="w-full" @click="startBattle" :disabled="starting || !canStart">Create Group Battle</UButton>
    </div>

    <div v-if="starting" class="mt-3 text-sm text-center text-gray-500 dark:text-gray-400">Creating group battle...</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBattleCreation } from '~/composables/useBattleCreation'

const emit = defineEmits(['battleCreated'])

const battleName = ref('')
const maxPlayers = ref(4)

const maxPlayerOptions = [
  { label: '2 Players', value: 2 },
  { label: '4 Players', value: 4 },
  { label: '6 Players', value: 6 },
  { label: '8 Players', value: 8 },
  { label: '10 Players', value: 10 },
  { label: '16 Players', value: 16 },
]

const { grade, subject, topic, difficulty, totalQuestions, grades, subjects, topics, difficulties, questionCountOptions, starting, canStart, createBattle } = useBattleCreation({ battleType: 'group', battleName, maxPlayers })

async function startBattle() {
  const { battle, error } = await createBattle()
  emit('battleCreated', battle || { error })
}
</script>