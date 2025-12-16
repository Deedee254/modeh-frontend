<template>
  <div class="space-y-3">
    <!-- Media Preview -->
    <MediaPreview 
      :youtube-url="question?.youtube_url" 
      :media-url="question?.media_url" 
      :media-type="question?.media_type"
    />
    
    <!-- Code Input -->
    <div>
      <label class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">Your code answer (JavaScript)</label>
      <textarea v-model="code" rows="6" class="w-full font-mono text-xs sm:text-sm rounded border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2 mt-2 resize-vertical" placeholder="Write JavaScript code here..."></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import MediaPreview from './MediaPreview.vue'

const props = defineProps({ question: { type: Object, required: true }, modelValue: null })
const emit = defineEmits(['update:modelValue','select'])

const code = ref(props.modelValue || '')
watch(code, (nv) => {
  emit('update:modelValue', nv)
  emit('select', nv)
})
</script>

<style scoped>
/* keep compact and responsive */
</style>

