import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { 
  InsertUser, InsertCustomer, InsertVehicle, InsertContract, 
  InsertPayment, InsertBranch, InsertDriver, InsertDriverRateCard 
} from '../../shared/schema';

/**
 * Test Data Factories
 * Reusable factory functions for generating consistent test data across all test suites
 */

let userIdCounter = 1;
let customerIdCounter = 1;
let vehicleIdCounter = 1;
let contractIdCounter = 1;
let contractNumberCounter = 1000;

/**
 * Reset all counters - call this in beforeEach()
 */
export function resetTestCounters() {
  userIdCounter = 1;
  customerIdCounter = 1;
  vehicleIdCounter = 1;
  contractIdCounter = 1;
  contractNumberCounter = 1000;
}

/**
 * Generate unique test ID
 */
export function generateTestId(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create test user
 */
export function createTestUser(overrides?: Partial<InsertUser>): InsertUser {
  const id = generateTestId('user');
  return {
    id,
    username: `testuser${userIdCounter++}`,
    passwordHash: '$2b$10$dummyhashfortesting1234567890123456789012', // bcrypt hash format
    email: `testuser${userIdCounter}@example.com`,
    firstName: 'Test',
    lastName: `User ${userIdCounter}`,
    role: 'staff',
    branchId: null,
    isImmutable: false,
    disabled: false,
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * Create test admin user
 */
export function createTestAdmin(overrides?: Partial<InsertUser>): InsertUser {
  return createTestUser({
    role: 'admin',
    username: `admin${userIdCounter}`,
    firstName: 'Admin',
    ...overrides,
  });
}

/**
 * Create test branch
 */
export function createTestBranch(overrides?: Partial<InsertBranch>): InsertBranch {
  const code = `BR${Math.floor(Math.random() * 9000) + 1000}`;
  return {
    nameEn: `Test Branch ${code}`,
    nameAr: `فرع الاختبار ${code}`,
    code,
    address: '123 Test Street',
    phone: '+971501234567',
    email: `branch-${code}@example.com`,
    disabled: false,
    ...overrides,
  };
}

/**
 * Create test customer
 */
export function createTestCustomer(overrides?: Partial<InsertCustomer>): InsertCustomer {
  const num = customerIdCounter++;
  return {
    nameEn: `Test Customer ${num}`,
    nameAr: `عميل الاختبار ${num}`,
    nationality: 'AE',
    nationalId: `784${String(num).padStart(12, '0')}`,
    phone: `+97150${String(num).padStart(7, '0')}`,
    licenseNumber: `L${String(num).padStart(8, '0')}`,
    passportId: `P${String(num).padStart(7, '0')}`,
    email: `customer${num}@example.com`,
    address: `${num} Test Street, Dubai`,
    licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    disabled: false,
    ...overrides,
  };
}

/**
 * Create test vehicle
 */
export function createTestVehicle(overrides?: Partial<InsertVehicle>): InsertVehicle {
  const num = vehicleIdCounter++;
  return {
    registration: `TC${num}`,
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    color: 'White',
    plateNumber: `A${String(num).padStart(5, '0')}`,
    plateCode: 'Dubai',
    status: 'available',
    currentOdometer: String(10000 + (num * 100)),
    dailyRate: '250.00',
    weeklyRate: '1500.00',
    monthlyRate: '5000.00',
    disabled: false,
    ...overrides,
  };
}

/**
 * Create test contract
 */
export function createTestContract(
  customerId: string,
  vehicleId: string,
  createdBy: string,
  overrides?: Partial<InsertContract>
): InsertContract {
  const rentalStartDate = new Date();
  const rentalEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  return {
    customerId,
    vehicleId,
    rentalStartDate,
    rentalEndDate,
    pickupLocation: 'Test Branch',
    dropoffLocation: 'Test Branch',
    dailyRate: '250.00',
    totalDays: 7,
    totalAmount: '1750.00',
    termsAccepted: true,
    createdBy,
    ...overrides,
  };
}

/**
 * Create test payment
 */
export function createTestPayment(
  contractId: string,
  createdBy: string,
  overrides?: Partial<InsertPayment>
): InsertPayment {
  return {
    contractId,
    amount: '500.00',
    paymentMethod: 'cash',
    currency: 'AED',
    paidAt: new Date(),
    createdBy,
    ...overrides,
  };
}

/**
 * Create test driver
 */
export function createTestDriver(overrides?: Partial<InsertDriver>): InsertDriver {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return {
    nameEn: `Test Driver ${num}`,
    nationality: 'IN',
    mobile: `+97155${String(num).padStart(7, '0')}`,
    licenseNumber: `DL${String(num).padStart(8, '0')}`,
    licenseClass: 'LMV',
    employmentType: 'outsourced',
    passportId: `D${String(num).padStart(7, '0')}`,
    licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    visaExpiry: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000),
    disabled: false,
    ...overrides,
  };
}

/**
 * Create test driver rate card
 */
export function createTestDriverRateCard(driverId: string, overrides?: Partial<InsertDriverRateCard>): InsertDriverRateCard {
  return {
    driverId,
    rateType: 'daily',
    baseRate: '200.00',
    effectiveFrom: new Date(),
    ...overrides,
  };
}

/**
 * Create batch of test entities
 */
export function createTestBatch<T>(
  factory: () => T,
  count: number
): T[] {
  return Array.from({ length: count }, factory);
}

/**
 * Common test date scenarios
 */
export const testDates = {
  today: () => new Date(),
  tomorrow: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
  yesterday: () => new Date(Date.now() - 24 * 60 * 60 * 1000),
  nextWeek: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  lastWeek: () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  nextMonth: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  lastMonth: () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  addDays: (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000),
  addHours: (date: Date, hours: number) => new Date(date.getTime() + hours * 60 * 60 * 1000),
};

/**
 * Financial test helpers
 */
export const testFinancials = {
  /**
   * Create simple contract with known financials
   */
  simpleContract: (
    customerId: string,
    vehicleId: string,
    createdBy: string,
    days: number = 7,
    dailyRate: string = '100.00'
  ): InsertContract => {
    const subtotal = (parseFloat(dailyRate) * days).toFixed(2);
    const vatAmount = (parseFloat(subtotal) * 0.05).toFixed(2);
    const totalAmount = (parseFloat(subtotal) + parseFloat(vatAmount)).toFixed(2);

    return createTestContract(customerId, vehicleId, createdBy, {
      dailyRate,
      totalDays: days,
      subtotal,
      vatAmount,
      totalAmount,
      securityDeposit: '500.00',
    });
  },

  /**
   * Calculate expected outstanding balance
   */
  calculateOutstanding: (
    totalAmount: string,
    depositPaid: boolean,
    deposit: string,
    paymentAmounts: string[]
  ): string => {
    let outstanding = parseFloat(totalAmount);
    if (depositPaid) outstanding -= parseFloat(deposit);
    paymentAmounts.forEach(amt => outstanding -= parseFloat(amt));
    return Math.max(0, outstanding).toFixed(2);
  },
};
