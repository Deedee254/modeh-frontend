<template>
  <div class="space-y-3">
    <!-- Media Preview -->
    <MediaPreview 
      :youtube-url="question?.youtube_url" 
      :media-url="question?.media_url" 
      :media-type="question?.media_type"
    />
    
    <!-- Number Input -->
    <input
      type="number"
      :value="modelValue ?? ''"
      @input="onInput($event.target.value)"
      @keydown.enter.prevent="onEnter"
      placeholder="Enter a number"
      class="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
    />
  </div>
</template>

<script setup>
import MediaPreview from './MediaPreview.vue'

const props = defineProps({ question: { type: Object, required: true }, modelValue: null })
const emit = defineEmits(['update:modelValue','select'])

function onInput(v) {
  const num = v === '' ? null : Number(v)
  emit('update:modelValue', num)
  emit('select', num)
}

function onEnter() {
  emit('request-next')
}
</script>

<style scoped>
input { outline: none }
</style>

