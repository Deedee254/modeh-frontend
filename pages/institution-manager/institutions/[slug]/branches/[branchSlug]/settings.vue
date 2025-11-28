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
const loading = ref(false)
const saving = ref(false)
const error = ref(null as any)

const branch = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  timezone: 'UTC',
  description: '',
  is_active: true
} as any)

async function loadBranch() {
  loading.value = true
  error.value = null
  try {
    const resp = await api.get(`/api/institutions/${institutionSlug}/branches/${branchSlug}`)
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    if (json) {
      branch.value = {
        name: json.name || '',
        email: json.email || '',
        phone: json.phone || '',
        address: json.address || '',
        timezone: json.timezone || 'UTC',
        description: json.description || '',
        is_active: json.is_active !== false
      }
    }
  } catch (e: any) {
    error.value = e
  } finally {
    loading.value = false
  }
}

async function saveBranch() {
  saving.value = true
  try {
    const resp = await api.putJson(`/api/institutions/${institutionSlug}/branches/${branchSlug}`, branch.value)
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    if (resp.ok) {
      appAlert.push({ message: 'Branch settings saved successfully', type: 'success' })
    } else {
      appAlert.push({ message: json?.message || 'Failed to save settings', type: 'error' })
    }
  } catch (e: any) {
    appAlert.push({ message: 'Failed to save settings: ' + (e?.message ?? e), type: 'error' })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadBranch()
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-slate-900">
    <PageHero
      title="Branch Settings"
      description="Manage branch information and configuration"
      theme="purple"
    />

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <LoadingSpinner v-if="loading" />
      <ErrorAlert v-else-if="error" :error="error" />

      <div v-else class="space-y-8">
        <!-- Basic Information -->
        <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Basic Information</h2>
          
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Branch Name</label>
              <input
                v-model="branch.name"
                type="text"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-600 focus:border-brand-500 dark:bg-slate-700 dark:text-gray-100"
                placeholder="Enter branch name"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
              <input
                v-model="branch.email"
                type="email"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-600 focus:border-brand-500 dark:bg-slate-700 dark:text-gray-100"
                placeholder="branch@example.com"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
              <input
                v-model="branch.phone"
                type="tel"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-600 focus:border-brand-500 dark:bg-slate-700 dark:text-gray-100"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
              <input
                v-model="branch.address"
                type="text"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-600 focus:border-brand-500 dark:bg-slate-700 dark:text-gray-100"
                placeholder="Street address"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                v-model="branch.description"
                rows="4"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-600 focus:border-brand-500 dark:bg-slate-700 dark:text-gray-100"
                placeholder="Branch description"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Regional Settings -->
        <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Regional Settings</h2>
          
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Timezone</label>
              <select
                v-model="branch.timezone"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-600 focus:border-brand-500 dark:bg-slate-700 dark:text-gray-100"
              >
                <option value="UTC">UTC</option>
                <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                <option value="Africa/Cairo">Africa/Cairo (EET)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Europe/Paris">Europe/Paris (CET/CEST)</option>
                <option value="America/New_York">America/New_York (EST/EDT)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Status -->
        <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Status</h2>
          
          <div class="flex items-center">
            <input
              v-model="branch.is_active"
              type="checkbox"
              class="h-4 w-4 text-brand-600 focus:ring-brand-600 border-gray-300 rounded"
            />
            <label class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Branch is active
            </label>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">When active, members can access this branch and its quizzes.</p>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button
            @click="saveBranch"
            :disabled="saving"
            class="px-6 py-2 text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50 font-medium"
          >
            <span v-if="saving">Saving...</span>
            <span v-else>Save Changes</span>
          </button>
          <NuxtLink
            :to="`/institution-manager/institutions/${institutionSlug}/branches/${branchSlug}`"
            class="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 font-medium"
          >
            Cancel
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
