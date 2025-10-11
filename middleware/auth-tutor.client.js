export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only guard quiz-master routes
  if (!to.path.startsWith('/quiz-master')) return

  const auth = await import('~/stores/auth').then(m => m.useAuthStore())

  // If user already present, allow
  if (auth.user) return

  // Attempt to fetch current user silently
  try {
    await auth.fetchUser()
  } catch (e) {
    // ignore
  }

  // If still no user, redirect to login
  if (!auth.user) {
    return navigateTo('/login')
  }
})
