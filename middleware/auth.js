import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  
  // If user already present, allow
  if (auth.user) return

  // Try silent user fetch if not already authenticated
  try {
    await auth.fetchUser()
  } catch (error) {
    // If fetch fails, redirect to login
    return navigateTo(`/login?next=${encodeURIComponent(to.fullPath)}`)
  }

  // Ensure we have a user after fetch attempt
  if (!auth.user) {
    return navigateTo(`/login?next=${encodeURIComponent(to.fullPath)}`)
  }
  
  // User is authenticated, allow access
  return
})
