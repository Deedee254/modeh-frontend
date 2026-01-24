<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto p-6 max-w-4xl pb-16">
      <div class="my-8">
        <NuxtLink to="/quiz-masters" class="text-brand-600 hover:underline">
          &larr; Back to all quiz-masters
        </NuxtLink>
      </div>

      <div v-if="pending" class="text-center text-gray-500">
        Loading quiz-master profile...
      </div>
      <div v-else-if="error" class="text-center text-red-500">
        Failed to load profile. The quiz-master may not exist or there was a server error.
      </div>
      <div v-else-if="quizMaster" class="">
        <!-- Profile Card - Horizontal on Desktop, Vertical on Mobile -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <!-- Desktop Horizontal Layout -->
          <div class="hidden sm:flex items-stretch">
            <!-- Image Left -->
            <div class="flex-shrink-0 w-48">
              <img v-if="resolvedAvatar" :src="resolvedAvatar" :alt="quizMaster.name" class="w-full h-full object-cover">
              <div v-else class="w-full h-full bg-gradient-to-br from-red-600 to-red-700 text-white grid place-items-center font-bold text-4xl">
                {{ (quizMaster.name || '').charAt(0).toUpperCase() }}
              </div>
            </div>
            <!-- Content Right -->
            <div class="flex-1 p-8 flex flex-col justify-between">
              <div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ quizMaster.name }}</h1>
                <p class="text-lg text-red-700 font-medium mb-2">{{ quizMaster.headline || 'Experienced quiz-master' }}</p>
                <p v-if="quizMaster.institution" class="text-sm text-gray-600 mb-4">{{ quizMaster.institution }}</p>
                
                <div v-if="quizMaster.bio" class="text-sm text-gray-700 mb-4 line-clamp-2">
                  {{ quizMaster.bio }}
                </div>

                <div v-if="quizMaster.subjects && quizMaster.subjects.length" class="flex flex-wrap gap-2">
                  <span v-for="subject in quizMaster.subjects.slice(0, 3)" :key="subject.id" class="bg-red-50 text-red-700 text-xs font-medium px-3 py-1 rounded-full border border-red-200">
                    {{ subject.name }}
                  </span>
                  <span v-if="quizMaster.subjects.length > 3" class="text-xs text-gray-600">+{{ quizMaster.subjects.length - 3 }} more</span>
                </div>
              </div>

              <div class="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button @click="followHandler" :disabled="loadingFollow" class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition">
                  <span v-if="following">Following</span>
                  <span v-else>Follow</span>
                </button>
                <button @click="messageQuizMaster" class="px-4 py-2 rounded-lg border border-red-600 text-red-600 hover:bg-red-50 font-medium text-sm transition">
                  Message
                </button>
              </div>
            </div>
          </div>

          <!-- Mobile Vertical Layout -->
          <div class="sm:hidden p-6">
            <div class="mb-4 flex justify-center">
              <div class="w-40 h-40 rounded-lg overflow-hidden border-2 border-red-600/30">
                <img v-if="resolvedAvatar" :src="resolvedAvatar" :alt="quizMaster.name" class="w-full h-full object-cover">
                <div v-else class="w-full h-full bg-gradient-to-br from-red-600 to-red-700 text-white grid place-items-center font-bold text-4xl">
                  {{ (quizMaster.name || '').charAt(0).toUpperCase() }}
                </div>
              </div>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 text-center mb-1">{{ quizMaster.name }}</h1>
            <p class="text-sm text-red-700 font-medium text-center mb-2">{{ quizMaster.headline || 'Experienced quiz-master' }}</p>
            <p v-if="quizMaster.institution" class="text-xs text-gray-600 text-center mb-4">{{ quizMaster.institution }}</p>
            
            <div v-if="quizMaster.subjects && quizMaster.subjects.length" class="flex justify-center flex-wrap gap-2 mb-4">
              <span v-for="subject in quizMaster.subjects.slice(0, 2)" :key="subject.id" class="bg-red-50 text-red-700 text-xs font-medium px-3 py-1 rounded-full border border-red-200">
                {{ subject.name }}
              </span>
              <span v-if="quizMaster.subjects.length > 2" class="text-xs text-gray-600">+{{ quizMaster.subjects.length - 2 }}</span>
            </div>

            <div v-if="quizMaster.bio" class="text-sm text-gray-700 text-center mb-4">
              {{ quizMaster.bio }}
            </div>

            <div class="flex items-center gap-2 pt-4 border-t border-gray-200">
              <button @click="followHandler" :disabled="loadingFollow" class="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition">
                <span v-if="following">Following</span>
                <span v-else>Follow</span>
              </button>
              <button @click="messageQuizMaster" class="flex-1 px-4 py-2 rounded-lg border border-red-600 text-red-600 hover:bg-red-50 font-medium text-sm transition">
                Message
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="quizMaster.quizzes && quizMaster.quizzes.length" class="mt-8">
           <h2 class="text-2xl font-bold text-gray-900 mb-6">Quizzes by {{ quizMaster.name }}</h2>
           <!-- Desktop Grid -->
           <div class="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-6">
             <QuizCard 
               v-for="quiz in paginatedQuizzes" 
               :key="quiz.id"
               :quiz="quiz"
               :is-horizontal="false"
             />
           </div>
           <!-- Mobile List -->
           <div class="sm:hidden space-y-3">
             <QuizCard 
               v-for="quiz in paginatedQuizzes" 
               :key="quiz.id"
               :quiz="quiz"
               :is-horizontal="true"
             />
           </div>
           
           <!-- Pagination Controls -->
           <div v-if="totalQuizPages > 1" class="mt-8 flex items-center justify-center gap-2">
             <button 
               @click="quizCurrentPage = Math.max(1, quizCurrentPage - 1)"
               :disabled="quizCurrentPage === 1"
               class="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Previous
             </button>
             
             <div class="flex gap-1">
               <button
                 v-for="page in visibleQuizPages"
                 :key="page"
                 @click="quizCurrentPage = page"
                 :class="[
                   'px-3 py-2 rounded-lg font-medium transition',
                   page === quizCurrentPage
                     ? 'bg-red-600 text-white'
                     : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                 ]"
               >
                 {{ page }}
               </button>
             </div>
             
             <button
               @click="quizCurrentPage = Math.min(totalQuizPages, quizCurrentPage + 1)"
               :disabled="quizCurrentPage === totalQuizPages"
               class="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Next
             </button>
           </div>
        </div>

        <div class="mt-8 flex justify-center">
          <button
            class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow"
            @click="messageQuizMaster"
          >
            Message quiz-master
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const quizMasterParam = route.params.slug

