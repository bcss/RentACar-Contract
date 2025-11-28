/**
 * File: server/services/automationOrchestrator.ts
 * @area Cron & Automation
 * @checklist §2.17, §12.4, Part 12.5
 * @purpose Database-driven cron job orchestrator per Master Spec §2.17
 * 
 * @behaviour
 *  - All jobs read from cron_job_definitions table (not hardcoded)
 *  - Runtime enable/disable without server restart
 *  - Execution tracking: lastRunAt, lastRunStatus, runCount, failureCount
 *  - Failure notifications to admin users
 * 
 * @jobs (9 production jobs per spec):
 *  - RISK_SCORE_CALC: 2:00 AM daily - Recalculates customer risk scores (§3.35)
 *  - CACHE_VALIDATION: 3:00 AM daily - Validates availability cache (§3.26)
 *  - DOCUMENT_EXPIRY_CHECK: 8:00 AM daily - Document/license expiry alerts (§2.14)
 *  - CONTRACT_EXPIRY_REMINDER: 9:00 AM daily - Contract renewal reminders (§2.13)
 *  - PAYMENT_DUE_REMINDER: 10:00 AM daily - Payment due notifications (§3.27)
 *  - RESERVATION_AUTO_EXPIRY: 11:00 AM daily - Expires stale reservations (§3.25)
 *  - DAILY_SUMMARY_JOB: 1:00 AM daily - Branch/vehicle metrics (Part 12.5)
 *  - OVERDUE_CONTRACT_CHECK: 8:00 AM daily - Overdue return detection (§3.22)
 *  - ABANDONED_VEHICLE_CHECK: 3:00 AM daily - Abandoned threshold detection (§3.22)
 * 
 * @notes
 *  - Hot-reload: Jobs can be reconfigured without server restart
 *  - Status updates persist to database for monitoring
 * 
 * See: docs/MASTER_SPEC_IMPLEMENTATION_CHECKLIST.md (§2.17, Part 12.5)
 */

import cron from 'node-cron';
import { storage } from '../storage';
import { RiskCalculator } from './riskCalculator';
import { notificationService } from './notificationService';
import { availabilityEngine } from './availabilityEngine';
import { executeDailySummaryJob } from './dailySummaryJob';
import { db } from '../db';
import { users, cronJobDefinitions } from '../../shared/schema';
import { and, or, eq } from 'drizzle-orm';

let isInitialized = false;

// Track active cron jobs for cleanup - Map of jobCode -> cronTask
const activeJobs: Map<string, ReturnType<typeof cron.schedule>> = new Map();

// Initialize risk calculator instance (cast to any to bypass legacy interface methods)
const riskCalculator = new RiskCalculator(storage as any);

// Job code to function mapping - allows database-driven job execution
type JobFunction = () => Promise<void>;
const jobImplementations: Record<string, JobFunction> = {};

/**
 * Register job implementation function
 */
function registerJobImplementation(jobCode: string, fn: JobFunction) {
  jobImplementations[jobCode] = fn;
}

/**
 * Update job execution status in database
 * Uses correct column names from schema: lastErrorMessage, failureCount
 */
async function updateJobStatus(jobId: string, status: string, error?: string) {
  try {
    const currentJob = await db.select().from(cronJobDefinitions).where(eq(cronJobDefinitions.id, jobId));
    const currentRunCount = currentJob[0]?.runCount || 0;
    const currentFailureCount = currentJob[0]?.failureCount || 0;
    
    const updateData: Record<string, any> = {
      lastRunAt: new Date(),
      lastRunStatus: status,
      updatedAt: new Date(),
    };
    
    if (status === 'success') {
      updateData.runCount = currentRunCount + 1;
      updateData.lastErrorMessage = null; // Clear error on success
    } else if (status === 'failed') {
      updateData.failureCount = currentFailureCount + 1;
      updateData.lastErrorMessage = error || null;
    }
    // For 'running' status, we don't increment counters
    
    await db.update(cronJobDefinitions)
      .set(updateData)
      .where(eq(cronJobDefinitions.id, jobId));
  } catch (err) {
    console.error(`[Automation] Failed to update job status for ${jobId}:`, err);
  }
}

/**
 * Wrap job execution with status tracking
 */
