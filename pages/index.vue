<template>
  <div>
    <!-- Hero -->
    <section class="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-slate-900">
      <!-- Background Image with Overlay -->
      <div class="absolute inset-0 z-0 w-full h-full">
        <div class="absolute inset-0 bg-gradient-to-r from-slate-900/75 via-slate-900/65 to-slate-900/75 z-10"></div>
        <img 
          src="/hero-banner.jpg" 
          alt="Learning background" 
          class="w-full h-full object-cover"
        />
      </div>

      <div class="relative z-20 w-full px-4 sm:px-6 py-20 flex items-center justify-center">
        <div class="w-full max-w-7xl mx-auto">
          <!-- Authenticated: Welcome section -->
          <template v-if="auth.user">
              <div class="text-center max-w-3xl mx-auto px-4">
                <h1 class="text-5xl sm:text-6xl font-bold text-white mb-2">Welcome back, {{ auth.user.name }}! 👋</h1>
              <div class="h-20 flex items-center justify-center">
                <p class="text-xl sm:text-2xl text-brand-100 font-semibold transition-all duration-700">
                  {{ rotatingMessages[currentMessageIndex] }}
                </p>
              </div>
              
              <div class="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                <!-- Quizee Dashboard -->
                <template v-if="auth.user.role === 'quizee'">
                  <NuxtLink to="/quizee/dashboard" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-950 px-8 py-3 font-semibold text-white hover:shadow-lg hover:shadow-brand-600/50 transition-all transform hover:scale-105">
                    <Icon name="heroicons:chart-bar-20-solid" class="h-5 w-5" />
                    Dashboard
                  </NuxtLink>
                  <NuxtLink to="/quizzes" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white bg-white/10 backdrop-blur-sm px-8 py-3 font-semibold text-white hover:bg-white/20 transition-all transform hover:scale-105">
                    <Icon name="heroicons:sparkles-20-solid" class="h-5 w-5" />
                    Explore Quizzes
                  </NuxtLink>
                </template>

                <!-- Quiz Master Dashboard -->
                <template v-else-if="auth.user.role === 'quiz-master'">
                  <NuxtLink to="/quiz-master/dashboard" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-950 px-8 py-3 font-semibold text-white hover:shadow-lg hover:shadow-brand-600/50 transition-all transform hover:scale-105">
                    <Icon name="heroicons:chart-bar-20-solid" class="h-5 w-5" />
                    Dashboard
                  </NuxtLink>
                  <NuxtLink to="/quiz-master/create-quiz" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white bg-white/10 backdrop-blur-sm px-8 py-3 font-semibold text-white hover:bg-white/20 transition-all transform hover:scale-105">
                    <Icon name="heroicons:pencil-square-20-solid" class="h-5 w-5" />
                    Create Quiz
                  </NuxtLink>
                </template>

                <!-- Default Dashboard for other roles -->
                <template v-else>
                  <NuxtLink to="/quizee/dashboard" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-950 px-8 py-3 font-semibold text-white hover:shadow-lg hover:shadow-brand-600/50 transition-all transform hover:scale-105">
                    <Icon name="heroicons:chart-bar-20-solid" class="h-5 w-5" />
                    Dashboard
                  </NuxtLink>
                  <NuxtLink to="/quizzes" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white bg-white/10 backdrop-blur-sm px-8 py-3 font-semibold text-white hover:bg-white/20 transition-all transform hover:scale-105">
                    <Icon name="heroicons:sparkles-20-solid" class="h-5 w-5" />
                    Explore
                  </NuxtLink>
                </template>
              </div>
            </div>
          </template>

          <!-- Not Authenticated: Featured quizzes and CTA -->
          <template v-else>
            <div class="text-center max-w-4xl mx-auto">
              <div class="h-32 flex items-center justify-center">
                <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold text-white transition-all duration-700">
                  {{ heroHeadings[currentMessageIndex] }}
                </h1>
              </div>
              <div class="h-24 flex items-center justify-center">
                <p class="text-lg sm:text-xl text-brand-100 font-medium transition-all duration-700">
                  {{ rotatingMessages[currentMessageIndex] }}
                </p>
              </div>
              
              <div class="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                <NuxtLink to="/quizzes" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white bg-white/10 backdrop-blur-sm px-8 py-3 font-semibold text-white hover:bg-white/20 transition-all transform hover:scale-105">
                  <Icon name="heroicons:squares-2x2-20-solid" class="h-5 w-5" />
                  Explore Quizzes
                </NuxtLink>
                <NuxtLink to="/register" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-950 px-8 py-3 font-semibold text-white hover:shadow-lg hover:shadow-brand-600/50 transition-all transform hover:scale-105">
                  <Icon name="heroicons:arrow-right-20-solid" class="h-5 w-5" />
                  Create Account
                </NuxtLink>
              </div>
              
              <div class="mt-8 text-sm text-brand-100">
                Already have an account? Sign in using the <span class="font-semibold">Login</span> button in the header.
              </div>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- Page Content Wrapper -->
    <div class="px-4 sm:px-6 lg:px-8 py-8">
    <!-- How It Works -->
    <section class="relative mt-16">
      <div class="mx-auto max-w-6xl">
        <div class="text-center">
          <p class="text-sm font-semibold tracking-wide text-brand-600 uppercase">How it works</p>
          <h2 class="mt-3 text-3xl font-bold text-slate-900">Start learning in four simple steps</h2>
          <p class="mt-3 text-base text-slate-600">A learning workflow designed for clarity and steady progress — pick a learning path, practice with targeted quizzes, review instant feedback, and track improvement over time.</p>
        </div>

        <!-- Mobile Timeline (vertical) -->
        <div class="mt-14 md:hidden">
          <div class="relative space-y-8">
            <div class="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-600 via-accent-500 to-brand-950"></div>
            <div v-for="(step, index) in howItWorksSteps" :key="step.number" class="relative pl-24 animate-fade-in" :style="{ '--animation-delay': `${index * 0.15}s` }">
              <div class="absolute left-0 top-2 h-16 w-16 flex items-center justify-center rounded-full border-4 border-white bg-gradient-to-br" :class="step.badge">
                <UIcon :name="step.icon" class="text-white text-xl" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900">{{ step.title }}</h3>
                <p class="mt-2 text-sm text-slate-600">{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop Grid (4 columns) -->
        <div class="mt-14 hidden md:grid grid-cols-2 gap-8 lg:grid-cols-4">
          <div v-for="(step, index) in howItWorksSteps" :key="step.number" class="text-center animate-fade-in" :style="{ '--animation-delay': `${index * 0.1}s` }">
            <div class="relative mx-auto h-16 w-16 flex items-center justify-center rounded-2xl transition-transform duration-300 hover:scale-110" :class="step.badge">
              <span class="absolute inset-0.5 rounded-2xl" :class="step.glow"></span>
              <UIcon :name="step.icon" class="relative text-white text-2xl" />
            </div>
            <h3 class="mt-5 text-lg font-semibold text-slate-900">{{ step.title }}</h3>
            <p class="mt-2 text-sm text-slate-600">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Quizzes section -->
    <section class="py-10">
      <div class="mx-auto max-w-6xl">
        <header class="text-center max-w-2xl mx-auto">
          <h2 class="text-3xl font-bold text-slate-900">Featured Quizzes</h2>
          <p class="mt-3 text-slate-600">Explore quizzes curated by our community. Find new challenges, top-rated content, and featured picks to test your knowledge.</p>
        </header>

        <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div class="flex items-center gap-2 rounded-full border p-1">
            <button @click="selectedTab = 'all'" :class="selectedTab === 'all' ? 'bg-brand-600 text-white' : 'text-slate-600'" class="px-4 py-1.5 text-sm font-semibold rounded-full">All</button>
            <button @click="selectedTab = 'new'" :class="selectedTab === 'new' ? 'bg-brand-600 text-white' : 'text-slate-600'" class="px-4 py-1.5 text-sm font-semibold rounded-full">New</button>
            <button @click="selectedTab = 'top'" :class="selectedTab === 'top' ? 'bg-brand-600 text-white' : 'text-slate-600'" class="px-4 py-1.5 text-sm font-semibold rounded-full">Top</button>
            <button @click="selectedTab = 'featured'" :class="selectedTab === 'featured' ? 'bg-brand-600 text-white' : 'text-slate-600'" class="px-4 py-1.5 text-sm font-semibold rounded-full">Featured</button>
          </div>
        </div>

        <div class="mt-10">
          <div v-if="safeArray(displayedQuizzesByGrade).length" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <UiQuizCard v-for="quiz in safeArray(displayedQuizzesByGrade).slice(0,8)" :key="quiz.id" :to="`/quizee/quizzes/${quiz.id || ''}`" :startLink="`/quizee/quizzes/${quiz.id || ''}`" :takeLink="`/quizee/quizzes/take/${quiz.id || ''}`" :title="quiz.title" :topic="quiz.topic?.name || quiz.topic_name" :subject="quiz.topic?.subject?.name || quiz.subject?.name || quiz.subject_name" :grade="quiz.grade || quiz.grade_id" :questions-count="quiz.questions_count ?? quiz.questions ?? quiz.items_count" :cover="quiz.cover_image || quiz.cover" :palette="pickPaletteClass(quiz.topic?.id || quiz.id)" :likes="quiz.likes_count ?? quiz.likes ?? 0" :quiz-id="quiz.id" :liked="quiz.liked" :description="quiz.description || quiz.summary || ''" @like="onQuizLike(quiz, $event)" />
          </div>
          <div v-else class="text-center text-rose-700/70 text-sm">No quizzes yet for this filter. Check back soon.</div>
        </div>

        <div class="mt-8 text-center">
          <NuxtLink to="/quizzes" class="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 bg-brand-600/10 text-brand-600 rounded-lg hover:bg-brand-600/20 transition-colors">Show all quizzes</NuxtLink>
        </div>
      </div>
    </section>

    <section class="py-10">
      <div class="mx-auto max-w-6xl">
          <header class="text-center max-w-2xl mx-auto">
          <div class="text-sm uppercase tracking-wide text-brand-600 font-semibold">Subjects</div>
          <h3 class="mt-2 text-3xl font-bold text-slate-900">Subjects & learning paths</h3>
          <p class="mt-3 text-slate-600">Explore subject tracks with aligned quizzes and topic roadmaps to guide learning and progression.</p>
        </header>

<div class="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SubjectCard
            v-for="subject in randomSubjects"
            :key="subject.id"
            :subject="subject"
            :to="`/subjects/${subject.slug || subject.id}`"
            :title="subject.name"
            :subtitle="`Grades ${ Array.isArray(subject.grades) ? subject.grades.map(g => g.name || g.id).join(', ') : subject.grade?.name || subject.grade_id || 'All' }`"
            :image="subject.image"
            :badgeText="(subject.name || '').charAt(0).toUpperCase()"
            :topicsCount="subject.topics_count || subject.topics?.length || 0"
            :quizzes_count="subject.quizzes_count || subject.count || 0"
            :description="subject.description || subject.summary || ''"
            :grade="subject.grade?.name || subject.grade_id || ''"
            startLabel="Explore Topics"
            class="group"
          />
        </div>
        <div class="mt-6 text-center">
          <NuxtLink to="/subjects" class="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 bg-brand-600/10 text-brand-600 rounded-lg hover:bg-brand-600/20 transition-colors">Show all subjects</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Levels section -->
    <section class="py-10">
      <div class="mx-auto max-w-6xl">
        <header class="text-center max-w-2xl mx-auto">
          <div class="text-sm uppercase tracking-wide text-brand-600 font-semibold">Levels</div>
          <h3 class="mt-2 text-3xl font-bold text-slate-900">Learning levels</h3>
          <p class="mt-3 text-slate-600">Navigate content organized by learning level — Early Years, Primary, Secondary, and Tertiary — to find age-appropriate material and pathways.</p>
        </header>

        <!-- Carousel for all screen sizes -->
        <ClientOnly>
          <div class="mt-10">
            <Carousel :items="safeArray(levels)" :perViewXs="2" :perViewSm="2" :perViewMd="4" :perViewLg="5" :perView="6" :auto="false">
              <template #item="{ item }">
                <div class="px-1 sm:px-2">
                  <LevelCard
                    :to="`/levels/${item.id}`"
                    :title="item.name"
                    :level="item"
                    :subtitle="item.description || ''"
                    :grades_count="(Array.isArray(item.grades) ? item.grades.length : 0)"
                    :actionLink="`/levels/${item.id}`"
                    actionLabel="Explore level"
                  />
                </div>
              </template>
            </Carousel>
          </div>
        </ClientOnly>

        <div class="mt-6 text-center">
          <NuxtLink to="/levels" class="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 bg-brand-600/10 text-brand-600 rounded-lg hover:bg-brand-600/20 transition-colors">View all levels</NuxtLink>
        </div>
      </div>
    </section>

    <section class="py-12 bg-gradient-to-br from-white to-brand-600/10">
      <div class="mx-auto max-w-6xl">
        <header class="text-center max-w-2xl mx-auto">
          <div class="text-sm uppercase tracking-wide text-brand-600 font-semibold">Grades</div>
          <h3 class="mt-2 text-3xl font-bold text-slate-900">Grades</h3>
          <p class="mt-3 text-slate-600">Find quizzes and resources organized by grade so learners and educators can match content to curriculum standards.</p>
        </header>

<div class="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

    <section class="py-10">
      <div class="mx-auto max-w-6xl">
        <div class="text-center max-w-2xl mx-auto">
          <div class="text-sm uppercase tracking-wide text-rose-500 font-semibold">Topics</div>
          <h3 class="mt-2 text-3xl font-bold text-slate-900">Topics & contextual quizzes</h3>
          <p class="mt-3 text-slate-600">Dive into topics with rich context — linked subjects, quiz counts, and summaries to help you pick focused practice areas.</p>
        </div>

        <div class="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 auto-rows-max">
          <div v-for="(topic, index) in randomTopics" :key="topic.id" class="animate-fade-in" :style="{ '--animation-delay': `${index * 0.1}s` }">
            <TopicCard
              :topic="topic"
              :to="`/topics/${topic.id}`"
              :title="topic.name"
              :image="topic.image || topic.cover_image || ''"
              :grade="getTopicGradeLabel(topic)"
              :subject="getTopicSubjectLabel(topic)"
              :quizzesCount="topic.quizzes_count || topic.quizzes?.length || 0"
              :description="topic.description || topic.summary || ''"
              startLabel="View Quizzes"
              class="h-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
            />
          </div>
        </div>
        <div class="mt-6 text-center">
          <NuxtLink to="/topics" class="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 bg-brand-600/10 text-brand-600 rounded-lg hover:bg-brand-600/20 transition-colors">Show all topics</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Tertiary Courses Section -->
    <section class="py-10 bg-gradient-to-br from-brand-600/10 to-brand-950/10">
      <div class="mx-auto max-w-6xl">
        <div class="text-center max-w-2xl mx-auto">
          <div class="text-sm uppercase tracking-wide text-purple-500 font-semibold">Tertiary Level</div>
          <h3 class="mt-2 text-3xl font-bold text-slate-900">Courses & higher education</h3>
          <p class="mt-3 text-slate-600">Explore university and tertiary-level courses with specialized content, advanced topics, and professional assessments.</p>
        </div>

        <div class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 auto-rows-max">
          <div v-for="(course, index) in randomCourses" :key="course.id" class="animate-fade-in" :style="{ '--animation-delay': `${index * 0.1}s` }">
            <GradeCard
              :grade="course"
              :to="`/courses/${course.id}`"
              :title="course.name"
              :description="course.description || course.summary || ''"
              :quizzes_count="course.quizzes_count || 0"
              :actionLink="`/courses/${course.id}`"
              :actionLabel="'Explore Course'"
              class="h-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02] compact-view"
            />
          </div>
        </div>
        <div class="mt-6 text-center">
          <NuxtLink to="/courses" class="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 bg-brand-600/10 text-brand-600 rounded-lg hover:bg-brand-600/20 transition-colors">Show all courses</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Quiz Masters -->
    <section class="py-10">
      <div class="mx-auto max-w-6xl">
        <div class="text-center max-w-2xl mx-auto">
          <div class="text-sm uppercase tracking-wide text-brand-600 font-semibold">Creators</div>
          <h3 class="mt-2 text-3xl font-bold text-slate-900">Creators & contributors</h3>
          <p class="mt-3 text-slate-600">Educators and contributors who create, review, and curate quizzes to ensure quality and alignment with learning goals.</p>
        </div>
  <!-- Mobile: carousel; Desktop: grid -->
  <client-only>
    <div class="sm:hidden">
      <Carousel :items="safeArray(featuredQuizMasters.slice(0,4))" :perViewSm="1" :perViewMd="2" :perViewLg="3" :auto="false">
        <template #item="{ item }">
          <div class="p-2">
            <QuizMasterCard :quizMaster="item" />
          </div>
        </template>
      </Carousel>
    </div>
  </client-only>

  <div class="mt-8 hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6">
    <QuizMasterCard v-for="qm in featuredQuizMasters.slice(0,4)" :key="qm.id" :quizMaster="qm" class="group" />
  </div>
        <div class="mt-6 text-center">
          <NuxtLink to="/quiz-masters" class="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 bg-brand-600/10 text-brand-600 rounded-lg hover:bg-brand-600/20 transition-colors">View all quiz-masters</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Redesigned Call to Action Section -->
    <section class="my-12">
      <div class="mx-auto max-w-6xl">
        <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-brand-950 px-6 py-16 sm:px-12 sm:py-20">
          <div class="relative text-center">
            <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Ready to Start Your Learning Journey?
            </h2>
            <p class="mx-auto mt-4 max-w-2xl text-lg text-white/90">
              Join thousands of learners and creators. Sign up for free to access quizzes, track your progress, and achieve your goals.
            </p>
            <NuxtLink to="/register" class="mt-8 inline-flex w-full items-center justify-center rounded-xl border border-transparent bg-white px-6 py-3 text-base font-semibold text-brand-600 shadow-sm transition hover:bg-white/90 sm:w-auto">Get Started for Free</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="py-8 bg-gradient-to-br from-brand-600/10 to-white">
      <div class="mx-auto max-w-6xl">
  <h3 class="text-2xl font-bold text-brand-900 mb-4 text-center">Success Stories</h3>
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
                  <div class="h-12 w-12 rounded-full bg-brand-600/10 grid place-items-center text-brand-600 font-semibold">{{ (item.name || 'A').charAt(0) }}</div>
                  <div>
                    <div class="font-semibold text-gray-900">{{ item.name || 'Anonymous' }}</div>
                    <div class="text-sm text-brand-600">{{ item.role || 'User' }}</div>
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
    <section class="py-8">
      <div class="mx-auto max-w-6xl">
        <client-only>
        <Carousel :items="safeArray(sponsors)" :perView="5" :perViewSm="3" :perViewXs="2" auto>
          <template #item="{ item }">
            <div class="px-6 py-4">
              <div class="relative h-40 flex items-center justify-center">
                <img :src="item.logo || '/default-logo.png'" :alt="item.name || 'Sponsor'" class="h-28 sm:h-24 md:h-28 object-contain grayscale max-w-full" />
              </div>
            </div>
          </template>
  </Carousel>
  </client-only>
      </div>
    </section>

    <!-- Newsletter CTA (solid color background) -->
    <section class="py-12 bg-brand-600 text-white">
      <div class="mx-auto max-w-4xl text-center px-4">
        <h3 class="text-2xl font-bold">Get weekly learning insights</h3>
        <p class="mt-2 text-white/90">Receive curated quizzes, practical tips, and insights to keep your practice focused and effective.</p>
        <form @submit.prevent class="mt-6">
          <label for="homepage-newsletter" class="sr-only">Email address</label>
          <div class="mx-auto max-w-xl grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
            <input id="homepage-newsletter" type="email" placeholder="Your email" class="w-full rounded-xl border border-transparent px-4 py-3 bg-white text-slate-900 placeholder-slate-400" />
            <button class="w-full sm:w-auto rounded-xl bg-accent-500 text-slate-900 px-6 py-3 font-semibold hover:bg-accent-600 transition">Subscribe</button>
          </div>
        </form>
      </div>
    </section>
    </div>
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
import QuizMasterCard from '~/components/ui/QuizMasterCard.vue'

import useTaxonomy from '~/composables/useTaxonomy'
import useApi from '~/composables/useApi'

const config = useRuntimeConfig()
const api = useApi()

// Page SEO: title, description and social preview tags
definePageMeta({
  title: 'Modeh — Practice, assess, and master curriculum skills',
  meta: [
    { name: 'description', content: 'Modeh helps learners build real mastery with short, curriculum-aligned quizzes, instant feedback, and progress tracking.' },
    { name: 'keywords', content: 'quizzes, learning, practice, curriculum, assessment, topics, grades' },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'Modeh — Practice, assess, and master curriculum skills' },
    { property: 'og:description', content: 'Modeh helps learners build real mastery with short, curriculum-aligned quizzes, instant feedback, and progress tracking.' },
    { property: 'og:image', content: '/social-share.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Modeh — Practice, assess, and master curriculum skills' },
    { name: 'twitter:description', content: 'Modeh helps learners build real mastery with short, curriculum-aligned quizzes, instant feedback, and progress tracking.' }
  ]
})

