/**
 * Document Approval Routes Module
 * Document approval workflow management
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
      entityType: req.query.entityType as string | undefined,
    };
    const approvals = await storage.getDocumentApprovals(filters);
    res.json(approvals);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const approval = await storage.getDocumentApproval(req.params.id);
    if (!approval) {
      return res.status(404).json({ message: "Document approval not found" });
    }
    res.json(approval);
  } catch (error) {
    next(error);
  }
});

router.post("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const approval = await storage.createDocumentApproval({ ...req.body, requestedBy: user.id });
    await createAuditLog(user.id, 'document_approval_created', undefined, req, `Created document approval request`);
    res.status(201).json(approval);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const approval = await storage.updateDocumentApproval(req.params.id, req.body);
    await createAuditLog(user.id, 'document_approval_updated', undefined, req, `Updated document approval`);
    res.json(approval);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    await storage.deleteDocumentApproval(req.params.id);
    await createAuditLog(user.id, 'document_approval_deleted', undefined, req, `Deleted document approval`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post("/:id/approve", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const approval = await storage.updateDocumentApproval(req.params.id, { status: 'approved', approvedBy: user.id, approvedAt: new Date() });
    await createAuditLog(user.id, 'document_approval_approved', undefined, req, `Approved document`);
    res.json(approval);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/reject", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const approval = await storage.updateDocumentApproval(req.params.id, { status: 'rejected', approvedBy: user.id, approvedAt: new Date(), rejectionReason: req.body.rejectionReason });
    await createAuditLog(user.id, 'document_approval_rejected', undefined, req, `Rejected document`);
    res.json(approval);
  } catch (error) {
    next(error);
  }
});

export default router;
