/**
 * PaymentService - Per Master Spec §7.5.2
 * 
 * Handles all payment operations with proper direction tracking.
 * 
 * Services:
 * - recordPayment(ContractId, PaymentCommand): Payment
 * - recordRefund(ContractId, RefundCommand): Payment
 * - recordExcessPayment(ContractId, ExcessPaymentCommand): Payment
 * 
 * Internal Steps:
 * - Insert payments line with direction IN/OUT
 * - Recalculate contracts.total_payments_in/out/outstanding_amount
 * - Write audit
 * - Emit PaymentRecorded domain event → NotificationService
 */

import { db } from "../db";
import { contracts, payments, auditLogs } from "@shared/schema";
import { eq, and, sql, sum } from "drizzle-orm";
import { triggerNotification } from "./notificationTrigger";

// Payment Direction per Master Spec §4.8.1
export const PaymentDirection = {
  IN: 'IN',   // Money received (rent, deposit, excess)
  OUT: 'OUT', // Money paid out (refunds, payouts)
} as const;

// Payment Type per Master Spec §4.8.1
export const PaymentType = {
  RENT: 'RENT',
  DEPOSIT: 'DEPOSIT',
  REFUND: 'REFUND',
  EXCESS: 'EXCESS',
  OTHER: 'OTHER',
} as const;

