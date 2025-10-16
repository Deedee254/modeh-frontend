<template>
  <div class="p-4">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-medium">Notifications</h3>
      <button @click="load" class="text-sm text-indigo-600">Refresh</button>
    </div>

      <!-- Preferences editor -->
      <div class="mb-6 p-4 border rounded">
        <div class="flex items-center justify-between">
          <h4 class="font-medium">Notification Preferences</h4>
          <div class="text-sm text-gray-500">Control how you receive notifications</div>
        </div>
        <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label class="flex items-center gap-3">
            <input type="checkbox" v-model="prefs.database" />
            <span>In-app (database)</span>
          </label>
          <label class="flex items-center gap-3">
            <input type="checkbox" v-model="prefs.broadcast" />
            <span>Live (broadcast)</span>
          </label>
          <label class="flex items-center gap-3">
            <input type="checkbox" v-model="prefs.mail" />
            <span>Email</span>
          </label>
          <label class="flex items-center gap-3">
            <input type="checkbox" v-model="prefs.push" />
            <span>Push</span>
          </label>
        </div>
        <div class="mt-3 flex items-center gap-3">
          <button @click="savePrefs" :disabled="prefsSaving" class="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Save preferences</button>
          <button @click="loadPrefs" type="button" class="text-sm text-gray-600">Reload</button>
          <span v-if="prefsSaving" class="text-sm text-gray-500">Saving…</span>
        </div>
      </div>

    <div v-if="loading" class="text-sm text-gray-500">Loading notifications…</div>

    <div v-else>
      <div v-if="notifications.length === 0" class="text-sm text-gray-600">No notifications.</div>

      <ul class="space-y-3">
        <li v-for="n in notifications" :key="n.id" class="p-3 border rounded flex justify-between items-start">
          <div>
            <div class="font-semibold">{{ n.title || n.type }}</div>
            <div class="text-sm text-gray-700 mt-1">{{ n.body || (n.data && n.data.message) }}</div>
            <div class="text-xs text-gray-500 mt-2">{{ formatDate(n.created_at) }}</div>
          </div>
          <div class="ml-4 flex-shrink-0">
            <button v-if="!n.read" @click="markRead(n)" class="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Mark read</button>
            <span v-else class="text-sm text-green-600">Read</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'

const alert = useAppAlert()
const api = useApi()
const notifications = ref([])
const loading = ref(false)

// Preferences state
const prefs = ref({ database: true, broadcast: true, mail: false, push: false })
const prefsLoading = ref(false)
const prefsSaving = ref(false)

async function loadPrefs() {
  prefsLoading.value = true
  try {
  const res = await $fetch('/api/me/notification-preferences', { credentials: 'include' }).catch(() => null)
  if (!res) throw new Error('Failed to load notification preferences')
  const json = res
    const p = json.preferences ?? null
    if (p && typeof p === 'object') {
      // Ensure boolean values
      prefs.value.database = !!(p.database ?? prefs.value.database)
      prefs.value.broadcast = !!(p.broadcast ?? prefs.value.broadcast)
      prefs.value.mail = !!(p.mail ?? prefs.value.mail)
      prefs.value.push = !!(p.push ?? prefs.value.push)
    }
  } catch (e) {
    alert.push({ type: 'error', message: e.message || 'Failed to load preferences' })
  } finally {
    prefsLoading.value = false
  }
}

async function savePrefs() {
  prefsSaving.value = true
  try {
  const body = { preferences: { ...prefs.value } }
  const res = await api.postJson('/api/me/notification-preferences', body)
  if (api.handleAuthStatus(res)) return
  if (!res.ok) throw new Error('Failed to save preferences')
  alert.push({ type: 'success', message: 'Preferences saved' })
  } catch (e) {
    alert.push({ type: 'error', message: e.message || 'Failed to save preferences' })
  } finally {
    prefsSaving.value = false
  }
}

function formatDate(s) {
  try {
    return new Date(s).toLocaleString()
  } catch (e) {
    return s
  }
}

async function load() {
  loading.value = true
  try {
  const res = await $fetch('/api/notifications', { credentials: 'include' }).catch(() => null)
  if (!res) throw new Error('Failed to load notifications')
  const json = res
  notifications.value = Array.isArray(json) ? json : (json.data || [])
  } catch (e) {
    alert.push({ type: 'error', message: e.message || 'Failed to load notifications' })
  } finally {
    loading.value = false
  }
}

async function markRead(item) {
  try {
  const res = await api.postJson(`/api/notifications/${item.id}/mark-read`, {})
  if (api.handleAuthStatus(res)) return
  if (!res.ok) throw new Error('Failed to mark read')
  item.read = true
  alert.push({ type: 'success', message: 'Marked read' })
  } catch (e) {
    alert.push({ type: 'error', message: e.message || 'Failed to mark notification' })
  }
}

// auto-load on mount
load()
// load user preferences as well
loadPrefs()
</script>
 
