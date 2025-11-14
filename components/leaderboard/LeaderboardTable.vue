<template>
  <div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="bg-gray-50">
            <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">
              Rank
            </th>
            <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">
              Player
            </th>
            <th
              v-if="variant === 'tournament'"
              class="px-6 py-4 text-left text-sm font-medium text-gray-500"
            >
              Battles Won
            </th>
            <th
              v-if="variant !== 'daily'"
              class="px-6 py-4 text-left text-sm font-medium text-gray-500"
            >
              Total Points
            </th>
            <th
              v-if="variant === 'tournament'"
              class="px-6 py-4 text-left text-sm font-medium text-gray-500"
            >
              Win Rate
            </th>
            <th
              v-if="variant === 'daily'"
              class="px-6 py-4 text-left text-sm font-medium text-gray-500"
            >
              Score
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="loading">
            <td :colspan="colspan" class="px-6 py-12 text-center text-gray-500">
              <div class="flex items-center justify-center space-x-3">
                <div
                  class="animate-spin rounded-full h-6 w-6 border-4 border-primary border-t-transparent"
                ></div>
                <div>Loading leaderboard…</div>
              </div>
            </td>
          </tr>

          <tr v-else-if="!loading && (!entries || entries.length === 0)">
            <td :colspan="colspan" class="px-6 py-12 text-center text-gray-500">
              No entries yet.
            </td>
          </tr>

          <tr
            v-else
            v-for="(player, index) in entries"
            :key="player.id"
            :class="{ 'bg-gray-50': index % 2 === 0 }"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <span :class="rankBadgeClass(index)">{{ index + 1 }}</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <img
                  :src="player.avatar || placeholder"
                  alt="avatar"
                  class="w-8 h-8 rounded-full object-cover"
                />
                <div class="ml-3">
                  <div class="font-medium text-gray-900">{{ player.name }}</div>
                  <div v-if="player.title" class="text-sm text-gray-500">
                    {{ player.title }}
                  </div>
                </div>
              </div>
            </td>
            <td
              v-if="variant === 'tournament'"
              class="px-6 py-4 whitespace-nowrap text-gray-500"
            >
              {{ player.battles_won ?? 0 }}
            </td>
            <td v-if="variant !== 'daily'" class="px-6 py-4 whitespace-nowrap">
              <div class="font-medium text-gray-900">
                {{ player[props.pointsKey] ?? player.points ?? 0 }}
              </div>
              <div class="text-sm text-gray-500">points</div>
            </td>
            <td
              v-if="variant === 'tournament'"
              class="px-6 py-4 whitespace-nowrap"
            >
              <div :class="winRateClass(player.win_rate)">
                {{ player.win_rate ?? 0 }}%
              </div>
            </td>
            <td v-if="variant === 'daily'" class="px-6 py-4 whitespace-nowrap">
              <div class="font-medium text-gray-900">
                {{ player[props.pointsKey] ?? player.score ?? 0 }} pts
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
const props = defineProps({
  entries: { type: Array, default: () => [] },
  variant: { type: String, default: "global" },
  loading: { type: Boolean, default: false },
  placeholder: { type: String, default: "/logo/avatar-placeholder.png" },
  pointsKey: { type: String, default: "points" },
});

const colspan = computed(() => {
  if (props.variant === "tournament") return 5;
  if (props.variant === "daily") return 3;
  return 4;
});

function rankBadgeClass(index) {
  return [
    "w-8 h-8 rounded-full flex items-center justify-center font-medium",
    index === 0
      ? "bg-amber-100 text-amber-700"
      : index === 1
        ? "bg-gray-100 text-gray-700"
        : index === 2
          ? "bg-orange-100 text-orange-700"
          : "text-gray-500",
  ].join(" ");
}

function winRateClass(rate) {
  const v = rate ?? 0;
  if (v >= 70)
    return "px-3 py-1 rounded-full text-sm font-medium inline-block bg-green-100 text-green-700";
  if (v >= 40)
    return "px-3 py-1 rounded-full text-sm font-medium inline-block bg-blue-100 text-blue-700";
  return "px-3 py-1 rounded-full text-sm font-medium inline-block bg-gray-100 text-gray-700";
}
</script>

<style scoped>
/* small scope */
</style>
