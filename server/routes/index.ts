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
// Additional route modules will be imported as they're created
// import contractRoutes from "./contractRoutes";
// import userRoutes from "./userRoutes";
// import reportRoutes from "./reportRoutes";
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
  // app.use('/api/contracts', contractRoutes);
  // app.use('/api/users', userRoutes);
  
  // Feature routes
  // app.use('/api/reports', reportRoutes);
  // app.use('/api/payments', paymentRoutes);
  // app.use('/api/branches', branchRoutes);
  // app.use('/api/drivers', driverRoutes);
  // etc.

  console.log('✅ Modular routes registered');
  console.log('   - Customer routes: /api/customers');
  console.log('   - Vehicle routes: /api/vehicles');
  console.log('   - Auth routes: /api/auth, /api/system');
  console.log('   - More routes being migrated...');
}
