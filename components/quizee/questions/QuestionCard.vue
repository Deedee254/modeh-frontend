<template>
  <div class="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-2 sm:p-3">
  <div :class="layoutClass">
      <div v-if="hasMedia" class="media-col mb-2 sm:mb-0 sm:mr-3">
        <slot name="media">
          <img v-if="isImage" :src="mediaSrc" class="w-full h-auto rounded-lg object-cover" />
          <audio v-else-if="isAudio" controls class="w-full rounded-lg"><source :src="mediaSrc" /></audio>
          <div v-else-if="isEmbed" class="aspect-video rounded-lg overflow-hidden"><iframe :src="embedUrl" class="w-full h-full" frameborder="0" allowfullscreen loading="lazy"></iframe></div>
          <a v-else-if="mediaSrc" :href="mediaSrc" target="_blank" rel="noopener" class="text-brand-600 underline">Open media</a>
        </slot>
      </div>

      <div class="content-col">
  <h3 v-if="showHeader" class="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 leading-snug break-words whitespace-normal" v-html="question?.body"></h3>
  <component v-if="componentName" :is="componentName" :question="question" :model-value="modelValue" :compact="isCompact" @update:model-value="emit('update:modelValue', $event)" @select="$emit('select',$event)" @toggle="$emit('toggle',$event)" />
  <div v-else class="text-xs text-red-600 dark:text-red-400">Component missing for question type: {{ question?.type || 'unknown' }}</div>
                  <div class="mt-1">
                    <span v-if="question.is_approved === 1 || question.is_approved === true" class="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-emerald-100 text-emerald-700">Approved</span>
                    <span v-else-if="question.is_approved === 0 || question.is_approved === false" class="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700">Pending</span>
                  </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import McqCard from './McqCard.vue'
import MultiCard from './MultiCard.vue'
import ShortAnswerCard from './ShortAnswerCard.vue'
import MathCard from './MathCard.vue'
import CodeCard from './CodeCard.vue'
import NumericCard from './NumericCard.vue'
import FillBlankCard from './FillBlankCard.vue'
import { useQuizMedia } from '~/composables/quiz/useQuizMedia'

const props = defineProps({ question: { type: Object, required: true }, modelValue: null })
const emit = defineEmits(['update:modelValue','select','toggle'])

const quizMedia = useQuizMedia()

const hasMedia = computed(() => !!(props.question && (props.question.media_path || props.question.media || props.question.youtube_url || props.question.youtube)))
const mediaSrc = computed(() => props.question?.media_path || props.question?.media || props.question?.youtube_url || props.question?.youtube || null)
const isImageLocal = computed(() => quizMedia.isImage(mediaSrc.value))
const isAudioLocal = computed(() => quizMedia.isAudio(mediaSrc.value))
const isEmbed = computed(() => !!(props.question?.youtube_url || props.question?.youtube))
const embedUrl = computed(() => props.question?.youtube_url || props.question?.youtube)

const layoutClass = computed(() => hasMedia.value ? 'sm:flex sm:items-start sm:space-x-6' : '')
const componentName = computed(() => {
  const t = (props.question?.type || 'mcq').toString()
  if (t === 'mcq') return McqCard
  if (t === 'multi') return MultiCard
  if (t === 'short') return ShortAnswerCard
  if (t === 'numeric') return NumericCard
  if (t === 'fill_blank') return FillBlankCard
  if (t === 'math') return MathCard
  if (t === 'code') return CodeCard
  // fallback to McqCard for other simple types for now
  return McqCard
})

// don't show the header in the parent when the child renders the body itself
const showHeader = computed(() => {
  const t = (props.question?.type || 'mcq').toString()
  return t !== 'fill_blank'
})

// expose local computed to template
const isImage = isImageLocal
const isAudio = isAudioLocal

import { ref, onMounted, onBeforeUnmount } from 'vue'

// compact detection: automatically enable compact layout on small screens (mobile)
const isCompact = ref(false)

function setCompactFromMedia(mq) {
  isCompact.value = !!mq.matches
}

onMounted(() => {
  if (typeof window === 'undefined') return
  const mq = window.matchMedia('(max-width: 640px)')
  // initialize
  setCompactFromMedia(mq)
  // listen for changes
  if (mq.addEventListener) {
    mq.addEventListener('change', () => setCompactFromMedia(mq))
  } else if (mq.addListener) {
    mq.addListener(() => setCompactFromMedia(mq))
  }
  // store on the element for cleanup via onBeforeUnmount closure
  window.__modeh_question_mq = mq
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  const mq = window.__modeh_question_mq
  if (!mq) return
  if (mq.removeEventListener) {
    mq.removeEventListener('change', () => setCompactFromMedia(mq))
  } else if (mq.removeListener) {
    mq.removeListener(() => setCompactFromMedia(mq))
  }
})

// isCompact is in script setup scope and available to the template

</script>

<style scoped>
/* Media column: responsive width, max 240px on desktop, full on mobile */
.media-col { 
  width: 100%; 
  flex: 0 0 100%; 
  max-width: 240px;
}
.content-col { flex: 1 }
@media (max-width: 640px) {
  .media-col { width: 100%; flex: none; max-width: 100% }
}
/* Ensure long question text wraps and preserves normal whitespace */
.content-col h3 { word-wrap: break-word; word-break: break-word; white-space: normal }
</style>