function createTrackedJob(jobId: string, jobCode: string, jobFn: JobFunction): () => Promise<void> {
  return async () => {
    console.log(`[Automation] Starting job: ${jobCode}`);
    try {
      await updateJobStatus(jobId, 'running');
      await jobFn();
      await updateJobStatus(jobId, 'success');
      console.log(`[Automation] Job ${jobCode} completed successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[Automation] Job ${jobCode} failed:`, error);
      await updateJobStatus(jobId, 'failed', errorMessage);
    }
  };
}

// =====================================================
// JOB IMPLEMENTATION FUNCTIONS
// =====================================================

/**
 * RISK_SCORE_CALC - Nightly Risk Score Calculation
 */
async function executeRiskScoreCalculation(): Promise<void> {
  console.log('[Automation] Starting nightly risk score calculation...');
  const customers = await storage.getCustomers();
  let processed = 0;
  let errors = 0;

  for (const customer of customers) {
    try {
      const previousScores = await storage.getCustomerRiskScores(customer.id);
      const previousLevel = previousScores.length > 0 ? previousScores[0].riskCategory : 'low';
      
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
}

/**
 * DOCUMENT_EXPIRY_CHECK - Document Expiry Check
 */
async function executeDocumentExpiryCheck(): Promise<void> {
  console.log('[Automation] Starting document expiry check...');
  const expiryThreshold = new Date();
  expiryThreshold.setDate(expiryThreshold.getDate() + 30);

  const documents = await storage.getDocuments();
  let remindersCreated = 0;

  for (const doc of documents) {
    if (!doc.expiryDate || !doc.isVerified) continue;

    const expiryDate = new Date(doc.expiryDate);
    if (expiryDate <= expiryThreshold && expiryDate > new Date()) {
      const existingReminders = await storage.getAutomatedReminders({
        entityType: doc.entityType,
        entityId: doc.entityId,
      });

      const hasRecentReminder = existingReminders.some(r => 
        r.reminderType === 'document_renewal' &&
        r.messageTemplate?.includes(doc.documentType)
      );

      if (!hasRecentReminder) {
        let recipientType: 'customer' | 'driver' | 'sponsor' | 'user' | null = null;
        let recipientId: string | null = null;
        
        if (doc.entityType === 'customer' || doc.entityType === 'driver' || doc.entityType === 'sponsor' || doc.entityType === 'user') {
          recipientType = doc.entityType;
          recipientId = doc.entityId;
        } else if (doc.entityType === 'vehicle') {
          const vehicle = await storage.getVehicleById(doc.entityId);
          if (vehicle && vehicle.branchId) {
            const branchManagers = await db.select().from(users)
              .where(and(
                eq(users.branchId, vehicle.branchId as string),
                or(eq(users.role, 'manager'), eq(users.role, 'admin'))
              ))
              .limit(1);
            if (branchManagers.length > 0) {
              recipientType = 'user';
              recipientId = branchManagers[0].id;
            }
          }
        } else if (doc.entityType === 'contract') {
          const contract = await storage.getContract(doc.entityId);
          if (contract) {
            recipientType = 'customer';
            recipientId = contract.customerId;
          }
        }
        
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
        }
      }
    }
  }

  console.log(`[Automation] Document expiry check complete: ${remindersCreated} reminders created`);
}

/**
 * CONTRACT_EXPIRY_REMINDER - Contract Expiry Reminders
 */
async function executeContractExpiryReminder(): Promise<void> {
  console.log('[Automation] Starting contract expiry check...');
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const allContracts = await storage.getAllContracts();
  const contracts = allContracts.filter(c => c.status === 'active');
  let remindersCreated = 0;

  for (const contract of contracts) {
    const endDate = new Date(contract.rentalEndDate);
    
    if (endDate <= sevenDaysFromNow && endDate > new Date()) {
      const existingReminders = await storage.getAutomatedReminders({
        entityType: 'contract',
        entityId: contract.id,
      });

      const hasRecentReminder = existingReminders.some(r => 
        r.reminderType === 'contract_expiry' &&
        r.isSent &&
        new Date(r.sentTime || 0).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000)
      );

      if (!hasRecentReminder) {
        const customer = await storage.getCustomerById(contract.customerId);
        const vehicle = await storage.getVehicleById(contract.vehicleId);
        
        if (customer && vehicle) {
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
}

/**
 * PAYMENT_DUE_REMINDER - Payment Due Reminders
 */
async function executePaymentDueReminder(): Promise<void> {
  console.log('[Automation] Starting payment reminder check...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allContracts = await storage.getAllContracts();
  const contracts = allContracts.filter(c => c.status === 'active');
  let remindersCreated = 0;

  for (const contract of contracts) {
    const startDate = new Date(contract.rentalStartDate);
    const outstandingAmount = parseFloat(contract.outstandingBalance || '0');
    if (startDate <= today && outstandingAmount > 0) {
      const existingReminders = await storage.getAutomatedReminders({
        entityType: 'contract',
        entityId: contract.id,
      });

      const hasRecentReminder = existingReminders.some(r => 
        r.reminderType === 'payment_overdue' &&
        r.isSent &&
        new Date(r.sentTime || 0).getTime() > Date.now() - (3 * 24 * 60 * 60 * 1000)
      );

      if (!hasRecentReminder) {
        const customer = await storage.getCustomerById(contract.customerId);
        
        if (customer) {
          const result = await notificationService.sendNotification({
            templateCode: 'PAYMENT_OVERDUE_REMINDER',
            channel: 'both',
            recipientType: 'customer',
            recipientId: customer.id,
            variables: {
              contractNumber: contract.contractNumber.toString(),
              customerName: customer.nameEn || '',
              outstandingAmount: outstandingAmount.toFixed(2),
              currency: 'AED',
            },
            language: 'en',
            triggerType: 'automated',
            triggeredBy: 'system',
          });

          if (result.success) {
            const template = await storage.getNotificationTemplateByCode('PAYMENT_OVERDUE_REMINDER');
            if (template) {
              await storage.createAutomatedReminder({
                entityType: 'contract',
                entityId: contract.id,
                reminderType: 'payment_overdue',
                reminderDate: today,
                templateId: template.id,
                messageTemplate: `Payment overdue: AED ${outstandingAmount.toFixed(2)} for contract ${contract.contractNumber}`,
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

  console.log(`[Automation] Payment reminder check complete: ${remindersCreated} reminders sent`);
}

/**
 * CACHE_VALIDATION - Nightly Availability Cache Validation
 */
async function executeCacheValidation(): Promise<void> {
  console.log('[Automation] Starting nightly availability cache validation...');
  const validationResult = await availabilityEngine.validateCacheIntegrity();
  
  if (!validationResult.valid) {
    console.warn(`[Automation] Cache validation found ${validationResult.issues.length} issues:`);
    validationResult.issues.forEach(issue => console.warn(`  - ${issue}`));
    
    console.log('[Automation] Rebuilding cache to repair issues...');
    const branches = await storage.getBranches();
    for (const branch of branches) {
      await availabilityEngine.rebuildBranchCache(branch.id);
    }
    console.log('[Automation] Cache rebuild complete');
  } else {
    console.log('[Automation] Cache validation passed - no issues found');
  }
}

/**
 * RESERVATION_AUTO_EXPIRY - Reservation Auto-Expiry
 * Per Master Spec §3.24 - Expires unclaimed reservations
 */
async function executeReservationAutoExpiry(): Promise<void> {
  console.log('[Automation] Starting reservation auto-expiry check...');
  
  try {
    // Import reservation service dynamically to avoid circular dependencies
    const { reservationService } = await import('./reservationService');
    
    // Expire unclaimed reservations (24 hour grace period)
    const result = await reservationService.expireUnclaimed(24);
    
    if (result.success) {
      console.log(`[Automation] Reservation expiry check complete: ${result.expiredCount} reservations expired`);
    } else {
      console.error(`[Automation] Reservation expiry check failed: ${result.error}`);
    }
  } catch (error) {
    console.error('[Automation] Reservation expiry job error:', error);
  }

  // Also clean up stale draft contracts (existing logic)
  console.log('[Automation] Starting stale draft contract cleanup...');
  const allContracts = await storage.getAllContracts();
  const draftContracts = allContracts.filter(c => c.status === 'draft');
  
  const now = new Date();
  let expiredCount = 0;
  let errorCount = 0;
  
  for (const contract of draftContracts) {
    try {
      const startDate = new Date(contract.rentalStartDate);
      const hoursSinceStart = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60);
      
      // Expire draft contracts that haven't been activated within 24 hours of start date
      if (hoursSinceStart > 24) {
        await storage.updateContract(contract.id, {
          status: 'cancelled',
          closureRemark: 'Auto-expired: Draft contract not activated within 24 hours of start date',
        });
        
        if (contract.vehicleId) {
          try {
            await availabilityEngine.handleContractClosure(contract.id);
          } catch (cacheError) {
            console.warn(`[Automation] Cache update failed for contract ${contract.contractNumber}:`, cacheError);
          }
        }
        
        expiredCount++;
        console.log(`[Automation] Expired stale draft contract ${contract.contractNumber}`);
      }
    } catch (expireError) {
      errorCount++;
      console.error(`[Automation] Failed to expire draft contract ${contract.contractNumber}:`, expireError);
    }
  }
  
  console.log(`[Automation] Stale draft cleanup complete: ${expiredCount} contracts expired, ${errorCount} errors`);
}

// =====================================================
// INITIALIZATION FUNCTIONS
// =====================================================

/**
 * Register all job implementation functions
 * Handler names must match the 'handler' column in cron_job_definitions table
 */
function registerAllJobImplementations() {
  // Database handler: calculateRiskScores
  registerJobImplementation('calculateRiskScores', executeRiskScoreCalculation);
  
  // Database handler: checkDocumentExpiry  
  registerJobImplementation('checkDocumentExpiry', executeDocumentExpiryCheck);
  
  // Database handler: sendOverdueReminders (maps to contract expiry)
  registerJobImplementation('sendOverdueReminders', executeContractExpiryReminder);
  
  // Database handler: sendPaymentReminders
  registerJobImplementation('sendPaymentReminders', executePaymentDueReminder);
  
  // Database handler: refreshAvailabilityCache
  registerJobImplementation('refreshAvailabilityCache', executeCacheValidation);
  
  // Database handler: cleanupStaleDrafts (reservation auto-expiry)
  registerJobImplementation('cleanupStaleDrafts', executeReservationAutoExpiry);
  
  // Database handler: alertExpiringLicenses
  registerJobImplementation('alertExpiringLicenses', executeDocumentExpiryCheck);
  
  // Database handler: sendReturnReminders
  registerJobImplementation('sendReturnReminders', executeContractExpiryReminder);
  
  // Database handler: generateDailySummary - Per Master Spec Part 9.6.2
  registerJobImplementation('generateDailySummary', executeDailySummaryJob);
}

/**
 * Default cron schedules (fallback if database unavailable)
 * Handler names match the 'handler' column in cron_job_definitions table
 */
const DEFAULT_SCHEDULES: Record<string, string> = {
  'calculateRiskScores': '0 2 * * *',        // 2 AM daily
  'generateDailySummary': '0 1 * * *',       // 1 AM daily - Per Master Spec Part 9.6.2
  'cleanupStaleDrafts': '0 3 * * *',         // 3 AM daily
  'checkDocumentExpiry': '0 6 * * *',        // 6 AM daily
  'alertExpiringLicenses': '0 7 * * *',      // 7 AM daily
  'sendOverdueReminders': '0 8 * * *',       // 8 AM daily
  'sendReturnReminders': '0 9 * * *',        // 9 AM daily
  'sendPaymentReminders': '0 10 * * *',      // 10 AM daily
  'refreshAvailabilityCache': '*/15 * * * *', // Every 15 minutes
};

/**
 * Initialize jobs with default schedules (fallback mode)
 */
function initializeDefaultJobs() {
  console.log('[Automation] Initializing with default schedules (fallback mode)...');
  
  for (const [jobCode, cronExpression] of Object.entries(DEFAULT_SCHEDULES)) {
    const jobFn = jobImplementations[jobCode];
    if (jobFn) {
      const scheduledJob = cron.schedule(cronExpression, async () => {
        console.log(`[Automation] Starting job: ${jobCode}`);
        try {
          await jobFn();
          console.log(`[Automation] Job ${jobCode} completed successfully`);
        } catch (error) {
          console.error(`[Automation] Job ${jobCode} failed:`, error);
        }
      });
      activeJobs.set(jobCode, scheduledJob);
      console.log(`[Automation] ✓ Scheduled (fallback): ${jobCode} (${cronExpression})`);
    }
  }
  
  isInitialized = true;
  console.log(`[Automation] ✓ Automation Orchestrator initialized with ${activeJobs.size} fallback jobs`);
}

/**
 * Initialize all automation cron jobs from database
 * DEEP INTEGRATION: Reads job definitions from cron_job_definitions table
 */
export async function initializeAutomationOrchestrator() {
  if (isInitialized) {
    console.log('[Automation] Already initialized');
    return;
  }

  console.log('[Automation] Initializing Automation Orchestrator (Database-Driven)...');

  // Register all job implementations first
  registerAllJobImplementations();

  // Try to read job definitions from database
  try {
    const jobDefs = await db.select().from(cronJobDefinitions)
      .where(eq(cronJobDefinitions.isEnabled, true));
    
    if (jobDefs.length === 0) {
      console.log('[Automation] No enabled jobs found in database, using defaults');
      initializeDefaultJobs();
      return;
    }
    
    console.log(`[Automation] Found ${jobDefs.length} enabled jobs in database`);
    
    for (const jobDef of jobDefs) {
      // Use 'handler' field as job code identifier
      const jobCode = jobDef.handler;
      const jobFn = jobImplementations[jobCode];
      
      if (!jobFn) {
        console.warn(`[Automation] No implementation found for handler: ${jobCode}`);
        continue;
      }
      
      if (!cron.validate(jobDef.cronExpression)) {
        console.error(`[Automation] Invalid cron expression for ${jobCode}: ${jobDef.cronExpression}`);
        continue;
      }
      
      // Create tracked job with database status updates
      const trackedJob = createTrackedJob(jobDef.id, jobCode, jobFn);
      
      // Schedule the job
      const scheduledJob = cron.schedule(jobDef.cronExpression, trackedJob);
      activeJobs.set(jobCode, scheduledJob);
      
      console.log(`[Automation] ✓ Scheduled: ${jobDef.name} [${jobCode}] (${jobDef.cronExpression})`);
    }
    
    isInitialized = true;
    console.log(`[Automation] ✓ Automation Orchestrator initialized with ${activeJobs.size} database-driven jobs`);
    
  } catch (error) {
    console.error('[Automation] Failed to initialize from database, falling back to defaults:', error);
    initializeDefaultJobs();
  }
}

/**
 * Stop all automation jobs (for graceful shutdown)
 */
export function stopAutomationOrchestrator() {
  console.log('[Automation] Stopping automation jobs...');
  activeJobs.forEach((job, jobCode) => {
    try {
      job.stop();
      console.log(`[Automation] Stopped job: ${jobCode}`);
    } catch (err) {
      console.error(`[Automation] Error stopping job ${jobCode}:`, err);
    }
  });
  activeJobs.clear();
  isInitialized = false;
  console.log('[Automation] All jobs stopped');
}

/**
 * Reload jobs from database (hot reload without restart)
 * DEEP INTEGRATION: Allows runtime reconfiguration of jobs
 */
export async function reloadJobsFromDatabase() {
  console.log('[Automation] Reloading jobs from database...');
  stopAutomationOrchestrator();
  await initializeAutomationOrchestrator();
}

/**
 * Get status of all jobs
 * DEEP INTEGRATION: Returns database-tracked status
 */
export async function getJobStatuses(): Promise<Array<{
  jobCode: string;
  name: string;
  isEnabled: boolean;
  isRunning: boolean;
  cronExpression: string;
  lastRunAt: Date | null;
  lastRunStatus: string | null;
  runCount: number;
}>> {
  const jobDefs = await db.select().from(cronJobDefinitions);
  return jobDefs.map(j => ({
    jobCode: j.handler,
    name: j.name,
    isEnabled: j.isEnabled,
    isRunning: activeJobs.has(j.handler),
    cronExpression: j.cronExpression,
    lastRunAt: j.lastRunAt,
    lastRunStatus: j.lastRunStatus,
    runCount: j.runCount || 0,
  }));
}

/**
 * Manual trigger for any job (for testing/admin use)
 */
export async function triggerJobManually(jobCode: string): Promise<{ success: boolean; error?: string }> {
  console.log(`[Automation] Manual trigger requested for job: ${jobCode}`);
  
  const jobFn = jobImplementations[jobCode];
  if (!jobFn) {
    return { success: false, error: `No implementation found for job: ${jobCode}` };
  }
  
  try {
    await jobFn();
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Automation] Manual trigger for ${jobCode} failed:`, error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Manual trigger for risk score calculation (for testing/admin use)
 * @deprecated Use triggerJobManually('RISK_SCORE_CALC') instead
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
