/**
 * Provider Factory
 * 
 * Centralized factory for creating communication provider instances
 * based on database configuration.
 */

import { TwilioSmsProvider, type TwilioConfig } from './twilioSmsProvider';
import { SendGridEmailProvider, type SendGridConfig } from './sendgridEmailProvider';

export interface ProviderConfig {
  id: string;
  name: string;
  provider: string;
  type: 'sms' | 'email';
  credentials: any;
  isActive: boolean;
  priority: number;
}

/**
 * Create Twilio SMS provider instance
 */
export function createTwilioProvider(config: ProviderConfig): TwilioSmsProvider | null {
  const creds = config.credentials as any;
  
  if (!creds?.accountSid || !creds?.authToken || !creds?.fromPhone) {
    console.error('[Provider Factory] Twilio credentials incomplete');
    return null;
  }
  
  const twilioConfig: TwilioConfig = {
    accountSid: creds.accountSid,
    authToken: creds.authToken,
    fromPhone: creds.fromPhone,
    statusCallback: creds.statusCallback,
  };
  
  return new TwilioSmsProvider(twilioConfig);
}

/**
 * Create SendGrid email provider instance
 */
export function createSendGridProvider(config: ProviderConfig): SendGridEmailProvider | null {
  const creds = config.credentials as any;
  
  if (!creds?.apiKey) {
    console.error('[Provider Factory] SendGrid API key missing');
    return null;
  }
  
  const sendGridConfig: SendGridConfig = {
    apiKey: creds.apiKey,
    fromEmail: creds.fromEmail || 'noreply@kararaos.com',
    fromName: creds.fromName || 'KarāraOS',
    replyTo: creds.replyTo,
    statusCallback: creds.statusCallback,
  };
  
  return new SendGridEmailProvider(sendGridConfig);
}

/**
 * Create provider instance based on config
 */
export function createProvider(config: ProviderConfig): TwilioSmsProvider | SendGridEmailProvider | null {
  if (!config.isActive) {
    return null;
  }
  
  switch (config.provider) {
    case 'twilio':
      return createTwilioProvider(config);
    case 'sendgrid':
      return createSendGridProvider(config);
    default:
      console.warn(`[Provider Factory] Unknown provider type: ${config.provider}`);
      return null;
  }
}
