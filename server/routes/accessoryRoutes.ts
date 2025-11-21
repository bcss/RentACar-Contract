/**
 * Accessory Routes Module
 * Vehicle accessories and upsell items
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated, requireEditor, requireManagerOrAdmin } from "../auth/localAuth";
import type { User } from "@shared/schema";
import { createAuditLog } from "../utils/routeHelpers";

const router = Router();

// ==================== ACCESSORIES MASTER ====================

router.get("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      category: req.query.category as string | undefined,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
    };
    const accessories = await storage.getAccessories(filters);
    res.json(accessories);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessory = await storage.getAccessoryById(req.params.id);
    if (!accessory) {
      return res.status(404).json({ message: "Accessory not found" });
    }
    res.json(accessory);
  } catch (error) {
    next(error);
  }
});

router.post("/", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const accessory = await storage.createAccessory({ ...req.body, createdBy: user.id });
    await createAuditLog(user.id, 'accessory_created', undefined, req, `Created accessory: ${accessory.itemName}`);
    res.status(201).json(accessory);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const accessory = await storage.updateAccessory(req.params.id, req.body);
    await createAuditLog(user.id, 'accessory_updated', undefined, req, `Updated accessory: ${accessory.itemName}`);
    res.json(accessory);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    await storage.deleteAccessory(req.params.id);
    await createAuditLog(user.id, 'accessory_deleted', undefined, req, `Deleted accessory`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ==================== CONTRACT ACCESSORIES ====================

router.get("/contract/:contractId", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessories = await storage.getContractAccessories(req.params.contractId);
    res.json(accessories);
  } catch (error) {
    next(error);
  }
});

router.post("/contract/:contractId", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const contractAccessory = await storage.createContractAccessory({
      ...req.body,
      contractId: req.params.contractId,
      createdBy: user.id,
    });
    await createAuditLog(user.id, 'contract_accessory_added', req.params.contractId, req, `Added accessory to contract`);
    res.status(201).json(contractAccessory);
  } catch (error) {
    next(error);
  }
});

router.patch("/contract-accessory/:id", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const contractAccessory = await storage.updateContractAccessory(req.params.id, req.body);
    await createAuditLog(user.id, 'contract_accessory_updated', contractAccessory.contractId, req, `Updated contract accessory`);
    res.json(contractAccessory);
  } catch (error) {
    next(error);
  }
});

router.delete("/contract-accessory/:id", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const contractAccessory = await storage.getContractAccessoryById(req.params.id);
    if (contractAccessory) {
      await storage.deleteContractAccessory(req.params.id);
      await createAuditLog(user.id, 'contract_accessory_deleted', contractAccessory.contractId, req, `Removed accessory from contract`);
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
