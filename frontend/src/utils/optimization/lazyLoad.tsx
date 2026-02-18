import { lazy, Suspense, ComponentType, ReactNode } from 'react';

interface LazyLoadOptions {
  fallback?: ReactNode;
  delay?: number;
}

/**
 * Enhanced lazy loading with configurable fallback and delay
 * Usage: const Component = lazyLoad(() => import('./Component'), { fallback: <Spinner /> })
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  { fallback = null, delay = 0 }: LazyLoadOptions = {}
) {
  const LazyComponent = lazy(() => {
    // Add artificial delay for testing (development only)
    if (delay > 0 && import.meta.env.DEV) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(importFunc()), delay);
      });
    }
    return importFunc();
  });

  return (props: any) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * Preload a lazy-loaded component
 * Usage: preloadComponent(() => import('./Component'))
 */
export function preloadComponent(importFunc: () => Promise<any>) {
  return importFunc();
}

/**
 * Lazy load component with retry logic
 */
export function lazyLoadWithRetry<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyLoadOptions & { retries?: number } = {}
) {
  const { retries = 3, ...lazyOptions } = options;

  return lazyLoad(
    () => retry(importFunc, retries),
    lazyOptions
  );
}

/**
 * Retry function for failed imports
 */
async function retry<T>(
  fn: () => Promise<T>,
  retriesLeft: number = 3,
  interval: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retriesLeft === 0) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
    return retry(fn, retriesLeft - 1, interval);
  }
}

/**
 * Prefetch routes on hover or focus
 */
export function prefetchOnInteraction(importFunc: () => Promise<any>) {
  let prefetched = false;

  const prefetch = () => {
    if (!prefetched) {
      prefetched = true;
      importFunc();
    }
  };

  return {
    onMouseEnter: prefetch,
    onFocus: prefetch
  };
}

/**
 * Lazy load image with intersection observer
 */
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null;
  private images: Set<HTMLImageElement> = new Set();

  constructor(options: IntersectionObserverInit = {}) {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              this.loadImage(img);
            }
          });
        },
        {
          rootMargin: '50px',
          threshold: 0.01,
          ...options
        }
      );
    }
  }

  observe(img: HTMLImageElement) {
    if (this.observer) {
      this.images.add(img);
      this.observer.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img);
    }
  }

  unobserve(img: HTMLImageElement) {
    if (this.observer) {
      this.observer.unobserve(img);
      this.images.delete(img);
    }
  }

  private loadImage(img: HTMLImageElement) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    if (src) {
      img.src = src;
      img.removeAttribute('data-src');
    }

    if (srcset) {
      img.srcset = srcset;
      img.removeAttribute('data-srcset');
    }

    if (this.observer) {
      this.observer.unobserve(img);
    }
    this.images.delete(img);
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.images.clear();
  }
}
