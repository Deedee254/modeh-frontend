<template>
  <div class="space-y-3">
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white" v-html="question?.body"></h3>
        <div v-if="hasMedia" class="mt-3">
          <img v-if="isImage" :src="mediaSrc" class="w-full max-h-48 object-cover rounded-lg" />
          <audio v-else-if="isAudio" :src="mediaSrc" controls class="w-full" />
          <div v-else-if="isEmbed" class="aspect-video rounded-lg overflow-hidden"><iframe :src="embedUrl" class="w-full h-full" frameborder="0" allowfullscreen loading="lazy"></iframe></div>
        </div>
        <div v-if="question?.explanation" class="mt-3 text-sm text-gray-600 dark:text-gray-300 prose prose-sm" v-html="question.explanation"></div>
      </div>
      <div class="w-28 text-right">
        <div class="text-xs text-gray-500">Total marks</div>
        <div class="text-2xl font-bold text-brand-600">{{ totalMarks }}</div>
      </div>
    </div>

    <div class="space-y-3">
      <div v-for="(part, idx) in parts" :key="idx" class="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1">
            <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"><strong>{{ partLabel(idx) }}</strong></div>
            <div class="text-sm text-gray-600 dark:text-gray-300 mb-3" v-html="part.text || ''"></div>
            <div>
              <textarea v-model="localAnswers[idx]" rows="3" class="w-full font-mono text-sm rounded border border-gray-200 dark:border-gray-700 px-3 py-2" placeholder="Enter answer for {{ partLabel(idx) }}"></textarea>
              <div class="mt-2 prose-sm text-sm text-gray-700 dark:text-gray-300" v-html="previews[idx]"></div>
            </div>
          </div>
          <div class="w-24 text-right">
            <div class="text-xs text-gray-500">Marks</div>
            <div class="text-lg font-semibold">{{ part.marks ?? '-' }}</div>
          </div>
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

