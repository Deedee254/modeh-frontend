<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Hero -->
      <div class="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 shadow-lg mb-6">
        <div class="flex items-center justify-between gap-6">
          <div class="flex-1">
            <h1 class="text-3xl font-extrabold">quiz-master Dashboard</h1>
            <p class="mt-1 text-sm opacity-90">Create quizzes, track performance, and grow your quiz-mastering business.</p>
            <div class="mt-4 flex flex-wrap gap-3">
              <NuxtLink to="/quiz-master/quizzes" class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-md text-sm">My Quizzes</NuxtLink>
              <NuxtLink to="/quiz-master/quizzes/create" class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-sm border border-white/10">Create Quiz</NuxtLink>
              <NuxtLink to="/quiz-master/wallet" class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-sm border border-white/10">Wallet</NuxtLink>
            </div>
          </div>
          <div class="hidden lg:block w-44">
            <svg class="w-full h-auto" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
              <rect width="100%" height="100%" fill="#ffffff10" rx="8" />
              <g fill="#ffffff22">
                <circle cx="30" cy="30" r="8" />
                <circle cx="70" cy="20" r="6" />
                <rect x="100" y="22" width="70" height="6" rx="3" />
                <rect x="100" y="40" width="48" height="6" rx="3" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Metrics -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <UiCard class="p-4 text-center">
              <div class="text-sm text-gray-500">Quizzes</div>
              <div class="mt-2 text-2xl font-bold">{{ quizzesCount }}</div>
              <div class="text-xs text-gray-400 mt-1">Created</div>
            </UiCard>

            <UiCard class="p-4 text-center">
              <div class="text-sm text-gray-500">Questions</div>
              <div class="mt-2 text-2xl font-bold">{{ questionsCount }}</div>
              <div class="text-xs text-gray-400 mt-1">In bank</div>
            </UiCard>

            <UiCard class="p-4 text-center">
              <div class="text-sm text-gray-500">Published</div>
              <div class="mt-2 text-2xl font-bold">{{ publishedCount }}</div>
              <div class="text-xs text-gray-400 mt-1">Approved</div>
            </UiCard>

            <UiCard class="p-4 text-center">
              <div class="text-sm text-gray-500">Pending</div>
              <div class="mt-2 text-2xl font-bold">{{ pendingApprovals.length }}</div>
              <div class="text-xs text-gray-400 mt-1">Approvals</div>
            </UiCard>
          </div>

          <!-- Recent activity -->
          <UiCard>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="text-lg font-semibold">Recent Activity</div>
                <NuxtLink to="/quiz-master/quizzes" class="text-sm text-indigo-600 hover:underline">View all</NuxtLink>
              </div>
            </template>

            <div class="mt-3 space-y-3">
              <div v-if="quizzesPending" class="space-y-2">
                <USkeleton v-for="i in 3" :key="i" class="h-16 rounded" />
              </div>
              <div v-else-if="quizzesError" class="text-sm text-red-600 p-3">Failed to load quizzes.</div>
              <div v-else>
                <UiHorizontalCard v-for="(q, idx) in (Array.isArray(recentQuizzes) ? recentQuizzes.filter(Boolean) : [])" :key="q?.id || idx" :title="q.title" :subtitle="q.description || 'No description'" eyebrow="Quiz">
                  <template #actions>
                    <div class="flex gap-2">
                      <NuxtLink :to="`/quiz-master/quizzes/${q.id}`" class="text-sm text-indigo-600 hover:underline">Open</NuxtLink>
                      <NuxtLink :to="`/quiz-master/analytics/quizzes/${q.id}`" class="text-sm text-indigo-600 hover:underline">Analytics</NuxtLink>
                    </div>
                  </template>
                </UiHorizontalCard>
              </div>
            </div>
          </UiCard>

          <!-- Quick actions & Settings -->
          <UiCard>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="text-lg font-semibold">Quick Actions</div>
              </div>
            </template>
            <div class="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <template v-if="isQuizMaster">
                <NuxtLink to="/quiz-master/quizzes/create" class="px-3 py-2 border rounded text-sm hover:bg-gray-50">Create Quiz</NuxtLink>
                <NuxtLink to="/quiz-master/questions" class="px-3 py-2 border rounded text-sm hover:bg-gray-50">Question Bank</NuxtLink>
                <NuxtLink to="/quiz-master/topics" class="px-3 py-2 border rounded text-sm hover:bg-gray-50">Manage Topics</NuxtLink>
                <NuxtLink to="/quiz-master/subjects" class="px-3 py-2 border rounded text-sm hover:bg-gray-50">Manage Subjects</NuxtLink>
                <NuxtLink to="/quiz-master/wallet" class="px-3 py-2 border rounded text-sm hover:bg-gray-50">Wallet</NuxtLink>
                <NuxtLink to="/quiz-master/profile" class="px-3 py-2 border rounded text-sm hover:bg-gray-50">Profile</NuxtLink>
              </template>
              <template v-else>
                <div class="col-span-full text-sm text-gray-500">Quick actions are available to quiz-masters only. <NuxtLink to="/login" class="text-indigo-600">Sign in as quiz-master</NuxtLink></div>
              </template>
            </div>
          </UiCard>
        </div>

        <!-- Sidebar -->
        <aside class="space-y-6">
          <UiCard>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="font-medium">Pending Approvals</div>
                <NuxtLink to="/quiz-master/quizzes" class="text-sm text-indigo-600">Manage</NuxtLink>
              </div>
            </template>
            <div v-if="pendingApprovalsPending" class="text-sm text-gray-500">Loading…</div>
            <div v-else-if="pendingApprovals.length === 0" class="text-sm text-gray-600">No pending approvals right now.</div>
            <ul v-else class="space-y-2">
              <li v-for="(q, idx) in (Array.isArray(pendingApprovals) ? pendingApprovals.slice(0,3).filter(Boolean) : [])" :key="q?.id || idx" class="flex items-center justify-between">
                <div class="text-sm truncate">{{ q.title || q.name }}</div>
                <NuxtLink :to="`/quiz-master/quizzes/${q.id}`" class="text-sm text-indigo-600">Review</NuxtLink>
              </li>
            </ul>
          </UiCard>

          <UiCard>
            <template #header>
              <div class="text-lg font-semibold">Performance</div>
            </template>
            <div class="space-y-2 text-sm text-gray-600">
              <div class="flex justify-between"><span>Avg Score</span><span class="font-medium">81%</span></div>
              <div class="flex justify-between"><span>Completion</span><span class="font-medium">92%</span></div>
              <div class="flex justify-between"><span>Assignments</span><span class="font-medium">24</span></div>
            </div>
          </UiCard>

          <UiCard>
            <template #header>
              <div class="text-lg font-semibold">Tips</div>
            </template>
            <ul class="list-disc pl-5 text-sm text-gray-600">
              <li>Use mixed difficulty to keep engagement high.</li>
              <li>Reuse questions from your bank to save time.</li>
              <li>Share analytics with parents weekly.</li>
            </ul>
          </UiCard>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import PageHero from '~/components/ui/PageHero.vue'
