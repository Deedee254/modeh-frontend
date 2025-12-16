<template>
  <div class="tournament-bracket">
    <!-- Tournament Winner Display -->
    <div v-if="winner && !loading" class="winner-banner mb-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg relative">
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

    <!-- Confetti celebration when champion appears -->
    <div v-if="showChampionConfetti" class="confetti-root" aria-hidden="true">
      <div class="confetti-piece" v-for="n in 18" :key="n"></div>
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
      <!-- Header controls: last-updated and manual refresh -->
      <div class="flex items-center justify-end gap-3 mb-2">
        <div class="text-xs text-gray-500">Last update: <span class="font-mono">{{ lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—' }}</span></div>
        <button @click="manualRefresh" class="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-50">Refresh</button>
      </div>

      <!-- Qualifier Phase: Display Standings/Leaderboard -->
      <template v-if="isQualifierPhase && (qualifierResults && qualifierResults.length > 0)">
        <div class="qualifier-standings mb-6">
          <div class="mb-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-bold text-gray-900">Qualifier Standings</h3>
              <div class="text-sm text-gray-500">
                <span class="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></span>
                Live Updates
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 border-b">
                  <tr>
                    <th class="px-4 py-3 text-left font-semibold text-gray-700">Rank</th>
                    <th class="px-4 py-3 text-left font-semibold text-gray-700">Player</th>
                    <th class="px-4 py-3 text-center font-semibold text-gray-700">Score</th>
                    <th class="px-4 py-3 text-center font-semibold text-gray-700">Attempts</th>
                    <th class="px-4 py-3 text-center font-semibold text-gray-700">Qualified</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr 
                    v-for="(result, idx) in qualifierResults" 
                    :key="result.user_id"
                    :class="{
                      'bg-green-50': result.is_qualified,
                      'bg-white hover:bg-gray-50': !result.is_qualified
                    }"
                  >
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-sm" 
                        :class="idx < 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'">
                        {{ idx + 1 }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <img 
                          :src="getPlayerAvatar(result.user)" 
                          :alt="result.user?.name"
                          class="w-7 h-7 rounded-full object-cover"
                        />
                        <span class="font-medium text-gray-900">{{ result.user?.name || 'Unknown' }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span class="font-bold text-lg text-gray-900">{{ result.score ?? '-' }}</span>
                    </td>
                    <td class="px-4 py-3 text-center text-gray-600">
                      {{ result.attempt_count ?? 0 }}
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span v-if="result.is_qualified" class="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                        <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.364 7.364a1 1 0 01-1.414 0L3.293 9.707a1 1 0 011.414-1.414L8 11.586l6.293-6.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                        Yes
                      </span>
                      <span v-else class="text-gray-400">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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
              :class="{
                'left-side': isLeftBracket(roundIndex),
                'right-side': isRightBracket(roundIndex)
              }"
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
                  :class="{
                    'match-upper': matchIndex < Math.ceil(round.length / 2),
                    'match-lower': matchIndex >= Math.ceil(round.length / 2)
                  }"
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
        
        <!-- Groups Display (below bracket) -->
        <div v-if="calculateGroups && calculateGroups.length > 0" class="groups-container">
          <div v-for="(group, idx) in calculateGroups" :key="`group-${idx}`" class="group-box">
            <div class="group-title">{{ group.name }}</div>
            <div v-for="player in group.players" :key="player.id" class="group-player">
              <img 
                :src="getPlayerAvatar(player)" 
                :alt="player.name"
                class="group-avatar"
              />
              <span class="group-player-name">{{ player.name }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
      <!-- Match Details Modal -->
      <div v-if="isModalOpen" class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center">
        <div class="modal-panel bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-2/3 p-4 relative">
          <button class="absolute top-3 right-3 text-gray-500" @click="closeModal" aria-label="Close">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <div v-if="matchDetailsLoading" class="py-8 text-center">Loading match details…</div>
          <div v-else>
            <div class="flex items-start gap-4 mb-4">
              <div class="flex-1">
                <div class="text-sm text-gray-500">Match</div>
                <div class="text-lg font-bold">{{ selectedMatch?.id ? `#${selectedMatch.id}` : selectedMatch?.name || 'Match details' }}</div>
                <div class="text-xs text-gray-400">{{ formatMatchInfo(selectedMatch) }}</div>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-500">Round</div>
                <div class="font-semibold">{{ selectedMatch?.round ?? selectedMatch?.stage ?? '—' }}</div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div class="p-3 border rounded">
                <div class="flex items-center gap-3">
                  <img :src="getPlayerAvatar(selectedMatch?.player1 || matchDetails?.initiator)" class="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <div class="font-semibold">{{ selectedMatch?.player1?.name || matchDetails?.initiator?.name || 'TBD' }}</div>
                    <div class="text-sm text-gray-500">Score: <span class="font-bold">{{ selectedMatch?.player1_score ?? matchDetails?.initiator_score ?? '-' }}</span></div>
                  </div>
                </div>
              </div>
              <div class="p-3 border rounded">
                <div class="flex items-center gap-3 justify-end">
                  <div class="text-right">
                    <div class="font-semibold">{{ selectedMatch?.player2?.name || matchDetails?.opponent?.name || 'TBD' }}</div>
                    <div class="text-sm text-gray-500">Score: <span class="font-bold">{{ selectedMatch?.player2_score ?? matchDetails?.opponent_score ?? '-' }}</span></div>
                  </div>
                  <img :src="getPlayerAvatar(selectedMatch?.player2 || matchDetails?.opponent)" class="w-12 h-12 rounded-full object-cover" />
                </div>
              </div>
            </div>

            <div class="mb-4">
              <div class="text-sm font-semibold mb-2">Summary</div>
              <div class="text-sm text-gray-700">{{ selectedMatch?.summary || matchDetails?.summary || (selectedMatch?.player1_score != null || selectedMatch?.player2_score != null ? `${selectedMatch?.player1_score ?? '-'} - ${selectedMatch?.player2_score ?? '-'}` : 'No summary available') }}</div>
            </div>

            <!-- Per-question breakdown (if available) -->
            <div v-if="(matchDetails && matchDetails.questions && matchDetails.questions.length) || (selectedMatch && (selectedMatch.questions || selectedMatch.attempts))">
              <div class="text-sm font-semibold mb-2">Questions</div>
              <div class="space-y-2 max-h-64 overflow-auto p-2 border rounded">
                <div v-for="(q, qi) in (matchDetails?.questions || selectedMatch?.questions || [])" :key="qi" class="p-2 bg-white rounded border">
                  <div class="text-sm font-medium">{{ q.text || q.question || q.title || `Question ${qi + 1}` }}</div>
                  <div class="text-xs text-gray-500">Correct: <span class="font-semibold">{{ q.correct_answer || q.answer }}</span></div>
                  <template v-if="isViewerParticipant || q.user_answers">
                    <!-- Show participant answers if viewer was a participant or answers are provided -->
                    <div class="mt-1 text-xs text-gray-700">
                      <div v-if="q.user_answers && q.user_answers.length">
                        <div v-for="(ua, uai) in q.user_answers" :key="uai">{{ ua.player_name || ua.name }}: <span :class="{'text-green-600': ua.is_correct, 'text-red-500': !ua.is_correct}">{{ ua.answer }}</span></div>
                      </div>
                      <div v-else-if="matchDetails?.initiator_answer || matchDetails?.opponent_answer">
                        <div>{{ matchDetails?.initiator?.name || 'Player 1' }}: {{ matchDetails?.initiator_answer ?? '-' }}</div>
                        <div>{{ matchDetails?.opponent?.name || 'Player 2' }}: {{ matchDetails?.opponent_answer ?? '-' }}</div>
                      </div>
                      <div v-else class="text-xs text-gray-400">Answers not available publicly.</div>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-between">
              <div class="text-xs text-gray-500">Completed: {{ selectedMatch?.completed_at || matchDetails?.completed_at || '—' }}</div>
              <div class="flex items-center gap-2">
                <a v-if="selectedMatch?.id" :href="`/quizee/tournaments/${props.tournamentId}/battles/${selectedMatch.id}/results`" class="text-sm px-3 py-1 bg-white border rounded">View full battle</a>
                <a v-else-if="matchDetails?.uuid" :href="`/quizee/battles/${matchDetails.uuid}/result`" class="text-sm px-3 py-1 bg-white border rounded">View full battle</a>
                <button @click="closeModal" class="text-sm px-3 py-1 bg-brand-50 border rounded">Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, watch } from "vue";
import useApi from "~/composables/useApi";
import { useAuthStore } from '~/stores/auth';
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
let bracketRefreshInterval: any = null; // Auto-refresh polling
const tournament = ref<any>(null);
const winner = ref<any>(null);
const summary = ref<any>(null);
const qualifierResults = ref<any[]>([]); // Qualifier standings during qualifying phase
const loading = ref(true);
const api = useApi();
// UI state for match modal and live indicators
const selectedMatch = ref<any>(null);
const matchDetails = ref<any>(null);
const matchDetailsLoading = ref(false);
const isModalOpen = ref(false);
const lastUpdated = ref<string | null>(null);
const showChampionConfetti = ref(false);

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
    if (!res.ok) {
      console.error(`Failed to fetch tournament bracket: ${res.status} ${res.statusText}`);
      rounds.value = [];
      loading.value = false;
      return;
    }
    const json = await res.json();
    
    // Enhanced tree endpoint response structure
    if (json?.ok && json?.bracket) {
      // New enhanced response from updated tree() endpoint
      tournament.value = json.tournament;
      winner.value = json.winner;
      summary.value = json.summary;
      roundsData.value = json.bracket || [];
      qualifierResults.value = json.qualifier_results || []; // Populate qualifier standings
      
      // Extract matches from bracket rounds for rendering
  const matchesFromBracket = roundsData.value.map((roundData: any) => roundData.matches || []);
  rounds.value = matchesFromBracket;
  // record last updated timestamp for UI
  lastUpdated.value = new Date().toISOString();

      // initialize countdowns for rounds that have end dates
      updateCountdowns();
      if (countdownInterval) clearInterval(countdownInterval);
      countdownInterval = setInterval(updateCountdowns, 1000);
      
      // Start auto-refresh polling if tournament is still active (has current round OR during qualifiers)
      const hasCurrentRound = roundsData.value.some((r: any) => r.is_current);
      const isQualifying = tournament.value?.status === 'qualifying' || 
                          tournament.value?.phase === 'qualifiers' ||
                          tournament.value?.current_phase === 'qualifiers';
      if ((hasCurrentRound || isQualifying) && !bracketRefreshInterval) {
        startBracketRefreshPolling();
      }
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

// Auto-refresh polling: refresh bracket data every 8 seconds during active tournament
const startBracketRefreshPolling = () => {
  if (bracketRefreshInterval) clearInterval(bracketRefreshInterval);
  bracketRefreshInterval = setInterval(async () => {
    try {
      const res = await api.get(`/api/tournaments/${props.tournamentId}/tree`);
      if (!res.ok) {
        console.warn(`Bracket refresh failed: ${res.status} ${res.statusText}`);
        return;
      }
      const json = await res.json();
      
      if (json?.ok && json?.bracket) {
        tournament.value = json.tournament;
        winner.value = json.winner;
        summary.value = json.summary;
        roundsData.value = json.bracket || [];
        qualifierResults.value = json.qualifier_results || []; // Update qualifier standings
        
        const matchesFromBracket = roundsData.value.map((roundData: any) => roundData.matches || []);
  rounds.value = matchesFromBracket;
  lastUpdated.value = new Date().toISOString();
        
        // Stop polling if tournament is complete (no current round and not in qualifiers)
        const hasCurrentRound = roundsData.value.some((r: any) => r.is_current);
        const isQualifying = tournament.value?.status === 'qualifying' || 
                            tournament.value?.phase === 'qualifiers' ||
                            tournament.value?.current_phase === 'qualifiers';
        if (!hasCurrentRound && !isQualifying && bracketRefreshInterval) {
          clearInterval(bracketRefreshInterval);
          bracketRefreshInterval = null;
        }
      }
    } catch (e) {
      console.debug('Bracket auto-refresh polling error:', e);
    }
  }, 8000); // Poll every 8 seconds
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
  if (bracketRefreshInterval) clearInterval(bracketRefreshInterval);
});

const openMatch = (match: any) => {
  if (!match) return;
  selectedMatch.value = match;
  isModalOpen.value = true;
  matchDetails.value = null;
  // If match already includes questions/attempts, use it; otherwise fetch details
  if (match.questions || match.attempts || match.detail) {
    matchDetails.value = match;
    return;
  }

  if (match.id) {
    fetchBattleDetails(match.id);
  }
};

const fetchBattleDetails = async (battleId: number | string) => {
  matchDetailsLoading.value = true;
  try {
    const res = await api.get(`/api/battles/${battleId}?with_questions=true`);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      matchDetails.value = j.battle || j || { id: battleId };
      return;
    }
    const json = await res.json().catch(() => ({}));
    matchDetails.value = json.battle || json || { id: battleId };
  } catch (e) {
    console.error('Failed to fetch battle details:', e);
    matchDetails.value = { id: battleId };
  } finally {
    matchDetailsLoading.value = false;
  }
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedMatch.value = null;
  matchDetails.value = null;
};

