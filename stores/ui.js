import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const SIDEBAR_COLLAPSED_KEY = 'sidebar:collapsed'

export const useUiStore = defineStore('ui', () => {
  // For the mobile sidebar drawer. Not persisted.
  const sidebarOpen = ref(false)
  const mobileNavOpen = ref(false)

  // For the desktop collapsed state. Persisted in localStorage via a computed property.
  const sidebarCollapsed = computed({
    get() {
      if (import.meta.client) {
        try {
          return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
        } catch (e) { /* ignore */ }
      }
      return false
    },
    set(newValue) {
      if (import.meta.client) {
        try { localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newValue)) } catch (e) { /* ignore */ }
      }
    }
  })

  function toggleSidebar() {
    // On mobile, this toggles the drawer. On desktop, it's handled by toggleSidebarCollapse.
    if (import.meta.client && window.innerWidth < 1024) { // lg breakpoint
      sidebarOpen.value = !sidebarOpen.value
    } else {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }
  }

  return { sidebarOpen, sidebarCollapsed, mobileNavOpen, toggleSidebar }
})