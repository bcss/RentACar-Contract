# KarāraOS Local CI Checklist

**Version:** 1.1  
**Purpose:** Pre-release validation checklist for local development  
**Last Updated:** November 20, 2025

---

## Overview

This checklist must be completed **before any production release** or major deployment. All tests must run locally to ensure code quality, security, and functional correctness.

---

## Pre-Flight Checks

### 1. Code Quality

- [ ] **TypeScript Compilation**
  ```bash
  npm run build
  # Should complete with 0 errors
  ```

- [ ] **Linting**
  ```bash
  npm run lint
  # Fix any warnings before proceeding
  ```

---

## Security Tests

### 2. CSRF Protection

- [ ] **CSRF Token Generation**
  ```bash
  curl -X GET http://localhost:5000/api/csrf-token \
    -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
    -v
  # Should return 200 with csrfToken in body and csrf_token cookie
  ```

- [ ] **CSRF Protection Enforcement**
  ```bash
  # Test missing CSRF token (should fail with 403)
  curl -X POST http://localhost:5000/api/customers \
    -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
    -H "Content-Type: application/json" \
    -d '{"nameEn":"Test","phone":"1234567890"}' \
    -v
  # Should return 403 Forbidden with csrfError: true
  ```

- [ ] **CSRF Valid Token**
  ```bash
  # Test with valid CSRF token (should succeed)
  curl -X POST http://localhost:5000/api/customers \
    -H "Cookie: connect.sid=YOUR_SESSION_COOKIE; csrf_token=YOUR_CSRF_TOKEN" \
    -H "X-CSRF-Token: YOUR_CSRF_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"nameEn":"Test Customer","phone":"0501234567","email":"test@example.com"}' \
    -v
  # Should return 201 Created (if authenticated)
  ```

---

### 3. Authentication & Authorization

- [ ] **Session Fixation Protection**
  ```bash
  # 1. Get initial session ID
  curl -X GET http://localhost:5000/api/user -v 2>&1 | grep "connect.sid"
  # Note the session ID
  
  # 2. Login
  curl -X POST http://localhost:5000/api/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"your_password"}' \
    -v 2>&1 | grep "connect.sid"
  # Session ID should be DIFFERENT from step 1
  ```

- [ ] **Session Idle Timeout**
  ```bash
  # 1. Login and get session cookie
  # 2. Wait 16 minutes without activity
  # 3. Try to access protected endpoint
  curl -X GET http://localhost:5000/api/contracts \
    -H "Cookie: connect.sid=YOUR_OLD_SESSION" \
    -v
  # Should return 401 with sessionExpired: true
  ```

- [ ] **Role-Based Access Control (RBAC)**
  ```bash
  # Test staff user cannot access admin endpoints
  curl -X POST http://localhost:5000/api/users \
    -H "Cookie: connect.sid=STAFF_SESSION_COOKIE" \
    -H "X-CSRF-Token: CSRF_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"username":"testuser","password":"Test@1234","role":"staff"}' \
    -v
  # Should return 403 Forbidden (requireAdmin middleware)
  ```

---

## Financial Calculation Tests

### 4. Outstanding Balance Calculation

- [ ] **Formula Verification**
  ```javascript
  // Test in browser console or Node REPL
  const totalAmount = 1000;
  const extraCharges = 150;
  const depositPaid = 200;
  const totalPaid = 500;
  
  const outstanding = Math.max(0, (totalAmount + extraCharges) - depositPaid - totalPaid);
  console.assert(outstanding === 450, 'Outstanding balance calculation failed');
  // Should be 450 = (1000 + 150) - 200 - 500
  ```

- [ ] **Rounding Precision**
  ```javascript
  const value = 123.456789;
  const rounded = Math.round(value * 100) / 100;
  console.assert(rounded === 123.46, 'Rounding precision failed');
  // Should be 123.46 (2 decimal places)
  ```

- [ ] **Surcharge Calculator Tests**
  ```javascript
  // MANUAL TEST (automated test suite pending creation)
  // Test in Node REPL or browser console:
  
  // 1. Test night hour calculation (cross-midnight: 22:00 to 06:00)
  const start = new Date('2025-01-15T22:00:00');
  const end = new Date('2025-01-16T06:00:00');
  // Expected: 8 night hours
  
  // 2. Test weekend detection
  // Abu Dhabi: Friday (5) + Saturday (6)
  // Other emirates: Saturday (6) + Sunday (0)
  
  // 3. Test surcharge priority: Holiday > Weekend > Night
  
  // 4. Test VAT calculation accuracy
  const beforeVat = 100;
  const vat = beforeVat * (5 / 100);
  console.assert(vat === 5, 'VAT calculation failed');
  
  // NOTE: Automated test suite should be created for regression protection
  ```

---

## Data Binding Integrity

### 5. Database-Sourced Data

- [ ] **Dashboard Data Source Verification**
  ```bash
  # Open browser DevTools Network tab
  # Navigate to Dashboard
  # Verify all data comes from API calls (no hardcoded values)
  # Check:
  # - /api/reports/dashboard-stats
  # - /api/contracts
  # - /api/reports/financial-summary
  ```

- [ ] **No Mock Data in Production Code**
  ```bash
  # Search for mock data patterns
  grep -r "const mockData\|const sampleData\|FAKE_\|lorem" client/src/pages/*.tsx
  # Should only find DesignSamplesShowcase.tsx (acceptable)
  ```

---

## Functional Tests

### 6. Contract Lifecycle

