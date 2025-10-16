<template>
  <div class="border rounded-lg bg-white shadow-sm">
    <div class="flex items-center justify-between p-3">
      <div class="flex items-center gap-3">
        <span class="drag-handle cursor-grab select-none" title="Drag to reorder">⠿</span>
        <UBadge color="gray" variant="soft">{{ label }}</UBadge>
        <UBadge color="gray" variant="soft">{{ typeLabel }}</UBadge>
        <UBadge color="gray" variant="soft">{{ difficultyLabel }}</UBadge>
        <UBadge color="gray" variant="soft">{{ model.marks }} pt</UBadge>
      </div>
      <div class="flex items-center gap-2">
        <UButton size="2xs" color="gray" variant="ghost" @click="$emit('duplicate')">Duplicate</UButton>
        <UButton size="2xs" color="red" variant="ghost" @click="$emit('remove')">Delete</UButton>
        <UButton size="2xs" color="gray" variant="ghost" @click="open = !open">{{ open ? 'Collapse' : 'Edit' }}
        </UButton>
      </div>
    </div>

    <div v-show="open" class="p-4 border-t space-y-3">
      <div class="flex items-center gap-2">
        <USelect v-model="model.type" :options="typeOptions" class="w-44" />
        <USelect v-model="model.difficulty" :options="difficultyOptions" class="w-28" />
        <UInput v-model.number="model.marks" type="number" class="w-24" placeholder="Marks" />
        <UCheckbox v-model="model.is_banked" label="Bank" />
      </div>

      <div>
        <RichTextEditor v-model="model.text" @ready="onEditorReady" />
      </div>

      <div v-if="model.type.startsWith('mcq')" class="space-y-2">
        <div v-for="(opt, i) in model.options" :key="i" class="flex items-start gap-2">
          <UTextarea v-model="model.options[i]" class="flex-1" v-autosize />
          <div class="flex flex-col items-start gap-2 mt-1">
            <template v-if="model.type === 'mcq-single'">
              <UCheckbox :model-value="model.correct === i"
                @update:model-value="(v: boolean) => model.correct = v ? i : model.correct" label="Correct" />
            </template>
            <template v-else>
              <UCheckbox :model-value="(model.corrects || []).includes(i)"
                @update:model-value="(v: boolean) => toggleCorrect(i, v)" label="Correct" />
            </template>
            <UButton size="2xs" color="red" variant="ghost" @click="$emit('remove-option', i)">Remove</UButton>
          </div>
        </div>
        <UButton size="2xs" color="gray" variant="ghost" @click="$emit('add-option')">+ Add option</UButton>
      </div>

      <div v-if="model.type === 'tf'" class="flex items-center gap-2">
        <USelect v-model="model.correct" :options="tfOptions" class="w-36" />
        <UInput v-model="model.options[0]" placeholder="True text" class="w-48" />
        <UInput v-model="model.options[1]" placeholder="False text" class="w-48" />
      </div>

      <div v-if="model.type === 'fill'" class="flex items-center gap-2">
        <UInput v-model="model.fill_parts[0]" placeholder="Text before blank" class="w-48" />
        <span class="text-sm">__</span>
        <UInput v-model="model.fill_parts[1]" placeholder="Text after blank" class="w-48" />
      </div>

      <div>
        <UFormGroup label="Explanation (optional)">
          <UTextarea v-model="localModel.explanation" :rows="3" v-autosize />
        </UFormGroup>
      </div>

      <div>
        <UFormGroup label="Tags (comma-separated)">
          <UInput v-model="localModel.tags" placeholder="e.g. algebra, geometry" />
        </UFormGroup>
      </div>

      <div>
        <UFormGroup label="Hint (optional)">
          <UTextarea v-model="localModel.hint" :rows="2" v-autosize />
        </UFormGroup>
      </div>

      <div>
        <UFormGroup label="Solution Steps (optional)">
          <RichTextEditor v-model="localModel.solution_steps" />
        </UFormGroup>
      </div>

      <div v-if="errors?.length" class="text-xs text-red-600">
        <div v-for="e in errors" :key="e">• {{ e }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import UiTextarea from '~/components/ui/UiTextarea.vue'
import RichTextEditor from '~/components/editor/RichTextEditor.vue'

const props = defineProps<{ index: number, model: any, errors?: string[] }>()
const emit = defineEmits(['update:model', 'remove', 'duplicate', 'add-option', 'remove-option'])

const localModel = ref(JSON.parse(JSON.stringify(props.model)))

watch(localModel, (newValue) => {
  emit('update:model', newValue)
}, { deep: true })

const open = ref(true)
const label = computed(() => `Q${props.index + 1}`)
const typeLabel = computed(() => typeOptions.find(o => o.value === props.model.type)?.label || props.model.type)
const difficultyLabel = computed(() => props.model.difficulty === 1 ? 'Easy' : props.model.difficulty === 2 ? 'Medium' : 'Hard')

const typeOptions = [
  { label: 'MCQ (single)', value: 'mcq-single' },
  { label: 'MCQ (multiple)', value: 'mcq-multiple' },
  { label: 'True / False', value: 'tf' },
  { label: 'Fill in the blank', value: 'fill' },
  { label: 'Image-based', value: 'image' },
  { label: 'Audio-based', value: 'audio' },
]
const difficultyOptions = [
  { label: 'Easy', value: 1 },
  { label: 'Medium', value: 2 },
  { label: 'Hard', value: 3 },
]
const tfOptions = [
  { label: '--', value: -1 },
  { label: 'True', value: 0 },
  { label: 'False', value: 1 },
  { label: 'Both are correct', value: 2 },
  { label: 'None are correct', value: 3 },
]

function toggleCorrect(i: number, v: boolean) {
  const arr = props.model.corrects || []
  const pos = arr.indexOf(i)
  if (v && pos === -1) arr.push(i)
  if (!v && pos !== -1) arr.splice(pos, 1)
  props.model.corrects = arr
}

function onEditorReady() { /* hook for parent if needed */ }
</script>

<style scoped>
.drag-handle {
  cursor: grab;
}
</style>