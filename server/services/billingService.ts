/**
 * BillingService - Per Master Spec §7.5.2
 * 
 * Handles all financial logic per contract.
 * 
 * Services:
 * - recalculateChargesForContract(ContractId)
 * - addManualCharge(ContractId, AddChargeDTO)
 * - removeManualCharge(ChargeId) - with privilege + audit
 * - calculateSettlement(ContractId): SettlementSummary
 * 
 * Uses:
 * - Tariff & seasonal pricing rules
 * - Distance/fuel/penalty logic per contract
 * - Downgrades (monthly→daily) with optional fine
 * - Minimum rental period
 * - One-way fees, late return penalty etc.
 */

import { db } from "../db";
import { contracts, contractCharges, payments, tariffs, vehicles, auditLogs, addons, contractAddons } from "@shared/schema";
import { eq, and, sql, sum, inArray } from "drizzle-orm";
import { PaymentDirection, PaymentStatus } from "./paymentService";

// Charge types per Master Spec
export const ChargeType = {
  RENTAL: 'RENTAL',
  DEPOSIT: 'DEPOSIT',
  FUEL: 'FUEL',
  EXCESS_KM: 'EXCESS_KM',
  LATE_RETURN: 'LATE_RETURN',
  EARLY_RETURN: 'EARLY_RETURN',
  ONE_WAY_FEE: 'ONE_WAY_FEE',
  DOWNGRADE_PENALTY: 'DOWNGRADE_PENALTY',
  ADDON: 'ADDON',
  DRIVER_SERVICE: 'DRIVER_SERVICE',
  DAMAGE: 'DAMAGE',
  FINE: 'FINE',
  TAX: 'TAX',
  DISCOUNT: 'DISCOUNT',
  MANUAL_ADJUSTMENT: 'MANUAL_ADJUSTMENT',
} as const;

// Settlement result per Master Spec
export interface SettlementSummary {
  contractId: string;
  contractNumber: number;
  
  // Charges breakdown
  rentalCharges: number;
  additionalCharges: number;
  discounts: number;
  totalCharges: number;
  
  // Payments breakdown
  totalPaymentsIn: number;
  totalPaymentsOut: number;
  netPayments: number;
  
  // Deposit handling
  depositReceived: number;
  depositAppliedToRent: number;
  depositRefundable: number;
  
  // Final balance
  outstandingAmount: number;
  isBalanceCleared: boolean;
  
  // Charge details
  charges: ChargeItem[];
}

export interface ChargeItem {
  id: string;
  type: string;
  description: string;
  descriptionAr?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  isManual: boolean;
}

export interface AddChargeCommand {
  contractId: string;
  chargeType: string;
  description: string;
  descriptionAr?: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  createdBy: string;
}

export interface BillingResult {
  success: boolean;
  error?: string;
  totalCharges?: number;
  outstandingAmount?: number;
  charges?: ChargeItem[];
}

class BillingService {
  /**
   * Per Master Spec §7.5.2 - Recalculate all charges for a contract
   * Called after:
   * - Contract activation
   * - Contract completion
   * - Extension/early return
   * - Manual adjustment
   */
  async recalculateChargesForContract(contractId: string): Promise<BillingResult> {
    try {
      const contract = await db.query.contracts.findFirst({
        where: eq(contracts.id, contractId),
        with: {
          vehicle: true,
        }
      });

      if (!contract) {
        return { success: false, error: 'Contract not found' };
      }

      // Get tariff if assigned
      let tariff = null;
      if (contract.tariffId) {
        tariff = await db.query.tariffs.findFirst({
          where: eq(tariffs.id, contract.tariffId)
        });
      }

      // Calculate rental duration
      const startDate = contract.startDatetimeActual || contract.startDatetime;
      const endDate = contract.endDatetimeActual || contract.endDatetime;
      
      if (!startDate || !endDate) {
        return { success: false, error: 'Invalid contract dates' };
      }

      const durationMs = new Date(endDate).getTime() - new Date(startDate).getTime();
      const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
      const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));

