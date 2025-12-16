<template>
  <div class="max-w-7xl mx-auto px-4 py-12">
    <!-- Sticky Share Button -->
    <StickyShareButton
      itemType="Tournament"
      :itemId="tournament?.id"
      :itemTitle="`${tournament?.name} - Join the battle on Modeh!`"
      :disabled="!tournament?.id"
    />

    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"
      ></div>
    </div>

    <template v-else-if="tournament">
      <!-- Tournament Header -->
      <div class="relative mb-8">
        <img
          :src="tournament.banner || '/images/tournament-default.jpg'"
          alt="Tournament banner"
          class="w-full h-40 sm:h-64 object-cover rounded-xl"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"
        ></div>
        <div class="absolute bottom-6 left-6 text-white">
          <h1 class="text-4xl font-bold mb-2">{{ tournament.name }}</h1>
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-2">
              <Icon name="mdi:calendar" />
              <span
                >{{ formatDate(tournament.start_date) }}
                <span v-if="tournament.end_date"
                  >- {{ formatDate(tournament.end_date) }}</span
                ></span
              >
            </div>
            <div class="flex items-center gap-2">
              <Icon name="mdi:account-group" />
              <span>{{ tournament.participants_count }} participants</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="mdi:trophy" class="text-yellow-400" />
              <span>{{ formatPrizeKES(tournament.prize_pool) }}</span>
            </div>
            <div class="mt-3">
              <div
                v-if="nextRoundAt"
                class="inline-flex items-center gap-2 px-3 py-1 bg-black/40 text-white rounded"
              >
                <Icon name="mdi:clock-outline" />
                <span>Next round: {{ formatDate(nextRoundAt) }}</span>
              </div>
            </div>
            <!-- Sponsor (if provided) -->
            <div v-if="tournament.sponsor?.name || tournament.sponsor?.logo" class="ml-3 flex items-center gap-3">
              <img v-if="tournament.sponsor?.logo" :src="tournament.sponsor.logo" alt="sponsor logo" class="w-10 h-10 rounded-md object-contain bg-white/10 p-1" />
              <div class="text-sm">
                <div class="text-xs text-gray-200">Sponsored by</div>
                <div class="font-medium">{{ tournament.sponsor?.name }}</div>
              </div>
            </div>
            <div v-if="tournament.winner" class="ml-4 flex items-center gap-3">
              <Icon name="mdi:trophy-outline" class="text-yellow-300" />
              <img
                :src="resolveAssetUrl(tournament.winner.avatar_url || tournament.winner.avatar) || tournament.winner.avatar_url || tournament.winner.avatar || '/logo/avatar-placeholder.png'"
                alt="winner avatar"
                class="w-10 h-10 rounded-full object-cover"
              />
              <div class="text-sm">
                <div class="font-semibold">Winner</div>
                <div class="text-sm">{{ tournament.winner.name }}</div>
              </div>
            </div>
            <!-- Admin: Advance Round Button -->
            <div v-if="auth.user && (auth.user.role === 'quiz-master' || auth.user.role === 'admin')" class="ml-4">
              <button
                @click="advanceRound"
                class="px-3 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary-dark"
              >
                Advance Round
              </button>
            </div>
          </div>
        
        </div>
      </div>

      <!-- Tournament Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content (left: spans 2 cols on large screens) -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Qualification Phase: "Take Qualifier" Button -->
          <div v-if="tournament.status === 'upcoming' && isRegistered && !userHasQualified && !currentBattle" class="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-200">
            <h2 class="text-xl font-bold mb-4 text-blue-900">Qualification Round</h2>
            <p class="text-blue-800 mb-4">
              This tournament starts with a qualification round. Answer questions to earn a spot in the bracket!
            </p>
            <button
              @click="router.push(`/quizee/tournaments/${tournament.id}/qualify`)"
              class="w-full bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark"
            >
              Take Qualifier
            </button>
          </div>

          <!-- Qualification Closed -->
          <div v-else-if="tournament.status === 'active' && isRegistered" class="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 class="text-xl font-bold mb-4 text-gray-900">Qualification Closed</h2>
            <p class="text-gray-700 mb-4">
              The qualification round has ended. Tournament battles are now underway.
            </p>
            <button
              @click="router.push(`/quizee/tournaments/${tournament.id}/battles`)"
              class="w-full bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark"
            >
              View Battles
            </button>
          </div>

          <!-- User Battle / Taking Area -->
          <div v-if="currentBattle" class="bg-white rounded-xl p-6 shadow-sm">
            <h2 class="text-xl font-bold mb-4">
              Your Battle — Round {{ currentBattle.round }}
            </h2>

            <template v-if="isTaking">
              <p class="text-gray-600 mb-4">
                You have an active battle. Answer the questions below to
                complete your match.
              </p>
              <div v-if="currentBattle.question">
                <QuestionCard :question="currentBattle.question" />
                <div class="mt-4">
                  <button
                    @click="
                      router.push(
                        `/quizee/tournaments/${tournament.id}/battles/${currentBattle.id}`,
                      )
                    "
                    class="bg-primary text-white px-4 py-2 rounded"
                  >
                    Open Battle Details
                  </button>
                </div>
              </div>
              <div v-else class="text-gray-600">
                Questions for this battle are not yet available.
                <button @click="viewBattles" class="text-primary underline">
                  Go to Battles
                </button>
              </div>
            </template>

            <template v-else>
              <p class="text-gray-600 mb-4">
                You are scheduled to play in this round.
              </p>
              <div class="flex gap-3">
                <button
                  @click="viewBattles"
                  class="bg-primary text-white px-4 py-2 rounded"
                >
                  View Battle
                </button>
                <button
                  @click="
                    router.push(
                      `/quizee/tournaments/${tournament.id}/battles/${currentBattle.id}`,
                    )
                  "
                  class="border px-4 py-2 rounded"
                >
                  Battle Details
                </button>
              </div>
            </template>
          </div>

          <!-- Description -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h2 class="text-xl font-bold mb-4">About this Tournament</h2>
            <!-- Clean description: strip any HTML tags and preserve line breaks -->
            <p class="text-gray-600 whitespace-pre-line">
              {{ cleanDescription || "No description provided." }}
            </p>
          </div>

          <!-- Sponsor Information -->
          <div v-if="tournament.sponsor?.name || tournament.sponsor_details?.message" class="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 shadow-sm border border-primary/20">
            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
              <Icon name="mdi:handshake" class="text-primary" />
              Sponsored by
            </h2>
            <div class="space-y-4">
              <div v-if="tournament.sponsor?.name" class="flex items-center gap-4">
                <div v-if="tournament.sponsor?.logo" class="flex-shrink-0">
                  <img :src="tournament.sponsor.logo" :alt="tournament.sponsor.name" class="h-12 w-12 object-contain" />
                </div>
                <div>
                  <p class="font-semibold text-gray-900">{{ tournament.sponsor.name }}</p>
                </div>
              </div>
              <div v-if="tournament.sponsor_details?.message" class="bg-white rounded-lg p-4 text-gray-700 border border-primary/10">
                <p>{{ tournament.sponsor_details.message }}</p>
              </div>
            </div>
          </div>

          <!-- Rules & Requirements -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h2 class="text-xl font-bold mb-4">Rules & Requirements</h2>
            <ul class="list-disc list-inside text-gray-600 space-y-2">
              <li v-for="rule in tournament.rules" :key="rule">{{ rule }}</li>
              <li v-if="tournament.access_type === 'grade' && tournament.grade && tournament.grade.name">Only learners in grade {{ tournament.grade.name }} may join this tournament.</li>
              <li v-else-if="tournament.access_type === 'level' && tournament.level && tournament.level.name">Only learners at level {{ tournament.level.name }} may join this tournament.</li>
              <li v-else-if="(tournament.access_type === 'public' || !tournament.access_type)">Open to all learners.</li>
              <li v-if="tournament.entry_fee && Number(tournament.entry_fee) > 0">Entry fee: {{ formatPrizeKES(tournament.entry_fee) }}</li>
              <li v-if="eligibility.reason && !eligibility.can_join && eligibility.reason !== 'authentication_required'">Note: {{ eligibility.reason }}</li>
            </ul>
          </div>

          <!-- Timeline -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h2 class="text-xl font-bold mb-4">Tournament Timeline</h2>
            <div class="relative">
              <div
                class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"
              ></div>
              <div class="space-y-6">
                <div
                  v-for="(phase, index) in displayTimeline"
                  :key="index"
                  class="relative pl-10"
                >
                  <div
                    class="absolute left-2.5 top-2 w-3 h-3 rounded-full bg-primary"
                  ></div>
                  <h3 class="font-medium">{{ phase.name || phase.title }}</h3>
                  <p class="text-sm text-gray-600">
                    {{ phase.date ? formatDate(phase.date) : "TBD" }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Bracket -->
          <div class="bg-white rounded-xl p-6 shadow-sm mt-6">
            <h2 class="text-xl font-bold mb-4">Bracket</h2>
            <!-- provide battles-based rounds when available to avoid extra tree API requests -->
            <TournamentBracket
              :tournamentId="tournamentIdStr"
              :initialRounds="battlesAsRounds"
            />
          </div>

          <!-- Recent Matches -->
          <div class="bg-white rounded-xl p-6 shadow-sm mt-6">
            <h2 class="text-xl font-bold mb-4">Recent Matches</h2>
            <div v-if="recentMatches.length === 0" class="text-gray-600">
              No completed matches yet.
            </div>
            <div v-else class="space-y-4">
              <MatchResultCard
                v-for="m in recentMatches"
                :key="m.id"
                :match="m"
                :tournamentId="tournamentIdStr || String(tournament?.id ?? '')"
              />
            </div>
          </div>
        
        <!-- Entry fee badge (top-right of hero) -->
        <div class="absolute top-4 right-6">
          <div v-if="tournament.entry_fee && Number(tournament.entry_fee) > 0" class="inline-flex items-center gap-3 bg-primary text-white px-3 py-1 rounded-full shadow-lg border border-white/10">
            <Icon name="mdi:cash" class="text-white" />
            <div class="text-right leading-tight">
              <div class="text-xs opacity-90">Entry</div>
              <div class="text-sm font-semibold">{{ formatPrizeKES(tournament.entry_fee) }}</div>
            </div>
          </div>
        </div>
        </div>

        <!-- Sidebar (right column) -->
        <div class="space-y-6 lg:self-start">
          <div class="space-y-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-auto">
            <!-- Registration Status -->
            <div class="bg-white rounded-xl p-6 shadow-sm">
              <h2 class="text-xl font-bold mb-4">Registration</h2>
              <template v-if="!isRegistered && registrationStatus !== 'pending'">
                <p class="text-gray-600 mb-4">
                  Join this tournament to compete with other participants!
                </p>
                <button
                  @click="registerForTournament"
                  :disabled="loading || !canRegisterComputed"
                  class="w-full bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark disabled:bg-gray-300"
                >
                  {{ registerLabel }}
                </button>

                <div v-if="!canRegisterComputed && eligibility.reason" class="mt-3 text-sm text-yellow-700">
                  <p v-if="eligibility.reason === 'authentication_required'">
                    Please <NuxtLink :to="`/register?next=/quizee/tournaments/${tournament.id}`" class="underline">sign in</NuxtLink> to check eligibility.
                  </p>
                  <p v-else>
                    {{ eligibility.reason }}
                  </p>
                </div>
              </template>
              <template v-else-if="registrationStatus === 'pending'">
                <div class="text-yellow-600 font-medium mb-4">
                  <Icon name="mdi:clock-outline" class="inline-block mr-2" />
                  Registration pending approval
                </div>
                <button
                  disabled
                  class="w-full bg-gray-200 text-gray-600 px-6 py-3 rounded-lg font-medium"
                >
                  Awaiting approval
                </button>
              </template>
              <template v-else>
                <div style="color: #891f21" class="font-medium mb-4">
                  <Icon name="mdi:check-circle" class="inline-block mr-2" />
                  You're registered!
                </div>
                <button
                  @click="viewBattles"
                  class="w-full bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark"
                >
                  View Battles
                </button>
              </template>
              <!-- Share / invite button: placed inside registration card and responsive -->
              <div class="mt-4">
                <AffiliateShareButton
                  itemType="Tournament"
                  :itemId="tournament.id"
                  :baseUrl="baseUrl"
                  :btnClass="'inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-dark'"
                  :fullWidth="true"
                />
              </div>
              <!-- Payment handled via checkout redirect -->
            </div>

            <!-- Leaderboard Preview -->
            <div class="bg-white rounded-xl p-6 shadow-sm">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">Top Players</h2>
                <button
                  @click="
                    router.push(
                      `/quizee/tournaments/${tournament.id}/leaderboard`,
                    )
                  "
                  class="text-primary hover:underline"
                >
                  View All
                </button>
              </div>
              <div class="space-y-4">
                <div
                  v-for="(player, index) in topPlayers"
                  :key="player.id"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center gap-3">
                    <div
                      :class="[
                        'w-6 h-6 rounded-full flex items-center justify-center font-medium',
                        index === 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : index === 1
                            ? 'bg-gray-100 text-gray-700'
                            : index === 2
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-50 text-gray-600',
                      ]"
                    >
                      {{ index + 1 }}
                    </div>
                    <img
                      :src="resolveAssetUrl(player.avatar_url || player.avatar) || player.avatar_url || player.avatar || '/logo/avatar-placeholder.png'"
                      alt="Player avatar"
                      class="w-8 h-8 rounded-full object-cover"
                    />
                    <span class="font-medium">{{ player.name }}</span>
                  </div>
                  <span class="font-medium">{{ player.points }} pts</span>
                </div>
              </div>
            </div>

            <!-- Admin: Current Round & Scheduled Matches -->
            <div v-if="auth.user && (auth.user.role === 'quiz-master' || auth.user.role === 'admin')" class="bg-white rounded-xl p-6 shadow-sm">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-bold">Current Round</h2>
              </div>
              <div v-if="adminRoundInfo && adminRoundInfo.roundIndex != null">
                <div class="text-sm text-gray-600 mb-2">{{ adminRoundInfo.roundName }}</div>
                <div class="text-xs text-gray-500 mb-3">Ends: {{ adminRoundInfo.roundEndDate ? formatDate(adminRoundInfo.roundEndDate) : 'TBD' }}</div>
                <div class="text-sm font-medium mb-2">Scheduled Matches</div>
                <div v-if="(adminRoundInfo.scheduledMatches || []).length === 0" class="text-gray-600">No scheduled matches</div>
                <ul class="space-y-2">
                  <li v-for="m in adminRoundInfo.scheduledMatches" :key="m.id" class="text-sm text-gray-700">
                    <div class="flex justify-between">
                      <div>{{ m.player1?.name || 'TBD' }} vs {{ m.player2?.name || 'TBD' }}</div>
                      <div class="text-xs text-gray-500">{{ m.scheduled_at ? formatDate(m.scheduled_at) : '-' }}</div>
                    </div>
                  </li>
                </ul>
                <div class="mt-3">
                  <button @click="advanceRound" class="w-full bg-indigo-600 text-white px-3 py-2 rounded-md text-sm">Advance Round</button>
                </div>
              </div>
              <div v-else class="text-gray-600">Loading round info…</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