// Function to generate slug from text
const generateSlug = (text) => {
  if (!text) return ''
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// Fetch by ID (param could be ID or slug)
const { data: quizMasterData, pending, error } = await useAsyncData(
  `quiz-master-${quizMasterParam}`,
  () => $fetch(config.public.apiBase + `/api/quiz-masters/${quizMasterParam}`)
)

import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'
import QuizCard from '~/components/ui/QuizCard.vue'

// Quiz pagination state
const quizCurrentPage = ref(1)
const quizzesPerPage = 12

const quizMaster = computed(() => {
    if (!quizMasterData.value) return null
    return quizMasterData.value.data || quizMasterData.value
})

// Paginated quizzes computed property
const paginatedQuizzes = computed(() => {
  const quizzes = quizMaster.value?.quizzes || []
  const start = (quizCurrentPage.value - 1) * quizzesPerPage
  const end = start + quizzesPerPage
  return quizzes.slice(start, end)
})

// Total pages computed property
const totalQuizPages = computed(() => {
  const quizzes = quizMaster.value?.quizzes || []
  return Math.ceil(quizzes.length / quizzesPerPage)
})

// Visible page numbers for pagination
const visibleQuizPages = computed(() => {
  const current = quizCurrentPage.value
  const total = totalQuizPages.value
  const maxVisible = 5
  const pages = []
  
  if (total <= maxVisible) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    const half = Math.floor(maxVisible / 2)
    let start = Math.max(1, current - half)
    let end = Math.min(total, start + maxVisible - 1)
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }
    
    for (let i = start; i <= end; i++) pages.push(i)
  }
  
  return pages
})

