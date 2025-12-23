<template>
  <section class="py-12 md:py-16 bg-gradient-to-br from-red-50 to-orange-50">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <!-- Left Side: Benefits Content -->
        <div>
          <span class="inline-block py-1.5 px-4 rounded-full bg-[#800020]/10 text-[#800020] text-sm font-bold tracking-wide uppercase mb-6">
            Compete & Win
          </span>
          <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
            Join Tournaments and Test Your Skills
          </h2>
          <p class="text-lg text-slate-600 mb-8 leading-relaxed">
            Challenge yourself against other learners, climb leaderboards, earn badges, and win prizes. Make learning exciting and competitive.
          </p>

          <ul class="space-y-5">
            <li v-for="(benefit, i) in tournamentBenefits" :key="i" class="flex gap-4 items-start">
              <div class="flex-shrink-0 w-8 h-8 rounded-full bg-[#800020]/10 text-[#800020] flex items-center justify-center mt-1 font-bold text-sm">
                ✓
              </div>
              <div>
                <h4 class="text-base font-bold text-slate-900">{{ benefit.title }}</h4>
                <p class="text-slate-600 mt-1 text-sm">{{ benefit.desc }}</p>
              </div>
            </li>
          </ul>

          <div class="mt-8">
            <NuxtLink to="/tournaments" class="inline-flex items-center gap-2 text-[#800020] font-bold hover:gap-3 transition-all text-lg">
              <span>Explore All Tournaments</span>
              <Icon name="heroicons:arrow-right" class="w-5 h-5" />
            </NuxtLink>
          </div>
        </div>

        <!-- Right Side: Tournaments Carousel -->
        <div>
          <div v-if="loading" class="flex justify-center items-center h-80">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>

          <!-- Single Card View (1 tournament) -->
          <div v-else-if="tournaments.length === 1" class="space-y-4">
            <TournamentCard 
              v-for="tournament in tournaments"
              :key="tournament.id"
              :tournament="tournament"
              class="h-full"
            />
          </div>

          <!-- Two Cards View (2 tournaments, no carousel) -->
          <div v-else-if="tournaments.length === 2" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TournamentCard 
              v-for="tournament in tournaments"
              :key="tournament.id"
              :tournament="tournament"
              class="h-full"
            />
          </div>

          <!-- Carousel View (3+ tournaments) -->
          <div v-else class="relative">
            <div class="overflow-x-auto scrollbar-hide">
              <div class="flex gap-4 pb-4 snap-x snap-mandatory">
                <div 
                  v-for="tournament in tournaments"
                  :key="tournament.id"
                  class="flex-none w-full sm:w-1/2 snap-center"
                >
                  <TournamentCard :tournament="tournament" class="h-full" />
                </div>
              </div>
            </div>
            
            <!-- Carousel Controls (optional) -->
            <div class="mt-4 flex justify-center gap-2">
              <button 
                v-for="(_, i) in tournaments"
                :key="i"
                @click="currentSlide = i"
                class="w-2 h-2 rounded-full transition-all"
                :class="currentSlide === i ? 'bg-[#800020] w-6' : 'bg-[#800020]/20 hover:bg-[#800020]/40'"
              />
            </div>
          </div>

          <p v-if="tournaments.length === 0" class="text-center text-slate-500 py-8">
            No tournaments available right now.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import useApi from '~/composables/useApi'
import TournamentCard from '~/components/TournamentCard.vue'

const api = useApi()
const tournaments = ref([])
const loading = ref(false)
const currentSlide = ref(0)

const tournamentBenefits = [
  {
    title: 'Real Competition',
    desc: 'Battle with peers and measure your knowledge against others in real-time challenges.'
  },
  {
    title: 'Leaderboards',
    desc: 'Climb the ranks and see where you stand among thousands of learners.'
  },
  {
    title: 'Earn Rewards',
    desc: 'Win badges, certificates, and exclusive prizes for your achievements.'
  },
  {
    title: 'Skill Development',
    desc: 'Push your limits with curated challenges from different subjects and difficulty levels.'
  }
]

onMounted(async () => {
  loading.value = true
  try {
    const res = await api.get('/api/tournaments?limit=4')
    if (res.ok) {
      const data = await res.json()
      tournaments.value = data.data || data.tournaments || []
    }
  } catch (e) {
    console.error('Failed to fetch tournaments:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
