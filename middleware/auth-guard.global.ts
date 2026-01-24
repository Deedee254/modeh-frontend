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
        'institution-manager': 'institution-manager',
        'parent': 'parent'
    }

    let requiredRole: string | undefined

    if (layout && roleMap[layout]) {
        requiredRole = roleMap[layout]
    } else {
        if (path.startsWith('/quiz-master/') || path === '/quiz-master') requiredRole = 'quiz-master'
        else if (path.startsWith('/quizee')) requiredRole = 'quizee'
        else if (path.startsWith('/institution-manager')) requiredRole = 'institution-manager'
        else if (path.startsWith('/parent')) requiredRole = 'parent'
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
        if (status.value === 'authenticated') {
                // Always validate the session with the authoritative API rather than trusting session payload
                await auth.fetchUser(true)
        
                // If the session data suggests onboarding isn't finished, verify with backend
        // before making navigation decisions. Prefer the `onboarding` object from
        // the API response when available since it contains step-level flags.
                const rawUser = auth.user as any
                const onboarding = rawUser?.onboarding

        const sessionNeedsVerification = (
            // explicit presence of profile_completed status
            (onboarding && onboarding.profile_completed === false) ||
            // use the clean response structure
            !rawUser.is_profile_completed ||
            // missing role info
            !rawUser.role
        )

        if (sessionNeedsVerification && !path.startsWith('/onboarding')) {
            // Await full user fetch to get the freshest onboarding state
            await auth.fetchUser()
        } else if (!auth.user?.id) {
            if (process.client) auth.fetchUser().catch(() => {})
        }
    }

    const user = auth.user as User
    if (!user) return // Should not happen if authenticated

    // 3. Profile Completion & Onboarding Checks
    // Skip these if we are already on an onboarding/profile page to avoid loops
    if (!path.startsWith('/onboarding')) {
        // New users must choose a role. This includes social signups where
        // the backend marks the account as `isNewUser` (or doesn't provide a role).
        // Also prefer the `onboarding.role_selected` flag from the API payload —
        // if it's explicitly false the user needs to complete role selection.
        const onboarding = (user as any).onboarding
        const roleSelectedFlag = onboarding?.role_selected

        if (!user.role || (user as any).isNewUser === true || roleSelectedFlag === false) {
            return navigateTo('/onboarding/new-user')
        }

        // After role is selected, redirect to dashboard, NOT to onboarding.
        // The dashboard will show a notification banner if profile is incomplete.
        // This applies to all roles (quizee, quiz-master, parent, etc.)
        // Parents do not require the full onboarding flow
        if (user.role === 'parent') {
            // allow parents to continue to their dashboard without onboarding
        } else {
            // Check profile completion status from clean response
            const onboardingObj = (user as any).onboarding
            const isProfileCompleted = onboardingObj?.profile_completed ?? user.is_profile_completed
            
            // Non-blocking: do NOT redirect. Dashboard will display a banner
            // reminding user to complete their profile at their convenience.
            if (isProfileCompleted === false) {
                // User can still access dashboard; banner will be shown
            }
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