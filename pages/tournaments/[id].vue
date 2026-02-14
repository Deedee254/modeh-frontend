<template>
  <div class="bg-gray-50 min-h-screen pb-12">
    <div v-if="loading" class="flex justify-center items-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>

    <template v-else-if="tournament">
      <!-- Hero Section -->
      <PageHero
        :title="tournament.name"
        :description="tournament.description?.replace(/<[^>]*>/g, '').substring(0, 150) + '...'"
        :image="tournament.banner"
        variant="image"
        class="mb-0"
      >
        <template #eyebrow>
          <span class="flex items-center gap-2">
            <span class="relative flex h-2 w-2">
              <span v-if="tournament.status === 'live'" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span :class="statusColor(tournament.status)" class="relative inline-flex rounded-full h-2 w-2"></span>
            </span>
            {{ tournament.status?.toUpperCase() || 'TOURNAMENT' }}
          </span>
        </template>

        <template #highlight>
          <div>
            <p class="text-xs uppercase tracking-wide text-white/60">Prize Pool</p>
            <p class="mt-1 text-3xl font-bold text-white">{{ formatCurrency(tournament.prize_pool) }}</p>
          </div>
        </template>

        <template #highlight-icon>
           <span class="text-2xl">🏆</span>
        </template>

        <template #stats>
           <div class="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/10">
              <p class="text-xs text-white/60 uppercase">Entry Fee</p>
              <p class="font-semibold text-white">{{ Number(tournament.entry_fee) > 0 ? formatCurrency(tournament.entry_fee) : 'Free' }}</p>
           </div>
           <div class="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/10">
              <p class="text-xs text-white/60 uppercase">Start Date</p>
              <p class="font-semibold text-white">{{ formatDate(tournament.start_date) }}</p>
           </div>
        </template>

        <template #actions>
           <div class="flex flex-wrap gap-4">
              <template v-if="isLoggedIn">
                <UButton
                  size="lg"
                  color="primary"
                  class="min-w-[160px] shadow-lg shadow-primary/25"
                  @click="goToRolePage"
                >
                  Enter Tournament
                </UButton>
              </template>
              <template v-else>
                <UButton
                  size="lg"
                  color="primary"
                  class="min-w-[160px] shadow-lg shadow-primary/25"
                  @click="showLoginModal = true"
                >
                  Login to Join
                </UButton>
              </template>
              <AffiliateShareButton
                itemType="Tournament"
                :itemId="tournament.id"
                :baseUrl="baseUrl"
                btnClass="inline-flex items-center justify-center px-6 py-3 border border-white/20 shadow-sm text-base font-medium rounded-lg text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
              />
           </div>
        </template>
      </PageHero>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Column: Details -->
          <div class="lg:col-span-2 space-y-8">
            
            <!-- About Card -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span class="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </span>
                About this Tournament
              </h2>
              <div class="prose prose-blue max-w-none text-gray-600" v-html="tournament.description"></div>
            </div>

            <!-- Rules Card -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span class="p-2 bg-red-50 text-red-600 rounded-lg">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </span>
                Rules & Regulations
              </h2>
              <div class="space-y-3">
                 <div v-if="parsedRules.length" class="space-y-2">
                    <div v-for="(rule, idx) in parsedRules" :key="idx" class="flex items-start gap-3 text-gray-600">
                       <span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                       <span>{{ rule }}</span>
                    </div>
                 </div>
                 <p v-else class="text-gray-500 italic">No specific rules listed.</p>
              </div>
            </div>

            <!-- Format Card -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
               <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span class="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                </span>
                Tournament Format
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div class="bg-gray-50 rounded-xl p-4">
                    <h3 class="font-semibold text-gray-900 mb-2">Qualifier Round</h3>
                    <ul class="space-y-2 text-sm text-gray-600">
                       <li class="flex justify-between">
                          <span>Questions</span>
                          <span class="font-medium">{{ tournament.qualifier_question_count }}</span>
                       </li>
                       <li class="flex justify-between">
                          <span>Time per Question</span>
                          <span class="font-medium">{{ tournament.qualifier_per_question_seconds }}s</span>
                       </li>
                       <li class="flex justify-between">
                          <span>Duration</span>
                          <span class="font-medium">{{ tournament.qualifier_days }} Days</span>
                       </li>
                    </ul>
                 </div>
                 <div class="bg-gray-50 rounded-xl p-4">
                    <h3 class="font-semibold text-gray-900 mb-2">Battle Rounds</h3>
                    <ul class="space-y-2 text-sm text-gray-600">
                       <li class="flex justify-between">
                          <span>Questions</span>
                          <span class="font-medium">{{ tournament.battle_question_count }}</span>
                       </li>
                       <li class="flex justify-between">
                          <span>Time per Question</span>
                          <span class="font-medium">{{ tournament.battle_per_question_seconds }}s</span>
                       </li>
                       <li class="flex justify-between">
                          <span>Bracket Size</span>
                          <span class="font-medium">{{ tournament.bracket_slots }} Slots</span>
                       </li>
                    </ul>
                 </div>
              </div>
            </div>

          </div>

          <!-- Right Column: Sidebar -->
          <div class="space-y-6">
            
            <!-- Sponsor Card -->
            <div v-if="tournament.sponsor_details" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <div class="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4">
                  <h3 class="text-white font-semibold flex items-center gap-2">
                     <span class="text-yellow-400">★</span> Sponsored By
                  </h3>
               </div>
               <div class="p-6">
                  <div v-if="tournament.sponsor_banner" class="mb-4 rounded-lg overflow-hidden">
                     <img :src="tournament.sponsor_banner" alt="Sponsor" class="w-full h-auto object-cover" />
                  </div>
                  <p class="text-gray-600 italic">"{{ tournament.sponsor_details.message }}"</p>
               </div>
            </div>

            <!-- Info Card -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
               <h3 class="font-bold text-gray-900 mb-4">Tournament Details</h3>
               <div class="space-y-4">
                  <div class="flex items-center gap-3">
                     <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                     </div>
                     <div>
                        <p class="text-xs text-gray-500 uppercase">Subject</p>
                        <p class="font-medium text-gray-900">{{ tournament.subject?.name || 'General' }}</p>
                     </div>
                  </div>

                  <div class="flex items-center gap-3">
                     <div class="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                     </div>
                     <div>
                        <p class="text-xs text-gray-500 uppercase">Topic</p>
                        <p class="font-medium text-gray-900">{{ tournament.topic?.name || 'All Topics' }}</p>
                     </div>
                  </div>

                  <div class="flex items-center gap-3">
                     <div class="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                     </div>
                     <div>
                        <p class="text-xs text-gray-500 uppercase">Grade / Level</p>
                        <p class="font-medium text-gray-900">{{ tournament.grade?.name || tournament.level?.name || 'All Levels' }}</p>
                     </div>
                  </div>
               </div>
            </div>

            <!-- Timeline Card -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
               <h3 class="font-bold text-gray-900 mb-4">Timeline</h3>
               <div class="relative pl-4 border-l-2 border-gray-100 space-y-6">
                  <div class="relative">
                     <span class="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-green-500 ring-4 ring-white"></span>
                     <p class="text-xs text-gray-500 uppercase">Starts</p>
                     <p class="font-medium text-gray-900">{{ formatDate(tournament.start_date, 'PPp') }}</p>
                  </div>
                  <div class="relative">
                     <span class="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-red-500 ring-4 ring-white"></span>
                     <p class="text-xs text-gray-500 uppercase">Ends</p>
                     <p class="font-medium text-gray-900">{{ formatDate(tournament.end_date, 'PPp') }}</p>
                  </div>
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
       <UButton to="/quizzes" class="mt-6" color="primary" variant="soft">Browse Quizzes</UButton>
    </div>

    <UModal v-model="showLoginModal" :ui="{ width: 'sm:max-w-md' }">
      <div class="p-4">
        <LoginForm :compact="true" :suppressRedirect="true" @success="onLoginSuccess" />
      </div>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import useApi from '~/composables/useApi'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useAppAlert } from '~/composables/useAppAlert'
