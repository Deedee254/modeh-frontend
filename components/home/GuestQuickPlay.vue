<template>
  <div class="h-full flex flex-col">
    <!-- Game State: Playing -->
    <div v-if="isPlaying" class="flex-1 flex flex-col min-h-[400px]">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-sm">
            {{ currentQuestionIndex + 1 }}
          </span>
          <span class="text-sm text-slate-500 uppercase tracking-wide font-semibold">of {{ totalQuestions }}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full bg-brand-500 transition-all duration-300" :style="{ width: `${progress}%` }"></div>
          </div>
          <span class="text-xs font-mono text-slate-400">{{ formatTime(timer) }}</span>
        </div>
      </div>

      <!-- Question -->
      <div class="flex-1 flex flex-col justify-center mb-8">
        <h3 class="text-xl md:text-2xl font-bold text-slate-900 leading-tight mb-6">
          {{ currentQuestion.text }}
        </h3>

        <!-- Options -->
        <div class="space-y-3">
          <button
            v-for="option in currentQuestion.options"
            :key="option.id"
            @click="selectOption(option)"
            :disabled="showResult"
            class="w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center justify-between group"
            :class="getOptionClass(option)"
          >
            <span class="font-medium" :class="getOptionTextClass(option)">{{ option.text }}</span>
            
            <!-- Result Icon -->
            <span v-if="showResult && option.id === selectedOptionId">
               <UIcon v-if="option.is_correct" name="heroicons:check-circle" class="text-green-500 text-xl" />
               <UIcon v-else name="heroicons:x-circle" class="text-red-500 text-xl" />
            </span>
            <span v-else-if="showResult && option.is_correct">
               <UIcon name="heroicons:check-circle" class="text-green-500 text-xl" />
            </span>
            <span v-else class="h-5 w-5 rounded-full border-2 border-slate-200 group-hover:border-brand-400 transition-colors"></span>
          </button>
        </div>
      </div>

      <!-- Feedback / Next -->
      <div v-if="showResult" class="animate-fade-in-up">
        <div class="p-4 rounded-xl mb-4" :class="isCorrect ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'">
           <p class="font-bold" :class="isCorrect ? 'text-green-700' : 'text-red-700'">
             {{ isCorrect ? 'Correct! 🎉' : 'Not quite. The correct answer is highlighted.' }}
           </p>
           <p v-if="currentQuestion.explanation" class="text-sm mt-1" :class="isCorrect ? 'text-green-600' : 'text-red-600'">
             {{ currentQuestion.explanation }}
           </p>
        </div>
        <button 
          @click="nextQuestion" 
          class="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-200 transition-colors"
        >
          {{ isLastQuestion ? 'Finish' : 'Next Question' }}
        </button>
      </div>
    </div>

    <!-- Game State: Completed -->
    <div v-else-if="isCompleted" class="flex-1 flex flex-col items-center justify-center text-center p-6 animate-fade-in">
        <div class="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mb-6 text-4xl">
           🏆
        </div>
        <h3 class="text-2xl font-bold text-slate-900 mb-2">Great Job!</h3>
        
        <!-- Results Card with Blur Effect for Guests -->
        <div class="w-full max-w-xs mb-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 relative">
           <!-- Blur overlay -->
           <div v-if="!auth.user" class="absolute inset-0 rounded-xl bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
              <div class="text-center">
                 <p class="text-sm font-semibold text-slate-900 mb-2">Sign up to see your full results</p>
                 <p class="text-xs text-slate-500">Including your percentile rank and detailed breakdown</p>
              </div>
           </div>
           
           <!-- Score -->
           <div class="mb-4">
              <div class="text-4xl font-bold text-brand-600">{{ scorePercentage }}%</div>
              <p class="text-sm text-slate-600 mt-1">Score</p>
           </div>
           
           <!-- Breakdown -->
           <div class="grid grid-cols-2 gap-3">
              <div class="bg-white rounded-lg p-3 border border-slate-200">
                 <div class="text-lg font-bold text-green-600">{{ score }}</div>
                 <div class="text-xs text-slate-600">Correct</div>
              </div>
              <div class="bg-white rounded-lg p-3 border border-slate-200">
                 <div class="text-lg font-bold text-red-600">{{ totalQuestions - score }}</div>
                 <div class="text-xs text-slate-600">Incorrect</div>
              </div>
           </div>
           
           <!-- Percentile (blurred for guests) -->
           <div v-if="!auth.user" class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p class="text-xs font-semibold text-blue-900">Estimated percentile</p>
              <p class="text-sm font-bold text-blue-700">Top {{ percentile }}%</p>
           </div>
           <div v-else class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p class="text-xs font-semibold text-blue-900">Your percentile</p>
              <p class="text-sm font-bold text-blue-700">Top {{ percentile }}%</p>
           </div>
        </div>
        
        <div class="space-y-3 w-full max-w-xs">
           <NuxtLink to="/register/quizee" class="block w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg transition-colors">
              Create Free Account to Save
           </NuxtLink>
           <button @click="resetGame" class="block w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl transition-colors">
              Try Another Topic
           </button>
        </div>
        <p class="text-xs text-slate-400 mt-4">Join 10,000+ Quizees mastering new skills daily.</p>
    </div>

    <!-- Initial State: Selection -->
    <div v-else class="h-full flex flex-col">
       <div class="text-center mb-6">
          <h3 class="text-xl font-bold text-slate-900">Try it out now</h3>
          <p class="text-sm text-slate-500">Pick a topic to start a quick 5-question battle.</p>
       </div>

       <div class="flex-1 overflow-hidden flex flex-col bg-slate-50 rounded-xl border border-slate-200">
           <!-- Tab Switcher -->
           <div class="flex border-b border-slate-200">
              <button 
                @click="mode = 'quiz'"
                class="flex-1 py-3 text-sm font-bold transition-colors border-b-2"
                :class="mode === 'quiz' ? 'text-brand-600 border-brand-600 bg-white' : 'text-slate-500 border-transparent hover:text-slate-700'"
              >
                 <UIcon name="heroicons:document-text" class="mr-1 inline-block" /> Practice Quiz
              </button>
              <button 
                @click="mode = 'battle'"
                class="flex-1 py-3 text-sm font-bold transition-colors border-b-2"
                :class="mode === 'battle' ? 'text-brand-600 border-brand-600 bg-white' : 'text-slate-500 border-transparent hover:text-slate-700'"
              >
                 <UIcon name="heroicons:bolt" class="mr-1 inline-block" /> Quick Battle
              </button>
           </div>

           <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <TaxonomyFlowPicker 
                 v-if="mode === 'battle'"
                 v-model="selections" 
                 :include-topics="true"
                 @submit="startBattle"
                 class="h-full"
              />
              <div v-else class="h-full flex flex-col">
                 <!-- Show previous attempt results if exists -->
                 <div v-if="previousAttempt" class="h-full flex flex-col justify-center items-center text-center p-6">
                    <div class="mb-6">
                       <div class="text-5xl font-bold text-brand-600 mb-2">{{ Math.round(previousAttempt.score) }}%</div>
                       <p class="text-slate-600 text-sm">Score on {{ previousAttempt.quiz_title }}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-3 mb-6 w-full max-w-xs">
                       <div class="bg-green-50 rounded-lg p-3">
                          <div class="text-lg font-bold text-green-600">{{ previousAttempt.correct_count }}</div>
                          <div class="text-xs text-green-700">Correct</div>
                       </div>
                       <div class="bg-red-50 rounded-lg p-3">
                          <div class="text-lg font-bold text-red-600">{{ previousAttempt.incorrect_count }}</div>
                          <div class="text-xs text-red-700">Incorrect</div>
                       </div>
                    </div>
                    <div class="space-y-2 w-full max-w-xs">
                       <button 
                          @click="resetAndFetchQuizzes"
                          class="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-lg transition-colors"
                       >
                          Try Another Quiz
                       </button>
                       <NuxtLink 
                          to="/register/quizee"
                          class="block w-full py-2 bg-white border border-brand-600 text-brand-600 text-sm font-semibold rounded-lg hover:bg-brand-50 transition-colors"
                       >
                          Save Results
                       </NuxtLink>
                    </div>
                 </div>

                 <!-- Show quiz list if no previous attempt -->
                 <div v-else-if="loadingQuizzes" class="flex-1 flex items-center justify-center">
                    <svg class="h-8 w-8 animate-spin text-brand-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                 </div>
                 <div v-else-if="quizzes.length === 0" class="flex-1 flex flex-col justify-center items-center text-center p-4">
                     <div class="mb-4">
                        <UIcon name="heroicons:face-frown" class="text-4xl text-slate-300" />
                     </div>
                     <p class="text-slate-500 text-sm">No free quizzes available right now.</p>
                 </div>
                 <div v-else class="flex-1 overflow-y-auto space-y-3 p-1">
                       <NuxtLink
                              v-for="quiz in quizzes"
                              :key="quiz.id"
                              :to="{ path: `/quizzes/${quiz.slug}` }"
                              class="relative p-3 bg-white border border-slate-200 rounded-xl hover:border-brand-300 hover:shadow-sm transition-all group block"
                              aria-label="View quiz details"
                           >
                              <!-- Free / Premium badge (positioned top-right to match QuizCard) -->
                              <span class="absolute top-3 right-3 z-20">
                                 <span v-if="!quiz.is_paid" class="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-500 text-white">Free</span>
                                 <span v-else class="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-500 text-white">Premium</span>
                              </span>
                              <div class="flex gap-3 items-center">
                                                 <div class="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <img v-if="quiz.cover" :src="quiz.cover" class="w-full h-full object-cover" />
                                    <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                                       <UIcon name="heroicons:photo" class="text-xl" />
                                    </div>
                                 </div>
                                 <div class="flex-1 min-w-0">
                                    <h4 class="font-bold text-slate-900 text-sm truncate group-hover:text-brand-600 transition-colors">{{ quiz.title }}</h4>
                                    <p class="text-xs text-slate-500 line-clamp-2 mt-1">{{ quiz.description || 'No description' }}</p>
                                    <div class="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                       <span class="flex items-center gap-1"><UIcon name="heroicons:question-mark-circle" class="w-3 h-3" /> {{ quiz.questions_count || 0 }} Qs</span>
                                       <span class="flex items-center gap-1"><UIcon name="heroicons:clock" class="w-3 h-3" /> {{ Math.floor((quiz.timer_seconds || 600) / 60) }}m</span>
                                    </div>
                                 </div>
                                 <div class="self-center">
                                    <button
                                      @click.stop="onStartClick(quiz)"
                                      class="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors"
                                      :aria-label="quiz.is_paid ? 'View details' : 'Start quiz'"
                                      title="Start"
                                    >
                                       <UIcon name="heroicons:play" class="ml-0.5" />
                                    </button>
                                 </div>
                              </div>
                           </NuxtLink>
                 </div>
              </div>
           </div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from '#imports'
