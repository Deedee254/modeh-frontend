<template>
  <div>
    <input
      type="number"
      :value="modelValue ?? ''"
      @input="onInput($event.target.value)"
      @keydown.enter.prevent="onEnter"
      placeholder="Enter a number"
      class="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
    />
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

function onEnter() {
  // Notify parent that user pressed Enter and would like to continue to next question
  emit('request-next')
}
</script>

<style scoped>
input { outline: none }
</style>

