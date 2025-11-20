import Redis from "ioredis";

// Redis client (lazy initialization)
let redisClient: Redis | null = null;

/**
 * Get or create Redis client instance
 * 
 * IMPORTANT: This function expects a standard Redis URL (redis:// or rediss://)
 * NOT an Upstash REST URL. For Upstash REST, use @upstash/redis instead.
 */
export function getRedisClient(): Redis | null {
  // Skip Redis if not configured with standard Redis URL
  if (!process.env.REDIS_URL) {
    // Upstash REST URLs (https://) are NOT compatible with ioredis
    // If you need Upstash, use @upstash/redis package instead
    return null;
  }

  // Validate Redis URL format (must be redis:// or rediss://)
  if (!process.env.REDIS_URL.startsWith('redis://') && !process.env.REDIS_URL.startsWith('rediss://')) {
    console.error('❌ Invalid REDIS_URL format. Expected redis:// or rediss://, got:', process.env.REDIS_URL.substring(0, 10));
    return null;
  }

  if (!redisClient) {
    try {
      redisClient = new Redis(process.env.REDIS_URL);

      redisClient!.on('error', (err) => {
        console.error('Redis Client Error:', err);
        // Prevent crashes by setting client to null on connection failure
        redisClient = null;
      });

      redisClient!.on('connect', () => {
        console.log('✅ Redis connected successfully');
      });
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      return null;
    }
  }

  return redisClient;
}

/**
 * Cache wrapper with TTL
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error);
    return null;
  }
}

/**
 * Set cache with TTL (in seconds)
 */
export async function cacheSet(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error);
  }
}

/**
 * Delete cache key
 */
export async function cacheDel(key: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (error) {
    console.error(`Cache del error for key ${key}:`, error);
  }
}

/**
 * Clear all cache keys matching pattern
 */
export async function cacheClear(pattern: string = '*'): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(`Cache clear error for pattern ${pattern}:`, error);
  }
}

/**
 * Cache company settings (most frequently accessed data)
 * 
 * NOTE: Redis is OPTIONAL. If not configured, these functions gracefully
 * return null/undefined and the app continues without caching.
 */
export async function getCachedCompanySettings() {
  const cached = await cacheGet('company_settings');
  if (cached) return cached;

  // Will be populated by caller if not in cache
  return null;
}

export async function setCachedCompanySettings(settings: any) {
  // Cache for 1 hour (company settings rarely change)
  await cacheSet('company_settings', settings, 3600);
}

export async function invalidateCompanySettingsCache() {
  await cacheDel('company_settings');
}

/**
 * REDIS SETUP INSTRUCTIONS:
 * 
 * Option 1: Standard Redis (recommended for production)
 * - Install Redis server
 * - Set REDIS_URL environment variable:
 *   export REDIS_URL="redis://localhost:6379"
 * 
 * Option 2: Upstash Redis (Replit-friendly)
 * - THIS CODEBASE USES ioredis WHICH REQUIRES STANDARD REDIS PROTOCOL
 * - Get your Redis-compatible URL from Upstash dashboard (NOT the REST URL)
 * - Set REDIS_URL with the redis:// URL (NOT https:// REST URL)
 * 
 * Option 3: No Redis (graceful degradation)
 * - Don't set REDIS_URL
 * - App continues without caching (slightly slower but functional)
 */
