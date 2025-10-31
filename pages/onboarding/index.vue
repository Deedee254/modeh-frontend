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
      <!-- Role Selection -->
      <div v-else-if="!roleSelected" class="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 class="text-xl font-semibold mb-4">Select your role</h2>
        <form @submit.prevent="submitRole" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">I am a</label>
            <div class="flex items-center space-x-4">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="radio" v-model="roleForm.role" value="quizee" class="form-radio" />
                <span>Quizee (student)</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="radio" v-model="roleForm.role" value="quiz-master" class="form-radio" />
                <span>Quiz Master (teacher)</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Set a password</label>
            <input
              v-model="roleForm.password"
              type="password"
              required
              minlength="8"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Choose a password (min 8 characters)"
            />
          </div>

          <div>
            <button type="submit" class="w-full px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
              Save Role and Password
            </button>
          </div>
        </form>
      </div>

      <!-- Grade and Subject Selection -->
      <div v-else-if="!gradeAndSubjectsAdded" class="bg-white p-6 rounded-lg shadow-sm mb-6">
      <h2 class="text-xl font-semibold mb-4">Education Information</h2>
      <form @submit.prevent="submitGradeAndSubjects" class="space-y-6">
        <!-- Select Level then Grade -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Your Level</label>
            <select
              v-model="gradeForm.level_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select your level</option>
              <option v-for="level in levels" :key="level.id" :value="level.id">
                {{ level.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Your Grade</label>
            <select
              v-model="gradeForm.grade_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select your grade</option>
              <option v-for="grade in filteredGrades" :key="grade.id" :value="grade.id">
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
                v-for="subject in filteredSubjects" 
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
import { ref, onMounted, computed, watch } from 'vue'
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
const roleForm = ref({ role: 'quizee', password: '' })
const roleSelected = ref(false)
const gradeForm = ref({ level_id: '', grade_id: '', subjects: [] })
const levels = ref([])
const grades = ref([])
const subjects = ref([])

// Progress tracking
const institutionAdded = ref(false)
const gradeAndSubjectsAdded = ref(false)

// Fetch grades and subjects
async function fetchData() {
  try {
    // Only fetch top-level Levels on initial load. Grades and subjects are fetched on-demand
    const levelsRes = await $fetch(config.public.apiBase + '/api/levels', { credentials: 'include' })
    levels.value = (levelsRes?.data || levelsRes || []).filter ? (levelsRes?.data || levelsRes || []).filter(Boolean) : []
  } catch (err) {
    console.error('Failed to fetch data:', err)
    error.value = 'Failed to load form data. Please refresh the page.'
  }
}

async function fetchGradesForLevel(levelId) {
  if (!levelId) {
    grades.value = []
    return
  }
  try {
    const res = await $fetch(config.public.apiBase + `/api/grades?level_id=${encodeURIComponent(levelId)}`, { credentials: 'include' })
    grades.value = (res?.data || res || []).filter ? (res?.data || res || []).filter(Boolean) : []
  } catch (err) {
    console.error('Failed to fetch grades for level:', err)
    grades.value = []
  }
}

async function fetchSubjectsForGrade(gradeId) {
  if (!gradeId) {
    subjects.value = []
    return
  }
  try {
    const res = await $fetch(config.public.apiBase + `/api/subjects?grade_id=${encodeURIComponent(gradeId)}`, { credentials: 'include' })
    subjects.value = (res?.data || res || []).filter ? (res?.data || res || []).filter(Boolean) : []
  } catch (err) {
    console.error('Failed to fetch subjects for grade:', err)
    subjects.value = []
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

const filteredGrades = computed(() => grades.value)

// When level changes, reset selected grade and subjects and fetch grades for the level
watch(() => gradeForm.value.level_id, (val) => {
  gradeForm.value.grade_id = ''
  gradeForm.value.subjects = []
  grades.value = []
  subjects.value = []
  if (val) fetchGradesForLevel(val)
})

// When grade changes, reset subjects and fetch subjects for the grade
watch(() => gradeForm.value.grade_id, (val) => {
  gradeForm.value.subjects = []
  subjects.value = []
  if (val) fetchSubjectsForGrade(val)
})

const filteredSubjects = computed(() => subjects.value)

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
    // Save grade (include level_id)
    await $fetch(config.public.apiBase + '/api/onboarding/step', {
      method: 'POST',
      credentials: 'include',
      body: {
        step: 'grade',
        data: { grade_id: gradeForm.value.grade_id, level_id: gradeForm.value.level_id }
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

async function submitRole() {
  message.value = null
  error.value = null
  try {
    const stepName = roleForm.value.role === 'quiz-master' ? 'role_quiz-master' : 'role_quizee'
    await $fetch(config.public.apiBase + '/api/onboarding/step', {
      method: 'POST',
      credentials: 'include',
      body: {
        step: stepName,
        data: { role: roleForm.value.role, password: roleForm.value.password }
      }
    })
    roleSelected.value = true
    message.value = 'Role and password saved.'
  } catch (err) {
    console.error(err)
    error.value = err?.message || 'Failed to save role and password'
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
