# CDN Setup Guide

## Overview

This guide covers Content Delivery Network (CDN) setup and configuration for optimal video delivery in the Playwright & Selenium Learning Platform.

## CDN Options

### Recommended CDN Providers

1. **Cloudflare** (Recommended)
   - Global network
   - Free tier available
   - Easy setup
   - Built-in security
   - Video optimization

2. **AWS CloudFront**
   - AWS ecosystem integration
   - Pay-as-you-go pricing
   - Advanced features
   - Global coverage

3. **Fastly**
   - Real-time configuration
   - Instant purging
   - Edge computing
   - Developer-friendly

4. **Bunny CDN**
   - Cost-effective
   - Simple pricing
   - Good performance
   - Storage included

## Cloudflare Setup

### 1. Domain Configuration

```bash
# Add your domain to Cloudflare
1. Sign up at cloudflare.com
2. Add your domain
3. Update nameservers at your registrar
4. Wait for DNS propagation (up to 48 hours)
```

### 2. SSL/TLS Configuration

```
SSL/TLS -> Overview
- Full (strict) for secure connections

SSL/TLS -> Edge Certificates
- Always Use HTTPS: On
- Automatic HTTPS Rewrites: On
- Minimum TLS Version: 1.2
```

### 3. Caching Configuration

#### Page Rules

```
1. Cache Video Files
URL: *example.com/videos/*
Settings:
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
- Browser Cache TTL: 4 hours

2. Cache HLS Segments
URL: *example.com/hls/*
Settings:
- Cache Level: Cache Everything
- Edge Cache TTL: 1 day
- Browser Cache TTL: 1 hour

3. Cache Thumbnails
URL: *example.com/thumbnails/*
Settings:
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
- Browser Cache TTL: 1 day
```

#### Cache Rules (Advanced)

```javascript
// cloudflare-workers.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // Custom caching for video segments
  if (url.pathname.includes('/hls/')) {
    const cache = caches.default
    let response = await cache.match(request)

    if (!response) {
      response = await fetch(request)
      const headers = new Headers(response.headers)
      headers.set('Cache-Control', 'public, max-age=86400')
      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
      })
      event.waitUntil(cache.put(request, response.clone()))
    }

    return response
  }

  return fetch(request)
}
```

### 4. Speed Optimizations

```
Speed -> Optimization
- Auto Minify: Enable JavaScript, CSS, HTML
- Brotli: On
- Early Hints: On
- HTTP/2: On
- HTTP/3 (with QUIC): On
```

### 5. Stream Configuration

Enable Cloudflare Stream for video hosting:

```bash
# Upload video to Stream
curl -X POST \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -F file=@video.mp4 \
  https://api.cloudflare.com/client/v4/accounts/ACCOUNT_ID/stream
```

## AWS CloudFront Setup

### 1. Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://video-content-bucket

# Enable CORS
aws s3api put-bucket-cors --bucket video-content-bucket --cors-configuration file://cors.json
```

**cors.json:**
```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedOrigins": ["https://yourplatform.com"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### 2. Create CloudFront Distribution

```bash
# Create distribution
aws cloudfront create-distribution --distribution-config file://distribution-config.json
```

**distribution-config.json:**
```json
{
  "CallerReference": "video-cdn-2024",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-video-content",
        "DomainName": "video-content-bucket.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-video-content",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "Compress": true,
    "ForwardedValues": {
      "QueryString": true,
      "Cookies": {
        "Forward": "none"
      }
    }
  },
  "CacheBehaviors": {
    "Quantity": 2,
    "Items": [
      {
        "PathPattern": "*.m3u8",
        "TargetOriginId": "S3-video-content",
        "ViewerProtocolPolicy": "redirect-to-https",
        "MinTTL": 0,
        "DefaultTTL": 5,
        "MaxTTL": 10
      },
      {
        "PathPattern": "*.ts",
        "TargetOriginId": "S3-video-content",
        "ViewerProtocolPolicy": "redirect-to-https",
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000
      }
    ]
  },
  "Enabled": true
}
```

### 3. Lambda@Edge for Signed URLs

