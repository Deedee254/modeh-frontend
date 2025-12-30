import { useAuthStore } from '~/stores/auth'
import type { User } from '~/types'

/**
 * Global authentication guard.
 * Consolidates RBAC logic for all roles and simple authentication.
 * Consolidates previous auth middleware (replaces older per-role client guards).
 * Replaces:
 * - auth-quiz-master.client.ts
 * - auth-quizee.client.ts
 * - auth.ts
 */
export default defineNuxtRouteMiddleware(async (to) => {
    const auth = useAuthStore()

    // 1. Determine Required Role based on Layout OR Path
    const layout = to.meta.layout as string | undefined
    const path = to.path

    // Map roles to layouts/paths
    const roleMap: Record<string, string> = {
        'quiz-master': 'quiz-master',
        'quizee': 'quizee',
        'institution-manager': 'institution-manager'
    }

    let requiredRole: string | undefined

    // Check layout first
    if (layout && roleMap[layout]) {
        requiredRole = roleMap[layout]
    }
    // Fallback to path prefix if no layout requirement
    else {
        if (path.startsWith('/quiz-master')) requiredRole = 'quiz-master'
        else if (path.startsWith('/quizee')) requiredRole = 'quizee'
        else if (path.startsWith('/institution-manager')) requiredRole = 'institution-manager'
        else if (path.startsWith('/onboarding') || path.startsWith('/complete-profile')) requiredRole = 'authenticated_any'
    }

    // If no role is required, this is a public route (or handled elsewhere like guest.ts)
    if (!requiredRole) {
        // SPECIAL CASE: Redirect generic /settings and /profile for institution managers
        // This logic was previously in institution-settings-redirect.global.ts
        if (path === '/settings' || path === '/profile' || path === '/') {
            // We need to check auth for this specific case even if it's "public"
            // Reuse SSR/Client fetch logic specifically for this check?
            // Actually, simplest way is to let the "Ensure Auth" block run for EVERYONE,
            // but that might be heavy for public pages.
            // However, /settings and /profile SHOULD be protected anyway.
            // Let's defer this check until AFTER we ensure auth below.
            requiredRole = 'authenticated_any' // Temporary marker to force auth check
        } else {
            return
        }
    }

    // 2. Ensure Auth (SSR & Client)
    // On server, we try to fetch user if not present, passing cookies
    if (process.server && !auth.user) {
        try {
            const event = useRequestEvent()
            const CACHE_KEY = '__modeh_auth_user'
            // Reuse cached user if another middleware fetched it
            const cached = (event as any)[CACHE_KEY]
            if (cached) {
                auth.setUser(cached)
            } else {
                const headers = useRequestHeaders(['cookie']) || {}
                const config = useRuntimeConfig()
                const res = await $fetch(config.public.apiBase + '/api/me', {
                    baseURL: config.public.apiBase || '',
                    method: 'GET',
                    headers: headers.cookie ? { cookie: headers.cookie } : undefined,
                })
                if (res) {
                    (event as any)[CACHE_KEY] = res
                    auth.setUser(res)
                }
            }
        } catch (e) {
            // ignore server fetch errors
        }
    }

    // On client, try to fetch if we have a token but no user
    if (process.client && !auth.user && typeof localStorage !== 'undefined' && localStorage.getItem('modeh:auth:token')) {
        try {
            await auth.fetchUser()
        } catch (e) {
            // ignore
        }
    }

    // 3. Check Authentication Status
    if (!auth.user) {
        // If it was a forced check for a public route (like settings), allow failure if truly public (e.g. home)
        // But wait, if path is '/', we DON'T want to redirect to login if they are NOT logged in.
        // We only want to redirect IF they ARE logged in.
        if (requiredRole === 'authenticated_any' && path === '/') {
            return // Allow public access to home if not logged in
        }

        // Redirect to login with return URL
        return navigateTo({ path: '/login', query: { next: to.fullPath } })
    }

    const user = auth.user as User

    // Admin bypass
    if (user.role === 'admin') return

    // 4. Specific Role/Membership Checks
    if (requiredRole === 'institution-manager') {
        // Access requires an explicit 'institution-manager' role.
        // Membership alone does NOT grant access.
        if (user.role !== 'institution-manager') {
            return navigateTo('/')
        }
        return
    }

    // Generic Role Check
    if (requiredRole !== 'authenticated_any' && user.role !== requiredRole) {
        // Redirect to home if role doesn't match
        return navigateTo('/')
    }

    // 5. Institution Redirect Logic
    // Detect active institution (check store -> fallback to first institution in user object)
    const instStore = useInstitutionsStore()
    let activeId = instStore ? instStore.activeInstitutionSlug : null

    // Fallback: If no active slug in store, try to find one from user's memberships
    if (!activeId && user.institutions && user.institutions.length > 0) {
        // Prefer slug, fallback to ID
        const firstInst = user.institutions[0]
        if (firstInst) {
            activeId = firstInst.slug || String(firstInst.id)
        }
    }

    // Only user's explicit role determines institution-manager status.
    const isInstManager = user.role === 'institution-manager'

    // Redirect generic settings/profile
    if (path === '/settings' || path === '/profile') {
        if (isInstManager && activeId) {
            const target = path === '/settings' ? '/institution-manager/settings' : '/institution-manager/profile'
            return navigateTo({ path: target, query: { institutionSlug: String(activeId) } })
        }
    }

    // Redirect Home for Institution Managers (to dashboard with slug)
    // Only forces explicit institution managers, not just members
    if (path === '/' && user.role === 'institution-manager' && activeId) {
        return navigateTo({ path: '/institution-manager/dashboard', query: { institutionSlug: String(activeId) } })
    }
})
