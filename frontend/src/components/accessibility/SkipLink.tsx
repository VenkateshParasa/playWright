import React from 'react';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * SkipLink Component
 * Provides keyboard users the ability to skip repetitive navigation
 * and jump directly to main content areas
 *
 * WCAG 2.1 Success Criterion 2.4.1 (Bypass Blocks) - Level A
 */
export const SkipLink: React.FC<SkipLinkProps> = ({
  href,
  children,
  className = ''
}) => {
  return (
    <a
      href={href}
      className={`skip-link ${className}`}
      onClick={(e) => {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target instanceof HTMLElement) {
          target.tabIndex = -1;
          target.focus();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }}
    >
      {children}
    </a>
  );
};

export default SkipLink;