// Payment Status per Master Spec §4.8.1
export const PaymentStatus = {
  CONFIRMED: 'CONFIRMED',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

// Domain Event
export interface PaymentRecordedEvent {
  type: 'PaymentRecorded';
  timestamp: Date;
  paymentId: string;
  contractId: string;
  direction: string;
  amount: number;
  paymentType: string;
}

// Command DTOs
export interface RecordPaymentCommand {
  contractId: string;
  amount: number;
  paymentMethod: string;
  paymentType?: string;
  currency?: string;
  chequeNumber?: string;
  last4Digits?: string;
  referenceNumber?: string;
  notes?: string;
  paidAt?: Date;
  createdBy: string;
}

export interface RecordRefundCommand {
  contractId: string;
  amount: number;
  refundMethod: string;
  reason?: string;
  notes?: string;
  createdBy: string;
}

export interface RecordExcessPaymentCommand {
  contractId: string;
  incidentId?: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
  createdBy: string;
}

// Result type
export interface PaymentResult {
  success: boolean;
  payment?: any;
  error?: string;
  newOutstandingAmount?: number;
  event?: PaymentRecordedEvent;
}

class PaymentService {
  /**
   * Per Master Spec §7.5.2 - Record Payment (Direction: IN)
   * For rent payments, deposits received, etc.
   */
  async recordPayment(command: RecordPaymentCommand): Promise<PaymentResult> {
    try {
      // Validate contract exists
      const contract = await db.query.contracts.findFirst({
        where: eq(contracts.id, command.contractId)
      });

      if (!contract) {
        return { success: false, error: 'Contract not found' };
      }

      // Validate amount is positive
      if (command.amount <= 0) {
        return { success: false, error: 'Payment amount must be positive' };
      }

      // Validate payment method details per Master Spec
      if (command.paymentMethod === 'cheque' && !command.chequeNumber) {
        return { success: false, error: 'Cheque number required for cheque payments' };
      }
      if (command.paymentMethod === 'card' && !command.last4Digits) {
        return { success: false, error: 'Last 4 digits required for card payments' };
      }

      const now = new Date();
      const paymentType = command.paymentType || PaymentType.RENT;

      // Insert payment with direction IN
      const [payment] = await db.insert(payments).values({
        contractId: command.contractId,
        branchId: contract.branchId,
        direction: PaymentDirection.IN,
        paymentType,
        paymentStatus: PaymentStatus.CONFIRMED,
        amount: command.amount.toFixed(2),
        paymentMethod: command.paymentMethod,
        currency: command.currency || 'AED',
        chequeNumber: command.chequeNumber,
        last4Digits: command.last4Digits,
        referenceNumber: command.referenceNumber,
        notes: command.notes,
        paidAt: command.paidAt || now,
        createdBy: command.createdBy,
      }).returning();

      // Recalculate contract totals
      const newOutstandingAmount = await this.recalculateContractTotals(command.contractId);

      // Update deposit received if this is a deposit payment
      if (paymentType === PaymentType.DEPOSIT) {
        const depositPayments = await db.select({
          total: sql<string>`COALESCE(SUM(${payments.amount}), '0')`
        })
        .from(payments)
        .where(and(
          eq(payments.contractId, command.contractId),
          eq(payments.direction, PaymentDirection.IN),
          eq(payments.paymentType, PaymentType.DEPOSIT)
        ));

        await db.update(contracts)
          .set({
            depositReceived: depositPayments[0]?.total || '0',
            updatedAt: now,
          })
          .where(eq(contracts.id, command.contractId));
      }

      // Create audit log
      await this.createAuditLog(payment.id, 'PAYMENT_RECORDED', command.createdBy, {
        contractId: command.contractId,
        direction: PaymentDirection.IN,
        amount: command.amount,
        paymentType,
        paymentMethod: command.paymentMethod,
      });

      // Emit PaymentRecorded event
      const event: PaymentRecordedEvent = {
        type: 'PaymentRecorded',
        timestamp: now,
        paymentId: payment.id,
        contractId: command.contractId,
        direction: PaymentDirection.IN,
        amount: command.amount,
        paymentType,
      };

      // Trigger payment confirmation notification
      await this.triggerPaymentConfirmation(payment, contract);

      return {
        success: true,
        payment,
        newOutstandingAmount,
        event,
      };
    } catch (error: any) {
      console.error('[PaymentService] recordPayment error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Per Master Spec §7.5.2 - Record Refund (Direction: OUT)
   * For deposit refunds, excess refunds, etc.
   */
  async recordRefund(command: RecordRefundCommand): Promise<PaymentResult> {
    try {
      const contract = await db.query.contracts.findFirst({
        where: eq(contracts.id, command.contractId)
      });

      if (!contract) {
        return { success: false, error: 'Contract not found' };
      }

      // Validate amount is positive
      if (command.amount <= 0) {
        return { success: false, error: 'Refund amount must be positive' };
      }

      // Per Master Spec - Validate refund doesn't exceed what was received
      const totalPaymentsIn = await db.select({
        total: sql<string>`COALESCE(SUM(${payments.amount}), '0')`
      })
      .from(payments)
      .where(and(
        eq(payments.contractId, command.contractId),
        eq(payments.direction, PaymentDirection.IN)
      ));

      const totalRefunds = await db.select({
        total: sql<string>`COALESCE(SUM(${payments.amount}), '0')`
      })
      .from(payments)
      .where(and(
        eq(payments.contractId, command.contractId),
        eq(payments.direction, PaymentDirection.OUT)
      ));

      const availableForRefund = parseFloat(totalPaymentsIn[0]?.total || '0') - parseFloat(totalRefunds[0]?.total || '0');

      if (command.amount > availableForRefund) {
        return { success: false, error: `Refund amount ${command.amount} exceeds available balance ${availableForRefund}` };
      }

      const now = new Date();

      // Insert refund payment with direction OUT
      const [payment] = await db.insert(payments).values({
        contractId: command.contractId,
        branchId: contract.branchId,
        direction: PaymentDirection.OUT,
        paymentType: PaymentType.REFUND,
        paymentStatus: PaymentStatus.CONFIRMED,
        amount: command.amount.toFixed(2),
        paymentMethod: command.refundMethod,
        currency: 'AED',
        notes: command.notes || command.reason,
        paidAt: now,
        createdBy: command.createdBy,
      }).returning();

      // Recalculate contract totals
      const newOutstandingAmount = await this.recalculateContractTotals(command.contractId);

      // Update deposit refunded
      const depositRefunds = await db.select({
        total: sql<string>`COALESCE(SUM(${payments.amount}), '0')`
      })
      .from(payments)
      .where(and(
        eq(payments.contractId, command.contractId),
        eq(payments.direction, PaymentDirection.OUT),
        eq(payments.paymentType, PaymentType.REFUND)
      ));

      await db.update(contracts)
        .set({
          depositRefunded: depositRefunds[0]?.total || '0',
          updatedAt: now,
        })
        .where(eq(contracts.id, command.contractId));

      // Create audit log
      await this.createAuditLog(payment.id, 'REFUND_RECORDED', command.createdBy, {
        contractId: command.contractId,
        direction: PaymentDirection.OUT,
        amount: command.amount,
        reason: command.reason,
      });

      // Emit PaymentRecorded event
      const event: PaymentRecordedEvent = {
        type: 'PaymentRecorded',
        timestamp: now,
        paymentId: payment.id,
        contractId: command.contractId,
        direction: PaymentDirection.OUT,
        amount: command.amount,
        paymentType: PaymentType.REFUND,
      };

      // Trigger refund confirmation notification
      await this.triggerRefundConfirmation(payment, contract);

      return {
        success: true,
        payment,
        newOutstandingAmount,
        event,
      };
    } catch (error: any) {
      console.error('[PaymentService] recordRefund error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Per Master Spec §7.5.2 - Record Excess Payment (Direction: IN)
   * For insurance excess payments related to incidents.
   */
  async recordExcessPayment(command: RecordExcessPaymentCommand): Promise<PaymentResult> {
    try {
      const contract = await db.query.contracts.findFirst({
        where: eq(contracts.id, command.contractId)
      });

      if (!contract) {
        return { success: false, error: 'Contract not found' };
      }

      if (command.amount <= 0) {
        return { success: false, error: 'Excess payment amount must be positive' };
      }

      const now = new Date();

      // Insert excess payment with direction IN
      const [payment] = await db.insert(payments).values({
        contractId: command.contractId,
        branchId: contract.branchId,
        direction: PaymentDirection.IN,
        paymentType: PaymentType.EXCESS,
        paymentStatus: PaymentStatus.CONFIRMED,
        amount: command.amount.toFixed(2),
        paymentMethod: command.paymentMethod,
        currency: 'AED',
        notes: command.notes,
        referenceNumber: command.incidentId,
        paidAt: now,
        createdBy: command.createdBy,
      }).returning();

      // Recalculate contract totals
      const newOutstandingAmount = await this.recalculateContractTotals(command.contractId);

      // Create audit log
      await this.createAuditLog(payment.id, 'EXCESS_PAYMENT_RECORDED', command.createdBy, {
        contractId: command.contractId,
        incidentId: command.incidentId,
        amount: command.amount,
      });

      // Emit PaymentRecorded event
      const event: PaymentRecordedEvent = {
        type: 'PaymentRecorded',
        timestamp: now,
        paymentId: payment.id,
        contractId: command.contractId,
        direction: PaymentDirection.IN,
        amount: command.amount,
        paymentType: PaymentType.EXCESS,
      };

      return {
        success: true,
        payment,
        newOutstandingAmount,
        event,
      };
    } catch (error: any) {
      console.error('[PaymentService] recordExcessPayment error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Per Master Spec - Recalculate contract payment totals
   * Updates total_payments_in, total_payments_out, outstanding_amount
   */
  async recalculateContractTotals(contractId: string): Promise<number> {
    // Get total payments IN
    const paymentsInResult = await db.select({
      total: sql<string>`COALESCE(SUM(${payments.amount}), '0')`
    })
    .from(payments)
    .where(and(
      eq(payments.contractId, contractId),
      eq(payments.direction, PaymentDirection.IN),
      eq(payments.paymentStatus, PaymentStatus.CONFIRMED)
    ));

    // Get total payments OUT
    const paymentsOutResult = await db.select({
      total: sql<string>`COALESCE(SUM(${payments.amount}), '0')`
    })
    .from(payments)
    .where(and(
      eq(payments.contractId, contractId),
      eq(payments.direction, PaymentDirection.OUT),
      eq(payments.paymentStatus, PaymentStatus.CONFIRMED)
    ));

    const totalIn = parseFloat(paymentsInResult[0]?.total || '0');
    const totalOut = parseFloat(paymentsOutResult[0]?.total || '0');

    // Get contract charges total
    const contract = await db.query.contracts.findFirst({
      where: eq(contracts.id, contractId)
    });

    const totalCharges = parseFloat(contract?.totalCharges?.toString() || '0');
    
    // Outstanding = Total Charges - (Payments In - Payments Out)
    const netPayments = totalIn - totalOut;
    const outstandingAmount = Math.max(0, totalCharges - netPayments);

    // Update contract
    await db.update(contracts)
      .set({
        totalPaymentsIn: totalIn.toFixed(2),
        totalPaymentsOut: totalOut.toFixed(2),
        outstandingAmount: outstandingAmount.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(contracts.id, contractId));

    return outstandingAmount;
  }

  /**
   * Get payment summary for a contract
   */
  async getPaymentSummary(contractId: string): Promise<{
    totalIn: number;
    totalOut: number;
    outstandingAmount: number;
    payments: any[];
  }> {
    const contractPayments = await db.query.payments.findMany({
      where: eq(payments.contractId, contractId),
      orderBy: (payments, { desc }) => [desc(payments.paidAt)],
    });

    const totalIn = contractPayments
      .filter(p => p.direction === PaymentDirection.IN && p.paymentStatus === PaymentStatus.CONFIRMED)
      .reduce((sum, p) => sum + parseFloat(p.amount?.toString() || '0'), 0);

    const totalOut = contractPayments
      .filter(p => p.direction === PaymentDirection.OUT && p.paymentStatus === PaymentStatus.CONFIRMED)
      .reduce((sum, p) => sum + parseFloat(p.amount?.toString() || '0'), 0);

    const contract = await db.query.contracts.findFirst({
      where: eq(contracts.id, contractId)
    });

    const outstandingAmount = parseFloat(contract?.outstandingAmount?.toString() || '0');

    return {
      totalIn,
      totalOut,
      outstandingAmount,
      payments: contractPayments,
    };
  }

  /**
   * Create audit log entry
   */
  private async createAuditLog(
    paymentId: string,
    action: string,
    userId: string,
    details: Record<string, any>,
    contractId?: string
  ): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        contractId: contractId || null,
        action,
        userId,
        details: JSON.stringify({ ...details, paymentId }),
      });
    } catch (error) {
      console.error('[PaymentService] Failed to create audit log:', error);
    }
  }

  /**
   * Trigger payment confirmation notification per Master Spec
   */
  private async triggerPaymentConfirmation(payment: any, contract: any): Promise<void> {
    try {
      await triggerNotification('PAYMENT_CONFIRMATION', {
        contractId: contract.id,
        customerId: contract.customerId,
        contractNumber: contract.contractNumber,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paymentType: payment.paymentType,
        direction: payment.direction,
      });
    } catch (error) {
      console.error('[PaymentService] Failed to trigger payment confirmation:', error);
    }
  }

  /**
   * Trigger refund confirmation notification
   */
  private async triggerRefundConfirmation(payment: any, contract: any): Promise<void> {
    try {
      await triggerNotification('REFUND_CONFIRMATION', {
        contractId: contract.id,
        customerId: contract.customerId,
        contractNumber: contract.contractNumber,
        amount: payment.amount,
        refundMethod: payment.paymentMethod,
      });
    } catch (error) {
      console.error('[PaymentService] Failed to trigger refund confirmation:', error);
    }
  }
}

export const paymentService = new PaymentService();
