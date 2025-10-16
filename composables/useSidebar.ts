import { ref, watch } from 'vue'

const SIDEBAR_MOBILE_KEY = 'sidebar:mobileOpen:quiz-master'

// Shared reactive state for the sidebar mobile open flag
const sidebarMobileOpen = ref(false)

// Always start collapsed by default. Clear or overwrite any previous value so default is collapsed.
if (import.meta.client) {
  try {
    // force default collapsed state
    localStorage.setItem(SIDEBAR_MOBILE_KEY, 'false')
  } catch {}

  // Keep in sync across tabs (if user toggles later)
  window.addEventListener('storage', (ev) => {
    if (ev.key === SIDEBAR_MOBILE_KEY) sidebarMobileOpen.value = ev.newValue === 'true'
  })
}

watch(sidebarMobileOpen, (val) => {
  if (!import.meta.client) return
  try {
    localStorage.setItem(SIDEBAR_MOBILE_KEY, String(val))
  } catch {}
})

export function useSidebar() {
  function toggleSidebar() {
    sidebarMobileOpen.value = !sidebarMobileOpen.value
  }

  function setSidebar(value: boolean) {
    sidebarMobileOpen.value = !!value
  }

  return { sidebarMobileOpen, toggleSidebar, setSidebar }
}
