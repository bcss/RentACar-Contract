import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { setupTestApp, getCsrfToken } from '../utils/testHelpers';

/**
 * Outstanding Balance Integration Tests
 * Tests the actual contract financial calculations via HTTP endpoints
 * Validates outstandingBalance = grandTotal - totalPaid
 */

describe('Outstanding Balance Integration', () => {
  let app: express.Application;
  let authToken: string;
  let csrfToken: string;
  let customerId: string;
  let vehicleId: string;

  beforeEach(async () => {
    app = await setupTestApp();
    
    // Get CSRF token
    csrfToken = await getCsrfToken(app);
    
    // Login to get auth token
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
        nameEn: 'Test Customer',
        nameAr: 'عميل تجريبي',
        email: 'test@example.com',
        phone: '+971501234567',
        passportNumber: 'A12345678',
        licenseNumber: 'DL123456'
      });
    customerId = customerRes.body.id;

    // Create test vehicle
    const vehicleRes = await request(app)
      .post('/api/vehicles')
      .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
      .send({
        plateNumber: 'ABC123',
        make: 'Toyota',
        model: 'Camry',
        year: 2024,
        color: 'White',
        status: 'Available'
      });
    vehicleId = vehicleRes.body.id;
  });

  it('should calculate zero outstanding for contract with no payments', async () => {
    // Create contract with 5000 total
    const contractRes = await request(app)
      .post('/api/contracts')
      .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
      .send({
        customerId,
        vehicleId,
        startDate: '2024-01-01',
        endDate: '2024-01-10',
        dailyRate: '500',
        securityDeposit: '0',
        status: 'Reserved'
      });

    const contract = contractRes.body;
    
    // Get contract details to check outstanding
    const detailRes = await request(app)
      .get(`/api/contracts/${contract.id}`)
      .set('Cookie', authToken);
    
    const outstandingBalance = parseFloat(detailRes.body.outstandingBalance || '0');
    const grandTotal = parseFloat(detailRes.body.grandTotal || '0');
    
    // Outstanding should equal grand total (no payments made)
    expect(outstandingBalance).toBeGreaterThan(0);
    expect(outstandingBalance).toBe(grandTotal);
  });

  it('should reduce outstanding after partial payment', async () => {
    // Create contract
    const contractRes = await request(app)
      .post('/api/contracts')
      .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
      .send({
        customerId,
        vehicleId,
        startDate: '2024-01-01',
        endDate: '2024-01-10',
        dailyRate: '500',
        securityDeposit: '1000',
        status: 'Reserved'
      });

    const contractId = contractRes.body.id;
    
    // Get initial outstanding
    const initialRes = await request(app)
      .get(`/api/contracts/${contractId}`)
      .set('Cookie', authToken);
    const initialOutstanding = parseFloat(initialRes.body.outstandingBalance || '0');
    
    // Make payment of 2000
    await request(app)
      .post('/api/payments')
      .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
      .send({
        contractId,
        amount: '2000',
        paymentMethod: 'cash',
        currency: 'AED',
        notes: 'Partial payment',
        paidAt: new Date().toISOString()
      });
    
    // Get updated outstanding
    const updatedRes = await request(app)
      .get(`/api/contracts/${contractId}`)
      .set('Cookie', authToken);
    const updatedOutstanding = parseFloat(updatedRes.body.outstandingBalance || '0');
    
    // Outstanding should be reduced by payment amount
    expect(updatedOutstanding).toBeLessThan(initialOutstanding);
    expect(Math.round((initialOutstanding - updatedOutstanding) * 100) / 100).toBe(2000);
  });

  it('should show zero outstanding when fully paid', async () => {
    // Create small contract
    const contractRes = await request(app)
      .post('/api/contracts')
      .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
      .send({
        customerId,
        vehicleId,
        startDate: '2024-01-01',
        endDate: '2024-01-03',
        dailyRate: '500',
        securityDeposit: '500',
        status: 'Reserved'
      });

    const contractId = contractRes.body.id;
    
    // Get grand total
    const detailsRes = await request(app)
      .get(`/api/contracts/${contractId}`)
      .set('Cookie', authToken);
    const grandTotal = parseFloat(detailsRes.body.grandTotal || '0');
    
    // Pay full amount
    await request(app)
      .post('/api/payments')
      .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
      .send({
        contractId,
        amount: grandTotal.toString(),
        paymentMethod: 'card',
        currency: 'AED',
        notes: 'Full payment',
        paidAt: new Date().toISOString()
      });
    
    // Get updated outstanding
    const finalRes = await request(app)
      .get(`/api/contracts/${contractId}`)
      .set('Cookie', authToken);
    const outstanding = parseFloat(finalRes.body.outstandingBalance || '0');
    
    // Outstanding should be zero or very close (accounting for rounding)
    expect(Math.abs(outstanding)).toBeLessThan(0.01);
  });

  it('should handle multiple payments correctly', async () => {
    // Create contract
    const contractRes = await request(app)
      .post('/api/contracts')
      .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
      .send({
        customerId,
        vehicleId,
        startDate: '2024-01-01',
        endDate: '2024-01-10',
        dailyRate: '1000',
        securityDeposit: '2000',
        status: 'Reserved'
      });

    const contractId = contractRes.body.id;
    
    // Get initial outstanding
    const initialRes = await request(app)
      .get(`/api/contracts/${contractId}`)
      .set('Cookie', authToken);
    const initialOutstanding = parseFloat(initialRes.body.outstandingBalance || '0');
    
    // Make 3 payments
    await request(app)
      .post('/api/payments')
      .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
      .send({
        contractId,
        amount: '1000',
        paymentMethod: 'cash',
        currency: 'AED',
        paidAt: new Date().toISOString()
      });
    
    await request(app)
      .post('/api/payments')
      .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
      .send({
        contractId,
        amount: '2000',
        paymentMethod: 'card',
        currency: 'AED',
        paidAt: new Date().toISOString()
      });
    
    await request(app)
      .post('/api/payments')
      .set('Cookie', authToken)
      .set('X-CSRF-Token', csrfToken)
      .send({
        contractId,
        amount: '1500',
        paymentMethod: 'bank_transfer',
        currency: 'AED',
        paidAt: new Date().toISOString()
      });
    
    // Get final outstanding
    const finalRes = await request(app)
      .get(`/api/contracts/${contractId}`)
      .set('Cookie', authToken);
    const finalOutstanding = parseFloat(finalRes.body.outstandingBalance || '0');
    
    // Outstanding should be reduced by total payments (4500)
    const totalPaid = 1000 + 2000 + 1500;
    expect(Math.round((initialOutstanding - finalOutstanding) * 100) / 100).toBe(totalPaid);
  });
});
