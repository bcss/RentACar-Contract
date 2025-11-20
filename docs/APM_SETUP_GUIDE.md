# APM & Performance Monitoring Setup Guide

**Date:** November 20, 2025  
**Status:** Built-in APM Active, External Integration Optional

---

## Overview

RCCMS includes **built-in performance monitoring** that tracks:
- ✅ Request duration (response times)
- ✅ Memory usage per request
- ✅ Slow request detection (> 1 second)
- ✅ High memory usage alerts (> 50MB)
- ✅ Error rate tracking (4xx/5xx responses)
- ✅ Top 10 slowest requests with timestamps

**File:** `server/middleware/performanceMonitoring.ts` (106 lines)

---

## Built-in APM (Already Active)

The performance monitoring middleware is **already enabled** in the application.

### What It Tracks

**For Every Request:**
1. Response time (milliseconds)
2. Memory usage (MB)
3. HTTP status code
4. Request path and method
5. Timestamp

**Automatic Logging:**
```
⚠️ SLOW REQUEST: GET /api/contracts took 2654ms
⚠️ HIGH MEMORY: POST /api/vehicles used 105.59MB
```

### Performance Metrics API

**GET /api/system/performance**

Returns real-time performance metrics:
```json
{
  "totalRequests": 15234,
  "averageResponseTime": 245.3,
  "slowestRequests": [
    {
      "path": "/api/reports/financial",
      "duration": 3245,
      "timestamp": "2025-11-20T14:13:10.000Z",
      "memoryUsed": 125.4
    }
  ],
  "errorRate": 0.02,
  "uptime": "24h 15m"
}
```

---

## External APM Integration

While Replit doesn't provide built-in APM integrations, you can integrate with professional APM services for advanced monitoring.

### Option 1: DataDog APM

DataDog provides comprehensive application performance monitoring with distributed tracing.

#### Setup Steps

1. **Sign up for DataDog:** https://www.datadoghq.com/

2. **Get your API key** from DataDog dashboard

3. **Install DataDog client:**
   ```bash
   npm install dd-trace
   ```

4. **Create initialization file** (`server/apm.ts`):
   ```typescript
   import tracer from 'dd-trace';
   
   // Initialize DataDog APM
   if (process.env.DD_API_KEY) {
     tracer.init({
       service: 'rccms',
       env: process.env.NODE_ENV || 'development',
       version: '1.0.0',
       analyticsEnabled: true,
       runtimeMetrics: true,
       logInjection: true,
     });
     
     console.log('✅ DataDog APM initialized');
   }
   
   export default tracer;
   ```

5. **Import at app entry** (`server/index.ts` - FIRST import):
   ```typescript
   // MUST be first import
   import './apm';
   
   // Rest of your imports...
   import express from 'express';
   ```

6. **Set environment variables:**
   ```bash
   DD_API_KEY=your-datadog-api-key
   DD_SITE=datadoghq.com  # or datadoghq.eu for EU
   DD_SERVICE=rccms
   DD_ENV=production
   ```

#### Features:
- ✅ Automatic request tracing
- ✅ Database query monitoring
- ✅ Error tracking
- ✅ Real-time dashboards
- ✅ Alerting
- ✅ APM + Logs correlation

#### Cost:
- **Free:** Development/testing
- **Pro:** $31/host/month (production recommended)

---

### Option 2: New Relic APM

New Relic provides full-stack observability with AI-powered insights.

#### Setup Steps

1. **Sign up for New Relic:** https://newrelic.com/

2. **Get your license key** from New Relic dashboard

3. **Install New Relic agent:**
   ```bash
   npm install newrelic
   ```

4. **Create configuration** (`newrelic.js` in project root):
   ```javascript
   'use strict';
   
   exports.config = {
     app_name: ['RCCMS'],
     license_key: process.env.NEW_RELIC_LICENSE_KEY,
     logging: {
       level: 'info'
     },
     allow_all_headers: true,
     attributes: {
       exclude: [
         'request.headers.cookie',
         'request.headers.authorization',
         'request.headers.proxyAuthorization',
         'request.headers.setCookie*',
         'request.headers.x*',
         'response.headers.cookie',
         'response.headers.authorization',
         'response.headers.proxyAuthorization',
         'response.headers.setCookie*',
         'response.headers.x*'
       ]
     }
   };
   ```

5. **Import at app entry** (`server/index.ts` - FIRST import):
   ```typescript
   // MUST be first import
   import 'newrelic';
   
   // Rest of your imports...
   import express from 'express';
   ```

6. **Set environment variable:**
   ```bash
   NEW_RELIC_LICENSE_KEY=your-license-key
   NEW_RELIC_APP_NAME=RCCMS
   NEW_RELIC_LOG_LEVEL=info
   ```

#### Features:
- ✅ Application performance monitoring
- ✅ Infrastructure monitoring
- ✅ Distributed tracing
- ✅ Error analytics
- ✅ Custom dashboards
- ✅ AI-powered anomaly detection

#### Cost:
- **Free:** 100GB/month data ingest
- **Standard:** $99/user/month (production recommended)

---

### Option 3: Sentry (Error Tracking + Performance)

Sentry specializes in error tracking with performance monitoring.

#### Setup Steps

1. **Sign up for Sentry:** https://sentry.io/

2. **Create new project** (Node.js/Express)

3. **Install Sentry SDK:**
   ```bash
   npm install @sentry/node @sentry/profiling-node
   ```

