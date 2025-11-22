/**
 * Campaign Send Service
 * 
 * Handles the complete campaign execution workflow:
 * 1. Generate recipient lists based on filters
 * 2. Render templates with dynamic variables
 * 3. Send messages via communication providers
 * 4. Track delivery status
 */

import { storage } from '../storage';
import type { Campaign, NotificationTemplate, Customer, Driver, User } from '@shared/schema';
import { sendEmail, sendSms } from './providerSelector';
import { renderTemplate } from './templateRenderer';

interface RecipientFilter {
  type: string; // 'all', 'active_customers', 'overdue_contracts', 'drivers', etc.
  branchIds?: string[];
}

interface Recipient {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  language: string;
  variables: Record<string, any>;
}

interface SendResult {
  success: boolean;
  sent: number;
  failed: number;
  errors: string[];
}

/**
 * Generate recipient list based on campaign filters
 */
export async function generateRecipients(
  scope: string,
  selectedBranches: string[] | null,
  recipientFilter: RecipientFilter
): Promise<Recipient[]> {
  const recipients: Recipient[] = [];
  
  try {
    // Branch-scoped recipients
    if (scope === 'branch' || scope === 'selected_branches') {
      const targetBranches = scope === 'selected_branches' && selectedBranches 
        ? selectedBranches 
        : [];
      
      // Get customers based on filter type
      if (recipientFilter.type === 'all' || recipientFilter.type === 'active_customers') {
        const customers = await storage.getCustomers();
        
        for (const customer of customers) {
          // Filter by branch if needed
          if (scope === 'selected_branches' && targetBranches.length > 0) {
            // Would need to join with contracts to get branch, skipping for now
            // In real implementation, would query customers with active contracts in target branches
          }
          
          if (customer.email || customer.phone) {
            recipients.push({
              id: customer.id,
              name: customer.nameEn,
              email: customer.email,
              phone: customer.phone,
              language: 'en', // Default to English
              variables: {
                customerName: customer.nameEn,
                customerNameAr: customer.nameAr || customer.nameEn,
                customerId: customer.id,
                emiratesId: customer.emiratesIdNumber || '',
              },
            });
          }
        }
      }
      
      // Get drivers if filter includes them
      if (recipientFilter.type === 'all' || recipientFilter.type === 'drivers') {
        const drivers = await storage.getDrivers();
        
        for (const driver of drivers) {
          if (driver.email || driver.mobile) {
            recipients.push({
              id: driver.id,
              name: driver.nameEn,
              email: driver.email,
              phone: driver.mobile,
              language: 'en', // Drivers default to English
              variables: {
                driverName: driver.nameEn,
                driverNameAr: driver.nameAr || driver.nameEn,
                driverId: driver.id,
              },
            });
          }
        }
      }
    }
    
    // Organization-wide recipients (admin only)
    if (scope === 'organization') {
      // Get all customers across all branches
      const customers = await storage.getCustomers();
      
      for (const customer of customers) {
        if (customer.email || customer.phone) {
          recipients.push({
            id: customer.id,
            name: customer.nameEn,
            email: customer.email,
            phone: customer.phone,
            language: 'en', // Default to English
            variables: {
              customerName: customer.nameEn,
              customerNameAr: customer.nameAr || customer.nameEn,
              customerId: customer.id,
            },
          });
        }
      }
    }
    
    return recipients;
  } catch (error) {
    console.error('Error generating recipients:', error);
    return [];
  }
}

/**
 * Send message via communication provider
 */
export async function sendMessage(
  channel: string,
  recipient: string,
  subject: string,
  message: string
): Promise<{ success: boolean; externalId?: string; error?: string; providerId?: string; providerName?: string }> {
  try {
    if (channel === 'email') {
      return await sendEmail({
        to: recipient,
        subject: subject || 'Notification',
        body: message,
        html: false,
      });
    } else if (channel === 'sms') {
      return await sendSms({
        to: recipient,
        message,
      });
    } else {
      return {
        success: false,
        error: `Invalid channel: ${channel}`,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Execute campaign - send to all recipients
 */
export async function executeCampaign(campaignId: string, user: User): Promise<SendResult> {
  const result: SendResult = {
    success: false,
    sent: 0,
    failed: 0,
    errors: [],
  };
  
  try {
    // Get campaign details
    const campaign = await storage.getCampaignById(campaignId, user);
    if (!campaign) {
      result.errors.push('Campaign not found');
      return result;
    }
    
    // Get template
    const template = await storage.getNotificationTemplateById(campaign.templateId);
    if (!template) {
      result.errors.push('Template not found');
      return result;
    }
    
    // Generate recipients
    const recipients = await generateRecipients(
      campaign.scope,
      campaign.selectedBranches as string[] | null,
      campaign.recipientFilter as RecipientFilter
    );
    
    if (recipients.length === 0) {
      result.errors.push('No recipients found');
      return result;
    }
    
    // Update campaign status to sending
    await storage.updateCampaign(campaignId, { status: 'sending' });
    
    // Send to each recipient
    for (const recipient of recipients) {
      try {
        // Determine channel and recipient contact
        const channel = campaign.channel;
        const recipientContact = channel === 'sms' ? recipient.phone : recipient.email;
        
        if (!recipientContact) {
          result.failed++;
          continue;
        }
        
        // Render template with variables
        const { subject, message } = await renderTemplate(template, recipient.variables, recipient.language);
        
        // Send message
        const sendResult = await sendMessage(channel, recipientContact, subject, message);
        
        // Create communication log with provider details
        await storage.createCommunicationLog({
          channel,
          recipient: recipientContact,
          subject,
          message,
          status: sendResult.success ? 'sent' : 'failed',
          providerId: sendResult.providerId,
          providerName: sendResult.providerName,
          templateId: template.id,
          templateCode: template.templateCode,
          templateVariables: recipient.variables,
          entityType: 'campaign',
          entityId: campaignId,
          recipientType: 'customer', // Could be refined based on recipient type
          recipientId: recipient.id,
          recipientName: recipient.name,
          language: recipient.language,
          triggerType: 'scheduled',
          triggeredBy: user.id as string,
          externalId: sendResult.externalId,
          sentAt: sendResult.success ? new Date() : undefined,
          failureReason: sendResult.error,
          cost: sendResult.cost,
        });
        
        if (sendResult.success) {
          result.sent++;
        } else {
          result.failed++;
          result.errors.push(`Failed to send to ${recipientContact}: ${sendResult.error}`);
        }
      } catch (error: any) {
        result.failed++;
        result.errors.push(`Error sending to ${recipient.name}: ${error.message}`);
      }
    }
    
    // Update campaign with final status (only allowed fields)
    const finalStatus = result.failed === 0 ? 'sent' : result.sent > 0 ? 'sent' : 'failed';
    await storage.updateCampaign(campaignId, {
      status: finalStatus,
      // Note: sentAt, successCount, failureCount are omitted from insertCampaignSchema
      // They need to be updated via raw SQL or added to update schema
    });
    
    result.success = result.sent > 0;
    return result;
  } catch (error: any) {
    result.errors.push(`Campaign execution failed: ${error.message}`);
    
    // Mark campaign as failed
    try {
      await storage.updateCampaign(campaignId, {
        status: 'failed',
        // Note: failureCount is omitted from insertCampaignSchema
      });
    } catch (updateError) {
      console.error('Failed to update campaign status:', updateError);
    }
    
    return result;
  }
}
