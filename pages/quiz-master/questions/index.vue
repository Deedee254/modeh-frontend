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
              <div class="overflow-x-auto bg-white rounded shadow">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 w-2/3">Title</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 hidden sm:table-cell">Type</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 hidden sm:table-cell">Level</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 hidden sm:table-cell">Grade</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 hidden sm:table-cell">Subject</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 hidden sm:table-cell">Topic</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 hidden sm:table-cell">Marks</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 hidden sm:table-cell">Quiz</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 hidden sm:table-cell">Status</th>
                      <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-100">
                    <tr v-for="(qitem, idx) in sortedQuestions" :key="qitem?.id || idx">
                      <td class="px-4 py-3 text-sm text-gray-700 whitespace-normal">{{ qitem.title || (qitem.body ? (qitem.body.replace(/<[^>]*>?/gm, '').slice(0, 140) + (qitem.body.length > 140 ? '…' : '')) : 'Untitled') }}</td>
                      <td class="px-4 py-3 text-sm text-gray-500 uppercase hidden sm:table-cell">{{ (qitem.type || 'question').toUpperCase() }}</td>
                      <td class="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{{ getLevelName(qitem.level || qitem.level_id || qitem.level_name) }}</td>
                      <td class="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{{ getGradeName(qitem.grade || qitem.grade_id || qitem.grade_name) }}</td>
                      <td class="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{{ getSubjectName(qitem.subject || qitem.subject_id || qitem.subject_name) }}</td>
                      <td class="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{{ getTopicName(qitem.topic || qitem.topic_id || qitem.topic_name) }}</td>
                      <td class="px-4 py-3 text-sm text-gray-700 hidden sm:table-cell">{{ (qitem.marks !== undefined && qitem.marks !== null) ? Math.round(Number(qitem.marks)) : 0 }}</td>
                      <td class="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{{ getQuizName(qitem) }}</td>
                      <td class="px-4 py-3 text-sm hidden sm:table-cell">
                        <span :class="['inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', qitem.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800']">{{ statusLabel(qitem.is_approved) }}</span>
                      </td>
                      <td class="px-4 py-3 text-right text-sm">
                        <div class="inline-flex items-center space-x-2">
                          <UButton v-if="!qitem.is_approved" size="xs" variant="outline" color="gray" @click="requestApproval(qitem)" :disabled="!!qitem.approval_requested_at" class="hidden sm:inline-flex">Request</UButton>
                          <UButton @click.prevent="goToEdit(qitem)" icon="i-heroicons-pencil-square" size="sm" color="gray" variant="ghost" />
                          <UButton v-if="isAdmin" size="sm" color="red" variant="ghost" @click.prevent="confirmDelete(qitem)" icon="i-heroicons-trash" class="hidden sm:inline-flex" />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="mt-4">
              <Pagination :paginator="paginatorObj" @change-page="onPageChange" />
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

// full questions array returned from server; we paginate client-side
const paginator = ref(null)
const allQuestions = ref([])
const loading = ref(false)
const q = ref('')
const perPage = ref(10)
const page = ref(1)
const selectedSubject = ref('')
const selectedGrade = ref('')
const selectedTopic = ref('')
const { fetchGrades, fetchGradesByLevel, fetchAllSubjects, fetchAllTopics, fetchLevels, grades: taxGrades, subjects: taxSubjects, topics: taxTopics, levels } = useTaxonomy()
const subjects = computed(() => Array.isArray(taxSubjects.value) ? taxSubjects.value : [])
const grades = computed(() => Array.isArray(taxGrades.value) ? taxGrades.value : [])
const topics = computed(() => Array.isArray(taxTopics.value) ? taxTopics.value : [])

const gradeMap = computed(() => new Map(grades.value.map(g => [g.id, g.name])))
const levelMap = computed(() => new Map((typeof levels !== 'undefined' && Array.isArray(levels.value) ? levels.value : []).map(l => [l.id, l.name])))

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

// Accept either an id, a nested object ({ id, name }), or a name string
function resolveName(val, map) {
  if (val === null || typeof val === 'undefined' || val === '') return '—'
  // If backend returned an object like { id, name }
  if (typeof val === 'object') {
    if (!val) return '—'
    if (val.name) return val.name
    if (val.title) return val.title
    if (val.id) return map.value.get(val.id) || String(val.id)
    return '—'
  }
  // If it's a number (id)
  if (typeof val === 'number') return map.value.get(val) || String(val)
  // If it's a numeric string, try lookup by id
  const asNum = Number(val)
  if (!Number.isNaN(asNum) && map.value.has(asNum)) return map.value.get(asNum)
  // Otherwise assume it's already a name string
  if (typeof val === 'string') return val || '—'
  return '—'
}

