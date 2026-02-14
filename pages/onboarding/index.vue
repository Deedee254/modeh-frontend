<template>
  <div class="max-w-2xl mx-auto py-12 px-4">
    <h1 class="text-2xl font-bold mb-4">Complete your profile</h1>
    <p class="mb-6">Hi, {{ userEmail }}! Please complete your profile information to continue.</p>

    <!-- Step 1: Institution Information -->
    <div v-if="!institutionAdded" class="bg-white p-6 rounded-lg shadow-sm mb-6">
      <div class="flex items-center mb-4">
        <div class="flex-shrink-0 w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
          1
        </div>
        <h2 class="text-xl font-semibold ml-3">Institution Information</h2>
      </div>

      <form @submit.prevent="submitInstitution" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Institution</label>
          <p class="text-xs text-gray-600 mb-2">Select an existing institution or enter a new one</p>
          <select
            v-model="institutionForm.institution_id"
            class="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
            :disabled="loadingInstitutions"
          >
            <option value="">{{ loadingInstitutions ? 'Loading institutions...' : 'Select an institution or enter new' }}</option>
            <option v-for="inst in institutions" :key="inst.id" :value="inst.id">
              {{ inst.name }}
            </option>
          </select>

          <p class="text-xs text-gray-600 mb-2">Or enter a new institution name:</p>
          <input
            v-model="institutionForm.name"
            type="text"
            placeholder="New institution name (if not in list)"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
          <p class="mt-2 text-xs text-gray-500">
            If you enter a new institution, it will require approval from the institution's manager before you can create profiles.
          </p>
        </div>
        <div class="flex space-x-3">
          <button type="submit" class="flex-1 px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700">
            Save Institution
          </button>
          <button type="button" @click="skipInstitution" class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
            Skip for now
          </button>
        </div>
      </form>
    </div>

    <!-- Step 2: Areas of Interest -->
    <div v-else-if="!gradeAndSubjectsAdded" class="bg-white p-6 rounded-lg shadow-sm mb-6">
      <div class="flex items-center mb-4">
        <div class="flex-shrink-0 w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
          2
        </div>
        <h2 class="text-xl font-semibold ml-3">Areas of Interest</h2>
      </div>

      <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div class="flex">
          <svg class="w-5 h-5 text-green-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          <div>
            <h3 class="text-sm font-medium text-green-800">Why choose your areas of interest?</h3>
            <p class="text-sm text-green-700 mt-1">
              Selecting your grade/course and subjects helps us tailor content to your preferences. You'll get personalized quiz recommendations,
              study materials, and challenges that match your academic level and interests.
            </p>
          </div>
        </div>
      </div>

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

          <div v-if="gradeForm.level_id">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ isTertiaryLevel ? 'Your Course' : 'Your Grade' }}
            </label>
            <select
              v-model="gradeForm.grade_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">{{ isTertiaryLevel ? 'Select your course' : 'Select your grade' }}</option>
              <option v-for="grade in filteredGrades" :key="grade.id" :value="grade.id">
                {{ grade.name }}
              </option>
            </select>
            <p v-if="isTertiaryLevel" class="mt-1 text-sm text-gray-500">
              Select your course to see relevant subjects
            </p>
          </div>

          <!-- Select Subjects -->
          <div v-if="gradeForm.grade_id">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Select Your Subjects
              <span class="text-sm text-gray-500">(Optional)</span>
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
                  class="rounded border-gray-300 text-brand-600"
                >
                <span>{{ subject.name }}</span>
              </label>
            </div>
            <p class="mt-2 text-sm text-gray-500">
              You can modify your subject preferences later from your profile settings
            </p>
          </div>
        </div>
        <div class="flex space-x-3">
          <button
            type="submit"
            class="flex-1 px-6 py-2 bg-brand-600 text-white rounded hover:bg-brand-700"
          >
            {{ gradeForm.level_id ? 'Save and Continue' : 'Skip for now' }}
          </button>
          <button type="button" @click="skipToDashboard" class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
            Skip all & go to dashboard
          </button>
        </div>
      </form>
    </div>

    <!-- Finalize Profile -->
    <div v-else-if="gradeAndSubjectsAdded" class="bg-white p-6 rounded-lg shadow-sm mb-6">
      <h2 class="text-xl font-semibold mb-4">Review and Complete</h2>
      
      <div class="space-y-4 mb-6">
        <div>
          <h3 class="font-medium text-gray-700">Institution</h3>
          <p class="text-gray-600">{{ institutionForm.name }}</p>
          <p v-if="newInstitutionPending" class="text-sm text-yellow-600 mt-1">
            ⏳ Approval pending from institution manager
          </p>
        </div>
        <div>
          <h3 class="font-medium text-gray-700">{{ isTertiaryLevel ? 'Course' : 'Grade' }}</h3>
          <p class="text-gray-600">{{ gradeForm.grade_id ? getGradeName(gradeForm.grade_id) : 'Not selected' }}</p>
        </div>
        <div>
          <h3 class="font-medium text-gray-700">Selected Subjects</h3>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="subjectId in gradeForm.subjects" 
              :key="subjectId"
              class="px-2 py-1 bg-brand-50 text-brand-700 rounded-full text-sm"
            >
              {{ getSubjectName(subjectId) }}
            </span>
          </div>
        </div>
      </div>

      <button @click="finalize" class="w-full px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700">
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
import useApi from '~/composables/useApi'

