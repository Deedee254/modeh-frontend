<template>
  <div v-if="local" class="space-y-3">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <USelect v-model="local.type" :options="typeOptions" size="sm" />
      <div class="grid grid-cols-2 gap-2">
        <USelect v-model="local.difficulty" :options="difficultyOptions" size="sm" />
        <UInput v-model.number="local.marks" type="number" placeholder="Marks" size="sm" />
      </div>
      <!-- Taxonomy selectors removed: questions inherit quiz taxonomy. -->
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
      <div v-if="uploading" class="text-sm text-gray-500">Uploading...</div>
      
      <!-- Media Previews -->
      <div class="space-y-2">
        <!-- Uploaded Image Preview -->
        <div v-if="mediaUrl && local.media_type === 'image'" class="mt-2">
          <img :src="mediaUrl" class="max-w-full h-auto rounded-lg max-h-48" />
          <UButton size="xs" color="red" variant="ghost" @click="mediaUrl = null; local.media_url = null; local.media_type = null" class="mt-2">Remove</UButton>
        </div>
        
        <!-- Uploaded Audio Preview -->
        <div v-if="mediaUrl && local.media_type === 'audio'" class="mt-2">
          <audio :src="mediaUrl" controls class="w-full"></audio>
          <UButton size="xs" color="red" variant="ghost" @click="mediaUrl = null; local.media_url = null; local.media_type = null" class="mt-2">Remove</UButton>
        </div>
        
        <!-- YouTube Preview -->
        <div v-if="local.youtube_url && isValidYoutubeUrl(local.youtube_url)" class="mt-2 rounded-lg overflow-hidden bg-gray-900">
          <iframe 
            :src="getYoutubeEmbedUrl(local.youtube_url)" 
            class="w-full aspect-video rounded-lg" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
          ></iframe>
          <UButton size="xs" color="red" variant="ghost" @click="local.youtube_url = null" class="mt-2">Remove</UButton>
        </div>
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

    <!-- Option Type Selector (for MCQ, Multi, FillBlanks) -->
    <div v-if="isOptionType && canToggleOptionMode" class="space-y-2">
      <div class="flex items-center gap-2">
        <UButton
          v-for="mode in optionModes"
          :key="mode"
          :variant="local.option_mode === mode ? 'soft' : 'ghost'"
          :color="local.option_mode === mode ? 'primary' : 'gray'"
          size="xs"
          @click="switchOptionMode(mode as 'single' | 'multi')"
          class="text-xs"
        >
          {{ mode === 'single' ? 'Single Select' : 'Multi Select' }}
        </UButton>
      </div>
    </div>

    <div v-if="isOptionType" class="space-y-2">
      <h4 class="text-sm font-semibold text-slate-700">Options</h4>
      <div v-for="(opt, i) in local.options" :key="i" class="space-y-1 pb-2 border-b last:border-b-0">
        <UTextarea :model-value="getOptionText(opt)" @update:model-value="(v) => setOptionText(i, v)" placeholder="Option text" :rows="2" v-autosize />
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-2">
            <UCheckbox :model-value="(local.answers || []).includes(i.toString())"
              @update:model-value="(v) => toggleAnswer(i.toString(), v)" 
              :label="local.option_mode === 'single' ? 'Correct' : 'Correct'" />
          </div>
          <UButton size="xs" color="red" variant="ghost" @click="$emit('remove-option', i)">Remove</UButton>
        </div>
      </div>
      <UButton size="xs" color="gray" variant="soft" @click="$emit('add-option')" class="w-full">+ Add option</UButton>
    </div>



    <div v-if="local.type === 'short' || local.type === 'numeric'" class="space-y-2">
      <UFormGroup label="Correct Answer">
        <UInput v-model="local.answers[0]" placeholder="Enter the correct answer" size="sm" />
      </UFormGroup>
    </div>

    <!-- Math Parts Editor -->
    <div v-if="local.type === 'math'" class="space-y-3 border-t pt-3">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-semibold text-slate-700">Parts</h4>
        <UButton size="xs" color="gray" variant="soft" @click="addMathPart" class="text-xs">+ Add Part</UButton>
      </div>
      
      <div v-for="(part, idx) in (local.parts || [])" :key="idx" class="p-3 rounded-lg border border-gray-200 bg-gray-50 space-y-2">
        <div class="flex items-center justify-between gap-2">
          <div class="text-sm font-medium">Part {{ String.fromCharCode(97 + idx) }}</div>
          <UButton size="xs" color="red" variant="ghost" @click="removeMathPart(idx)">Remove</UButton>
        </div>
        
        <!-- Part text -->
        <UTextarea 
          :model-value="part.text || ''" 
          @update:model-value="(v) => updateMathPart(idx, { text: v })"
          placeholder="Part question text" 
          :rows="2" 
        />
        
        <!-- Part marks -->
        <div class="grid grid-cols-2 gap-2">
          <UInput 
            :model-value="part.marks || '1'" 
            @update:model-value="(v) => updateMathPart(idx, { marks: Number(v) || 1 })"
            type="number" 
            placeholder="Marks" 
            size="sm" 
          />
          
          <!-- Part type selector -->
          <USelect 
            :model-value="part.part_type || 'text'" 
            @update:model-value="(v) => updateMathPart(idx, { part_type: v })"
            :options="[
              { label: 'Text Answer', value: 'text' },
              { label: 'MCQ', value: 'mcq' },
              { label: 'Multi Select', value: 'multi' }
            ]"
            size="sm"
          />
        </div>
        
        <!-- Part options (for MCQ/Multi) -->
        <div v-if="part.part_type === 'mcq' || part.part_type === 'multi'" class="space-y-2 border-t pt-2">
          <div class="text-xs font-medium text-gray-600">Options</div>
          <div v-for="(opt, oidx) in (part.options || [])" :key="oidx" class="flex gap-2 items-start">
            <UTextarea 
              :model-value="typeof opt === 'string' ? opt : opt.text" 
              @update:model-value="(v) => updateMathPartOption(idx, oidx, v)"
              placeholder="Option text" 
              :rows="1"
              class="flex-1"
            />
            <UCheckbox 
              :model-value="part.answers && part.answers.includes(String(oidx))"
              @update:model-value="(v) => toggleMathPartAnswer(idx, String(oidx), v)"
              label="Correct"
            />
            <UButton size="xs" color="red" variant="ghost" @click="removeMathPartOption(idx, oidx)">X</UButton>
          </div>
          <UButton size="xs" color="gray" variant="soft" @click="addMathPartOption(idx)" class="w-full text-xs">+ Add Option</UButton>
        </div>
      </div>
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
import { watch, getCurrentInstance, computed, ref } from 'vue'
import RichTextEditor from '~/components/editor/RichTextEditor.vue'
import { useAppAlert } from '~/composables/useAppAlert'

