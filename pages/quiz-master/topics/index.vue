<template>
  <div>
    <PageHero
      title="Topic Library"
      description="Browse and manage topics for your quizzes. Create engaging content within specific topics."
      :showSearch="true"
      :flush="true"
      @search="onServerSearch"
    >
      <template #eyebrow>
        Topic Management
      </template>

      <template #actions>
        <div class="flex items-center gap-3">
          <button 
            @click="router.push('/quiz-master/topics/create')"
            class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
            Create Topic
          </button>
        </div>
      </template>
    </PageHero>

    <!-- Search and Filters -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-1 min-w-[200px]">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search topics..." 
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <div class="flex flex-wrap gap-4">
        <select 
          v-model="selectedSubject" 
          class="w-full sm:w-auto px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
        >
          <option value="">All Subjects</option>
          <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
            {{ subject.name }}
          </option>
        </select>
        <select 
          v-model="selectedGrade" 
          class="w-full sm:w-auto px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
        >
          <option value="">All Grades</option>
          <option v-for="grade in grades" :key="grade.id" :value="grade.id">
            {{ grade.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Topics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <TopicCard
        v-for="topic in filteredTopics"
        :key="topic.id"
        :title="topic.name"
        :image="topic.image || topic.cover_image || ''"
        :grade="topic.grade?.name || topic.grade_name || topic.grade || ''"
        :subject="topic.subject?.name || topic.subject_name || ''"
        :description="topic.description || topic.summary || ''"
        :quizzesCount="topic.quizzes_count || topic.quizzesCount || 0"
        :startLink="`/quiz-master/quizzes/create?topic_id=${topic.id}&subject_id=${topic.subject_id || topic.subject?.id || ''}`"
        :startLabel="'Create Quiz'"
        @click="handleTopicClick(topic)"
      />
      <div v-if="filteredTopics.length === 0" class="col-span-full text-center py-12 text-gray-500">
        No topics found. Try adjusting your filters or create a new topic.
      </div>
    </div>

    <div v-if="topicsResponse?.topics?.meta" class="mt-6">
      <Pagination 
        :paginator="topicsResponse.topics" 
        @change-page="handlePageChange"
      />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div v-for="n in 8" :key="n" class="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRuntimeConfig } from '#app'
import PageHero from '~/components/ui/PageHero.vue'
import TopicCard from '~/components/ui/TopicCard.vue'
import Pagination from '~/components/Pagination.vue'

definePageMeta({
  layout: 'quiz-master',
})

const router = useRouter()
const config = useRuntimeConfig()
const searchQuery = ref('')
const selectedSubject = ref('')
const selectedGrade = ref('')
const isLoading = ref(true)

const page = ref(1)
const perPage = ref(12)

const { data: topicsResponse, refresh } = await useFetch(config.public.apiBase + '/api/topics', {
  credentials: 'include',
  params: {
    page: page.value,
    per_page: perPage.value
  }
})

const { data: subjectsData } = await useFetch(config.public.apiBase + '/api/subjects', { credentials: 'include' })
const { data: gradesData } = await useFetch(config.public.apiBase + '/api/grades', { credentials: 'include' })

const topics = computed(() => topicsResponse.value?.topics?.data || [])
const subjects = computed(() => subjectsData.value?.subjects?.data || [])
const grades = computed(() => gradesData.value?.grades || [])

// Computed filtered topics based on search and filters
const filteredTopics = computed(() => {
  return topics.value.filter(topic => {
    const matchesSearch = topic.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesSubject = !selectedSubject.value || topic.subjectId === selectedSubject.value
    const matchesGrade = !selectedGrade.value || topic.gradeId === selectedGrade.value
    return matchesSearch && matchesSubject && matchesGrade
  })
})

const handleTopicClick = (topic) => {
  router.push(`/quiz-master/topics/${topic.id}`)
}

async function handlePageChange(newPage) {
  page.value = newPage
  await refresh()
}

async function onServerSearch(q) {
  try {
    await $fetch(config.public.apiBase + '/api/topics', { 
      params: { query: q },
      credentials: 'include' 
    })
    searchQuery.value = q
  } catch (e) {
    // ignore network errors
  }
}

// Mark loading as finished because top-level awaited fetches have completed
isLoading.value = false
</script>