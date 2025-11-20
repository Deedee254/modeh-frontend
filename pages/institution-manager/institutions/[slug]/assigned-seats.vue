<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'

definePageMeta({ layout: 'institution' as any })

const route = useRoute()
const router = useRouter()
const api = useApi()
const alert = useAppAlert()

// prefer explicit route param slug, otherwise accept query param institutionSlug
const institutionId = ref(route.params.slug || route.query.institutionSlug || null)
const loading = ref(false)
const subscription = ref(null as any)
const assignments = ref([] as any[])
const availableSeats = ref<number|null>(null)

async function loadAssignments() {
  if (!institutionId.value) return
  loading.value = true
  try {
    const resp = await api.get(`/api/institutions/${institutionId.value}/subscription`)
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    subscription.value = json?.subscription || null
    availableSeats.value = json?.available_seats ?? null
    assignments.value = json?.assignments || []
  } catch (e: any) {
    alert.push({ type: 'error', message: 'Failed to load assignments: ' + (e?.message || e) })
  }
  loading.value = false
}

async function revoke(userId: number) {
  if (!institutionId.value) return
  if (!confirm('Revoke assignment for this user? This will free the seat and mark the member removed.')) return
  try {
    const resp = await api.postJson(`/api/institutions/${institutionId.value}/assignment/revoke`, { user_id: userId })
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    if (resp.ok) {
      alert.push({ type: 'success', message: 'Assignment revoked' })
      await loadAssignments()
    } else {
      alert.push({ type: 'error', message: json?.message || 'Failed to revoke assignment' })
    }
  } catch (e: any) {
    alert.push({ type: 'error', message: 'Failed to revoke: ' + (e?.message || e) })
  }
}

onMounted(() => {
  if (!institutionId.value && (route.query.institutionSlug || route.params.slug)) {
    institutionId.value = (route.params.slug || route.query.institutionSlug)!
  }
  loadAssignments()
})

// react to route changes (slug or query) and reload
watch(() => route.params.slug, (newSlug) => {
  const s = newSlug || route.query.institutionSlug || null
  institutionId.value = s
  loadAssignments()
})

watch(() => route.query.institutionSlug, (q) => {
  const s = q || route.params.slug || null
  institutionId.value = s
  loadAssignments()
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-4">Assigned Seats</h1>

    <div v-if="loading">
      <LoadingSpinner />
    </div>

    <div v-else>
      <div class="mb-4">
        <p class="text-sm">Active subscription: <strong v-if="subscription">{{ subscription.package_id ? ('#' + subscription.package_id + ' - ' + (subscription.package?.title || 'Package')) : 'None' }}</strong><span v-else>None</span></p>
        <p class="text-sm">Available seats: <strong>{{ availableSeats === null ? 'Unlimited' : availableSeats }}</strong></p>
      </div>

      <div v-if="assignments.length === 0">No assigned users.</div>

      <div v-else class="space-y-3">
        <div v-for="a in assignments" :key="a.id" class="border rounded p-3 flex justify-between items-center">
          <div>
            <div class="font-medium">{{ a.user_name || ('User #' + a.user_id) }}</div>
            <div class="text-sm text-gray-600">{{ a.user_email }}</div>
            <div class="text-sm text-gray-500">Assigned by: {{ a.assigned_by || 'System' }} at {{ a.assigned_at }}</div>
          </div>
          <div>
            <button class="px-3 py-2 bg-red-600 text-white rounded" @click="revoke(a.user_id)">Revoke</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
