<template>
  <!--
    FiltersSidebar can be used in two contexts:
    - as a left column sidebar (tall, sticky full-height)
    - as an inline/top filters panel (embedded inside a sticky wrapper)
    Provide a `sticky` prop to control whether this component should be the sticky/full-height element.
    Default to false so embedding it inside already-sticky containers (common on index pages) doesn't cause
    the component to expand to full viewport height and cover the page.
  -->
  <aside :class="[
      'rounded-lg p-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-gray-100 dark:border-slate-800 overflow-y-auto',
      props.sticky ? 'sticky' : ''
    ]"
    :style="props.sticky ? { top: 'var(--topbar-height)', height: 'calc(100vh - var(--topbar-height))' } : {}">
    <template v-if="props.sticky">
      <div class="flex items-center justify-between">
        <div class="text-sm font-semibold text-gray-800 dark:text-gray-100">Filters</div>
        <button @click="collapsed = !collapsed" class="text-sm text-gray-500 px-2 py-1 rounded hover:bg-gray-100">{{ collapsed ? 'Open' : 'Collapse' }}</button>
      </div>

      <div v-if="!collapsed" class="mt-3">

        <!-- Active filter chips -->
        <div v-if="hasAnyActive" class="mb-3 flex flex-wrap gap-2">
              <template v-if="activeLevelLabel">
                <button @click="removeLevel" class="text-xs flex items-center gap-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <span class="font-semibold">Level:</span>
                  <span>{{ activeLevelLabel }}</span>
                  <span class="ml-1 text-slate-400">×</span>
                </button>
              </template>
          <template v-if="activeGradeLabel">
            <button @click="removeGrade" class="text-xs flex items-center gap-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
              <span class="font-semibold">Grade:</span>
              <span>{{ activeGradeLabel }}</span>
              <span class="ml-1 text-slate-400">×</span>
            </button>
          </template>
          <template v-if="activeSubjectLabel">
            <button @click="removeSubject" class="text-xs flex items-center gap-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
              <span class="font-semibold">Subject:</span>
              <span>{{ activeSubjectLabel }}</span>
              <span class="ml-1 text-slate-400">×</span>
            </button>
          </template>
          <template v-if="activeTopicLabel">
            <button @click="removeTopic" class="text-xs flex items-center gap-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
              <span class="font-semibold">Topic:</span>
              <span>{{ activeTopicLabel }}</span>
              <span class="ml-1 text-slate-400">×</span>
            </button>
          </template>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Level</label>
          <div class="relative">
            <select v-model="localLevel" class="w-full rounded-md py-2 pl-3 pr-8 text-sm border bg-white">
              <option :value="null">All levels</option>
              <option v-for="l in filteredLevels" :key="l.id" :value="l.id">{{ l.name || ('Level ' + l.id) }}</option>
            </select>
            <span v-if="loadingLevels" class="absolute right-2 top-1/2 -translate-y-1/2">
              <span class="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin block"></span>
            </span>
          </div>

          <div class="mt-3">
            <label class="block text-xs font-medium text-gray-600 mb-1">Grade</label>
            <div class="relative">
              <select v-model="localGrade" @change="() => {}" class="w-full rounded-md py-2 pl-3 pr-8 text-sm border bg-white">
                <option :value="null">All grades</option>
                <option v-for="g in filteredGrades" :key="g.id" :value="g.id">{{ g.display_name || g.name || ('Grade ' + g.id) }}</option>
              </select>
              <span v-if="loadingGrades" class="absolute right-2 top-1/2 -translate-y-1/2">
                <span class="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin block"></span>
              </span>
            </div>
          </div>
        </div>

        <div class="mt-3">
          <label class="block text-xs font-medium text-gray-600 mb-1">Subject</label>
          <div class="relative">
            <select v-model="localSubject" class="w-full rounded-md py-2 pl-3 pr-8 text-sm border bg-white">
              <option :value="null">All subjects</option>
              <option v-for="s in filteredSubjectsClean" :key="s.id" :value="s.id">{{ s.name || '' }}</option>
            </select>
            <span v-if="loadingSubjects" class="absolute right-2 top-1/2 -translate-y-1/2">
              <span class="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin block"></span>
            </span>
          </div>
        </div>

        <div v-if="showTopic" class="mt-3">
          <label class="block text-xs font-medium text-gray-600 mb-1">Topic</label>
          <div class="relative">
            <select v-model="localTopic" class="w-full rounded-md py-2 pl-3 pr-8 text-sm border bg-white">
              <option :value="null">All topics</option>
              <option v-for="t in filteredTopicsClean" :key="t.id" :value="t.id">{{ t.name || '' }}</option>
            </select>
            <span v-if="loadingTopics" class="absolute right-2 top-1/2 -translate-y-1/2">
              <span class="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin block"></span>
            </span>
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <button @click="onClear" class="px-3 py-2 bg-white border rounded text-sm">Clear</button>
          <button @click="onApply" class="px-3 py-2 bg-indigo-600 text-white rounded text-sm">Apply</button>
        </div>
      </div>
    </template>

    <template v-else>
      <!-- Horizontal compact/top-bar layout -->
      <div class="w-full flex flex-wrap items-center gap-3">
        <div class="text-sm font-semibold text-gray-800 dark:text-gray-100">Filters</div>

        <div class="flex-1 flex flex-wrap items-center gap-3">
          <div class="min-w-[160px]">
            <label class="sr-only">Level</label>
            <select v-model="localLevel" class="w-full rounded-md py-2 pl-3 pr-8 text-sm border bg-white">
              <option :value="null">All levels</option>
              <option v-for="l in filteredLevels" :key="l.id" :value="l.id">{{ l.name || ('Level ' + l.id) }}</option>
            </select>
          </div>

          <div class="min-w-[160px]">
            <label class="sr-only">Grade</label>
            <select v-model="localGrade" class="w-full rounded-md py-2 pl-3 pr-8 text-sm border bg-white">
              <option :value="null">All grades</option>
              <option v-for="g in filteredGrades" :key="g.id" :value="g.id">{{ g.display_name || g.name || ('Grade ' + g.id) }}</option>
            </select>
          </div>

          <div class="min-w-[160px]">
            <label class="sr-only">Subject</label>
            <select v-model="localSubject" class="w-full rounded-md py-2 pl-3 pr-8 text-sm border bg-white">
              <option :value="null">All subjects</option>
              <option v-for="s in filteredSubjectsClean" :key="s.id" :value="s.id">{{ s.name || '' }}</option>
            </select>
          </div>

          <div v-if="showTopic" class="min-w-[160px]">
            <label class="sr-only">Topic</label>
            <select v-model="localTopic" class="w-full rounded-md py-2 pl-3 pr-8 text-sm border bg-white">
              <option :value="null">All topics</option>
              <option v-for="t in filteredTopicsClean" :key="t.id" :value="t.id">{{ t.name || '' }}</option>
            </select>
          </div>
        </div>

        <div class="flex gap-2 ml-auto">
          <button @click="onClear" class="px-3 py-2 bg-white border rounded text-sm">Clear</button>
          <button @click="onApply" class="px-3 py-2 bg-indigo-600 text-white rounded text-sm">Apply</button>
        </div>
      </div>
    </template>
  </aside>
