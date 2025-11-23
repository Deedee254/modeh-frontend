<template>
  <PageHero
    title="Your Institutions"
    description="Manage and oversee all institutions you administer"
    :breadcrumbs="[
      { text: 'Institution Manager', href: '/institution-manager/dashboard' },
      { text: 'Institutions', current: true }
    ]"
  >
    <template #eyebrow>
      Institution Management
    </template>
    <template #actions>
      <NuxtLink to="/institution-manager/institutions/new" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">Create Institution</NuxtLink>
    </template>
  </PageHero>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

    <div v-if="loading" class="flex justify-center py-12">
      <div class="text-gray-500 dark:text-gray-400">Loading…</div>
    </div>
    <div v-else>
      <div v-if="institutions.length === 0" class="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center">
        <p class="text-amber-900 dark:text-amber-100">You don't manage any institutions yet.</p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="inst in institutions"
          :key="inst.id"
          class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col"
        >
          <div class="p-6 flex-1 flex flex-col">
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">{{ inst.name }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ inst.email }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-500 mt-1 font-mono">{{ inst.slug }}</p>
            </div>

            <div class="space-y-2 flex-1">
              <NuxtLink
                :to="`/institution-manager/institutions/${inst.slug}/analytics`"
                class="block px-3 py-2 text-sm font-medium text-center bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors duration-200"
              >
                Analytics
              </NuxtLink>
              <div class="grid grid-cols-2 gap-2">
                <NuxtLink
                  :to="`/institution-manager/institutions/${inst.slug}/quizees`"
                  class="block px-3 py-2 text-sm font-medium text-center bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors duration-200"
                >
                  Quizees
                </NuxtLink>
                <NuxtLink
                  :to="`/institution-manager/institutions/${inst.slug}/quiz-masters`"
                  class="block px-3 py-2 text-sm font-medium text-center bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors duration-200"
                >
                  Quiz Masters
                </NuxtLink>
              </div>
              <NuxtLink
                :to="`/institution-manager/institutions/new?parent=${inst.slug}`"
                class="block px-3 py-2 text-sm font-medium text-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-lg transition-colors duration-200"
              >
                Create Branch
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'institution' })
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'
import PageHero from '~/components/ui/PageHero.vue'

const auth = useAuthStore()
const api = useApi()
const loading = ref(false)
const institutions = ref([])

// Prefer using the authenticated user's institutions if present, otherwise fetch
if (auth.user && auth.user.institutions && auth.user.institutions.length) {
  institutions.value = auth.user.institutions
} else {
  loading.value = true
  try {
    const resp = await api.get('/api/me')
    const json = await api.parseResponse(resp)
    institutions.value = json?.user?.institutions || []
  } catch (e) {
    institutions.value = []
  } finally { loading.value = false }
}
</script>