// Page meta: use the authenticated layout and require auth middleware
definePageMeta({
  layout: 'auth',
})

const message = ref(null)
const error = ref(null)
const router = useRouter()
const auth = useAuthStore()
const config = useRuntimeConfig()
const api = useApi()

// Import taxonomy composable for levels, grades, and subjects
import useTaxonomy from '~/composables/useTaxonomy'
const { fetchLevels, fetchGradesByLevel, fetchSubjectsByGrade, levels, grades: taxGrades, subjects: taxSubjects } = useTaxonomy()

// Institutions state
const institutions = ref([])
const loadingInstitutions = ref(false)

// Fetch institutions from API
// Note: backend returns a paginated payload (object with `data` array).
// Support both raw arrays and paginated responses for compatibility.
const fetchInstitutions = async () => {
  try {
    loadingInstitutions.value = true
    const response = await api.get('/api/institutions')
    if (api.handleAuthStatus(response)) return
    const data = await response.json().catch(() => null)

    if (!response.ok) {
      institutions.value = []
      return
    }

    // If server returned a plain array (legacy), use it
    if (Array.isArray(data)) {
      institutions.value = data
      return
    }

    // If server returned a paginated resource (Laravel's paginator), use data.data
    if (data && Array.isArray(data.data)) {
      institutions.value = data.data
      return
    }

    // Some APIs return { items: [...] } or other shapes - try common fallbacks
    if (data && Array.isArray(data.items)) {
      institutions.value = data.items
      return
    }

    // Fallback to empty list
    institutions.value = []
  } catch (e) {
    console.error('Failed to load institutions:', e)
    institutions.value = []
  } finally {
    loadingInstitutions.value = false
  }
}

// Fetch initial data
onMounted(async () => {
  await fetchLevels()
  await fetchInstitutions()
})

// Form states
const institutionAdded = ref(false)
const gradeAndSubjectsAdded = ref(false)
const newInstitutionPending = ref(false)

// Form data
const institutionForm = ref({ name: '', institution_id: '' })
const gradeForm = ref({
  level_id: '',
  grade_id: '',
  subjects: []
})

// Watch level changes to fetch corresponding grades
watch(() => gradeForm.value.level_id, async (newLevelId) => {
  if (newLevelId) {
    await fetchGradesByLevel(newLevelId)
  }
})