interface Props {
  modelValue: Record<string, any>
  gradeId?: number
  levelId?: number
  subjectId?: number
  topicId?: number
  errors?: any[]
}
const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'add-option', 'remove-option'])

const local = defineModel<Record<string, any>>({ required: true })
const mediaUrl = ref<string | null>(null)
const uploading = ref(false)
const alert = useAppAlert()
const imageInput = ref<HTMLInputElement | null>(null)
const audioInput = ref<HTMLInputElement | null>(null)

// taxonomy is determined by the parent quiz; no local selectors here

const optionTypes = ['mcq', 'multi', 'fill_blank']
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

function getDefaultForm(type = 'mcq') {
  return {
    type,
    text: '',
    explanation: '',
    options: (type === 'mcq' || type === 'multi' || type === 'fill_blank') ? [
      { text: '', is_correct: false },
      { text: '', is_correct: false }
    ] : [],
    answers: type === 'mcq' ? ['0'] : (type === 'short' || type === 'numeric' ? [''] : []),
    parts: [],
    difficulty: 2,
    marks: 1
  }
}

import useApi from '~/composables/useApi'

async function uploadMedia(file: File, type: 'image' | 'audio') {
  // Instead of uploading directly to a cross-origin `/uploads` endpoint (which can
  // trigger CORS/preflight failures), attach the File to the local model and show
  // a client-side preview. The store's saveQuestion flow will send the file to the
  // API endpoint that already handles CORS correctly when persisting the question.
  uploading.value = true
  mediaUrl.value = null
  try {
    // Create a local preview (data URL)
    const reader = new FileReader()
    const previewPromise = new Promise<void>((resolve) => {
      reader.onload = (e) => {
        mediaUrl.value = (e.target && (e.target as any).result) || null
        resolve()
      }
      reader.onerror = () => resolve()
    })
    reader.readAsDataURL(file)
    await previewPromise

    // Attach the File to the model so `saveQuestion` will include it in FormData
    try { local.value.media_file = file } catch (e) { /* ignore */ }
    local.value.media_type = type
    // Clear any previously-set remote URL since we'll upload the file on save
    local.value.media_url = null
  } catch (error) {
    console.error('Attach media failed:', error)
    try { alert.push({ type: 'error', message: 'Failed to attach media. Please try again.' }) } catch (e) {}
  } finally {
    uploading.value = false
  }
}


