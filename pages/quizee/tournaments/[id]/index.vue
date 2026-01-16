<template>
  <div class="bg-gray-50 min-h-screen pb-12">
    <!-- Sticky Share Button -->
    <StickyShareButton
      itemType="Tournament"
      :itemId="tournament?.id"
      :itemTitle="`${tournament?.name} - Join the battle on Modeh!`"
      :disabled="!tournament?.id"
    />

    <div v-if="loading" class="flex justify-center items-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>

    <template v-else-if="tournament">
      <!-- Registration redirect banner (shown when redirected from checkout) -->
      <div v-if="registeredQuery === '1'" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-6">
        <div class="p-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
          <div>
            <strong>You're registered!</strong>
            <div class="text-sm">Great — you're now registered for this tournament. Ready to take the qualifier?</div>
          </div>
          <button @click="startQualifier" class="ml-4 px-4 py-2 bg-[#891f21] text-white rounded hover:bg-[#6f1718]">Start qualifier</button>
        </div>
      </div>
      <div v-else-if="registeredQuery === 'pending'" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-6">
        <div class="p-4 rounded-md bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-between">
          <div>
            <strong>Registration pending</strong>
            <div class="text-sm">We've recorded your registration but payment is still pending. It will be confirmed shortly.</div>
          </div>
          <button @click="clearRegisteredQuery" class="ml-4 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700">View tournament</button>
        </div>
      </div>

      <!-- Hero Section -->
      <PageHero
        :title="tournament.name"
        :description="cleanDescription.substring(0, 150) + (cleanDescription.length > 150 ? '...' : '')"
        :image="tournament.banner"
        variant="image"
        class="mb-0"
      >
        <template #eyebrow>
          <span class="flex items-center gap-2">
            <span class="relative flex h-2 w-2">
              <span v-if="tournament.status === 'live' || tournament.status === 'active'" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span :class="statusColor(tournament.status)" class="relative inline-flex rounded-full h-2 w-2"></span>
            </span>
            {{ tournament.status?.toUpperCase() || 'TOURNAMENT' }}
          </span>
        </template>

        <template #highlight>
          <div>
            <p class="text-xs uppercase tracking-wide text-white/60">Prize Pool</p>
            <p class="mt-1 text-3xl font-bold text-white">{{ formatPrizeKES(tournament.prize_pool) }}</p>
          </div>
        </template>

        <template #highlight-icon>
           <span class="text-2xl">🏆</span>
        </template>

        <template #stats>
           <div class="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/10">
              <p class="text-xs text-white/60 uppercase">Entry Fee</p>
              <p class="font-semibold text-white">{{ Number(tournament.entry_fee) > 0 ? formatPrizeKES(tournament.entry_fee) : 'Free' }}</p>
           </div>
           <div class="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/10">
              <p class="text-xs text-white/60 uppercase">Participants</p>
              <p class="font-semibold text-white">{{ tournament.participants_count }}</p>
           </div>
        </template>

        <template #actions>
           <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                @click="heroPrimaryClick"
                :disabled="heroPrimaryDisabled"
                class="px-6 py-3 rounded-lg font-medium shadow-lg transition-transform hover:-translate-y-0.5 min-w-[200px]"
                :class="heroPrimaryClass"
              >
                {{ heroPrimaryLabel }}
              </button>

              <button 
                v-if="isRegistered && (tournament.status === 'upcoming' && !userHasQualified && !currentBattle) === false" 
                @click="viewBattles" 
                class="px-6 py-3 rounded-lg font-medium bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm"
              >
                View Battles
              </button>

              <!-- Admin Advance Round -->
              <button
                v-if="auth.user && (auth.user.role === 'quiz-master' || auth.user.role === 'admin')"
                @click="advanceRound"
                class="px-6 py-3 rounded-lg font-medium bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg"
              >
                Advance Round
              </button>
           </div>
        </template>
      </PageHero>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Column: Details & Actions -->
          <div class="lg:col-span-2 space-y-8">
            
            <!-- Qualification Closed Alert -->
            <div v-if="tournament.status === 'active' && isRegistered" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
               <div class="flex items-start gap-4">
                  <div class="p-3 bg-blue-50 text-blue-600 rounded-xl">
                     <Icon name="mdi:information" class="w-6 h-6" />
                  </div>
                  <div>
                     <h2 class="text-lg font-bold text-gray-900 mb-2">Qualification Closed</h2>
                     <p class="text-gray-600 mb-4">The qualification round has ended. Tournament battles are now underway.</p>
                     <button
                       @click="router.push(`/quizee/tournaments/${tournament.id}/battles`)"
                       class="text-primary font-medium hover:underline"
                     >
                       View Battles →
                     </button>
                  </div>
               </div>
            </div>

            <!-- Current Battle Card -->
            <div v-if="currentBattle" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 border-l-4 border-l-primary">
               <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                  <span class="p-2 bg-red-50 text-red-600 rounded-lg">
                     <Icon name="mdi:sword-cross" class="w-5 h-5" />
                  </span>
                  Your Battle — Round {{ currentBattle.round }}
               </h2>

               <template v-if="isTaking">
                  <p class="text-gray-600 mb-6">You have an active battle. Answer the questions below to complete your match.</p>
                  <div v-if="currentBattle.question">
                     <QuestionCard :question="currentBattle.question" />
                     <div class="mt-6 flex justify-end">
                        <button
                           @click="router.push(`/quizee/tournaments/${tournament.id}/battles/${currentBattle.id}`)"
                           class="bg-[#891f21] text-white px-6 py-2.5 rounded-lg hover:bg-[#6f1718] transition-colors"
                        >
                           Open Battle Details
                        </button>
                     </div>
                  </div>
                  <div v-else class="text-gray-600 bg-gray-50 p-4 rounded-lg">
                     Questions for this battle are not yet available.
                     <button @click="viewBattles" class="text-[#891f21] font-medium hover:underline ml-2">Go to Battles</button>
                  </div>
               </template>

               <template v-else>
                  <p class="text-gray-600 mb-6">You are scheduled to play in this round.</p>
                  <div class="flex gap-3">
                     <button @click="viewBattles" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">View Battle</button>
                     <button @click="router.push(`/quizee/tournaments/${tournament.id}/battles/${currentBattle.id}`)" class="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">Battle Details</button>
                  </div>
               </template>
            </div>

            <!-- About Card -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span class="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Icon name="mdi:text-box-outline" class="w-5 h-5" />
                </span>
                About this Tournament
              </h2>
              <p class="text-gray-600 whitespace-pre-line leading-relaxed">
                 {{ cleanDescription || "No description provided." }}
              </p>
            </div>

            <!-- Rules Card -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span class="p-2 bg-red-50 text-red-600 rounded-lg">
                  <Icon name="mdi:gavel" class="w-5 h-5" />
                </span>
                Rules & Requirements
              </h2>
              <ul class="space-y-3">
                 <li v-for="(rule, idx) in tournament.rules" :key="idx" class="flex items-start gap-3 text-gray-600">
                    <span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                    <span>{{ rule }}</span>
                 </li>
                 <li v-if="tournament.access_type === 'grade' && tournament.grade" class="flex items-start gap-3 text-gray-600">
                    <span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                    <span>Only Quizees in grade {{ tournament.grade.name }} may join.</span>
                 </li>
                 <li v-else-if="tournament.access_type === 'level' && tournament.level" class="flex items-start gap-3 text-gray-600">
                    <span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                    <span>Only Quizees at level {{ tournament.level.name }} may join.</span>
                 </li>
                 <li v-if="tournament.entry_fee && Number(tournament.entry_fee) > 0" class="flex items-start gap-3 text-gray-600">
                    <span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                    <span>Entry fee: {{ formatPrizeKES(tournament.entry_fee) }}</span>
                 </li>
                 <li v-if="eligibility.reason && !eligibility.can_join && eligibility.reason !== 'authentication_required'" class="flex items-start gap-3 text-amber-600 bg-amber-50 p-2 rounded">
                    <Icon name="mdi:alert-circle" class="w-5 h-5 flex-shrink-0" />
                    <span>Note: {{ eligibility.reason }}</span>
                 </li>
              </ul>
            </div>

            <!-- Bracket -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
               <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span class="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Icon name="mdi:tournament" class="w-5 h-5" />
                </span>
                Tournament Bracket
              </h2>
              <TournamentBracket
                :tournamentId="tournamentIdStr"
                :initialRounds="battlesAsRounds"
                :timeline="displayTimeline"
              />
            </div>

            <!-- Recent Matches -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
               <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span class="p-2 bg-green-50 text-green-600 rounded-lg">
                  <Icon name="mdi:history" class="w-5 h-5" />
                </span>
                Recent Matches
              </h2>
              <div v-if="recentMatches.length === 0" class="text-gray-500 italic text-center py-8">
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

          </div>

          <!-- Right Column: Sidebar -->
          <div class="space-y-6">
            
            <!-- Sponsor Card -->
            <div v-if="tournament.sponsor?.name || tournament.sponsor_details?.message" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <div class="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4">
                  <h3 class="text-white font-semibold flex items-center gap-2">
                     <span class="text-yellow-400">★</span> Sponsored By
                  </h3>
               </div>
               <div class="p-6">
                  <div v-if="tournament.sponsor?.logo" class="mb-4">
                     <img :src="tournament.sponsor.logo ?? undefined" :alt="tournament.sponsor.name ?? ''" class="h-16 object-contain" />
                  </div>
                  <p v-if="tournament.sponsor?.name" class="font-bold text-gray-900 mb-2">{{ tournament.sponsor.name }}</p>
                  <p v-if="tournament.sponsor_details?.message" class="text-gray-600 italic">"{{ tournament.sponsor_details.message }}"</p>
               </div>
            </div>

            <!-- Leaderboard Preview -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
               <div class="flex justify-between items-center mb-6">
                  <h2 class="text-lg font-bold text-gray-900">Top Players</h2>
                  <button @click="router.push(`/quizee/tournaments/${tournament.id}/leaderboard`)" class="text-sm text-primary hover:underline">View All</button>
               </div>
               <div class="space-y-4">
                  <div v-for="(player, index) in topPlayers" :key="player.id" class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                     <div class="flex items-center gap-3">
                        <div :class="['w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm', 
                           index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                           index === 1 ? 'bg-gray-100 text-gray-700' : 
                           index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500']">
                           {{ index + 1 }}
                        </div>
                        <img :src="resolveAssetUrl(player.avatar_url || player.avatar || player.image || (player as any).avatarUrl || (player as any).photo) || '/logo/avatar-placeholder.png'" alt="" class="w-8 h-8 rounded-full object-cover bg-gray-200" />
                        <span class="font-medium text-gray-900 truncate max-w-[120px]">{{ player.name }}</span>
                     </div>
                     <span class="font-bold text-gray-900">{{ player.points }} <span class="text-xs text-gray-500 font-normal">pts</span></span>
                  </div>
                  <div v-if="topPlayers.length === 0" class="text-center text-gray-500 py-4 text-sm">
                     No players yet. Be the first!
                  </div>
               </div>
            </div>

            <!-- Affiliate Share -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
               <h3 class="font-bold text-gray-900 mb-4">Share & Earn</h3>
               <AffiliateShareButton
                  itemType="Tournament"
                  :itemId="tournament.id"
                  :baseUrl="baseUrl"
                  :btnClass="'w-full flex items-center justify-center rounded-lg bg-[#891f21] px-4 py-3 text-sm font-medium text-white hover:bg-[#6f1718] transition-colors shadow-sm'"
                  :fullWidth="true"
               />
            </div>

            <!-- Admin Panel -->
            <div v-if="auth.user && (auth.user.role === 'quiz-master' || auth.user.role === 'admin')" class="bg-gray-900 rounded-2xl shadow-sm p-6 text-white">
               <div class="flex justify-between items-center mb-4">
                  <h2 class="text-lg font-bold flex items-center gap-2">
                     <Icon name="mdi:shield-account" /> Admin Panel
                  </h2>
               </div>
               <div v-if="adminRoundInfo && adminRoundInfo.roundIndex != null">
                  <div class="text-sm text-gray-300 mb-1">Current Phase</div>
                  <div class="font-semibold text-lg mb-4">{{ adminRoundInfo.roundName }}</div>
                  
                  <div class="text-sm text-gray-300 mb-2">Scheduled Matches</div>
                  <div v-if="(adminRoundInfo.scheduledMatches || []).length === 0" class="text-gray-500 text-sm italic mb-4">No scheduled matches</div>
                  <ul class="space-y-2 mb-4">
                     <li v-for="m in adminRoundInfo.scheduledMatches" :key="m.id" class="text-sm bg-white/10 p-2 rounded">
                        <div class="flex justify-between">
                           <span>{{ m.player1?.name || 'TBD' }} vs {{ m.player2?.name || 'TBD' }}</span>
                           <span class="text-gray-400 text-xs">{{ m.scheduled_at ? formatDate(m.scheduled_at) : '-' }}</span>
                        </div>
                     </li>
                  </ul>
                  <button @click="advanceRound" class="w-full py-2 bg-yellow-500 text-gray-900 rounded font-bold hover:bg-yellow-400 transition-colors">
                     Advance Round
                  </button>
               </div>
               <div v-else class="text-gray-400 text-sm">
                  Tournament bracket not initialized or no active round.
               </div>
            </div>

          </div>
        </div>
      </div>
    </template>

    <div v-else class="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
       <div class="text-6xl mb-4">🏆</div>
       <h2 class="text-2xl font-bold text-gray-900">Tournament Not Found</h2>
       <p class="mt-2">The tournament you are looking for does not exist or has been removed.</p>
       <button @click="router.push('/quizee/tournaments')" class="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Browse Tournaments</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { resolveAssetUrl } from '~/composables/useAssets';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth'
