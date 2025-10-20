<template>
  <aside class="rounded-lg p-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-gray-100 dark:border-slate-800">
    <div class="flex items-center justify-between">
      <div class="text-sm font-semibold text-gray-800 dark:text-gray-100">Filters</div>
      <button @click="collapsed = !collapsed" class="text-sm text-gray-500 px-2 py-1 rounded hover:bg-gray-100">{{ collapsed ? 'Open' : 'Collapse' }}</button>
    </div>

    <div v-if="!collapsed" class="mt-3">

      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Grade</label>
        <div class="relative">
          <select v-model="localGrade" @change="() => {}" class="w-full rounded-md py-2 pl-3 pr-8 text-sm border bg-white">
            <option value="">All grades</option>
            <template v-for="(g, idx) in (gradeOptions || [])" :key="idx">
              <option v-if="g" :key="g.id ?? idx" :value="g.id">{{ g.name || ('Grade ' + (g.id ?? idx)) }}</option>
            </template>
          </select>
        </div>
      </div>

      <div class="mt-3">
        <label class="block text-xs font-medium text-gray-600 mb-1">Subject</label>
        <select v-model="localSubject" class="w-full rounded-md py-2 pl-3 pr-8 text-sm border bg-white">
          <option value="">All subjects</option>
          <template v-for="(s, idx) in (subjectOptions || [])" :key="idx">
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
import { ref, watch, toRefs, onMounted } from 'vue'
import { useCookie } from '#app'
const props = defineProps({
  subjectOptions: { type: Array, default: () => [] },
  topicOptions: { type: Array, default: () => [] },
  gradeOptions: { type: Array, default: () => [] },
  showTopic: { type: Boolean, default: true },
  subject: { type: [Number, String], default: null },
  topic: { type: [Number, String], default: null },
  grade: { type: [Number, String], default: null },
  storageKey: { type: String, default: '' }
})
const emit = defineEmits(['update:subject', 'update:topic', 'update:grade', 'apply', 'clear'])

const localSubject = ref(props.subject)
const localTopic = ref(props.topic)
const localGrade = ref(props.grade)
const collapsed = ref(false)
const cookieCollapsed = props.storageKey ? useCookie(props.storageKey + ':collapsed') : null

// compute topics filtered by selected subject (if topicOptions contain subject_id)
import { computed } from 'vue'
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

watch(() => props.subject, (v) => { localSubject.value = v })
watch(() => props.topic, (v) => { localTopic.value = v })
watch(() => props.grade, (v) => { localGrade.value = v })
watch(collapsed, (v) => {
  if (props.storageKey) {
    try { if (cookieCollapsed) cookieCollapsed.value = String(v) } catch (e) {}
    if (process.client) { try { localStorage.setItem(props.storageKey + ':collapsed', String(v)) } catch (e) {} }
  }
})
// persist local fields too so users don't lose in-flight filters
watch(localSubject, (v) => {
  if (process.client && props.storageKey) { try { localStorage.setItem(props.storageKey + ':subject', String(v)) } catch (e) {} }
  emit('update:subject', v)
})
watch(localTopic, (v) => {
  if (process.client && props.storageKey) { try { localStorage.setItem(props.storageKey + ':topic', String(v)) } catch (e) {} }
  emit('update:topic', v)
})
watch(localGrade, (v) => {
  if (process.client && props.storageKey) { try { localStorage.setItem(props.storageKey + ':grade', String(v)) } catch (e) {} }
  // when grade changes, clear dependent subject/topic selections
  // but do not override the user's explicit subject if it belongs to the grade
  emit('update:grade', v)
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
  emit('update:subject', '')
  emit('update:topic', '')
  emit('update:grade', '')
  emit('clear')
}
</script>

<style scoped>
</style>
