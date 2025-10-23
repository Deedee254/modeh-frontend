<template>
  <aside class="rounded-lg p-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-gray-100 dark:border-slate-800">
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
            <option value="">All levels</option>
            <template v-for="(l, idx) in (taxLevels.value || [])" :key="idx">
              <option v-if="l" :key="l.id ?? idx" :value="l.id">{{ l.name || ('Level ' + (l.id ?? idx)) }}</option>
            </template>
          </select>
        </div>

        <div class="mt-3">
          <label class="block text-xs font-medium text-gray-600 mb-1">Grade</label>
          <div class="relative">
            <select v-model="localGrade" @change="() => {}" class="w-full rounded-md py-2 pl-3 pr-8 text-sm border bg-white">
              <option value="">All grades</option>
              <template v-for="(g, idx) in (gradeOptionsByLevel || [])" :key="idx">
                <option v-if="g" :key="g.id ?? idx" :value="g.id">{{ g.display_name || g.name || ('Grade ' + (g.id ?? idx)) }}</option>
              </template>
            </select>
          </div>
        </div>
      </div>

      <div class="mt-3">
        <label class="block text-xs font-medium text-gray-600 mb-1">Subject</label>
        <select v-model="localSubject" class="w-full rounded-md py-2 pl-3 pr-8 text-sm border bg-white">
          <option value="">All subjects</option>
          <template v-for="(s, idx) in (filteredSubjects || [])" :key="idx">
            <option v-if="s" :key="s.id ?? idx" :value="s.id">{{ s.name || '' }}</option>
          </template>
        </select>
      </div>

      <div v-if="showTopic" class="mt-3">
        <label class="block text-xs font-medium text-gray-600 mb-1">Topic</label>
        <select v-model="localTopic" class="w-full rounded-md py-2 pl-3 pr-8 text-sm border bg-white">
          <option value="">All topics</option>
          <template v-for="(t, idx) in (filteredTopics || [])" :key="idx">
            <option v-if="t" :key="t.id ?? idx" :value="t.id">{{ t.name || '' }}</option>
          </template>
        </select>
      </div>

      <div class="mt-4 flex gap-2">
        <button @click="onClear" class="px-3 py-2 bg-white border rounded text-sm">Clear</button>
        <button @click="onApply" class="px-3 py-2 bg-indigo-600 text-white rounded text-sm">Apply</button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch, toRefs, onMounted, computed } from 'vue'
import { useCookie } from '#app'
import useTaxonomy from '~/composables/useTaxonomy'
const props = defineProps({
  subjectOptions: { type: Array, default: () => [] },
  topicOptions: { type: Array, default: () => [] },
  gradeOptions: { type: Array, default: () => [] },
  showTopic: { type: Boolean, default: true },
  subject: { type: [Number, String], default: null },
  topic: { type: [Number, String], default: null },
  grade: { type: [Number, String], default: null },
  level: { type: [Number, String], default: null },
  storageKey: { type: String, default: '' }
})
const emit = defineEmits(['update:subject', 'update:topic', 'update:grade', 'apply', 'clear'])

const localSubject = ref(props.subject)
const localTopic = ref(props.topic)
const localGrade = ref(props.grade)
const localLevel = ref(props.level)
const collapsed = ref(false)
const cookieCollapsed = props.storageKey ? useCookie(props.storageKey + ':collapsed') : null

// taxonomy composable (single instance)
const { grades: taxGrades, subjects: taxSubjects, topics: taxTopics, levels: taxLevels, fetchGrades, fetchAllSubjects, fetchAllTopics, fetchLevels, fetchSubjectsByGrade, fetchTopicsBySubject } = useTaxonomy()

// compute label lookups from either props.options or taxonomy composable
const gradeLookup = computed(() => {
  const list = props.gradeOptions && props.gradeOptions.length ? props.gradeOptions : (taxGrades.value || [])
  return (list || []).reduce((acc, g) => { if (g && g.id != null) acc[String(g.id)] = g; return acc }, {})
})
const subjectLookup = computed(() => {
  const list = props.subjectOptions && props.subjectOptions.length ? props.subjectOptions : (taxSubjects.value || [])
  return (list || []).reduce((acc, s) => { if (s && s.id != null) acc[String(s.id)] = s; return acc }, {})
})
const topicLookup = computed(() => {
  const list = props.topicOptions && props.topicOptions.length ? props.topicOptions : (taxTopics.value || [])
  return (list || []).reduce((acc, t) => { if (t && t.id != null) acc[String(t.id)] = t; return acc }, {})
})

const activeGradeLabel = computed(() => {
  if (!localGrade.value) return ''
  const g = gradeLookup.value[String(localGrade.value)]
  return g ? (g.display_name || g.name || g.title || g.label || String(g.id)) : String(localGrade.value)
})
const activeLevelLabel = computed(() => {
  if (!localLevel.value) return ''
  const list = (taxLevels.value || [])
  const l = list.find(x => String(x.id) === String(localLevel.value))
  return l ? l.name : String(localLevel.value)
})
const activeSubjectLabel = computed(() => {
  if (!localSubject.value) return ''
  const s = subjectLookup.value[String(localSubject.value)]
  return s ? (s.name || s.title || s.label || String(s.id)) : String(localSubject.value)
})
const activeTopicLabel = computed(() => {
  if (!localTopic.value) return ''
  const t = topicLookup.value[String(localTopic.value)]
  return t ? (t.name || t.title || t.label || String(t.id)) : String(localTopic.value)
})

