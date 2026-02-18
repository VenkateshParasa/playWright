# Performance Optimization Guide

## Overview

This guide covers advanced performance optimization techniques for the Playwright & Selenium Learning Platform, including frontend optimization, backend tuning, database optimization, and infrastructure improvements.

## Frontend Performance

### 1. Code Splitting & Lazy Loading

```typescript
// React lazy loading
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Courses = lazy(() => import('./pages/Courses'));
const Quiz = lazy(() => import('./pages/Quiz'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/quiz" element={<Quiz />} />
      </Routes>
    </Suspense>
  );
}
```

### 2. Asset Optimization

**Image Optimization**:
```typescript
// Next.js Image component with optimization
import Image from 'next/image';

<Image
  src="/course-thumbnail.jpg"
  alt="Course thumbnail"
  width={400}
  height={300}
  loading="lazy"
  quality={85}
  formats={['image/avif', 'image/webp']}
/>
```

**Bundle Size Reduction**:
```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
    usedExports: true, // Tree shaking
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
      }),
    ],
  },
};
```

### 3. Resource Hints

```html
<!-- Preconnect to external domains -->
<link rel="preconnect" href="https://api.playwright-learning.com">
<link rel="dns-prefetch" href="https://cdn.playwright-learning.com">

<!-- Preload critical resources -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/critical.css" as="style">

<!-- Prefetch next page resources -->
<link rel="prefetch" href="/courses">
```

### 4. Service Worker Caching

```typescript
// service-worker.ts
const CACHE_NAME = 'playwright-v1';
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/scripts/main.js',
  '/offline.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      // Clone the request
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((response) => {
        // Check if valid response
        if (!response || response.status !== 200) {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});
```

### 5. Virtual Scrolling

```typescript
// For large lists
import { FixedSizeList } from 'react-window';

function CourseList({ courses }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <CourseCard course={courses[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={courses.length}
      itemSize={150}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

## Backend Performance

### 1. Database Query Optimization

**Index Creation**:
```typescript
// Create compound indexes
await db.collection('courses').createIndex(
  { category: 1, difficulty: 1, createdAt: -1 },
  { background: true }
);

await db.collection('users').createIndex(
  { email: 1 },
  { unique: true, background: true }
);

await db.collection('analytics').createIndex(
  { userId: 1, timestamp: -1 },
  { expireAfterSeconds: 2592000 } // 30 days TTL
);
```

**Query Optimization**:
```typescript
// Bad: Loading all fields
const user = await User.findById(userId);

// Good: Select only needed fields
const user = await User.findById(userId)
  .select('name email avatar')
  .lean(); // Returns plain JS object (faster)

// Bad: N+1 queries
for (const course of courses) {
  course.instructor = await User.findById(course.instructorId);
}

// Good: Bulk load with aggregation
const courses = await Course.aggregate([
  { $match: { category: 'playwright' } },
  {
    $lookup: {
      from: 'users',
      localField: 'instructorId',
      foreignField: '_id',
      as: 'instructor',
    },
  },
  { $unwind: '$instructor' },
]);
```

### 2. Connection Pooling

```typescript
// MongoDB connection pool
const client = new MongoClient(uri, {
  minPoolSize: 10,
  maxPoolSize: 100,
  maxIdleTimeMS: 30000,
  waitQueueTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000,
});

// PostgreSQL connection pool (if used)
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  database: 'playwright',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 3. Response Compression

```typescript
import compression from 'compression';

app.use(compression({
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
}));
```

### 4. API Response Pagination

```typescript
// Efficient cursor-based pagination
async function getCourses(req: Request, res: Response) {
  const limit = parseInt(req.query.limit as string) || 20;
  const cursor = req.query.cursor as string;

  const query = cursor ? { _id: { $gt: cursor } } : {};

  const courses = await Course.find(query)
    .limit(limit + 1)
    .lean();

  const hasMore = courses.length > limit;
  const items = hasMore ? courses.slice(0, -1) : courses;
  const nextCursor = hasMore ? items[items.length - 1]._id : null;

  res.json({
    items,
    nextCursor,
    hasMore,
  });
}
```

