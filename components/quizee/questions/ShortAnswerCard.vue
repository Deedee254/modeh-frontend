<template>
  <div class="space-y-3">
    <div>
      <h4 class="text-sm font-semibold text-gray-800 dark:text-white mb-2" v-html="question?.body"></h4>
      <div v-if="question?.explanation" class="text-xs text-gray-500 dark:text-gray-400 mb-2" v-html="question.explanation"></div>
    </div>

    <div>
      <RichTextEditor v-model="localValue" :features="{ math: false, code: false }" class="min-h-[60px] rounded" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import RichTextEditor from '~/components/editor/RichTextEditor.vue'

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
