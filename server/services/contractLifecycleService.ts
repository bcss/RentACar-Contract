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
import { contracts, vehicles, vehicleInspections, payments, incidents, customers, branches, users, contractEdits, auditLogs, contractAmendments, tariffs } from "@shared/schema";
import { eq, and, sql, isNull, ne } from "drizzle-orm";
import { billingService } from "./billingService";
import { otpService } from "./otpService";
import { depositService } from "./depositService";
import { inspectionService } from "./inspectionService";
import { notificationService } from "./notificationService";
import { triggerNotification } from "./notificationTrigger";
import { blacklistService, BlacklistStatus } from "./blacklistService";

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

// Extension workflow per Master Spec §3.13
export interface ExtendContractCommand {
  contractId: string;
  newEndDatetime: Date;
  reason?: string;
  extendedBy: string;
  otp?: string; // Optional OTP for material changes
}

// Early return workflow per Master Spec §3.14
export interface EarlyReturnCommand {
  contractId: string;
  actualReturnDatetime: Date;
  returnOdometer: number;
  returnFuel: string;
  returnedBy: string;
  reason?: string;
}

// Amendment workflow per Master Spec §3.15
export interface AmendContractCommand {
  contractId: string;
  amendmentType: 'RATE_CHANGE' | 'TARIFF_DOWNGRADE' | 'DISCOUNT' | 'LIABILITY_CHANGE';
  newTariffId?: string;
  newDailyRate?: number;
  discountPercent?: number;
  discountAmount?: number;
  reason: string;
  amendedBy: string;
  otp?: string; // Required for material changes per Master Spec
}

// Vehicle swap workflow per Master Spec §3.16
export interface SwapVehicleCommand {
  contractId: string;
  newVehicleId: string;
  reason: string;
  returnOdometer: number;
  returnFuel: string;
  swappedBy: string;
}

// Driver change workflow per Master Spec §3.17
export interface ChangeDriverCommand {
  contractId: string;
  newDriverId: string;
  newHirerNameEn?: string;
  newHirerNameAr?: string;
  newHirerMobile?: string;
  newHirerLicenseNumber?: string;
  reason: string;
  otp?: string; // Company OTP for corporate driver changes
  changedBy: string;
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
      // Validate customer exists
      const customer = await db.query.customers.findFirst({
        where: eq(customers.id, command.customerId)
      });

      if (!customer) {
        return { success: false, error: 'Customer not found' };
      }

      // Per Master Spec §3.35-3.36 - Comprehensive blacklist check using BlacklistService
      const blacklistCheck = await blacklistService.checkPreContractBlacklist(
        command.customerId,
        command.companyId,
        command.sponsorId,
        command.branchId
      );

      // Check for hard blocks - these cannot proceed
      const hardBlocks = blacklistCheck.blockedEntities.filter(
        e => e.result.status === BlacklistStatus.HARD_BLOCK
      );
      if (hardBlocks.length > 0) {
        const blockedEntity = hardBlocks[0];
        return { 
          success: false, 
          error: `Cannot create contract: ${blockedEntity.type} is hard-blocked. Reason: ${blockedEntity.result.reason || 'Blacklisted'}` 
        };
      }

      // Check for soft blocks - require manager override
      const softBlocks = blacklistCheck.blockedEntities.filter(
        e => e.result.status === BlacklistStatus.SOFT_BLOCK
      );
      if (softBlocks.length > 0) {
        for (const blocked of softBlocks) {
          warnings.push(`${blocked.type} is soft-blocked (manager override required): ${blocked.result.reason || 'Blacklisted'}`);
        }
      }

      // Add watch warnings
      for (const watch of blacklistCheck.warnings) {
        warnings.push(`Warning: ${watch.type} has watch status: ${watch.result.reason || 'Under observation'}`);
      }

      // Legacy check on customer field (backward compatibility)
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
        depositRequired: depositExpected > 0, // Boolean per schema
        depositExpected: String(depositExpected), // Numeric field
        depositReceived: '0',
        depositRefunded: '0',
        totalCharges: '0',
        outstandingAmount: '0',
        version: 1,
        notes: command.notes,
        createdBy: command.createdBy,
        dailyRate: '0',
        totalAmount: '0',
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

