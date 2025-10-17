<template>
  <div class="p-6">
    <PageHero title="Tournaments" description="Compete with other quizees and win amazing rewards!" variant="gradient" padding="py-6">
      <template #stats>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-3 text-white text-center">
          <p class="text-xs uppercase tracking-wide text-white/70">Total</p>
          <p class="mt-2 text-xl font-semibold">{{ meta.total ?? 0 }}</p>
        </div>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-3 text-white text-center">
          <p class="text-xs uppercase tracking-wide text-white/70">Pages</p>
          <p class="mt-2 text-xl font-semibold">{{ meta.last_page ?? 1 }}</p>
        </div>
      </template>
    </PageHero>

    <!-- Tournament filters -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex gap-4">
        <button 
          v-for="status in ['All', 'Upcoming', 'Ongoing', 'Completed']" 
          :key="status"
          @click="filter = status.toLowerCase()"
          :class="[
            'px-4 py-2 rounded-lg font-medium',
            filter === status.toLowerCase()
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ status }}
        </button>
      </div>
      
      <button 
        v-if="isAdmin"
        @click="router.push('/admin/tournaments/create')"
        class="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-dark"
      >
        Create Tournament
      </button>
    </div>
    <!-- Pagination -->
    <div class="mt-6 flex items-center justify-center">
      <nav class="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
        <button @click="goToPage(page - 1)" :disabled="page <= 1" class="px-3 py-2 bg-white border text-sm rounded-l-md disabled:opacity-50">Prev</button>
        <button v-for="p in Math.max(1, meta.last_page)" :key="p" @click="goToPage(p)" :class="['px-3 py-2 border text-sm', p === page ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700']">{{ p }}</button>
        <button @click="goToPage(page + 1)" :disabled="page >= meta.last_page" class="px-3 py-2 bg-white border text-sm rounded-r-md disabled:opacity-50">Next</button>
      </nav>
    </div>

    <!-- Tournament list -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
      <div 
        v-for="tournament in filteredTournaments" 
        :key="tournament.id" 
        class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      >
        <div class="relative">
          <img 
            :src="tournament.banner || '/images/tournament-default.jpg'" 
            alt="Tournament banner"
            class="w-full h-36 sm:h-48 object-cover"
          >
          <div 
            :class="[
              'absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium',
              tournament.status === 'upcoming' ? 'bg-blue-500 text-white' :
              tournament.status === 'ongoing' ? 'bg-green-500 text-white' :
              'bg-gray-500 text-white'
            ]"
          >
            {{ tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1) }}
          </div>
        </div>

        <div class="p-6">
          <h3 class="text-xl font-bold mb-2">{{ tournament.name }}</h3>
          <p class="text-gray-600 mb-4 line-clamp-2">{{ tournament.description }}</p>
          
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <Icon name="mdi:calendar" class="text-gray-500" />
              <span class="text-sm text-gray-600">{{ formatDate(tournament.start_date) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="mdi:account-group" class="text-gray-500" />
              <span class="text-sm text-gray-600">{{ tournament.participants_count }} participants</span>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Icon name="mdi:trophy" class="text-yellow-500" />
              <span class="font-medium">{{ formatPrize(tournament.prize_pool) }}</span>
            </div>
            <button 
              @click="router.push(`/quizee/tournaments/${tournament.id}`)"
              class="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

// Use the `quizee` layout for tournament pages
definePageMeta({ layout: 'quizee' })
import { useRouter } from 'vue-router'
import PageHero from '~/components/ui/PageHero.vue'

interface Tournament {
  id: number
  banner?: string
  status: 'upcoming' | 'ongoing' | 'completed'
  name: string
  description: string
  start_date: string
  participants_count: number
  prize_pool: number
}

const tournaments = ref<Tournament[]>([])
const loading = ref(false)
const filter = ref('all')
const router = useRouter()
const page = ref(1)
const meta = ref({ current_page: 1, last_page: 1, total: 0, per_page: 20 })

const auth = useAuthStore()
const isAdmin = computed(() => {
  const u: any = auth.user
  return u?.role === 'admin' || u?.role === 'quiz-master'
})

const config = useRuntimeConfig()

const fetchTournaments = async (p = 1) => {
  try {
    loading.value = true
    // Include credentials so Sanctum cookie-based auth (or similar) works from the frontend
    const res: any = await $fetch(config.public.apiBase + `/api/tournaments?page=${p}`, { credentials: 'include' })

    // Handle multiple response shapes:
    // - Laravel paginator: { current_page, data: [...], last_page, total, per_page }
    // - Wrapper: { data: { data: [...] } }
    // - Simple array: [...]

    let items: any[] = []
    if (res && typeof res === 'object' && Array.isArray(res.data)) {
      // Laravel-style paginator or wrapper where res.data is array
      items = res.data
      meta.value = {
        current_page: res.current_page ?? 1,
        last_page: res.last_page ?? 1,
        total: res.total ?? (Array.isArray(res.data) ? res.data.length : 0),
        per_page: res.per_page ?? 20,
      }
    } else if (res && typeof res === 'object' && res.data && Array.isArray(res.data.data)) {
      // wrapper containing paginator under data
      items = res.data.data
      const pageObj = res.data
      meta.value = {
        current_page: pageObj.current_page ?? 1,
        last_page: pageObj.last_page ?? 1,
        total: pageObj.total ?? (Array.isArray(pageObj.data) ? pageObj.data.length : 0),
        per_page: pageObj.per_page ?? 20,
      }
    } else if (Array.isArray(res)) {
      items = res
      meta.value = { current_page: p, last_page: 1, total: res.length, per_page: res.length }
    } else if (res && typeof res === 'object' && Array.isArray(res.tournaments)) {
      items = res.tournaments
      meta.value = { current_page: p, last_page: 1, total: items.length, per_page: items.length }
    } else {
      items = []
      meta.value = { current_page: 1, last_page: 1, total: 0, per_page: 20 }
    }

    tournaments.value = Array.isArray(items) ? (items as Tournament[]) : []
    page.value = meta.value.current_page ?? p
  } catch (error) {
    console.error('Error fetching tournaments:', error)
  } finally {
    loading.value = false
  }
}

// Filter tournaments based on status
const filteredTournaments = computed(() => {
  const list = Array.isArray(tournaments.value) ? tournaments.value : []
  if (filter.value === 'all') return list
  return list.filter((t: Tournament) => t.status === filter.value)
})

// Format date helper
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Format prize helper
const formatPrize = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Fetch tournaments on component mount
onMounted(() => {
  fetchTournaments(page.value)
})

function goToPage(p: number) {
  if (!p || p < 1 || p === page.value) return
  fetchTournaments(p)
}
</script>