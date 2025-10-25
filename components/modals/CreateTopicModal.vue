<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-6">
    <div class="absolute inset-0 bg-black/50" @click="close"></div>
    <!-- Mobile: near full-screen scrollable panel with small margins; on larger screens center with max width -->
    <div class="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6 z-10 mx-auto my-6 h-auto max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div class="flex items-start justify-between mb-4">
        <h3 class="text-lg font-semibold">Create New Topic</h3>
        <button @click="close" aria-label="Close" class="p-1.5 rounded-md text-gray-500 hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
        </button>
      </div>
      <div v-if="!createdTopic" class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700">Name</label>
          <input v-model="name" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Level</label>
          <select v-model="levelId" class="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md">
            <option value="">-- Select Level --</option>
            <option v-for="l in levelList" :key="l.id" :value="l.id">{{ l.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Grade</label>
          <select v-model="gradeId" class="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md">
            <option value="">-- Select Grade --</option>
            <option v-for="g in gradeList" :key="g.id" :value="g.id">{{ g.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Description (optional)</label>
          <UTextarea v-model="description" rows="3" class="mt-1 block w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Subject</label>
          <select v-model="subjectId" class="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md">
            <option value="">-- Select Subject --</option>
            <!-- subjects provided by composable are normalized arrays -->
            <option v-for="s in filteredSubjectList" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
        <div class="mt-2">
          <label class="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="localRequestApproval" class="rounded" />
            <span>Request approval immediately after creating</span>
          </label>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div class="rounded-md bg-gray-50 p-3">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium">Topic created</div>
              <div class="text-sm text-gray-600">{{ createdTopic.name }}</div>
            </div>
            <div>
              <span v-if="createdTopic.is_approved" class="inline-flex items-center px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-xs">Approved</span>
              <span v-else-if="createdTopic.approval_requested_at" class="inline-flex items-center px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs">Approval requested</span>
              <span v-else class="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">Pending approval</span>
            </div>
          </div>
        </div>

        <div v-if="!createdTopic.is_approved" class="space-y-2">
          <p class="text-sm text-gray-600">This topic is not approved yet. You can request approval now so an admin can review it.</p>
          <div class="flex gap-2">
            <UButton :loading="approvalRequestLoading" color="primary" @click="requestApproval" class="justify-center">Request approval</UButton>
            <UButton variant="outline" @click="closeAfterCreated" class="justify-center">Done</UButton>
          </div>
        </div>

        <div v-else class="flex justify-end">
          <UButton color="primary" @click="closeAfterCreated">Done</UButton>
        </div>
      </div>

      <div v-if="!createdTopic" class="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
        <UButton variant="outline" color="gray" @click="close" class="w-full sm:w-auto justify-center" :disabled="waitingConfirmation">Cancel</UButton>
        <UButton :loading="submitting || waitingConfirmation" :disabled="!name || !subjectId || waitingConfirmation" @click="create" class="w-full sm:w-auto justify-center">Create Topic</UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import UTextarea from '~/components/ui/UiTextarea.vue'
import { useRuntimeConfig } from '#imports'
import useApi from '~/composables/useApi'
import useTaxonomy from '~/composables/useTaxonomy'
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  subjects: { type: [Array, Object], default: () => [] },
  defaultSubjectId: { type: [Number, String], default: null },
  // allow parent to pass a default level id so modal opens pre-selected
  defaultLevelId: { type: [Number, String], default: null },
  grades: { type: [Array, Object], default: () => [] },
  defaultGradeId: {
    type: [Number, String],
    default: null,
    validator: value => value === null || value === '' || !Number.isNaN(Number(value))
  },
  // if true the checkbox will be checked by default and the modal will send request_approval
  requestApprovalImmediately: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'created'])
const name = ref('')
const description = ref('')
function normalizeGradeId(value) {
  return value === null || value === '' ? '' : Number(value)
}
const gradeId = ref(normalizeGradeId(props.defaultGradeId))
// Normalize level id from parent when provided
function normalizeLevelId(v) {
  if (v === null || v === undefined || v === '') return ''
  const n = Number(v)
  return Number.isNaN(n) ? String(v) : n
}
const levelId = ref(normalizeLevelId(props.defaultLevelId) || '')
// Normalize subjectId: keep as null/number when possible, but allow string input from parent
function normalizeSubjectId(v) {
  if (v === null || v === undefined || v === '') return ''
  // prefer numeric id when it's a numeric string
  const n = Number(v)
  return Number.isNaN(n) ? String(v) : n
}
const subjectId = ref(normalizeSubjectId(props.defaultSubjectId) || '')
const submitting = ref(false)
const waitingConfirmation = ref(false)
const createdTopic = ref(null)
const approvalRequestLoading = ref(false)
const localRequestApproval = ref(props.requestApprovalImmediately || false)
const config = useRuntimeConfig()

watch(() => props.defaultSubjectId, v => { subjectId.value = normalizeSubjectId(v) || '' })
watch(() => props.defaultGradeId, v => { gradeId.value = normalizeGradeId(v) })
watch(() => props.defaultLevelId, v => { levelId.value = normalizeLevelId(v) || '' })

// when parent closes the modal (modelValue becomes false) clear internal state and stop waiting
watch(() => props.modelValue, (nv) => {
  if (!nv) {
    waitingConfirmation.value = false
    clear()
  }
})

const { fetchGrades, fetchAllSubjects, grades: taxGrades, subjects: taxSubjects, fetchLevels, levels: taxLevels, fetchSubjectsByGrade, fetchTopicsBySubject } = useTaxonomy()

onMounted(async () => {
  // ensure levels are available for the level select, then load grades/subjects if parent didn't provide them
  await fetchLevels()
  if ((!props.grades || (Array.isArray(props.grades) && props.grades.length === 0)) ) {
    await fetchGrades()
  }
  if ((!props.subjects || (Array.isArray(props.subjects) && props.subjects.length === 0)) ) {
    await fetchAllSubjects()
  }
  // If a defaultSubjectId was provided, and gradeId is not set, try to pre-select the
  // corresponding grade so the grade/subject selects are consistent and downstream
  // components (parent) receive a topic with the correct subject/grade.
  try {
    const sid = normalizeSubjectId(props.defaultSubjectId)
    if (sid && !gradeId.value) {
      const all = subjectList.value || taxSubjects.value || []
      const found = all.find(x => String(x.id) === String(sid) || String(x.id) === String(props.defaultSubjectId))
      if (found && (found.grade_id || found.grade || found.gradeId)) {
        gradeId.value = normalizeGradeId(found.grade_id ?? found.grade ?? found.gradeId)
      }
      // finally ensure subjectId internal state matches provided default
      subjectId.value = sid
    }
  } catch (e) { /* ignore */ }
})

// prefer parent-provided lists, otherwise use normalized lists from composable
// local level selection to filter grades

// level list: prefer parent-provided levels, otherwise taxonomy levels
const levelList = computed(() => (Array.isArray(props.levels) && props.levels.length) ? props.levels : (taxLevels.value || []))

// grade list: prefer parent-provided, otherwise use taxonomy grades; if a level is selected, filter grades by that level
const gradeList = computed(() => {
  const raw = (Array.isArray(props.grades) && props.grades.length) ? props.grades : (taxGrades.value || [])
  if (levelId.value) {
    return (raw || []).filter(g => String(g.level_id || g.levelId || g.level || '') === String(levelId.value))
  }
  return raw
})
const subjectList = computed(() => (Array.isArray(props.subjects) && props.subjects.length) ? props.subjects : taxSubjects.value)

// Filtered subject list depending on selected grade to avoid using `v-if` inside the
// v-for (which can lead to render-time scoping issues). This returns only subjects
// matching the selected grade (or all when no grade is selected).
const filteredSubjectList = computed(() => {
  const list = subjectList.value || []
  if (!gradeId.value) return list
  return list.filter(s => String(s.grade_id || s.grade || '') === String(gradeId.value))
})

// when gradeId changes, request subjects filtered by that grade from server
watch(gradeId, (nv) => {
  try { fetchSubjectsByGrade(nv) } catch (e) {}
})

// If subjectId changes (either by parent default or user selection) and gradeId
// is empty, attempt to set gradeId automatically from the subject metadata so the
// grade select stays in sync.
watch(subjectId, (nv) => {
  if (!nv) return
  try {
    const all = subjectList.value || taxSubjects.value || []
    const found = all.find(x => String(x.id) === String(nv) || String(x.id) === String(props.defaultSubjectId))
    if (found && !gradeId.value && (found.grade_id || found.grade || found.gradeId)) {
      gradeId.value = normalizeGradeId(found.grade_id ?? found.grade ?? found.gradeId)
    }
  } catch (e) {}
})

// when subjectId changes, request topics for that subject so other components can pick them
watch(subjectId, (nv) => {
  try { fetchTopicsBySubject(nv) } catch (e) {}
})

function close() { emit('update:modelValue', false); clear() }
function clear() { name.value=''; description.value=''; subjectId.value = normalizeSubjectId(props.defaultSubjectId) || ''; levelId.value = normalizeLevelId(props.defaultLevelId) || ''; gradeId.value = normalizeGradeId(props.defaultGradeId) }

async function create() {
  if (!name.value || !subjectId.value) return
  submitting.value = true
  try {
    const payload = { name: name.value, description: description.value, subject_id: normalizeSubjectId(subjectId.value), grade_id: normalizeGradeId(gradeId.value) }
    // debug: show whether XSRF token exists and cookie keys
    try {
      const token = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
      console.debug('[CreateTopicModal] XSRF present:', !!token, 'cookieKeys:', document.cookie.split(';').map(s=>s.trim().split('=')[0]))
    } catch(e) { console.debug('[CreateTopicModal] cookie read failed', e) }

    // Use composable to ensure CSRF cookie and send headers
    const api = useApi()
    // If the user opted-in via checkbox, include flag to request approval immediately
  if (localRequestApproval) payload.request_approval = true
  const res = await api.postJson('/api/topics', payload)
    if (res.ok) {
      const json = await res.json().catch(() => null)
      const created = json?.topic || json || null
      // store locally and notify parent
      createdTopic.value = created
      emit('created', created)
    } else {
      const t = await res.text().catch(()=>null)
      console.error('Failed to create topic', t)
      // keep modal open for retry
    }
  } catch (e) {
    console.error('Create topic error', e)
  } finally { submitting.value = false }
}

async function requestApproval() {
  approvalRequestLoading.value = true
  try {
    const api = useApi()
    if (!createdTopic.value || !createdTopic.value.id) {
      // Topic not yet created: create it and request approval in one call
  const payload = { name: name.value, description: description.value, subject_id: normalizeSubjectId(subjectId.value), grade_id: normalizeGradeId(gradeId.value), request_approval: true }
      const res = await api.postJson('/api/topics', payload)
      if (res.ok) {
        const json = await res.json().catch(() => null)
        createdTopic.value = json?.topic || json || null
        emit('created', createdTopic.value)
      } else {
        console.error('Failed to create & request approval')
      }
    } else {
      const res = await api.postJson(`/topics/${createdTopic.value.id}/request-approval`, {})
      if (res.ok) {
        createdTopic.value.approval_requested_at = new Date().toISOString()
        emit('created', createdTopic.value)
      } else {
        console.error('Request approval failed')
      }
    }
  } catch (e) {
    console.error('Request approval error', e)
  } finally {
    approvalRequestLoading.value = false
  }
}

function closeAfterCreated() {
  // If created and approved (auto), close and leave selection to parent
  emit('update:modelValue', false)
  // reset local state after closing
  setTimeout(() => { createdTopic.value = null; waitingConfirmation.value = false }, 200)
}
</script>

<style scoped></style>
