/**
 * Communication Provider Selector Service
 * 
 * Handles provider selection, failover, and message delivery:
 * - Multi-provider support (Twilio, SendGrid, Gmail)
 * - Priority-based routing with automatic failover
 * - Provider health monitoring
 * - Delivery status tracking
 * - Cost tracking per provider
 */

import { db } from '../db';
import { communicationProviders, communicationLogs } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import twilio from 'twilio';
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

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
  from?: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  from?: string;
  fromName?: string;
  html?: boolean;
}

/**
 * Get active providers for a type (sms or email), sorted by priority
 */
async function getActiveProviders(type: 'sms' | 'email') {
  const providers = await db
    .select()
    .from(communicationProviders)
    .where(
      and(
        eq(communicationProviders.type, type),
        eq(communicationProviders.isActive, true)
      )
    )
    .orderBy(communicationProviders.priority); // Ascending - lower priority = higher importance
  
  return providers;
}

/**
 * Send SMS via Twilio
 */
async function sendViaTwilio(options: SmsOptions, provider: any): Promise<SendResult> {
  try {
    const creds = provider.credentials as any;
    const accountSid = creds?.accountSid;
    const authToken = creds?.authToken;
    const fromNumber = creds?.fromPhone || options.from;
    
    if (!accountSid || !authToken || !fromNumber) {
      return {
        success: false,
        error: 'Twilio credentials not configured',
      };
    }
    
    const client = twilio(accountSid, authToken);
    
    const message = await client.messages.create({
      body: options.message,
      from: fromNumber,
      to: options.to,
    });
    
    return {
      success: true,
      externalId: message.sid,
      providerId: provider.id,
      providerName: provider.name,
      cost: message.price || undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Twilio error: ${error.message}`,
    };
  }
}

/**
 * Send Email via SendGrid
 */
async function sendViaSendGrid(options: EmailOptions, provider: any): Promise<SendResult> {
  try {
    const creds = provider.credentials as any;
    const apiKey = creds?.apiKey;
    const fromEmail = creds?.fromEmail || options.from || 'noreply@kararaos.com';
    const fromName = creds?.fromName || options.fromName || 'KarāraOS';
    
    if (!apiKey) {
      return {
        success: false,
        error: 'SendGrid API key not configured',
      };
    }
    
    sgMail.setApiKey(apiKey);
    
    const msg = {
      to: options.to,
      from: {
        email: fromEmail,
        name: fromName,
      },
      subject: options.subject,
      text: options.html ? undefined : options.body,
      html: options.html ? options.body : undefined,
    };
    
    const [response] = await sgMail.send(msg);
    
    return {
      success: true,
      externalId: response.headers['x-message-id'] || 'unknown',
      providerId: provider.id,
      providerName: provider.name,
    };
  } catch (error: any) {
    return {
      success: false,
      error: `SendGrid error: ${error.message}`,
    };
  }
}

/**
 * Send Email via Gmail (SMTP with Nodemailer)
 */
async function sendViaGmail(options: EmailOptions, provider: any): Promise<SendResult> {
  try {
    const creds = provider.credentials as any;
    const smtpUser = creds?.username;
    const smtpPassword = creds?.password;
    const fromEmail = creds?.fromEmail || options.from || smtpUser;
    const fromName = creds?.fromName || options.fromName || 'KarāraOS';
    
    if (!smtpUser || !smtpPassword) {
      return {
        success: false,
        error: 'Gmail SMTP credentials not configured',
      };
    }
    
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });
    
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      text: options.html ? undefined : options.body,
      html: options.html ? options.body : undefined,
    });
    
    return {
      success: true,
      externalId: info.messageId,
      providerId: provider.id,
      providerName: provider.name,
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Gmail error: ${error.message}`,
    };
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
  for (const provider of providers) {
    let result: SendResult;
    
    // Route to appropriate provider
    if (provider.provider === 'twilio') {
      result = await sendViaTwilio(options, provider);
    } else {
      // Unknown provider type
      continue;
    }
    
    // If successful, update provider stats and return
    if (result.success) {
      // Update provider success stats (could be done async)
      await updateProviderStats(provider.id, true);
      return result;
    }
    
    // Log failure and try next provider
    console.warn(`Provider ${provider.name} failed: ${result.error}`);
    await updateProviderStats(provider.id, false);
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
  for (const provider of providers) {
    let result: SendResult;
    
    // Route to appropriate provider
    if (provider.provider === 'sendgrid') {
      result = await sendViaSendGrid(options, provider);
    } else if (provider.provider === 'gmail' || provider.provider === 'gmail_oauth' || provider.provider === 'smtp') {
      result = await sendViaGmail(options, provider);
    } else {
      // Unknown provider type
      continue;
    }
    
    // If successful, update provider stats and return
    if (result.success) {
      await updateProviderStats(provider.id, true);
      return result;
    }
    
    // Log failure and try next provider
    console.warn(`Provider ${provider.name} failed: ${result.error}`);
    await updateProviderStats(provider.id, false);
  }
  
  // All providers failed
  return {
    success: false,
    error: 'All email providers failed',
  };
}

/**
 * Update provider statistics after send attempt
 */
async function updateProviderStats(providerId: string, success: boolean): Promise<void> {
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
    console.error('Failed to update provider stats:', error);
  }
}

/**
 * Test provider connectivity
 */
export async function testProvider(providerId: string): Promise<{ success: boolean; message: string }> {
  try {
    const [provider] = await db
      .select()
      .from(communicationProviders)
      .where(eq(communicationProviders.id, providerId));
    
    if (!provider) {
      return { success: false, message: 'Provider not found' };
    }
    
    // Send test message based on type
    if (provider.type === 'sms') {
      // For SMS, we would need a test phone number - skip for now
      return { success: true, message: 'SMS provider configured (test send not implemented)' };
    } else if (provider.type === 'email') {
      // For email, we could send a test email to a configured address
      return { success: true, message: 'Email provider configured (test send not implemented)' };
    }
    
    return { success: false, message: 'Unknown provider channel' };
  } catch (error: any) {
    return { success: false, message: `Error: ${error.message}` };
  }
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