function getGradeName(v) { return resolveName(v, gradeMap) }
function getSubjectName(v) { return resolveName(v, subjectMap) }
function getTopicName(v) { return resolveName(v, topicMap) }
function getLevelName(v) { return resolveName(v, levelMap) }
function getQuizName(qitem) {
  if (!qitem) return '—'
  if (qitem.quiz && (qitem.quiz.title || qitem.quiz.name)) return qitem.quiz.title || qitem.quiz.name
  if (qitem.quiz_title) return qitem.quiz_title
  if (qitem.quiz_name) return qitem.quiz_name
  // sometimes backend returns quiz_id only
  if (qitem.quiz_id) return `Quiz #${qitem.quiz_id}`
  return '—'
}
const router = useRouter()

const totalQuestions = computed(() => allQuestions.value.length)

// Sort the full array according to sortBy, then paginate client-side
const sortedAll = computed(() => {
  const data = Array.isArray(allQuestions.value) ? allQuestions.value.filter(Boolean) : []
  if (!sortBy.value) return data

  // Handle both string values and object values from USelectMenu
  const sortValue = typeof sortBy.value === 'string' ? sortBy.value : sortBy.value?.value || 'created_at:desc'
  const [field, direction] = sortValue.split(':')
  const dir = direction === 'desc' ? -1 : 1

  return [...data].sort((a, b) => {
    let valA, valB
    switch (field) {
      case 'title':
        valA = a.title || ''
        valB = b.title || ''
        return valA.localeCompare(valB) * dir
      case 'grade':
        valA = getGradeName(a.grade || a.grade_id || a.grade_name)
        valB = getGradeName(b.grade || b.grade_id || b.grade_name)
        return valA.localeCompare(valB) * dir
      case 'subject':
        valA = getSubjectName(a.subject || a.subject_id || a.subject_name)
        valB = getSubjectName(b.subject || b.subject_id || b.subject_name)
        return valA.localeCompare(valB) * dir
      case 'topic':
        valA = getTopicName(a.topic || a.topic_id || a.topic_name)
        valB = getTopicName(b.topic || b.topic_id || b.topic_name)
        return valA.localeCompare(valB) * dir
      case 'status':
        return (a.is_approved === b.is_approved) ? 0 : a.is_approved ? -1 * dir : 1 * dir
      default: // 'created_at'
        return (new Date(a.created_at) - new Date(b.created_at)) * dir * -1 // desc is default for dates
    }
  })
})

// paginatorObj provides the shape expected by Pagination.vue
const paginatorObj = computed(() => {
  const total = sortedAll.value.length
  const last_page = Math.max(1, Math.ceil(total / perPage.value))
  const current_page = Math.min(Math.max(1, page.value), last_page)
  const start = (current_page - 1) * perPage.value
  const data = sortedAll.value.slice(start, start + perPage.value)
  return { data, total, last_page, current_page }
})

const sortedQuestions = computed(() => paginatorObj.value.data)
const approvedCount = computed(() => allQuestions.value.filter(x => x.is_approved).length)
const pendingCount = computed(() => allQuestions.value.filter(x => !x.is_approved).length)


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
      const arr = json.questions || json.data || json || []
      allQuestions.value = Array.isArray(arr) ? arr : []

      // Apply optimistic updates from sessionStorage (edits/deletes)
      try {
        const updatedRaw = sessionStorage.getItem('question:updated')
        if (updatedRaw) {
          const updated = JSON.parse(updatedRaw)
          const i = allQuestions.value.findIndex(x => String(x.id) === String(updated.id))
          if (i !== -1) allQuestions.value[i] = { ...allQuestions.value[i], ...updated }
          sessionStorage.removeItem('question:updated')
        }

        const deletedRaw = sessionStorage.getItem('question:deleted')
        if (deletedRaw) {
          const deleted = JSON.parse(deletedRaw)
          allQuestions.value = allQuestions.value.filter(x => String(x.id) !== String(deleted.id))
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
onMounted(async () => {
  // Load levels first and then prefer fetching grades by saved level if present.
  try {
    await fetchLevels()
  } catch (e) {}

  // If the FiltersSidebar saved a selected level in localStorage, use it to
  // fetch server-filtered grades for that level. Otherwise fall back to
  // fetchGrades() which is levels-first by default.
  try {
    let savedLevel = null
    if (process.client) {
      try { savedLevel = localStorage.getItem('filters:quiz-master-questions:level') || null } catch (e) { savedLevel = null }
    }
    if (savedLevel) {
      await fetchGradesByLevel(savedLevel)
    } else {
      await fetchGrades()
    }
  } catch (e) {}

  await Promise.all([fetchAllSubjects(), fetchAllTopics()])
  fetchItems()
})

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
  // client-side paging; no need to refetch
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
    // remove from full array
    allQuestions.value = allQuestions.value.filter(x => String(x.id) !== String(id))
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
  const prev = [...allQuestions.value]
  allQuestions.value = allQuestions.value.filter(x => String(x.id) !== String(item.id))
  deleteQuestion(item.id).catch(() => {
    // rollback on failure
    allQuestions.value = prev
  })
}

</script>

<style scoped></style>
