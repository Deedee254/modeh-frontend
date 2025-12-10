<template>
  <div class="space-y-2 sm:space-y-3">
      <div v-for="(part, idx) in parts" :key="idx" class="p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
          <div class="flex-1 min-w-0">
            <div class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 sm:mb-2"><strong>{{ partLabel(idx) }}</strong></div>
            <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2 sm:mb-3 break-words" v-html="part.text || ''"></div>
            <div>
              <textarea v-model="localAnswers[idx]" rows="3" class="w-full font-mono text-xs sm:text-sm rounded border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2" placeholder="Enter answer for {{ partLabel(idx) }}"></textarea>
              <div class="mt-1 sm:mt-2 prose-sm text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words" v-html="previews[idx]"></div>
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

// local answers per part so users can type answers; sync with modelValue if provided
const localAnswers = ref(parts.value.map((p, i) => (Array.isArray(props.modelValue) ? (props.modelValue[i] ?? '') : '')))

watch(parts, (nv) => { localAnswers.value = nv.map(() => '') })

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

const previews = computed(() => localAnswers.value.map(a => renderMathInline(a)))

watch(localAnswers, (nv) => {
  emit('update:modelValue', nv)
  emit('select', nv)
}, { deep: true })

function partLabel(i) {
  // label like 1a, 1b, ... or Part 1.1
  return props.question && props.question.base_label ? `${props.question.base_label}${String.fromCharCode(97 + i)}` : `Part ${i + 1}`
}
</script>

<style scoped>
/* minimal styling; layout handled by utility classes */
</style>

