<template>
  <div v-if="local" class="space-y-3">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <USelect v-model="local.type" :options="typeOptions" size="sm" />
      <div class="grid grid-cols-2 gap-2">
        <USelect v-model="local.difficulty" :options="difficultyOptions" size="sm" />
        <UInput v-model.number="local.marks" type="number" placeholder="Marks" size="sm" />
      </div>
      <div class="col-span-1 sm:col-span-2 flex items-center">
        <UCheckbox v-model="local.is_banked" label="Bank this question" />
      </div>
    </div>

    <div v-if="local.type === 'math' || local.type === 'code'" class="space-y-2">
      <USelect v-model="local.mode" :options="[{ label: 'Single answer', value: 'single' }, { label: 'Multiple answers', value: 'multi' }]" size="sm" />
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-600">Media</label>
      <input ref="imageInput" type="file" accept="image/*" @change="onImageSelected" class="hidden" />
      <input ref="audioInput" type="file" accept="audio/*" @change="onAudioSelected" class="hidden" />
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <UButton size="xs" variant="soft" @click="triggerImageInput" class="w-full">Image</UButton>
        <UButton size="xs" variant="soft" @click="triggerAudioInput" class="w-full">Audio</UButton>
        <UInput v-model="local.youtube_url" placeholder="YouTube link" class="col-span-2 sm:col-span-1" size="sm" />
      </div>
    </div>

    <div>
      <template v-if="local.type === 'fill_blank'">
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-600">Question text</label>
          <UTextarea v-model="local.text" placeholder="Use __ for blanks" :rows="4" v-autosize />
        </div>
      </template>
      <template v-else>
        <RichTextEditor 
          v-model="local.text" 
          @ready="onEditorReady"
          placeholder="Enter your question here..."
          :features="{ math: true, code: true }"
        />
      </template>
    </div>

    <div v-if="isOptionType" class="space-y-2">
      <h4 class="text-sm font-semibold text-slate-700">Options</h4>
      <div v-for="(opt, i) in local.options" :key="i" class="space-y-1 pb-2 border-b last:border-b-0">
        <UTextarea :model-value="getOptionText(opt)" @update:model-value="(v) => setOptionText(i, v)" placeholder="Option text" :rows="2" v-autosize />
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-2">
            <template v-if="isSingleChoiceType">
              <UCheckbox :model-value="local.correct === i"
                @update:model-value="(v) => local.correct = v ? i : local.correct" label="Correct" />
            </template>
            <template v-else>
              <UCheckbox :model-value="(local.corrects || []).includes(i)"
                @update:model-value="(v) => toggleCorrect(i, v)" label="Correct" />
            </template>
          </div>
          <UButton size="xs" color="red" variant="ghost" @click="$emit('remove-option', i)">Remove</UButton>
        </div>
      </div>
      <UButton size="xs" color="gray" variant="soft" @click="$emit('add-option')" class="w-full">+ Add option</UButton>
    </div>

    <div v-if="local.type === 'fill_blank'" class="space-y-2">
      <div v-if="fillBlankCount > 0" class="space-y-2">
        <div
          v-for="(answer, idx) in local.answers"
          :key="idx"
          class="space-y-1"
        >
          <label class="text-sm text-gray-600">Blank {{ idx + 1 }}</label>
          <UInput v-model="local.answers[idx]" placeholder="Correct answer" size="sm" />
        </div>
      </div>
      <div v-else class="text-xs text-gray-500">Add blanks using __ in the question text.</div>
    </div>

    <div>
      <UFormGroup label="Explanation (optional)">
        <UTextarea v-model="local.explanation" :rows="3" v-autosize />
      </UFormGroup>
    </div>

    <div v-if="errors?.length" class="text-xs text-red-600">
      <div v-for="(e, idx) in errors" :key="idx">• {{ e }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, getCurrentInstance, computed } from 'vue'
import RichTextEditor from '~/components/editor/RichTextEditor.vue'

interface Props {
  modelValue: Record<string, any>
  errors?: any[]
}
const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'add-option', 'remove-option'])

