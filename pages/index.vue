<template>
  <div>
      <HeroSection
      :current-message-index="currentMessageIndex"
      :rotating-messages="rotatingMessages"
      :hero-headings="heroHeadings"
        :featured-quizzes="latestQuizzes"
        :loading="quizzesLoading"
    />


    <!-- Page Content Wrapper -->
    <div class="bg-gray-50">
    <!-- How It Works & Quick Play -->
    <section class="relative py-24 bg-white overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        <div class="absolute -top-24 -left-24 w-96 h-96 bg-[#800020]/5 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-[#800020]/5 rounded-full blur-3xl"></div>
      </div>

      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start">
           
           <!-- Left Column: Steps -->
           <div class="flex flex-col h-full">
              <div class="mb-8">
                <span class="inline-block py-1 px-3 rounded-full bg-[#800020]/10 text-[#800020] text-sm font-bold tracking-wide uppercase mb-4">
                  Simple Process
                </span>
                <h2 class="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
                  How It Works
                </h2>
                <p class="text-base text-slate-600 leading-relaxed">
                  A streamlined workflow designed for steady progress.
                </p>
              </div>

              <div class="space-y-8 relative sm:pl-8 border-l-2 border-slate-100 sm:ml-4 flex-1">
                 <div v-for="(step, index) in howItWorksSteps" :key="step.number" class="relative sm:pl-8 group">
                    <!-- Dot -->
                    <div class="absolute sm:-left-[45px] -left-5 top-1 sm:top-0 w-8 h-8 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center group-hover:border-[#800020]/30 transition-colors flex-shrink-0">
                       <div class="w-2.5 h-2.5 rounded-full bg-[#800020]"></div>
                    </div>

                    <div class="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 group-hover:shadow-md transition-all">
                       <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#800020]/10 flex items-center justify-center text-[#800020] flex-shrink-0">
                             <UIcon :name="step.icon" class="text-lg sm:text-xl" />
                          </div>
                          <div class="min-w-0">
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Step {{ step.number }}</span>
                            <h3 class="text-base sm:text-lg font-bold text-slate-900">{{ step.title }}</h3>
                          </div>
                       </div>
                       <p class="text-slate-600 text-sm">{{ step.description }}</p>
                    </div>
                 </div>
              </div>
           </div>

           <!-- Right Column: Interactive Guest Play -->
           <div class="relative lg:sticky lg:top-24">
              <!-- Right Side Header -->
              <div class="mb-8 md:pl-4">
                 <span class="inline-block py-1 px-3 rounded-full bg-brand-50 text-brand-600 text-sm font-bold tracking-wide uppercase mb-4">
                    Try It Now
                 </span>
                 <h2 class="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
                    Start Learning Instantly
                 </h2>
                 <p class="text-base text-slate-600 leading-relaxed">
                    No account needed. Jump straight into a battle.
                 </p>
              </div>

              <!-- Decorative Blob -->
              <div class="absolute inset-0 bg-gradient-to-tr from-[#800020]/5 to-brand-50 rounded-3xl transform rotate-3 scale-105 -z-10 top-24"></div>
              
              <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden h-[600px] relative z-10">
                 <HomeGuestQuickPlay />
              </div>

              <!-- Trust Badge -->
              <div class="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
                 <UIcon name="heroicons:shield-check" class="text-green-500" />
                 <span>No sign-up required to try</span>
              </div>
           </div>
        </div>
      </div>
    </section>

    <!-- Quizzes section (componentized) -->
    <QuizzesSection
      :quizzes="safeArray(displayedQuizzesByGrade)"
      v-model:selectedTab="selectedTab"
      :pick-palette-class="pickPaletteClass"
      :on-quiz-like="onQuizLike"
      :loading="quizzesLoading"
    />

  <!-- Levels section  -->
  <CategorizedQuizzes :levels="safeArray(levels)" :loading="quizzesLoading" />

  <!--  CategoryBanner: Grades and Courses section -->
  <CategoryBanner :grades="safeArray(GRADES)" :courses="safeArray(randomCourses)" />

    <!-- Show quizzes for a few random subjects (reuse CategorizedQuizzes component) -->
  <CategorizedQuizzes :levels="randomSubjects" :loading="quizzesLoading" type="subject" :columns="4" title="Subject quizzes" subtitle="Try quizzes from these subjects" bg-class="bg-white" />

    <!-- Learn/Create/Manage CTAs (shown only to unauthenticated users) -->
    <LearnCreateManagePills />

    <!-- Show quizzes for a few random topics (reuse CategorizedQuizzes component) -->
    <CategorizedQuizzes :levels="randomTopics" :loading="quizzesLoading" type="topic" :columns="4" title="Topic quizzes" subtitle="Practice quizzes tied to these topics" />

    

    <!-- Tournaments Section -->
    <TournamentSection />

    <!-- Quiz Masters -->
    <section class="py-12">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto">
          <div class="text-sm uppercase tracking-wide text-brand-600 font-semibold">Creators</div>
          <h3 class="mt-2 text-3xl font-bold text-slate-900">Creators & contributors</h3>
          <p class="mt-3 text-slate-600">Quiz Masters and contributors who create, review, and curate quizzes to ensure quality and alignment with learning goals.</p>
        </div>
  <!-- Mobile: carousel; Desktop: grid -->
  <ClientOnly>
    <div class="sm:hidden">
      <Carousel :items="safeArray(featuredQuizMasters.slice(0,4))" :perViewSm="1" :perViewMd="2" :perViewLg="3" :auto="false">
        <template #item="{ item }">
          <div class="p-2">
            <QuizMasterCard :quizMaster="item" />
          </div>
        </template>
      </Carousel>
    </div>

    <div class="mt-8 hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6">
      <QuizMasterCard v-for="qm in featuredQuizMasters.slice(0,4)" :key="qm.id" :quizMaster="qm" class="group" />
    </div>
  </ClientOnly>
        <div class="mt-6 text-center">
          <NuxtLink to="/quiz-masters" class="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 bg-brand-600/10 text-brand-600 rounded-lg hover:bg-brand-600/20 transition-colors">View all quiz-masters</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Redesigned Call to Action Section -->
    <section class="py-12">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-brand-950 px-6 py-16 sm:px-12 sm:py-20">
          <div class="relative text-center">
            <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Ready to Start Your Learning Journey?
            </h2>
            <p class="mx-auto mt-4 max-w-2xl text-lg text-white/90">
              Join thousands of Quizees and creators. Sign up for free to access quizzes, track your progress, and achieve your goals.
            </p>
            <NuxtLink to="/register/quizee" class="mt-8 inline-flex w-full items-center justify-center rounded-xl border border-transparent bg-white px-6 py-3 text-base font-semibold text-brand-600 shadow-sm transition hover:bg-white/90 sm:w-auto">Get Started for Free</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="py-12 bg-gradient-to-br from-brand-600/10 to-white">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <!-- Left: Image -->
          <div class="order-2 lg:order-1">
            <img 
              src="/images/success-stories.png" 
              alt="Success Stories" 
              class="w-full rounded-2xl shadow-lg object-cover aspect-square"
            />
          </div>

          <!-- Right: Testimonials -->
          <div class="order-1 lg:order-2">
            <h3 class="text-3xl font-bold text-brand-900 mb-8">Success Stories</h3>
            <ClientOnly>
              <div class="space-y-6">
                <template v-for="(item, idx) in safeArray(testimonials).slice(0, 3)" :key="idx">
                  <div class="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm hover:shadow-xl transition-shadow">
                    <div class="flex gap-1 mb-4">
                      <template v-for="n in 5" :key="n">
                        <svg class="w-5 h-5" :class="n <= (item.rating || 5) ? 'text-yellow-400' : 'text-gray-200'" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      </template>
                    </div>
                    <blockquote class="text-lg text-gray-700 mb-4">"{{ item.quote || 'Great experience with Modeh!' }}"</blockquote>
                    <div class="flex items-center gap-3">
                      <div class="h-12 w-12 rounded-full bg-brand-600/10 grid place-items-center text-brand-600 font-semibold flex-shrink-0">{{ (item.name || 'A').charAt(0) }}</div>
                      <div>
                        <div class="font-semibold text-gray-900">{{ item.name || 'Anonymous' }}</div>
                        <div class="text-sm text-brand-600">{{ item.role || 'User' }}</div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </ClientOnly>
          </div>
        </div>
      </div>
    </section>

    <!-- Sponsors -->
    <section class="py-12">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ClientOnly>
        <Carousel :items="safeArray(sponsors)" :perView="5" :perViewSm="3" :perViewXs="2" auto>
          <template #item="{ item }">
            <div class="px-6 py-4">
              <div class="relative h-40 flex items-center justify-center">
                <img :src="item.logo || '/default-logo.png'" :alt="item.name || 'Sponsor'" class="h-28 sm:h-24 md:h-28 object-contain grayscale max-w-full" />
              </div>
            </div>
          </template>
  </Carousel>
  </ClientOnly>
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
import CategorizedQuizzes from '~/components/CategorizedQuizzes.vue'
import QuizMasterCard from '~/components/ui/QuizMasterCard.vue'
import HeroSection from '~/components/HeroSection.vue'
import QuizzesSection from '~/components/QuizzesSection.vue'
import CategoryBanner from '~/components/CategoryBanner.vue'
import TournamentSection from '~/components/TournamentSection.vue'

import useTaxonomy from '~/composables/useTaxonomy'
import useApi from '~/composables/useApi'

const config = useRuntimeConfig()
const api = useApi()

// Page SEO: title, description and social preview tags
definePageMeta({
  title: 'Modeh — Practice, assess, and master curriculum skills',
  meta: [
    { name: 'description', content: 'Modeh helps Quizees build real mastery with short, curriculum-aligned quizzes, instant feedback, and progress tracking.' },
    { name: 'keywords', content: 'quizzes, learning, practice, curriculum, assessment, topics, grades' },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'Modeh — Practice, assess, and master curriculum skills' },
    { property: 'og:description', content: 'Modeh helps Quizees build real mastery with short, curriculum-aligned quizzes, instant feedback, and progress tracking.' },
    { property: 'og:image', content: '/social-share.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Modeh — Practice, assess, and master curriculum skills' },
    { name: 'twitter:description', content: 'Modeh helps Quizees build real mastery with short, curriculum-aligned quizzes, instant feedback, and progress tracking.' }
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

// quiz data refs used across the page
const latestQuizzes = ref([])
const featuredQuiz = ref(null)
const featuredQuizMasters = ref([])
let quizzesData = null
let quizMastersData = null
let testimonialsData = null
let sponsorsData = null

// Loading flags
const quizzesLoading = ref(true)

const testimonials = ref([])
const sponsors = ref([])

// Fetch data asynchronously without blocking
// If a user is logged in and has a grade/level we request quizzes filtered to their profile
const loadDynamicData = async () => {
  try {
    // Build the correct quiz endpoint and parameters based on user role
    const role = auth.role
    let endpoint = '/api/quizzes'
    const quizParams = new URLSearchParams()
    
    // Default parameters
    quizParams.set('per_page', '12')

    if (role === 'quizee') {
      // For quizees, use the recommendations endpoint (shows grade-matched, randomized)
      endpoint = '/api/recommendations/quizzes'
      const userProfile = (auth.user && typeof auth.user === 'object' && 'value' in auth.user) ? auth.user.value : (auth.user || {})
      const forGrade = userProfile?.quizeeProfile?.grade_id || userProfile?.grade_id
      if (forGrade) quizParams.set('for_grade', String(forGrade))
    } else if (role === 'quiz-master') {
      // For quiz masters, show THEIR created quizzes (backend filters by created_by automatically)
      endpoint = '/api/quizzes'
    } else {
      // For Institution Manager or Guest (unauthenticated)
      // We use recommendations endpoint for IM to avoid the backend's 'created_by' filter for logged-in users
      endpoint = role === 'institution-manager' ? '/api/recommendations/quizzes' : '/api/quizzes'
      
      const userProfile = (auth.user && typeof auth.user === 'object' && 'value' in auth.user) ? auth.user.value : (auth.user || {})
      const userLevelId = userProfile?.quizeeProfile?.level?.id || userProfile?.level_id
      const userGradeId = userProfile?.quizeeProfile?.grade?.id || userProfile?.grade_id
      
      quizParams.set('approved', '1')
      if (userLevelId) quizParams.set('level_id', String(userLevelId))
      if (userGradeId) {
        // if using rec endpoint, use for_grade; if quizzes endpoint, use grade_id
        const gradeKey = endpoint.includes('recommendations') ? 'for_grade' : 'grade_id'
        quizParams.set(gradeKey, String(userGradeId))
      }
      
      // If no grade/level specified, fall back to latest listing
      if (!userLevelId && !userGradeId) quizParams.set('latest', '1')
    }

    // Fetch in parallel for better performance
    const isGuest = !auth.user
    const fetchFn = isGuest ? api.getPublic : api.get
    
    const [quizzesRes, quizMastersRes, testimonialsRes, sponsorsRes] = await Promise.all([
      fetchFn(`${endpoint}?${quizParams.toString()}`),
      fetchFn('/api/quiz-masters'),
      fetchFn('/api/testimonials'),
      fetchFn('/api/sponsors')
    ])

    // Process quizzes
    if (quizzesRes.ok) {
      quizzesData = await quizzesRes.json()
      latestQuizzes.value = safeArray(quizzesData?.quizzes?.data || quizzesData?.quizzes || quizzesData).slice(0, 12)
      featuredQuiz.value = latestQuizzes.value.length ? latestQuizzes.value[0] : null
    }

    // mark quizzes loading complete (whether ok or empty)
    quizzesLoading.value = false

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
    quizzesLoading.value = false
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
  const quizzesArray = safeArray(latestQuizzes)
  const featured = unref(featuredQuiz)

  if (selectedTab.value === 'featured' && featured) {
    const rest = quizzesArray.filter(q => q.id !== (featured?.id ?? null))
    return [featured, ...rest]
  }

  if (selectedTab.value === 'new') {
    return quizzesArray
      .slice()
      .sort((a, b) => new Date(b.created_at || b.published_at || 0) - new Date(a.created_at || a.published_at || 0))
  }

  if (selectedTab.value === 'top') {
    return quizzesArray.slice().sort((a, b) => {
      const aPop = a.attempts || a.attempt_count || a.play_count || a.plays || 0
      const bPop = b.attempts || b.attempt_count || b.play_count || b.plays || 0
      if (bPop !== aPop) return bPop - aPop
      return (b.difficulty || 0) - (a.difficulty || 0)
    })
  }

  if (selectedTab.value === 'liked') {
    return quizzesArray.slice().sort((a, b) => {
      const aLikes = a.likes_count || 0
      const bLikes = b.likes_count || 0
      return bLikes - aLikes
    })
  }

  return quizzesArray
})

function pickPaletteClass(id){
  const palettes = ['bg-gradient-to-br from-brand-600/30 via-brand-600/20 to-brand-950/10 text-brand-600','bg-gradient-to-br from-rose-200 via-rose-100 to-pink-100 text-rose-800','bg-gradient-to-br from-emerald-200 via-emerald-100 to-lime-100 text-emerald-800','bg-gradient-to-br from-yellow-200 via-amber-100 to-amber-50 text-amber-800','bg-gradient-to-br from-fuchsia-200 via-fuchsia-100 to-pink-50 text-fuchsia-800','bg-gradient-to-br from-brand-600/20 via-brand-600/15 to-brand-950/10 text-brand-600']
  return palettes[(id||0)%palettes.length]
}

onMounted(() => {
  // Fetch data in parallel
  // No CSRF prefetch needed - we use Bearer tokens for authenticated requests
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

// Selected tab for quiz sorting (new | top | liked | featured)
const selectedTab = ref('new')

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
      quiz.likes_count = (quiz.likes_count || 0) + 1
      quiz.liked = true
    } else if (payload && payload.liked === false) {
      quiz.likes_count = Math.max(0, (quiz.likes_count || 0) - 1)
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
