import { useEffect, useRef, RefObject } from 'react';

interface UseFocusTrapOptions {
  initialFocus?: HTMLElement | null;
  returnFocus?: boolean;
  escapeDeactivates?: boolean;
}

/**
 * useFocusTrap Hook
 * Traps keyboard focus within a container element
 *
 * WCAG 2.1 Success Criteria:
 * - 2.1.2 (No Keyboard Trap) - Level A
 * - 2.4.3 (Focus Order) - Level A
 *
 * @param containerRef - Reference to the container element
 * @param isActive - Whether the focus trap is active
 * @param options - Configuration options
 */
export const useFocusTrap = (
  containerRef: RefObject<HTMLElement>,
  isActive: boolean = true,
  options: UseFocusTrapOptions = {}
) => {
  const {
    initialFocus = null,
    returnFocus = true,
    escapeDeactivates = true
  } = options;

  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    // Store the previously focused element
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // Focus the initial element or the first focusable element
    const setInitialFocus = () => {
      if (initialFocus) {
        initialFocus.focus();
      } else {
        const firstFocusable = getFocusableElements(container)[0];
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(setInitialFocus, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Escape key
      if (escapeDeactivates && event.key === 'Escape') {
        return; // Let parent component handle deactivation
      }

      // Handle Tab key
      if (event.key === 'Tab') {
        handleTabKey(event, container);
      }
    };

    // Add event listener
    container.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      // Return focus to the previously focused element
      if (returnFocus && previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isActive, containerRef, initialFocus, returnFocus, escapeDeactivates]);
};

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ];

  const elements = container.querySelectorAll(
    focusableSelectors.join(', ')
  ) as NodeListOf<HTMLElement>;

  return Array.from(elements).filter(element => {
    // Filter out hidden elements
    return element.offsetParent !== null;
  });
}

/**
 * Handle Tab key press to trap focus within container
 */
function handleTabKey(event: KeyboardEvent, container: HTMLElement): void {
  const focusableElements = getFocusableElements(container);

  if (focusableElements.length === 0) {
    event.preventDefault();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey) {
    // Shift + Tab: Move focus backward
    if (document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
  } else {
    // Tab: Move focus forward
    if (document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
}

export default useFocusTrap;
