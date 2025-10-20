<template>
  <div>
    <input type="text" :value="modelValue || ''" @input="onInput($event.target.value)" placeholder="Type your answer..." class="w-full border border-gray-300 rounded-lg px-3 py-2" />
  </div>
</template>

<script setup>
const props = defineProps({ question: { type: Object, required: true }, modelValue: null })
const emit = defineEmits(['update:modelValue','select'])

function onInput(v) { emit('update:modelValue', v); emit('select', v) }
</script>

<style scoped>
input { outline: none }
</style>
