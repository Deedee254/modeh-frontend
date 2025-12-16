<template>
  <div class="space-y-3">
    <!-- Media Preview -->
    <MediaPreview 
      :youtube-url="question?.youtube_url" 
      :media-url="question?.media_url" 
      :media-type="question?.media_type"
    />
    
    <!-- Fill in the Blanks - with option-based or text-based input -->
    <div v-if="hasOptions" class="fill-blank-card space-y-3">
      <!-- Text part -->
      <div class="text-sm sm:text-base break-words mb-3" v-html="question?.body || question?.text"></div>
      
      <!-- Options for Fill Blanks (when configured with options) -->
      <div class="space-y-2">
        <div v-for="(opt, i) in question.options || []" :key="i">
          <button 
            v-if="isSingleSelect"
            @click="selectOption(i)" 
            :class="[optionBtnClass(i), 'px-2 py-1.5 rounded-md gap-1 text-xs']" 
            class="w-full text-left border-2 transition-all duration-150 flex items-start"
          >
            <span class="font-medium mr-0.5 mt-0.5 text-xs flex-shrink-0">{{ String.fromCharCode(65 + i) }}.</span>
            <div class="flex-1 min-w-0">
              <div class="leading-tight text-xs break-words" v-html="opt.text || opt"></div>
            </div>
          </button>
          <button 
            v-else
            type="button" 
            @click="toggleOption(i)" 
            :class="[multiOptionBtnClass(i), 'px-2 py-1.5 rounded-md gap-1 text-xs']" 
            class="w-full text-left border transition-colors flex items-start"
          >
            <input type="checkbox" class="h-3 w-3 mt-1 flex-shrink-0" :checked="isOptionSelected(i)" readonly />
            <div class="flex-1 min-w-0">
              <div class="leading-tight text-xs break-words" v-html="opt.text || opt"></div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Traditional text-based blanks -->
    <div v-else class="fill-blank-card">
      <div class="inline-flex flex-wrap items-center gap-1">
        <template v-for="(tok, idx) in tokens" :key="idx">
          <span v-if="tok.type === 'text'" class="text-sm sm:text-base break-words" v-html="tok.value"></span>
          <span v-else-if="tok.type === 'blank'" class="inline-block">
            <input
              type="text"
              :aria-label="`Blank ${tok.index + 1}`"
              :value="localAnswers[tok.index] || ''"
              @input="onInput(tok.index, $event.target.value)"
              @keydown.enter.prevent="onEnter"
              class="inline-block px-3 py-1.5 border rounded-md w-40 text-sm sm:text-base"
            />
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import MediaPreview from './MediaPreview.vue'

const props = defineProps({ question: { type: Object, required: true }, modelValue: { type: [Array, Object, String, Number, null], default: null } })
const emit = defineEmits(['update:modelValue','select', 'toggle'])

// Check if fill blanks has options (when option_mode is set)
const hasOptions = computed(() => {
  return props.question?.option_mode !== undefined && Array.isArray(props.question?.options) && props.question.options.length > 0
})

const isSingleSelect = computed(() => props.question?.option_mode === 'single')

// detect blank markers in body: __ (two or more underscores) or [blank]
function parseTokens(text) {
  if (!text) return [{ type: 'text', value: '' }]
  const regex = /(__+|\[blank\])/g
  const tokens = []
  let lastIndex = 0
  let match
  let blankCount = 0
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) tokens.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    tokens.push({ type: 'blank', index: blankCount })
    blankCount++
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) tokens.push({ type: 'text', value: text.slice(lastIndex) })
  return tokens
}

const tokens = computed(() => parseTokens(props.question?.body || props.question?.text || ''))

// ensure modelValue is an array of correct length
const blankCount = computed(() => tokens.value.filter(t => t.type === 'blank').length)

const localAnswers = ref([])

function normalizeModel(v) {
  const arr = Array.isArray(v) ? [...v] : []
  while (arr.length < blankCount.value) arr.push('')
  return arr.slice(0, Math.max(blankCount.value, arr.length))
}

watch(() => props.modelValue, (v) => {
  localAnswers.value = normalizeModel(v)
}, { immediate: true })

watch(blankCount, (n) => {
  localAnswers.value = normalizeModel(props.modelValue)
})

function onInput(index, value) {
  const arr = [...localAnswers.value]
  arr[index] = value
  localAnswers.value = arr
  emit('update:modelValue', arr)
  emit('select', arr)
}

function onEnter() {
  emit('request-next')
}

// Option-based methods
function selectOption(index) {
  emit('update:modelValue', index)
  emit('select', index)
}

function toggleOption(index) {
  emit('toggle', index)
}

function isOptionSelected(index) {
  if (isSingleSelect.value) {
    return props.modelValue === index
  } else {
    return Array.isArray(props.modelValue) && props.modelValue.includes(index)
  }
}

function optionBtnClass(index) {
  const isSelected = props.modelValue === index
  return isSelected ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:border-brand-500' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
}

function multiOptionBtnClass(index) {
  return isOptionSelected(index) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 hover:bg-gray-50'
}
</script>

<style scoped>
/* Allow tokens and long text to wrap; ensure blanks size responsively */
.fill-blank-card { word-wrap: break-word; overflow-wrap: anywhere; white-space: normal }
.fill-blank-card .inline-flex { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem }
.fill-blank-card span { display: inline-block }
.fill-blank-card input {
  font-size: inherit;
  min-width: 6rem;
  max-width: 100%;
  width: auto;
  box-sizing: border-box;
}

@media (max-width: 640px) {
  /* On narrow screens make blanks take available width and wrap onto new lines when needed */
  .fill-blank-card .inline-flex { gap: 0.75rem }
  .fill-blank-card input { display: block; width: 100%; min-width: 0 }
}
</style>

