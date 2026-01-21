<script setup lang="ts">
import { useRoute } from 'vue-router'
definePageMeta({ layout: 'institution' as any })
import { ref, onMounted } from 'vue'
import { ClientOnly } from '#components'
import { useApi } from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import ErrorAlert from '~/components/ui/ErrorAlert.vue'
import PageHero from '~/components/institution/PageHero.vue'

const route = useRoute()
const api = useApi()
const appAlert = useAppAlert()

// Prefer route param slug (when using the nested route), fallback to query.institutionSlug
const institutionSlug = (route.params.slug || route.query.institutionSlug) as string
const members = ref([] as any[])
const membersMeta = ref({ total: 0, per_page: 10, current_page: 1, last_page: 1 })
const requests = ref([] as any[])
const loading = ref(false)
const error = ref(null as any)
const selectedRole = ref('')
const activeTab = ref('members') // 'members' or 'requests'

// Invitation modal
const showInviteModal = ref(false)
const inviteEmail = ref('')
const inviteRole = ref('member')
const inviteExpiresInDays = ref(14)
const inviting = ref(false)

// Remove member modal
const showRemoveModal = ref(false)
const memberToRemove = ref(null as any)
const removing = ref(false)

// Accept request modal
const showAcceptModal = ref(false)
const requestToAccept = ref(null as any)
const accepting = ref(false)

async function loadMembers(page = 1) {
  loading.value = true
  error.value = null
  try {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('per_page', String(membersMeta.value.per_page))
    if (selectedRole.value) params.set('role', selectedRole.value)

    const resp = await api.get(`/api/institutions/${institutionSlug}/members?${params.toString()}`)
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    members.value = json?.members || []
    if (json?.meta) membersMeta.value = json.meta
  } catch (e: any) {
    error.value = e
  } finally {
    loading.value = false
  }
}

async function loadRequests() {
  try {
    const resp = await api.get(`/api/institutions/${institutionSlug}/requests`)
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    // Backend returns { ok: true, requests: [...], meta: {...} }
    const items = json?.requests || json?.data || []
    // Normalize to shape expected by the UI
    requests.value = (items || []).map((i: any) => ({
      id: i.id,
      name: i.name || i.full_name || i.invited_email || null,
      email: i.email || i.invited_email || null,
      // backend provides global role on the user as `role`; requests endpoint uses 'global_role'
      requested_role: i.requested_role || i.role || i.global_role || null,
      created_at: i.created_at || i.requested_at || null
    }))
  } catch (e: any) {
    console.error('Error loading requests:', e)
    appAlert.push({ message: 'Failed to load pending requests: ' + (e?.message ?? e), type: 'error' })
  }
}

async function inviteMember() {
  if (!inviteEmail.value.trim()) return

  inviting.value = true
  try {
    const resp = await api.postJson(`/api/institutions/${institutionSlug}/members/invite`, {
      email: inviteEmail.value.trim(),
      role: inviteRole.value,
      expires_in_days: inviteExpiresInDays.value
    })
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    if (resp.ok) {
      appAlert.push({ message: json?.message || 'Invitation sent successfully', type: 'success' })
      showInviteModal.value = false
      inviteEmail.value = ''
      inviteRole.value = 'member'
      inviteExpiresInDays.value = 14
    } else {
      appAlert.push({ message: json?.message || 'Failed to send invitation', type: 'error' })
    }
  } catch (e: any) {
    appAlert.push({ message: 'Failed to send invitation: ' + (e?.message ?? e), type: 'error' })
  } finally {
    inviting.value = false
  }
}

function confirmRemoveMember(member: any) {
  memberToRemove.value = member
  showRemoveModal.value = true
}

async function removeMember() {
  if (!memberToRemove.value) return

  removing.value = true
  try {
    const resp = await api.del(`/api/institutions/${institutionSlug}/members/${memberToRemove.value.id}`)
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    if (resp.ok) {
      appAlert.push({ message: json?.message || 'Member removed successfully', type: 'success' })
      showRemoveModal.value = false
      memberToRemove.value = null
      await loadMembers(membersMeta.value.current_page)
    } else {
      appAlert.push({ message: json?.message || 'Failed to remove member', type: 'error' })
    }
  } catch (e: any) {
    appAlert.push({ message: 'Failed to remove member: ' + (e?.message ?? e), type: 'error' })
  } finally {
    removing.value = false
  }
}

