import React, { useEffect, useState } from 'react';
import { List } from 'lucide-react';
import type { TableOfContentsItem } from '../../types/lesson.types';

interface TableOfContentsProps {
  items: TableOfContentsItem[];
  activeId?: string;
  className?: string;
}

export default function TableOfContents({
  items,
  activeId,
  className = '',
}: TableOfContentsProps) {
  const [currentActiveId, setCurrentActiveId] = useState(activeId);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setCurrentActiveId(activeId);
  }, [activeId]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      setCurrentActiveId(id);
    }
  };

  const renderItem = (item: TableOfContentsItem, depth = 0) => {
    const isActive = currentActiveId === item.id;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <button
          onClick={() => scrollToHeading(item.id)}
          className={`
            w-full text-left py-1.5 px-3 rounded text-sm transition-colors
            ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
            ${depth > 0 ? `ml-${depth * 3}` : ''}
          `}
          style={{ paddingLeft: `${(depth + 1) * 12}px` }}
          aria-current={isActive ? 'location' : undefined}
        >
          <span className="block truncate">{item.title}</span>
        </button>

        {hasChildren && (
          <div className="space-y-1">
            {item.children.map((child) => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      className={`table-of-contents sticky top-20 ${className}`}
      aria-label="Table of contents"
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <List className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Table of Contents
            </h2>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label={isCollapsed ? 'Expand table of contents' : 'Collapse table of contents'}
          >
            {isCollapsed ? 'Show' : 'Hide'}
          </button>
        </div>

        {/* Content */}
        {!isCollapsed && (
          <div className="p-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
            <div className="space-y-1">
              {items.map((item) => renderItem(item))}
            </div>
          </div>
        )}

        {/* Footer info */}
        {!isCollapsed && (
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {items.length} {items.length === 1 ? 'section' : 'sections'}
            </p>
          </div>
        )}
      </div>
    </nav>
  );
}

// Utility function to generate table of contents from HTML content
export function generateTableOfContents(content: string): TableOfContentsItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

  const items: TableOfContentsItem[] = [];
  const stack: { item: TableOfContentsItem; level: number }[] = [];

  headings.forEach((heading) => {
    const level = parseInt(heading.tagName.substring(1));
    const title = heading.textContent || '';
    const id = heading.id || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    // Ensure heading has an ID for scrolling
    if (!heading.id) {
      heading.id = id;
    }

    const item: TableOfContentsItem = {
      id,
      title,
      level,
      children: [],
    };

    // Pop stack until we find the appropriate parent
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    if (stack.length === 0) {
      // Top-level item
      items.push(item);
    } else {
      // Add as child to the last item in stack
      stack[stack.length - 1].item.children.push(item);
    }

    // Push current item to stack
    stack.push({ item, level });
  });

  return items;
}

// Hook for tracking active heading while scrolling
export function useActiveHeading(itemIds: string[]) {
  const [activeId, setActiveId] = useState<string>();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
      }
    );

    itemIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      itemIds.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [itemIds]);

  return activeId;
}
