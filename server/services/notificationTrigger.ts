import { storage } from '../storage';
import { renderTemplate } from './templateRenderer';
import { sendMessage } from './campaignSender';

interface RecipientData {
  customerId?: string;
  customerName: string;
  mobile?: string | null;
  email?: string | null;
  language: 'en' | 'ar';
}

interface TriggerResult {
  success: boolean;
  smsId?: string;
  emailId?: string;
  error?: string;
}

/**
 * Triggers an automated notification based on a business event
 * @param templateCode - The code of the notification template to use (e.g., 'contract_created')
 * @param recipient - Customer/recipient information
 * @param variables - Template variables for rendering (e.g., {contractNumber: 'C-1234', amount: 500})
 * @param options - Additional options (e.g., force send, disable SMS/Email)
 * @returns Result indicating success/failure and communication IDs
 */
export async function triggerNotification(
  templateCode: string,
  recipient: RecipientData,
  variables: Record<string, any>,
  options: {
    forceSend?: boolean; // Send even if template is inactive
    disableSms?: boolean; // Don't send SMS even if template supports it
    disableEmail?: boolean; // Don't send Email even if template supports it
  } = {}
): Promise<TriggerResult> {
  try {
    // Step 1: Look up the template by code (case-insensitive)
    const templates = await storage.getNotificationTemplates();
    const template = templates.find(t => t.templateCode.toLowerCase() === templateCode.toLowerCase());
    
    if (!template) {
      console.error(`[NotificationTrigger] Template not found: ${templateCode}`);
      return { success: false, error: `Template not found: ${templateCode}` };
    }
    
    // Step 2: Check if template is active (unless force send)
    if (!template.isActive && !options.forceSend) {
      console.log(`[NotificationTrigger] Template ${templateCode} is inactive, skipping`);
      return { success: false, error: `Template ${templateCode} is inactive` };
    }
    
    // Step 3: Render template for recipient's language
    const rendered = renderTemplate(template, variables, {
      language: recipient.language,
    });
    
    // Step 4: Determine which channels to send on
    const shouldSendSms = template.supportsSms 
      && !options.disableSms 
      && recipient.mobile 
      && recipient.mobile.trim().length > 0;
    
    const shouldSendEmail = template.supportsEmail 
      && !options.disableEmail 
      && recipient.email 
      && recipient.email.trim().length > 0;
    
    if (!shouldSendSms && !shouldSendEmail) {
      console.log(`[NotificationTrigger] No valid channels for ${templateCode} to ${recipient.customerName}`);
      return { 
        success: false, 
        error: 'No valid communication channels (missing mobile/email or channel disabled)' 
      };
    }
    
    const result: TriggerResult = { success: true };
    
    // Step 5: Send SMS if applicable
    if (shouldSendSms) {
      try {
        const smsResult = await sendMessage('sms', recipient.mobile!, '', rendered.body);
        
        if (smsResult.success) {
          // Create communication log
          const commLog = await storage.createCommunicationLog({
            channel: 'sms',
            recipient: recipient.mobile!,
            subject: null,
            message: rendered.body,
            status: 'sent',
            templateId: template.id,
            templateCode: template.templateCode,
            providerId: smsResult.providerId || null,
            providerName: smsResult.providerName || null,
            externalId: smsResult.externalId || null,
            cost: smsResult.cost || null,
            recipientType: 'customer',
            recipientId: recipient.customerId || null,
            recipientName: recipient.customerName,
            language: recipient.language,
            triggerType: 'automated',
            deliveryMetadata: {
              automated: true,
              category: template.category,
            },
          });
          
          result.smsId = commLog.id;
          console.log(`[NotificationTrigger] SMS sent: ${commLog.id} to ${recipient.mobile}`);
        } else {
          throw new Error(smsResult.error || 'SMS send failed');
        }
      } catch (error: any) {
        console.error(`[NotificationTrigger] SMS failed for ${templateCode}:`, error.message);
        result.error = (result.error || '') + `SMS failed: ${error.message}. `;
        
        // Log failed attempt
        await storage.createCommunicationLog({
          channel: 'sms',
          recipient: recipient.mobile!,
          subject: null,
          message: rendered.body,
          status: 'failed',
          templateId: template.id,
          templateCode: template.templateCode,
          providerId: null,
          providerName: null,
          externalId: null,
          cost: null,
          recipientType: 'customer',
          recipientId: recipient.customerId || null,
          recipientName: recipient.customerName,
          language: recipient.language,
          triggerType: 'automated',
          failureReason: error.message,
          deliveryMetadata: {
            automated: true,
            category: template.category,
          },
        });
      }
    }
    
    // Step 6: Send Email if applicable
    if (shouldSendEmail) {
      try {
        const emailResult = await sendMessage('email', recipient.email!, rendered.subject, rendered.body);
        
        if (emailResult.success) {
          // Create communication log
          const commLog = await storage.createCommunicationLog({
            channel: 'email',
            recipient: recipient.email!,
            subject: rendered.subject,
            message: rendered.body,
            status: 'sent',
            templateId: template.id,
            templateCode: template.templateCode,
            providerId: emailResult.providerId || null,
            providerName: emailResult.providerName || null,
            externalId: emailResult.externalId || null,
            cost: emailResult.cost || null,
            recipientType: 'customer',
            recipientId: recipient.customerId || null,
            recipientName: recipient.customerName,
            language: recipient.language,
            triggerType: 'automated',
            deliveryMetadata: {
              automated: true,
              category: template.category,
            },
          });
          
          result.emailId = commLog.id;
          console.log(`[NotificationTrigger] Email sent: ${commLog.id} to ${recipient.email}`);
        } else {
          throw new Error(emailResult.error || 'Email send failed');
        }
      } catch (error: any) {
        console.error(`[NotificationTrigger] Email failed for ${templateCode}:`, error.message);
        result.error = (result.error || '') + `Email failed: ${error.message}. `;
        
        // Log failed attempt
        await storage.createCommunicationLog({
          channel: 'email',
          recipient: recipient.email!,
          subject: rendered.subject,
          message: rendered.body,
          status: 'failed',
          templateId: template.id,
          templateCode: template.templateCode,
          providerId: null,
          providerName: null,
          externalId: null,
          cost: null,
          recipientType: 'customer',
          recipientId: recipient.customerId || null,
          recipientName: recipient.customerName,
          language: recipient.language,
          triggerType: 'automated',
          failureReason: error.message,
          deliveryMetadata: {
            automated: true,
            category: template.category,
          },
        });
      }
    }
    
    // If at least one channel succeeded, consider it a success
    const hasSuccess = !!(result.smsId || result.emailId);
    result.success = hasSuccess;
    
    if (!hasSuccess) {
      result.error = result.error || 'All communication channels failed';
    }
    
    return result;
  } catch (error: any) {
    console.error(`[NotificationTrigger] Unexpected error for ${templateCode}:`, error);
    return { 
      success: false, 
      error: `Unexpected error: ${error.message}` 
    };
  }
}

/**
 * Triggers notifications to multiple recipients in batch
 * @param templateCode - The template to use
 * @param recipients - Array of recipient data
 * @param variablesOrFn - Either a single variables object (same for all) or a function that generates variables per recipient
 * @param options - Send options
 * @returns Array of results for each recipient
 */
export async function triggerNotificationBatch(
  templateCode: string,
  recipients: RecipientData[],
  variablesOrFn: Record<string, any> | ((recipient: RecipientData) => Record<string, any>),
  options: {
    forceSend?: boolean;
    disableSms?: boolean;
    disableEmail?: boolean;
  } = {}
): Promise<TriggerResult[]> {
  const results: TriggerResult[] = [];
  
  for (const recipient of recipients) {
    const variables = typeof variablesOrFn === 'function' 
      ? variablesOrFn(recipient) 
      : variablesOrFn;
    
    const result = await triggerNotification(templateCode, recipient, variables, options);
    results.push(result);
  }
  
  return results;
}
