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
            :entries="paginatedLeaderboard"
            variant="global"
            :loading="pending"
          />

          <!-- Pagination Controls -->
          <div
            v-if="leaderboard.length > itemsPerPage"
            class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200"
          >
            <div class="text-sm text-gray-600">
              Showing {{ startItem }} to {{ endItem }} of {{ leaderboard.length }}
              players
            </div>

            <div class="flex items-center gap-2">
              <UButton
                color="gray"
                variant="ghost"
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                Previous
              </UButton>

              <div class="flex gap-1">
                <UButton
                  v-for="page in visiblePages"
                  :key="page"
                  :color="page === currentPage ? 'primary' : 'gray'"
                  :variant="page === currentPage ? 'solid' : 'ghost'"
                  @click="typeof page === 'number' && (currentPage = page)"
                  :disabled="typeof page === 'string'"
                  class="min-w-10"
                >
                  {{ page }}
                </UButton>
              </div>

              <UButton
                color="gray"
                variant="ghost"
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              >
                Next
              </UButton>
            </div>
          </div>
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
import { resolveAssetUrl } from '~/composables/useAssets'

definePageMeta({
  layout: "quizee",
  title: "Leaderboard",
});

const timeframe = ref("all-time");
const currentPage = ref(1);
const itemsPerPage = 20;

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
        // spread raw object first, but set canonical fields after so they override raw values
        ...(u || {}),
        id: u?.id ?? u?.user_id ?? `u${idx}`,
        name: u?.name || u?.display_name || u?.username || "Unknown",
        // normalize avatar and ensure any relative path is resolved to an absolute URL
        avatar: resolveAssetUrl(u?.avatar_url || u?.avatar || u?.photo || u?.profile_image) || (u?.avatar_url || u?.avatar || u?.photo || u?.profile_image || null),
        points: u?.points ?? u?.score ?? u?.pts ?? 0,
        country: u?.country || u?.location || null,
      }))
      .sort((a, b) => (b.points || 0) - (a.points || 0));
    currentPage.value = 1;
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

const totalPages = computed(() =>
  Math.ceil((leaderboard.value?.length || 0) / itemsPerPage)
);

const paginatedLeaderboard = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return (leaderboard.value || []).slice(start, end);
});

const startItem = computed(() => {
  if (!leaderboard.value || leaderboard.value.length === 0) return 0;
  return (currentPage.value - 1) * itemsPerPage + 1;
});

const endItem = computed(() => {
  const end = currentPage.value * itemsPerPage;
  return Math.min(end, leaderboard.value?.length || 0);
});

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= maxVisible) {
    // Show all pages if 5 or fewer
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    // Calculate the range around current page
    let start = Math.max(2, current - 1);
    let end = Math.min(current + 1, total - 1);

    if (current <= 3) {
      end = 5;
    } else if (current >= total - 2) {
      start = total - 3;
    }

    // Add ellipsis if needed
    if (start > 2) {
      pages.push("...");
    }

    // Add pages around current
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis if needed
    if (end < total - 1) {
      pages.push("...");
    }

    // Always show last page
    pages.push(total);
  }

  return pages;
});
</script>
