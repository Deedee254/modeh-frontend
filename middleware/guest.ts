
export default defineNuxtRouteMiddleware((to, from) => {
    const auth = useAuthStore()

    // If user is logged in, redirect to their dashboard based on role
    if (auth.user) {
        // If there is a 'next' query param, redirect there instead of the default dashboard
        if (to.query.next && typeof to.query.next === 'string') {
            return navigateTo(decodeURIComponent(to.query.next))
        }

        const role = auth.user.role
        if (role === 'quiz-master') return navigateTo('/quiz-master/dashboard')
        if (role === 'quizee') return navigateTo('/quizee/dashboard')
        if (role === 'institution-manager') return navigateTo('/institution-manager/dashboard')
        if (role === 'admin') return navigateTo('/admin') // Assuming admin is separate or standard
        return navigateTo('/')
    }
})
