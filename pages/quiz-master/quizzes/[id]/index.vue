<template>
  <div class="container mx-auto p-4 sm:p-6 lg:p-8">
    <div class="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold text-gray-800">{{ quiz.title || 'Quiz Details' }}</h1>
        <div class="space-x-2">
          <NuxtLink :to="`/quiz-master/quizzes/${quiz.id}/edit`" class="px-3 py-2 bg-blue-600 text-white rounded text-sm">Edit Quiz</NuxtLink>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b mb-6">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <a href="#" @click.prevent="activeTab = 'details'" :class="tabClass('details')" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Quiz Details</a>
          <a href="#" @click.prevent="activeTab = 'questions'" :class="tabClass('questions')" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Questions</a>
          <a href="#" @click.prevent="activeTab = 'settings'" :class="tabClass('settings')" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Settings</a>
        </nav>
      </div>

      <!-- Details -->
      <div v-show="activeTab === 'details'">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">Subject</label>
            <div class="mt-1 p-2 bg-gray-50 rounded">{{ quiz.topic?.subject?.name || quiz.subject?.name || '—' }}</div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Topic</label>
            <div class="mt-1 p-2 bg-gray-50 rounded">{{ quiz.topic?.name || '—' }}</div>
          </div>
        </div>

        <div class="mt-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Title</label>
            <div class="mt-1 p-2 bg-gray-50 rounded">{{ quiz.title }}</div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <div class="mt-1 p-3 bg-gray-50 rounded whitespace-pre-wrap">{{ quiz.description }}</div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">YouTube Video URL</label>
            <div class="mt-1 p-2 bg-gray-50 rounded">{{ quiz.youtube_url || '—' }}</div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Cover Image</label>
            <div class="mt-1">
              <img v-if="quiz.cover" :src="quiz.cover" alt="Cover" class="w-32 h-32 object-cover rounded" />
              <div v-else class="w-32 h-32 bg-gray-200 rounded flex items-center justify-center text-gray-500">No image</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Questions -->
      <div v-show="activeTab === 'questions'">
        <div class="mb-2 flex items-center justify-between">
          <div class="text-sm text-gray-600">Questions: {{ quiz.questions_count ?? (quiz.questions ? quiz.questions.length : 0) }}</div>
        </div>

        <div class="space-y-4">
          <div v-for="(q, idx) in quiz.questions || []" :key="q.id || idx" class="border rounded p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="font-medium">Question {{ idx + 1 }}</div>
              <div class="text-sm text-gray-500">{{ q.marks || 0 }} marks • {{ difficultyLabel(q.difficulty) }}</div>
            </div>
            <div class="mb-3 prose max-w-none" v-html="q.question"></div>
            <div v-if="q.options && q.options.length" class="space-y-1">
              <div v-for="(opt, oidx) in q.options" :key="oidx" class="text-sm">
                <span v-if="opt.is_correct" class="font-medium text-green-600">✓ </span>
                <span v-html="opt.option"></span>
              </div>
            </div>
            <div v-if="q.explanation" class="mt-3 p-2 bg-blue-50 rounded text-sm">
              <strong>Explanation:</strong> <span v-html="q.explanation"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings -->
      <div v-show="activeTab === 'settings'">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Timer (minutes)</label>
            <div class="mt-1 p-2 bg-gray-50 rounded">{{ quiz.timer_minutes || 'No timer' }}</div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Attempts Allowed</label>
            <div class="mt-1 p-2 bg-gray-50 rounded">{{ quiz.attempts_allowed === 'unlimited' ? 'Unlimited' : quiz.attempts_allowed }}</div>
          </div>

          <div class="col-span-1 md:col-span-2">
            <label class="block text-sm font-medium text-gray-700">Options</label>
            <div class="mt-1 space-y-1">
              <div><input type="checkbox" :checked="quiz.shuffle_questions" disabled /> Shuffle Questions</div>
              <div><input type="checkbox" :checked="quiz.shuffle_answers" disabled /> Shuffle Answer Choices</div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Access</label>
            <div class="mt-1 p-2 bg-gray-50 rounded">{{ quiz.access === 'free' ? 'Free' : 'Paywall' }}</div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Visibility</label>
            <div class="mt-1 p-2 bg-gray-50 rounded">{{ quiz.visibility }}</div>
            <div v-if="quiz.visibility === 'scheduled'" class="mt-2">
              <label class="block text-sm text-gray-700">Scheduled At</label>
              <div class="p-2 bg-gray-50 rounded">{{ quiz.scheduled_at }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRuntimeConfig, useRoute } from '#imports'

definePageMeta({ layout: 'quiz-master' })

const config = useRuntimeConfig()
const route = useRoute()
const id = route.params.id

const quiz = ref({})
const activeTab = ref('details')
const loading = ref(true)

function tabClass(tab) {
  return activeTab.value === tab
    ? 'border-blue-500 text-blue-600'
    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
}

function difficultyLabel(diff) {
  const labels = { 1: 'Easy', 2: 'Medium', 3: 'Hard' }
  return labels[diff] || 'Unknown'
}

onMounted(async () => {
  try {
    const res = await fetch(config.public.apiBase + '/api/quizzes/' + encodeURIComponent(id), { credentials: 'include' })
    if (res.ok) {
      const json = await res.json()
      quiz.value = json.quiz || json
    }
  } catch (e) {
    console.error('Failed to load quiz', e)
  }
  loading.value = false
})
</script>

<style scoped>
.prose :deep(p) { margin: 0 0 0.75rem 0 }
</style>