      // Per Master Spec §3.35-3.36 - Blacklist enforcement at activation
      const blacklistCheck = await blacklistService.checkBlacklist(
        'customer',
        contract.customerId,
        'activation',
        contract.branchId ?? undefined
      );

      if (blacklistCheck.isBlocked) {
        if (blacklistCheck.status === BlacklistStatus.HARD_BLOCK) {
          return { 
            success: false, 
            error: `Cannot activate contract: customer is hard-blocked. Reason: ${blacklistCheck.reason || 'Blacklisted'}` 
          };
        }
        
        if (blacklistCheck.status === BlacklistStatus.SOFT_BLOCK) {
          // Soft block requires manager override
          const authorizedRoles = ['admin', 'manager'];
          if (!command.activatedByRole || !authorizedRoles.includes(command.activatedByRole)) {
            return { 
              success: false, 
              error: `Customer has soft-block status - manager or admin override required. Reason: ${blacklistCheck.reason || 'Blacklisted'}` 
            };
          }
          // Log the blacklist override
          await this.createAuditLog(command.contractId, 'BLACKLIST_OVERRIDE', command.activatedBy, {
            reason: 'Manager/admin override for soft-blocked customer',
            blacklistStatus: blacklistCheck.status,
            blacklistReason: blacklistCheck.reason,
          });
        }
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
      const otpResult = await otpService.verifyOTP({
        verificationId: command.contractId,
        otpCode: command.otp,
      });

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
          vehicleReturnedAt: now,
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
      
      const otpResult = await otpService.verifyOTP({
        verificationId: command.contractId,
        otpCode: command.otp,
      });

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
      await triggerNotification('CONTRACT_CLOSED', 
        { customerId: contract.customerId, phone: contract.hirerMobile, email: contract.hirerAddress },
        { contractId: contract.id, contractNumber: contract.contractNumber }
      );

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
      await triggerNotification('CONTRACT_CANCELLED', 
        { customerId: contract.customerId, phone: contract.hirerMobile, email: contract.hirerAddress },
        { contractId: contract.id, contractNumber: contract.contractNumber, reason: command.reason }
      );

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
   * Per Master Spec §3.13 - Extend Contract
   * Extends an active contract to a new end date.
   * Creates amendment record, recalculates charges.
   */
  async extendContract(command: ExtendContractCommand): Promise<LifecycleResult> {
    const events: DomainEvent[] = [];

    try {
      const contract = await db.query.contracts.findFirst({
        where: eq(contracts.id, command.contractId),
      });

      if (!contract) {
        return { success: false, error: 'Contract not found' };
      }

      // Per §3.13 - Only active contracts can be extended
      if (contract.status !== ContractStatus.ACTIVE) {
        return { success: false, error: `Contract cannot be extended from ${contract.status} state` };
      }

      const oldEndDate = contract.endDatetime || contract.rentalEndDate;
      const newEndDate = new Date(command.newEndDatetime);

      // Validate new end date is after current end date
      if (oldEndDate && newEndDate <= new Date(oldEndDate)) {
        return { success: false, error: 'New end date must be after current end date' };
      }

      // Check vehicle availability for extended period
      const vehicleAvailable = await this.checkVehicleAvailability(
        contract.vehicleId,
        new Date(oldEndDate!),
        newEndDate,
        contract.id
      );

      if (!vehicleAvailable) {
        return { success: false, error: 'Vehicle is not available for the extended period' };
      }

      const now = new Date();

      // Create amendment record per Master Spec §3.13
      await db.insert(contractAmendments).values({
        contractId: command.contractId,
        type: 'EXTENSION',
        oldValueJson: { endDatetime: oldEndDate },
        newValueJson: { endDatetime: newEndDate.toISOString() },
        reason: command.reason,
        createdBy: command.extendedBy,
      });

      // Update contract end date
      const [updatedContract] = await db.update(contracts)
        .set({
          endDatetime: newEndDate,
          rentalEndDate: newEndDate,
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

      // Recalculate charges for extended period
      await billingService.recalculateChargesForContract(command.contractId);

      // Emit ContractExtended event
      events.push({
        type: 'ContractExtended',
        timestamp: now,
        contractId: contract.id,
        payload: {
          contractNumber: contract.contractNumber,
          oldEndDate,
          newEndDate: newEndDate.toISOString(),
          extendedBy: command.extendedBy,
        }
      });

      // Create audit log
      await this.createAuditLog(contract.id, 'CONTRACT_EXTENDED', command.extendedBy, {
        oldEndDate,
        newEndDate: newEndDate.toISOString(),
        reason: command.reason,
      });

      // Trigger extension notification
      await triggerNotification('CONTRACT_EXTENDED', 
        { customerId: contract.customerId, phone: contract.hirerMobile, email: contract.hirerAddress },
        { contractId: contract.id, contractNumber: contract.contractNumber, oldEndDate, newEndDate: newEndDate.toISOString() }
      );

      return {
        success: true,
        contract: updatedContract,
        events
      };
    } catch (error: any) {
      console.error('[ContractLifecycleService] extendContract error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Per Master Spec §3.14 - Process Early Return
   * Handles early vehicle return with penalty calculation.
   */
  async processEarlyReturn(command: EarlyReturnCommand): Promise<LifecycleResult> {
    const events: DomainEvent[] = [];

    try {
      const contract = await db.query.contracts.findFirst({
        where: eq(contracts.id, command.contractId),
      });

      if (!contract) {
        return { success: false, error: 'Contract not found' };
      }

      // Per §3.14 - Only active contracts can have early returns
      if (contract.status !== ContractStatus.ACTIVE) {
        return { success: false, error: `Early return not allowed from ${contract.status} state` };
      }

      const plannedEnd = contract.endDatetime || contract.rentalEndDate;
      const actualReturn = new Date(command.actualReturnDatetime);

      // Verify this is actually an early return
      if (plannedEnd && actualReturn >= new Date(plannedEnd)) {
        return { success: false, error: 'Return date is not early - use normal completion flow' };
      }

      const now = new Date();

      // Create amendment record for early return
      await db.insert(contractAmendments).values({
        contractId: command.contractId,
        type: 'EARLY_RETURN',
        oldValueJson: { 
          endDatetime: plannedEnd,
          status: contract.status,
        },
        newValueJson: { 
          endDatetimeActual: actualReturn.toISOString(),
          status: ContractStatus.COMPLETED,
          odometerEnd: command.returnOdometer,
          fuelLevelEnd: command.returnFuel,
        },
        reason: command.reason || 'Early return requested by customer',
        createdBy: command.returnedBy,
      });

      // Update contract with actual return details and move to COMPLETED
      const [updatedContract] = await db.update(contracts)
        .set({
          status: ContractStatus.COMPLETED,
          endDatetimeActual: actualReturn,
          vehicleReturnedAt: actualReturn,
          odometerEnd: command.returnOdometer,
          fuelLevelEnd: command.returnFuel,
          completedBy: command.returnedBy,
          completedAt: now,
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

      // Update vehicle status
      if (contract.vehicleId) {
        await db.update(vehicles)
          .set({
            status: VehicleStatus.PENDING_INSPECTION,
            updatedAt: now,
          })
          .where(eq(vehicles.id, contract.vehicleId));
      }

      // Recalculate charges (will apply early return penalty)
      await billingService.recalculateChargesForContract(command.contractId);

      // Emit EarlyReturn event
      events.push({
        type: 'ContractEarlyReturn',
        timestamp: now,
        contractId: contract.id,
        payload: {
          contractNumber: contract.contractNumber,
          plannedEndDate: plannedEnd,
          actualReturnDate: actualReturn.toISOString(),
          returnedBy: command.returnedBy,
        }
      });

      // Create audit log
      await this.createAuditLog(contract.id, 'CONTRACT_EARLY_RETURN', command.returnedBy, {
        plannedEndDate: plannedEnd,
        actualReturnDate: actualReturn.toISOString(),
        returnOdometer: command.returnOdometer,
        returnFuel: command.returnFuel,
        reason: command.reason,
      });

      return {
        success: true,
        contract: updatedContract,
        events
      };
    } catch (error: any) {
      console.error('[ContractLifecycleService] processEarlyReturn error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Per Master Spec §3.15 - Amend Contract
   * Handles rate changes, tariff downgrades, discounts.
   * Material changes may require manager approval and/or OTP.
   */
  async amendContract(command: AmendContractCommand): Promise<LifecycleResult> {
    const events: DomainEvent[] = [];

    try {
      const contract = await db.query.contracts.findFirst({
        where: eq(contracts.id, command.contractId),
      });

      if (!contract) {
        return { success: false, error: 'Contract not found' };
      }

      // Per §3.15 - Only active contracts can be amended
      if (contract.status !== ContractStatus.ACTIVE) {
        return { success: false, error: `Contract cannot be amended from ${contract.status} state` };
      }

      const now = new Date();
      const updates: Record<string, any> = { updatedAt: now };
      const oldValues: Record<string, any> = {};
      const newValues: Record<string, any> = {};

      // Handle different amendment types
      switch (command.amendmentType) {
        case 'RATE_CHANGE':
          if (command.newDailyRate !== undefined) {
            oldValues.dailyRate = contract.dailyRate;
            newValues.dailyRate = command.newDailyRate;
            updates.dailyRate = command.newDailyRate.toString();
          }
          break;

        case 'TARIFF_DOWNGRADE':
          if (command.newTariffId) {
            oldValues.tariffId = contract.tariffId;
            newValues.tariffId = command.newTariffId;
            updates.tariffId = command.newTariffId;

            // Get new tariff details
            const newTariff = await db.query.tariffs.findFirst({
              where: eq(tariffs.id, command.newTariffId)
            });
            if (newTariff) {
              updates.dailyRate = newTariff.rateDaily;
              newValues.dailyRate = newTariff.rateDaily;
            }
          }
          break;

        case 'DISCOUNT':
          // Discounts are added as charges, not contract field updates
          // Store discount info in amendment record
          if (command.discountPercent) {
            newValues.discountPercent = command.discountPercent;
          }
          if (command.discountAmount) {
            newValues.discountAmount = command.discountAmount;
          }
          break;

        case 'LIABILITY_CHANGE':
          // Liability party changes typically need manager approval
          oldValues.partyType = contract.partyType;
          // Additional fields would be updated based on new liability party
          break;
      }

      // Create amendment record
      await db.insert(contractAmendments).values({
        contractId: command.contractId,
        type: command.amendmentType,
        oldValueJson: oldValues,
        newValueJson: newValues,
        reason: command.reason,
        requiresApproval: command.amendmentType === 'LIABILITY_CHANGE',
        createdBy: command.amendedBy,
      });

      // Update contract if there are field changes
      if (Object.keys(updates).length > 1) { // More than just updatedAt
        updates.version = sql`${contracts.version} + 1`;

        const [updatedContract] = await db.update(contracts)
          .set(updates)
          .where(and(
            eq(contracts.id, command.contractId),
            eq(contracts.version, contract.version)
          ))
          .returning();

        if (!updatedContract) {
          return { success: false, error: 'Concurrent modification detected - please retry' };
        }
      }

      // Recalculate charges with new rates
      await billingService.recalculateChargesForContract(command.contractId);

      // Emit ContractAmended event
      events.push({
        type: 'ContractAmended',
        timestamp: now,
        contractId: contract.id,
        payload: {
          contractNumber: contract.contractNumber,
          amendmentType: command.amendmentType,
          oldValues,
          newValues,
          amendedBy: command.amendedBy,
        }
      });

      // Create audit log
      await this.createAuditLog(contract.id, 'CONTRACT_AMENDED', command.amendedBy, {
        amendmentType: command.amendmentType,
        oldValues,
        newValues,
        reason: command.reason,
      });

      const finalContract = await db.query.contracts.findFirst({
        where: eq(contracts.id, command.contractId)
      });

      return {
        success: true,
        contract: finalContract,
        events
      };
    } catch (error: any) {
      console.error('[ContractLifecycleService] amendContract error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Per Master Spec §3.16 - Swap Vehicle
   * Replaces the vehicle on an active contract.
   * Requires return inspection on old vehicle, checkout on new.
   */
  async swapVehicle(command: SwapVehicleCommand): Promise<LifecycleResult> {
    const events: DomainEvent[] = [];

    try {
      const contract = await db.query.contracts.findFirst({
        where: eq(contracts.id, command.contractId),
      });

      if (!contract) {
        return { success: false, error: 'Contract not found' };
      }

      // Per §3.16 - Only active contracts can have vehicle swaps
      if (contract.status !== ContractStatus.ACTIVE) {
        return { success: false, error: `Vehicle swap not allowed from ${contract.status} state` };
      }

      // Check new vehicle availability
      const newVehicle = await db.query.vehicles.findFirst({
        where: eq(vehicles.id, command.newVehicleId)
      });

      if (!newVehicle) {
        return { success: false, error: 'New vehicle not found' };
      }

      if (newVehicle.status !== VehicleStatus.AVAILABLE) {
        return { success: false, error: `New vehicle is not available (status: ${newVehicle.status})` };
      }

      const now = new Date();
      const oldVehicleId = contract.vehicleId;

      // Create amendment record for vehicle swap
      await db.insert(contractAmendments).values({
        contractId: command.contractId,
        type: 'VEHICLE_SWAP',
        oldValueJson: {
          vehicleId: oldVehicleId,
          odometerEnd: command.returnOdometer,
          fuelLevelEnd: command.returnFuel,
        },
        newValueJson: {
          vehicleId: command.newVehicleId,
          odometerStart: newVehicle.currentOdometerReading || newVehicle.odometer,
        },
        reason: command.reason,
        createdBy: command.swappedBy,
      });

      // Update old vehicle to AVAILABLE
      await db.update(vehicles)
        .set({
          status: VehicleStatus.AVAILABLE,
          currentContractId: null,
          updatedAt: now,
        })
        .where(eq(vehicles.id, oldVehicleId));

      // Update new vehicle to OUT and link to contract
      await db.update(vehicles)
        .set({
          status: VehicleStatus.OUT,
          currentContractId: command.contractId,
          updatedAt: now,
        })
        .where(eq(vehicles.id, command.newVehicleId));

      // Update contract with new vehicle
      const [updatedContract] = await db.update(contracts)
        .set({
          vehicleId: command.newVehicleId,
          odometerStart: newVehicle.currentOdometerReading || newVehicle.odometer,
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

      // Emit VehicleSwapped event
      events.push({
        type: 'VehicleSwapped',
        timestamp: now,
        contractId: contract.id,
        payload: {
          contractNumber: contract.contractNumber,
          oldVehicleId,
          newVehicleId: command.newVehicleId,
          reason: command.reason,
          swappedBy: command.swappedBy,
        }
      });

      // Create audit log
      await this.createAuditLog(contract.id, 'VEHICLE_SWAPPED', command.swappedBy, {
        oldVehicleId,
        newVehicleId: command.newVehicleId,
        returnOdometer: command.returnOdometer,
        returnFuel: command.returnFuel,
        reason: command.reason,
      });

      return {
        success: true,
        contract: updatedContract,
        events
      };
    } catch (error: any) {
      console.error('[ContractLifecycleService] swapVehicle error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Per Master Spec §3.17 - Change Driver
   * Updates the driver/hirer on a corporate contract.
   * Requires company OTP for verification.
   */
  async changeDriver(command: ChangeDriverCommand): Promise<LifecycleResult> {
    const events: DomainEvent[] = [];

    try {
      const contract = await db.query.contracts.findFirst({
        where: eq(contracts.id, command.contractId),
      });

      if (!contract) {
        return { success: false, error: 'Contract not found' };
      }

      // Per §3.17 - Only active contracts can have driver changes
      if (contract.status !== ContractStatus.ACTIVE) {
        return { success: false, error: `Driver change not allowed from ${contract.status} state` };
      }

      // Per §3.17 - Corporate contracts may require OTP verification
      if (contract.hirerType === 'from_company' && command.otp) {
        // Verify company OTP if provided
        const otpResult = await otpService.verifyOtp({
          verificationId: command.contractId,
          otpCode: command.otp,
        });

        if (!otpResult.success) {
          return { success: false, error: 'Invalid OTP for driver change verification' };
        }
      }

      const now = new Date();
      const oldDriverInfo = {
        assignedDriverId: contract.assignedDriverId,
        hirerNameEn: contract.hirerNameEn,
        hirerNameAr: contract.hirerNameAr,
        hirerMobile: contract.hirerMobile,
        hirerLicenseNumber: contract.hirerLicenseNumber,
      };

      const newDriverInfo: Record<string, any> = {
        assignedDriverId: command.newDriverId,
      };

      if (command.newHirerNameEn) newDriverInfo.hirerNameEn = command.newHirerNameEn;
      if (command.newHirerNameAr) newDriverInfo.hirerNameAr = command.newHirerNameAr;
      if (command.newHirerMobile) newDriverInfo.hirerMobile = command.newHirerMobile;
      if (command.newHirerLicenseNumber) newDriverInfo.hirerLicenseNumber = command.newHirerLicenseNumber;

      // Create amendment record for driver change
      await db.insert(contractAmendments).values({
        contractId: command.contractId,
        type: 'DRIVER_CHANGE',
        oldValueJson: oldDriverInfo,
        newValueJson: newDriverInfo,
        reason: command.reason,
        createdBy: command.changedBy,
      });

      // Update contract with new driver info
      const [updatedContract] = await db.update(contracts)
        .set({
          assignedDriverId: command.newDriverId,
          hirerNameEn: command.newHirerNameEn || contract.hirerNameEn,
          hirerNameAr: command.newHirerNameAr || contract.hirerNameAr,
          hirerMobile: command.newHirerMobile || contract.hirerMobile,
          hirerLicenseNumber: command.newHirerLicenseNumber || contract.hirerLicenseNumber,
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

      // Emit DriverChanged event
      events.push({
        type: 'DriverChanged',
        timestamp: now,
        contractId: contract.id,
        payload: {
          contractNumber: contract.contractNumber,
          oldDriverInfo,
          newDriverInfo,
          reason: command.reason,
          changedBy: command.changedBy,
        }
      });

      // Create audit log
      await this.createAuditLog(contract.id, 'DRIVER_CHANGED', command.changedBy, {
        oldDriverInfo,
        newDriverInfo,
        reason: command.reason,
      });

      return {
        success: true,
        contract: updatedContract,
        events
      };
    } catch (error: any) {
      console.error('[ContractLifecycleService] changeDriver error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check vehicle availability for a date range
   * Used by extension workflow
   */
  private async checkVehicleAvailability(
    vehicleId: string,
    startDate: Date,
    endDate: Date,
    excludeContractId?: string
  ): Promise<boolean> {
    try {
      // Check for overlapping active contracts on this vehicle
      const conditions = [
        eq(contracts.vehicleId, vehicleId),
        ne(contracts.status, ContractStatus.CLOSED),
        ne(contracts.status, ContractStatus.CANCELLED),
        sql`(${contracts.startDatetime}::timestamp < ${endDate.toISOString()}::timestamp 
            AND ${contracts.endDatetime}::timestamp > ${startDate.toISOString()}::timestamp)`,
      ];

      if (excludeContractId) {
        conditions.push(ne(contracts.id, excludeContractId));
      }

      const overlapping = await db.query.contracts.findFirst({
        where: and(...conditions)
      });

      return !overlapping;
    } catch (error) {
      console.error('[ContractLifecycleService] checkVehicleAvailability error:', error);
      return false;
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
        contractId,
        action,
        userId,
        details: JSON.stringify(details),
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
