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
      <!-- Registration redirect banner (shown when redirected from checkout) -->
      <div v-if="registeredQuery === '1'" class="mb-6 p-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800">
        <div class="flex items-center justify-between">
          <div>
            <strong>You're registered!</strong>
            <div class="text-sm">Great — you're now registered for this tournament. Ready to take the qualifier?</div>
          </div>
          <div>
            <button @click="startQualifier" class="ml-4 px-4 py-2 bg-[#891f21] text-white rounded">Start qualifier</button>
          </div>
        </div>
      </div>
      <div v-else-if="registeredQuery === 'pending'" class="mb-6 p-4 rounded-md bg-amber-50 border border-amber-200 text-amber-800">
        <div class="flex items-center justify-between">
          <div>
            <strong>Registration pending</strong>
            <div class="text-sm">We've recorded your registration but payment is still pending. It will be confirmed shortly.</div>
          </div>
          <div>
            <button @click="clearRegisteredQuery" class="ml-4 px-4 py-2 bg-amber-600 text-white rounded">View tournament</button>
          </div>
        </div>
      </div>
      <!-- Tournament Header (refactored): image left, details + CTAs right -->
      <div class="mb-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <!-- Image column -->
          <div class="lg:col-span-2">
            <img
              :src="tournament.banner || '/images/tournament-default.jpg'"
              alt="Tournament banner"
              class="w-full h-64 sm:h-80 object-cover rounded-xl"
            />
          </div>

          <!-- Details & CTAs column -->
          <div class="lg:col-span-1 bg-[#891f21]/10 rounded-xl p-6 shadow-sm">
            <h1 class="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">{{ tournament.name }}</h1>
            <p class="text-sm text-gray-600 mb-4">
              <Icon name="mdi:calendar" class="inline-block mr-2" />
              {{ formatDate(tournament.start_date) }}
              <span v-if="tournament.end_date"> - {{ formatDate(tournament.end_date) }}</span>
            </p>

            <div class="flex items-center gap-4 mb-4">
              <div class="flex items-center gap-2">
                <Icon name="mdi:account-group" />
                <span class="text-sm">{{ tournament.participants_count }} participants</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon name="mdi:trophy" class="text-yellow-400" />
                <span class="text-sm">{{ formatPrizeKES(tournament.prize_pool) }}</span>
              </div>
            </div>

            <!-- Entry fee moved into details -->
            <div class="mb-4">
              <div v-if="tournament.entry_fee && Number(tournament.entry_fee) > 0" class="text-sm text-gray-600">Entry fee</div>
              <div v-if="tournament.entry_fee && Number(tournament.entry_fee) > 0" class="text-2xl font-bold text-[#891f21]">{{ formatPrizeKES(tournament.entry_fee) }}</div>
              <div v-else class="text-sm text-gray-600">No entry fee</div>
            </div>

            <!-- Primary CTA and secondary actions -->
            <div class="space-y-3">
              <button
                @click="heroPrimaryClick"
                :disabled="heroPrimaryDisabled"
                class="w-full text-white px-4 py-3 rounded-lg font-medium"
                :class="heroPrimaryClass"
              >
                {{ heroPrimaryLabel }}
              </button>

              <button v-if="isRegistered && (tournament.status === 'upcoming' && !userHasQualified && !currentBattle) === false" @click="viewBattles" class="w-full border px-4 py-2 rounded-lg text-sm">
                View Battles
              </button>

              <div class="mt-2">
                <AffiliateShareButton
                  itemType="Tournament"
                  :itemId="tournament.id"
                  :baseUrl="baseUrl"
                  :btnClass="'inline-flex items-center justify-center rounded-lg bg-[#891f21] px-4 py-2 text-sm font-medium text-white hover:bg-[#6f1718]'"
                  :fullWidth="true"
                />
              </div>
            </div>

            <!-- Admin: Advance Round (kept in details) -->
            <div v-if="auth.user && (auth.user.role === 'quiz-master' || auth.user.role === 'admin')" class="mt-4">
              <button
                @click="advanceRound"
                class="px-3 py-2 bg-[#891f21] text-white rounded-md text-sm hover:bg-[#6f1718]"
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
          <!-- Qualification Phase block removed: UI consolidated into hero CTAs -->

          <!-- Qualification Closed -->
          <div v-if="tournament.status === 'active' && isRegistered" class="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 class="text-xl font-bold mb-4 text-gray-900">Qualification Closed</h2>
            <p class="text-gray-700 mb-4">
              The qualification round has ended. Tournament battles are now underway.
            </p>
            <button
              @click="router.push(`/quizee/tournaments/${tournament.id}/battles`)"
              class="w-full bg-[#891f21] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#6f1718]"
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
                    class="bg-[#891f21] text-white px-4 py-2 rounded"
                  >
                    Open Battle Details
                  </button>
                </div>
              </div>
              <div v-else class="text-gray-600">
                Questions for this battle are not yet available.
                <button @click="viewBattles" class="text-[#891f21] underline">
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
              <Icon name="mdi:handshake" class="text-[#891f21]" />
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

          <!-- Timeline integrated into TournamentBracket; removed standalone Timeline section -->

          <!-- Bracket -->
          <div class="bg-white rounded-xl p-6 shadow-sm mt-6">
            <h2 class="text-xl font-bold mb-4">Bracket</h2>
            <!-- provide battles-based rounds when available to avoid extra tree API requests -->
            <TournamentBracket
              :tournamentId="tournamentIdStr"
              :initialRounds="battlesAsRounds"
              :timeline="displayTimeline"
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
        
        <!-- Entry fee moved into hero details; badge removed -->
        </div>

        <!-- Sidebar (right column) -->
        <div class="space-y-6 lg:self-start">
          <div class="space-y-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-auto">
            <!-- Registration moved into hero details (mobile-first) -->

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

  // Normalize rules to always be an array of strings. The backend may return
  // rules as an array, a JSON-encoded array string, or a plain newline
  // separated string. If we accidentally assign a raw string to
  // `tournament.rules`, Vue's `v-for` will iterate characters.
  let _rulesRaw: any = data?.rules ?? [];
  let _rulesNorm: string[] = [];
  if (Array.isArray(_rulesRaw)) {
    _rulesNorm = _rulesRaw.map((r: any) => String(r));
  } else if (typeof _rulesRaw === 'string') {
    try {
      const parsed = JSON.parse(_rulesRaw);
      if (Array.isArray(parsed)) _rulesNorm = parsed.map((r: any) => String(r));
      else _rulesNorm = _rulesRaw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    } catch (e) {
      _rulesNorm = _rulesRaw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    }
  } else {
    _rulesNorm = [];
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
          rules: _rulesNorm,
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

// Read registered query param (used when redirected from checkout)
const registeredQuery = computed(() => {
  const q = route.query?.registered
  if (!q) return null
  return String(q)
})

// Hero CTA helpers: determine label, disabled state and styling for the primary
// CTA rendered in the hero details. This consolidates register / qualifier /
// view actions into one prominent button.
const heroPrimaryLabel = computed(() => {
  if (registrationStatus.value === 'pending') return 'Awaiting approval'
  if (!isRegistered.value) return registerLabel.value
  // If registered but not qualified and qualification is available, prompt to take qualifier
  if (tournament.value && tournament.value.status === 'upcoming' && !userHasQualified.value && !currentBattle.value) return 'Take Qualifier'
  // If user currently has an active battle, show 'View Battle'
  if (currentBattle.value) return 'View Battle'
  return 'View Battles'
})

const heroPrimaryDisabled = computed(() => {
  if (registrationStatus.value === 'pending') return true
  if (!isRegistered.value) return !canRegisterComputed.value
  return false
})

const heroPrimaryClass = computed(() => {
  // Use explicit burgundy color for hero CTAs to match the site style
  return heroPrimaryDisabled.value
    ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
    : 'bg-[#891f21] hover:bg-[#6f1718]'
})

function heroPrimaryClick() {
  if (heroPrimaryDisabled.value) return
  if (!isRegistered.value) {
    return registerForTournament()
  }

  // Registered: if qualifier is available, go to qualifier
  if (tournament.value && tournament.value.status === 'upcoming' && !userHasQualified.value && !currentBattle.value) {
    return router.push(`/quizee/tournaments/${tournament.value.id}/qualify`)
  }

  // Otherwise go to battles / battle view
  return viewBattles()
}

// Fetch data on component mount
onMounted(async () => {
  await fetchTournament();
  fetchAdminRoundInfo();

  // If we were redirected here from the checkout flow, the query param can
  // provide an immediate UI hint before the backend reflects the registration
  // in its registration-status endpoint. Honor that hint so users see the
  // qualifier CTA right away.
  const reg = registeredQuery.value
  if (reg === '1') {
    isRegistered.value = true
    registrationStatus.value = 'approved'
  } else if (reg === 'pending') {
    registrationStatus.value = 'pending'
  }
});

// Ensure timeline shows standard phases when some are missing.
// Build an ordered timeline: prefer explicit timeline from the API, but when
// missing or empty try to infer ranges from server-created battles. The
// backend's scheduling logic uses the latest scheduled_at for a round as the
// round start and then advances the next round by `round_delay_days` — we
// mirror that here so the UI can display accurate ranges without requiring
// an explicit `timeline` field.
const displayTimeline = computed(() => {
  const existing = Array.isArray(tournament.value?.timeline)
    ? (tournament.value!.timeline as any[])
    : [];

  // Helper to extract a start/end date range from different possible keys
  const extractRange = (item: any) => {
    const start = item?.start_date ?? item?.start ?? item?.date ?? item?.scheduled_at ?? null;
    const end = item?.end_date ?? item?.end ?? item?.ends_at ?? null;
    return {
      name: item?.name ?? item?.title ?? 'Phase',
      start_date: start ? String(start) : null,
      end_date: end ? String(end) : null,
      raw: item,
    };
  };

  // If the backend supplied an explicit timeline, normalize and return it
  if (Array.isArray(existing) && existing.length > 0) {
    const normalized = existing.map((it: any) => extractRange(it));
    return normalized;
  }

  // Otherwise, attempt to infer timeline from battles (if available)
  try {
    if (Array.isArray(battles.value) && battles.value.length) {
      const byRound: Record<number, any[]> = {};
      for (const b of battles.value) {
        const r = Number(b.round || 1);
        byRound[r] = byRound[r] || [];
        byRound[r].push(b);
      }

      const rounds = Object.keys(byRound)
        .map((k) => Number(k))
        .sort((a, b) => a - b);

      const out: any[] = [];

      // Registration phase (use tournament start/registration_end when available)
      out.push({
        name: 'Registration',
        start_date: tournament.value?.start_date ?? null,
        end_date: tournament.value?.registration_end_date ?? null,
        raw: null,
      });

  // For each round compute start as the latest scheduled_at among its battles
  // and end as start + round_delay_days (mirrors server behavior)
  const roundDelay = Number((tournament.value as any)?.round_delay_days ?? 0);
      for (const r of rounds) {
        const list = byRound[r] || [];
        const scheduledDates = list
          .map((x: any) => x?.scheduled_at)
          .filter(Boolean)
          .map((s: any) => new Date(s));

        let startIso: string | null = null;
        let endIso: string | null = null;
        if (scheduledDates.length) {
          // server uses the latest scheduled_at as round start
          const latest = scheduledDates.reduce((a: Date, b: Date) => (a.getTime() > b.getTime() ? a : b));
          startIso = latest.toISOString();
          if (roundDelay && !Number.isNaN(roundDelay)) {
            const endDate = new Date(latest.getTime());
            endDate.setDate(endDate.getDate() + Math.max(1, roundDelay));
            endIso = endDate.toISOString();
          }
        }

        out.push({
          name: `Round ${r}`,
          start_date: startIso,
          end_date: endIso,
          raw: { round: r, battles: list },
        });
      }

      return out;
    }
  } catch (e) {
    // fall through to return a minimal default timeline
  }

  // Last resort: return a few standard placeholders
  const standard = [
    "Registration",
    "Group Stage",
    "Quarterfinals",
    "Semifinals",
    "Final",
  ];
  return standard.map((s) => ({ name: s, start_date: null, end_date: null }));
});

// Clear the registered query and navigate to the qualifier
const startQualifier = async () => {
  const id = tournament.value?.id ?? route.params.id
  // remove the registered query param so the banner doesn't persist on refresh
  await router.replace({ path: `/quizee/tournaments/${id}`, query: {} })
  // navigate to qualifier
  router.push(`/quizee/tournaments/${id}/qualify`)
}

// Clear only the registered query (stay on tournament page)
const clearRegisteredQuery = async () => {
  const id = tournament.value?.id ?? route.params.id
  await router.replace({ path: `/quizee/tournaments/${id}`, query: {} })
}
</script>
