<template>
  <div>
    <!-- Inline rendering -->
    <div v-if="isInline" class="p-4 sm:p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">Add from Question Bank</h3>
      </div>

      <div class="flex flex-wrap items-center gap-2 mb-4">
        <UInput v-model="q" placeholder="Search..." size="sm" class="w-64" @keydown.enter="fetchItems"></UInput>
        <USelect v-model="selectedGrade" :options="gradeOptions" size="sm" class="w-36" placeholder="Grade"></USelect>
        <USelect v-model="selectedSubject" :options="subjectOptions" size="sm" class="w-36" placeholder="Subject" :disabled="!selectedGrade"></USelect>
        <USelect v-model="selectedTopic" :options="topicOptions" size="sm" class="w-36" placeholder="Topic" :disabled="!selectedSubject"></USelect>
        <USelect v-model="perPage" :options="perPageOpts" size="sm" class="w-28"></USelect>
        <UButton size="sm" @click="fetchItems">Search</UButton>
      </div>

      <div v-if="loading"><UiSkeleton variant="list" :count="4"></UiSkeleton></div>
      <div v-else>
        <div v-if="items.length===0" class="text-gray-500">No questions found.</div>
        <div class="space-y-3">
          <div v-for="it in items" :key="it.id" class="border rounded p-3 flex items-start gap-3">
            <input type="checkbox" v-model="selectedIds" :value="it.id" class="mt-1" />
            <div class="flex-1">
              <div class="font-medium">{{ it.title || it.type }}</div>
              <div class="prose max-w-none text-sm" v-html="it.body || it.text"></div>
              <div class="mt-2 flex items-center gap-2">
                <UButton size="2xs" @click="() => add(it)">Add</UButton>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-3 flex items-center justify-between">
          <div>
            <UButton size="sm" color="primary" :disabled="!selectedIds.length" @click="addSelected">Add selected ({{ selectedIds.length }})</UButton>
          </div>
          <div class="text-sm text-gray-600">Tip: use filters to narrow results</div>
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-gray-600">{{ paginator?.total || 0 }} results</div>
        <div class="flex items-center gap-2">
          <UButton size="xs" color="gray" :disabled="page<=1" @click="() => { page--; fetchItems() }">Prev</UButton>
          <span class="text-sm">Page {{ page }}</span>
          <UButton size="xs" color="gray" :disabled="page>=maxPage" @click="() => { page++; fetchItems() }">Next</UButton>
        </div>
      </div>
    </div>

    <!-- Modal rendering -->
    <UModal v-else v-model="open" :ui="{ width: 'sm:max-w-4xl' }">
      <div class="p-4 sm:p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Add from Question Bank</h3>
          <UButton color="gray" variant="ghost" @click="open=false">Close</UButton>
        </div>

        <div class="flex flex-wrap items-center gap-2 mb-4">
          <UInput v-model="q" placeholder="Search..." size="sm" class="w-64" @keydown.enter="fetchItems"></UInput>
          <USelect v-model="selectedGrade" :options="gradeOptions" size="sm" class="w-36" placeholder="Grade"></USelect>
          <USelect v-model="selectedSubject" :options="subjectOptions" size="sm" class="w-36" placeholder="Subject" :disabled="!selectedGrade"></USelect>
          <USelect v-model="selectedTopic" :options="topicOptions" size="sm" class="w-36" placeholder="Topic" :disabled="!selectedSubject"></USelect>
          <USelect v-model="perPage" :options="perPageOpts" size="sm" class="w-28"></USelect>
          <UButton size="sm" @click="fetchItems">Search</UButton>
        </div>

        <div v-if="loading"><UiSkeleton variant="list" :count="4"></UiSkeleton></div>
        <div v-else>
          <div v-if="items.length===0" class="text-gray-500">No questions found.</div>
          <div class="space-y-3">
            <div v-for="it in items" :key="it.id" class="border rounded p-3 flex items-start gap-3">
              <input type="checkbox" v-model="selectedIds" :value="it.id" class="mt-1" />
              <div class="flex-1">
                <div class="font-medium">{{ it.title || it.type }}</div>
                <div class="prose max-w-none text-sm" v-html="it.body || it.text"></div>
                <div class="mt-2 flex items-center gap-2">
                  <UButton size="2xs" @click="() => add(it)">Add</UButton>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-3 flex items-center justify-between">
            <div>
              <UButton size="sm" color="primary" :disabled="!selectedIds.length" @click="addSelected">Add selected ({{ selectedIds.length }})</UButton>
            </div>
            <div class="text-sm text-gray-600">Tip: use filters to narrow results</div>
          </div>
        </div>

        <div class="mt-4 flex items-center justify-between">
          <div class="text-sm text-gray-600">{{ paginator?.total || 0 }} results</div>
          <div class="flex items-center gap-2">
            <UButton size="xs" color="gray" :disabled="page<=1" @click="() => { page--; fetchItems() }">Prev</UButton>
            <span class="text-sm">Page {{ page }}</span>
            <UButton size="xs" color="gray" :disabled="page>=maxPage" @click="() => { page++; fetchItems() }">Next</UButton>
          </div>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import { useRuntimeConfig } from '#imports'