// Ensure this page uses the quizee layout when rendered
definePageMeta({ layout: "quizee" });
import { ref, onMounted, computed } from "vue";
import { useRuntimeConfig } from "#imports";
import QuestionCard from "~/components/quizee/questions/QuestionCard.vue";
import TournamentBracket from "~/components/TournamentBracket.vue";
import MatchResultCard from "~/components/quizee/tournaments/MatchResultCard.vue";
import useApi from "~/composables/useApi";
import { useAppAlert } from '~/composables/useAppAlert';
import AffiliateShareButton from "~/components/AffiliateShareButton.vue";
import { resolveAssetUrl } from "~/composables/useAssets";
const api = useApi();
// Payment handled via checkout redirect
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "~/stores/auth";

// Types
type Tournament = {
  id: number;
  banner?: string;
  name: string;
  start_date: string;
  end_date: string;
  participants_count: number;
  prize_pool: number;
  entry_fee?: number;
  description: string;
  rules: string[];
  timeline: {
    name?: string;
    title?: string;
    date?: string;
    start_date?: string;
    scheduled_at?: string;
  }[];
  registration_end_date: string;
  status: string;
  // optional winner object may be attached by the API envelope
  winner?: { avatar?: string; avatar_url?: string; name?: string } | null;
  sponsor?: { name?: string; logo?: string } | null;
  sponsor_details?: { message?: string } | null;
  grade?: { id?: number; name?: string } | null;
  grade_id?: number;
  level?: { id?: number; name?: string } | null;
  level_id?: number;
  access_type?: 'public' | 'grade' | 'level';
};

