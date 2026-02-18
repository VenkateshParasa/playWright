import React, { useEffect, useRef } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface FocusTrapProps {
  active?: boolean;
  children: React.ReactNode;
  initialFocus?: HTMLElement | null;
  returnFocus?: boolean;
  className?: string;
}

/**
 * FocusTrap Component
 * Traps keyboard focus within a container (useful for modals, dialogs)
 *
 * WCAG 2.1 Success Criterion 2.1.2 (No Keyboard Trap) - Level A
 * Note: This creates an intentional, escapable trap for modal dialogs
 */
export const FocusTrap: React.FC<FocusTrapProps> = ({
  active = true,
  children,
  initialFocus = null,
  returnFocus = true,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(containerRef, active, {
    initialFocus,
    returnFocus
  });

  return (
    <div
      ref={containerRef}
      className={className}
      data-focus-trap={active ? 'active' : 'inactive'}
    >
      {children}
    </div>
  );
};

export default FocusTrap;
