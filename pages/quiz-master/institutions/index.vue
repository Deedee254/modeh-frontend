<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Institutions</h1>
        <p class="text-gray-600">Find and join institutions to connect with other educators and learners</p>
      </div>

      <!-- Search Bar -->
      <div class="mb-8">
        <div class="flex gap-3">
          <div class="flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search institutions by name..."
              @input="debounceSearch"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>
          <button
            @click="performSearch"
            class="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition font-medium"
          >
            Search
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block">
          <div class="w-8 h-8 border-4 border-gray-300 border-t-brand-600 rounded-full animate-spin"></div>
          <p class="mt-4 text-gray-600">Loading institutions...</p>
        </div>
      </div>

      <!-- Institutions Grid -->
      <div v-else-if="institutions.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <NuxtLink
          v-for="institution in institutions"
          :key="institution.id"
          :to="`/quiz-master/institutions/${institution.slug}`"
          class="block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition p-6 group"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h2 class="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition mb-1">
                {{ institution.name }}
              </h2>
              <p class="text-sm text-gray-600">{{ institution.email || 'No email' }}</p>
            </div>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-brand-600 transition flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <div v-if="institution.phone" class="text-sm text-gray-600 mb-3">
            📱 {{ institution.phone }}
          </div>

          <div class="flex items-center gap-3 text-sm text-gray-500">
            <span v-if="institution.users && institution.users.length" class="flex items-center gap-1">
              👥 {{ institution.users.length }} members
            </span>
            <span v-if="institution.is_active" class="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              Active
            </span>
          </div>
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-1">No institutions found</h3>
        <p class="text-gray-600">
          <span v-if="searchQuery">Try adjusting your search query</span>
          <span v-else>No institutions available yet. Check back soon!</span>
        </p>
      </div>

      <!-- Pagination -->
      <div v-if="institutions.length > 0 && pagination" class="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
        <div class="text-sm text-gray-600">
          Showing {{ (pagination.current_page - 1) * pagination.per_page + 1 }} to {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} of {{ pagination.total }} institutions
        </div>
        <div class="flex gap-2">
          <button
            @click="previousPage"
            :disabled="pagination.current_page === 1"
            class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ← Previous
          </button>
          <div class="flex items-center gap-1">
            <span v-for="page in visiblePages" :key="page">
              <button
                v-if="page === '...'"
                disabled
                class="px-2 py-2 text-gray-400"
              >
                ...
              </button>
              <button
                v-else
                @click="goToPage(page)"
                :class="[
                  'px-3 py-2 rounded-lg transition',
                  page === pagination.current_page
                    ? 'bg-brand-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
            </span>
          </div>
          <button
            @click="nextPage"
            :disabled="pagination.current_page === pagination.last_page"
            class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'

definePageMeta({ layout: 'quiz-master' })

useHead({
  title: 'Institutions — Modeh',
  meta: [
    { name: 'description', content: 'Browse and join institutions to connect with quiz masters and learners on Modeh.' }
  ]
})

const api = useApi()
const alert = useAppAlert()

interface Institution {
  id: number
  name: string
  email: string
  phone?: string
  slug: string
  users?: any[]
  is_active: boolean
}

interface Pagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

const searchQuery = ref('')
const loading = ref(false)
const institutions = ref<Institution[]>([])
const pagination = ref<Pagination | null>(null)
const currentPage = ref(1)
let searchTimeout: NodeJS.Timeout | null = null

const visiblePages = computed(() => {
  if (!pagination.value) return []
  const total = pagination.value.last_page
  const current = pagination.value.current_page
  const pages: (number | string)[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  return pages
})

async function performSearch() {
  currentPage.value = 1
  await fetchInstitutions()
}

function debounceSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(performSearch, 500)
}

async function fetchInstitutions() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (searchQuery.value.trim()) {
      params.append('name', searchQuery.value.trim())
    }
    params.append('page', String(currentPage.value))
    params.append('per_page', '12')

    const res = await api.get(`/api/institutions?${params.toString()}`)
    if (!res.ok) throw new Error('Failed to fetch institutions')

    const data: any = await res.json()
    institutions.value = data.data || data || []
    pagination.value = {
      current_page: data.current_page || 1,
      per_page: data.per_page || 12,
      total: data.total || 0,
      last_page: data.last_page || 1
    }
  } catch (e: any) {
    console.error('Failed to fetch institutions', e)
    alert.push({ type: 'error', message: 'Failed to load institutions' })
  } finally {
    loading.value = false
  }
}

function nextPage() {
  if (pagination.value && currentPage.value < pagination.value.last_page) {
    currentPage.value++
    fetchInstitutions()
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchInstitutions()
  }
}

function goToPage(page: number | string) {
  currentPage.value = typeof page === 'string' ? parseInt(page, 10) : page
  fetchInstitutions()
}

onMounted(() => {
  fetchInstitutions()
})
</script>
