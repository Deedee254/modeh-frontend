import { useState, useRuntimeConfig } from '#app'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import useApi from '~/composables/useApi'

export function useAppTheme() {
  // store theme as 'light' | 'dark'
  // prefer cookie-backed value so server can render the user's preference
  const themeCookie = useCookie('app_theme')
  const theme = useState('app_theme', () => themeCookie.value || 'light')
  const systemPrefersDark = ref(false)
  const cfg = useRuntimeConfig()
  const api = useApi()

  const isDark = computed(() => {
    // During SSR we fall back to explicit 'dark' only. The system preference
    // is detected on the client and stored in `systemPrefersDark`.
    return theme.value === 'dark' || (theme.value === 'system' && systemPrefersDark.value)
  })

  function applyHtmlClass(dark) {
    try {
      if (typeof document === 'undefined') return
      const el = document.documentElement
      if (dark) el.classList.add('dark')
      else el.classList.remove('dark')
    } catch (e) {}
  }

  function setTheme(val) {
    theme.value = val
    try { localStorage.setItem('app_theme', val) } catch (e) {}
    try { themeCookie.value = val } catch (e) {}
    applyHtmlClass(val === 'dark' || (val === 'system' && systemPrefersDark.value))
    // if logged-in, attempt to sync preference to backend
    try {
      if (typeof window !== 'undefined') {
        const auth = useAuthStore()
        if (auth?.user) {
          // best-effort, do not block
          // Post to the configured backend API base so requests go to the backend
          api.postJson('/api/me/theme', { theme: val }).catch(() => {})
        }
      }
    } catch (e) {}
  }

  function toggleTheme() {
    const next = (theme.value === 'dark') ? 'light' : 'dark'
    setTheme(next)
  }

  onMounted(() => {
    try {
      // detect system preference on the client and listen for changes. We
      // avoid any matchMedia access during SSR.
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mql = window.matchMedia('(prefers-color-scheme: dark)')
        // initialize
        systemPrefersDark.value = !!mql.matches
        const handler = (e) => {
          systemPrefersDark.value = !!(e && e.matches)
          // if user theme is 'system', update html class
          if (theme.value === 'system') applyHtmlClass(systemPrefersDark.value)
        }
        // use addEventListener when available; fallback to addListener
        if (mql.addEventListener) mql.addEventListener('change', handler)
        else if (mql.addListener) mql.addListener(handler)
        // cleanup on unmount
        onUnmounted(() => {
          try {
            if (mql.removeEventListener) mql.removeEventListener('change', handler)
            else if (mql.removeListener) mql.removeListener(handler)
          } catch (e) {}
        })
      }

      const saved = localStorage.getItem('app_theme')
      if (saved) theme.value = saved
      // apply initial class based on computed isDark (which now uses systemPrefersDark)
      applyHtmlClass(isDark.value)
    } catch (e) {}
  })

  return { theme, isDark, setTheme, toggleTheme }
}