const local = defineModel<Record<string, any>>({ required: true })

const optionTypes = ['mcq', 'multi']
const singleChoiceTypes = ['mcq']
const blankPattern = /__+/g

const typeOptions = [
  { label: 'Multiple Choice', value: 'mcq' },
  { label: 'Multiple Select', value: 'multi' },
  { label: 'Short Answer', value: 'short' },
  { label: 'Numeric Answer', value: 'numeric' },
  { label: 'Fill in the Blanks', value: 'fill_blank' },
  { label: 'Math / Multipart', value: 'math' },
  { label: 'Code Answer', value: 'code' },
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
  const arr = Array.isArray(local.value.corrects) ? [...local.value.corrects] : []
  const pos = arr.indexOf(i)
  if (v && pos === -1) arr.push(i)
  if (!v && pos !== -1) arr.splice(pos, 1)
  local.value.corrects = arr
}

function getOptionText(opt: any): string {
  if (typeof opt === 'string') return opt
  if (typeof opt === 'object' && opt !== null) return opt.text || ''
  return ''
}

function setOptionText(i: number, text: string) {
  const opt = local.value.options[i]
  if (typeof opt === 'string') {
    local.value.options[i] = { text, is_correct: false }
  } else if (typeof opt === 'object' && opt !== null) {
    opt.text = text
  }
}

const isOptionType = computed(() => optionTypes.includes(local.value.type))
const isSingleChoiceType = computed(() => singleChoiceTypes.includes(local.value.type))
const fillBlankCount = computed(() => (local.value.text || '').match(blankPattern)?.length || 0)

watch(() => local.value.type, (type) => {
  if (optionTypes.includes(type)) {
    if (!Array.isArray(local.value.options) || local.value.options.length < 2) {
      local.value.options = [
        { text: '', is_correct: true },
        { text: '', is_correct: false }
      ]
    } else {
      local.value.options = local.value.options.map((opt: any) => {
        if (typeof opt === 'string') {
          return { text: opt, is_correct: false }
        }
        return opt
      })
    }
    if (singleChoiceTypes.includes(type)) {
      local.value.correct = typeof local.value.correct === 'number' ? local.value.correct : -1
      local.value.corrects = []
    } else {
      const normalized = Array.isArray(local.value.corrects) ? local.value.corrects.map((c: any) => Number(c)) : []
      local.value.corrects = Array.from(new Set(normalized.filter((c: any) => Number.isFinite(c))))
      local.value.correct = -1
    }
  } else {
    local.value.options = []
    local.value.correct = -1
    local.value.corrects = []
  }

  if (type === 'fill_blank') {
    if (!Array.isArray(local.value.answers)) local.value.answers = []
  } else {
    local.value.answers = []
  }
}, { immediate: true })

watch(() => local.value.text, (val) => {
  if (local.value.type !== 'fill_blank') return
  const text = typeof val === 'string' ? val : ''
  const segments = text.split(blankPattern)
  const blanks = Math.max(segments.length - 1, 0)
  if (!Array.isArray(local.value.answers)) local.value.answers = []
  while (local.value.answers.length < blanks) local.value.answers.push('')
  if (local.value.answers.length > blanks) local.value.answers.splice(blanks)
}, { immediate: true })

function onEditorReady() { /* placeholder for parent hook */ }

function onImageSelected(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    local.value.media = input.files[0]
    local.value.media_metadata = { type: 'image', name: input.files[0].name }
  }
}

function onAudioSelected(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    local.value.media = input.files[0]
    local.value.media_metadata = { type: 'audio', name: input.files[0].name }
  }
}

function triggerImageInput() {
  try {
    const inst = getCurrentInstance()
    const el = inst?.refs?.imageInput as HTMLInputElement | undefined
    el?.click()
  } catch (e) {}
}

function triggerAudioInput() {
  try {
    const inst = getCurrentInstance()
    const el = inst?.refs?.audioInput as HTMLInputElement | undefined
    el?.click()
  } catch (e) {}
}

</script>

<style scoped>
.drag-handle { cursor: grab; }
</style>