import TaxonomyFlowPicker from '~/components/taxonomy/TaxonomyFlowPicker.vue'
import { useAuthStore } from '~/stores/auth'
import { useGuestQuizStore } from '~/composables/useGuestQuizStore'
import useApi from '~/composables/useApi'

const router = useRouter()
const auth = useAuthStore()
const guestQuizStore = useGuestQuizStore()
const api = useApi()

// State
const mode = ref<'battle' | 'quiz'>('quiz')
const isPlaying = ref(false)
const isCompleted = ref(false)
const selections = ref({ level: null, grade: null, subject: null, topic: null })

// Quiz List State
const quizzes = ref<any[]>([])
const loadingQuizzes = ref(false)
const previousAttempt = ref<any>(null)

// Fetch Quizzes when component mounts (client-only)
onMounted(() => {
  if (mode.value === 'quiz') {
    // Check if guest has any quiz attempts
    if (typeof window !== 'undefined') {
      guestQuizStore.initializeStore()
      const allResults = guestQuizStore.getAllResults()
      
      if (allResults && allResults.length > 0) {
        // Show the most recent result
        previousAttempt.value = allResults[allResults.length - 1]
      } else if (quizzes.value.length === 0) {
        fetchQuizzes()
      }
    }
  }
})

// Watch mode changes after mount
watch(mode, (newMode) => {
  if (typeof window === 'undefined') return // Skip on server
  
  if (newMode === 'quiz') {
    // Check if guest has any quiz attempts
    guestQuizStore.initializeStore()
    const allResults = guestQuizStore.getAllResults()
    
    if (allResults && allResults.length > 0) {
      // Show the most recent result
      previousAttempt.value = allResults[allResults.length - 1]
    } else if (quizzes.value.length === 0) {
      fetchQuizzes()
    }
  }
})