```javascript
// lambda-edge-auth.js
exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const params = new URLSearchParams(request.querystring);

  const expires = parseInt(params.get('expires'));
  const signature = params.get('signature');
  const path = request.uri;

  // Verify signature
  const crypto = require('crypto');
  const secret = process.env.SIGNED_URL_SECRET;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${path}${expires}`)
    .digest('hex');

  // Check expiration
  const now = Math.floor(Date.now() / 1000);

  if (now > expires || signature !== expectedSignature) {
    return {
      status: '403',
      statusDescription: 'Forbidden',
      body: 'Access Denied'
    };
  }

  // Remove query parameters before forwarding to origin
  request.querystring = '';
  return request;
};
```

## Cache Strategy

### TTL Configuration

| Content Type | Edge Cache TTL | Browser Cache TTL |
|-------------|----------------|-------------------|
| Master Playlist (m3u8) | 10 seconds | 5 seconds |
| Variant Playlist (m3u8) | 30 seconds | 15 seconds |
| Video Segments (ts) | 1 day | 1 hour |
| DASH Manifest (mpd) | 10 seconds | 5 seconds |
| Video Files (mp4) | 30 days | 1 day |
| Thumbnails (jpg/png) | 30 days | 7 days |
| Subtitles (vtt) | 7 days | 1 day |

### Cache Headers

```javascript
// Express middleware for cache headers
app.use('/videos', (req, res, next) => {
  const ext = req.path.split('.').pop();

  const cacheSettings = {
    'm3u8': { maxAge: 10, sMaxAge: 10 },
    'ts': { maxAge: 3600, sMaxAge: 86400 },
    'mpd': { maxAge: 10, sMaxAge: 10 },
    'mp4': { maxAge: 86400, sMaxAge: 2592000 },
    'jpg': { maxAge: 604800, sMaxAge: 2592000 },
    'png': { maxAge: 604800, sMaxAge: 2592000 },
    'vtt': { maxAge: 86400, sMaxAge: 604800 }
  };

  const settings = cacheSettings[ext] || { maxAge: 0, sMaxAge: 0 };

  res.setHeader(
    'Cache-Control',
    `public, max-age=${settings.maxAge}, s-maxage=${settings.sMaxAge}`
  );

  next();
});
```

## CORS Configuration

```javascript
// Express CORS setup
const cors = require('cors');

