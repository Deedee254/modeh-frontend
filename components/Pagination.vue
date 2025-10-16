<template>
  <nav v-if="paginator?.last_page > 1" class="flex items-center gap-2">
    <button @click="change((paginator?.current_page || 1) - 1)" :disabled="(paginator?.current_page || 1) <= 1" class="px-2 py-1 rounded border">Prev</button>

    <button v-for="p in pages" :key="p" @click="change(p)" :class="['px-2 py-1 rounded', p === (paginator?.current_page || 1) ? 'bg-blue-600 text-white' : 'border']">{{ p }}</button>

    <button @click="change((paginator?.current_page || 1) + 1)" :disabled="(paginator?.current_page || 1) >= (paginator?.last_page || 1)" class="px-2 py-1 rounded border">Next</button>
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
  // limit pages shown to first..last but cap to avoid huge lists
  const start = Math.max(1, (paginator.current_page || 1) - 3)
  const end = Math.min(last, (paginator.current_page || 1) + 3)
  for (let i = start; i <= end; i++) p.push(i)
  return p
})

function change(page) {
  if (page < 1 || page > (paginator?.last_page || 1)) return
  emit('change-page', page)
}
</script>

<style scoped>
</style>
