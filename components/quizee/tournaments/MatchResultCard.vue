<template>
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <div class="flex flex-col sm:flex-row items-center sm:items-stretch gap-4">
      <div class="flex-1 w-full grid grid-cols-2 gap-3 items-center">
        <PlayerCard :player="formatPlayer(match.player1)" :score="match.player1_score ?? 0" :isActive="isParticipant1" :answered="match.player1_answered" />
        <PlayerCard :player="formatPlayer(match.player2)" :score="match.player2_score ?? 0" :isActive="isParticipant2" :answered="match.player2_answered" />
      </div>

      <div class="w-full sm:w-56 flex flex-col items-center justify-center gap-3">
        <div class="text-sm text-gray-500">Round {{ match.round }}</div>
        <div class="text-xs text-gray-400">{{ formatDate(match.completed_at || match.scheduled_at) }}</div>
        <div class="mt-2">
          <button @click="openResults" class="px-3 py-2 rounded bg-primary text-white text-sm">{{ actionLabel }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PlayerCard from '~/components/quizee/battle/PlayerCard.vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import { resolveAvatar } from '~/composables/useAssets'

const props = defineProps<{ match: any; tournamentId?: number | string }>()
const router = useRouter()
const auth = useAuthStore()

const match = props.match

const userId = computed(() => (auth.user as any)?.id)
const isParticipant1 = computed(() => userId.value && match.player1_id === userId.value)
const isParticipant2 = computed(() => userId.value && match.player2_id === userId.value)
const isParticipant = computed(() => isParticipant1.value || isParticipant2.value)

const actionLabel = computed(() => isParticipant.value ? 'View Detailed Results' : 'View Scores')

const openResults = () => {
  if (!match?.id) return
  router.push(`/quizee/tournaments/${props.tournamentId || match.tournament_id}/battles/${match.id}/results`)
}

const formatDate = (d: string) => {
  if (!d) return ''
  return new Date(d).toLocaleString()
}

const formatPlayer = (p: any) => {
  // player objects in API sometimes come as { id, name, avatar } or split names
  const playerName = p?.first_name ?? p?.name ?? (p?.display_name ?? '').split(' ')[0] ?? null
  const avatarUrl = p?.avatar_url ?? p?.avatar ?? p?.profile?.avatar ?? null
  const resolvedAvatar = resolveAvatar(avatarUrl, playerName || 'TBD')
  
  if (!p) return { id: null, first_name: 'TBD', last_name: '', profile: { avatar: resolvedAvatar } }
  return {
    id: p.id,
    first_name: playerName,
    last_name: p.last_name ?? '',
    // Normalize to use canonical `avatar_url` when available; fall back to letter avatar.
    profile: { avatar: resolvedAvatar }
  }
}
</script>

<style scoped>
.player-score { font-weight: 700 }
</style>

