// Badge toast uses global events; no DOM mounting required here

export function useBadgeToast() {
  if (process.server) return {
    open: () => {},
    close: () => {}
  }

  function open(badgeData = {}, opts = {}) {
    // Dispatch a global event that BadgeToast listens for
    window.dispatchEvent(new CustomEvent('badge-toast-open', { detail: { badgeData, opts } }))
  }

  function close() {
    window.dispatchEvent(new CustomEvent('badge-toast-close'))
  }

  return { open, close }
}

export default useBadgeToast

