/**
 * Maintenance Service - Deep Integration with maintenance_jobs Lookup Table
 * 
 * Per Master Spec Part 4.11.2 - Maintenance workflow is managed through
 * the maintenance_jobs lookup table with proper status transitions.
 * 
 * This service provides:
 * - Maintenance job lifecycle management (pending → scheduled → in_progress → completed)
 * - Vehicle status synchronization (sets vehicle to 'maintenance' when job starts)
 * - Service record creation on job completion (links to vehicleServiceRecords)
 * - Cost tracking and vendor management
 * - Priority-based job queuing
 */

import { db } from '../db';
import { 
  maintenanceJobs, vehicles, vehicleServiceRecords, branches, users, sequences 
} from '@shared/schema';
import { eq, and, inArray, desc, asc, isNull, or, gte, lte, sql } from 'drizzle-orm';
import type { MaintenanceJob, InsertMaintenanceJob, VehicleServiceRecord } from '@shared/schema';

// Valid status transitions for maintenance jobs
const VALID_TRANSITIONS: Record<string, string[]> = {
  'pending': ['scheduled', 'cancelled'],
  'scheduled': ['in_progress', 'pending', 'cancelled'],
  'in_progress': ['on_hold', 'completed', 'cancelled'],
  'on_hold': ['in_progress', 'cancelled'],
  'completed': [], // Terminal state
  'cancelled': [], // Terminal state
};

// Statuses that block the vehicle from being rented
const BLOCKING_STATUSES = ['scheduled', 'in_progress', 'on_hold'];

export interface CreateMaintenanceJobParams {
  vehicleId: string;
  branchId: string;
  jobType: string;
  priority?: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  reportedIssues?: string[];
  plannedStartDate?: Date;
  plannedEndDate?: Date;
  assignedTo?: string;
  linkedIncidentId?: string;
  linkedContractId?: string;
  createdBy: string;
}

export interface UpdateMaintenanceJobParams {
  status?: string;
  diagnosedIssues?: string[];
  partsRequired?: { partName: string; quantity: number; cost: number }[];
  laborCost?: string;
  partsCost?: string;
  vendorId?: string;
  vendorName?: string;
  vendorInvoice?: string;
  odometerAtJob?: number;
  plannedStartDate?: Date;
  plannedEndDate?: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  assignedTo?: string;
  completedBy?: string;
  completionNotes?: string;
  qualityCheckPassed?: boolean;
  qualityCheckBy?: string;
}

/**
 * Generate next maintenance job number using sequences table with ATOMIC increment
 * Uses UPDATE...RETURNING to ensure unique numbers even under concurrent requests
 */
async function generateJobNumber(): Promise<string> {
  try {
    const year = new Date().getFullYear();
    
    // ATOMIC: Single UPDATE...RETURNING guarantees unique sequential numbers
    // Uses sequenceType='maintenance' to match the sequences table schema
    const [updated] = await db
      .update(sequences)
      .set({ 
        currentValue: sql`${sequences.currentValue} + 1`,
        updatedAt: new Date() 
      })
      .where(and(
        eq(sequences.sequenceType, 'maintenance'),
        eq(sequences.isActive, true)
      ))
      .returning();
    
    if (updated) {
      const padded = String(updated.currentValue).padStart(updated.paddingLength || 6, '0');
      return `${updated.prefix}${updated.includeYear ? year : ''}${padded}`;
    }
    
    // Sequence doesn't exist - create it atomically and return first number
    const [newSeq] = await db.insert(sequences).values({
      sequenceType: 'maintenance',
      prefix: 'MNT-',
      currentValue: 1,
      incrementBy: 1,
      paddingLength: 6,
      includeYear: true,
      yearFormat: 'YYYY',
      isActive: true,
    }).onConflictDoNothing().returning();
    
    if (newSeq) {
      const padded = String(newSeq.currentValue).padStart(6, '0');
      return `${newSeq.prefix}${year}${padded}`;
    }
    
    // Race condition on insert - another request created it, retry the atomic update
    const [retryUpdate] = await db
      .update(sequences)
      .set({ 
        currentValue: sql`${sequences.currentValue} + 1`,
        updatedAt: new Date() 
      })
      .where(and(
        eq(sequences.sequenceType, 'maintenance'),
        eq(sequences.isActive, true)
      ))
      .returning();
    
    if (retryUpdate) {
      const padded = String(retryUpdate.currentValue).padStart(retryUpdate.paddingLength || 6, '0');
      return `${retryUpdate.prefix}${retryUpdate.includeYear ? year : ''}${padded}`;
    }
    
    // Final fallback using timestamp for uniqueness
    const timestamp = Date.now().toString().slice(-8);
    return `MNT-${year}-${timestamp}`;
  } catch (error) {
    console.error('[MaintenanceService] Error generating job number:', error);
    const timestamp = Date.now().toString().slice(-8);
    return `MNT-${new Date().getFullYear()}-${timestamp}`;
  }
}

