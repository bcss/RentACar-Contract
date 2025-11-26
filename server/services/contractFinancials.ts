/**
 * Centralized Contract Financial Calculator
 * 
 * Single source of truth for all contract financial calculations.
 * Ensures consistency across all endpoints (POST, GET, PATCH, lists, alerts).
 * 
 * Outstanding Balance Formula:
 * (totalAmount + totalExtraCharges + totalDriverCharges) - securityDeposit - totalPaid
 * 
 * Where:
 * - totalAmount: Base rental amount (including VAT if applicable)
 * - totalExtraCharges: Extra km, fuel, damage, fines, other charges
 * - totalDriverCharges: Driver service costs (VAT-inclusive)
 * - securityDeposit: Initial deposit paid
 * - totalPaid: Sum of all payments made
 */

import { validateFinancialInput } from "../utils/validation";

export interface ContractFinancialInputs {
  totalAmount: string | number;
  totalExtraCharges?: string | number;
  totalDriverCharges?: string | number;
  securityDeposit?: string | number;
  totalPaid?: number; // Already calculated from payments
}

export interface ContractFinancialBreakdown {
  totalAmount: number;
  totalExtraCharges: number;
  totalDriverCharges: number;
  securityDeposit: number;
  totalPaid: number;
  totalDue: number;
  outstandingBalance: number;
}

/**
 * Calculate comprehensive contract financial totals
 * 
 * @param inputs - Contract financial inputs
 * @returns Complete financial breakdown with all totals
 */
