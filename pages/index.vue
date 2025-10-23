<template>
  <div class="min-h-screen">
    <!-- Hero (two-column) -->
    <section class="bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-6 py-12">
      <div class="mx-auto max-w-7xl">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <!-- Left: Value prop -->
          <div class="text-center lg:text-left">
            <h1 class="bg-gradient-to-r from-indigo-600 via-sky-600 to-violet-600 bg-clip-text text-3xl sm:text-5xl font-bold text-transparent">Practice smarter. Learn faster.</h1>
            <p class="mt-4 text-lg text-slate-700 max-w-lg">Quizzes built for quizees: clear instructions, mobile-first UI, instant feedback and guided retry. Start by choosing your grade, subject and topic.</p>
            <div class="mt-8 flex flex-col sm:flex-row items-center lg:items-start gap-4">
              <NuxtLink to="/quizzes" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-indigo-100 bg-white px-6 py-3 font-semibold text-indigo-600">Explore quizzes</NuxtLink>
              <NuxtLink to="/grades" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 font-semibold text-white">Begin</NuxtLink>
            </div>
            <div class="mt-4 text-sm text-slate-600">Or browse by <NuxtLink to="/topics" class="text-indigo-600 underline">topics</NuxtLink> or <NuxtLink to="/subjects" class="text-indigo-600 underline">subjects</NuxtLink>.</div>
          </div>

          <!-- Right: Login form -->
          <div class="mx-auto w-full max-w-md">
            <div class="rounded-2xl bg-white p-6 shadow-lg">
              <h3 class="text-lg font-semibold text-gray-900">Log in to continue</h3>
              <p class="text-sm text-slate-600 mb-4">Quick access for quizees — or <NuxtLink to="/register" class="text-indigo-600 underline">create an account</NuxtLink></p>

              <form @submit.prevent="login" class="space-y-3">
                <div>
                  <label class="block text-sm text-gray-700">Email</label>
                  <input v-model="email" type="email" required class="mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
                <div>
                  <label class="block text-sm text-gray-700">Password</label>
                  <input v-model="password" type="password" required class="mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
                <div class="flex items-center justify-between">
                  <label class="inline-flex items-center text-sm text-gray-600"><input type="checkbox" v-model="remember" class="mr-2" /> Remember</label>
                  <NuxtLink to="/login" class="text-sm text-indigo-600 underline">Forgot?</NuxtLink>
                </div>
                <div>
                  <button type="submit" :disabled="loading" class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-75 flex items-center justify-center">
                    <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    <span>{{ loading ? 'Logging in...' : 'Log in' }}</span>
                  </button>
                </div>
                <!-- errors shown via toasts; inline error removed -->
              </form>

              <div class="mt-4">
                <div class="text-center text-sm text-slate-600 mb-2">Or continue with</div>
                <div class="flex gap-2">
                  <a href="/auth/google" class="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm">Google</a>
                  <a href="/auth/facebook" class="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm">Facebook</a>
                </div>
                <div class="mt-3 text-center text-sm">
                  <NuxtLink to="/register?role=quizee" class="text-indigo-600 underline mr-2">Register (Quizee)</NuxtLink>
                  <NuxtLink to="/register?role=quiz-master" class="text-indigo-600 underline">Register (Quiz-Master)</NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Steps: Quizee flow -->
    <section class="relative mt-16 px-6">
      <div class="mx-auto max-w-6xl">
        <div class="text-center">
          <p class="text-sm font-semibold tracking-wide text-indigo-500 uppercase">How it works</p>
          <h2 class="mt-3 text-3xl font-bold text-slate-900">Start learning in four simple steps</h2>
          <p class="mt-3 text-base text-slate-600">Everything is built for clarity and momentum — pick a topic, practice with confidence, learn from feedback, and stay motivated.</p>
        </div>

        <div class="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div
            v-for="step in howItWorksSteps"
            :key="step.title"
            class="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white p-8 shadow-[0_30px_80px_-30px_rgba(37,99,235,0.45)] ring-1 ring-indigo-100 transition duration-300 hover:-translate-y-1 hover:shadow-[0_45px_95px_-35px_rgba(37,99,235,0.55)]"
          >
            <div
              class="absolute inset-x-10 -top-16 h-32 rounded-full opacity-20 blur-3xl transition group-hover:opacity-40"
              :class="step.glow"
            ></div>

            <div class="relative flex items-center justify-between">
              <div
                class="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-lg shadow-indigo-500/40"
                :class="step.badge"
              >
                {{ step.number }}
              </div>
              <span :class="['text-4xl text-slate-200 transition group-hover:text-slate-300', step.icon]"></span>
            </div>

            <div class="relative mt-6 space-y-2">
              <h3 class="text-lg font-semibold text-slate-900">{{ step.title }}</h3>
              <p class="text-sm leading-relaxed text-slate-600">{{ step.description }}</p>
            </div>

            <div v-if="step.link" class="relative mt-8 flex items-center gap-2 text-sm font-semibold text-indigo-600">
              <NuxtLink :to="step.link.href" class="inline-flex items-center gap-2">
                <span>{{ step.link.label }}</span>
                <span class="i-heroicons-arrow-right-16-solid transition-transform group-hover:translate-x-1"></span>
              </NuxtLink>
            </div>
          </div>
        </div>

        <div class="mt-14 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
          <NuxtLink
            to="/grades"
            class="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500"
          >
            Get started now
            <span class="i-heroicons-rocket-launch-16-solid"></span>
          </NuxtLink>
          <NuxtLink to="/about" class="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">
            Explore all features
            <span class="i-heroicons-arrow-up-right-16-solid"></span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Parallax banner -->
  <ParallaxBanner image="/hero-banner.jpg" title="Practice daily, improve steadily" subtitle="Short, focused quizzes that fit into any schedule." cta-text="Start a quick quiz" cta-link="/quizzes" height="h-40 sm:h-56" class="my-8" />

    <!-- Quizzes: Tabs + Grid (Top / Featured / New) -->
    <section class="px-6 py-8">
      <div class="mx-auto max-w-7xl">
        <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 class="text-3xl font-bold text-rose-900">Discover quizzes</h2>
            <p class="text-sm text-rose-700/80">Featured, new and top quizzes across grades and subjects.</p>
          </div>
          <div class="flex items-center gap-3 py-1 -mx-3 px-3">
            <div class="flex flex-wrap gap-2">
              <button @click="selectedTab = 'all'" :class="selectedTab === 'all' ? 'bg-rose-600 text-white' : 'bg-white text-rose-700 border'" class="px-3 py-2 rounded-xl">All</button>
              <button @click="selectedTab = 'top'" :class="selectedTab === 'top' ? 'bg-rose-600 text-white' : 'bg-white text-rose-700 border'" class="px-3 py-2 rounded-xl">Top</button>
              <button @click="selectedTab = 'featured'" :class="selectedTab === 'featured' ? 'bg-rose-600 text-white' : 'bg-white text-rose-700 border'" class="px-3 py-2 rounded-xl">Featured</button>
              <button @click="selectedTab = 'new'" :class="selectedTab === 'new' ? 'bg-rose-600 text-white' : 'bg-white text-rose-700 border'" class="px-3 py-2 rounded-xl">New</button>
            </div>
          </div>
        </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-6">
          <div class="lg:col-span-1">
            <UiCard v-if="hasFeaturedQuiz" variant="elevated" class="h-full overflow-hidden p-0">
              <div class="relative h-40 sm:h-56 w-full bg-gray-100 bg-center bg-cover" :style="{ backgroundImage: `url(${featuredQuiz.cover_image || featuredQuiz.cover || '/default-quiz.png'})` }">
                <div class="absolute inset-0 bg-black/35"></div>
                <div class="absolute inset-0 flex flex-col justify-end p-4">
                  <div class="text-sm text-rose-200">Featured</div>
                  <h3 class="text-xl font-bold text-white leading-tight">{{ featuredQuiz.title }}</h3>
                </div>
              </div>
              <div class="p-4">
                <div class="text-sm text-rose-700">{{ featuredQuiz.topic?.name || featuredQuiz.topic_name || 'General' }}</div>
                  <div class="mt-3"><NuxtLink :to="`/quizee/quizzes/${featuredQuiz.id || ''}`" class="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg">Start practicing</NuxtLink></div>
                  <div class="mt-3"><NuxtLink to="/quizzes" class="text-sm text-rose-600 underline">Show all quizzes</NuxtLink></div>
              </div>
            </UiCard>
            <UiCard v-else variant="elevated" class="h-full overflow-hidden p-0">
              <div class="flex h-full items-center justify-center bg-rose-50 p-6 text-center text-sm text-rose-600">
                No featured quiz available right now. Browse all quizzes to get started.
              </div>
            </UiCard>
          </div>


