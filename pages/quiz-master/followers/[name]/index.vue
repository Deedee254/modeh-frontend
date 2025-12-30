<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Mobile back button -->
    <div class="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
      <div class="px-4 py-3 md:px-6">
        <NuxtLink 
          to="/quiz-master/followers" 
          class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <Icon name="heroicons:chevron-left" class="h-4 w-4" />
          <span class="hidden xs:inline">Back to Quizees</span>
          <span class="inline xs:hidden">Back</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Main content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading state -->
      <div v-if="pending" class="flex items-center justify-center min-h-[400px] md:min-h-[500px]">
        <div class="text-center">
          <Icon name="heroicons:spinner" class="h-12 w-12 animate-spin text-slate-400 mx-auto mb-4" />
          <p class="text-slate-500">Loading profile...</p>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="flex items-center justify-center min-h-[400px] md:min-h-[500px]">
        <div class="text-center">
          <Icon name="heroicons:exclamation-circle" class="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p class="text-red-600 font-medium mb-2">Unable to load profile</p>
          <p class="text-slate-500 text-sm mb-4">{{ error }}</p>
          <NuxtLink 
            to="/quiz-master/followers"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
          >
            Return to Quizees
          </NuxtLink>
        </div>
      </div>

      <!-- Profile content -->
      <div v-else-if="quizee" class="space-y-4 md:space-y-6">
        <!-- Profile card -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200/50 overflow-hidden">
          <!-- Header background -->
          <div class="h-20 md:h-32 bg-gradient-to-r from-emerald-600/10 via-brand-600/10 to-sky-600/10"></div>

          <!-- Profile content -->
          <div class="px-4 md:px-6 pb-6 md:pb-8">
            <!-- Avatar section -->
            <div class="flex flex-col xs:flex-row gap-4 md:gap-6 -mt-8 md:-mt-16 relative z-10">
              <div class="flex-shrink-0">
                <div class="relative h-20 w-20 md:h-32 md:w-32 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                  <img 
                    v-if="resolvedAvatar" 
                    :src="resolvedAvatar" 
                    :alt="quizee.name" 
                    class="h-full w-full object-cover"
                  >
                  <div 
                    v-else 
                    class="h-full w-full bg-gradient-to-br from-emerald-400 to-brand-600 flex items-center justify-center text-white"
                  >
                    <span class="text-2xl md:text-4xl font-bold">
                      {{ (quizee.name || '').charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Name and info -->
              <div class="flex-1 flex flex-col justify-end pb-2">
                <h1 class="text-2xl md:text-3xl font-bold text-slate-900">
                  {{ quizee.name }}
                </h1>
                <p class="text-sm md:text-base text-slate-600 mt-1 truncate">
                  {{ quizee.email }}
                </p>
              </div>
            </div>

            <!-- Stats section -->
            <div v-if="stats" class="mt-6 md:mt-8 grid grid-cols-3 gap-3 md:gap-4">
              <div class="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg p-3 md:p-4 text-center border border-emerald-200/50">
                <div class="text-xl md:text-2xl font-bold text-emerald-700">
                  {{ stats.points || 0 }}
                </div>
                <p class="text-xs md:text-sm text-emerald-600 mt-1">Points</p>
              </div>
              <div class="bg-gradient-to-br from-brand-50 to-brand-100/50 rounded-lg p-3 md:p-4 text-center border border-brand-200/50">
                <div class="text-xl md:text-2xl font-bold text-brand-700">
                  {{ stats.streak || 0 }}
                </div>
                <p class="text-xs md:text-sm text-brand-600 mt-1">Streak</p>
              </div>
              <div class="bg-gradient-to-br from-sky-50 to-sky-100/50 rounded-lg p-3 md:p-4 text-center border border-sky-200/50">
                <div class="text-xl md:text-2xl font-bold text-sky-700">
                  {{ stats.quizzesAttempted || 0 }}
                </div>
                <p class="text-xs md:text-sm text-sky-600 mt-1">Quizzes</p>
              </div>
            </div>

            <!-- Grade and Subjects -->
            <div class="mt-6 md:mt-8 space-y-4 md:space-y-5">
              <div v-if="quizee.grade" class="space-y-2">
                <p class="text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wide">Grade</p>
                <div class="inline-flex items-center px-3 md:px-4 py-2 md:py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm md:text-base font-medium text-slate-900">
                  {{ quizee.grade.name }}
                </div>
              </div>

              <div v-if="quizee.subjects && quizee.subjects.length" class="space-y-2">
                <p class="text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wide">Subjects</p>
                <div class="flex flex-wrap gap-2 md:gap-2.5">
                  <span 
                    v-for="subject in quizee.subjects" 
                    :key="subject.id || subject.name"
                    class="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 bg-brand-50 border border-brand-200 text-xs md:text-sm font-medium text-brand-700 rounded-lg"
                  >
                    {{ subject.name }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Bio -->
            <div v-if="quizee.bio" class="mt-6 md:mt-8 space-y-2">
              <p class="text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wide">About</p>
              <p class="text-sm md:text-base text-slate-700 leading-relaxed">
                {{ quizee.bio }}
              </p>
            </div>

            <!-- Actions -->
            <div class="mt-6 md:mt-8 flex flex-col xs:flex-row gap-3">
              <button 
                @click="openChatModal"
                class="flex-1 px-4 py-2.5 md:py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition text-sm md:text-base"
              >
                Message
              </button>
              <NuxtLink 
                :to="`/quizee/leaderboard?search=${encodeURIComponent(quizee.name)}`"
                class="flex-1 px-4 py-2.5 md:py-3 bg-white border border-slate-200 text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition text-sm md:text-base text-center"
              >
                View on Leaderboard
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Additional info section -->
        <div v-if="quizee.institution" class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
          <p class="text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2 md:mb-3">Institution</p>
          <p class="text-sm md:text-base text-slate-700">
            {{ quizee.institution }}
          </p>
        </div>
      </div>
    </div>

    <!-- Chat Modal -->
    <ChatModal
      :is-open="chatModalOpen"
      :recipient-id="quizee?.id"
      :recipient-name="quizee?.name || 'User'"
      :recipient-avatar="resolvedAvatar || '/logo/avatar-placeholder.png'"
      :recipient-greeting="`Hi there! Feel free to send me a message about quizzes or anything else.`"
      @close="chatModalOpen = false"
      @message-sent="onMessageSent"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resolveAssetUrl } from '~/composables/useAssets'
const router = useRouter()

// Extract the name from the route parameter
const quizeeName = computed(() => decodeURIComponent(route.params.name as string))

// Chat modal state
const chatModalOpen = ref(false)
const alert = useAppAlert()

// Use the composable to manage quizee profile state
const {
  profile: quizee,
  loading: pending,
  error,
  stats,
  fetchQuizeeProfile
} = useQuizeeProfile(quizeeName)

// Computed avatar resolution
const resolvedAvatar = computed(() => {
  if (!quizee.value) return null
  const avatarUrl = quizee.value.avatar_url || quizee.value.avatar
  return resolveAssetUrl(avatarUrl) || (avatarUrl || null)
})

// Open chat modal
function openChatModal() {
  chatModalOpen.value = true
}

// Handle message sent
function onMessageSent(messageData: any) {
  alert.push({
    type: 'success',
    message: 'Message sent successfully!'
  })
  // Optionally, emit event to update chat widget or other components
  if ((window as any).__messageSent) {
    (window as any).__messageSent(messageData)
  }
}

// Set page meta with proper SEO
useHead({
  title: () => quizee.value?.name ? `${quizee.value.name}'s Profile` : 'Quizee Profile',
  meta: [
    {
      name: 'description',
      content: () => quizee.value 
        ? `View the profile of ${quizee.value.name}. Points: ${stats.value.points}, Quizzes: ${stats.value.quizzesAttempted}`
        : 'Quizee profile'
    },
    {
      property: 'og:title',
      content: () => quizee.value?.name ? `${quizee.value.name}'s Profile` : 'Quizee Profile'
    },
    {
      property: 'og:description',
      content: () => quizee.value?.bio || 'View this quizee\'s profile and achievements'
    }
  ]
})

// Load profile data when component mounts
await fetchQuizeeProfile()
</script>

<style scoped>
/* Smooth transitions */
:deep(.spinner) {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
