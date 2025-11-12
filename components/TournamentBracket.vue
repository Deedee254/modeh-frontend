<template>
  <div class="tournament-bracket">
    <div v-if="loading" class="py-6 text-center">Loading bracket…</div>
    <div v-else class="bracket-container">
      <div class="bracket-rounds">
        <div
          v-for="(round, roundIndex) in rounds"
          :key="roundIndex"
          class="bracket-round"
          :style="{ width: `${100 / rounds.length}%` }"
        >
          <h3 class="round-title">Round {{ roundIndex + 1 }}</h3>
          <div class="bracket-matches" :style="{ height: `${Math.pow(2, rounds.length - roundIndex - 1) * 80}px` }">
            <div
              v-for="(match, matchIndex) in round"
              :key="match.id"
              class="bracket-match"
              :style="{ top: `${matchIndex * Math.pow(2, rounds.length - roundIndex) * 40}px` }"
              @click="openMatch(match)"
            >
              <div class="match-content">
                <div class="player player1">
                  <span class="player-name">{{ match.player1?.name || 'TBD' }}</span>
                  <span class="player-score">{{ match.player1_score ?? '-' }}</span>
                </div>
                <div class="player player2">
                  <span class="player-name">{{ match.player2?.name || 'TBD' }}</span>
                  <span class="player-score">{{ match.player2_score ?? '-' }}</span>
                </div>
              </div>
              <!-- Connecting line to next round -->
              <div v-if="roundIndex < rounds.length - 1" class="connector-line"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import useApi from '~/composables/useApi'
const props = defineProps({ tournamentId: { type: [String, Number], required: true } })
const rounds = ref<any[][]>([])
const loading = ref(true)
const api = useApi()

const fetchTree = async () => {
  loading.value = true
  try {
    const res = await api.get(`/api/tournaments/${props.tournamentId}/tree`)
    const json = await res.json()
    // Expect { rounds: [ [match,...], ... ] } or fallback
    rounds.value = json?.rounds ?? json?.data?.rounds ?? []
  } catch (e) {
    rounds.value = []
  } finally {
    loading.value = false
  }
}

const openMatch = (match: any) => {
  if (!match) return
  // Navigate to battle details if available
  if (match.id) {
    window.location.href = `/quizee/tournaments/${props.tournamentId}/battles/${match.id}/results`
  }
}

onMounted(fetchTree)
</script>

<style scoped>
.tournament-bracket {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

.bracket-container {
  min-width: 800px;
  padding: 20px;
}

.bracket-rounds {
  display: flex;
  height: 100%;
  position: relative;
}

.bracket-round {
  display: flex;
  flex-direction: column;
  position: relative;
}

.round-title {
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 16px;
  color: #374151;
}

.bracket-matches {
  position: relative;
  flex: 1;
}

.bracket-match {
  position: absolute;
  width: 200px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.bracket-match:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.match-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.player {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.player-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-score {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  margin-left: 8px;
  min-width: 20px;
  text-align: right;
}

.connector-line {
  position: absolute;
  right: -50%;
  top: 50%;
  width: 50%;
  height: 2px;
  background: #d1d5db;
  transform: translateY(-50%);
}

.connector-line::after {
  content: '';
  position: absolute;
  right: 0;
  top: -10px;
  width: 2px;
  height: 22px;
  background: #d1d5db;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .bracket-match {
    width: 160px;
    padding: 8px;
  }

  .player-name {
    font-size: 12px;
  }

  .player-score {
    font-size: 11px;
  }
}
</style>
