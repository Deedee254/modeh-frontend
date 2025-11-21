<template>
  <aside class="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 w-64 min-h-screen p-4">
    <div class="mb-6">
  <NuxtLink :to="linkTo('/institution-manager/dashboard')" class="block text-lg font-semibold">Dashboard</NuxtLink>
    </div>

    <nav class="space-y-2 text-sm">
  <NuxtLink :to="linkTo('/institution-manager/subscriptions')" class="block px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Subscriptions</NuxtLink>
  <NuxtLink :to="linkTo('/institution-manager/institutions/[slug]/members')" class="block px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Members</NuxtLink>
  <NuxtLink :to="linkTo('/institution-manager/institutions/[slug]/analytics')" class="block px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Analytics</NuxtLink>
  <NuxtLink :to="linkTo('/institution-manager/quizees')" class="block px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Quizees</NuxtLink>
  <NuxtLink :to="linkTo('/institution-manager/quiz-masters')" class="block px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Quiz Masters</NuxtLink>
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
  // prefer explicit query param if present, otherwise fall back to loaded store institution slug
  const instSlug = route.query.institutionSlug || instStore.institution?.slug
  // If we have an institution slug, prefer nested routes under /institution-manager/institutions/:slug/*
  if (instSlug) {
    if (path === '/institution-manager/dashboard' || path === '/institution-manager') {
      return { path: `/institution-manager/institutions/${String(instSlug)}/analytics` }
    }
    if (path === '/institution-manager/institutions/[slug]/members') {
      return { path: `/institution-manager/institutions/${String(instSlug)}/members` }
    }
    if (path === '/institution-manager/institutions/[slug]/analytics') {
      return { path: `/institution-manager/institutions/${String(instSlug)}/analytics` }
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
  return { path }
}
</script>

<style scoped>
/* minimal — responsive behavior handled by layout */
</style>
