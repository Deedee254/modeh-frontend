<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-3xl mx-auto px-4">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold">My Points</h1>
        <p class="text-sm text-gray-600">Track your points, vouchers and redemption history.</p>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <UCard>
          <div class="text-sm text-gray-500">Current Points</div>
          <div class="text-3xl font-bold">{{ points }}</div>
        </UCard>

        <UCard>
          <div class="font-medium">Redemption History</div>
          <div v-if="history.length === 0" class="text-sm text-gray-500 mt-3">No redemptions yet.</div>
          <ul v-else class="mt-3 space-y-2">
            <li v-for="h in history" :key="h.id" class="flex justify-between text-sm">
              <div>{{ h.item }}</div>
              <div class="text-gray-500">{{ h.date }}</div>
            </li>
          </ul>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup>
// ensure quizee layout (topbar + sidebar) when authenticated
definePageMeta({ layout: 'quizee' })

const points = 120
const history = []
</script>
