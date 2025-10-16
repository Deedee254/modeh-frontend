import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const mobileNavOpen = ref(false)
const MOBILE_NAV_KEY = 'topbar:mobileNavOpen'

if (import.meta.client) {
  try {
    const stored = localStorage.getItem(MOBILE_NAV_KEY)
    if (stored !== null) {
      mobileNavOpen.value = stored === 'true'
    }
  } catch (e) {
    // Ignore localStorage errors
  }
}

export function useMobileNav() {
  const route = useRoute()

  watch(mobileNavOpen, (value) => {
    if (!import.meta.client) return
    try {
      localStorage.setItem(MOBILE_NAV_KEY, String(value))
    } catch (e) {
      // Ignore localStorage errors
    }
  })

  watch(() => route.fullPath, () => { mobileNavOpen.value = false })

  return { mobileNavOpen }
}