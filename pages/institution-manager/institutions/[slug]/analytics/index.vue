<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-4">Institution Analytics</h1>

    <div v-if="!slug" class="p-4 bg-yellow-50 border rounded">
      <p class="text-sm">No institution selected. Select an institution to view analytics.</p>
    </div>

    <div v-else>
      <div v-if="loading" class="text-gray-500">Loading…</div>
      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 bg-white rounded shadow">
            <div class="text-sm text-slate-500">Quizees</div>
            <div class="text-3xl font-bold">{{ quizeesCount ?? '—' }}</div>
          </div>
          <div class="p-4 bg-white rounded shadow">
            <div class="text-sm text-slate-500">Quiz Masters</div>
            <div class="text-3xl font-bold">{{ quizMastersCount ?? '—' }}</div>
          </div>
          <div class="p-4 bg-white rounded shadow">
            <div class="text-sm text-slate-500">Active Subscriptions</div>
            <div class="text-3xl font-bold">{{ subscriptionsCount ?? '—' }}</div>
          </div>
        </div>

        <div class="mt-6">
          <h2 class="text-lg font-medium">Notes</h2>
          <p class="text-sm text-slate-600">This page shows basic counts derived from member/subscription endpoints. For richer analytics, add dedicated API endpoints that aggregate activity and usage over time.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '~/composables/useApi'

const route = useRoute()
const slug = (route.params.slug) ? String(route.params.slug) : null
const api = useApi()
const loading = ref(false)
const quizeesCount = ref<number | null>(null)
const quizMastersCount = ref<number | null>(null)
const subscriptionsCount = ref<number | null>(null)

async function load() {
  if (!slug) return
  loading.value = true
  try {
    try {
      const r = await api.get(`/api/institutions/${slug}/members?role=quizee&per_page=1`)
      const j = await api.parseResponse(r)
      quizeesCount.value = j?.meta?.total ?? null
    } catch (e) { quizeesCount.value = null }

    try {
      const r = await api.get(`/api/institutions/${slug}/members?role=quiz-master&per_page=1`)
      const j = await api.parseResponse(r)
      quizMastersCount.value = j?.meta?.total ?? null
    } catch (e) { quizMastersCount.value = null }

    try {
      const r = await api.get(`/api/institutions/${slug}/subscription`)
      const j = await api.parseResponse(r)
      // subscription endpoint returns active subscription object; if null, count is 0
      subscriptionsCount.value = j?.subscription ? 1 : 0
    } catch (e) { subscriptionsCount.value = null }
  } finally { loading.value = false }
}

await load()
</script>
