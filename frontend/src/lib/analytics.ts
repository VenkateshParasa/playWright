/**
 * Frontend Analytics System
 *
 * Features:
 * - Page view tracking
 * - User event tracking
 * - Custom event tracking
 * - User properties
 * - Session tracking
 * - Conversion funnels
 * - A/B test tracking
 * - Privacy-compliant analytics
 * - Multiple analytics providers support
 *
 * Supports: Google Analytics, Plausible, Custom Backend
 */

import { addBreadcrumb } from './sentry';

// Analytics configuration
const ANALYTICS_ENABLED = import.meta.env.VITE_ANALYTICS_ENABLED !== 'false';
const ANALYTICS_PROVIDER = import.meta.env.VITE_ANALYTICS_PROVIDER || 'custom';
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
const ANALYTICS_API_URL = import.meta.env.VITE_ANALYTICS_API_URL || '/api/analytics';

// Types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

export interface PageViewEvent {
  path: string;
  title?: string;
  referrer?: string;
  timestamp?: number;
}

export interface UserProperties {
  userId?: string;
  email?: string;
  name?: string;
  plan?: string;
  [key: string]: any;
}

export interface ConversionEvent {
  goal: string;
  value?: number;
  currency?: string;
  properties?: Record<string, any>;
}

// Session management
let sessionId: string | null = null;
let userId: string | null = null;
let userProperties: UserProperties = {};
let eventQueue: AnalyticsEvent[] = [];
let isProcessingQueue = false;

// Privacy settings
let doNotTrack = false;
let cookieConsentGiven = false;

/**
 * Initialize analytics system
 */
export function initAnalytics(): void {
  if (!ANALYTICS_ENABLED) {
    console.info('Analytics is disabled');
    return;
  }

  // Check Do Not Track
  doNotTrack = navigator.doNotTrack === '1' ||
               (window as any).doNotTrack === '1' ||
               (navigator as any).msDoNotTrack === '1';

  if (doNotTrack) {
    console.info('Analytics disabled due to Do Not Track setting');
    return;
  }

  // Check cookie consent
  cookieConsentGiven = localStorage.getItem('cookie-consent') === 'true';

  if (!cookieConsentGiven) {
    console.info('Analytics waiting for cookie consent');
  }

  // Initialize session
  initSession();

  // Initialize provider-specific tracking
  switch (ANALYTICS_PROVIDER) {
    case 'google':
      initGoogleAnalytics();
      break;
    case 'plausible':
      initPlausible();
      break;
    case 'custom':
      initCustomAnalytics();
      break;
    default:
      console.warn(`Unknown analytics provider: ${ANALYTICS_PROVIDER}`);
  }

  // Track initial page view
  trackPageView({
    path: window.location.pathname,
    title: document.title,
    referrer: document.referrer,
  });

  console.info(`Analytics initialized with ${ANALYTICS_PROVIDER} provider`);
}

/**
 * Initialize session tracking
 */
function initSession(): void {
  // Get or create session ID
  sessionId = sessionStorage.getItem('analytics-session-id');

  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('analytics-session-id', sessionId);
  }

  // Session start event
  trackEvent({
    name: 'session_start',
    properties: {
      sessionId,
      timestamp: Date.now(),
    },
  });

  // Track session end on page unload
  window.addEventListener('beforeunload', () => {
    trackEvent({
      name: 'session_end',
      properties: {
        sessionId,
        duration: Date.now() - parseInt(sessionStorage.getItem('session-start-time') || '0'),
      },
    });
    flushQueue();
  });

  sessionStorage.setItem('session-start-time', Date.now().toString());
}

/**
 * Track page view
 */
export function trackPageView(event: PageViewEvent): void {
  if (!shouldTrack()) return;

  const pageViewData = {
    ...event,
    timestamp: event.timestamp || Date.now(),
    sessionId,
    userId,
    userAgent: navigator.userAgent,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
  };

  // Provider-specific tracking
  switch (ANALYTICS_PROVIDER) {
    case 'google':
      trackGooglePageView(pageViewData);
      break;
    case 'plausible':
      trackPlausiblePageView(pageViewData);
      break;
    case 'custom':
      sendToBackend('pageview', pageViewData);
      break;
  }

  // Add breadcrumb for debugging
  addBreadcrumb('Page View', 'navigation', 'info', {
    path: event.path,
    title: event.title,
  });
}

/**
 * Track custom event
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (!shouldTrack()) return;

  const eventData = {
    ...event,
    timestamp: event.timestamp || Date.now(),
    sessionId,
    userId,
    properties: {
      ...event.properties,
      ...userProperties,
    },
  };

  // Add to queue for batch processing
  eventQueue.push(eventData);

  // Process queue if not already processing
  if (!isProcessingQueue) {
    processQueue();
  }

  // Provider-specific tracking
  switch (ANALYTICS_PROVIDER) {
    case 'google':
      trackGoogleEvent(eventData);
      break;
    case 'plausible':
      trackPlausibleEvent(eventData);
      break;
    case 'custom':
      // Handled by queue processing
      break;
  }

  // Add breadcrumb for debugging
  addBreadcrumb('Event Tracked', 'analytics', 'info', {
    eventName: event.name,
    properties: event.properties,
  });
}

/**
 * Track user action (click, form submit, etc.)
 */
