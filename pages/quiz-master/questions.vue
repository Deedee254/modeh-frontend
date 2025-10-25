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

    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <aside class="lg:col-span-1 order-2 lg:order-1">
          <div class="sticky top-6">
            <FiltersSidebar
              :grade-options="grades"
              :subject-options="subjects"
              :grade="selectedGrade"
              :subject="selectedSubject"
              storageKey="filters:quiz-master-questions"
              @update:grade="val => onFilterChange('grade', val)"
              @update:subject="val => onFilterChange('subject', val)"
              @update:topic="val => onFilterChange('topic', val)"
              @apply="() => { page.value = 1; fetchItems() }"
              @clear="() => { selectedGrade.value = ''; selectedSubject.value = ''; page.value = 1; fetchItems() }"
            />
            <div class="mt-4">
              <UInput v-model="q" @keyup.enter="fetchItems" placeholder="Search questions..." icon="i-heroicons-magnifying-glass" class="w-full" />
            </div>
            <div class="mt-3">
              <USelect v-model.number="perPage" @change="fetchItems" :options="[{label: '5 per page', value: 5}, {label: '10 per page', value: 10}, {label: '20 per page', value: 20}]" class="w-full" />
            </div>
          </div>
        </aside>

        <main class="lg:col-span-3 order-1 lg:order-2 min-w-0">
          <!-- Controls: Search, Sort, Per Page -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div class="flex-1">
              <UInput v-model="q" @keyup.enter="fetchItems" placeholder="Search questions..." icon="i-heroicons-magnifying-glass" />
            </div>
            <div class="flex items-center gap-3">
              <USelectMenu v-model="sortBy" :options="sortOptions" class="w-40" />
              <USelect v-model.number="perPage" @change="fetchItems" :options="[{label: '5/page', value: 5}, {label: '10/page', value: 10}, {label: '20/page', value: 20}]" class="w-28" />
            </div>
          </div>

          <!-- List -->
          <div v-if="loading" class="space-y-4">
            <USkeleton v-for="i in perPage" :key="i" class="h-20 w-full" />
          </div>
          <div v-else>
            <div v-if="!sortedQuestions || sortedQuestions.length === 0" class="text-center py-12 text-gray-500">No questions found.</div>
            <div v-else class="space-y-3">
              <UiHorizontalCard
                v-for="(qitem, idx) in sortedQuestions"
                :key="qitem?.id || idx"
                :title="qitem.title || 'Untitled Question'"
                :eyebrow="(qitem.type || 'Question').toUpperCase()"
                :badge="statusLabel(qitem.is_approved)"
              >
                <template #lead>
                  <div class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-lg font-bold text-gray-500 dark:text-gray-400">Q</div>
                </template>

                <div class="text-sm text-slate-600 dark:text-slate-400 space-y-1" v-html="qitem.body"></div>

                <template #meta>
                  <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span class="inline-flex items-center gap-1"><UIcon name="i-heroicons-academic-cap" /> Grade: <strong class="font-semibold">{{ getGradeName(qitem.grade_id) }}</strong></span>
                    <span class="inline-flex items-center gap-1"><UIcon name="i-heroicons-book-open" /> Subject: <strong class="font-semibold">{{ getSubjectName(qitem.subject_id) }}</strong></span>
                    <span class="inline-flex items-center gap-1"><UIcon name="i-heroicons-tag" /> Topic: <strong class="font-semibold">{{ getTopicName(qitem.topic_id) }}</strong></span>
                  </div>
                </template>

                <template #actions>
                  <UButton v-if="!qitem.is_approved" size="xs" variant="outline" color="gray" @click="requestApproval(qitem)" :disabled="!!qitem.approval_requested_at">Request Approval</UButton>
                  <UButton @click.prevent="goToEdit(qitem)" icon="i-heroicons-pencil-square" size="sm" color="gray" variant="ghost" />
                  <UButton v-if="isAdmin" size="sm" color="red" variant="ghost" @click.prevent="confirmDelete(qitem)" icon="i-heroicons-trash" />
                </template>
              </UiHorizontalCard>
            </div>

            <div class="mt-4">
              <Pagination :paginator="paginator" @change-page="onPageChange" />
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- (list is rendered above in the main content column) -->
  </div>
</template>

<script setup>
definePageMeta({ layout: 'quiz-master', meta: [ { name: 'robots', content: 'noindex, nofollow' }, { name: 'description', content: 'Manage your question bank and question settings as a quiz-master.' } ] })
import { ref, onMounted, computed } from 'vue'
import PageHero from '~/components/ui/PageHero.vue'
import { useRouter } from 'vue-router'
import Pagination from '~/components/Pagination.vue'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'
import { useAuthStore } from '~/stores/auth'
import FiltersSidebar from '~/components/FiltersSidebar.vue'
import useTaxonomy from '~/composables/useTaxonomy'