type Player = {
  id: number;
  avatar: string;
  avatar_url?: string;
  name: string;
  points: number;
};

// State
// Start loading as true so server-rendered markup matches the client initial render
// (client will set loading=true during fetchTournament in onMounted). This
// avoids hydration mismatches where the server renders empty content but the
// client immediately shows a loading spinner.
const loading = ref(true);
const tournament = ref<Tournament | null>(null);
const eligibility = ref<{ can_join: boolean; reason: string | null }>({ can_join: false, reason: null });
const battles = ref<any[]>([]);
const nextRoundAt = ref<string | null>(null);
const isRegistered = ref(false);
const registrationStatus = ref<string | null>(null); // 'pending' | 'approved' | 'rejected' | null
const topPlayers = ref<Player[]>([]);
const canRegister = ref(true);
// Prevent infinite retry loops when attempting to refresh a stale session
const _retryAuthAttempted = ref(false);

// computed helper for whether the current user can register (used by the UI)
const canRegisterComputed = computed(() => {
  if (!tournament.value) return false;
  // If user already registered or awaiting approval, they shouldn't register again
  if (isRegistered.value || registrationStatus.value === 'pending') return false;
  // Only allow registration when tournament is upcoming or active
  if (!['upcoming', 'active'].includes((tournament.value.status || '').toString())) return false;
  // Use eligibility metadata from API; default to false when missing
  return Boolean(eligibility.value?.can_join);
});

