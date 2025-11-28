/**
 * Composable for SSR taxonomy hydration
 * 
 * Usage in a page (subjects/index.vue):
 * 
 * const { data: taxonomyData } = await useTaxonomyHydration({
 *   fetchGrades: true,
 *   fetchSubjects: true,
 *   fetchTopics: false,
 * })
 * 
 * The store will be hydrated on the server, serialized, and restored on the client.
 * No refetch happens on hydration (SSR optimization).
 */

import { useTaxonomyStore } from '~/stores/taxonomyStore'

export interface TaxonomyHydrationOptions {
  fetchGrades?: boolean
  fetchSubjects?: boolean
  fetchTopics?: boolean
  fetchLevels?: boolean
  fetchCourses?: boolean
}

export async function useTaxonomyHydration(options: TaxonomyHydrationOptions = {}) {
  const store = useTaxonomyStore()
  const { fetchGrades, fetchSubjects, fetchTopics, fetchLevels, fetchCourses } = options

  // Fetch on server and client. Subsequent calls on client will be served from cache (SSR hydration).
  const promises = []

  if (fetchGrades) promises.push(store.fetchGrades())
  if (fetchLevels) promises.push(store.fetchLevels())
  if (fetchSubjects) promises.push(store.fetchAllSubjects())
  if (fetchTopics) promises.push(store.fetchAllTopics())
  if (fetchCourses) promises.push(Promise.resolve()) // Placeholder for fetchCourses if implemented

  await Promise.all(promises)

  // Return serialized cache for SSR to send to client
  return {
    data: store.serializeCache(),
  }
}

/**
 * Hook to restore hydrated cache on client
 * Usage: call in onMounted() or during page setup to restore from SSR payload
 */
export function useRestoreTaxonomyCache(payload?: Record<string, any>) {
  const store = useTaxonomyStore()

  if (payload) {
    store.hydrateCache(payload)
  }

  // Return utility to check if cache is populated
  const isCached = () => {
    return store.grades.length > 0 || store.subjects.length > 0 || store.topics.length > 0
  }

  return { isCached }
}

/**
 * Dev utility to print cache metrics
 * Usage: call in dev environment to see cache hit/miss rates
 */
export function useMetricsDebug() {
  const store = useTaxonomyStore()

  const print = () => store.printMetrics()
  const getMetrics = () => store.getMetrics()

  return { print, getMetrics }
}

