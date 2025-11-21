/**
 * Audit Routes Module
 * Audit logs and access logs
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated, requireManagerOrAdmin } from "../auth/localAuth";
import { validateSearchQuery } from "../utils/routeHelpers";
import type { User } from "@shared/schema";

const router = Router();

// GET /api/audit-logs - List audit logs
router.get("/", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      userId: req.query.userId as string | undefined,
      action: req.query.action as string | undefined,
      contractId: req.query.contractId as string | undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    };
    
    const logs = await storage.getAuditLogs(filters);
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

// GET /api/audit-logs/:id - Get audit log by ID
router.get("/:id", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const log = await storage.getAuditLogById(req.params.id);
    if (!log) {
      return res.status(404).json({ message: "Audit log not found" });
    }
    res.json(log);
  } catch (error) {
    next(error);
  }
});

// GET /api/audit-logs/contract/:contractId - Get contract audit logs
router.get("/contract/:contractId", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await storage.getContractAuditLogs(req.params.contractId);
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

// GET /api/access-logs - List access logs
router.get("/access/list", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      userId: req.query.userId as string | undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    };
    
    const logs = await storage.getAccessLogs(filters);
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

// GET /api/access-logs/:id - Get access log by ID
router.get("/access/:id", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const log = await storage.getAccessLogById(req.params.id);
    if (!log) {
      return res.status(404).json({ message: "Access log not found" });
    }
    res.json(log);
  } catch (error) {
    next(error);
  }
});

export default router;
