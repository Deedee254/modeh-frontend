<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-xl bg-white rounded-lg shadow p-8">
      <div class="text-center">
        <h2 class="text-2xl font-bold mb-2">Email verification</h2>
        <p class="text-sm text-gray-600 mb-6">We'll help you finish the sign in so you can continue.</p>
      </div>

      <div v-if="error" class="text-center">
        <p class="text-red-600 mb-4">{{ errorMessage }}</p>
        <div class="flex justify-center gap-3">
          <NuxtLink to="/contact" class="btn btn-primary">Contact support</NuxtLink>
          <NuxtLink to="/" class="btn">Home</NuxtLink>
        </div>
      </div>

      <div v-else class="text-center">
        <p v-if="verified" class="text-green-600 mb-4">Your email has been verified.</p>
        <p v-else class="text-gray-700 mb-4">Processing verification...</p>

        <!-- Invitation / institution preview (if present) -->
        <div v-if="invitationLoading" class="mb-4 text-left border rounded p-4 bg-gray-50 animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div class="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div v-else-if="invitation" class="mb-4 text-left border rounded p-4 bg-gray-50">
          <div class="flex items-center gap-4">
            <div v-if="invitation.institution?.logo_url" class="w-16 h-16 flex-shrink-0">
              <img :src="resolveAssetUrl(invitation.institution.logo_url)" alt="{{ invitation.institution?.name || 'logo' }}" class="w-16 h-16 rounded-full object-cover" />
            </div>
            <div class="flex-1">
              <div class="text-sm text-gray-600">Invitation to join</div>
              <div class="text-lg font-semibold">{{ invitation.institution?.name || invitation.institution_name || 'Institution' }}</div>
              <div class="text-sm text-gray-500">Role: {{ invitation.role || invitation.invitation_role || 'member' }}</div>
              <div v-if="formattedExpiry" class="text-sm text-gray-500 mt-1">Expires: {{ formattedExpiry }}</div>
            </div>
          </div>
          <div class="text-xs text-gray-500 mt-3">If this invite looks suspicious, do not accept it and <NuxtLink to="/contact" class="underline">contact support</NuxtLink>.</div>
        </div>

        <div class="flex justify-center gap-3">
          <!-- If a verification token is present show Verify button -->
          <button v-if="token && !verified" @click="triggerVerification" :disabled="isVerifying" class="btn btn-primary">
            {{ isVerifying ? 'Verifying...' : 'Verify and continue' }}
          </button>
          <!-- If an invitation token is present (and no verify token) show Accept Invite -->
          <button v-else-if="inviteToken && !token" @click="acceptInvite" class="btn btn-primary">Accept invitation and join</button>
          <button v-else-if="auth.user" @click="handleContinue" class="btn btn-primary">Continue to Affiliate</button>
          <button v-else-if="!token && !inviteToken" @click="handleSignIn" class="btn btn-primary">Sign in / Register</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import useApi from '~/composables/useApi'
import resolveAssetUrl from '~/composables/useAssets'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const api = useApi()

const verified = ref(false)
const error = ref(false)
const errorMessage = ref('')

const email = computed(() => route.query.email || null)
const status = computed(() => route.query.status || null)
 const token = computed(() => route.query.token || null)
 const ftoken = computed(() => route.query.ftoken || route.query.frontend_token || null)
const inviteToken = computed(() => route.query.invite || route.query.invitation || null)

const shouldRedirectToLogin = computed(() => !auth.user)

// Decide continue path for authenticated users based on role
const continuePath = computed(() => {
  const role = auth.user?.role
  if (role === 'quiz-master') return '/quiz-master/affiliate'
  // default to quizee affiliate area
  return '/quizee/affiliate'
})

function saveAffiliateIntent() {
  if (process.client) {
    try {
      const intent = { type: 'affiliate', email: email.value || null, from: route.fullPath, ts: Date.now() }
      localStorage.setItem('modeh:postLoginIntent', JSON.stringify(intent))
    } catch (e) { /* ignore */ }
  }
}

function saveInvitationIntent(tokenVal) {
  if (process.client) {
    try {
      const intent = { type: 'accept-invitation', token: tokenVal, from: route.fullPath, ts: Date.now() }
      localStorage.setItem('modeh:postLoginIntent', JSON.stringify(intent))
    } catch (e) { /* ignore */ }
  }
}