// Manual refresh handler
const manualRefresh = async () => {
  loading.value = true;
  await fetchTree();
  loading.value = false;
};

// Watch for champion and trigger confetti briefly
watch(winner, (nv, ov) => {
  if (nv && nv !== ov) {
    showChampionConfetti.value = true;
    setTimeout(() => (showChampionConfetti.value = false), 4200);
  }
});

// Keyboard: close modal on Escape
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isModalOpen.value) closeModal();
};
document.addEventListener('keydown', onKeydown as any);
onUnmounted(() => document.removeEventListener('keydown', onKeydown as any));

const auth = useAuthStore();
const isViewerParticipant = computed(() => {
  let uid: any = null;
  try {
    // auth.user may be a Ref or a plain object depending on Pinia usage; handle both
    if (!auth.user) uid = null;
    else if ((auth.user as any).id) uid = (auth.user as any).id;
    else if ((auth.user as any).value && (auth.user as any).value.id) uid = (auth.user as any).value.id;
  } catch (e) {
    uid = null;
  }
  if (!uid) return false;
  const m = selectedMatch.value || matchDetails.value;
  if (!m) return false;
  const p1 = m.player1 || m.initiator;
  const p2 = m.player2 || m.opponent;
  return (p1 && p1.id && Number(p1.id) === Number(uid)) || (p2 && p2.id && Number(p2.id) === Number(uid));
});

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

