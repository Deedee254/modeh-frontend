/**
 * Cookie Consent Store (Pinia)
 * Manages user consent preferences for analytics and cookies
 * 
 * Compliant with:
 * - GDPR (Europe)
 * - CCPA (California)
 * - LGPD (Brazil)
 * - Other privacy regulations
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCookieConsentStore = defineStore('cookie-consent', () => {
  const STORAGE_KEY = 'modeh-cookie-consent'
  const CONSENT_VERSION = 1
  
  // State
  const consentGiven = ref(false)
  const bannerDismissed = ref(false)
  const preferences = ref({
    analytics: false,
    marketing: false,
    functional: true // Always enabled for basic functionality
  })

  // Consent object stored in localStorage
  interface ConsentData {
    version: number
    timestamp: string
    preferences: {
      analytics: boolean
      marketing: boolean
      functional: boolean
    }
  }

  /**
   * Load consent from localStorage
   */
  const loadConsent = () => {
    if (process.server) return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data: ConsentData = JSON.parse(stored)
        
        // Check if consent is still valid (refresh yearly)
        const consentDate = new Date(data.timestamp)
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
        
        if (data.version === CONSENT_VERSION && consentDate > oneYearAgo) {
          preferences.value = data.preferences
          consentGiven.value = true
          bannerDismissed.value = true
          return
        }
      }
    } catch (error) {
      console.error('Failed to load consent:', error)
    }

    bannerDismissed.value = false
  }

  /**
   * Save consent to localStorage
   */
  const saveConsent = (userPreferences: typeof preferences.value) => {
    if (process.server) return

    try {
      preferences.value = userPreferences
      consentGiven.value = true
      bannerDismissed.value = true

      const consentData: ConsentData = {
        version: CONSENT_VERSION,
        timestamp: new Date().toISOString(),
        preferences: userPreferences
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(consentData))

      // Update Google Analytics consent mode
      updateGoogleAnalyticsConsent(userPreferences)
    } catch (error) {
      console.error('Failed to save consent:', error)
    }
  }

  /**
   * Accept all cookies
   */
  const acceptAll = () => {
    saveConsent({
      analytics: true,
      marketing: true,
      functional: true
    })
  }

  /**
   * Reject all non-essential cookies
   */
  const rejectAll = () => {
    saveConsent({
      analytics: false,
      marketing: false,
      functional: true
    })
  }

  /**
   * Update individual preference
   */
  const updatePreference = (key: keyof typeof preferences.value, value: boolean) => {
    preferences.value[key] = value
  }

  /**
   * Save custom preferences
   */
  const savePreferences = () => {
    saveConsent(preferences.value)
  }

  /**
   * Reset consent (user can reconsent)
   */
  const resetConsent = () => {
    if (process.server) return
    
    try {
      localStorage.removeItem(STORAGE_KEY)
      consentGiven.value = false
      bannerDismissed.value = false
      preferences.value = {
        analytics: false,
        marketing: false,
        functional: true
      }
    } catch (error) {
      console.error('Failed to reset consent:', error)
    }
  }

  /**
   * Update Google Analytics consent mode
   * Called whenever user preferences change
   */
  const updateGoogleAnalyticsConsent = (prefs: typeof preferences.value) => {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('consent', 'update', {
      analytics_storage: prefs.analytics ? 'granted' : 'denied',
      ad_storage: prefs.marketing ? 'granted' : 'denied',
      ad_user_data: prefs.marketing ? 'granted' : 'denied',
      ad_personalization: prefs.marketing ? 'granted' : 'denied'
    })
  }

  /**
   * Check if user has consented to analytics
   */
  const hasAnalyticsConsent = computed(() => preferences.value.analytics)

  /**
   * Check if user has consented to marketing
   */
  const hasMarketingConsent = computed(() => preferences.value.marketing)

  /**
   * Get all preferences
   */
  const getPreferences = computed(() => preferences.value)

  return {
    // State
    consentGiven,
    bannerDismissed,
    preferences,

    // Methods
    loadConsent,
    saveConsent,
    acceptAll,
    rejectAll,
    updatePreference,
    savePreferences,
    resetConsent,
    updateGoogleAnalyticsConsent,

    // Computed
    hasAnalyticsConsent,
    hasMarketingConsent,
    getPreferences
  }
})