export function calculateContractTotals(
  inputs: ContractFinancialInputs
): ContractFinancialBreakdown {
  // Validate and parse all financial inputs
  const totalAmount = validateFinancialInput(
    inputs.totalAmount || '0',
    'total amount'
  );
  
  const totalExtraCharges = validateFinancialInput(
    inputs.totalExtraCharges || '0',
    'extra charges'
  );
  
  const totalDriverCharges = validateFinancialInput(
    inputs.totalDriverCharges || '0',
    'driver charges'
  );
  
  const securityDeposit = validateFinancialInput(
    inputs.securityDeposit || '0',
    'security deposit'
  );
  
  const totalPaid = validateFinancialInput(
    inputs.totalPaid || 0,
    'total paid'
  );
  
  // Calculate total due (sum of all charges)
  const totalDue = totalAmount + totalExtraCharges + totalDriverCharges;
  
  // Calculate outstanding balance (what customer still owes)
  // Formula: Total Due - Deposits - Payments
  const outstandingBalance = totalDue - securityDeposit - totalPaid;
  
  return {
    totalAmount: Math.round(totalAmount * 100) / 100,
    totalExtraCharges: Math.round(totalExtraCharges * 100) / 100,
    totalDriverCharges: Math.round(totalDriverCharges * 100) / 100,
    securityDeposit: Math.round(securityDeposit * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    totalDue: Math.round(totalDue * 100) / 100,
    outstandingBalance: Math.round(outstandingBalance * 100) / 100,
  };
}

/**
 * Format financial breakdown for API response
 * 
 * @param breakdown - Financial breakdown from calculateContractTotals
 * @returns Formatted object with 2 decimal places for all values
 */
export function formatFinancialBreakdown(
  breakdown: ContractFinancialBreakdown
): Record<string, string> {
  return {
    totalAmount: breakdown.totalAmount.toFixed(2),
    totalExtraCharges: breakdown.totalExtraCharges.toFixed(2),
    totalDriverCharges: breakdown.totalDriverCharges.toFixed(2),
    securityDeposit: breakdown.securityDeposit.toFixed(2),
    totalPaid: breakdown.totalPaid.toFixed(2),
    totalDue: breakdown.totalDue.toFixed(2),
    outstandingBalance: breakdown.outstandingBalance.toFixed(2),
  };
}

/**
 * Extra Kilometer Fee Calculator - Per Master Spec Part 5.5.1
 * 
 * Calculates excess km charge when actual mileage exceeds tariff entitlement.
 * 
 * Formula: extraKmCharge = extraKmDriven × extraKmRate
 * Where:
 * - extraKmDriven = actualKm - (kmPerDay × totalDays)
 * - actualKm = odometerEnd - odometerStart
 * 
 * @example
 * calculateExtraKmFee({
 *   odometerStart: 50000,
 *   odometerEnd: 51500,
 *   totalDays: 5,
 *   mileageLimit: 200,  // 200 km per day
 *   extraKmRate: "0.50" // 0.50 AED per extra km
 * })
 * // Returns: { extraKmDriven: 500, extraKmCharge: 250.00 }
 * // Explanation: 1500 km driven - (5 days × 200 km/day = 1000 km) = 500 extra km × 0.50 = 250 AED
 */
export interface ExtraKmCalculationInputs {
  odometerStart: number | null;
  odometerEnd: number | null;
  totalDays: number;
  mileageLimit: number | null; // km per day allowance
  extraKmRate: string | null; // rate per excess km
}

export interface ExtraKmCalculationResult {
  totalKmDriven: number;
  kmEntitlement: number;
  extraKmDriven: number;
  extraKmCharge: number;
  hasExcess: boolean;
}

/**
 * Calculate extra km fee based on odometer readings and tariff entitlement
 */
export function calculateExtraKmFee(
  inputs: ExtraKmCalculationInputs
): ExtraKmCalculationResult {
  // If no odometer readings, return zero charges
  if (inputs.odometerStart === null || inputs.odometerEnd === null) {
    return {
      totalKmDriven: 0,
      kmEntitlement: 0,
      extraKmDriven: 0,
      extraKmCharge: 0,
      hasExcess: false,
    };
  }
  
  // Calculate total km driven
  const totalKmDriven = Math.max(0, inputs.odometerEnd - inputs.odometerStart);
  
  // Calculate km entitlement (mileageLimit per day × total days)
  // If no mileage limit set, consider it unlimited (no extra charge)
  const mileageLimit = inputs.mileageLimit || 0;
  const kmEntitlement = mileageLimit * inputs.totalDays;
  
  // If no km entitlement set (unlimited), no extra charge
  if (kmEntitlement === 0) {
    return {
      totalKmDriven,
      kmEntitlement: 0,
      extraKmDriven: 0,
      extraKmCharge: 0,
      hasExcess: false,
    };
  }
  
  // Calculate excess km
  const extraKmDriven = Math.max(0, totalKmDriven - kmEntitlement);
  
  // Calculate charge if excess and rate provided
  const extraKmRate = parseFloat(inputs.extraKmRate || '0') || 0;
  const extraKmCharge = Math.round(extraKmDriven * extraKmRate * 100) / 100;
  
  return {
    totalKmDriven,
    kmEntitlement,
    extraKmDriven,
    extraKmCharge,
    hasExcess: extraKmDriven > 0,
  };
}

/**
 * Aggregate all extra charges into totalExtraCharges
 * Per Master Spec Part 5.5.1 - totalExtraCharges = sum of all extra charge components
 */
export interface ExtraChargesInputs {
  extraKmCharge?: string | number | null;
  fuelCharge?: string | number | null;
  salikCharge?: string | number | null;
  trafficFineCharge?: string | number | null;
  damageCharge?: string | number | null;
  otherCharges?: string | number | null;
}

export function calculateTotalExtraCharges(inputs: ExtraChargesInputs): number {
  const parseValue = (val: string | number | null | undefined): number => {
    if (val === null || val === undefined) return 0;
    const parsed = typeof val === 'number' ? val : parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  };
  
  const total = 
    parseValue(inputs.extraKmCharge) +
    parseValue(inputs.fuelCharge) +
    parseValue(inputs.salikCharge) +
    parseValue(inputs.trafficFineCharge) +
    parseValue(inputs.damageCharge) +
    parseValue(inputs.otherCharges);
  
  return Math.round(total * 100) / 100;
}