import UiHorizontalCard from '~/components/ui/UiHorizontalCard.vue'
import SettingsTabs from '~/components/SettingsTabs.vue'
import { useAuthStore } from '~/stores/auth'
import { computed } from 'vue'

definePageMeta({ layout: 'quiz-master' })

const config = useRuntimeConfig()

const auth = useAuthStore()
const isQuizMaster = computed(() => auth.user?.role === 'quiz-master' || auth.role === 'quiz-master')

// Fetch recent quizzes (paginated) for this quiz-master
const { data: quizzesData, pending: quizzesPending, error: quizzesError } = await useFetch(
  config.public.apiBase + '/api/quizzes?per_page=5',
  { credentials: 'include' }
)
// Fetch total published quizzes (approved=1)
const { data: publishedData } = await useFetch(
  config.public.apiBase + '/api/quizzes?approved=1&per_page=1',
  { credentials: 'include' }
)
// Fetch total questions in quiz-master's bank
const { data: questionsData } = await useFetch(
  config.public.apiBase + '/api/questions?per_page=1',
  { credentials: 'include' }
)

const recentQuizzes = quizzesData?.value?.quizzes?.data || []
const quizzesCount = quizzesData?.value?.quizzes?.total ?? recentQuizzes.length
const publishedCount = publishedData?.value?.quizzes?.total ?? 0
const questionsCount = questionsData?.value?.questions?.total ?? 0

// Fetch pending approvals (quizzes awaiting approval by admin or moderation)
const { data: pendingApprovalsData, pending: pendingApprovalsPending, error: pendingApprovalsError } = await useFetch(
  config.public.apiBase + '/api/quizzes?approved=0&per_page=5',
  { credentials: 'include' }
)
const pendingApprovals = pendingApprovalsData?.value?.quizzes?.data || pendingApprovalsData?.value || []
</script>
