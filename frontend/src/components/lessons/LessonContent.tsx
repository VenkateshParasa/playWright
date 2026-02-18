import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import CodeExample from './CodeExample';

interface LessonContentProps {
  content: string;
  className?: string;
  onScroll?: (position: number) => void;
}

export default function LessonContent({
  content,
  className = '',
  onScroll,
}: LessonContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        if (contentRef.current && onScroll) {
          const scrollPosition = contentRef.current.scrollTop;
          onScroll(scrollPosition);
        }
      }, 500); // Debounce scroll events
    };

    const element = contentRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (element) {
        element.removeEventListener('scroll', handleScroll);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [onScroll]);

  // Add IDs to headings for table of contents
  useEffect(() => {
    if (contentRef.current) {
      const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach((heading) => {
        if (!heading.id) {
          const text = heading.textContent || '';
          const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
          heading.id = id;
        }
      });
    }
  }, [content]);

  return (
    <div
      ref={contentRef}
      className={`lesson-content prose prose-lg dark:prose-invert max-w-none ${className}`}
    >
      <ReactMarkdown
        components={{
          // Custom code block renderer
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const code = String(children).replace(/\n$/, '');

            if (!inline && language) {
              return (
                <CodeExample
                  code={code}
                  language={language}
                  showLineNumbers={true}
                />
              );
            }

            // Inline code
            return (
              <code
                className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },

          // Custom heading renderers with anchors
          h1({ children, ...props }) {
            return (
              <h1
                className="text-4xl font-bold text-gray-900 dark:text-white mt-8 mb-4 scroll-mt-20"
                {...props}
              >
                {children}
              </h1>
            );
          },
          h2({ children, ...props }) {
            return (
              <h2
                className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-4 scroll-mt-20"
                {...props}
              >
                {children}
              </h2>
            );
          },
          h3({ children, ...props }) {
            return (
              <h3
                className="text-2xl font-semibold text-gray-900 dark:text-white mt-6 mb-3 scroll-mt-20"
                {...props}
              >
                {children}
              </h3>
            );
          },
          h4({ children, ...props }) {
            return (
              <h4
                className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3 scroll-mt-20"
                {...props}
              >
                {children}
              </h4>
            );
          },

          // Custom paragraph
          p({ children, ...props }) {
            return (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed my-4" {...props}>
                {children}
              </p>
            );
          },

          // Custom lists
          ul({ children, ...props }) {
            return (
              <ul className="list-disc list-outside ml-6 my-4 space-y-2 text-gray-700 dark:text-gray-300" {...props}>
                {children}
              </ul>
            );
          },
          ol({ children, ...props }) {
            return (
              <ol className="list-decimal list-outside ml-6 my-4 space-y-2 text-gray-700 dark:text-gray-300" {...props}>
                {children}
              </ol>
            );
          },
          li({ children, ...props }) {
            return (
              <li className="leading-relaxed" {...props}>
                {children}
              </li>
            );
          },

          // Custom blockquote
          blockquote({ children, ...props }) {
            return (
              <blockquote
                className="border-l-4 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/10 pl-4 py-2 my-4 italic text-gray-700 dark:text-gray-300"
                {...props}
              >
                {children}
              </blockquote>
            );
          },

          // Custom links
          a({ href, children, ...props }) {
            const isExternal = href?.startsWith('http');
            return (
              <a
                href={href}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },

          // Custom images with lazy loading
          img({ src, alt, ...props }) {
            return (
              <img
                src={src}
                alt={alt}
                loading="lazy"
                className="rounded-lg shadow-lg my-6 max-w-full h-auto"
                {...props}
              />
            );
          },

          // Custom tables
          table({ children, ...props }) {
            return (
              <div className="overflow-x-auto my-6">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props}>
                  {children}
                </table>
              </div>
            );
          },
          thead({ children, ...props }) {
            return (
              <thead className="bg-gray-50 dark:bg-gray-800" {...props}>
                {children}
              </thead>
            );
          },
          tbody({ children, ...props }) {
            return (
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700" {...props}>
                {children}
              </tbody>
            );
          },
          th({ children, ...props }) {
            return (
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                {...props}
              >
                {children}
              </th>
            );
          },
          td({ children, ...props }) {
            return (
              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300" {...props}>
                {children}
              </td>
            );
          },

          // Custom horizontal rule
          hr({ ...props }) {
            return <hr className="my-8 border-gray-200 dark:border-gray-700" {...props} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// Utility function to calculate reading time
export function calculateReadingTime(content: string): {
  text: string;
  minutes: number;
  words: number;
  time: number;
} {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  const time = (words / wordsPerMinute) * 60 * 1000; // in milliseconds

  return {
    text: `${minutes} min read`,
    minutes,
    words,
    time,
  };
}
