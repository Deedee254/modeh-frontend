<template>
  <div>
    <PageHero
      title="Available Quizzes"
      description="Test your knowledge and earn points! Browse through quizzes on various topics."
      :breadcrumbs="[{ text: 'Dashboard', href: '/quizee/dashboard' }, { text: 'Quizzes', current: true }]"
    />

    <!-- Filters -->
    <div class="p-6 max-w-7xl mx-auto">
      <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1 relative">
          <svg class="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input v-model="q" @keyup.enter="fetchItems" placeholder="Search quizzes..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
        <select v-model.number="perPage" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          <option :value="5">5 per page</option>
          <option :value="12">12 per page</option>
          <option :value="20">20 per page</option>
        </select>
        <select v-model.number="topicId" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          <option :value="0">All topics</option>
          <option v-for="t in (topics || [])" :key="t?.id ?? t" :value="t?.id">{{ t?.name }}</option>
        </select>
      </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="space-y-4">
        <UiSkeleton v-for="i in 3" :key="i" class="h-32 rounded-lg" />
      </div>

      <!-- Results -->
      <div v-else>
      <div v-if="!paginator?.data || paginator.data.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No quizzes found</h3>
        <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
      </div>

  <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
        <QuizCard
          v-for="qitem in (paginator?.data || [])"
          :key="qitem.id"
          :to="`/quizee/quizzes/${qitem.id}`"
          :startLink="`/quizee/quizzes/${qitem.id}`"
          :takeLink="`/quizee/quizzes/take/${qitem.id}`"
          :title="qitem.title"
          :topic="qitem.topic?.name"
          :cover="qitem.cover_image || ''"
          :description="qitem.description"
          :marks="qitem.questions_count"
          :difficulty="qitem.difficulty"
          :quizMaster="qitem.user_id?.toString()"
          :palette="pickPaletteClass(qitem.topic_id)"
          :quiz-id="qitem.id"
          :liked="qitem.liked || false"
          :likes="qitem.likes_count || 0"
          @like="onQuizLike(qitem, $event)"
        />
      </div>

      <!-- Pagination -->
      <div class="mt-8" v-if="paginator?.data?.length > 0">
        <Pagination :paginator="paginator" @change-page="onPageChange" />
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'quizee' })
import { ref, computed, onMounted, watch } from 'vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import QuizCard from '~/components/ui/QuizCard.vue'
import Pagination from '~/components/Pagination.vue'
import PageHero from '~/components/ui/PageHero.vue'
import { useAppAlert } from '~/composables/useAppAlert'
import useQuizzes from '~/composables/useQuizzes'
const alert = useAppAlert()

function pickPaletteClass(id) {
  const palettes = [
    'bg-gradient-to-br from-indigo-200 via-indigo-100 to-sky-100 text-indigo-800',
    'bg-gradient-to-br from-rose-200 via-rose-100 to-pink-100 text-rose-800',
    'bg-gradient-to-br from-emerald-200 via-emerald-100 to-lime-100 text-emerald-800',
    'bg-gradient-to-br from-yellow-200 via-amber-100 to-amber-50 text-amber-800',
    'bg-gradient-to-br from-fuchsia-200 via-fuchsia-100 to-pink-50 text-fuchsia-800',
    'bg-gradient-to-br from-sky-200 via-sky-100 to-indigo-50 text-sky-800'
  ]
  return palettes[(id || 0) % palettes.length]
}

const q = ref('')
const perPage = ref(12)
const page = ref(1)
const topicId = ref(0)

// composable that encapsulates fetching and normalization
const { paginator, topics, loading, normalizedQuizzes, fetchItems, fetchTopics } = useQuizzes()

// keep local params reactive and trigger composable fetches
watch([q, perPage, page, topicId], () => {
  // on filter change, call fetchItems with current params
  fetchItems({ q: q.value, per_page: perPage.value, page: page.value, topic_id: topicId.value })
})

onMounted(async () => { await Promise.all([fetchItems({ q: q.value, per_page: perPage.value, page: page.value, topic_id: topicId.value }), fetchTopics()]) })

// fetchItems & fetchTopics provided by composable

function onPageChange(p) { page.value = p }

function onQuizLike(item, payload) {
  try {
    if (!item) return
    if (payload && payload.liked === true) {
      item.likes_count = (item.likes_count || item.likes || 0) + 1
      item.liked = true
    } else if (payload && payload.liked === false) {
      item.likes_count = Math.max(0, (item.likes_count || item.likes || 0) - 1)
      item.liked = false
    }
  } catch (e) {}
}
</script>

<style scoped></style>