<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div v-if="loading" class="flex justify-center items-center min-h-[300px]">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>

      <div v-else-if="tournament" class="space-y-6">
        <div class="rounded-xl overflow-hidden shadow-sm">
          <img :src="tournament.banner || '/images/tournament-default.jpg'" class="w-full h-56 object-cover" />
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm">
          <h1 class="text-3xl font-bold mb-2">{{ tournament.name }}</h1>
          <p class="text-sm text-gray-600 mb-4">{{ tournament.description || 'Tournament details' }}</p>

          <div class="flex items-center gap-4">
            <template v-if="isLoggedIn">
              <button @click="goToRolePage" class="px-4 py-2 bg-primary text-white rounded-lg">Open in your dashboard</button>
            </template>
            <template v-else>
              <NuxtLink :to="`/register?next=/quizee/tournaments/${tournament.id}`" class="px-4 py-2 bg-primary text-white rounded-lg">Register / Login to participate</NuxtLink>
            </template>
            <NuxtLink :to="`/quizzes`" class="text-sm text-gray-600 hover:underline">Browse Quizzes</NuxtLink>
          </div>

          <!-- small actions menu (three-dot) -->
          <div class="absolute top-3 right-3">
            <ActionMenu>
              <template #trigger>
                <button @click.stop class="p-2 rounded-md hover:bg-gray-100">
                  <svg class="w-5 h-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6 10a2 2 0 110-4 2 2 0 010 4zm4 0a2 2 0 110-4 2 2 0 010 4zm4 0a2 2 0 110-4 2 2 0 010 4z"/></svg>
                </button>
              </template>

              <template #items="{ close }">
                <button @click="onShare(close)" class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Share</button>
              </template>
            </ActionMenu>
          </div>
        </div>
      </div>

      <div v-else class="text-gray-600">Tournament not found.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import useApi from '~/composables/useApi'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useAppAlert } from '~/composables/useAppAlert'
import ActionMenu from '~/components/ui/ActionMenu.vue'
import useSeo from '~/composables/useSeo'

const route = useRoute()
const router = useRouter()
const api = useApi()
const auth = useAuthStore()
const alert = useAppAlert()
const isLoggedIn = computed(() => !!auth.user && !!auth.user.id)

const loading = ref(true)
const tournament = ref(null)

const fetchTournament = async () => {
  loading.value = true
  try {
    const res = await api.get(`/api/tournaments/${route.params.id}`)
    if (res.ok) {
      const j = await res.json().catch(() => null)
      tournament.value = j?.tournament ?? j?.data ?? j
      try {
        const seo = useSeo()
        if (tournament.value && tournament.value.id) {
          seo.setupPageSeo(
            {
              id: tournament.value.id,
              name: tournament.value.name || 'Tournament',
              slug: tournament.value.slug || String(tournament.value.id),
              description: tournament.value.description || '' ,
              image: tournament.value.banner || undefined,
              start_date: tournament.value.start_date || tournament.value.created_at || undefined
            },
            'tournament',
            window.location.origin
          )
        }
      } catch (e) {}
    }
  } catch (e) {
    console.error('Failed to fetch tournament', e)
  } finally {
    loading.value = false
  }
}

function goToRolePage() {
  const role = auth.user?.role
  if (role === 'quizee') return router.push(`/quizee/tournaments/${route.params.id}`)
  if (role === 'quiz-master') return router.push(`/quiz-master/tournaments/${route.params.id}`)
  // fallback: open quizee page
  return router.push(`/quizee/tournaments/${route.params.id}`)
}

// Action handlers accept an optional close callback (provided by ActionMenu slot)
function onShare(close) { if (typeof close === 'function') close(); void navigator.clipboard?.writeText(window.location.href).then(()=> alert.push({ message: 'Link copied to clipboard', type: 'success' })) }

onMounted(async () => {
  await fetchTournament()
  // if logged-in and on public page, redirect to role-specific route to get role layout
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
.primary { color: var(--color-primary); }
</style>
