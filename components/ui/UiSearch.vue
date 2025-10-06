<template>
  <div class="relative" :class="$attrs.class">
    <!-- Use the project's UInput (Nuxt auto-imports components in ~/components) -->
    <UInput v-model="value" :icon="icon" :placeholder="placeholder" :aria-label="ariaLabel || placeholder" class="w-full" @keyup.enter="onSubmit" />
      <button v-if="value" @click="onClear" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" :aria-label="clearLabel">✕</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  placeholder: { type: String, default: '' },
  icon: { type: String, default: '' },
  ariaLabel: { type: String, default: '' },
  clearLabel: { type: String, default: 'Clear search' },
  debounce: { type: Number, default: 300 }
})
const emit = defineEmits(['update:modelValue', 'search', 'submit', 'clear'])

const value = computed({
  get() { return props.modelValue },
  set(v) { emit('update:modelValue', v); scheduleEmit(v) }
})

let timer = null
function scheduleEmit(v) {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    emit('search', v)
  }, props.debounce)
}

function onSubmit() {
  // immediate submit
  if (timer) { clearTimeout(timer); timer = null }
  emit('submit', value.value)
}

function onClear() { emit('update:modelValue', ''); emit('clear') }
</script>

<style scoped>
.relative button { background: transparent; border: none; }
</style>
