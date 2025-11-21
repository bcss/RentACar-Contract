/**
 * Main Routes File - Minimal Orchestrator
 * All route handlers have been modularized into server/routes/* modules
 * This file only contains setup, middleware, and orchestration
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import { seedSuperAdmin } from "./auth/seedSuperAdmin";
import { seedCompanySettings } from "./seedCompanySettings";
import { setupAuth } from "./auth/localAuth";
import { apiLimiter } from "./rateLimiters";
import { performanceMonitoring } from "./middleware/performanceMonitoring";
import { registerModularRoutes } from "./routes/index";

export async function registerRoutes(app: Express): Promise<Server> {
  // APM Performance Monitoring (tracks all requests)
  app.use(performanceMonitoring);
  
  // Auth middleware (includes authLimiter for /api/login and /api/users/change-password)
  await setupAuth(app);
  
  // CRITICAL: Apply API rate limiter AFTER setupAuth so req.user is available
  // for the hybrid key generator (user ID for authenticated, IP for unauthenticated)
  // Note: authLimiter is applied inside setupAuth before login routes are defined
  app.use('/api/', apiLimiter);
  
  // Seed super admin on startup
  await seedSuperAdmin();
  
  // Seed company settings on startup
  await seedCompanySettings();
  
  // ============================================
  // MODULAR ROUTES (Phase 2 Complete)
  // ============================================
  // All route handlers are now in server/routes/* modules
  // This improves code maintainability and enables isolated testing
  registerModularRoutes(app);
  
  // Start server
  const server = createServer(app);
  return server;
}
