<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">Your Institutions</h1>
      <NuxtLink to="/institution-manager/institutions/new" class="px-3 py-2 bg-indigo-600 text-white rounded">Create Institution</NuxtLink>
    </div>

    <div v-if="loading" class="text-gray-500">Loading…</div>
    <div v-else>
      <div v-if="institutions.length === 0" class="p-4 bg-yellow-50 border rounded">You don't manage any institutions yet.</div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="inst in institutions" :key="inst.id" class="border rounded p-4">
          <div class="flex items-start justify-between">
            <div>
              <div class="font-semibold text-lg">{{ inst.name }}</div>
              <div class="text-sm text-slate-500">{{ inst.email }} — {{ inst.slug }}</div>
            </div>
            <div class="text-right">
              <NuxtLink :to="`/institution-manager/institutions/${inst.slug}/analytics`" class="text-sm text-indigo-600 underline">Analytics</NuxtLink>
              <div class="mt-2">
                <NuxtLink :to="`/institution-manager/institutions/${inst.slug}/quizees`" class="px-2 py-1 text-sm bg-slate-100 rounded mr-2">Quizees</NuxtLink>
                <NuxtLink :to="`/institution-manager/institutions/${inst.slug}/quiz-masters`" class="px-2 py-1 text-sm bg-slate-100 rounded">Quiz Masters</NuxtLink>
                <div class="mt-2">
                  <NuxtLink :to="`/institution-manager/institutions/new?parent=${inst.slug}`" class="px-2 py-1 text-sm bg-green-600 text-white rounded">Create Branch</NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'

const auth = useAuthStore()
const api = useApi()
const loading = ref(false)
const institutions = ref([])

// Prefer using the authenticated user's institutions if present, otherwise fetch
if (auth.user && auth.user.institutions && auth.user.institutions.length) {
  institutions.value = auth.user.institutions
} else {
  loading.value = true
  try {
    const resp = await api.get('/api/me')
    const json = await api.parseResponse(resp)
    institutions.value = json?.user?.institutions || []
  } catch (e) {
    institutions.value = []
  } finally { loading.value = false }
}
</script>

<style scoped>
/* minimal */
</style>
