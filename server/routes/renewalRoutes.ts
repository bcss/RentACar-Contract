/**
 * Renewal Request Routes Module
 * Contract renewal request management
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated, requireEditor, requireAdmin } from "../auth/localAuth";
import type { User } from "@shared/schema";
import { createAuditLog } from "../utils/routeHelpers";

const router = Router();

router.get("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      status: req.query.status as string | undefined,
      customerId: req.query.customerId as string | undefined,
    };
    const renewals = await storage.getRenewalRequests(filters);
    res.json(renewals);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const renewal = await storage.getRenewalRequest(req.params.id);
    if (!renewal) {
      return res.status(404).json({ message: "Renewal request not found" });
    }
    res.json(renewal);
  } catch (error) {
    next(error);
  }
});

router.post("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const renewal = await storage.createRenewalRequest({ ...req.body, createdBy: user.id });
    await createAuditLog(user.id, 'renewal_request_created', req.body.contractId, req, `Created renewal request`);
    res.status(201).json(renewal);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const renewal = await storage.updateRenewalRequest(req.params.id, req.body);
    await createAuditLog(user.id, 'renewal_request_updated', renewal.contractId, req, `Updated renewal request`);
    res.json(renewal);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    await storage.deleteRenewalRequest(req.params.id);
    await createAuditLog(user.id, 'renewal_request_deleted', undefined, req, `Deleted renewal request`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post("/:id/approve", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const renewal = await storage.updateRenewalRequest(req.params.id, { status: 'approved', reviewedBy: user.id, reviewedAt: new Date() });
    await createAuditLog(user.id, 'renewal_request_approved', renewal.contractId, req, `Approved renewal request`);
    res.json(renewal);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/reject", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const renewal = await storage.updateRenewalRequest(req.params.id, { status: 'rejected', reviewedBy: user.id, reviewedAt: new Date(), rejectionReason: req.body.rejectionReason });
    await createAuditLog(user.id, 'renewal_request_rejected', renewal.contractId, req, `Rejected renewal request`);
    res.json(renewal);
  } catch (error) {
    next(error);
  }
});

export default router;
