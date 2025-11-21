/**
 * Mobile Routes Module
 * Mobile app endpoints for customer-facing features
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth/localAuth";
import type { User } from "@shared/schema";

const router = Router();

// GET /api/mobile/contracts - Get customer contracts (mobile)
router.get("/contracts", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const contracts = await storage.getCustomerContracts(user.id);
    res.json(contracts);
  } catch (error) {
    next(error);
  }
});

// GET /api/mobile/contracts/:id - Get contract details (mobile)
router.get("/contracts/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const contract = await storage.getContractById(req.params.id);
    
    if (!contract || contract.customerId !== user.id) {
      return res.status(404).json({ message: "Contract not found" });
    }
    
    res.json(contract);
  } catch (error) {
    next(error);
  }
});

// GET /api/mobile/payments/:contractId - Get contract payments (mobile)
router.get("/payments/:contractId", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const contract = await storage.getContractById(req.params.contractId);
    
    if (!contract || contract.customerId !== user.id) {
      return res.status(404).json({ message: "Contract not found" });
    }
    
    const payments = await storage.getPaymentsByContract(req.params.contractId);
    res.json(payments);
  } catch (error) {
    next(error);
  }
});

// GET /api/mobile/profile - Get customer profile (mobile)
router.get("/profile", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const customer = await storage.getCustomerById(user.id);
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    res.json(customer);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/mobile/profile - Update customer profile (mobile)
router.patch("/profile", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const allowedFields = ['phoneNumber', 'email', 'addressLine1', 'addressLine2', 'city', 'emirate', 'poBox'];
    
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );
    
    const customer = await storage.updateCustomer(user.id, updates);
    res.json(customer);
  } catch (error) {
    next(error);
  }
});

// GET /api/mobile/notifications - Get customer notifications (mobile)
router.get("/notifications", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const notifications = await storage.getCustomerNotifications(user.id);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

// GET /api/mobile/documents/:contractId - Get contract documents (mobile)
router.get("/documents/:contractId", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const contract = await storage.getContractById(req.params.contractId);
    
    if (!contract || contract.customerId !== user.id) {
      return res.status(404).json({ message: "Contract not found" });
    }
    
    const documents = await storage.getContractDocuments(req.params.contractId);
    res.json(documents);
  } catch (error) {
    next(error);
  }
});

// GET /api/mobile/vehicles/:contractId - Get contract vehicle (mobile)
router.get("/vehicles/:contractId", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const contract = await storage.getContractById(req.params.contractId);
    
    if (!contract || contract.customerId !== user.id) {
      return res.status(404).json({ message: "Contract not found" });
    }
    
    const vehicle = await storage.getVehicleById(contract.vehicleId);
    res.json(vehicle);
  } catch (error) {
    next(error);
  }
});

export default router;
