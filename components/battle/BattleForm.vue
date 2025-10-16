&lt;template>
  &lt;div class="rounded-lg border bg-card text-card-foreground shadow-sm">
    &lt;div class="flex flex-col space-y-1.5 p-4 xl:p-6">
      &lt;div class="text-2xl font-semibold leading-none tracking-tight">{{ title }}&lt;/div>
      &lt;div class="text-sm text-muted-foreground">{{ description }}&lt;/div>
    &lt;/div>
    
    &lt;div class="p-4 xl:p-6 xl:pt-0 space-y-4">
      &lt;div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        &lt;div class="space-y-2">
          &lt;label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="battle-type">Battle Type&lt;/label>
          &lt;div class="grid grid-cols-2 gap-2">
            &lt;UButton
              :variant="battleType === 'public' ? 'primary' : 'outline'"
              class="w-full"
              @click="battleType = 'public'"
            >
              &lt;i-lucide-globe class="h-4 w-4" />
              &lt;span>Public&lt;/span>
            &lt;/UButton>
            &lt;UButton
              :variant="battleType === 'private' ? 'primary' : 'outline'"
              class="w-full"
              @click="battleType = 'private'"
            >
              &lt;i-lucide-lock class="h-4 w-4" />
              &lt;span>Private&lt;/span>
            &lt;/UButton>
          &lt;/div>
        &lt;/div>

        &lt;div class="space-y-2">
          &lt;label class="text-sm font-medium leading-none" for="category">Category&lt;/label>
          &lt;USelect
            v-model="category"
            :options="categories"
            placeholder="Select category"
          />
        &lt;/div>

        &lt;div class="space-y-2">
          &lt;label class="text-sm font-medium leading-none" for="difficulty">Difficulty&lt;/label>
          &lt;USelect
            v-model="difficulty"
            :options="difficulties"
          />
        &lt;/div>

        &lt;div class="space-y-2">
          &lt;label class="text-sm font-medium leading-none" for="time-per-question">Time Per Question (seconds)&lt;/label>
          &lt;USelect
            v-model="timePerQuestion"
            :options="timeOptions"
          />
        &lt;/div>

        &lt;div class="space-y-2">
          &lt;label class="text-sm font-medium leading-none" for="total-questions">Number of Questions&lt;/label>
          &lt;USelect
            v-model="totalQuestions"
            :options="questionCountOptions"
          />
        &lt;/div>
      &lt;/div>
    &lt;/div>

    &lt;div class="flex items-center p-4 xl:p-6 xl:pt-0">
      &lt;UButton
        variant="primary"
        class="w-full"
        @click="startBattle"
      >
        Start {{ title }}
      &lt;/UButton>
    &lt;/div>
  &lt;/div>
&lt;/template>

&lt;script setup>
import { ref } from 'vue'

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
    totalQuestions: totalQuestions.value
  })
}
&lt;/script>