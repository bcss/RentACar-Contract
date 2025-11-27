/**
 * DepositService - Per Master Spec §7.5.2
 * Handles deposit settlement workflow including:
 * - determineRequiredDeposit(ContractId): DepositRuleResult
 * - recordDepositPayment (via PaymentService with deposit tagging)
 * - applyDepositOnClosure(ContractId): DepositAdjustmentResult
 * 
 * Rules per spec:
 * - Handles deposit modes (pre-auth vs charge)
 * - Computes how much deposit can be applied toward rent
 * - Deposit refund cannot exceed received
 */

import { db } from "../db";
import { contracts, payments, vehicles, vehicleClasses, branches, companySettings, customers } from "@shared/schema";
import { eq, and, sum, sql } from "drizzle-orm";

// Types per spec
export interface DepositRuleResult {
  contractId: string;
  requiredDeposit: number;
  depositMode: 'PRE_AUTH' | 'CHARGE';
  minimumRequired: number;
  vehicleClassMultiplier: number;
  riskAdjustment: number;
  notes: string[];
}

export interface DepositAdjustmentResult {
  contractId: string;
  totalDepositReceived: number;
  amountAppliedToRent: number;
  amountAppliedToExcess: number;
  amountAppliedToDamage: number;
  amountRefundable: number;
  refundMethod: 'ORIGINAL_METHOD' | 'CASH' | 'BANK_TRANSFER';
  notes: string[];
}

export interface DepositStatus {
  contractId: string;
  depositExpected: number;
  depositReceived: number;
  depositRefunded: number;
  depositBalance: number;
  isDepositSatisfied: boolean;
}

class DepositService {
  /**
   * Per Master Spec §7.5.2 - Determine required deposit for a contract
   * Takes into account:
   * - Base deposit from org settings
   * - Vehicle class multiplier
   * - Customer risk score adjustment
   */
  async determineRequiredDeposit(contractId: string): Promise<DepositRuleResult> {
    const notes: string[] = [];

    // Get contract with related vehicle and customer
    const contract = await db.query.contracts.findFirst({
      where: eq(contracts.id, contractId),
      with: {
        vehicle: true,
        customer: true,
      }
    });

    if (!contract) {
      throw new Error(`Contract not found: ${contractId}`);
    }

    // Get base deposit - default 1000 AED per spec
    const baseDeposit = 1000; // Default 1000 AED
    const depositMode = 'CHARGE' as 'PRE_AUTH' | 'CHARGE'; // Default to charge mode
    notes.push(`Base deposit: ${baseDeposit} AED`);

    // Get vehicle class default deposit if vehicle has a class
    let vehicleClassMultiplier = 1.0;
    if (contract.vehicle?.vehicleClassId) {
      const vClass = await db.query.vehicleClasses.findFirst({
        where: eq(vehicleClasses.id, contract.vehicle.vehicleClassId)
      });
      if (vClass?.defaultDeposit) {
        const classDeposit = parseFloat(vClass.defaultDeposit);
        vehicleClassMultiplier = classDeposit / baseDeposit;
        notes.push(`Vehicle class deposit factor: ${vehicleClassMultiplier.toFixed(2)}`);
      }
    }

    // Apply risk adjustment - for now use a default low-risk value
    // In production, this would fetch from customerRiskScores table
    let riskAdjustment = 0;
    // Risk-based deposit adjustments would go here when customer risk scoring is fully implemented
    notes.push(`Risk adjustment: ${riskAdjustment} AED`);

    // First-time customer handling - simplified
    // In production, would check contract count for customer
    const isFirstTimeCustomer = false; // Would be calculated from customer contract history
    if (isFirstTimeCustomer) {
      riskAdjustment += baseDeposit * 0.1; // 10% extra for first-time
      notes.push(`First-time customer: +10% adjustment`);
    }

    // Calculate final required deposit - enforcing minimum per spec
    const calculatedDeposit = (baseDeposit * vehicleClassMultiplier) + riskAdjustment;
    const minimumRequired = 500; // Absolute minimum 500 AED per spec
    // CRITICAL: requiredDeposit MUST be at least minimumRequired per spec §7.5.2
    const requiredDeposit = Math.round(Math.max(minimumRequired, calculatedDeposit) * 100) / 100;

    notes.push(`Calculated deposit: ${calculatedDeposit} AED`);
    notes.push(`Minimum required: ${minimumRequired} AED`);
    notes.push(`Final required deposit (enforced minimum): ${requiredDeposit} AED`);

    return {
      contractId,
      requiredDeposit,
      depositMode,
      minimumRequired,
      vehicleClassMultiplier,
      riskAdjustment,
      notes
    };
  }

