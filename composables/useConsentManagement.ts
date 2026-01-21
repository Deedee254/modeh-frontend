/**
 * Composable to access and manage cookie consent
 * 
 * Usage in components:
 * const { hasAnalyticsConsent, hasMarketingConsent, showSettings } = useConsentManagement()
 */

import { ref } from 'vue'
import { useCookieConsentStore } from '~/stores/cookieConsent'

export const useConsentManagement = () => {
  const store = useCookieConsentStore()
  const showSettingsModal = ref(false)

  /**
   * Initialize consent on first use
   */
  const initConsent = () => {
    store.loadConsent()
  }

  /**
   * Check if analytics is allowed
   */
  const canTrackAnalytics = () => {
    return store.hasAnalyticsConsent
  }

  /**
   * Check if marketing is allowed
   */
  const canTrackMarketing = () => {
    return store.hasMarketingConsent
  }

  /**
   * Accept all cookies
   */
  const acceptAllCookies = () => {
    store.acceptAll()
  }

  /**
   * Reject all non-essential cookies
   */
  const rejectAllCookies = () => {
    store.rejectAll()
  }

  /**
   * Reset consent and show banner again
   */
  const resetAndShowBanner = () => {
    store.resetConsent()
  }

  /**
   * Open settings modal
   */
  const openSettings = () => {
    showSettingsModal.value = true
  }

  /**
   * Close settings modal
   */
  const closeSettings = () => {
    showSettingsModal.value = false
  }

  return {
    // Methods
    initConsent,
    canTrackAnalytics,
    canTrackMarketing,
    acceptAllCookies,
    rejectAllCookies,
    resetAndShowBanner,
    openSettings,
    closeSettings,

    // State
    showSettingsModal,

    // Direct access to store
    store
  }
}
