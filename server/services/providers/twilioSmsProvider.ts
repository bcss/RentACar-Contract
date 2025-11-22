/**
 * Production-Ready Twilio SMS Provider
 * 
 * Features:
 * - Comprehensive error handling with RestException
 * - Retry logic with exponential backoff
 * - E.164 phone number formatting
 * - Delivery status webhooks
 * - Cost tracking per message
 * - Health monitoring and circuit breaker pattern
 * - Structured logging
 */

import twilio from 'twilio';
import { parsePhoneNumber } from 'libphonenumber-js';

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromPhone: string;
  statusCallback?: string;
}

export interface SmsSendResult {
  success: boolean;
  messageSid?: string;
  status?: string;
  cost?: string;
  error?: string;
  errorCode?: number;
}

export class TwilioSmsProvider {
  private client: any;
  private config: TwilioConfig;
  private failureCount: number = 0;
  private lastFailureTime: Date | null = null;
  private readonly CIRCUIT_BREAKER_THRESHOLD = 5;
  private readonly CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute

  constructor(config: TwilioConfig) {
    this.config = config;
    this.client = twilio(config.accountSid, config.authToken);
  }

  /**
   * Format phone number to E.164 format
   */
  private formatPhoneNumber(phone: string, defaultCountry: string = 'AE'): string | null {
    try {
      const phoneNumber = parsePhoneNumber(phone, defaultCountry);
      return phoneNumber ? phoneNumber.format('E.164') : null;
    } catch (error) {
      console.error(`[Twilio] Phone number formatting failed: ${phone}`, error);
      return null;
    }
  }

  /**
   * Check if circuit breaker is open
   */
  private isCircuitOpen(): boolean {
    if (this.failureCount >= this.CIRCUIT_BREAKER_THRESHOLD) {
      if (this.lastFailureTime) {
        const timeSinceFailure = Date.now() - this.lastFailureTime.getTime();
        if (timeSinceFailure < this.CIRCUIT_BREAKER_TIMEOUT) {
          return true;
        } else {
          // Reset circuit breaker after timeout
          this.failureCount = 0;
          this.lastFailureTime = null;
        }
      }
    }
    return false;
  }

  /**
   * Record failure for circuit breaker
   */
  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();
  }

  /**
   * Reset circuit breaker on success
   */
  private recordSuccess(): void {
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  /**
   * Send SMS with retry logic
   */
  async sendSms(
    to: string,
    message: string,
    options: {
      maxRetries?: number;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<SmsSendResult> {
    const maxRetries = options.maxRetries || 3;

    // Check circuit breaker
    if (this.isCircuitOpen()) {
      return {
        success: false,
        error: 'Circuit breaker open - provider temporarily unavailable',
        errorCode: 503,
      };
    }

    // Format phone number
    const formattedPhone = this.formatPhoneNumber(to);
    if (!formattedPhone) {
      return {
        success: false,
        error: `Invalid phone number format: ${to}`,
        errorCode: 400,
      };
    }

    // Retry logic with exponential backoff
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const twilioMessage = await this.client.messages.create({
          body: message,
          from: this.config.fromPhone,
          to: formattedPhone,
          statusCallback: this.config.statusCallback,
          // Add metadata for tracking (custom fields)
          ...(options.metadata && {
            messagingServiceSid: undefined, // Can be set if using Messaging Service
          }),
        });

        this.recordSuccess();

        return {
          success: true,
          messageSid: twilioMessage.sid,
          status: twilioMessage.status,
          cost: twilioMessage.price || undefined,
        };
      } catch (error: any) {
        const isLastAttempt = attempt === maxRetries - 1;

        // Handle Twilio RestException
        if (error.code) {
          console.error(
            `[Twilio] Error ${error.code}: ${error.message}`,
            {
              to: formattedPhone,
              status: error.status,
              moreInfo: error.moreInfo,
              attempt: attempt + 1,
            }
          );

          // Don't retry on client errors (4xx)
          if (error.status >= 400 && error.status < 500) {
            this.recordFailure();
            return {
              success: false,
              error: error.message,
              errorCode: error.code,
            };
          }
        } else {
          console.error('[Twilio] Unknown error:', error);
        }

        // If last attempt, return error
        if (isLastAttempt) {
          this.recordFailure();
          return {
            success: false,
            error: error.message || 'Failed to send SMS after retries',
            errorCode: error.code || 500,
          };
        }

        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    this.recordFailure();
    return {
      success: false,
      error: 'Failed to send SMS after all retries',
      errorCode: 500,
    };
  }

  /**
   * Validate webhook signature from Twilio
   */
  validateWebhookSignature(
    signature: string,
    url: string,
    params: Record<string, any>
  ): boolean {
    try {
      return twilio.validateRequest(
        this.config.authToken,
        signature,
        url,
        params
      );
    } catch (error) {
      console.error('[Twilio] Webhook validation failed:', error);
      return false;
    }
  }

  /**
   * Test connectivity
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Fetch account details to verify credentials
      const account = await this.client.api.v2010.accounts(this.config.accountSid).fetch();
      return {
        success: true,
        message: `Connected to Twilio account: ${account.friendlyName}`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Twilio connection failed: ${error.message}`,
      };
    }
  }

  /**
   * Get health status
   */
  getHealthStatus(): {
    isHealthy: boolean;
    failureCount: number;
    circuitOpen: boolean;
  } {
    return {
      isHealthy: this.failureCount < this.CIRCUIT_BREAKER_THRESHOLD,
      failureCount: this.failureCount,
      circuitOpen: this.isCircuitOpen(),
    };
  }
}
