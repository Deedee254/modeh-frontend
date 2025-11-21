<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
definePageMeta({ layout: 'institution' })
import { ref } from 'vue';
import { useApi } from '~/composables/useApi'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import ErrorAlert from '~/components/ui/ErrorAlert.vue'

const api = useApi()
const route = useRoute();
const router = useRouter();
const institutionId = ref(route.query.institutionSlug || null);

const institution = ref(null as any)
const loading = ref(false)
const error = ref(null as any)
const quizeesCount = ref<number | null>(null)
const quizMastersCount = ref<number | null>(null)

async function load() {
  if (!institutionId.value) return
  loading.value = true
  error.value = null
  try {
    const resp = await api.get(`/api/institutions/${institutionId.value}`)
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    institution.value = json
    // fetch simple analytics: counts for quizees and quiz-masters
    try {
      const q1 = await api.get(`/api/institutions/${institutionId.value}/members?role=quizee&per_page=1`)
      const j1 = await api.parseResponse(q1)
      quizeesCount.value = j1?.meta?.total ?? null
    } catch (e) { quizeesCount.value = null }
    try {
      const q2 = await api.get(`/api/institutions/${institutionId.value}/members?role=quiz-master&per_page=1`)
      const j2 = await api.parseResponse(q2)
      quizMastersCount.value = j2?.meta?.total ?? null
    } catch (e) { quizMastersCount.value = null }
  } catch (e: any) {
    error.value = e
  } finally {
    loading.value = false
  }
}

function goto(path: string) {
  const slug = institutionId.value
  if (slug) {
    if (path === '/institution-manager/quizees') {
      router.push({ path: `/institution-manager/institutions/${slug}/quizees` })
      return
    }
    if (path === '/institution-manager/quiz-masters') {
      router.push({ path: `/institution-manager/institutions/${slug}/quiz-masters` })
      return
    }
    if (path === '/institution-manager/subscriptions') {
      router.push({ path: '/institution-manager/subscriptions', query: { institutionSlug: slug } })
      return
    }
    // default: push path with slug as query
    router.push({ path, query: { institutionSlug: slug } })
    return
  }
  router.push({ path })
}

if (institutionId.value) await load()
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-4">Institution Dashboard</h1>

    <div v-if="!institutionId" class="p-4 bg-yellow-50 border rounded">
      <p class="text-sm">No institution selected. Add ?institutionSlug=SLUG to the URL or switch your active institution in the UI.</p>
    </div>

    <div v-else>
  <div v-if="loading" class="text-gray-500"><LoadingSpinner /></div>
  <div v-else-if="error"><ErrorAlert>Failed to load institution: {{ error.message || error }}</ErrorAlert></div>
      <div v-else class="space-y-4">
        <div class="border p-4 rounded">
          <h2 class="text-lg font-medium">{{ institution?.name }}</h2>
          <p class="text-sm text-gray-600">ID: {{ institution?.id }}</p>
          <p class="text-sm text-gray-600">Email: {{ institution?.email }}</p>
          <div class="mt-3 grid grid-cols-2 gap-4">
            <div class="p-3 bg-slate-50 rounded">
              <div class="text-xs text-slate-500">Quizees</div>
              <div class="text-2xl font-semibold">{{ quizeesCount ?? '—' }}</div>
            </div>
            <div class="p-3 bg-slate-50 rounded">
              <div class="text-xs text-slate-500">Quiz Masters</div>
              <div class="text-2xl font-semibold">{{ quizMastersCount ?? '—' }}</div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button class="p-4 bg-blue-600 text-white rounded" @click="goto('/institution-manager/subscriptions')">Subscriptions</button>
          <button class="p-4 bg-green-600 text-white rounded" @click="goto('/institution-manager/quizees')">Quizees</button>
          <button class="p-4 bg-indigo-600 text-white rounded" @click="goto('/institution-manager/quiz-masters')">Quiz Masters</button>
          <button class="p-4 bg-yellow-600 text-white rounded" @click="goto('/institution-manager/invite')">Invite users</button>
          <button class="p-4 bg-amber-600 text-white rounded" @click="goto('/institution-manager/invite-history')">Invite history</button>
        </div>
      </div>
    </div>

  </div>
</template>
