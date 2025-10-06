<template>
  <aside class="bg-white rounded-lg p-4 shadow-sm">
    <div class="flex items-center justify-between">
      <div class="text-sm font-semibold text-gray-700">Filters</div>
      <button @click="collapsed = !collapsed" class="text-sm text-gray-500 px-2 py-1 rounded hover:bg-gray-100">{{ collapsed ? 'Open' : 'Collapse' }}</button>
    </div>

    <div v-if="!collapsed">

    <div class="mt-3">
      <label class="block text-sm font-medium text-gray-600 mb-1">Subject</label>
      <select v-model="localSubject" class="w-full border rounded px-3 py-2">
        <option value="">All subjects</option>
        <option v-for="s in subjectOptions" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
    </div>

    <div v-if="showTopic" class="mt-3">
      <label class="block text-sm font-medium text-gray-600 mb-1">Topic</label>
      <select v-model="localTopic" class="w-full border rounded px-3 py-2">
        <option value="">All topics</option>
        <option v-for="t in filteredTopics" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>
    </div>

    <div class="mt-3">
      <label class="block text-sm font-medium text-gray-600 mb-1">Grade</label>
      <select v-model="localGrade" class="w-full border rounded px-3 py-2">
        <option value="">All grades</option>
        <option v-for="g in gradeOptions" :key="g.id" :value="g.id">{{ g.name || ('Grade ' + g.id) }}</option>
      </select>
    </div>

      <div class="mt-4 flex gap-2">
        <button @click="onClear" class="px-3 py-2 bg-white border rounded">Clear</button>
        <button @click="onApply" class="px-3 py-2 bg-indigo-600 text-white rounded">Apply</button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch, toRefs } from 'vue'
const props = defineProps({
  subjectOptions: { type: Array, default: () => [] },
  topicOptions: { type: Array, default: () => [] },
  gradeOptions: { type: Array, default: () => [] },
  showTopic: { type: Boolean, default: true },
  subject: { type: String, default: '' },
  topic: { type: String, default: '' },
  grade: { type: [String, Number], default: '' },
  storageKey: { type: String, default: '' }
})
const emit = defineEmits(['update:subject', 'update:topic', 'update:grade', 'apply', 'clear'])

const localSubject = ref(props.subject)
const localTopic = ref(props.topic)
const localGrade = ref(props.grade)
const collapsed = ref(false)

// compute topics filtered by selected subject (if topicOptions contain subject_id)
import { computed } from 'vue'
const filteredTopics = computed(() => {
  if (!localSubject.value) return props.topicOptions || []
  return (props.topicOptions || []).filter(t => String(t.subject_id || t.subject || '') === String(localSubject.value))
})

// restore collapsed from localStorage if storageKey provided
if (process.client && props.storageKey) {
  try {
    const raw = localStorage.getItem(props.storageKey + ':collapsed')
    if (raw !== null) collapsed.value = raw === 'true'
  } catch (e) {}
}

watch(() => props.subject, (v) => { localSubject.value = v })
watch(() => props.topic, (v) => { localTopic.value = v })
watch(() => props.grade, (v) => { localGrade.value = v })
watch(collapsed, (v) => { if (process.client && props.storageKey) { try { localStorage.setItem(props.storageKey + ':collapsed', String(v)) } catch (e) {} } })
// persist local fields too so users don't lose in-flight filters
watch(localSubject, (v) => { if (process.client && props.storageKey) { try { localStorage.setItem(props.storageKey + ':subject', String(v)) } catch (e) {} } })
watch(localTopic, (v) => { if (process.client && props.storageKey) { try { localStorage.setItem(props.storageKey + ':topic', String(v)) } catch (e) {} } })
watch(localGrade, (v) => { if (process.client && props.storageKey) { try { localStorage.setItem(props.storageKey + ':grade', String(v)) } catch (e) {} } })

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
