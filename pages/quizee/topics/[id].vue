<template>
  <div>
    <PageHero
      :title="topic?.name || 'Topic'"
      :description="topic?.description || `Explore this topic in detail`"
      :showSearch="true"
      :flush="true"
      @search="onSearch"
    >
      <template #eyebrow>
        Topic detail
      </template>

      <template #actions>
        <div class="flex flex-wrap items-center gap-3">
          <NuxtLink
            :to="`/quizee/subjects/${topic?.subject?.slug || topic?.subject_id}`"
            v-if="topic?.subject?.id || topic?.subject_id"
            class="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            Back to subject
          </NuxtLink>
          <NuxtLink
            :to="`/quizee/quizzes?topic=${encodeURIComponent(topic?.slug || topic?.id)}`"
            class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-600 shadow-lg shadow-brand-600/30 transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            Take a quiz
          </NuxtLink>
        </div>
      </template>

      <template #highlight>
        <div>
          <p class="text-xs uppercase tracking-wide text-white/70">Details</p>
          <p class="mt-1 text-2xl font-semibold text-white">{{ topic?.name || 'Topic' }}</p>
          <p v-if="topic?.subject?.name" class="mt-2 text-sm text-white/70">Part of {{ topic.subject.name }}</p>
        </div>
      </template>

      <template #highlight-icon>
        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h12M4 18h8" />
        </svg>
      </template>
    </PageHero>

    <div class="bg-gray-50 min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div v-if="loading" class="text-center py-12">Loading topic...</div>
        <div v-else-if="error" class="mt-6 text-red-600">Failed to load this topic.</div>

        <div v-else class="bg-white rounded-xl shadow-sm p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ topic?.name }}</h2>
          <p v-if="topic?.description" class="text-gray-600 mb-6 whitespace-pre-line">{{ topic.description }}</p>
          
          <div v-if="topic?.subject?.name" class="mt-8 p-4 bg-brand-50 rounded-lg border border-brand-100">
            <p class="text-sm text-gray-600">Subject:</p>
            <NuxtLink 
              :to="`/quizee/subjects/${topic.subject.slug || topic.subject.id}`"
              class="text-brand-600 hover:text-brand-700 font-semibold"
            >
              {{ topic.subject.name }}
            </NuxtLink>
          </div>

          <div class="mt-8">
            <NuxtLink
              :to="`/quizee/quizzes?topic=${encodeURIComponent(topic?.slug || topic?.id)}`"
              class="inline-flex items-center justify-center rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition"
            >
              Start Quiz
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import useApi from '~/composables/useApi'
import PageHero from '~/components/ui/PageHero.vue'

definePageMeta({
  layout: 'quizee',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Explore this topic and take related quizzes.' }
  ]
})

const route = useRoute()
const auth = useAuthStore()
const api = useApi()

const topicId = computed(() => route.params.id)
const loading = ref(false)
const error = ref(false)
const topic = ref<any>(null)
const searchTerm = ref('')

async function fetchTopic() {
  loading.value = true
  error.value = false
  try {
    const res = await api.get(`/api/topics/${topicId.value}`)
    if (!res.ok) {
      error.value = true
      loading.value = false
      return
    }
    const data = await res.json()
    topic.value = data.data || data
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
  if (topicId.value) {
    fetchTopic()
  }
})
</script>
