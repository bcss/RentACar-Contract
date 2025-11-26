/**
 * ContractLifecycleService - Per Master Spec §7.4
 * 
 * Central orchestrator for contract state transitions.
 * Enforces all business rules per Master Spec Part 3 workflows.
 * 
 * Responsibilities:
 * - createDraftContract(CreateContractDTO): Contract
 * - activateContract(ContractId, OTP): Contract (OTP-gated)
 * - completeContract(ContractId): Contract
 * - closeContract(ContractId, ClosingOTP?): Contract
 * - cancelContract(ContractId, reason): Contract
 * - extendContract(ContractId, NewEndDate, OTP?): Contract
 * - swapVehicle(ContractId, NewVehicleId, Reason): Contract
 * 
 * Domain Events Emitted:
 * - ContractCreated
 * - ContractActivated
 * - ContractCompleted
 * - ContractClosed
 * - ContractCancelled
 */

import { db } from "../db";
import { contracts, vehicles, vehicleInspections, payments, incidents, customers, branches, users, contractEdits, auditLogs } from "@shared/schema";
import { eq, and, sql, isNull, ne } from "drizzle-orm";
import { otpService } from "./otpService";
import { depositService } from "./depositService";
import { inspectionService } from "./inspectionService";
import { notificationService } from "./notificationService";
import { triggerNotification } from "./notificationTrigger";

// Contract statuses per Master Spec Part 2.4
export const ContractStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  COMPLETED_PENDING_ACCIDENT: 'completed_pending_accident',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
} as const;

export type ContractStatusType = typeof ContractStatus[keyof typeof ContractStatus];

// Vehicle statuses per Master Spec Part 3.18
export const VehicleStatus = {
  AVAILABLE: 'available',
  OUT: 'out',
  MAINTENANCE: 'maintenance',
  RESERVED: 'reserved',
  PENDING_INSPECTION: 'pending_inspection',
} as const;

// Domain Events per Master Spec §7.4
export interface DomainEvent {
  type: string;
  timestamp: Date;
  contractId: string;
  payload: Record<string, any>;
}

// Result types
export interface LifecycleResult {
  success: boolean;
  contract?: any;
  error?: string;
  warnings?: string[];
  events?: DomainEvent[];
}

// Command DTOs per Master Spec
export interface CreateContractCommand {
  branchId: string;
  customerId: string;
  vehicleId: string;
  tariffId?: string;
  partyType: 'DIRECT' | 'SPONSORED_INDIVIDUAL' | 'SPONSORED_COMPANY';
  sponsorId?: string;
  companyId?: string;
  companyContactId?: string;
  startDatetime: Date;
  endDatetime: Date;
  notes?: string;
  depositExpected?: number;
  createdBy: string;
}

export interface ActivateContractCommand {
  contractId: string;
  otp: string;
  activatedBy: string;
  activatedByRole?: string; // Required for deposit override authorization
  overrideDepositCheck?: boolean;
}

export interface CompleteContractCommand {
  contractId: string;
  completedBy: string;
  returnOdometer?: number;
  returnFuel?: string;
}

export interface CloseContractCommand {
  contractId: string;
  otp: string; // MANDATORY per Master Spec §3.11 - digital sign-off required
  closedBy: string;
  closedByRole?: string; // For authorization verification
  notes?: string;
}

export interface CancelContractCommand {
  contractId: string;
  reason: string;
  cancelledBy: string;
}

