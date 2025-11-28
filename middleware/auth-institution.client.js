export default defineNuxtRouteMiddleware(async (to) => {
  // Only guard institution-manager routes
  if (!to.path.startsWith('/institution-manager')) return

  const authMod = await import('~/stores/auth').then(m => m.useAuthStore())

  // If user already present, check role/membership
  if (authMod.user) {
    const u = authMod.user
    // allow if explicit role or institution membership exists
    if (u.role === 'institution-manager' || (u.institutions && u.institutions.length > 0)) return
    // otherwise redirect to unauthorized/home
    return navigateTo('/')
  }

  // Attempt to fetch user silently
  try {
    await authMod.fetchUser()
  } catch (e) {
    // ignore
  }

  const u = authMod.user
  if (!u) {
    // Not authenticated — send to login with return url
    return navigateTo({ path: '/login', query: { next: to.fullPath } })
  }

  // If authenticated but not an institution manager or member, redirect to root
  if (u.role !== 'institution-manager' && !(u.institutions && u.institutions.length > 0)) {
    return navigateTo('/')
  }
})

