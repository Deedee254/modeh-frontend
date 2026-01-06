<template>
  <section class="relative min-h-screen overflow-hidden bg-slate-950">
    <!-- Background Image with Overlay -->
    <div 
      class="absolute inset-0 bg-cover bg-center bg-no-repeat"
      :style="{ backgroundImage: 'url(/hero-banner.jpg)' }"
    >
      <!-- Left-side dark overlay for readability; fades to transparent on the right
           so the carousel area is clean/visible. Adjust stops if you want a
           wider/smaller transparent area. -->
      <div
        class="absolute inset-0"
        :style="{ background: 'linear-gradient(to right, rgba(2,6,23,0.85) 0%, rgba(2,6,23,0.85) 100%)' }"
      />
    </div>

    <!-- Background decorative blurs -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-brand-600/10 blur-3xl" />
      <div class="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-accent-600/10 blur-3xl" />
      <div class="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-brand-600/10 blur-3xl" />
    </div>

    <!-- Main Content Container -->
    <div class="container relative mx-auto px-4 py-12 lg:py-20">
      <!-- Grid: Left content (42%), Right carousel (58%) -->
      <div class="grid items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16">
  <!-- LEFT SIDE: Value Proposition -->
  <div class="flex flex-col space-y-8 order-1 sm:order-1">
          <!-- Badge -->
          <div
            class="inline-flex w-fit items-center gap-2 rounded-full bg-brand-600/15 px-4 py-2 text-sm font-medium text-brand-300 opacity-0 animate-fade-in"
            style="animation-delay: 0.1s"
          >
            <Icon name="heroicons:sparkles-20-solid" class="h-4 w-4" />
            <span>The #1 Quiz Platform for Quizees</span>
          </div>

          <!-- Role / Grade badge: show Grade for quizees, role badge for others -->
          <div v-if="isQuizee && userGradeName" class="inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-1 text-sm font-semibold text-white/90 opacity-0 animate-fade-in" style="animation-delay: 0.15s">
            <Icon name="heroicons:bookmark-20-solid" class="h-4 w-4 text-white/90" />
            <span>Quizzes for: <span class="ml-1 font-bold">{{ userGradeName }}</span></span>
          </div>

          <div v-else-if="isQuizMaster" class="inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-1 text-sm font-semibold text-white/90 opacity-0 animate-fade-in" style="animation-delay: 0.15s">
            <Icon name="heroicons:academic-cap-20-solid" class="h-4 w-4 text-white/90" />
            <span>Instructor</span>
          </div>

          <div v-else-if="isInstitutionManager" class="inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-1 text-sm font-semibold text-white/90 opacity-0 animate-fade-in" style="animation-delay: 0.15s">
            <Icon name="heroicons:building-20-solid" class="h-4 w-4 text-white/90" />
            <span>Institution Manager</span>
          </div>

          <!-- Headline -->
          <div class="space-y-4">
            <h1
              v-if="isLoggedIn"
              class="text-3xl font-extrabold leading-tight tracking-tight text-white opacity-0 animate-fade-in sm:text-4xl lg:text-5xl xl:text-6xl"
              style="animation-delay: 0.2s"
            >
              <template v-if="userGradeName">
                Practice quizzes for
                <span class="bg-gradient-to-r from-brand-500 to-brand-600/70 bg-clip-text text-transparent"> {{ userGradeName }} </span>
              </template>
              <template v-else>
                Welcome back — continue learning
              </template>
            </h1>

            <h1
              v-else
              class="text-3xl font-extrabold leading-tight tracking-tight text-white opacity-0 animate-fade-in sm:text-4xl lg:text-5xl xl:text-6xl"
              style="animation-delay: 0.2s"
            >
              Master Any Subject
              <span class="bg-gradient-to-r from-brand-500 to-brand-600/70 bg-clip-text text-transparent">
                One Quiz at a Time
              </span>
            </h1>

            <p
              class="max-w-lg text-base leading-relaxed text-slate-300 opacity-0 animate-fade-in sm:text-lg"
              style="animation-delay: 0.3s"
            >
              <template v-if="isLoggedIn">
                Access personalized quizzes, track your progress, and pick up where you left off.
              </template>
              <template v-else>
                Transform your learning experience with interactive quizzes designed
                by experts. Build knowledge, track progress, and achieve your goals.
              </template>
            </p>
          </div>

          <!-- Features List -->
          <div
            class="grid grid-cols-2 gap-4 opacity-0 animate-fade-in"
            style="animation-delay: 0.4s"
          >
            <div
              v-for="(feature, index) in features"
              :key="index"
              class="flex items-center gap-3 text-sm text-slate-300 sm:text-base"
            >
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600/15 text-brand-400">
                <Icon :name="feature.icon" class="h-4 w-4" />
              </div>
              <span>{{ feature.text }}</span>
            </div>
          </div>

          <!-- CTA Buttons -->
          <div
            class="flex flex-col gap-4 opacity-0 animate-fade-in sm:flex-row"
            style="animation-delay: 0.5s"
          >
            <NuxtLink
              v-if="isLoggedIn"
              :to="dashboardLink"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-3 font-semibold text-white hover:shadow-lg hover:shadow-brand-600/50 transition-all transform hover:scale-105 group"
            >
              {{ ctaLabel }}
              <Icon name="heroicons:arrow-right-20-solid" class="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </NuxtLink>

            <NuxtLink
              v-else
              to="/register/quizee"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-3 font-semibold text-white hover:shadow-lg hover:shadow-brand-600/50 transition-all transform hover:scale-105 group"
            >
              Start Learning Free
              <Icon name="heroicons:arrow-right-20-solid" class="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </NuxtLink>

            <NuxtLink
              to="/quizzes"
              class="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white bg-white/10 backdrop-blur-sm px-8 py-3 font-semibold text-white hover:bg-white/20 transition-all transform hover:scale-105"
            >
              <Icon name="heroicons:squares-2x2-20-solid" class="h-5 w-5" />
              Explore Quizzes
            </NuxtLink>
          </div>

          <!-- Social Proof -->
          <div
            class="flex items-center gap-4 opacity-0 animate-fade-in"
            style="animation-delay: 0.6s"
          >
              <div class="flex -space-x-3">
                <!-- Use avatar images from the public folder. Update the `avatars` array below to
                     point to the actual filenames in your public/avatars folder if available. -->
                <img
                  v-for="(a, idx) in avatars"
                  :key="idx"
                  :src="avatarSrc(a)"
                  alt="avatar"
                  class="h-10 w-10 rounded-full border-2 border-white object-cover"
                />
              </div>
              <div class="text-sm">
                <div class="flex items-center gap-1 font-semibold text-white">
                  <Icon name="heroicons:check-circle-20-solid" class="h-4 w-4 text-brand-400" />
                  <span>4.9/5 rating</span>
                </div>
                <p class="text-slate-400">from 10,000+ reviews</p>
              </div>
          </div>
        </div>

        <!-- RIGHT SIDE: Vertical Carousel -->
        <div
          class="relative w-full max-w-full overflow-hidden opacity-0 animate-slide-in-right order-2 lg:pl-8"
          style="animation-delay: 0.3s"
        >
          <QuizCarousel
            :quizzes="featuredQuizzes"
            :duration="35"
            :limit="8"
            :loading="loading"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import QuizCarousel from '~/components/QuizCarousel.vue'