async function fetchQuizzes() {
   loadingQuizzes.value = true
   try {
      // Fetch public quizzes (limit to 5-10 for the widget)
   const res = await api.get('/api/quizzes?limit=10&is_paid=0')
      if (res.ok) {
         const data = await res.json()
         // controller returns { quizzes: <paginate-result> }
         // prefer quizzes.data (the array) then data.data then data.quizzes (fallback)
         quizzes.value = (data.quizzes && data.quizzes.data) || data.data || data.quizzes || []
      }
   } catch (e) {
      console.error('Failed to fetch inline quizzes', e)
   } finally {
      loadingQuizzes.value = false
   }
}

function navigateToQuiz(slug: string) {
}

function isQuizTaken(quizId: number): boolean {
   guestQuizStore.initializeStore()
   return guestQuizStore.hasQuizBeenTaken(quizId)
}

function resetAndFetchQuizzes() {
   previousAttempt.value = null
   quizzes.value = []
   fetchQuizzes()
}

function onStartClick(quiz: any) {
   if (!quiz) return
   if (!quiz.is_paid) {
      router.push({ path: `/quizzes/${quiz.slug}/take` })
   } else {
      router.push({ path: `/quizzes/${quiz.slug}` })
   }
}

// Game State
const currentQuestionIndex = ref(0)
const score = ref(0)
const timer = ref(0)
const showResult = ref(false)
const selectedOptionId = ref<string | number | null>(null)

