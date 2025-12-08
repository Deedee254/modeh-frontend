<template>
  <div class="w-full" :class="compact ? 'space-y-1.5' : 'space-y-2'">
    <div v-for="(opt, i) in question.options || []" :key="i">
      <button @click="select(opt)" :class="[btnClass(opt), compact ? 'p-1.5 rounded-md gap-1.5 text-xs' : 'p-2 rounded-lg gap-2 text-sm']" class="w-full text-left border-2 transition-all duration-150 flex items-start">
        <span :class="compact ? 'font-medium mr-1 mt-0.5 text-xs' : 'font-medium mr-1 mt-0.5 text-sm'">{{ String.fromCharCode(65 + i) }}.</span>
        <div class="flex-1">
          <div v-if="optionMedia(opt)" :class="compact ? 'mb-0.5' : 'mb-1'">
            <img v-if="isImage(optionMedia(opt))" :src="optionMedia(opt)" :class="compact ? 'max-w-full rounded max-h-24' : 'max-w-full rounded max-h-32'" />
            <audio v-else-if="isAudio(optionMedia(opt))" controls class="w-full h-6">
              <source :src="optionMedia(opt)" />
            </audio>
            <div v-else-if="isYouTube(optionMedia(opt))" class="aspect-video rounded overflow-hidden">
              <iframe :src="formatYouTubeUrl(optionMedia(opt))" class="w-full h-full" frameborder="0" allowfullscreen loading="lazy"></iframe>
            </div>
          </div>
          <div :class="compact ? 'leading-tight text-xs' : 'leading-snug text-sm'" v-html="display(opt)"></div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuizMedia } from '~/composables/quiz/useQuizMedia'

const props = defineProps({ question: { type: Object, required: true }, modelValue: null, compact: { type: Boolean, default: false } })
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
  return isSelected ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:border-brand-500' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
}
</script>

<style scoped>
.w-full { width: 100% }
</style>

