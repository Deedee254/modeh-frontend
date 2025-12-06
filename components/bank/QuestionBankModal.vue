<template>
  <div>
    <!-- Inline rendering (not used much but kept for compat) -->
    <div v-if="isInline" class="p-4">
      <div class="text-sm text-gray-500">Inline mode deprecated in favor of modal logic</div>
    </div>

    <!-- Modal rendering -->
    <UModal v-else v-model="open" :ui="{ width: 'sm:max-w-5xl' }">
      <div class="p-4 sm:p-6 flex flex-col h-[85vh]">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Question Bank</h3>
            <p class="text-sm text-gray-500">Add existing questions to your quiz</p>
          </div>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="open=false" />
        </div>

        <!-- Filter Context Display (Read Only) -->
        <div class="mb-4 flex-shrink-0 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Filtering content for:</div>
          <div class="flex flex-wrap gap-2 text-sm">
             <UBadge v-if="levelLabel" variant="subtle" color="gray">{{ levelLabel }}</UBadge>
             <UBadge v-if="gradeLabel" variant="subtle" color="primary">{{ gradeLabel }}</UBadge>
             <UBadge v-if="subjectLabel" variant="subtle" color="primary">{{ subjectLabel }}</UBadge>
             <UBadge v-if="topicLabel" variant="subtle" color="primary">{{ topicLabel }}</UBadge>
             <span v-if="!levelLabel && !gradeLabel && !subjectLabel && !topicLabel" class="text-gray-400 italic">No filters active (showing all public questions)</span>
          </div>
        </div>

        <!-- Search and Sort Controls -->
        <div class="flex flex-col sm:flex-row items-center gap-2 mb-4 flex-shrink-0">
          <div class="flex-1 w-full relative">
            <UInput 
              v-model="q" 
              icon="i-heroicons-magnifying-glass" 
              placeholder="Search questions..." 
              :ui="{ icon: { trailing: { pointer: '' } } }"
              @keydown.enter="fetchItems" 
            >
              <template #trailing>
                 <UButton v-if="q" color="gray" variant="link" icon="i-heroicons-x-mark" :padded="false" @click="q = ''; fetchItems()" />
              </template>
            </UInput>
          </div>
          
          <div class="flex items-center gap-2 w-full sm:w-auto">
             <USelect 
               v-model="sortBy" 
               :options="sortOptions" 
               option-attribute="label"
               class="w-40"
               @update:model-value="fetchItems"
             />
             <USelect v-model="perPage" :options="perPageOpts" class="w-24" @update:model-value="fetchItems" />
             <UButton @click="fetchItems" color="white" icon="i-heroicons-arrow-path">Refresh</UButton>
          </div>
        </div>

        <!-- Results List -->
        <div class="flex-1 overflow-y-auto min-h-0 border rounded-md relative bg-white">
          <div v-if="loading" class="p-4 space-y-4">
             <UiSkeleton variant="list" :count="5" />
          </div>
          <div v-else-if="items.length === 0" class="flex flex-col items-center justify-center h-full text-gray-500">
             <Icon name="i-heroicons-face-frown" class="w-10 h-10 mb-2 text-gray-300" />
             <p>No questions found matching your criteria</p>
          </div>
          <div v-else class="divide-y divide-gray-100">
             <div 
               v-for="it in items" 
               :key="it.id" 
               class="p-4 hover:bg-gray-50 transition-colors flex gap-3 group"
               :class="selectedIds.includes(it.id) ? 'bg-brand-50 hover:bg-brand-50' : ''"
             >
                <div class="pt-1">
                   <UCheckbox v-model="selectedIds" :value="it.id" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <UBadge size="xs" color="gray" variant="soft">{{ it.type }}</UBadge>
                    <UBadge v-if="it.difficulty" size="xs" :color="difficultyColor(it.difficulty)" variant="soft">{{ difficultyLabel(it.difficulty) }}</UBadge>
                    <span class="text-xs text-gray-500 ml-auto">{{ it.marks }} mark{{ it.marks !== 1 ? 's' : '' }}</span>
                  </div>
                  <div class="prose prose-sm max-w-none text-gray-800 line-clamp-3" v-html="it.body || it.text"></div>
                  
                  <div class="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <UButton size="2xs" color="white" variant="solid" icon="i-heroicons-plus" @click="add(it)">Add this question</UButton>
                  </div>
                </div>
             </div>
          </div>
        </div>

        <!-- Footer / Pagination -->
        <div class="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-3">
             <UButton size="sm" color="primary" :disabled="!selectedIds.length" @click="addSelected" class="!bg-brand-600 hover:!bg-brand-700">
               Add selected ({{ selectedIds.length }})
             </UButton>
             <span class="text-sm text-gray-500">{{ paginator?.total || 0 }} result{{ (paginator?.total||0) !== 1 ? 's' : '' }}</span>
          </div>

          <div class="flex items-center gap-1">
             <UButton size="xs" color="white" icon="i-heroicons-chevron-left" :disabled="page <= 1" @click="page--; fetchItems()" />
             <span class="text-sm font-medium px-2">{{ page }} / {{ maxPage }}</span>
             <UButton size="xs" color="white" icon="i-heroicons-chevron-right" :disabled="page >= maxPage" @click="page++; fetchItems()" />
          </div>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import useApi from '~/composables/useApi'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import { useTaxonomyStore } from '~/stores/taxonomyStore'

