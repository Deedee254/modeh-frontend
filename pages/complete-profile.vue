<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <div class="text-center">
        <img class="mx-auto h-16 w-auto" src="/logo/modeh-logo.png" alt="Modeh" />
        <h2 class="mt-6 text-3xl font-bold tracking-tight text-gray-900">Complete Your Profile</h2>
        <p class="mt-2 text-sm text-gray-600">
          Please provide additional information to complete your profile
        </p>
      </div>

      <!-- Step Indicator -->
      <div class="relative">
        <div class="absolute inset-0 flex items-center" aria-hidden="true">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-between">
          <span 
            v-for="(step, index) in steps" 
            :key="step.key"
            :class="[
              'px-2 py-1 text-sm rounded-full',
              currentStep === step.key ? 'bg-blue-600 text-white' : 
              completedSteps.includes(step.key) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
            ]"
          >
            {{ index + 1 }}
          </span>
        </div>
      </div>

      <!-- Institution Step -->
      <div v-if="currentStep === 'institution'" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Institution / School Name</label>
          <input 
            v-model="formData.institution"
            type="text" 
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required 
          />
        </div>
      </div>

      <!-- Role Selection Step -->
      <div v-if="currentStep === 'role'" class="space-y-6">
        <div class="flex flex-col space-y-4">
          <button 
            @click="selectRole('quizee')"
            :class="[
              'px-6 py-4 border-2 rounded-lg flex items-center space-x-3',
              formData.role === 'quizee' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'
            ]"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
            </svg>
            <div class="text-left">
              <div class="font-medium">I am a quizee</div>
              <div class="text-sm text-gray-500">Join classes and take quizzes</div>
            </div>
          </button>

          <button 
            @click="selectRole('quiz-master')"
            :class="[
              'px-6 py-4 border-2 rounded-lg flex items-center space-x-3',
              formData.role === 'quiz-master' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'
            ]"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
            </svg>
            <div class="text-left">
              <div class="font-medium">I am a quiz-master</div>
              <div class="text-sm text-gray-500">Create classes and manage quizzes</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Grade Selection Step (quizees) -->
      <div v-if="currentStep === 'grade'" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Select Your Education Level</label>
          <select
            v-model="formData.level_id"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Level (optional)</option>
            <option v-for="lvl in levels" :key="lvl.id" :value="lvl.id">{{ lvl.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Select Your Grade</label>
          <select 
            v-model="formData.grade"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Grade</option>
            <option v-for="grade in grades" :key="grade" :value="grade">
              Grade {{ grade }}
            </option>
          </select>
        </div>
      </div>

      <!-- Subject Selection Step (quiz-masters) -->
      <div v-if="currentStep === 'subjects'" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Select Your Subject Specializations</label>
          <div class="mt-2 grid grid-cols-2 gap-2">
            <label 
              v-for="subject in subjects" 
              :key="subject"
              class="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50"
            >
              <input 
                type="checkbox"
                :value="subject"
                v-model="formData.subjects"
                class="mr-2"
              />
              <span class="text-sm">{{ subject }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex justify-between space-x-4">
        <button
          v-if="!isFirstStep"
          @click="previousStep"
          class="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Previous
        </button>

        <button
          @click="nextStep"
          :disabled="!canProceed || isLoading"
          class="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <svg 
            v-if="isLoading" 
            class="animate-spin -ml-1 mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {{ isLastStep ? 'Complete Profile' : 'Next' }}
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="rounded-md bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-red-800">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import useApi from '~/composables/useApi'
import useTaxonomy from '~/composables/useTaxonomy'

// Meta setup
definePageMeta({
  layout: 'auth',
  middleware: ['auth']
})

// Dynamic meta information based on user state
const auth = useAuthStore()

useHead(() => ({
  title: `Complete Your Profile | Modeh`,
  meta: [
    {
      name: 'description',
      content: `Complete your ${auth.user?.name || 'user'} profile on Modeh to get started`
    },
    {
      property: 'og:title',
      content: `Complete Your Profile | Modeh`
    },
    {
      property: 'og:description',
      content: `Complete your ${auth.user?.name || 'user'} profile on Modeh to get started`
    }
  ]
}))

const router = useRouter()
const isLoading = ref(false)

// Step configuration
const steps = [
  { key: 'institution', label: 'Institution' },
  { key: 'role', label: 'Role' },
  { key: 'grade', label: 'Grade', condition: () => formData.role === 'quizee' },
  { key: 'subjects', label: 'Subjects', condition: () => formData.role === 'quiz-master' },
]

const currentStep = ref('institution')
const completedSteps = ref([])

// Form data
const formData = ref({
  institution: '',
  role: '',
  grade: '',
  level_id: '',
  subjects: []
})

// Options for dropdowns
const grades = Array.from({ length: 12 }, (_, i) => i + 1)
const subjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
  'Computer Science'
]

// load taxonomy levels for level selector
const { levels, fetchLevels, loadingLevels } = useTaxonomy()

onMounted(async () => {
  try { await fetchLevels() } catch (e) {}
})

// Computed properties for navigation
const activeSteps = computed(() => steps.filter(step => 
  !step.condition || step.condition()
))

const currentStepIndex = computed(() => 
  activeSteps.value.findIndex(step => step.key === currentStep.value)
)

const isFirstStep = computed(() => currentStepIndex.value === 0)
const isLastStep = computed(() => currentStepIndex.value === activeSteps.value.length - 1)

// Form validation
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 'institution':
      return !!formData.value.institution.trim()
    case 'role':
      return !!formData.value.role
    case 'grade':
      return formData.value.role !== 'quizee' || !!formData.value.grade
    case 'subjects':
      return formData.value.role !== 'quiz-master' || formData.value.subjects.length > 0
    default:
      return false
  }
})

// Navigation functions
function nextStep() {
  if (isLoading.value) return

  if (isLastStep.value) {
    completeProfile()
    return
  }

  completedSteps.value.push(currentStep.value)
  const nextIndex = currentStepIndex.value + 1
  if (nextIndex < activeSteps.value.length) {
    currentStep.value = activeSteps.value[nextIndex].key
  }
}

function previousStep() {
  const prevIndex = currentStepIndex.value - 1
  if (prevIndex >= 0) {
    currentStep.value = activeSteps.value[prevIndex].key
    completedSteps.value.pop()
  }
}

function selectRole(role) {
  formData.value.role = role
  formData.value.grade = ''
  formData.value.subjects = []
}

// API interaction
async function completeProfile() {
  if (isLoading.value) return
  error.value = null
  isLoading.value = true

  try {
    const api = useApi()
    const response = await api.postJson('/api/profile/complete', { ...formData.value })
    if (api.handleAuthStatus(response)) return
    if (!response.ok) throw new Error('Failed to complete profile')
    const data = await response.json()
    auth.setUser(data.user || data)

    // Redirect based on role
    if (formData.value.role === 'quizee') {
      router.push('/quizee/dashboard')
    } else {
      router.push('/quiz-master/dashboard')
    }
  } catch (e) {
    const data = e?.data || e?.response || null
    error.value = data?.message || 'Failed to complete profile'
  } finally {
    isLoading.value = false
  }
}
</script>