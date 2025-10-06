<template>
  <textarea v-bind="$attrs" v-model="model" class="border rounded p-2" />
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ modelValue: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue'])
const model = ref(props.modelValue)
watch(() => props.modelValue, (v) => model.value = v)
watch(model, (v) => emit('update:modelValue', v))
</script>
