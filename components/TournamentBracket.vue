<template>
  <div class="tournament-bracket">
    <!-- Tournament Winner Display -->
    <div v-if="winner && !loading" class="winner-banner mb-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-400 flex-shrink-0">
          <img 
            :src="getPlayerAvatar(winner)" 
            :alt="winner.name"
            class="w-full h-full object-cover"
          />
        </div>
        <div>
          <div class="flex items-center gap-2 mb-1">
            <svg class="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span class="text-sm font-semibold text-yellow-700">Tournament Champion</span>
          </div>
          <div class="text-lg font-bold text-gray-900">{{ winner.name }}</div>
        </div>
      </div>
    </div>

    <!-- Progress Summary -->
    <div v-if="summary && !loading" class="progress-summary mb-6 grid grid-cols-3 gap-4">
      <div class="bg-white border rounded-lg p-4">
        <div class="text-sm text-gray-600">Total Matches</div>
        <div class="text-2xl font-bold text-gray-900">{{ summary.total_matches }}</div>
      </div>
      <div class="bg-white border rounded-lg p-4">
        <div class="text-sm text-gray-600">Completed</div>
        <div class="text-2xl font-bold text-green-600">{{ summary.completed_matches }}</div>
      </div>
      <div class="bg-white border rounded-lg p-4">
        <div class="text-sm text-gray-600">Pending</div>
        <div class="text-2xl font-bold text-orange-600">{{ summary.pending_matches }}</div>
      </div>
    </div>

    <div v-if="loading" class="py-6 text-center">Loading bracket…</div>
    <div v-else class="bracket-container">
      <template v-if="!rounds || !rounds.length">
        <div class="placeholder-bracket p-6 bg-white rounded-lg border">
          <div class="text-sm text-gray-600 mb-3">
            Bracket preview (placeholder)
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 p-3 rounded">
              <div class="font-semibold text-sm mb-2">Group A</div>
              <div class="space-y-1 text-sm text-gray-700">
                <div>TBD</div>
                <div>TBD</div>
                <div>TBD</div>
                <div>TBD</div>
              </div>
            </div>
            <div class="bg-gray-50 p-3 rounded">
              <div class="font-semibold text-sm mb-2">Group B</div>
              <div class="space-y-1 text-sm text-gray-700">
                <div>TBD</div>
                <div>TBD</div>
                <div>TBD</div>
                <div>TBD</div>
              </div>
            </div>
            <div class="bg-gray-50 p-3 rounded">
              <div class="font-semibold text-sm mb-2">Group C</div>
              <div class="space-y-1 text-sm text-gray-700">
                <div>TBD</div>
                <div>TBD</div>
                <div>TBD</div>
                <div>TBD</div>
              </div>
            </div>
            <div class="bg-gray-50 p-3 rounded">
              <div class="font-semibold text-sm mb-2">Group D</div>
              <div class="space-y-1 text-sm text-gray-700">
                <div>TBD</div>
                <div>TBD</div>
                <div>TBD</div>
                <div>TBD</div>
              </div>
            </div>
          </div>
          <div class="mt-4 text-sm text-gray-500">
            When battles start, participants and results will populate here.
          </div>
        </div>
      </template>
      <template v-else>
        <!-- Desktop / wide screens: original bracket layout (hidden on small screens) -->
        <div class="hidden md:block">
          <div class="bracket-rounds">
            <div
              v-for="(round, roundIndex) in displayRounds"
              :key="roundIndex"
              class="bracket-round"
              :style="{ width: `${100 / displayRounds.length}%` }"
            >
              <div class="round-header">
                <h3 class="round-title">{{ getRoundName(roundIndex) }}</h3>
                
                <!-- Round Status from Enhanced API -->
                <div v-if="roundsData[roundIndex]" class="round-status text-xs">
                  <div class="status-badge" :class="roundsData[roundIndex].is_complete ? 'complete' : roundsData[roundIndex].is_current ? 'current' : ''">
                    <template v-if="roundsData[roundIndex].is_current">
                      <span class="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1"></span>
                      Current Round
                    </template>
                    <template v-else-if="roundsData[roundIndex].is_complete">
                      <span>✓ Complete</span>
                    </template>
                    <template v-else>
                      <span>Upcoming</span>
                    </template>
                  </div>
                  
                  <!-- Round Progress -->
                  <div class="round-progress">
                    {{ roundsData[roundIndex].status?.completed || 0 }}/{{ roundsData[roundIndex].status?.total || 0 }}
                  </div>
                  
                  <!-- Round End Date / Countdown -->
                  <div v-if="roundsData[roundIndex].round_end_date" class="round-end-date">
                    {{ countdowns[roundIndex] || formatDateShort(roundsData[roundIndex].round_end_date) }}
                  </div>
                </div>
              </div>
              
              <div
                class="bracket-matches"
                :style="{
                  height: `${Math.pow(2, displayRounds.length - roundIndex - 1) * 80}px`,
                }"
              >
                <div
                  v-for="(match, matchIndex) in round"
                  :key="match?.id || `p-${roundIndex}-${matchIndex}`"
                  class="bracket-match"
                  :style="{
                    top: `${matchIndex * Math.pow(2, displayRounds.length - roundIndex) * 40}px`,
                  }"
                  @click="openMatch(match)"
                >
                  <div class="match-content">
                    <div :class="['player', 'player1', match?.winner_id === match?.player1_id ? 'winner' : '']">
                      <img 
                        :src="getPlayerAvatar(match?.player1)" 
                        :alt="match?.player1?.name"
                        class="w-8 h-8 rounded-full object-cover"
                      />
                      <span class="player-name">{{ match?.player1?.name || 'TBD' }}</span>
                      <span class="player-score">{{ match?.player1_score ?? '-' }}</span>
                    </div>
                    <div :class="['player', 'player2', match?.winner_id === match?.player2_id ? 'winner' : '']">
                      <img 
                        :src="getPlayerAvatar(match?.player2)" 
                        :alt="match?.player2?.name"
                        class="w-8 h-8 rounded-full object-cover"
                      />
                      <span class="player-name">{{ match?.player2?.name || 'TBD' }}</span>
                      <span class="player-score">{{ match?.player2_score ?? '-' }}</span>
                    </div>
                  </div>
                  <!-- small status icon -->
                  <div class="absolute top-2 right-2">
                    <template v-if="match">
                      <template v-if="matchStatus(match) === 'completed'">
                        <svg
                          class="w-4 h-4 text-green-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-7.364 7.364a1 1 0 01-1.414 0L3.293 9.707a1 1 0 011.414-1.414L8 11.586l6.293-6.293a1 1 0 011.414 0z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </template>
                      <template v-else-if="matchStatus(match) === 'live'">
                        <svg
                          class="w-4 h-4 text-red-500"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M5 3v18l15-9L5 3z" />
                        </svg>
                      </template>
                      <template v-else-if="matchStatus(match) === 'scheduled'">
                        <svg
                          class="w-4 h-4 text-gray-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            x="3"
                            y="4"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          ></rect>
                          <path d="M16 2v4"></path>
                          <path d="M8 2v4"></path>
                          <path d="M3 10h18"></path>
                        </svg>
                      </template>
                    </template>
                  </div>
                  <!-- Connecting line to next round -->
                  <div
                    v-if="roundIndex < displayRounds.length - 1"
                    class="connector-line"
                    aria-hidden="true"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile: stacked, readable list of rounds and matches -->
        <div class="md:hidden space-y-4">
          <div
            v-for="(round, rIdx) in displayRounds"
            :key="`m-${rIdx}`"
            class="bg-white border rounded p-3"
          >
            <div class="flex items-center justify-between mb-3 pb-3 border-b">
              <div>
                <div class="text-sm font-semibold">{{ getRoundName(rIdx) }}</div>
                <div class="text-xs text-gray-500">
                  {{ (round || []).length }} matches
                </div>
              </div>
              <div class="text-right">
                <!-- Round Status Badge -->
                <div v-if="roundsData[rIdx]" class="text-xs space-y-1">
                  <div class="status-badge-mobile" :class="roundsData[rIdx].is_complete ? 'complete' : roundsData[rIdx].is_current ? 'current' : ''">
                    <template v-if="roundsData[rIdx].is_current">
                      <span class="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse mr-1"></span>
                      Current
                    </template>
                    <template v-else-if="roundsData[rIdx].is_complete">
                      Complete ✓
                    </template>
                    <template v-else>
                      Upcoming
                    </template>
                  </div>
                  <div class="text-gray-600 font-medium">
                    {{ roundsData[rIdx].status?.completed || 0 }}/{{ roundsData[rIdx].status?.total || 0 }}
                  </div>
                  <div v-if="roundsData[rIdx].round_end_date" class="text-gray-500">
                    {{ countdowns[rIdx] || formatDateShort(roundsData[rIdx].round_end_date) }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="space-y-2">
              <div
                v-if="!(round && round.length)"
                class="text-sm text-gray-500"
              >
                Matches TBD
              </div>
              <div
                v-for="(match, mIdx) in round || []"
                :key="match?.id || `m-${rIdx}-${mIdx}`"
                class="flex items-center justify-between p-2 border rounded"
              >
                <div class="flex-1">
                    <div :class="['text-sm font-medium flex items-center gap-2', match?.winner_id === match?.player1_id ? 'text-yellow-700' : '']">
                      <img 
                        :src="getPlayerAvatar(match?.player1)" 
                        :alt="match?.player1?.name"
                        class="w-5 h-5 rounded-full object-cover"
                      />
                      {{ match?.player1?.name || 'TBD' }} 
                      <span class="text-gray-400">vs</span> 
                      <img 
                        :src="getPlayerAvatar(match?.player2)" 
                        :alt="match?.player2?.name"
                        class="w-5 h-5 rounded-full object-cover"
                      />
                      {{ match?.player2?.name || 'TBD' }}
                    </div>
                    <div class="text-xs text-gray-500">{{ match?.player1_score ?? '-' }} - {{ match?.player2_score ?? '-' }}</div>
                  </div>
                  <div class="ml-3 relative">
                    <button class="text-gray-400" :aria-label="`Match info ${match?.id || ''}`">
                      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>
                    </button>
                    <div class="match-tooltip absolute right-0 mt-2 w-48 z-10" v-if="match">
                      <div class="text-xs font-medium">Status: {{ match.status || (match.completed_at ? 'completed' : match.scheduled_at ? 'scheduled' : 'pending') }}</div>
                      <div class="text-xs text-gray-500">{{ formatMatchInfo(match) }}</div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from "vue";
import useApi from "~/composables/useApi";
import resolveAssetUrl from "~/composables/useAssets";
const props = defineProps({
  tournamentId: { type: [String, Number], required: true },
  // optional initial rounds (array of arrays of matches) provided by parent to avoid extra API requests
  initialRounds: { type: Array, required: false, default: null },
});
const rounds = ref<any[][]>([]);
const roundsData = ref<any[]>([]); // Complete round data with progress, end dates, etc.
const countdowns = ref<Record<number, string>>({});
let countdownInterval: any = null;
const tournament = ref<any>(null);
const winner = ref<any>(null);
const summary = ref<any>(null);
const loading = ref(true);
const api = useApi();

const buildRoundsFromBattles = (battles: any[]) => {
  // battles: array of battle objects with round property
  if (!Array.isArray(battles) || !battles.length) return [];
  const map: Record<number, any[]> = {};
  for (const b of battles) {
    const r = Number(b.round || 1);
    if (!map[r]) map[r] = [];
    map[r].push(b);
  }
  const keys = Object.keys(map)
    .map((k) => Number(k))
    .sort((a, b) => a - b);
  return keys.map((k) => map[k]);
};

const fetchTree = async () => {
  // if parent passed initialRounds, use that and skip fetch
  if (
    props.initialRounds &&
    Array.isArray(props.initialRounds) &&
    props.initialRounds.length
  ) {
    rounds.value = props.initialRounds as any[][];
    loading.value = false;
    return;
  }

  loading.value = true;
  try {
    const res = await api.get(`/api/tournaments/${props.tournamentId}/tree`);
    const json = await res.json();
    
    // Enhanced tree endpoint response structure
    if (json?.ok && json?.bracket) {
      // New enhanced response from updated tree() endpoint
      tournament.value = json.tournament;
      winner.value = json.winner;
      summary.value = json.summary;
      roundsData.value = json.bracket || [];
      
      // Extract matches from bracket rounds for rendering
      const matchesFromBracket = roundsData.value.map((roundData: any) => roundData.matches || []);
      rounds.value = matchesFromBracket;

      // initialize countdowns for rounds that have end dates
      updateCountdowns();
      if (countdownInterval) clearInterval(countdownInterval);
      countdownInterval = setInterval(updateCountdowns, 1000);
    } else {
      // Fallback for old-style response
      rounds.value = json?.rounds ?? json?.data?.rounds ?? [];
    }
  } catch (e) {
    console.error('Failed to fetch tournament bracket:', e);
    rounds.value = [];
  } finally {
    loading.value = false;
  }
};

function formatCountdownForDate(dateString: string | null) {
  if (!dateString) return '';
  try {
    const target = new Date(dateString).getTime();
    const now = Date.now();
    let diff = Math.max(0, target - now);
    if (diff === 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diff / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  } catch (e) {
    return '';
  }
}

function updateCountdowns() {
  try {
    const out: Record<number, string> = {};
    for (let i = 0; i < (roundsData.value || []).length; i++) {
      const rd = roundsData.value[i];
      if (rd && rd.round_end_date) {
        out[i] = formatCountdownForDate(rd.round_end_date);
      } else {
        out[i] = '';
      }
    }
    countdowns.value = out;
  } catch (e) {
    // ignore
  }
}

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
});