const isQualifierPhase = computed(() => {
  return tournament.value?.status === 'qualifying' || 
         tournament.value?.phase === 'qualifiers' ||
         tournament.value?.current_phase === 'qualifiers';
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

// Determine if a round is on the left (upper) bracket side
const isLeftBracket = (roundIndex: number): boolean => {
  const total = displayRounds.value?.length ?? 0;
  return roundIndex < Math.floor(total / 2);
};

// Determine if a round is on the right (lower) bracket side
const isRightBracket = (roundIndex: number): boolean => {
  const total = displayRounds.value?.length ?? 0;
  return roundIndex >= Math.ceil(total / 2);
};

// Calculate groups from first round matches
const calculateGroups = computed(() => {
  try {
    if (!roundsData.value || roundsData.value.length === 0) return [];
    
    const firstRound = roundsData.value[0];
    if (!firstRound || !firstRound.matches || firstRound.matches.length === 0) return [];
    
    const groupCount = Math.max(firstRound.matches.length / 2, 1);
    const groups = [];
    
    for (let i = 0; i < Math.min(4, groupCount); i++) {
      const matchIndices = [i * 2, i * 2 + 1];
      const players: any[] = [];
      
      for (const idx of matchIndices) {
        if (firstRound.matches[idx]) {
          if (firstRound.matches[idx].player1) players.push(firstRound.matches[idx].player1);
          if (firstRound.matches[idx].player2) players.push(firstRound.matches[idx].player2);
        }
      }
      
      if (players.length > 0) {
        groups.push({
          name: `Group ${String.fromCharCode(65 + i)}`,  // Group A, B, C, D
          players: players.slice(0, 4)
        });
      }
    }
    
    return groups;
  } catch (e) {
    return [];
  }
});

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
  // Backend returns avatar_url (primary DB column) and avatar (accessor)
  const avatar = player.avatar_url || player.avatar
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
  gap: 40px; /* More breathing room between round columns */
  margin-top: 20px;
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* Upper bracket match styling */
.bracket-match.match-upper {
  border-top: 3px solid #e0e7ff;
}

/* Lower bracket match styling */
.bracket-match.match-lower {
  border-bottom: 3px solid #f0f9ff;
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

.bracket-match:hover .match-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
  pointer-events: auto;
}

/* Winner highlight */
.player.winner {
  background: rgba(250, 204, 21, 0.08); /* amber-100 tint */
  border-radius: 6px;
  padding: 2px 6px;
  font-weight: 700;
  color: #92400e; /* slightly darker amber */
}

/* Mobile tooltip inside stacked card */
.md\:hidden .match-tooltip {
  position: static;
  transform: none;
  opacity: 1;
  box-shadow: none;
  border: none;
  padding: 0;
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

/* Groups Container */
.groups-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  width: 100%;
  margin-top: 60px;
  padding-top: 40px;
  padding-bottom: 20px;
  border-top: 2px solid #e5e7eb;
}

.group-box {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  background: #f9fafb;
  transition: all 0.2s ease;
}

.group-box:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.group-title {
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 10px;
  color: #374151;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.group-player {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  padding: 4px 0;
  overflow: hidden;
}

.group-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center;
  flex-shrink: 0;
}

.group-player-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #4b5563;
  font-weight: 500;
}

