<template>
  <div class="border rounded-lg bg-white shadow-sm">
    <div class="flex items-center justify-between p-3">
      <div class="flex items-center gap-3">
        <span class="drag-handle cursor-grab select-none" title="Drag to reorder">⠿</span>
        <UBadge color="gray" variant="soft">{{ label }}</UBadge>
        <UBadge color="gray" variant="soft">{{ typeLabel }}</UBadge>
        <UBadge color="gray" variant="soft">{{ difficultyLabel }}</UBadge>
  <UBadge color="gray" variant="soft">{{ localModel.marks }} pt</UBadge>
      </div>
      <div class="flex items-center gap-2">
        <UButton size="xs" color="gray" variant="ghost" @click="$emit('duplicate')">Duplicate</UButton>
        <UButton size="xs" color="red" variant="ghost" @click="$emit('remove')">Delete</UButton>
        <UButton size="xs" color="gray" variant="ghost" @click="open = !open">{{ open ? 'Collapse' : 'Edit' }}</UButton>
      </div>
    </div>

    <div v-show="open" class="p-4 border-t space-y-3">
      <div class="flex items-center gap-2">
  <USelect v-model="localModel.type" :options="typeOptions" class="w-44" />
  <USelect v-model="localModel.difficulty" :options="difficultyOptions" class="w-28" />
  <UInput v-model.number="localModel.marks" type="number" class="w-24" placeholder="Marks" />
  <UCheckbox v-model="localModel.is_banked" label="Bank" />
      </div>

        <div class="flex items-center gap-3">
            <label class="text-sm text-gray-600">Media</label>
            <input ref="imageInput" type="file" accept="image/*" @change="onImageSelected" class="hidden" />
            <input ref="audioInput" type="file" accept="audio/*" @change="onAudioSelected" class="hidden" />
            <UButton size="xs" variant="soft" @click="triggerImageInput">Choose Image</UButton>
            <UButton size="xs" variant="soft" @click="triggerAudioInput">Choose Audio</UButton>
            <UInput v-model="localModel.youtube_url" placeholder="YouTube link (optional)" class="max-w-md" />
          </div>

      <div>
  <RichTextEditor v-model="localModel.text" @ready="onEditorReady" />
      </div>

      <div v-if="localModel.type && (localModel.type.startsWith('mcq') || localModel.type === 'image' || localModel.type === 'audio')" class="space-y-2">
        <div v-for="(opt, i) in localModel.options" :key="i" class="flex items-start gap-2">
          <UTextarea v-model="localModel.options[i]" class="flex-1" v-autosize />
          <div class="flex flex-col items-start gap-2 mt-1">
            <template v-if="localModel.type === 'mcq-single' || localModel.type === 'image' || localModel.type === 'audio'">
              <UCheckbox :model-value="localModel.correct === i"
                @update:model-value="(v: boolean) => localModel.correct = v ? i : localModel.correct" label="Correct" />
            </template>
            <template v-else>
              <UCheckbox :model-value="(localModel.corrects || []).includes(i)"
                @update:model-value="(v: boolean) => toggleCorrect(i, v)" label="Correct" />
            </template>
            <UButton size="xs" color="red" variant="ghost" @click="$emit('remove-option', i)">Remove</UButton>
          </div>
        </div>
  <UButton size="xs" color="gray" variant="ghost" @click="$emit('add-option')">+ Add option</UButton>
      </div>

      <div v-if="localModel.type === 'tf'" class="flex items-center gap-2">
        <USelect v-model="localModel.correct" :options="tfOptions" class="w-36" />
        <UInput v-model="localModel.options[0]" placeholder="True text" class="w-48" />
        <UInput v-model="localModel.options[1]" placeholder="False text" class="w-48" />
      </div>

      <div v-if="localModel.type === 'fill'" class="flex items-center gap-2">
        <UInput v-model="localModel.fill_parts[0]" placeholder="Text before blank" class="w-48" />
        <span class="text-sm">__</span>
        <UInput v-model="localModel.fill_parts[1]" placeholder="Text after blank" class="w-48" />
      </div>

      <div>
        <UFormGroup label="Explanation (optional)">
          <UTextarea v-model="localModel.explanation" :rows="3" v-autosize />
        </UFormGroup>
      </div>



      <!-- Hint removed: backend does not expect a hint field, avoid sending it in payloads -->



      <div v-if="errors?.length" class="text-xs text-red-600">
        <div v-for="e in errors" :key="e">• {{ e }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, getCurrentInstance } from 'vue'
import UiTextarea from '~/components/ui/UiTextarea.vue'
import RichTextEditor from '~/components/editor/RichTextEditor.vue'

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
}, { deep: true })

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
}, { deep: true })

const open = ref(true)
const label = computed(() => `Q${(props.index ?? 0) + 1}`)
const typeLabel = computed(() => typeOptions.find(o => o.value === (localModel.value?.type))?.label || (localModel.value?.type || ''))
const difficultyLabel = computed(() => (localModel.value?.difficulty) === 1 ? 'Easy' : (localModel.value?.difficulty) === 2 ? 'Medium' : 'Hard')

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
  const arr = Array.isArray(localModel.value.corrects) ? [...localModel.value.corrects] : []
  const pos = arr.indexOf(i)
  if (v && pos === -1) arr.push(i)
  if (!v && pos !== -1) arr.splice(pos, 1)
  localModel.value.corrects = arr
}

function onEditorReady() { /* hook for parent if needed */ }

function onImageSelected(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    localModel.value.media = input.files[0]
    // store metadata
    localModel.value.media_metadata = { type: 'image', name: input.files[0].name }
  }
}

function onAudioSelected(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    localModel.value.media = input.files[0]
    localModel.value.media_metadata = { type: 'audio', name: input.files[0].name }
  }
}

// Template trigger functions that access the underlying input via internal $refs
function triggerImageInput() {
  try {
    const inst = getCurrentInstance()
    const el = inst?.refs?.imageInput as HTMLInputElement | undefined
    if (el) el.click()
  } catch (e) {}
}

function triggerAudioInput() {
  try {
    const inst = getCurrentInstance()
    const el = inst?.refs?.audioInput as HTMLInputElement | undefined
    if (el) el.click()
  } catch (e) {}
}

</script>

<style scoped>
.drag-handle {
  cursor: grab;
}
</style>