const authStore = useAuthStore()

// Normalize user profile access similar to other pages
const userProfile = computed(() => {
  const u = authStore.user
  return (u && typeof u === 'object' && 'value' in u) ? u.value : (u || {})
})

const userGradeName = computed(() => {
  const up: any = userProfile.value || {}
  return up?.quizeeProfile?.grade?.name || up?.grade_name || up?.grade?.name || null
})

const isLoggedIn = computed(() => {
  // Consider the user logged in if a normalized profile has an id or email
  const up: any = userProfile.value || {}
  return Boolean(up && (up.id || up.email))
})

const userRole = computed(() => {
  // Try common places for role information
  const up: any = userProfile.value || {}
  const r = up.role || up.role_name || null
  return (typeof r === 'string') ? r.toLowerCase() : r
})

// Role helpers
const isQuizMaster = computed(() => {
  const up: any = userProfile.value || {}
  return Boolean(up.quizMasterProfile || up.quiz_master_profile) || (userRole.value && String(userRole.value).includes('quiz'))
})
const isInstitutionManager = computed(() => {
  const up: any = userProfile.value || {}
  const hasInstitutions = Array.isArray(up.institutions) && up.institutions.length > 0
  return hasInstitutions || (userRole.value && String(userRole.value).includes('institution'))
})
const isQuizee = computed(() => {
  return !isQuizMaster.value && !isInstitutionManager.value
})

