# Performance Optimization Guide

## Overview

This guide covers all performance optimizations implemented in the Playwright & Selenium Learning Platform. Our goal is to achieve excellent Core Web Vitals scores and provide a fast, responsive user experience.

## Table of Contents

1. [Frontend Optimization](#frontend-optimization)
2. [Backend Optimization](#backend-optimization)
3. [Asset Optimization](#asset-optimization)
4. [Monitoring & Profiling](#monitoring--profiling)
5. [Best Practices](#best-practices)

## Frontend Optimization

### 1. Code Splitting & Lazy Loading

#### Route-based Code Splitting

```typescript
// Lazy load route components
import { lazyLoad } from '@/utils/optimization/lazyLoad';

const Dashboard = lazyLoad(() => import('./pages/Dashboard'), {
  fallback: <LoadingSpinner />
});

const Lessons = lazyLoad(() => import('./pages/Lessons'), {
  fallback: <LoadingSpinner />
});
```

#### Component-level Lazy Loading

```typescript
// Lazy load heavy components
const MonacoEditor = lazyLoad(() => import('@monaco-editor/react'), {
  fallback: <CodeEditorSkeleton />
});

const Charts = lazyLoad(() => import('./components/Charts'), {
  fallback: <ChartSkeleton />
});
```

#### Prefetching on Hover

```typescript
import { prefetchOnInteraction } from '@/utils/optimization/lazyLoad';

// Prefetch component on hover
<Link
  to="/lessons"
  {...prefetchOnInteraction(() => import('./pages/Lessons'))}
>
  View Lessons
</Link>
```

### 2. Bundle Optimization

#### Vite Configuration

The optimized `vite.config.ts` includes:

- **Code splitting**: Separate chunks for React, Router, Monaco Editor, Charts, etc.
- **Tree shaking**: Remove unused code
- **Minification**: Terser with aggressive optimization
- **Compression**: Brotli and Gzip for production builds

#### Bundle Analysis

```bash
# Build and analyze bundle
npm run build

# View bundle analysis
open dist/stats.html
```

#### Reducing Bundle Size

```typescript
// ❌ Bad: Import entire library
import _ from 'lodash';

// ✅ Good: Import only what you need
import debounce from 'lodash/debounce';

// ✅ Better: Use native JavaScript
const debounce = (fn, delay) => { /* ... */ };
```

### 3. React Component Optimization

#### Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';
import { deepMemo, memoWithComparison } from '@/utils/optimization/reactOptimization';

// Memoize component with shallow comparison
const MemoizedComponent = memo(MyComponent);

// Memoize with deep comparison
const DeepMemoComponent = deepMemo(ExpensiveComponent);

// Memoize with custom comparison
const CustomMemoComponent = memoWithComparison(
  MyComponent,
  (prev, next) => prev.id === next.id
);
```

#### Expensive Computations

```typescript
// Cache expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Cache callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

#### Stable Callbacks

```typescript
import { useStableCallback } from '@/utils/optimization/reactOptimization';

// Callback that doesn't change between renders
const stableCallback = useStableCallback((data) => {
  processData(data);
});
```

### 4. Virtual Scrolling

For large lists (>100 items), use virtual scrolling:

```typescript
import { useVirtualScroll, WindowedList } from '@/utils/optimization/virtualScroll';

// Hook-based approach
function LargeList({ items }) {
  const { virtualItems, totalHeight, offsetY } = useVirtualScroll(items, {
    itemHeight: 60,
    containerHeight: 600,
    overscan: 3
  });

  return (
    <div style={{ height: 600, overflow: 'auto' }}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {virtualItems.map(item => (
            <ListItem key={item.id} data={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Component-based approach
function SimpleList({ items }) {
  return (
    <WindowedList
      items={items}
      itemHeight={60}
      height={600}
      renderItem={(item) => <ListItem data={item} />}
    />
  );
}
```

### 5. Image Optimization

#### Lazy Loading Images

```typescript
import { LazyImage, ProgressiveImage } from '@/utils/optimization/imageOptimization';

// Simple lazy loading
<LazyImage
  src="/images/hero.jpg"
  alt="Hero image"
  className="w-full"
/>

// Progressive loading with blur effect
<ProgressiveImage
  src="/images/hero.jpg"
  placeholder="/images/hero-thumb.jpg"
  alt="Hero image"
  aspectRatio={16/9}
/>
```

#### Responsive Images

```typescript
import { useResponsiveImage, ResponsivePicture } from '@/utils/optimization/imageOptimization';

// Hook-based
function ResponsiveImage({ src, alt }) {
  const { srcSet, sources } = useResponsiveImage(src);

  return (
    <img
      src={src}
      srcSet={srcSet}
      alt={alt}
      loading="lazy"
    />
  );
}

// Component-based
<ResponsivePicture
  src="/images/hero.jpg"
  alt="Hero"
  sources={[
    { srcSet: '/images/hero-320.webp', type: 'image/webp', media: '(max-width: 320px)' },
    { srcSet: '/images/hero-640.webp', type: 'image/webp', media: '(max-width: 640px)' },
    { srcSet: '/images/hero-1024.webp', type: 'image/webp', media: '(max-width: 1024px)' }
  ]}
/>
```

#### Image Compression

```typescript
import { compressImage } from '@/utils/optimization/imageOptimization';

// Client-side compression before upload
async function handleImageUpload(file: File) {
  const compressed = await compressImage(file, 1920, 0.85);
  await uploadImage(compressed);
}
```

### 6. Debouncing & Throttling

#### Search Input Debouncing

```typescript
import { useDebounce, useDebouncedValue } from '@/utils/optimization/debounceThrottle';

function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      searchAPI(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
```

#### Scroll Event Throttling

```typescript
import { useThrottle, rafThrottle } from '@/utils/optimization/debounceThrottle';

function ScrollHandler() {
  const handleScroll = useThrottle(() => {
    const scrollY = window.scrollY;
    updateScrollPosition(scrollY);
  }, 100);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
}
```

### 7. Service Worker Caching

The PWA service worker provides caching strategies:

- **Cache-First**: Fonts, images (long-term cache)
- **Network-First**: API calls (with offline fallback)
- **Stale-While-Revalidate**: Lesson content (balance speed and freshness)

Configure in `vite.config.ts`:

```typescript
workbox: {
  runtimeCaching: [
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
        }
      }
    }
  ]
}
```

## Backend Optimization

### 1. Database Optimization

#### Connection Pooling

```typescript
import { connectDatabase } from './config/database';

await connectDatabase({
  uri: process.env.MONGODB_URI,
  options: {
    maxPoolSize: 10,
    minPoolSize: 5,
    maxIdleTimeMS: 60000
  }
});
```

#### Indexing

```typescript
import { IndexStrategies, createIndexes } from './config/database';

// Single field index
userSchema.index({ email: 1 }, { unique: true });

// Compound index
lessonSchema.index({ userId: 1, completedAt: -1 });

// Text search index
contentSchema.index({ title: 'text', description: 'text' });

// TTL index for auto-deletion
sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });
```

#### Query Optimization

```typescript
import { QueryOptimizer } from './config/database';

// Use lean() for read-only queries
const users = await User.find().lean();

// Select only needed fields
const users = await User.find().select('name email').lean();

// Pagination
const users = await QueryOptimizer.paginate(
  User.find(),
  page,
  limit
);

// Explain query
const explanation = await QueryOptimizer.explain(
  User.find({ email: 'test@example.com' })
);
```

### 2. Caching Layer

#### In-Memory Caching

```typescript
import { cache, cacheMiddleware } from './middleware/cache';

// Cache GET requests for 10 minutes
app.get('/api/lessons', cacheMiddleware(600), getLessons);

// Manual caching
const lessons = cache.get('lessons');
if (!lessons) {
  const fresh = await fetchLessons();
  cache.set('lessons', fresh, 600);
}
```

#### Cache Invalidation

```typescript
import { invalidateCache, invalidateUserCache } from './middleware/cache';

// Invalidate by pattern
app.post('/api/lessons', async (req, res) => {
  const lesson = await createLesson(req.body);
  invalidateCache('lessons'); // Clear all lesson caches
  res.json(lesson);
});

// Invalidate user-specific cache
app.put('/api/users/:id', async (req, res) => {
  const user = await updateUser(req.params.id, req.body);
  invalidateUserCache(req.params.id);
  res.json(user);
});
```

#### Query Result Caching

```typescript
import { QueryCache } from './middleware/cache';

const queryCache = new QueryCache(100);

async function getUser(id: string) {
  const cached = queryCache.get('getUser', { id });
  if (cached) return cached;

  const user = await User.findById(id);
  queryCache.set('getUser', { id }, user);
  return user;
}
```

### 3. Compression

#### Enable Compression

```typescript
import { setupCompression } from './middleware/compression';

app.use(setupCompression());
```

#### Brotli Compression

```typescript
import { brotliCompression } from './middleware/compression';

// Use brotli for modern browsers
app.use(brotliCompression());
```

### 4. Request Batching

```typescript
import DataLoader from 'dataloader';

// Batch user loads
const userLoader = new DataLoader(async (ids) => {
  const users = await User.find({ _id: { $in: ids } });
  return ids.map(id => users.find(u => u.id === id));
});

// Usage
const user1 = await userLoader.load(userId1);
const user2 = await userLoader.load(userId2); // Batched with user1
```

### 5. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);
```

## Asset Optimization

### 1. Image Optimization Script

```bash
# Optimize all images
./scripts/optimize-images.sh ./frontend/public ./frontend/public/optimized 85

# Result: Optimized images + WebP versions + responsive sizes
```

### 2. Font Optimization

```html
<!-- Preload critical fonts -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>

<!-- Use font-display: swap -->
<style>
  @font-face {
    font-family: 'Inter';
    src: url('/fonts/inter.woff2') format('woff2');
    font-display: swap;
  }
</style>
```

### 3. SVG Optimization

```bash
# Install SVGO
npm install -g svgo

# Optimize SVGs
svgo -f ./frontend/public/icons -o ./frontend/public/icons-optimized
```

## Monitoring & Profiling

### 1. Performance Monitoring

```typescript
import { initPerformanceMonitoring } from '@/utils/optimization/performanceMonitoring';

// Initialize monitoring
const monitor = initPerformanceMonitoring();

// Subscribe to metrics
monitor.subscribe((metric) => {
  console.log(`${metric.name}: ${metric.value}ms (${metric.rating})`);

  // Send to analytics
  analytics.track('web_vital', {
    metric: metric.name,
    value: metric.value,
    rating: metric.rating
  });
});
```

### 2. Custom Performance Marks

```typescript
import { PerformanceTracker } from '@/utils/optimization/performanceMonitoring';

// Mark start
PerformanceTracker.mark('data-fetch-start');

// Fetch data
await fetchData();

// Mark end
PerformanceTracker.mark('data-fetch-end');

// Measure duration
const duration = PerformanceTracker.measure(
  'data-fetch',
  'data-fetch-start',
  'data-fetch-end'
);

console.log(`Data fetch took ${duration}ms`);
```

### 3. Resource Monitoring

```typescript
import { ResourceMonitor } from '@/utils/optimization/performanceMonitoring';

// Get all resources
const resources = ResourceMonitor.getResources();

// Get slowest resources
const slowest = ResourceMonitor.getSlowestResources(10);

// Get total size
const totalSize = ResourceMonitor.getTotalSize();
console.log(`Total resources: ${totalSize / 1024 / 1024}MB`);
```

### 4. Memory Monitoring

```typescript
import { MemoryMonitor } from '@/utils/optimization/performanceMonitoring';

// Get memory usage
const usage = MemoryMonitor.getMemoryUsage();
console.log(`Memory usage: ${usage.usagePercent.toFixed(2)}%`);

// Continuous monitoring
const stop = MemoryMonitor.startMonitoring(5000, (usage) => {
  if (usage.usagePercent > 90) {
    console.warn('High memory usage detected!');
  }
});

// Stop monitoring
stop();
```

## Best Practices

### 1. Component Best Practices

- Use `memo` for components that receive the same props frequently
- Use `useMemo` for expensive computations
- Use `useCallback` for callbacks passed to child components
- Avoid inline object/array creation in render
- Use `key` prop correctly in lists

### 2. State Management Best Practices

- Keep state as local as possible
- Avoid unnecessary re-renders
- Use context wisely (split contexts by update frequency)
- Consider state colocation

### 3. API Best Practices

- Implement pagination for large datasets
- Use cursor-based pagination for real-time data
- Enable compression for API responses
- Cache responses appropriately
- Use ETags for conditional requests

### 4. Build Best Practices

- Enable source map only for debugging
- Use production builds for deployment
- Analyze bundle regularly
- Monitor bundle size in CI/CD
- Use dynamic imports for large dependencies

### 5. Testing Best Practices

- Run Lighthouse CI on every PR
- Monitor Core Web Vitals
- Set performance budgets
- Test on real devices
- Test on slow networks (3G)

## Performance Checklist

- [ ] Route-based code splitting implemented
- [ ] Heavy components lazy loaded
- [ ] Virtual scrolling for large lists
- [ ] Images optimized and lazy loaded
- [ ] Fonts optimized with font-display: swap
- [ ] Service worker caching configured
- [ ] Database queries optimized with indexes
- [ ] API responses cached appropriately
- [ ] Compression enabled (Brotli/Gzip)
- [ ] Bundle size < 250KB
- [ ] Lighthouse score > 90
- [ ] FCP < 1.5s
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] TTI < 3.5s

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [React Performance](https://react.dev/learn/render-and-commit)
- [MongoDB Performance](https://docs.mongodb.com/manual/administration/analyzing-mongodb-performance/)
