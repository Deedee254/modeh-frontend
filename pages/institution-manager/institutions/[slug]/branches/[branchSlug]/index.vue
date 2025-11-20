<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-4">Branch Details</h1>

    <div v-if="loading" class="text-gray-500">Loading…</div>
    <div v-else>
      <div class="border p-4 rounded">
        <h2 class="text-lg font-medium">{{ branch?.name }}</h2>
        <p class="text-sm text-slate-500">{{ branch?.email }} — {{ branch?.slug }}</p>
        <div class="mt-4">
          <NuxtLink :to="`/institution-manager/institutions/${parentSlug}/analytics`" class="text-sm text-indigo-600 underline">Parent Analytics</NuxtLink>
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
const parentSlug = route.params.slug || route.query.institutionSlug || null
// use a distinct param name for the branch to avoid duplicate "slug" params warning
const branchSlug = route.params['branchSlug'] || null
const api = useApi()
const loading = ref(false)
const branch = ref(null)

async function load() {
  if (!parentSlug || !branchSlug) return
  loading.value = true
  try {
    const resp = await api.get(`/api/institutions/${branchSlug}`)
    const json = await api.parseResponse(resp)
    branch.value = json || null
  } catch (e) { branch.value = null }
  finally { loading.value = false }
}

await load()
</script>

