<template>
  <div class="relative">
    <!-- Left Icon -->
    <Icon 
      v-if="icon"
      :name="icon"
      class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      :class="iconSize"
    />

    <!-- Input Element -->
    <input
      v-bind="$attrs"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :class="[
        'w-full px-4 py-2.5 rounded-lg border transition-all',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500',
        'placeholder:text-gray-400',
        icon ? 'pl-10' : '',
        clearButton && modelValue ? 'pr-10' : '',
        disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-gray-50 border-gray-200 focus:bg-white',
        error ? 'border-red-300 focus:ring-red-500' : 'focus:border-indigo-300'
      ]"
    />

    <!-- Clear Button -->
    <button
      v-if="clearButton && modelValue"
      type="button"
      @click="$emit('update:modelValue', ''); $emit('clear')"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1"
      :aria-label="`Clear ${label || 'input'}`"
    >
      <Icon name="heroicons:x-mark" class="w-5 h-5" />
    </button>

    <!-- Error Message -->
    <p v-if="error && errorMessage" class="mt-1 text-sm text-red-600">
      {{ errorMessage }}
    </p>

    <!-- Help Text -->
    <p v-if="helpText && !error" class="mt-1 text-sm text-gray-500">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: null
  },
  iconSize: {
    type: String,
    default: 'w-5 h-5'
  },
  clearButton: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue', 'clear'])
</script>

<style scoped>
/* Smooth transitions */
input {
  transition: background-color 0.2s, border-color 0.2s, box-shadow 0.2s;
}

/* Remove number input spinners */
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  appearance: textfield;
}
</style>
