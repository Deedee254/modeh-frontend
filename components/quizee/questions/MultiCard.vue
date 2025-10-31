<template>
  <div class="space-y-3">
    <div v-for="(opt, i) in question.options || []" :key="i">
      <button type="button" @click="toggle(opt)" :class="buttonClass(opt)" class="w-full text-left p-3 rounded-lg border transition-colors flex items-start gap-3">
        <input type="checkbox" class="w-4 h-4 mt-2" :checked="isSelected(opt)" readonly />
        <div class="flex-1">
          <div v-if="optionMedia(opt)" class="mb-2">
            <img v-if="isImage(optionMedia(opt))" :src="optionMedia(opt)" class="max-w-full rounded" />
            <audio v-else-if="isAudio(optionMedia(opt))" controls class="w-full"><source :src="optionMedia(opt)" /></audio>
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
import { useQuizMedia } from '~/composables/quiz/useQuizMedia'
const props = defineProps({ question: { type: Object, required: true }, modelValue: null })
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
  return Array.isArray(props.modelValue) && props.modelValue.includes(opt) ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:bg-gray-50'
}
</script>

<style scoped>
.w-full { width: 100% }
</style>