const props = defineProps<{ modelValue: boolean, gradeOptions?: any[], subjectOptions?: any[], topicOptions?: any[], inline?: boolean }>()
const emit = defineEmits(['update:modelValue', 'add'])

const open = ref(props.modelValue)
watch(() => props.modelValue, v => open.value = v)
watch(open, v => emit('update:modelValue', v))

// If rendered inline, parent controls visibility by passing modelValue and inline=true
const isInline = computed(() => !!props.inline)

const q = ref('')
const perPage = ref(10)
const page = ref(1)
const items = ref<any[]>([])
const paginator = ref<any>(null)
const loading = ref(false)
const selectedGrade = ref('')
const selectedSubject = ref('')
const selectedTopic = ref('')
const selectedIds = ref<any[]>([])
const perPageOpts = [5,10,20].map(v => ({ label: String(v), value: v }))
const maxPage = computed(() => paginator.value ? Math.ceil((paginator.value.total || 0) / (paginator.value.per_page || 10)) : 1)
const config = useRuntimeConfig()
// Debounce timers to avoid rapid repeated fetches
const _debounceTimers = {
  grade: null as any,
  subject: null as any,
}

// Track in-flight fetches by key (url) to avoid duplicate simultaneous requests
const _inFlight = new Map<string, Promise<any>>()
// Accept options from parent (create.vue) to avoid duplicate fetching. If not provided, we'll load.
const gradeOptions = ref<any[]>(props.gradeOptions && props.gradeOptions.length ? props.gradeOptions : [])
const subjectOptions = ref<any[]>(props.subjectOptions && props.subjectOptions.length ? props.subjectOptions : [])
const topicOptions = ref<any[]>(props.topicOptions && props.topicOptions.length ? props.topicOptions : [])

// load taxonomy options for filters
// If props not supplied, load taxonomy root lists (grades). We'll load subjects/topics on demand via server driven APIs.
async function loadTaxonomy() {
  try {
    if (!props.gradeOptions || !props.gradeOptions.length) {
      const gRes = await fetch(config.public.apiBase + '/api/grades', { credentials: 'include' })
      if (gRes.ok) {
        const j = await gRes.json()
        const data = j.grades || j.data || []
        gradeOptions.value = Array.isArray(data) ? data.map(g => ({ label: g.name || `Grade ${g.id}`, value: g.id })) : []
      }
    }
    // if parent provided subjects/topics, we keep them; otherwise we'll fetch subjects/topics when the user selects a grade/subject
  } catch (e) {
    // ignore
  }
}

async function fetchItems() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (q.value) params.set('q', q.value)
    params.set('per_page', String(perPage.value))
    params.set('page', String(page.value))
    if (selectedGrade.value) params.set('grade', String(selectedGrade.value))
    if (selectedSubject.value) params.set('subject', String(selectedSubject.value))
    if (selectedTopic.value) params.set('topic', String(selectedTopic.value))
  const res = await fetch(config.public.apiBase + '/api/question-bank?' + params.toString(), { credentials: 'include' })
    if (res.ok) {
      const json = await res.json()
      paginator.value = json.questions || json
      items.value = paginator.value.data || []
    } else {
      items.value = []
    }
  } catch {
    items.value = []
  }
  loading.value = false
}

