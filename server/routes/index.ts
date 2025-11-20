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
// Additional route modules will be imported as they're created
// import branchRoutes from "./branchRoutes";
// import driverRoutes from "./driverRoutes";
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
  
  // Feature routes
  app.use('/api', paymentRoutes); // Payment routes have mixed base paths
  app.use('/api/reports', reportRoutes);
  // app.use('/api/branches', branchRoutes);
  // app.use('/api/drivers', driverRoutes);
  // etc.

  console.log('✅ Modular routes registered');
  console.log('   - Customer routes: /api/customers');
  console.log('   - Vehicle routes: /api/vehicles');
  console.log('   - User routes: /api/users');
  console.log('   - Contract routes: /api/contracts (15 routes)');
  console.log('   - Payment routes: /api/contracts/:id/payments, /api/payments/:id');
  console.log('   - Report routes: /api/reports (18 routes: 13 data + 5 exports)');
  console.log('   - Auth routes: /api/auth, /api/system');
  console.log('   - More routes being migrated...');
}