import { useTournamentStore } from '~/stores/tournamentStore';
import useApi from '~/composables/useApi';
import { useAppAlert } from '~/composables/useAppAlert';
import PageHero from '~/components/ui/PageHero.vue';
import StickyShareButton from '~/components/StickyShareButton.vue';
import AffiliateShareButton from '~/components/AffiliateShareButton.vue';
import QuestionCard from '~/components/quizee/questions/QuestionCard.vue';
import TournamentBracket from '~/components/TournamentBracket.vue';
import MatchResultCard from '~/components/quizee/tournaments/MatchResultCard.vue';

// Use the quizee layout for tournament pages
definePageMeta({ layout: 'quizee' });

// Types
type Tournament = {
  id: number;
  name: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  participants_count: number;
  prize_pool: number;
  banner?: string;
  status: string;
  rules: string[];
  entry_fee: number;
  timeline: any[];
  registration_end_date: string | null;
  winner: any;
  sponsor: { name: string | null; logo: string | null };
  sponsor_details?: { message: string };
  grade?: { id: number; name: string };
  level?: { id: number; name: string };
  grade_id?: number;
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
const loading = computed(() => tournamentStore.loading);
const tournament = computed(() => tournamentStore.currentTournament);
const eligibility = ref<{ can_join: boolean; reason: string | null }>({ can_join: false, reason: null });
const battles = ref<any[]>([]);
const nextRoundAt = ref<string | null>(null);
const isRegistered = ref(false);
const registrationStatus = ref<string | null>(null);
const topPlayers = ref<Player[]>([]);
const canRegister = ref(true);
const _retryAuthAttempted = ref(false);

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const tournamentStore = useTournamentStore();
const api = useApi();
const config = useRuntimeConfig();
const { push: pushAlert } = useAppAlert();

// Computed
const canRegisterComputed = computed(() => {
  if (!tournament.value) return false;
  if (isRegistered.value || registrationStatus.value === 'pending') return false;
  if (!['upcoming', 'active'].includes((tournament.value.status || '').toString())) return false;
  return Boolean(eligibility.value?.can_join);
});

const registerLabel = computed(() => {
  if (!tournament.value) return 'Register';
  if (!canRegisterComputed.value) return (eligibility.value?.reason && eligibility.value?.reason !== 'authentication_required') ? 'Not eligible' : 'Register';
  const fee = Number(tournament.value.entry_fee || 0);
  if (fee > 0) return `Pay ${formatPrizeKES(fee)} & Register`;
  return 'Register Now';
});

const baseUrl = computed(() => {
  const base = (typeof config.public?.baseUrl === 'string' ? config.public.baseUrl : undefined) || (typeof window !== 'undefined' ? window.location.origin : '')
  if (!base) return ''
  return base.endsWith('/') ? `${base}tournaments` : `${base}/tournaments`
});

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

const userHasQualified = ref(false);
const userHasQualifiedComputed = computed(() => {
  try {
    const userId = (auth.user as any)?.id;
    if (!userId || !topPlayers.value || topPlayers.value.length === 0) return false;
    return topPlayers.value.some((p: any) => p.id === userId);
  } catch (e) {
    return false;
  }
});

const recentMatches = computed(() => {
  try {
    return (battles.value || [])
      .filter((b: any) => b.status === "completed")
      .slice(0, 6);
  } catch (e) {
    return [];
  }
});

const tournamentIdStr = computed(() => {
  const p = route.params.id as unknown as string | string[] | undefined;
  if (Array.isArray(p)) return p[0] ?? "";
  return p ?? "";
});

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

const registeredQuery = computed(() => {
  const q = route.query?.registered
  if (!q) return null
  return String(q)
});

const heroPrimaryLabel = computed(() => {
  if (registrationStatus.value === 'pending') return 'Awaiting approval'
  if (!isRegistered.value) return registerLabel.value
  if (tournament.value && tournament.value.status === 'upcoming' && !userHasQualified.value && !currentBattle.value) return 'Take Qualifier'
  if (currentBattle.value) return 'View Battle'
  return 'View Battles'
});

const heroPrimaryDisabled = computed(() => {
  if (registrationStatus.value === 'pending') return true
  if (!isRegistered.value) return !canRegisterComputed.value
  return false
});

const heroPrimaryClass = computed(() => {
  return heroPrimaryDisabled.value
    ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
    : 'bg-[#891f21] text-white hover:bg-[#6f1718]'
});

const cleanDescription = computed(() => {
  return stripHtml(tournament.value?.description ?? "");
});

const displayTimeline = computed(() => {
  const existing = Array.isArray(tournament.value?.timeline)
    ? (tournament.value!.timeline as any[])
    : [];

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

  if (Array.isArray(existing) && existing.length > 0) {
    return existing.map((it: any) => extractRange(it));
  }

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
      out.push({
        name: 'Registration',
        start_date: tournament.value?.start_date ?? null,
        end_date: tournament.value?.registration_end_date ?? null,
        raw: null,
      });

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
  } catch (e) {}

  const standard = ["Registration", "Group Stage", "Quarterfinals", "Semifinals", "Final"];
  return standard.map((s) => ({ name: s, start_date: null, end_date: null }));
});

