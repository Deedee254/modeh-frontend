<template>
  <div class="space-y-3">
    <div>
      <h3 class="text-base font-semibold text-gray-900 dark:text-white" v-html="question?.body"></h3>
      <div v-if="hasMedia" class="mt-3">
        <img v-if="isImage" :src="mediaSrc" class="w-full max-h-48 object-cover rounded-lg" />
        <audio v-else-if="isAudio" :src="mediaSrc" controls class="w-full" />
        <div v-else-if="isEmbed" class="aspect-video rounded-lg overflow-hidden"><iframe :src="embedUrl" class="w-full h-full" frameborder="0" allowfullscreen loading="lazy"></iframe></div>
      </div>
      <div v-if="question?.explanation" class="mt-3 text-sm text-gray-600 dark:text-gray-300 prose prose-sm" v-html="question.explanation"></div>
    </div>

    <div>
      <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Your code answer (JavaScript)</label>
      <textarea v-model="code" rows="10" class="w-full font-mono text-sm rounded border border-gray-200 dark:border-gray-700 px-3 py-2 mt-2" placeholder="Write JavaScript code here..."></textarea>
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
