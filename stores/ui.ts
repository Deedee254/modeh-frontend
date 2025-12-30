import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const SIDEBAR_COLLAPSED_KEY = 'sidebar:collapsed'

export const useUiStore = defineStore('ui', () => {
    // For the mobile sidebar drawer. Not persisted.
    const sidebarOpen = ref(false)
    const mobileNavOpen = ref(false)

    // For the desktop collapsed state. Persisted in localStorage via a computed property.
    const sidebarCollapsed = computed({
        get(): boolean {
            if (typeof window !== 'undefined' && import.meta && import.meta.client) {
                try {
                    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
                } catch (e) { /* ignore */ }
            }
            return false
        },
        set(newValue: boolean) {
            if (typeof window !== 'undefined' && import.meta && import.meta.client) {
                try { localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newValue)) } catch (e) { /* ignore */ }
            }
        }
    })

    function toggleSidebar() {
        // On mobile, toggle the drawer. On desktop, ensure the sidebar remains open.
        // This makes the left hamburger open/close the mobile drawer and on larger
        // screens it will not hide the sidebar (we keep it visible for desktop).
        if (typeof window !== 'undefined' && import.meta && import.meta.client && window.innerWidth < 1024) { // lg breakpoint
            sidebarOpen.value = !sidebarOpen.value
        } else {
            // Ensure desktop shows the full sidebar; do not toggle the persisted collapsed flag here.
            try {
                // If a consumer wants to collapse the desktop sidebar separately, they should call
                // a dedicated method. For now we guarantee the sidebar is open on desktop.
                (sidebarCollapsed as any).value = false
            } catch (e) {
                // ignore
            }
        }
    }

    return { sidebarOpen, sidebarCollapsed, mobileNavOpen, toggleSidebar }
})
