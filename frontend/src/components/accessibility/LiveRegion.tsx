import React, { useEffect, useRef } from 'react';

interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  clearAfter?: number;
  className?: string;
}

/**
 * LiveRegion Component
 * ARIA live region for announcing dynamic content changes to screen readers
 *
 * WCAG 2.1 Success Criterion 4.1.3 (Status Messages) - Level AA
 */
export const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  politeness = 'polite',
  atomic = true,
  relevant = 'additions',
  clearAfter,
  className = ''
}) => {
  const [displayMessage, setDisplayMessage] = React.useState(message);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setDisplayMessage(message);

    if (clearAfter && message) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setDisplayMessage('');
      }, clearAfter);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, clearAfter]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={`sr-only ${className}`}
    >
      {displayMessage}
    </div>
  );
};

export default LiveRegion;
