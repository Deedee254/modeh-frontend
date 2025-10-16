import { defineStore } from 'pinia'
import { ref } from 'vue'

const SIDEBAR_COLLAPSED_KEY = 'sidebar:collapsed'

export const useUiStore = defineStore('ui', () => {
  // For the mobile sidebar drawer. Not persisted.
  const sidebarOpen = ref(false)
  // For the desktop collapsed state. Persisted in localStorage.
  const sidebarCollapsed = ref(false)
  const mobileNavOpen = ref(false)

  // Initialize collapsed state from localStorage on client-side
  if (process.client) {
    try {
      sidebarCollapsed.value = localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
    } catch (e) { /* ignore */ }
  }

  function toggleSidebar() {
    // On mobile, this toggles the drawer. On desktop, it's handled by toggleSidebarCollapse.
    if (process.client && window.innerWidth < 1024) { // lg breakpoint
      sidebarOpen.value = !sidebarOpen.value
    } else {
      sidebarCollapsed.value = !sidebarCollapsed.value
      try { localStorage.setItem(SIDEBAR_COLLAPSED_KEY, sidebarCollapsed.value) } catch (e) { /* ignore */ }
    }
  }

  return { sidebarOpen, sidebarCollapsed, mobileNavOpen, toggleSidebar }
})