</template>

<script setup>
import { ref, watch, toRefs, onMounted, computed, unref } from 'vue'
import { useCookie } from '#app'
import { useTaxonomyStore } from '~/stores/taxonomyStore'

const props = defineProps({
  // Accept either raw arrays or reactive refs/objects to remain flexible across callers
  subjectOptions: { type: [Array, Object], default: () => [] },
  topicOptions: { type: [Array, Object], default: () => [] },
  gradeOptions: { type: [Array, Object], default: () => [] },
  showTopic: { type: Boolean, default: true },
  subject: { type: [Number, String], default: null },
  topic: { type: [Number, String], default: null },
  grade: { type: [Number, String], default: null },
  level: { type: [Number, String], default: null },
  storageKey: { type: String, default: '' },
  // when true the sidebar will be sticky and sized to viewport height using --topbar-height
  sticky: { type: Boolean, default: false }
})
const emit = defineEmits(['update:subject', 'update:topic', 'update:grade', 'update:level', 'apply', 'clear'])

const localSubject = ref(props.subject)
const localTopic = ref(props.topic)
const localGrade = ref(props.grade)
const localLevel = ref(props.level)
// start collapsed and fetch taxonomy only when the sidebar is opened
const collapsed = ref(true)
const cookieCollapsed = props.storageKey ? useCookie(props.storageKey + ':collapsed') : null

// Use taxonomy store for all taxonomy data
const store = useTaxonomyStore()