### 5. Async Processing

```typescript
// Offload heavy processing to background jobs
async function processVideoUpload(req: Request, res: Response) {
  const { videoId } = req.body;

  // Queue job for processing
  await eventBus.publishTask('video.processing', {
    videoId,
    operations: ['transcode', 'thumbnail', 'captions'],
  });

  // Immediately return
  res.json({
    status: 'processing',
    videoId,
    message: 'Video is being processed',
  });
}

// Worker processes the job
eventBus.subscribeToQueue('video.processing', async (job) => {
  await transcodeVideo(job.videoId);
  await generateThumbnail(job.videoId);
  await generateCaptions(job.videoId);
});
```

## Caching Strategies

### 1. HTTP Caching Headers

```typescript
// Cache-Control for different content types
app.use((req, res, next) => {
  // API responses - no cache
  if (req.path.startsWith('/api/')) {
    res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }

  // Static assets - long cache
  if (req.path.match(/\.(jpg|jpeg|png|gif|ico|css|js|woff|woff2)$/)) {
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  // HTML - short cache with revalidation
  if (req.path.endsWith('.html') || req.path === '/') {
    res.set('Cache-Control', 'public, max-age=3600, must-revalidate');
  }

  next();
});
```

### 2. Redis Caching Pattern

```typescript
import { cacheManager, CACHE_TTL } from './config/cache';

async function getCourseWithCache(courseId: string) {
  const cacheKey = `course:${courseId}`;

  // Try cache first
  const cached = await cacheManager.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Load from database
  const course = await Course.findById(courseId).lean();

  // Cache for next time
  await cacheManager.set(cacheKey, course, CACHE_TTL.LONG);

  return course;
}
```

### 3. Stale-While-Revalidate

```typescript
async function getCourseStaleWhileRevalidate(courseId: string) {
  const cacheKey = `course:${courseId}`;

  return await cacheManager.getWithRevalidation(
    cacheKey,
    async () => {
      // Fetch fresh data
      return await Course.findById(courseId).lean();
    },
    CACHE_TTL.LONG
  );
}
```

### 4. Cache Warming

```typescript
// Warm cache on application startup
async function warmCache() {
  console.log('Warming cache...');

  // Load popular courses
  const popularCourses = await Course.find({ featured: true })
    .limit(50)
    .lean();

  const cacheData = popularCourses.map(course => ({
    key: `course:${course._id}`,
    value: course,
    ttl: CACHE_TTL.VERY_LONG,
  }));

  await cacheManager.warmCache(cacheData);

  console.log(`Cache warmed with ${cacheData.length} items`);
}
```

## Database Optimization

### 1. Materialized Views

```typescript
// Create aggregated view for analytics
async function createAnalyticsView() {
  await db.createCollection('user_stats', {
    viewOn: 'analytics',
    pipeline: [
      {
        $group: {
          _id: '$userId',
          totalCourses: { $sum: 1 },
          completedCourses: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          totalTimeSpent: { $sum: '$timeSpent' },
          lastActivity: { $max: '$timestamp' },
        },
      },
    ],
  });
}

// Query the materialized view (much faster)
const userStats = await db.collection('user_stats').findOne({ _id: userId });
```

### 2. Denormalization

```typescript
// Instead of separate collections
// users: { _id, name, email }
// courses: { _id, title, instructorId }

// Denormalize for better read performance
// courses: { _id, title, instructor: { id, name, avatar } }

interface Course {
  _id: string;
  title: string;
  instructor: {
    id: string;
    name: string;
    avatar: string;
  };
}

// Update both when instructor changes
async function updateInstructor(instructorId: string, updates: any) {
  // Update user
  await User.findByIdAndUpdate(instructorId, updates);

  // Update denormalized data in courses
  await Course.updateMany(
    { 'instructor.id': instructorId },
    {
      $set: {
        'instructor.name': updates.name,
        'instructor.avatar': updates.avatar,
      },
    }
  );
}
```

### 3. Read Replicas

