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

      <Podium :entries="leaderboard" />

      <div class="mt-8">
        <LeaderboardTable
          :entries="leaderboard"
          variant="tournament"
          :loading="loading"
        />
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

// Computed top 3 players
const topPlayers = computed(() => {
  return leaderboard.value.slice(0, 3);
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