function add(it: any) {
  // Normalize to the builder shape
  const q = {
    uid: Math.random().toString(36).slice(2),
    type: (it.type?.startsWith('mcq') ? it.type : (it.type || 'mcq')),
    text: it.body || it.text || '',
    options: Array.isArray(it.options) ? it.options : [],
    correct: Array.isArray(it.answers) && it.answers.length ? it.answers[0] : -1,
    corrects: Array.isArray(it.answers) ? it.answers : [],
    difficulty: Number(it.difficulty || 2),
    marks: Number(it.marks || 1),
    fill_parts: it.fill_parts || ['', ''],
    media: null,
    explanation: it.explanation || '',
    open: true,
    is_banked: true,
  }
  emit('add', q)
}

function addSelected() {
  if (!selectedIds.value.length) return
  // find items by id and emit array
  const found = items.value.filter(it => selectedIds.value.includes(it.id))
  if (found.length) {
    // normalize each and emit as an array
    const normalized = found.map(it => ({
      uid: Math.random().toString(36).slice(2),
      type: (it.type?.startsWith('mcq') ? it.type : (it.type || 'mcq')),
      text: it.body || it.text || '',
      options: Array.isArray(it.options) ? it.options : [],
      correct: Array.isArray(it.answers) && it.answers.length ? it.answers[0] : -1,
      corrects: Array.isArray(it.answers) ? it.answers : [],
      difficulty: Number(it.difficulty || 2),
      marks: Number(it.marks || 1),
      fill_parts: it.fill_parts || ['', ''],
      media: null,
      explanation: it.explanation || '',
      open: true,
      is_banked: true,
    }))
    emit('add', normalized)
    // clear selection
    selectedIds.value = []
  }
}

onMounted(fetchItems)
onMounted(loadTaxonomy)

// Reset dependent selects when parent changes
// When a grade is selected, if subjects were not provided by parent, fetch from server for that grade.
watch(selectedGrade, (val) => {
  selectedSubject.value = ''
  selectedTopic.value = ''
  if (!val) return

  // debounce grade -> subjects fetch
  if (_debounceTimers.grade) clearTimeout(_debounceTimers.grade)
  _debounceTimers.grade = setTimeout(async () => {
    if (props.subjectOptions && props.subjectOptions.length) {
      subjectOptions.value = props.subjectOptions.filter(s => String(s.grade_id) === String(val))
      return
    }

    const url = config.public.apiBase + '/api/subjects?grade=' + encodeURIComponent(val)
    if (_inFlight.has(url)) {
      // another identical request is in flight; skip
      return
    }
    const p = (async () => {
      try {
        const res = await fetch(url, { credentials: 'include' })
        if (res.ok) {
          const j = await res.json()
          const data = j.subjects || j.data || []
          subjectOptions.value = Array.isArray(data) ? data.map(s => ({ label: s.name || s.title || s.id, value: s.id, grade_id: s.grade_id })) : []
        }
      } catch (e) {
        // ignore errors
      } finally {
        _inFlight.delete(url)
      }
    })()
    _inFlight.set(url, p)
  }, 250)
})

// When a subject is selected, fetch topics for that subject if parent didn't supply topics
watch(selectedSubject, (val) => {
  selectedTopic.value = ''
  if (!val) return

  if (_debounceTimers.subject) clearTimeout(_debounceTimers.subject)
  _debounceTimers.subject = setTimeout(async () => {
    if (props.topicOptions && props.topicOptions.length) {
      topicOptions.value = props.topicOptions.filter(t => String(t.subject_id) === String(val))
      return
    }

    const url = config.public.apiBase + '/api/topics?subject=' + encodeURIComponent(val)
    if (_inFlight.has(url)) return
    const p = (async () => {
      try {
        const res = await fetch(url, { credentials: 'include' })
        if (res.ok) {
          const j = await res.json()
          const data = j.topics || j.data || []
          topicOptions.value = Array.isArray(data) ? data.map(t => ({ label: t.name || t.title || t.id, value: t.id, subject_id: t.subject_id })) : []
        }
      } catch (e) {
        // ignore
      } finally {
        _inFlight.delete(url)
      }
    })()
    _inFlight.set(url, p)
  }, 250)
})
// TODO: load filter options (grades/subjects/topics) from API if available
</script>