import PageHero from '~/components/ui/PageHero.vue'
import UModal from '~/components/ui/UModal.vue'
import LoginForm from '~/components/Auth/LoginForm.vue'
import AffiliateShareButton from '~/components/AffiliateShareButton.vue'
import useSeo from '~/composables/useSeo'
import { format } from 'date-fns'

import { useTournamentStore } from '~/stores/tournamentStore'

const route = useRoute()
const router = useRouter()
const api = useApi()
const auth = useAuthStore()
const tournamentStore = useTournamentStore()
const alert = useAppAlert()
const isLoggedIn = computed(() => !!auth.user && !!auth.user.id)
const config = useRuntimeConfig()

const loading = computed(() => tournamentStore.loading)
const tournament = computed(() => tournamentStore.currentTournament)
const showLoginModal = ref(false)

const baseUrl = computed(() => {
  const base = (typeof config.public?.baseUrl === 'string' ? config.public.baseUrl : undefined) || ''
  if (!base) return ''
  return base.endsWith('/') ? `${base}tournaments` : `${base}/tournaments`
})

const parsedRules = computed(() => {
   if (!tournament.value?.rules) return []
   try {
      return typeof tournament.value.rules === 'string' 
         ? JSON.parse(tournament.value.rules) 
         : tournament.value.rules
   } catch (e) {
      return [tournament.value.rules]
   }
})