const openMatch = (match: any) => {
  if (!match) return;
  // Navigate to battle details if available
  if (match.id) {
    window.location.href = `/quizee/tournaments/${props.tournamentId}/battles/${match.id}/results`;
  }
};

onMounted(fetchTree);

// Human-friendly round names: when rounds correspond to elimination stages
const getRoundName = (roundIndex: number) => {
  // Use displayRounds to account for placeholders
  const total = displayRounds.value?.length ?? rounds.value?.length ?? 0;
  const idxFromEnd = total - roundIndex;
  if (total >= 3) {
    if (idxFromEnd === 1) return "Final";
    if (idxFromEnd === 2) return "Semifinals";
    if (idxFromEnd === 3) return "Quarterfinals";
  }
  return `Round ${roundIndex + 1}`;
};

// Ensure we show Quarterfinals/Semifinals/Final columns as placeholders when the tree lacks them.
// If the backend already provides non-empty last-three rounds, we don't append placeholders.
const displayRounds = computed(() => {
  const r = rounds.value || [];
  const requiredTrailing = 3;
  if (r.length >= requiredTrailing) {
    // already have enough rounds (avoid appending duplicates)
    return r;
  }
  const needed = requiredTrailing - r.length;
  const placeholders = Array.from({ length: needed }, () => []);
  return [...r, ...placeholders];
});