// Computed properties for loading states (store doesn't have individual loading flags, so assume false)
const loadingLevels = computed(() => false)
const loadingGrades = computed(() => false)
const loadingSubjects = computed(() => false)
const loadingTopics = computed(() => false)

// compute label lookups from either props.options or store
const gradeLookup = computed(() => {
  try {
    const raw = unref(props.gradeOptions)
    const list = Array.isArray(raw) && raw.length ? raw : (store.grades || [])
    return (list || []).reduce((acc, g) => {
      if (g && g.id != null) {
        try {
          acc[String(g.id)] = g
        } catch (e) {
          // ignore invalid grade objects
        }
      }
      return acc
    }, {})
  } catch (e) {
    console.warn('gradeLookup computation error:', e)
    return {}
  }
})
const subjectLookup = computed(() => {
  try {
    const raw = unref(props.subjectOptions)
    const list = Array.isArray(raw) && raw.length ? raw : (store.subjects || [])
    return (list || []).reduce((acc, s) => {
      if (s && s.id != null) {
        try {
          acc[String(s.id)] = s
        } catch (e) {
          // ignore invalid subject objects
        }
      }
      return acc
    }, {})
  } catch (e) {
    console.warn('subjectLookup computation error:', e)
    return {}
  }
})
const topicLookup = computed(() => {
  try {
    const raw = unref(props.topicOptions)
    const list = Array.isArray(raw) && raw.length ? raw : (store.topics || [])
    return (list || []).reduce((acc, t) => {
      if (t && t.id != null) {
        try {
          acc[String(t.id)] = t
        } catch (e) {
          // ignore invalid topic objects
        }
      }
      return acc
    }, {})
  } catch (e) {
    console.warn('topicLookup computation error:', e)
    return {}
  }
})

const activeGradeLabel = computed(() => {
  try {
    if (!localGrade.value) return ''
    const g = gradeLookup.value[String(localGrade.value)]
    return g ? (g.display_name || g.name || g.title || g.label || String(g.id || localGrade.value)) : String(localGrade.value)
  } catch (e) {
    return String(localGrade.value || '')
  }
})
const activeLevelLabel = computed(() => {
  try {
    if (!localLevel.value) return ''
    const list = (store.levels || [])
    const l = list.find(x => x && x.id != null && String(x.id) === String(localLevel.value))
    return l && l.name ? l.name : String(localLevel.value)
  } catch (e) {
    return String(localLevel.value || '')
  }
})
const activeSubjectLabel = computed(() => {
  try {
    if (!localSubject.value) return ''
    const s = subjectLookup.value[String(localSubject.value)]
    return s ? (s.name || s.title || s.label || String(s.id || localSubject.value)) : String(localSubject.value)
  } catch (e) {
    return String(localSubject.value || '')
  }
})
const activeTopicLabel = computed(() => {
  try {
    if (!localTopic.value) return ''
    const t = topicLookup.value[String(localTopic.value)]
    return t ? (t.name || t.title || t.label || String(t.id || localTopic.value)) : String(localTopic.value)
  } catch (e) {
    return String(localTopic.value || '')
  }
})

const hasAnyActive = computed(() => {
  return !!(localLevel.value || localGrade.value || localSubject.value || localTopic.value)
})

// subjects from store
const filteredSubjects = computed(() => {
  return store.subjects || []
})

// compute filtered grades by selected level if levels are available
const gradeOptionsByLevel = computed(() => {
  try {
    if (localLevel.value && Array.isArray(store.levels) && store.levels.length) {
      const l = store.levels.find(x => x && x.id != null && String(x.id) === String(localLevel.value))
      if (l && Array.isArray(l.grades)) {
        // levels may include grade ids (number/string) or partial objects; resolve to full grade objects when possible
        return l.grades.map(g => {
          try {
            if (!g) return null
            if (typeof g === 'object' && g.id != null) return g
            const gStr = String(g || '')
            const resolved = gradeLookup.value[gStr]
            return resolved || { id: gStr, name: gStr }
          } catch (e) {
            return null
          }
        }).filter(Boolean)
      }
      // fallback: filter store grades by level_id if grades not nested in level
      const allGrades = store.grades || []
      const filtered = allGrades.filter(g => g && g.id != null && String(g.level_id || g.level || '') === String(localLevel.value))
      if (filtered.length) return filtered
    }
    const rawGrades = unref(props.gradeOptions)
    return (Array.isArray(rawGrades) && rawGrades.length) ? rawGrades : (store.grades || [])
  } catch (e) {
    console.warn('gradeOptionsByLevel computation error:', e)
    return []
  }
})

