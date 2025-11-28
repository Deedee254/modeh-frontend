import { useAppAlert } from './useAppAlert'

// Deprecated: useAppToast is kept as a thin compatibility wrapper around useAppAlert.
// It logs a console warning and forwards push/dismiss calls to the alert system.
export function useAppToast() {
  const alert = useAppAlert()

  function push(opts = {}) {
    if (process.client && console && console.warn) {
      console.warn('[deprecation] useAppToast is deprecated. Use useAppAlert instead.')
    }
    // Map toast shape to alert shape
    alert.push({ ...opts })
    return null
  }

  function dismiss(id) {
    // Our alert composable exposes dismiss via alerts array mutation; forward if present
    try { if (alert.dismiss) alert.dismiss(id) } catch (e) {}
  }

  return { push, dismiss }
}

