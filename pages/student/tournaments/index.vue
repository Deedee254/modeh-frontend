<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Tournaments</h1>
      <p class="text-gray-600">Compete with other students and win amazing rewards!</p>
    </div>

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

    <!-- Tournament list -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="tournament in filteredTournaments" 
        :key="tournament.id" 
        class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      >
        <div class="relative">
          <img 
            :src="tournament.banner || '/images/tournament-default.jpg'" 
            alt="Tournament banner"
            class="w-full h-48 object-cover"
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
              @click="router.push(`/student/tournaments/${tournament.id}`)"
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

// Use the `student` layout for tournament pages
// Nuxt provides `definePageMeta` in single-file components
// so page-level layout selection works during SSR/CSR
definePageMeta({ layout: 'student' })
import { useRouter } from 'vue-router'

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

const auth = useAuthStore()
const isAdmin = computed(() => {
  const u: any = auth.user
  return u?.role === 'admin' || u?.role === 'tutor'
})

const fetchTournaments = async () => {
  try {
    loading.value = true
    // Include credentials so Sanctum cookie-based auth (or similar) works from the frontend
    const response = await fetch('/api/tournaments', { credentials: 'include' })
    const data = await response.json()

    // Backend may return a paginator object (Laravel) where items are in `data`.
    // It may also return { tournaments: [...] } or an array directly. Handle all.
    const items = data?.data ?? data?.tournaments ?? data ?? []

    // Normalize to an array to avoid runtime errors when templates expect an array.
    tournaments.value = Array.isArray(items) ? (items as Tournament[]) : []
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
  fetchTournaments()
})
</script>