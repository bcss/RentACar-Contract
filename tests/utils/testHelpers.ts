import { expect } from 'vitest';
import type { Contract, Payment, Customer, Vehicle } from '../../shared/schema';
import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { storage } from '../../server/storage';
import { verifyPassword } from '../../server/auth/passwordUtils';
import { csrfProtection, csrfTokenGenerator } from '../../server/middleware/csrf';
import authRoutes from '../../server/routes/authRoutes';
import customerRoutes from '../../server/routes/customerRoutes';
import vehicleRoutes from '../../server/routes/vehicleRoutes';
import userRoutes from '../../server/routes/userRoutes';
import paymentRoutes from '../../server/routes/paymentRoutes';
import contractRoutes from '../../server/routes/contractRoutes';
import reportRoutes from '../../server/routes/reportRoutes';

/**
 * Test Helper Functions
 * Common assertions and utilities for test suites
 */

/**
 * Get CSRF token from the test app
 */
export async function getCsrfToken(app: express.Application): Promise<string> {
  const request = (await import('supertest')).default;
  const res = await request(app).get('/api/csrf-token');
  return res.body.csrfToken;
}

/**
 * Setup Express app with all routes for integration testing
 */
export async function setupTestApp(): Promise<express.Application> {
  const app = express();
  
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser()); // Required for CSRF protection
  
  // Session middleware
  app.use(session({
    secret: 'test-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  }));
  
  // Passport configuration
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }
        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: Express.User, cb) => {
    cb(null, (user as any).id);
  });

  passport.deserializeUser(async (id: string, cb) => {
    try {
      const user = await storage.getUser(id);
      cb(null, user);
    } catch (error) {
      cb(error);
    }
  });
  
  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
  
  // CSRF token generation endpoint (must be before CSRF protection)
  app.get('/api/csrf-token', csrfTokenGenerator);
  
  // Add login route (from localAuth.ts) - must be before CSRF protection
  app.post("/api/login", (req: any, res: any, next: any) => {
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.session.regenerate((regenerateErr: any) => {
        if (regenerateErr) {
          return res.status(500).json({ message: "Login failed" });
        }
        req.login(user, async (loginErr: any) => {
          if (loginErr) {
            return res.status(500).json({ message: "Login failed" });
          }
          return res.json({ 
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isImmutable: user.isImmutable,
          });
        });
      });
    })(req, res, next);
  });

  // Add branding and settings routes for testing
  app.get('/api/branding', async (req: any, res: any) => {
    try {
      const settings = await storage.getCompanySettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch branding" });
    }
  });

  app.get('/api/settings', async (req: any, res: any) => {
    try {
      const settings = await storage.getCompanySettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put('/api/settings', async (req: any, res: any) => {
    try {
      await storage.updateCompanySettings(req.body);
      res.json({ message: "Settings updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });
  
  // Apply CSRF protection to all routes AFTER login and csrf-token
  // This protects POST/PUT/PATCH/DELETE while allowing /api/login and /api/csrf-token to bypass
  app.use(csrfProtection);
  
  // Register all route modules (same pattern as server/routes/index.ts)
  app.use('/api', authRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/vehicles', vehicleRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/contracts', contractRoutes);
  app.use('/api', paymentRoutes);
  app.use('/api/reports', reportRoutes);
  
  return app;
}

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