const registerLabel = computed(() => {
  if (!tournament.value) return 'Register';
  if (!canRegisterComputed.value) return (eligibility.value?.reason && eligibility.value?.reason !== 'authentication_required') ? 'Not eligible' : 'Register';
  const fee = Number(tournament.value.entry_fee || 0);
  if (fee > 0) return `Pay ${formatPrizeKES(fee)} & Register`;
  return 'Register Now';
});

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const config = useRuntimeConfig();

// Base and share urls (computed after runtime config is available)
const baseUrl = computed(() => {
  const base = (typeof config.public?.baseUrl === 'string' ? config.public.baseUrl : undefined) || (typeof window !== 'undefined' ? window.location.origin : '')
  if (!base) return ''
  return base.endsWith('/') ? `${base}tournaments` : `${base}/tournaments`
});
const shareUrl = computed(() => {
  const id = tournament.value?.id ?? route.params.id;
  return baseUrl.value ? `${baseUrl.value}/${id}` : '';
});

// Fetch tournament details
const fetchTournament = async () => {
  try {
    loading.value = true;
    // Use useApi composable for authenticated API call
    const response = await api.get(`/api/tournaments/${route.params.id}`);
    if (api.handleAuthStatus(response)) return;
    const json: any = await response.json().catch(() => null);

    // Defensive: backend may return { tournament: {...}, winner: ... }, or { data: {...} }, or the model directly.
  const payload = json?.tournament ?? json?.data ?? json;
  const data = payload?.tournament ?? payload ?? null;

  // capture eligibility metadata returned by the API (added server-side)
  eligibility.value = json?.eligibility ?? payload?.eligibility ?? { can_join: false, reason: null };

    // If backend says authentication is required but our client still has a user
    // (e.g. client-side store from a previous session), attempt one one-time
    // session revalidation (/api/me) so we can refresh cookies/session state and
    // immediately re-fetch eligibility. This helps when cookies weren't sent on
    // the first request (cross-site cookie issues) but the client store still
    // believes the user is logged in.
    try {
      if (
        eligibility.value &&
        eligibility.value.reason === 'authentication_required' &&
        auth.user &&
        !_retryAuthAttempted.value
      ) {
        _retryAuthAttempted.value = true;
        // Ensure CSRF cookie is fetched (no-op if already present)
        await api.ensureCsrf().catch(() => {});
        const meRes = await api.get('/api/me');
        // If handleAuthStatus redirects (401/419), it will return true and we've done all we can
        if (!api.handleAuthStatus(meRes) && meRes.ok) {
          const meJson = await meRes.json().catch(() => null);
          if (meJson) {
            // update auth store and refetch tournament once to pick up eligibility
            try { await auth.setUser ? auth.setUser(meJson) : (auth.fetchUser && await auth.fetchUser()) } catch (e) {}
            // Re-run fetchTournament once to pick up refreshed eligibility
            await fetchTournament();
            return;
          }
        }
      }
    } catch (e) {
      // ignore revalidation errors — we'll render the unauthenticated state below
    }

    // Fallback: if server reports authentication required but we have a cached
    // user in the client store (localStorage / pinia), try to infer eligibility
    // from the user's profile. This mirrors behavior on other pages that show
    // profile-specific UI based on the locally-stored session.
    try {
      if (
        eligibility.value &&
        eligibility.value.reason === 'authentication_required' &&
        auth.user
      ) {
        // Read user grade/level (support both camelCase and snake_case shapes)
        const userObj: any = auth.user as any;
        const userGradeId = userObj?.grade?.id ?? userObj?.grade_id ?? null;
        const userLevelId = userObj?.level?.id ?? userObj?.level_id ?? null;

        const tourGradeId = tournament.value?.grade?.id ?? tournament.value?.grade_id ?? null;
        const tourLevelId = tournament.value?.level?.id ?? tournament.value?.level_id ?? null;

        // If the tournament has a grade requirement and the user grade doesn't match,
        // deny; otherwise allow. Same for level. If the tournament doesn't require a
        // grade/level, treat that requirement as satisfied.
        let inferredCanJoin = true;
        if (tourGradeId && userGradeId) inferredCanJoin = inferredCanJoin && Number(userGradeId) === Number(tourGradeId);
        if (tourGradeId && !userGradeId) inferredCanJoin = false;
        if (tourLevelId && userLevelId) inferredCanJoin = inferredCanJoin && Number(userLevelId) === Number(tourLevelId);
        if (tourLevelId && !userLevelId) inferredCanJoin = false;

        // Only override eligibility with an "inferred" result — keep the
        // original authentication_required reason when we couldn't infer.
        if (inferredCanJoin) {
          eligibility.value = { can_join: true, reason: 'inferred' };
        } else if (!inferredCanJoin && (tourGradeId || tourLevelId)) {
          // If we could infer a denial based on profile mismatch, show that reason
          eligibility.value = { can_join: false, reason: 'Your profile does not meet the tournament grade/level requirements.' };
        }
      }
    } catch (e) {
      // swallow any errors from inference and proceed with server-provided eligibility
    }

  tournament.value = data
      ? ({
          id: data.id,
          // prefer banner field but fallback to sponsor_banner for backward compatibility
          banner: data.banner ?? data.sponsor_banner,
          name: data.name ?? data.title ?? "Tournament",
          start_date: (data.start_date || data.starts_at) ?? null,
          end_date: (data.end_date || data.ends_at) ?? null,
          participants_count: data.participants_count ?? 0,
          prize_pool: data.prize_pool ?? data.prize ?? data.prize_amount ?? 0,
          description: data.description ?? data.about ?? "",
          rules: data.rules || [],
          entry_fee: data.entry_fee ?? 0,
          grade: data.grade ?? null,
          level: data.level ?? null,
          // timeline items may use different keys for date; keep raw array and format when rendering
          timeline: data.timeline || data.phases || [],
          registration_end_date:
            data.registration_end_date ?? data.registration_ends_at ?? null,
          status: data.status,
          winner: data.winner ?? null,
          sponsor: {
            name: data.sponsor_name ?? data.sponsor?.name ?? null,
            logo: data.sponsor_logo ?? data.sponsor?.logo ?? null,
          },
        } as Tournament)
      : null;

    // compute next scheduled round time if battles are present
    try {
      const _battles = (json?.battles ?? json?.data?.battles) || [];
      battles.value = Array.isArray(_battles) ? _battles : [];
      if (Array.isArray(battles) && battles.length) {
        const scheduled = battles.value.filter(
          (b: any) => b.status === "scheduled" && b.scheduled_at,
        );
        if (scheduled.length) {
          scheduled.sort(
            (a: any, b: any) =>
              new Date(a.scheduled_at).getTime() -
              new Date(b.scheduled_at).getTime(),
          );
          nextRoundAt.value = scheduled[0].scheduled_at;
        }
      }
    } catch (e) {
      /* ignore */
    }

    await checkRegistrationStatus();
    await fetchLeaderboard();
    await checkQualificationStatus();
  } catch (error) {
    console.error("Error fetching tournament:", error);
  } finally {
    loading.value = false;
  }
};