class ContractLifecycleService {
  /**
   * Per Master Spec §3.1 - Create Draft Contract
   * Contract enters DRAFT state. Vehicle not blocked yet.
   */
  async createDraftContract(command: CreateContractCommand): Promise<LifecycleResult> {
    const events: DomainEvent[] = [];
    const warnings: string[] = [];

    try {
      // Validate customer exists and is not blacklisted
      const customer = await db.query.customers.findFirst({
        where: eq(customers.id, command.customerId)
      });

      if (!customer) {
        return { success: false, error: 'Customer not found' };
      }

      if (customer.blacklistStatus === 'HARD') {
        return { success: false, error: 'Customer is hard-blacklisted and cannot create contracts' };
      }

      if (customer.blacklistStatus === 'SOFT') {
        warnings.push('Customer is soft-blacklisted - manager approval required');
      }

      // Validate vehicle exists and is available
      const vehicle = await db.query.vehicles.findFirst({
        where: eq(vehicles.id, command.vehicleId)
      });

      if (!vehicle) {
        return { success: false, error: 'Vehicle not found' };
      }

      if (vehicle.status !== VehicleStatus.AVAILABLE && vehicle.status !== VehicleStatus.RESERVED) {
        return { success: false, error: `Vehicle is not available (status: ${vehicle.status})` };
      }

      // Validate branch
      const branch = await db.query.branches.findFirst({
        where: eq(branches.id, command.branchId)
      });

      if (!branch) {
        return { success: false, error: 'Branch not found' };
      }

      // Calculate deposit if not provided
      let depositExpected = command.depositExpected;
      if (!depositExpected) {
        // Use default from settings or tariff
        depositExpected = 1000; // Default 1000 AED per spec
      }

      // Generate contract number from sequence
      const contractNumber = await this.generateContractNumber(command.branchId);

      // Create contract in DRAFT state
      const [contract] = await db.insert(contracts).values({
        contractNumber,
        branchId: command.branchId,
        customerId: command.customerId,
        vehicleId: command.vehicleId,
        tariffId: command.tariffId,
        partyType: command.partyType,
        sponsorId: command.sponsorId,
        companyId: command.companyId,
        companyContactId: command.companyContactId,
        startDatetime: command.startDatetime,
        endDatetime: command.endDatetime,
        status: ContractStatus.DRAFT,
        depositRequired: depositExpected,
        depositReceived: '0',
        depositRefunded: '0',
        totalCharges: '0',
        outstandingAmount: '0',
        version: 1,
        notes: command.notes,
        createdBy: command.createdBy,
      }).returning();

      // Emit ContractCreated event
      events.push({
        type: 'ContractCreated',
        timestamp: new Date(),
        contractId: contract.id,
        payload: {
          contractNumber: contract.contractNumber,
          customerId: command.customerId,
          vehicleId: command.vehicleId,
          branchId: command.branchId,
        }
      });

      // Create audit log
      await this.createAuditLog(contract.id, 'CONTRACT_CREATED', command.createdBy, {
        status: ContractStatus.DRAFT,
        partyType: command.partyType,
      });

      return {
        success: true,
        contract,
        warnings: warnings.length > 0 ? warnings : undefined,
        events
      };
    } catch (error: any) {
      console.error('[ContractLifecycleService] createDraftContract error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Per Master Spec §3.3 - Activate Contract (OTP Workflow)
   * Preconditions:
   * - Checkout inspection present
   * - Deposit rule satisfied
   * Post-conditions:
   * - Contract status → ACTIVE
   * - Vehicle status → OUT
   * - otpActivationVerifiedAt timestamp set
   */
  async activateContract(command: ActivateContractCommand): Promise<LifecycleResult> {
    const events: DomainEvent[] = [];

    try {
      // Get contract with relations
      const contract = await db.query.contracts.findFirst({
        where: eq(contracts.id, command.contractId),
        with: {
          vehicle: true,
          customer: true,
        }
      });

      if (!contract) {
        return { success: false, error: 'Contract not found' };
      }

      // Verify contract is in DRAFT state
      if (contract.status !== ContractStatus.DRAFT) {
        return { success: false, error: `Contract cannot be activated from ${contract.status} state` };
      }

      // Per §3.3 - Verify checkout inspection exists
      const checkoutInspection = await db.query.vehicleInspections.findFirst({
        where: and(
          eq(vehicleInspections.contractId, command.contractId),
          eq(vehicleInspections.inspectionType, 'checkout')
        )
      });

      if (!checkoutInspection) {
        return { success: false, error: 'Checkout inspection required before activation' };
      }

      // Per §3.3 - Verify deposit rule satisfied
      const depositStatus = await depositService.getDepositStatus(command.contractId);
      if (!depositStatus.isDepositSatisfied) {
        // Per Master Spec - Only manager/admin can override deposit requirement
        if (command.overrideDepositCheck) {
          const authorizedRoles = ['admin', 'manager'];
          if (!command.activatedByRole || !authorizedRoles.includes(command.activatedByRole)) {
            return { 
              success: false, 
              error: 'Deposit override requires manager or admin authorization' 
            };
          }
          // Log the override for audit
          await this.createAuditLog(command.contractId, 'DEPOSIT_OVERRIDE', command.activatedBy, {
            reason: 'Manager override',
            depositExpected: depositStatus.depositExpected,
            depositReceived: depositStatus.depositReceived,
          });
        } else {
          return { 
            success: false, 
            error: `Deposit requirement not satisfied. Required: ${depositStatus.depositExpected}, Received: ${depositStatus.depositReceived}` 
          };
        }
      }

      // Per §3.3 - Validate OTP
      const otpResult = await otpService.verifyOTP(
        command.contractId,
        command.otp,
        'ACTIVATION'
      );

      if (!otpResult.success) {
        return { success: false, error: otpResult.error || 'OTP verification failed' };
      }

      const now = new Date();

      // Update contract to ACTIVE with optimistic locking
      const [updatedContract] = await db.update(contracts)
        .set({
          status: ContractStatus.ACTIVE,
          activatedAt: now,
          otpActivationVerifiedAt: now,
          startDatetimeActual: now,
          vehicleCheckoutAt: now,
          version: sql`${contracts.version} + 1`,
          updatedAt: now,
        })
        .where(and(
          eq(contracts.id, command.contractId),
          eq(contracts.version, contract.version)
        ))
        .returning();

      if (!updatedContract) {
        return { success: false, error: 'Concurrent modification detected - please retry' };
      }

      // Per §3.3 - Update vehicle status to OUT
      await db.update(vehicles)
        .set({
          status: VehicleStatus.OUT,
          currentContractId: command.contractId,
          updatedAt: now,
        })
        .where(eq(vehicles.id, contract.vehicleId!));

      // Emit ContractActivated event
      events.push({
        type: 'ContractActivated',
        timestamp: now,
        contractId: contract.id,
        payload: {
          contractNumber: contract.contractNumber,
          customerId: contract.customerId,
          vehicleId: contract.vehicleId,
          activatedBy: command.activatedBy,
        }
      });

      // Create audit log
      await this.createAuditLog(contract.id, 'CONTRACT_ACTIVATED', command.activatedBy, {
        previousStatus: ContractStatus.DRAFT,
        newStatus: ContractStatus.ACTIVE,
        otpVerified: true,
      });

      // Trigger activation notification
      await this.triggerActivationNotification(updatedContract);

      return {
        success: true,
        contract: updatedContract,
        events
      };
    } catch (error: any) {
      console.error('[ContractLifecycleService] activateContract error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Per Master Spec §3.5 - Complete Contract
   * Triggered when customer returns vehicle.
   * Preconditions:
   * - Return inspection required
   * - Odometer in captured
   */
  async completeContract(command: CompleteContractCommand): Promise<LifecycleResult> {
    const events: DomainEvent[] = [];

    try {
      const contract = await db.query.contracts.findFirst({
        where: eq(contracts.id, command.contractId),
        with: {
          vehicle: true,
        }
      });

      if (!contract) {
        return { success: false, error: 'Contract not found' };
      }

      // Verify contract is in ACTIVE state
      if (contract.status !== ContractStatus.ACTIVE) {
        return { success: false, error: `Contract cannot be completed from ${contract.status} state` };
      }

      // Per §3.6 - Verify return inspection exists
      const returnInspection = await db.query.vehicleInspections.findFirst({
        where: and(
          eq(vehicleInspections.contractId, command.contractId),
          eq(vehicleInspections.inspectionType, 'return')
        )
      });

      if (!returnInspection) {
        return { success: false, error: 'Return inspection required before completion' };
      }

      // Per §3.7 - Check for pending damage/incidents
      const pendingIncidents = await db.query.incidents.findMany({
        where: and(
          eq(incidents.contractId, command.contractId),
          sql`${incidents.status} NOT IN ('RESOLVED', 'CLOSED')`
        )
      });

      const now = new Date();
      
      // Determine final status based on incidents
      const newStatus = pendingIncidents.length > 0 
        ? ContractStatus.COMPLETED_PENDING_ACCIDENT 
        : ContractStatus.COMPLETED;

      // Update contract
      const [updatedContract] = await db.update(contracts)
        .set({
          status: newStatus,
          completedAt: now,
          endDatetimeActual: now,
          vehicleReturnAt: now,
          hasPendingIncident: pendingIncidents.length > 0,
          version: sql`${contracts.version} + 1`,
          updatedAt: now,
        })
        .where(and(
          eq(contracts.id, command.contractId),
          eq(contracts.version, contract.version)
        ))
        .returning();

      if (!updatedContract) {
        return { success: false, error: 'Concurrent modification detected - please retry' };
      }

      // Update vehicle status to PENDING_INSPECTION
      await db.update(vehicles)
        .set({
          status: VehicleStatus.PENDING_INSPECTION,
          currentContractId: null,
          updatedAt: now,
        })
        .where(eq(vehicles.id, contract.vehicleId!));

      // Emit ContractCompleted event
      events.push({
        type: 'ContractCompleted',
        timestamp: now,
        contractId: contract.id,
        payload: {
          contractNumber: contract.contractNumber,
          hasPendingIncident: pendingIncidents.length > 0,
          completedBy: command.completedBy,
        }
      });

      // Create audit log
      await this.createAuditLog(contract.id, 'CONTRACT_COMPLETED', command.completedBy, {
        previousStatus: ContractStatus.ACTIVE,
        newStatus,
        pendingIncidents: pendingIncidents.length,
      });

      return {
        success: true,
        contract: updatedContract,
        events
      };
    } catch (error: any) {
      console.error('[ContractLifecycleService] completeContract error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Per Master Spec §3.11 - Close Contract
   * Preconditions:
   * - No pending incidents
   * - Balance = 0
   * - Deposits adjusted
   * - Return inspection complete
   */
  async closeContract(command: CloseContractCommand): Promise<LifecycleResult> {
    const events: DomainEvent[] = [];

    try {
      const contract = await db.query.contracts.findFirst({
        where: eq(contracts.id, command.contractId),
        with: {
          vehicle: true,
        }
      });

      if (!contract) {
        return { success: false, error: 'Contract not found' };
      }

      // Verify contract is in COMPLETED or COMPLETED_PENDING_ACCIDENT state
      if (contract.status !== ContractStatus.COMPLETED && contract.status !== ContractStatus.COMPLETED_PENDING_ACCIDENT) {
        return { success: false, error: `Contract cannot be closed from ${contract.status} state` };
      }

      // Per §3.11 - Check for pending incidents
      const pendingIncidents = await db.query.incidents.findMany({
        where: and(
          eq(incidents.contractId, command.contractId),
          sql`${incidents.status} NOT IN ('RESOLVED', 'CLOSED')`
        )
      });

      if (pendingIncidents.length > 0) {
        return { success: false, error: `Cannot close contract with ${pendingIncidents.length} unresolved incident(s)` };
      }

      // Per §3.11 - Verify balance = 0
      const outstandingAmount = parseFloat(contract.outstandingAmount?.toString() || '0');
      if (outstandingAmount !== 0) {
        return { success: false, error: `Cannot close contract with outstanding balance: ${outstandingAmount}` };
      }

      // Per Master Spec §3.11 - OTP verification is MANDATORY for closure
      // Digital sign-off required for contract finalization
      if (!command.otp) {
        return { success: false, error: 'Closure OTP is required per Master Spec §3.11' };
      }
      
      const otpResult = await otpService.verifyOTP(
        command.contractId,
        command.otp,
        'CLOSURE'
      );

      if (!otpResult.success) {
        return { success: false, error: otpResult.error || 'Closure OTP verification failed' };
      }

      const now = new Date();

      // Update contract to CLOSED
      const [updatedContract] = await db.update(contracts)
        .set({
          status: ContractStatus.CLOSED,
          closedAt: now,
          otpClosureVerifiedAt: command.otp ? now : null,
          version: sql`${contracts.version} + 1`,
          updatedAt: now,
        })
        .where(and(
          eq(contracts.id, command.contractId),
          eq(contracts.version, contract.version)
        ))
        .returning();

      if (!updatedContract) {
        return { success: false, error: 'Concurrent modification detected - please retry' };
      }

      // Update vehicle to AVAILABLE
      if (contract.vehicleId) {
        await db.update(vehicles)
          .set({
            status: VehicleStatus.AVAILABLE,
            updatedAt: now,
          })
          .where(eq(vehicles.id, contract.vehicleId));
      }

      // Emit ContractClosed event
      events.push({
        type: 'ContractClosed',
        timestamp: now,
        contractId: contract.id,
        payload: {
          contractNumber: contract.contractNumber,
          closedBy: command.closedBy,
        }
      });

      // Create audit log
      await this.createAuditLog(contract.id, 'CONTRACT_CLOSED', command.closedBy, {
        previousStatus: contract.status,
        newStatus: ContractStatus.CLOSED,
        notes: command.notes,
      });

      // Trigger closure notification
      await triggerNotification('CONTRACT_CLOSED', {
        contractId: contract.id,
        customerId: contract.customerId,
        contractNumber: contract.contractNumber,
      });

      return {
        success: true,
        contract: updatedContract,
        events
      };
    } catch (error: any) {
      console.error('[ContractLifecycleService] closeContract error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Per Master Spec §3.12 - Cancel Contract
   * Allowed only in DRAFT or ACTIVE (before vehicle leaves).
   */
  async cancelContract(command: CancelContractCommand): Promise<LifecycleResult> {
    const events: DomainEvent[] = [];

    try {
      const contract = await db.query.contracts.findFirst({
        where: eq(contracts.id, command.contractId),
      });

      if (!contract) {
        return { success: false, error: 'Contract not found' };
      }

      // Per §3.12 - Verify cancellation is allowed
      const canCancel = contract.status === ContractStatus.DRAFT || 
        (contract.status === ContractStatus.ACTIVE && !contract.vehicleCheckoutAt);

      if (!canCancel) {
        return { success: false, error: `Contract cannot be cancelled from ${contract.status} state (vehicle already handed over)` };
      }

      const now = new Date();

      // Update contract to CANCELLED
      const [updatedContract] = await db.update(contracts)
        .set({
          status: ContractStatus.CANCELLED,
          cancelledAt: now,
          cancellationReason: command.reason,
          version: sql`${contracts.version} + 1`,
          updatedAt: now,
        })
        .where(and(
          eq(contracts.id, command.contractId),
          eq(contracts.version, contract.version)
        ))
        .returning();

      if (!updatedContract) {
        return { success: false, error: 'Concurrent modification detected - please retry' };
      }

      // Per §3.12 - Handle deposit refund if applicable
      const depositReceived = parseFloat(contract.depositReceived?.toString() || '0');
      if (depositReceived > 0) {
        // Create refund payment record
        await db.insert(payments).values({
          contractId: command.contractId,
          branchId: contract.branchId,
          direction: 'OUT',
          paymentType: 'REFUND',
          paymentStatus: 'CONFIRMED',
          amount: depositReceived.toString(),
          paymentMethod: 'original_method',
          currency: 'AED',
          notes: 'Automatic deposit refund due to contract cancellation',
          createdBy: command.cancelledBy,
        });
      }

      // Release vehicle if assigned
      if (contract.vehicleId) {
        await db.update(vehicles)
          .set({
            status: VehicleStatus.AVAILABLE,
            currentContractId: null,
            updatedAt: now,
          })
          .where(eq(vehicles.id, contract.vehicleId));
      }

      // Emit ContractCancelled event
      events.push({
        type: 'ContractCancelled',
        timestamp: now,
        contractId: contract.id,
        payload: {
          contractNumber: contract.contractNumber,
          reason: command.reason,
          cancelledBy: command.cancelledBy,
          depositRefunded: depositReceived,
        }
      });

      // Create audit log
      await this.createAuditLog(contract.id, 'CONTRACT_CANCELLED', command.cancelledBy, {
        previousStatus: contract.status,
        newStatus: ContractStatus.CANCELLED,
        reason: command.reason,
        depositRefunded: depositReceived,
      });

      // Trigger cancellation notification
      await triggerNotification('CONTRACT_CANCELLED', {
        contractId: contract.id,
        customerId: contract.customerId,
        contractNumber: contract.contractNumber,
        reason: command.reason,
      });

      return {
        success: true,
        contract: updatedContract,
        events
      };
    } catch (error: any) {
      console.error('[ContractLifecycleService] cancelContract error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate that a status transition is allowed per Master Spec
   */
  validateStatusTransition(currentStatus: string, targetStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
      [ContractStatus.DRAFT]: [ContractStatus.ACTIVE, ContractStatus.CANCELLED],
      [ContractStatus.ACTIVE]: [ContractStatus.COMPLETED, ContractStatus.COMPLETED_PENDING_ACCIDENT, ContractStatus.CANCELLED],
      [ContractStatus.COMPLETED]: [ContractStatus.CLOSED],
      [ContractStatus.COMPLETED_PENDING_ACCIDENT]: [ContractStatus.COMPLETED, ContractStatus.CLOSED],
      [ContractStatus.CLOSED]: [],
      [ContractStatus.CANCELLED]: [],
    };

    return validTransitions[currentStatus]?.includes(targetStatus) || false;
  }

  /**
   * Generate contract number from sequence table per Master Spec
   */
  private async generateContractNumber(branchId: string): Promise<number> {
    // Check sequences table for branch-specific or global sequence
    const result = await db.execute(sql`
      UPDATE sequences 
      SET current_value = current_value + 1, 
          updated_at = NOW()
      WHERE entity_type = 'CONTRACT' 
        AND (branch_id = ${branchId} OR branch_id IS NULL)
      ORDER BY branch_id NULLS LAST
      LIMIT 1
      RETURNING current_value
    `);

    if (result.rows && result.rows.length > 0) {
      return (result.rows[0] as any).current_value;
    }

    // Fallback to simple counter if sequences not configured
    const maxContract = await db.execute(sql`
      SELECT COALESCE(MAX(contract_number), 15500) as max_num FROM contracts
    `);
    return ((maxContract.rows[0] as any).max_num || 15500) + 1;
  }

  /**
   * Create audit log entry per Master Spec dual audit trail
   */
  private async createAuditLog(
    contractId: string, 
    action: string, 
    userId: string, 
    details: Record<string, any>
  ): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        tableName: 'contracts',
        recordId: contractId,
        action,
        userId,
        changes: details,
      });
    } catch (error) {
      console.error('[ContractLifecycleService] Failed to create audit log:', error);
    }
  }

  /**
   * Trigger activation notification per Master Spec
   */
  private async triggerActivationNotification(contract: any): Promise<void> {
    try {
      await triggerNotification('CONTRACT_ACTIVE', {
        contractId: contract.id,
        customerId: contract.customerId,
        contractNumber: contract.contractNumber,
        startDate: contract.startDatetime,
        endDate: contract.endDatetime,
      });
    } catch (error) {
      console.error('[ContractLifecycleService] Failed to trigger activation notification:', error);
    }
  }
}

export const contractLifecycleService = new ContractLifecycleService();
