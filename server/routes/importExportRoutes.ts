/**
 * Import/Export Routes Module
 * Bulk data import and report export utilities
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { requireAdmin } from "../auth/localAuth";
import type { User } from "@shared/schema";
import { createAuditLog } from "../utils/routeHelpers";

const router = Router();

// ==================== IMPORT ENDPOINTS (Admin only) ====================

router.post("/import/customers", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const records = Array.isArray(req.body) ? req.body : [req.body];
    const results = await storage.importCustomers(records);
    await createAuditLog(user.id as string, 'customers_imported', undefined, req, `Imported ${results.length} customers`);
    res.json({ imported: results.length, records: results });
  } catch (error) {
    next(error);
  }
});

router.post("/import/vehicles", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const records = Array.isArray(req.body) ? req.body : [req.body];
    const results = await storage.importVehicles(records);
    await createAuditLog(user.id as string, 'vehicles_imported', undefined, req, `Imported ${results.length} vehicles`);
    res.json({ imported: results.length, records: results });
  } catch (error) {
    next(error);
  }
});

router.post("/import/sponsors", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const records = Array.isArray(req.body) ? req.body : [req.body];
    const results = await storage.importSponsors(records);
    await createAuditLog(user.id as string, 'sponsors_imported', undefined, req, `Imported ${results.length} sponsors`);
    res.json({ imported: results.length, records: results });
  } catch (error) {
    next(error);
  }
});

router.post("/import/companies", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const records = Array.isArray(req.body) ? req.body : [req.body];
    const results = await storage.importCompanies(records);
    await createAuditLog(user.id as string, 'companies_imported', undefined, req, `Imported ${results.length} companies`);
    res.json({ imported: results.length, records: results });
  } catch (error) {
    next(error);
  }
});

router.post("/import/contracts", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const records = Array.isArray(req.body) ? req.body : [req.body];
    const results = await storage.importContracts(records);
    await createAuditLog(user.id as string, 'contracts_imported', undefined, req, `Imported ${results.length} contracts`);
    res.json({ imported: results.length, records: results });
  } catch (error) {
    next(error);
  }
});

// ==================== EXPORT ENDPOINTS (Already in reportRoutes.ts) ====================
// Export endpoints are already handled by reportRoutes.ts
// This module focuses on bulk import functionality

export default router;