- [ ] **Draft → Active → Completed → Closed**
  ```
  1. Create draft contract
  2. Confirm contract (requires requireEditor permission)
  3. Activate contract
  4. Complete contract (with inspection photos)
  5. Record final payment
  6. Close contract
  # Verify audit logs at each step
  ```

- [ ] **Validation Tests**
  ```
  # Test invalid inputs:
  - Empty required fields → 400 Bad Request
  - Invalid email format → 400 Bad Request
  - Past dates → 400 Bad Request
  - Negative financial values → 400 Bad Request
  ```

---

## Performance Tests

### 7. Load Testing (Optional but Recommended)

- [ ] **Contracts List Endpoint**
  ```bash
  # Use Apache Bench or similar
  ab -n 100 -c 10 http://localhost:5000/api/contracts \
    -H "Cookie: connect.sid=YOUR_SESSION" \
    -H "X-CSRF-Token: YOUR_TOKEN"
  # Target: < 500ms average response time
  ```

- [ ] **Dashboard Stats**
  ```bash
  ab -n 50 -c 5 http://localhost:5000/api/reports/dashboard-stats \
    -H "Cookie: connect.sid=YOUR_SESSION"
  # Target: < 1000ms average response time
  ```

---

## Regression Tests

### 8. Critical Business Flows

- [ ] **Payment Recording**
  - Deposit payment updates `depositPaid` flag
  - Final payment deducts from outstanding balance
  - Refund creates negative payment record

- [ ] **Vehicle Status Sync**
  - Contract activation sets vehicle status to "Rented"
  - Contract completion returns vehicle to "Available"
  - Contract deletion restores vehicle to previous status

- [ ] **Audit Trail Verification**
  - Field-level edits recorded in `contractEdits` table
  - Lifecycle events recorded in `auditLogs` table
  - User sessions tracked in `accessLogs` table

---

## Documentation Verification

### 9. Documentation Accuracy

- [ ] **SECURITY_AUDIT.md reflects current code**
  - CSRF middleware matches implementation
  - Session configuration matches code
  - RBAC permissions documented correctly

- [ ] **ARCHITECTURE.md is up to date**
  - Module structure matches actual codebase
  - API routes documented
  - Data flow diagrams accurate

- [ ] **MASTER_FEATURE_LIST.md complete**
  - All 63 database tables listed
  - All 120+ API endpoints documented
  - No missing features

---

## Pre-Deployment Final Checks

### 10. Environment Configuration

- [ ] **Production Environment Variables**
  ```bash
  # Verify required secrets are set:
  - DATABASE_URL (production database)
  - SESSION_SECRET (64-char hex)
  - SUPER_ADMIN_PASSWORD (strong password)
  - JWT_SECRET (separate from SESSION_SECRET)
  - NODE_ENV=production
  ```

- [ ] **Session Configuration**
  ```bash
  # Verify production session settings:
  - httpOnly: true
  - secure: true (HTTPS only)
  - sameSite: 'strict'
  - maxAge: 3600000 (1 hour recommended for production)
  ```

---

## Test Execution Summary

**Date:** _______________  
**Tester:** _______________  
**Branch/Commit:** _______________

| Test Category | Pass/Fail | Notes |
|--------------|-----------|-------|
| Code Quality | ☐ PASS ☐ FAIL | |
| CSRF Protection | ☐ PASS ☐ FAIL | |
| Auth & RBAC | ☐ PASS ☐ FAIL | |
| Financial Calculations | ☐ PASS ☐ FAIL | |
| Data Binding | ☐ PASS ☐ FAIL | |
| Contract Lifecycle | ☐ PASS ☐ FAIL | |
| Performance | ☐ PASS ☐ FAIL | |
| Audit Trails | ☐ PASS ☐ FAIL | |
| Documentation | ☐ PASS ☐ FAIL | |
| Environment Config | ☐ PASS ☐ FAIL | |

**Overall Status:** ☐ READY FOR DEPLOYMENT ☐ NEEDS FIXES

**Blockers (if any):**
_______________________________________________________________
_______________________________________________________________

---

## Troubleshooting

### Common Issues

**Issue:** CSRF token validation fails  
**Solution:** Ensure `csrf_token` cookie is not HttpOnly. Check `server/middleware/csrf.ts` line 34.

**Issue:** Session expires immediately  
**Solution:** Verify `SESSION_MAX_AGE` environment variable is set correctly (default: 3600000ms = 1 hour).

**Issue:** Financial calculations show NaN  
**Solution:** Check `validateFinancialInput()` usage on all financial fields. Ensure parseFloat() is wrapped with isFinite() checks.

**Issue:** Dashboard shows no data  
**Solution:** Verify API endpoints return data, not hardcoded arrays. Check Network tab in browser DevTools.

---

## Changelog

### Version 1.0 (November 20, 2025)
- Initial creation of CI/Local checklist
- Defined comprehensive pre-release testing procedures
- Established security, financial, and functional test requirements
- Created troubleshooting guide

### Version 1.1 (November 20, 2025 - Test Suite Correction)
- **Surcharge Calculator Tests:** Removed reference to non-existent `surchargeCalculator.test.ts` file
- Replaced with manual testing procedures (Node REPL / browser console tests)
- Added note that automated test suite should be created for regression protection
- Corrected per architect feedback to ensure checklist reflects actual repository state

---

**Status:** ✅ ACTIVE (Corrected v1.1)
**Next Review:** February 20, 2026
