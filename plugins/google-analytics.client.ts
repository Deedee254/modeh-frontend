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

  // Load Google Analytics script with consent mode
  useHead({
    script: [
      {
        async: true,
        src: `https://www.googletagmanager.com/gtag/js?id=${gaId}`,
        onload() {
          window.dataLayer = window.dataLayer || []
          
          function gtag(...args: any[]) {
            window.dataLayer?.push(args)
          }
          
          window.gtag = gtag
          gtag('js', new Date())
          
          // Set default consent to 'denied' until user responds
          // This is required for GDPR/CCPA compliance
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            wait_for_update: 500 // Wait 500ms for consent preference
          })
          
          // Initialize GA4 with consent mode enabled
          gtag('config', gaId, {
            page_path: router.currentRoute.value.path,
            anonymize_ip: true // Anonymize IP for privacy
          })
        }
      }
    ]
  })

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
