<template>
  <div>
    <input type="number" :value="modelValue ?? ''" @input="onInput($event.target.value)" placeholder="Enter a number" class="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base" />
  </div>
</template>

<script setup>
const props = defineProps({ question: { type: Object, required: true }, modelValue: null })
const emit = defineEmits(['update:modelValue','select'])

function onInput(v) {
  const num = v === '' ? null : Number(v)
  emit('update:modelValue', num)
  emit('select', num)
}
</script>

<style scoped>
input { outline: none }
</style>