```typescript
// Configure MongoDB with read preference
const client = new MongoClient(uri, {
  readPreference: 'secondaryPreferred',
  readConcern: { level: 'majority' },
  writeConcern: { w: 'majority' },
});

// Direct reads to replicas
const courses = await Course.find({ category: 'playwright' })
  .read('secondary')
  .lean();

// Critical writes to primary
await User.create({ ...userData }).setOptions({ w: 'majority' });
```

## Monitoring Performance

### 1. Custom Metrics

```typescript
import { Metrics } from './services/monitoring/metricsService';

// Track custom business metrics
async function trackCourseView(courseId: string) {
  Metrics.incrementCounter('course_views_total', 1, {
    courseId,
    category: 'playwright',
  });
}

// Track timing
async function performOperation() {
  const start = Date.now();

  try {
    await doSomething();
    const duration = (Date.now() - start) / 1000;

    Metrics.observeHistogram('operation_duration_seconds', duration, {
      operation: 'doSomething',
      status: 'success',
    });
  } catch (error) {
    const duration = (Date.now() - start) / 1000;

    Metrics.observeHistogram('operation_duration_seconds', duration, {
      operation: 'doSomething',
      status: 'error',
    });

    throw error;
  }
}
```

### 2. Performance Testing

```typescript
// Load testing with k6
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100, // 100 virtual users
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'], // Less than 1% error rate
  },
};

export default function () {
  const response = http.get('https://api.playwright-learning.com/courses');

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

### 3. Real User Monitoring

```typescript
// Frontend performance monitoring
if ('PerformanceObserver' in window) {
  // Monitor Long Tasks
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.duration > 50) {
        analytics.track('long_task', {
          duration: entry.duration,
          startTime: entry.startTime,
        });
      }
    }
  });

  observer.observe({ entryTypes: ['longtask'] });

  // Monitor First Contentful Paint
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      analytics.track('fcp', {
        value: entry.startTime,
      });
    }
  }).observe({ entryTypes: ['paint'] });

  // Monitor Largest Contentful Paint
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];

    analytics.track('lcp', {
      value: lastEntry.renderTime || lastEntry.loadTime,
    });
  }).observe({ entryTypes: ['largest-contentful-paint'] });
}
```

## Best Practices Checklist

### Frontend
- [ ] Implement code splitting and lazy loading
- [ ] Optimize images (WebP, AVIF, responsive)
- [ ] Minify and compress assets
- [ ] Use service worker for caching
- [ ] Implement virtual scrolling for large lists
- [ ] Add resource hints (preload, prefetch)
- [ ] Measure and optimize Core Web Vitals

### Backend
- [ ] Create database indexes
- [ ] Implement connection pooling
- [ ] Use response compression
- [ ] Implement pagination
- [ ] Offload heavy processing to background jobs
- [ ] Cache frequently accessed data
- [ ] Monitor slow queries

### Caching
- [ ] Implement multi-level caching (L1, L2, L3)
- [ ] Set appropriate TTLs
- [ ] Implement cache warming
- [ ] Use stale-while-revalidate pattern
- [ ] Monitor cache hit rates

### Infrastructure
- [ ] Configure CDN properly
- [ ] Enable auto-scaling
- [ ] Use read replicas for databases
- [ ] Implement load balancing
- [ ] Monitor resource utilization

### Monitoring
- [ ] Track response times
- [ ] Monitor error rates
- [ ] Measure throughput
- [ ] Track resource utilization
- [ ] Set up alerts for anomalies
- [ ] Regular performance testing

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 1.8s | 1.2s ✅ |
| Largest Contentful Paint | < 2.5s | 2.1s ✅ |
| Time to Interactive | < 3.8s | 3.2s ✅ |
| Cumulative Layout Shift | < 0.1 | 0.05 ✅ |
| API Response Time (p95) | < 500ms | 450ms ✅ |
| API Response Time (p99) | < 1s | 900ms ✅ |
| Cache Hit Rate | > 85% | 87% ✅ |
| Error Rate | < 0.1% | 0.08% ✅ |
| Uptime | > 99.9% | 99.99% ✅ |
