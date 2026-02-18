# Microservices Architecture Guide

## Overview

The Playwright & Selenium Learning Platform uses a microservices architecture to achieve scalability, maintainability, and independent deployment of services.

## Architecture Diagram

```
                                    ┌─────────────────┐
                                    │   CloudFront    │
                                    │      CDN        │
                                    └────────┬────────┘
                                             │
                                    ┌────────▼────────┐
                                    │  Load Balancer  │
                                    │    (NGINX)      │
                                    └────────┬────────┘
                                             │
                     ┌───────────────────────┼───────────────────────┐
                     │                       │                       │
            ┌────────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐
            │  API Gateway    │    │  API Gateway    │    │  API Gateway    │
            │   (Instance 1)  │    │   (Instance 2)  │    │   (Instance 3)  │
            └────────┬────────┘    └────────┬────────┘    └────────┬────────┘
                     │                       │                       │
                     └───────────────────────┼───────────────────────┘
                                             │
                     ┌───────────────────────┴───────────────────────┐
                     │           Service Registry & Discovery        │
                     └───────────────────────┬───────────────────────┘
                                             │
         ┌───────────────┬──────────────────┼──────────────────┬───────────────┐
         │               │                  │                  │               │
    ┌────▼─────┐   ┌────▼─────┐      ┌────▼─────┐      ┌────▼─────┐   ┌────▼─────┐
    │   Auth   │   │ Content  │      │Analytics │      │Notification│   │  User   │
    │ Service  │   │ Service  │      │ Service  │      │  Service   │   │ Service │
    └────┬─────┘   └────┬─────┘      └────┬─────┘      └────┬─────┘   └────┬─────┘
         │               │                  │                  │               │
         └───────────────┴──────────────────┴──────────────────┴───────────────┘
                                             │
                     ┌───────────────────────┴───────────────────────┐
                     │                                               │
            ┌────────▼────────┐                           ┌─────────▼────────┐
            │    MongoDB      │                           │  Redis Cluster   │
            │  Replica Set    │                           │   (L2 Cache)     │
            └─────────────────┘                           └──────────────────┘
                     │
            ┌────────▼────────┐
            │   RabbitMQ      │
            │  (Task Queue)   │
            └─────────────────┘
                     │
            ┌────────▼────────┐
            │     Kafka       │
            │ (Event Stream)  │
            └─────────────────┘
```

## Service Definitions

### 1. API Gateway

**Purpose**: Single entry point for all client requests, handles routing, rate limiting, and authentication.

**Responsibilities**:
- Request routing to appropriate services
- Authentication and authorization
- Rate limiting per user/IP
- Request/response transformation
- API versioning
- Circuit breaking
- Request logging and metrics

**Technology Stack**:
- Node.js/Express
- JWT authentication
- Redis for rate limiting
- Prometheus metrics

**Endpoints**:
- `/api/auth/*` → Auth Service
- `/api/content/*` → Content Service
- `/api/analytics/*` → Analytics Service
- `/api/notifications/*` → Notification Service
- `/api/users/*` → User Service

**Configuration**:
```typescript
// backend/src/config/microservices.ts
export const API_GATEWAY_CONFIG = {
  port: 3000,
  timeout: 30000,
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
  routes: [
    { path: '/api/auth', service: 'auth-service' },
    { path: '/api/content', service: 'content-service' },
    // ...
  ],
};
```

### 2. Auth Service

**Purpose**: Handle all authentication and authorization operations.

**Responsibilities**:
- User registration and login
- JWT token generation and validation
- Password hashing and verification
- OAuth2 integration
- Session management
- Permission checking
- API key management

**Technology Stack**:
- Node.js/Express
- JWT for tokens
- bcrypt for password hashing
- MongoDB for user storage
- Redis for session cache

