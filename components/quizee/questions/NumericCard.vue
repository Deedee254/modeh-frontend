<template>
  <div>
    <input type="number" :value="modelValue ?? ''" @input="onInput($event.target.value)" placeholder="Enter a number" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
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