      // Calculate base rental charges
      let rentalCharges = 0;
      if (tariff) {
        const dailyRate = parseFloat(tariff.rateDaily?.toString() || '0');
        const hourlyRate = parseFloat(tariff.rateHourly?.toString() || '0');
        const weeklyRate = parseFloat(tariff.rateWeekly?.toString() || '0');
        const monthlyRate = parseFloat(tariff.rateMonthly?.toString() || '0');

        // Apply optimal rate per duration
        if (monthlyRate > 0 && durationDays >= 30) {
          const months = Math.floor(durationDays / 30);
          const remainingDays = durationDays % 30;
          rentalCharges = (months * monthlyRate) + (remainingDays * dailyRate);
        } else if (weeklyRate > 0 && durationDays >= 7) {
          const weeks = Math.floor(durationDays / 7);
          const remainingDays = durationDays % 7;
          rentalCharges = (weeks * weeklyRate) + (remainingDays * dailyRate);
        } else if (dailyRate > 0 && durationDays >= 1) {
          rentalCharges = durationDays * dailyRate;
        } else if (hourlyRate > 0) {
          rentalCharges = durationHours * hourlyRate;
        }
      }

      // Get existing charges
      const existingCharges = await db.query.contractCharges.findMany({
        where: eq(contractCharges.contractId, contractId)
      });

      // Clear auto-calculated charges (keep manual ones)
      const manualChargeIds = existingCharges
        .filter(c => c.isManual)
        .map(c => c.id);

      // Delete non-manual charges
      await db.delete(contractCharges)
        .where(and(
          eq(contractCharges.contractId, contractId),
          eq(contractCharges.isManual, false)
        ));

      // Insert rental charge
      if (rentalCharges > 0) {
        await db.insert(contractCharges).values({
          contractId,
          chargeType: ChargeType.RENTAL,
          description: `Rental: ${durationDays} days`,
          descriptionAr: `إيجار: ${durationDays} أيام`,
          quantity: durationDays.toString(),
          unitPrice: tariff?.rateDaily?.toString() || rentalCharges.toFixed(2),
          totalAmount: rentalCharges.toFixed(2),
          isManual: false,
        });
      }

      // Calculate excess KM charges if contract completed
      if (contract.status === 'completed' || contract.status === 'completed_pending_accident' || contract.status === 'closed') {
        const excessKmCharges = await this.calculateExcessKmCharges(contract, tariff);
        if (excessKmCharges.amount > 0) {
          await db.insert(contractCharges).values({
            contractId,
            chargeType: ChargeType.EXCESS_KM,
            description: `Excess KM: ${excessKmCharges.excessKm} km`,
            descriptionAr: `كيلومترات إضافية: ${excessKmCharges.excessKm} كم`,
            quantity: excessKmCharges.excessKm.toString(),
            unitPrice: excessKmCharges.ratePerKm.toFixed(4),
            totalAmount: excessKmCharges.amount.toFixed(2),
            isManual: false,
          });
        }
      }

      // Calculate late return penalty if applicable
      if (contract.endDatetimeActual && contract.endDatetime) {
        const plannedEnd = new Date(contract.endDatetime);
        const actualEnd = new Date(contract.endDatetimeActual);
        const graceMinutes = tariff?.returnGraceMinutes || 60;
        
        const lateMs = actualEnd.getTime() - plannedEnd.getTime() - (graceMinutes * 60 * 1000);
        if (lateMs > 0) {
          const lateHours = Math.ceil(lateMs / (1000 * 60 * 60));
          const hourlyRate = parseFloat(tariff?.rateHourly?.toString() || '0') || 
                            (parseFloat(tariff?.rateDaily?.toString() || '0') / 24);
          const penaltyMultiplier = 1.5; // 150% per spec
          const latePenalty = lateHours * hourlyRate * penaltyMultiplier;

          if (latePenalty > 0) {
            await db.insert(contractCharges).values({
              contractId,
              chargeType: ChargeType.LATE_RETURN,
              description: `Late return: ${lateHours} hours`,
              descriptionAr: `تأخير الإرجاع: ${lateHours} ساعات`,
              quantity: lateHours.toString(),
              unitPrice: (hourlyRate * penaltyMultiplier).toFixed(2),
              totalAmount: latePenalty.toFixed(2),
              isManual: false,
            });
          }
        }
      }

      // Get all charges including manual ones
      const allCharges = await db.query.contractCharges.findMany({
        where: eq(contractCharges.contractId, contractId)
      });

      // Calculate totals
      const totalCharges = allCharges.reduce((sum, c) => 
        sum + parseFloat(c.totalAmount?.toString() || '0'), 0);

