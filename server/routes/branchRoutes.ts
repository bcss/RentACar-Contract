/**
 * Branch Routes Module
 * Handles branch management and inter-branch vehicle transfers
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { users } from "@shared/schema";
import { and, eq, or } from "drizzle-orm";
import { isAuthenticated, requireAdmin } from "../auth/localAuth";
import { insertBranchSchema, insertBranchTransferSchema, type User } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { notificationService } from "../services/notificationService";
import { createAuditLog } from "../utils/routeHelpers";
import {
  getCachedBranches,
  setCachedBranches,
  invalidateBranchesCache,
} from "../utils/cache";

const router = Router();

// ==================== BRANCH MANAGEMENT ====================

// GET /api/branches - List all branches
router.get("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    
    // SECURITY: Only users with canManageAllBranches or Admins can list branches
    if (!user.canManageAllBranches && user.role !== 'Admin') {
      // Regular users can only see their own branch
      if (!user.branchId) {
        return res.status(403).json({ message: "No branch assigned to user" });
      }
      const branch = await storage.getBranchById(user.branchId);
      return res.json(branch ? [branch] : []);
    }
    
    const includeDisabled = req.query.includeDisabled === 'true';
    
    // Try cache first (only for active branches)
    let branches;
    if (!includeDisabled) {
      branches = await getCachedBranches();
    }
    
    if (!branches) {
      branches = await storage.getBranches(includeDisabled);
      if (!includeDisabled) {
        await setCachedBranches(branches);
      }
    }
    
    res.json(branches);
  } catch (error) {
    next(error);
  }
});

// GET /api/branches/:id - Get branch by ID
router.get("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const branch = await storage.getBranchById(req.params.id);
    
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }
    
    // SECURITY: Users can only view their own branch unless they have canManageAllBranches
    if (!user.canManageAllBranches && user.role !== 'Admin' && user.branchId !== branch.id) {
      return res.status(403).json({ message: "Insufficient permissions to view this branch" });
    }
    
    res.json(branch);
  } catch (error) {
    next(error);
  }
});

// POST /api/branches - Create new branch
router.post("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    
    if (!user.canManageAllBranches && user.role !== 'Admin') {
      return res.status(403).json({ message: "Insufficient permissions to create branches" });
    }
    
    const validationResult = insertBranchSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = fromZodError(validationResult.error);
      return res.status(400).json({ message: errors.message });
    }
    
    const branch = await storage.createBranch({
      ...validationResult.data,
      createdBy: user.id,
    });
    
    // Invalidate branches cache
    await invalidateBranchesCache();
    
    await createAuditLog(user.id, 'branch_created', branch.id, req, `Created branch: ${branch.branchCode}`);
    res.status(201).json(branch);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/branches/:id - Update branch
router.patch("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    
    if (!user.canManageAllBranches && user.role !== 'Admin') {
      return res.status(403).json({ message: "Insufficient permissions to update branches" });
    }
    
    // INPUT VALIDATION: Use Zod partial schema for updates
    const validationResult = insertBranchSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      const errors = fromZodError(validationResult.error);
      return res.status(400).json({ message: errors.message });
    }
    
    const branch = await storage.updateBranch(req.params.id, validationResult.data);
    
    // Invalidate branches cache
    await invalidateBranchesCache();
    
    await createAuditLog(user.id, 'branch_updated', branch.id, req, `Updated branch: ${branch.branchCode}`);
    res.json(branch);
  } catch (error) {
    next(error);
  }
});

// POST /api/branches/:id/disable - Disable branch
router.post("/:id/disable", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    
    if (!user.canManageAllBranches && user.role !== 'Admin') {
      return res.status(403).json({ message: "Insufficient permissions to disable branches" });
    }
    
    await storage.disableBranch(req.params.id, user.id);
    await createAuditLog(user.id, 'branch_disabled', req.params.id, req, `Disabled branch`);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/branches/:id/enable - Enable branch
router.post("/:id/enable", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    
    if (!user.canManageAllBranches && user.role !== 'Admin') {
      return res.status(403).json({ message: "Insufficient permissions to enable branches" });
    }
    
    await storage.enableBranch(req.params.id);
    await createAuditLog(user.id, 'branch_enabled', req.params.id, req, `Enabled branch`);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// ==================== BRANCH TRANSFERS ====================

// GET /api/branch-transfers - List all transfers
router.get("/transfers", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      status: req.query.status as string | undefined,
      vehicleId: req.query.vehicleId as string | undefined,
      sourceBranchId: req.query.sourceBranchId as string | undefined,
      destinationBranchId: req.query.destinationBranchId as string | undefined,
    };
    const transfers = await storage.getBranchTransfers(filters);
    res.json(transfers);
  } catch (error) {
    next(error);
  }
});

// GET /api/branch-transfers/:id - Get transfer by ID
router.get("/transfers/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transfer = await storage.getBranchTransferById(req.params.id);
    if (!transfer) {
      return res.status(404).json({ message: "Transfer not found" });
    }
    res.json(transfer);
  } catch (error) {
    next(error);
  }
});

// POST /api/branch-transfers - Create new transfer
router.post("/transfers", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    
    const validationResult = insertBranchTransferSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = fromZodError(validationResult.error);
      return res.status(400).json({ message: errors.message });
    }
    
    const transfer = await storage.createBranchTransfer({
      ...validationResult.data,
      requestedBy: user.id,
    });
    
    await createAuditLog(user.id, 'branch_transfer_initiated', transfer.id, req, `Initiated vehicle transfer`);
    res.status(201).json(transfer);
  } catch (error) {
    next(error);
  }
});

// POST /api/branch-transfers/:id/approve - Approve transfer
router.post("/transfers/:id/approve", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    
    if (!user.canManageAllBranches && user.role !== 'Admin') {
      return res.status(403).json({ message: "Insufficient permissions to approve transfers" });
    }
    
    const transfer = await storage.approveBranchTransfer(req.params.id, user.id);
    await createAuditLog(user.id, 'branch_transfer_approved', transfer.id, req, `Approved vehicle transfer`);
    
    // Send transfer approval notification
    try {
      const sourceBranch = await storage.getBranch(transfer.sourceBranchId);
      const destinationBranch = await storage.getBranch(transfer.destinationBranchId);
      const vehicle = await storage.getVehicleById(transfer.vehicleId);
      
      // Notify branch managers only (RBAC: Manager or Admin role required)
      const branchManagers = await db.select().from(users)
        .where(and(
          eq(users.branchId, transfer.sourceBranchId),
          or(eq(users.role, 'manager'), eq(users.role, 'admin'))
        ))
        .limit(1);
      
      if (branchManagers.length > 0 && vehicle) {
        await notificationService.sendNotification({
          templateCode: 'VEHICLE_TRANSFER_APPROVED',
          channel: 'email',
          recipientType: 'user',
          recipientId: branchManagers[0].id,
          variables: {
            vehicleRegistration: vehicle.registration || 'N/A',
            sourceBranch: sourceBranch?.nameEn || 'N/A',
            destinationBranch: destinationBranch?.nameEn || 'N/A',
            transferDate: new Date(transfer.transferDate).toLocaleDateString('en-AE'),
          },
          language: 'en',
          triggerType: 'event_driven',
          triggeredBy: user.id,
          entityType: 'vehicle_transfer',
          entityId: transfer.id,
        });
      }
    } catch (notifError) {
      console.error('[Notification] Failed to send transfer approval notification:', notifError);
    }
    
    res.json(transfer);
  } catch (error) {
    next(error);
  }
});

// POST /api/branch-transfers/:id/reject - Reject transfer
router.post("/transfers/:id/reject", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    
    if (!user.canManageAllBranches && user.role !== 'Admin') {
      return res.status(403).json({ message: "Insufficient permissions to reject transfers" });
    }
    
    const { rejectedReason } = req.body;
    if (!rejectedReason) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }
    
    const transfer = await storage.rejectBranchTransfer(req.params.id, user.id, rejectedReason);
    await createAuditLog(user.id, 'branch_transfer_rejected', transfer.id, req, `Rejected vehicle transfer: ${rejectedReason}`);
    
    // Send transfer rejection notification
    try {
      const sourceBranch = await storage.getBranch(transfer.sourceBranchId);
      const vehicle = await storage.getVehicleById(transfer.vehicleId);
      
      // Notify requester/source branch managers (RBAC: Manager or Admin role required)
      const branchManagers = await db.select().from(users)
        .where(and(
          eq(users.branchId, transfer.sourceBranchId),
          or(eq(users.role, 'manager'), eq(users.role, 'admin'))
        ))
        .limit(1);
      
      if (branchManagers.length > 0 && vehicle) {
        await notificationService.sendNotification({
          templateCode: 'VEHICLE_TRANSFER_REJECTED',
          channel: 'email',
          recipientType: 'user',
          recipientId: branchManagers[0].id,
          variables: {
            vehicleRegistration: vehicle.registration || 'N/A',
            sourceBranch: sourceBranch?.nameEn || 'N/A',
            rejectionReason: rejectedReason,
          },
          language: 'en',
          triggerType: 'event_driven',
          triggeredBy: user.id,
          entityType: 'vehicle_transfer',
          entityId: transfer.id,
        });
      }
    } catch (notifError) {
      console.error('[Notification] Failed to send transfer rejection notification:', notifError);
    }
    
    res.json(transfer);
  } catch (error) {
    next(error);
  }
});

// POST /api/branch-transfers/:id/complete - Complete transfer
router.post("/transfers/:id/complete", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    
    const transfer = await storage.completeBranchTransfer(req.params.id);
    await createAuditLog(user.id, 'branch_transfer_completed', transfer.id, req, `Completed vehicle transfer`);
    res.json(transfer);
  } catch (error) {
    next(error);
  }
});

export default router;