// Rotating messages for hero section
const currentMessageIndex = ref(0)
const rotatingMessages = [
  '🎓 Quizees: Practice, get instant feedback, and master skills at your pace.',
  '✍️ Quiz Masters: Create impactful quizzes, earn rewards, and build your teaching legacy.',
  '🏫 Institutions: Track student progress, align curriculum, and transform learning outcomes.'
]
const heroHeadings = [
  'Master Skills with Focused Practice',
  'Create & Earn as a Quiz Master',
  'Transform Education for Your Institution'
]

// Auto-rotate messages every 8 seconds
onMounted(() => {
  setInterval(() => {
    currentMessageIndex.value = (currentMessageIndex.value + 1) % rotatingMessages.length
  }, 8000)
})

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

// data fetches - non-blocking
// All data fetching is now async and won't block hero section rendering
let quizzesData = null
let quizMastersData = null
let testimonialsData = null
let sponsorsData = null

// Initialize with empty arrays - will be populated by async fetches
const latestQuizzes = ref([])
const featuredQuiz = ref(null)
const featuredQuizMasters = ref([])
const testimonials = ref([])
const sponsors = ref([])

// Fetch data asynchronously without blocking
const loadDynamicData = async () => {
  try {
    // Fetch in parallel for better performance
    const [quizzesRes, quizMastersRes, testimonialsRes, sponsorsRes] = await Promise.all([
      api.get('/api/quizzes?latest=1'),
      api.get('/api/quiz-masters'),
      api.get('/api/testimonials'),
      api.get('/api/sponsors')
    ])

    // Process quizzes
    if (quizzesRes.ok) {
      quizzesData = await quizzesRes.json()
      latestQuizzes.value = safeArray(quizzesData?.quizzes?.data || quizzesData?.quizzes || quizzesData).slice(0, 12)
      featuredQuiz.value = latestQuizzes.value.length ? latestQuizzes.value[0] : null
    }

    // Process quiz masters
    if (quizMastersRes.ok) {
      quizMastersData = await quizMastersRes.json()
      featuredQuizMasters.value = safeArray(
        quizMastersData?.['quiz-masters']?.data ||
        quizMastersData?.['quiz-masters'] ||
        quizMastersData?.data ||
        quizMastersData
      ).slice(0, 4)
    }

    // Process testimonials
    if (testimonialsRes.ok) {
      testimonialsData = await testimonialsRes.json()
      testimonials.value = testimonialsData?.testimonials?.data || testimonialsData?.testimonials || testimonialsData || []
    }

    // Process sponsors
    if (sponsorsRes.ok) {
      sponsorsData = await sponsorsRes.json()
      sponsors.value = sponsorsData?.sponsors?.data || sponsorsData?.sponsors || sponsorsData || []
    }
  } catch (error) {
    console.error('Error loading dynamic data:', error)
  }
}

