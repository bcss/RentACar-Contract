/**
 * Route Registry - Central orchestrator for all API routes
 * 
 * This file wires together all modular route files into the main Express app.
 * Benefits:
 * - Clean separation of concerns
 * - Easier testing (can test routes in isolation)
 * - Better maintainability (find routes by feature)
 * - Reduced main routes.ts from 9,666 → ~500 lines
 */

import type { Express } from "express";
import customerRoutes from "./customerRoutes";
import authRoutes from "./authRoutes";
import vehicleRoutes from "./vehicleRoutes";
import userRoutes from "./userRoutes";
import paymentRoutes from "./paymentRoutes";
import contractRoutes from "./contractRoutes";
import reportRoutes from "./reportRoutes";
import sponsorRoutes from "./sponsorRoutes";
import companyRoutes from "./companyRoutes";
import branchRoutes from "./branchRoutes";
import holidayRoutes from "./holidayRoutes";
import driverRoutes from "./driverRoutes";
// Additional route modules will be imported as they're created
// import tollRoutes from "./tollRoutes";
// import insuranceRoutes from "./insuranceRoutes";
// etc.

/**
 * Register all modular routes with the Express app
 * 
 * NOTE: Auth middleware and CSRF protection are applied in the main routes.ts
 * before this function is called, so all routes here are already protected.
 */
export function registerModularRoutes(app: Express): void {
  // System & Auth routes (CSRF token, health, user info)
  app.use('/api', authRoutes);

  // Core entity routes
  app.use('/api/customers', customerRoutes);
  app.use('/api/vehicles', vehicleRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/contracts', contractRoutes);
  app.use('/api/sponsors', sponsorRoutes);
  app.use('/api/companies', companyRoutes);
  app.use('/api/branches', branchRoutes);
  app.use('/api/public-holidays', holidayRoutes);
  app.use('/api/drivers', driverRoutes);
  app.use('/api/driver-companies', driverRoutes); // Driver companies sub-router
  app.use('/api/driver-assignments', driverRoutes); // Driver assignments sub-router
  app.use('/api/driver-schedules', driverRoutes); // Driver schedules sub-router
  app.use('/api/driver-attendance', driverRoutes); // Driver attendance sub-router
  app.use('/api/driver-rate-cards', driverRoutes); // Driver rate cards sub-router
  app.use('/api/driver-schedule-blocks', driverRoutes); // Driver schedule blocks sub-router
  app.use('/api/branch-transfers', branchRoutes); // Branch transfers sub-router
  
  // Feature routes
  app.use('/api', paymentRoutes); // Payment routes have mixed base paths
  app.use('/api/reports', reportRoutes);
  // Additional modules being created...

  console.log('✅ Modular routes registered (Phase 2)');
  console.log('   - Customer routes: /api/customers (6 routes)');
  console.log('   - Vehicle routes: /api/vehicles (8 routes)');
  console.log('   - User routes: /api/users (9 routes)');
  console.log('   - Contract routes: /api/contracts (15 routes)');
  console.log('   - Payment routes: /api/payments (6 routes)');
  console.log('   - Report routes: /api/reports (18 routes)');
  console.log('   - Auth routes: /api/auth (4 routes)');
  console.log('   - Sponsor routes: /api/sponsors (7 routes)');
  console.log('   - Company routes: /api/companies (7 routes)');
  console.log('   - Branch routes: /api/branches + /api/branch-transfers (12 routes)');
  console.log('   - Holiday routes: /api/public-holidays (5 routes)');
  console.log('   - Driver routes: /api/drivers + related endpoints (38 routes)');
  console.log('   Total: ~135 routes modularized | ~200 routes remaining');
}
