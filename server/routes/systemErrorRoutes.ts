/**
 * System Error Routes Module
 * Error logging and monitoring
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated, requireAdmin } from "../auth/localAuth";
import type { User } from "@shared/schema";
import { createAuditLog } from "../utils/routeHelpers";

const router = Router();

router.get("/", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = await storage.getAllSystemErrors();
    res.json(errors);
  } catch (error) {
    next(error);
  }
});

router.get("/unacknowledged", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = await storage.getUnacknowledgedSystemErrors();
    res.json(errors);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/acknowledge", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const error = await storage.acknowledgeSystemError(req.params.id, user.id);
    await createAuditLog(user.id, 'system_error_acknowledged', undefined, req, `Acknowledged system error`);
    res.json(error);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/mark-sent", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Method not yet implemented - acknowledge serves similar purpose
    const error = await storage.acknowledgeSystemError(req.params.id, (req.user as User).id);
    res.json(error);
  } catch (error) {
    next(error);
  }
});

router.post("/log", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const error = await storage.createSystemError(req.body);
    res.status(201).json(error);
  } catch (error) {
    next(error);
  }
});

export default router;
