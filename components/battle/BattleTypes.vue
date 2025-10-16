&lt;template>
  &lt;div role="tablist" aria-orientation="horizontal" class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground mb-6 flex overflow-x-auto gap-4 sm:grid grid-cols-2">
    &lt;button
      v-for="type in battleTypes"
      :key="type.id"
      type="button"
      role="tab"
      :aria-selected="selectedType === type.id"
      :class="[
        'justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex items-center gap-2',
        selectedType === type.id ? 'bg-background text-foreground shadow-sm' : ''
      ]"
      @click="$emit('update:selectedType', type.id)"
    >
      &lt;component :is="type.icon" class="h-4 w-4" />
      &lt;span>{{ type.label }}&lt;/span>
    &lt;/button>
  &lt;/div>
&lt;/template>

&lt;script setup>
import { ref } from 'vue'

const props = defineProps({
  selectedType: {
    type: String,
    required: true
  }
})

defineEmits(['update:selectedType'])

const battleTypes = [
  {
    id: '1v1',
    label: '1v1 Battle',
    icon: 'i-lucide-swords'
  },
  {
    id: 'group',
    label: 'Group Battle (3-10 players)',
    icon: 'i-lucide-users'
  }
]
&lt;/script>