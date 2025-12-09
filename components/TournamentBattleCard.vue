<template>
  <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-4">
          <div class="text-lg font-semibold">
            Round {{ battle.round }}
          </div>
          <div 
            :class="[
              'px-3 py-1 rounded-full text-sm font-medium',
              statusClass
            ]"
          >
            {{ statusMessage }}
          </div>
        </div>

        <!-- Battle details -->
        <div class="flex items-center gap-4 text-sm text-gray-600">
          <div v-if="battle.battle_duration" class="flex items-center gap-2">
            <Icon name="mdi:clock-outline" />
            <span>{{ formatDuration(battle.battle_duration) }}</span>
          </div>
          <div v-if="timeRemaining && battle.is_active" class="flex items-center gap-2">
            <Icon name="mdi:timer-outline" />
            <span>{{ formatDuration(timeRemaining) }}</span>
          </div>
          <div v-if="totalPoints" class="flex items-center gap-2">
            <Icon name="mdi:star" />
            <span>{{ totalPoints }} points</span>
          </div>
        </div>
      </div>

      <!-- Participants -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <img 
            :src="player1Avatar || '/avatars/default.png'"
            :alt="battle.player1?.name || 'Player 1'"
            class="w-12 h-12 rounded-full object-cover"
          >
          <div>
            <div class="font-medium">{{ battle.player1?.name || 'TBD' }}</div>
            <div class="text-sm text-gray-600">{{ battle.player1_score || '-' }} points</div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <div class="font-medium">{{ battle.player2?.name || 'TBD' }}</div>
            <div class="text-sm text-gray-600">{{ battle.player2_score || '-' }} points</div>
          </div>
          <img 
            :src="player2Avatar || '/avatars/default.png'"
            :alt="battle.player2?.name || 'Player 2'"
            class="w-12 h-12 rounded-full object-cover"
          >
        </div>
      </div>

      <!-- Battle actions -->
      <div class="mt-4 flex justify-end gap-2">
        <button
          v-if="battle.status === 'in_progress' && canParticipate && battle.has_timed_out"
          @click="handleForfeit"
          :disabled="loading"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Forfeiting...' : 'Forfeit' }}
        </button>
        <NuxtLink
          v-else-if="battle.status === 'in_progress' && canParticipate"
          :to="`/quizee/tournaments/${$route.params.id}/battles/${battle.id}`"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Join Battle
        </NuxtLink>
        <div 
          v-else-if="battle.status === 'completed'" 
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
        >
          {{ battle.winner?.name || 'Draw' }}
        </div>
        <div 
          v-else 
          class="text-sm text-gray-500 px-4 py-2"
        >
          {{ statusMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import resolveAssetUrl from '~/composables/useAssets'
import type { PropType } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useTournamentBattle } from '~/composables/useTournamentBattle'
import type { TournamentBattle } from '~/types/tournament'

const props = defineProps({
    battle: {
        type: Object as PropType<TournamentBattle>,
        required: true
    }
})

const emit = defineEmits<{
    (e: 'battle-updated'): void
}>()

const auth = useAuthStore()
const route = useRoute()
const { timeRemaining, forfeit } = useTournamentBattle(props.battle)
const loading = ref(false)

const statusClass = computed(() => {
    switch (props.battle.status) {
        case 'scheduled':
            return 'bg-brand-100 text-brand-700'
        case 'in_progress':
            return 'bg-green-100 text-green-700'
        case 'completed':
            return 'bg-gray-100 text-gray-700'
        case 'forfeited':
            return 'bg-red-100 text-red-700'
        default:
            return 'bg-gray-100 text-gray-700'
    }
})

const statusMessage = computed(() => {
    switch (props.battle.status) {
        case 'scheduled':
            return 'Upcoming'
        case 'in_progress':
            return 'In Progress'
        case 'completed':
            return 'Completed'
        case 'forfeited':
            return 'Forfeited'
        case 'cancelled':
            return 'Cancelled'
        default:
          // Use an any-cast to avoid exhaustive-switch narrowing by TypeScript
          const raw = String((props.battle as any)?.status || '')
          return raw.charAt(0).toUpperCase() + raw.slice(1)
    }
})

const canParticipate = computed(() => {
    const uid = auth.user?.id
    if (!uid) return false
    return props.battle.player1_id === uid || props.battle.player2_id === uid
})

const totalPoints = computed(() => 
    props.battle.questions?.reduce((sum, q) => sum + q.points, 0) ?? 0
)

const player1Avatar = computed(() => {
  const p1 = (props.battle?.player1) as any
  const avatar = p1?.avatarUrl || p1?.avatar || p1?.avatar_url || p1?.profile?.avatar
  return resolveAssetUrl(avatar) || null
})

const player2Avatar = computed(() => {
  const p2 = (props.battle?.player2) as any
  const avatar = p2?.avatarUrl || p2?.avatar || p2?.avatar_url || p2?.profile?.avatar
  return resolveAssetUrl(avatar) || null
})

const handleForfeit = async () => {
    if (loading.value) return
    
    loading.value = true
    const success = await forfeit()
    loading.value = false

    if (success) {
        emit('battle-updated')
    }
}

const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
</script>

