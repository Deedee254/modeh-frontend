<template>
  <div class="group relative overflow-hidden rounded-lg border border-[#800020]/20 bg-white shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full">
    <!-- Card Header with Image -->
    <div class="relative h-40 overflow-hidden bg-gradient-to-br from-[#800020] to-red-600">
      <div v-if="tournament.image_url" class="w-full h-full object-cover">
        <img 
          :src="tournament.image_url" 
          :alt="tournament.name"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div v-else class="w-full h-full flex items-center justify-center">
        <Icon name="heroicons:trophy" class="w-16 h-16 text-white opacity-50" />
      </div>

      <!-- Status Badge -->
      <div class="absolute top-3 right-3">
        <span 
          class="inline-block px-3 py-1 rounded-full text-xs font-bold text-white"
          :class="statusColor"
        >
          {{ statusLabel }}
        </span>
      </div>
    </div>

    <!-- Card Content -->
    <div class="flex-grow p-4 flex flex-col">
      <h3 class="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
        {{ tournament.name }}
      </h3>

      <p v-if="tournament.description" class="text-sm text-slate-600 mb-4 line-clamp-2">
        {{ stripHtmlTags(tournament.description) }}
      </p>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div class="rounded bg-[#800020]/5 p-2">
          <div class="text-xs text-[#800020] font-semibold">Participants</div>
          <div class="text-lg font-bold text-[#800020]">{{ tournament.participants_count || 0 }}</div>
        </div>
        <div class="rounded bg-red-50 p-2">
          <div class="text-xs text-red-700 font-semibold">Prize Pool</div>
          <div class="text-lg font-bold text-red-900">{{ tournament.prize_pool || 'TBD' }}</div>
        </div>
      </div>

      <!-- Date Info -->
      <div v-if="tournament.start_date" class="text-xs text-slate-500 mb-4">
        <div v-if="isUpcoming" class="flex items-center gap-1">
          <Icon name="heroicons:calendar" class="w-4 h-4" />
          Starts {{ formatDate(tournament.start_date) }}
        </div>
        <div v-else-if="isActive" class="flex items-center gap-1 text-[#800020] font-semibold">
          <Icon name="heroicons:bolt" class="w-4 h-4" />
          Ends {{ formatDate(tournament.end_date) }}
        </div>
        <div v-else class="flex items-center gap-1 text-slate-500">
          <Icon name="heroicons:check-circle" class="w-4 h-4" />
          Completed
        </div>
      </div>

      <!-- Action Button -->
      <NuxtLink 
        :to="`/tournaments/${tournament.id}`"
        class="mt-auto inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg font-bold text-white transition-all duration-200"
        :class="isActive 
          ? 'bg-[#800020] hover:bg-[#660018] hover:gap-3' 
          : isUpcoming
          ? 'bg-slate-400 hover:bg-slate-500 hover:gap-3'
          : 'bg-slate-300 cursor-not-allowed'"
      >
        <span>{{ actionLabel }}</span>
        <Icon name="heroicons:arrow-right" class="w-4 h-4" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tournament: {
    type: Object,
    required: true
  }
})

const now = new Date()

const isUpcoming = computed(() => {
  if (!props.tournament.start_date) return false
  return new Date(props.tournament.start_date) > now
})

const isActive = computed(() => {
  if (!props.tournament.start_date || !props.tournament.end_date) return false
  const start = new Date(props.tournament.start_date)
  const end = new Date(props.tournament.end_date)
  return start <= now && now <= end
})

const statusLabel = computed(() => {
  if (isActive.value) return 'Active'
  if (isUpcoming.value) return 'Upcoming'
  return 'Completed'
})

const statusColor = computed(() => {
  if (isActive.value) return 'bg-[#800020]'
  if (isUpcoming.value) return 'bg-blue-600'
  return 'bg-slate-500'
})

const actionLabel = computed(() => {
  if (isActive.value) return 'Join Now'
  if (isUpcoming.value) return 'Notify Me'
  return 'View Results'
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const stripHtmlTags = (htmlString) => {
  if (!htmlString) return ''
  // Remove all HTML tags
  return htmlString.replace(/<[^>]*>/g, '').trim()
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}
</style>
