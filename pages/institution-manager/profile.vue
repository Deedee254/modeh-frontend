<template>
  <PageHero
    title="My Profile"
    description="Manage your account settings and preferences"
    theme="blue"
  />

  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="space-y-8">
      <ProfileHeader
        :title="userForm.name || 'Profile'"
        :subtitle="user?.email"
        :avatar-url="userAvatar"
      >
        <template #meta>
          <span class="text-sm text-slate-500">Institution: {{ instName }}</span>
        </template>
      </ProfileHeader>

      <div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        <div class="p-6 sm:p-8 border-b border-gray-200 dark:border-slate-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Edit Profile</h2>
        </div>
        <div class="p-6 sm:p-8">
          <form @submit.prevent="submit" class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Name</label>
                <input
                  v-model="userForm.name"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Email</label>
                <input
                  v-model="userForm.email"
                  type="email"
                  disabled
                  class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-100 dark:bg-slate-600/50 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div class="border-t border-gray-200 dark:border-slate-700 pt-6">
              <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Avatar</label>
              <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <img :src="userAvatar" class="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 mx-auto sm:mx-0" />
                <div class="text-center sm:text-left">
                  <input
                    type="file"
                    @change="onFileChange"
                    accept="image/*"
                    class="block text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 dark:file:bg-brand-900/30 file:text-brand-700 dark:file:text-brand-400 hover:file:bg-brand-100 dark:hover:file:bg-brand-900/50"
                  />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Supported formats: JPG, PNG, GIF</p>
                </div>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-200 dark:border-slate-700">
              <button
                type="button"
                @click="resetForm"
                class="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200 w-full sm:w-auto"
              >
                Reset
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="px-4 py-2 bg-brand-600 hover:bg-brand-700 dark:hover:bg-brand-500 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 w-full sm:w-auto"
              >
                Save changes
              </button>
            </div>

            <div v-if="error" class="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-200">
              {{ error }}
            </div>
            <div v-if="success" class="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-800 dark:text-green-200">
              {{ success }}
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useInstitutionsStore } from '~/stores/institutions'
import { resolveAvatar } from '~/composables/useAssets'
import ProfileHeader from '~/components/profile/ProfileHeader.vue'
import UiCard from '~/components/ui/UiCard.vue'
import { useAccountApi } from '~/composables/useAccountApi'
import PageHero from '~/components/institution/PageHero.vue'

definePageMeta({ layout: 'institution', meta: [ { name: 'robots', content: 'noindex, nofollow' }, { name: 'description', content: 'Manage your institution manager profile and settings.' } ] })

const auth = useAuthStore()
const instStore = useInstitutionsStore()
const accountApi = useAccountApi()

const user = computed(() => auth.user || { name: '', email: '', avatarUrl: '', avatar: '', avatar_url: '' })
// Auth store normalizes backend snake_case to camelCase (avatar_url -> avatarUrl)
const userAvatar = computed(() => resolveAvatar(auth.userAvatar, auth.user?.name))
const instId = computed(() => instStore.activeInstitutionSlug)
const instName = computed(() => instStore.institution?.name || '')

const userForm = reactive({ name: user.value?.name || '', email: user.value?.email || '' })
const avatarFile = ref<File | null>(null)
const loading = accountApi.loading
const error = ref<any>(null)
const success = ref<any>(null)

function resetForm() {
  userForm.name = user.value?.name || ''
  userForm.email = user.value?.email || ''
  avatarFile.value = null
  error.value = null
  success.value = null
}

function onFileChange(e: Event) {
  const f = (e.target as HTMLInputElement).files && (e.target as HTMLInputElement).files?.[0]
  if (f) avatarFile.value = f
}

async function submit() {
  error.value = null
  success.value = null
  try {
    const form = new FormData()
    form.append('name', userForm.name)
    // email not editable but include for completeness
    form.append('email', userForm.email)
    if (avatarFile.value) form.append('avatar', avatarFile.value)

    const resJson = await accountApi.patchMe(form)
    // refresh auth user state
    await auth.fetchUser()
    success.value = 'Profile updated'
  } catch (e) {
    error.value = (e as Error)?.message || 'Failed to update profile'
    throw e
  }
}
</script>