// Methods
const fetchTournament = async () => {
  try {
    const data = await tournamentStore.fetchTournament(route.params.id);
    if (!data) return;

    eligibility.value = data?.eligibility ?? { can_join: false, reason: null };

    // Auth revalidation logic
    try {
      if (eligibility.value?.reason === 'authentication_required' && auth.user && !_retryAuthAttempted.value) {
        _retryAuthAttempted.value = true;
        const me = await auth.fetchUser(true);
        if (me) {
          await fetchTournament();
          return;
        }
      }
    } catch (e) {}

    // Inferred eligibility logic
    try {
      if (eligibility.value?.reason === 'authentication_required' && auth.user) {
        const userObj: any = auth.user as any;
        const userGradeId = userObj?.grade?.id ?? userObj?.grade_id ?? null;
        const userLevelId = userObj?.level?.id ?? userObj?.level_id ?? null;
        const tourGradeId = data?.grade?.id ?? data?.grade_id ?? null;
        const tourLevelId = data?.level?.id ?? data?.level_id ?? null;

        let inferredCanJoin = true;
        if (tourGradeId && userGradeId) inferredCanJoin = inferredCanJoin && Number(userGradeId) === Number(tourGradeId);
        if (tourGradeId && !userGradeId) inferredCanJoin = false;
        if (tourLevelId && userLevelId) inferredCanJoin = inferredCanJoin && Number(userLevelId) === Number(tourLevelId);
        if (tourLevelId && !userLevelId) inferredCanJoin = false;

        if (inferredCanJoin) eligibility.value = { can_join: true, reason: 'inferred' };
        else if (!inferredCanJoin && (tourGradeId || tourLevelId)) eligibility.value = { can_join: false, reason: 'Your profile does not meet the tournament grade/level requirements.' };
      }
    } catch (e) {}

    // Parallel requests for status checks and leaderboard
    await Promise.all([
      checkRegistrationStatus(),
      fetchLeaderboard(),
      checkQualificationStatus()
    ]);
  } catch (error) {
    console.error("Error fetching tournament:", error);
  }
};

