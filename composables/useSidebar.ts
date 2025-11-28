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
  const _onStorage = (ev: StorageEvent) => {
    if (ev.key === SIDEBAR_MOBILE_KEY) sidebarMobileOpen.value = ev.newValue === 'true'
  }
  window.addEventListener('storage', _onStorage)
  // remove listener on page unload to avoid leaving dangling references
  try {
    const _removeStorage = () => { try { window.removeEventListener('storage', _onStorage) } catch (e) {} }
    window.addEventListener('beforeunload', _removeStorage)
  } catch (e) {}
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

