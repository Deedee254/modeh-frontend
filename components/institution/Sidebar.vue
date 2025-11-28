<template>
  <aside class="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 w-64 min-h-screen p-4">
    <div class="mb-6">
      <NuxtLink :to="linkTo('/institution-manager/institutions/[slug]/analytics')" class="block text-lg font-semibold">
        <span class="flex items-center gap-2">
          <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6"/></svg>
          <span>Dashboard</span>
        </span>
      </NuxtLink>
        </div>

    <nav class="space-y-4 text-sm">
      <!-- Institution section -->
      <div>
        <div class="px-2 text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Institution</div>
        <div class="space-y-1">
          <NuxtLink :to="linkTo('/institution-manager/institutions')" class="block px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18"/></svg>
              <span>Institutions</span>
            </span>
          </NuxtLink>
          <NuxtLink :to="linkTo('/institution-manager/institutions/[slug]/analytics')" class="block px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3v18M21 12H3"/></svg>
              <span>Analytics</span>
            </span>
          </NuxtLink>
          <NuxtLink :to="linkTo('/institution-manager/institutions/[slug]/branches')" class="block px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18v13H3zM7 3v4"/></svg>
              <span>Branches</span>
            </span>
          </NuxtLink>
        </div>
      </div>

      <!-- Members section -->
      <div>
        <div class="px-2 text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Members</div>
        <div class="space-y-1">
          <NuxtLink :to="linkTo('/institution-manager/institutions/[slug]/members')" class="block px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              <span>All Members</span>
            </span>
          </NuxtLink>
          <NuxtLink :to="linkTo('/institution-manager/institutions/[slug]/quizees')" class="block px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422A12.083 12.083 0 0118 20.5a12.082 12.082 0 01-6 1.5c-2.065 0-3.99-.502-6-1.5A12.083 12.083 0 016 10.578L12 14z"/></svg>
              <span>Quizees</span>
            </span>
          </NuxtLink>
          <NuxtLink :to="linkTo('/institution-manager/institutions/[slug]/quiz-masters')" class="block px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/></svg>
              <span>Quiz Masters</span>
            </span>
          </NuxtLink>
          <NuxtLink :to="linkTo('/institution-manager/invite')" class="block px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12V8a4 4 0 10-8 0v4"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 20h18"/></svg>
              <span>Invite</span>
            </span>
          </NuxtLink>
          <NuxtLink :to="linkTo('/institution-manager/invite-history')" class="block px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V11H3v8a2 2 0 002 2z"/></svg>
              <span>Invite History</span>
            </span>
          </NuxtLink>
        </div>
      </div>

      <!-- Billing & seats -->
      <div>
        <div class="px-2 text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Billing & Seats</div>
        <div class="space-y-1">
          <NuxtLink :to="linkTo('/institution-manager/subscriptions')" class="block px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 1.343-3 3v6h6v-6c0-1.657-1.343-3-3-3z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 20h14"/></svg>
              <span>Subscriptions</span>
            </span>
          </NuxtLink>
          <NuxtLink :to="linkTo('/institution-manager/institutions/[slug]/assigned-seats')" class="block px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 10-8 0v4"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 20h18"/></svg>
              <span>Assigned Seats</span>
            </span>
          </NuxtLink>
        </div>
      </div>

      <!-- Settings / other -->
      <div>
        <div class="px-2 text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Settings</div>
        <div class="space-y-1">
          <NuxtLink :to="linkTo('/institution-manager/settings')" class="block px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82L4.21 6.21a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H11a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09c.12.7.52 1.3 1 1.51.6.26 1.21.12 1.82-.33l.06-.06A2 2 0 0119.79 6.21l-.06.06c-.45.61-.59 1.22-.33 1.82.21.48.81.88 1.51 1V11c0 .39-.14.77-.36 1.1z"/></svg>
              <span>Settings</span>
            </span>
          </NuxtLink>
        </div>
      </div>
    </nav>

    <div class="mt-auto pt-6">
      <slot name="footer" />
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useInstitutionsStore } from '~/stores/institutions'

const route = useRoute()
const instStore = useInstitutionsStore()

function linkTo(path) {
  // prefer (in order): route param slug (nested routes), activeInstitutionSlug from store,
  // explicit query param, then any loaded institution slug in the store
  const instSlug = route.params?.slug || instStore.activeInstitutionSlug || route.query.institutionSlug || instStore.institution?.slug
  // If we have an institution slug, prefer nested routes under /institution-manager/institutions/:slug/*
  if (instSlug) {
    if (path === '/institution-manager/dashboard' || path === '/institution-manager') {
      return { path: `/institution-manager/institutions/${String(instSlug)}/analytics` }
    }

    // map assigned-seats to the per-institution nested route when we have a slug
    if (instSlug && (path === '/institution-manager/assigned-seats' || path === '/institution-manager/institutions/[slug]/assigned-seats')) {
      return { path: `/institution-manager/institutions/${String(instSlug)}/assigned-seats` }
    }
    if (path === '/institution-manager/institutions/[slug]/members') {
      return { path: `/institution-manager/institutions/${String(instSlug)}/members` }
    }
    if (path === '/institution-manager/institutions/[slug]/analytics') {
      return { path: `/institution-manager/institutions/${String(instSlug)}/analytics` }
    }
    if (path === '/institution-manager/institutions/[slug]/branches') {
      return { path: `/institution-manager/institutions/${String(instSlug)}/branches` }
    }
    if (path === '/institution-manager/quizees' || path.endsWith('/quizees')) {
      return { path: `/institution-manager/institutions/${String(instSlug)}/quizees` }
    }
    if (path === '/institution-manager/quiz-masters' || path.endsWith('/quiz-masters')) {
      return { path: `/institution-manager/institutions/${String(instSlug)}/quiz-masters` }
    }
    // for subscriptions we still use top-level page but include slug as query
    if (path === '/institution-manager/subscriptions') {
      return { path, query: { institutionSlug: String(instSlug) } }
    }
  }

  // fallback: return the provided path (no slug available)
  // If no institution slug is available, remove the [slug] segment so links point
  // to the institutions list instead of a literal placeholder path.
  try {
    if (typeof path === 'string') {
      const pathStr = String(path)
      // If the path points to any nested route under /institution-manager/institutions/[slug]/...
      // (for example branches, members, analytics), drop the suffix and send user to
      // the institutions list instead of producing /institution-manager/institutions/branches
      if (pathStr.startsWith('/institution-manager/institutions/[slug]/')) {
        return { path: '/institution-manager/institutions' }
      }

      const cleaned = pathStr.replace('/institutions/[slug]', '/institutions')
      return { path: cleaned }
    }
  } catch (e) {}
  return { path }
}
</script>

<style scoped>
/* minimal — responsive behavior handled by layout */
</style>

