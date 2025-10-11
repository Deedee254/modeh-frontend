<template>
  <div class="max-w-7xl mx-auto px-4 py-12">
    <!-- Hero -->
    <section class="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg p-8 lg:p-12">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 class="text-3xl lg:text-4xl font-extrabold">Subjects & learning pathways</h1>
          <p class="mt-2 text-indigo-100 max-w-2xl">Discover organized subjects and jump straight into curated quizzes. Filter by subject, search by name, or explore popular areas below.</p>
          <div class="mt-5 flex gap-3">
            <NuxtLink to="/quizzes" class="px-4 py-2 bg-white text-indigo-700 rounded-md font-medium">Browse quizzes</NuxtLink>
            <NuxtLink to="/register?role=quiz-master" class="px-4 py-2 border border-white/30 rounded-md text-white">Create a subject</NuxtLink>
          </div>
        </div>
        <div class="w-full lg:w-1/3">
          <div class="bg-white rounded-md p-3 shadow-sm">
            <UiSearch v-model="query" icon="i-heroicons-magnifying-glass" placeholder="Search subjects" class="w-full" @search="onServerSearch" @submit="onServerSubmit" />
            <div class="mt-3 flex gap-2">
              <USelectMenu v-model="sortBy" :options="sortOptions" placeholder="Sort by" class="w-full" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Compact filters (replaces subject pills) -->
    <div class="mt-6">
      <div class="flex items-center gap-3">
        <div class="inline-flex rounded-md shadow-sm" role="tablist" aria-label="subject-filters">
          <button @click="setFilter('')" :class="filterBtnClass('')" :aria-pressed="activeFilter === ''">All</button>
          <button @click="setFilter('top')" :class="filterBtnClass('top')" :aria-pressed="activeFilter === 'top'">Top</button>
          <button @click="setFilter('featured')" :class="filterBtnClass('featured')" :aria-pressed="activeFilter === 'featured'">Featured</button>
          <button @click="setFilter('new')" :class="filterBtnClass('new')" :aria-pressed="activeFilter === 'new'">New</button>
        </div>
        <div class="ml-auto text-sm text-gray-500">Showing {{ filtered.length }} subjects</div>
      </div>
    </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <aside class="lg:col-span-1">
          <FiltersSidebar storageKey="filters:subjects" :subject-options="[]" :topic-options="[]" :grade-options="GRADES" :grade="gradeFilter" @update:grade="val => gradeFilter.value = val" />
        </aside>
        <main class="lg:col-span-3">
          <div v-if="pending" class="mt-6"><UiSkeleton :count="6" /></div>
          <div v-else-if="error" class="mt-6 text-red-600 dark:text-red-400">Failed to load subjects.</div>
          <div v-else class="mt-6">
            <div v-if="filtered.length === 0" class="p-6 border rounded-md text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800">No subjects found.</div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-3">
              <PillCard
                v-for="s in filtered"
                :key="s.id"
                eyebrow="Subject"
                :title="s.name"
                :subtitle="`${s.quizzes_count} quizzes available`"
                color="indigo"
                :badge-text="(s.name || '').charAt(0).toUpperCase()"
                :image="resolveIcon(s)"
                fallback="/images/subject-icon.svg"
              >
                <NuxtLink :to="`/quizzes?subject=${encodeURIComponent(s.id)}`" class="text-indigo-600 dark:text-indigo-400 text-sm hover:underline">Explore quizzes →</NuxtLink>
              </PillCard>
            </div>
          </div>
        </main>
      </div>

    <!-- CTA -->
    <div class="mt-10">
      <div class="bg-indigo-50 rounded-lg p-6 flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-indigo-800">Want to help build content?</h3>
          <p class="text-sm text-indigo-700/90">Create subjects and topics to organize your quizzes for learners worldwide.</p>
        </div>
        <NuxtLink to="/register?role=quiz-master" class="px-4 py-2 bg-indigo-600 text-white rounded">Become a quiz-master</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import PageHero from '~/components/ui/PageHero.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import PillCard from '~/components/ui/PillCard.vue'
import FiltersSidebar from '~/components/FiltersSidebar.vue'
import UiSearch from '~/components/ui/UiSearch.vue'
import { ref, computed } from 'vue'