  /**
   * Per Master Spec §7.5.2 - Apply deposit on contract closure
   * Priority order per spec D.3:
   * 1. Excess charges (EXTRA_KM, FUEL, LATE_RETURN fees)
   * 2. Damage charges  
   * 3. Outstanding rent
   * 4. Refund remaining (CRITICAL: Cannot exceed received)
   */
  async applyDepositOnClosure(contractId: string): Promise<DepositAdjustmentResult> {
    const notes: string[] = [];

    // Get contract with charges
    const contract = await db.query.contracts.findFirst({
      where: eq(contracts.id, contractId)
    });

    if (!contract) {
      throw new Error(`Contract not found: ${contractId}`);
    }

    // Get deposit payments (paymentType = 'DEPOSIT', direction = 'IN')
    const depositPayments = await db.select({
      totalIn: sum(payments.amount)
    })
    .from(payments)
    .where(
      and(
        eq(payments.contractId, contractId),
        eq(payments.paymentType, 'DEPOSIT'),
        eq(payments.direction, 'IN'),
        eq(payments.paymentStatus, 'CONFIRMED')
      )
    );

    // Get deposit refunds already processed
    const depositRefunds = await db.select({
      totalOut: sum(payments.amount)
    })
    .from(payments)
    .where(
      and(
        eq(payments.contractId, contractId),
        eq(payments.paymentType, 'DEPOSIT'),
        eq(payments.direction, 'OUT'),
        eq(payments.paymentStatus, 'CONFIRMED')
      )
    );

    const totalDepositReceived = parseFloat(depositPayments[0]?.totalIn ?? '0');
    const totalDepositRefunded = parseFloat(depositRefunds[0]?.totalOut ?? '0');
    const availableDeposit = totalDepositReceived - totalDepositRefunded;
    
    notes.push(`Total deposit received: ${totalDepositReceived} AED`);
    notes.push(`Already refunded: ${totalDepositRefunded} AED`);
    notes.push(`Available for settlement: ${availableDeposit} AED`);

    // Get outstanding charges by category from contract
    // Per Master Spec, excess charges (fuel, extra km, late return) stored in contract_charges table
    // For deposit application, use the totals from the contract record
    const fuelCharges = parseFloat(contract.fuelCharge ?? '0');
    const damageCharges = parseFloat(contract.damageCharge ?? '0');
    const excessCharges = fuelCharges; // Other excess charges would come from contract_charges aggregation
    const rentBalance = Math.max(0, parseFloat(contract.outstandingAmount ?? '0') - excessCharges - damageCharges);
    
    // Initialize allocation
    let amountAppliedToExcess = 0;
    let amountAppliedToDamage = 0;
    let amountAppliedToRent = 0;
    let remainingDeposit = availableDeposit;

    // Priority 1: Apply to excess charges first (per spec D.3)
    if (excessCharges > 0 && remainingDeposit > 0) {
      amountAppliedToExcess = Math.min(excessCharges, remainingDeposit);
      remainingDeposit -= amountAppliedToExcess;
      notes.push(`Applied ${amountAppliedToExcess} AED to excess charges (KM/Fuel/Late fees)`);
    }

    // Priority 2: Apply to damage charges
    if (damageCharges > 0 && remainingDeposit > 0) {
      amountAppliedToDamage = Math.min(damageCharges, remainingDeposit);
      remainingDeposit -= amountAppliedToDamage;
      notes.push(`Applied ${amountAppliedToDamage} AED to damage charges`);
    }

    // Priority 3: Apply to outstanding rent
    if (rentBalance > 0 && remainingDeposit > 0) {
      amountAppliedToRent = Math.min(rentBalance, remainingDeposit);
      remainingDeposit -= amountAppliedToRent;
      notes.push(`Applied ${amountAppliedToRent} AED to outstanding rent`);
    }

    // Priority 4: Refund remaining (CRITICAL: Cannot exceed received - applied)
    // This enforces spec rule: refund ≤ (received − applied)
    const amountRefundable = Math.max(0, Math.min(remainingDeposit, totalDepositReceived - totalDepositRefunded - amountAppliedToExcess - amountAppliedToDamage - amountAppliedToRent));
    notes.push(`Refundable amount: ${amountRefundable} AED (cap enforced: cannot exceed received - applied)`);

    // Determine refund method based on original payment method
    const originalDepositPayment = await db.query.payments.findFirst({
      where: and(
        eq(payments.contractId, contractId),
        eq(payments.paymentType, 'DEPOSIT'),
        eq(payments.direction, 'IN')
      )
    });

    let refundMethod: 'ORIGINAL_METHOD' | 'CASH' | 'BANK_TRANSFER' = 'ORIGINAL_METHOD';
    if (originalDepositPayment?.paymentMethod === 'cash') {
      refundMethod = 'CASH';
    } else if (originalDepositPayment?.paymentMethod === 'card') {
      refundMethod = 'ORIGINAL_METHOD';
    } else {
      refundMethod = 'BANK_TRANSFER';
    }

    return {
      contractId,
      totalDepositReceived,
      amountAppliedToRent,
      amountAppliedToExcess,
      amountAppliedToDamage,
      amountRefundable,
      refundMethod,
      notes
    };
  }

