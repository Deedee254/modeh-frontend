import { useState } from '#app'
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

export function useAppTheme() {
  // store theme as 'light' | 'dark'
  const theme = useState('app_theme', () => 'light')

  const isDark = computed(() => {
    if (process.client) {
      return theme.value === 'dark' || (theme.value === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    return theme.value === 'dark'
  })

  function applyHtmlClass(dark) {
    try {
      const el = process.client ? document.documentElement : null
      if (!el) return
      if (dark) el.classList.add('dark')
      else el.classList.remove('dark')
    } catch (e) {}
  }

  function setTheme(val) {
    theme.value = val
    try { localStorage.setItem('app_theme', val) } catch (e) {}
    applyHtmlClass(val === 'dark' || (val === 'system' && process.client && window.matchMedia('(prefers-color-scheme: dark)').matches))
    // if logged-in, attempt to sync preference to backend
    try {
      if (process.client) {
        const auth = useAuthStore()
        if (auth?.user) {
          // best-effort, do not block
          fetch('/api/me/theme', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ theme: val }) }).catch(() => {})
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
      const saved = localStorage.getItem('app_theme')
      if (saved) theme.value = saved
      applyHtmlClass(isDark.value)
      // listen to system changes if theme is 'system'
      if (process.client && theme.value === 'system' && window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          applyHtmlClass(e.matches)
        })
      }
    } catch (e) {}
  })

  return { theme, isDark, setTheme, toggleTheme }
}
