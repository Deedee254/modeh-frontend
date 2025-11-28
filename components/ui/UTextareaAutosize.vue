<template>
  <UiTextarea v-bind="$attrs" v-model="modelValue" v-autosize />
</template>

<script setup>
import { toRefs } from 'vue'
import UiTextarea from '~/components/ui/UiTextarea.vue'

const props = defineProps({
  modelValue: [String, Number],
})
const emit = defineEmits(['update:modelValue'])

const { modelValue } = toRefs(props)

function update(v) { emit('update:modelValue', v) }
</script>

<style scoped>
/* Intentionally minimal — styling comes from UiTextarea */
</style>