const alert = useAppAlert()
const auth = useAuthStore()
const isAdmin = computed(() => !!auth.user?.is_admin)
const api = useApi()

const paginator = ref(null)
const loading = ref(false)
const q = ref('')
const perPage = ref(10)
const page = ref(1)
const selectedSubject = ref('')
const selectedGrade = ref('')
const selectedTopic = ref('')
const { fetchGrades, fetchAllSubjects, fetchAllTopics, grades: taxGrades, subjects: taxSubjects, topics: taxTopics } = useTaxonomy()
const subjects = computed(() => Array.isArray(taxSubjects.value) ? taxSubjects.value : [])
const grades = computed(() => Array.isArray(taxGrades.value) ? taxGrades.value : [])
const topics = computed(() => Array.isArray(taxTopics.value) ? taxTopics.value : [])

const gradeMap = computed(() => new Map(grades.value.map(g => [g.id, g.name])))

const sortOptions = [
  { label: 'Newest', value: 'created_at:desc' },
  { label: 'Oldest', value: 'created_at:asc' },
  { label: 'Title (A-Z)', value: 'title:asc' },
  { label: 'Title (Z-A)', value: 'title:desc' },
  { label: 'Grade', value: 'grade:asc' },
  { label: 'Subject', value: 'subject:asc' },
  { label: 'Topic', value: 'topic:asc' },
  { label: 'Status', value: 'status:asc' },
]
const sortBy = ref(sortOptions[0].value)

// The user wants to add sorting options to the question list.
// This is a fully client-side sorting implementation.

const subjectMap = computed(() => new Map(subjects.value.map(s => [s.id, s.name])))
const topicMap = computed(() => new Map(topics.value.map(t => [t.id, t.name])))

function getGradeName(id) {
  return gradeMap.value.get(id) || '—'
}
function getSubjectName(id) {
  return subjectMap.value.get(id) || '—'
}
function getTopicName(id) {
  return topicMap.value.get(id) || '—'
}
const router = useRouter()

const totalQuestions = computed(() => Array.isArray(paginator.value?.data) ? paginator.value.data.length : (paginator.value?.total || 0))

const sortedQuestions = computed(() => {
  const data = Array.isArray(paginator.value?.data) ? paginator.value.data.filter(Boolean) : []
  if (!sortBy.value) return data

  const [field, direction] = sortBy.value.split(':')
  const dir = direction === 'desc' ? -1 : 1

  return [...data].sort((a, b) => {
    let valA, valB

    switch (field) {
      case 'title':
        valA = a.title || ''
        valB = b.title || ''
        return valA.localeCompare(valB) * dir
      case 'grade':
        valA = getGradeName(a.grade_id)
        valB = getGradeName(b.grade_id)
        return valA.localeCompare(valB) * dir
      case 'subject':
        valA = getSubjectName(a.subject_id)
        valB = getSubjectName(b.subject_id)
        return valA.localeCompare(valB) * dir
      case 'topic':
        valA = getTopicName(a.topic_id)
        valB = getTopicName(b.topic_id)
        return valA.localeCompare(valB) * dir
      case 'status':
        return (a.is_approved === b.is_approved) ? 0 : a.is_approved ? -1 * dir : 1 * dir
      default: // 'created_at'
        return (new Date(a.created_at) - new Date(b.created_at)) * dir * -1 // desc is default for dates
    }
  })
})
const approvedCount = computed(() => Array.isArray(paginator.value?.data) ? paginator.value.data.filter(x => x.is_approved).length : 0)
const pendingCount = computed(() => Array.isArray(paginator.value?.data) ? paginator.value.data.filter(x => !x.is_approved).length : 0)

onMounted(fetchItems)

async function fetchItems() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (q.value) params.set('q', q.value)
      if (selectedSubject.value) params.set('subject_id', selectedSubject.value)
      if (selectedGrade.value) params.set('grade_id', selectedGrade.value)
      if (selectedTopic.value) params.set('topic_id', selectedTopic.value)
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

function onFilterChange(type, val) {
  if (type === 'grade') selectedGrade.value = val
  if (type === 'subject') selectedSubject.value = val
  page.value = 1
  fetchItems()
}
onMounted(async () => { await Promise.all([fetchGrades(), fetchAllSubjects(), fetchAllTopics()]); fetchItems() })

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