// data fetches - blocking only for critical SEO data
const { fetchGrades, fetchAllSubjects, fetchAllTopics, fetchLevels, grades: taxGrades, subjects: taxSubjects, topics: taxTopics, levels } = useTaxonomy()
const topicsList = taxTopics

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

function pickPaletteClass(id){
  const palettes = ['bg-gradient-to-br from-brand-600/30 via-brand-600/20 to-brand-950/10 text-brand-600','bg-gradient-to-br from-rose-200 via-rose-100 to-pink-100 text-rose-800','bg-gradient-to-br from-emerald-200 via-emerald-100 to-lime-100 text-emerald-800','bg-gradient-to-br from-yellow-200 via-amber-100 to-amber-50 text-amber-800','bg-gradient-to-br from-fuchsia-200 via-fuchsia-100 to-pink-50 text-fuchsia-800','bg-gradient-to-br from-brand-600/20 via-brand-600/15 to-brand-950/10 text-brand-600']
  return palettes[(id||0)%palettes.length]
}

onMounted(() => {
  // Do CSRF prefetch first
  api.ensureCsrf().catch(() => {})

  // Then fetch other data in parallel
  Promise.all([
    fetchGrades(),
    fetchAllSubjects(),
    fetchAllTopics(),
    fetchLevels(),
    loadDynamicData()  // Load quizzes, quiz masters, testimonials, sponsors asynchronously
  ]).catch(() => {})
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

// Helper function to shuffle and pick random items
function getRandomItems(arr, count = 4) {
  const items = safeArray(arr).filter(item => item && item.id)
  if (items.length === 0) return []
  
  // Shuffle using Fisher-Yates algorithm
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

// Random subjects (different for every user/visit)
const randomSubjects = computed(() => {
  return getRandomItems(SUBJECTS, 4)
})

// Random topics (different for every user/visit)
const randomTopics = computed(() => {
  return getRandomItems(topicsList, 4)
})

// Random courses (tertiary level grades with type='course')
const randomCourses = computed(() => {
  const courses = safeArray(GRADES).filter(g => g && String(g.type || '').toLowerCase() === 'course')
  return getRandomItems(courses, 4)
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
    badge: 'bg-gradient-to-br from-brand-600 to-brand-950',
    glow: 'bg-sky-400/60',
    icon: 'heroicons:map-20-solid',
    link: { href: '/grades', label: 'Explore grades' },
  },
  {
    number: '02',
    title: 'Practice with purpose',
    description: 'Engage with adaptive questions, hints, and timers to build confidence.',
    badge: 'bg-gradient-to-br from-rose-500 to-fuchsia-500',
    glow: 'bg-rose-400/60',
    icon: 'heroicons:academic-cap-20-solid',
    link: { href: '/quizzes', label: 'Find a quiz' },
  },
  {
    number: '03',
    title: 'Review instant feedback',
    description: 'See detailed explanations, strengths, and areas to retry instantly.',
    badge: 'bg-gradient-to-br from-emerald-500 to-lime-500',
    glow: 'bg-emerald-400/60',
    icon: 'heroicons:chart-bar-20-solid',
    link: { href: '/quizee/dashboard', label: 'Track performance' },
  },
  {
    number: '04',
    title: 'Celebrate progress',
    description: 'Unlock achievements, track streaks, and stay motivated as you master topics.',
    badge: 'bg-gradient-to-br from-amber-500 to-orange-500',
    glow: 'bg-amber-400/60',
    icon: 'heroicons:sparkles-20-solid',
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

// Auth store for template checks
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()

// SEO: Structured Data (Schema.org)
const siteUrl = config.public.siteUrl || 'https://modeh.com'
const siteName = 'Modeh'
const logoUrl = `${siteUrl}/logo.png`

useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            'url': siteUrl,
            'name': siteName,
            'potentialAction': {
              '@type': 'SearchAction',
              'target': `${siteUrl}/quizzes?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@type': 'Organization',
            'url': siteUrl,
            'name': siteName,
            'logo': logoUrl,
          },
          {
            '@type': 'FAQPage',
            'mainEntity': howItWorksSteps.value.map(step => ({
              '@type': 'Question',
              'name': step.title,
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': step.description,
              },
            })),
          },
        ],
      }),
    },
  ],
  link: [
    {
      rel: 'canonical',
      href: siteUrl,
    },
  ],
})

</script>

<style scoped>
@keyframes blob{0%,100%{transform:translate(0,0) scale(1);}25%{transform:translate(20px,-30px) scale(1.1);}50%{transform:translate(-20px,20px) scale(0.9);}75%{transform:translate(20px,30px) scale(0.95);}}
.animate-blob{animation:blob 10s infinite}
.animation-delay-2000{animation-delay:2s}
.animation-delay-4000{animation-delay:4s}
.blur-3xl{--tw-blur: blur(64px);filter:var(--tw-blur)}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeInUp 0.6s ease-out forwards;
  animation-delay: var(--animation-delay, 0s);
  opacity: 0;
}
</style>
