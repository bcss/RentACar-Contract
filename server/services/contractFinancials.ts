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
