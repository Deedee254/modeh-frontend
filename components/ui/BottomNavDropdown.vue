<!-- BottomNavDropdown.vue -->
<template>
  <div class="relative">
    <button 
      @click="toggle" 
      :aria-label="`${buttonLabel} menu`"
      class="group relative flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:text-slate-700 dark:group-hover:text-slate-300">
        <Icon :name="icon" class="h-5 w-5" />
      </div>
      {{ buttonLabel }}
    </button>
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        :class="[
          'absolute bottom-full mb-2 w-48 origin-bottom rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black dark:ring-slate-700 ring-opacity-5 focus:outline-none',
          dropdownAlign === 'left' ? 'left-0' : 'right-0'
        ]"
        role="menu"
        aria-orientation="vertical"
        :aria-labelledby="buttonLabel"
        tabindex="-1"
      >
        <div class="py-1" role="none">
          <slot></slot>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, defineProps, expose } from 'vue'

defineProps({
  buttonLabel: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'heroicons:list-bullet'
  },
  dropdownAlign: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'right'].includes(value)
  }
})

const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}

// Expose isOpen for parent component to control
expose({ isOpen })
</script>