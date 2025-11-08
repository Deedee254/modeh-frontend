<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <!-- Greeting Message -->
      <div class="text-center">
        <h1 class="text-2xl font-semibold text-gray-800">
          Welcome back, {{ formData.email }}!
        </h1>
      </div>

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
  { key: 'grade', label: 'Grade', condition: () => formData.role === 'quizee' },
  { key: 'subjects', label: 'Subjects', condition: () => formData.role === 'quiz-master' },
]

const currentStep = ref('institution')
const completedSteps = ref([])

// Form data
const formData = ref({
  email: '', // Added email to formData
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
  try { 
    await fetchLevels() 
    fetchUserData() // Fetch user data on mount
  } catch (e) {}
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

// Fetch user data and populate formData
function fetchUserData() {
  // Logic to fetch user data and set formData.email
  formData.value.email = 'user@example.com' // Replace with actual fetching logic
}

</script>