const checkQualificationStatus = async () => {
  try {
    const json: any = await tournamentStore.fetchQualificationStatus(route.params.id)
    userHasQualified.value = !!(json?.qualified ?? false)
  } catch (error) {
    console.warn('Error checking qualification status:', error)
  }
}

const checkRegistrationStatus = async () => {
  try {
    const json: any = await tournamentStore.fetchRegistrationStatus(route.params.id);
    const isReg = !!(json?.data?.isRegistered ?? json?.isRegistered);
    isRegistered.value = isReg;
    registrationStatus.value = (json?.data?.status ?? json?.status) || (isReg ? "approved" : null);
  } catch (error) {
    console.error("Error checking registration status:", error);
  }
};

const fetchLeaderboard = async () => {
  try {
    const json: any = await tournamentStore.fetchLeaderboard(route.params.id);
    const list = json?.leaderboard ?? json?.data ?? json ?? [];
    topPlayers.value = Array.isArray(list) ? (list as Player[]).slice(0, 5) : [];
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
  }
};

const adminRoundInfo = ref<any>(null);
const fetchAdminRoundInfo = async () => {
  if (!auth.user || !(auth.user.role === 'quiz-master' || auth.user.role === 'admin')) return;
  try {
    const res = await api.get(`/api/tournaments/${route.params.id}/tree`);
    if (await api.handleAuthStatus(res)) return;
    const json = await res.json().catch(() => null);
    const bracket = json?.bracket ?? json?.data?.bracket ?? null;
    if (!bracket) return;
    let currentIdx = bracket.findIndex((r: any) => r.is_current);
    if (currentIdx === -1) currentIdx = bracket.findIndex((r: any) => !r.is_complete);
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
  } catch (e) {}
};

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
      await fetchTournament();
      return;
    }
    pushAlert({ message: body?.message || 'Failed to advance round', type: 'error' });
  } catch (e) {
    pushAlert({ message: 'Advance round failed', type: 'error' });
  }
};