app.use(cors({
  origin: [
    'https://yourplatform.com',
    'https://www.yourplatform.com'
  ],
  methods: ['GET', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
  exposedHeaders: ['Content-Length', 'Content-Range'],
  credentials: true,
  maxAge: 86400
}));
```

## Performance Optimization

### 1. Compression

```nginx
# Nginx configuration
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types
  text/plain
  text/css
  text/xml
  text/javascript
  application/json
  application/javascript
  application/xml+rss
  application/vnd.ms-fontobject
  application/x-font-ttf
  font/opentype
  image/svg+xml
  image/x-icon;
```

### 2. HTTP/2 Server Push

```nginx
# Push related resources
location = /video-player.html {
  http2_push /css/video-player.css;
  http2_push /js/video-player.js;
  http2_push /js/hls.min.js;
}
```

### 3. Preconnect

```html
<!-- Add to HTML head -->
<link rel="preconnect" href="https://cdn.yourplatform.com">
<link rel="dns-prefetch" href="https://cdn.yourplatform.com">
```

### 4. Resource Hints

```html
<!-- Preload critical resources -->
<link rel="preload" href="/hls/video123/master.m3u8" as="fetch" crossorigin>
<link rel="preload" href="/js/hls.min.js" as="script">
```

## Monitoring & Analytics

### 1. CloudFlare Analytics

```bash
# Get analytics via API
curl -X GET \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones/ZONE_ID/analytics/dashboard"
```

### 2. AWS CloudWatch

```bash
# Create metric filter
aws logs put-metric-filter \
  --log-group-name /aws/cloudfront/video-cdn \
  --filter-name CacheHitRate \
  --filter-pattern "[request_time, edge_location, bytes, status, method, *]" \
  --metric-transformations \
    metricName=CacheHitRate,metricNamespace=CloudFront,metricValue=1
```

### 3. Custom Metrics

```javascript
// Track CDN performance
app.get('/metrics/cdn', async (req, res) => {
  const metrics = {
    cacheHitRate: await getCacheHitRate(),
    bandwidth: await getBandwidthUsage(),
    latency: await getAverageLatency(),
    errorRate: await getErrorRate()
  };

  res.json(metrics);
});
```

## Security

### 1. Signed URLs

```javascript
function generateSignedUrl(videoPath, expiresIn = 3600) {
  const expiry = Math.floor(Date.now() / 1000) + expiresIn;
  const secret = process.env.SIGNED_URL_SECRET;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${videoPath}${expiry}`)
    .digest('hex');

  return `${CDN_URL}${videoPath}?expires=${expiry}&signature=${signature}`;
}
```

### 2. Token Authentication

```javascript
// Cloudflare Worker for token validation
async function validateToken(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Verify JWT token
  const isValid = await verifyJWT(token);

  if (!isValid) {
    return new Response('Forbidden', { status: 403 });
  }

  // Remove token from URL before caching
  url.searchParams.delete('token');
  return fetch(url);
}
```

### 3. Rate Limiting

```javascript
// Cloudflare Worker rate limiting
const RATE_LIMIT = 100; // requests per minute

async function rateLimit(request) {
  const ip = request.headers.get('CF-Connecting-IP');
  const key = `rate:${ip}`;

  const count = await RATE_LIMIT_KV.get(key);

  if (count && parseInt(count) >= RATE_LIMIT) {
    return new Response('Too Many Requests', { status: 429 });
  }

  await RATE_LIMIT_KV.put(key, (parseInt(count) || 0) + 1, {
    expirationTtl: 60
  });

  return null; // Continue processing
}
```

## Cost Optimization

### 1. Smart Caching

- Cache popular content longer
- Purge unused content
- Use tiered storage

### 2. Bandwidth Optimization

- Enable compression
- Use efficient codecs
- Implement adaptive bitrate

### 3. Region-based Routing

```javascript
// Route to nearest CDN edge
function getNearestCDN(userLocation) {
  const cdnRegions = {
    'us-east': 'cdn-us-east.yourplatform.com',
    'us-west': 'cdn-us-west.yourplatform.com',
    'eu': 'cdn-eu.yourplatform.com',
    'asia': 'cdn-asia.yourplatform.com'
  };

  return cdnRegions[userLocation] || cdnRegions['us-east'];
}
```

## Troubleshooting

### Common Issues

1. **High Cache Miss Rate**
   - Check cache headers
   - Verify TTL settings
   - Review query parameters
   - Check Vary headers

2. **CORS Errors**
   - Verify origin headers
   - Check allowed methods
   - Validate credentials setting
   - Review exposed headers

3. **Slow Video Loading**
   - Check edge locations
   - Verify compression
   - Test origin performance
   - Review cache strategy

4. **403/404 Errors**
   - Verify signed URLs
   - Check expiration times
   - Review origin permissions
   - Validate path patterns

### Debug Tools

```bash
# Test CDN response
curl -I https://cdn.yourplatform.com/videos/test.mp4

# Check cache status
curl -I https://cdn.yourplatform.com/videos/test.mp4 | grep -i "cf-cache-status"

# Measure latency
curl -w "@curl-format.txt" -o /dev/null -s https://cdn.yourplatform.com/videos/test.mp4
```

**curl-format.txt:**
```
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_appconnect:  %{time_appconnect}\n
time_pretransfer:  %{time_pretransfer}\n
time_redirect:  %{time_redirect}\n
time_starttransfer:  %{time_starttransfer}\n
time_total:  %{time_total}\n
```

## Best Practices

1. **Always Use HTTPS**
   - Better security
   - Required for HLS
   - Improved SEO

2. **Enable Compression**
   - Reduce bandwidth
   - Faster delivery
   - Lower costs

3. **Optimize Cache Headers**
   - Appropriate TTLs
   - Consider content type
   - Balance freshness vs performance

4. **Monitor Performance**
   - Track cache hit rate
   - Monitor bandwidth usage
   - Watch for errors
   - Analyze latency

5. **Regular Purging**
   - Remove old content
   - Update changed files
   - Clear unused cache

## Maintenance

### Daily Tasks
- Monitor bandwidth usage
- Check error rates
- Review access logs

### Weekly Tasks
- Analyze cache performance
- Review popular content
- Optimize cache rules

### Monthly Tasks
- Review costs
- Update security rules
- Optimize edge locations
- Audit access patterns

## Support

For CDN issues:
- Cloudflare Support: support.cloudflare.com
- AWS Support: aws.amazon.com/support
- Documentation: docs.yourplatform.com/cdn