const fetchTournament = async () => {
  await tournamentStore.fetchTournament(route.params.id)
  
  // SEO Setup (non-blocking - runs in background)
  if (tournament.value) {
    Promise.resolve().then(() => {
      try {
        const seo = useSeo()
        if (tournament.value && tournament.value.id) {
          seo.setupPageSeo(
            {
              id: tournament.value.id,
              name: tournament.value.name || 'Tournament',
              slug: tournament.value.slug || String(tournament.value.id),
              description: tournament.value.description || '',
              image: tournament.value.banner || undefined,
              start_date: tournament.value.start_date || tournament.value.created_at || undefined
            },
            'tournament',
            config.public.baseUrl
          )
        }
      } catch (e) {}
    })
  }
}

function goToRolePage() {
  const role = auth.user?.role
  if (role === 'quizee') return router.push(`/quizee/tournaments/${route.params.id}`)
  if (role === 'quiz-master') return router.push(`/quiz-master/tournaments/${route.params.id}`)
  return router.push(`/quizee/tournaments/${route.params.id}`)
}

function onLoginSuccess(user) {
  showLoginModal.value = false
  const role = user?.role || auth.user?.role
  if (role === 'quiz-master') router.push(`/quiz-master/tournaments/${route.params.id}`)
  else router.push(`/quizee/tournaments/${route.params.id}`)
}

function formatCurrency(amount) {
   return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount)
}

function formatDate(dateStr, formatStr = 'MMM d, yyyy') {
   if (!dateStr) return 'TBA'
   try {
      return format(new Date(dateStr), formatStr)
   } catch (e) {
      return dateStr
   }
}

function statusColor(status) {
   switch(status) {
      case 'live': return 'bg-green-500'
      case 'upcoming': return 'bg-blue-500'
      case 'completed': return 'bg-gray-500'
      default: return 'bg-yellow-500'
   }
}

onMounted(async () => {
  await fetchTournament()
  // Redirect logic if already logged in
  try {
    const role = auth.user?.role
    const path = String(window?.location?.pathname || '')
    if (auth.user && !path.startsWith('/quizee') && !path.startsWith('/quiz-master')) {
      if (role === 'quizee') router.replace(`/quizee/tournaments/${route.params.id}`)
      else if (role === 'quiz-master') router.replace(`/quiz-master/tournaments/${route.params.id}`)
    }
  } catch (e) {}
})
</script>

<style scoped>
/* Custom scrollbar for rules if needed */
.prose :deep(p) {
   margin-bottom: 0.75em;
}
</style>
