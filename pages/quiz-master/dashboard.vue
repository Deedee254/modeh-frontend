<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white p-8 shadow-xl mb-8 overflow-hidden relative">
        <div class="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl"></div>
        <div class="relative z-10 flex items-center gap-8">
          <div class="flex-1">
            <div class="text-sm font-medium opacity-90 uppercase tracking-wider">Quiz Master Hub</div>
            <h1 class="mt-2 text-4xl md:text-5xl font-black tracking-tight">Create & Manage Quizzes</h1>
            <p class="mt-3 text-base opacity-95 leading-relaxed max-w-md">Track performance, manage content, and grow your quiz-mastering business with powerful analytics and tools.</p>

            <div class="mt-6 flex flex-wrap gap-3">
              <NuxtLink to="/quiz-master/quizzes" class="inline-flex items-center gap-2 px-5 py-3 bg-white text-brand-600 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z"></path></svg>
                My Quizzes
              </NuxtLink>
              <NuxtLink to="/quiz-master/quizzes/create" class="inline-flex items-center gap-2 px-5 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-white font-semibold transition-all duration-200 border border-white/30">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                Create Quiz
              </NuxtLink>
              <NuxtLink to="/quiz-master/wallet" class="inline-flex items-center gap-2 px-5 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-white font-semibold transition-all duration-200 border border-white/30">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Wallet
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Metrics Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <!-- Quizzes Created -->
            <div class="rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Quizzes</span>
                <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z"></path></svg>
                </div>
              </div>
              <div class="text-3xl font-black text-gray-900 dark:text-white">{{ quizzesCount }}</div>
              <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">Total created</div>
            </div>

            <!-- Questions -->
            <div class="rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Questions</span>
                <div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
              </div>
              <div class="text-3xl font-black text-gray-900 dark:text-white">{{ questionsCount }}</div>
              <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">In your bank</div>
            </div>

            <!-- Published -->
            <div class="rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Published</span>
                <div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
              </div>
              <div class="text-3xl font-black text-gray-900 dark:text-white">{{ publishedCount }}</div>
              <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">Approved</div>
            </div>

            <!-- Pending -->
            <div class="rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Pending</span>
                <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
              </div>
              <div class="text-3xl font-black text-gray-900 dark:text-white">{{ pendingApprovals.length }}</div>
              <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">Awaiting review</div>
            </div>
          </div>

          <!-- Recent Activity -->
          <UiCard class="rounded-xl border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <template #header>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-100 to-cyan-50 dark:from-cyan-900/30 dark:to-cyan-800/30 flex items-center justify-center">
                  <svg class="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div class="flex-1 font-semibold text-lg">Recent Quizzes</div>
                <NuxtLink to="/quiz-master/quizzes" class="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300">View all →</NuxtLink>
              </div>
            </template>

            <div class="p-6">
              <div v-if="quizzesPending" class="space-y-3">
                <div v-for="i in 3" :key="i" class="h-16 rounded-lg bg-gray-100 dark:bg-slate-700 animate-pulse"></div>
              </div>
              <div v-else-if="quizzesError" class="text-sm text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div class="font-semibold">Failed to load quizzes</div>
                <div class="text-xs mt-1">{{ quizzesError?.message || 'Unknown error' }}</div>
              </div>
              <div v-else-if="!recentQuizzes || recentQuizzes.length === 0" class="text-center py-8">
                <svg class="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z"></path></svg>
                <p class="text-sm text-gray-500 dark:text-gray-400">No quizzes yet</p>
                <NuxtLink to="/quiz-master/quizzes/create" class="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-all duration-200">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                  Create Your First Quiz
                </NuxtLink>
              </div>
              <div v-else class="space-y-3">
                <div v-for="(q, idx) in (Array.isArray(recentQuizzes) ? recentQuizzes.filter(Boolean).slice(0, 5) : [])" :key="q?.id || idx" class="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 group">
                  <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-100 to-brand-50 dark:from-brand-900/30 dark:to-brand-800/30 flex items-center justify-center flex-shrink-0">
                    <svg class="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z"></path></svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{{ q?.title || 'Untitled' }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{{ q?.description || 'No description' }}</p>
                    <div class="flex items-center gap-3 mt-2">
                      <span class="inline-flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {{ q?.items_count || q?.questions_count || 0 }} Q's
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <NuxtLink v-if="q?.id" :to="`/quiz-master/quizzes/${q.id}`" class="p-2 text-brand-600 dark:text-brand-400 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-colors">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </UiCard>

          <!-- Quick Actions -->
          <UiCard class="rounded-xl border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <template #header>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/30 flex items-center justify-center">
                  <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div class="font-semibold text-lg">Quick Actions</div>
              </div>
            </template>
            <div class="p-6">
              <template v-if="isQuizMaster">
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <NuxtLink to="/quiz-master/quizzes/create" class="flex flex-col items-center gap-2 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 hover:shadow-md transition-all duration-200 group">
                    <div class="text-2xl transform group-hover:scale-110 transition-transform">📝</div>
                    <span class="text-xs font-semibold text-center text-gray-900 dark:text-white">Create Quiz</span>
                  </NuxtLink>
                  <NuxtLink to="/quiz-master/questions" class="flex flex-col items-center gap-2 p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 hover:shadow-md transition-all duration-200 group">
                    <div class="text-2xl transform group-hover:scale-110 transition-transform">❓</div>
                    <span class="text-xs font-semibold text-center text-gray-900 dark:text-white">Questions</span>
                  </NuxtLink>
                  <NuxtLink to="/quiz-master/topics" class="flex flex-col items-center gap-2 p-4 rounded-lg bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-900/10 hover:shadow-md transition-all duration-200 group">
                    <div class="text-2xl transform group-hover:scale-110 transition-transform">🏷️</div>
                    <span class="text-xs font-semibold text-center text-gray-900 dark:text-white">Topics</span>
                  </NuxtLink>
                  <NuxtLink to="/quiz-master/subjects" class="flex flex-col items-center gap-2 p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10 hover:shadow-md transition-all duration-200 group">
                    <div class="text-2xl transform group-hover:scale-110 transition-transform">📚</div>
                    <span class="text-xs font-semibold text-center text-gray-900 dark:text-white">Subjects</span>
                  </NuxtLink>
                  <NuxtLink to="/quiz-master/wallet" class="flex flex-col items-center gap-2 p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 hover:shadow-md transition-all duration-200 group">
                    <div class="text-2xl transform group-hover:scale-110 transition-transform">💰</div>
                    <span class="text-xs font-semibold text-center text-gray-900 dark:text-white">Wallet</span>
                  </NuxtLink>
                  <NuxtLink to="/quiz-master/profile" class="flex flex-col items-center gap-2 p-4 rounded-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 hover:shadow-md transition-all duration-200 group">
                    <div class="text-2xl transform group-hover:scale-110 transition-transform">👤</div>
                    <span class="text-xs font-semibold text-center text-gray-900 dark:text-white">Profile</span>
                  </NuxtLink>
                </div>
              </template>
              <template v-else>
                <div class="text-center py-6">
                  <p class="text-sm text-gray-500 dark:text-gray-400">Quick actions available to quiz-masters only</p>
                  <NuxtLink to="/login" class="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300">
                    <span>Sign in as quiz-master</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                  </NuxtLink>
                </div>
              </template>
            </div>
          </UiCard>
        </div>

        <!-- Sidebar -->
        <aside class="space-y-6">
          <!-- Pending Approvals -->
          <UiCard class="rounded-xl border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <template #header>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/30 flex items-center justify-center">
                  <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                </div>
                <div class="flex-1">
                  <div class="font-semibold text-lg">Pending</div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Awaiting review</p>
                </div>
              </div>
            </template>
            <div class="p-6">
              <div v-if="pendingApprovalsPending" class="text-sm text-gray-500 dark:text-gray-400">Loading…</div>
              <div v-else-if="pendingApprovals.length === 0" class="text-center py-6">
                <svg class="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p class="text-sm text-gray-500 dark:text-gray-400">All clear!</p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">No pending approvals</p>
              </div>
              <ul v-else class="space-y-3">
                <li v-for="(q, idx) in (Array.isArray(pendingApprovals) ? pendingApprovals.slice(0, 5).filter(Boolean) : [])" :key="q?.id || idx" class="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 group hover:shadow-md transition-shadow">
                  <NuxtLink v-if="q?.id" :to="`/quiz-master/quizzes/${q.id}`" class="block">
                    <p class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">{{ q?.title || q?.name || 'Untitled' }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Tap to review</p>
                  </NuxtLink>
                  <span v-else class="text-sm text-gray-400">Loading…</span>
                </li>
              </ul>
            </div>
          </UiCard>

          <!-- Performance Summary -->
          <UiCard class="rounded-xl border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <template #header>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/30 flex items-center justify-center">
                  <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <div class="font-semibold text-lg">Performance</div>
              </div>
            </template>
            <div class="p-6 space-y-4">
              <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Avg Score</p>
                  <p class="text-lg font-bold text-gray-900 dark:text-white mt-1">81%</p>
                </div>
                <div class="text-3xl">📊</div>
              </div>
              <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Completion</p>
                  <p class="text-lg font-bold text-gray-900 dark:text-white mt-1">92%</p>
                </div>
                <div class="text-3xl">✅</div>
              </div>
              <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Assignments</p>
                  <p class="text-lg font-bold text-gray-900 dark:text-white mt-1">24</p>
                </div>
                <div class="text-3xl">📋</div>
              </div>
            </div>
          </UiCard>

          <!-- Tips & Best Practices -->
          <UiCard class="rounded-xl border-0 shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border border-teal-200 dark:border-teal-800">
            <template #header>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-teal-200 dark:bg-teal-900/40 flex items-center justify-center">
                  <svg class="w-5 h-5 text-teal-700 dark:text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div class="font-semibold text-lg text-teal-900 dark:text-teal-100">Pro Tips</div>
              </div>
            </template>
            <div class="p-6">
              <ul class="space-y-3 text-sm text-teal-900 dark:text-teal-100">
                <li class="flex gap-2">
                  <span class="flex-shrink-0 mt-0.5">💡</span>
                  <span>Mix difficulty levels to maintain quizee engagement.</span>
                </li>
                <li class="flex gap-2">
                  <span class="flex-shrink-0 mt-0.5">🔄</span>
                  <span>Reuse questions from your bank to save creation time.</span>
                </li>
                <li class="flex gap-2">
                  <span class="flex-shrink-0 mt-0.5">📈</span>
                  <span>Share detailed analytics with stakeholders weekly.</span>
                </li>
              </ul>
            </div>
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
import { computed, ref, onMounted } from 'vue'
import useApi from '~/composables/useApi'

definePageMeta({ layout: 'quiz-master' })

const api = useApi()

const auth = useAuthStore()
const isQuizMaster = computed(() => auth.user?.role === 'quiz-master' || auth.role === 'quiz-master')

// State for recent quizzes
const quizzesData = ref(null)
const quizzesPending = ref(true)
const quizzesError = ref(null)

// State for published quizzes
const publishedData = ref(null)

// State for questions
const questionsData = ref(null)

// State for pending approvals
const pendingApprovalsData = ref(null)
const pendingApprovalsPending = ref(true)
const pendingApprovalsError = ref(null)

// Fetch data on component mount
onMounted(async () => {
  try {
    // Fetch recent quizzes
    quizzesPending.value = true
    try {
      const res = await api.get('/api/quizzes?per_page=5')
      if (!res.ok) {
        console.error('Failed to fetch quizzes:', res.status, res.statusText)
        quizzesError.value = new Error(`HTTP ${res.status}`)
      } else {
        quizzesData.value = await res.json()
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err)
      quizzesError.value = err
    } finally {
      quizzesPending.value = false
    }

    // Fetch published quizzes
    try {
      const res = await api.get('/api/quizzes?approved=1&per_page=1')
      if (!res.ok) {
        console.error('Failed to fetch published quizzes:', res.status, res.statusText)
      } else {
        publishedData.value = await res.json()
      }
    } catch (err) {
      console.error('Error fetching published quizzes:', err)
    }

    // Fetch questions
    try {
      const res = await api.get('/api/questions?per_page=1')
      if (!res.ok) {
        console.error('Failed to fetch questions:', res.status, res.statusText)
      } else {
        questionsData.value = await res.json()
      }
    } catch (err) {
      console.error('Error fetching questions:', err)
    }

    // Fetch pending approvals
    pendingApprovalsPending.value = true
    try {
      const res = await api.get('/api/quizzes?approved=0&per_page=5')
      if (!res.ok) {
        console.error('Failed to fetch pending approvals:', res.status, res.statusText)
        pendingApprovalsError.value = new Error(`HTTP ${res.status}`)
      } else {
        pendingApprovalsData.value = await res.json()
      }
    } catch (err) {
      console.error('Error fetching pending approvals:', err)
      pendingApprovalsError.value = err
    } finally {
      pendingApprovalsPending.value = false
    }
  } catch (err) {
    console.error('Error in data fetch:', err)
  }
})

const recentQuizzes = computed(() => quizzesData.value?.quizzes?.data || [])
const quizzesCount = computed(() => quizzesData.value?.quizzes?.total ?? recentQuizzes.value.length)
const publishedCount = computed(() => publishedData.value?.quizzes?.total ?? 0)
const questionsCount = computed(() => questionsData.value?.questions?.total ?? 0)

const pendingApprovals = computed(() => pendingApprovalsData.value?.quizzes?.data || pendingApprovalsData.value || [])
</script>
