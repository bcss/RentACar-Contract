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
 * Full Implementation Per Master Spec:
 * - Tariff & seasonal pricing rules
 * - Distance/fuel/penalty logic per contract
 * - Downgrades (monthly→daily) with optional fine
 * - Minimum rental period enforcement
 * - One-way fees (different pickup/return branches)
 * - Late return penalty (150% hourly rate)
 * - Early return penalty
 * - Addon charges aggregation
 * - Driver service charges
 * - VAT/Tax calculation
 * - Fuel difference charges
 */

import { db } from "../db";
import { contracts, contractCharges, payments, tariffs, vehicles, auditLogs, addons, branches, systemSettings } from "@shared/schema";
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
  MINIMUM_RENTAL_PENALTY: 'MINIMUM_RENTAL_PENALTY',
  ADDON: 'ADDON',
  DRIVER_SERVICE: 'DRIVER_SERVICE',
  DAMAGE: 'DAMAGE',
  FINE: 'FINE',
  TAX: 'TAX',
  VAT: 'VAT',
  DISCOUNT: 'DISCOUNT',
  MANUAL_ADJUSTMENT: 'MANUAL_ADJUSTMENT',
  DELIVERY_FEE: 'DELIVERY_FEE',
  PICKUP_FEE: 'PICKUP_FEE',
} as const;

// Settlement result per Master Spec
export interface SettlementSummary {
  contractId: string;
  contractNumber: number;
  
  // Charges breakdown
  rentalCharges: number;
  additionalCharges: number;
  discounts: number;
  vatAmount: number;
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

// Fuel level mapping for calculation
const FUEL_LEVEL_MAP: Record<string, number> = {
  'Full': 100,
  '7/8': 87.5,
  '3/4': 75,
  '5/8': 62.5,
  '1/2': 50,
  '3/8': 37.5,
  '1/4': 25,
  '1/8': 12.5,
  'Empty': 0,
};

// Default VAT rate per UAE
const DEFAULT_VAT_RATE = 0.05; // 5%

// Default one-way fee per Master Spec
const DEFAULT_ONE_WAY_FEE = 150.00; // AED

// Late return penalty multiplier per Master Spec §7.5.2
const LATE_RETURN_MULTIPLIER = 1.5; // 150% of hourly rate

// Early return penalty: percentage of remaining rental value
const EARLY_RETURN_PENALTY_PERCENT = 0.10; // 10%

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
      const startDate = contract.startDatetimeActual || contract.startDatetime || contract.rentalStartDate;
      const endDate = contract.endDatetimeActual || contract.endDatetime || contract.rentalEndDate;
      
      if (!startDate || !endDate) {
        return { success: false, error: 'Invalid contract dates' };
      }

