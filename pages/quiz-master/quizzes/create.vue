<template>
  <div class="max-w-4xl mx-auto">
    <form @submit.prevent="submitQuiz">
      <PageHero
        title="Craft a new quiz"
        description="Define quiz details, fine‑tune delivery settings, and curate impact-driven questions from your bank or create fresh ones on the fly."
        :breadcrumbs="[{ text: 'Dashboard', href: '/quiz-master/dashboard' }, { text: 'Quizzes', href: '/quiz-master/quizzes' }, { text: 'Create', current: true }]"
      >
        <template #eyebrow>
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-2"></span>
          Quiz creation flow
        </template>
        <template #actions>
          <div class="flex flex-wrap items-center gap-3 sm:gap-3">
            <UButton
              size="sm"
              color="white"
              variant="ghost"
              class="min-w-[88px] transition-transform hover:scale-105"
              @click="$router.back()"
              icon="i-heroicons-arrow-left"
            >Cancel</UButton>
            <UButton
              size="sm"
              color="white"
              variant="soft"
              class="min-w-[88px] transition-transform hover:scale-105"
              :loading="isSaving"
              @click="saveDraft"
              icon="i-heroicons-document-arrow-down"
            >Save draft</UButton>
            <UButton
              size="sm"
              color="white"
              variant="soft"
              class="min-w-[88px] transition-transform hover:scale-105"
              @click="previewDraft"
              icon="i-heroicons-eye"
            >Preview</UButton>
            <UButton
              size="sm"
              color="primary"
              class="shadow-lg shadow-indigo-500/30 min-w-[120px] transition-transform hover:scale-105"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              type="submit"
              icon="i-heroicons-paper-airplane"
            >Publish quiz</UButton>
          </div>
        </template>
      
      <div class="mt-8 space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-200">
        <!-- Title -->
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700">Quiz Title</label>
          <UInput
            v-model="form.title"
            type="text"
            id="title"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <UTextarea
            v-model="form.description"
            id="description"
            rows="3"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <!-- Grade -->
        <div>
          <label for="grade" class="block text-sm font-medium text-gray-700">Grade</label>
          <USelectMenu
            v-model="form.grade_id"
            id="grade"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option :value="null" disabled>Select a grade</option>
            <option v-for="grade in grades" :key="grade.id" :value="grade.id">{{ grade.name }}</option>
          </USelectMenu>
        </div>

        <!-- Subject -->
        <div>
          <label for="subject" class="block text-sm font-medium text-gray-700">Subject</label>
          <USelectMenu
            v-model="form.subject_id"
            id="subject"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option :value="null" disabled>Select a subject</option>
            <option v-for="subject in subjects" :key="subject.id" :value="subject.id">{{ subject.name }}</option>
          </USelectMenu>
        </div>

        <!-- Topic -->
        <div>
          <label for="topic" class="block text-sm font-medium text-gray-700">Topic</label>
          <USelectMenu
            v-model="form.topic_id"
            id="topic"
            required
            :disabled="!form.subject_id || topicsLoading"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
          >
            <option :value="null" disabled>{{ topicsLoading ? 'Loading topics...' : 'Select a topic' }}</option>
            <option v-for="topic in filteredTopics" :key="topic.id" :value="topic.id">{{ topic.name }}</option>
          </USelectMenu>
        </div>
      </div>
      </PageHero>
    </form>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'quiz-master' })
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHero from '~/components/ui/PageHero.vue'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'

const route = useRoute()
const router = useRouter()
const alert = useAppAlert()
const api = useApi()
const { public: { apiBase } } = useRuntimeConfig()

const form = ref({
  title: '',
  description: '',
  grade_id: null,
  subject_id: null,
  topic_id: null
})

const grades = ref([])
const subjects = ref([])
const topics = ref([])
const isSubmitting = ref(false)

const filteredTopics = computed(() => {
  if (!form.value.subject_id) return []
  return topics.value.filter(topic => topic.subject_id === form.value.subject_id)
})

async function fetchInitialData() {
  try {
    const [gradesRes, subjectsRes, topicsRes] = await Promise.all([
      fetch(`${apiBase}/api/grades`, { credentials: 'include' }),
      fetch(`${apiBase}/api/subjects`, { credentials: 'include' }),
      fetch(`${apiBase}/api/topics`, { credentials: 'include' })
    ])
    if (gradesRes.ok) {
      const data = await gradesRes.json()
      grades.value = data.grades || data.data || []
    }
    if (subjectsRes.ok) {
      const data = await subjectsRes.json()
      subjects.value = data.subjects || data.data || []
    }
    if (topicsRes.ok) {
      const data = await topicsRes.json()
      topics.value = data.topics || data.data || []
    }
  } catch (e) {
    alert.push({ type: 'error', message: 'Failed to load form data.' })
  }
}

watch(() => form.value.subject_id, (newSubjectId, oldSubjectId) => {
  // Only reset topic_id if the subject is actually changed by the user
  if (newSubjectId !== oldSubjectId) {
    form.value.topic_id = null
  }
})

onMounted(async () => {
  await fetchInitialData()

  // Pre-populate from URL query parameters
  const { grade_id, subject_id, topic_id } = route.query;
  if (grade_id) form.value.grade_id = Number(grade_id);
  if (subject_id) form.value.subject_id = Number(subject_id);
  if (topic_id) form.value.topic_id = Number(topic_id);
})

async function submitQuiz() {
  isSubmitting.value = true
  try {
    const res = await api.postJson('/api/quizzes', form.value)

    if (api.handleAuthStatus(res)) { alert.push({ type: 'warning', message: 'Session expired — please sign in again' }); return }

    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error(data?.message || 'Failed to create quiz.')

    alert.push({ type: 'success', message: 'Quiz created successfully!' })
    // Redirect to the edit page to add questions
    router.push(`/quiz-master/quizzes/${data.quiz.id}/edit`)
  } catch (e) {
    alert.push({ type: 'error', message: e.message })
  } finally {
    isSubmitting.value = false
  }
}
</script>
