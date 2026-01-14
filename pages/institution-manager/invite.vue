<template>
  <PageHero
    title="Invite Users"
    description="Send invitations to join your institution"
    theme="purple"
  />

  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

    <div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden mb-8">
      <div class="p-6 sm:p-8 border-b border-gray-200 dark:border-slate-700">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Generate Invitation</h2>
      </div>
      <div class="p-6 sm:p-8">
        <form @submit.prevent="onGenerate" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Email</label>
              <input
                v-model="email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Role</label>
              <select
                v-model="role"
                class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600"
              >
                <option value="member">Member</option>
                <option value="quizee">Quizee</option>
                <option value="quiz-master">Quiz Master</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Expires (days)</label>
              <input
                v-model.number="expires_in_days"
                type="number"
                min="1"
                max="30"
                class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 bg-brand-600 hover:bg-brand-700 dark:hover:bg-brand-500 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {{ loading ? 'Generating...' : 'Generate invite link' }}
            </button>
            <button
              type="button"
              @click="sendViaBackend"
              :disabled="sending || !inviteToken"
              class="px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {{ sending ? 'Sending...' : 'Send via email' }}
            </button>
          </div>

          <div v-if="inviteUrl" class="bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-lg p-4">
            <div class="text-sm font-medium text-gray-900 dark:text-white mb-2">Invite URL</div>
            <div class="flex items-center gap-2">
              <input
                readonly
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                :value="inviteUrl"
              />
              <button
                type="button"
                @click="copyInvite"
                class="px-3 py-2 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-900 dark:text-white font-medium rounded-lg transition-colors duration-200 whitespace-nowrap"
              >
                Copy
              </button>
            </div>
          </div>

          <div v-if="message" class="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-800 dark:text-green-200">
            {{ message }}
          </div>
          <div v-if="error" class="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-200">
            {{ error }}
          </div>
        </form>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
      <div class="p-6 sm:p-8 border-b border-gray-200 dark:border-slate-700">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Pending Invitations</h2>
      </div>
      <div class="p-6 sm:p-8">
        <div v-if="invitesLoading" class="text-center text-gray-500 dark:text-gray-400">Loading invites...</div>
        <div v-else>
          <div v-if="invites.length === 0" class="text-center text-gray-500 dark:text-gray-400">No pending invitations.</div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
                  <th class="px-4 py-3 font-semibold">Email</th>
                  <th class="px-4 py-3 font-semibold">Role</th>
                  <th class="px-4 py-3 font-semibold">Invited by</th>
                  <th class="px-4 py-3 font-semibold">Expires</th>
                  <th class="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="inv in invites" :key="inv.id" class="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td class="px-4 py-3 text-gray-900 dark:text-gray-100">{{ inv.email }}</td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-400">
                    <span class="px-2 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-800 dark:text-brand-300 rounded text-xs font-medium">
                      {{ inv.role }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ inv.invited_by_name || '-' }}</td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{{ inv.expires_at }}</td>
                  <td class="px-4 py-3">
                    <button
                      @click="revoke(inv.invitation_token)"
                      class="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded transition-colors duration-200"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
definePageMeta({ layout: 'institution' })
import { ref } from 'vue'
import { useRuntimeConfig } from '#app'
import { useRoute } from 'vue-router'
import PageHero from '~/components/institution/PageHero.vue'
import useApi from '~/composables/useApi'

const route = useRoute()
const cfg = useRuntimeConfig()
const api = useApi()
const base = cfg.public?.apiBase || cfg.public?.baseUrl || ''

const email = ref('')
const role = ref('member')
const expires_in_days = ref(14)
const loading = ref(false)
const sending = ref(false)
const inviteUrl = ref('')
const inviteToken = ref('')
  const message = ref('')
  const error = ref('')
  const invites = ref([])
  const invitesLoading = ref(false)

const institutionId = route.params.institution || route.query.institution || null

async function onGenerate() {
  error.value = ''
  message.value = ''
  inviteUrl.value = ''
  inviteToken.value = ''
  loading.value = true
  try {
    const res = await api.postJson(`/api/institutions/${institutionId}/members/generate-token`, {
      email: email.value,
      role: role.value,
      expires_in_days: expires_in_days.value
    })
    const data = await res.json()
    if (!res.ok) {
      error.value = data?.message || data?.error || 'Failed to generate invite token'
      return
    }
    inviteUrl.value = data.invite_url
    inviteToken.value = data.invitation_token
    message.value = 'Invite link generated. You can copy it or send via backend.'
  } catch (e) {
    error.value = 'Unexpected error'
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function fetchInvites() {
  if (!institutionId) return
  invitesLoading.value = true
  try {
    const res = await api.get(`/api/institutions/${institutionId}/members/invites`)
    const data = await res.json()
    if (res.ok) {
      invites.value = data.invites || []
    } else {
      // ignore errors for now
    }
  } catch (e) {
    console.error('Failed to fetch invites', e)
  } finally {
    invitesLoading.value = false
  }
}

async function sendViaBackend() {
  if (!institutionId) { error.value = 'Institution not specified'; return }
  if (!email.value) { error.value = 'Email required'; return }
  sending.value = true
  message.value = ''
  error.value = ''
  try {
    const res = await api.postJson(`/api/institutions/${institutionId}/members/invite`, { 
      email: email.value, 
      role: role.value, 
      expires_in_days: expires_in_days.value 
    })
    const data = await res.json()
    if (!res.ok) {
      error.value = data?.message || data?.error || 'Failed to send invite'
      return
    }
    inviteToken.value = data.invitation_token
    // Reconstruct invite URL pointing to frontend (backend now includes ftoken in email, but we also show link)
    const frontend = cfg.public?.frontendUrl || cfg.public?.url || ''
    inviteUrl.value = data.invite_url || (frontend + '/email-verified?invite=' + data.invitation_token + '&email=' + encodeURIComponent(email.value))
    message.value = data.message || 'Invitation sent via backend email.'
  } catch (e) {
    console.error(e)
    error.value = 'Unexpected error while sending invite'
  } finally {
    sending.value = false
  }
}

function copyInvite() {
  if (!inviteUrl.value) return
  try {
    navigator.clipboard.writeText(inviteUrl.value)
    message.value = 'Invite URL copied to clipboard.'
  } catch (e) {
    error.value = 'Failed to copy; please copy manually.'
  }
}

async function revoke(token) {
  if (!confirm('Revoke this invitation?')) return
  try {
    const res = await api.del(`/api/institutions/${institutionId}/members/invites/${encodeURIComponent(token)}`)
    const data = await res.json()
    if (!res.ok) {
      error.value = data?.message || 'Failed to revoke invite'
      return
    }
    message.value = 'Invitation revoked'
    // refresh list
    await fetchInvites()
  } catch (e) {
    console.error(e)
    error.value = 'Failed to revoke invite'
  }
}

// Load invites on mount
if (institutionId) fetchInvites()
</script>


