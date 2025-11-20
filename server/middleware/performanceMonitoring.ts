import type { Request, Response, NextFunction } from "express";

interface PerformanceMetrics {
  method: string;
  path: string;
  duration: number;
  statusCode: number;
  timestamp: Date;
  userId?: string;
}

// In-memory store for recent metrics (last 1000 requests)
const metricsStore: PerformanceMetrics[] = [];
const MAX_METRICS = 1000;

/**
 * APM Middleware - Track response times and performance
 */
export function performanceMonitoring(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed;

  // Track when response finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const endMemory = process.memoryUsage().heapUsed;
    const memoryDelta = endMemory - startMemory;

    const metric: PerformanceMetrics = {
      method: req.method,
      path: req.path,
      duration,
      statusCode: res.statusCode,
      timestamp: new Date(),
      userId: (req as any).user?.id,
    };

    // Store metric
    metricsStore.push(metric);
    if (metricsStore.length > MAX_METRICS) {
      metricsStore.shift(); // Remove oldest
    }

    // Log slow requests (> 1 second)
    if (duration > 1000) {
      console.warn(`⚠️ SLOW REQUEST: ${req.method} ${req.path} took ${duration}ms`);
    }

    // Log high memory usage (> 50MB)
    if (memoryDelta > 50 * 1024 * 1024) {
      console.warn(`⚠️ HIGH MEMORY: ${req.method} ${req.path} used ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`);
    }

    // Log errors
    if (res.statusCode >= 500) {
      console.error(`❌ SERVER ERROR: ${req.method} ${req.path} returned ${res.statusCode}`);
    }
  });

  next();
}

/**
 * Get performance metrics summary
 */
export function getPerformanceMetrics() {
  if (metricsStore.length === 0) {
    return {
      totalRequests: 0,
      averageDuration: 0,
      slowestRequests: [],
      errorRate: 0,
    };
  }

  const totalRequests = metricsStore.length;
  const totalDuration = metricsStore.reduce((sum, m) => sum + m.duration, 0);
  const averageDuration = totalDuration / totalRequests;

  const slowestRequests = [...metricsStore]
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10)
    .map(m => ({
      method: m.method,
      path: m.path,
      duration: m.duration,
      timestamp: m.timestamp,
    }));

  const errorCount = metricsStore.filter(m => m.statusCode >= 400).length;
  const errorRate = (errorCount / totalRequests) * 100;

  return {
    totalRequests,
    averageDuration: Math.round(averageDuration),
    slowestRequests,
    errorRate: errorRate.toFixed(2),
  };
}

/**
 * Clear metrics store
 */
export function clearPerformanceMetrics() {
  metricsStore.length = 0;
}