**Endpoints**:
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /refresh` - Refresh token
- `POST /verify` - Verify token
- `GET /me` - Current user info

**Port**: 3001

### 3. Content Service

**Purpose**: Manage all content-related operations (lessons, courses, quizzes).

**Responsibilities**:
- CRUD operations for courses
- Lesson management
- Quiz creation and management
- Content versioning
- Media upload/storage (S3)
- Content search and indexing
- Content recommendations

**Technology Stack**:
- Node.js/Express
- MongoDB for content storage
- AWS S3 for media files
- Redis for content cache
- Elasticsearch for search

**Endpoints**:
- `GET /courses` - List courses
- `GET /courses/:id` - Get course details
- `POST /courses` - Create course
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course
- `GET /lessons/:id` - Get lesson
- `POST /quizzes` - Create quiz

**Port**: 3002

### 4. Analytics Service

**Purpose**: Collect, process, and analyze user behavior and platform metrics.

**Responsibilities**:
- Event tracking
- User behavior analysis
- Performance metrics
- Custom reports
- Data aggregation
- Real-time dashboards
- A/B testing results

**Technology Stack**:
- Node.js/Express
- ClickHouse for analytics data
- Kafka for event streaming
- Redis for real-time aggregation
- MongoDB for aggregated reports

**Endpoints**:
- `POST /events` - Track event
- `GET /users/:id/analytics` - User analytics
- `GET /dashboard` - Dashboard data
- `GET /reports/:type` - Generate report
- `GET /metrics` - Platform metrics

**Port**: 3003

### 5. Notification Service

**Purpose**: Handle all notification delivery (email, push, SMS).

**Responsibilities**:
- Email sending
- Push notification delivery
- SMS sending
- Notification templates
- Delivery tracking
- Retry logic
- Notification preferences

**Technology Stack**:
- Node.js/Express
- RabbitMQ for queue
- SendGrid for email
- Firebase for push notifications
- Twilio for SMS
- MongoDB for templates

**Endpoints**:
- `POST /send/email` - Send email
- `POST /send/push` - Send push notification
- `POST /send/sms` - Send SMS
- `GET /templates` - List templates
- `POST /templates` - Create template

**Port**: 3004

### 6. User Service (Gamification)

**Purpose**: Manage user profiles, progress, and gamification.

**Responsibilities**:
- User profile management
- Progress tracking
- Achievement system
- Leaderboards
- Badges and rewards
- Streak tracking
- XP and levels

**Technology Stack**:
- Node.js/Express
- MongoDB for user data
- Redis for leaderboards
- Kafka for event publishing

**Endpoints**:
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update profile
- `GET /users/:id/progress` - Get progress
- `GET /users/:id/achievements` - Get achievements
- `GET /leaderboard` - Get leaderboard

**Port**: 3005

## Inter-Service Communication

### 1. Synchronous Communication (HTTP/gRPC)

**HTTP REST API**:
```typescript
// Service Client
import { serviceClient } from './config/microservices';

// Call another service
const result = await serviceClient.call('auth-service', '/verify', {
  method: 'POST',
  body: JSON.stringify({ token }),
});
```

**gRPC** (for high-performance communication):
```protobuf
// auth.proto
service AuthService {
  rpc VerifyToken (VerifyTokenRequest) returns (VerifyTokenResponse);
  rpc GetUser (GetUserRequest) returns (GetUserResponse);
}
```

### 2. Asynchronous Communication (Message Queue)

**RabbitMQ** (for task queues):
```typescript
// Publish task
await eventBus.publishTask('email.notifications', {
  to: 'user@example.com',
  template: 'welcome',
  data: { name: 'John' },
});

// Subscribe to queue
await eventBus.subscribeToQueue('email.notifications', async (data) => {
  await sendEmail(data);
});
```

**Kafka** (for event streaming):
```typescript
// Publish event
await eventBus.publishEvent('user.events', {
  type: 'USER_REGISTERED',
  userId: '123',
  timestamp: Date.now(),
});

// Subscribe to topic
await eventBus.subscribeToTopic('user.events', async (event) => {
  if (event.type === 'USER_REGISTERED') {
    await handleUserRegistration(event);
  }
});
```

## Service Discovery

### Service Registry

```typescript
// Register service
serviceRegistry.register({
  name: 'auth-service',
  version: '1.0.0',
  host: 'localhost',
  port: 3001,
  protocol: 'http',
  healthEndpoint: '/health',
  metadata: {
    environment: 'production',
    region: 'us-east-1',
  },
});

// Discover service
const service = serviceRegistry.discover('auth-service');
console.log(service); // { host: 'localhost', port: 3001, ... }
```

### Health Checks

Each service must implement:
- `/health` - Liveness probe
- `/health/ready` - Readiness probe
- `/metrics` - Prometheus metrics

```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'auth-service',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
```

## Circuit Breaker Pattern

Prevents cascading failures when a service is down:

```typescript
import { CircuitBreaker } from './config/microservices';

const breaker = new CircuitBreaker(5, 60000, 30000);

try {
  const result = await breaker.execute(async () => {
    return await fetch('http://auth-service:3001/verify');
  });
} catch (error) {
  // Circuit is open, handle gracefully
  console.error('Service unavailable:', error);
}
```

Circuit states:
- **CLOSED**: Normal operation
- **OPEN**: Too many failures, reject requests
- **HALF_OPEN**: Testing if service recovered

## CQRS Pattern

Command Query Responsibility Segregation:

```typescript
// Command Bus (writes)
commandBus.register('CreateCourse', async (command) => {
  const course = await Course.create(command.data);
  await eventBus.publishEvent('course.events', {
    type: 'COURSE_CREATED',
    courseId: course.id,
  });
  return course;
});

