<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto p-6 max-w-4xl">
      <div class="my-8">
        <NuxtLink to="/quizee/quiz-masters" class="text-indigo-600 hover:underline">
          &larr; Back to all quiz-masters
        </NuxtLink>
      </div>

      <div v-if="pending" class="text-center text-gray-500">
        Loading quiz-master profile...
      </div>
      <div v-else-if="error" class="text-center text-red-500">
        Failed to load profile. The quiz-master may not exist or there was a server error.
      </div>
      <div v-else-if="quizMaster" class="bg-white rounded-2xl shadow-lg p-8">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-8">
          <div class="flex-shrink-0">
            <div class="w-40 h-40 rounded-full overflow-hidden ring-4 ring-indigo-100">
              <img v-if="quizMaster.avatar" :src="quizMaster.avatar" :alt="quizMaster.name" class="w-full h-full object-cover">
              <div v-else class="w-full h-full bg-indigo-100 text-indigo-700 grid place-items-center font-bold text-6xl">
                {{ (quizMaster.name || '').charAt(0).toUpperCase() }}
              </div>
            </div>
          </div>
          <div class="flex-1 text-center sm:text-left">
            <h1 class="text-3xl font-bold text-gray-900">{{ quizMaster.name }}</h1>
            <p class="text-lg text-gray-600 mt-1">{{ quizMaster.headline || 'Experienced quiz-master' }}</p>

            <div class="mt-4 flex items-center gap-3">
              <div v-if="quizMaster.subjects && quizMaster.subjects.length" class="flex flex-wrap gap-2">
                <span v-for="subject in quizMaster.subjects" :key="subject.id" class="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full">
                  {{ subject.name }}
                </span>
              </div>
              <div>
                <button @click="followHandler" :disabled="loadingFollow" class="ml-3 px-4 py-2 rounded-lg border text-sm" :class="following ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'">
                  <span v-if="following">Following</span>
                  <span v-else>Follow</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 border-t border-gray-200 pt-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">About Me</h2>
          <div v-if="quizMaster.bio" class="prose max-w-none text-gray-700" v-html="quizMaster.bio"></div>
          <p v-else class="text-gray-500">
            This quiz-master has not yet provided a bio.
          </p>
        </div>
        
        <div v-if="quizMaster.quizzes && quizMaster.quizzes.length" class="mt-8 border-t border-gray-200 pt-8">
           <h2 class="text-xl font-semibold text-gray-800 mb-4">Quizzes by {{ quizMaster.name }}</h2>
           <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <UCard v-for="quiz in quizMaster.quizzes" :key="quiz.id">
                <h3 class="font-semibold text-gray-800">{{ quiz.title }}</h3>
                <p class="text-sm text-gray-500 mt-1">{{ quiz.topic_name || 'General' }}</p>
                <div class="mt-3">
                  <NuxtLink :to="`/quizee/quizzes/${quiz.id}`" class="text-indigo-600 font-medium text-sm hover:underline">
                    View Quiz
                  </NuxtLink>
                </div>
             </UCard>
           </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'quizee' })

// Dynamic SEO for quiz-master profile
const qmTitle = computed(() => {
  try { return quizMaster?.value?.name ? `${quizMaster.value.name} — Quiz Master | Modeh` : 'Quiz Master — Modeh' } catch (e) { return 'Quiz Master — Modeh' }
})
const qmDescription = computed(() => {
  try { return (quizMaster?.value?.headline || quizMaster?.value?.bio || `Profile of ${quizMaster?.value?.name || 'Quiz Master'} on Modeh`) } catch (e) { return 'Quiz Master profile on Modeh' }
})

useHead(() => ({
  title: qmTitle.value,
  meta: [
    { name: 'description', content: qmDescription.value },
    { property: 'og:title', content: qmTitle.value },
    { property: 'og:description', content: qmDescription.value },
    { property: 'og:image', content: quizMaster?.value?.avatar || '/social-share.png' }
  ]
}))

const route = useRoute()
const config = useRuntimeConfig()
const quizMasterId = route.params.id

const { data: quizMasterData, pending, error } = await useAsyncData(
  `quiz-master-${quizMasterId}`,
  () => $fetch(config.public.apiBase + `/api/quiz-masters/${quizMasterId}`)
)

const quizMaster = computed(() => {
    if (!quizMasterData.value) return null
    // API might return quiz-master object nested under a 'data' key
    return quizMasterData.value.data || quizMasterData.value
})

import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'

const auth = useAuthStore()
const router = useRouter()
const following = ref(false)
const loadingFollow = ref(false)
const api = useApi()
const alert = useAppAlert()

// initialize following based on returned payload (if API includes) - defensive
if (quizMasterData.value && (quizMasterData.value.data?.is_following || quizMasterData.value.is_following)) {
  following.value = !!(quizMasterData.value.data?.is_following || quizMasterData.value.is_following)
}

async function followHandler() {
  if (!auth.user) return router.push('/login')
  const id = quizMasterId
  const current = following.value
  following.value = !current
  loadingFollow.value = true
  try {
    let res
    if (!current) res = await api.postJson(`/api/quiz-masters/${id}/follow`, {})
    else res = await api.postJson(`/api/quiz-masters/${id}/unfollow`, {})
    if (api.handleAuthStatus(res)) return
    if (!res.ok) {
      following.value = current
      alert.push({ message: 'Failed to follow/unfollow. Please try again.', type: 'error' })
    }
  } catch (err) {
    following.value = current
    console.error('Follow failed', err)
  } finally {
    loadingFollow.value = false
  }
}
</script>