onMounted(async () => {
  // If the backend returned a status (error) show it and do not proceed
  if (status.value) {
    error.value = true
    errorMessage.value = String(status.value)
    return
  }

  // If verified param present, confirm with backend and show friendly UI (no auto-redirect)
  if (String(route.query.verified) === '1') {
    try {
      // call our verify-status endpoint to confirm server-side verification
      const url = `/api/auth/verify-status?email=${encodeURIComponent(email.value || '')}`
      const resp = await api.get(url)
      if (!resp.ok) {
        verified.value = false
        error.value = true
        errorMessage.value = 'Failed to confirm verification status.'
        return
      }
      const data = await resp.json().catch(() => null)
      if (data && data.verified) {
        verified.value = true
      } else {
        verified.value = false
        error.value = true
        errorMessage.value = data?.error ?? 'Email not verified'
      }
    } catch (e) {
      error.value = true
      errorMessage.value = 'Verification confirmation failed.'
      console.error(e)
    }
    // Do NOT auto-redirect: show the user buttons to continue or sign in.
    return
  }
  // If a token is present (landing from email link), wait for the user to trigger verification
  if (token.value) {
    // do not auto-run; present the verify button — optionally we could auto-run here
    // also attempt to fetch invitation details if an invite token is present
    if (inviteToken.value) {
      invitationLoading.value = true
      try {
        const invUrl = `/api/institutions/invitation/${encodeURIComponent(inviteToken.value)}`
        const invRes = await api.get(invUrl)
        if (invRes.ok) {
          const invData = await invRes.json().catch(() => null)
          invitation.value = invData?.invitation || null
        }
      } catch (e) {
        console.error('Failed to fetch invitation details', e)
      } finally {
        invitationLoading.value = false
      }
    }
    return
  }

  // If an invite token is present (no direct verify token), fetch invite details so we can preview
  if (inviteToken.value) {
    invitationLoading.value = true
    try {
      const invUrl = `/api/institutions/invitation/${encodeURIComponent(inviteToken.value)}`
      const invRes = await api.get(invUrl)
      if (invRes.ok) {
        const invData = await invRes.json().catch(() => null)
        invitation.value = invData?.invitation || null
      }
    } catch (e) {
      console.error('Failed to fetch invitation details', e)
    } finally {
      invitationLoading.value = false
    }
  }

  // Otherwise no explicit verification flag — show generic message and wait for user
  return
})

function handleSignIn() {
  // Save intent and redirect to login
  saveAffiliateIntent()
  router.push({ name: 'login', query: { returnTo: route.fullPath } })
}

function handleContinue() {
  router.push(continuePath.value)
}

const isVerifying = ref(false)
const invitation = ref(null)
const invitationLoading = ref(false)

function formatDate(iso) {
  if (!iso) return null
  try {
    const d = new Date(iso)
    // use a concise localised format
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch (e) {
    return iso
  }
}

const formattedExpiry = computed(() => {
  return invitation.value?.expires_at ? formatDate(invitation.value.expires_at) : null
})

async function triggerVerification() {
  if (!token.value) return
  isVerifying.value = true
  try {
    const url = '/api/auth/verify-email'
    const res = await api.postJson(url, { token: token.value, ftoken: ftoken.value })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      error.value = true
      errorMessage.value = body?.error || 'Verification failed'
      isVerifying.value = false
      return
    }
    const data = await res.json().catch(() => null)
      if (data && data.verified) {
        verified.value = true
        // After verification, if there's an invitation token, attempt to accept it or save intent
        if (inviteToken.value) {
          // If logged in, accept immediately
          if (auth.user) {
            try {
              // fetch invitation details to get institution id
              const invUrl = `/api/institutions/invitation/${encodeURIComponent(inviteToken.value)}`
              const invRes = await api.get(invUrl)
              if (invRes.ok) {
                const invData = await invRes.json().catch(() => null)
                const institutionId = invData?.invitation?.institution_id
                if (institutionId) {
                  const acceptUrl = `/api/institutions/${institutionId}/members/accept-invitation/${encodeURIComponent(inviteToken.value)}`
                  const acceptRes = await api.postJson(acceptUrl, {})
                  if (acceptRes.ok) {
                    // Redirect to institution dashboard or institution page
                    setTimeout(() => router.push('/institution-manager/dashboard'), 300)
                    return
                  }
                }
              }
            } catch (e) {
              console.error('Accept invitation failed', e)
            }
          }
          // Not logged in: save invitation intent and redirect to login
          saveInvitationIntent(inviteToken.value)
          router.push({ name: 'login', query: { returnTo: route.fullPath } })
          return
        }

        // If there's no invitation, handle affiliate intent as before
        if (auth.user) {
          setTimeout(() => router.push(continuePath.value), 300)
          return
        }
        saveAffiliateIntent()
        router.push({ name: 'login', query: { returnTo: route.fullPath } })
      } else {
      error.value = true
      errorMessage.value = data?.error || 'Verification failed'
    }
  } catch (e) {
    console.error(e)
    error.value = true
    errorMessage.value = 'Verification request failed.'
  } finally {
    isVerifying.value = false
  }
}

async function acceptInvite() {
  if (!inviteToken.value) return
  // If user logged in, attempt to accept immediately
  if (auth.user) {
    try {
      const invUrl = `/api/institutions/invitation/${encodeURIComponent(inviteToken.value)}`
      const invRes = await api.get(invUrl)
      if (!invRes.ok) {
        error.value = true
        errorMessage.value = 'Invalid or expired invitation'
        return
      }
      const invData = await invRes.json().catch(() => null)
      const institutionId = invData?.invitation?.institution_id
      if (!institutionId) {
        error.value = true
        errorMessage.value = 'Invalid invitation data'
        return
      }
      const acceptUrl = `/api/institutions/${institutionId}/members/accept-invitation/${encodeURIComponent(inviteToken.value)}`
      const acceptRes = await api.postJson(acceptUrl, {})
      if (!acceptRes.ok) {
        error.value = true
        errorMessage.value = 'Failed to accept invitation'
        return
      }
      // success
      router.push('/institution-manager/dashboard')
    } catch (e) {
      console.error(e)
      error.value = true
      errorMessage.value = 'Failed to accept invitation'
    }
    return
  }

  // Not authenticated: save intent and redirect to login
  saveInvitationIntent(inviteToken.value)
  router.push({ name: 'login', query: { returnTo: route.fullPath } })
}
</script>

<style scoped>
.btn { padding: .5rem 1rem; border-radius: .375rem; font-weight: 600 }
.btn-primary { background-color: var(--primary); color: var(--primary-foreground) }
</style>