// computed: current battle for logged-in user
const currentBattle = computed(() => {
  try {
    const userId = (auth.user as any)?.id;
    if (!userId || !battles.value || !battles.value.length) return null;
    return (
      battles.value.find(
        (b: any) =>
          (b.player1_id === userId || b.player2_id === userId) &&
          b.status !== "completed",
      ) || null
    );
  } catch (e) {
    return null;
  }
});

const isTaking = computed(() => {
  return !!(
    currentBattle.value &&
    ["active", "in_progress", "started"].includes(
      (currentBattle.value.status || "").toString(),
    )
  );
});

// Check if user has already taken the qualifier (using dedicated API endpoint)
const userHasQualified = ref(false)

const checkQualificationStatus = async () => {
  try {
    const response = await api.get(
      `/api/tournaments/${route.params.id}/qualification-status`,
    )
    if (api.handleAuthStatus(response)) return;
    const json: any = await response.json().catch(() => null)
    userHasQualified.value = !!(json?.qualified ?? false)
  } catch (error) {
    console.warn('Error checking qualification status:', error)
    // Non-fatal; user may not be authenticated
  }
}

// Check if user has already taken the qualifier (dummy check for now; ideally call an API endpoint)
const userHasQualifiedComputed = computed(() => {
  // This is a simple heuristic: if leaderboard is not empty and user is registered, assume they've qualified
  // In a real implementation, you could add an API endpoint to check qualification status
  try {
    const userId = (auth.user as any)?.id;
    if (!userId || !topPlayers.value || topPlayers.value.length === 0) return false;
    return topPlayers.value.some((p: any) => p.id === userId);
  } catch (e) {
    return false;
  }
});

