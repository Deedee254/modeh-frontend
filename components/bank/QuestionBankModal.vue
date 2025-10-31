<template>
  <div>
    <!-- Inline rendering -->
    <div v-if="isInline" class="p-4 sm:p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">Add from Question Bank</h3>
      </div>

      <div class="flex flex-wrap items-center gap-2 mb-4">
        <UInput v-model="q" placeholder="Search..." size="sm" class="w-64" @keydown.enter="fetchItems"></UInput>
        <USelect v-model="selectedLevel" :options="levelOptions" size="sm" class="w-36" placeholder="Level"></USelect>
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
          <USelect v-model="selectedLevel" :options="levelOptions" size="sm" class="w-36" placeholder="Level"></USelect>
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
import { useTaxonomyStore } from '~/stores/taxonomyStore'
import useTaxonomy from '~/composables/useTaxonomy'

const props = defineProps<{ modelValue: boolean, gradeOptions?: any[], subjectOptions?: any[], topicOptions?: any[], levelOptions?: any[], inline?: boolean, initialFilters?: any }>()
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
const selectedLevel = ref('')
const selectedIds = ref<any[]>([])
const perPageOpts = [5,10,20].map(v => ({ label: String(v), value: v }))
const maxPage = computed(() => paginator.value ? Math.ceil((paginator.value.total || 0) / (paginator.value.per_page || 10)) : 1)
const taxonomyStore = useTaxonomyStore()
const taxonomy = useTaxonomy()
const { fetchLevels } = taxonomy
const taxLevels = computed(() => taxonomy.levels)
const { fetchGrades, fetchGradesByLevel, fetchSubjectsByGrade, fetchTopicsBySubject } = taxonomyStore
const taxGrades = computed(() => taxonomyStore.grades)
const taxSubjects = computed(() => taxonomyStore.subjects)
const taxTopics = computed(() => taxonomyStore.topics)
const loadingGrades = computed(() => taxonomyStore.loadingGrades)
const loadingSubjects = computed(() => taxonomyStore.loadingSubjects)
const loadingTopics = computed(() => taxonomyStore.loadingTopics)
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
// Support levels passed from parent; normalize into { label, value } when necessary
const levelOptions = ref<any[]>(props.levelOptions && props.levelOptions.length ? props.levelOptions : [])
if (props.levelOptions && Array.isArray(props.levelOptions) && props.levelOptions.length && !(props.levelOptions[0].label && props.levelOptions[0].value)) {
  levelOptions.value = props.levelOptions.map((l: any) => ({ label: l.name || l.title || String(l.id), value: l.id }))
}

