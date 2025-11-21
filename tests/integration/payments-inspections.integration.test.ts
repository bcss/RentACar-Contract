import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { setupTestApp, getCsrfToken } from '../utils/testHelpers';
import { db } from '../../server/db';
import { payments, vehicleInspections, contracts, vehicles, customers } from '../../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Payments UPDATE and Inspections UPDATE Integration Tests
 * 
 * These tests verify the two endpoints marked as ❌ in COMPREHENSIVE_SYSTEM_AUDIT.md:
 * - PATCH /api/payments/:id (Payments UPDATE)
 * - PATCH /api/inspections/:id (Inspections UPDATE)
 * 
 * Tests cover:
 * - Runtime API execution
 * - CSRF protection
 * - Database persistence
 * - Input validation
 * - Business logic validation
 */

describe('Payments UPDATE and Inspections UPDATE Runtime Verification', () => {
  let app: express.Application;
  let csrfToken: string;
  let cookies: string[];

  // Test data IDs
  let testContractId: string;
  let testPaymentId: string;
  let testInspectionId: string;

  beforeAll(async () => {
    app = await setupTestApp();

    // Get CSRF token
    const tokenRes = await request(app).get('/api/csrf-token');
    csrfToken = tokenRes.body.csrfToken;
    cookies = Array.isArray(tokenRes.headers['set-cookie']) 
      ? tokenRes.headers['set-cookie'] 
      : [tokenRes.headers['set-cookie'] || ''];

    // Login as superadmin
    const loginRes = await request(app)
      .post('/api/login')
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken)
      .send({ username: 'superadmin', password: 'Admin@123456' });

    expect(loginRes.status).toBe(200);
    const loginCookies = loginRes.headers['set-cookie'];
    cookies = Array.isArray(loginCookies) ? loginCookies : [loginCookies || ''];

    // Refresh CSRF token after login
    const newTokenRes = await request(app)
      .get('/api/csrf-token')
      .set('Cookie', cookies);
    csrfToken = newTokenRes.body.csrfToken;
    const newCookies = newTokenRes.headers['set-cookie'];
    cookies = Array.isArray(newCookies) ? newCookies : [newCookies || ''];

    // Create test contract
    const [testCustomer] = await db.select().from(customers).limit(1);
    const [testVehicle] = await db.select().from(vehicles).limit(1);

    const contractData = {
      customerId: testCustomer.id,
      vehicleId: testVehicle.id,
      startDate: '2025-01-01',
      endDate: '2025-01-07',
      dailyRate: '100.00',
      securityDeposit: '500.00',
      status: 'draft',
    };

    const contractRes = await request(app)
      .post('/api/contracts')
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken)
      .send(contractData);

    expect(contractRes.status).toBe(201);
    testContractId = contractRes.body.id;

    // Create test payment for UPDATE testing
    const paymentData = {
      contractId: testContractId,
      amount: '100.00',
      paymentMethod: 'cash',
      paymentType: 'deposit',
    };

    const paymentRes = await request(app)
      .post('/api/payments')
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken)
      .send(paymentData);

    expect(paymentRes.status).toBe(201);
    testPaymentId = paymentRes.body.id;

    // Create test inspection for UPDATE testing
    const inspectionData = {
      contractId: testContractId,
      vehicleId: testVehicle.id,
      inspectionType: 'pre_delivery',
      odometerReading: 10000,
      fuelLevel: 100, // 0-100%
      conditionNotes: 'Initial inspection - vehicle in excellent condition',
      photos: [], // Empty photos array
    };

    const inspectionRes = await request(app)
      .post('/api/inspections')
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken)
      .send(inspectionData);

    expect(inspectionRes.status).toBe(201);
    testInspectionId = inspectionRes.body.id;
  });

  /**
   * TEST SUITE 1: Payments UPDATE Endpoint (Previously ❌)
   */
  describe('PATCH /api/payments/:id - Payments UPDATE', () => {
    it('should UPDATE payment successfully with valid data', async () => {
      const updateData = {
        amount: '150.00',
        paymentMethod: 'card',
        notes: 'Updated payment amount and method',
      };

      const res = await request(app)
        .patch(`/api/payments/${testPaymentId}`)
        .set('Cookie', cookies)
        .set('X-CSRF-Token', csrfToken)
        .send(updateData)
        .expect(200);

      expect(res.body).toHaveProperty('id', testPaymentId);
      expect(res.body.amount).toBe('150.00');
      expect(res.body.paymentMethod).toBe('card');
      expect(res.body.notes).toBe('Updated payment amount and method');

      console.log('✅ Payments UPDATE: Runtime execution verified');
    });

    it('should persist payment UPDATE to database', async () => {
      const [dbPayment] = await db
        .select()
        .from(payments)
        .where(eq(payments.id, testPaymentId));

      expect(dbPayment).toBeDefined();
      expect(dbPayment.amount).toBe('150.00');
      expect(dbPayment.paymentMethod).toBe('card');
      expect(dbPayment.notes).toBe('Updated payment amount and method');

      console.log('✅ Payments UPDATE: Database persistence verified');
    });

    it('should reject payment UPDATE without CSRF token', async () => {
      const updateData = {
        amount: '200.00',
      };

      const res = await request(app)
        .patch(`/api/payments/${testPaymentId}`)
        .set('Cookie', cookies)
        .send(updateData);

      expect(res.status).toBeGreaterThanOrEqual(400);
      console.log('✅ Payments UPDATE: CSRF protection verified');
    });

    it('should reject payment UPDATE with invalid amount', async () => {
      const updateData = {
        amount: '-50.00', // Negative amount should be rejected
      };

      const res = await request(app)
        .patch(`/api/payments/${testPaymentId}`)
        .set('Cookie', cookies)
        .set('X-CSRF-Token', csrfToken)
        .send(updateData);

      expect(res.status).toBeGreaterThanOrEqual(400);
      console.log('✅ Payments UPDATE: Input validation verified');
    });

    it('should reject payment UPDATE with non-existent payment ID', async () => {
      const updateData = {
        amount: '100.00',
      };

      const res = await request(app)
        .patch('/api/payments/non-existent-id')
        .set('Cookie', cookies)
        .set('X-CSRF-Token', csrfToken)
        .send(updateData);

      expect(res.status).toBe(404);
      console.log('✅ Payments UPDATE: Error handling verified');
    });
  });

  /**
   * TEST SUITE 2: Inspections UPDATE Endpoint (Previously ❌)
   */
  describe('PATCH /api/inspections/:id - Inspections UPDATE', () => {
    it('should UPDATE inspection successfully with valid data', async () => {
      const updateData = {
        odometerReading: 12000,
        fuelLevel: 75, // 75%
        conditionNotes: 'Updated odometer and fuel level - Minor scratch on front bumper',
      };

      const res = await request(app)
        .patch(`/api/inspections/${testInspectionId}`)
        .set('Cookie', cookies)
        .set('X-CSRF-Token', csrfToken)
        .send(updateData)
        .expect(200);

      expect(res.body).toHaveProperty('id', testInspectionId);
      expect(res.body.odometerReading).toBe(12000);
      expect(res.body.fuelLevel).toBe(75);
      expect(res.body.conditionNotes).toBe('Updated odometer and fuel level - Minor scratch on front bumper');

      console.log('✅ Inspections UPDATE: Runtime execution verified');
    });

    it('should persist inspection UPDATE to database', async () => {
      const [dbInspection] = await db
        .select()
        .from(vehicleInspections)
        .where(eq(vehicleInspections.id, testInspectionId));

      expect(dbInspection).toBeDefined();
      expect(dbInspection.odometerReading).toBe(12000);
      expect(dbInspection.fuelLevel).toBe(75);
      expect(dbInspection.conditionNotes).toBe('Updated odometer and fuel level - Minor scratch on front bumper');

      console.log('✅ Inspections UPDATE: Database persistence verified');
    });

    it('should reject inspection UPDATE without CSRF token', async () => {
      const updateData = {
        odometerReading: 15000,
      };

      const res = await request(app)
        .patch(`/api/inspections/${testInspectionId}`)
        .set('Cookie', cookies)
        .send(updateData);

      expect(res.status).toBeGreaterThanOrEqual(400);
      console.log('✅ Inspections UPDATE: CSRF protection verified');
    });

    it('should reject inspection UPDATE with invalid odometer (negative)', async () => {
      const updateData = {
        odometerReading: -1000, // Negative odometer should be rejected
      };

      const res = await request(app)
        .patch(`/api/inspections/${testInspectionId}`)
        .set('Cookie', cookies)
        .set('X-CSRF-Token', csrfToken)
        .send(updateData);

      expect(res.status).toBeGreaterThanOrEqual(400);
      console.log('✅ Inspections UPDATE: Input validation verified');
    });

    it('should reject inspection UPDATE with non-existent inspection ID', async () => {
      const updateData = {
        odometerReading: 20000,
      };

      const res = await request(app)
        .patch('/api/inspections/non-existent-id')
        .set('Cookie', cookies)
        .set('X-CSRF-Token', csrfToken)
        .send(updateData);

      expect(res.status).toBe(404);
      console.log('✅ Inspections UPDATE: Error handling verified');
    });

    it('should support partial UPDATE of inspection fields', async () => {
      // Update only conditionNotes, leave other fields unchanged
      const updateData = {
        conditionNotes: 'Partial update - only condition notes changed',
      };

      const res = await request(app)
        .patch(`/api/inspections/${testInspectionId}`)
        .set('Cookie', cookies)
        .set('X-CSRF-Token', csrfToken)
        .send(updateData)
        .expect(200);

      expect(res.body.conditionNotes).toBe('Partial update - only condition notes changed');
      // Verify other fields remain unchanged
      expect(res.body.odometerReading).toBe(12000); // From previous update

      console.log('✅ Inspections UPDATE: Partial update support verified');
    });
  });

  /**
   * TEST SUITE 3: Cross-Functional Verification
   */
  describe('Cross-Functional Runtime Verification', () => {
    it('should maintain referential integrity after payment UPDATE', async () => {
      // Verify contract still references the payment
      const [contract] = await db
        .select()
        .from(contracts)
        .where(eq(contracts.id, testContractId));

      expect(contract).toBeDefined();

      // Verify payment can be retrieved via contract relationship
      const contractPayments = await db
        .select()
        .from(payments)
        .where(eq(payments.contractId, testContractId));

      expect(contractPayments.length).toBeGreaterThan(0);
      const updatedPayment = contractPayments.find(p => p.id === testPaymentId);
      expect(updatedPayment).toBeDefined();

      console.log('✅ Payments UPDATE: Referential integrity verified');
    });

    it('should maintain referential integrity after inspection UPDATE', async () => {
      // Verify contract still references the inspection
      const [contract] = await db
        .select()
        .from(contracts)
        .where(eq(contracts.id, testContractId));

      expect(contract).toBeDefined();

      // Verify inspection can be retrieved via contract relationship
      const contractInspections = await db
        .select()
        .from(vehicleInspections)
        .where(eq(vehicleInspections.contractId, testContractId));

      expect(contractInspections.length).toBeGreaterThan(0);
      const updatedInspection = contractInspections.find(i => i.id === testInspectionId);
      expect(updatedInspection).toBeDefined();

      console.log('✅ Inspections UPDATE: Referential integrity verified');
    });
  });
});
