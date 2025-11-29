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

      <Podium :entries="topPlayers" />

      <div class="mt-8">
        <LeaderboardTable
          :entries="paginatedLeaderboard"
          variant="tournament"
          :loading="loading"
        />
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
import Podium from "~/components/leaderboard/Podium.vue";
import LeaderboardTable from "~/components/leaderboard/LeaderboardTable.vue";

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

const tournament = ref<Tournament | null>(null);
const leaderboard = ref<Player[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const itemsPerPage = 20;

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

// Fetch tournament and leaderboard data
const fetchData = async () => {
  try {
    loading.value = true;
    const [tournamentResp, leaderboardResp] = await Promise.all([
      api.get(`/api/tournaments/${route.params.id}`),
      api.get(`/api/tournaments/${route.params.id}/leaderboard`),
    ]);

    // handle auth redirects if necessary
    if (api.handleAuthStatus && api.handleAuthStatus(tournamentResp)) return;
    if (api.handleAuthStatus && api.handleAuthStatus(leaderboardResp)) return;

    // tournamentResponse may return the tournament directly or inside an envelope
    const tournamentJson: any = await tournamentResp.json().catch(() => null);
    const tdata: any = tournamentJson?.data ?? tournamentJson ?? null;
    tournament.value = (tdata?.tournament ?? tdata) as Tournament;

    // leaderboardResponse may return { leaderboard: [...] } or an array directly
    const leaderboardJson: any = await leaderboardResp.json().catch(() => null);
    const ldata: any = leaderboardJson?.data ?? leaderboardJson ?? null;
    if (Array.isArray(ldata)) {
      leaderboard.value = ldata as Player[];
    } else if (ldata && Array.isArray(ldata.leaderboard)) {
      leaderboard.value = ldata.leaderboard as Player[];
    } else if (ldata && Array.isArray(ldata.data)) {
      leaderboard.value = ldata.data as Player[];
    } else {
      leaderboard.value = [];
    }
    
    // Reset to first page after loading
    currentPage.value = 1;
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    loading.value = false;
  }
};

// Fetch data on component mount
onMounted(() => {
  fetchData();
});
</script>
