<template>
  <div class="min-h-screen">
    <!-- Hero with animated background -->
    <div class="w-full bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <div class="relative isolate overflow-hidden">
        <!-- Animated background elements -->
        <div class="absolute inset-0 -z-10">
          <div class="relative h-full overflow-hidden bg-gradient-to-br from-indigo-50 via-sky-50 to-violet-50">
            <!-- Animated blobs -->
            <div class="absolute -left-1/4 top-0 h-[500px] w-[500px] animate-blob rounded-full bg-gradient-to-br from-violet-400/20 to-violet-400/10 mix-blend-multiply blur-3xl hidden lg:block"></div>
            <div class="absolute -right-1/4 top-1/4 h-[500px] w-[500px] animate-blob animation-delay-2000 rounded-full bg-gradient-to-br from-indigo-400/20 to-indigo-400/10 mix-blend-multiply blur-3xl hidden lg:block"></div>
            <div class="absolute bottom-0 left-1/3 h-[500px] w-[500px] animate-blob animation-delay-4000 rounded-full bg-gradient-to-br from-sky-400/20 to-sky-400/10 mix-blend-multiply blur-3xl hidden lg:block"></div>
          </div>
        </div>
        <div class="absolute inset-0">
          <div class="absolute -left-1/4 top-0 h-96 w-96 animate-blob rounded-full bg-violet-100/30 mix-blend-multiply blur-3xl hidden lg:block"></div>
          <div class="absolute -right-1/4 bottom-0 h-96 w-96 animate-blob animation-delay-2000 rounded-full bg-indigo-100/30 mix-blend-multiply blur-3xl hidden lg:block"></div>
        </div>

        <!-- Hero content -->
        <div class="relative px-6 py-24 sm:py-32">
          <div class="mx-auto max-w-2xl text-center">
            <h1 class="bg-gradient-to-r from-indigo-600 via-sky-600 to-violet-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl">
              Create beautiful quizzes. Engage quizees. Grow results.
            </h1>
            <p class="mt-6 text-lg leading-8 text-slate-700">
              Modeh helps quiz-masters and schools build, assign, and analyze quizzes in minutes — not hours.
            </p>
            <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <NuxtLink
                to="/register?role=quiz-master"
                class="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-violet-500 p-[2px] font-semibold text-white transition hover:shadow-lg hover:shadow-indigo-500/25 w-full sm:w-auto"
              >
                <span class="inline-flex h-full items-center gap-2 rounded-[10px] bg-gradient-to-r from-indigo-500 via-sky-500 to-violet-500 px-6 py-3 transition group-hover:bg-none w-full sm:w-auto">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Become a quiz-master</span>
                </span>
              </NuxtLink>
              <NuxtLink
                to="/quizzes"
                class="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border-2 border-indigo-500/20 bg-white px-6 py-3 font-semibold text-indigo-600 transition hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10 w-full sm:w-auto"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Browse quizzes</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Testimonials with Stats -->
    <section class="w-full bg-gradient-to-br from-indigo-50 via-white to-violet-50 py-20">
        <div class="mx-auto max-w-7xl px-6">
          <!-- Section header with center layout -->
          <div class="max-w-3xl mx-auto text-center mb-16">
            <div class="inline-block px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 font-medium mb-4">Success Stories</div>
            <h2 class="text-4xl font-bold text-indigo-900 mb-6">Loved by educators and quizees alike</h2>
            <p class="text-lg text-indigo-700/80">Join thousands of satisfied users who've transformed their teaching and learning experience with Modeh.</p>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div class="text-center">
              <div class="text-4xl font-bold text-indigo-900 mb-2">50K+</div>
              <div class="text-indigo-600">Active Users</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-indigo-900 mb-2">100K+</div>
              <div class="text-indigo-600">Quizzes Created</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-indigo-900 mb-2">95%</div>
              <div class="text-indigo-600">Satisfaction Rate</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-indigo-900 mb-2">1M+</div>
              <div class="text-indigo-600">Questions Answered</div>
            </div>
          </div>

          <!-- Testimonials Carousel -->
          <div class="relative">
            <Carousel :items="safeArray(testimonials)" :perViewLg="3" :perViewMd="2" :perViewSm="1" auto>
              <template #item="{ item }">
                <div class="group p-3">
                  <div class="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl">
                    <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    <div class="relative">
                      <!-- Rating Stars -->
                      <div class="flex gap-1 mb-4">
                        <template v-for="n in 5" :key="n">
                          <svg class="w-5 h-5" :class="n <= (item.rating || 5) ? 'text-yellow-400' : 'text-gray-200'" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </template>
                      </div>

                      <!-- Quote -->
                      <blockquote class="text-lg text-gray-700 mb-6">"{{ item.quote || 'Great experience with Modeh!' }}"</blockquote>

                      <!-- Author -->
                      <div class="flex items-center gap-4">
                        <div class="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-indigo-100 to-violet-100">
                          <div class="h-full w-full grid place-items-center text-lg font-semibold text-indigo-700">
                            {{ (item.name || 'A').charAt(0) }}
                          </div>
                        </div>
                        <div>
                          <div class="font-semibold text-gray-900">{{ item.name || 'Anonymous' }}</div>
                          <div class="text-sm text-indigo-600">{{ item.role || 'User' }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </Carousel>
          </div>
        </div>
      </section>

      <!-- Sponsors/Clients Section -->
      <section class="w-full bg-gradient-to-br from-white via-indigo-50 to-white py-16">
        <div class="mx-auto max-w-7xl px-6">
          <div class="text-center mb-12">
            <h2 class="inline-block px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 font-medium mb-4">Trusted by Leading Institutions</h2>
            <p class="text-lg text-indigo-900/80">Join hundreds of educational institutions that trust Modeh for their assessment needs</p>
          </div>

          <div class="relative">
            <Carousel :items="safeArray(sponsors)" :perView="5" :perViewSm="3" :perViewXs="2" auto>
              <template #item="{ item }">
                <div class="group px-6 py-4">
                  <div class="relative h-20 flex items-center justify-center">
                    <div class="absolute inset-0 rounded-xl bg-white shadow-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    <img :src="item.logo || '/default-logo.png'" :alt="item.name || 'Sponsor'" class="relative h-12 w-auto object-contain grayscale transition-all duration-300 group-hover:grayscale-0">
                  </div>
                  <div class="mt-2 text-center">
                    <p class="text-sm font-medium text-indigo-900">{{ item.name || 'Sponsor' }}</p>
                    <p class="text-xs text-indigo-600">{{ item.type || 'Institution' }}</p>
                  </div>
                </div>
              </template>
            </Carousel>
          </div>
        </div>
      </section>

      <!-- Final CTA -->
      <section class="w-full bg-gradient-to-br from-indigo-50 via-white to-violet-50 py-20">
        <div class="mx-auto max-w-7xl px-6">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-indigo-900">Ready to Transform Your Teaching?</h2>
            <p class="mt-4 text-lg text-indigo-600/80">Join thousands of educators who've made the switch to Modeh</p>
          </div>
          <div class="text-center">
            <NuxtLink
              to="/register?role=quiz-master"
              class="inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-violet-500 px-8 py-4 font-semibold text-white transition hover:shadow-lg hover:shadow-indigo-500/25"
            >
              Get Started Free
            </NuxtLink>
          </div>
        </div>
      </section>

      <section class="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <!-- Build Fast Card -->
        <div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-indigo-50 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-200">
          <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-indigo-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <div class="relative flex flex-col items-center text-center">
            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-2xl text-white shadow-lg shadow-indigo-200 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110">
              <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="mb-2 font-semibold text-indigo-900">Build fast</h3>
            <p class="text-sm text-indigo-700/80">Create quizzes with rich question types and reusable banks in minutes.</p>
          </div>
        </div>

        <!-- Assign & Engage Card -->
        <div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50 via-white to-rose-50 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-rose-200">
          <div class="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-rose-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <div class="relative flex flex-col items-center text-center">
            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-2xl text-white shadow-lg shadow-rose-200 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110">
              <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="mb-2 font-semibold text-rose-900">Assign & engage</h3>
            <p class="text-sm text-rose-700/80">Invite quizees, set timers, and deliver instant feedback that motivates.</p>
          </div>
        </div>

        <!-- Track Results Card -->
        <div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-200">
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <div class="relative flex flex-col items-center text-center">
            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-2xl text-white shadow-lg shadow-emerald-200 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110">
              <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 class="mb-2 font-semibold text-emerald-900">Track results</h3>
            <p class="text-sm text-emerald-700/80">See progress with clear analytics to improve learning outcomes.</p>
          </div>
        </div>
      </section>

  <!-- How it works (colorful steps) -->
  <!-- Section with animated gradient background -->
      <section class="relative mt-14 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-50 via-indigo-50 to-sky-50 px-6 py-12 sm:py-16">
        <!-- Animated background elements -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute -left-1/4 -top-1/4 h-96 w-96 animate-blob rounded-full bg-violet-100/30 mix-blend-multiply blur-3xl hidden lg:block"></div>
          <div class="absolute -bottom-1/4 -right-1/4 h-96 w-96 animate-blob animation-delay-2000 rounded-full bg-indigo-100/30 mix-blend-multiply blur-3xl hidden lg:block"></div>
          <div class="absolute -bottom-1/2 left-1/3 h-96 w-96 animate-blob animation-delay-4000 rounded-full bg-sky-100/30 mix-blend-multiply blur-3xl hidden lg:block"></div>
        </div>

        <!-- Content -->
        <div class="relative">
          <h2 class="mx-auto mb-12 max-w-xl text-center text-3xl font-bold text-indigo-900">
            How it works
            <span class="mt-2 block text-base font-normal text-indigo-600">Three simple steps to get started</span>
          </h2>

          <div class="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <!-- Step 1 -->
            <div class="group relative">
              <div class="absolute -inset-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 opacity-0 blur transition duration-300 group-hover:opacity-100"></div>
              <div class="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition duration-300 hover:shadow-xl">
                <div class="flex items-start gap-4">
                  <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 font-bold text-white shadow-lg shadow-indigo-200">1</div>
                  <div>
                    <h3 class="mb-2 font-semibold text-indigo-900">Create</h3>
                    <p class="text-sm text-slate-600">Build a quiz or import questions from your bank. Add rich media and interactive elements.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2 -->
            <div class="group relative">
              <div class="absolute -inset-2 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 opacity-0 blur transition duration-300 group-hover:opacity-100"></div>
              <div class="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition duration-300 hover:shadow-xl">
                <div class="flex items-start gap-4">
                  <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 font-bold text-white shadow-lg shadow-violet-200">2</div>
                  <div>
                    <h3 class="mb-2 font-semibold text-violet-900">Assign</h3>
                    <p class="text-sm text-slate-600">Share with quizees and control time limits and retries. Set deadlines and access rules.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3 -->
            <div class="group relative">
              <div class="absolute -inset-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 opacity-0 blur transition duration-300 group-hover:opacity-100"></div>
              <div class="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition duration-300 hover:shadow-xl">
                <div class="flex items-start gap-4">
                  <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-sky-600 font-bold text-white shadow-lg shadow-sky-200">3</div>
                  <div>
                    <h3 class="mb-2 font-semibold text-sky-900">Analyze</h3>
                    <p class="text-sm text-slate-600">Review performance to tailor teaching and assignments. Get detailed insights and trends.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured quiz-masters Section -->
      <section class="w-full bg-gradient-to-br from-violet-50 via-white to-sky-50 py-20">
        <div class="mx-auto max-w-7xl px-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <!-- Left side: Text content -->
            <div>
              <div class="inline-block px-4 py-2 rounded-full bg-violet-100 text-violet-700 font-medium mb-6">Expert Educators</div>
              <h2 class="text-4xl font-bold text-violet-900 mb-6">Learn from top quiz-masters around the world</h2>
              <p class="text-lg text-violet-700/80 mb-8">Join a community of passionate educators who create engaging quizzes and help quizees excel in their studies.</p>
              <div class="flex flex-wrap gap-6">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-violet-100 grid place-items-center">
                    <svg class="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <div class="text-2xl font-bold text-violet-900">500+</div>
                    <div class="text-sm text-violet-600">Active quiz-masters</div>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-sky-100 grid place-items-center">
                    <svg class="w-6 h-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <div class="text-2xl font-bold text-sky-900">98%</div>
                    <div class="text-sm text-sky-600">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right side: quiz-master cards -->
            <div class="relative">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <template v-for="(quiz-master, index) in featuredquiz-masters" :key="index">
                  <div class="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl">
                    <div class="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-sky-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    <div class="relative">
                      <!-- Avatar and badges -->
                      <div class="flex items-start justify-between mb-4">
                        <div class="flex items-center gap-3">
                          <div class="h-12 w-12 rounded-full bg-gradient-to-br from-violet-100 to-sky-100 grid place-items-center text-lg font-semibold text-violet-700">
                            {{ (quiz-master.name || 'A').charAt(0) }}
                          </div>
                          <div>
                            <h3 class="font-semibold text-gray-900">{{ quiz-master.name || 'quiz-master' }}</h3>
                            <p class="text-sm text-violet-600">{{ quiz-master.role || quiz-master.experience ? quiz-master.experience + ' yrs experience' : 'quiz-master' }}</p>
                          </div>
                        </div>
                        <div v-if="quiz-master.badges && quiz-master.badges.length" class="flex gap-1">
                          <div v-for="badge in quiz-master.badges" :key="badge"
                               class="px-2 py-1 text-xs font-medium rounded-full"
                               :class="badge.includes('Top') ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'">
                            {{ badge }}
                          </div>
                        </div>
                      </div>
                      
                      <!-- Stats -->
                      <div class="grid grid-cols-3 gap-4 mb-4">
                        <div class="text-center">
                          <div class="text-lg font-semibold text-gray-900">{{ quiz-master.rating || 'N/A' }}</div>
                          <div class="text-xs text-gray-600">Rating</div>
                        </div>
                        <div class="text-center">
                          <div class="text-lg font-semibold text-gray-900">{{ quiz-master.quizees || 'N/A' }}</div>
                          <div class="text-xs text-gray-600">quizees</div>
                        </div>
                        <div class="text-center">
                          <div class="text-lg font-semibold text-gray-900">{{ quiz-master.quizzes || 'N/A' }}</div>
                          <div class="text-xs text-gray-600">Quizzes</div>
                        </div>
                      </div>

                      <!-- Subjects -->
                      <div v-if="quiz-master.subjects && quiz-master.subjects.length" class="flex flex-wrap gap-2">
                        <span v-for="subject in quiz-master.subjects" :key="subject" 
                              class="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                          {{ subject }}
                        </span>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured + Latest Quizzes -->
      <section class="w-full bg-gradient-to-br from-rose-50 via-white to-indigo-50 py-20">
        <div class="mx-auto max-w-7xl px-6">
          <!-- Section header with description -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end mb-12">
            <div>
              <div class="inline-block px-4 py-2 rounded-full bg-rose-100 text-rose-700 font-medium mb-4">Trending Content</div>
              <h2 class="text-4xl font-bold text-rose-900">Discover our latest & featured quizzes</h2>
            </div>
            <p class="text-lg text-rose-700/80">Explore our curated collection of high-quality quizzes created by expert educators and trusted by thousands of quizees.</p>
          </div>

          <!-- Tabs: Top / Featured / New -->
          <div class="flex items-center gap-3 mb-8">
            <button
              type="button"
              @click="selectedTab = 'top'"
              :class="selectedTab === 'top' ? 'bg-rose-600 text-white' : 'bg-white text-rose-700 border border-rose-100'"
              class="px-4 py-2 rounded-xl font-medium transition-colors"
            >Top</button>

            <button
              type="button"
              @click="selectedTab = 'featured'"
              :class="selectedTab === 'featured' ? 'bg-rose-600 text-white' : 'bg-white text-rose-700 border border-rose-100'"
              class="px-4 py-2 rounded-xl font-medium transition-colors"
            >Featured</button>

            <button
              type="button"
              @click="selectedTab = 'new'"
              :class="selectedTab === 'new' ? 'bg-rose-600 text-white' : 'bg-white text-rose-700 border border-rose-100'"
              class="px-4 py-2 rounded-xl font-medium transition-colors"
            >New</button>
          </div>

          <!-- Quiz grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Featured Quiz Card (image background + overlay + description) -->
            <div class="lg:col-span-1">
              <UiCard variant="elevated" class="h-full overflow-hidden p-0">
                <div class="relative h-56 w-full bg-gray-100 bg-center bg-cover" :style="{ backgroundImage: `url(${featuredQuiz.cover_image || featuredQuiz.cover || '/default-quiz.png'})` }">
                  <div class="absolute inset-0 bg-black/35"></div>
                  <div class="absolute inset-0 flex flex-col justify-end p-4">
                    <div class="text-sm text-rose-200">Featured</div>
                    <h3 class="text-xl font-bold text-white leading-tight">{{ featuredQuiz.title }}</h3>
                    <div class="mt-2 text-sm text-rose-100/90 line-clamp-3">{{ featuredQuiz.description || featuredQuiz.summary || '' }}</div>
                  </div>
                </div>
                <div class="p-4">
                  <div class="text-sm text-rose-700">{{ featuredQuiz.topic_name || 'General' }}</div>
                  <div class="mt-3">
                    <NuxtLink :to="`/quizzes/${featuredQuiz.id || ''}`" 
                      class="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg font-medium hover:bg-rose-200 transition-colors">
                      Start practicing
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </NuxtLink>
                  </div>
                </div>
              </UiCard>
            </div>

            <!-- Latest Quizzes Grid -->
            <div class="lg:col-span-2">
              <div v-if="safeArray(displayedQuizzesByGrade).length" class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <UiQuizCard
                  v-for="quiz in safeArray(displayedQuizzesByGrade).slice(0, 4)"
                  :key="quiz.id"
                  :to="`/quizzes/${quiz.id || ''}`"
                  :title="quiz.title"
                  :topic="quiz.topic?.name || quiz.topic_name"
                  :cover="quiz.cover_image || quiz.cover"
                  :difficulty="quiz.difficulty"
                  :quiz-master="quiz.quiz-master?.name || quiz.user?.name"
                  :palette="pickPaletteClass(quiz.topic?.id || quiz.id)"
                />
              </div>
              <div v-else class="text-rose-700/70 text-sm">No quizzes yet. Check back soon.</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Browse by Subject -->
      <section class="w-full bg-gradient-to-br from-rose-50 via-white to-violet-50 py-20">
        <div class="mx-auto max-w-7xl px-6">
          <!-- Section header with split layout (responsive) -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start lg:items-end mb-12">
            <div class="text-center lg:text-left">
              <div class="inline-block px-4 py-2 rounded-full bg-violet-100 text-violet-700 font-medium mb-4">Popular Subjects</div>
              <h2 class="text-3xl sm:text-4xl font-bold text-violet-900 mb-4">Find the perfect subject to master</h2>
              <p class="text-lg text-violet-700/80 mb-4 lg:mb-0">Explore our comprehensive library of subjects taught by expert educators.</p>
            </div>
            <div class="flex flex-col items-center lg:items-end gap-4">
              <div class="flex flex-col sm:flex-row sm:items-center sm:gap-4 w-full sm:w-auto">
                <div class="flex items-center gap-3 w-full sm:w-auto">
                  <label class="text-sm text-violet-700">Grade</label>
                  <select v-model="selectedGrade" class="px-3 py-2 rounded-lg border bg-white text-violet-800 w-full sm:w-auto">
                    <option :value="null">All</option>
                    <option v-for="g in GRADES" :key="g.id" :value="g.id">{{ g.name || `Grade ${g.id}` }}</option>
                  </select>
                </div>
                <NuxtLink to="/subjects" 
                  class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-100 text-violet-700 font-medium hover:bg-violet-200 transition-colors w-full sm:w-auto mt-2 sm:mt-0"
                >
                  <span>View all</span>
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="relative">
            <Carousel :items="safeArray(filteredSubjects)" :perView="4" :perViewSm="2" :arrows="true" :dots="true">
              <template #item="{ item }">
                <UiPillCard
                  :to="`/quizzes?subject=${encodeURIComponent(item.slug)}&grade=${selectedGrade || ''}`"
                  :title="item.name"
                  :image="item.image"
                  :count="item.count || (item.quizzes_count || 0)"
                  :badge-text="item.short"
                  color="violet"
                  arrow
                >
                  <div class="text-violet-700 text-sm">
                    <div>{{ item.grade?.name || `Grade ${item.grade_id || selectedGrade || 'N/A'}` }}</div>
                    <div class="text-xs text-violet-600">{{ item.topics_count || (item.topics && item.topics.length) || 0 }} topics • {{ item.quizzes_count || item.count || 0 }} quizzes</div>
                  </div>
                </UiPillCard>
              </template>
            </Carousel>
          </div>
        </div>
      </section>

      <!-- Browse by Grade -->
      <section class="w-full bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-20">
        <div class="mx-auto max-w-7xl px-6">
          <!-- Section header with split layout (responsive) -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start lg:items-end mb-12">
            <div class="text-center lg:text-left">
              <div class="inline-block px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-medium mb-4">Grade-Specific Content</div>
              <h2 class="text-3xl sm:text-4xl font-bold text-emerald-900 mb-4">Find content for your grade level</h2>
              <p class="text-lg text-emerald-700/80 mb-4 lg:mb-0">Access grade-appropriate quizzes and learning materials tailored to your needs.</p>
            </div>
            <div class="flex flex-col items-center lg:items-end gap-4">
              <NuxtLink to="/grades" 
                class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-100 text-emerald-700 font-medium hover:bg-emerald-200 transition-colors w-full sm:w-auto"
              >
                <span>View all</span>
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </NuxtLink>
            </div>
          </div>

          <div class="relative">
            <Carousel :items="safeArray(GRADES)" :perView="4" :perViewSm="2" :arrows="true" :dots="true">
              <template #item="{ item }">
                <UiPillCard
                  :to="`/quizzes?grade=${item.id}`"
                  :title="`Grade ${item.id}`"
                  :badge-text="`G${item.id}`"
                  :count="item.quizzes_count"
                  color="emerald"
                  size="sm"
                  arrow
                >
                  <span class="text-emerald-700 text-sm">Explore →</span>
                </UiPillCard>
              </template>
            </Carousel>
          </div>
        </div>
      </section>

      <!-- Browse by Topic -->
      <section class="w-full bg-gradient-to-br from-sky-50 via-white to-indigo-50 py-20">
        <div class="mx-auto max-w-7xl px-6">
          <!-- Section header with split layout (responsive) -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start lg:items-end mb-12">
            <div class="text-center lg:text-left">
              <div class="inline-block px-4 py-2 rounded-full bg-sky-100 text-sky-700 font-medium mb-4">Explore Topics</div>
              <h2 class="text-3xl sm:text-4xl font-bold text-sky-900 mb-4">Dive deep into specific topics</h2>
              <p class="text-lg text-sky-700/80 mb-4 lg:mb-0">Choose from hundreds of focused topics to enhance your learning journey.</p>
            </div>
            <div class="flex flex-col items-center lg:items-end gap-4">
              <NuxtLink to="/topics" 
                class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-100 text-sky-700 font-medium hover:bg-sky-200 transition-colors w-full sm:w-auto"
              >
                <span>View all</span>
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </NuxtLink>
            </div>
          </div>
          <div class="relative">
            <Carousel :items="safeArray(topicsList)" :perView="4" :perViewSm="2" :arrows="true" :dots="true">
              <template #item="{ item }">
                <UiPillCard
                  :to="`/quizzes?topic_id=${item.id || ''}`"
                  :title="item.name"
                  :image="item.image || item.cover_image"
                  :count="item.quizzes_count || 0"
                  :palette="pickPaletteClass(item.subject?.id || item.id)"
                  arrow
                />
              </template>
            </Carousel>
          </div>
        </div>
      </section>


      <!-- Final CTA -->
      <section class="w-full relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-600 py-20">
        <!-- Animated background elements -->
        <div class="absolute inset-0">
          <div class="absolute -left-1/4 top-0 h-96 w-96 animate-blob rounded-full bg-white/10 mix-blend-overlay blur-3xl hidden lg:block"></div>
          <div class="absolute -right-1/4 bottom-0 h-96 w-96 animate-blob animation-delay-2000 rounded-full bg-white/10 mix-blend-overlay blur-3xl hidden lg:block"></div>
        </div>

        <div class="relative mx-auto max-w-7xl px-6">
          <div class="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 class="text-3xl font-bold text-white">Ready to create your first quiz?</h3>
              <p class="mt-4 text-lg text-white/90">Sign up free and publish your first quiz today.</p>
            </div>
            <div class="flex flex-wrap gap-4">
              <NuxtLink 
                to="/register?role=quiz-master" 
                class="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-white p-[2px] font-semibold text-indigo-600 transition hover:shadow-lg hover:shadow-white/25"
              >
                <span class="inline-flex h-full items-center gap-2 rounded-[10px] bg-white px-6 py-3 transition group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-indigo-50 group-hover:text-indigo-700">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Get started</span>
                </span>
              </NuxtLink>
              <NuxtLink 
                to="/quizzes" 
                class="inline-flex items-center gap-2 rounded-xl border-2 border-white/60 px-6 py-3 font-semibold text-white transition hover:border-white/80 hover:bg-white/10"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Browse quizzes</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import PageHero from '~/components/ui/PageHero.vue'
import Carousel from '~/components/ui/Carousel.vue'

const config = useRuntimeConfig()

// Helper to ensure values passed to Carousel are arrays
function safeArray(v) {
  if (Array.isArray(v)) return v
  if (v == null) return []
  return []
}

// Selected tab for quizzes (top | featured | new)
const selectedTab = ref('top')

// Latest quizzes (clean: no skeletons, hide if empty)
const { data: quizzesData } = await useFetch(config.public.apiBase + '/api/quizzes?latest=1', { credentials: 'include' })
const latestQuizzes = safeArray(quizzesData?.value?.quizzes?.data || quizzesData?.value?.quizzes || quizzesData?.value).slice(0, 12)
const featuredQuiz = latestQuizzes[0] || { title: 'Getting Started Quiz', topic_name: 'General' }

// computed list based on selected tab
const displayedQuizzes = computed(() => {
  if (selectedTab.value === 'featured') {
    // show featured first, then fill with latest
    const rest = latestQuizzes.filter(q => q.id !== (featuredQuiz.id || null))
    return [featuredQuiz, ...rest]
  }
  if (selectedTab.value === 'new') {
    // assume latestQuizzes is already newest-first
    return latestQuizzes.slice().sort((a, b) => {
      const ta = new Date(a.created_at || a.published_at || 0).getTime()
      const tb = new Date(b.created_at || b.published_at || 0).getTime()
      return tb - ta
    })
  }
  // top - fallback to latest for now
  return latestQuizzes
})

// Topics (for carousel)
const { data: topicsData } = await useFetch(config.public.apiBase + '/api/topics', { credentials: 'include' })
const topicsList = safeArray(topicsData?.value?.topics?.data || topicsData?.value?.topics || topicsData?.value).slice(0, 12)

// Featured quiz-masters
const { data: quiz-mastersData } = await useFetch(config.public.apiBase + '/api/quiz-masters', { credentials: 'include' })
const featuredquiz-masters = safeArray(quiz-mastersData?.value?.quiz-masters?.data || quiz-mastersData?.value?.quiz-masters || quiz-mastersData?.value).slice(0, 4)

// Testimonials
const { data: testimonialsData } = await useFetch(config.public.apiBase + '/api/testimonials', { credentials: 'include' })
const testimonials = testimonialsData?.value?.testimonials?.data || testimonialsData?.value?.testimonials || testimonialsData?.value || []

// Sponsors
const { data: sponsorsData } = await useFetch(config.public.apiBase + '/api/sponsors', { credentials: 'include' })
const sponsors = sponsorsData?.value?.sponsors?.data || sponsorsData?.value?.sponsors || sponsorsData?.value || []

// Subjects (used in template as SUBJECTS)
const { data: subjectsData } = await useFetch(config.public.apiBase + '/api/subjects', { credentials: 'include' })
const SUBJECTS = safeArray(subjectsData?.value?.subjects?.data || subjectsData?.value?.subjects || subjectsData?.value)

// Grades (used in template as GRADES)
const { data: gradesData } = await useFetch(config.public.apiBase + '/api/grades', { credentials: 'include' })
const GRADES = safeArray(gradesData?.value?.grades?.data || gradesData?.value?.grades || gradesData?.value)



// Helper: pick a pastel gradient class by id so placeholders look colorful and varied
function pickPaletteClass(id) {
  const palettes = [
    'bg-gradient-to-br from-indigo-200 via-indigo-100 to-sky-100 text-indigo-800',
    'bg-gradient-to-br from-rose-200 via-rose-100 to-pink-100 text-rose-800',
    'bg-gradient-to-br from-emerald-200 via-emerald-100 to-lime-100 text-emerald-800',
    'bg-gradient-to-br from-yellow-200 via-amber-100 to-amber-50 text-amber-800',
    'bg-gradient-to-br from-fuchsia-200 via-fuchsia-100 to-pink-50 text-fuchsia-800',
    'bg-gradient-to-br from-sky-200 via-sky-100 to-indigo-50 text-sky-800'
  ]
  return palettes[(id || 0) % palettes.length]
}

// Selected grade for filtering (default to grade 10 if present)
const defaultGrade = (GRADES.find(g => String(g.id) === '10') && 10) || (GRADES[0] && GRADES[0].id) || null
const selectedGrade = ref(defaultGrade)

// filtered subjects by grade
const filteredSubjects = computed(() => {
  if (!selectedGrade) return SUBJECTS
  if (!selectedGrade.value) return SUBJECTS
  return SUBJECTS.filter(s => {
    // some APIs provide a grade_id or grades array on subject
    if (s.grade_id) return String(s.grade_id) === String(selectedGrade.value)
    if (s.grade) return String(s.grade.id || s.grade) === String(selectedGrade.value)
    if (s.grades && Array.isArray(s.grades)) return s.grades.some(g => String(g.id || g) === String(selectedGrade.value))
    return true
  })
})

// filtered topics by selected grade (if topics include grade/subject info)
const filteredTopics = computed(() => {
  if (!selectedGrade) return topicsList
  if (!selectedGrade.value) return topicsList
  return topicsList.filter(t => {
    if (t.grade_id) return String(t.grade_id) === String(selectedGrade.value)
    if (t.grade) return String(t.grade.id || t.grade) === String(selectedGrade.value)
    if (t.subject && t.subject.grade_id) return String(t.subject.grade_id) === String(selectedGrade.value)
    return true
  })
})

// filter displayed quizzes by selected grade
const displayedQuizzesByGrade = computed(() => {
  if (!selectedGrade || !selectedGrade.value) return displayedQuizzes.value
  return displayedQuizzes.value.filter(q => {
    // Quiz-level grade fields
    if (q.grade_id) return String(q.grade_id) === String(selectedGrade.value)
    if (q.grade) return String(q.grade.id || q.grade) === String(selectedGrade.value)
    if (q.grades && Array.isArray(q.grades)) return q.grades.some(g => String(g.id || g) === String(selectedGrade.value))

    // Topic -> subject -> grade linkage
    if (q.topic && q.topic.subject) {
      const subj = q.topic.subject
      if (subj.grade_id) return String(subj.grade_id) === String(selectedGrade.value)
      if (subj.grade) return String(subj.grade.id || subj.grade) === String(selectedGrade.value)
    }

    // If a grade is selected and no explicit mapping exists, exclude the quiz
    return false
  })
})




</script>

<style scoped>
/* Animation utilities */
@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(20px, -30px) scale(1.1); }
  50% { transform: translate(-20px, 20px) scale(0.9); }
  75% { transform: translate(20px, 30px) scale(0.95); }
}

.animate-blob {
  animation: blob 10s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* Blur utilities */
.blur-3xl {
  --tw-blur: blur(64px);
  filter: var(--tw-blur);
}
</style>

<style scoped>
/* Animation utilities */
@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(20px, -30px) scale(1.1); }
  50% { transform: translate(-20px, 20px) scale(0.9); }
  75% { transform: translate(20px, 30px) scale(0.95); }
}

.animate-blob {
  animation: blob 10s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* Blur utilities */
.blur-3xl {
  --tw-blur: blur(64px);
  filter: var(--tw-blur);
}
</style>
