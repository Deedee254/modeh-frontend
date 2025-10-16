<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto p-6 max-w-7xl">
      <PageHero
        :breadcrumbs="[{ text: 'Home', href: '/' }, { text: 'Quiz masters', current: true }]"
        title="Our quiz-masters"
        description="Meet our team of dedicated and experienced quiz-masters."
        align="center"
        padding="py-12"
      />

      <div v-if="pending" class="text-center text-gray-500">
        Loading quiz-masters...
      </div>
      <div v-else-if="error" class="text-center text-red-500">
        Failed to load quiz-masters. Please try again later.
      </div>
      <div v-else-if="quizMasters.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <UCard v-for="quizMaster in quizMasters" :key="quizMaster.id" class="hover:shadow-lg transition">
          <div class="flex flex-col items-center text-center">
            <div class="w-24 h-24 rounded-full overflow-hidden mb-4">
              <img v-if="quizMaster.avatar" :src="quizMaster.avatar" :alt="quizMaster.name" class="w-full h-full object-cover">
              <div v-else class="w-full h-full bg-indigo-100 text-indigo-700 grid place-items-center font-bold text-3xl">
                {{ (quizMaster.name || '').charAt(0).toUpperCase() }}
              </div>
            </div>
            <h3 class="font-semibold text-lg text-gray-800">{{ quizMaster.name }}</h3>
            <p class="text-sm text-gray-500">{{ quizMaster.headline || 'Experienced quiz-master' }}</p>
            <div class="mt-4">
              <div class="flex items-center gap-3 justify-center">
                <NuxtLink :to="`/quiz-masters/${quizMaster.id}`" class="text-indigo-600 font-medium text-sm hover:underline">
                  View Profile
                </NuxtLink>
                <button @click="() => toggleFollow(quizMaster)" :disabled="followLoading[quizMaster.id]" class="px-3 py-1 text-sm rounded-md border" :class="following[quizMaster.id] ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'">
                  <span v-if="following[quizMaster.id]">Following</span>
                  <span v-else>Follow</span>
                </button>
              </div>
            </div>
          </div>
        </UCard>
      </div>
      <div v-else class="text-center text-gray-500">
        No quiz-masters found.
      </div>
    </div>
  </div>
</template>

<script setup>
import PageHero from '~/components/ui/PageHero.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const config = useRuntimeConfig()

const { data: quizMastersData, pending, error } = await useAsyncData(
  'quiz-masters',
  () => $fetch(config.public.apiBase + '/api/quiz-masters')
)

const quizMasters = computed(() => {
  if (!quizMastersData.value) return []
  // Handle paginated or direct array response
  return Array.isArray(quizMastersData.value) ? quizMastersData.value : (quizMastersData.value.data || [])
})

// follow state (optimistic UI): map of id -> boolean
const following = ref({})
const followLoading = ref({})
const auth = useAuthStore()
const router = useRouter()

async function toggleFollow(quizMaster) {
  if (!auth.user) return router.push('/login')
  const id = quizMaster.id
  const current = !!following.value[id]
  // optimistic
  following.value = { ...following.value, [id]: !current }
  followLoading.value = { ...followLoading.value, [id]: true }
  try {
    if (!current) {
      await $fetch(config.public.apiBase + `/api/quiz-masters/${id}/follow`, { method: 'POST', credentials: 'include' })
    } else {
      await $fetch(config.public.apiBase + `/api/quiz-masters/${id}/unfollow`, { method: 'POST', credentials: 'include' })
    }
  } catch (err) {
    // rollback
    following.value = { ...following.value, [id]: current }
    console.error('Follow toggle failed', err)
  } finally {
    followLoading.value = { ...followLoading.value, [id]: false }
  }
}

// initialize following map from API payload when available (if backend provides is_following)
watchEffect(() => {
  const list = quizMasters.value || []
  const map = {}
  list.forEach(q => {
    map[q.id] = !!(q.is_following || q.is_following_by_current_user || q.isFollowing || q.is_following === true)
  })
  following.value = map
})

useHead({
  title: 'Our quiz-masters',
  meta: [
    { name: 'description', content: 'Browse our list of expert quiz-masters.' }
  ]
})
</script>