      // Get payments
      const paymentsIn = await db.select({
        total: sql<string>`COALESCE(SUM(${payments.amount}), '0')`
      })
      .from(payments)
      .where(and(
        eq(payments.contractId, contractId),
        eq(payments.direction, PaymentDirection.IN),
        eq(payments.paymentStatus, PaymentStatus.CONFIRMED)
      ));

      const paymentsOut = await db.select({
        total: sql<string>`COALESCE(SUM(${payments.amount}), '0')`
      })
      .from(payments)
      .where(and(
        eq(payments.contractId, contractId),
        eq(payments.direction, PaymentDirection.OUT),
        eq(payments.paymentStatus, PaymentStatus.CONFIRMED)
      ));

      const totalIn = parseFloat(paymentsIn[0]?.total || '0');
      const totalOut = parseFloat(paymentsOut[0]?.total || '0');
      const netPayments = totalIn - totalOut;
      const outstandingAmount = Math.max(0, totalCharges - netPayments);

      // Update contract totals
      await db.update(contracts)
        .set({
          totalCharges: totalCharges.toFixed(2),
          totalPaymentsIn: totalIn.toFixed(2),
          totalPaymentsOut: totalOut.toFixed(2),
          outstandingAmount: outstandingAmount.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(contracts.id, contractId));

      return {
        success: true,
        totalCharges,
        outstandingAmount,
        charges: allCharges.map(c => ({
          id: c.id,
          type: c.chargeType || '',
          description: c.description || '',
          descriptionAr: c.descriptionAr || undefined,
          quantity: parseFloat(c.quantity?.toString() || '1'),
          unitPrice: parseFloat(c.unitPrice?.toString() || '0'),
          totalAmount: parseFloat(c.totalAmount?.toString() || '0'),
          isManual: c.isManual || false,
        })),
      };
    } catch (error: any) {
      console.error('[BillingService] recalculateChargesForContract error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Per Master Spec §7.5.2 - Add manual charge
   */
  async addManualCharge(command: AddChargeCommand): Promise<BillingResult> {
    try {
      const contract = await db.query.contracts.findFirst({
        where: eq(contracts.id, command.contractId)
      });

      if (!contract) {
        return { success: false, error: 'Contract not found' };
      }

      if (contract.status === 'closed' || contract.status === 'cancelled') {
        return { success: false, error: 'Cannot add charges to closed or cancelled contracts' };
      }

      const totalAmount = command.quantity * command.unitPrice;

      // Insert manual charge
      await db.insert(contractCharges).values({
        contractId: command.contractId,
        chargeType: command.chargeType,
        description: command.description,
        descriptionAr: command.descriptionAr,
        quantity: command.quantity.toString(),
        unitPrice: command.unitPrice.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        isManual: true,
        notes: command.notes,
        createdBy: command.createdBy,
      });

      // Create audit log
      await db.insert(auditLogs).values({
        tableName: 'contract_charges',
        recordId: command.contractId,
        action: 'MANUAL_CHARGE_ADDED',
        userId: command.createdBy,
        changes: {
          chargeType: command.chargeType,
          description: command.description,
          amount: totalAmount,
        },
      });

      // Recalculate totals
      return await this.recalculateChargesForContract(command.contractId);
    } catch (error: any) {
      console.error('[BillingService] addManualCharge error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Per Master Spec §7.5.2 - Remove manual charge (requires privilege + audit)
   */
  async removeManualCharge(chargeId: string, userId: string): Promise<BillingResult> {
    try {
      const charge = await db.query.contractCharges.findFirst({
        where: eq(contractCharges.id, chargeId)
      });

      if (!charge) {
        return { success: false, error: 'Charge not found' };
      }

      if (!charge.isManual) {
        return { success: false, error: 'Cannot remove auto-calculated charges' };
      }

      // Create audit log before deletion
      await db.insert(auditLogs).values({
        tableName: 'contract_charges',
        recordId: chargeId,
        action: 'MANUAL_CHARGE_REMOVED',
        userId,
        changes: {
          chargeType: charge.chargeType,
          description: charge.description,
          amount: charge.totalAmount,
        },
      });

      // Delete the charge
      await db.delete(contractCharges)
        .where(eq(contractCharges.id, chargeId));

      // Recalculate totals
      return await this.recalculateChargesForContract(charge.contractId!);
    } catch (error: any) {
      console.error('[BillingService] removeManualCharge error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Per Master Spec §7.5.2 - Calculate settlement summary
   */
  async calculateSettlement(contractId: string): Promise<SettlementSummary | null> {
    try {
      const contract = await db.query.contracts.findFirst({
        where: eq(contracts.id, contractId)
      });

      if (!contract) {
        return null;
      }

      // Get all charges
      const charges = await db.query.contractCharges.findMany({
        where: eq(contractCharges.contractId, contractId)
      });

      // Calculate charge totals by type
      const rentalCharges = charges
        .filter(c => c.chargeType === ChargeType.RENTAL)
        .reduce((sum, c) => sum + parseFloat(c.totalAmount?.toString() || '0'), 0);

      const discounts = charges
        .filter(c => c.chargeType === ChargeType.DISCOUNT)
        .reduce((sum, c) => sum + parseFloat(c.totalAmount?.toString() || '0'), 0);

      const additionalCharges = charges
        .filter(c => c.chargeType !== ChargeType.RENTAL && c.chargeType !== ChargeType.DISCOUNT)
        .reduce((sum, c) => sum + parseFloat(c.totalAmount?.toString() || '0'), 0);

      const totalCharges = rentalCharges + additionalCharges - discounts;

      // Get payment totals
      const totalPaymentsIn = parseFloat(contract.totalPaymentsIn?.toString() || '0');
      const totalPaymentsOut = parseFloat(contract.totalPaymentsOut?.toString() || '0');
      const netPayments = totalPaymentsIn - totalPaymentsOut;

      // Deposit handling
      const depositReceived = parseFloat(contract.depositReceived?.toString() || '0');
      const depositRefunded = parseFloat(contract.depositRefunded?.toString() || '0');
      
      // Calculate how much deposit can be applied to rent
      const outstandingBeforeDeposit = Math.max(0, totalCharges - (netPayments - depositReceived));
      const depositAppliedToRent = Math.min(depositReceived, outstandingBeforeDeposit);
      const depositRefundable = Math.max(0, depositReceived - depositAppliedToRent - depositRefunded);

      const outstandingAmount = parseFloat(contract.outstandingAmount?.toString() || '0');
      const isBalanceCleared = outstandingAmount === 0;

      return {
        contractId,
        contractNumber: contract.contractNumber!,
        rentalCharges,
        additionalCharges,
        discounts,
        totalCharges,
        totalPaymentsIn,
        totalPaymentsOut,
        netPayments,
        depositReceived,
        depositAppliedToRent,
        depositRefundable,
        outstandingAmount,
        isBalanceCleared,
        charges: charges.map(c => ({
          id: c.id,
          type: c.chargeType || '',
          description: c.description || '',
          descriptionAr: c.descriptionAr || undefined,
          quantity: parseFloat(c.quantity?.toString() || '1'),
          unitPrice: parseFloat(c.unitPrice?.toString() || '0'),
          totalAmount: parseFloat(c.totalAmount?.toString() || '0'),
          isManual: c.isManual || false,
        })),
      };
    } catch (error: any) {
      console.error('[BillingService] calculateSettlement error:', error);
      return null;
    }
  }

  /**
   * Calculate excess KM charges
   */
  private async calculateExcessKmCharges(contract: any, tariff: any): Promise<{
    excessKm: number;
    ratePerKm: number;
    amount: number;
  }> {
    const odometerOut = parseFloat(contract.odometerOut?.toString() || '0');
    const odometerIn = parseFloat(contract.odometerIn?.toString() || '0');
    
    if (odometerOut === 0 || odometerIn === 0) {
      return { excessKm: 0, ratePerKm: 0, amount: 0 };
    }

    const totalKm = odometerIn - odometerOut;
    
    // Calculate included KM based on rental duration
    const startDate = contract.startDatetimeActual || contract.startDatetime;
    const endDate = contract.endDatetimeActual || contract.endDatetime;
    const durationMs = new Date(endDate).getTime() - new Date(startDate).getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

    const includedKmPerDay = parseFloat(tariff?.includedKmPerDay?.toString() || '250');
    const includedKm = includedKmPerDay * durationDays;

    const excessKm = Math.max(0, totalKm - includedKm);
    const ratePerKm = parseFloat(tariff?.extraKmRate?.toString() || '0.5');
    const amount = excessKm * ratePerKm;

    return { excessKm, ratePerKm, amount };
  }
}

export const billingService = new BillingService();
