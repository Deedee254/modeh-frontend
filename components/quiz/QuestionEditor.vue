<template>
  <div class="border rounded-lg bg-white shadow-sm">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3">
      <div class="flex items-center gap-1 overflow-x-auto min-w-0">
        <span class="drag-handle cursor-grab select-none flex-shrink-0 text-sm" title="Drag to reorder">⠿</span>
        <UBadge color="gray" variant="soft" class="flex-shrink-0 text-xs">{{ label }}</UBadge>
        <UBadge color="gray" variant="soft" class="flex-shrink-0 text-xs">{{ typeLabel }}</UBadge>
        <UBadge color="gray" variant="soft" class="flex-shrink-0 text-xs">{{ difficultyLabel }}</UBadge>
        <UBadge color="gray" variant="soft" class="flex-shrink-0 text-xs">{{ localModel.marks }} pt</UBadge>
      </div>
      <div class="flex items-center gap-1">
        <UButton size="xs" color="gray" variant="ghost" @click="$emit('duplicate')" title="Duplicate">Dup</UButton>
        <UButton size="xs" color="red" variant="ghost" @click="$emit('remove')" title="Delete">Del</UButton>
        <UButton size="xs" color="gray" variant="ghost" @click="open = !open">{{ open ? 'Close' : 'Edit' }}</UButton>
      </div>
    </div>

    <div v-show="open" class="p-3 sm:p-4 border-t space-y-3">
      <QuestionEditorForm
        v-model="localModel"
        :errors="errors"
        @add-option="$emit('add-option')"
        @remove-option="$emit('remove-option', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import QuestionEditorForm from './QuestionEditorForm.vue'

// Accept v-model as `modelValue`. Make index optional.
const props = defineProps<{ index?: number, modelValue?: any, errors?: string[] }>()
const emit = defineEmits(['update:modelValue', 'remove', 'duplicate', 'add-option', 'remove-option'])

// localModel starts as a deep clone of modelValue or an empty object to avoid JSON.parse(undefined) errors
const localModel = ref(JSON.parse(JSON.stringify(props.modelValue || {})))

// Sync parent -> local
watch(() => props.modelValue, (nv) => {
  try {
    const nvClone = JSON.parse(JSON.stringify(nv || {}))
    // only update localModel if it actually differs to avoid triggering a cycle
    if (JSON.stringify(nvClone) !== JSON.stringify(localModel.value)) {
      localModel.value = nvClone
    }
  } catch (e) {
    if (JSON.stringify(nv || {}) !== JSON.stringify(localModel.value)) {
      localModel.value = nv || {}
    }
  }
}, { deep: true, flush: 'post' })

// Emit local -> parent
watch(localModel, (newValue) => {
  try {
    const newClone = JSON.parse(JSON.stringify(newValue))
    // avoid emitting if parent already has same value
    if (JSON.stringify(newClone) !== JSON.stringify(props.modelValue || {})) {
      emit('update:modelValue', newClone)
    }
  } catch (e) {
    emit('update:modelValue', newValue)
  }
}, { deep: true, flush: 'post' })

const open = ref(true)
const label = computed(() => `Q${(props.index ?? 0) + 1}`)
const typeOptions = [
  { label: 'Multiple Choice', value: 'mcq' },
  { label: 'Multiple Select', value: 'multi' },
  { label: 'Short Answer', value: 'short' },
  { label: 'Numeric Answer', value: 'numeric' },
  { label: 'Fill in the Blanks', value: 'fill_blank' },
  { label: 'Math / Multipart', value: 'math' },
  { label: 'Code Answer', value: 'code' },
]
const typeLabel = computed(() => typeOptions.find(o => o.value === (localModel.value?.type))?.label || (localModel.value?.type || ''))
const difficultyLabel = computed(() => (localModel.value?.difficulty) === 1 ? 'Easy' : (localModel.value?.difficulty) === 2 ? 'Medium' : 'Hard')

// The detailed form UI was moved to QuestionEditorForm to reduce duplication.


</script>

<style scoped>
.drag-handle {
  cursor: grab;
}
</style>
