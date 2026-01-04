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
        else if (path.startsWith('/onboarding') || path.startsWith('/complete-profile')) requiredRole = 'authenticated_any'
    }

    // Special case for settings/profile
    if (!requiredRole && (path === '/settings' || path === '/profile')) {
        requiredRole = 'authenticated_any'
    }

    if (!requiredRole && path !== '/') return

    // 2. Check Authentication Status via nuxt-auth
    if (status.value === 'unauthenticated') {
        if (!requiredRole || (requiredRole === 'authenticated_any' && path === '/')) return
        return navigateTo({ path: '/login', query: { next: to.fullPath } })
    }

    // Ensure auth store is synced if authenticated
    if (status.value === 'authenticated' && !auth.user && data.value?.user) {
        // Sync minimal user data from session, fetch full profile if needed
        auth.setUser(data.value.user)
        // Optionally trigger full profile fetch in background
        if (process.client) auth.fetchUser().catch(() => {})
    }

    const user = auth.user as User
    if (!user) return // Should not happen if authenticated

    // 3. Profile Completion & Onboarding Checks
    // Skip these if we are already on an onboarding/profile page to avoid loops
    if (!path.startsWith('/onboarding') && !path.startsWith('/complete-profile')) {
        // New users (no role) must choose a role
        if (!user.role) {
            return navigateTo('/onboarding/new-user')
        }

        // Check for missing profile fields (if the backend provides this info)
        const missingFields = (user as any).missingProfileFields || []
        if (missingFields.length > 0) {
            return navigateTo('/onboarding')
        }
        
        // Legacy check for is_profile_completed flag
        if (user.is_profile_completed === false) {
            return navigateTo('/complete-profile')
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