const matchStatus = (m: any) => {
  if (!m) return "pending";
  if (m.status === "active" || m.status === "live") return "live";
  if (m.status === "scheduled" || m.scheduled_at) return "scheduled";
  if (
    m.player1_score != null ||
    m.player2_score != null ||
    m.status === "completed"
  )
    return "completed";
  return "pending";
};

const formatMatchInfo = (m: any) => {
  if (!m) return ''
  const parts: string[] = []
  if (m.scheduled_at) {
    try { parts.push(new Date(m.scheduled_at).toLocaleString()) } catch (e) { parts.push(String(m.scheduled_at)) }
  }
  if (m.round) parts.push(`Round ${m.round}`)
  if (m.id) parts.push(`#${m.id}`)
  return parts.join(' • ')
}

const getPlayerAvatar = (player: any) => {
  if (!player) return '/avatars/default.png'
  // Prefer camelCase `avatarUrl` (auth store) then legacy `avatar`, then snake_case `avatar_url`.
  const avatar = player.avatarUrl || player.avatar || player.avatar_url || player.profile?.avatar
  return resolveAssetUrl(avatar) || '/avatars/default.png'
}

const formatDateShort = (dateString: string | null) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format as "Ends in X hours" or "Dec 15, 2:00 PM"
    const diffMs = date.getTime() - today.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours > 0 && diffHours < 48) {
      if (diffHours < 1) return 'Ends soon';
      if (diffHours === 1) return 'Ends in 1 hour';
      return `Ends in ${diffHours}h`;
    }
    
    // Format as "Dec 15, 2:00 PM"
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return dateString;
  }
}
</script>

