<template>
  <div class="w-full space-y-3">
    <div v-for="(opt, i) in question.options || []" :key="i">
      <button @click="select(opt)" :class="btnClass(opt)" class="w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-3">
        <span class="font-medium mr-2 mt-1">{{ String.fromCharCode(65 + i) }}.</span>
        <div class="flex-1">
          <div v-if="optionMedia(opt)" class="mb-2">
            <img v-if="isImage(optionMedia(opt))" :src="optionMedia(opt)" class="max-w-full rounded" />
            <audio v-else-if="isAudio(optionMedia(opt))" controls class="w-full">
              <source :src="optionMedia(opt)" />
            </audio>
            <div v-else-if="isYouTube(optionMedia(opt))" class="aspect-video rounded overflow-hidden">
              <iframe :src="formatYouTubeUrl(optionMedia(opt))" class="w-full h-full" frameborder="0" allowfullscreen loading="lazy"></iframe>
            </div>
          </div>
          <div class="leading-relaxed" v-html="display(opt)"></div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuizMedia } from '~/composables/quiz/useQuizMedia'

const props = defineProps({ question: { type: Object, required: true }, modelValue: null })
const emit = defineEmits(['update:modelValue','select'])

const { isImage, isAudio, isYouTube, formatYouTubeUrl } = useQuizMedia()

function select(opt){ emit('update:modelValue', opt); emit('select', opt) }

function display(opt) { return opt?.body || opt?.text || opt }

function optionMedia(opt) {
  if (!opt) return null
  if (typeof opt === 'string') return null
  return opt.media || opt.media_path || opt.youtube_url || opt.youtube || null
}

function btnClass(opt){
  const isSelected = props.modelValue === opt
  return isSelected ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
}
</script>

<style scoped>
.w-full { width: 100% }
</style>
