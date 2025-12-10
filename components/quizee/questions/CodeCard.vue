<template>
  <div class="space-y-2 sm:space-y-3">
    <div>
      <label class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">Your code answer (JavaScript)</label>
      <textarea v-model="code" rows="6" class="w-full font-mono text-xs sm:text-sm rounded border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2 mt-2 resize-vertical" placeholder="Write JavaScript code here..."></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuizMedia } from '~/composables/quiz/useQuizMedia'

const props = defineProps({ question: { type: Object, required: true }, modelValue: null })
const emit = defineEmits(['update:modelValue','select'])

const quizMedia = useQuizMedia()

const hasMedia = computed(() => !!(props.question && (props.question.media_path || props.question.media || props.question.youtube_url || props.question.youtube)))
const mediaSrc = computed(() => props.question?.media_path || props.question?.media || props.question?.youtube_url || props.question?.youtube || null)
const isImage = computed(() => quizMedia.isImage(mediaSrc.value))
const isAudio = computed(() => quizMedia.isAudio(mediaSrc.value))
const isEmbed = computed(() => !!(props.question?.youtube_url || props.question?.youtube))
const embedUrl = computed(() => props.question?.youtube_url || props.question?.youtube)

const code = ref(props.modelValue || '')
watch(code, (nv) => {
  emit('update:modelValue', nv)
  emit('select', nv)
})
</script>

<style scoped>
/* keep compact and responsive */
</style>