const config = useRuntimeConfig()
const { data, pending, error } = await useFetch(config.public.apiBase + '/api/subjects')
const subjects = data?.value?.subjects?.data || []

const query = ref('')
const sortBy = ref('popular')
const sortOptions = [
  { label: 'Most quizzes', value: 'popular' },
  { label: 'A → Z', value: 'az' },
  { label: 'Z → A', value: 'za' },
]

// Subject quick-filter state used by the UI pills
const subjectFilter = ref('')
const topSubjects = computed(() => {
  const all = subjects || []
  return all.slice().sort((a,b) => (b.quizzes_count||0) - (a.quizzes_count||0)).slice(0, 12)
})

function selectSubject(v) { subjectFilter.value = v }

const gradeFilter = ref('')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  let list = subjects || []
  if (q) list = list.filter(s => (s.name || '').toLowerCase().includes(q))
  if (gradeFilter.value) list = list.filter(s => String(s.grade || s.grade_id || '') === String(gradeFilter.value))

  // apply compact filter buttons: top -> top by quizzes_count; featured -> filter by featured flag; new -> sort by created_at desc
  if (activeFilter.value === 'top') {
    list = list.slice().sort((a,b) => (b.quizzes_count||0) - (a.quizzes_count||0)).slice(0, 12)
  } else if (activeFilter.value === 'featured') {
    list = list.filter(s => s.featured || s.is_featured || s.curated)
  } else if (activeFilter.value === 'new') {
    list = list.slice().sort((a,b) => new Date(b.created_at || b.published_at || b.updated_at || 0) - new Date(a.created_at || a.published_at || a.updated_at || 0))
  }

  if (sortBy.value === 'az') list = [...list].sort((a,b) => a.name.localeCompare(b.name))
  else if (sortBy.value === 'za') list = [...list].sort((a,b) => b.name.localeCompare(a.name))
  else list = [...list].sort((a,b) => (b.quizzes_count||0) - (a.quizzes_count||0))
  return list
})

// Server search: update `subjects` with server response when user searches
let serverActive = false
async function onServerSearch(q) {
  serverActive = true
  try {
    const res = await $fetch(config.public.apiBase + '/api/subjects', { params: { query: q }, credentials: 'include' })
    const items = res?.subjects?.data || res?.subjects || res?.data || []
    if (Array.isArray(items) && items.length) {
      // replace the local list so filtered computed uses server results
      // prefer keeping the same reactive reference
      // eslint-disable-next-line no-unused-expressions
      subjects.length = 0
      subjects.push(...items)
    }
  } catch (e) {
    // ignore network errors and fall back to client filtering
  } finally {
    serverActive = false
  }
}

function onServerSubmit(q) { onServerSearch(q) }

function resolveIcon(s) {
  if (!s) return '/images/subject-icon.svg'
  return s.icon || s.image || s.cover_image || '/images/subject-icon.svg'
}

// helper used by the template to style the quick-pills
function pillClass(v) {
  // subjectFilter is not defined in this file; try to derive from subjects list or fallback to empty
  // We keep behaviour consistent with quizzes page where selected pill is highlighted
  const active = typeof subjectFilter !== 'undefined' ? subjectFilter.value === v : false
  return `px-3 py-1.5 text-sm rounded-full border ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200'}`
}

// New compact filter control state and helper
const activeFilter = ref('')
function filterBtnClass(v) {
  const base = 'px-3 py-1.5 text-sm first:rounded-l-md last:rounded-r-md border bg-white text-gray-700 border-gray-200'
  if (v === activeFilter.value) {
    return 'px-3 py-1.5 text-sm first:rounded-l-md last:rounded-r-md border bg-indigo-600 text-white border-indigo-600'
  }
  return base
}

function setFilter(v) {
  // toggle: clicking the same filter clears it
  if (activeFilter.value === v) activeFilter.value = ''
  else activeFilter.value = v
}

// Fetch grades for subjects sidebar
const { data: gradesData } = await useFetch(config.public.apiBase + '/api/grades', { credentials: 'include' })
const GRADES = (gradesData?.value?.grades || []).slice(0, 12)
</script>
