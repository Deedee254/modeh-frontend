<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-4">Invite users to your institution</h1>

    <form @submit.prevent="onGenerate" class="space-y-4 bg-white p-4 rounded shadow">
      <div>
        <label class="block text-sm font-medium text-gray-700">Email</label>
        <input v-model="email" type="email" required class="mt-1 block w-full border rounded p-2" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Role</label>
        <select v-model="role" class="mt-1 block w-full border rounded p-2">
          <option value="member">Member</option>
          <option value="quizee">Quizee</option>
          <option value="quiz-master">Quiz Master</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Expires (days)</label>
        <input v-model.number="expires_in_days" type="number" min="1" max="30" class="mt-1 block w-32 border rounded p-2" />
      </div>

      <div class="flex gap-2">
        <button type="submit" class="btn btn-primary" :disabled="loading">{{ loading ? 'Generating...' : 'Generate invite link' }}</button>
        <button type="button" class="btn" @click="sendViaBackend" :disabled="sending || !inviteToken">{{ sending ? 'Sending...' : 'Send via backend email' }}</button>
      </div>

      <div v-if="inviteUrl" class="mt-4 bg-gray-50 p-3 rounded">
        <div class="text-sm text-gray-600">Invite URL (copy & paste into your email client)</div>
        <div class="mt-2 flex items-center gap-2">
          <input readonly class="flex-1 p-2 border rounded" :value="inviteUrl" />
          <button class="btn" @click="copyInvite">Copy</button>
        </div>
      </div>

      <div v-if="message" class="mt-3 text-sm text-green-600">{{ message }}</div>
      <div v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</div>
    </form>
    
    <div class="mt-8 bg-white p-4 rounded shadow">
      <h2 class="text-lg font-medium mb-3">Pending invitations</h2>
      <div v-if="invitesLoading" class="text-gray-500">Loading invites...</div>
      <div v-else>
        <div v-if="invites.length === 0" class="text-sm text-gray-600">No pending invitations.</div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="text-left text-gray-600 border-b">
              <th class="py-2">Email</th>
              <th class="py-2">Invited by</th>
              <th class="py-2">Role</th>
              <th class="py-2">Expires</th>
              <th class="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in invites" :key="inv.id" class="border-b">
              <td class="py-2">{{ inv.email }}</td>
              <td class="py-2">{{ inv.invited_by_name || '-' }}</td>
              <td class="py-2">{{ inv.role }}</td>
              <td class="py-2">{{ inv.expires_at }}</td>
              <td class="py-2">
                <button class="btn" @click="revoke(inv.invitation_token)">Revoke</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRuntimeConfig } from '#app'
import { useRoute } from 'vue-router'

const route = useRoute()
const cfg = useRuntimeConfig()
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
    const res = await fetch(`${base}/api/institutions/${institutionId}/members/generate-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: email.value, role: role.value, expires_in_days: expires_in_days.value })
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
    const res = await fetch(`${base}/api/institutions/${institutionId}/members/invites`, { credentials: 'include' })
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
    const res = await fetch(`${base}/api/institutions/${institutionId}/members/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: email.value, role: role.value, expires_in_days: expires_in_days.value })
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
    const res = await fetch(`${base}/api/institutions/${institutionId}/members/invites/${encodeURIComponent(token)}`, {
      method: 'DELETE',
      credentials: 'include'
    })
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

<style scoped>
.btn { padding: .5rem 1rem; border-radius: .375rem; font-weight: 600 }
.btn-primary { background-color: var(--primary); color: var(--primary-foreground) }
</style>
