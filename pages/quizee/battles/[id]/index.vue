<template>
  <div class="min-h-screen py-8">
    <div class="max-w-3xl mx-auto px-4">
      <div class="bg-white rounded-xl shadow p-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-2xl font-semibold">Waiting Room</h2>
            <p class="text-sm text-gray-500">Waiting for players to join. Battle ID: {{ id }}</p>
          </div>
          <div>
            <span :class="statusClass" class="px-3 py-1 rounded-full text-sm font-medium">{{ battle.status || 'waiting' }}</span>
          </div>
        </div>

        <div class="mb-4">
          <h3 class="text-lg font-medium mb-2">Players</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-for="p in battle.players || []" :key="p.id" class="flex items-center gap-3 p-3 border rounded">
              <img v-if="p.avatar" :src="p.avatar" class="h-10 w-10 rounded-full object-cover" />
              <div>
                <div class="font-medium">{{ p.name }}</div>
                <div class="text-xs text-gray-500">{{ p.ready ? 'Ready' : 'Not ready' }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button v-if="isInitiator && battle.status !== 'in-progress'" @click="cancelBattle" class="px-4 py-2 bg-red-500 text-white rounded">Cancel Battle</button>
          <button v-else class="px-4 py-2 bg-gray-200 text-gray-700 rounded" @click="copyLink">Copy Invite Link</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useAppAlert } from '~/composables/useAppAlert'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const cfg = useRuntimeConfig()
const auth = useAuthStore()
const { push: showAlert } = useAppAlert()

const battle = ref({})
const polling = ref(false)
let intervalId = null

const isInitiator = computed(() => auth.user && battle.value.initiator_id === auth.user.id)

const statusClass = computed(() => {
  const s = battle.value.status
  if (s === 'waiting') return 'bg-yellow-100 text-yellow-800'
  if (s === 'in-progress') return 'bg-green-100 text-green-800'
  if (s === 'completed') return 'bg-gray-100 text-gray-800'
  return 'bg-blue-100 text-blue-800'
})

async function fetchBattle() {
  try {
    const res = await $fetch(`/api/battles/${id}`, { baseURL: cfg.public.apiBase, credentials: 'include' })
    battle.value = res || {}
    // If started, navigate to the battle play page
    if (battle.value.status === 'in-progress') {
      router.push(`/quizee/battles/${id}/play`)
    }
  } catch (e) {
    console.error('Failed to fetch battle', e)
  }
}

async function startPolling() {
  if (polling.value) return
  polling.value = true
  await fetchBattle()
  intervalId = setInterval(fetchBattle, 3000)
}

function stopPolling() {
  polling.value = false
  if (intervalId) clearInterval(intervalId)
}

async function cancelBattle() {
  try {
    await $fetch(`/api/battles/${id}`, { method: 'DELETE', baseURL: cfg.public.apiBase, credentials: 'include' })
    showAlert({ type: 'success', message: 'Battle cancelled' })
    router.push('/quizee/battles')
  } catch (e) {
    showAlert({ type: 'error', message: 'Failed to cancel battle' })
  }
}

function copyLink() {
  const url = `${window.location.origin}/quizee/battles/${id}`
  navigator.clipboard.writeText(url)
  showAlert({ type: 'success', message: 'Invite link copied to clipboard' })
}

onMounted(() => startPolling())
onUnmounted(() => stopPolling())
</script>
