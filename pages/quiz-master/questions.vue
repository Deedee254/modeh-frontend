<template>
  <div class="p-6">
    <PageHero
      title="Manage Your Questions"
      description="Create, edit, and organize your question items. Use the bank to quickly assemble quizzes."
      :breadcrumbs="[{ text: 'Dashboard', href: '/quiz-master/dashboard' }, { text: 'Questions', current: true }]"
    >
      <template #eyebrow>
        <Icon name="heroicons:circle-stack" class="h-4 w-4 mr-1" />
        Question Bank
      </template>
      <template #actions>
        <div class="flex items-center gap-4">
          <UButton size="sm" color="white" variant="soft" @click="fetchItems" icon="i-heroicons-arrow-path">Refresh</UButton>
          <UButton size="sm" color="primary" @click="goToCreate" icon="i-heroicons-plus">Create question</UButton>
        </div>
      </template>
      <template #stats>
        <div class="flex items-center gap-6">
          <div>
            <div class="text-sm text-white/80">Total</div>
            <div class="mt-1 text-lg font-semibold text-white">{{ totalQuestions }}</div>
          </div>
          <div>
            <div class="text-sm text-white/80">Approved</div>
            <div class="mt-1 text-lg font-semibold text-white">{{ approvedCount }}</div>
          </div>
          <div>
            <div class="text-sm text-white/80">Pending</div>
            <div class="mt-1 text-lg font-semibold text-white">{{ pendingCount }}</div>
          </div>
        </div>
      </template>
    </PageHero>

    <!-- Controls -->
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <UInput v-model="q" @keyup.enter="fetchItems" placeholder="Search questions..." icon="i-heroicons-magnifying-glass" class="flex-1 min-w-[200px]" />
      <USelect v-model.number="perPage" @change="fetchItems" :options="[{label: '5 per page', value: 5}, {label: '10 per page', value: 10}, {label: '20 per page', value: 20}]" class="w-36" />
    </div>

    <!-- List -->
    <div v-if="loading" class="space-y-4">
      <USkeleton v-for="i in perPage" :key="i" class="h-20 w-full" />
    </div>
    <div v-else>
      <div v-if="!paginator?.data || paginator.data.length === 0" class="text-gray-500">No questions yet.</div>
      <ul class="space-y-3">
  <li v-for="(qitem, idx) in (Array.isArray(paginator?.data) ? (paginator.data.filter(Boolean)) : [])" :key="qitem?.id || idx" class="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-lg">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <UBadge :label="qitem.type || 'question'" variant="soft" color="gray" />
                <div class="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">{{ qitem.title || 'Untitled Question' }}</div>
              </div>
              <div class="mt-1 text-sm text-slate-500">Topic: <span class="font-medium text-slate-600">{{ qitem.topic?.name || '—' }}</span></div>
            </div>
            <div class="mt-3 flex items-center gap-3 sm:mt-0">
              <UBadge :label="statusLabel(qitem.is_approved)" :color="statusColor(qitem.is_approved)" variant="subtle" size="sm" />
              <UButton v-if="!qitem.is_approved" size="xs" variant="outline" color="gray" @click="requestApproval(qitem)" :disabled="!!qitem.approval_requested_at">Request approval</UButton>
              <UButton @click.prevent="goToEdit(qitem)" icon="i-heroicons-pencil-square" size="sm" color="gray" variant="ghost" />
              <UButton v-if="isAdmin" size="sm" color="danger" variant="outline" @click.prevent="confirmDelete(qitem)">Delete</UButton>
            </div>
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
import PageHero from '~/components/ui/PageHero.vue'
import { useRouter } from 'vue-router'
import Pagination from '~/components/Pagination.vue'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'
import { useAuthStore } from '~/stores/auth'

const alert = useAppAlert()
const auth = useAuthStore()
const isAdmin = computed(() => !!auth.user?.is_admin)
const api = useApi()

const paginator = ref(null)
const loading = ref(false)
const q = ref('')
const perPage = ref(10)
const page = ref(1)
const router = useRouter()

