<template>
  <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
    <div v-for="card in infoCards" :key="card.title" class="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div class="flex flex-col space-y-1.5 p-4 xl:p-6 pb-2">
        <div class="font-semibold tracking-tight text-lg flex items-center gap-2">
          <component :is="card.icon" :class="['h-5 w-5', card.iconClass]" />
          {{ card.title }}
        </div>
      </div>
      <div class="p-4 xl:p-6 xl:pt-0">
        <ul class="space-y-1 text-sm">
          <li v-for="(item, index) in card.items" :key="index" class="flex items-center gap-2">
            <div :class="['h-2 w-2 rounded-full', card.bulletClass]"></div>
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
const infoCards = [
  {
    title: 'Rewards',
    icon: 'i-lucide-trophy',
    iconClass: 'text-yellow-500',
    bulletClass: 'bg-green-500',
    items: [
      'Earn XP based on performance',
      'Win streak bonuses',
      'Unlock special badges'
    ]
  },
  {
    title: 'Battle Rules',
    icon: 'i-lucide-clock',
    iconClass: 'text-brand-500',
    bulletClass: 'bg-brand-500',
    items: [
      'No back navigation',
      'Auto-submit when time\'s up',
      'Score based on speed & accuracy'
    ]
  },
  {
    title: 'Ranking System',
    icon: 'i-lucide-list-checks',
    iconClass: 'text-purple-500',
    bulletClass: 'bg-purple-500',
    items: [
      'Bronze → Silver → Gold → Diamond',
      'Seasonal leaderboards',
      'Special rewards for top players'
    ]
  }
]
</script>