const registerForTournament = async () => {
  try {
    const fee = Number(tournament.value?.entry_fee || 0);
    const openToSubscribers = Boolean((tournament.value as any)?.open_to_subscribers);

    if (eligibility.value?.reason === 'authentication_required') {
      router.push(`/register/quizee?next=/quizee/tournaments/${route.params.id}`);
      return;
    }

    if (fee > 0) {
      const qs: Record<string, string> = { type: 'tournament', id: String(route.params.id) };
      if (fee) qs['amount'] = String(fee);
      router.push({ path: '/quizee/payments/checkout', query: qs });
      return;
    }

    if (openToSubscribers && !eligibility.value?.can_join) {
      const qs: Record<string, string> = { type: 'subscription', next: `/quizee/tournaments/${route.params.id}` };
      router.push({ path: '/quizee/payments/checkout', query: qs });
      return;
    }

    loading.value = true;
    const res = await api.postJson(`/api/tournaments/${route.params.id}/join`, {});
    if (await api.handleAuthStatus(res)) return;

    if (res.ok) {
      isRegistered.value = true;
      await fetchTournament();
      return;
    }

    let body = null;
    try { body = await res.json(); } catch (e) { body = null }

    if (res.status === 403 && body && body.code === 'limit_reached') {
      const qs = new URLSearchParams({ reason: 'limit', type: body.limit?.type || 'unknown', value: String(body.limit?.value || '') });
      router.push('/quizee/subscription?' + qs.toString());
      return;
    }
  } catch (error) {
    console.error('Error registering for tournament:', error);
  } finally {
    loading.value = false;
  }
};

