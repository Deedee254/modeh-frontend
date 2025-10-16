<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-6">
    <div class="absolute inset-0 bg-black/50" @click="close"></div>
    <!-- Mobile: near full-screen scrollable panel with small margins; on larger screens center with max width -->
    <div class="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6 z-10 mx-4 my-6 h-[calc(100vh-96px)] sm:h-auto sm:mx-auto sm:my-6 overflow-y-auto">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-semibold">Create New Topic</h3>
        <button @click="close" aria-label="Close" class="p-1.5 rounded-md text-gray-500 hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
        </button>
      </div>
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700">Name</label>
          <input v-model="name" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Grade</label>
          <select v-model="gradeId" class="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md">
            <option value="">-- Select Grade --</option>
            <option v-for="g in (Array.isArray(grades) ? grades : (grades.data || []))" :key="g.id" :value="g.id">{{ g.name }}</option>
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
            <!-- subjects may be a paginated object (with `data`) or an array -->
            <option v-for="s in (Array.isArray(subjects) ? subjects : (subjects.data || []))" :key="s.id" :value="s.id" v-if="!gradeId || Number(s.grade_id) === Number(gradeId)">{{ s.name }}</option>
          </select>
        </div>
      </div>

      <div class="mt-4 flex flex-col sm:flex-row justify-end gap-2">
        <button class="px-3 py-2 bg-gray-100 rounded w-full sm:w-auto" @click="close">Cancel</button>
        <button :disabled="submitting || !name || !subjectId" class="px-3 py-2 bg-indigo-600 text-white rounded w-full sm:w-auto" @click="create">Create</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import UiTextarea from '~/components/ui/UiTextarea.vue'
import { useRuntimeConfig } from '#imports'
import useApi from '~/composables/useApi'
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  subjects: { type: [Array, Object], default: () => [] },
  defaultSubjectId: { type: [String,Number], default: '' },
  grades: { type: [Array, Object], default: () => [] },
  defaultGradeId: { type: [String, Number], default: '' }
})
const emit = defineEmits(['update:modelValue', 'created'])
const name = ref('')
const description = ref('')
const gradeId = ref(props.defaultGradeId || '')
const subjectId = ref(props.defaultSubjectId || '')
const submitting = ref(false)
const config = useRuntimeConfig()

watch(() => props.defaultSubjectId, v => { subjectId.value = v || '' })
watch(() => props.defaultGradeId, v => { gradeId.value = v || '' })

function close() { emit('update:modelValue', false); clear() }
function clear() { name.value=''; description.value=''; subjectId.value = props.defaultSubjectId || '' }

async function create() {
  if (!name.value || !subjectId.value) return
  submitting.value = true
  try {
    const payload = { name: name.value, description: description.value, subject_id: subjectId.value, grade_id: gradeId.value }
    // debug: show whether XSRF token exists and cookie keys
    try {
      const token = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
      console.debug('[CreateTopicModal] XSRF present:', !!token, 'cookieKeys:', document.cookie.split(';').map(s=>s.trim().split('=')[0]))
    } catch(e) { console.debug('[CreateTopicModal] cookie read failed', e) }

    // Use composable to ensure CSRF cookie and send headers
    const api = useApi()
    const res = await api.postJson('/api/topics', payload)
    if (res.ok) {
      const json = await res.json().catch(() => null)
      const created = json?.topic || json || null
      emit('created', created)
      emit('update:modelValue', false)
      clear()
    } else {
      const t = await res.text().catch(()=>null)
      console.error('Failed to create topic', t)
      // keep modal open for retry
    }
  } catch (e) {
    console.error('Create topic error', e)
  } finally { submitting.value = false }
}
</script>

<style scoped></style>
