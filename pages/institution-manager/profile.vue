<template>
  <div class="min-h-screen">
    <div class="max-w-4xl mx-auto space-y-6">
      <ProfileHeader
        :title="user?.name || 'Profile'"
        :subtitle="user?.email"
        :avatar-url="userAvatar"
      >
        <template #meta>
          <!-- optionally show institution name -->
          <span class="text-sm text-slate-500">Institution: {{ instName }}</span>
        </template>
      </ProfileHeader>

      <UiCard class="shadow-sm">
        <template #header>
          <div class="text-sm font-semibold">Profile details</div>
        </template>
        <div class="space-y-6 p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-500">Name</label>
              <p class="mt-1 text-lg text-slate-900">{{ user?.name || '—' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-500">Email</label>
              <p class="mt-1 text-lg text-slate-900">{{ user?.email || '—' }}</p>
            </div>
          </div>

          <div class="flex justify-end pt-4 border-t">
            <NuxtLink :to="{ path: '/institution/settings', query: { institutionSlug: instId } }" class="px-4 py-2 rounded-md text-sm text-white bg-indigo-600 hover:bg-indigo-700">Edit Profile</NuxtLink>
          </div>
        </div>
      </UiCard>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useInstitutionsStore } from '~/stores/institutions'
import { resolveAssetUrl } from '~/composables/useAssets'
import ProfileHeader from '~/components/profile/ProfileHeader.vue'
import UiCard from '~/components/ui/UiCard.vue'

definePageMeta({ layout: 'institution', meta: [ { name: 'robots', content: 'noindex, nofollow' }, { name: 'description', content: 'View your institution profile and manage institution-level settings.' } ] })

const auth = useAuthStore()
const instStore = useInstitutionsStore()

const user = computed(() => auth.user || {})
const userAvatar = computed(() => resolveAssetUrl(user.value?.avatar_url) || '/logo/avatar-placeholder.png')
const instId = computed(() => instStore.activeInstitutionSlug)
const instName = computed(() => instStore.institution?.name || '')
</script>
