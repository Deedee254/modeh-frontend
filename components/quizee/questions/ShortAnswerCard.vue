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
    
    <!-- Answer Input with Dynamic Features -->
    <RichTextEditor 
      v-model="localValue" 
      :features="editorFeatures"
      class="min-h-[48px] sm:min-h-[60px] rounded text-xs sm:text-sm" 
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import RichTextEditor from '~/components/editor/RichTextEditor.vue'
import MediaPreview from './MediaPreview.vue'

const props = defineProps({ question: { type: Object, required: true }, modelValue: null })
const emit = defineEmits(['update:modelValue','select'])

const localValue = ref(props.modelValue || '')
const isAdvancedEditor = ref(false)

const editorFeatures = computed(() => {
  return isAdvancedEditor.value 
    ? { math: true, code: true }
    : { math: false, code: false }
})

watch(localValue, (v) => {
  emit('update:modelValue', v)
  emit('select', v)
})

watch(() => props.modelValue, (v) => { if (v !== localValue.value) localValue.value = v })
</script>

<style scoped>
.ql-editor { min-height: 48px }
</style>