function toggleAnswer(answer: string, v: boolean) {
  const arr = Array.isArray(local.value.answers) ? [...local.value.answers] : []
  const pos = arr.indexOf(answer)
  if (v && pos === -1) arr.push(answer)
  if (!v && pos !== -1) arr.splice(pos, 1)
  local.value.answers = arr
}

function switchOptionMode(mode: 'single' | 'multi') {
  local.value.option_mode = mode
  // When switching from single to multi, answers array already exists
  // When switching from multi to single, keep only first answer if multiple selected
  if (mode === 'single' && local.value.answers && local.value.answers.length > 1) {
    local.value.answers = [local.value.answers[0]]
  }
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

// Math part management functions
function addMathPart() {
  if (!Array.isArray(local.value.parts)) local.value.parts = []
  local.value.parts.push({
    text: '',
    marks: 1,
    part_type: 'text',
    options: [],
    answers: []
  })
}

function removeMathPart(index: number) {
  if (Array.isArray(local.value.parts)) {
    local.value.parts.splice(index, 1)
  }
}

function updateMathPart(index: number, updates: Record<string, any>) {
  if (Array.isArray(local.value.parts) && local.value.parts[index]) {
    Object.assign(local.value.parts[index], updates)
  }
}

function addMathPartOption(partIndex: number) {
  if (Array.isArray(local.value.parts) && local.value.parts[partIndex]) {
    const part = local.value.parts[partIndex]
    if (!Array.isArray(part.options)) part.options = []
    part.options.push({ text: '', is_correct: false })
  }
}

function removeMathPartOption(partIndex: number, optionIndex: number) {
  if (Array.isArray(local.value.parts) && local.value.parts[partIndex]) {
    const part = local.value.parts[partIndex]
    if (Array.isArray(part.options) && part.options.length > 1) {
      part.options.splice(optionIndex, 1)
    }
  }
}

function updateMathPartOption(partIndex: number, optionIndex: number, text: string) {
  if (Array.isArray(local.value.parts) && local.value.parts[partIndex]) {
    const part = local.value.parts[partIndex]
    if (Array.isArray(part.options) && part.options[optionIndex]) {
      if (typeof part.options[optionIndex] === 'string') {
        part.options[optionIndex] = { text, is_correct: false }
      } else {
        part.options[optionIndex].text = text
      }
    }
  }
}

function toggleMathPartAnswer(partIndex: number, answerIndex: string, isCorrect: boolean) {
  if (Array.isArray(local.value.parts) && local.value.parts[partIndex]) {
    const part = local.value.parts[partIndex]
    if (!Array.isArray(part.answers)) part.answers = []
    
    const pos = part.answers.indexOf(answerIndex)
    if (isCorrect && pos === -1) {
      // For single select MCQ, clear previous answer
      if (part.part_type === 'mcq') {
        part.answers = [answerIndex]
      } else {
        part.answers.push(answerIndex)
      }
    } else if (!isCorrect && pos !== -1) {
      part.answers.splice(pos, 1)
    }
  }
}

const isOptionType = computed(() => optionTypes.includes(local.value.type))
const isSingleChoiceType = computed(() => singleChoiceTypes.includes(local.value.type))
const canToggleOptionMode = computed(() => {
  // Can toggle option mode for MCQ, Multi, and FillBlanks
  return ['mcq', 'multi', 'fill_blank'].includes(local.value.type)
})
const optionModes = ['single', 'multi']
const fillBlankCount = computed(() => (local.value.text || '').match(blankPattern)?.length || 0)

watch(() => local.value.type, (type) => {
  if (optionTypes.includes(type)) {
    // Initialize option_mode if not set
    if (!local.value.option_mode) {
      local.value.option_mode = type === 'mcq' ? 'single' : 'multi'
    }
    if (!Array.isArray(local.value.options) || local.value.options.length < 2) {
      local.value.options = [
        { text: '', is_correct: false },
        { text: '', is_correct: false }
      ]
      // Set first option as correct for single choice
      if (local.value.option_mode === 'single') {
        local.value.answers = ['0']
      } else {
        local.value.answers = []
      }
    } else {
      // Convert string options to objects, but preserve is_correct flags from answers array
      const currentAnswers = Array.isArray(local.value.answers) ? local.value.answers : []
      local.value.options = local.value.options.map((opt: any, idx: number) => {
        if (typeof opt === 'string') {
          // Check if this option index is in the answers array
          const isCorrect = currentAnswers.includes(String(idx))
          return { text: opt, is_correct: isCorrect }
        }
        return opt
      })
      // Sync is_correct flags with answers array if answers exist
      if (currentAnswers.length > 0) {
        local.value.options.forEach((opt: any, idx: number) => {
          opt.is_correct = currentAnswers.includes(String(idx))
        })
      }
    }
    if (local.value.option_mode === 'single') {
      if (!Array.isArray(local.value.answers) || local.value.answers.length === 0) {
        local.value.answers = ['0']
        // Also set first option as correct
        if (local.value.options.length > 0) {
          local.value.options.forEach((opt: any, idx: number) => {
            opt.is_correct = idx === 0
          })
        }
      }
    } else {
      if (!Array.isArray(local.value.answers)) {
        local.value.answers = []
      }
    }
  } else {
    local.value.options = []
  }

  if (type === 'short' || type === 'numeric') {
    if (!Array.isArray(local.value.answers) || local.value.answers.length === 0) local.value.answers = ['']
  } else if (type === 'code') {
    // Code type: initialize answer as empty string
    if (!local.value.answers || local.value.answers.length === 0) {
      local.value.answers = ['']
    }
  } else if (!optionTypes.includes(type)) {
    local.value.answers = []
  }
}, { immediate: true })



function onEditorReady() { /* placeholder for parent hook */ }

function onImageSelected(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    uploadMedia(input.files[0], 'image')
    // Reset input so selecting the same file again will trigger change
    try { input.value = '' } catch (e) {}
  }
}

function onAudioSelected(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    uploadMedia(input.files[0], 'audio')
    // Reset input so selecting the same file again will trigger change
    try { input.value = '' } catch (e) {}
  }
}

function triggerImageInput() {
  imageInput.value?.click()
}

function triggerAudioInput() {
  audioInput.value?.click()
}

function getYoutubeEmbedUrl(url: string): string {
  if (!url) return ''
  // Extract YouTube video ID from various URL formats
  let videoId = ''
  
  // Handle youtu.be/VIDEOID format
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || ''
  }
  // Handle youtube.com/watch?v=VIDEOID format
  else if (url.includes('youtube.com/watch')) {
    try {
      videoId = new URL(url).searchParams.get('v') || ''
    } catch (e) {
      // If URL parsing fails, try string extraction
      const match = url.match(/[?&]v=([^&]+)/)
      videoId = match?.[1] || ''
    }
  }
  // Handle embed format youtube.com/embed/VIDEOID
  else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || ''
  }
  
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url
}

function isValidYoutubeUrl(url: string): boolean {
  if (!url) return false
  // Simple validation: must contain youtube or youtu.be
  return url.includes('youtube.com') || url.includes('youtu.be')
}

</script>

<style scoped>
.drag-handle { cursor: grab; }
</style>

