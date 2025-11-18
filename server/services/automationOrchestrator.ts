import cron from 'node-cron';
import { storage } from '../storage';
import { RiskCalculator } from './riskCalculator';
import { notificationService } from './notificationService';
import { db } from '../db';
import { users } from '../../shared/schema';
import { and, or, eq } from 'drizzle-orm';

/**
 * Automation Orchestrator for RCCMS
 * 
 * Manages cron jobs for automated background tasks:
 * - Nightly risk score calculations (2 AM)
 * - Document expiry checks (8 AM)
 * - Contract expiry reminders (9 AM)
 * - Payment due reminders (10 AM)
 */

let isInitialized = false;

// Track active cron jobs for cleanup
const activeJobs: any[] = [];

// Initialize risk calculator instance
const riskCalculator = new RiskCalculator(storage);

/**
 * Initialize all automation cron jobs
 */
export function initializeAutomationOrchestrator() {
  if (isInitialized) {
    console.log('[Automation] Already initialized');
    return;
  }

  console.log('[Automation] Initializing Automation Orchestrator...');

  // Job 1: Nightly Risk Score Calculation (2 AM daily)
  // Recalculates risk scores for all active customers
  const riskScoreJob = cron.schedule('0 2 * * *', async () => {
    console.log('[Automation] Starting nightly risk score calculation...');
    try {
      const customers = await storage.getCustomers();
      let processed = 0;
      let errors = 0;

      for (const customer of customers) {
        try {
          // Get previous risk level
          const previousScores = await storage.getCustomerRiskScores(customer.id);
          const previousLevel = previousScores.length > 0 ? previousScores[0].riskCategory : 'low';
          
          // Calculate and save risk score
          const riskScore = await riskCalculator.calculateCustomerRisk(customer.id);
          await storage.createCustomerRiskScore({
            customerId: customer.id,
            riskScore: riskScore.score,
            riskCategory: riskScore.level,
            paymentHistory: riskScore.paymentScore,
            contractViolations: riskScore.violationScore,
            accidentHistory: riskScore.incidentScore,
            finesHistory: riskScore.violationScore,
            licenseValidity: riskScore.documentScore,
            identityVerification: riskScore.documentScore,
            outstandingBalance: '0',
            blacklistStatus: false,
            calculatedBy: 'system',
          });
          
          // Send notification if risk level elevated (non-blocking)
          if (previousLevel !== riskScore.level) {
            notificationService.sendRiskElevatedNotification(
              customer.id,
              previousLevel,
              riskScore.level,
              riskScore.score
            ).catch(err => {
              console.error(`[Automation] Failed to send risk elevated notification for ${customer.id}:`, err);
            });
          }
          
          processed++;
        } catch (error) {
          console.error(`[Automation] Error calculating risk for customer ${customer.id}:`, error);
          errors++;
        }
      }

      console.log(`[Automation] Risk score calculation complete: ${processed} processed, ${errors} errors`);
    } catch (error) {
      console.error('[Automation] Risk score job failed:', error);
    }
  });

  // Job 2: Document Expiry Check (8 AM daily)
  // Creates reminders for documents expiring in 30 days
  const documentExpiryJob = cron.schedule('0 8 * * *', async () => {
    console.log('[Automation] Starting document expiry check...');
    try {
      // Check documents expiring in next 30 days
      const expiryThreshold = new Date();
      expiryThreshold.setDate(expiryThreshold.getDate() + 30);

      const documents = await storage.getDocuments();
      let remindersCreated = 0;

      for (const doc of documents) {
        if (!doc.expiryDate || !doc.isVerified) continue;

        const expiryDate = new Date(doc.expiryDate);
        if (expiryDate <= expiryThreshold && expiryDate > new Date()) {
          // Check if reminder already exists for this document
          const existingReminders = await storage.getAutomatedReminders({
            entityType: doc.entityType,
            entityId: doc.entityId,
          });

          const hasRecentReminder = existingReminders.some(r => 
            r.reminderType === 'document_renewal' &&
            r.messageTemplate?.includes(doc.documentType)
          );

          if (!hasRecentReminder) {
            // Map non-person entity types to their owners
            let recipientType: 'customer' | 'driver' | 'sponsor' | 'user' | null = null;
            let recipientId: string | null = null;
            
            if (doc.entityType === 'customer' || doc.entityType === 'driver' || doc.entityType === 'sponsor' || doc.entityType === 'user') {
              recipientType = doc.entityType;
              recipientId = doc.entityId;
            } else if (doc.entityType === 'vehicle') {
              // Get vehicle's branch manager
              const vehicle = await storage.getVehicleById(doc.entityId);
              if (vehicle) {
                const branchManagers = await db.select().from(users)
                  .where(and(
                    eq(users.branchId, vehicle.branchId),
                    or(eq(users.role, 'manager'), eq(users.role, 'admin'))
                  ))
                  .limit(1);
                if (branchManagers.length > 0) {
                  recipientType = 'user';
                  recipientId = branchManagers[0].id;
                }
              }
            } else if (doc.entityType === 'contract') {
              // Get contract's customer
              const contract = await storage.getContract(doc.entityId);
              if (contract) {
                recipientType = 'customer';
                recipientId = contract.customerId;
              }
            }
            
            // Only send if we found a valid recipient
            if (recipientType && recipientId) {
              const result = await notificationService.sendNotification({
                templateCode: 'DOCUMENT_RENEWAL_REMINDER',
                channel: 'both',
                recipientType,
                recipientId,
                variables: {
                  documentType: doc.documentType,
                  expiryDate: expiryDate.toLocaleDateString('en-AE'),
                  daysUntilExpiry: Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)).toString(),
                },
                language: 'en',
                triggerType: 'automated',
                triggeredBy: 'system',
                entityType: 'document',
                entityId: doc.id,
              });

              if (result.success) {
                // Create reminder record for tracking
                const template = await storage.getNotificationTemplateByCode('DOCUMENT_RENEWAL_REMINDER');
                if (template) {
                  await storage.createAutomatedReminder({
                    entityType: doc.entityType,
                    entityId: doc.entityId,
                    reminderType: 'document_renewal',
                    reminderDate: expiryDate,
                    templateId: template.id,
                    messageTemplate: `Document ${doc.documentType} expiring on ${expiryDate.toLocaleDateString()}`,
                    recipientEmail: undefined,
                    recipientPhone: undefined,
                    isSent: true,
                    sentTime: new Date(),
                  });
                  remindersCreated++;
                }
              }
            } else {
              console.log(`[Automation] Skipping document expiry notification - no valid recipient for ${doc.entityType}:${doc.entityId}`);
            }
          }
        }
      }

      console.log(`[Automation] Document expiry check complete: ${remindersCreated} reminders created`);
    } catch (error) {
      console.error('[Automation] Document expiry job failed:', error);
    }
  });

  // Job 3: Contract Expiry Check (9 AM daily)
  // Creates reminders for contracts expiring in 7 days
  const contractExpiryJob = cron.schedule('0 9 * * *', async () => {
    console.log('[Automation] Starting contract expiry check...');
    try {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const allContracts = await storage.getAllContracts();
      const contracts = allContracts.filter(c => c.status === 'active');
      let remindersCreated = 0;

      for (const contract of contracts) {
        const endDate = new Date(contract.rentalEndDate);
        
        // Check if contract expires in 7 days
        if (endDate <= sevenDaysFromNow && endDate > new Date()) {
          // Check if reminder already sent
          const existingReminders = await storage.getAutomatedReminders({
            entityType: 'contract',
            entityId: contract.id,
          });

          const hasRecentReminder = existingReminders.some(r => 
            r.reminderType === 'contract_expiry' &&
            r.isSent &&
            new Date(r.sentTime || 0).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000) // Sent in last 7 days
          );

          if (!hasRecentReminder) {
            const customer = await storage.getCustomerById(contract.customerId);
            const vehicle = await storage.getVehicleById(contract.vehicleId);
            
            if (customer && vehicle) {
              // Send notification using NotificationService
              const result = await notificationService.sendNotification({
                templateCode: 'CONTRACT_EXPIRY_REMINDER',
                channel: 'both',
                recipientType: 'customer',
                recipientId: customer.id,
                variables: {
                  contractNumber: contract.contractNumber.toString(),
                  customerName: customer.nameEn || '',
                  vehicleMake: vehicle.make || '',
                  vehicleModel: vehicle.model || '',
                  vehicleRegistration: vehicle.registration || '',
                  endDate: endDate.toLocaleDateString('en-AE'),
                  daysUntilExpiry: Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)).toString(),
                },
                language: 'en',
                triggerType: 'automated',
                triggeredBy: 'system',
              });

              if (result.success) {
                // Create reminder record for tracking
                const template = await storage.getNotificationTemplateByCode('CONTRACT_EXPIRY_REMINDER');
                if (template) {
                  await storage.createAutomatedReminder({
                    entityType: 'contract',
                    entityId: contract.id,
                    reminderType: 'contract_expiry',
                    reminderDate: endDate,
                    templateId: template.id,
                    messageTemplate: `Contract ${contract.contractNumber} expiring on ${endDate.toLocaleDateString()}`,
                    recipientEmail: customer.email,
                    recipientPhone: customer.phone,
                    isSent: true,
                    sentTime: new Date(),
                  });
                  remindersCreated++;
                }
              }
            }
          }
        }
      }

      console.log(`[Automation] Contract expiry check complete: ${remindersCreated} reminders created`);
    } catch (error) {
      console.error('[Automation] Contract expiry job failed:', error);
    }
  });

  // Job 4: Payment Due Reminders (10 AM daily)
  // Sends reminders for overdue payments
  const paymentReminderJob = cron.schedule('0 10 * * *', async () => {
    console.log('[Automation] Starting payment reminder check...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get all active contracts
      const allContracts = await storage.getAllContracts();
      const contracts = allContracts.filter(c => c.status === 'active');
      let remindersCreated = 0;

      for (const contract of contracts) {
        // Check if payment is overdue (outstanding balance exists)
        const startDate = new Date(contract.rentalStartDate);
        const outstandingAmount = parseFloat(contract.outstandingBalance || '0');
        if (startDate <= today && outstandingAmount > 0) {
          const overdueAmount = outstandingAmount;

          // Check if reminder already sent recently
          const existingReminders = await storage.getAutomatedReminders({
            entityType: 'contract',
            entityId: contract.id,
          });

          const hasRecentReminder = existingReminders.some(r => 
            r.reminderType === 'payment_overdue' &&
            r.isSent &&
            new Date(r.sentTime || 0).getTime() > Date.now() - (3 * 24 * 60 * 60 * 1000) // Sent in last 3 days
          );

          if (!hasRecentReminder) {
            const customer = await storage.getCustomerById(contract.customerId);
            
            if (customer) {
              // Send notification using NotificationService
              const result = await notificationService.sendNotification({
                templateCode: 'PAYMENT_OVERDUE_ALERT',
                channel: 'both',
                recipientType: 'customer',
                recipientId: customer.id,
                variables: {
                  contractNumber: contract.contractNumber.toString(),
                  customerName: customer.nameEn || '',
                  overdueAmount: overdueAmount.toFixed(2),
                  paymentUrl: `https://app.rccms.ae/contracts/${contract.id}/payment`,
                },
                language: 'en',
                triggerType: 'automated',
                triggeredBy: 'system',
              });

              if (result.success) {
                // Create reminder record for tracking
                const template = await storage.getNotificationTemplateByCode('PAYMENT_OVERDUE_ALERT');
                if (template) {
                  await storage.createAutomatedReminder({
                    entityType: 'contract',
                    entityId: contract.id,
                    reminderType: 'payment_overdue',
                    reminderDate: today,
                    templateId: template.id,
                    messageTemplate: `Payment overdue for contract ${contract.contractNumber}: AED ${overdueAmount}`,
                    recipientEmail: customer.email,
                    recipientPhone: customer.phone,
                    isSent: true,
                    sentTime: new Date(),
                  });
                  remindersCreated++;
                }
              }
            }
          }
        }
      }

      console.log(`[Automation] Payment reminder check complete: ${remindersCreated} reminders created`);
    } catch (error) {
      console.error('[Automation] Payment reminder job failed:', error);
    }
  });

  // Store jobs for cleanup
  activeJobs.push(riskScoreJob, documentExpiryJob, contractExpiryJob, paymentReminderJob);

  isInitialized = true;
  console.log('[Automation] ✓ Automation Orchestrator initialized successfully');
  console.log('[Automation] Active cron jobs:');
  console.log('  - Nightly Risk Score Calculation: 2:00 AM daily');
  console.log('  - Document Expiry Check: 8:00 AM daily');
  console.log('  - Contract Expiry Reminders: 9:00 AM daily');
  console.log('  - Payment Due Reminders: 10:00 AM daily');
}

