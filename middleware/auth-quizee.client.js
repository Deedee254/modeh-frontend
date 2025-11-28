export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only guard quizee routes
  if (!to.path.startsWith('/quizee')) return

  const auth = await import('~/stores/auth').then(m => m.useAuthStore())

  // If user already present, allow
  if (auth.user) return

  // Attempt to fetch current user silently
  try {
    await auth.fetchUser()
  } catch (e) {
    // ignore
  }

  // If still no user, redirect to login with return URL
  if (!auth.user) {
    return navigateTo({
      path: '/login',
      query: { next: to.fullPath }
    })
  }
})