// Declare globally used components for TS support (Nuxt auto-imports)
declare const UInput: any
declare const USelect: any
declare const UButton: any
declare const UModal: any
declare const UBadge: any
declare const UCheckbox: any
declare const Icon: any

const props = defineProps<{ 
  modelValue: boolean, 
  inline?: boolean, 
  initialFilters?: any,
  // Pass full options lists from parent to resolve labels without fetching
  gradeOptions?: any[], 
  subjectOptions?: any[], 
  topicOptions?: any[], 
  levelOptions?: any[]
}>()

const emit = defineEmits(['update:modelValue', 'add'])

const open = ref(props.modelValue)
watch(() => props.modelValue, v => {
  open.value = v
  if (v) fetchItems()
})
watch(open, v => emit('update:modelValue', v))

const isInline = computed(() => !!props.inline)

// State
const q = ref('')
const perPage = ref(10)
const page = ref(1)
const items = ref<any[]>([])
const paginator = ref<any>(null)
const loading = ref(false)
const selectedIds = ref<any[]>([])
const sortBy = ref('latest')

const perPageOpts = [10, 20, 50]
const sortOptions = [
  { label: 'Newest First', value: 'latest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'A-Z', value: 'alpha_asc' },
  { label: 'Z-A', value: 'alpha_desc' },
  { label: 'Difficulty (Low-High)', value: 'difficulty_asc' },
  { label: 'Difficulty (High-Low)', value: 'difficulty_desc' },
  { label: 'Marks (High-Low)', value: 'marks_desc' },
  { label: 'Marks (Low-High)', value: 'marks_asc' },
]

const maxPage = computed(() => paginator.value ? Math.ceil((paginator.value.total || 0) / (paginator.value.per_page || 10)) : 1)

// Taxonomy helpers
const taxonomyStore = useTaxonomyStore()
const taxonomyFilters = computed(() => props.initialFilters || {})

// Computed Labels for Context Header
// We try to find the name in the passed props options or the store, falling back to ID.
const levelLabel = computed(() => {
  const id = taxonomyFilters.value.level
  if (!id) return null
  const found = props.levelOptions?.find((l:any) => l.id == id || l.value == id) 
       || taxonomyStore.levels?.find((l:any) => l.id == id)
  return found ? (found.name || found.label || found.title) : `Level ${id}`
})

const gradeLabel = computed(() => {
  const id = taxonomyFilters.value.grade
  if (!id) return null
  const found = props.gradeOptions?.find((g:any) => g.id == id || g.value == id)
       || taxonomyStore.grades?.find((g:any) => g.id == id)
  return found ? (found.name || found.label) : `Grade ${id}`
})

const subjectLabel = computed(() => {
  const id = taxonomyFilters.value.subject
  if (!id) return null
  const found = props.subjectOptions?.find((s:any) => s.id == id || s.value == id)
       || taxonomyStore.subjects?.find((s:any) => s.id == id)
  return found ? (found.name || found.label || found.title) : `Subject ${id}`
})

const topicLabel = computed(() => {
  const id = taxonomyFilters.value.topic
  if (!id) return null
  const found = props.topicOptions?.find((t:any) => t.id == id || t.value == id)
       || taxonomyStore.topics?.find((t:any) => t.id == id)
  return found ? (found.name || found.label || found.title) : `Topic ${id}`
})


async function fetchItems() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (q.value) params.set('q', q.value)
    params.set('per_page', String(perPage.value))
    params.set('page', String(page.value))
    params.set('sort_by', sortBy.value)

    // Apply strict filters from props (read-only context)
    if (taxonomyFilters.value.level) params.set('level_id', String(taxonomyFilters.value.level))
    if (taxonomyFilters.value.grade) params.set('grade_id', String(taxonomyFilters.value.grade))
    if (taxonomyFilters.value.subject) params.set('subject_id', String(taxonomyFilters.value.subject))
    if (taxonomyFilters.value.topic) params.set('topic_id', String(taxonomyFilters.value.topic))

    const api = useApi()
    const resp = await api.get('/api/question-bank?' + params.toString())
    if (resp.ok) {
      const json = await resp.json()
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

// Logic Utils
function difficultyLabel(d: number) {
  if (d <= 1) return 'Easy'
  if (d <= 2) return 'Medium'
  return 'Hard'
}

function difficultyColor(d: number) {
  if (d <= 1) return 'green'
  if (d <= 2) return 'yellow'
  return 'red'
}

// Normalize question types
const allowedTypes = new Set(['mcq','multi','short','numeric','fill_blank','math','code'])
function normalizeType(raw: any): string {
  if (typeof raw === 'string') {
    const s = raw.trim()
    if (s.startsWith('mcq')) return s
    if (allowedTypes.has(s)) return s
    const low = s.toLowerCase()
    if (allowedTypes.has(low)) return low
    return 'mcq'
  }
  if (raw && typeof raw === 'object') {
    const candidate = raw.type ?? raw.name ?? raw.label ?? null
    if (typeof candidate === 'string') return normalizeType(candidate)
  }
  return 'mcq'
}

function add(it: any) {
  const q = {
    uid: Math.random().toString(36).slice(2),
    type: normalizeType(it.type),
    text: it.body || it.text || '',
    options: Array.isArray(it.options) ? it.options : [],
    // Best effort mapping for answers
    correct: Array.isArray(it.answers) && it.answers.length ? it.answers[0] : -1,
    corrects: Array.isArray(it.answers) ? it.answers : [],
    difficulty: Number(it.difficulty || 2),
    marks: Number(it.marks || 1),
    fill_parts: it.fill_parts || ['', ''],
    media: null,
    explanation: it.explanation || '',
    open: true,
    is_banked: true,
    // Carry over taxonomy from the source item if present, else it will be inferred from quiz later
    grade_id: it.grade_id,
    subject_id: it.subject_id,
    topic_id: it.topic_id,
    level_id: it.level_id
  }
  emit('add', q)
}

function addSelected() {
  if (!selectedIds.value.length) return
  const found = items.value.filter(it => selectedIds.value.includes(it.id))
  if (found.length) {
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
      grade_id: it.grade_id,
      subject_id: it.subject_id,
      topic_id: it.topic_id,
      level_id: it.level_id
    }))
    emit('add', normalized)
    selectedIds.value = []
  }
}

onMounted(() => {
  if (props.modelValue) fetchItems()
})
</script>
