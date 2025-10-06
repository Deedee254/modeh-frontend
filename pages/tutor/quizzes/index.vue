<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold mb-4">My Quizzes</h1>

    <div class="mb-4 flex items-center gap-3">
      <input v-model="q" @keyup.enter="fetchItems" placeholder="Search quizzes..." class="border p-2" />
      <select v-model.number="perPage" @change="fetchItems" class="border p-2">
        <option :value="5">5</option>
        <option :value="10">10</option>
        <option :value="20">20</option>
      </select>
      <select v-model.number="topicId" @change="fetchItems" class="border p-2">
        <option :value="0">All topics</option>
        <option v-for="t in topics" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>
    </div>

  <div v-if="loading"><UiSkeleton :count="3" /></div>
  <div v-else>
      <div v-if="!paginator?.data || paginator.data.length === 0" class="text-gray-500">0 results returned</div>
        <UiGrid>
          <UiCard v-for="qitem in (paginator?.data || [])" :key="qitem.id" variant="elevated">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium">{{ qitem.title }}</div>
                <div class="text-sm text-gray-500">Topic: {{ qitem.topic?.name || '—' }} • {{ qitem.is_paid ? 'Paid' : 'Free' }}</div>
              </div>

              <div class="flex items-center gap-3">
                <button
                  @click="toggleApprove(qitem)"
                  :disabled="qitem.is_approved || qitem.approval_requested_at"
                  :class="qitem.is_approved ? 'bg-green-600 text-white' : (qitem.approval_requested_at ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800')"
                  class="px-3 py-1 rounded text-sm"
                >
                  <template v-if="qitem.is_approved">Approved</template>
                  <template v-else-if="qitem.approval_requested_at">Requested</template>
                  <template v-else>Request approval</template>
                </button>
                <NuxtLink :to="`/tutor/quizzes/${qitem.id}/edit`" class="text-sm text-blue-600">Edit</NuxtLink>
              </div>
            </div>
          </UiCard>
        </UiGrid>

      <div class="mt-4"><Pagination :paginator="paginator" @change-page="onPageChange" /></div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'tutor' })
import { ref, onMounted, computed } from 'vue'
import UiGrid from '~/components/ui/UiGrid.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import UiCard from '~/components/ui/UiCard.vue'
import Pagination from '~/components/Pagination.vue'
import { useAppAlert } from '~/composables/useAppAlert'
const alert = useAppAlert()
import { useAuthStore } from '~/stores/auth'
const auth = useAuthStore()
const isAdmin = computed(() => !!auth.user?.is_admin)

const paginator = ref(null)
const topics = ref([])
const loading = ref(false)
const q = ref('')
const perPage = ref(10)
const page = ref(1)
const topicId = ref(0)

onMounted(async () => { await Promise.all([fetchItems(), fetchTopics()]) })

async function fetchTopics() {
  try {
    const res = await fetch(useRuntimeConfig().public.apiBase + '/api/topics?approved=1', { credentials: 'include' })
    if (res.ok) {
      const json = await res.json()
      topics.value = json.topics || json.data || []
    }
  } catch (e) {}
}

async function fetchItems() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (q.value) params.set('q', q.value)
    if (topicId.value) params.set('topic_id', topicId.value)
    params.set('per_page', perPage.value)
    params.set('page', page.value)
    const res = await fetch(useRuntimeConfig().public.apiBase + '/api/quizzes?' + params.toString(), { credentials: 'include' })
    if (res.ok) {
      const json = await res.json()
      paginator.value = json.quizzes || json.data || json
    } else {
      alert.push({ type: 'error', message: 'Failed to load quizzes', icon: 'heroicons:exclamation-circle' })
    }
  } catch (e) {
  alert.push({ type: 'error', message: 'Network error', icon: 'heroicons:x-circle' })
  }
  loading.value = false
}

async function toggleApprove(item) {
  if (isAdmin.value) {
    const prev = item.is_approved
    item.is_approved = !prev
    try {
      const res = await fetch(useRuntimeConfig().public.apiBase + `/api/quizzes/${item.id}/approve`, { method: 'POST', credentials: 'include' })
  if (!res.ok) { item.is_approved = prev; alert.push({ type: 'error', message: 'Failed to change approve status', icon: 'heroicons:exclamation-circle' }) }
  else alert.push({ type: 'success', message: 'Approval status updated', icon: 'heroicons:check-circle' })
  } catch (e) { item.is_approved = prev; alert.push({ type: 'error', message: 'Network error', icon: 'heroicons:x-circle' }) }
  } else {
    // Optimistic: mark as requested locally immediately, revert on failure
    const prevRequested = item.approval_requested_at
    item.approval_requested_at = new Date().toISOString()
    try {
      const res = await fetch(useRuntimeConfig().public.apiBase + `/api/quizzes/${item.id}/request-approval`, { method: 'POST', credentials: 'include' })
        if (res.ok) {
          alert.push({ type: 'success', message: 'Approval requested', icon: 'heroicons:check-circle' })
        } else {
          item.approval_requested_at = prevRequested
          alert.push({ type: 'error', message: 'Failed to request approval', icon: 'heroicons:exclamation-circle' })
        }
    } catch (e) {
  item.approval_requested_at = prevRequested
  alert.push({ type: 'error', message: 'Network error', icon: 'heroicons:x-circle' })
    }
  }
}

function onPageChange(p) { page.value = p; fetchItems() }
</script>

<style scoped></style>