// load taxonomy options for filters
// If props not supplied, load taxonomy root lists (grades). We'll load subjects/topics on demand via server driven APIs.
async function loadTaxonomy() {
  try {
    // Prefer fetching levels first — levels are the top-most taxonomy and may
    // include nested grades/subjects. This avoids an unconditional grades
    // fetch and aligns with server-filtered grade-by-level behavior.
    await fetchLevels()
    // populate levelOptions if not provided by parent
    if ((!props.levelOptions || !props.levelOptions.length) && Array.isArray(taxLevels.value)) {
      const lv = (taxLevels.value as any[])
      levelOptions.value = lv.map(l => ({ label: l.name || l.display_name || String(l.id), value: l.id }))
      // If levels include nested grades, build a flat grade list so the UI
      // can show an initial unfiltered grade list. Otherwise leave gradeOptions
      // empty so users pick a level first and we fetch grades by level on demand.
      const nestedGrades = lv.reduce((acc: any[], l: any) => {
        if (Array.isArray(l.grades) && l.grades.length) {
          for (const g of l.grades) acc.push({ ...g, level_id: l.id })
        }
        return acc
      }, [])
      if (nestedGrades.length) {
        gradeOptions.value = nestedGrades.map(g => ({ label: g.name || `Grade ${g.id}`, value: g.id, level_id: g.level_id }))
      } else {
        gradeOptions.value = []
      }
    }
    // keep subject/topic props if provided; otherwise subject/topic lists will be fetched on demand
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
    if (selectedLevel.value) params.set('level_id', String(selectedLevel.value))
    if (selectedGrade.value) params.set('grade_id', String(selectedGrade.value))
    if (selectedSubject.value) params.set('subject_id', String(selectedSubject.value))
    if (selectedTopic.value) params.set('topic_id', String(selectedTopic.value))
  const runtime = useRuntimeConfig()
  const res = await fetch(runtime.public.apiBase + '/api/question-bank?' + params.toString(), { credentials: 'include' })
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

// Normalize and validate a question type coming from the bank. Defensive: avoid
// calling string methods on non-strings and fall back to a safe default.
const allowedTypes = new Set(['mcq','multi','short','numeric','fill_blank','math','code'])
function normalizeType(raw: any) {
  if (typeof raw === 'string') {
    const s = raw.trim()
    // preserve known types; if it's a variant like 'mcq_single' that starts with 'mcq'
    // we allow that form to pass through; otherwise coerce to baseline types when unknown
    if (s.startsWith('mcq')) return s
    if (allowedTypes.has(s)) return s
    // some payloads may have capitalized labels
    const low = s.toLowerCase()
    if (allowedTypes.has(low)) return low
    // unknown string -> default to 'mcq'
    return 'mcq'
  }
  // if it's an object with a name/type field, try extracting a string
  if (raw && typeof raw === 'object') {
    const candidate = raw.type ?? raw.name ?? raw.label ?? null
    if (typeof candidate === 'string') return normalizeType(candidate)
  }
  // otherwise default
  return 'mcq'
}

function add(it: any) {
  // Normalize to the builder shape
  const q = {
    uid: Math.random().toString(36).slice(2),
    type: normalizeType(it.type),
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
      type: normalizeType(it.type),
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

onMounted(async () => {
  // Initialize filters from props.initialFilters if provided
  try {
    if (props.initialFilters) {
      selectedLevel.value = props.initialFilters.level ?? ''
      selectedGrade.value = props.initialFilters.grade ?? ''
      selectedSubject.value = props.initialFilters.subject ?? ''
      selectedTopic.value = props.initialFilters.topic ?? ''
    }
  } catch (e) {}
  await Promise.all([fetchItems(), loadTaxonomy()])
})

// Reset dependent selects when parent changes
// When a grade is selected, if subjects were not provided by parent, fetch from server for that grade.
watch(selectedGrade, (val) => {
  selectedSubject.value = ''
  selectedTopic.value = ''
  subjectOptions.value = []
  if (!val) return
  if (_debounceTimers.grade) clearTimeout(_debounceTimers.grade)
  _debounceTimers.grade = setTimeout(async () => {
    if (props.subjectOptions && props.subjectOptions.length) {
      subjectOptions.value = props.subjectOptions.filter(s => String(s.grade_id) === String(val))
      return
    }
  await fetchSubjectsByGrade(val)
  subjectOptions.value = Array.isArray(taxSubjects.value) ? (taxSubjects.value as any[]).map(s => ({ label: (s as any).name || (s as any).title || (s as any).id, value: (s as any).id, grade_id: (s as any).grade_id })) : []
  }, 250)
})

// When a level is selected, fetch grades filtered by that level and reset dependent selects
watch(selectedLevel, (val) => {
  selectedGrade.value = ''
  selectedSubject.value = ''
  selectedTopic.value = ''
  gradeOptions.value = []
  if (!val) return
  if (_debounceTimers.grade) clearTimeout(_debounceTimers.grade)
  _debounceTimers.grade = setTimeout(async () => {
    // If parent supplied gradeOptions, filter that list first
    if (props.gradeOptions && props.gradeOptions.length) {
      gradeOptions.value = props.gradeOptions.filter(g => String(g.level_id ?? g.level ?? '') === String(val))
      return
    }
    // Use server-side filtered grades if available
    if (typeof fetchGradesByLevel === 'function') {
      await fetchGradesByLevel(val)
      if (Array.isArray(taxGrades.value)) {
        const tg = taxGrades.value as any[]
        gradeOptions.value = tg.map(g => ({ label: g.name || `Grade ${g.id}`, value: g.id, level_id: g.level_id ?? g.level }))
      } else {
        gradeOptions.value = []
      }
    } else {
      // fallback: call fetchGrades and filter by level locally
      await fetchGrades()
      if (Array.isArray(taxGrades.value)) {
        const tg = taxGrades.value as any[]
        gradeOptions.value = tg.filter(g => String(g.level_id ?? g.level ?? '') === String(val)).map(g => ({ label: g.name || `Grade ${g.id}`, value: g.id, level_id: g.level_id ?? g.level }))
      } else {
        gradeOptions.value = []
      }
    }
  }, 250)
})

// Keep selected filters in sync if initialFilters prop changes
watch(() => props.initialFilters, (v) => {
  try {
    if (!v) return
    selectedLevel.value = v.level ?? selectedLevel.value
    selectedGrade.value = v.grade ?? selectedGrade.value
    selectedSubject.value = v.subject ?? selectedSubject.value
    selectedTopic.value = v.topic ?? selectedTopic.value
  } catch (e) {}
})

// When a subject is selected, fetch topics for that subject if parent didn't supply topics
watch(selectedSubject, (val) => {
  selectedTopic.value = ''
  topicOptions.value = []
  if (!val) return
  if (_debounceTimers.subject) clearTimeout(_debounceTimers.subject)
  _debounceTimers.subject = setTimeout(async () => {
    if (props.topicOptions && props.topicOptions.length) {
      topicOptions.value = props.topicOptions.filter(t => String(t.subject_id) === String(val))
      return
    }
  await fetchTopicsBySubject(val)
  topicOptions.value = Array.isArray(taxTopics.value) ? (taxTopics.value as any[]).map(t => ({ label: (t as any).name || (t as any).title || (t as any).id, value: (t as any).id, subject_id: (t as any).subject_id })) : []
  }, 250)
})
// TODO: load filter options (grades/subjects/topics) from API if available
</script>