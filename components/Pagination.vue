<template>
  <nav v-if="paginator?.last_page > 1" class="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
    <!-- Previous Button -->
    <button 
      @click="change((paginator?.current_page || 1) - 1)" 
      :disabled="(paginator?.current_page || 1) <= 1"
      :aria-label="'Go to previous page'"
      class="px-2 sm:px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
    >
      <Icon name="heroicons:chevron-left" class="h-4 w-4 sm:h-5 sm:w-5" />
    </button>

    <!-- Page Numbers - Responsive display -->
    <div class="flex items-center gap-0.5 sm:gap-1">
      <!-- First page (always show) -->
      <button 
        v-if="pages[0] > 1"
        @click="change(1)"
        :aria-current="paginator?.current_page === 1 ? 'page' : undefined"
        class="min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 rounded-lg border border-gray-200 text-sm font-medium transition hover:border-gray-300 hover:bg-gray-50"
      >
        1
      </button>

      <!-- Ellipsis before -->
      <span v-if="pages[0] > 2" class="px-1 sm:px-2 text-gray-400">…</span>

      <!-- Page numbers -->
      <button 
        v-for="p in pages" 
        :key="p"
        @click="change(p)"
        :aria-current="p === (paginator?.current_page || 1) ? 'page' : undefined"
        :class="[
          'min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 rounded-lg text-sm font-medium transition',
          p === (paginator?.current_page || 1) 
            ? 'bg-indigo-600 text-white border border-indigo-600' 
            : 'border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
        ]"
      >
        {{ p }}
      </button>

      <!-- Ellipsis after -->
      <span v-if="pages[pages.length - 1] < paginator?.last_page - 1" class="px-1 sm:px-2 text-gray-400">…</span>

      <!-- Last page (always show if not already shown) -->
      <button 
        v-if="pages[pages.length - 1] < paginator?.last_page"
        @click="change(paginator?.last_page)"
        :aria-current="paginator?.current_page === paginator?.last_page ? 'page' : undefined"
        class="min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 rounded-lg border border-gray-200 text-sm font-medium transition hover:border-gray-300 hover:bg-gray-50"
      >
        {{ paginator?.last_page }}
      </button>
    </div>

    <!-- Next Button -->
    <button 
      @click="change((paginator?.current_page || 1) + 1)" 
      :disabled="(paginator?.current_page || 1) >= (paginator?.last_page || 1)"
      :aria-label="'Go to next page'"
      class="px-2 sm:px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
    >
      <Icon name="heroicons:chevron-right" class="h-4 w-4 sm:h-5 sm:w-5" />
    </button>

    <!-- Mobile Info -->
    <div class="w-full text-center sm:hidden text-xs text-gray-600 mt-2">
      Page {{ paginator?.current_page || 1 }} of {{ paginator?.last_page || 1 }}
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
const { paginator } = defineProps({ paginator: { type: Object, required: false, default: null } })
const emit = defineEmits(['change-page'])

const pages = computed(() => {
  const p = []
  if (!paginator || !paginator.last_page) return p
  const last = paginator.last_page
  const current = paginator.current_page || 1
  
  // Mobile: show fewer pages (current ± 1)
  // Desktop: show more pages (current ± 3)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
  const offset = isMobile ? 1 : 3
  
  const start = Math.max(1, current - offset)
  const end = Math.min(last, current + offset)
  
  for (let i = start; i <= end; i++) p.push(i)
  return p
})

function change(page) {
  if (page < 1 || page > (paginator?.last_page || 1)) return
  emit('change-page', page)
}
</script>

<style scoped>
/* Ensure buttons have minimum touch target size */
button {
  min-height: 2rem;
}

@media (max-width: 640px) {
  button {
    min-height: 2rem;
  }
}
</style>