/**
 * Create a new maintenance job
 */
export async function createMaintenanceJob(
  params: CreateMaintenanceJobParams
): Promise<MaintenanceJob> {
  const jobNumber = await generateJobNumber();
  
  const [job] = await db
    .insert(maintenanceJobs)
    .values({
      vehicleId: params.vehicleId,
      branchId: params.branchId,
      jobNumber,
      jobType: params.jobType,
      priority: params.priority || 'normal',
      status: 'pending',
      title: params.title,
      titleAr: params.titleAr,
      description: params.description,
      descriptionAr: params.descriptionAr,
      reportedIssues: params.reportedIssues || [],
      plannedStartDate: params.plannedStartDate,
      plannedEndDate: params.plannedEndDate,
      assignedTo: params.assignedTo,
      linkedIncidentId: params.linkedIncidentId,
      linkedContractId: params.linkedContractId,
      createdBy: params.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  
  console.log(`[MaintenanceService] Created job ${jobNumber} for vehicle ${params.vehicleId}`);
  return job;
}

/**
 * Get maintenance job by ID
 */
export async function getMaintenanceJob(jobId: string): Promise<MaintenanceJob | null> {
  const [job] = await db
    .select()
    .from(maintenanceJobs)
    .where(eq(maintenanceJobs.id, jobId));
  
  return job || null;
}

/**
 * Get active maintenance jobs for a vehicle
 */
export async function getActiveJobsForVehicle(vehicleId: string): Promise<MaintenanceJob[]> {
  return db
    .select()
    .from(maintenanceJobs)
    .where(
      and(
        eq(maintenanceJobs.vehicleId, vehicleId),
        inArray(maintenanceJobs.status, ['pending', 'scheduled', 'in_progress', 'on_hold'])
      )
    )
    .orderBy(asc(maintenanceJobs.priority), asc(maintenanceJobs.plannedStartDate));
}

/**
 * Get jobs for a branch with optional filters
 */
export async function getJobsForBranch(
  branchId: string,
  options?: {
    status?: string | string[];
    priority?: string;
    jobType?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }
): Promise<MaintenanceJob[]> {
  const conditions = [eq(maintenanceJobs.branchId, branchId)];
  
  if (options?.status) {
    const statuses = Array.isArray(options.status) ? options.status : [options.status];
    conditions.push(inArray(maintenanceJobs.status, statuses));
  }
  
  if (options?.priority) {
    conditions.push(eq(maintenanceJobs.priority, options.priority));
  }
  
  if (options?.jobType) {
    conditions.push(eq(maintenanceJobs.jobType, options.jobType));
  }
  
  if (options?.dateFrom) {
    conditions.push(gte(maintenanceJobs.plannedStartDate, options.dateFrom));
  }
  
  if (options?.dateTo) {
    conditions.push(lte(maintenanceJobs.plannedEndDate, options.dateTo));
  }
  
  return db
    .select()
    .from(maintenanceJobs)
    .where(and(...conditions))
    .orderBy(
      desc(sql`CASE priority 
        WHEN 'critical' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'normal' THEN 3 
        WHEN 'low' THEN 4 
        ELSE 5 END`),
      asc(maintenanceJobs.plannedStartDate)
    );
}

/**
 * Update maintenance job with status transition validation
 */
export async function updateMaintenanceJob(
  jobId: string,
  params: UpdateMaintenanceJobParams,
  updatedBy: string
): Promise<MaintenanceJob> {
  // Get current job
  const currentJob = await getMaintenanceJob(jobId);
  if (!currentJob) {
    throw new Error('Maintenance job not found');
  }
  
  // Validate status transition if status is being changed
  if (params.status && params.status !== currentJob.status) {
    const validNextStatuses = VALID_TRANSITIONS[currentJob.status] || [];
    if (!validNextStatuses.includes(params.status)) {
      throw new Error(`Invalid status transition: ${currentJob.status} → ${params.status}`);
    }
  }
  
  // Calculate total cost if parts or labor changed
  let totalCost = currentJob.totalCost;
  if (params.laborCost !== undefined || params.partsCost !== undefined) {
    const labor = parseFloat(params.laborCost || currentJob.laborCost || '0');
    const parts = parseFloat(params.partsCost || currentJob.partsCost || '0');
    totalCost = (labor + parts).toFixed(2);
  }
  
  // Build update object
  const updateData: Record<string, any> = {
    ...params,
    totalCost,
    updatedAt: new Date(),
  };
  
  // Handle status-specific updates
  if (params.status === 'in_progress' && !currentJob.actualStartDate) {
    updateData.actualStartDate = new Date();
    
    // Set vehicle to maintenance status
    await db
      .update(vehicles)
      .set({ 
        status: 'maintenance',
        updatedAt: new Date()
      })
      .where(eq(vehicles.id, currentJob.vehicleId));
    
    console.log(`[MaintenanceService] Set vehicle ${currentJob.vehicleId} to maintenance status`);
  }
  
  if (params.status === 'completed') {
    updateData.actualEndDate = new Date();
    updateData.completedBy = updatedBy;
    
    // Create service record for completed job
    await createServiceRecordFromJob(currentJob, {
      completionNotes: params.completionNotes,
      laborCost: params.laborCost || currentJob.laborCost,
      partsCost: params.partsCost || currentJob.partsCost,
      totalCost,
      odometerAtJob: params.odometerAtJob || currentJob.odometerAtJob,
    }, updatedBy);
    
    // Restore vehicle to available status if no other active jobs
    const otherActiveJobs = await db
      .select({ id: maintenanceJobs.id })
      .from(maintenanceJobs)
      .where(
        and(
          eq(maintenanceJobs.vehicleId, currentJob.vehicleId),
          inArray(maintenanceJobs.status, BLOCKING_STATUSES),
          sql`${maintenanceJobs.id} != ${jobId}`
        )
      );
    
    if (otherActiveJobs.length === 0) {
      await db
        .update(vehicles)
        .set({ 
          status: 'available',
          updatedAt: new Date()
        })
        .where(eq(vehicles.id, currentJob.vehicleId));
      
      console.log(`[MaintenanceService] Restored vehicle ${currentJob.vehicleId} to available status`);
    }
  }
  
  const [updated] = await db
    .update(maintenanceJobs)
    .set(updateData)
    .where(eq(maintenanceJobs.id, jobId))
    .returning();
  
  console.log(`[MaintenanceService] Updated job ${currentJob.jobNumber} status: ${currentJob.status} → ${updated.status}`);
  return updated;
}

/**
 * Create a service record from a completed maintenance job
 * Deep integration linking maintenance_jobs to vehicle_service_records
 */
async function createServiceRecordFromJob(
  job: MaintenanceJob,
  completionData: {
    completionNotes?: string;
    laborCost?: string | null;
    partsCost?: string | null;
    totalCost?: string | null;
    odometerAtJob?: number | null;
  },
  completedBy: string
): Promise<VehicleServiceRecord> {
  const serviceTypeMapping: Record<string, string> = {
    'scheduled': 'maintenance',
    'unscheduled': 'repair',
    'inspection': 'inspection',
    'repair': 'repair',
    'body_work': 'repair',
    'accident_repair': 'repair',
  };
  
  const [record] = await db
    .insert(vehicleServiceRecords)
    .values({
      vehicleId: job.vehicleId,
      serviceType: serviceTypeMapping[job.jobType] || 'maintenance',
      serviceDate: new Date(),
      odometerReading: completionData.odometerAtJob,
      serviceProvider: job.vendorName,
      description: `${job.title}${completionData.completionNotes ? `\n\n${completionData.completionNotes}` : ''}`,
      cost: completionData.totalCost,
      invoiceNumber: job.vendorInvoice,
      notes: `Maintenance Job: ${job.jobNumber}\nJob Type: ${job.jobType}\nDiagnosed Issues: ${(job.diagnosedIssues || []).join(', ')}`,
      createdBy: completedBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  
  console.log(`[MaintenanceService] Created service record ${record.id} from job ${job.jobNumber}`);
  return record;
}

/**
 * Check if a vehicle can be rented (no blocking maintenance jobs)
 */
export async function canVehicleBeRented(vehicleId: string): Promise<{
  canRent: boolean;
  blockingJobs: MaintenanceJob[];
}> {
  const blockingJobs = await db
    .select()
    .from(maintenanceJobs)
    .where(
      and(
        eq(maintenanceJobs.vehicleId, vehicleId),
        inArray(maintenanceJobs.status, BLOCKING_STATUSES)
      )
    );
  
  return {
    canRent: blockingJobs.length === 0,
    blockingJobs,
  };
}

/**
 * Get maintenance summary for dashboard
 */
export async function getMaintenanceSummary(branchId?: string): Promise<{
  pending: number;
  inProgress: number;
  onHold: number;
  completedToday: number;
  criticalPriority: number;
  overdueJobs: number;
}> {
  const conditions = branchId ? [eq(maintenanceJobs.branchId, branchId)] : [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const jobs = await db
    .select()
    .from(maintenanceJobs)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
  
  return {
    pending: jobs.filter(j => j.status === 'pending').length,
    inProgress: jobs.filter(j => j.status === 'in_progress').length,
    onHold: jobs.filter(j => j.status === 'on_hold').length,
    completedToday: jobs.filter(j => 
      j.status === 'completed' && 
      j.actualEndDate && 
      new Date(j.actualEndDate) >= today
    ).length,
    criticalPriority: jobs.filter(j => 
      j.priority === 'critical' && 
      !['completed', 'cancelled'].includes(j.status)
    ).length,
    overdueJobs: jobs.filter(j => 
      j.plannedEndDate && 
      new Date(j.plannedEndDate) < new Date() && 
      !['completed', 'cancelled'].includes(j.status)
    ).length,
  };
}

/**
 * Schedule pending jobs based on resource availability
 */
export async function scheduleJob(
  jobId: string,
  scheduledStart: Date,
  scheduledEnd: Date,
  assignedTo?: string
): Promise<MaintenanceJob> {
  return updateMaintenanceJob(jobId, {
    status: 'scheduled',
    plannedStartDate: scheduledStart,
    plannedEndDate: scheduledEnd,
    assignedTo,
  }, assignedTo || 'system');
}

/**
 * Start work on a scheduled job
 */
export async function startJob(jobId: string, startedBy: string): Promise<MaintenanceJob> {
  return updateMaintenanceJob(jobId, {
    status: 'in_progress',
    actualStartDate: new Date(),
    assignedTo: startedBy,
  }, startedBy);
}

/**
 * Complete a job with final details
 */
export async function completeJob(
  jobId: string,
  completedBy: string,
  details: {
    completionNotes?: string;
    laborCost?: string;
    partsCost?: string;
    odometerAtJob?: number;
    qualityCheckPassed?: boolean;
    qualityCheckBy?: string;
  }
): Promise<MaintenanceJob> {
  return updateMaintenanceJob(jobId, {
    status: 'completed',
    completedBy,
    completionNotes: details.completionNotes,
    laborCost: details.laborCost,
    partsCost: details.partsCost,
    odometerAtJob: details.odometerAtJob,
    qualityCheckPassed: details.qualityCheckPassed,
    qualityCheckBy: details.qualityCheckBy,
  }, completedBy);
}
