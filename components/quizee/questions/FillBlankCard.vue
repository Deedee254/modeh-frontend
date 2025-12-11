<template>
  <div class="fill-blank-card">
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
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({ question: { type: Object, required: true }, modelValue: { type: [Array, Object, String, Number, null], default: null } })
const emit = defineEmits(['update:modelValue','select'])

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
  // When Enter is pressed inside any blank input, request advancing to next question
  emit('request-next')
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