// Watch grade changes to fetch corresponding subjects
watch(() => gradeForm.value.grade_id, async (newGradeId) => {
  if (newGradeId) {
    await fetchSubjectsByGrade(newGradeId)
  }
})

// Computed properties for filtered lists
const isTertiaryLevel = computed(() => {
  if (!gradeForm.value.level_id) return false
  const selectedLevel = levels.value?.find(l => String(l.id) === String(gradeForm.value.level_id))
  if (!selectedLevel) return false
  
  const name = (selectedLevel.name || '').toLowerCase()
  return name.includes('tertiary') || name.includes('higher education') || name.includes('university') || name.includes('college')
})

const filteredGrades = computed(() => {
  if (!gradeForm.value.level_id) return []
  const grades = taxGrades.value.filter(grade => 
    String(grade.level_id) === String(gradeForm.value.level_id)
  )
  // For tertiary level, show only items with type 'course'
  if (isTertiaryLevel.value) {
    const courses = grades.filter(g => g.type === 'course' || g.type === 'tertiary')
    // Fallback: if no courses found but it is tertiary, show all (maybe type wasn't set)
    return courses.length > 0 ? courses : grades
  }
  // For other levels, show only regular grades
  return grades.filter(g => !g.type || g.type === 'grade')
})

const filteredSubjects = computed(() => {
  if (!gradeForm.value.grade_id) return []
  // Get subjects for the selected grade/course
  const subjects = taxSubjects.value.filter(subject => 
    !subject.grade_id || String(subject.grade_id) === String(gradeForm.value.grade_id)
  )
  // For tertiary level, ensure subjects are marked as course subjects
  if (isTertiaryLevel.value) {
    return subjects.map(subject => ({
      ...subject,
      isCourseSubject: true
    }))
  }
  return subjects
})

// Helper functions for displaying names
const getGradeName = (gradeId) => {
  if (!gradeId) return ''
  const grade = taxGrades.value.find(g => String(g.id) === String(gradeId))
  return grade?.name || ''
}

const getSubjectName = (subjectId) => {
  if (!subjectId) return ''
  const subject = taxSubjects.value.find(s => String(s.id) === String(subjectId))
  return subject?.name || ''
}

// Dynamic head/meta based on current user
useHead(() => ({
  title: `Complete Your Profile | Modeh`,
  meta: [
    { name: 'description', content: `Complete your ${auth.user?.name || 'user'} profile on Modeh to get started` },
    { property: 'og:title', content: `Complete Your Profile | Modeh` },
    { property: 'og:description', content: `Complete your ${auth.user?.name || 'user'} profile on Modeh to get started` }
  ]
}))

// Form submission handlers

// Form submission handlers
async function submitInstitution() {
  message.value = null
  error.value = null
  try {
    // Build payload with institution_id if selected, or institution text if new
    const payload = {
      step: 'institution',
      data: {}
    }
    
    if (institutionForm.value.institution_id) {
      // User selected an existing institution
      payload.data.institution_id = institutionForm.value.institution_id
    } else if (institutionForm.value.name?.trim()) {
      // User entered a new institution name - will require approval
      payload.data.institution = institutionForm.value.name
      newInstitutionPending.value = true
    } else {
      error.value = 'Please select or enter an institution'
      return
    }
    
    const resp = await api.postJson('/api/onboarding/step', payload)
    if (!resp.ok) throw new Error('Failed to save institution')
    institutionAdded.value = true
    
    if (newInstitutionPending.value) {
      message.value = 'Institution saved. Your request is pending approval from the institution manager.'
    } else {
      message.value = 'Institution saved successfully.'
    }
  } catch (err) {
    console.error(err)
    error.value = err?.message || 'Failed to save institution'
  }
}