<div class="lg:col-span-2">
            <div v-if="safeArray(displayedQuizzesByGrade).length" class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6">
              <UiQuizCard v-for="quiz in safeArray(displayedQuizzesByGrade).slice(0,4)" :key="quiz.id" :to="`/quizee/quizzes/${quiz.id || ''}`" :startLink="`/quizee/quizzes/${quiz.id || ''}`" :takeLink="`/quizee/quizzes/take/${quiz.id || ''}`" :title="quiz.title" :topic="quiz.topic?.name || quiz.topic_name" :subject="quiz.topic?.subject?.name || quiz.subject?.name || quiz.subject_name" :grade="quiz.grade || quiz.grade_id" :questions-count="quiz.questions_count ?? quiz.questions ?? quiz.items_count" :cover="quiz.cover_image || quiz.cover" :palette="pickPaletteClass(quiz.topic?.id || quiz.id)" :likes="quiz.likes_count ?? quiz.likes ?? 0" :quiz-id="quiz.id" :liked="quiz.liked" :description="quiz.description || quiz.summary || ''" @like="onQuizLike(quiz, $event)" />
              <div class="mt-4">
                <NuxtLink to="/quizzes" class="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-lg">Show all quizzes</NuxtLink>
              </div>
            </div>
            <div v-else class="text-rose-700/70 text-sm">No quizzes yet. Check back soon.</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Subjects, Grades, Topics sections share the richer hero layout used on listing pages -->
    <section class="px-6 py-10">
      <div class="mx-auto max-w-6xl">
          <header class="text-center max-w-2xl mx-auto">
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div class="text-sm uppercase tracking-wide text-indigo-500 font-semibold">Subjects</div>
            <div class="w-full sm:w-auto">
              <select v-model="selectedGrade" class="rounded-md border px-3 py-2 text-sm w-full sm:w-auto sm:max-w-xs touch-manipulation">
                <option :value="null">All grades</option>
                <option v-for="g in GRADES" :key="g.id" :value="g.id">{{ g.name || g.id }}</option>
              </select>
            </div>
          </div>
          <h3 class="mt-2 text-3xl font-bold text-slate-900">Popular subjects & learning paths</h3>
          <p class="mt-3 text-slate-600">Browse the same rich subject cards you’ll find on the subjects page, with quiz and topic counts to help you choose where to start.</p>
        </header>

