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
const institutionId = ref(route.query.institutionId || null);

const institution = ref(null as any)
const loading = ref(false)
const error = ref(null as any)

async function load() {
  if (!institutionId.value) return
  loading.value = true
  error.value = null
  try {
    const resp = await api.get(`/api/institutions/${institutionId.value}`)
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    institution.value = json
  } catch (e: any) {
    error.value = e
  } finally {
    loading.value = false
  }
}

function goto(path: string) {
  const q = { institutionId: institutionId.value };
  router.push({ path, query: q });
}

if (institutionId.value) await load()
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-4">Institution Dashboard</h1>

    <div v-if="!institutionId" class="p-4 bg-yellow-50 border rounded">
      <p class="text-sm">No institution selected. Add ?institutionId=ID to the URL or switch your active institution in the UI.</p>
    </div>

    <div v-else>
  <div v-if="loading" class="text-gray-500"><LoadingSpinner /></div>
  <div v-else-if="error"><ErrorAlert>Failed to load institution: {{ error.message || error }}</ErrorAlert></div>
      <div v-else class="space-y-4">
        <div class="border p-4 rounded">
          <h2 class="text-lg font-medium">{{ institution?.name }}</h2>
          <p class="text-sm text-gray-600">ID: {{ institution?.id }}</p>
          <p class="text-sm text-gray-600">Email: {{ institution?.email }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button class="p-4 bg-blue-600 text-white rounded" @click="goto('/institution/subscriptions')">Subscriptions</button>
          <button class="p-4 bg-green-600 text-white rounded" @click="goto('/institution/quizees')">Quizees</button>
          <button class="p-4 bg-indigo-600 text-white rounded" @click="goto('/institution/quiz-masters')">Quiz Masters</button>
        </div>
      </div>
    </div>

  </div>
</template>
