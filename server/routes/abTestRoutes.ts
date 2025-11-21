/**
 * A/B Test Routes Module
 * Marketing and feature experimentation
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated, requireEditor, requireAdmin } from "../auth/localAuth";
import type { User } from "@shared/schema";
import { createAuditLog } from "../utils/routeHelpers";

const router = Router();

router.get("/", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tests = await storage.getAbTests();
    res.json(tests);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const test = await storage.getAbTest(req.params.id);
    if (!test) {
      return res.status(404).json({ message: "A/B test not found" });
    }
    res.json(test);
  } catch (error) {
    next(error);
  }
});

router.post("/", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const test = await storage.createAbTest(req.body);
    await createAuditLog(user.id, 'ab_test_created', undefined, req, `Created A/B test: ${req.body.testName}`);
    res.status(201).json(test);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/start", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const test = await storage.updateAbTest(req.params.id, { status: 'active', startedAt: new Date() });
    await createAuditLog(user.id, 'ab_test_started', undefined, req, `Started A/B test`);
    res.json(test);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/complete", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const test = await storage.updateAbTest(req.params.id, { status: 'completed', completedAt: new Date(), winningVariant: req.body.winningVariant });
    await createAuditLog(user.id, 'ab_test_completed', undefined, req, `Completed A/B test`);
    res.json(test);
  } catch (error) {
    next(error);
  }
});

export default router;
