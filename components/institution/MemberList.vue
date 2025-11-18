
<template>
  <div>
    <div v-if="!members || members.length === 0" class="text-sm text-gray-600">No members found.</div>
    <ul v-else class="space-y-2">
      <li v-for="m in members" :key="m.id" class="border p-2 rounded flex justify-between items-center">
        <div>
          <div class="font-medium">{{ m.name }}</div>
          <div class="text-sm text-gray-600">{{ m.email }}</div>
        </div>
        <div class="text-sm text-gray-500">Role: {{ m.role }}</div>
      </li>
    </ul>

    <div v-if="meta && meta.last_page > 1" class="flex items-center justify-between mt-3">
      <div class="text-sm text-gray-600">Page {{ meta.current_page }} of {{ meta.last_page }}</div>
      <div class="space-x-2">
        <button :disabled="meta.current_page <= 1" @click="$emit('page-change', meta.current_page - 1)" class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
        <button :disabled="meta.current_page >= meta.last_page" @click="$emit('page-change', meta.current_page + 1)" class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ members: { type: Array, default: () => [] }, meta: { type: Object, default: () => ({ total: 0, per_page: 0, current_page: 1, last_page: 1 }) } })
// Emits 'page-change' with new page number
</script>

<style scoped>
</style>