// Mock Data (In a real app, fetch questions based on topic ID)
const questions = ref<any[]>([])

const totalQuestions = computed(() => questions.value.length)
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const progress = computed(() => ((currentQuestionIndex.value) / totalQuestions.value) * 100)
const scorePercentage = computed(() => totalQuestions.value > 0 ? Math.round((score.value / totalQuestions.value) * 100) : 0)
const percentile = computed(() => {
  // Simple percentile calculation: 100 - scorePercentage (top performers get higher percentile)
  // In a real app, this would be based on actual user distribution
  const perc = Math.max(1, 100 - scorePercentage.value)
  return perc
})
const isCorrect = computed(() => {
  if (!selectedOptionId.value) return false
  const opt = currentQuestion.value.options.find((o:any) => o.id === selectedOptionId.value)
  return opt?.is_correct
})
const isLastQuestion = computed(() => currentQuestionIndex.value === totalQuestions.value - 1)

// Actions
function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function startBattle(selectionData: any) {
  // If guest has already played, prompt to register
  if (auth.guestPlayed && !auth.user) {
     router.push('/register')
     return
  }

  // Generate mock questions based on topic name for demo
  const topicName = selectionData.topic?.name || 'General Knowledge'
  
  questions.value = [
    {
      id: 1,
      text: `What is a fundamental concept in ${topicName}?`,
      explanation: `This is a key principle of ${topicName}.`,
      options: [
        { id: 'a', text: 'Variation A', is_correct: false },
        { id: 'b', text: 'The Core Principle', is_correct: true },
        { id: 'c', text: 'Option C', is_correct: false },
        { id: 'd', text: 'None of the above', is_correct: false },
      ]
    },
    {
      id: 2,
      text: 'Which of the following is NOT true?',
      explanation: 'Common misconception.',
      options: [
        { id: 'a', text: 'True Statement 1', is_correct: false },
        { id: 'b', text: 'True Statement 2', is_correct: false },
        { id: 'c', text: 'This is False', is_correct: true },
        { id: 'd', text: 'True Statement 3', is_correct: false },
      ]
    },
    {
       id: 3,
       text: 'Select the best definition.',
       options: [
          { id: 'a', text: 'Definition 1', is_correct: true },
          { id: 'b', text: 'Definition 2', is_correct: false },
       ]
    },
    {
       id: 4,
       text: 'Fill in the blank: _____ is essential.',
       options: [
          { id: 'a', text: 'Ignoring data', is_correct: false },
          { id: 'b', text: 'Consistency', is_correct: true },
          { id: 'c', text: 'Randomness', is_correct: false },
       ]
    },
     {
       id: 5,
       text: 'Final challenge question!',
       options: [
          { id: 'a', text: 'Easy Answer', is_correct: false },
          { id: 'b', text: 'Correct Answer', is_correct: true },
       ]
    }
  ]

  isPlaying.value = true
  // Start Timer
  timer.value = 0
  const interval = setInterval(() => {
     if(!isPlaying.value) clearInterval(interval)
     else timer.value++
  }, 1000)
}

function selectOption(option: any) {
  if (showResult.value) return
  selectedOptionId.value = option.id
  showResult.value = true
  if (option.is_correct) score.value++
}

function nextQuestion() {
  if (isLastQuestion.value) {
    completeGame()
  } else {
    currentQuestionIndex.value++
    selectedOptionId.value = null
    showResult.value = false
  }
}

function completeGame() {
  isPlaying.value = false
  isCompleted.value = true
  // Mark guest as played
  if (!auth.user && auth.setGuestPlayed) {
    auth.setGuestPlayed()
  }
}

function resetGame() {
  isPlaying.value = false
  isCompleted.value = false
  currentQuestionIndex.value = 0
  score.value = 0
  timer.value = 0
  showResult.value = false
  selectedOptionId.value = null
  selections.value = { level: null, grade: null, subject: null, topic: null }
}

// Styles
function getOptionClass(option: any) {
  if (showResult.value) {
     if (option.id === selectedOptionId.value) {
        return option.is_correct 
          ? 'bg-green-50 border-green-500' 
          : 'bg-red-50 border-red-500'
     }
     if (option.is_correct) return 'bg-green-50 border-green-500 opacity-75' // Show correct if wrong picked
     return 'bg-slate-50 border-slate-200 opacity-50'
  }
  return 'bg-white border-slate-200 hover:border-brand-300 hover:bg-brand-50 cursor-pointer'
}

function getOptionTextClass(option: any) {
   if (showResult.value) {
      if (option.id === selectedOptionId.value) {
         return option.is_correct ? 'text-green-800' : 'text-red-800'
      }
      if (option.is_correct) return 'text-green-800'
   }
   return 'text-slate-700'
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}
</style>
