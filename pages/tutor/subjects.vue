<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold mb-4">My Subjects</h1>

    <div class="mb-4 flex items-center gap-3">
      <input v-model="q" @keyup.enter="fetchItems" placeholder="Search subjects..." class="border p-2" />
      <select v-model.number="perPage" @change="fetchItems" class="border p-2">
        <option :value="5">5</option>
        <option :value="10">10</option>
        <option :value="20">20</option>
      </select>
    </div>

    <div v-if="loading">Loading...</div>
    <div v-else>
      <div v-if="!paginator?.data || paginator.data.length === 0" class="text-gray-500">No subjects yet.</div>
      <ul class="space-y-3">
        <li v-for="s in (paginator?.data || [])" :key="s.id" class="p-3 border rounded flex items-center justify-between">
          <div>
            <div class="font-medium">{{ s.name }}</div>
            <div class="text-sm text-gray-500">Quizzes in subject: {{ s.quizzes_count ?? 0 }}</div>
          </div>

          <div class="flex items-center gap-3">
            <button
              @click="toggleApprove(s)"
              :disabled="s.is_approved || s.approval_requested_at"
              :class="s.is_approved ? 'bg-green-600 text-white' : (s.approval_requested_at ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800')"
              class="px-3 py-1 rounded text-sm"
            >
              <template v-if="s.is_approved">Approved</template>
              <template v-else-if="s.approval_requested_at">Requested</template>
              <template v-else>Request approval</template>
            </button>
            <NuxtLink :to="`/tutor/subjects/${s.id}/edit`" class="text-sm text-blue-600">Edit</NuxtLink>
          </div>
        </li>
      </ul>

      <div class="mt-4"><Pagination :paginator="paginator" @change-page="onPageChange" /></div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'tutor' })
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useAppAlert } from '~/composables/useAppAlert'
import Pagination from '~/components/Pagination.vue'
const alert = useAppAlert()

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
    const res = await fetch(useRuntimeConfig().public.apiBase + '/api/subjects?' + params.toString(), { credentials: 'include' })
    if (res.ok) {
      const json = await res.json()
      paginator.value = json.subjects || json.data || json
    } else {
      alert.push({ type: 'error', message: 'Failed to load subjects', icon: 'heroicons:exclamation-circle' })
    }
  } catch (e) {
    alert.push({ type: 'error', message: 'Network error', icon: 'heroicons:x-circle' })
  }
  loading.value = false
}

const auth = useAuthStore()
const isAdmin = computed(() => !!auth.user?.is_admin)

async function toggleApprove(item) {
  if (isAdmin.value) {
    const prev = item.is_approved
    item.is_approved = !prev
    try {
      const res = await fetch(useRuntimeConfig().public.apiBase + `/api/subjects/${item.id}/approve`, { method: 'POST', credentials: 'include' })
  if (!res.ok) { item.is_approved = prev; alert.push({ type: 'error', message: 'Failed to change approve status', icon: 'heroicons:exclamation-circle' }) }
  else alert.push({ type: 'success', message: 'Approval status updated', icon: 'heroicons:check-circle' })
  } catch (e) { item.is_approved = prev; alert.push({ type: 'error', message: 'Network error', icon: 'heroicons:x-circle' }) }
  } else {
    const prevRequested = item.approval_requested_at
    item.approval_requested_at = new Date().toISOString()
    try {
      const res = await fetch(useRuntimeConfig().public.apiBase + `/api/subjects/${item.id}/request-approval`, { method: 'POST', credentials: 'include' })
  if (res.ok) alert.push({ type: 'success', message: 'Approval requested', icon: 'heroicons:check-circle' })
  else { item.approval_requested_at = prevRequested; alert.push({ type: 'error', message: 'Failed to request approval', icon: 'heroicons:exclamation-circle' }) }
  } catch (e) { item.approval_requested_at = prevRequested; alert.push({ type: 'error', message: 'Network error', icon: 'heroicons:x-circle' }) }
  }
}

function onPageChange(p) { page.value = p; fetchItems() }
</script>

<style scoped></style>
