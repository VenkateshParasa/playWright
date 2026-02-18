# Platform Scaling Guide

## Overview

This guide covers horizontal and vertical scaling strategies for the Playwright & Selenium Learning Platform to handle increased load and maintain performance.

## Scaling Strategies

### 1. Horizontal Scaling (Scale Out)

Add more instances of services to handle increased load.

**Advantages**:
- Better fault tolerance
- No service interruption
- Cost-effective for cloud deployments
- Easier to scale specific services

**Implementation**:

```bash
# Manual scaling
kubectl scale deployment api-gateway --replicas=10 -n playwright-learning

# Using HPA (automatic)
kubectl apply -f k8s/hpa/hpa.yaml
```

### 2. Vertical Scaling (Scale Up)

Increase resources (CPU, memory) for existing instances.

**Advantages**:
- Simpler to implement
- Good for stateful applications
- Lower network overhead

**Implementation**:

```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

## Auto-Scaling Configuration

### Horizontal Pod Autoscaler (HPA)

Automatically scales based on metrics:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "1000"
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
```

**Metrics**:
- **CPU Utilization**: Target 70% average
- **Memory Utilization**: Target 80% average
- **Custom Metrics**: Requests per second, queue length, etc.

**Behavior**:
- **Scale Up**: Fast (60s stabilization, 100% increase)
- **Scale Down**: Slow (300s stabilization, 50% decrease)

### Vertical Pod Autoscaler (VPA)

Automatically adjusts resource requests/limits:

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: api-gateway-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: api-gateway
      minAllowed:
        cpu: 100m
        memory: 128Mi
      maxAllowed:
        cpu: 2000m
        memory: 2Gi
```

### Cluster Autoscaler

Automatically adds/removes nodes:

```bash
# AWS EKS
eksctl create cluster \
  --name playwright-learning \
  --nodegroup-name standard-workers \
  --node-type t3.large \
  --nodes 3 \
  --nodes-min 3 \
  --nodes-max 10 \
  --managed \
  --asg-access

# Enable cluster autoscaler
kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml
```

## Database Scaling

### MongoDB Scaling

#### Read Replicas

Add read replicas for read-heavy workloads:

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongodb
spec:
  replicas: 5  # 1 primary + 4 replicas
  serviceName: mongodb
  template:
    spec:
      containers:
      - name: mongodb
        image: mongo:7.0
        command:
        - mongod
        - --replSet
        - rs0
        - --bind_ip_all
```

**Application Configuration**:
```typescript
// Read from replicas
const client = new MongoClient(uri, {
  readPreference: 'secondaryPreferred',
  readConcern: { level: 'majority' },
  writeConcern: { w: 'majority' },
});
```

#### Sharding

For extremely large datasets:

```javascript
// Enable sharding
sh.enableSharding("playwright_learning")

// Shard collection
sh.shardCollection("playwright_learning.users", { userId: "hashed" })
sh.shardCollection("playwright_learning.analytics", { timestamp: 1 })
```

**Benefits**:
- Horizontal scalability
- Improved write performance
- Better data distribution

### Redis Scaling

#### Cluster Mode

Redis Cluster provides automatic sharding:

```bash
# Create cluster
redis-cli --cluster create \
  redis-1:6379 redis-2:6379 redis-3:6379 \
  redis-4:6379 redis-5:6379 redis-6:6379 \
  --cluster-replicas 1
```

#### Sentinel (High Availability)

For automatic failover:

```bash
# Sentinel configuration
sentinel monitor mymaster redis-1 6379 2
sentinel down-after-milliseconds mymaster 5000
sentinel parallel-syncs mymaster 1
sentinel failover-timeout mymaster 10000
```

## Load Balancing

### NGINX Load Balancer

