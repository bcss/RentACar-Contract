/**
 * Rate Plan Routes Module
 * Rental pricing and rate card management
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated, requireEditor, requireAdmin } from "../auth/localAuth";
import type { User } from "@shared/schema";
import { createAuditLog } from "../utils/routeHelpers";

const router = Router();

router.get("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await storage.getRentalRatePlans();
    res.json(plans);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plan = await storage.getRentalRatePlanById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Rate plan not found" });
    }
    res.json(plan);
  } catch (error) {
    next(error);
  }
});

router.post("/", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const plan = await storage.createRentalRatePlan(req.body);
    await createAuditLog(user.id, 'rate_plan_created', undefined, req, `Created rental rate plan: ${req.body.planName}`);
    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const plan = await storage.updateRentalRatePlan(req.params.id, req.body);
    await createAuditLog(user.id, 'rate_plan_updated', undefined, req, `Updated rental rate plan`);
    res.json(plan);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    await storage.deleteRentalRatePlan(req.params.id);
    await createAuditLog(user.id, 'rate_plan_deleted', undefined, req, `Deleted rental rate plan`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