// Check if user is registered and their registration status
const checkRegistrationStatus = async () => {
  try {
    const response = await api.get(
      `/api/tournaments/${route.params.id}/registration-status`,
    );
    if (api.handleAuthStatus(response)) return;
    const json: any = await response.json().catch(() => null);
    // Accept { isRegistered: true } or { data: { isRegistered: true } }
    const isReg = !!(json?.data?.isRegistered ?? json?.isRegistered);
    isRegistered.value = isReg;
    registrationStatus.value =
      (json?.data?.status ?? json?.status) || (isReg ? "approved" : null);
  } catch (error) {
    console.error("Error checking registration status:", error);
  }
};

const recentMatches = computed(() => {
  try {
    return (battles.value || [])
      .filter((b: any) => b.status === "completed")
      .slice(0, 6);
  } catch (e) {
    return [];
  }
});

// Admin-only: fetch current round & scheduled matches for a quick panel
const adminRoundInfo = ref<any>(null);
const fetchAdminRoundInfo = async () => {
  if (!auth.user || !(auth.user.role === 'quiz-master' || auth.user.role === 'admin')) return;
  try {
  const res = await api.get(`/api/tournaments/${route.params.id}/tree`);
  if (api.handleAuthStatus(res)) return;
  const json = await res.json().catch(() => null);
    const bracket = json?.bracket ?? json?.data?.bracket ?? null;
    if (!bracket) return;
    // find current round
    let currentIdx = bracket.findIndex((r: any) => r.is_current);
    if (currentIdx === -1) {
      currentIdx = bracket.findIndex((r: any) => !r.is_complete);
    }
    if (currentIdx === -1) currentIdx = 0;
    const round = bracket[currentIdx] ?? null;
    const scheduled = (round?.matches || []).filter((m: any) => m.status === 'scheduled' || m.scheduled_at);
    adminRoundInfo.value = {
      roundIndex: currentIdx,
      roundName: round?.name || `Round ${currentIdx + 1}`,
      roundEndDate: round?.round_end_date || null,
      scheduledMatches: scheduled,
      raw: round
    };
  } catch (e) {
    // ignore
  }
};