```nginx
upstream api_backend {
    least_conn;
    server api-gateway-1:3000 max_fails=3 fail_timeout=30s;
    server api-gateway-2:3000 max_fails=3 fail_timeout=30s;
    server api-gateway-3:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    listen 80;

    location / {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Strategies**:
- **Round Robin**: Default, distributes evenly
- **Least Connections**: Sends to server with fewest connections
- **IP Hash**: Same client always goes to same server
- **Weighted**: Distribute based on server capacity

### Geographic Load Balancing

Route users to nearest data center:

```typescript
// backend/src/middleware/loadBalancer.ts
export class GeoLoadBalancer {
  selectRegion(clientRegion: string): string {
    const mapping: Record<string, string> = {
      US: 'us-east-1',
      EU: 'eu-west-1',
      ASIA: 'ap-southeast-1',
    };
    return mapping[clientRegion] || 'us-east-1';
  }
}
```

## CDN Configuration

### CloudFront Setup

```typescript
// infrastructure/terraform/cloudfront.tf
resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name = "api.playwright-learning.com"
    origin_id   = "api-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  price_class         = "PriceClass_All"

  default_cache_behavior {
    target_origin_id       = "api-origin"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    allowed_methods = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods  = ["GET", "HEAD"]

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400

    forwarded_values {
      query_string = true
      cookies {
        forward = "all"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.cert.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}
```

### Edge Caching Strategy

```typescript
// Cache-Control headers
app.use((req, res, next) => {
  const publicRoutes = ['/api/courses', '/api/lessons'];

  if (publicRoutes.some(route => req.path.startsWith(route))) {
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=7200');
    res.set('CDN-Cache-Control', 'max-age=7200');
  } else {
    res.set('Cache-Control', 'private, no-cache');
  }

  next();
});
```

## Message Queue Scaling

### RabbitMQ Cluster

```yaml
# StatefulSet for RabbitMQ
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: rabbitmq
spec:
  replicas: 3
  serviceName: rabbitmq
  template:
    spec:
      containers:
      - name: rabbitmq
        image: rabbitmq:3-management
        env:
        - name: RABBITMQ_ERLANG_COOKIE
          value: "secret-cookie"
        - name: RABBITMQ_DEFAULT_USER
          value: "admin"
```

### Kafka Scaling

```bash
# Add brokers
kubectl scale statefulset kafka --replicas=5 -n playwright-learning

# Rebalance partitions
kafka-reassign-partitions.sh \
  --bootstrap-server kafka:9092 \
  --generate \
  --topics-to-move-json-file topics.json \
  --broker-list "1,2,3,4,5"
```

## Performance Optimization

### Connection Pooling

```typescript
// MongoDB connection pool
const client = new MongoClient(uri, {
  minPoolSize: 10,
  maxPoolSize: 100,
  maxIdleTimeMS: 30000,
  waitQueueTimeoutMS: 5000,
});

// Redis connection pool
const redis = new Redis.Cluster(nodes, {
  redisOptions: {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    enableOfflineQueue: true,
  },
  clusterRetryStrategy: (times) => Math.min(times * 50, 2000),
});
```

### Query Optimization

```typescript
// Add indexes
db.collection('users').createIndex({ email: 1 }, { unique: true });
db.collection('courses').createIndex({ category: 1, difficulty: 1 });
db.collection('analytics').createIndex({ userId: 1, timestamp: -1 });

// Use projections
const user = await User.findById(id).select('name email').lean();

// Use aggregation pipeline
const stats = await Course.aggregate([
  { $match: { category: 'playwright' } },
  { $group: { _id: '$difficulty', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]);
```

### Caching Strategy

```typescript
// Multi-level caching
async function getCourse(id: string) {
  // L1: Memory cache (fastest)
  const cached = cacheManager.l1.get<Course>(id);
  if (cached) return cached;

  // L2: Redis cache (fast)
  const redisValue = await cacheManager.l2.get<Course>(id);
  if (redisValue) {
    cacheManager.l1.set(id, redisValue);
    return redisValue;
  }

  // L3: Database (slow)
  const course = await Course.findById(id);

  // Cache for next time
  await cacheManager.set(id, course, CACHE_TTL.LONG);

  return course;
}
```

## Monitoring Scaling

### Key Metrics to Monitor

1. **Request Rate**
   - Requests per second
   - Error rate
   - Response time percentiles (p50, p95, p99)

2. **Resource Utilization**
   - CPU usage
   - Memory usage
   - Network I/O
   - Disk I/O

3. **Database Performance**
   - Query execution time
   - Connection pool usage
   - Slow query count
   - Replication lag

4. **Cache Performance**
   - Hit rate
   - Miss rate
   - Eviction rate
   - Memory usage

5. **Queue Performance**
   - Queue length
   - Processing rate
   - Average wait time
   - Error rate

### Alerting Rules

```yaml
# Prometheus alerts
groups:
- name: scaling_alerts
  rules:
  - alert: HighCPUUsage
    expr: avg(rate(container_cpu_usage_seconds_total[5m])) > 0.8
    for: 5m
    annotations:
      summary: "High CPU usage detected"

  - alert: HighMemoryUsage
    expr: avg(container_memory_usage_bytes / container_spec_memory_limit_bytes) > 0.9
    for: 5m
    annotations:
      summary: "High memory usage detected"

  - alert: HighRequestRate
    expr: rate(http_requests_total[1m]) > 1000
    for: 5m
    annotations:
      summary: "High request rate detected"
```

## Cost Optimization

### Right-Sizing

```bash
# Analyze resource usage
kubectl top pods -n playwright-learning

# Adjust resources based on actual usage
kubectl set resources deployment api-gateway \
  --requests=cpu=200m,memory=256Mi \
  --limits=cpu=500m,memory=512Mi \
  -n playwright-learning
```

### Spot Instances

Use spot instances for non-critical workloads:

```yaml
# Node group with spot instances
apiVersion: v1
kind: Node
metadata:
  labels:
    node-type: spot
spec:
  taints:
  - key: spot
    value: "true"
    effect: NoSchedule
```

### Resource Quotas

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: playwright-learning
spec:
  hard:
    requests.cpu: "50"
    requests.memory: 100Gi
    limits.cpu: "100"
    limits.memory: 200Gi
    pods: "50"
```

## Scaling Checklist

- [ ] Configure HPA for all services
- [ ] Set up cluster autoscaler
- [ ] Implement connection pooling
- [ ] Configure database read replicas
- [ ] Set up Redis cluster
- [ ] Configure CDN
- [ ] Implement multi-level caching
- [ ] Set up monitoring and alerts
- [ ] Configure resource limits
- [ ] Test autoscaling behavior
- [ ] Document scaling procedures
- [ ] Set up cost monitoring
- [ ] Regular capacity planning reviews

## Best Practices

1. **Start Small, Scale as Needed**: Begin with minimum resources and scale based on metrics
2. **Monitor Everything**: Track all relevant metrics
3. **Automate Scaling**: Use HPA and cluster autoscaler
4. **Test Under Load**: Regular load testing to verify scaling
5. **Plan for Spikes**: Handle sudden traffic increases
6. **Optimize Costs**: Use spot instances, right-size resources
7. **Cache Aggressively**: Reduce database load
8. **Use CDN**: Offload static content
9. **Database Optimization**: Indexes, query optimization
10. **Regular Reviews**: Analyze usage patterns and optimize

## Troubleshooting

### Pods Not Scaling

```bash
# Check HPA status
kubectl describe hpa api-gateway-hpa -n playwright-learning

# Check metrics server
kubectl get apiservices | grep metrics

# Check pod metrics
kubectl top pods -n playwright-learning
```

### Database Performance Issues

```bash
# Check slow queries
db.setProfilingLevel(2);
db.system.profile.find().sort({ millis: -1 }).limit(10);

# Check connection pool
db.serverStatus().connections
```

### Cache Issues

```bash
# Check Redis cluster status
redis-cli cluster info

# Check cache hit rate
redis-cli info stats | grep keyspace
```