export function trackUserAction(
  action: 'click' | 'submit' | 'input' | 'scroll' | 'custom',
  label: string,
  properties?: Record<string, any>
): void {
  trackEvent({
    name: `user_${action}`,
    properties: {
      label,
      ...properties,
    },
  });
}

/**
 * Track conversion/goal
 */
export function trackConversion(event: ConversionEvent): void {
  trackEvent({
    name: 'conversion',
    properties: {
      goal: event.goal,
      value: event.value,
      currency: event.currency || 'USD',
      ...event.properties,
    },
  });
}

/**
 * Track A/B test variant
 */
export function trackABTest(testName: string, variant: string): void {
  trackEvent({
    name: 'ab_test',
    properties: {
      testName,
      variant,
    },
  });
}

/**
 * Set user ID
 */
export function setUserId(id: string): void {
  userId = id;

  // Provider-specific user ID setting
  switch (ANALYTICS_PROVIDER) {
    case 'google':
      if ((window as any).gtag) {
        (window as any).gtag('config', GA_MEASUREMENT_ID, {
          user_id: id,
        });
      }
      break;
  }
}

/**
 * Set user properties
 */
export function setUserProperties(properties: UserProperties): void {
  userProperties = {
    ...userProperties,
    ...properties,
  };

  // Provider-specific user properties
  switch (ANALYTICS_PROVIDER) {
    case 'google':
      if ((window as any).gtag) {
        (window as any).gtag('set', 'user_properties', properties);
      }
      break;
  }
}

/**
 * Clear user data (e.g., on logout)
 */
export function clearUserData(): void {
  userId = null;
  userProperties = {};
  sessionId = generateSessionId();
  sessionStorage.setItem('analytics-session-id', sessionId);
}

/**
 * Set cookie consent
 */
export function setCookieConsent(consent: boolean): void {
  cookieConsentGiven = consent;
  localStorage.setItem('cookie-consent', consent.toString());

  if (consent) {
    initAnalytics();
  }
}

/**
 * Check if tracking should be enabled
 */
function shouldTrack(): boolean {
  return ANALYTICS_ENABLED && !doNotTrack && cookieConsentGiven;
}

/**
 * Process event queue
 */
async function processQueue(): Promise<void> {
  if (isProcessingQueue || eventQueue.length === 0) return;

  isProcessingQueue = true;

  try {
    // Batch events (max 10 at a time)
    const batch = eventQueue.splice(0, 10);

    if (ANALYTICS_PROVIDER === 'custom') {
      await sendToBackend('events', batch);
    }

    // Continue processing if there are more events
    if (eventQueue.length > 0) {
      setTimeout(() => {
        isProcessingQueue = false;
        processQueue();
      }, 1000); // Wait 1 second before processing next batch
    } else {
      isProcessingQueue = false;
    }
  } catch (error) {
    console.error('Failed to process analytics queue:', error);
    isProcessingQueue = false;
  }
}

/**
 * Flush queue immediately (e.g., before page unload)
 */
function flushQueue(): void {
  if (eventQueue.length === 0) return;

  const batch = [...eventQueue];
  eventQueue = [];

  // Use sendBeacon for reliable sending before page unload
  if (navigator.sendBeacon && ANALYTICS_PROVIDER === 'custom') {
    const blob = new Blob([JSON.stringify(batch)], { type: 'application/json' });
    navigator.sendBeacon(ANALYTICS_API_URL, blob);
  }
}

// Google Analytics integration
function initGoogleAnalytics(): void {
  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics measurement ID not configured');
    return;
  }

  // Load GA script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).gtag = function() {
    (window as any).dataLayer.push(arguments);
  };
  (window as any).gtag('js', new Date());
  (window as any).gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true, // GDPR compliance
    cookie_flags: 'SameSite=None;Secure',
  });
}

function trackGooglePageView(data: any): void {
  if ((window as any).gtag) {
    (window as any).gtag('config', GA_MEASUREMENT_ID, {
      page_path: data.path,
      page_title: data.title,
    });
  }
}

function trackGoogleEvent(event: AnalyticsEvent): void {
  if ((window as any).gtag) {
    (window as any).gtag('event', event.name, event.properties);
  }
}

// Plausible integration
function initPlausible(): void {
  if (!PLAUSIBLE_DOMAIN) {
    console.warn('Plausible domain not configured');
    return;
  }

  // Load Plausible script
  const script = document.createElement('script');
  script.defer = true;
  script.setAttribute('data-domain', PLAUSIBLE_DOMAIN);
  script.src = 'https://plausible.io/js/script.js';
  document.head.appendChild(script);
}

function trackPlausiblePageView(data: any): void {
  if ((window as any).plausible) {
    (window as any).plausible('pageview', { props: data });
  }
}

function trackPlausibleEvent(event: AnalyticsEvent): void {
  if ((window as any).plausible) {
    (window as any).plausible(event.name, { props: event.properties });
  }
}

// Custom backend integration
function initCustomAnalytics(): void {
  console.info('Using custom analytics backend');
}

async function sendToBackend(endpoint: string, data: any): Promise<void> {
  try {
    const response = await fetch(`${ANALYTICS_API_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Analytics request failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to send analytics data:', error);
  }
}

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default {
  initAnalytics,
  trackPageView,
  trackEvent,
  trackUserAction,
  trackConversion,
  trackABTest,
  setUserId,
  setUserProperties,
  clearUserData,
  setCookieConsent,
};