function confirmAcceptRequest(request: any) {
  requestToAccept.value = request
  showAcceptModal.value = true
}

async function acceptRequest() {
  if (!requestToAccept.value) return

  accepting.value = true
  try {
    const resp = await api.postJson(`/api/institutions/${institutionSlug}/members/accept`, {
      user_id: requestToAccept.value.id
    })
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    if (resp.ok) {
      appAlert.push({ message: json?.message || 'Member request accepted successfully. Verified badge added to their profile.', type: 'success' })
      showAcceptModal.value = false
      requestToAccept.value = null
      
      // Refresh both requests and members lists sequentially
      await loadRequests()
      await loadMembers(1)
    } else {
      appAlert.push({ message: json?.message || 'Failed to accept request', type: 'error' })
    }
  } catch (e: any) {
    appAlert.push({ message: 'Failed to accept request: ' + (e?.message ?? e), type: 'error' })
  } finally {
    accepting.value = false
  }
}

function titleCaseRole(role: string) {
  if (!role) return ''
  try { return String(role).replace('-', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) } catch (e) { return role }
}

function getStatusBadge(status: string) {
  const badges = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    invited: 'bg-brand-100 text-brand-800',
    removed: 'bg-red-100 text-red-800'
  }
  return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'
}

function getRoleBadge(role: string) {
  const badges = {
    'institution-manager': 'bg-purple-100 text-purple-800',
    'quiz-master': 'bg-brand-100 text-brand-800',
    'quizee': 'bg-green-100 text-green-800',
    'member': 'bg-gray-100 text-gray-800'
  }
  return badges[role as keyof typeof badges] || 'bg-gray-100 text-gray-800'
}

