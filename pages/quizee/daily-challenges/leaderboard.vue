<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import useApi from "~/composables/useApi";
import useTaxonomy from "~/composables/useTaxonomy";
import Podium from '~/components/leaderboard/Podium.vue'
import LeaderboardTable from '~/components/leaderboard/LeaderboardTable.vue'

definePageMeta({
  layout: "quizee",
});

useHead({
  title: "Daily Challenge Leaderboard — Modeh",
  meta: [
    {
      name: "description",
      content: "See who is at the top of the Daily Challenge leaderboard.",
    },
  ],
});

const api = useApi();
const { grades, levels, fetchGrades, fetchGradesByLevel, fetchLevels } =
  useTaxonomy();

const leaderboard = ref([]);
const meta = ref({});
const loading = ref(true);
const error = ref(null);

const filters = ref({
  date: new Date().toISOString().split("T")[0], // Default to today
  level_id: "",
  grade_id: "",
});

const fetchLeaderboard = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Build params and query string manually — useApi.get doesn't accept a params object.
    const params = {
      page: meta.value.current_page || 1,
    };
    if (filters.value.date) params.date = filters.value.date;
    if (filters.value.level_id) params.level_id = filters.value.level_id;
    if (filters.value.grade_id) params.grade_id = filters.value.grade_id;

    const qs = new URLSearchParams(params).toString();
    const path = `/api/daily-challenges/leaderboard${qs ? `?${qs}` : ''}`;

    const res = await api.get(path);
    if (api.handleAuthStatus(res)) return;

    const parsed = await api.parseResponse(res);

    // Normalize possible paginated shape { data: [...], meta: {...} }
    if (parsed && Array.isArray(parsed.data)) {
      leaderboard.value = parsed.data;
      meta.value = parsed.meta || {};
    } else if (Array.isArray(parsed)) {
      leaderboard.value = parsed;
      meta.value = {};
    } else {
      leaderboard.value = [];
      meta.value = {};
    }
  } catch (e) {
    error.value = e?.message || String(e);
    leaderboard.value = [];
  } finally {
    loading.value = false;
  }
};

const filteredGrades = computed(() => {
  if (!filters.value.level_id) return grades.value;
  return grades.value.filter(
    (g) => String(g.level_id) === String(filters.value.level_id),
  );
});

watch(filters, fetchLeaderboard, { deep: true });

watch(
  () => filters.value.level_id,
  (newLevelId) => {
    // Reset grade if it doesn't belong to the new level
    if (filters.value.grade_id) {
      const grade = grades.value.find(
        (g) => String(g.id) === String(filters.value.grade_id),
      );
      if (grade && String(grade.level_id) !== String(newLevelId)) {
        filters.value.grade_id = "";
      }
    }
  },
);

// When level changes, prefer to fetch grades for that level from the server so
// the grades list only contains relevant grades. Fallback to fetchGrades when
// no level is selected.
watch(
  () => filters.value.level_id,
  async (val) => {
    try {
      if (val && typeof fetchGradesByLevel === "function") {
        await fetchGradesByLevel(val);
      } else {
        await fetchGrades();
      }
    } catch (e) {
      // ignore
    }
  },
);

onMounted(async () => {
  // Load leaderboard and taxonomy in parallel
  await Promise.all([
    fetchLeaderboard(),
    fetchLevels().catch(() => {}),
    (async () => {
      try {
        if (filters.value.level_id && typeof fetchGradesByLevel === "function") {
          await fetchGradesByLevel(filters.value.level_id)
        } else {
          await fetchGrades()
        }
      } catch (e) {}
    })()
  ])
  
  // Hydrate from localStorage fast-path and listen for instant updates
  try {
    const rawLb = localStorage.getItem('daily-challenge:leaderboard')
    if (rawLb) {
      const parsed = JSON.parse(rawLb)
      if (Array.isArray(parsed)) leaderboard.value = parsed
    }
    const rawSt = localStorage.getItem('daily-challenge:last-streak')
    if (rawSt) {
      const n = Number(rawSt)
      if (!Number.isNaN(n)) {
        // the leaderboard page doesn't show the streak, but keep for parity
      }
    }
  } catch (err) { /* ignore localStorage errors */ }

  const onLeaderboardUpdated = (e) => {
    try {
      const payload = e?.detail?.leaderboard
      if (Array.isArray(payload)) leaderboard.value = payload
      else if (Array.isArray(window.__modeh_daily_challenge_leaderboard)) leaderboard.value = window.__modeh_daily_challenge_leaderboard
    } catch (err) { /* ignore */ }
  }

  const onSubmitted = (e) => {
    try {
      // A submit happened — refresh to ensure server-side ordering/filters
      fetchLeaderboard()
    } catch (err) { /* ignore */ }
  }

  window.addEventListener('daily-challenge:leaderboard:updated', onLeaderboardUpdated)
  window.addEventListener('daily-challenge:submitted', onSubmitted)
  window.__modeh_daily_challenge_listeners = { onLeaderboardUpdated, onSubmitted }
});

onUnmounted(() => {
  try {
    const listeners = window.__modeh_daily_challenge_listeners || {}
    if (listeners.onLeaderboardUpdated) window.removeEventListener('daily-challenge:leaderboard:updated', listeners.onLeaderboardUpdated)
    if (listeners.onSubmitted) window.removeEventListener('daily-challenge:submitted', listeners.onSubmitted)
    try { delete window.__modeh_daily_challenge_listeners } catch (e) { /* ignore */ }
  } catch (e) { /* ignore */ }
})
</script>

