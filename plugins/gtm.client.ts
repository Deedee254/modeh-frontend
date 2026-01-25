// Client-only plugin: ensure dataLayer exists and provide a simple $gtm helper
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    (window as any).dataLayer = (window as any).dataLayer || []

    // provide a helper to push events
    nuxtApp.provide('gtm', (eventName: string, payload: Record<string, any> = {}) => {
      try {
        ;(window as any).dataLayer.push({ event: eventName, ...payload })
      } catch (e) {
        // ignore
      }
    })
  }
})
