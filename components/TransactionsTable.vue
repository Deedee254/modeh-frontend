<template>
  <div class="p-4">
    <table class="w-full text-left text-sm">
      <thead>
        <tr class="text-gray-600">
          <th class="py-2">Date</th>
          <th class="py-2">Type</th>
          <th class="py-2">Amount</th>
          <th class="py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in transactions" :key="t.id" class="border-t">
          <td class="py-3 text-gray-700">{{ t.date }}</td>
          <td class="py-3 text-gray-700">{{ t.type }}</td>
          <td class="py-3 font-medium text-gray-900">${{ t.amount.toFixed(2) }}</td>
          <td class="py-3 text-sm text-gray-600">{{ t.status }}</td>
        </tr>
      </tbody>
    </table>
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