async function skipInstitution() {
  message.value = null
  error.value = null
  try {
    // Mark institution step as skipped
    const resp = await api.postJson('/api/onboarding/step', {
      step: 'institution',
      data: { skipped: true }
    })
    if (!resp.ok) throw new Error('Failed to skip institution')
    institutionAdded.value = true
    message.value = 'Institution step skipped. You can add it later from your profile.'
  } catch (err) {
    console.error(err)
    error.value = err?.message || 'Failed to skip institution'
  }
}

async function skipToDashboard() {
  message.value = null
  error.value = null
  try {
    // Mark grade/subjects step as skipped
    const resp = await api.postJson('/api/onboarding/step', {
      step: 'grade',
      data: { skipped: true }
    })
    if (!resp.ok) throw new Error('Failed to skip grade/course')

    // Also skip subjects if not selected
    if (gradeForm.value.subjects.length === 0) {
      const subjectsResp = await api.postJson('/api/onboarding/step', {
        step: 'subjects',
        data: { skipped: true }
      })
      if (!subjectsResp.ok) throw new Error('Failed to skip subjects')
    }

    // Finalize the profile
    const finalizeResp = await api.postJson('/api/onboarding/finalize', {})
    if (!finalizeResp.ok) throw new Error('Finalize failed')

    // Refresh user state
    await auth.fetchUser()
    
    // Attempt to update the session (to sync JWT with backend)
    const { update } = useAuth()
    if (typeof update === 'function') {
      try { await update() } catch (e) { }
    }

    // Redirect to dashboard
    const userRole = auth.user?.role || 'quizee'
    if (userRole === 'quiz-master') {
      router.push('/quiz-master/dashboard')
    } else if (userRole === 'parent') {
      router.push('/parent/dashboard')
    } else {
      router.push('/quizee/dashboard')
    }
  } catch (err) {
    console.error(err)
    error.value = err?.message || 'Failed to skip to dashboard'
  }
}

async function submitGradeAndSubjects() {
  message.value = null
  error.value = null
  try {
    // If level/grade were selected, save them
    if (gradeForm.value.level_id && gradeForm.value.grade_id) {
      let resp = await api.postJson('/api/onboarding/step', {
        step: 'grade',
        data: { 
          grade_id: gradeForm.value.grade_id, 
          level_id: gradeForm.value.level_id 
        }
      })
      if (!resp.ok) throw new Error('Failed to save grade/course')

      // If subjects were selected, save them
      if (gradeForm.value.subjects.length > 0) {
        resp = await api.postJson('/api/onboarding/step', {
          step: 'subjects',
          data: { subjects: gradeForm.value.subjects }
        })
        if (!resp.ok) throw new Error('Failed to save subjects')
      }
      message.value = 'Education information saved successfully.'
    }
    
    // Mark as complete whether saved or skipped
    gradeAndSubjectsAdded.value = true
  } catch (err) {
    console.error(err)
    error.value = err?.message || 'Failed to save education information'
  }
}

async function finalize() {
  message.value = null
  error.value = null
  try {
    const finalizeResp = await api.postJson('/api/onboarding/finalize', {})
    if (!finalizeResp.ok) throw new Error('Finalize failed')
    
    // Refresh user data via the centralized auth store (force bypass cache)
    // so we pick up the latest profile and benefit from dedup/caching.
    await auth.fetchUser?.(true)
    const me = auth.user
    if (me && me.id) {
      try { localStorage.removeItem('modeh:onboarding:skipped') } catch (e) {}
      message.value = 'Profile finalized.'

      // Redirect to appropriate dashboard
      if (me.role === 'quiz-master') {
        router.push('/quiz-master/dashboard')
      } else if (me.role === 'parent') {
        router.push('/parent/dashboard')
      } else {
        router.push('/quizee/dashboard')
      }
    } else {
      throw new Error('Failed to refresh user profile')
    }
  } catch (err) {
    console.error(err)
    error.value = err?.message || 'Finalize failed'
  }
}

// User email for greeting
const userEmail = computed(() => auth.user?.email || '')
</script>

<style scoped>
/* small spacing */
</style>