  /**
   * Get current deposit status for a contract
   */
  async getDepositStatus(contractId: string): Promise<DepositStatus> {
    // Get contract
    const contract = await db.query.contracts.findFirst({
      where: eq(contracts.id, contractId)
    });

    if (!contract) {
      throw new Error(`Contract not found: ${contractId}`);
    }

    // Get deposit payments IN
    const depositIn = await db.select({
      total: sum(payments.amount)
    })
    .from(payments)
    .where(
      and(
        eq(payments.contractId, contractId),
        eq(payments.paymentType, 'DEPOSIT'),
        eq(payments.direction, 'IN'),
        eq(payments.paymentStatus, 'CONFIRMED')
      )
    );

    // Get deposit payments OUT (refunds)
    const depositOut = await db.select({
      total: sum(payments.amount)
    })
    .from(payments)
    .where(
      and(
        eq(payments.contractId, contractId),
        eq(payments.paymentType, 'DEPOSIT'),
        eq(payments.direction, 'OUT'),
        eq(payments.paymentStatus, 'CONFIRMED')
      )
    );

    const depositExpected = parseFloat(contract.depositExpected ?? contract.securityDeposit ?? '0');
    const depositReceived = parseFloat(depositIn[0]?.total ?? '0');
    const depositRefunded = parseFloat(depositOut[0]?.total ?? '0');
    const depositBalance = depositReceived - depositRefunded;

    return {
      contractId,
      depositExpected,
      depositReceived,
      depositRefunded,
      depositBalance,
      isDepositSatisfied: depositReceived >= depositExpected
    };
  }

  /**
   * Per Master Spec - Check if deposit requirement is satisfied
   * Used in activation workflow validation
   */
  async checkDepositRequirement(contractId: string): Promise<{ satisfied: boolean; message: string }> {
    const status = await this.getDepositStatus(contractId);
    const requirement = await this.determineRequiredDeposit(contractId);

    if (status.depositReceived >= requirement.minimumRequired) {
      return {
        satisfied: true,
        message: `Deposit requirement satisfied: ${status.depositReceived} >= ${requirement.minimumRequired} AED`
      };
    }

    const shortfall = requirement.minimumRequired - status.depositReceived;
    return {
      satisfied: false,
      message: `Deposit shortfall: ${shortfall} AED required. Received: ${status.depositReceived}, Required: ${requirement.minimumRequired}`
    };
  }

  /**
   * Process deposit refund after contract closure
   * Creates a payment record for the refund
   */
  async processDepositRefund(
    contractId: string, 
    userId: string,
    options?: { 
      method?: 'CASH' | 'CARD' | 'BANK_TRANSFER';
      reference?: string;
      notes?: string;
    }
  ): Promise<{ success: boolean; refundAmount: number; paymentId?: string; message: string }> {
    // Get deposit adjustment result
    const adjustment = await this.applyDepositOnClosure(contractId);

    if (adjustment.amountRefundable <= 0) {
      return {
        success: true,
        refundAmount: 0,
        message: 'No refund due - deposit fully applied to charges'
      };
    }

    // Create refund payment record
    const refundPayment = await db.insert(payments).values({
      contractId,
      paymentType: 'DEPOSIT',
      direction: 'OUT',
      amount: adjustment.amountRefundable.toString(),
      paymentMethod: (options?.method?.toLowerCase() ?? adjustment.refundMethod === 'CASH' ? 'cash' : 'bank_transfer') as string,
      paymentStatus: 'CONFIRMED',
      referenceNumber: options?.reference,
      notes: options?.notes ?? `Deposit refund: ${adjustment.notes.join('; ')}`,
      paidAt: new Date(),
      createdBy: userId,
      currency: 'AED',
    }).returning();

    return {
      success: true,
      refundAmount: adjustment.amountRefundable,
      paymentId: refundPayment[0]?.id,
      message: `Deposit refund of ${adjustment.amountRefundable} AED processed successfully`
    };
  }
}

export const depositService = new DepositService();
