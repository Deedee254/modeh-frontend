<template>
  <div class="w-full">
    <div class="mb-8">
      <NuxtLink to="/parent/settings" class="text-sm text-brand-600 hover:text-brand-700 font-medium mb-4 flex items-center gap-1">
        <Icon name="heroicons:arrow-left" class="w-4 h-4" />
        Back to Settings
      </NuxtLink>

      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">View and manage your profile information</p>
    </div>

    <div class="max-w-2xl">
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-8">
        <div class="text-center mb-8">
          <img :src="userAvatar" class="w-24 h-24 rounded-full object-cover mx-auto mb-4" />
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ user.name }}</h2>
          <p class="text-gray-600 dark:text-gray-400 mt-1">{{ user.email }}</p>
          <span class="inline-block mt-3 px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full text-sm font-medium">
            Parent
          </span>
        </div>

        <div class="border-t dark:border-slate-700 pt-8 space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
            <p class="text-lg text-gray-900 dark:text-white">{{ user.name || 'Not set' }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
            <p class="text-lg text-gray-900 dark:text-white">{{ user.email }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</label>
            <p class="text-lg text-gray-900 dark:text-white">{{ user.phone || 'Not set' }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Member Since</label>
            <p class="text-lg text-gray-900 dark:text-white">{{ formatDate(user.created_at) }}</p>
          </div>
        </div>

        <div class="border-t dark:border-slate-700 mt-8 pt-8">
          <NuxtLink
            to="/parent/settings"
            class="inline-block px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors"
          >
            Edit Profile
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { resolveAssetUrl } from '~/composables/useAssets'

definePageMeta({ layout: 'parent' })

const auth = useAuthStore()
const user = computed(() => auth.user || {})

const userAvatar = computed(() => resolveAssetUrl(auth.userAvatar) || '/logo/avatar-placeholder.png')

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>
