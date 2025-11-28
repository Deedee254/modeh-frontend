import { onMounted, onUnmounted } from 'vue'

type Options = {
  contextmenu?: boolean
  shortcuts?: boolean
  selection?: boolean
  // extra shortcuts as array of lower-cased keys to block when used with ctrl/meta
  extraShortcuts?: string[]
}

export default function useDisableUserActions(opts: Options = {}) {
  const { contextmenu = true, shortcuts = true, selection = true, extraShortcuts = [] } = opts

  let prevUserSelect: string | null = null

  function preventDefault(e: Event) {
    try { e.preventDefault() } catch (err) { /* ignore */ }
  }

  function onKeyDown(e: KeyboardEvent) {
    try {
      const key = (e.key || '').toLowerCase()
      const isCtrl = e.ctrlKey || e.metaKey
      if (!isCtrl) return
      // Common shortcuts to block: Ctrl+S, Ctrl+U
      const blocked = ['s', 'u']
      if (blocked.includes(key) || extraShortcuts.includes(key)) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
    } catch (err) { /* ignore */ }
  }

  onMounted(() => {
    if (typeof window === 'undefined') return
    try {
      if (contextmenu) window.addEventListener('contextmenu', preventDefault)
      if (shortcuts) window.addEventListener('keydown', onKeyDown, { passive: false })
      if (selection) {
        // preserve previous value so we can restore
        try { prevUserSelect = document.body.style.userSelect ?? null } catch (e) { prevUserSelect = null }
        try { document.body.style.userSelect = 'none' } catch (e) {}
        try { window.addEventListener('selectstart', preventDefault) } catch (e) {}
      }
    } catch (e) {
      // defensive: ignore
    }
  })

  onUnmounted(() => {
    if (typeof window === 'undefined') return
    try {
      if (contextmenu) window.removeEventListener('contextmenu', preventDefault)
      if (shortcuts) window.removeEventListener('keydown', onKeyDown)
      if (selection) {
        try { window.removeEventListener('selectstart', preventDefault) } catch (e) {}
        try { if (prevUserSelect === null) document.body.style.removeProperty('user-select'); else document.body.style.userSelect = prevUserSelect } catch (e) {}
      }
    } catch (e) {}
  })
}

