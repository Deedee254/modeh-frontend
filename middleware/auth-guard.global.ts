import { useAuthStore } from '~/stores/auth'
import type { User } from '~/types'

/**
 * Global authentication guard.
 * Leverages @sidebase/nuxt-auth status and data.
 */
export default defineNuxtRouteMiddleware(async (to) => {
    const { status, data } = useAuth()
    const auth = useAuthStore()

    // 1. Determine Required Role based on Layout OR Path
    const layout = to.meta.layout as string | undefined
    const path = to.path

    const roleMap: Record<string, string> = {
        'quiz-master': 'quiz-master',
        'quizee': 'quizee',
        'institution-manager': 'institution-manager'
    }

    let requiredRole: string | undefined

    if (layout && roleMap[layout]) {
        requiredRole = roleMap[layout]
    } else {
        if (path.startsWith('/quiz-master')) requiredRole = 'quiz-master'
        else if (path.startsWith('/quizee')) requiredRole = 'quizee'
        else if (path.startsWith('/institution-manager')) requiredRole = 'institution-manager'
        else if (path.startsWith('/onboarding')) requiredRole = 'authenticated_any'
    }

    // Special case for settings/profile
    if (!requiredRole && (path === '/settings' || path === '/profile')) {
        requiredRole = 'authenticated_any'
    }

    if (!requiredRole && path !== '/') return

    // 2. Check Authentication Status via nuxt-auth
    if (status.value === 'unauthenticated') {
        if (auth.user) auth.clear()
        if (!requiredRole || (requiredRole === 'authenticated_any' && path === '/')) return
        return navigateTo({ path: '/login', query: { next: to.fullPath } })
    }

    // Ensure auth store is synced if authenticated
    if (status.value === 'authenticated' && data.value?.user) {
        // Sync user data from Nuxt-Auth session to auth store
        if (!auth.user || auth.user.id !== (data.value.user as any).id) {
            auth.setUser(data.value.user)
        }
        
        // If the session data says the profile is incomplete, we MUST verify with the backend
        // before redirecting to onboarding, because the JWT data might be stale (e.g., user
        // just completed onboarding in a previous session or via another tab).
        const sessionIncomplete = (data.value.user as any).isProfileCompleted === false || 
                                 (data.value.user as any).is_profile_completed === false ||
                                 !(data.value.user as any).role
        
        if (sessionIncomplete && !path.startsWith('/onboarding')) {
            // Await full user fetch to see if they actually finished onboarding
            await auth.fetchUser()
        } else if (!auth.user?.id) {
            // Background fetch if store is still empty for some reason
            if (process.client) auth.fetchUser().catch(() => {})
        }
    }

    const user = auth.user as User
    if (!user) return // Should not happen if authenticated

    // 3. Profile Completion & Onboarding Checks
    // Skip these if we are already on an onboarding/profile page to avoid loops
    if (!path.startsWith('/onboarding')) {
        // New users (no role) must choose a role
        if (!user.role) {
            return navigateTo('/onboarding/new-user')
        }

        // Check for missing profile fields (if the backend provides this info)
        const missingFields = (user as any).missingProfileFields || []
        if (missingFields.length > 0) {
            return navigateTo('/onboarding')
        }
        
        // Legacy check for is_profile_completed flag - redirect to onboarding
        const isProfileCompleted = user.is_profile_completed ?? (user as any).isProfileCompleted
        if (isProfileCompleted === false) {
            return navigateTo('/onboarding')
        }
    }

    // Admin bypass
    if (user.role === 'admin') {
        if (path.startsWith('/admin')) return
        // If an admin hits a frontend protected route, we can allow or redirect to backend
        // return
    }

    // 3. Specific Role/Membership Checks
    if (requiredRole === 'institution-manager' && user.role !== 'institution-manager') {
        return navigateTo('/')
    }

    if (requiredRole && requiredRole !== 'authenticated_any' && user.role !== requiredRole) {
        return navigateTo('/')
    }
})