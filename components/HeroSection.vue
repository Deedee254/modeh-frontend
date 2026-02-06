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
        :style="{ background: 'linear-gradient(to right, rgba(137,31,33,0.65) 0%, rgba(137,31,33,0.65) 100%)' }"
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
            <span>Join Millions Testing Their Knowledge</span>
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
                Test your knowledge in
                <span class="bg-gradient-to-r from-brand-500 to-brand-600/70 bg-clip-text text-transparent"> {{ userGradeName }} </span>
              </template>
              <template v-else>
                Welcome back — keep testing your knowledge
              </template>
            </h1>

            <h1
              v-else
              class="text-3xl font-extrabold leading-tight tracking-tight text-white opacity-0 animate-fade-in sm:text-4xl lg:text-5xl xl:text-6xl"
              style="animation-delay: 0.2s"
            >
              Test Your Knowledge in
              <span class="bg-gradient-to-r from-brand-500 to-brand-600/70 bg-clip-text text-transparent">
                All Subjects
              </span>
            </h1>

            <p
              class="max-w-lg text-base leading-relaxed text-slate-300 opacity-0 animate-fade-in sm:text-lg"
              style="animation-delay: 0.3s"
            >
              <template v-if="isLoggedIn">
                Challenge yourself with engaging quizzes and expand your mind across all subjects.
              </template>
              <template v-else>
                Challenge your mind with adaptive quizzes that help you expand knowledge across science, history, languages, and beyond. Get instant feedback and grow.
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
              Start Testing Knowledge
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
                <template v-for="i in 4" :key="i">
                  <div class="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                    <img :src="`https://i.pravatar.cc/100?img=${i + 5}`" alt="User" class="w-full h-full object-cover" />
                  </div>
                </template>
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

        <!-- RIGHT SIDE: Leaderboard Podium -->
        <div
          class="relative w-full max-w-full overflow-hidden opacity-0 animate-slide-in-right order-2 lg:pl-8"
          style="animation-delay: 0.3s"
        >
          <div class="bg-white/80 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
            <div class="mb-6">
              <h3 class="text-2xl font-bold text-slate-900 mb-2">Hall of Fame</h3>
              <p class="text-slate-600">Can you beat these leaders? Take the quizzes and claim your spot</p>
            </div>
            <Podium
              v-if="!leaderboardLoading && leaderboardEntries.length > 0"
              :entries="leaderboardEntries"
              :points-key="'points'"
            />
            <div v-else-if="leaderboardLoading" class="py-12 text-center">
              <div class="inline-block">
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-brand-200 border-t-brand-600"></div>
              </div>
            </div>
            <div v-else class="py-12 text-center text-slate-500">
              <p>Loading top performers...</p>
            </div>
            <!-- CTA Button -->
            <div class="mt-8 pt-6 border-t border-slate-200">
              <NuxtLink
                to="/quizzes"
                class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-3 font-semibold text-white hover:shadow-lg hover:shadow-brand-600/50 transition-all transform hover:scale-105 group"
              >
                <Icon name="heroicons:rocket-launch-20-solid" class="h-5 w-5" />
                Test Yourself
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRuntimeConfig } from '#app'
import { useAuthStore } from '~/stores/auth'
import Podium from '~/components/leaderboard/Podium.vue'

const authStore = useAuthStore()

// Leaderboard state
const leaderboardEntries = ref<any[]>([])
const leaderboardLoading = ref(true)

// Fetch leaderboard on mount
onMounted(async () => {
  try {
    const config = useRuntimeConfig()
    const response = await fetch(`${config.public.apiBase}/api/leaderboard?per_page=3`)
    if (response.ok) {
      const data = await response.json()
      leaderboardEntries.value = Array.isArray(data.data) ? data.data : []
    }
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error)
    leaderboardEntries.value = []
  } finally {
    leaderboardLoading.value = false
  }
})

// Normalize user profile access similar to other pages
const userProfile = computed(() => {
  const u = authStore.user
  return (u && typeof u === 'object' && 'value' in u) ? u.value : (u || {})
})

const userGradeName = computed(() => {
  const up: any = userProfile.value || {}
  return up?.profile?.grade?.name || up?.grade_name || up?.grade?.name || null
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
  return Boolean(up.profile) && up.role === 'quiz-master'
})
const isInstitutionManager = computed(() => {
  const up: any = userProfile.value || {}
  const hasInstitutions = Array.isArray(up.institutions) && up.institutions.length > 0
  return hasInstitutions || (userRole.value === 'institution-manager' || userRole.value === 'institution_manager')
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
  { icon: 'heroicons:sparkles-20-solid', text: 'Engaging quizzes across all subjects' },
  { icon: 'heroicons:trophy-20-solid', text: 'Instant feedback & explanations' },
  { icon: 'heroicons:users-20-solid', text: 'Join millions expanding their minds' },
  { icon: 'heroicons:bolt-20-solid', text: 'Test knowledge anytime, anywhere' },
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
      '🧠 Quizees: Test your knowledge and expand your mind across all subjects.',
      '💡 Quiz Masters: Create engaging quizzes people love learning from.',
      '📊 Institutions: Engage learners with data-driven assessments and track progress.'
    ],
    heroHeadings: () => [
      'Expand Your Knowledge Daily',
      'Build Engaging Learning Experiences',
      'Revolutionize Learner Engagement'
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
