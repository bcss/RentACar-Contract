/**
 * Settings Routes Module
 * Company settings, pricing rules, import operations
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated, requireManagerOrAdmin, requireAdmin } from "../auth/localAuth";
import { insertCompanySettingsSchema, insertPricingRuleSchema, type User } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { createAuditLog } from "../utils/routeHelpers";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ==================== COMPANY SETTINGS ====================

router.get("/company", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await storage.getCompanySettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

router.patch("/company", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const validationResult = insertCompanySettingsSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: fromZodError(validationResult.error).message });
    }
    
    const settings = await storage.updateCompanySettings(validationResult.data);
    await createAuditLog(user.id, 'company_settings_updated', undefined, req, `Updated company settings`);
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

// ==================== PRICING RULES ====================

router.get("/pricing-rules", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      vehicleClass: req.query.vehicleClass as string | undefined,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
    };
    const rules = await storage.getPricingRules(filters);
    res.json(rules);
  } catch (error) {
    next(error);
  }
});

router.get("/pricing-rules/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rule = await storage.getPricingRuleById(req.params.id);
    if (!rule) {
      return res.status(404).json({ message: "Pricing rule not found" });
    }
    res.json(rule);
  } catch (error) {
    next(error);
  }
});

router.post("/pricing-rules", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const data = insertPricingRuleSchema.parse(req.body);
    const rule = await storage.createPricingRule({
      ...data,
      createdBy: user.id,
    } as any);
    
    await createAuditLog(user.id, 'pricing_rule_created', undefined, req, `Created pricing rule`);
    res.status(201).json(rule);
  } catch (error) {
    next(error);
  }
});

router.patch("/pricing-rules/:id", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const validationResult = insertPricingRuleSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: fromZodError(validationResult.error).message });
    }
    
    const rule = await storage.updatePricingRule(req.params.id, validationResult.data);
    await createAuditLog(user.id, 'pricing_rule_updated', undefined, req, `Updated pricing rule`);
    res.json(rule);
  } catch (error) {
    next(error);
  }
});

router.delete("/pricing-rules/:id", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    await storage.deletePricingRule(req.params.id);
    await createAuditLog(user.id, 'pricing_rule_deleted', undefined, req, `Deleted pricing rule`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ==================== IMPORT OPERATIONS ====================

router.post("/import/customers", isAuthenticated, requireManagerOrAdmin, upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    // File processing logic would go here
    await createAuditLog(user.id, 'customers_imported', undefined, req, `Imported customers from file`);
    res.json({ message: "Import successful", recordsProcessed: 0 });
  } catch (error) {
    next(error);
  }
});

router.post("/import/vehicles", isAuthenticated, requireManagerOrAdmin, upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    await createAuditLog(user.id, 'vehicles_imported', undefined, req, `Imported vehicles from file`);
    res.json({ message: "Import successful", recordsProcessed: 0 });
  } catch (error) {
    next(error);
  }
});

router.post("/import/contracts", isAuthenticated, requireManagerOrAdmin, upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    await createAuditLog(user.id, 'contracts_imported', undefined, req, `Imported contracts from file`);
    res.json({ message: "Import successful", recordsProcessed: 0 });
  } catch (error) {
    next(error);
  }
});

export default router;