<style scoped>
.tournament-bracket {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

.winner-banner {
  animation: slideIn 0.6s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.progress-summary {
  animation: slideIn 0.6s ease-out 0.1s backwards;
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

.round-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.round-title {
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  color: #374151;
}

.round-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: #f3f4f6;
  color: #6b7280;
  white-space: nowrap;
}

.status-badge.current {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-badge.complete {
  background-color: #dcfce7;
  color: #166534;
}

.round-progress {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.round-end-date {
  font-size: 11px;
  color: #9ca3af;
  white-space: nowrap;
}

.status-badge-mobile {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  background-color: #f3f4f6;
  color: #6b7280;
}

.status-badge-mobile.current {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-badge-mobile.complete {
  background-color: #dcfce7;
  color: #166534;
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
  gap: 6px;
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
  margin-left: 4px;
  min-width: 20px;
  text-align: right;
}

.connector-line {
  position: absolute;
  right: -52%;
  top: 50%;
  width: 52%;
  height: 2px;
  background: linear-gradient(90deg, #e5e7eb 0%, #d1d5db 100%);
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

/* Winner highlight */
.player.winner {
  background: rgba(250, 204, 21, 0.08); /* amber-100 tint */
  border-radius: 6px;
  padding: 2px 6px;
  font-weight: 700;
  color: #92400e; /* slightly darker amber */
}

/* Tooltips shown on hover - desktop */
.bracket-match {
  position: relative;
}
.match-tooltip {
  position: absolute;
  left: 50%;
  transform: translateX(-50%) translateY(-8px);
  top: -2.25rem;
  background: white;
  border: 1px solid #e5e7eb;
  padding: 6px 8px;
  border-radius: 6px;
  box-shadow: 0 6px 12px rgba(0,0,0,0.08);
  font-size: 12px;
  line-height: 1.1;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.12s ease, transform 0.12s ease;
  z-index: 30;
}
.bracket-match:hover .match-tooltip { opacity: 1; transform: translateX(-50%) translateY(0); pointer-events: auto }

/* Mobile tooltip inside stacked card */
.md\:hidden .match-tooltip { position: static; transform: none; opacity: 1; box-shadow: none; border: none; padding: 0; }

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