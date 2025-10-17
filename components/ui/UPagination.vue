<template>
  <nav class="flex items-center justify-between px-4 sm:px-0" aria-label="Pagination">
    <!-- Previous page -->
    <div class="flex flex-1 w-0 -mt-px">
      <button
        :disabled="currentPage <= 1"
        @click="$emit('change', currentPage - 1)"
        class="inline-flex items-center pt-4 pr-1 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Icon name="heroicons:arrow-long-left" class="w-5 h-5 mr-3" />
        Previous
      </button>
    </div>

    <!-- Page numbers -->
    <div class="hidden md:-mt-px md:flex">
      <template v-for="(pageNum, index) in visiblePages" :key="index">
        <!-- Ellipsis -->
        <span v-if="pageNum === '...'" class="inline-flex items-center px-4 pt-4 text-sm font-medium text-gray-500">
          ...
        </span>
        <!-- Page number -->
        <button
          v-else
          @click="$emit('change', pageNum)"
          :class="[
            'inline-flex items-center px-4 pt-4 text-sm font-medium',
            pageNum === modelValue
              ? 'text-indigo-600 border-t-2 border-indigo-500'
              : 'text-gray-500 hover:text-gray-700 border-t-2 border-transparent hover:border-gray-300'
          ]"
        >
          {{ pageNum }}
        </button>
      </template>
    </div>

    <!-- Next page -->
    <div class="flex justify-end flex-1 w-0 -mt-px">
      <button
        :disabled="currentPage >= totalPages"
        @click="$emit('change', currentPage + 1)"
        class="inline-flex items-center pt-4 pl-1 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
        <Icon name="heroicons:arrow-long-right" class="w-5 h-5 ml-3" />
      </button>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  perPage: {
    type: Number,
    default: 10
  },
  maxLinks: {
    type: Number,
    default: 5
  }
})

defineEmits(['update:modelValue', 'change'])

const currentPage = computed(() => props.modelValue)
const totalPages = computed(() => Math.ceil(props.total / props.perPage))

const visiblePages = computed(() => {
  const maxLinks = props.maxLinks
  const currentPage = props.modelValue
  const lastPage = totalPages.value
  
  if (lastPage <= maxLinks) {
    return Array.from({ length: lastPage }, (_, i) => i + 1)
  }

  const sidePages = Math.floor((maxLinks - 1) / 2)
  const leftBound = currentPage - sidePages
  const rightBound = currentPage + sidePages

  const numbers = []

  // Always show first page
  numbers.push(1)

  // Add dots after first page
  if (leftBound > 2) {
    numbers.push('...')
  }

  // Add middle pages
  for (let i = Math.max(2, leftBound); i <= Math.min(lastPage - 1, rightBound); i++) {
    numbers.push(i)
  }

  // Add dots before last page
  if (rightBound < lastPage - 1) {
    numbers.push('...')
  }

  // Always show last page
  if (lastPage > 1) {
    numbers.push(lastPage)
  }

  return numbers
})
</script>