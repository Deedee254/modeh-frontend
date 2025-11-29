<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-lg space-y-8">
      <!-- Logo and Greeting -->
      <div class="text-center">
        <img class="mx-auto h-12 w-auto" src="/logo/modeh-logo.png" alt="Modeh" />
        <h1 class="mt-4 text-3xl font-bold tracking-tight text-gray-900">Welcome, {{ (user as any)?.name }}!</h1>
        <p class="mt-2 text-sm text-gray-600">Let's complete your profile to get started</p>
      </div>

      <!-- Missing Fields Form -->
      <div class="bg-white py-8 px-6 shadow rounded-lg">
        <form @submit.prevent="saveProfile" class="space-y-6">
          <!-- Institution (for all roles) -->
          <div v-if="missingFields.includes('institution')">
            <label class="block text-sm font-medium text-gray-700">Institution / School</label>
            <input
              v-model="form.institution"
              type="text"
              placeholder="e.g., University Name"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
            <p v-if="fieldErrors.institution" class="mt-1 text-sm text-red-600">{{ fieldErrors.institution }}</p>
          </div>

          <!-- Level (for quizee and quiz-master) -->
          <div v-if="missingFields.includes('level')">
            <label class="block text-sm font-medium text-gray-700">Education Level</label>
            <select
              v-model="form.level_id"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="">Select an education level</option>
              <option v-for="level in levels" :key="level.id" :value="level.id">
                {{ level.name }}
              </option>
            </select>
            <p v-if="fieldErrors.level_id" class="mt-1 text-sm text-red-600">{{ fieldErrors.level_id }}</p>
          </div>

          <!-- Grade (for quizee) -->
          <div v-if="missingFields.includes('grade')">
            <label class="block text-sm font-medium text-gray-700">Grade / Class</label>
            <select
              v-model="form.grade_id"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="">Select your grade</option>
              <option v-for="grade in filteredGrades" :key="grade.id" :value="grade.id">
                {{ grade.name }}
              </option>
            </select>
            <p v-if="fieldErrors.grade_id" class="mt-1 text-sm text-red-600">{{ fieldErrors.grade_id }}</p>
          </div>

          <!-- Subjects (for quizee and quiz-master) -->
          <div v-if="missingFields.includes('subjects')">
            <label class="block text-sm font-medium text-gray-700">
              {{ (user as any)?.role === 'quiz-master' ? 'Teaching Subjects' : 'Subjects' }}
            </label>
            <div class="mt-2 border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
              <label
                v-for="subject in subjectsList"
                :key="(subject as any).id"
                class="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="checkbox"
                  :value="(subject as any).id"
                  v-model="form.subjects"
                  class="h-4 w-4 text-brand-600"
                />
                <span class="ml-3 text-sm text-gray-700">{{ (subject as any).name }}</span>
              </label>
            </div>
            <p class="mt-1 text-xs text-gray-500">Select at least one subject</p>
            <p v-if="fieldErrors.subjects" class="mt-1 text-sm text-red-600">{{ fieldErrors.subjects }}</p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading || !canSubmit"
            class="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
          >
            <svg
              v-if="isLoading"
              class="animate-spin -ml-1 mr-2 h-4 w-4 inline"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {{ isLoading ? 'Saving...' : 'Complete Profile' }}
          </button>

          <!-- Skip Button -->
          <button
            v-if="canSkip"
            type="button"
            @click="skipAndGoToDashboard"
            class="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Skip for now
          </button>
        </form>

        <!-- Error Message -->
        <div v-if="error" class="mt-4 rounded-md bg-red-50 p-4">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
            <div class="ml-3">
              <p class="text-sm font-medium text-red-800">{{ error }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import useApi from '~/composables/useApi'
import useTaxonomy from '~/composables/useTaxonomy'

definePageMeta({
  layout: 'auth',
  middleware: ['auth']
})

const router = useRouter()
const auth = useAuthStore()
const api = useApi()
const isLoading = ref(false)
const error = ref<string | null>(null)

// Get user info from auth store
const user = computed<any>(() => auth.user)

// Taxonomy data
const { levels, fetchLevels, grades, fetchGradesByLevel } = useTaxonomy()
const subjectsList = ref<any[]>([])

// Form state - only fields that might be missing
const form = ref({
  institution: '',
  level_id: '',
  grade_id: '',
  subjects: []
})

// Track validation errors
const fieldErrors = ref<Record<string, string>>({
  institution: '',
  level_id: '',
  grade_id: '',
  subjects: ''
})

// Get missing fields from auth store or initialize empty
const missingFields = computed<string[]>(() => {
  return (auth.user as any)?.missing_profile_fields || []
})

// Filtered grades based on selected level
const filteredGrades = computed(() => {
  if (!form.value.level_id) return grades.value || []
  return ((grades.value as any) || []).filter((g: any) => String(g.level_id) === String(form.value.level_id))
})

// Can submit if all required missing fields are filled
const canSubmit = computed(() => {
  for (const field of missingFields.value) {
    if (field === 'institution' && !form.value.institution?.trim()) return false
    if (field === 'level' && !form.value.level_id) return false
    if (field === 'grade' && !form.value.grade_id) return false
    if (field === 'subjects' && form.value.subjects.length === 0) return false
  }
  return true
})

// Can skip if only optional fields are missing
const canSkip = computed(() => {
  const required = ['grade', 'subjects']
  const onlyOptional = missingFields.value.every((f: any) => !required.includes(f))
  return onlyOptional && missingFields.value.length > 0
})

// Fetch levels and subjects on mount
onMounted(async () => {
  try {
    await fetchLevels()
    // Fetch all subjects for checkbox list
    const subRes = await api.get('/api/taxonomies/subjects')
    if (subRes.ok) {
      const data = await subRes.json()
      subjectsList.value = Array.isArray(data) ? data : data.data || []
    }
  } catch (e) {
    console.error('Failed to load taxonomy:', e)
  }
})

// Sync grades when level changes
const onLevelChange = async () => {
  if (form.value.level_id && typeof fetchGradesByLevel === 'function') {
    try {
      await fetchGradesByLevel(form.value.level_id)
    } catch (e) {
      console.error('Failed to fetch grades:', e)
    }
  }
}

// Watch level changes
watch(() => form.value.level_id, onLevelChange)

// Save profile with only the fields that were missing
async function saveProfile() {
  if (isLoading.value || !canSubmit.value) return
  error.value = null

  // Clear field errors
  for (const k in fieldErrors.value) {
    fieldErrors.value[k as keyof typeof fieldErrors.value] = ''
  }

  isLoading.value = true

  try {
    const payload: Record<string, any> = {}

    // Only send fields that were marked as missing
    if (missingFields.value.includes('institution')) {
      payload.institution = form.value.institution
    }
    if (missingFields.value.includes('level')) {
      payload.level_id = form.value.level_id
    }
    if (missingFields.value.includes('grade')) {
      payload.grade_id = form.value.grade_id
    }
    if (missingFields.value.includes('subjects')) {
      payload.subjects = form.value.subjects
    }

    // Determine which endpoint to call based on role
    let endpoint = '/api/profile/quizee'
    const userRole = (user.value as any)?.role
    if (userRole === 'quiz-master') {
      endpoint = '/api/profile/quiz-master'
    }

    const response = await api.patchJson(endpoint, payload)
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      if (data?.errors) {
        for (const [key, value] of Object.entries(data.errors)) {
          if (key in fieldErrors.value) {
            const msg = Array.isArray(value) ? (value[0] as string) : String(value ?? '')
            fieldErrors.value[key as keyof typeof fieldErrors.value] = msg || ''
          }
        }
      }
      error.value = data?.message || 'Failed to save profile'
      return
    }

    const data = await response.json()
    // Update auth store with returned user
    if (data.user) {
      auth.setUser(data.user)
    }

    // Redirect based on role
    const role = userRole || 'quizee'
    if (role === 'quiz-master') {
      router.push('/quiz-master/dashboard')
    } else {
      router.push('/quizee/dashboard')
    }
  } catch (e) {
    error.value = 'An error occurred while saving. Please try again.'
    console.error('Save error:', e)
  } finally {
    isLoading.value = false
  }
}

// Skip and go to dashboard
async function skipAndGoToDashboard() {
  const role = (user.value as any)?.role || 'quizee'
  if (role === 'quiz-master') {
    router.push('/quiz-master/dashboard')
  } else {
    router.push('/quizee/dashboard')
  }
}
</script>