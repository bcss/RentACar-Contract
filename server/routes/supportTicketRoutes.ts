/**
 * Support Ticket Routes Module
 * Customer support ticket management
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
      priority: req.query.priority as string | undefined,
      assignedTo: req.query.assignedTo as string | undefined,
    };
    const tickets = await storage.getSupportTickets(filters);
    res.json(tickets);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ticket = await storage.getSupportTicket(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }
    res.json(ticket);
  } catch (error) {
    next(error);
  }
});

router.post("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const ticket = await storage.createSupportTicket({ ...req.body, createdBy: user.id });
    await createAuditLog(user.id, 'support_ticket_created', undefined, req, `Created support ticket`);
    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const ticket = await storage.updateSupportTicket(req.params.id, req.body);
    await createAuditLog(user.id, 'support_ticket_updated', undefined, req, `Updated support ticket`);
    res.json(ticket);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    await storage.deleteSupportTicket(req.params.id);
    await createAuditLog(user.id, 'support_ticket_deleted', undefined, req, `Deleted support ticket`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post("/:id/assign", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const ticket = await storage.updateSupportTicket(req.params.id, { assignedTo: req.body.assignedTo });
    await createAuditLog(user.id, 'support_ticket_assigned', undefined, req, `Assigned support ticket`);
    res.json(ticket);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/resolve", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const ticket = await storage.updateSupportTicket(req.params.id, { status: 'resolved', resolvedAt: new Date(), resolvedBy: user.id });
    await createAuditLog(user.id, 'support_ticket_resolved', undefined, req, `Resolved support ticket`);
    res.json(ticket);
  } catch (error) {
    next(error);
  }
});

export default router;
