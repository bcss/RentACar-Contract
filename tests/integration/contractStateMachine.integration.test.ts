import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { setupTestApp, getCsrfToken } from '../utils/testHelpers';

/**
 * Contract State Machine Integration Tests
 * Tests the actual 4-state lifecycle via HTTP endpoints
 * State flow: draft → active → Completed → (Void from Reserved/Active)
 */

describe('Contract State Machine Integration', () => {
  let app: express.Application;
  let authToken: string;
  let csrfToken: string;
  let customerId: string;
  let vehicleId: string;

  beforeEach(async () => {
    app = await setupTestApp();
    
    // Get CSRF token
    csrfToken = await getCsrfToken(app);
    
    // Login
    const loginRes = await request(app)
      .post('/api/login')
      .send({ username: 'superadmin', password: 'Admin@123456' });
    authToken = loginRes.headers['set-cookie'];

    // Create test customer
    const customerRes = await request(app)
      .post('/api/customers')
      .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
      .set('X-CSRF-Token', csrfToken)
      .send({
        nameEn: 'State Machine Test',
        nameAr: 'اختبار حالة',
        email: 'statemachine@test.com',
        phone: '+971501111111',
        passportNumber: 'SM123456',
        licenseNumber: 'SMDL123'
      });
    customerId = customerRes.body.id;

    // Create test vehicle
    const vehicleRes = await request(app)
      .post('/api/vehicles')
      .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
      .send({
        plateNumber: 'SM001',
        make: 'Honda',
        model: 'Civic',
        year: 2024,
        color: 'Blue',
        status: 'Available'
      });
    vehicleId = vehicleRes.body.id;
  });

  describe('Valid Transitions', () => {
    it('should allow draft → active transition', async () => {
      // Create Reserved contract
      const contractRes = await request(app)
        .post('/api/contracts')
        .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
        .send({
          customerId,
          vehicleId,
          startDate: '2024-01-01',
          endDate: '2024-01-05',
          dailyRate: '300',
          status: 'draft'
        });

      const contractId = contractRes.body.id;
      expect(contractRes.body.status).toBe('draft');
      
      // Transition to Active
      const updateRes = await request(app)
        .patch(`/api/contracts/${contractId}`)
        .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
        .send({
          status: 'active',
          editReason: 'Customer picked up vehicle - activating contract as per standard procedure'
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.status).toBe('active');
    });

    it('should allow active → completed transition', async () => {
      // Create and activate contract
      const contractRes = await request(app)
        .post('/api/contracts')
        .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
        .send({
          customerId,
          vehicleId,
          startDate: '2024-01-01',
          endDate: '2024-01-05',
          dailyRate: '300',
          status: 'draft'
        });

      const contractId = contractRes.body.id;
      
      // Activate
      await request(app)
        .patch(`/api/contracts/${contractId}`)
        .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
        .send({
          status: 'active',
          editReason: 'Activating contract for testing state machine transitions and validating workflow'
        });
      
      // Complete
      const completeRes = await request(app)
        .patch(`/api/contracts/${contractId}`)
        .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
        .send({
          status: 'completed',
          editReason: 'Contract period ended - customer returned vehicle in good condition as expected'
        });

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.status).toBe('completed');
    });

    it('should allow draft → closed transition', async () => {
      // Create Reserved contract
      const contractRes = await request(app)
        .post('/api/contracts')
        .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
        .send({
          customerId,
          vehicleId,
          startDate: '2024-01-01',
          endDate: '2024-01-05',
          dailyRate: '300',
          status: 'draft'
        });

      const contractId = contractRes.body.id;
      
      // Void
      const voidRes = await request(app)
        .patch(`/api/contracts/${contractId}`)
        .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
        .send({
          status: 'closed',
          editReason: 'Customer cancelled reservation - voiding contract before activation as per policy'
        });

      expect(voidRes.status).toBe(200);
      expect(voidRes.body.status).toBe('closed');
    });

    it('should allow active → closed transition', async () => {
      // Create and activate
      const contractRes = await request(app)
        .post('/api/contracts')
        .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
        .send({
          customerId,
          vehicleId,
          startDate: '2024-01-01',
          endDate: '2024-01-05',
          dailyRate: '300',
          status: 'draft'
        });

      const contractId = contractRes.body.id;
      
      await request(app)
        .patch(`/api/contracts/${contractId}`)
        .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
        .send({
          status: 'active',
          editReason: 'Activating contract to test void transition from active state in workflow'
        });
      
      // Void
      const voidRes = await request(app)
        .patch(`/api/contracts/${contractId}`)
        .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
        .send({
          status: 'closed',
          editReason: 'Customer requested cancellation during active period - voiding contract as requested'
        });

      expect(voidRes.status).toBe(200);
      expect(voidRes.body.status).toBe('closed');
    });
  });

  describe('Invalid Transitions', () => {
    it('should NOT allow Reserved → Completed (must go through Active)', async () => {
      // Create Reserved
      const contractRes = await request(app)
        .post('/api/contracts')
        .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
        .send({
          customerId,
          vehicleId,
          startDate: '2024-01-01',
          endDate: '2024-01-05',
          dailyRate: '300',
          status: 'draft'
        });

      const contractId = contractRes.body.id;
      
      // Try to complete directly
      const res = await request(app)
        .patch(`/api/contracts/${contractId}`)
        .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
        .send({
          status: 'completed',
          editReason: 'Testing invalid transition from reserved to completed bypassing active state'
        });

      // Should fail
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('should NOT allow Completed → any state (terminal)', async () => {
      // Create, activate, and complete contract
      const contractRes = await request(app)
        .post('/api/contracts')
        .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
        .send({
          customerId,
          vehicleId,
          startDate: '2024-01-01',
          endDate: '2024-01-05',
          dailyRate: '300',
          status: 'draft'
        });

      const contractId = contractRes.body.id;
      
      await request(app)
        .patch(`/api/contracts/${contractId}`)
        .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
        .send({
          status: 'active',
          editReason: 'Activating contract to reach completed state for terminal test'
        });
      
      await request(app)
        .patch(`/api/contracts/${contractId}`)
        .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
        .send({
          status: 'completed',
          editReason: 'Completing contract to test terminal state restrictions'
        });
      
      // Try to void completed contract
      const voidRes = await request(app)
        .patch(`/api/contracts/${contractId}`)
        .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
        .send({
          status: 'closed',
          editReason: 'Testing invalid transition - completed contracts cannot be voided'
        });

      expect(voidRes.status).toBeGreaterThanOrEqual(400);
    });

    it('should NOT allow Void → any state (terminal)', async () => {
      // Create and void
      const contractRes = await request(app)
        .post('/api/contracts')
        .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
        .send({
          customerId,
          vehicleId,
          startDate: '2024-01-01',
          endDate: '2024-01-05',
          dailyRate: '300',
          status: 'draft'
        });

      const contractId = contractRes.body.id;
      
      await request(app)
        .patch(`/api/contracts/${contractId}`)
        .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
        .send({
          status: 'closed',
          editReason: 'Voiding contract to test terminal state restrictions'
        });
      
      // Try to activate voided contract
      const activateRes = await request(app)
        .patch(`/api/contracts/${contractId}`)
        .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
        .send({
          status: 'active',
          editReason: 'Testing invalid transition - void contracts cannot be reactivated'
        });

      expect(activateRes.status).toBeGreaterThanOrEqual(400);
    });
  });
});