const hasAnyActive = computed(() => {
  return !!(localLevel.value || localGrade.value || localSubject.value || localTopic.value)
})

// compute subjects filtered by selected grade
const filteredSubjects = computed(() => {
  // Use the full list of subjects from taxonomy for filtering, not the prop.
  const allSubjects = taxSubjects.value || props.subjectOptions || []
  if (!localGrade.value) return allSubjects
  return allSubjects.filter(s => String(s.grade_id || s.grade || '') === String(localGrade.value))
})

// compute filtered grades by selected level if levels are available
const gradeOptionsByLevel = computed(() => {
  if (localLevel.value && Array.isArray(taxLevels.value) && taxLevels.value.length) {
    const l = taxLevels.value.find(x => String(x.id) === String(localLevel.value))
    if (l && Array.isArray(l.grades)) return l.grades
  }
  return props.gradeOptions && props.gradeOptions.length ? props.gradeOptions : (taxGrades.value || [])
})

// compute topics filtered by selected subject (if topicOptions contain subject_id)
const filteredTopics = computed(() => {
  if (!localSubject.value) return props.topicOptions || []
  return (props.topicOptions || []).filter(t => String(t.subject_id || t.subject || '') === String(localSubject.value))
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

// ensure taxonomy is loaded so chips can show labels when no options are passed
onMounted(() => {
  // if caller didn't pass gradeOptions/subjectOptions/topicOptions, fetch the global lists
  try {
    if ((!props.gradeOptions || !props.gradeOptions.length) && (!taxGrades.value || !taxGrades.value.length)) fetchGrades()
    if ((!taxLevels.value || !taxLevels.value.length)) fetchLevels()
  } catch (e) {}
  try {
    if ((!props.subjectOptions || !props.subjectOptions.length) && (!taxSubjects.value || !taxSubjects.value.length)) fetchAllSubjects()
  } catch (e) {}
  try {
    if ((!props.topicOptions || !props.topicOptions.length) && (!taxTopics.value || !taxTopics.value.length)) fetchAllTopics()
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
// persist local fields too so users don't lose in-flight filters
watch(localGrade, (v) => {
  if (process.client && props.storageKey) { try { localStorage.setItem(props.storageKey + ':grade', String(v)) } catch (e) {} }
  // when grade changes, clear dependent subject/topic selections
  // but do not override the user's explicit subject if it belongs to the grade
  localSubject.value = ''
  localTopic.value = ''
  emit('update:grade', v)
  // ask the taxonomy composable to fetch subjects for this grade so subject lists are server-filtered
  try { fetchSubjectsByGrade(v) } catch (e) {}
})

watch(localSubject, (v) => {
  if (process.client && props.storageKey) { try { localStorage.setItem(props.storageKey + ':subject', String(v)) } catch (e) {} }
  emit('update:subject', v)
  // preload topics for the selected subject via taxonomy composable
  try { fetchTopicsBySubject(v) } catch (e) {}
})
  watch(localSubject, (v) => {
    if (process.client && props.storageKey) { try { localStorage.setItem(props.storageKey + ':subject', String(v)) } catch (e) {} }
    emit('update:subject', v)
    // preload topics for the selected subject via taxonomy composable
    try { fetchTopicsBySubject(v) } catch (e) {}
  })
watch(localLevel, (v) => {
  if (process.client && props.storageKey) { try { localStorage.setItem(props.storageKey + ':level', String(v)) } catch (e) {} }
  // when level changes, clear grade/subject/topic
  localGrade.value = ''
  localSubject.value = ''
  localTopic.value = ''
  emit('update:grade', '')
  emit('update:level', v)
})

function onApply() {
  emit('update:subject', localSubject.value)
  emit('update:topic', localTopic.value)
  emit('update:grade', localGrade.value)
  emit('apply')
}

function onClear() {
  localSubject.value = ''
  localTopic.value = ''
  localGrade.value = ''
  localLevel.value = ''
  emit('update:subject', '')
  emit('update:topic', '')
  emit('update:grade', '')
  emit('update:level', '')
  emit('clear')
}

function removeGrade() {
  // only update local state; watchers will persist and emit update:grade
  localGrade.value = ''
  // clear dependent subject/topic locally
  localSubject.value = ''
  localTopic.value = ''
}

function removeSubject() {
  // only update local state; watchers will persist and emit update:subject
  localSubject.value = ''
  // clear dependent topic locally
  localTopic.value = ''
}

function removeTopic() {
  // only update local state; watchers will persist and emit update:topic
  localTopic.value = ''
}

function removeLevel() {
  localLevel.value = ''
  // clear dependent selections
  localGrade.value = ''
  localSubject.value = ''
  localTopic.value = ''
}
</script>

<style scoped>
</style>
