<template>
  <div>
    <PageHero
      title="Leaderboard"
      description="See who's leading the pack in our global quiz rankings."
      :breadcrumbs="[
        { text: 'Dashboard', href: '/quizee/dashboard' },
        { text: 'Leaderboard', current: true },
      ]"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <!-- Filter Options -->
      <div class="flex justify-center items-center gap-2 mb-8">
        <UButton
          @click="setTimeframe('all-time')"
          :variant="timeframe === 'all-time' ? 'solid' : 'outline'"
          >All Time</UButton
        >
        <UButton
          @click="setTimeframe('monthly')"
          :variant="timeframe === 'monthly' ? 'solid' : 'outline'"
          >Monthly</UButton
        >
        <UButton
          @click="setTimeframe('weekly')"
          :variant="timeframe === 'weekly' ? 'solid' : 'outline'"
          >Weekly</UButton
        >
      </div>

      <div v-if="pending" class="text-center py-16">
        <Icon
          name="heroicons:arrow-path"
          class="w-8 h-8 animate-spin mx-auto text-gray-400"
        />
        <p class="mt-2 text-gray-500">Loading leaderboard...</p>
      </div>
      <div v-else-if="error" class="text-center py-16 text-red-500">
        <p>Could not load the leaderboard. Please try again later.</p>
      </div>
      <div v-else class="space-y-8">
        <Podium :entries="leaderboard" />
        <div class="pt-4">
          <LeaderboardTable
            :entries="leaderboard"
            variant="global"
            :loading="pending"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import PageHero from "~/components/ui/PageHero.vue";
import Podium from "~/components/leaderboard/Podium.vue";
import LeaderboardTable from "~/components/leaderboard/LeaderboardTable.vue";

definePageMeta({
  layout: "quizee",
  title: "Leaderboard",
});

const timeframe = ref("all-time");

const config = useRuntimeConfig();

// state
const leaderboard = ref([]);
const pending = ref(true);
const error = ref(null);

async function fetchLeaderboard() {
  pending.value = true;
  error.value = null;
  try {
    const res = await $fetch(
      config.public.apiBase + `/api/leaderboard?timeframe=${timeframe.value}`,
      { credentials: "include" },
    );
    // support multiple response shapes used across the app
    const raw = res?.users || res?.data || res || [];
    // normalize entries to expected fields used in template
    leaderboard.value = (Array.isArray(raw) ? raw : [])
      .map((u, idx) => ({
        id: u?.id ?? u?.user_id ?? `u${idx}`,
        name: u?.name || u?.display_name || u?.username || "Unknown",
        avatar: u?.avatar || u?.photo || u?.profile_image || null,
        points: u?.points ?? u?.score ?? u?.pts ?? 0,
        country: u?.country || u?.location || null,
        // keep other fields available
        ...u,
      }))
      .sort((a, b) => (b.points || 0) - (a.points || 0));
  } catch (e) {
    error.value = e;
    console.error("Failed to fetch leaderboard:", e);
    leaderboard.value = [];
  } finally {
    pending.value = false;
  }
}

function setTimeframe(newTimeframe) {
  timeframe.value = newTimeframe;
}

onMounted(() => {
  fetchLeaderboard();
});

// refetch when timeframe changes
watch(timeframe, () => {
  fetchLeaderboard();
});

const topThree = computed(() => (leaderboard.value || []).slice(0, 3));
const remainingUsers = computed(() =>
  (leaderboard.value || []).map((u, i) => ({ ...u, __idx: i })).slice(3),
);
</script>
