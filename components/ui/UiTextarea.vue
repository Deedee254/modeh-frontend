<template>
  <!-- attach autosize directive to textarea so plugins/autosize.client.js can act on it -->
  <textarea ref="ta" v-bind="filteredAttrs" v-model="model" v-autosize class="border rounded p-2" />
</template>

<script setup>
import { ref, watch, computed } from 'vue'
const props = defineProps({ modelValue: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue'])
const model = ref(props.modelValue)
const ta = ref(null)

watch(() => props.modelValue, (v) => model.value = v)
watch(model, (v) => emit('update:modelValue', v))

// Filter out attributes that would make the textarea read-only/disabled accidentally
const filteredAttrs = computed(() => {
  const out = { ...(getCurrentInstance()?.attrs || {}) }
  if ('disabled' in out) delete out.disabled
  if ('readonly' in out) delete out.readonly
  return out
})

// Expose focus API for parent components
defineExpose({
  focus: () => {
    try { ta.value?.focus?.() } catch (e) {}
  }
})
</script>
