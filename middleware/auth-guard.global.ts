import { useAuthStore } from '~/stores/auth'
import type { User } from '~/types'

/**
 * Global authentication guard.
 * Leverages @sidebase/nuxt-auth status and data.
 * 
 * NOTE: fetchUser() is NOT called on every route change to avoid excess API calls.
 * It's only called:
 * - After login/register (in auth store)
 * - When explicitly needed by a page/component
 * - Initial app hydration (useAuthStore initializes from session data)
 */
export default defineNuxtRouteMiddleware(async (to) => {
    const { status, data } = useAuth()
    const auth = useAuthStore()

    // If we already have user data loaded, use it without fetching again
    if (auth.user && auth.user.id) {
        // Fast path: user already loaded, just validate role
    } else if (status.value === 'authenticated' && !auth.user) {
        // User is authenticated but store is empty: fetch once
        await auth.fetchUser()
    }

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

    // 4. Check role authorization (only if user is present)
    const user = auth.user as User
    if (!user) return // Should not happen if authenticated
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