/**
 * Document Routes Module
 * Document registry, tracking, and expiry management
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated, requireEditor, requireManagerOrAdmin } from "../auth/localAuth";
import type { User } from "@shared/schema";
import { createAuditLog } from "../utils/routeHelpers";
import { triggerNotification } from "../services/notificationTrigger";

const router = Router();

// GET /api/document-registry - List all documents
router.get("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      entityType: req.query.entityType as string | undefined,
      entityId: req.query.entityId as string | undefined,
      documentType: req.query.documentType as string | undefined,
      status: req.query.status as string | undefined,
    };
    const documents = await storage.getDocuments(filters);
    res.json(documents);
  } catch (error) {
    next(error);
  }
});

// GET /api/documents/expiring - Get expiring documents (SPECIFIC PATH FIRST)
router.get("/expiring/soon", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const daysAhead = parseInt(req.query.days as string) || 30;
    const documents = await storage.getExpiringDocuments(daysAhead);
    res.json(documents);
  } catch (error) {
    next(error);
  }
});

// GET /api/documents/expired - Get expired documents (SPECIFIC PATH FIRST)
router.get("/expired/list", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const documents = await storage.getExpiredDocuments();
    res.json(documents);
  } catch (error) {
    next(error);
  }
});

// GET /api/document-registry/:id - Get document by ID (WILDCARD LAST)
router.get("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const document = await storage.getDocumentById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    res.json(document);
  } catch (error) {
    next(error);
  }
});

// POST /api/document-registry - Create new document
router.post("/", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const document = await storage.createDocument({ ...req.body, createdBy: user.id });
    await createAuditLog(user.id, 'document_created', undefined, req, `Created document: ${document.documentType}`);
    
    // Send document uploaded notification (non-blocking)
    if (document.entityType === 'customer' && document.entityId) {
      const customer = await storage.getCustomer(document.entityId);
      if (customer) {
        const settings = await storage.getCompanySettings();
        triggerNotification('document_uploaded', {
          customerName: customer.nameEn || customer.nameAr || 'Customer',
          mobile: customer.phone,
          email: customer.email,
          language: customer.preferredLanguage || 'en',
        }, {
          documentType: document.documentType,
          documentNumber: document.documentNumber || 'N/A',
          companyName: settings.companyNameEn || 'KarāraOS',
        }).catch(err => console.error('[Document] Notification failed:', err));
      }
    }
    
    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/document-registry/:id - Update document
router.patch("/:id", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const document = await storage.updateDocument(req.params.id, req.body);
    await createAuditLog(user.id, 'document_updated', undefined, req, `Updated document: ${document.documentType}`);
    res.json(document);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/document-registry/:id - Delete document
router.delete("/:id", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    await storage.deleteDocument(req.params.id);
    await createAuditLog(user.id, 'document_deleted', undefined, req, `Deleted document`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
