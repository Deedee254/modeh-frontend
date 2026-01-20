<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- Back Button -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <NuxtLink to="/quiz-master/institutions" class="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-medium text-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Institutions
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="w-8 h-8 border-4 border-gray-300 border-t-brand-600 rounded-full animate-spin mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading institution...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <h2 class="text-xl font-bold text-gray-900 mb-2">Institution Not Found</h2>
        <p class="text-gray-600 mb-6">The institution you're looking for doesn't exist or has been removed.</p>
        <NuxtLink to="/quiz-master/institutions" class="inline-block px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">
          Back to Institutions
        </NuxtLink>
      </div>
    </div>

    <!-- Institution Details -->
    <div v-else-if="institution" class="pb-12">
      <!-- Hero Header -->
      <div class="bg-gradient-to-r from-brand-600 to-brand-700 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div class="flex-1">
              <h1 class="text-3xl sm:text-4xl font-bold mb-2">{{ institution.name }}</h1>
              <p v-if="institution.email" class="text-brand-100 mb-1">📧 {{ institution.email }}</p>
              <p v-if="institution.phone" class="text-brand-100">📱 {{ institution.phone }}</p>
            </div>
            <div v-if="institution.is_active" class="flex-shrink-0 px-4 py-2 bg-green-500 rounded-lg font-medium">
              Active
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Join Section -->
        <div class="mb-8">
          <div v-if="!auth.user" class="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-blue-900 mb-2">Sign In to Join</h3>
            <p class="text-blue-800 mb-4">Create an account or sign in to join this institution and connect with other Quiz Masters and Quizees.</p>
            <div class="flex gap-3">
              <NuxtLink to="/login" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Sign In
              </NuxtLink>
              <NuxtLink to="/register/quiz-master" class="px-6 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 font-medium">
                Create Account
              </NuxtLink>
            </div>
          </div>

          <div v-else-if="isUserMember" class="bg-green-50 border border-green-200 rounded-lg p-6">
            <div class="flex items-center gap-2 mb-2">
              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <h3 class="text-lg font-semibold text-green-900">You're a Member</h3>
            </div>
            <p class="text-green-800">You're connected to this institution and can view its members and resources.</p>
          </div>

          <div v-else-if="requestPending" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-yellow-900 mb-2">Request Sent</h3>
            <p class="text-yellow-800 mb-4">Your request to join this institution has been sent and is awaiting approval from the institution manager.</p>
            <div class="text-sm text-gray-600">You will be notified when your membership is approved.</div>
          </div>

          <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-yellow-900 mb-2">Join This Institution</h3>
            <p class="text-yellow-800 mb-4">Link your profile to this institution to connect with the community of Quiz Masters and Quizees.</p>
            <div v-if="branches && branches.length" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Select Branch (optional)</label>
              <select
                v-model="selectedBranchId"
                class="block w-full mt-1 rounded-md border-gray-200 bg-white text-gray-900 shadow-sm focus:ring-brand-500 focus:border-brand-500"
              >
                <option :value="null">Join main institution</option>
                <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
              </select>
            </div>
            <button
              @click="joinInstitution"
              :disabled="joiningLoading"
              class="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
            >
              <span v-if="joiningLoading">Joining...</span>
              <span v-else>Join Institution</span>
            </button>
          </div>
        </div>

        <!-- Institution Info Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <!-- Details -->
          <div class="md:col-span-2">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">About</h2>
              <div v-if="institution.website" class="mb-4">
                <p class="text-sm font-medium text-gray-600 mb-1">Website</p>
                <a :href="institution.website" target="_blank" class="text-brand-600 hover:underline break-all">
                  {{ institution.website }}
                </a>
              </div>
              <div v-if="institution.address" class="mb-4">
                <p class="text-sm font-medium text-gray-600 mb-1">Address</p>
                <p class="text-gray-900">{{ institution.address }}</p>
              </div>
              <div v-if="institution.metadata" class="mb-4">
                <p class="text-sm font-medium text-gray-600 mb-2">Additional Info</p>
                <div class="text-sm text-gray-700 space-y-1">
                  <p v-if="institution.metadata.founded_year">Founded: {{ institution.metadata.founded_year }}</p>
                  <p v-if="institution.metadata.principal_name">Principal: {{ institution.metadata.principal_name }}</p>
                </div>
              </div>
              <div v-if="!institution.website && !institution.address && !institution.metadata" class="text-gray-500 text-sm">
                No additional information provided.
              </div>
            </div>
          </div>

          <!-- Stats Sidebar -->
          <div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4">📊 Stats</h3>
              <div class="space-y-4">
                <div>
                  <p class="text-sm text-gray-600 mb-1">Total Members</p>
                  <p class="text-2xl font-bold text-gray-900">{{ memberStats.total }}</p>
                </div>
                <div class="border-t pt-4">
                  <p class="text-sm text-gray-600 mb-1">Quiz Masters</p>
                  <p class="text-xl font-bold text-brand-600">{{ memberStats.quizMasters }}</p>
                </div>
                <div class="border-t pt-4">
                  <p class="text-sm text-gray-600 mb-1">Quizees</p>
                  <p class="text-xl font-bold text-brand-600">{{ memberStats.quizees }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Members Section (visible only if user is member) -->
        <div v-if="isUserMember && institution.users && institution.users.length" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Quiz Masters -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">🎓 Quiz Masters</h3>
            <div v-if="quizMasters.length === 0" class="text-sm text-gray-500">
              No quiz masters yet
            </div>
            <div v-else class="space-y-3">
              <NuxtLink
                v-for="qm in quizMasters.slice(0, 10)"
                :key="qm.id"
                :to="`/quizee/quiz-masters/${qm.slug}`"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100"
              >
                <div class="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold flex-shrink-0">
                  {{ (qm.name || 'U').charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900 truncate">{{ qm.name }}</p>
                  <p class="text-xs text-gray-500">{{ qm.email }}</p>
                </div>
              </NuxtLink>
              <NuxtLink
                v-if="quizMasters.length > 10"
                :to="{ path: '/quiz-master/institutions', query: { view: 'members', slug: institution.slug } }"
                class="block text-center text-sm text-brand-600 hover:text-brand-700 font-medium pt-2"
              >
                View all quiz masters →
              </NuxtLink>
            </div>
          </div>

          <!-- Quizees -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">📚 Quizees</h3>
            <div v-if="quizees.length === 0" class="text-sm text-gray-500">
              No quizees yet
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="qz in quizees.slice(0, 10)"
                :key="qz.id"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100"
              >
                <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
                  {{ (qz.name || 'U').charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900 truncate">{{ qz.name }}</p>
                  <p class="text-xs text-gray-500">{{ qz.email }}</p>
                </div>
              </div>
              <div
                v-if="quizees.length > 10"
                class="block text-center text-sm text-brand-600 hover:text-brand-700 font-medium pt-2"
              >
                {{ quizees.length - 10 }} more quizees
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'

definePageMeta({ layout: 'quiz-master' })

useHead({
  title: 'Institution — Modeh',
  meta: [
    { name: 'description', content: 'View institution details and join to connect with the community.' }
  ]
})

const route = useRoute()
const config = useRuntimeConfig()
const auth = useAuthStore()
const api = useApi()
const alert = useAppAlert()

const institutionSlug = route.params.slug as string

interface InstitutionResponse {
  id: number
  name: string
  slug: string
  email?: string
  phone?: string
  website?: string
  address?: string
  is_active: boolean
  metadata?: Record<string, any>
  users?: any[]
  data?: any
}

const { data: institutionData, pending, error } = await useAsyncData(
  `institution-qm-${institutionSlug}`,
  () => $fetch<InstitutionResponse>(`${config.public.apiBase}/api/institutions/${institutionSlug}`)
)

const institution = computed(() => {
  if (!institutionData.value) return null
  const data = institutionData.value as any
  return data.data || institutionData.value
})

const joiningLoading = ref(false)

// Branch handling: some institutions expose sub-institutions/branches under `children` or `branches`
const branches = computed(() => {
  if (!institution.value) return []
  // prefer `children` as documented, fallback to `branches`
  return institution.value.children || institution.value.branches || []
})

const selectedBranchId = ref<number | null>(null)
const requestPending = ref(false)
const isUserMember = computed(() => {
  if (!auth.user || !institution.value) return false

  const user = auth.user as any

  // Check if user has pivot membership
  if (user.institutions && Array.isArray(user.institutions)) {
    const isMember = user.institutions.some((inst: any) =>
      inst.id === institution.value!.id || inst.slug === institution.value!.slug
    )
    if (isMember) return true
  }

  // Check if user's profile institution_id matches
  const userProfileInst = user.profile?.institution_id

  return userProfileInst === institution.value.id
})

// Member statistics
const memberStats = computed(() => {
  if (!institution.value || !institution.value.users) {
    return { total: 0, quizMasters: 0, quizees: 0 }
  }

  const users = institution.value.users
  return {
    total: users.length,
    quizMasters: users.filter((u: any) => u.pivot?.role === 'quiz-master' || u.role === 'quiz-master').length,
    quizees: users.filter((u: any) => u.pivot?.role === 'quizee' || u.role === 'quizee').length
  }
})

// Separate members by type
const quizMasters = computed(() => {
  if (!institution.value || !institution.value.users) return []
  return institution.value.users.filter((u: any) =>
    u.pivot?.role === 'quiz-master' || (!u.pivot && u.role === 'quiz-master')
  )
})

const quizees = computed(() => {
  if (!institution.value || !institution.value.users) return []
  return institution.value.users.filter((u: any) =>
    u.pivot?.role === 'quizee' || (!u.pivot && u.role === 'quizee')
  )
})

async function joinInstitution() {
  if (!auth.user || !institution.value) {
    alert.push({ type: 'warning', message: 'Please sign in first' })
    await navigateTo('/login')
    return
  }

  joiningLoading.value = true
  try {
    // include branch_id only when a branch is selected
    const data: Record<string, any> = { institution_id: institution.value.id }
    if (selectedBranchId.value) data.branch_id = selectedBranchId.value

    const payload = {
      step: 'institution',
      data
    }

    const res = await api.postJson('/api/onboarding/step', payload)

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.message || 'Failed to join institution')
    }

    // Try to read response body for explicit pending flag or message
    const body = await res.json().catch(() => null)

    // Refresh user data to reflect any immediate membership change
    await auth.fetchUser()

    // Check if user became a member
    const becameMember = isUserMember.value

    if (becameMember) {
      alert.push({ type: 'success', message: `Successfully joined ${institution.value.name}!` })
    } else {
      // If backend indicates pending or message suggests awaiting approval, set pending state
      const pendingFlag = body && (body.pending === true || body.status === 'pending' || /pending|awaiting approval/i.test(body.message || ''))
      if (pendingFlag || !becameMember) {
        requestPending.value = true
        alert.push({ type: 'info', message: `Request sent to ${institution.value.name}. Awaiting manager approval.` })
      }
    }

    // Refresh the institution data to update member count
    await refreshNuxtData(`institution-qm-${institutionSlug}`)
  } catch (e: any) {
    console.error('Failed to join institution', e)
    alert.push({ type: 'error', message: e.message || 'Failed to join institution. Please try again.' })
  } finally {
    joiningLoading.value = false
  }
}

onMounted(() => {
  if (institution.value) {
    useHead({
      title: `${institution.value.name} — Modeh`,
      meta: [
        { name: 'description', content: `Join ${institution.value.name} on Modeh to connect with Quiz Masters and Quizees.` }
      ]
    })

    // If the institution only has one branch, preselect it for the user
    if (branches.value && branches.value.length === 1) {
      selectedBranchId.value = branches.value[0].id
    }
      // If user already has a pending request (pivot or similar), show awaiting approval
      if (auth.user && auth.user.institutions && Array.isArray(auth.user.institutions)) {
        const match = auth.user.institutions.find((inst: any) => inst.id === institution.value!.id || inst.slug === institution.value!.slug)
        if (match && (match.pivot?.status === 'pending' || match.pivot?.approved === false || match.pivot?.approved === '0')) {
          requestPending.value = true
        }
      }
    // otherwise leave selection null (join main institution) unless user chooses
  }
})
</script>
