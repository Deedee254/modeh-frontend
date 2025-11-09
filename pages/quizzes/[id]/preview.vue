<template>
  <div class="min-h-screen bg-gray-100 pb-16 md:pb-0">
    <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div v-if="pending" class="grid place-items-center py-24">
        <div class="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-200 w-full max-w-4xl animate-pulse">
          <div class="p-6 sm:p-8 lg:p-10">
            <div class="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
              <div class="lg:col-span-2 space-y-6">
                <div class="flex flex-col gap-6 lg:flex-row lg:items-center">
                  <div class="h-48 w-full rounded-2xl bg-gray-200"></div>
                  <div class="flex-1 space-y-4">
                    <div class="h-4 w-24 rounded-full bg-gray-200"></div>
                    <div class="h-8 w-3/4 rounded bg-gray-200"></div>
                    <div class="h-4 w-full rounded bg-gray-200"></div>
                    <div class="h-4 w-5/6 rounded bg-gray-200"></div>
                    <div class="h-10 w-32 rounded-lg bg-gray-200"></div>
                  </div>
                </div>
                <div class="mt-8 space-y-4">
                  <div class="h-6 w-1/3 rounded bg-gray-200"></div>
                  <div class="h-48 rounded-2xl border border-gray-200 bg-gray-100"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else>
        <div v-if="hasPreview" class="rounded-3xl border border-gray-200 bg-white shadow-xl">
          <div class="p-6 sm:p-8 lg:p-10">
            <div class="space-y-8 grid grid-cols-1 md:grid-cols-3 md:gap-12">
              <div class="md:col-span-2 space-y-6">
                <div class="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div class="w-full h-40 rounded-2xl border border-indigo-200 bg-indigo-50 overflow-hidden flex items-center justify-center sm:w-48 sm:h-48 flex-shrink-0">
                    <img v-if="quiz.cover" :src="quiz.cover" class="h-full w-full object-cover" onerror="this.style.display='none'" />
                    <svg v-else class="h-16 w-16 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                    </svg>
                  </div>
                  <div class="flex-1 space-y-4">
                    <div>
                      <p class="text-sm font-semibold uppercase tracking-wide text-indigo-600">Quiz Preview</p>
                      <h1 class="mt-2 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{{ quiz.title || 'Untitled Quiz' }}</h1>
                    </div>
                    <p class="text-sm md:text-base leading-relaxed text-gray-700">{{ quiz.short_description || quiz.description || 'This is a sample preview of the quiz content. Dive in to see what awaits you!' }}</p>
                    <div class="flex flex-wrap gap-4 pt-2">
                      <div class="inline-flex items-center rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-semibold text-indigo-700">
                        <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {{ questionCount }} questions
                      </div>
                      <div class="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700">
                        <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 12h6m-6 3v-3m-6 0H6m6 0h-2M9 5a2 2 0 012-2h2a2 2 0 012 2v2h-5V5zM9 5v2m0 0h5m-5 0a2 2 0 00-2 2v2H7a2 2 0 00-2 2v2a2 2 0 002 2h11a2 2 0 002-2v-2a2 2 0 00-2-2h-1V9a2 2 0 00-2-2h-2V5z"></path></svg>
                        {{ quiz.marks || quiz.points || '—' }} marks
                      </div>
                    </div>
                    <div class="pt-4">
                      <NuxtLink :to="`/quizzes/${quiz.id}`" class="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm md:text-base font-semibold text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        View Full Quiz
                        <svg class="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                      </NuxtLink>
                    </div>
                  </div>
                </div>

                <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
                  <div class="flex items-center justify-between">
                    <h3 class="text-base md:text-lg font-semibold text-gray-900">Sample Question</h3>
                    <span class="text-xs font-medium uppercase tracking-wide text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Preview Only</span>
                  </div>
                  <div v-if="sampleQuestion" class="mt-5 space-y-5">
                    <div class="text-sm md:text-base font-medium text-gray-600">Question:</div>
                    <div class="prose prose-sm max-w-none text-gray-800 leading-relaxed" v-html="sampleQuestion.text || sampleQuestion.body || sampleQuestion.question"></div>
                    <div class="space-y-3">
                      <div v-for="(opt, i) in (sampleQuestion.options || [])" :key="i" class="rounded-xl border border-gray-300 bg-gray-50 px-5 py-3 text-sm md:text-base font-medium text-gray-800 shadow-sm transition hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer">
                        <span v-html="opt?.text || opt"></span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="mt-5 text-sm md:text-base text-gray-500">Preview content is not available for this quiz yet.</div>
                </div>
              </div>

              <aside class="space-y-6 md:col-span-1">
                <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
                  <div class="text-sm font-semibold uppercase tracking-wide text-gray-500">Quiz Details</div>
                  <div class="mt-5 space-y-4 text-sm md:text-base text-gray-700">
                    <div class="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2.5">
                      <span>Author</span>
                      <span class="font-semibold text-gray-900">{{ quiz.author || '—' }}</span>
                    </div>
                    <div class="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2.5">
                      <span>Questions</span>
                      <span class="font-semibold text-gray-900">{{ questionCount }}</span>
                    </div>
                    <div class="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2.5">
                      <span>Marks</span>
                      <span class="font-semibold text-gray-900">{{ quiz.marks || quiz.points || '—' }}</span>
                    </div>
                  </div>
                </div>

                <div class="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-indigo-800 shadow-md">
                  <div class="flex items-start gap-4">
                    <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-indigo-600 flex-shrink-0">
                      <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6l4 2" /></svg>
                    </div>
                    <div>
                      <p class="text-base md:text-lg font-semibold">Ready to take the quiz?</p>
                      <p class="text-sm text-indigo-700/90 mt-1">Jump back to the full experience to attempt all questions and track your progress.</p>
                    </div>
                  </div>
                  <div class="mt-6 flex flex-col gap-4">
                    <NuxtLink :to="`/quizzes/${quiz.id}`" class="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm md:text-base font-semibold text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      Start Quiz
                      <svg class="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </NuxtLink>
                    <div class="flex gap-4">
                      <button @click="reportIssue" class="flex-1 inline-flex items-center justify-center rounded-xl border border-indigo-300 px-6 py-3 text-sm md:text-base font-semibold text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        Report an Issue
                      </button>
                      <AffiliateShareButton 
                        :itemType="'Quiz'"
                        :itemId="quiz.id"
                        :baseUrl="baseUrl"
                      />
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>

        <div v-else class="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
            <div class="p-6 sm:p-8 lg:p-10">
              <div class="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 flex-shrink-0">
                  <svg class="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                  </svg>
                </div>

                <div class="flex-1 space-y-4">
                  <div>
                    <p class="text-sm font-semibold uppercase tracking-wide text-indigo-600">Preview Unavailable</p>
                    <h1 class="mt-2 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">We couldn’t find this quiz preview</h1>
                  </div>
                  <p class="text-sm md:text-base leading-relaxed text-gray-700">This quiz might not have public preview content enabled yet, or it might have been removed. You can return to the quiz details or explore other quizzes instead.</p>

                  <div class="flex flex-col gap-4 pt-4 sm:flex-row">
                    <NuxtLink :to="`/quizzes/${id}`" class="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm md:text-base font-semibold text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      Back to Quiz
                    </NuxtLink>
                    <NuxtLink to="/quizzes" class="inline-flex items-center justify-center rounded-xl border border-gray-300 px-6 py-3 text-sm md:text-base font-semibold text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      Browse Quizzes
                    </NuxtLink>
                    <button @click="reportIssue" class="inline-flex items-center justify-center rounded-xl border border-transparent px-6 py-3 text-sm md:text-base font-semibold text-gray-600 transition hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      Report a Problem
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-6 py-4 text-xs font-medium text-gray-500 border-t border-gray-100">Preview route: <span class="text-gray-700">/quizzes/{{ id }}/preview</span></div>
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
import AffiliateShareButton from '~/components/AffiliateShareButton.vue'

const route = useRoute()
const id = route.params.id
const alert = useAppAlert()

const config = useRuntimeConfig()
const baseUrl = computed(() => {
  const base = config.public?.baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
  if (!base) return ''
  return base.endsWith('/') ? `${base}quizzes` : `${base}/quizzes`
})
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
