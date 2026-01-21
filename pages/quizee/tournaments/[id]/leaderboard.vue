<template>
  <div class="bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <!-- Header -->
      <div class="mb-8">
        <button @click="$router.back()" class="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
          Back
        </button>
        <h1 class="text-3xl font-bold mb-2">Tournament Leaderboard</h1>
        <p class="text-gray-600">{{ tournament?.name }}</p>
      </div>

      <!-- Tabs: Tournament (bracket + leaderboard) | Qualifiers -->
      <div class="mt-4">
        <div class="flex items-center gap-4">
          <button
            :class="activeTab === 'tournament' ? 'px-4 py-2 rounded-md bg-brand-600 text-white' : 'px-4 py-2 rounded-md bg-white border'
            "
            @click="activeTab = 'tournament'"
          >Tournament</button>
          <button
            :class="activeTab === 'qualifiers' ? 'px-4 py-2 rounded-md bg-brand-600 text-white' : 'px-4 py-2 rounded-md bg-white border'"
            @click="activeTab = 'qualifiers'"
          >Qualifiers</button>
        </div>

        <div class="mt-6">
          <!-- Bracket always shown at the top for context -->
            <div class="mb-8">
            <TournamentBracket :tournament-id="id" :loading="loading" />
          </div>

          <div v-if="activeTab === 'tournament'">
            <Podium :entries="topPlayers" />

            <div class="mt-8">
              <LeaderboardTable
                :entries="annotatedLeaderboard"
                variant="tournament"
                :loading="loading"
              />
            </div>
          </div>

          <div v-else>
            <!-- Qualifiers table uses same LeaderboardTable but with qualifier dataset -->
            <div class="mt-2">
              <LeaderboardTable
                :entries="paginatedQualifiers"
                variant="qualifier"
                :loading="loadingQualifiers"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8 flex items-center justify-between">
        <div class="text-sm text-gray-600">
          Showing {{ startItem }}-{{ endItem }} of {{ leaderboard.length }} players
        </div>
        <div class="flex gap-2">
          <button
            @click="currentPage = currentPage - 1"
            :disabled="currentPage === 1"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div class="flex gap-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="typeof page === 'number' && (currentPage = page)"
              :disabled="typeof page === 'string'"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium',
                typeof page === 'string'
                  ? 'text-gray-400 cursor-default'
                  : page === currentPage
                    ? 'bg-brand-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
          </div>
          <button
            @click="currentPage = currentPage + 1"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Ensure this page uses the quizee layout when rendered
definePageMeta({ layout: "quizee" });
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "~/stores/auth";
import { useApi } from "~/composables/useApi";
import { useTournamentStore } from "~/stores/tournamentStore";
import Podium from "~/components/leaderboard/Podium.vue";
import LeaderboardTable from "~/components/leaderboard/LeaderboardTable.vue";
import TournamentBracket from "~/components/TournamentBracket.vue";

// Define interfaces for tournament and player
interface Tournament {
  id: number | string;
  name: string;
  // Add other tournament fields if needed
}

interface Player {
  id: number | string;
  name: string;
  avatar: string;
  title?: string;
  battles_won: number;
  points: number;
  win_rate: number;
}

const route = useRoute();
const auth = useAuthStore();

// Normalized tournament id (string). route.params.id can be string|string[]|undefined so
// coerce to a single string to satisfy component/api typings.
const id = computed(() => {
  const p = route.params.id as unknown;
  if (Array.isArray(p)) return String(p[0] ?? '');
  return String(p ?? '');
});

const tournament = ref<Tournament | null>(null);
const leaderboard = ref<Player[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const itemsPerPage = 20;
const activeTab = ref<'tournament' | 'qualifiers'>('tournament');

// Qualifiers state
const qualifiers = ref<any[]>([]);
const loadingQualifiers = ref(false);
const qualifiersPerPage = 20;
const qualifierPage = ref(1);

// Computed top 3 players for podium
const topPlayers = computed(() => {
  return leaderboard.value.slice(0, 3);
});

// Computed pagination values
const totalPages = computed(() => Math.ceil(leaderboard.value.length / itemsPerPage));

const paginatedLeaderboard = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return leaderboard.value.slice(start, end);
});

const paginatedQualifiers = computed(() => {
  const start = (qualifierPage.value - 1) * qualifiersPerPage;
  const end = start + qualifiersPerPage;
  return qualifiers.value.slice(start, end);
});

// Annotate tournament leaderboard with qualifier flag and final rank info
const annotatedLeaderboard = computed(() => {
  const qualIds = qualifiers.value.map((a: any) => a.user_id ?? a.id ?? a.user?.id).filter(Boolean);
  return leaderboard.value.map((p) => ({
    ...p,
    qualified: qualIds.includes(p.id),
    final_rank: (p as any).rank ?? null,
  }));
});

const startItem = computed(() => (currentPage.value - 1) * itemsPerPage + 1);
const endItem = computed(() => Math.min(currentPage.value * itemsPerPage, leaderboard.value.length));

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  
  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage.value - half);
    let end = Math.min(totalPages.value, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    if (start > 1) pages.push(1);
    if (start > 2) pages.push('...');
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (end < totalPages.value - 1) pages.push('...');
    if (end < totalPages.value) pages.push(totalPages.value);
  }
  
  return pages;
});

const config = useRuntimeConfig();
const api = useApi();
const tournamentStore = useTournamentStore();

// Fetch tournament and leaderboard data
const fetchData = async () => {
  try {
    loading.value = true;
    if (!id.value) {
      leaderboard.value = [];
      return;
    }

    const [tdata, leaderboardJson] = await Promise.all([
      tournamentStore.fetchTournament(id.value),
      tournamentStore.fetchLeaderboard(id.value),
    ]);

    tournament.value = (tdata?.tournament ?? tdata) as Tournament;

    // leaderboardResponse may return { leaderboard: [...] } or an array directly
    const ldata: any = leaderboardJson?.data ?? leaderboardJson?.leaderboard ?? leaderboardJson ?? null;
    if (Array.isArray(ldata)) {
      leaderboard.value = ldata as Player[];
    } else if (ldata && Array.isArray(ldata.data)) {
      leaderboard.value = ldata.data as Player[];
    } else {
      leaderboard.value = [];
    }
    
    // Reset to first page after loading
    currentPage.value = 1;
    // fetch qualifiers preview (top N)
    fetchQualifiers();
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    loading.value = false;
  }
};

const fetchQualifiers = async () => {
  try {
    loadingQualifiers.value = true;
    // fetch enough rows to cover typical bracket sizes
  if (!id.value) return;
  const resp = await api.get(`/api/tournaments/${id.value}/qualifier-leaderboard?per_page=100`);
    if (api.handleAuthStatus && api.handleAuthStatus(resp)) return;
    const json = await resp.json().catch(() => null);
    const data = json?.data ?? json ?? null;
    if (Array.isArray(data)) {
      qualifiers.value = data;
    } else if (data && Array.isArray(data.data)) {
      qualifiers.value = data.data;
    } else if (data && Array.isArray(data.leaderboard)) {
      qualifiers.value = data.leaderboard;
    } else {
      qualifiers.value = [];
    }
    qualifierPage.value = 1;
  } catch (e) {
    console.error('Failed to fetch qualifiers', e);
    qualifiers.value = [];
  } finally {
    loadingQualifiers.value = false;
  }
};

// Fetch data on component mount
onMounted(() => {
  fetchData();
});
</script>