<template>
  <div class="bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900">
          Daily Challenge Leaderboard
        </h1>
        <p class="text-gray-600 mt-1">
          See how you stack up against other players.
        </p>
      </div>

      <!-- Top 3 Podium -->
      <div
        v-if="leaderboard.length >= 3"
        class="flex items-end justify-center gap-4 mb-6"
      >
        <div class="w-1/3 text-center">
          <div class="inline-block">
            <img
              :src="
                leaderboard[1].avatar_url || leaderboard[1].avatar ||
                `https://ui-avatars.com/api/?name=${leaderboard[1].name}&background=random`
              "
              class="w-20 h-20 rounded-full border-4 border-gray-200 object-cover mx-auto"
            />
            <div class="mt-2 font-semibold">{{ leaderboard[1].name }}</div>
            <div class="text-sm text-gray-500">
              {{ leaderboard[1].score }} pts
            </div>
            <div
              class="absolute -mt-10 ml-20 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center"
            >
              2
            </div>
          </div>
        </div>
        <div class="w-1/3 text-center">
          <div class="inline-block relative">
            <svg
              class="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 text-amber-400"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M12 2l2.09 4.26L19 7l-3 2.9L16.18 14 12 11.77 7.82 14 9 9.9 6 7l4.91-.74L12 2z"
                fill="currentColor"
              />
            </svg>
            <img
              :src="
                leaderboard[0].avatar_url || leaderboard[0].avatar ||
                `https://ui-avatars.com/api/?name=${leaderboard[0].name}&background=random`
              "
              class="w-28 h-28 rounded-full border-4 border-amber-400 object-cover mx-auto"
            />
            <div
              class="absolute -mt-6 -ml-2 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center text-white font-bold"
            >
              <svg
                class="w-4 h-4 mr-1"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  d="M12 2l2.09 4.26L19 7l-3 2.9L16.18 14 12 11.77 7.82 14 9 9.9 6 7l4.91-.74L12 2z"
                  fill="currentColor"
                />
              </svg>
              <span>1</span>
            </div>
            <div class="mt-2 font-semibold">{{ leaderboard[0].name }}</div>
            <div class="text-sm text-gray-500">
              {{ leaderboard[0].score }} pts
            </div>
          </div>
        </div>
        <div class="w-1/3 text-center">
          <div class="inline-block">
            <img
              :src="
                leaderboard[2].avatar_url || leaderboard[2].avatar ||
                `https://ui-avatars.com/api/?name=${leaderboard[2].name}&background=random`
              "
              class="w-16 h-16 rounded-full border-4 border-orange-200 object-cover mx-auto"
            />
            <div class="mt-2 font-semibold">{{ leaderboard[2].name }}</div>
            <div class="text-sm text-gray-500">
              {{ leaderboard[2].score }} pts
            </div>
            <div
              class="absolute -mt-8 ml-28 w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center"
            >
              3
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div
        class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6"
      >
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              for="date-filter"
              class="block text-sm font-medium text-gray-700"
              >Date</label
            >
            <input
              type="date"
              id="date-filter"
              v-model="filters.date"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-600 focus:ring-brand-600 sm:text-sm"
            />
          </div>
          <div>
            <label
              for="level-filter"
              class="block text-sm font-medium text-gray-700"
              >Level</label
            >
            <select
              id="level-filter"
              v-model="filters.level_id"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-600 focus:ring-brand-600 sm:text-sm"
            >
              <option value="">All Levels</option>
              <option v-for="level in levels" :key="level.id" :value="level.id">
                {{ level.name }}
              </option>
            </select>
          </div>
          <div>
            <label
              for="grade-filter"
              class="block text-sm font-medium text-gray-700"
              >Grade/Course</label
            >
            <select
              id="grade-filter"
              v-model="filters.grade_id"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-600 focus:ring-brand-600 sm:text-sm"
              :disabled="!grades.length"
            >
              <option value="">All Grades</option>
              <option
                v-for="grade in filteredGrades"
                :key="grade.id"
                :value="grade.id"
              >
                {{ grade.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Leaderboard List -->
      <div
        class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div class="px-4">
          <Podium :entries="leaderboard" pointsKey="score" />
        </div>
        <div v-if="loading" class="p-8 text-center text-gray-500">
          <svg
            class="animate-spin h-8 w-8 text-brand-600 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p class="mt-2">Loading Leaderboard...</p>
        </div>
        <div v-else-if="error" class="p-8 text-center text-red-600">
          <p>Oops! Something went wrong.</p>
          <p class="text-sm">{{ error }}</p>
        </div>
        <div
          v-else-if="leaderboard.length === 0"
          class="p-8 text-center text-gray-500"
        >
          <p class="font-semibold">No entries found.</p>
          <p class="text-sm">
            There are no completed challenges for the selected filters.
          </p>
        </div>
        <div v-else class="p-4">
          <LeaderboardTable
            :entries="leaderboard"
            variant="daily"
            :loading="loading"
            pointsKey="score"
          />
        </div>
      </div>

      <!-- Pagination could be added here if needed -->
    </div>
  </div>
</template>