onMounted(() => {
  loadMembers()
  loadRequests()
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-slate-900">
    <!-- Page Hero -->
    <PageHero
      title="Institution Members"
      description="Manage and invite members to your institution"
      theme="blue"
      :actions="[
        {
          label: 'Invite Member',
          icon: '➕',
          onClick: () => showInviteModal = true,
          variant: 'primary'
        }
      ]"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Tabs -->
      <ClientOnly>
      <div class="mb-6 border-b border-gray-200 dark:border-slate-700">
        <div class="flex gap-4">
          <button
            @click="activeTab = 'members'"
            :class="[
              'px-4 py-3 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'members'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            ]"
          >
            Members ({{ members.length }})
          </button>
          <button
            @click="activeTab = 'requests'"
            :class="[
              'px-4 py-3 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'requests'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            ]"
          >
            Pending Requests ({{ requests.length }})
          </button>
        </div>
      </div>

      <!-- Members Tab -->
      <div v-if="activeTab === 'members'" class="space-y-6">
      <!-- Filters -->
      <div class="mb-6">
      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
          <select
            v-model="selectedRole"
            @change="loadMembers(1)"
            class="border rounded px-3 py-2 w-full sm:w-auto"
          >
            <option value="">All Roles</option>
            <option value="institution-manager">Institution Manager</option>
            <option value="quiz-master">Quiz Master</option>
            <option value="quizee">Quizee</option>
            <option value="member">Member</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Members Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <LoadingSpinner v-if="loading" />
      <ErrorAlert v-else-if="error" :error="error" />

      <div v-else-if="members.length === 0" class="p-8 text-center text-gray-500">
        No members found.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="member in members" :key="member.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ member.name }}</div>
                    <div class="text-sm text-gray-500">{{ member.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['inline-flex px-2 py-1 text-xs font-semibold rounded-full', getRoleBadge(member.role)]">
                  {{ titleCaseRole(member.role) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['inline-flex px-2 py-1 text-xs font-semibold rounded-full', getStatusBadge(member.status)]">
                  {{ member.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ new Date(member.created_at || member.joined_at).toLocaleDateString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <NuxtLink
                    :to="`/institution-manager/institutions/${institutionSlug}/members/${member.id}/analytics`"
                    class="text-brand-600 hover:text-brand-900"
                  >
                    Analytics
                  </NuxtLink>
                  <button
                    v-if="member.role !== 'institution-manager'"
                    @click="confirmRemoveMember(member)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="membersMeta.last_page > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            :disabled="membersMeta.current_page <= 1"
            @click="loadMembers(membersMeta.current_page - 1)"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            :disabled="membersMeta.current_page >= membersMeta.last_page"
            @click="loadMembers(membersMeta.current_page + 1)"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing page <span class="font-medium">{{ membersMeta.current_page }}</span> of <span class="font-medium">{{ membersMeta.last_page }}</span>
              ({{ membersMeta.total }} total members)
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                :disabled="membersMeta.current_page <= 1"
                @click="loadMembers(membersMeta.current_page - 1)"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                :disabled="membersMeta.current_page >= membersMeta.last_page"
                @click="loadMembers(membersMeta.current_page + 1)"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
      </div>

      <!-- Requests Tab -->
      <div v-if="activeTab === 'requests'" class="space-y-6">
        <!-- Requests List -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div v-if="requests.length === 0" class="p-8 text-center text-gray-500">
            No pending requests.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="request in requests" :key="request.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ request.name }}</div>
                      <div class="text-sm text-gray-500">{{ request.email }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="['inline-flex px-2 py-1 text-xs font-semibold rounded-full', getRoleBadge(request.requested_role || request.role)]">
                      {{ titleCaseRole(request.requested_role || request.role || 'Member') }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex flex-col gap-1">
                      <span class="text-sm text-gray-500">
                        {{ new Date(request.created_at || request.requested_at).toLocaleDateString() }}
                      </span>
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⏳ Awaiting Approval
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      @click="confirmAcceptRequest(request)"
                      class="inline-flex items-center px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors text-xs font-medium"
                    >
                      ✓ Accept
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </ClientOnly>
      </div>
    </div>

    <!-- Invite Member Modal -->
    <ClientOnly>
    <div v-if="showInviteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="showInviteModal = false">
      <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Invite New Member</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                v-model="inviteEmail"
                type="email"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-600 focus:border-brand-500"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Role</label>
              <select
                v-model="inviteRole"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-600 focus:border-brand-500"
              >
                <option value="member">Member</option>
                <option value="quizee">Quizee</option>
                <option value="quiz-master">Quiz Master</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Expires in (days)</label>
              <input
                v-model.number="inviteExpiresInDays"
                type="number"
                min="1"
                max="30"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-600 focus:border-brand-500"
              />
            </div>
          </div>
          <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button
              @click="showInviteModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              @click="inviteMember"
              :disabled="inviting || !inviteEmail.trim()"
              class="px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-md hover:bg-brand-700 disabled:opacity-50 w-full sm:w-auto"
            >
              <span v-if="inviting">Sending...</span>
              <span v-else>Send Invitation</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Accept Request Modal -->
    <div v-if="showAcceptModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="showAcceptModal = false">
      <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Accept Request</h3>
          <p class="text-sm text-gray-600 mb-2">
            Accept <strong>{{ requestToAccept?.name }}</strong> as a 
            <strong>{{ titleCaseRole(requestToAccept?.requested_role || requestToAccept?.role || 'Member') }}</strong>?
          </p>
          <p class="text-xs text-gray-500 mb-4 bg-yellow-50 p-3 rounded border border-yellow-200">
            💬 Current Status: <span class="font-semibold">Awaiting Approval</span> - Once accepted, a verified badge will be added to their profile.
          </p>
          <div class="flex flex-col sm:flex-row justify-end gap-3">
            <button
              @click="showAcceptModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              @click="acceptRequest"
              :disabled="accepting"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 w-full sm:w-auto"
            >
              <span v-if="accepting">Accepting...</span>
              <span v-else>✓ Accept & Verify</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Remove Member Modal -->
    <div v-if="showRemoveModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="showRemoveModal = false">
      <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Remove Member</h3>
          <p class="text-sm text-gray-600 mb-4">
            Are you sure you want to remove <strong>{{ memberToRemove?.name }}</strong> from this institution?
            This action cannot be undone.
          </p>
          <div class="flex flex-col sm:flex-row justify-end gap-3">
            <button
              @click="showRemoveModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              @click="removeMember"
              :disabled="removing"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 w-full sm:w-auto"
            >
              <span v-if="removing">Removing...</span>
              <span v-else>Remove Member</span>
            </button>
          </div>
        </div>
      </div>
  </div>
    </ClientOnly>

</template>

<style scoped>
</style>