/**
 * Stop all automation jobs (for graceful shutdown)
 */
export function stopAutomationOrchestrator() {
  console.log('[Automation] Stopping automation jobs...');
  activeJobs.forEach(job => job.stop());
  activeJobs.length = 0;
  isInitialized = false;
  console.log('[Automation] All jobs stopped');
}

/**
 * Manual trigger for risk score calculation (for testing/admin use)
 */
export async function triggerRiskScoreCalculation(): Promise<{ processed: number; errors: number }> {
  console.log('[Automation] Manual risk score calculation triggered');
  const customers = await storage.getCustomers();
  let processed = 0;
  let errors = 0;

  for (const customer of customers) {
    try {
      const riskScore = await riskCalculator.calculateCustomerRisk(customer.id);
      await storage.createCustomerRiskScore({
        customerId: customer.id,
        riskScore: riskScore.score,
        riskCategory: riskScore.level,
        paymentHistory: riskScore.paymentScore,
        contractViolations: riskScore.violationScore,
        accidentHistory: riskScore.incidentScore,
        finesHistory: riskScore.violationScore,
        licenseValidity: riskScore.documentScore,
        identityVerification: riskScore.documentScore,
        outstandingBalance: '0',
        blacklistStatus: false,
        calculatedBy: 'system',
      });
      processed++;
    } catch (error) {
      console.error(`Error calculating risk for customer ${customer.id}:`, error);
      errors++;
    }
  }

  return { processed, errors };
}
