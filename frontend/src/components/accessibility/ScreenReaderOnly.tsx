import React from 'react';

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  focusable?: boolean;
  className?: string;
}

/**
 * ScreenReaderOnly Component
 * Visually hides content while keeping it accessible to screen readers
 *
 * WCAG 2.1 Success Criterion 1.3.1 (Info and Relationships) - Level A
 */
export const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({
  children,
  as: Component = 'span',
  focusable = false,
  className = ''
}) => {
  const baseClasses = 'sr-only';
  const focusableClasses = focusable ? 'sr-only-focusable' : '';

  return (
    <Component
      className={`${baseClasses} ${focusableClasses} ${className}`.trim()}
    >
      {children}
    </Component>
  );
};

export default ScreenReaderOnly;
