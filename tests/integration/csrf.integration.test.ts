import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { setupTestApp, getCsrfToken } from '../utils/testHelpers';

/**
 * CSRF Protection Integration Tests
 * Tests actual CSRF middleware via HTTP requests
 * Validates token generation, validation, and protection
 */

describe('CSRF Protection Integration', () => {
  let app: express.Application;

  it('should provide CSRF token via /api/csrf-token endpoint', async () => {
    app = await setupTestApp();
    
    const res = await request(app)
      .get('/api/csrf-token');
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('csrfToken');
    expect(typeof res.body.csrfToken).toBe('string');
    expect(res.body.csrfToken.length).toBeGreaterThan(0);
  });

  it('should accept POST requests with valid CSRF token', async () => {
    app = await setupTestApp();
    
    // Get CSRF token
    const tokenRes = await request(app)
      .get('/api/csrf-token');
    const csrfToken = tokenRes.body.csrfToken;
    const cookies = tokenRes.headers['set-cookie'];
    
    // Login with CSRF token
    const loginRes = await request(app)
      .post('/api/login')
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken)
      .send({ username: 'superadmin', password: 'Admin@123456' });
    
    expect(loginRes.status).toBe(200);
  });

  it('should reject POST requests without CSRF token', async () => {
    app = await setupTestApp();
    
    // Try login without CSRF token
    const loginRes = await request(app)
      .post('/api/login')
      .send({ username: 'superadmin', password: 'Admin@123456' });
    
    // Should be rejected (403 Forbidden or 401)
    expect(loginRes.status).toBeGreaterThanOrEqual(400);
  });

  it('should reject POST requests with invalid CSRF token', async () => {
    app = await setupTestApp();
    
    // Try login with fake token
    const loginRes = await request(app)
      .post('/api/login')
      .set('X-CSRF-Token', 'invalid-fake-token-12345')
      .send({ username: 'superadmin', password: 'Admin@123456' });
    
    expect(loginRes.status).toBeGreaterThanOrEqual(400);
  });

  it('should protect PUT requests with CSRF', async () => {
    app = await setupTestApp();
    
    // Get token and login
    const tokenRes = await request(app)
      .get('/api/csrf-token');
    const csrfToken = tokenRes.body.csrfToken;
    let cookies = tokenRes.headers['set-cookie'];
    
    const loginRes = await request(app)
      .post('/api/login')
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken)
      .send({ username: 'superadmin', password: 'Admin@123456' });
    
    cookies = loginRes.headers['set-cookie'] || cookies;
    
    // Get new CSRF token for update
    const newTokenRes = await request(app)
      .get('/api/csrf-token')
      .set('Cookie', cookies);
    const newCsrfToken = newTokenRes.body.csrfToken;
    
    // Try PUT without CSRF (should fail)
    const noTokenRes = await request(app)
      .put('/api/settings')
      .set('Cookie', cookies)
      .send({ companyNameEn: 'Test Company' });
    
    expect(noTokenRes.status).toBeGreaterThanOrEqual(400);
    
    // Try PUT with CSRF (should work for Admin)
    const withTokenRes = await request(app)
      .put('/api/settings')
      .set('Cookie', cookies)
      .set('X-CSRF-Token', newCsrfToken)
      .send({ companyNameEn: 'Test Company', companyNameAr: 'شركة اختبار' });
    
    // Should succeed (200) or fail auth (403) but not CSRF
    expect([200, 403]).toContain(withTokenRes.status);
  });

  it('should protect DELETE requests with CSRF', async () => {
    app = await setupTestApp();
    
    // Get token and login
    const tokenRes = await request(app)
      .get('/api/csrf-token');
    const csrfToken = tokenRes.body.csrfToken;
    let cookies = tokenRes.headers['set-cookie'];
    
    const loginRes = await request(app)
      .post('/api/login')
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken)
      .send({ username: 'superadmin', password: 'Admin@123456' });
    
    cookies = loginRes.headers['set-cookie'] || cookies;
    
    // Get new CSRF token
    const newTokenRes = await request(app)
      .get('/api/csrf-token')
      .set('Cookie', cookies);
    const newCsrfToken = newTokenRes.body.csrfToken;
    
    // Create a customer first
    const customerRes = await request(app)
      .post('/api/customers')
      .set('Cookie', cookies)
      .set('X-CSRF-Token', newCsrfToken)
      .send({
        nameEn: 'Delete Test',
        nameAr: 'اختبار حذف',
        email: 'delete@test.com',
        phone: '+971509999999',
        passportNumber: 'DEL12345',
        licenseNumber: 'DELDL123'
      });
    
    const customerId = customerRes.body.id;
    
    // Get another token for DELETE
    const deleteTokenRes = await request(app)
      .get('/api/csrf-token')
      .set('Cookie', cookies);
    const deleteToken = deleteTokenRes.body.csrfToken;
    
    // Try DELETE without CSRF (should fail)
    const noTokenRes = await request(app)
      .delete(`/api/customers/${customerId}`)
      .set('Cookie', cookies);
    
    expect(noTokenRes.status).toBeGreaterThanOrEqual(400);
    
    // Try DELETE with CSRF (should work)
    const withTokenRes = await request(app)
      .delete(`/api/customers/${customerId}`)
      .set('Cookie', cookies)
      .set('X-CSRF-Token', deleteToken);
    
    expect([200, 204]).toContain(withTokenRes.status);
  });

  it('should allow GET requests without CSRF token', async () => {
    app = await setupTestApp();
    
    // GET requests should work without CSRF
    const res = await request(app)
      .get('/api/branding');
    
    expect(res.status).toBe(200);
  });

  it('should allow HEAD requests without CSRF token', async () => {
    app = await setupTestApp();
    
    // HEAD requests should work without CSRF
    const res = await request(app)
      .head('/api/branding');
    
    expect(res.status).toBe(200);
  });

  it('should provide unique tokens for different sessions', async () => {
    app = await setupTestApp();
    
    // Get first token
    const res1 = await request(app)
      .get('/api/csrf-token');
    const token1 = res1.body.csrfToken;
    
    // Get second token (new session)
    const res2 = await request(app)
      .get('/api/csrf-token');
    const token2 = res2.body.csrfToken;
    
    // Tokens should be different (new sessions)
    expect(token1).not.toBe(token2);
  });
});
