import { test, expect } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';

test.describe('Performance Tests', () => {
  test.describe('Lighthouse Audits', () => {
    test('should pass Lighthouse audit for homepage', async ({ page }) => {
      await page.goto('/');

      await playAudit({
        page,
        thresholds: {
          performance: 80,
          accessibility: 90,
          'best-practices': 85,
          seo: 85,
        },
        port: 9222,
      });
    });

    test('should pass Lighthouse audit for dashboard', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.fill('input[name="email"]', 'student@test.com');
      await page.fill('input[name="password"]', 'Test123!@#');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/dashboard/);

      await playAudit({
        page,
        thresholds: {
          performance: 75,
          accessibility: 90,
          'best-practices': 85,
          seo: 80,
        },
        port: 9222,
      });
    });

    test('should pass Lighthouse audit for lessons page', async ({ page }) => {
      await page.goto('/lessons');

      await playAudit({
        page,
        thresholds: {
          performance: 75,
          accessibility: 90,
          'best-practices': 85,
          seo: 85,
        },
        port: 9222,
      });
    });
  });

  test.describe('Page Load Performance', () => {
    test('homepage should load within 3 seconds', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/', { waitUntil: 'networkidle' });

      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);
    });

    test('should measure First Contentful Paint', async ({ page }) => {
      await page.goto('/');

      const fcp = await page.evaluate(() => {
        return performance.getEntriesByName('first-contentful-paint')[0]?.startTime;
      });

      expect(fcp).toBeLessThan(1500);
    });

    test('should measure Largest Contentful Paint', async ({ page }) => {
      await page.goto('/');

      await page.waitForLoadState('networkidle');

      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          setTimeout(() => resolve(0), 5000);
        });
      });

      expect(lcp).toBeLessThan(2500);
    });

    test('should measure Time to Interactive', async ({ page }) => {
      await page.goto('/');

      const tti = await page.evaluate(() => {
        return performance.timing.domInteractive - performance.timing.navigationStart;
      });

      expect(tti).toBeLessThan(3500);
    });

    test('should have low Cumulative Layout Shift', async ({ page }) => {
      await page.goto('/');

      await page.waitForLoadState('networkidle');

      const cls = await page.evaluate(() => {
        return new Promise((resolve) => {
          let clsScore = 0;

          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsScore += (entry as any).value;
              }
            }
          }).observe({ entryTypes: ['layout-shift'] });

          setTimeout(() => resolve(clsScore), 3000);
        });
      });

      expect(cls).toBeLessThan(0.1);
    });
  });

  test.describe('Resource Performance', () => {
    test('should have optimized image sizes', async ({ page }) => {
      await page.goto('/');

      const images = await page.locator('img').all();

      for (const img of images) {
        const src = await img.getAttribute('src');
        if (src && !src.startsWith('data:')) {
          const response = await page.request.get(src);
          const size = parseInt(response.headers()['content-length'] || '0');

          // Images should be under 500KB
          expect(size).toBeLessThan(500 * 1024);
        }
      }
    });

    test('should have compressed assets', async ({ page }) => {
      await page.goto('/');

      const resources = await page.evaluate(() => {
        return performance.getEntriesByType('resource').map((r: any) => ({
          name: r.name,
          transferSize: r.transferSize,
          decodedBodySize: r.decodedBodySize,
        }));
      });

      const jsResources = resources.filter((r: any) => r.name.endsWith('.js'));

      // Check compression ratio
      jsResources.forEach((resource: any) => {
        if (resource.transferSize > 0 && resource.decodedBodySize > 0) {
          const ratio = resource.transferSize / resource.decodedBodySize;
          expect(ratio).toBeLessThan(0.5); // At least 50% compression
        }
      });
    });

    test('should use caching for static assets', async ({ page }) => {
      await page.goto('/');

      // Get initial resources
      const initialResources = await page.evaluate(() => {
        return performance.getEntriesByType('resource').length;
      });

      // Reload page
      await page.reload();

      // Get resources after reload
      const cachedResources = await page.evaluate(() => {
        return performance.getEntriesByType('resource').filter((r: any) => {
          return r.transferSize === 0; // Cached resources
        }).length;
      });

      // Some resources should be cached
      expect(cachedResources).toBeGreaterThan(0);
    });

    test('should lazy load images', async ({ page }) => {
      await page.goto('/lessons');

      // Get visible images
      const visibleImages = await page.locator('img[loading="lazy"]').count();

      expect(visibleImages).toBeGreaterThan(0);
    });

    test('should code split bundles', async ({ page }) => {
      await page.goto('/');

      const jsFiles = await page.evaluate(() => {
        return performance.getEntriesByType('resource')
          .filter((r: any) => r.name.endsWith('.js'))
          .map((r: any) => r.name);
      });

      // Should have multiple JS chunks
      expect(jsFiles.length).toBeGreaterThan(1);
    });
  });

  test.describe('API Performance', () => {
    test('should respond to API requests quickly', async ({ page }) => {
      const apiTimes: number[] = [];

      page.on('response', async (response) => {
        if (response.url().includes('/api/')) {
          const timing = response.timing();
          apiTimes.push(timing.responseEnd);
        }
      });

      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Average API response time should be under 500ms
      const avgTime = apiTimes.reduce((a, b) => a + b, 0) / apiTimes.length;
      expect(avgTime).toBeLessThan(500);
    });

    test('should handle concurrent API requests efficiently', async ({ page }) => {
      await page.goto('/dashboard');

      // Trigger multiple API calls
      await Promise.all([
        page.goto('/lessons'),
        page.goto('/quiz'),
        page.goto('/flashcards'),
      ]);

      // All should complete successfully
      await page.waitForLoadState('networkidle');
    });

    test('should paginate large datasets', async ({ page }) => {
      await page.goto('/lessons');

      const response = await page.waitForResponse((response) =>
        response.url().includes('/api/lessons') && response.status() === 200
      );

      const data = await response.json();

      // Should have pagination metadata
      expect(data).toHaveProperty('pagination');
      expect(data.pagination).toHaveProperty('page');
      expect(data.pagination).toHaveProperty('limit');
    });
  });

  test.describe('Memory Leaks', () => {
    test('should not leak memory on navigation', async ({ page, context }) => {
      await page.goto('/dashboard');

      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      // Navigate multiple times
      for (let i = 0; i < 10; i++) {
        await page.goto('/lessons');
        await page.goto('/dashboard');
      }

      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      // Memory should not increase significantly
      const memoryIncrease = finalMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
    });

    test('should clean up event listeners', async ({ page }) => {
      await page.goto('/lessons');

      const initialListeners = await page.evaluate(() => {
        return (window as any).getEventListeners ?
          Object.keys((window as any).getEventListeners(window)).length : 0;
      });

      // Navigate away and back
      await page.goto('/dashboard');
      await page.goto('/lessons');

      const finalListeners = await page.evaluate(() => {
        return (window as any).getEventListeners ?
          Object.keys((window as any).getEventListeners(window)).length : 0;
      });

      // Listener count should be similar
      expect(Math.abs(finalListeners - initialListeners)).toBeLessThan(10);
    });

    test('should clean up timers and intervals', async ({ page }) => {
      await page.goto('/quiz/quiz-1');

      // Start quiz with timer
      await page.click('[data-testid="start-quiz"]');

      const initialTimers = await page.evaluate(() => {
        return (window as any).__timers ? (window as any).__timers.length : 0;
      });

      // Navigate away
      await page.goto('/dashboard');

      const finalTimers = await page.evaluate(() => {
        return (window as any).__timers ? (window as any).__timers.length : 0;
      });

      // Timers should be cleaned up
      expect(finalTimers).toBeLessThanOrEqual(initialTimers);
    });
  });

  test.describe('Bundle Size', () => {
    test('should have optimized bundle size', async ({ page }) => {
      await page.goto('/');

      const bundles = await page.evaluate(() => {
        return performance.getEntriesByType('resource')
          .filter((r: any) => r.name.endsWith('.js'))
          .map((r: any) => ({
            name: r.name,
            size: r.transferSize,
          }));
      });

      const totalSize = bundles.reduce((acc: number, b: any) => acc + b.size, 0);

      // Total bundle size should be under 500KB
      expect(totalSize).toBeLessThan(500 * 1024);
    });

    test('should tree-shake unused code', async ({ page }) => {
      await page.goto('/');

      // Check if specific large libraries are tree-shaken
      const scripts = await page.evaluate(() => {
        return Array.from(document.scripts).map(s => s.src);
      });

      // Should not load entire lodash, moment, etc.
      scripts.forEach(src => {
        expect(src).not.toContain('lodash.js');
        expect(src).not.toContain('moment.js');
      });
    });
  });

  test.describe('Rendering Performance', () => {
    test('should render list efficiently with virtualization', async ({ page }) => {
      await page.goto('/lessons');

      const startTime = Date.now();

      // Scroll through list
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await page.waitForTimeout(1000);

      const renderTime = Date.now() - startTime;

      // Should render smoothly
      expect(renderTime).toBeLessThan(2000);

      // Check frame rate
      const fps = await page.evaluate(() => {
        return new Promise((resolve) => {
          let frames = 0;
          const start = performance.now();

          function countFrames() {
            frames++;
            if (performance.now() - start < 1000) {
              requestAnimationFrame(countFrames);
            } else {
              resolve(frames);
            }
          }

          requestAnimationFrame(countFrames);
        });
      });

      // Should maintain at least 30 FPS
      expect(fps).toBeGreaterThan(30);
    });

    test('should debounce search input', async ({ page }) => {
      await page.goto('/lessons');

      const searchInput = page.locator('[data-testid="lesson-search"]');

      let apiCallCount = 0;
      page.on('request', (request) => {
        if (request.url().includes('/api/lessons/search')) {
          apiCallCount++;
        }
      });

      // Type quickly
      await searchInput.type('playwright', { delay: 50 });

      await page.waitForTimeout(1000);

      // Should make only 1-2 API calls due to debouncing
      expect(apiCallCount).toBeLessThan(3);
    });

    test('should optimize re-renders', async ({ page }) => {
      await page.goto('/dashboard');

      // Measure render count
      const renderCount = await page.evaluate(() => {
        let count = 0;
        const observer = new MutationObserver(() => count++);
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });

        setTimeout(() => observer.disconnect(), 2000);

        return new Promise((resolve) => {
          setTimeout(() => resolve(count), 2100);
        });
      });

      // Should have minimal re-renders
      expect(renderCount).toBeLessThan(100);
    });
  });
});
