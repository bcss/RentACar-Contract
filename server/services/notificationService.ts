import { db } from '../db';
import { communicationProviders, communicationLogs, notificationTemplates, customers, drivers, users, contracts, payments, documentRegistry, approvalRequests } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import twilio from 'twilio';
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

export interface SendNotificationParams {
  templateCode: string;
  channel: 'sms' | 'email' | 'both';
  recipientType: 'customer' | 'driver' | 'user' | 'sponsor';
  recipientId: string;
  variables: Record<string, string>;
  language?: 'en' | 'ar';
  triggerType?: 'manual' | 'automated' | 'scheduled' | 'event_driven';
  triggeredBy?: string;
  entityType?: string;
  entityId?: string;
}

export interface NotificationResult {
  success: boolean;
  messageSent: {
    sms?: boolean;
    email?: boolean;
  };
  logIds: string[];
  errors: string[];
}

/**
 * NotificationService - Centralized SMS/Email notification engine
 * 
 * Features:
 * - Multi-provider support with priority/fallback routing
 * - Bilingual template rendering (EN/AR)
 * - Comprehensive delivery tracking
 * - Automatic provider health monitoring
 * - Integration-ready for Twilio, SendGrid, Gmail connectors
 */
class NotificationService {
  /**
   * Send notification using template and variables
   */
  async sendNotification(params: SendNotificationParams): Promise<NotificationResult> {
    const result: NotificationResult = {
      success: false,
      messageSent: {},
      logIds: [],
      errors: [],
    };

    try {
      // 1. Get template
      const template = await this.getTemplate(params.templateCode);
      if (!template) {
        result.errors.push(`Template ${params.templateCode} not found`);
        return result;
      }

      // 2. Get recipient contact info
      const recipient = await this.getRecipientInfo(params.recipientType, params.recipientId);
      if (!recipient) {
        result.errors.push(`Recipient not found: ${params.recipientType} ${params.recipientId}`);
        return result;
      }

      // 3. Render messages
      const language = params.language || recipient.preferredLanguage || 'en';
      const renderedSubject = this.renderTemplate(
        (language === 'ar' ? template.subjectAr : template.subjectEn) || '',
        params.variables
      );
      const renderedBody = this.renderTemplate(
        (language === 'ar' ? template.bodyAr : template.bodyEn) || '',
        params.variables
      );

      // 4. Send SMS if requested
      if ((params.channel === 'sms' || params.channel === 'both') && template.supportsSms && recipient.phone) {
        const smsResult = await this.sendSms({
          recipient: recipient.phone,
          message: renderedBody,
          templateId: template.id,
          templateCode: params.templateCode,
          recipientType: params.recipientType,
          recipientId: params.recipientId,
          recipientName: recipient.name,
          language,
          triggerType: params.triggerType || 'manual',
          triggeredBy: params.triggeredBy,
          entityType: params.entityType,
          entityId: params.entityId,
          variables: params.variables,
        });

        result.messageSent.sms = smsResult.success;
        if (smsResult.logId) result.logIds.push(smsResult.logId);
        if (smsResult.error) result.errors.push(smsResult.error);
      }

      // 5. Send Email if requested
      if ((params.channel === 'email' || params.channel === 'both') && template.supportsEmail && recipient.email) {
        const emailResult = await this.sendEmail({
          recipient: recipient.email,
          subject: renderedSubject,
          message: renderedBody,
          templateId: template.id,
          templateCode: params.templateCode,
          recipientType: params.recipientType,
          recipientId: params.recipientId,
          recipientName: recipient.name,
          language,
          triggerType: params.triggerType || 'manual',
          triggeredBy: params.triggeredBy,
          entityType: params.entityType,
          entityId: params.entityId,
          variables: params.variables,
        });

        result.messageSent.email = emailResult.success;
        if (emailResult.logId) result.logIds.push(emailResult.logId);
        if (emailResult.error) result.errors.push(emailResult.error);
      }

      // 6. Determine overall success
      result.success = !!(result.messageSent.sms || result.messageSent.email) && result.errors.length === 0;

      return result;
    } catch (error) {
      console.error('NotificationService error:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      return result;
    }
  }

  /**
   * Send SMS using priority/fallback provider routing
   */
  private async sendSms(params: {
    recipient: string;
    message: string;
    templateId: string;
    templateCode: string;
    recipientType: string;
    recipientId: string;
    recipientName: string;
    language: string;
    triggerType: string;
    triggeredBy?: string;
    entityType?: string;
    entityId?: string;
    variables: Record<string, any>;
  }): Promise<{ success: boolean; logId?: string; error?: string }> {
    // Get active SMS providers ordered by priority
    const providers = await db
      .select()
      .from(communicationProviders)
      .where(and(eq(communicationProviders.type, 'sms'), eq(communicationProviders.isActive, true)))
      .orderBy(communicationProviders.priority);

    if (providers.length === 0) {
      return { success: false, error: 'No active SMS providers configured' };
    }

    // Try providers in priority order
    for (const provider of providers) {
      try {
        const sendResult = await this.sendViaSmsProvider(provider, params.recipient, params.message);

        // Create communication log
        const [log] = await db.insert(communicationLogs).values({
          channel: 'sms',
          recipient: params.recipient,
          message: params.message,
          providerId: provider.id,
          providerName: provider.name,
          status: sendResult.success ? 'sent' : 'failed',
          sentAt: sendResult.success ? new Date() : null,
          failedAt: sendResult.success ? null : new Date(),
          failureReason: sendResult.error,
          externalId: sendResult.messageId,
          templateId: params.templateId,
          templateCode: params.templateCode,
          templateVariables: params.variables,
          triggerType: params.triggerType,
          triggeredBy: params.triggeredBy,
          recipientType: params.recipientType,
          recipientId: params.recipientId,
          recipientName: params.recipientName,
          language: params.language,
          entityType: params.entityType,
          entityId: params.entityId,
          attemptCount: 1,
          lastAttemptAt: new Date(),
        }).returning();

        if (sendResult.success) {
          // Update provider usage stats
          await this.incrementProviderUsage(provider.id, true);
          return { success: true, logId: log.id };
        } else {
          // Try next provider in fallback chain
          await this.incrementProviderUsage(provider.id, false);
          continue;
        }
      } catch (error) {
        console.error(`SMS provider ${provider.name} error:`, error);
        await this.updateProviderHealth(provider.id, 'degraded', error instanceof Error ? error.message : 'Unknown error');
        continue;
      }
    }

    return { success: false, error: 'All SMS providers failed' };
  }

  /**
   * Send Email using priority/fallback provider routing
   */
  private async sendEmail(params: {
    recipient: string;
    subject: string;
    message: string;
    templateId: string;
    templateCode: string;
    recipientType: string;
    recipientId: string;
    recipientName: string;
    language: string;
    triggerType: string;
    triggeredBy?: string;
    entityType?: string;
    entityId?: string;
    variables: Record<string, any>;
  }): Promise<{ success: boolean; logId?: string; error?: string }> {
    // Get active Email providers ordered by priority
    const providers = await db
      .select()
      .from(communicationProviders)
      .where(and(eq(communicationProviders.type, 'email'), eq(communicationProviders.isActive, true)))
      .orderBy(communicationProviders.priority);

    if (providers.length === 0) {
      return { success: false, error: 'No active Email providers configured' };
    }

    // Try providers in priority order
    for (const provider of providers) {
      try {
        const sendResult = await this.sendViaEmailProvider(provider, params.recipient, params.subject, params.message);

        // Create communication log
        const [log] = await db.insert(communicationLogs).values({
          channel: 'email',
          recipient: params.recipient,
          subject: params.subject,
          message: params.message,
          providerId: provider.id,
          providerName: provider.name,
          status: sendResult.success ? 'sent' : 'failed',
          sentAt: sendResult.success ? new Date() : null,
          failedAt: sendResult.success ? null : new Date(),
          failureReason: sendResult.error,
          externalId: sendResult.messageId,
          templateId: params.templateId,
          templateCode: params.templateCode,
          templateVariables: params.variables,
          triggerType: params.triggerType,
          triggeredBy: params.triggeredBy,
          recipientType: params.recipientType,
          recipientId: params.recipientId,
          recipientName: params.recipientName,
          language: params.language,
          entityType: params.entityType,
          entityId: params.entityId,
          attemptCount: 1,
          lastAttemptAt: new Date(),
        }).returning();

        if (sendResult.success) {
          await this.incrementProviderUsage(provider.id, true);
          return { success: true, logId: log.id };
        } else {
          await this.incrementProviderUsage(provider.id, false);
          continue;
        }
      } catch (error) {
        console.error(`Email provider ${provider.name} error:`, error);
        await this.updateProviderHealth(provider.id, 'degraded', error instanceof Error ? error.message : 'Unknown error');
        continue;
      }
    }

    return { success: false, error: 'All Email providers failed' };
  }

  /**
   * Send via SMS provider (Twilio, Generic API)
   * PRODUCTION-READY: Direct Twilio integration
   */
  private async sendViaSmsProvider(
    provider: any,
    recipient: string,
    message: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const credentials = provider.credentials as any;

    if (provider.provider === 'twilio') {
      try {
        // Direct Twilio integration using official SDK
        const twilioClient = twilio(credentials.accountSid, credentials.authToken);
        const result = await twilioClient.messages.create({
          body: message,
          from: credentials.fromPhone,
          to: recipient
        });
        
        console.log(`[SMS SUCCESS] Twilio: ${recipient} - MessageSID: ${result.sid}`);
        return { success: true, messageId: result.sid };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown Twilio error';
        console.error(`[SMS ERROR] Twilio: ${recipient} - ${errorMsg}`);
        return { success: false, error: errorMsg };
      }
    }

    // Generic API provider with fetch
    if (provider.provider === 'generic_api' && credentials.apiEndpoint) {
      try {
        const response = await fetch(credentials.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': credentials.apiKey ? `Bearer ${credentials.apiKey}` : '',
          },
          body: JSON.stringify({
            to: recipient,
            message: message,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`[SMS SUCCESS] Generic API: ${recipient}`);
          return { success: true, messageId: data.messageId || `API_${Date.now()}` };
        } else {
          const errorText = await response.text();
          console.error(`[SMS ERROR] Generic API: ${recipient} - ${errorText}`);
          return { success: false, error: errorText };
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown API error';
        console.error(`[SMS ERROR] Generic API: ${recipient} - ${errorMsg}`);
        return { success: false, error: errorMsg };
      }
    }

    console.warn(`[SMS WARN] Unknown provider type: ${provider.provider}`);
    return { success: false, error: 'Unknown provider type' };
  }

  /**
   * Send via Email provider (SendGrid, Gmail, SMTP)
   * PRODUCTION-READY: Direct SendGrid and Nodemailer integration
   */
  private async sendViaEmailProvider(
    provider: any,
    recipient: string,
    subject: string,
    message: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const credentials = provider.credentials as any;

    // SendGrid Integration
    if (provider.provider === 'sendgrid') {
      try {
        // Direct SendGrid integration using official SDK
        sgMail.setApiKey(credentials.apiKey);
        
        const msg = {
          to: recipient,
          from: credentials.fromEmail,
          subject: subject,
          text: message,
          html: message.replace(/\n/g, '<br>'), // Basic HTML conversion
        };
        
        const result = await sgMail.send(msg);
        const messageId = result[0].headers['x-message-id'] || `SG_${Date.now()}`;
        
        console.log(`[EMAIL SUCCESS] SendGrid: ${recipient} - MessageID: ${messageId}`);
        return { success: true, messageId };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown SendGrid error';
        console.error(`[EMAIL ERROR] SendGrid: ${recipient} - ${errorMsg}`);
        return { success: false, error: errorMsg };
      }
    }

    // Nodemailer Integration (Gmail OAuth, SMTP)
    if (provider.provider === 'gmail_oauth' || provider.provider === 'smtp') {
      try {
        // Configure nodemailer transport based on provider type
        let transporter;
        
        if (provider.provider === 'gmail_oauth') {
          // Gmail with OAuth2
          transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              type: 'OAuth2',
              user: credentials.email,
              clientId: credentials.clientId,
              clientSecret: credentials.clientSecret,
              refreshToken: credentials.refreshToken,
              accessToken: credentials.accessToken,
            },
          });
        } else {
          // Generic SMTP
          transporter = nodemailer.createTransport({
            host: credentials.smtpHost,
            port: credentials.smtpPort || 587,
            secure: credentials.smtpPort === 465, // true for 465, false for other ports
            auth: {
              user: credentials.smtpUser,
              pass: credentials.smtpPassword,
            },
          });
        }

        // Send email
        const info = await transporter.sendMail({
          from: credentials.fromEmail,
          to: recipient,
          subject: subject,
          text: message,
          html: message.replace(/\n/g, '<br>'), // Basic HTML conversion
        });

        console.log(`[EMAIL SUCCESS] ${provider.provider}: ${recipient} - MessageID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown email error';
        console.error(`[EMAIL ERROR] ${provider.provider}: ${recipient} - ${errorMsg}`);
        return { success: false, error: errorMsg };
      }
    }

    console.warn(`[EMAIL WARN] Unknown provider type: ${provider.provider}`);
    return { success: false, error: 'Unknown provider type' };
  }

  /**
   * Render template with variable substitution
   */
  private renderTemplate(template: string, variables: Record<string, string>): string {
    let rendered = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, value || '');
    }
    return rendered;
  }

  /**
   * Get template by code
   */
  private async getTemplate(code: string) {
    const [template] = await db
      .select()
      .from(notificationTemplates)
      .where(and(eq(notificationTemplates.templateCode, code), eq(notificationTemplates.isActive, true)));
    return template;
  }

  /**
   * Get recipient contact information
   */
  private async getRecipientInfo(type: string, id: string): Promise<{ name: string; email?: string; phone?: string; preferredLanguage?: string } | null> {
    if (type === 'customer') {
      const [customer] = await db.select().from(customers).where(eq(customers.id, id));
      if (!customer) return null;
      return {
        name: customer.nameEn || customer.nameAr || 'Customer',
        email: customer.email || undefined,
        phone: customer.phone || undefined,
        preferredLanguage: 'en',
      };
    }

    if (type === 'driver') {
      const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
      if (!driver) return null;
      return {
        name: driver.nameEn || driver.nameAr || 'Driver',
        email: driver.email || undefined,
        phone: driver.mobile || undefined,
        preferredLanguage: 'en',
      };
    }

    if (type === 'user') {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      if (!user) return null;
      return {
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || String(user.username),
        email: user.email ? String(user.email) : undefined,
        phone: undefined,
        preferredLanguage: 'en',
      };
    }

    return null;
  }

  /**
   * Update provider health status
   */
  private async updateProviderHealth(providerId: string, healthStatus: string, lastError?: string) {
    await db
      .update(communicationProviders)
      .set({
        healthStatus,
        lastHealthCheck: new Date(),
      })
      .where(eq(communicationProviders.id, providerId));
  }

  /**
   * Increment provider usage statistics
   */
  private async incrementProviderUsage(providerId: string, success: boolean) {
    const [provider] = await db
      .select()
      .from(communicationProviders)
      .where(eq(communicationProviders.id, providerId));

    if (!provider) return;

    await db
      .update(communicationProviders)
      .set({
        totalSent: success ? (provider.totalSent || 0) + 1 : provider.totalSent,
        totalFailed: !success ? (provider.totalFailed || 0) + 1 : provider.totalFailed,
        lastUsed: new Date(),
      })
      .where(eq(communicationProviders.id, providerId));
  }

  /**
   * Send payment received notification
   */
  async sendPaymentReceivedNotification(contractId: string, paymentId: string): Promise<NotificationResult> {
    try {
      // Get contract and payment details
      const [contract] = await db.select().from(contracts).where(eq(contracts.id, contractId));
      const [payment] = await db.select().from(payments).where(eq(payments.id, paymentId));
      
      if (!contract || !payment) {
        return {
          success: false,
          messageSent: {},
          logIds: [],
          errors: ['Contract or payment not found'],
        };
      }

      return await this.sendNotification({
        templateCode: 'payment_received',
        channel: 'both',
        recipientType: 'customer',
        recipientId: contract.customerId,
        variables: {
          contractNumber: String(contract.contractNumber || ''),
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          customerName: '',
        },
        triggerType: 'event_driven',
        entityType: 'payment',
        entityId: paymentId,
      });
    } catch (error) {
      console.error('[NotificationService] Error sending payment received notification:', error);
      return {
        success: false,
        messageSent: {},
        logIds: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Send document uploaded notification
   */
  async sendDocumentUploadedNotification(documentId: string): Promise<NotificationResult> {
    try {
      const [document] = await db.select().from(documentRegistry).where(eq(documentRegistry.id, documentId));
      
      if (!document) {
        return {
          success: false,
          messageSent: {},
          logIds: [],
          errors: ['Document not found'],
        };
      }

      // Only notify for customer documents
      if (document.entityType !== 'customer') {
        return {
          success: true,
          messageSent: {},
          logIds: [],
          errors: [],
        };
      }

      return await this.sendNotification({
        templateCode: 'document_uploaded',
        channel: 'both',
        recipientType: 'customer',
        recipientId: document.entityId,
        variables: {
          documentType: document.documentType,
          documentNumber: document.documentNumber || 'N/A',
          customerName: '',
        },
        triggerType: 'event_driven',
        entityType: 'document',
        entityId: documentId,
      });
    } catch (error) {
      console.error('[NotificationService] Error sending document uploaded notification:', error);
      return {
        success: false,
        messageSent: {},
        logIds: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Send document verified notification
   */
  async sendDocumentVerifiedNotification(documentId: string): Promise<NotificationResult> {
    try {
      const [document] = await db.select().from(documentRegistry).where(eq(documentRegistry.id, documentId));
      
      if (!document) {
        return {
          success: false,
          messageSent: {},
          logIds: [],
          errors: ['Document not found'],
        };
      }

      // Only notify for customer documents
      if (document.entityType !== 'customer') {
        return {
          success: true,
          messageSent: {},
          logIds: [],
          errors: [],
        };
      }

      return await this.sendNotification({
        templateCode: 'document_verified',
        channel: 'both',
        recipientType: 'customer',
        recipientId: document.entityId,
        variables: {
          documentType: document.documentType,
          documentNumber: document.documentNumber || 'N/A',
          customerName: '',
        },
        triggerType: 'event_driven',
        entityType: 'document',
        entityId: documentId,
      });
    } catch (error) {
      console.error('[NotificationService] Error sending document verified notification:', error);
      return {
        success: false,
        messageSent: {},
        logIds: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Send approval required notification
   */
  async sendApprovalRequiredNotification(approvalId: string): Promise<NotificationResult> {
    try {
      const [approval] = await db.select().from(approvalRequests).where(eq(approvalRequests.id, approvalId));
      
      if (!approval) {
        return {
          success: false,
          messageSent: {},
          logIds: [],
          errors: ['Approval request not found'],
        };
      }

      // Get all users with Manager/Admin roles to notify
      const [managerUsers] = await db
        .select()
        .from(users)
        .where(eq(users.role, 'manager'))
        .limit(1);

      if (!managerUsers) {
        console.log('[NotificationService] No managers found to notify for approval');
        return {
          success: false,
          messageSent: {},
          logIds: [],
          errors: ['No managers found to notify'],
        };
      }

      return await this.sendNotification({
        templateCode: 'approval_required',
        channel: 'both',
        recipientType: 'user',
        recipientId: String(managerUsers.id),
        variables: {
          approvalType: approval.entityType,
          requester: '',
          amount: approval.amount || '0',
        },
        triggerType: 'event_driven',
        entityType: 'approval',
        entityId: approvalId,
      });
    } catch (error) {
      console.error('[NotificationService] Error sending approval required notification:', error);
      return {
        success: false,
        messageSent: {},
        logIds: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Send risk score elevated notification
   */
  async sendRiskElevatedNotification(customerId: string, oldLevel: string, newLevel: string, score: number): Promise<NotificationResult> {
    try {
      // Only notify on risk elevation (not reduction)
      const riskHierarchy = ['low', 'medium', 'high'];
      const oldIndex = riskHierarchy.indexOf(oldLevel.toLowerCase());
      const newIndex = riskHierarchy.indexOf(newLevel.toLowerCase());
      
      if (newIndex <= oldIndex) {
        // Risk decreased or stayed same, no notification needed
        return {
          success: true,
          messageSent: {},
          logIds: [],
          errors: [],
        };
      }

      // Notify internal users (managers) about risk elevation
      const [managerUser] = await db
        .select()
        .from(users)
        .where(eq(users.role, 'manager'))
        .limit(1);

      if (!managerUser) {
        return {
          success: false,
          messageSent: {},
          logIds: [],
          errors: ['No managers found to notify'],
        };
      }

      return await this.sendNotification({
        templateCode: 'risk_score_elevated',
        channel: 'both',
        recipientType: 'user',
        recipientId: String(managerUser.id),
        variables: {
          customerName: '',
          oldLevel,
          newLevel,
          riskScore: score.toString(),
        },
        triggerType: 'automated',
        entityType: 'customer',
        entityId: customerId,
      });
    } catch (error) {
      console.error('[NotificationService] Error sending risk elevated notification:', error);
      return {
        success: false,
        messageSent: {},
        logIds: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
