<template>
  <div class="bg-white rounded shadow overflow-auto">
    <div class="p-3 border-b font-semibold">Table</div>
    <div class="p-3 space-y-2">
      <div v-for="i in count" :key="i" class="flex items-center gap-4">
        <div class="w-8 h-4 bg-gray-200 rounded"></div>
        <div class="h-4 bg-gray-200 rounded flex-1"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ count: { type: Number, default: 6 } })
</script>
