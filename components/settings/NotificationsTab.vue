<template>
  <div class="space-y-6 max-w-4xl">
    <!-- Preferences Card -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h3>
        <button @click="loadPrefs" class="text-sm font-medium text-brand-600 hover:text-brand-700">Reload</button>
      </div>

      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">Choose how you'd like to receive notifications</p>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <label class="flex items-center gap-3 p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
          <input type="checkbox" v-model="prefs.database" class="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
          <div>
            <span class="font-medium text-gray-900 dark:text-white">In-App Notifications</span>
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-0.5">See updates while using Modeh</p>
          </div>
        </label>

        <label class="flex items-center gap-3 p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
          <input type="checkbox" v-model="prefs.broadcast" class="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
          <div>
            <span class="font-medium text-gray-900 dark:text-white">Live Updates</span>
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Real-time alerts</p>
          </div>
        </label>

        <label class="flex items-center gap-3 p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
          <input type="checkbox" v-model="prefs.mail" class="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
          <div>
            <span class="font-medium text-gray-900 dark:text-white">Email</span>
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Sent to your email address</p>
          </div>
        </label>

        <label class="flex items-center gap-3 p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
          <input type="checkbox" v-model="prefs.push" class="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
          <div>
            <span class="font-medium text-gray-900 dark:text-white">Push Notifications</span>
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Browser push alerts</p>
          </div>
        </label>
      </div>

      <div class="flex gap-3 pt-2">
        <button @click="savePrefs" :disabled="prefsSaving" class="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <span v-if="!prefsSaving">Save Preferences</span>
          <span v-else>Saving…</span>
        </button>
      </div>
    </div>

    <!-- Notifications List -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Notification History</h3>
        <button @click="load" class="text-sm font-medium text-brand-600 hover:text-brand-700">Refresh</button>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block">
          <svg class="animate-spin h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p class="text-gray-500 dark:text-gray-400 mt-2">Loading notifications…</p>
      </div>

      <div v-else-if="notifications.length === 0" class="text-center py-12">
        <svg class="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
        <p class="text-gray-600 dark:text-gray-400">No notifications yet</p>
        <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">You're all caught up!</p>
      </div>

      <div v-else class="space-y-3">
        <div v-for="n in notifications" :key="n.id" :class="['p-4 rounded-lg border transition-colors', n.read ? 'bg-gray-50 dark:bg-slate-700/30 border-gray-200 dark:border-slate-600' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800']">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900 dark:text-white">{{ n.title || n.type }}</h4>
              <p class="text-sm text-gray-700 dark:text-gray-300 mt-1">{{ n.body || (n.data && n.data.message) }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">{{ formatDate(n.created_at) }}</p>
            </div>
            <button 
              v-if="!n.read" 
              @click="markRead(n)"
              class="flex-shrink-0 px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded transition-colors"
            >
              Mark Read
            </button>
            <span v-else class="flex-shrink-0 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded">
              ✓ Read
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'
import useMeApi from '~/composables/useMeApi'

const alert = useAppAlert()
const api = useApi()
const meApi = useMeApi()
const notifications = ref([])
const loading = ref(false)

// Preferences state
const prefs = ref({ database: true, broadcast: true, mail: false, push: false })
const prefsLoading = ref(false)
const prefsSaving = ref(false)

async function loadPrefs() {
  prefsLoading.value = true
  try {
    const res = await meApi.get('/api/me/notification-preferences')
    if (api.handleAuthStatus(res)) return
    if (!res.ok) throw new Error('Failed to load notification preferences')
    const json = await res.json()
    const p = json.preferences ?? null
    if (p && typeof p === 'object') {
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
  const res = await meApi.post(body, '/api/me/notification-preferences')
  if (api.handleAuthStatus(res)) return
  if (!res.ok) throw new Error('Failed to save preferences')
    alert.push({ type: 'success', message: 'Notification preferences saved' })
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
    const res = await api.get('/api/notifications')
    if (api.handleAuthStatus(res)) return
    if (!res.ok) throw new Error('Failed to load notifications')
    const json = await res.json()
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
    alert.push({ type: 'success', message: 'Marked as read' })
  } catch (e) {
    alert.push({ type: 'error', message: e.message || 'Failed to mark notification' })
  }
}

// Auto-load on mount
load()
loadPrefs()
</script>
 

