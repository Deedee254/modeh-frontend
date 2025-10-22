<template>
  <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
    <div class="flex flex-col space-y-1.5 p-4 xl:p-6">
      <div class="text-2xl font-semibold leading-none tracking-tight">{{ title }}</div>
      <div class="text-sm text-muted-foreground">{{ description }}</div>
    </div>
    
    <div class="p-4 xl:p-6 xl:pt-0 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium leading-none">Level</label>
            <TaxonomyPicker resource="levels" :model-value="level" compact title="Levels" subtitle="Pick a level" @update:modelValue="(v) => level = v" />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium leading-none">Grade / Course</label>
            <TaxonomyPicker resource="grades" :level-id="level || null" :model-value="grade" compact title="Grades" subtitle="Pick a grade or course" @update:modelValue="(v) => grade = v" />
          </div>
        <div class="space-y-2">
          <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="battle-type">Battle Type</label>
          <div class="grid grid-cols-2 gap-2">
            <UButton
              :color="battleType === 'public' ? 'primary' : 'white'"
              class="w-full"
              @click="battleType = 'public'"
            >
              <i-lucide-globe class="h-4 w-4" />
              <span>Public</span>
            </UButton>
            <UButton
              :color="battleType === 'private' ? 'primary' : 'white'"
              class="w-full"
              @click="battleType = 'private'"
            >
              <i-lucide-lock class="h-4 w-4" />
              <span>Private</span>
            </UButton>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium leading-none" for="category">Category</label>
          <USelect
            v-model="category"
            :options="categories"
            placeholder="Select category"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium leading-none" for="difficulty">Difficulty</label>
          <USelect
            v-model="difficulty"
            :options="difficulties"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium leading-none" for="time-per-question">Time Per Question (seconds)</label>
          <USelect
            v-model="timePerQuestion"
            :options="timeOptions"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium leading-none" for="total-questions">Number of Questions</label>
          <USelect
            v-model="totalQuestions"
            :options="questionCountOptions"
          />
        </div>
      </div>
    </div>

    <div class="flex items-center p-4 xl:p-6 xl:pt-0">
      <UButton
        color="primary"
        class="w-full"
        @click="startBattle"
      >
        Start {{ title }}
      </UButton>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TaxonomyPicker from '~/components/taxonomy/TaxonomyPicker.vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['start'])

const battleType = ref('public')
const category = ref('random')
const difficulty = ref('medium')
const timePerQuestion = ref(10)
const totalQuestions = ref(10)
const level = ref(null)
const grade = ref(null)

const categories = [
  { label: 'Random', value: 'random' },
  { label: 'Science', value: 'science' },
  { label: 'History', value: 'history' },
  { label: 'Geography', value: 'geography' },
  // Add more categories
]

const difficulties = [
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' }
]

const timeOptions = [
  { label: '5 seconds', value: 5 },
  { label: '10 seconds', value: 10 },
  { label: '15 seconds', value: 15 },
  { label: '20 seconds', value: 20 },
  { label: '30 seconds', value: 30 }
]

const questionCountOptions = [
  { label: '5 questions', value: 5 },
  { label: '10 questions', value: 10 },
  { label: '15 questions', value: 15 },
  { label: '20 questions', value: 20 }
]

const startBattle = () => {
  emit('start', {
    battleType: battleType.value,
    category: category.value,
    difficulty: difficulty.value,
    timePerQuestion: timePerQuestion.value,
    totalQuestions: totalQuestions.value,
    level_id: level || null,
    grade_id: grade || null
  })
}
</script>