const viewBattles = () => {
  router.push(`/quizee/tournaments/${tournament.value?.id}/battles`);
};

const startQualifier = async () => {
  const id = tournament.value?.id ?? route.params.id
  await router.replace({ path: `/quizee/tournaments/${id}`, query: {} })
  router.push(`/quizee/tournaments/${id}/qualify`)
}

const clearRegisteredQuery = async () => {
  const id = tournament.value?.id ?? route.params.id
  await router.replace({ path: `/quizee/tournaments/${id}`, query: {} })
}

function heroPrimaryClick() {
  if (heroPrimaryDisabled.value) return
  if (!isRegistered.value) {
    return registerForTournament()
  }
  if (tournament.value && tournament.value.status === 'upcoming' && !userHasQualified.value && !currentBattle.value) {
    return router.push(`/quizee/tournaments/${tournament.value.id}/qualify`)
  }
  return viewBattles()
}

// Helpers
const formatDate = (date?: string | null) => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch (e) {
    return String(date);
  }
};

const stripHtml = (html?: string | null) => {
  if (!html) return "";
  try {
    let s = String(html);
    s = s.replace(/<(br|\/?p|\/li|li|\/div|div|\/h[1-6])\s*\/?>/gi, "\n");
    s = s.replace(/<[^>]*>/g, "");
    s = s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ");
    s = s.replace(/\n{2,}/g, "\n\n");
    return s.trim();
  } catch (e) {
    return String(html);
  }
};

const formatPrizeKES = (amount: number) => {
  const n = Number(amount) || 0;
  const formatted = new Intl.NumberFormat('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);
  return `Ksh ${formatted}`;
};



function statusColor(status: string) {
   switch(status) {
      case 'live': case 'active': return 'bg-green-500'
      case 'upcoming': return 'bg-blue-500'
      case 'completed': return 'bg-gray-500'
      default: return 'bg-yellow-500'
   }
}

onMounted(async () => {
  // Run initial fetch and admin info in parallel
  await Promise.all([
    fetchTournament(),
    fetchAdminRoundInfo()
  ]);
  
  const reg = registeredQuery.value
  if (reg === '1') {
    isRegistered.value = true
    registrationStatus.value = 'approved'
  } else if (reg === 'pending') {
    registrationStatus.value = 'pending'
  }
});
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>