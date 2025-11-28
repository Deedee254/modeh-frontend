<script setup lang="ts">
import { useRoute } from 'vue-router'
definePageMeta({ layout: 'institution' as any })
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import ErrorAlert from '~/components/ui/ErrorAlert.vue'
import PageHero from '~/components/institution/PageHero.vue'

const route = useRoute()
const api = useApi()
const appAlert = useAppAlert()

const institutionSlug = route.params.slug as string
const branchSlug = route.params.branchSlug as string
const notifications = ref([] as any[])
const notificationsMeta = ref({ total: 0, per_page: 20, current_page: 1, last_page: 1 })
const loading = ref(false)
const error = ref(null as any)
const selectedFilter = ref('all')

async function loadNotifications(page = 1) {
  loading.value = true
  error.value = null
  try {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('per_page', String(notificationsMeta.value.per_page))
    if (selectedFilter.value !== 'all') params.set('status', selectedFilter.value)

    const resp = await api.get(`/api/institutions/${institutionSlug}/branches/${branchSlug}/notifications?${params.toString()}`)
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    notifications.value = json?.notifications || []
    if (json?.meta) notificationsMeta.value = json.meta
  } catch (e: any) {
    error.value = e
  } finally {
    loading.value = false
  }
}

async function markAsRead(notificationId: string) {
  try {
    const resp = await api.putJson(`/api/institutions/${institutionSlug}/branches/${branchSlug}/notifications/${notificationId}`, {
      read: true
    })
    if (api.handleAuthStatus(resp)) return
    if (resp.ok) {
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) notification.read = true
    }
  } catch (e: any) {
    console.error('Failed to mark notification as read', e)
  }
}

async function deleteNotification(notificationId: string) {
  try {
    const resp = await api.del(`/api/institutions/${institutionSlug}/branches/${branchSlug}/notifications/${notificationId}`)
    if (api.handleAuthStatus(resp)) return
    if (resp.ok) {
      notifications.value = notifications.value.filter(n => n.id !== notificationId)
      appAlert.push({ message: 'Notification deleted', type: 'success' })
    }
  } catch (e: any) {
    appAlert.push({ message: 'Failed to delete notification', type: 'error' })
  }
}

function getTypeIcon(type: string) {
  const icons = {
    member_joined: '👤',
    quiz_completed: '✅',
    member_invited: '📧',
    milestone_reached: '🎯',
    system: '⚙️'
  }
  return icons[type as keyof typeof icons] || '📢'
}

function getTypeBadge(type: string) {
  const badges = {
    member_joined: 'bg-brand-100 text-brand-800',
    quiz_completed: 'bg-green-100 text-green-800',
    member_invited: 'bg-purple-100 text-purple-800',
    milestone_reached: 'bg-yellow-100 text-yellow-800',
    system: 'bg-gray-100 text-gray-800'
  }
  return badges[type as keyof typeof badges] || 'bg-gray-100 text-gray-800'
}

function getTypeLabel(type: string) {
  const labels = {
    member_joined: 'Member Joined',
    quiz_completed: 'Quiz Completed',
    member_invited: 'Member Invited',
    milestone_reached: 'Milestone',
    system: 'System'
  }
  return labels[type as keyof typeof labels] || type
}

function formatDate(dateString: string) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

onMounted(() => {
  loadNotifications()
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-slate-900">
    <PageHero
      title="Branch Notifications"
      description="Stay updated with branch activity and events"
      theme="pink"
    />

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Filters -->
      <div class="mb-6">
        <div class="flex gap-2">
          <button
            @click="selectedFilter = 'all'; loadNotifications(1)"
            :class="[selectedFilter === 'all' ? 'bg-brand-100 text-brand-800' : 'bg-gray-100 text-gray-800', 'px-4 py-2 rounded-full text-sm font-medium']"
          >
            All
          </button>
          <button
            @click="selectedFilter = 'unread'; loadNotifications(1)"
            :class="[selectedFilter === 'unread' ? 'bg-brand-100 text-brand-800' : 'bg-gray-100 text-gray-800', 'px-4 py-2 rounded-full text-sm font-medium']"
          >
            Unread
          </button>
          <button
            @click="selectedFilter = 'read'; loadNotifications(1)"
            :class="[selectedFilter === 'read' ? 'bg-brand-100 text-brand-800' : 'bg-gray-100 text-gray-800', 'px-4 py-2 rounded-full text-sm font-medium']"
          >
            Read
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      <LoadingSpinner v-if="loading" />
      <ErrorAlert v-else-if="error" :error="error" />

      <div v-else-if="notifications.length === 0" class="text-center py-12">
        <div class="text-gray-500 text-lg">No notifications</div>
        <p class="text-gray-400 text-sm mt-1">You're all caught up!</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'p-4 rounded-lg border-2 transition-colors',
            notification.read
              ? 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700'
              : 'bg-brand-50 dark:bg-slate-800/50 border-brand-100 dark:border-brand-600'
          ]"
        >
          <div class="flex gap-4">
            <div class="text-2xl">{{ getTypeIcon(notification.type) }}</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span :class="['inline-block px-2 py-1 text-xs font-semibold rounded-full', getTypeBadge(notification.type)]">
                      {{ getTypeLabel(notification.type) }}
                    </span>
                    <span class="text-xs text-gray-500">{{ formatDate(notification.created_at) }}</span>
                  </div>
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{{ notification.title }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ notification.message }}</p>
                </div>
                <div class="flex gap-2">
                  <button
                    v-if="!notification.read"
                    @click="markAsRead(notification.id)"
                    class="text-xs text-brand-600 hover:text-brand-800 font-medium"
                  >
                    Mark read
                  </button>
                  <button
                    @click="deleteNotification(notification.id)"
                    class="text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="notificationsMeta.last_page > 1" class="mt-6 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Page <span class="font-medium">{{ notificationsMeta.current_page }}</span> of <span class="font-medium">{{ notificationsMeta.last_page }}</span>
          ({{ notificationsMeta.total }} total)
        </div>
        <div class="flex gap-2">
          <button
            :disabled="notificationsMeta.current_page <= 1"
            @click="loadNotifications(notificationsMeta.current_page - 1)"
            class="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            :disabled="notificationsMeta.current_page >= notificationsMeta.last_page"
            @click="loadNotifications(notificationsMeta.current_page + 1)"
            class="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
