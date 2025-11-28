<template>
  <div class="prose max-w-none fill-blank-card">
    <div class="inline-flex flex-wrap items-center gap-1">
      <template v-for="(tok, idx) in tokens" :key="idx">
        <span v-if="tok.type === 'text'" v-html="tok.value"></span>
        <span v-else-if="tok.type === 'blank'" class="inline-block">
          <input
            type="text"
            :aria-label="`Blank ${tok.index + 1}`"
            :value="localAnswers[tok.index] || ''"
            @input="onInput(tok.index, $event.target.value)"
            class="inline-block px-2 py-1 border rounded-md w-40"
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
</script>

<style scoped>
.fill-blank-card input { min-width: 8rem }
</style>

