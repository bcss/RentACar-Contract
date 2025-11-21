/**
 * Approval Routes Module
 * Multi-level approval workflows
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated, requireEditor, requireManagerOrAdmin } from "../auth/localAuth";
import type { User } from "@shared/schema";
import { createAuditLog } from "../utils/routeHelpers";

const router = Router();

// GET /api/approvals - List all approval requests
router.get("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const filters = {
      requestType: req.query.requestType as string | undefined,
      status: req.query.status as string | undefined,
      requestedBy: req.query.requestedBy as string | undefined,
      approverId: user.role === 'manager' || user.role === 'admin' ? undefined : user.id,
    };
    const approvals = await storage.getApprovalRequests(filters);
    res.json(approvals);
  } catch (error) {
    next(error);
  }
});

// GET /api/approvals/:id - Get approval request by ID
router.get("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const approval = await storage.getApprovalRequestById(req.params.id);
    if (!approval) {
      return res.status(404).json({ message: "Approval request not found" });
    }
    res.json(approval);
  } catch (error) {
    next(error);
  }
});

// POST /api/approvals - Create new approval request
router.post("/", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const approval = await storage.createApprovalRequest({
      ...req.body,
      requestedBy: user.id,
      requestedAt: new Date(),
    });
    await createAuditLog(user.id, 'approval_request_created', undefined, req, `Created approval request: ${approval.requestType}`);
    res.status(201).json(approval);
  } catch (error) {
    next(error);
  }
});

// POST /api/approvals/:id/approve - Approve request
router.post("/:id/approve", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const approval = await storage.updateApprovalRequest(req.params.id, {
      status: 'approved',
      reviewedBy: user.id,
      reviewedAt: new Date(),
      reviewComments: req.body.reviewComments,
    });
    await createAuditLog(user.id, 'approval_request_approved', undefined, req, `Approved request: ${approval.requestType}`);
    res.json(approval);
  } catch (error) {
    next(error);
  }
});

// POST /api/approvals/:id/reject - Reject request
router.post("/:id/reject", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const approval = await storage.updateApprovalRequest(req.params.id, {
      status: 'rejected',
      reviewedBy: user.id,
      reviewedAt: new Date(),
      reviewComments: req.body.reviewComments,
    });
    await createAuditLog(user.id, 'approval_request_rejected', undefined, req, `Rejected request: ${approval.requestType}`);
    res.json(approval);
  } catch (error) {
    next(error);
  }
});

export default router;
