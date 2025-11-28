<template>
  <div>
    <!-- Mobile Filter Toggle Button -->
    <button
      v-if="!hideToggle"
      @click="isOpen = !isOpen"
      class="lg:hidden w-full mb-4 px-4 py-3 bg-brand-600 text-white rounded-lg flex items-center justify-between font-semibold hover:bg-brand-700 transition"
    >
      <span class="flex items-center gap-2">
        <Icon name="heroicons:funnel" class="w-5 h-5" />
        Filters
      </span>
      <Icon :name="isOpen ? 'heroicons:chevron-up' : 'heroicons:chevron-down'" class="w-5 h-5" />
    </button>

    <!-- Mobile Filter Drawer Backdrop -->
    <Teleport to="body" v-if="isOpen">
      <div class="fixed inset-0 z-40 lg:hidden">
        <!-- Backdrop -->
        <div 
          class="fixed inset-0 bg-black/30 transition-opacity"
          @click="isOpen = false"
        ></div>

        <!-- Drawer Panel -->
        <div class="fixed left-0 top-0 h-full w-full sm:w-80 bg-white shadow-lg overflow-y-auto transition-transform">
          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h2 class="font-semibold text-gray-900">Filters</h2>
            <button
              @click="isOpen = false"
              class="text-gray-400 hover:text-gray-600 transition"
            >
              <Icon name="heroicons:x-mark" class="w-6 h-6" />
            </button>
          </div>

          <!-- Filter Content -->
          <div class="p-4">
            <slot></slot>
          </div>

          <!-- Footer Actions -->
          <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-2">
            <button
              @click="$emit('clear'); isOpen = false"
              class="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              Clear
            </button>
            <button
              @click="$emit('apply'); isOpen = false"
              class="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  hideToggle: {
    type: Boolean,
    default: false
  }
})

defineEmits(['apply', 'clear'])

const isOpen = ref(false)
</script>

<style scoped>
/* Smooth transitions for drawer */
@media (max-width: 1023px) {
  :deep(.fixed) {
    transition: transform 0.3s ease-out;
  }
}
</style>

