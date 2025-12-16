<template>
  <div class="space-y-2 sm:space-y-3">
      <div v-for="(part, idx) in parts" :key="idx" class="p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
          <div class="flex-1 min-w-0">
            <div class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 sm:mb-2"><strong>{{ partLabel(idx) }}</strong></div>
            <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2 sm:mb-3 break-words" v-html="part.text || ''"></div>
            
            <!-- Text-based answer part -->
            <div v-if="part.part_type !== 'mcq' && part.part_type !== 'multi'">
              <textarea 
                v-model="localAnswers[idx]" 
                rows="3" 
                class="w-full font-mono text-xs sm:text-sm rounded border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2" 
                placeholder="Enter answer for {{ partLabel(idx) }}"
              ></textarea>
              <div class="mt-1 sm:mt-2 prose-sm text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words" v-html="previews[idx]"></div>
            </div>

            <!-- Option-based answer part (MCQ/Multi) -->
            <div v-else class="space-y-1.5">
              <div v-for="(opt, oidx) in (part.options || [])" :key="oidx">
                <button
                  v-if="part.part_type === 'mcq'"
                  @click="selectPartOption(idx, oidx)"
                  :class="[partOptionClass(idx, oidx), 'px-2 py-1.5 rounded text-xs']"
                  class="w-full text-left border-2 transition-all duration-150"
                >
                  <span class="font-medium mr-1">{{ String.fromCharCode(65 + oidx) }}.</span>
                  <span class="break-words" v-html="typeof opt === 'string' ? opt : opt.text"></span>
                </button>
                <button
                  v-else
                  type="button"
                  @click="togglePartOption(idx, oidx)"
                  :class="[partMultiOptionClass(idx, oidx), 'px-2 py-1.5 rounded text-xs']"
                  class="w-full text-left border transition-colors flex items-start gap-1"
                >
                  <input type="checkbox" class="h-3 w-3 mt-0.5 flex-shrink-0" :checked="isPartOptionSelected(idx, oidx)" readonly />
                  <span class="break-words" v-html="typeof opt === 'string' ? opt : opt.text"></span>
                </button>
              </div>
            </div>
          </div>
          <div class="flex-shrink-0 text-right">
            <div class="text-xs text-gray-500">Marks</div>
            <div class="text-lg sm:text-2xl font-semibold">{{ part.marks ?? '-' }}</div>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuizMedia } from '~/composables/quiz/useQuizMedia'

let katex = null
// dynamically import katex only on client to avoid SSR issues
onMounted(async () => {
  try {
    const mod = await import('katex')
    katex = mod
  } catch (e) {
    // ignore if katex unavailable
    katex = null
  }
})

const props = defineProps({ question: { type: Object, required: true }, modelValue: null })
const emit = defineEmits(['update:modelValue','select'])

const quizMedia = useQuizMedia()

const hasMedia = computed(() => !!(props.question && (props.question.media_path || props.question.media || props.question.youtube_url || props.question.youtube)))
const mediaSrc = computed(() => props.question?.media_path || props.question?.media || props.question?.youtube_url || props.question?.youtube || null)
const isImage = computed(() => quizMedia.isImage(mediaSrc.value))
const isAudio = computed(() => quizMedia.isAudio(mediaSrc.value))
const isEmbed = computed(() => !!(props.question?.youtube_url || props.question?.youtube))
const embedUrl = computed(() => props.question?.youtube_url || props.question?.youtube)

// parts can be provided as question.parts or question.subparts; normalize
const parts = computed(() => {
  if (!props.question) return []
  if (Array.isArray(props.question.parts) && props.question.parts.length) return props.question.parts
  if (Array.isArray(props.question.subparts) && props.question.subparts.length) return props.question.subparts
  // fallback: if the question has a single mark value, expose one part
  return [{ text: '', marks: props.question.marks ?? null }]
})

const totalMarks = computed(() => parts.value.reduce((s, p) => s + (Number(p.marks) || 0), 0))

// local answers per part - can be string or array depending on part type
const localAnswers = ref(
  parts.value.map((p, i) => {
    if (Array.isArray(props.modelValue) && props.modelValue[i] !== undefined) {
      return props.modelValue[i]
    }
    return (p.part_type === 'mcq' || p.part_type === 'multi') ? null : ''
  })
)

watch(parts, (nv) => { 
  localAnswers.value = nv.map((p) => (p.part_type === 'mcq' || p.part_type === 'multi') ? null : '')
})

// render previews that convert $...$ and $$...$$ to KaTeX HTML when available; fallback to raw text
function renderMathInline(text) {
  if (!text) return ''
  if (!katex) return text.replace(/\n/g, '<br/>')
  try {
    // replace $$...$$ first
    let out = text.replace(/\$\$(.+?)\$\$/gs, (m, expr) => {
      try { return katex.renderToString(expr, { displayMode: true }) } catch (e) { return m }
    })
    // then single $...$
    out = out.replace(/\$(.+?)\$/gs, (m, expr) => {
      try { return katex.renderToString(expr, { displayMode: false }) } catch (e) { return m }
    })
    // escape newlines
    return out.replace(/\n/g, '<br/>')
  } catch (e) { return text }
}

const previews = computed(() => localAnswers.value.map((a, idx) => {
  if (parts.value[idx]?.part_type !== 'text') return '' // No preview for option-based
  return renderMathInline(a)
}))

watch(localAnswers, (nv) => {
  emit('update:modelValue', nv)
  emit('select', nv)
}, { deep: true })

function partLabel(i) {
  // label like 1a, 1b, ... or Part 1.1
  return props.question && props.question.base_label ? `${props.question.base_label}${String.fromCharCode(97 + i)}` : `Part ${i + 1}`
}

// Option-based part methods
function selectPartOption(partIdx, optIdx) {
  const arr = [...localAnswers.value]
  arr[partIdx] = optIdx
  localAnswers.value = arr
  emit('update:modelValue', arr)
  emit('select', arr)
}

function togglePartOption(partIdx, optIdx) {
  const arr = [...localAnswers.value]
  const answer = arr[partIdx]
  const selected = Array.isArray(answer) ? [...answer] : []
  const pos = selected.indexOf(optIdx)
  if (pos === -1) {
    selected.push(optIdx)
  } else {
    selected.splice(pos, 1)
  }
  arr[partIdx] = selected
  localAnswers.value = arr
  emit('update:modelValue', arr)
  emit('select', arr)
}

function isPartOptionSelected(partIdx, optIdx) {
  const part = parts.value[partIdx]
  const answer = localAnswers.value[partIdx]
  if (part.part_type === 'mcq') {
    return answer === optIdx
  } else {
    return Array.isArray(answer) && answer.includes(optIdx)
  }
}

function partOptionClass(partIdx, optIdx) {
  const isSelected = localAnswers.value[partIdx] === optIdx
  return isSelected ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 hover:bg-gray-50'
}

function partMultiOptionClass(partIdx, optIdx) {
  const isSelected = Array.isArray(localAnswers.value[partIdx]) && localAnswers.value[partIdx].includes(optIdx)
  return isSelected ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 hover:bg-gray-50'
}

watch(localAnswers, (nv) => {
  emit('update:modelValue', nv)
  emit('select', nv)
}, { deep: true })
</script>

<style scoped>
/* minimal styling; layout handled by utility classes */
</style>

