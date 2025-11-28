<template>
  <div class="p-6">
    <div class="mb-6">
      <NuxtLink :to="`/institution-manager/institutions/${institutionSlug}/members`" class="text-brand-600 hover:text-brand-800">
        ← Back to Members
      </NuxtLink>
    </div>

    <div v-if="loading" class="text-center py-12">
      <LoadingSpinner />
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
      {{ error }}
    </div>

    <div v-else-if="memberData">
      <div class="mb-8">
        <h1 class="text-3xl font-bold">{{ memberData.name }}</h1>
        <p class="text-gray-600">{{ memberData.email }}</p>
        <div class="flex gap-4 mt-4">
          <span :class="['px-3 py-1 rounded-full text-sm font-semibold', getRoleBadge(memberData.role)]">
            {{ memberData.role }}
          </span>
          <span :class="['px-3 py-1 rounded-full text-sm font-semibold', getStatusBadge(memberData.status)]">
            {{ memberData.status }}
          </span>
        </div>
      </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-lg shadow p-6 border">
          <div class="text-sm text-slate-500">Member Since</div>
          <div class="text-2xl font-bold text-slate-900">{{ memberData.days_as_member }}</div>
          <div class="text-xs text-slate-400 mt-1">days</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6 border">
          <div class="text-sm text-slate-500">Total Attempts</div>
          <div class="text-2xl font-bold text-brand-600">{{ memberData.activity?.total_attempts || 0 }}</div>
          <div class="text-xs text-slate-400 mt-1">quiz attempts</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6 border">
          <div class="text-sm text-slate-500">Average Score</div>
          <div class="text-2xl font-bold text-green-600">{{ memberData.activity?.avg_score || 0 }}%</div>
          <div class="text-xs text-slate-400 mt-1">across all quizzes</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6 border">
          <div class="text-sm text-slate-500">Last Activity</div>
          <div class="text-lg font-bold text-slate-900">
            {{ memberData.activity?.last_activity ? formatDate(memberData.activity.last_activity) : 'Never' }}
          </div>
          <div class="text-xs text-slate-400 mt-1">
            {{ memberData.activity?.last_activity ? getTimeAgo(memberData.activity.last_activity) : '—' }}
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow border p-6">
        <h2 class="text-lg font-semibold mb-4">Member Information</h2>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
          <div>
            <label class="text-sm text-gray-600">Email</label>
            <p class="text-lg font-medium">{{ memberData.email }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-600">Role in Institution</label>
            <p class="text-lg font-medium capitalize">{{ memberData.role }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-600">Status</label>
            <p class="text-lg font-medium capitalize">{{ memberData.status }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-600">Member Since</label>
            <p class="text-lg font-medium">{{ memberData.member_since ? new Date(memberData.member_since).toLocaleDateString() : '—' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import useApi from '~/composables/useApi'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'

const route = useRoute()
const api = useApi()

const institutionSlug = route.params.slug as string
const memberId = route.params.memberId as string

const loading = ref(true)
const error = ref(null as any)
const memberData = ref(null as any)

const formatDate = (date: string) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getTimeAgo = (date: string) => {
  if (!date) return ''
  const now = new Date()
  const then = new Date(date)
  const diff = now.getTime() - then.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'just now'
}

const getRoleBadge = (role: string) => {
  const badges = {
    'institution-manager': 'bg-purple-100 text-purple-800',
    'quiz-master': 'bg-brand-100 text-brand-800',
    'quizee': 'bg-green-100 text-green-800',
    'member': 'bg-gray-100 text-gray-800'
  }
  return badges[role as keyof typeof badges] || 'bg-gray-100 text-gray-800'
}

const getStatusBadge = (status: string) => {
  const badges = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    invited: 'bg-brand-100 text-brand-800',
    removed: 'bg-red-100 text-red-800'
  }
  return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'
}

async function loadMemberData() {
  try {
    const res = await api.get(`/api/institutions/${institutionSlug}/analytics/member/${memberId}`)
    if (!res.ok) throw new Error('Failed to load member data')
    const data = await res.json()
    memberData.value = data.member
  } catch (e: any) {
    error.value = e.message || 'Failed to load member analytics'
  } finally {
    loading.value = false
  }
}

definePageMeta({ layout: 'institution' as any })

onMounted(() => loadMemberData())
</script>