// Generate slug from quiz master's name
const generatedSlug = computed(() => {
  if (!quizMaster.value) return ''
  return generateSlug(quizMaster.value.name)
})

// Redirect to slug-based URL if needed
watch([quizMaster, generatedSlug], ([qm, slug]) => {
  if (qm && slug && route.params.slug !== slug) {
    // Update URL to use the generated slug instead of ID
    router.replace({ 
      params: { slug: `${slug}-${qm.id}` },
      query: route.query 
    })
  }
}, { immediate: false })

import { resolveAssetUrl } from '~/composables/useAssets'
import { computed as _computed } from 'vue'

const resolvedAvatar = _computed(() => {
  const qm = quizMaster.value
  if (!qm) return null
  const v = qm.avatar_url || qm.avatar || qm.image || qm.photo || qm.profile_image
  return resolveAssetUrl(v) || (v || null)
})

// follow state
const auth = useAuthStore()
const following = ref(false)
const loadingFollow = ref(false)
let followInFlight = false

// derive numeric id after data loads
const quizMasterId = _computed(() => {
  const qm = quizMaster.value
  if (!qm) return route.params.id || null
  return qm.id || qm._id || null
})

// initialize following based on returned payload (if API includes) - defensive
if (quizMasterData.value && (quizMasterData.value.data?.is_following || quizMasterData.value.is_following)) {
  following.value = !!(quizMasterData.value.data?.is_following || quizMasterData.value.is_following)
}

async function followHandler() {
  if (!auth.user) return router.push('/login')
  if (followInFlight) return
  followInFlight = true
  const id = quizMasterId.value
  const current = following.value
  following.value = !current
  loadingFollow.value = true
  try {
    const api = useApi()
    const alert = useAppAlert()
    let res
    if (!current) res = await api.postJson(`/api/quiz-masters/${id}/follow`, {})
    else res = await api.postJson(`/api/quiz-masters/${id}/unfollow`, {})
    if (api.handleAuthStatus(res)) return
    if (!res.ok) {
      following.value = current
      alert.push({ message: 'Failed to follow/unfollow. Try again.', type: 'error' })
    } else {
      // If server returned an updated followers_count, use it
      if (res.followers_count !== undefined && quizMaster.value) {
        quizMaster.value.followers_count = res.followers_count
      }
    }
  } catch (err) {
    following.value = current
    console.error('Follow failed', err)
  } finally {
    loadingFollow.value = false
    followInFlight = false
  }
}

// Attach Echo listener for follow events
if (process.client && typeof window !== 'undefined' && window.Echo) {
  try {
  const ch = window.Echo.private(`quiz-master.${quizMasterId.value}`)
    ch.listen('.App\\Events\\QuizMasterFollowed', (payload) => {
      if (!payload || !payload.quizMaster) return
      const id = payload.quizMaster.id
      if (String(id) !== String(quizMasterId)) return

      // Update followers_count if present
      if (payload.quizMaster.followers_count !== undefined && quizMaster.value) {
        quizMaster.value.followers_count = payload.quizMaster.followers_count
      } else if (quizMaster.value) {
        // fallback increment
        quizMaster.value.followers_count = (quizMaster.value.followers_count || 0) + 1
      }
    })
  } catch (e) {
    // echo attachment error silently
  }
}

// Set head tags for SEO
useHead({
  title: () => quizMaster.value ? quizMaster.value.name : 'quiz-master Profile',
  meta: [
    { name: 'description', content: () => quizMaster.value ? `View the profile of ${quizMaster.value.name}. ${quizMaster.value.headline || ''}` : 'quiz-master profile' }
  ]
})

function messageQuizMaster() {
  // Open chat widget and start DM with this quiz-master
  if (typeof window !== 'undefined') {
    // If DirectMessages is a modal or route, navigate or open it with quiz-master id
    // For this example, redirect to /quizee/chat?user_id={quizMasterId}
    router.push({ path: '/quizee/chat', query: { user_id: quizMasterId } })
  }
}
</script>

<style>
/* Basic prose styles for the bio */
.prose p {
  margin-bottom: 1em;
}
.prose ul, .prose ol {
  margin-left: 1.5em;
  margin-bottom: 1em;
}
.prose li {
  margin-bottom: 0.5em;
}
</style>