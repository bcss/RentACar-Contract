/**
 * Communication Routes Module
 * SMS/Email provider configuration and management
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated, requireEditor, requireAdmin } from "../auth/localAuth";
import type { User } from "@shared/schema";
import { createAuditLog } from "../utils/routeHelpers";

const router = Router();

router.get("/providers", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const providers = await storage.getCommunicationProviders();
    res.json(providers);
  } catch (error) {
    next(error);
  }
});

router.get("/providers/:id", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const provider = await storage.getCommunicationProvider(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: "Communication provider not found" });
    }
    res.json(provider);
  } catch (error) {
    next(error);
  }
});

router.post("/providers", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const provider = await storage.createCommunicationProvider(req.body);
    await createAuditLog(user.id, 'communication_provider_created', undefined, req, `Created ${req.body.type} provider: ${req.body.name}`);
    res.status(201).json(provider);
  } catch (error) {
    next(error);
  }
});

router.patch("/providers/:id", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const provider = await storage.updateCommunicationProvider(req.params.id, req.body);
    await createAuditLog(user.id, 'communication_provider_updated', undefined, req, `Updated communication provider`);
    res.json(provider);
  } catch (error) {
    next(error);
  }
});

router.delete("/providers/:id", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    await storage.deleteCommunicationProvider(req.params.id);
    await createAuditLog(user.id, 'communication_provider_deleted', undefined, req, `Deleted communication provider`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
