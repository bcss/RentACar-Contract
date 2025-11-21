/**
 * Notification Routes Module
 * Notification templates, reminders, and communications
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated, requireEditor, requireManagerOrAdmin } from "../auth/localAuth";
import type { User } from "@shared/schema";
import { createAuditLog } from "../utils/routeHelpers";

const router = Router();

// ==================== NOTIFICATION TEMPLATES ====================

router.get("/templates", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      category: req.query.category as string | undefined,
      channel: req.query.channel as string | undefined,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
    };
    const templates = await storage.getNotificationTemplates(filters);
    res.json(templates);
  } catch (error) {
    next(error);
  }
});

router.get("/templates/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await storage.getNotificationTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json(template);
  } catch (error) {
    next(error);
  }
});

router.post("/templates", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const template = await storage.createNotificationTemplate({ ...req.body, createdBy: user.id });
    await createAuditLog(user.id, 'notification_template_created', undefined, req, `Created template: ${template.templateName}`);
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
});

router.patch("/templates/:id", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const template = await storage.updateNotificationTemplate(req.params.id, req.body);
    await createAuditLog(user.id, 'notification_template_updated', undefined, req, `Updated template: ${template.templateName}`);
    res.json(template);
  } catch (error) {
    next(error);
  }
});

router.delete("/templates/:id", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    await storage.deleteNotificationTemplate(req.params.id);
    await createAuditLog(user.id, 'notification_template_deleted', undefined, req, `Deleted template`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ==================== AUTOMATED REMINDERS ====================

router.get("/reminders", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      reminderType: req.query.reminderType as string | undefined,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
    };
    const reminders = await storage.getAutomatedReminders(filters);
    res.json(reminders);
  } catch (error) {
    next(error);
  }
});

router.get("/reminders/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reminder = await storage.getAutomatedReminderById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    res.json(reminder);
  } catch (error) {
    next(error);
  }
});

router.post("/reminders", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const reminder = await storage.createAutomatedReminder({ ...req.body, createdBy: user.id });
    await createAuditLog(user.id, 'reminder_created', undefined, req, `Created reminder: ${reminder.reminderName}`);
    res.status(201).json(reminder);
  } catch (error) {
    next(error);
  }
});

router.patch("/reminders/:id", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const reminder = await storage.updateAutomatedReminder(req.params.id, req.body);
    await createAuditLog(user.id, 'reminder_updated', undefined, req, `Updated reminder: ${reminder.reminderName}`);
    res.json(reminder);
  } catch (error) {
    next(error);
  }
});

router.delete("/reminders/:id", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    await storage.deleteAutomatedReminder(req.params.id);
    await createAuditLog(user.id, 'reminder_deleted', undefined, req, `Deleted reminder`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
