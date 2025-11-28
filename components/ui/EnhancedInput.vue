<template>
  <div class="relative">
    <Icon 
      v-if="icon" 
      :name="icon" 
      :class="['absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none', iconClass]"
    />
    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      @input="$emit('update:modelValue', $event.target.value)"
      :class="[
        'w-full transition-colors',
        icon ? 'pl-10' : 'pl-4',
        clearable && modelValue ? 'pr-10' : 'pr-4',
        'py-2.5 text-sm',
        'bg-gray-50 border border-gray-200 rounded-lg',
        'placeholder:text-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'dark:bg-slate-900 dark:border-slate-700 dark:placeholder:text-slate-500 dark:focus:bg-slate-800',
        inputClass
      ]"
    />
    <button 
      v-if="clearable && modelValue"
      @click="$emit('update:modelValue', '')"
      type="button"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2 rounded p-1"
    >
      <Icon name="heroicons:x-mark" class="w-5 h-5" />
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
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
  icon: {
    type: String,
    default: null
  },
  iconClass: {
    type: String,
    default: 'text-gray-400'
  },
  clearable: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  inputClass: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])
</script>