// Normalize route param id (could be string | string[] | undefined) into a plain string
const tournamentIdStr = computed(() => {
  const p = route.params.id as unknown as string | string[] | undefined;
  if (Array.isArray(p)) return p[0] ?? "";
  return p ?? "";
});

// Convert fetched battles into rounds array expected by TournamentBracket
const battlesAsRounds = computed(() => {
  try {
    if (!Array.isArray(battles.value) || battles.value.length === 0) return [];
    const groups: Record<number, any[]> = {};
    for (const b of battles.value) {
      const r = Number(b.round || 1);
      groups[r] = groups[r] || [];
      groups[r].push(b);
    }
    const keys = Object.keys(groups)
      .map((k) => Number(k))
      .sort((a, b) => a - b);
    return keys.map((k) => groups[k]);
  } catch (e) {
    return [];
  }
});

// Fetch leaderboard
const fetchLeaderboard = async () => {
  try {
    const response = await api.get(
      `/api/tournaments/${route.params.id}/leaderboard`,
    );
    if (api.handleAuthStatus(response)) return;
    const json: any = await response.json().catch(() => null);
    // Backend returns { tournament: {...}, leaderboard: [...] }
    const list = json?.leaderboard ?? json?.data ?? json ?? [];
    topPlayers.value = Array.isArray(list)
      ? (list as Player[]).slice(0, 5)
      : [];
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
  }
};

const { push: pushAlert } = useAppAlert();

const advanceRound = async () => {
  if (!auth.user || !(auth.user.role === 'quiz-master' || auth.user.role === 'admin')) {
    pushAlert({ message: 'You do not have permission to advance rounds', type: 'error' });
    return;
  }

  try {
    const res = await api.postJson(`/api/admin/tournaments/${route.params.id}/advance-round`, {});
    const body = await res.json().catch(() => null);
    if (res.ok) {
      pushAlert({ message: body?.message || 'Round advanced', type: 'success' });
      // Refresh tournament and battles to update bracket
      await fetchTournament();
      return;
    }
    pushAlert({ message: body?.message || 'Failed to advance round', type: 'error' });
  } catch (e) {
    console.error('Advance round failed', e);
    pushAlert({ message: 'Advance round failed', type: 'error' });
  }
};

