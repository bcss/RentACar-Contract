/**
 * Push Token Routes Module
 * Mobile push notification token management
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth/localAuth";
import type { User } from "@shared/schema";
import { createAuditLog } from "../utils/routeHelpers";

const router = Router();

router.get("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      customerId: req.query.customerId as string | undefined,
      platform: req.query.platform as string | undefined,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
    };
    const tokens = await storage.getPushNotificationTokens(filters);
    res.json(tokens);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = await storage.getPushNotificationToken(req.params.id);
    if (!token) {
      return res.status(404).json({ message: "Push token not found" });
    }
    res.json(token);
  } catch (error) {
    next(error);
  }
});

router.post("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const token = await storage.createPushNotificationToken(req.body);
    await createAuditLog(user.id, 'push_token_created', undefined, req, `Created push token`);
    res.status(201).json(token);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const token = await storage.updatePushNotificationToken(req.params.id, req.body);
    await createAuditLog(user.id, 'push_token_updated', undefined, req, `Updated push token`);
    res.json(token);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    await storage.deletePushNotificationToken(req.params.id);
    await createAuditLog(user.id, 'push_token_deleted', undefined, req, `Deleted push token`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post("/:id/activate", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const token = await storage.updatePushNotificationToken(req.params.id, { isActive: true });
    await createAuditLog(user.id, 'push_token_activated', undefined, req, `Activated push token`);
    res.json(token);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/deactivate", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const token = await storage.updatePushNotificationToken(req.params.id, { isActive: false });
    await createAuditLog(user.id, 'push_token_deactivated', undefined, req, `Deactivated push token`);
    res.json(token);
  } catch (error) {
    next(error);
  }
});

export default router;