4. **Initialize Sentry** (`server/index.ts`):
   ```typescript
   import * as Sentry from "@sentry/node";
   import { ProfilingIntegration } from "@sentry/profiling-node";
   
   if (process.env.SENTRY_DSN) {
     Sentry.init({
       dsn: process.env.SENTRY_DSN,
       integrations: [
         new ProfilingIntegration(),
       ],
       tracesSampleRate: 1.0,
       profilesSampleRate: 1.0,
     });
     
     console.log('✅ Sentry initialized');
   }
   
   // Later in your Express setup:
   app.use(Sentry.Handlers.requestHandler());
   app.use(Sentry.Handlers.tracingHandler());
   
   // After all routes:
   app.use(Sentry.Handlers.errorHandler());
   ```

5. **Set environment variable:**
   ```bash
   SENTRY_DSN=https://your-key@sentry.io/your-project-id
   ```

#### Features:
- ✅ Real-time error tracking
- ✅ Performance monitoring
- ✅ Release tracking
- ✅ User context
- ✅ Source map support
- ✅ Alerting

#### Cost:
- **Developer:** Free (5K errors/month)
- **Team:** $26/month (50K errors)
- **Business:** $80/month (unlimited)

---

## Comparison Matrix

| Feature | Built-in APM | DataDog | New Relic | Sentry |
|---------|-------------|---------|-----------|--------|
| Request tracking | ✅ | ✅ | ✅ | ✅ |
| Slow queries | ✅ | ✅ | ✅ | ✅ |
| Error tracking | ⚠️ Basic | ✅ | ✅ | ✅✅ |
| Distributed tracing | ❌ | ✅ | ✅ | ⚠️ Limited |
| Custom dashboards | ❌ | ✅ | ✅ | ✅ |
| Alerting | ❌ | ✅ | ✅ | ✅ |
| Database monitoring | ❌ | ✅ | ✅ | ❌ |
| Cost | Free | $31/mo | $99/mo | $26/mo |

---

## Production Deployment Strategy

### Phase 1: Development (Current)
✅ **Use built-in APM**
- No cost
- No setup
- Basic monitoring
- Performance metrics API

### Phase 2: Early Production
✅ **Add Sentry** (error tracking)
- Low cost ($26/mo)
- Easy setup
- Catches production errors
- Performance insights

### Phase 3: Scale (High Traffic)
✅ **Upgrade to DataDog or New Relic**
- Comprehensive monitoring
- Distributed tracing
- Advanced analytics
- Enterprise features

---

## Configuration Checklist

### Built-in APM (Already Active):
- [x] Performance middleware enabled
- [x] Slow request logging (> 1s)
- [x] High memory logging (> 50MB)
- [x] Metrics API available at `/api/system/performance`
- [ ] Customize thresholds (optional)
- [ ] Extend metrics collection (optional)

### External APM (Optional):
- [ ] Choose APM provider (DataDog/New Relic/Sentry)
- [ ] Sign up and get API keys
- [ ] Install npm packages
- [ ] Configure initialization
- [ ] Set environment variables
- [ ] Test in development
- [ ] Deploy to production
- [ ] Set up dashboards
- [ ] Configure alerts

---

## Custom Metrics

You can extend the built-in APM to track custom metrics:

```typescript
// server/middleware/performanceMonitoring.ts

// Add custom metric tracking
export function trackCustomMetric(name: string, value: number) {
  customMetrics.set(name, value);
}

// Usage in your code:
import { trackCustomMetric } from './middleware/performanceMonitoring';

await storage.createContract(data);
trackCustomMetric('contracts_created_today', count);
```

---

## Alerting Setup (External APM)

### DataDog Alerts:
1. Go to Monitors → New Monitor
2. Select "APM" metric
3. Set threshold (e.g., avg response time > 500ms)
4. Configure notifications (email, Slack, PagerDuty)

### New Relic Alerts:
1. Go to Alerts & AI → Create Alert
2. Select NRQL query (e.g., average response time)
3. Set critical threshold
4. Add notification channel

### Sentry Alerts:
1. Go to Alerts → Create Alert
2. Select trigger (error frequency, performance degradation)
3. Configure actions (email, webhook)

---

## Security Considerations

1. **Never commit API keys** to git (use environment variables)
2. **Sanitize sensitive data** before sending to APM
3. **Exclude PII** from logs and traces
4. **Use secure connections** (HTTPS only)
5. **Rotate API keys** regularly
6. **Monitor access logs** for suspicious activity

---

## Troubleshooting

### Built-in APM not showing logs

**Check:**
1. Performance middleware is imported in `server/routes.ts`
2. Middleware is applied: `app.use(performanceMonitoring)`
3. Request is actually being made

### External APM not receiving data

**Check:**
1. API key is correct
2. APM initialization is **FIRST** import
3. Environment variables are set
4. Firewall allows outbound connections
5. Check APM dashboard for errors

---

## Summary

✅ **Built-in APM is already active** - No setup needed  
✅ **Performance metrics API** available at `/api/system/performance`  
✅ **External APM optional** - Add when needed for advanced features  
✅ **DataDog/New Relic/Sentry** - Choose based on needs and budget  
✅ **Start simple** - Built-in APM → Sentry → DataDog/New Relic

**Recommendation:** Use built-in APM initially, add Sentry when launching to production, upgrade to DataDog/New Relic at scale.
