/**
 * Enhanced Communication Provider Selector Service
 * 
 * Production-ready provider management with:
 * - Multi-provider support with automatic failover
 * - Circuit breaker pattern for provider health
 * - Retry logic with exponential backoff
 * - Comprehensive error handling and logging
 * - Provider statistics tracking
 */

import { db } from '../db';
import { communicationProviders } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { createProvider, type ProviderConfig } from './providers';
import type { TwilioSmsProvider } from './providers/twilioSmsProvider';
import type { SendGridEmailProvider } from './providers/sendgridEmailProvider';

export interface SendResult {
  success: boolean;
  externalId?: string;
  providerId?: string;
  providerName?: string;
  error?: string;
  cost?: string;
}

export interface SmsOptions {
  to: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  html?: boolean;
  templateId?: string;
  dynamicData?: Record<string, any>;
}

// Cache for provider instances (in production, consider Redis cache)
const providerCache: Map<string, TwilioSmsProvider | SendGridEmailProvider> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps: Map<string, number> = new Map();

/**
 * Get active providers for a type (sms or email), sorted by priority
 */
async function getActiveProviders(type: 'sms' | 'email'): Promise<ProviderConfig[]> {
  const providers = await db
    .select()
    .from(communicationProviders)
    .where(
      and(
        eq(communicationProviders.type, type),
        eq(communicationProviders.isActive, true)
      )
    )
    .orderBy(communicationProviders.priority);
  
  return providers as ProviderConfig[];
}

/**
 * Get or create provider instance with caching
 */
function getProviderInstance(config: ProviderConfig): TwilioSmsProvider | SendGridEmailProvider | null {
  const cacheKey = config.id;
  const now = Date.now();
  
  // Check cache validity
  const cachedTime = cacheTimestamps.get(cacheKey);
  if (cachedTime && (now - cachedTime) < CACHE_TTL) {
    const cached = providerCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  // Create new instance
  const provider = createProvider(config);
  if (provider) {
    providerCache.set(cacheKey, provider);
    cacheTimestamps.set(cacheKey, now);
  }
  
  return provider;
}

/**
 * Update provider statistics after send attempt
 */
async function updateProviderStats(providerId: string, success: boolean, cost?: string): Promise<void> {
  try {
    const [provider] = await db
      .select()
      .from(communicationProviders)
      .where(eq(communicationProviders.id, providerId));
    
    if (!provider) return;
    
    const totalSent = (provider.totalSent || 0) + (success ? 1 : 0);
    const totalFailed = (provider.totalFailed || 0) + (success ? 0 : 1);
    const healthScore = (totalSent + totalFailed) > 0 
      ? (totalSent / (totalSent + totalFailed)) * 100 
      : 100;
    
    await db
      .update(communicationProviders)
      .set({
        totalSent: success ? totalSent : provider.totalSent,
        totalFailed: success ? provider.totalFailed : totalFailed,
        healthStatus: healthScore >= 80 ? 'healthy' : healthScore >= 50 ? 'degraded' : 'unhealthy',
        lastUsed: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(communicationProviders.id, providerId));
  } catch (error) {
    console.error('[Provider Stats] Failed to update provider stats:', error);
  }
}

/**
 * Send SMS with automatic provider failover
 */
export async function sendSms(options: SmsOptions): Promise<SendResult> {
  const providers = await getActiveProviders('sms');
  
  if (providers.length === 0) {
    return {
      success: false,
      error: 'No active SMS providers configured',
    };
  }
  
  // Try each provider in priority order
  for (const providerConfig of providers) {
    const provider = getProviderInstance(providerConfig);
    
    if (!provider || !(provider instanceof require('./providers/twilioSmsProvider').TwilioSmsProvider)) {
      continue;
    }
    
    // Check provider health before attempting
    const health = provider.getHealthStatus();
    if (health.circuitOpen) {
      console.warn(`[SMS] Provider ${providerConfig.name} circuit breaker open, skipping`);
      continue;
    }
    
    // Attempt to send
    try {
      const result = await provider.sendSms(options.to, options.message, {
        metadata: options.metadata,
      });
      
      if (result.success) {
        await updateProviderStats(providerConfig.id, true, result.cost);
        return {
          success: true,
          externalId: result.messageSid,
          providerId: providerConfig.id,
          providerName: providerConfig.name,
          cost: result.cost,
        };
      }
      
      // Log failure and try next provider
      console.warn(`[SMS] Provider ${providerConfig.name} failed:`, result.error);
      await updateProviderStats(providerConfig.id, false);
    } catch (error: any) {
      console.error(`[SMS] Provider ${providerConfig.name} exception:`, error);
      await updateProviderStats(providerConfig.id, false);
    }
  }
  
  // All providers failed
  return {
    success: false,
    error: 'All SMS providers failed',
  };
}

/**
 * Send Email with automatic provider failover
 */
export async function sendEmail(options: EmailOptions): Promise<SendResult> {
  const providers = await getActiveProviders('email');
  
  if (providers.length === 0) {
    return {
      success: false,
      error: 'No active email providers configured',
    };
  }
  
  // Try each provider in priority order
  for (const providerConfig of providers) {
    const provider = getProviderInstance(providerConfig);
    
    if (!provider || !(provider instanceof require('./providers/sendgridEmailProvider').SendGridEmailProvider)) {
      continue;
    }
    
    // Check provider health before attempting
    const health = provider.getHealthStatus();
    if (health.circuitOpen) {
      console.warn(`[Email] Provider ${providerConfig.name} circuit breaker open, skipping`);
      continue;
    }
    
    // Attempt to send
    try {
      const result = await provider.sendEmail({
        to: options.to,
        subject: options.subject,
        body: options.body,
        html: options.html,
        templateId: options.templateId,
        dynamicData: options.dynamicData,
      });
      
      if (result.success) {
        await updateProviderStats(providerConfig.id, true);
        return {
          success: true,
          externalId: result.messageId,
          providerId: providerConfig.id,
          providerName: providerConfig.name,
        };
      }
      
      // Log failure and try next provider
      console.warn(`[Email] Provider ${providerConfig.name} failed:`, result.error);
      await updateProviderStats(providerConfig.id, false);
    } catch (error: any) {
      console.error(`[Email] Provider ${providerConfig.name} exception:`, error);
      await updateProviderStats(providerConfig.id, false);
    }
  }
  
  // All providers failed
  return {
    success: false,
    error: 'All email providers failed',
  };
}

/**
 * Get provider health status
 */
export async function getProviderHealth(type?: 'sms' | 'email'): Promise<any[]> {
  let query = db.select().from(communicationProviders);
  
  if (type) {
    query = query.where(eq(communicationProviders.type, type)) as any;
  }
  
  const providers = await query.orderBy(communicationProviders.priority);
  
  return providers.map(p => ({
    id: p.id,
    name: p.name,
    type: p.type,
    provider: p.provider,
    isActive: p.isActive,
    healthStatus: p.healthStatus,
    totalSent: p.totalSent,
    totalFailed: p.totalFailed,
    lastUsed: p.lastUsed,
  }));
}

/**
 * Clear provider cache (useful for config updates)
 */
export function clearProviderCache(): void {
  providerCache.clear();
  cacheTimestamps.clear();
}
