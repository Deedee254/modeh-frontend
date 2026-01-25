export function useGtm() {
  const nuxt = useNuxtApp()

  function push(eventName: string, payload: Record<string, any> = {}) {
    if (process.client) {
      try {
        // prefer the provided plugin
        const gtm = (nuxt as any).$gtm || (nuxt as any).provides?.gtm
        if (typeof gtm === 'function') {
          gtm(eventName, payload)
          return
        }
        // fallback to direct dataLayer push
        ;(window as any).dataLayer = (window as any).dataLayer || []
        ;(window as any).dataLayer.push({ event: eventName, ...payload })
      } catch (e) {
        // ignore
      }
    }
  }

  return { push }
}
