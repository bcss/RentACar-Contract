/**
 * Document Routes Module
 * Document registry, tracking, and expiry management
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated, requireEditor, requireManagerOrAdmin } from "../auth/localAuth";
import type { User } from "@shared/schema";
import { createAuditLog } from "../utils/routeHelpers";

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
    const documents = await storage.getDocumentRegistry(filters);
    res.json(documents);
  } catch (error) {
    next(error);
  }
});

// GET /api/document-registry/:id - Get document by ID
router.get("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const document = await storage.getDocumentRegistryById(req.params.id);
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
    const document = await storage.createDocumentRegistry({ ...req.body, createdBy: user.id });
    await createAuditLog(user.id, 'document_created', undefined, req, `Created document: ${document.documentType}`);
    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/document-registry/:id - Update document
router.patch("/:id", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const document = await storage.updateDocumentRegistry(req.params.id, req.body);
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
    await storage.deleteDocumentRegistry(req.params.id);
    await createAuditLog(user.id, 'document_deleted', undefined, req, `Deleted document`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// GET /api/documents/expiring - Get expiring documents
router.get("/expiring/soon", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const daysAhead = parseInt(req.query.days as string) || 30;
    const documents = await storage.getExpiringDocuments(daysAhead);
    res.json(documents);
  } catch (error) {
    next(error);
  }
});

// GET /api/documents/expired - Get expired documents
router.get("/expired/list", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const documents = await storage.getExpiredDocuments();
    res.json(documents);
  } catch (error) {
    next(error);
  }
});

export default router;
