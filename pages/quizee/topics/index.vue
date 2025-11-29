<template>
  <div>
    <PageHero
      title="Your Topics"
      description="Discover topics aligned to your learning level."
      :showSearch="true"
      :flush="true"
      @search="onSearch"
    >
      <template #eyebrow>
        Your learning topics
      </template>

      <template #actions>
        <div class="flex flex-wrap items-center gap-3">
          <NuxtLink
            to="/quizee/grades"
            class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-lg shadow-brand-950/30 transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            Browse grades
          </NuxtLink>
          <NuxtLink
            to="/quizee/subjects"
            class="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            Browse subjects
          </NuxtLink>
        </div>
      </template>

      <template #highlight>
        <div>
          <p class="text-xs uppercase tracking-wide text-white/70">Your level</p>
          <p class="mt-1 text-2xl font-semibold text-white">{{ userLevel }}</p>
          <p class="mt-2 text-sm text-white/70">{{ filteredTopics.length || 0 }} topics available</p>
        </div>
      </template>

      <template #highlight-icon>
        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h10M4 18h6" />
        </svg>
      </template>

      <template #stats>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Topics</p>
          <p class="mt-2 text-xl font-semibold">{{ filteredTopics.length || 0 }}</p>
        </div>
      </template>
    </PageHero>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div v-if="loading" class="mt-6"><UiSkeleton :count="6" /></div>
      <div v-else-if="error" class="mt-6 text-red-600">Failed to load topics.</div>

      <div v-else class="mt-6">
        <div v-if="filteredTopics.length === 0" class="p-6 border rounded-xl text-sm text-gray-600 bg-white shadow-sm">
          No topics available for your level.
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <TopicCard
            v-for="topic in filteredTopics"
            :key="topic.id"
            :title="topic.name"
            :slug="topic.slug"
            :href="`/quizee/topics/${topic.slug || topic.id}`"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import useTaxonomy from '~/composables/useTaxonomy'
import useApi from '~/composables/useApi'
import PageHero from '~/components/ui/PageHero.vue'
import TopicCard from '~/components/ui/TopicCard.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'

definePageMeta({
  layout: 'quizee',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Explore topics aligned to your learning level.' }
  ]
})

const auth = useAuthStore()
const api = useApi()
const taxonomy = useTaxonomy()

const loading = ref(false)
const error = ref(false)
const searchTerm = ref('')
const allTopics = ref<any[]>([])

const userProfile = computed(() => {
  const u = (auth as any).user
  return (u && typeof u === 'object' && 'value' in u) ? u.value : (u || {})
})
const userLevel = computed(() => userProfile.value?.level?.name || userProfile.value?.level_name || 'Your Level')

const filteredTopics = computed(() => {
  let topics = allTopics.value || []
  if (searchTerm.value) {
    const q = searchTerm.value.toLowerCase()
    topics = topics.filter((t: any) => (t.name || '').toLowerCase().includes(q))
  }
  return topics
})

async function loadTopicsByLevel() {
  loading.value = true
  error.value = false
  try {
    const levelId = userProfile.value?.level?.id || userProfile.value?.level_id
    if (!levelId) {
      error.value = true
      loading.value = false
      return
    }

    // Fetch topics filtered by level
    const res = await api.get(`/api/topics?level_id=${encodeURIComponent(levelId)}`)
    if (!res.ok) {
      error.value = true
      loading.value = false
      return
    }
    const data = await res.json()
    allTopics.value = data.data || data.topics || []
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

function onSearch(query: string) {
  searchTerm.value = query
}

onMounted(() => {
  loadTopicsByLevel()
})
</script>