// compute topics filtered by selected subject (if topicOptions contain subject_id)
const filteredTopics = computed(() => {
  try {
    const raw = unref(props.topicOptions)
    const allTopics = (store.topics && store.topics.length) ? store.topics : (Array.isArray(raw) ? raw : [])
    if (!localSubject.value) return allTopics || []
    return (allTopics || []).filter(t => t && t.id != null && String(t.subject_id || t.subject || '') === String(localSubject.value))
  } catch (e) {
    console.warn('filteredTopics computation error:', e)
    return []
  }
})

const filteredLevels = computed(() => {
  try {
    return (store.levels || []).filter(x => x && x.id != null)
  } catch (e) {
    console.warn('filteredLevels computation error:', e)
    return []
  }
})

const filteredGrades = computed(() => {
  try {
    return (gradeOptionsByLevel.value || []).filter(x => x && x.id != null)
  } catch (e) {
    console.warn('filteredGrades computation error:', e)
    return []
  }
})

const filteredSubjectsClean = computed(() => {
  try {
    return (filteredSubjects.value || []).filter(x => x && x.id != null)
  } catch (e) {
    console.warn('filteredSubjectsClean computation error:', e)
    return []
  }
})

const filteredTopicsClean = computed(() => {
  try {
    return (filteredTopics.value || []).filter(x => x && x.id != null)
  } catch (e) {
    console.warn('filteredTopicsClean computation error:', e)
    return []
  }
})

// restore collapsed from localStorage if storageKey provided - do this after mount to avoid hydration mismatches
onMounted(() => {
  if (!props.storageKey) return
  try {
    // prefer cookie (server-surfaced) then localStorage
    if (cookieCollapsed && cookieCollapsed.value !== undefined && cookieCollapsed.value !== null) {
      collapsed.value = cookieCollapsed.value === 'true'
    } else {
      const raw = localStorage.getItem(props.storageKey + ':collapsed')
      if (raw !== null) collapsed.value = raw === 'true'
    }
  } catch (e) {}
})

watch(() => props.subject, (v) => { localSubject.value = v })
watch(() => props.topic, (v) => { localTopic.value = v })
watch(() => props.grade, (v) => { localGrade.value = v })
watch(() => props.level, (v) => { localLevel.value = v })
watch(collapsed, (v) => {
  if (props.storageKey) {
    try { if (cookieCollapsed) cookieCollapsed.value = String(v) } catch (e) {}
    if (process.client) { try { localStorage.setItem(props.storageKey + ':collapsed', String(v)) } catch (e) {} }
  }
})

// When grade changes, clear dependent selections and emit
watch(localGrade, (v) => {
  if (process.client && props.storageKey) { try { localStorage.setItem(props.storageKey + ':grade', String(v)) } catch (e) {} }
  // when grade changes, clear dependent subject/topic selections
  localSubject.value = null
  localTopic.value = null
  emit('update:grade', v)
})

// When subject changes, clear dependent topic and emit
watch(localSubject, (v) => {
  if (process.client && props.storageKey) { try { localStorage.setItem(props.storageKey + ':subject', String(v)) } catch (e) {} }
  emit('update:subject', v)
})

// When level changes, clear dependent selections and emit
watch(localLevel, (v) => {
  if (process.client && props.storageKey) { try { localStorage.setItem(props.storageKey + ':level', String(v)) } catch (e) {} }
  // when level changes, clear grade/subject/topic
  localGrade.value = null
  localSubject.value = null
  localTopic.value = null
  emit('update:grade', null)
  emit('update:level', v)
})

function onApply() {
  emit('update:subject', localSubject.value)
  emit('update:topic', localTopic.value)
  emit('update:grade', localGrade.value)
  emit('apply')
}

function onClear() {
  localSubject.value = null
  localTopic.value = null
  localGrade.value = null
  localLevel.value = null
  emit('update:subject', null)
  emit('update:topic', null)
  emit('update:grade', null)
  emit('update:level', null)
  emit('clear')
}

function removeGrade() {
  localGrade.value = null
  localSubject.value = null
  localTopic.value = null
}

function removeSubject() {
  localSubject.value = null
  localTopic.value = null
}

function removeTopic() {
  localTopic.value = null
}

function removeLevel() {
  localLevel.value = null
  localGrade.value = null
  localSubject.value = null
  localTopic.value = null
}
</script>

<style scoped>
</style>
