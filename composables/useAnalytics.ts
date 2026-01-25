/**
 * Google Analytics (GA4) Composable
 * Provides utilities for tracking events and custom user interactions
 * Respects user consent preferences from cookie consent store
 * 
 * Usage in components:
 * const { trackEvent, trackPageView, trackUserProperty } = useAnalytics()
 * 
 * Example:
 * trackEvent('quiz_started', { quiz_id: '123', difficulty: 'hard' })
 * trackEvent('login_success', { auth_method: 'google' })
 */

import { useCookieConsentStore } from '~/stores/cookieConsent'

export const useAnalytics = () => {
  const config = useRuntimeConfig()
  const router = useRouter()
  const consentStore = useCookieConsentStore()

  /**
   * Check if analytics tracking is allowed
   */
  const canTrack = () => {
    // If GA4 ID is not configured, don't track
    if (!config.public.googleAnalyticsId && !config.public.googleTagManagerId) return false

    // We can still push to dataLayer even if gtag isn't defined (GTM will pick it up)
    return true
  }

  /**
   * Track a custom event in GA4
   * Only tracks if user has consented to analytics
   * @param eventName - Name of the event (snake_case recommended)
   * @param eventData - Object containing event parameters
   */
  const trackEvent = (eventName: string, eventData: Record<string, any> = {}) => {
    if (!canTrack()) {
      console.warn('Google Analytics not available or not configured')
      return
    }

    // Respect user consent - only send if analytics is enabled
    if (!consentStore.hasAnalyticsConsent) {
      console.debug(`[GA] Event blocked by consent setting: ${eventName}`)
      return
    }

    // Call gtag if available
    try {
      window.gtag?.('event', eventName, eventData)
    } catch (e) {
      // ignore
    }

    // Also push a plain object to dataLayer so GTM listeners can react
    try {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push(Object.assign({ event: eventName }, eventData))
    } catch (e) {
      // ignore
    }
  }

  /**
   * Track page view (usually automatic, but can be manual if needed)
   * @param title - Page title
   * @param path - Page path
   */
  const trackPageView = (title?: string, path?: string) => {
    if (!canTrack()) {
      console.warn('Google Analytics not available or not configured')
      return
    }

    if (!consentStore.hasAnalyticsConsent) {
      console.debug('[GA] Page view blocked by consent setting')
      return
    }

    // Use trackEvent to ensure both gtag and dataLayer are invoked
    trackEvent('page_view', {
      page_title: title || document.title,
      page_path: path || router.currentRoute.value.path
    })
  }

  /**
   * Set user properties for segmentation
   * @param properties - User properties object
   */
  const trackUserProperty = (properties: Record<string, any>) => {
    if (!canTrack()) {
      console.warn('Google Analytics not available or not configured')
      return
    }

    if (!consentStore.hasAnalyticsConsent) {
      console.debug('[GA] User property blocked by consent setting')
      return
    }

    try {
      window.gtag?.('set', { user_properties: properties })
    } catch (e) {
      // ignore
    }

    try {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({ event: 'set_user_properties', user_properties: properties })
    } catch (e) {
      // ignore
    }
  }

  /**
   * Track quiz attempt
   */
  const trackQuizAttempt = (quizId: string, quizTitle: string, difficulty?: string) => {
    trackEvent('quiz_attempt', {
      quiz_id: quizId,
      quiz_title: quizTitle,
      difficulty: difficulty || 'unknown'
    })
  }

  /**
   * Track quiz completion
   */
  const trackQuizCompletion = (quizId: string, quizTitle: string, score: number, maxScore: number) => {
    trackEvent('quiz_completed', {
      quiz_id: quizId,
      quiz_title: quizTitle,
      score: score,
      max_score: maxScore,
      percentage: Math.round((score / maxScore) * 100)
    })
  }

  /**
   * Track user registration
   */
  const trackRegistration = (method: 'email' | 'google' | 'other') => {
    trackEvent('sign_up', {
      method: method
    })
  }

  /**
   * Track login
   */
  const trackLogin = (method: 'email' | 'google' | 'other') => {
    trackEvent('login', {
      method: method
    })
  }

  /**
   * Track subscription
   */
  const trackSubscription = (planType: string, amount?: number) => {
    trackEvent('purchase', {
      value: amount || 0,
      currency: 'KES', // Kenya Shilling
      items: [
        {
          item_name: planType,
          item_category: 'subscription'
        }
      ]
    })
  }

  /**
   * Track search/filter interactions
   */
  const trackSearch = (searchQuery: string, resultsCount?: number) => {
    trackEvent('search', {
      search_term: searchQuery,
      results_count: resultsCount || 0
    })
  }

  /**
   * Track content engagement (minutes spent)
   */
  const trackEngagement = (contentType: string, contentId: string, engagementTime: number) => {
    trackEvent('engagement', {
      content_type: contentType,
      content_id: contentId,
      engagement_time_msec: engagementTime
    })
  }

  /**
   * Track error events
   */
  const trackError = (errorMessage: string, errorCode?: string) => {
    trackEvent('exception', {
      description: errorMessage,
      fatal: false,
      error_code: errorCode
    })
  }

  return {
    trackEvent,
    trackPageView,
    trackUserProperty,
    trackQuizAttempt,
    trackQuizCompletion,
    trackRegistration,
    trackLogin,
    trackSubscription,
    trackSearch,
    trackEngagement,
    trackError
  }
}
