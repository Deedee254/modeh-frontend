<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref } from 'vue';
import { useApi } from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import ErrorAlert from '~/components/ui/ErrorAlert.vue'

const api = useApi()
const route = useRoute();
const institutionId = ref(route.query.institutionId || null);

const packages = ref([] as any[])
const loading = ref(false)
const error = ref(null as any)

async function loadPackages() {
  loading.value = true
  error.value = null
  try {
    const resp = await api.get('/api/packages')
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    packages.value = json?.packages || []
  } catch (e: any) {
    error.value = e
  } finally {
    loading.value = false
  }
}

async function subscribe(pkgId: number) {
  const appAlert = useAppAlert()
  if (!institutionId.value) {
    appAlert.push({ message: 'No institution selected. Add ?institutionId=ID to the URL.', type: 'warning' })
    return;
  }

  try {
    const body = {
      owner_type: 'institution',
      owner_id: institutionId.value,
      gateway: 'free' // change to desired gateway when testing payments
    };
    const resp = await api.postJson(`/api/packages/${pkgId}/subscribe`, body)
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    if (resp.ok) {
      appAlert.push({ message: 'Subscription created: ' + (json?.subscription?.id ?? 'unknown'), type: 'success' })
    } else {
      appAlert.push({ message: 'Failed to subscribe: ' + (json?.message ?? 'unknown'), type: 'error' })
    }
  } catch (e: any) {
    useAppAlert().push({ message: 'Failed to subscribe: ' + (e?.message ?? e), type: 'error' })
  }
}

if (!packages.value.length) await loadPackages()
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-4">Institution Subscriptions</h1>

    <div class="mt-2">
      <LoadingSpinner v-if="loading" />
      <ErrorAlert v-else-if="error">Failed to load packages: {{ error.message || error }}</ErrorAlert>
      <div v-else>
        <div v-if="!packages || packages.length === 0">No packages available.</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="p in packages" :key="p.id" class="border p-4 rounded">
            <h3 class="font-semibold">{{ p.title }}</h3>
            <p class="text-sm text-gray-600">{{ p.short_description }}</p>
            <p class="mt-2 font-medium">{{ p.price_display ?? p.price }}</p>
            <div class="mt-3">
              <button class="px-3 py-2 bg-blue-600 text-white rounded" @click="subscribe(p.id)">Subscribe (Free test)</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
