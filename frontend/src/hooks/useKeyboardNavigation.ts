import { useEffect, useCallback } from 'react';

interface KeyBinding {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  handler: (event: KeyboardEvent) => void;
  description?: string;
  preventDefault?: boolean;
}

interface UseKeyboardNavigationOptions {
  enableGlobalShortcuts?: boolean;
  enableArrowNavigation?: boolean;
  enableEscapeKey?: boolean;
}

/**
 * useKeyboardNavigation Hook
 * Provides comprehensive keyboard navigation functionality
 *
 * WCAG 2.1 Success Criterion 2.1.1 (Keyboard) - Level A
 *
 * @param bindings - Array of key bindings to register
 * @param options - Configuration options
 */
export const useKeyboardNavigation = (
  bindings: KeyBinding[] = [],
  options: UseKeyboardNavigationOptions = {}
) => {
  const {
    enableGlobalShortcuts = true,
    enableArrowNavigation = true,
    enableEscapeKey = true
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if user is typing in an input field
    const target = event.target as HTMLElement;
    const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
                         target.contentEditable === 'true';

    // Check for matching key bindings
    for (const binding of bindings) {
      const keyMatches = event.key.toLowerCase() === binding.key.toLowerCase();
      const ctrlMatches = binding.ctrlKey === undefined || binding.ctrlKey === event.ctrlKey;
      const shiftMatches = binding.shiftKey === undefined || binding.shiftKey === event.shiftKey;
      const altMatches = binding.altKey === undefined || binding.altKey === event.altKey;
      const metaMatches = binding.metaKey === undefined || binding.metaKey === event.metaKey;

      if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
        // Skip global shortcuts if user is in an input field
        if (isInputField && !binding.ctrlKey && !binding.metaKey && !binding.altKey) {
          continue;
        }

        if (binding.preventDefault !== false) {
          event.preventDefault();
        }
        binding.handler(event);
        break;
      }
    }
  }, [bindings]);

  useEffect(() => {
    if (enableGlobalShortcuts) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enableGlobalShortcuts]);

  /**
   * Navigate through focusable elements
   */
  const navigateFocusable = useCallback((direction: 'next' | 'previous') => {
    const focusableSelector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusableElements = Array.from(document.querySelectorAll(focusableSelector)) as HTMLElement[];
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);

    if (currentIndex === -1) {
      focusableElements[0]?.focus();
      return;
    }

    const nextIndex = direction === 'next'
      ? (currentIndex + 1) % focusableElements.length
      : (currentIndex - 1 + focusableElements.length) % focusableElements.length;

    focusableElements[nextIndex]?.focus();
  }, []);

  /**
   * Navigate to a specific element by selector or ID
   */
  const navigateToElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.tabIndex = -1;
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  /**
   * Focus the first focusable element within a container
   */
  const focusFirstInContainer = useCallback((container: HTMLElement | null) => {
    if (!container) return;

    const focusableSelector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const firstFocusable = container.querySelector(focusableSelector) as HTMLElement;
    firstFocusable?.focus();
  }, []);

  /**
   * Create a roving tabindex handler for widget navigation
   */
  const createRovingTabIndex = useCallback((
    container: HTMLElement,
    itemSelector: string,
    orientation: 'horizontal' | 'vertical' = 'horizontal'
  ) => {
    const items = Array.from(container.querySelectorAll(itemSelector)) as HTMLElement[];
    let currentIndex = 0;

    // Set initial tabindex
    items.forEach((item, index) => {
      item.tabIndex = index === 0 ? 0 : -1;
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      const forwardKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
      const backwardKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';

      let newIndex = currentIndex;

      if (event.key === forwardKey) {
        event.preventDefault();
        newIndex = (currentIndex + 1) % items.length;
      } else if (event.key === backwardKey) {
        event.preventDefault();
        newIndex = (currentIndex - 1 + items.length) % items.length;
      } else if (event.key === 'Home') {
        event.preventDefault();
        newIndex = 0;
      } else if (event.key === 'End') {
        event.preventDefault();
        newIndex = items.length - 1;
      } else {
        return;
      }

      items[currentIndex].tabIndex = -1;
      items[newIndex].tabIndex = 0;
      items[newIndex].focus();
      currentIndex = newIndex;
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    navigateFocusable,
    navigateToElement,
    focusFirstInContainer,
    createRovingTabIndex
  };
};

export default useKeyboardNavigation;
