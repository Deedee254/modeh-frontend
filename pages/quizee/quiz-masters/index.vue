<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto p-6 max-w-7xl">
      <PageHero
        :breadcrumbs="[{ text: 'Home', href: '/quizee' }, { text: 'Quiz Masters', current: true }]"
        title="Find Your Quiz Masters"
        description="Connect with expert quiz masters in your grade and institution who create engaging quizzes and guide your learning journey."
        align="center"
        padding="py-16 sm:py-20"
      >
        <template #actions>
          <div class="flex flex-wrap items-center justify-center gap-4">
            <UButton
              size="lg"
              color="primary"
              variant="solid"
              class="min-w-[200px] shadow-lg hover:-translate-y-0.5 transition-transform"
              to="/quizzes"
            >
              Browse All Quizzes
            </UButton>
          </div>
        </template>
        
        <template #highlight>
          <div>
            <p class="text-xs uppercase tracking-wide">Discover</p>
            <p class="mt-1 text-2xl font-semibold">Expert Educators</p>
          </div>
        </template>
        
        <template #highlight-icon>
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
        </template>
        
        <template #stats>
          <div class="flex flex-col rounded-2xl bg-white/5 p-4 text-center">
            <p class="text-3xl font-bold text-white">1000+</p>
            <p class="text-sm text-white/70">Active Quizzes</p>
          </div>
          <div class="flex flex-col rounded-2xl bg-white/5 p-4 text-center">
            <p class="text-3xl font-bold text-white">500+</p>
            <p class="text-sm text-white/70">Quiz Masters</p>
          </div>
        </template>
      </PageHero>

      <div v-if="pending">
        <SkeletonGrid :count="8" />
      </div>
      <div v-else>
        <div v-if="(!quizMasters || quizMasters.length === 0)" class="p-6 bg-white rounded shadow text-gray-600">No quiz masters found</div>
        <div v-else>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <QuizMasterCard
              v-for="quizMaster in quizMasters"
              :key="quizMaster.id"
              :quiz-master="quizMaster"
              :is-following="following[quizMaster.id]"
              :loading="loadingFollow[quizMaster.id]"
              @follow="toggleFollow(quizMaster)"
            />
          </div>
          
          <!-- Pagination -->
          <div v-if="paginator && paginator.last_page > 1" class="mt-8">
            <UPagination
              v-model="currentPage"
              :total="paginator.total"
              :per-page="paginator.per_page"
              :max-links="5"
              class="justify-center"
              @change="onPageChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watchEffect } from 'vue'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'
import SkeletonGrid from '~/components/SkeletonGrid.vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import PageHero from '~/components/ui/PageHero.vue'
import UPagination from '~/components/ui/UPagination.vue'
import QuizMasterCard from '~/components/ui/QuizMasterCard.vue'

definePageMeta({ layout: 'quizee' })

useHead({
  title: 'Browse Quiz Masters',
  meta: [
    { name: 'description', content: 'Find and follow expert quiz masters in your grade and institution.' }
  ]
})

const config = useRuntimeConfig()
const currentPage = ref(1)

// Fetch quiz masters with pagination
const { data: response, pending, refresh } = await useFetch(() => ({
  url: config.public.apiBase + '/api/quiz-masters',
  params: {
    page: currentPage.value
  }
}), {
  watch: [currentPage]
})

async function onPageChange(page) {
  currentPage.value = page
  await refresh()
}

const quizMasters = computed(() => {
  if (response.value?.data && Array.isArray(response.value.data)) {
    return response.value.data.filter(Boolean)
  }
  return []
})

const paginator = computed(() => {
  if (!response.value) return null
  const { current_page, last_page, total, per_page, links } = response.value
  return { current_page, last_page, total, per_page, links }
})

const auth = useAuthStore()
const router = useRouter()
const following = ref({})
const loadingFollow = ref({})
const api = useApi()
const alert = useAppAlert()

async function toggleFollow(qm) {
  if (!auth.user) return router.push('/login')
  const id = qm.id
  const cur = !!following.value[id]
  following.value = { ...following.value, [id]: !cur }
  loadingFollow.value = { ...loadingFollow.value, [id]: true }
  try {
    let res
    if (!cur) res = await api.postJson(`/api/quiz-masters/${id}/follow`, {})
    else res = await api.postJson(`/api/quiz-masters/${id}/unfollow`, {})
    if (api.handleAuthStatus(res)) return
    if (!res.ok) {
      following.value = { ...following.value, [id]: cur }
      alert.push({ message: 'Failed to follow/unfollow. Try again.', type: 'error' })
    }
  } catch (err) {
    following.value = { ...following.value, [id]: cur }
    console.error('Follow failed', err)
  } finally {
    loadingFollow.value = { ...loadingFollow.value, [id]: false }
  }
}

watchEffect(() => {
  const list = quizMasters.value || []
  const map = {}
  list.forEach(q => { map[q.id] = !!(q.is_following || q.isFollowing || q.is_following_by_current_user) })
  following.value = map
})
</script>
