/**
 * Google Analytics Plugin
 * Initializes GA4 with consent mode for GDPR/CCPA compliance
 */

import { useCookieConsentStore } from '~/stores/cookieConsent'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const router = useRouter()
  const gaId = config.public.googleAnalyticsId

  // Only initialize if GA ID is configured
  if (!gaId) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Google Analytics ID not configured. Set NUXT_PUBLIC_GOOGLE_ANALYTICS_ID in .env')
    }
    return
  }

  // Do NOT load gtag.js directly when using GTM as the canonical loader.
  // Ensure dataLayer exists and provide a lightweight gtag wrapper that
  // pushes arguments to dataLayer. GTM will load and handle GA tags.
  if (process.client) {
    window.dataLayer = window.dataLayer || []

    function gtag() {
      window.dataLayer.push(arguments)
    }

    window.gtag = gtag

    // Set default consent to 'denied' until user responds
    try {
      window.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        wait_for_update: 500
      })
    } catch (e) {
      // ignore
    }

    // Emit an initial config event so GA tags via GTM can initialize if configured
    try {
      window.gtag('config', gaId, {
        page_path: router.currentRoute.value.path,
        anonymize_ip: true
      })
    } catch (e) {
      // ignore
    }
  }

  // Track page views on route change
  router.afterEach((to) => {
    if (window.gtag) {
      // Get current consent status from store
      const store = useCookieConsentStore()
      
      window.gtag?.('config', gaId, {
        page_title: to.meta.title || to.name || 'Page',
        page_path: to.path,
        // Only track if analytics consent is given
        send_page_view: store.hasAnalyticsConsent
      })
    }
  })
})
