<template>
  <div :class="compact ? 'space-y-1' : 'space-y-2'">
    <div v-for="(opt, i) in question.options || []" :key="i">
      <button type="button" @click="toggle(opt)" :class="[buttonClass(opt), compact ? 'px-2 py-1.5 rounded-md gap-1 text-xs' : 'p-2 sm:p-3 rounded-lg gap-2 sm:gap-3 text-sm sm:text-base']" class="w-full text-left border transition-colors flex items-start">
        <input type="checkbox" :class="compact ? 'h-3 w-3 mt-1 flex-shrink-0' : 'h-4 w-4 mt-1 sm:mt-2 flex-shrink-0'" :checked="isSelected(opt)" readonly />
        <div class="flex-1 min-w-0">
          <div v-if="optionMedia(opt)" :class="compact ? 'mb-1' : 'mb-1 sm:mb-2'">
            <img v-if="isImage(optionMedia(opt))" :src="optionMedia(opt)" :class="compact ? 'max-w-full rounded max-h-20' : 'max-w-full rounded max-h-32'" />
            <audio v-else-if="isAudio(optionMedia(opt))" controls class="w-full"><source :src="optionMedia(opt)" /></audio>
            <div v-else-if="isYouTube(optionMedia(opt))" class="aspect-video rounded overflow-hidden">
              <iframe :src="formatYouTubeUrl(optionMedia(opt))" class="w-full h-full" frameborder="0" allowfullscreen loading="lazy"></iframe>
            </div>
          </div>
          <div :class="compact ? 'leading-tight text-xs break-words' : 'leading-snug text-sm sm:leading-relaxed sm:text-base break-words'" v-html="display(opt)"></div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useQuizMedia } from '~/composables/quiz/useQuizMedia'
const props = defineProps({ question: { type: Object, required: true }, modelValue: null, compact: { type: Boolean, default: false } })
const emit = defineEmits(['toggle'])

const { isImage, isAudio, isYouTube, formatYouTubeUrl } = useQuizMedia()

function display(opt) { return opt?.body || opt?.text || opt }
function isSelected(opt) {
  return Array.isArray(props.modelValue) && props.modelValue.includes(opt)
}

function toggle(opt) {
  // Emit an intent event so parents (and composables) can handle mutation centrally.
  emit('toggle', opt)
}

function optionMedia(opt) {
  if (!opt) return null
  if (typeof opt === 'string') return null
  return opt.media || opt.media_path || opt.youtube_url || opt.youtube || null
}

function buttonClass(opt) {
  return Array.isArray(props.modelValue) && props.modelValue.includes(opt) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 hover:bg-gray-50'
}
</script>

<style scoped>
.w-full { width: 100% }
</style>

