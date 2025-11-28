/**
 * File: server/routes/notificationRoutes.ts
 * @area Notifications Engine
 * @checklist §2.13, Part 8, §3.28, §3.32-3.34
 * @purpose Notification templates, reminders, and communications per Master Spec Part 8
 * 
 * @behaviour
 *  - 30 pre-seeded bilingual templates (EN/AR)
 *  - Multi-channel: SMS (Twilio), Email (SendGrid), WhatsApp (future)
 *  - Provider fallback: SMS → Secondary SMS → Email
 *  - Mandatory confirmations: OTP, payment, activation, completion (§3.28)
 * 
 * @routes
 *  - GET /api/notifications/templates - List templates with filters
 *  - POST /api/notifications/templates - Create template (manager+)
 *  - PATCH /api/notifications/templates/:id - Update template
 *  - DELETE /api/notifications/templates/:id - Disable template
 *  - GET /api/notifications/reminders - List automated reminders
 *  - POST /api/notifications/reminders - Create reminder rule
 *  - POST /api/notifications/send - Manual notification send
 * 
 * @notes
 *  - Templates support variable binding: {{customerName}}, {{contractNumber}}
 *  - Campaign messages via campaignRoutes (§2.13)
 * 
 * See: docs/MASTER_SPEC_IMPLEMENTATION_CHECKLIST.md (§2.13, Part 8)
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated, requireEditor, requireManagerOrAdmin } from "../auth/localAuth";
import type { User } from "@shared/schema";
import { createAuditLog } from "../utils/routeHelpers";
import { z } from "zod";
import { sendEmail, sendSms } from "../services/providerSelector";

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
    await createAuditLog(user.id as string, 'notification_template_created', undefined, req, `Created template: ${template.name}`);
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
});

router.patch("/templates/:id", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const template = await storage.updateNotificationTemplate(req.params.id, req.body);
    await createAuditLog(user.id as string, 'notification_template_updated', undefined, req, `Updated template: ${template.name}`);
    res.json(template);
  } catch (error) {
    next(error);
  }
});

router.delete("/templates/:id", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    await storage.deleteNotificationTemplate(req.params.id);
    await createAuditLog(user.id as string, 'notification_template_deleted', undefined, req, `Deleted template`);
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
    await createAuditLog(user.id as string, 'reminder_created', undefined, req, `Created reminder: ${reminder.reminderType}`);
    res.status(201).json(reminder);
  } catch (error) {
    next(error);
  }
});

router.patch("/reminders/:id", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const reminder = await storage.updateAutomatedReminder(req.params.id, req.body);
    await createAuditLog(user.id as string, 'reminder_updated', undefined, req, `Updated reminder: ${reminder.reminderType}`);
    res.json(reminder);
  } catch (error) {
    next(error);
  }
});

router.delete("/reminders/:id", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    await storage.deleteAutomatedReminder(req.params.id);
    await createAuditLog(user.id as string, 'reminder_deleted', undefined, req, `Deleted reminder`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ==================== MANUAL NOTIFICATION SENDER ====================

// Validation schema for manual send
const manualSendSchema = z.object({
  channel: z.enum(['sms', 'email']),
  recipient: z.string().min(1, "Recipient is required"),
  subject: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  templateId: z.string().optional().nullable(),
});

router.post("/send", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    
    // Validate request body
    const validationResult = manualSendSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        errors: validationResult.error.errors 
      });
    }
    
    const { channel, recipient, subject, message, templateId } = validationResult.data;
    
    // Create communication log for manual send
    const log = await storage.createCommunicationLog({
      channel,
      recipient,
      subject: subject || '',
      message: message || '',
      status: 'pending',
      templateId: templateId || null,
      triggeredBy: user.id as string,
      recipientType: 'manual',
      recipientId: 'manual-' + Date.now(),
      triggerType: 'manual',
    });
    
    // Actually send via provider
    let sendResult;
    if (channel === 'email') {
      sendResult = await sendEmail({
        to: recipient,
        subject: subject || 'Notification',
        body: message,
        html: false,
      });
    } else {
      sendResult = await sendSms({
        to: recipient,
        message,
      });
    }
    
    // Update log based on send result
    if (sendResult.success) {
      await storage.updateCommunicationLogStatus(log.id, 'sent', {
        externalId: sendResult.externalId,
        providerId: sendResult.providerId,
        providerName: sendResult.providerName,
      });
      await createAuditLog(user.id as string, 'manual_notification_sent', undefined, req, `Sent ${channel} to ${recipient}`);
      
      res.status(201).json({ 
        success: true,
        message: "Notification sent successfully",
        logId: log.id,
        externalId: sendResult.externalId 
      });
    } else {
      await storage.updateCommunicationLogStatus(log.id, 'failed', {
        error: sendResult.error,
      });
      
      res.status(500).json({ 
        success: false,
        message: "Failed to send notification",
        error: sendResult.error,
        logId: log.id 
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
