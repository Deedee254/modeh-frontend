import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin((nuxtApp) => {
  const auth = useAuthStore()

  // Use Nuxt app hook so we run after the app is mounted on the client.
  // This avoids calling Vue lifecycle hooks outside component setup.
  nuxtApp.hook('app:mounted', () => {
    // Run fetchUser on the client so the browser issues the request and cookies are sent.
    try { auth.fetchUser().catch(() => {}) } catch (e) { /* ignore */ }
  })
})