<div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          <SubjectCard
            v-for="subject in safeArray(filteredSubjects).slice(0,4)"
            :key="subject.id"
            :subject="subject"
            :title="subject.name"
            :subtitle="`Grades ${ Array.isArray(subject.grades) ? subject.grades.map(g => g.name || g.id).join(', ') : subject.grade?.name || subject.grade_id || 'All' }`"
            :image="subject.image"
            :badgeText="(subject.name || '').charAt(0).toUpperCase()"
            :topicsCount="subject.topics_count || subject.topics?.length || 0"
            :quizzes_count="subject.quizzes_count || subject.count || 0"
            :startLink="`/subjects/${subject.slug || subject.id}`"
            :description="subject.description || subject.summary || ''"
            :grade="subject.grade?.name || subject.grade_id || ''"
            startLabel="Explore Topics"
            class="group"
          />
        </div>
        <div class="mt-6 text-center">
          <NuxtLink to="/subjects" class="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg">Show all subjects</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Levels section -->
    <section class="px-6 py-10">
      <div class="mx-auto max-w-6xl">
        <header class="text-center max-w-2xl mx-auto">
          <div class="text-sm uppercase tracking-wide text-indigo-500 font-semibold">Levels</div>
          <h3 class="mt-2 text-3xl font-bold text-slate-900">Browse by learning level</h3>
          <p class="mt-3 text-slate-600">Explore learning levels such as Early Years, Primary, Secondary and Tertiary (courses).</p>
        </header>

        <div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          <LevelCard
            v-for="lvl in safeArray(levels).slice(0,6)"
            :key="lvl.id"
            :to="`/levels/${lvl.id}`"
            :title="lvl.name"
            :level="lvl"
            :subtitle="lvl.description || ''"
            :grades_count="(Array.isArray(lvl.grades) ? lvl.grades.length : 0)"
            :actionLink="`/levels/${lvl.id}`"
            actionLabel="Explore level"
          />
        </div>
        <div class="mt-6 text-center">
          <NuxtLink to="/levels" class="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg">View all levels</NuxtLink>
        </div>
      </div>
    </section>

    <section class="px-6 py-12 bg-gradient-to-br from-white to-indigo-50">
      <div class="mx-auto max-w-6xl">
        <header class="text-center max-w-2xl mx-auto">
          <div class="text-sm uppercase tracking-wide text-indigo-500 font-semibold">Grades</div>
          <h3 class="mt-2 text-3xl font-bold text-slate-900">Browse quizzes by grade level</h3>
          <p class="mt-3 text-slate-600">Discover grade cards with the same metadata used on the grades directory so everything feels familiar across the experience.</p>
        </header>

