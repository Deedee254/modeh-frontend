<template>
  <div class="max-w-3xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold">Create New Topic</h1>
      <button 
        @click="router.back()" 
        class="text-gray-600 hover:text-gray-800"
      >
        <Icon name="heroicons:x-mark" class="w-6 h-6" />
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Name -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Topic Name</label>
        <input 
          v-model="form.name" 
          type="text" 
          required
          placeholder="Enter topic name"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
          :class="{ 'border-red-300': errors.name }"
        />
        <p v-if="errors.name" class="text-sm text-red-600">{{ errors.name }}</p>
      </div>

      <!-- Description -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Description</label>
        <textarea 
          v-model="form.description" 
          rows="4" 
          placeholder="Describe the topic"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
          :class="{ 'border-red-300': errors.description }"
        ></textarea>
        <p v-if="errors.description" class="text-sm text-red-600">{{ errors.description }}</p>
      </div>

      <!-- Grade Selection -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Grade</label>
        <select 
          v-model="form.gradeId"
          required
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
          :class="{ 'border-red-300': errors.gradeId }"
        >
          <option value="">Select a grade</option>
          <option v-for="(grade, idx) in (Array.isArray(grades) ? grades.filter(Boolean) : [])" :key="grade?.id || idx" :value="grade?.id">
            {{ grade?.name }}
          </option>
        </select>
        <p v-if="errors.gradeId" class="text-sm text-red-600">{{ errors.gradeId }}</p>
      </div>

      <!-- Subject Selection -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Subject</label>
        <select 
          v-model="form.subjectId"
          required
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
          :class="{ 'border-red-300': errors.subjectId }"
        >
          <option value="">Select a subject</option>
          <option v-for="(subject, idx) in (Array.isArray(filteredSubjects) ? filteredSubjects.filter(Boolean) : [])" :key="subject?.id || idx" :value="subject?.id">
            {{ subject?.name }}
          </option>
        </select>
        <p v-if="errors.subjectId" class="text-sm text-red-600">{{ errors.subjectId }}</p>
      </div>

      <!-- Image Upload -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Topic Image (Optional)</label>
        <div 
          class="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer"
          @click="$refs.fileInput.click()"
          @dragover.prevent
          @drop.prevent="handleFileDrop"
        >
          <input 
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileSelect"
          />
          <div v-if="!form.image" class="space-y-2">
            <Icon name="heroicons:photo" class="w-12 h-12 mx-auto text-gray-400" />
            <p class="text-sm text-gray-500">Click or drag image to upload</p>
          </div>
          <img 
            v-else 
            :src="imagePreview" 
            class="max-h-48 mx-auto rounded"
            alt="Topic image preview"
          />
        </div>
        <p v-if="errors.image" class="text-sm text-red-600">{{ errors.image }}</p>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end pt-4">
        <button 
          type="submit" 
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-75 flex items-center gap-2"
          :disabled="isSubmitting"
        >
          <Icon v-if="isSubmitting" name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
          <span>{{ isSubmitting ? 'Creating...' : 'Create Topic' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import useApi from '~/composables/useApi'
import useTaxonomy from '~/composables/useTaxonomy'
import { useAppAlert } from '~/composables/useAppAlert'

const config = useRuntimeConfig()
definePageMeta({
  layout: 'quiz-master',
})

const router = useRouter()
const fileInput = ref(null)

// Form state
const form = ref({
  name: '',
  description: '',
  gradeId: '',
  subjectId: '',
  image: null
})

const errors = ref({})
const isSubmitting = ref(false)
const imagePreview = ref('')

// Data from API (use taxonomy composable)
const { levels, fetchLevels, fetchGrades, grades: taxGrades, subjects: taxSubjects, fetchSubjectsByGrade } = useTaxonomy()

// local copies for the form
const grades = taxGrades
const subjects = taxSubjects

// ensure levels & grades are loaded
onMounted(async () => {
  try { await fetchLevels(); await fetchGrades() } catch (e) {}
})

// Filter subjects based on selected grade (robust to different key names and types)
const filteredSubjects = computed(() => {
  const all = Array.isArray(subjects.value) ? subjects.value : []
  if (!form.value.gradeId) return all
  return all.filter(subject => String(subject.grade_id || subject.gradeId || subject.grade || '') === String(form.value.gradeId))
})

// When grade changes, ask composable to fetch matching subjects
watch(() => form.value.gradeId, (nv) => { try { fetchSubjectsByGrade(nv) } catch (e) {} })

// File handling functions
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.value.image = file
    createImagePreview(file)
  }
}

const handleFileDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    form.value.image = file
    createImagePreview(file)
  }
}

const createImagePreview = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const api = useApi()
const alert = useAppAlert()

// Form submission
const handleSubmit = async () => {
  errors.value = {}
  isSubmitting.value = true

  try {
    // Create FormData for file upload
    const formData = new FormData()
    formData.append('name', form.value.name)
    formData.append('description', form.value.description)
    formData.append('grade_id', form.value.gradeId)
    formData.append('subject_id', form.value.subjectId)
    if (form.value.image) {
      formData.append('image', form.value.image)
    }

    // debug: show if XSRF exists and cookie keys
    try { console.debug('[topics/create] cookie keys:', document.cookie.split(';').map(s=>s.trim().split('=')[0]), 'XSRF present:', !!document.cookie.match(/XSRF-TOKEN=/)) } catch(e) {}
    const response = await api.postFormData('/api/topics', formData)

    // If auth/session expired, handle centrally (redirect + message)
    if (api.handleAuthStatus(response)) {
      alert.push({ type: 'warning', message: 'Session expired — please sign in again' })
      return
    }

    if (!response.ok) {
      // backend may return HTML (e.g. 419 page); try JSON but fall back to text
      let data = null
      try { data = await response.json() } catch (e) { data = null }
      if (data && data.errors) {
        errors.value = data.errors
        return
      }
      const txt = await response.text().catch(() => null)
      console.error('Topic create failed response:', txt)
      throw new Error('Failed to create topic')
    }

    // Successfully created - redirect to topics list
    router.push('/quiz-master/topics')
  } catch (error) {
    console.error('Error creating topic:', error)
    errors.value = { _form: 'Failed to create topic. Please try again.' }
  } finally {
    isSubmitting.value = false
  }
}

// Fetch initial data
onMounted(async () => {
  try {
    // Fetch grades and subjects in parallel
    const [gradesRes, subjectsRes] = await Promise.all([
      fetch(config.public.apiBase + '/api/grades', { credentials: 'include' }),
      fetch(config.public.apiBase + '/api/subjects', { credentials: 'include' })
    ])

    if (gradesRes.ok && subjectsRes.ok) {
      const gradesData = await gradesRes.json()
      const subjectsData = await subjectsRes.json()

      grades.value = gradesData?.grades || gradesData?.data || gradesData || []
  subjects.value = (subjectsData?.subjects || subjectsData?.data || subjectsData || []).filter ? (subjectsData?.subjects || subjectsData?.data || subjectsData || []).filter(Boolean) : []
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})
</script>