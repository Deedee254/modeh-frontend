<template>
  <div v-if="visible" class="flex items-center gap-3">
    <div class="hidden sm:flex items-center gap-2">
      <div class="text-xs text-slate-500">Profile</div>
      <div class="w-28 h-3 bg-slate-100 rounded overflow-hidden">
        <div :style="{ width: percent + '%' }" class="h-3 bg-emerald-500"></div>
      </div>
      <div class="text-sm font-medium">{{ percent }}%</div>
    </div>
    <button v-if="missingList.length" @click="showMissing = !showMissing" class="text-xs text-gray-600 hover:text-gray-900">Missing</button>
    <div v-if="showMissing" class="absolute right-4 top-12 z-50 w-64 bg-white border rounded shadow p-3 text-sm">
      <div class="font-semibold mb-2">Missing profile items</div>
      <ul class="list-disc pl-4 space-y-1">
        <li v-for="(m, i) in missingList" :key="i">{{ m }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

const api = useApi()
const visible = ref(false)
const percent = ref(0)
const missingList = ref([])
const showMissing = ref(false)

async function load() {
  try {
    const res = await api.get('/api/me')
    if (!res.ok) return
    const json = await api.parseResponse(res)
    const onboarding = json?.onboarding || null
    const missing = json?.missing_profile_messages || []
    if (Array.isArray(missing)) missingList.value = missing
    // Determine percent
    if (onboarding && Array.isArray(onboarding.completed_steps) && onboarding.total_steps) {
      const c = onboarding.completed_steps.length || 0
      const t = onboarding.total_steps || (c + missingList.value.length) || 1
      percent.value = Math.round((c / t) * 100)
      visible.value = true
      return
    }
    if (Array.isArray(onboarding?.completed_steps)) {
      const c = onboarding.completed_steps.length || 0
      const m = missingList.value.length || 0
      const t = Math.max(1, c + m)
      percent.value = Math.round((c / t) * 100)
      visible.value = true
      return
    }
    // fallback: if there are missing items, show 0%
    if (missingList.value.length) {
      percent.value = 0
      visible.value = true
    }
  } catch (e) {
    // ignore
  }
}

onMounted(() => { void load() })
</script>

<style scoped>
.absolute { position: absolute }
</style>