<div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          <GradeCard
            v-for="grade in safeArray(GRADES).slice(0,6)"
            :key="grade.id"
            :to="`/grades/${grade.id}`"
            :title="grade.name || grade.id"
            :grade="grade"
            :quizzes_count="grade.quizzes_count || 0"
            :subjects_count="grade.subjects_count || 0"
            actionLabel="Explore Grade"
            :actionLink="`/grades/${grade.id}`"
          />
        </div>
      </div>
    </section>

    <section class="px-6 py-10">
      <div class="mx-auto max-w-6xl">
        <div class="text-center max-w-2xl mx-auto">
          <div class="text-sm uppercase tracking-wide text-rose-500 font-semibold">Topics</div>
          <h3 class="mt-2 text-3xl font-bold text-slate-900">Explore topics with rich context</h3>
          <p class="mt-3 text-slate-600">We're now reusing the enhanced topic cards so you can see quiz counts, linked subjects, and more immediately.</p>
        </div>
  <div class="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
    <div class="w-full sm:w-auto">
      <select v-model="homeTopicGrade" class="rounded-md border px-3 py-2 text-sm w-full sm:w-auto sm:max-w-xs touch-manipulation mb-3 sm:mb-0">
        <option :value="null">All grades</option>
        <option v-for="g in GRADES" :key="g.id" :value="g.id">{{ g.name || g.id }}</option>
      </select>
    </div>
    <div class="w-full sm:w-auto">
      <select v-model="homeTopicSubject" class="rounded-md border px-3 py-2 text-sm w-full sm:w-auto sm:max-w-xs touch-manipulation mb-3 sm:mb-0">
        <option :value="null">All subjects</option>
        <option v-for="s in SUBJECTS" :key="s.id" :value="s.id">{{ s.name || s.id }}</option>
      </select>
    </div>
  </div>



