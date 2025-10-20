<template>
  <div class="min-h-screen bg-gray-50 pb-16 md:pb-0">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div v-if="pending" class="grid place-items-center py-24">
        <div class="animate-pulse bg-white rounded-lg p-6 w-full max-w-2xl"></div>
      </div>

      <div v-else>
        <div v-if="hasPreview" class="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div class="p-6 sm:p-8">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div class="lg:col-span-2 space-y-4">
                <div class="flex items-start gap-6">
                  <div class="w-28 h-28 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                    <img v-if="quiz.cover" :src="quiz.cover" class="object-cover w-full h-full" onerror="this.style.display='none'" />
                    <svg v-else class="w-10 h-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                    </svg>
                  </div>
                  <div>
                    <h1 class="text-2xl font-extrabold">{{ quiz.title || 'Preview' }}</h1>
                    <div class="text-sm text-gray-600 mt-2">{{ quiz.short_description || quiz.description || 'Sample preview content' }}</div>
                    <div class="mt-4">
                      <NuxtLink :to="`/quizzes/${quiz.id}`" class="px-4 py-2 bg-indigo-600 text-white rounded">View quiz</NuxtLink>
                    </div>
                  </div>
                </div>

                <div class="mt-6">
                  <h3 class="text-lg font-semibold">Sample question</h3>
                  <div v-if="sampleQuestion" class="mt-3 bg-gray-50 border rounded p-4">
                    <div class="text-sm text-gray-500">Question</div>
                    <div class="prose mt-2" v-html="sampleQuestion.text || sampleQuestion.body || sampleQuestion.question"></div>
                    <div class="mt-3 space-y-2">
                      <div v-for="(opt, i) in (sampleQuestion.options || [])" :key="i" class="p-2 border rounded bg-white">
                        <span v-html="opt?.text || opt"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <aside class="bg-white p-4 border rounded-xl shadow-sm sticky top-6">
                <div class="text-sm text-gray-500">Details</div>
                <div class="mt-2 text-sm"><strong>Author:</strong> {{ quiz.author || '—' }}</div>
                <div class="text-sm mt-1"><strong>Questions:</strong> {{ questionCount }}</div>
                <div class="text-sm mt-1"><strong>Marks:</strong> {{ quiz.marks || quiz.points || '—' }}</div>
              </aside>
            </div>
          </div>
        </div>

        <div v-else class="max-w-2xl mx-auto">
          <div class="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div class="p-6 sm:p-8">
              <div class="flex items-start gap-6">
                <div class="w-20 h-20 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <svg class="w-10 h-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                  </svg>
                </div>

                <div class="flex-1">
                  <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900">Page not found</h1>
                  <p class="mt-2 text-sm text-gray-600">We couldn't find the preview for this quiz. It's possible the preview is disabled or the quiz doesn't have public preview content.</p>

                  <div class="mt-6 flex flex-wrap gap-3">
                    <NuxtLink :to="`/quizzes/${id}`" class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700">Back to quiz</NuxtLink>
                    <NuxtLink to="/quizzes" class="inline-flex items-center px-4 py-2 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50">Browse quizzes</NuxtLink>
                    <button @click="reportIssue" class="ml-auto text-sm text-gray-500 hover:text-gray-700">Report problem</button>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-6 py-4 text-xs text-gray-500">Preview route: <span class="text-gray-700">/quizzes/{{ id }}/preview</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'quizee' })

import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppAlert } from '~/composables/useAppAlert'
const route = useRoute()
const id = route.params.id
const alert = useAppAlert()

const config = useRuntimeConfig()
const { data: quizData, pending } = await useFetch(config.public.apiBase + `/api/quizzes/${id}`)
const quiz = computed(() => quizData?.value?.quiz || quizData?.value || {})

const questionCount = computed(() => Array.isArray(quiz.value.questions) ? quiz.value.questions.length : (quiz.value.questions_count || 0))
const sampleQuestion = computed(() => {
  try {
    if (Array.isArray(quiz.value.questions) && quiz.value.questions.length) return quiz.value.questions[0]
  } catch (e) {}
  return null
})

const hasPreview = computed(() => {
  // Deterministic: show preview when there is at least one question or a short_description/description
  return Boolean((Array.isArray(quiz.value.questions) && quiz.value.questions.length) || quiz.value.short_description || quiz.value.description || quiz.value.cover)
})

function reportIssue(){
  alert.push({ message: 'Thanks — we received your report (demo).', type: 'info' })
}
</script>

<style scoped>
.rounded-2xl { border-radius: 1rem; }
</style>
