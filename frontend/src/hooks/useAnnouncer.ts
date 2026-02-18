import { useCallback, useRef } from 'react';

interface AnnounceOptions {
  politeness?: 'polite' | 'assertive';
  clearAfter?: number;
}

/**
 * useAnnouncer Hook
 * Announces messages to screen readers using ARIA live regions
 *
 * WCAG 2.1 Success Criterion 4.1.3 (Status Messages) - Level AA
 *
 * @returns Object with announce function and helper methods
 */
export const useAnnouncer = () => {
  const politeRegionRef = useRef<HTMLDivElement | null>(null);
  const assertiveRegionRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize live regions if they don't exist
  const initializeLiveRegions = useCallback(() => {
    if (!politeRegionRef.current) {
      const politeRegion = document.createElement('div');
      politeRegion.setAttribute('role', 'status');
      politeRegion.setAttribute('aria-live', 'polite');
      politeRegion.setAttribute('aria-atomic', 'true');
      politeRegion.className = 'sr-only';
      document.body.appendChild(politeRegion);
      politeRegionRef.current = politeRegion;
    }

    if (!assertiveRegionRef.current) {
      const assertiveRegion = document.createElement('div');
      assertiveRegion.setAttribute('role', 'alert');
      assertiveRegion.setAttribute('aria-live', 'assertive');
      assertiveRegion.setAttribute('aria-atomic', 'true');
      assertiveRegion.className = 'sr-only';
      document.body.appendChild(assertiveRegion);
      assertiveRegionRef.current = assertiveRegion;
    }
  }, []);

  /**
   * Announce a message to screen readers
   */
  const announce = useCallback((
    message: string,
    options: AnnounceOptions = {}
  ) => {
    const { politeness = 'polite', clearAfter } = options;

    initializeLiveRegions();

    const region = politeness === 'assertive'
      ? assertiveRegionRef.current
      : politeRegionRef.current;

    if (!region) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Clear the region first to ensure the announcement is heard
    region.textContent = '';

    // Announce the message after a small delay
    setTimeout(() => {
      region.textContent = message;

      // Clear the message after specified time
      if (clearAfter) {
        timeoutRef.current = setTimeout(() => {
          region.textContent = '';
        }, clearAfter);
      }
    }, 100);
  }, [initializeLiveRegions]);

  /**
   * Announce an error message
   */
  const announceError = useCallback((message: string) => {
    announce(`Error: ${message}`, { politeness: 'assertive' });
  }, [announce]);

  /**
   * Announce a success message
   */
  const announceSuccess = useCallback((message: string) => {
    announce(`Success: ${message}`, { politeness: 'polite', clearAfter: 5000 });
  }, [announce]);

  /**
   * Announce a loading state
   */
  const announceLoading = useCallback((message: string = 'Loading') => {
    announce(message, { politeness: 'polite' });
  }, [announce]);

  /**
   * Announce navigation
   */
  const announceNavigation = useCallback((location: string) => {
    announce(`Navigated to ${location}`, { politeness: 'polite', clearAfter: 3000 });
  }, [announce]);

  /**
   * Announce a page title change
   */
  const announcePageTitle = useCallback((title: string) => {
    announce(`Page: ${title}`, { politeness: 'polite', clearAfter: 3000 });
  }, [announce]);

  /**
   * Clear all announcements
   */
  const clear = useCallback(() => {
    if (politeRegionRef.current) {
      politeRegionRef.current.textContent = '';
    }
    if (assertiveRegionRef.current) {
      assertiveRegionRef.current.textContent = '';
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    announce,
    announceError,
    announceSuccess,
    announceLoading,
    announceNavigation,
    announcePageTitle,
    clear
  };
};

export default useAnnouncer;
