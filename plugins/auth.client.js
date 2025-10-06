import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  // Attempt to fetch current user on client start; ignore errors silently
  auth.fetchUser().catch(() => {})
})
