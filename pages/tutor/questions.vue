<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold mb-4">My Questions</h1>

    <div class="mb-4 flex items-center gap-3">
      <input v-model="q" @keyup.enter="fetchItems" placeholder="Search questions..." class="border p-2" />
      <select v-model.number="perPage" @change="fetchItems" class="border p-2">
        <option :value="5">5</option>
        <option :value="10">10</option>
        <option :value="20">20</option>
      </select>
    </div>

    <div v-if="loading">Loading...</div>
    <div v-else>
      <div v-if="!paginator?.data || paginator.data.length === 0" class="text-gray-500">No questions yet.</div>
      <ul class="space-y-3">
        <li v-for="qitem in (paginator?.data || [])" :key="qitem.id" class="p-3 border rounded flex items-center justify-between">
          <div>
            <div class="font-medium">{{ qitem.title }}</div>
            <div class="text-sm text-gray-500">Topic: {{ qitem.topic?.name || '—' }} • {{ qitem.type || 'question' }}</div>
          </div>

          <div class="flex items-center gap-3">
            <span :class="statusClass(qitem.is_approved)">{{ statusLabel(qitem.is_approved) }}</span>
            <button
              v-if="!qitem.is_approved"
              @click="requestApproval(qitem)"
              :disabled="qitem.approval_requested_at"
              class="px-2 py-1 rounded text-sm bg-gray-200 text-gray-800"
            >
              <template v-if="qitem.approval_requested_at">Requested</template>
              <template v-else>Request approval</template>
            </button>
            <NuxtLink :to="`/quiz-master/questions/${qitem.id}/edit`" class="text-sm text-blue-600">Edit</NuxtLink>
          </div>
        </li>
      </ul>

      <div class="mt-4">
        <Pagination :paginator="paginator" @change-page="onPageChange" />
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'quiz-master' })
import { ref, onMounted, computed } from 'vue'
import Pagination from '~/components/Pagination.vue'
import { useAppAlert } from '~/composables/useAppAlert'
import { useAuthStore } from '~/stores/auth'

const alert = useAppAlert()
const auth = useAuthStore()
const isAdmin = computed(() => !!auth.user?.is_admin)

const paginator = ref(null)
const loading = ref(false)
const q = ref('')
const perPage = ref(10)
const page = ref(1)

onMounted(fetchItems)

async function fetchItems() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (q.value) params.set('q', q.value)
    params.set('per_page', perPage.value)
    params.set('page', page.value)
    const res = await fetch(useRuntimeConfig().public.apiBase + '/api/questions?' + params.toString(), { credentials: 'include' })
    if (res.ok) {
      const json = await res.json()
      paginator.value = json.questions || json.data || json
    } else {
      alert.push({ type: 'error', message: 'Failed to load questions', icon: 'heroicons:exclamation-circle' })
    }
  } catch (e) {
    alert.push({ type: 'error', message: 'Network error', icon: 'heroicons:x-circle' })
  }
  loading.value = false
}

function statusLabel(v) { return v ? 'Approved' : 'Pending' }
function statusClass(v) { return v ? 'text-green-700 bg-green-50 px-2 py-1 rounded text-sm' : 'text-yellow-800 bg-yellow-50 px-2 py-1 rounded text-sm' }

async function requestApproval(item) {
  if (isAdmin.value) {
    // Admins shouldn't request; they approve via admin panel.
    alert.push({ type: 'info', message: 'Admins can approve from admin panel.', icon: 'heroicons:information-circle' })
    return
  }
  // optimistic update
  const prevRequested = item.approval_requested_at
  item.approval_requested_at = new Date().toISOString()
  try {
    const res = await fetch(useRuntimeConfig().public.apiBase + `/api/questions/${item.id}/request-approval`, { method: 'POST', credentials: 'include' })
    if (res.ok) alert.push({ type: 'success', message: 'Approval requested', icon: 'heroicons:check-circle' })
    else { item.approval_requested_at = prevRequested; alert.push({ type: 'error', message: 'Failed to request approval', icon: 'heroicons:exclamation-circle' }) }
  } catch (e) { item.approval_requested_at = prevRequested; alert.push({ type: 'error', message: 'Network error', icon: 'heroicons:x-circle' }) }
}

function onPageChange(p) {
  page.value = p
  fetchItems()
}

</script>

<style scoped></style>
