<template>
  <div class="p-4 space-y-3">
    <div v-for="t in transactions" :key="t.id" class="border rounded-lg p-3 bg-white">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-medium text-gray-900">{{ t.type }}</div>
          <div class="text-xs text-gray-500">{{ t.date }}</div>
        </div>
        <div class="text-right">
          <div class="text-sm font-semibold text-gray-900">${{ t.amount.toFixed(2) }}</div>
          <div class="text-xs text-gray-500">{{ t.status }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Transaction {
  id: number | string
  date: string
  type: string
  amount: number
  status: string
}

defineProps<{ transactions: Transaction[] }>()
</script>
