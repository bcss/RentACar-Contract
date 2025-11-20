import { expect } from 'vitest';
import type { Contract, Payment, Customer, Vehicle } from '../../shared/schema';

/**
 * Test Helper Functions
 * Common assertions and utilities for test suites
 */

/**
 * Assert that a value is a valid UUID
 */
export function assertUUID(value: unknown, fieldName: string = 'id'): void {
  expect(value).toBeTypeOf('string');
  expect(value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 
    `${fieldName} should be a valid UUID`);
}

/**
 * Assert that a date is recent (within last 10 seconds)
 */
export function assertRecentDate(date: Date | string | null | undefined, fieldName: string = 'date'): void {
  expect(date).toBeTruthy();
  const dateObj = typeof date === 'string' ? new Date(date) : date!;
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  expect(diff).toBeLessThan(10000); // Within 10 seconds
  expect(diff).toBeGreaterThanOrEqual(0); // Not in the future
}

/**
 * Assert that a decimal string is valid and matches expected value
 */
export function assertDecimalEquals(
  actual: string | null | undefined,
  expected: string | number,
  fieldName: string = 'amount'
): void {
  expect(actual).toBeTruthy();
  const actualNum = parseFloat(actual!);
  const expectedNum = typeof expected === 'string' ? parseFloat(expected) : expected;
  expect(actualNum).toBeCloseTo(expectedNum, 2);
}

/**
 * Assert financial calculation accuracy
 */
export function assertFinancialCalculation(
  result: string | number,
  expected: string | number,
  tolerance: number = 0.01
): void {
  const resultNum = typeof result === 'string' ? parseFloat(result) : result;
  const expectedNum = typeof expected === 'string' ? parseFloat(expected) : expected;
  const diff = Math.abs(resultNum - expectedNum);
  expect(diff).toBeLessThanOrEqual(tolerance);
}

/**
 * Assert that an error was thrown with specific message
 */
export function assertErrorThrown(
  fn: () => void | Promise<void>,
  expectedMessage?: string | RegExp
): void {
  if (expectedMessage) {
    expect(fn).toThrow(expectedMessage);
  } else {
    expect(fn).toThrow();
  }
}

/**
 * Assert contract financial integrity
 */
export function assertContractFinancials(contract: Contract): void {
  // Check required financial fields exist
  expect(contract.totalAmount).toBeTruthy();
  expect(contract.dailyRate).toBeTruthy();
  expect(contract.totalDays).toBeGreaterThan(0);

  // If VAT breakdown exists, verify calculation
  if (contract.subtotal && contract.vatAmount) {
    const subtotal = parseFloat(contract.subtotal);
    const vatAmount = parseFloat(contract.vatAmount);
    const totalAmount = parseFloat(contract.totalAmount);
    
    // VAT should be ~5% of subtotal
    assertFinancialCalculation(vatAmount, subtotal * 0.05, 0.02);
    
    // Total should equal subtotal + VAT
    assertFinancialCalculation(totalAmount, subtotal + vatAmount, 0.02);
  }

  // Outstanding balance should not be negative
  if (contract.outstandingBalance) {
    const outstanding = parseFloat(contract.outstandingBalance);
    expect(outstanding).toBeGreaterThanOrEqual(0);
  }
}

/**
 * Assert payment integrity
 */
export function assertPaymentValid(payment: Payment): void {
  assertUUID(payment.id);
  assertUUID(payment.contractId, 'contractId');
  expect(payment.amount).toBeTruthy();
  expect(parseFloat(payment.amount)).toBeGreaterThan(0);
  expect(payment.paymentMethod).toBeTruthy();
  expect(payment.createdBy).toBeTruthy();
  assertRecentDate(payment.paidAt, 'paidAt');
}

/**
 * Assert state machine transition is valid
 */
export function assertValidStateTransition(
  fromStatus: string,
  toStatus: string,
  validTransitions: Record<string, string[]>
): void {
  const allowedNextStates = validTransitions[fromStatus] || [];
  expect(allowedNextStates).toContain(toStatus);
}

/**
 * Mock fetch for API testing
 */
export function createMockFetch(response: any, status: number = 200) {
  return async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => response,
    text: async () => JSON.stringify(response),
  });
}

/**
 * Sleep utility for async tests
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create test timeout promise
 */
export function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => 
    setTimeout(() => reject(new Error(`Test timeout after ${ms}ms`)), ms)
  );
}

/**
 * Wait for condition with timeout
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  maxWaitMs: number = 5000,
  checkIntervalMs: number = 100
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    if (await condition()) {
      return;
    }
    await sleep(checkIntervalMs);
  }
  throw new Error(`Condition not met within ${maxWaitMs}ms`);
}

/**
 * Assert array contains objects matching partial properties
 */
export function assertArrayContains<T>(
  array: T[],
  partialMatch: Partial<T>
): void {
  const matches = array.filter(item => 
    Object.entries(partialMatch).every(([key, value]) => 
      item[key as keyof T] === value
    )
  );
  expect(matches.length).toBeGreaterThan(0);
}

/**
 * Assert array has specific length
 */
export function assertArrayLength<T>(
  array: T[],
  expectedLength: number,
  message?: string
): void {
  expect(array).toHaveLength(expectedLength);
  if (message) {
    expect(array.length).toBe(expectedLength); // Redundant but shows message
  }
}

/**
 * Common contract status transitions
 */
export const validStateTransitions: Record<string, string[]> = {
  draft: ['active', 'draft'], // Can activate or stay draft
  active: ['completed', 'active'], // Can complete or stay active (edits)
  completed: ['closed', 'completed'], // Can close or stay completed (pending final payment)
  closed: ['closed'], // Terminal state
};

/**
 * Contract state machine validators
 */
export const stateValidators = {
  canActivate: (contract: Contract): boolean => {
    return contract.status === 'draft' && 
           contract.depositPaid === true &&
           contract.termsAccepted === true;
  },

  canComplete: (contract: Contract): boolean => {
    return contract.status === 'active';
  },

  canClose: (contract: Contract): boolean => {
    return contract.status === 'completed';
  },
};

/**
 * Calculate expected VAT amount
 */
export function calculateVAT(subtotal: string | number, vatRate: number = 0.05): string {
  const subtotalNum = typeof subtotal === 'string' ? parseFloat(subtotal) : subtotal;
  return (subtotalNum * vatRate).toFixed(2);
}

/**
 * Calculate expected total amount
 */
export function calculateTotal(subtotal: string | number, vatAmount: string | number): string {
  const subtotalNum = typeof subtotal === 'string' ? parseFloat(subtotal) : subtotal;
  const vatNum = typeof vatAmount === 'string' ? parseFloat(vatAmount) : vatAmount;
  return (subtotalNum + vatNum).toFixed(2);
}

/**
 * Generate test session ID
 */
export function generateTestSessionId(): string {
  return `test-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Common error messages for validation
 */
export const errorMessages = {
  REQUIRED_FIELD: (field: string) => `${field} is required`,
  INVALID_STATUS: 'Invalid status transition',
  INSUFFICIENT_PAYMENT: 'Payment amount cannot exceed outstanding balance',
  NEGATIVE_BALANCE: 'Outstanding balance cannot be negative',
  DEPOSIT_NOT_PAID: 'Deposit must be paid before activation',
  TERMS_NOT_ACCEPTED: 'Terms must be accepted',
  INVALID_DATE_RANGE: 'End date must be after start date',
};
