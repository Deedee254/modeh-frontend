<template>
  <div class="space-y-3">
    <!-- Media Preview -->
    <MediaPreview 
      :youtube-url="question?.youtube_url" 
      :media-url="question?.media_url" 
      :media-type="question?.media_type"
    />
    
    <!-- Answer Input -->
    <RichTextEditor v-model="localValue" :features="{ math: false, code: false }" class="min-h-[48px] sm:min-h-[60px] rounded text-xs sm:text-sm" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import RichTextEditor from '~/components/editor/RichTextEditor.vue'
import MediaPreview from './MediaPreview.vue'

const props = defineProps({ question: { type: Object, required: true }, modelValue: null })
const emit = defineEmits(['update:modelValue','select'])

const localValue = ref(props.modelValue || '')

watch(localValue, (v) => {
  emit('update:modelValue', v)
  emit('select', v)
})

watch(() => props.modelValue, (v) => { if (v !== localValue.value) localValue.value = v })
</script>

<style scoped>
.ql-editor { min-height: 48px }
</style>