// Execute command
const course = await commandBus.execute('CreateCourse', {
  data: { title: 'New Course', ... },
});

// Query Bus (reads)
queryBus.register('GetCourse', async (query) => {
  return await Course.findById(query.courseId);
});

// Execute query
const course = await queryBus.execute('GetCourse', {
  courseId: '123',
});
```

## Event Sourcing

Store all changes as events:

```typescript
// Event Store
const events = [
  { type: 'USER_REGISTERED', data: { userId: '123', email: 'user@example.com' } },
  { type: 'USER_EMAIL_VERIFIED', data: { userId: '123' } },
  { type: 'COURSE_ENROLLED', data: { userId: '123', courseId: '456' } },
];

// Rebuild state from events
function rebuildUserState(userId: string) {
  const userEvents = events.filter(e => e.data.userId === userId);
  let state = {};

  for (const event of userEvents) {
    switch (event.type) {
      case 'USER_REGISTERED':
        state = { ...state, ...event.data };
        break;
      case 'USER_EMAIL_VERIFIED':
        state = { ...state, emailVerified: true };
        break;
      // ...
    }
  }

  return state;
}
```

## API Versioning

Support multiple API versions:

```typescript
// v1 API
app.use('/api/v1', v1Router);

// v2 API (with breaking changes)
app.use('/api/v2', v2Router);

// Version header
app.use((req, res, next) => {
  const version = req.headers['api-version'] || 'v1';
  req.apiVersion = version;
  next();
});
```

## Service Mesh (Istio)

For advanced traffic management:

```yaml
# Virtual Service
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: auth-service
spec:
  hosts:
  - auth-service
  http:
  - route:
    - destination:
        host: auth-service
        subset: v1
      weight: 90
    - destination:
        host: auth-service
        subset: v2
      weight: 10
```

## Monitoring & Observability

### Distributed Tracing

```typescript
import { Tracing } from './services/monitoring/tracingService';

// Start span
const spanId = Tracing.startSpan(req, 'database-query');

try {
  const result = await performQuery();
  Tracing.finishSpan(req, spanId, 'ok');
  return result;
} catch (error) {
  Tracing.setTag(req, spanId, 'error', true);
  Tracing.finishSpan(req, spanId, 'error');
  throw error;
}
```

### Metrics

```typescript
import { Metrics } from './services/monitoring/metricsService';

// Track metrics
Metrics.incrementCounter('http_requests_total', 1, {
  method: 'GET',
  route: '/api/users',
  status: '200',
});

Metrics.observeHistogram('http_request_duration_seconds', duration, {
  method: 'GET',
  route: '/api/users',
});
```

## Best Practices

1. **Single Responsibility**: Each service should do one thing well
2. **Loose Coupling**: Services should be independent
3. **High Cohesion**: Related functionality in same service
4. **API Gateway**: Single entry point for clients
5. **Service Discovery**: Dynamic service location
6. **Circuit Breakers**: Prevent cascading failures
7. **Bulkheads**: Isolate resources per service
8. **Timeouts**: Set reasonable timeouts
9. **Retries**: Implement exponential backoff
10. **Monitoring**: Track everything
11. **Logging**: Structured, centralized logs
12. **Versioning**: Support multiple API versions
13. **Documentation**: Keep API docs up to date
14. **Testing**: Unit, integration, and E2E tests
15. **Security**: Authentication, authorization, encryption

## Testing Strategy

### Unit Tests
Test individual service logic

### Integration Tests
Test service interactions

### Contract Tests
Verify API contracts between services

### End-to-End Tests
Test complete user flows across services

### Load Tests
Verify performance under load

## Deployment Strategy

### Blue-Green Deployment
Zero-downtime deployment with instant rollback

### Canary Deployment
Gradual rollout to subset of users

### Rolling Update
Progressive replacement of instances

## Troubleshooting

### Service Not Responding
1. Check service health endpoint
2. Verify service registration
3. Check circuit breaker state
4. Review service logs
5. Check network connectivity

### High Latency
1. Check service metrics
2. Review distributed traces
3. Identify bottlenecks
4. Scale horizontally
5. Optimize database queries

### Data Inconsistency
1. Review event logs
2. Check message queue status
3. Verify database replication
4. Implement compensating transactions
5. Use saga pattern for distributed transactions
