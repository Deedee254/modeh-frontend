<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-6">
    <div class="absolute inset-0 bg-black/50" @click="close"></div>
    <div class="relative bg-white rounded shadow-lg max-w-md w-full p-6 z-10">
      <h3 class="text-lg font-semibold mb-3">Create New Topic</h3>
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700">Name</label>
          <input v-model="name" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
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
            <option v-for="s in (Array.isArray(subjects) ? subjects : (subjects.data || []))" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
      </div>

      <div class="mt-4 flex justify-end gap-2">
        <button class="px-3 py-2 bg-gray-100 rounded" @click="close">Cancel</button>
        <button :disabled="submitting || !name || !subjectId" class="px-3 py-2 bg-indigo-600 text-white rounded" @click="create">Create</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import UiTextarea from '~/components/ui/UiTextarea.vue'
import { useRuntimeConfig } from '#imports'
const props = defineProps({ modelValue: { type: Boolean, default: false }, subjects: { type: [Array, Object], default: () => [] }, defaultSubjectId: { type: [String,Number], default: '' } })
const emit = defineEmits(['update:modelValue', 'created'])
const name = ref('')
const description = ref('')
const subjectId = ref(props.defaultSubjectId || '')
const submitting = ref(false)
const config = useRuntimeConfig()

watch(() => props.defaultSubjectId, v => { subjectId.value = v || '' })

function close() { emit('update:modelValue', false); clear() }
function clear() { name.value=''; description.value=''; subjectId.value = props.defaultSubjectId || '' }

async function create() {
  if (!name.value || !subjectId.value) return
  submitting.value = true
  try {
    const payload = { name: name.value, description: description.value, subject_id: subjectId.value }
    const res = await fetch(config.public.apiBase + '/api/topics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include' })
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