// Register for tournament
const registerForTournament = async () => {
  try {
    const fee = Number(tournament.value?.entry_fee || 0);
  const openToSubscribers = Boolean((tournament.value as any)?.open_to_subscribers);

    // If the user is not authenticated, redirect to sign-in first
    if (eligibility.value?.reason === 'authentication_required') {
      router.push(`/register?next=/quizee/tournaments/${route.params.id}`);
      return;
    }

    // If tournament requires entry fee, redirect to checkout for the one-off purchase
    if (fee > 0) {
      const qs: Record<string, string> = { type: 'tournament', id: String(route.params.id) };
      if (fee) qs['amount'] = String(fee);
      router.push({ path: '/quizee/payments/checkout', query: qs });
      return;
    }

    // If tournament requires premium/subscription and user isn't eligible, redirect to subscription/checkout
    if (openToSubscribers && !eligibility.value?.can_join) {
      const qs: Record<string, string> = { type: 'subscription', next: `/quizee/tournaments/${route.params.id}` };
      router.push({ path: '/quizee/payments/checkout', query: qs });
      return;
    }

    // Otherwise attempt to join immediately (free tournament or user already paid/subscribed)
    loading.value = true;
    const res = await api.postJson(`/api/tournaments/${route.params.id}/join`, {});
    if (api.handleAuthStatus(res)) return;

    if (res.ok) {
      isRegistered.value = true;
      await fetchTournament();
      return;
    }

    let body = null;
    try { body = await res.json(); } catch (e) { body = null }

    // Handle structured errors like plan limits
    if (res.status === 403 && body && body.code === 'limit_reached') {
      const qs = new URLSearchParams({ reason: 'limit', type: body.limit?.type || 'unknown', value: String(body.limit?.value || '') });
      router.push('/quizee/subscription?' + qs.toString());
      return;
    }

    console.error('Registration failed', res.status, body);
  } catch (error) {
    console.error('Error registering for tournament:', error);
  } finally {
    loading.value = false;
  }
};

// Payment finalization handled by the checkout flow; no in-page handler required.

// View battles
const viewBattles = () => {
  router.push(`/quizee/tournaments/${tournament.value?.id}/battles`);
};

// Format helpers
const formatDate = (date?: string | null) => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    return String(date);
  }
};

// Simple client-side HTML stripper. This removes tags but preserves line breaks.
// NOTE: regex-based stripping is simple and not perfect for all HTML edge-cases,
// but it's the safest quick fix if you don't want to render rich HTML. If you
// prefer to allow sanitized HTML (rich formatting), we can switch to DOMPurify
// + v-html instead.
const stripHtml = (html?: string | null) => {
  if (!html) return "";
  try {
    // replace tags with empty string
    // preserve <br> and block tags by converting them to newlines first
    let s = String(html);
    s = s.replace(/<(br|\/?p|\/li|li|\/div|div|\/h[1-6])\s*\/?>/gi, "\n");
    // remove remaining tags
    s = s.replace(/<[^>]*>/g, "");
    // decode common HTML entities (basic)
    s = s
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&nbsp;/g, " ");
    // collapse multiple newlines
    s = s.replace(/\n{2,}/g, "\n\n");
    return s.trim();
  } catch (e) {
    return String(html);
  }
};

const cleanDescription = computed(() => {
  return stripHtml(tournament.value?.description ?? "");
});

const formatPrize = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Replace USD display with Kenyan shillings label
const formatPrizeKES = (amount: number) => {
  const n = Number(amount) || 0;
  const formatted = new Intl.NumberFormat('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);
  return `Ksh ${formatted}`;
};

// Fetch data on component mount
onMounted(() => {
  fetchTournament();
  fetchAdminRoundInfo();
});

// Ensure timeline shows standard phases when some are missing.
// Build an ordered timeline: for each standard phase, use the existing item if present (matching name/title), else a placeholder.
const displayTimeline = computed(() => {
  const existing = Array.isArray(tournament.value?.timeline)
    ? (tournament.value!.timeline as any[])
    : [];
  const standard = [
    "Registration",
    "Group Stage",
    "Quarterfinals",
    "Semifinals",
    "Final",
  ];

  const lowered = existing.reduce(
    (acc: Record<string, any>, item: any) => {
      const key = (item.name || item.title || "").toString().toLowerCase();
      if (key) acc[key] = item;
      return acc;
    },
    {} as Record<string, any>,
  );

  const ordered: any[] = [];
  for (const s of standard) {
    const key = s.toLowerCase();
    if (lowered[key]) {
      ordered.push(lowered[key]);
    } else {
      ordered.push({ name: s, date: null });
    }
  }

  // Append any non-standard existing phases (preserve original order)
  for (const item of existing) {
    const key = (item.name || item.title || "").toString().toLowerCase();
    if (!standard.map((s) => s.toLowerCase()).includes(key)) ordered.push(item);
  }

  return ordered;
});
</script>
