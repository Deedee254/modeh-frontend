<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h1 class="text-2xl font-bold mb-4">Create Battle</h1>
        <p class="text-gray-600 mb-6">Create a custom battle and invite others to join.</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Topic</label>
            <input v-model="filters.topic" placeholder="e.g. history, math" class="w-full border border-gray-300 rounded-lg px-4 py-3" />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
            <select v-model="filters.difficulty" class="w-full border border-gray-300 rounded-lg px-4 py-3">
              <option value="">Any Level</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Questions</label>
            <select v-model.number="filters.count" class="w-full border border-gray-300 rounded-lg px-4 py-3">
              <option :value="5">5 Questions</option>
              <option :value="10">10 Questions</option>
              <option :value="15">15 Questions</option>
              <option :value="20">20 Questions</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Grade Level</label>
            <select v-model="filters.grade" class="w-full border border-gray-300 rounded-lg px-4 py-3">
              <option value="">Any Grade</option>
              <option value="1">Grade 1</option>
              <option value="2">Grade 2</option>
              <option value="3">Grade 3</option>
              <option value="4">Grade 4</option>
              <option value="5">Grade 5</option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <button @click="createFilteredBattle" :disabled="attaching" class="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50">
            <span v-if="attaching">Creating...</span>
            <span v-else>Create Battle</span>
          </button>

          <NuxtLink to="/student/battles" class="text-sm text-gray-600 underline">Back to Battles</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRuntimeConfig } from '#imports'
import { useAuthStore } from '~/stores/auth'
import { useAppAlert } from '~/composables/useAppAlert'

const router = useRouter()
const cfg = useRuntimeConfig()
const auth = useAuthStore()
const { push } = useAppAlert()

// Use student layout so student sidebar/topbar are shown
definePageMeta({ layout: 'student' })
useHead({ title: 'Create Battle — Modeh', meta: [{ name: 'description', content: 'Create a custom quiz battle on Modeh' }] })

const defaultRedirect = '/student/battles'
const filters = ref({ topic: '', difficulty: '', grade: '', count: 10 })
const attaching = ref(false)
const createBattleUrl = computed(() => `${cfg.public.apiBase}/api/battles`)

function ensureAuthRedirect(redirectTo: string = defaultRedirect) {
  if (!auth.user) {
    router.push({
      path: '/login',
      query: { next: redirectTo }
    })
    return false
  }
  return true
}

async function createFilteredBattle() {
  try {
    if (!ensureAuthRedirect(defaultRedirect)) return
    attaching.value = true
    const payload = {
      name: `Custom battle - ${filters.value.topic || 'custom'}`,
      settings: {
        topic: filters.value.topic,
        difficulty: filters.value.difficulty,
        grade: filters.value.grade,
        per_page: Number(filters.value.count || 10),
        for_battle: 1,
        random: 1
      },
      attach_questions: true
    }

    const response = await fetch(createBattleUrl.value, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) throw new Error('Failed to create battle')

  const body = await response.json()
  const battleId = body?.uuid ?? body?.id ?? body?.data?.id

  if (!battleId) throw new Error('Server did not return a battle id')

  await router.push(`/student/battles/${battleId}`)
  } catch (error) {
    console.error(error)
    push({
      type: 'error',
      title: 'Unable to create battle',
      message: 'Please try again or contact support if the issue persists.'
    })
    attaching.value = false
  }
}
</script>