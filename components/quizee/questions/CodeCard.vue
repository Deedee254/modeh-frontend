<template>
  <div class="space-y-3">
    <!-- Media Preview -->
    <MediaPreview 
      :youtube-url="question?.youtube_url" 
      :media-url="question?.media_url" 
      :media-type="question?.media_type"
    />
    
    <!-- Editor Mode Toggle -->
    <div class="flex items-center gap-2">
      <span class="text-xs font-medium text-gray-600 dark:text-gray-400">
        {{ isAdvancedEditor ? 'Advanced' : 'Basic' }}
      </span>
      <UButton 
        size="xs"
        :variant="isAdvancedEditor ? 'soft' : 'outline'"
        color="gray"
        @click="isAdvancedEditor = !isAdvancedEditor"
      >
        {{ isAdvancedEditor ? 'Use Basic' : 'Use Advanced' }}
      </UButton>
    </div>
    
    <!-- Code Input with Dynamic Features -->
    <div>
      <label class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">Your code answer (JavaScript)</label>
      <RichTextEditor 
        v-model="code" 
        :features="editorFeatures"
        class="w-full font-mono text-xs sm:text-sm rounded border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2 mt-2 resize-vertical min-h-[150px]"
        placeholder="Write JavaScript code here..."
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import RichTextEditor from '~/components/editor/RichTextEditor.vue'
import MediaPreview from './MediaPreview.vue'

const props = defineProps({ question: { type: Object, required: true }, modelValue: null })
const emit = defineEmits(['update:modelValue','select'])

const code = ref(props.modelValue || '')
const isAdvancedEditor = ref(false)

const editorFeatures = computed(() => {
  return isAdvancedEditor.value 
    ? { math: true, code: true }
    : { math: false, code: false }
})

watch(code, (nv) => {
  emit('update:modelValue', nv)
  emit('select', nv)
})

</script>

<style scoped>
/* keep compact and responsive */
</style>

