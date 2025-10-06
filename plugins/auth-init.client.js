import { useAuthStore } from '~/stores/auth'
import { onMounted } from 'vue'

export default defineNuxtPlugin(() => {
  const auth = useAuthStore()

  onMounted(() => {
    // Run fetchUser on the client so the browser issues the request and cookies are sent.
    auth.fetchUser().catch(() => {
      // ignore errors here — unauthenticated is normal
    })
  })
})
