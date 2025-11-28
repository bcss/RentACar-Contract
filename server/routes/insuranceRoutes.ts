/**
 * File: server/routes/insuranceRoutes.ts
 * @area Insurance Claims & Excess
 * @checklist §2.4, §2.5, §3.8, Appendix C.1
 * @purpose Insurance claim CRUD and progress tracking per Master Spec §2.5
 * 
 * @behaviour
 *  - Claim creation linked to contract/vehicle/incident
 *  - Progress updates tracked in claim_progress_updates table
 *  - Status workflow: pending → under_review → approved/rejected → settled
 *  - Appendix C.1 fields: insurerPaidAmount, finalCustomerLiability
 * 
 * @routes
 *  - GET /api/insurance-claims - List claims with filters
 *  - GET /api/insurance-claims/:id - Single claim with progress history
 *  - POST /api/insurance-claims - Create claim (§3.8)
 *  - PATCH /api/insurance-claims/:id - Update claim
 *  - DELETE /api/insurance-claims/:id - Disable claim (manager only)
 *  - POST /api/insurance-claims/:id/progress - Add progress update
 * 
 * @notes
 *  - Excess amount loaded from insurance/tariff configuration
 *  - Contract cannot close until all claims resolved (§3.8)
 * 
 * See: docs/MASTER_SPEC_IMPLEMENTATION_CHECKLIST.md (§2.4, §2.5, §3.8, C.1)
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated, requireEditor, requireManagerOrAdmin } from "../auth/localAuth";
import { insertInsuranceClaimSchema, insertClaimProgressUpdateSchema, type User } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { createAuditLog } from "../utils/routeHelpers";

const router = Router();

// GET /api/insurance-claims - List all claims
router.get("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      contractId: req.query.contractId as string | undefined,
      vehicleId: req.query.vehicleId as string | undefined,
      status: req.query.status as string | undefined,
    };
    const claims = await storage.getInsuranceClaims(filters);
    res.json(claims);
  } catch (error) {
    next(error);
  }
});

// GET /api/insurance-claims/:id - Get claim by ID
router.get("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = await storage.getInsuranceClaimById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: "Insurance claim not found" });
    }
    res.json(claim);
  } catch (error) {
    next(error);
  }
});

// POST /api/insurance-claims - Create new claim
router.post("/", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User & { id: string };
    const data = insertInsuranceClaimSchema.parse(req.body);
    const claim = await storage.createInsuranceClaim({
      ...data,
      createdBy: user.id,
    } as any);
    
    await createAuditLog(user.id, 'insurance_claim_created', claim.contractId as string, req, `Created insurance claim: ${claim.claimNumber}`);
    res.status(201).json(claim);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/insurance-claims/:id - Update claim
router.patch("/:id", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User & { id: string };
    const validationResult = insertInsuranceClaimSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: fromZodError(validationResult.error).message });
    }
    
    const claim = await storage.updateInsuranceClaim(req.params.id, validationResult.data);
    await createAuditLog(user.id, 'insurance_claim_updated', claim.contractId as string, req, `Updated insurance claim: ${claim.claimNumber}`);
    res.json(claim);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/insurance-claims/:id - Delete claim
router.delete("/:id", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User & { id: string };
    const claim = await storage.getInsuranceClaimById(req.params.id);
    if (claim) {
      await storage.deleteInsuranceClaim(req.params.id, user.id);
      await createAuditLog(user.id, 'insurance_claim_deleted', claim.contractId as string, req, `Deleted insurance claim`);
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// GET /api/claims/:claimId/progress - Get claim progress updates
router.get("/claims/:claimId/progress", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updates = await storage.getClaimProgressUpdates(req.params.claimId);
    res.json(updates);
  } catch (error) {
    next(error);
  }
});

// POST /api/claims/:claimId/progress - Add claim progress update
router.post("/claims/:claimId/progress", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User & { id: string };
    const data = insertClaimProgressUpdateSchema.parse({
      ...req.body,
      claimId: req.params.claimId,
    });
    const update = await storage.createClaimProgressUpdate({
      ...data,
      createdBy: user.id,
    } as any);
    
    await createAuditLog(user.id, 'claim_progress_updated', req.params.claimId, req, `Added progress update to claim`);
    res.status(201).json(update);
  } catch (error) {
    next(error);
  }
});

export default router;