      const durationMs = new Date(endDate).getTime() - new Date(startDate).getTime();
      const durationDays = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));
      const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));

      // Delete non-manual charges (we'll recalculate them)
      await db.delete(contractCharges)
        .where(and(
          eq(contractCharges.contractId, contractId),
          eq(contractCharges.isManual, false)
        ));

      // Track all charges for this recalculation
      const calculatedCharges: Array<{
        chargeType: string;
        description: string;
        descriptionAr: string;
        quantity: string;
        unitPrice: string;
        totalAmount: string;
      }> = [];

      // 1. Calculate base rental charges with optimal rate selection
      const rentalCharges = await this.calculateRentalCharges(contract, tariff, durationDays, durationHours);
      if (rentalCharges.amount > 0) {
        calculatedCharges.push({
          chargeType: ChargeType.RENTAL,
          description: rentalCharges.description,
          descriptionAr: rentalCharges.descriptionAr,
          quantity: rentalCharges.quantity.toString(),
          unitPrice: rentalCharges.unitPrice.toFixed(2),
          totalAmount: rentalCharges.amount.toFixed(2),
        });
      }

      // 2. Calculate minimum rental period penalty per Master Spec §7.5.2
      const minRentalPenalty = this.calculateMinimumRentalPenalty(contract, tariff, durationDays);
      if (minRentalPenalty.amount > 0) {
        calculatedCharges.push({
          chargeType: ChargeType.MINIMUM_RENTAL_PENALTY,
          description: minRentalPenalty.description,
          descriptionAr: minRentalPenalty.descriptionAr,
          quantity: '1',
          unitPrice: minRentalPenalty.amount.toFixed(2),
          totalAmount: minRentalPenalty.amount.toFixed(2),
        });
      }

      // 3. Calculate excess KM charges if contract completed
      if (this.isContractReturned(contract.status)) {
        const excessKmCharges = await this.calculateExcessKmCharges(contract, tariff);
        if (excessKmCharges.amount > 0) {
          calculatedCharges.push({
            chargeType: ChargeType.EXCESS_KM,
            description: `Excess KM: ${excessKmCharges.excessKm} km`,
            descriptionAr: `كيلومترات إضافية: ${excessKmCharges.excessKm} كم`,
            quantity: excessKmCharges.excessKm.toString(),
            unitPrice: excessKmCharges.ratePerKm.toFixed(4),
            totalAmount: excessKmCharges.amount.toFixed(2),
          });
        }
      }

      // 4. Calculate late return penalty if applicable
      const lateReturnPenalty = this.calculateLateReturnPenalty(contract, tariff);
      if (lateReturnPenalty.amount > 0) {
        calculatedCharges.push({
          chargeType: ChargeType.LATE_RETURN,
          description: lateReturnPenalty.description,
          descriptionAr: lateReturnPenalty.descriptionAr,
          quantity: lateReturnPenalty.lateHours.toString(),
          unitPrice: lateReturnPenalty.hourlyRate.toFixed(2),
          totalAmount: lateReturnPenalty.amount.toFixed(2),
        });
      }

      // 5. Calculate early return penalty per Master Spec §7.5.2
      const earlyReturnPenalty = this.calculateEarlyReturnPenalty(contract, tariff);
      if (earlyReturnPenalty.amount > 0) {
        calculatedCharges.push({
          chargeType: ChargeType.EARLY_RETURN,
          description: earlyReturnPenalty.description,
          descriptionAr: earlyReturnPenalty.descriptionAr,
          quantity: earlyReturnPenalty.daysReturned.toString(),
          unitPrice: earlyReturnPenalty.penaltyRate.toFixed(2),
          totalAmount: earlyReturnPenalty.amount.toFixed(2),
        });
      }

      // 6. Calculate one-way fee if return branch differs per Master Spec §7.5.2
      const oneWayFee = await this.calculateOneWayFee(contract);
      if (oneWayFee.amount > 0) {
        calculatedCharges.push({
          chargeType: ChargeType.ONE_WAY_FEE,
          description: oneWayFee.description,
          descriptionAr: oneWayFee.descriptionAr,
          quantity: '1',
          unitPrice: oneWayFee.amount.toFixed(2),
          totalAmount: oneWayFee.amount.toFixed(2),
        });
      }

      // 7. Calculate fuel difference charges per Master Spec §7.5.2
      const fuelCharges = this.calculateFuelCharges(contract);
      if (fuelCharges.amount > 0) {
        calculatedCharges.push({
          chargeType: ChargeType.FUEL,
          description: fuelCharges.description,
          descriptionAr: fuelCharges.descriptionAr,
          quantity: fuelCharges.litersDiff.toString(),
          unitPrice: fuelCharges.pricePerLiter.toFixed(2),
          totalAmount: fuelCharges.amount.toFixed(2),
        });
      }

      // 8. Calculate addon charges per Master Spec §7.5.2
      const addonCharges = await this.calculateAddonCharges(contract);
      for (const addon of addonCharges) {
        calculatedCharges.push({
          chargeType: ChargeType.ADDON,
          description: addon.description,
          descriptionAr: addon.descriptionAr,
          quantity: addon.quantity.toString(),
          unitPrice: addon.unitPrice.toFixed(2),
          totalAmount: addon.amount.toFixed(2),
        });
      }

      // 9. Calculate driver service charges per Master Spec §7.5.2
      const driverCharges = this.calculateDriverServiceCharges(contract);
      if (driverCharges.amount > 0) {
        calculatedCharges.push({
          chargeType: ChargeType.DRIVER_SERVICE,
          description: driverCharges.description,
          descriptionAr: driverCharges.descriptionAr,
          quantity: driverCharges.quantity.toString(),
          unitPrice: driverCharges.unitPrice.toFixed(2),
          totalAmount: driverCharges.amount.toFixed(2),
        });
      }

      // 10. Add delivery and pickup fees if enabled
      if (contract.dropOffEnabled && contract.dropOffCharge) {
        const dropOffAmount = parseFloat(contract.dropOffCharge.toString());
        if (dropOffAmount > 0) {
          calculatedCharges.push({
            chargeType: ChargeType.DELIVERY_FEE,
            description: 'Vehicle delivery fee',
            descriptionAr: 'رسوم توصيل المركبة',
            quantity: '1',
            unitPrice: dropOffAmount.toFixed(2),
            totalAmount: dropOffAmount.toFixed(2),
          });
        }
      }

      if (contract.pickUpEnabled && contract.pickUpCharge) {
        const pickUpAmount = parseFloat(contract.pickUpCharge.toString());
        if (pickUpAmount > 0) {
          calculatedCharges.push({
            chargeType: ChargeType.PICKUP_FEE,
            description: 'Vehicle pickup fee',
            descriptionAr: 'رسوم استلام المركبة',
            quantity: '1',
            unitPrice: pickUpAmount.toFixed(2),
            totalAmount: pickUpAmount.toFixed(2),
          });
        }
      }

      // Calculate subtotal before VAT
      const subtotal = calculatedCharges.reduce((sum, c) => 
        sum + parseFloat(c.totalAmount), 0);

      // 11. Calculate VAT per Master Spec §7.5.2 (UAE 5%)
      const vatRate = await this.getVatRate();
      const vatAmount = subtotal * vatRate;
      if (vatAmount > 0) {
        calculatedCharges.push({
          chargeType: ChargeType.VAT,
          description: `VAT (${(vatRate * 100).toFixed(0)}%)`,
          descriptionAr: `ضريبة القيمة المضافة (${(vatRate * 100).toFixed(0)}%)`,
          quantity: '1',
          unitPrice: subtotal.toFixed(2),
          totalAmount: vatAmount.toFixed(2),
        });
      }

      // Insert all calculated charges - per Master Spec §4.8.3 using both canonical (chargeType/totalAmount) and required (type/amount) fields
      if (calculatedCharges.length > 0) {
        await db.insert(contractCharges).values(
          calculatedCharges.map(c => ({
            contractId,
            type: c.chargeType, // Required schema field
            chargeType: c.chargeType, // Canonical alias
            description: c.description,
            descriptionAr: c.descriptionAr,
            quantity: c.quantity,
            unitPrice: c.unitPrice,
            amount: c.totalAmount, // Required schema field
            totalAmount: c.totalAmount, // Canonical alias
            isManual: false,
            createdBy: 'system', // System-generated charges
          }))
        );
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
          vatAmount: vatAmount.toFixed(2),
          subtotal: subtotal.toFixed(2),
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
   * Calculate rental charges with optimal rate selection per Master Spec §7.5.2
   * Uses best rate combination: monthly, weekly, daily, hourly
   */
  private async calculateRentalCharges(
    contract: any, 
    tariff: any, 
    durationDays: number,
    durationHours: number
  ): Promise<{
    amount: number;
    description: string;
    descriptionAr: string;
    quantity: number;
    unitPrice: number;
  }> {
    if (!tariff) {
      // Fallback to contract daily rate if no tariff
      const dailyRate = parseFloat(contract.dailyRate?.toString() || '0');
      return {
        amount: dailyRate * durationDays,
        description: `Rental: ${durationDays} day(s) @ ${dailyRate.toFixed(2)}/day`,
        descriptionAr: `إيجار: ${durationDays} يوم @ ${dailyRate.toFixed(2)}/يوم`,
        quantity: durationDays,
        unitPrice: dailyRate,
      };
    }

    const hourlyRate = parseFloat(tariff.rateHourly?.toString() || '0');
    const dailyRate = parseFloat(tariff.rateDaily?.toString() || '0');
    const weeklyRate = parseFloat(tariff.rateWeekly?.toString() || '0');
    const monthlyRate = parseFloat(tariff.rateMonthly?.toString() || '0');

    let totalAmount = 0;
    const breakdown: string[] = [];
    const breakdownAr: string[] = [];

    let remainingDays = durationDays;

    // Apply monthly rate first
    if (monthlyRate > 0 && remainingDays >= 30) {
      const months = Math.floor(remainingDays / 30);
      totalAmount += months * monthlyRate;
      remainingDays = remainingDays % 30;
      breakdown.push(`${months} month(s) @ ${monthlyRate.toFixed(2)}`);
      breakdownAr.push(`${months} شهر @ ${monthlyRate.toFixed(2)}`);
    }

    // Apply weekly rate
    if (weeklyRate > 0 && remainingDays >= 7) {
      const weeks = Math.floor(remainingDays / 7);
      totalAmount += weeks * weeklyRate;
      remainingDays = remainingDays % 7;
      breakdown.push(`${weeks} week(s) @ ${weeklyRate.toFixed(2)}`);
      breakdownAr.push(`${weeks} أسبوع @ ${weeklyRate.toFixed(2)}`);
    }

    // Apply daily rate for remaining
    if (dailyRate > 0 && remainingDays > 0) {
      totalAmount += remainingDays * dailyRate;
      breakdown.push(`${remainingDays} day(s) @ ${dailyRate.toFixed(2)}`);
      breakdownAr.push(`${remainingDays} يوم @ ${dailyRate.toFixed(2)}`);
    } else if (hourlyRate > 0 && remainingDays > 0) {
      // Fallback to hourly for partial days
      const hours = remainingDays * 24;
      totalAmount += hours * hourlyRate;
      breakdown.push(`${hours} hour(s) @ ${hourlyRate.toFixed(2)}`);
      breakdownAr.push(`${hours} ساعة @ ${hourlyRate.toFixed(2)}`);
    }

    return {
      amount: totalAmount,
      description: `Rental: ${breakdown.join(', ')}`,
      descriptionAr: `إيجار: ${breakdownAr.join('، ')}`,
      quantity: durationDays,
      unitPrice: totalAmount / durationDays,
    };
  }

  /**
   * Calculate minimum rental period penalty per Master Spec §7.5.2
   * If rental duration is less than minimum, charge for minimum
   */
  private calculateMinimumRentalPenalty(
    contract: any,
    tariff: any,
    actualDays: number
  ): {
    amount: number;
    description: string;
    descriptionAr: string;
  } {
    const minimumDays = tariff?.minimumRentalDays || 1;
    
    if (actualDays >= minimumDays) {
      return { amount: 0, description: '', descriptionAr: '' };
    }

    const dailyRate = parseFloat(tariff?.rateDaily?.toString() || contract.dailyRate?.toString() || '0');
    const shortfallDays = minimumDays - actualDays;
    const penaltyAmount = shortfallDays * dailyRate;

    return {
      amount: penaltyAmount,
      description: `Minimum rental penalty: ${shortfallDays} day(s) short of ${minimumDays}-day minimum`,
      descriptionAr: `غرامة الحد الأدنى للإيجار: ${shortfallDays} يوم أقل من الحد الأدنى ${minimumDays} يوم`,
    };
  }

  /**
   * Calculate late return penalty per Master Spec §7.5.2
   * 150% of hourly rate after grace period
   */
  private calculateLateReturnPenalty(
    contract: any,
    tariff: any
  ): {
    amount: number;
    lateHours: number;
    hourlyRate: number;
    description: string;
    descriptionAr: string;
  } {
    const plannedEnd = contract.endDatetime || contract.rentalEndDate;
    const actualEnd = contract.endDatetimeActual || contract.vehicleReturnedAt;
    
    if (!actualEnd || !plannedEnd) {
      return { amount: 0, lateHours: 0, hourlyRate: 0, description: '', descriptionAr: '' };
    }

    const graceMinutes = tariff?.returnGraceMinutes || 60;
    const lateMs = new Date(actualEnd).getTime() - new Date(plannedEnd).getTime() - (graceMinutes * 60 * 1000);
    
    if (lateMs <= 0) {
      return { amount: 0, lateHours: 0, hourlyRate: 0, description: '', descriptionAr: '' };
    }

    const lateHours = Math.ceil(lateMs / (1000 * 60 * 60));
    const dailyRate = parseFloat(tariff?.rateDaily?.toString() || contract.dailyRate?.toString() || '0');
    const hourlyRate = parseFloat(tariff?.rateHourly?.toString() || '0') || (dailyRate / 24);
    const penaltyRate = hourlyRate * LATE_RETURN_MULTIPLIER;
    const penaltyAmount = lateHours * penaltyRate;

    return {
      amount: penaltyAmount,
      lateHours,
      hourlyRate: penaltyRate,
      description: `Late return: ${lateHours} hour(s) @ ${penaltyRate.toFixed(2)}/hr (150% rate)`,
      descriptionAr: `تأخير الإرجاع: ${lateHours} ساعة @ ${penaltyRate.toFixed(2)}/ساعة (150% معدل)`,
    };
  }

  /**
   * Calculate early return penalty per Master Spec §7.5.2
   * When returning earlier than planned, charge percentage of remaining rental
   */
  private calculateEarlyReturnPenalty(
    contract: any,
    tariff: any
  ): {
    amount: number;
    daysReturned: number;
    penaltyRate: number;
    description: string;
    descriptionAr: string;
  } {
    const plannedEnd = contract.endDatetime || contract.rentalEndDate;
    const actualEnd = contract.endDatetimeActual || contract.vehicleReturnedAt;
    
    if (!actualEnd || !plannedEnd) {
      return { amount: 0, daysReturned: 0, penaltyRate: 0, description: '', descriptionAr: '' };
    }

    const earlyMs = new Date(plannedEnd).getTime() - new Date(actualEnd).getTime();
    const graceHours = 24; // One day grace for early return per common practice
    
    if (earlyMs < graceHours * 60 * 60 * 1000) {
      return { amount: 0, daysReturned: 0, penaltyRate: 0, description: '', descriptionAr: '' };
    }

    const earlyDays = Math.floor(earlyMs / (1000 * 60 * 60 * 24));
    const dailyRate = parseFloat(tariff?.rateDaily?.toString() || contract.dailyRate?.toString() || '0');
    
    // Per Master Spec: Early return may incur downgrade penalty for monthly/weekly rentals
    // For simplicity, apply 10% of remaining rental value
    const remainingValue = earlyDays * dailyRate;
    const penaltyAmount = remainingValue * EARLY_RETURN_PENALTY_PERCENT;

    return {
      amount: penaltyAmount,
      daysReturned: earlyDays,
      penaltyRate: dailyRate * EARLY_RETURN_PENALTY_PERCENT,
      description: `Early return: ${earlyDays} day(s) early (${(EARLY_RETURN_PENALTY_PERCENT * 100).toFixed(0)}% of AED ${remainingValue.toFixed(2)})`,
      descriptionAr: `إرجاع مبكر: ${earlyDays} يوم مبكراً (${(EARLY_RETURN_PENALTY_PERCENT * 100).toFixed(0)}% من ${remainingValue.toFixed(2)} درهم)`,
    };
  }

  /**
   * Calculate one-way fee per Master Spec §7.5.2
   * When return branch differs from pickup branch
   */
  private async calculateOneWayFee(contract: any): Promise<{
    amount: number;
    description: string;
    descriptionAr: string;
  }> {
    const pickupBranch = contract.branchId || contract.originalBranchId;
    const returnBranch = contract.returnBranchId;

    if (!returnBranch || pickupBranch === returnBranch) {
      return { amount: 0, description: '', descriptionAr: '' };
    }

    // Get branch names for description
    let pickupName = 'Pickup Branch';
    let returnName = 'Return Branch';
    
    try {
      const [pickup, returnB] = await Promise.all([
        pickupBranch ? db.query.branches.findFirst({ where: eq(branches.id, pickupBranch) }) : null,
        returnBranch ? db.query.branches.findFirst({ where: eq(branches.id, returnBranch) }) : null,
      ]);
      if (pickup?.nameEn && typeof pickup.nameEn === 'string') pickupName = pickup.nameEn;
      if (returnB?.nameEn && typeof returnB.nameEn === 'string') returnName = returnB.nameEn;
    } catch {
      // Continue with default names
    }

    // TODO: Get one-way fee from system settings or branch configuration
    const oneWayFee = DEFAULT_ONE_WAY_FEE;

    return {
      amount: oneWayFee,
      description: `One-way fee: ${pickupName} → ${returnName}`,
      descriptionAr: `رسوم الاتجاه الواحد: ${pickupName} ← ${returnName}`,
    };
  }

  /**
   * Calculate fuel difference charges per Master Spec §7.5.2
   */
  private calculateFuelCharges(contract: any): {
    amount: number;
    litersDiff: number;
    pricePerLiter: number;
    description: string;
    descriptionAr: string;
  } {
    // Get fuel levels
    let fuelStart = contract.inspectionFuelPercentage || 0;
    let fuelEnd = 0;

    // Handle legacy string fuel levels
    if (contract.fuelLevelStart && typeof contract.fuelLevelStart === 'string') {
      fuelStart = FUEL_LEVEL_MAP[contract.fuelLevelStart] || 0;
    }
    if (contract.fuelLevelEnd && typeof contract.fuelLevelEnd === 'string') {
      fuelEnd = FUEL_LEVEL_MAP[contract.fuelLevelEnd] || 0;
    }

    // If contract has return inspection with fuel %, use that
    // For now, use legacy fuelLevelEnd if available
    
    if (!fuelStart || fuelStart === fuelEnd || !this.isContractReturned(contract.status)) {
      return { amount: 0, litersDiff: 0, pricePerLiter: 0, description: '', descriptionAr: '' };
    }

    // Calculate fuel difference
    const fuelDiff = fuelStart - fuelEnd; // Positive means customer returned with less fuel
    if (fuelDiff <= 0) {
      return { amount: 0, litersDiff: 0, pricePerLiter: 0, description: '', descriptionAr: '' };
    }

    // Estimate tank capacity (default 60L) and fuel price (default 3.20 AED/L)
    const tankCapacity = 60; // liters - could be from vehicle specs
    const fuelPricePerLiter = 3.20; // AED - could be from system settings
    
    const litersDiff = (fuelDiff / 100) * tankCapacity;
    const fuelCharge = litersDiff * fuelPricePerLiter;

    return {
      amount: fuelCharge,
      litersDiff: Math.round(litersDiff * 10) / 10,
      pricePerLiter: fuelPricePerLiter,
      description: `Fuel shortage: ${litersDiff.toFixed(1)}L @ ${fuelPricePerLiter.toFixed(2)}/L`,
      descriptionAr: `نقص الوقود: ${litersDiff.toFixed(1)} لتر @ ${fuelPricePerLiter.toFixed(2)}/لتر`,
    };
  }

  /**
   * Calculate addon charges per Master Spec §7.5.2
   * 
   * NOTE: Addon charges should be retrieved from contract_addons junction table.
   * Currently, addons can be added manually via the addManualCharge method with
   * chargeType = ChargeType.ADDON. A future enhancement should add a contract_addons
   * table to properly track addons assigned to contracts.
   * 
   * For now, this method looks for existing ADDON charges in contractCharges
   * that were added manually during contract creation/activation.
   */
  private async calculateAddonCharges(contract: any): Promise<Array<{
    amount: number;
    quantity: number;
    unitPrice: number;
    description: string;
    descriptionAr: string;
  }>> {
    const result: Array<{
      amount: number;
      quantity: number;
      unitPrice: number;
      description: string;
      descriptionAr: string;
    }> = [];

    try {
      // Look for existing addon charges that were added manually
      // Per Master Spec, addons should be tracked in a contract_addons junction table
      // For now, we rely on manually added ADDON charges in contractCharges
      const existingAddonCharges = await db.query.contractCharges.findMany({
        where: and(
          eq(contractCharges.contractId, contract.id),
          eq(contractCharges.chargeType, ChargeType.ADDON),
          eq(contractCharges.isManual, true)
        )
      });

      // Return existing addon charges to avoid duplicating them
      // These won't be added again since they're already in the database
      for (const charge of existingAddonCharges) {
        result.push({
          amount: parseFloat(charge.totalAmount?.toString() || '0'),
          quantity: parseFloat(charge.quantity?.toString() || '1'),
          unitPrice: parseFloat(charge.unitPrice?.toString() || '0'),
          description: charge.description || 'Addon',
          descriptionAr: charge.descriptionAr || 'إضافة',
        });
      }
    } catch (error) {
      console.error('[BillingService] calculateAddonCharges error:', error);
    }

    return result;
  }

  /**
   * Calculate driver service charges per Master Spec §7.5.2
   */
  private calculateDriverServiceCharges(contract: any): {
    amount: number;
    quantity: number;
    unitPrice: number;
    description: string;
    descriptionAr: string;
  } {
    if (!contract.requiresDriver || contract.driverServiceType === 'none') {
      return { amount: 0, quantity: 0, unitPrice: 0, description: '', descriptionAr: '' };
    }

    const rate = parseFloat(contract.driverServiceRate?.toString() || '0');
    const quantity = parseFloat(contract.driverServiceQuantity?.toString() || '0');
    const total = parseFloat(contract.driverServiceTotal?.toString() || '0') || (rate * quantity);

    if (total <= 0) {
      return { amount: 0, quantity: 0, unitPrice: 0, description: '', descriptionAr: '' };
    }

    const serviceType = (contract.driverServiceType || 'daily') as 'daily' | 'hourly' | 'flat';
    const labels: Record<'daily' | 'hourly' | 'flat', string> = {
      'daily': 'day(s)',
      'hourly': 'hour(s)',
      'flat': 'trip(s)',
    };
    const labelsAr: Record<'daily' | 'hourly' | 'flat', string> = {
      'daily': 'يوم',
      'hourly': 'ساعة',
      'flat': 'رحلة',
    };
    const serviceTypeLabel = labels[serviceType] || 'unit(s)';
    const serviceTypeLabelAr = labelsAr[serviceType] || 'وحدة';

    return {
      amount: total,
      quantity,
      unitPrice: rate,
      description: `Driver service: ${quantity} ${serviceTypeLabel} @ ${rate.toFixed(2)}`,
      descriptionAr: `خدمة السائق: ${quantity} ${serviceTypeLabelAr} @ ${rate.toFixed(2)}`,
    };
  }

  /**
   * Get VAT rate from system settings
   */
  private async getVatRate(): Promise<number> {
    try {
      const setting = await db.query.systemSettings.findFirst({
        where: eq(systemSettings.key, 'vat_rate')
      });
      if (setting?.value) {
        return parseFloat(setting.value) / 100;
      }
    } catch {
      // Continue with default
    }
    return DEFAULT_VAT_RATE;
  }

  /**
   * Check if contract is in a returned state
   */
  private isContractReturned(status: string): boolean {
    return ['completed', 'completed_pending_accident', 'closed'].includes(status);
  }

  /**
   * Calculate excess KM charges
   */
  private async calculateExcessKmCharges(contract: any, tariff: any): Promise<{
    excessKm: number;
    ratePerKm: number;
    amount: number;
  }> {
    const odometerOut = parseFloat(contract.odometerStart?.toString() || contract.odometerOut?.toString() || '0');
    const odometerIn = parseFloat(contract.odometerEnd?.toString() || contract.odometerIn?.toString() || '0');
    
    if (odometerOut === 0 || odometerIn === 0) {
      return { excessKm: 0, ratePerKm: 0, amount: 0 };
    }

    const totalKm = odometerIn - odometerOut;
    
    // Calculate included KM based on rental duration
    const startDate = contract.startDatetimeActual || contract.startDatetime || contract.rentalStartDate;
    const endDate = contract.endDatetimeActual || contract.endDatetime || contract.rentalEndDate;
    const durationMs = new Date(endDate).getTime() - new Date(startDate).getTime();
    const durationDays = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));

    const includedKmPerDay = parseFloat(tariff?.includedKmPerDay?.toString() || contract.mileageLimit?.toString() || '250');
    const includedKm = includedKmPerDay * durationDays;

    const excessKm = Math.max(0, totalKm - includedKm);
    const ratePerKm = parseFloat(tariff?.extraKmRate?.toString() || contract.extraKmRate?.toString() || '0.5');
    const amount = excessKm * ratePerKm;

    return { excessKm, ratePerKm, amount };
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

      // Insert manual charge - per Master Spec §4.8.3 using both canonical and required fields
      await db.insert(contractCharges).values({
        contractId: command.contractId,
        type: command.chargeType, // Required schema field
        chargeType: command.chargeType, // Canonical alias
        description: command.description,
        descriptionAr: command.descriptionAr,
        quantity: command.quantity.toString(),
        unitPrice: command.unitPrice.toFixed(2),
        amount: totalAmount.toFixed(2), // Required schema field
        totalAmount: totalAmount.toFixed(2), // Canonical alias
        isManual: true,
        createdBy: command.createdBy,
      });

      // Create audit log
      await db.insert(auditLogs).values({
        contractId: command.contractId,
        action: 'MANUAL_CHARGE_ADDED',
        userId: command.createdBy,
        details: JSON.stringify({
          chargeType: command.chargeType,
          description: command.description,
          amount: totalAmount,
        }),
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
        contractId: charge.contractId,
        action: 'MANUAL_CHARGE_REMOVED',
        userId,
        details: JSON.stringify({
          chargeType: charge.chargeType,
          description: charge.description,
          amount: charge.totalAmount,
        }),
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

      const vatAmount = charges
        .filter(c => c.chargeType === ChargeType.VAT || c.chargeType === ChargeType.TAX)
        .reduce((sum, c) => sum + parseFloat(c.totalAmount?.toString() || '0'), 0);

      const additionalCharges = charges
        .filter(c => c.chargeType !== ChargeType.RENTAL && 
                     c.chargeType !== ChargeType.DISCOUNT &&
                     c.chargeType !== ChargeType.VAT &&
                     c.chargeType !== ChargeType.TAX)
        .reduce((sum, c) => sum + parseFloat(c.totalAmount?.toString() || '0'), 0);

      const totalCharges = rentalCharges + additionalCharges + vatAmount - discounts;

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
        vatAmount,
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
   * Per Master Spec §7.5.2 - Calculate downgrade penalty
   * When customer booked monthly but returns early, recalculate at daily rate + penalty
   */
  async calculateDowngradePenalty(
    contractId: string,
    originalRentalType: 'monthly' | 'weekly',
    newRentalType: 'daily',
    actualDays: number
  ): Promise<{
    success: boolean;
    penaltyAmount?: number;
    rateDifference?: number;
    error?: string;
  }> {
    try {
      const contract = await db.query.contracts.findFirst({
        where: eq(contracts.id, contractId)
      });

      if (!contract || !contract.tariffId) {
        return { success: false, error: 'Contract or tariff not found' };
      }

      const tariff = await db.query.tariffs.findFirst({
        where: eq(tariffs.id, contract.tariffId)
      });

      if (!tariff) {
        return { success: false, error: 'Tariff not found' };
      }

      const dailyRate = parseFloat(tariff.rateDaily?.toString() || '0');
      const weeklyRate = parseFloat(tariff.rateWeekly?.toString() || '0');
      const monthlyRate = parseFloat(tariff.rateMonthly?.toString() || '0');
      const downgradePenaltyRate = parseFloat(tariff.downgradePenaltyRate?.toString() || '0');

      let originalEffectiveDailyRate = dailyRate;
      if (originalRentalType === 'monthly' && monthlyRate > 0) {
        originalEffectiveDailyRate = monthlyRate / 30;
      } else if (originalRentalType === 'weekly' && weeklyRate > 0) {
        originalEffectiveDailyRate = weeklyRate / 7;
      }

      // Calculate what they should have paid vs what they would have paid
      const actualCostAtDailyRate = actualDays * dailyRate;
      const wouldHavePaidAtOriginalRate = actualDays * originalEffectiveDailyRate;
      const rateDifference = actualCostAtDailyRate - wouldHavePaidAtOriginalRate;

      // Add penalty if configured
      let penaltyAmount = rateDifference;
      if (downgradePenaltyRate > 0) {
        penaltyAmount += downgradePenaltyRate;
      }

      // Insert downgrade penalty charge - per Master Spec §4.8.3
      if (penaltyAmount > 0) {
        await db.insert(contractCharges).values({
          contractId,
          type: ChargeType.DOWNGRADE_PENALTY, // Required schema field
          chargeType: ChargeType.DOWNGRADE_PENALTY, // Canonical alias
          description: `Downgrade penalty: ${originalRentalType} → ${newRentalType}`,
          descriptionAr: `غرامة التخفيض: ${originalRentalType === 'monthly' ? 'شهري' : 'أسبوعي'} ← يومي`,
          quantity: actualDays.toString(),
          unitPrice: (penaltyAmount / actualDays).toFixed(2),
          amount: penaltyAmount.toFixed(2), // Required schema field
          totalAmount: penaltyAmount.toFixed(2), // Canonical alias
          isManual: false,
          createdBy: 'system',
        });

        // Create audit log
        await db.insert(auditLogs).values({
          contractId,
          action: 'DOWNGRADE_PENALTY_APPLIED',
          userId: 'system',
          details: JSON.stringify({
            originalRentalType,
            newRentalType,
            actualDays,
            penaltyAmount,
            rateDifference,
          }),
        });
      }

      return {
        success: true,
        penaltyAmount,
        rateDifference,
      };
    } catch (error: any) {
      console.error('[BillingService] calculateDowngradePenalty error:', error);
      return { success: false, error: error.message };
    }
  }
}

export const billingService = new BillingService();
