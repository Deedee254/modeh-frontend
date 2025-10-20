<template>
  <div class="max-w-2xl mx-auto py-12 px-4">
    <h1 class="text-2xl font-bold mb-4">Complete your profile</h1>
    <p class="mb-6">Please complete your profile information to continue.</p>

    <!-- Institution Form -->
    <div v-if="!institutionAdded" class="bg-white p-6 rounded-lg shadow-sm mb-6">
      <h2 class="text-xl font-semibold mb-4">Institution Information</h2>
      <form @submit.prevent="submitInstitution" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Institution Name</label>
          <input
            v-model="institutionForm.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter your institution name"
          >
        </div>
        <button type="submit" class="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          Save Institution
        </button>
      </form>
    </div>

    <!-- Grade and Subject Selection -->
    <div v-else-if="!gradeAndSubjectsAdded" class="bg-white p-6 rounded-lg shadow-sm mb-6">
      <h2 class="text-xl font-semibold mb-4">Education Information</h2>
      <form @submit.prevent="submitGradeAndSubjects" class="space-y-6">
        <!-- Select Grade -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Your Grade</label>
            <select 
              v-model="gradeForm.grade_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select your grade</option>
              <option v-for="grade in grades" :key="grade.id" :value="grade.id">
                {{ grade.name }}
              </option>
            </select>
          </div>

          <!-- Select Subjects -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Select Your Subjects
              <span class="text-sm text-gray-500">(Choose subjects you want to focus on)</span>
            </label>
            <div class="grid grid-cols-2 gap-2">
              <label 
                v-for="subject in subjects" 
                :key="subject.id" 
                class="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
              >
                <input 
                  type="checkbox"
                  :value="subject.id"
                  v-model="gradeForm.subjects"
                  class="rounded border-gray-300 text-indigo-600"
                >
                <span>{{ subject.name }}</span>
              </label>
            </div>
            <p class="mt-2 text-sm text-gray-500" v-if="gradeForm.subjects.length === 0">
              Please select at least one subject
            </p>
          </div>
        </div>

        <div>
          <button 
            type="submit"
            :disabled="!gradeForm.grade_id || gradeForm.subjects.length === 0"
            class="w-full px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400"
          >
            Save and Continue
          </button>
        </div>
      </form>
    </div>

    <!-- Finalize Profile -->
    <div v-else class="bg-white p-6 rounded-lg shadow-sm mb-6">
      <h2 class="text-xl font-semibold mb-4">Review and Complete</h2>
      
      <div class="space-y-4 mb-6">
        <div>
          <h3 class="font-medium text-gray-700">Institution</h3>
          <p class="text-gray-600">{{ institutionForm.name }}</p>
        </div>
        <div>
          <h3 class="font-medium text-gray-700">Grade</h3>
          <p class="text-gray-600">{{ getGradeName(gradeForm.grade_id) }}</p>
        </div>
        <div>
          <h3 class="font-medium text-gray-700">Selected Subjects</h3>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="subjectId in gradeForm.subjects" 
              :key="subjectId"
              class="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
            >
              {{ getSubjectName(subjectId) }}
            </span>
          </div>
        </div>
      </div>

      <button @click="finalize" class="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
        Complete Profile Setup
      </button>
    </div>

    <div v-if="message" class="mt-4 text-sm text-green-700">{{ message }}</div>
    <div v-if="error" class="mt-4 text-sm text-red-700">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

// Page meta: use the authenticated layout and require auth middleware
definePageMeta({
  layout: 'auth',
  middleware: ['auth']
})

const message = ref(null)
const error = ref(null)
const router = useRouter()
const auth = useAuthStore()
const config = useRuntimeConfig()

// Dynamic head/meta based on current user
useHead(() => ({
  title: `Complete Your Profile | Modeh`,
  meta: [
    { name: 'description', content: `Complete your ${auth.user?.name || 'user'} profile on Modeh to get started` },
    { property: 'og:title', content: `Complete Your Profile | Modeh` },
    { property: 'og:description', content: `Complete your ${auth.user?.name || 'user'} profile on Modeh to get started` }
  ]
}))

// Data for forms
const institutionForm = ref({ name: '' })
const gradeForm = ref({ grade_id: '', subjects: [] })
const grades = ref([])
const subjects = ref([])

// Progress tracking
const institutionAdded = ref(false)
const gradeAndSubjectsAdded = ref(false)

// Fetch grades and subjects
async function fetchData() {
  try {
    const [gradesRes, subjectsRes] = await Promise.all([
      $fetch(config.public.apiBase + '/api/grades', { credentials: 'include' }),
      $fetch(config.public.apiBase + '/api/subjects', { credentials: 'include' })
    ])
  grades.value = (gradesRes?.data || gradesRes || []).filter ? (gradesRes?.data || gradesRes || []).filter(Boolean) : []
  subjects.value = (subjectsRes?.data || subjectsRes || []).filter ? (subjectsRes?.data || subjectsRes || []).filter(Boolean) : []
  } catch (err) {
    console.error('Failed to fetch data:', err)
    error.value = 'Failed to load form data. Please refresh the page.'
  }
}

// Initialize data
onMounted(fetchData)

// Helper functions to get names
function getGradeName(id) {
  const grade = grades.value.find(g => g.id === id)
  return grade ? grade.name : ''
}

function getSubjectName(id) {
  const subject = subjects.value.find(s => s.id === id)
  return subject ? subject.name : ''
}

// Form submission handlers
async function submitInstitution() {
  message.value = null
  error.value = null
  try {
    await $fetch(config.public.apiBase + '/api/onboarding/step', {
      method: 'POST',
      credentials: 'include',
      body: {
        step: 'institution',
        data: { institution: institutionForm.value.name }
      }
    })
    institutionAdded.value = true
    message.value = 'Institution saved successfully.'
  } catch (err) {
    console.error(err)
    error.value = err?.message || 'Failed to save institution'
  }
}

async function submitGradeAndSubjects() {
  message.value = null
  error.value = null
  try {
    // Save grade
    await $fetch(config.public.apiBase + '/api/onboarding/step', {
      method: 'POST',
      credentials: 'include',
      body: {
        step: 'grade',
        data: { grade_id: gradeForm.value.grade_id }
      }
    })
    // Save subjects
    await $fetch(config.public.apiBase + '/api/onboarding/step', {
      method: 'POST',
      credentials: 'include',
      body: {
        step: 'subjects',
        data: { subjects: gradeForm.value.subjects }
      }
    })
    gradeAndSubjectsAdded.value = true
    message.value = 'Education information saved successfully.'
  } catch (err) {
    console.error(err)
    error.value = err?.message || 'Failed to save education information'
  }
}

async function finalize() {
  message.value = null
  error.value = null
  try {
    await $fetch(config.public.apiBase + '/api/onboarding/finalize', {
      method: 'POST',
      credentials: 'include'
    })
    const me = await $fetch(config.public.apiBase + '/api/me', { credentials: 'include' })
    try { localStorage.removeItem('modeh:onboarding:skipped') } catch (e) {}
    message.value = 'Profile finalized.'
    if (me && me.role === 'quiz-master') {
      router.push('/quiz-master/dashboard')
    } else {
      router.push('/quizee/dashboard')
    }
  } catch (err) {
    console.error(err)
    error.value = err?.message || 'Finalize failed'
  }
}
</script>

<style scoped>
/* small spacing */
</style>