const dashboardLink = computed(() => {
  // Priority: quiz-master -> institution-manager -> quizee
  try {
    // Quiz master detection
    if (isQuizMaster.value) return '/quiz-master/dashboard'
    if (isInstitutionManager.value) return '/institution-manager/dashboard'
    return '/quizee/dashboard'
  } catch (e) {
    return '/quizee/dashboard'
  }
})

const ctaLabel = computed(() => {
  if (!isLoggedIn.value) return 'Start Learning Free'
  if (isQuizMaster.value) return 'Open Instructor Dashboard'
  if (isInstitutionManager.value) return 'Open Institution Dashboard'
  return 'Go to your dashboard'
})

// Feature items with icons
const features = [
  { icon: 'heroicons:sparkles-20-solid', text: 'Personalized learning paths' },
  { icon: 'heroicons:trophy-20-solid', text: 'Track your progress' },
  { icon: 'heroicons:users-20-solid', text: 'Join 50,000+ Quizees' },
  { icon: 'heroicons:bolt-20-solid', text: 'Instant feedback' },
]

const props = withDefaults(
  defineProps<{
      currentMessageIndex?: number
      rotatingMessages?: string[]
      heroHeadings?: string[]
      featuredQuizzes?: any[]
      carouselDuration?: number
      loading?: boolean
  }>(),
  {
    currentMessageIndex: 0,
    rotatingMessages: () => [
      '🎓 Quizees: Practice, get instant feedback, and master skills at your pace.',
      '✍️ Quiz Masters: Create impactful quizzes, earn rewards, and build your teaching legacy.',
      '🏫 Institutions: Track student progress, align curriculum, and transform learning outcomes.'
    ],
    heroHeadings: () => [
      'Master Skills with Focused Practice',
      'Create & Earn as a Quiz Master',
      'Transform Education for Your Institution'
    ],
    featuredQuizzes: () => [],
    carouselDuration: 25,
    loading: false
  }
)

const currentMessageIndex = computed(() => props.currentMessageIndex)
const rotatingMessages = computed(() => props.rotatingMessages)
const heroHeadings = computed(() => props.heroHeadings)
const featuredQuizzes = computed(() => props.featuredQuizzes)
const carouselDuration = computed(() => props.carouselDuration)
const loading = computed(() => props.loading)

// Avatars for social proof. Update these paths to match files in your public/avatars
// folder. These are relative to the site root (public/). Example: 'avatars/user1.jpg'
const avatars = [
  'logo/avatar-placeholder.png',
  'images/avatar-placeholder.png',
  'logo/avatar-placeholder.png',
  'logo/avatar-placeholder.png'
]

const avatarSrc = (p: string) => {
  if (!p) return '/logo/avatar-placeholder.png'
  // If the path already starts with / use it, otherwise prefix with /
  return p.startsWith('/') ? p : `/${p}`
}
</script>

<style scoped>
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

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-fade-in {
  animation: fadeInUp 0.8s ease-out forwards;
}

.animate-slide-in-right {
  animation: slideInRight 0.8s ease-out forwards;
}
</style>
