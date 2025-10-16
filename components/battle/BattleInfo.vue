&lt;template>
  &lt;div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
    &lt;div v-for="card in infoCards" :key="card.title" class="rounded-lg border bg-card text-card-foreground shadow-sm">
      &lt;div class="flex flex-col space-y-1.5 p-4 xl:p-6 pb-2">
        &lt;div class="font-semibold tracking-tight text-lg flex items-center gap-2">
          &lt;component :is="card.icon" :class="['h-5 w-5', card.iconClass]" />
          {{ card.title }}
        &lt;/div>
      &lt;/div>
      &lt;div class="p-4 xl:p-6 xl:pt-0">
        &lt;ul class="space-y-1 text-sm">
          &lt;li v-for="(item, index) in card.items" :key="index" class="flex items-center gap-2">
            &lt;div :class="['h-2 w-2 rounded-full', card.bulletClass]">&lt;/div>
            &lt;span>{{ item }}&lt;/span>
          &lt;/li>
        &lt;/ul>
      &lt;/div>
    &lt;/div>
  &lt;/div>
&lt;/template>

&lt;script setup>
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
    iconClass: 'text-blue-500',
    bulletClass: 'bg-blue-500',
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
&lt;/script>