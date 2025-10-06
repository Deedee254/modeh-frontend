<template>
  <div class="max-w-7xl mx-auto px-4 py-12">
    <!-- Hero -->
    <section class="bg-white rounded-lg p-8 lg:p-12 shadow-sm">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 class="text-3xl lg:text-4xl font-extrabold">Topics and micro-skills</h1>
          <p class="mt-2 text-gray-600 max-w-2xl">Focus on specific topics and sharpen skills with topic-aligned quizzes. Use search and filters to find what you need fast.</p>
        </div>
        <div class="w-full lg:w-1/3">
          <div class="bg-gray-50 rounded-md p-3">
            <UiSearch v-model="query" icon="i-heroicons-magnifying-glass" placeholder="Search topics" class="w-full" @search="onServerSearch" @submit="onServerSubmit" />
            <div class="mt-3">
              <USelectMenu v-model="sortBy" :options="sortOptions" placeholder="Sort by" class="w-full" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick action tabs: New / Top / Featured -->
    <div class="mt-6 flex gap-2 items-center">
      <button @click="sortBy = 'popular'" :class="sortBy === 'popular' ? 'px-3 py-2 rounded bg-indigo-600 text-white text-sm' : 'px-3 py-2 rounded bg-white border text-sm'">New</button>
      <button @click="sortBy = 'az'" :class="sortBy === 'az' ? 'px-3 py-2 rounded bg-indigo-600 text-white text-sm' : 'px-3 py-2 rounded bg-white border text-sm'">Top</button>
      <button @click="sortBy = 'za'" :class="sortBy === 'za' ? 'px-3 py-2 rounded bg-indigo-600 text-white text-sm' : 'px-3 py-2 rounded bg-white border text-sm'">Featured</button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <aside class="lg:col-span-1">
        <FiltersSidebar
          :subject-options="SUBJECTS"
          :topic-options="[]"
          :showTopic="false"
          :grade-options="GRADES"
          :subject="subjectFilter"
          :grade="gradeFilter"
          storageKey="filters:topics"
          @update:subject="val => subjectFilter.value = val"
          @update:grade="val => gradeFilter.value = val"
        />
      </aside>

      <main class="lg:col-span-3">
        <div v-if="pending" class="mt-6"><SkeletonGrid :count="3" /></div>
        <div v-else>
          <div v-if="(!filtered || filtered.length === 0)" class="p-6 border rounded-md text-sm text-gray-600 bg-white border-gray-200">0 results returned</div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-3">
            <PillCard
              v-for="t in filtered"
              :key="t.id"
              eyebrow="Topic"
              :title="t.name"
              :subtitle="`${t.quizzes_count || 0} quizzes`"
              color="emerald"
              :badge-text="(t.name || '').charAt(0).toUpperCase()"
              :image="t.image || t.cover_image || ''"
              :palette="pickPaletteClass(t.subject_id || t.id)"
            >
              <NuxtLink :to="`/quizzes?topic_id=${t.id}`" class="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm">Explore →</NuxtLink>
            </PillCard>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import PageHero from '~/components/ui/PageHero.vue'
import SkeletonGrid from '~/components/SkeletonGrid.vue'
import PillCard from '~/components/ui/PillCard.vue'
import FiltersSidebar from '~/components/FiltersSidebar.vue'
import UiSearch from '~/components/ui/UiSearch.vue'
import { ref, computed } from 'vue'

const config = useRuntimeConfig()
const { data, pending } = await useFetch(config.public.apiBase + '/api/topics')
const topics = safeArray(data?.value?.topics || data?.value || [])

// Helper to coerce API responses into arrays (defensive: handles HTML error pages or wrapped shapes)
function safeArray(v) {
  if (Array.isArray(v)) return v
  if (v == null) return []
  if (typeof v === 'object') {
    if (Array.isArray(v.data)) return v.data
    if (Array.isArray(v.items)) return v.items
    if (Array.isArray(v.topics)) return v.topics
    if (typeof (v.length) === 'number') return Array.from(v)
    return []
  }
  if (typeof v === 'string') {
    const raw = v.trim()
    const s = raw.toLowerCase()
    if (s.startsWith('<!doctype') || s.startsWith('<html')) {
      try {
        const isDev = typeof import.meta !== 'undefined' ? !!import.meta.env?.DEV : (process && process.env && process.env.NODE_ENV !== 'production')
        if (isDev) {
          const snippet = raw.replace(/\s+/g, ' ').slice(0, 800)
          // eslint-disable-next-line no-console
          console.warn('safeArray: received HTML string instead of JSON array — returning empty array', { snippet, endpoint: config?.public?.apiBase || 'unknown' })
        }
      } catch (e) {
        // ignore logging failures
      }
      return []
    }
    try {
      const parsed = JSON.parse(v)
      if (Array.isArray(parsed)) return parsed
    } catch (e) {
      return []
    }
  }
  return []
}

const query = ref('')
const sortBy = ref('popular')
const sortOptions = [
  { label: 'Most quizzes', value: 'popular' },
  { label: 'A → Z', value: 'az' },
  { label: 'Z → A', value: 'za' },
]

// Subject and grade filters for the sidebar
const subjectFilter = ref('')
const gradeFilter = ref('')

const filtered = computed(() => {
  const q = String(query.value || '').toLowerCase().trim()
  let list = topics || []
  if (q) list = list.filter(s => String(s.name || '').toLowerCase().includes(q))
  if (subjectFilter.value) list = list.filter(t => String(t.subject_id || t.subject || '') === String(subjectFilter.value))
  if (gradeFilter.value) list = list.filter(t => String(t.grade || t.grade_id || '') === String(gradeFilter.value))
  if (sortBy.value === 'az') list = [...list].sort((a,b) => a.name.localeCompare(b.name))
  else if (sortBy.value === 'za') list = [...list].sort((a,b) => b.name.localeCompare(a.name))
  else list = [...list].sort((a,b) => (b.quizzes_count||0) - (a.quizzes_count||0))
  return list
})

// Small helper to pick a pastel gradient class by id (used for fallback avatars)
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

// Server-side search handler (debounced by UiSearch)
async function onServerSearch(q) {
  try {
    const res = await $fetch(config.public.apiBase + '/api/topics', { params: { query: q }, credentials: 'include' })
    const items = res?.topics?.data || res?.topics || res?.data || []
    if (Array.isArray(items) && items.length) {
      // replace topics array in-place
      topics.length = 0
      topics.push(...items)
    }
  } catch (e) {
    // ignore errors
  }
}

function onServerSubmit(q) { onServerSearch(q) }

// Top topics to show as pills (popular by quizzes_count)
const topTopics = computed(() => {
  const all = topics || []
  return all.slice().sort((a,b) => (b.quizzes_count||0) - (a.quizzes_count||0)).slice(0, 12)
})

function selectTopic(v) { query.value = '' /* keep search cleared */; /* optionally set a topic filter */ }

function clear() { query.value = '' }

// Fetch subjects and grades for sidebar options
const { data: subjectsData } = await useFetch(config.public.apiBase + '/api/subjects', { credentials: 'include' })
const SUBJECTS = safeArray(subjectsData?.value?.subjects || subjectsData?.value || []).slice(0, 12).map(s => ({ id: s.id, name: s.name }))
const { data: gradesData } = await useFetch(config.public.apiBase + '/api/grades', { credentials: 'include' })
const GRADES = (gradesData?.value?.grades || []).slice(0, 12)
</script>
