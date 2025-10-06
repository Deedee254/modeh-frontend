<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          <span class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Battle Arena</span>
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">Challenge your knowledge against opponents in epic quiz battles. Compete for glory and earn rewards!</p>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <!-- Quick Match Card -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Quick Match</h3>
            <p class="text-gray-600 mb-6">Jump into an instant battle with a random opponent. Fast-paced and exciting!</p>
            <NuxtLink to="/student/battles/create" class="inline-block w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 text-center">
              Start Quick Match
            </NuxtLink>
          </div>
        </div>

        <!-- Create Battle Card -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Create Battle</h3>
            <p class="text-gray-600 mb-6">Design your own battle with custom settings. Challenge friends or classmates!</p>
            <NuxtLink to="/student/battles/create" class="inline-block w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 text-center">
              Create Battle
            </NuxtLink>
          </div>
        </div>

        <!-- Tournament Card -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Tournaments</h3>
            <p class="text-gray-600 mb-6">Join competitive tournaments and climb the leaderboards for ultimate glory!</p>
            <NuxtLink to="/student/tournaments" class="inline-block w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 text-center">
              Explore Tournaments
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Active Battles Section -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Active Battles</h2>
            <p class="text-gray-600">Jump into ongoing battles and prove your worth!</p>
          </div>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="flex items-center gap-3 text-gray-500">
            <svg class="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading battles...</span>
          </div>
        </div>

        <div v-else-if="!battles || battles.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No Active Battles</h3>
          <p class="text-gray-600">Be the first to create a battle and start the competition!</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="b in battles" :key="b.id" class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="font-bold text-gray-900 text-lg mb-1">{{ b.name || 'Epic Battle' }}</h3>
                <div class="flex items-center gap-4 text-sm text-gray-600">
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                    </svg>
                    {{ b.players?.length || 1 }} players
                  </span>
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Live
                  </span>
                </div>
              </div>
              <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>

            <p class="text-gray-600 text-sm mb-4">Join this intense battle and showcase your knowledge!</p>

            <button @click="() => joinBattle(b.id)" class="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 text-center block">
              Join Battle
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// Page meta — use student layout so student sidebar/topbar are shown when authenticated
definePageMeta({ layout: 'student' })
useHead({
  title: 'Battle Arena — Modeh',
  meta: [
    { name: 'description', content: 'Challenge your knowledge in fast-paced quiz battles. Create custom battles or jump into quick matches.' },
    { property: 'og:title', content: 'Battle Arena — Modeh' },
    { property: 'og:description', content: 'Challenge your knowledge in fast-paced quiz battles. Create custom battles or jump into quick matches.' }
  ]
})
const battles = ref([])
const loading = ref(true)

const cfg = useRuntimeConfig()

onMounted(async () => {
  try {
    const res = await fetch(cfg.public.apiBase + '/api/battles', { credentials: 'include' })
    if (res.ok) {
      const j = await res.json()
      battles.value = j.battles || j || []
    }
  } catch (e) {}
  loading.value = false
})

const auth = useAuthStore()

function ensureAuthRedirect(redirectTo) {
  if (!auth.user) {
    // preserve intended target so user can be redirected after login
    window.location.href = `/login?next=${encodeURIComponent(redirectTo || window.location.pathname)}`
    return false
  }
  return true
}

function joinBattle(id) {
  if (!ensureAuthRedirect(`/student/battles/${id}`)) return
  // Attempt to join the battle via API so backend can assign opponent and broadcast
  try {
    fetch(cfg.public.apiBase + `/api/battles/${id}/join`, { method: 'POST', credentials: 'include' }).catch(() => {})
  } catch (e) {}
  window.location.href = `/student/battles/${id}`
}
</script>