const totalQuestions = computed(() => Array.isArray(paginator.value?.data) ? paginator.value.data.length : (paginator.value?.total || 0))
const approvedCount = computed(() => Array.isArray(paginator.value?.data) ? paginator.value.data.filter(x => x.is_approved).length : 0)
const pendingCount = computed(() => Array.isArray(paginator.value?.data) ? paginator.value.data.filter(x => !x.is_approved).length : 0)

onMounted(fetchItems)

async function fetchItems() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (q.value) params.set('q', q.value)
    params.set('per_page', perPage.value)
    params.set('page', page.value)
    const res = await api.get('/api/questions?' + params.toString())
    if (res.ok) {
      const json = await res.json()
      paginator.value = json.questions || json.data || json

      // Apply optimistic updates from sessionStorage (edits/deletes)
      try {
        const updatedRaw = sessionStorage.getItem('question:updated')
        if (updatedRaw) {
          const updated = JSON.parse(updatedRaw)
          if (paginator.value?.data && Array.isArray(paginator.value.data)) {
            const i = paginator.value.data.findIndex(x => String(x.id) === String(updated.id))
            if (i !== -1) paginator.value.data[i] = { ...paginator.value.data[i], ...updated }
          }
          sessionStorage.removeItem('question:updated')
        }

        const deletedRaw = sessionStorage.getItem('question:deleted')
        if (deletedRaw) {
          const deleted = JSON.parse(deletedRaw)
          if (paginator.value?.data && Array.isArray(paginator.value.data)) {
            paginator.value.data = paginator.value.data.filter(x => String(x.id) !== String(deleted.id))
          }
          sessionStorage.removeItem('question:deleted')
        }
      } catch (e) {
        // ignore JSON errors
      }
    } else {
      alert.push({ type: 'error', message: 'Failed to load questions', icon: 'heroicons:exclamation-circle' })
    }
  } catch (e) {
    alert.push({ type: 'error', message: 'Network error', icon: 'heroicons:x-circle' })
  }
  loading.value = false
}

function statusLabel(v) { return v ? 'Approved' : 'Pending Review' }
function statusColor(v) { return v ? 'green' : 'yellow' }

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
    const res = await api.postJson(`/api/questions/${item.id}/request-approval`, {})
    if (api.handleAuthStatus(res)) { item.approval_requested_at = prevRequested; alert.push({ type: 'warning', message: 'Session expired — please sign in again' }); return }
    if (res.ok) alert.push({ type: 'success', message: 'Approval requested', icon: 'heroicons:check-circle' })
    else { item.approval_requested_at = prevRequested; alert.push({ type: 'error', message: 'Failed to request approval', icon: 'heroicons:exclamation-circle' }) }
  } catch (e) { item.approval_requested_at = prevRequested; alert.push({ type: 'error', message: 'Network error', icon: 'heroicons:x-circle' }) }
}

function onPageChange(p) {
  page.value = p
  fetchItems()
}

function goToCreate() {
  router.push('/quiz-master/questions/create')
}

function goToEdit(item) {
  // navigate to edit page for the question
  router.push(`/quiz-master/questions/${item.id}/edit`)
}

async function deleteQuestion(id) {
  try {
    const res = await api.del(`/api/questions/${id}`)
    if (api.handleAuthStatus(res)) { throw new Error('Session expired') }
    if (!res.ok) throw new Error('Delete failed')
    // remove from paginator.data if present
    if (paginator.value?.data && Array.isArray(paginator.value.data)) {
      paginator.value.data = paginator.value.data.filter(x => String(x.id) !== String(id))
    }
    alert.push({ type: 'success', message: 'Question deleted', icon: 'heroicons:check-circle' })
  } catch (e) {
    alert.push({ type: 'error', message: e?.message || 'Delete failed', icon: 'heroicons:exclamation-circle' })
    throw e
  }
}

function confirmDelete(item) {
  // simple confirm dialog; you can replace with modal later
  if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) return
  // optimistic removal: keep a copy
  const prev = paginator.value?.data ? [...paginator.value.data] : null
  if (paginator.value?.data && Array.isArray(paginator.value.data)) {
    paginator.value.data = paginator.value.data.filter(x => String(x.id) !== String(item.id))
  }
  deleteQuestion(item.id).catch(() => {
    // rollback on failure
    if (prev) paginator.value.data = prev
  })
}

</script>

<style scoped></style>