<div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">

          <TopicCard
            v-for="topic in selectedHomepageTopics"
            :key="topic.id"
            :topic="topic"
            :title="topic.name"
            :image="topic.image || topic.cover_image || ''"
            :grade="getTopicGradeLabel(topic)"
            :subject="getTopicSubjectLabel(topic)"
            :quizzesCount="topic.quizzes_count || topic.quizzes?.length || 0"
            :startLink="`/topics/${topic.id}`"
            :description="topic.description || topic.summary || ''"
            startLabel="View Quizzes"
          />

        </div>        <div class="mt-6 text-center">
          <NuxtLink to="/topics" class="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg">Show all topics</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Quiz Masters -->
    <section class="px-6 py-10">
      <div class="mx-auto max-w-6xl">
        <div class="text-center max-w-2xl mx-auto">
          <div class="text-sm uppercase tracking-wide text-indigo-500 font-semibold">Creators</div>
          <h3 class="mt-2 text-3xl font-bold text-slate-900">Meet our quiz-masters</h3>
          <p class="mt-3 text-slate-600">Top contributors and educators who write and curate quizzes.</p>
        </div>
  <div class="mt-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6">
          <UCard v-for="qm in featuredQuizMasters.slice(0,4)" :key="qm.id" class="text-center">
            <div class="flex flex-col items-center p-4">
              <div class="w-20 h-20 rounded-full overflow-hidden mb-3 bg-indigo-100 grid place-items-center">
                <img v-if="qm.avatar" :src="qm.avatar" :alt="qm.name || 'Quiz master'" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full text-indigo-700 font-bold text-2xl grid place-items-center">{{ (qm.name||'').charAt(0) }}</div>
              </div>
              <div class="font-semibold text-gray-800">{{ qm.name }}</div>
              <div class="text-sm text-gray-500">{{ qm.headline || 'Quiz-master' }}</div>
              <div class="mt-3"><NuxtLink :to="`/quiz-masters/${qm.id}`" class="text-indigo-600 text-sm hover:underline">View profile →</NuxtLink></div>
            </div>
          </UCard>
        </div>
        <div class="mt-6 text-center">
          <NuxtLink to="/quiz-masters" class="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg">View all quiz-masters</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Secondary parallax banner -->
    <ParallaxBanner image="/banner-2.jpg" title="Short daily quizzes to build momentum" subtitle="5-10 minute quizzes designed for weekly practice" cta-text="Try a quick quiz" cta-link="/quizzes" height="h-40" class="my-8" />

    <!-- Testimonials -->
    <section class="px-6 py-8 bg-gradient-to-br from-indigo-50 to-white">
      <div class="mx-auto max-w-7xl">
        <h3 class="text-2xl font-bold text-indigo-900 mb-4 text-center">Success Stories</h3>
        <client-only>
        <Carousel :items="safeArray(testimonials)" :perViewLg="3" :perViewMd="2" :perViewSm="1" auto>
          <template #item="{ item }">
            <div class="p-3">
              <div class="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm hover:shadow-xl">
                <div class="flex gap-1 mb-4">
                  <template v-for="n in 5" :key="n">
                    <svg class="w-5 h-5" :class="n <= (item.rating || 5) ? 'text-yellow-400' : 'text-gray-200'" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  </template>
                </div>
                <blockquote class="text-lg text-gray-700 mb-4">"{{ item.quote || 'Great experience with Modeh!' }}"</blockquote>
                <div class="flex items-center gap-3">
                  <div class="h-12 w-12 rounded-full bg-indigo-100 grid place-items-center text-indigo-700 font-semibold">{{ (item.name || 'A').charAt(0) }}</div>
                  <div>
                    <div class="font-semibold text-gray-900">{{ item.name || 'Anonymous' }}</div>
                    <div class="text-sm text-indigo-600">{{ item.role || 'User' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </template>
  </Carousel>
  </client-only>
      </div>
    </section>

    <!-- Sponsors -->
    <section class="px-6 py-8">
      <div class="mx-auto max-w-7xl">
        <client-only>
        <Carousel :items="safeArray(sponsors)" :perView="5" :perViewSm="3" :perViewXs="2" auto>
          <template #item="{ item }">
            <div class="px-6 py-4">
              <div class="relative h-20 flex items-center justify-center">
                <img :src="item.logo || '/default-logo.png'" :alt="item.name || 'Sponsor'" class="h-12 sm:h-10 md:h-12 object-contain grayscale max-w-full" />
              </div>
            </div>
          </template>
  </Carousel>
  </client-only>
      </div>
    </section>

    <!-- Newsletter CTA -->
    <section class="px-6 py-12 bg-gradient-to-br from-white via-indigo-50 to-white">
      <div class="mx-auto max-w-4xl text-center">
        <h3 class="text-2xl font-bold text-indigo-900">Get weekly practice tips</h3>
        <p class="mt-2 text-slate-600">Subscribe for curated quizzes and quizee tips.</p>
        <form @submit.prevent class="mt-6">
          <label for="homepage-newsletter" class="sr-only">Email address</label>
          <div class="mx-auto max-w-xl grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
            <input id="homepage-newsletter" type="email" placeholder="Your email" class="w-full rounded-xl border px-4 py-2" />
            <button class="w-full sm:w-auto rounded-xl bg-indigo-600 px-4 py-2 text-white">Subscribe</button>
          </div>
        </form>
      </div>
    </section>

  </div>
</template>

<script setup>
import { computed, ref, unref, watch, onMounted } from 'vue'
import Carousel from '~/components/ui/Carousel.vue'
import UiCard from '~/components/ui/UiCard.vue'
import GradeCard from '~/components/ui/GradeCard.vue'
import UiQuizCard from '~/components/ui/QuizCard.vue'
import SubjectCard from '~/components/ui/SubjectCard.vue'
import TopicCard from '~/components/ui/TopicCard.vue'
import ParallaxBanner from '~/components/ui/ParallaxBanner.vue'
import LevelCard from '~/components/ui/LevelCard.vue'
import { useAppAlert } from '~/composables/useAppAlert'
import useTaxonomy from '~/composables/useTaxonomy'

const config = useRuntimeConfig()
// helpers
function safeArray(input) {
  const value = unref(input)

  if (Array.isArray(value)) return value
  if (value == null) return []

  if (Array.isArray(value?.data)) return value.data

  if (typeof value === 'object') {
    if (typeof value.length === 'number') return Array.from(value)
    if (value instanceof Set || value instanceof Map) return Array.from(value)
  }

  return []
}

// tabs
const selectedTab = ref('all')

// data fetches
const { data: quizzesData } = await useFetch(config.public.apiBase + '/api/quizzes?latest=1', { credentials: 'include' })
const latestQuizzes = safeArray(quizzesData?.value?.quizzes?.data || quizzesData?.value?.quizzes || quizzesData?.value).slice(0, 12)
const featuredQuiz = latestQuizzes.length ? latestQuizzes[0] : null

const { fetchGrades, fetchAllSubjects, fetchAllTopics, fetchLevels, grades: taxGrades, subjects: taxSubjects, topics: taxTopics, levels } = useTaxonomy()
const topicsList = taxTopics

const { data: quizMastersData } = await useFetch(config.public.apiBase + '/api/quiz-masters', { credentials: 'include' })
const featuredQuizMasters = safeArray(
  quizMastersData?.value?.['quiz-masters']?.data ||
  quizMastersData?.value?.['quiz-masters'] ||
  quizMastersData?.value?.data ||
  quizMastersData?.value
).slice(0, 4)

const { data: testimonialsData } = await useFetch(config.public.apiBase + '/api/testimonials', { credentials: 'include' })
const testimonials = testimonialsData?.value?.testimonials?.data || testimonialsData?.value?.testimonials || testimonialsData?.value || []

const { data: sponsorsData } = await useFetch(config.public.apiBase + '/api/sponsors', { credentials: 'include' })
const sponsors = sponsorsData?.value?.sponsors?.data || sponsorsData?.value?.sponsors || sponsorsData?.value || []

const SUBJECTS = computed(() => Array.isArray(taxSubjects.value) ? taxSubjects.value : [])
const GRADES = computed(() => Array.isArray(taxGrades.value) ? taxGrades.value : [])
const GRADES_BY_ID = computed(() => {
  const map = new Map()
  for (const grade of Array.isArray(GRADES.value) ? GRADES.value : []) {
    if (!grade) continue
    const id = grade.id ?? grade.grade_id ?? grade.value ?? grade
    if (id != null) {
      map.set(String(id), grade)
    }
  }
  return map
})

const displayedQuizzes = computed(() => {
  if (selectedTab.value === 'featured' && featuredQuiz) {
    const rest = latestQuizzes.filter(q => q.id !== (featuredQuiz?.id ?? null))
    return [featuredQuiz, ...rest]
  }
  if (selectedTab.value === 'new') {
    return latestQuizzes
      .slice()
      .sort((a, b) => new Date(b.created_at || b.published_at || 0) - new Date(a.created_at || a.published_at || 0))
  }
  if (selectedTab.value === 'top') {
    return latestQuizzes.slice().sort((a, b) => {
      const aPop = a.attempts || a.attempt_count || a.play_count || a.plays || 0
      const bPop = b.attempts || b.attempt_count || b.play_count || b.plays || 0
      if (bPop !== aPop) return bPop - aPop
      return (b.difficulty || 0) - (a.difficulty || 0)
    })
  }
  return latestQuizzes
})

// Homepage topic filters (dropdowns)
const homeTopicGrade = ref(null)
const homeTopicSubject = ref(null)

const homeFilteredTopics = computed(() => {
  let list = safeArray(topicsList)
  if (homeTopicGrade && homeTopicGrade.value) {
    list = list.filter(t => {
      // try topic.grade, topic.grades, topic.subject.grade_id
      if (t.grade) return String(t.grade.id || t.grade) === String(homeTopicGrade.value)
      if (Array.isArray(t.grades) && t.grades.length) return t.grades.some(g => String(g.id || g) === String(homeTopicGrade.value))
      if (t.subject_id) {
        const subj = SUBJECTS.find(s => String(s.id) === String(t.subject_id))
        if (subj) {
          if (subj.grade_id) return String(subj.grade_id) === String(homeTopicGrade.value)
          if (subj.grade) return String(subj.grade.id || subj.grade) === String(homeTopicGrade.value)
        }
      }
      return false
    })
  }
  if (homeTopicSubject && homeTopicSubject.value) {
    list = list.filter(t => String(t.subject_id || t.subject?.id || t.subject) === String(homeTopicSubject.value))
  }
  return list
})

const selectedHomepageTopics = computed(() => {
  return safeArray(homeFilteredTopics.value).slice(0, 4)
})

function pickPaletteClass(id){
  const palettes = ['bg-gradient-to-br from-indigo-200 via-indigo-100 to-sky-100 text-indigo-800','bg-gradient-to-br from-rose-200 via-rose-100 to-pink-100 text-rose-800','bg-gradient-to-br from-emerald-200 via-emerald-100 to-lime-100 text-emerald-800','bg-gradient-to-br from-yellow-200 via-amber-100 to-amber-50 text-amber-800','bg-gradient-to-br from-fuchsia-200 via-fuchsia-100 to-pink-50 text-fuchsia-800','bg-gradient-to-br from-sky-200 via-sky-100 to-indigo-50 text-sky-800']
  return palettes[(id||0)%palettes.length]
}

onMounted(async () => {
  await Promise.all([fetchGrades(), fetchAllSubjects(), fetchAllTopics(), fetchLevels()])
})

// Return a human-friendly grade label for a topic (from topic.grade, topic.grades, or its subject)
function getTopicGradeLabel(topic) {
  if (!topic) return 'Multi-grade'
  if (topic.grade) return topic.grade.name || topic.grade.title || topic.grade.label || topic.grade.id || String(topic.grade)
  if (Array.isArray(topic.grades) && topic.grades.length) {
    const firstGrade = topic.grades.find(g => g?.name || g?.title || g?.label || g?.id)
    if (firstGrade) return firstGrade.name || firstGrade.title || firstGrade.label || firstGrade.id || String(firstGrade)
  }
  // try infer from linked subject
  try {
    const subj = topic.subject || SUBJECTS.find(s => String(s.id) === String(topic.subject_id))
    if (subj) {
      if (subj.grade) return subj.grade.name || subj.grade.title || subj.grade.label || subj.grade.id || String(subj.grade)
      if (Array.isArray(subj.grades) && subj.grades.length) {
        const firstSubjGrade = subj.grades.find(g => g?.name || g?.title || g?.label || g?.id)
        if (firstSubjGrade) return firstSubjGrade.name || firstSubjGrade.title || firstSubjGrade.label || firstSubjGrade.id || String(firstSubjGrade)
      }
      if (subj.grade_id != null) {
        const gradeFromMap = GRADES_BY_ID.value.get(String(subj.grade_id))
        if (gradeFromMap) return gradeFromMap.name || gradeFromMap.title || gradeFromMap.label || gradeFromMap.id || String(gradeFromMap)
        return String(subj.grade_id)
      }
    }
  } catch (e) {
    // ignore, fall back below
  }
  return 'Multi-grade'
}

function getTopicSubjectLabel(topic) {
  if (!topic) return 'Unknown subject'
  if (topic.subject) return topic.subject.name || topic.subject.title || topic.subject.label || topic.subject.slug || String(topic.subject)
  if (topic.subject_name) return topic.subject_name
  if (topic.subject_id != null) {
    const subj = SUBJECTS.find(s => String(s.id) === String(topic.subject_id))
    if (subj) {
      return subj.name || subj.title || subj.label || subj.slug || String(subj.id)
    }
  }
  return 'Unknown subject'
}

// Homepage should show quizzes across grades by default. Keep grade selector available but start unfiltered.
const selectedGrade = ref(null)

const filteredSubjects = computed(()=>{
  if (!selectedGrade || !selectedGrade.value) return SUBJECTS
  return SUBJECTS.filter(s=>{
    if (s.grade_id) return String(s.grade_id) === String(selectedGrade.value)
    if (s.grade) return String(s.grade.id || s.grade) === String(selectedGrade.value)
    if (s.grades && Array.isArray(s.grades)) return s.grades.some(g => String(g.id || g) === String(selectedGrade.value))
    return true
  })
})

const hasFeaturedQuiz = computed(() => {
  const quiz = featuredQuiz
  if (!quiz) return false
  return Boolean(quiz.id || quiz.title || quiz.topic_name)
})

const howItWorksSteps = computed(() => [
  {
    number: '01',
    title: 'Choose your path',
    description: 'Browse curated subjects and quizzes that fit your grade level and goals.',
    badge: 'bg-gradient-to-br from-indigo-500 to-sky-500',
    glow: 'bg-sky-400/60',
    icon: 'i-heroicons-map-16-solid',
    link: { href: '/grades', label: 'Explore grades' },
  },
  {
    number: '02',
    title: 'Practice with purpose',
    description: 'Engage with adaptive questions, hints, and timers to build confidence.',
    badge: 'bg-gradient-to-br from-rose-500 to-fuchsia-500',
    glow: 'bg-rose-400/60',
    icon: 'i-heroicons-academic-cap-16-solid',
    link: { href: '/quizzes', label: 'Find a quiz' },
  },
  {
    number: '03',
    title: 'Review instant feedback',
    description: 'See detailed explanations, strengths, and areas to retry instantly.',
    badge: 'bg-gradient-to-br from-emerald-500 to-lime-500',
    glow: 'bg-emerald-400/60',
    icon: 'i-heroicons-chart-bar-16-solid',
    link: { href: '/quizee/dashboard', label: 'Track performance' },
  },
  {
    number: '04',
    title: 'Celebrate progress',
    description: 'Unlock achievements, track streaks, and stay motivated as you master topics.',
    badge: 'bg-gradient-to-br from-amber-500 to-orange-500',
    glow: 'bg-amber-400/60',
    icon: 'i-heroicons-sparkles-20-solid',
    link: { href: '/quizee/badges', label: 'View achievements' },
  },
])

const displayedQuizzesByGrade = computed(() => {
  if (!selectedGrade || !selectedGrade.value) return safeArray(displayedQuizzes.value)
  const gradeId = String(selectedGrade.value)
  return safeArray(displayedQuizzes.value).filter(quiz => filterQuizByGrade(quiz, gradeId))
})

function filterQuizByGrade(quiz, gradeId) {
  const candidate = quiz || {}
  if (!gradeId) return true

  // direct quiz grade
  if (candidate.grade_id) return String(candidate.grade_id) === gradeId
  if (candidate.grade) return String(candidate.grade.id || candidate.grade) === gradeId
  if (Array.isArray(candidate.grades) && candidate.grades.length) {
    if (candidate.grades.some(g => String(g?.id ?? g) === gradeId)) return true
  }

  // try to infer from topic -> subject relationship
  try {
    const topic = candidate.topic || {}
    let subj = topic.subject || null
    if (!subj && topic.subject_id) {
      subj = SUBJECTS.find(s => String(s.id) === String(topic.subject_id)) || null
    }
    if (subj) {
      if (subj.grade_id) return String(subj.grade_id) === gradeId
      if (subj.grade) return String(subj.grade.id || subj.grade) === gradeId
      if (Array.isArray(subj.grades) && subj.grades.length) {
        if (subj.grades.some(g => String(g?.id ?? g) === gradeId)) return true
      }
    }
  } catch (e) {
    // if we encounter any shape we didn't expect, include the quiz instead of hiding it
    return true
  }

  // If we cannot reliably determine grade for this quiz, include it so users still see available quizzes
  return true
}
function onQuizLike(quiz, payload) {
  try {
    if (!quiz) return
    if (payload && payload.liked === true) {
      quiz.likes_count = (quiz.likes_count || quiz.likes || 0) + 1
      quiz.liked = true
    } else if (payload && payload.liked === false) {
      quiz.likes_count = Math.max(0, (quiz.likes_count || quiz.likes || 0) - 1)
      quiz.liked = false
    }
  } catch (e) {
    // fail silently
  }
}

// Login state and handler
import { useAuthStore } from '~/stores/auth'

const email = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)
const error = ref(null)
const router = useRouter()
const auth = useAuthStore()
const alert = useAppAlert()

// clear inline error when user starts typing
watch([email, password], () => { error.value = null })

async function login(){
  if (loading.value) return
  loading.value = true
  try{
    const res = await auth.login(email.value, password.value)
    const user = res.data?.user || res.data || null

    // Honor a `next` query param where present, but only if it's a local path
    // and matches the user's role area (same logic as pages/login.vue).
    const route = useRoute()
    const nextParam = route.query?.next
    const isLocalPath = typeof nextParam === 'string' && nextParam.startsWith('/') && !nextParam.startsWith('//')
    if (isLocalPath) {
      if (nextParam === '/') { router.push(nextParam); return }

      const role = user?.role
      if (role === 'quiz-master' && nextParam.startsWith('/quiz-master')) { router.push(nextParam); return }
      if (role === 'quizee' && nextParam.startsWith('/quizee')) { router.push(nextParam); return }
      // don't honor `next` for other roles (admin etc.)
    }

    if (user?.role === 'quiz-master') router.push('/quiz-master/dashboard')
    else if (user?.role === 'quizee') router.push('/quizee/dashboard')
    else if (user?.role === 'admin') window.location.href = `${config.public.apiBase}/admin`
    else router.push('/grades')
  }catch(e){
    console.error('Login failed', e)
    const msg = e?.response?.data?.message || e?.message || 'Login failed. Please check your credentials and try again.'
    try { alert.push({ message: msg, type: 'error', icon: 'heroicons:exclamation-circle' }) } catch (err) {}
    // keep inline error null since we show toasts
    error.value = null
  }
  finally{ loading.value = false }
}

</script>

<style scoped>
/* keep existing small utilities copied from original file */
@keyframes blob{0%,100%{transform:translate(0,0) scale(1);}25%{transform:translate(20px,-30px) scale(1.1);}50%{transform:translate(-20px,20px) scale(0.9);}75%{transform:translate(20px,30px) scale(0.95);}}
.animate-blob{animation:blob 10s infinite}
.animation-delay-2000{animation-delay:2s}
.animation-delay-4000{animation-delay:4s}
.blur-3xl{--tw-blur: blur(64px);filter:var(--tw-blur)}
</style>