/* Left/Right bracket positioning for center-converging effect */
.bracket-round.left-side {
  text-align: right;
  order: -1;
}

.bracket-round.right-side {
  text-align: left;
  order: 1;
}

/* Final round (center) */
.bracket-round:last-of-type {
  order: 0;
  text-align: center;
}

/* Modal styles */
.modal-backdrop {
  background: rgba(0,0,0,0.45);
}
.modal-panel { max-height: 85vh; overflow: auto; }

/* Confetti pieces */
.confetti-root { pointer-events: none; position: absolute; inset: 0; overflow: hidden; }
.confetti-piece {
  position: absolute;
  width: 8px;
  height: 12px;
  background: var(--c, #f59e0b);
  top: 10%;
  left: 50%;
  transform-origin: center;
  animation: confetti-fall 3.4s linear infinite;
  opacity: 0.9;
}
.confetti-piece:nth-child(2n) { background: #f97316; }
.confetti-piece:nth-child(3n) { background: #f43f5e; }
.confetti-piece:nth-child(4n) { background: #60a5fa; }
.confetti-piece:nth-child(5n) { background: #34d399; }
.confetti-piece:nth-child(6n) { background: #f59e0b; }
.confetti-piece { left: calc(20% + (var(--i,0) * 4%)); animation-duration: calc(2.8s + (var(--i,0) * 0.15s)); }
@keyframes confetti-fall {
  0% { transform: translateY(-10vh) rotate(0deg) scale(1); opacity: 1; }
  70% { opacity: 1; }
  100% { transform: translateY(110vh) rotate(360deg) scale(0.9); opacity: 0; }
}

/* Small score change animation */
.player-score { transition: transform 0.25s ease, color 0.25s ease; }
.player-score.updated { transform: scale(1.08); color: #111827; }

/* Qualifier Standings Styles */
.qualifier-standings {
  animation: slideIn 0.6s ease-out 0.1s backwards;
}

.qualifier-standings table {
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.qualifier-standings thead {
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.qualifier-standings th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.qualifier-standings td {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.qualifier-standings tbody tr:last-child td {
  border-bottom: none;
}

.qualifier-standings tbody tr {
  transition: background-color 0.2s ease;
}

.qualifier-standings tbody tr:hover:not(.bg-green-50) {
  background-color: #f3f4f6;
}

.qualifier-standings tbody tr.bg-green-50 {
  background-color: #dcfce7;
}

@media (max-width: 768px) {
  .qualifier-standings table {
    font-size: 12px;
  }
  
  .qualifier-standings th,
  .qualifier-standings td {
    padding: 8px 12px;
  }
}
</style>