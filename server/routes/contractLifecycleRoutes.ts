/**
 * Contract Lifecycle Routes - Per Master Spec Part 3 Workflows
 * 
 * Handles all contract state transitions using ContractLifecycleService.
 * All routes enforce Master Spec business rules:
 * - OTP-gated activation/closure
 * - Deposit verification before activation
 * - Inspection requirements
 * - Incident resolution before closure
 */

import { Router } from "express";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { isAuthenticated, requireEditor, requireManagerOrAdmin } from "../auth/localAuth";
import { contractLifecycleService } from "../services/contractLifecycleService";
import { billingService } from "../services/billingService";
import { otpService } from "../services/otpService";
import { createAuditLog } from "../utils/auditLogger";

const router = Router();

// Schema for creating a draft contract
const createDraftSchema = z.object({
  branchId: z.string().min(1, "Branch ID required"),
  customerId: z.string().min(1, "Customer ID required"),
  vehicleId: z.string().min(1, "Vehicle ID required"),
  tariffId: z.string().optional(),
  partyType: z.enum(['DIRECT', 'SPONSORED_INDIVIDUAL', 'SPONSORED_COMPANY']),
  sponsorId: z.string().optional(),
  companyId: z.string().optional(),
  companyContactId: z.string().optional(),
  startDatetime: z.string().transform(val => new Date(val)),
  endDatetime: z.string().transform(val => new Date(val)),
  notes: z.string().optional(),
  depositExpected: z.number().optional(),
});

// Schema for activating a contract
const activateContractSchema = z.object({
  otp: z.string().min(4, "OTP required"),
  overrideDepositCheck: z.boolean().optional(),
});

// Schema for completing a contract
const completeContractSchema = z.object({
  returnOdometer: z.number().optional(),
  returnFuel: z.string().optional(),
});

// Schema for closing a contract - OTP MANDATORY per Master Spec §3.11
const closeContractSchema = z.object({
  otp: z.string().min(4, "Closure OTP is required per Master Spec §3.11"),
  notes: z.string().optional(),
});

// Schema for cancelling a contract
const cancelContractSchema = z.object({
  reason: z.string().min(1, "Cancellation reason required"),
});

/**
 * POST /api/contracts/lifecycle/create-draft
 * Per Master Spec §3.1 - Create a new contract in DRAFT state
 */
router.post("/create-draft", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const parsed = createDraftSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: fromZodError(parsed.error).message
      });
    }

    const result = await contractLifecycleService.createDraftContract({
      ...parsed.data,
      createdBy: req.user.id,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Recalculate charges for the new contract
    await billingService.recalculateChargesForContract(result.contract.id);

    res.status(201).json(result);
  } catch (error: any) {
    console.error("[Contract Lifecycle] Create draft error:", error);
    res.status(500).json({ success: false, error: "Failed to create contract" });
  }
});

/**
 * POST /api/contracts/lifecycle/:id/request-activation-otp
 * Request OTP for contract activation per Master Spec §3.3
 */
router.post("/:id/request-activation-otp", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const { id } = req.params;

    // Request OTP through OTP service
    const result = await otpService.generateOTP(id, 'ACTIVATION', req.user.id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: "Activation OTP sent successfully",
      expiresAt: result.expiresAt,
    });
  } catch (error: any) {
    console.error("[Contract Lifecycle] Request OTP error:", error);
    res.status(500).json({ success: false, error: "Failed to send OTP" });
  }
});

/**
 * POST /api/contracts/lifecycle/:id/activate
 * Per Master Spec §3.3 - Activate contract with OTP verification
 * Preconditions: checkout inspection, deposit satisfied
 */
router.post("/:id/activate", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const { id } = req.params;
    const parsed = activateContractSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: fromZodError(parsed.error).message
      });
    }

    const result = await contractLifecycleService.activateContract({
      contractId: id,
      otp: parsed.data.otp,
      activatedBy: req.user.id,
      activatedByRole: req.user.role, // Pass role for deposit override authorization
      overrideDepositCheck: parsed.data.overrideDepositCheck,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Recalculate charges after activation
    await billingService.recalculateChargesForContract(id);

    res.json(result);
  } catch (error: any) {
    console.error("[Contract Lifecycle] Activate error:", error);
    res.status(500).json({ success: false, error: "Failed to activate contract" });
  }
});

/**
 * POST /api/contracts/lifecycle/:id/complete
 * Per Master Spec §3.5 - Mark contract as completed (vehicle returned)
 * Requires return inspection
 */
router.post("/:id/complete", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const { id } = req.params;
    const parsed = completeContractSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: fromZodError(parsed.error).message
      });
    }

    const result = await contractLifecycleService.completeContract({
      contractId: id,
      completedBy: req.user.id,
      returnOdometer: parsed.data.returnOdometer,
      returnFuel: parsed.data.returnFuel,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Recalculate charges after completion
    await billingService.recalculateChargesForContract(id);

    res.json(result);
  } catch (error: any) {
    console.error("[Contract Lifecycle] Complete error:", error);
    res.status(500).json({ success: false, error: "Failed to complete contract" });
  }
});

/**
 * POST /api/contracts/lifecycle/:id/request-closure-otp
 * Request OTP for contract closure per Master Spec §3.11
 */
router.post("/:id/request-closure-otp", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const { id } = req.params;

    const result = await otpService.generateOTP(id, 'CLOSURE', req.user.id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: "Closure OTP sent successfully",
      expiresAt: result.expiresAt,
    });
  } catch (error: any) {
    console.error("[Contract Lifecycle] Request closure OTP error:", error);
    res.status(500).json({ success: false, error: "Failed to send OTP" });
  }
});

/**
 * POST /api/contracts/lifecycle/:id/close
 * Per Master Spec §3.11 - Close contract
 * Preconditions: no pending incidents, balance = 0, deposits adjusted
 */
router.post("/:id/close", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const { id } = req.params;
    const parsed = closeContractSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: fromZodError(parsed.error).message
      });
    }

    const result = await contractLifecycleService.closeContract({
      contractId: id,
      otp: parsed.data.otp,
      closedBy: req.user.id,
      notes: parsed.data.notes,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error("[Contract Lifecycle] Close error:", error);
    res.status(500).json({ success: false, error: "Failed to close contract" });
  }
});

/**
 * POST /api/contracts/lifecycle/:id/cancel
 * Per Master Spec §3.12 - Cancel contract
 * Only allowed for DRAFT or ACTIVE (pre-handover)
 */
router.post("/:id/cancel", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const { id } = req.params;
    const parsed = cancelContractSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: fromZodError(parsed.error).message
      });
    }

    const result = await contractLifecycleService.cancelContract({
      contractId: id,
      reason: parsed.data.reason,
      cancelledBy: req.user.id,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error("[Contract Lifecycle] Cancel error:", error);
    res.status(500).json({ success: false, error: "Failed to cancel contract" });
  }
});

/**
 * GET /api/contracts/lifecycle/:id/settlement
 * Get settlement summary for a contract per Master Spec §7.5.2
 */
router.get("/:id/settlement", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    const settlement = await billingService.calculateSettlement(id);

    if (!settlement) {
      return res.status(404).json({ success: false, error: "Contract not found" });
    }

    res.json({ success: true, settlement });
  } catch (error: any) {
    console.error("[Contract Lifecycle] Settlement error:", error);
    res.status(500).json({ success: false, error: "Failed to calculate settlement" });
  }
});

/**
 * POST /api/contracts/lifecycle/:id/recalculate-charges
 * Recalculate all charges for a contract
 */
router.post("/:id/recalculate-charges", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    const result = await billingService.recalculateChargesForContract(id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Create audit log
    await createAuditLog(
      'contracts',
      id,
      'CHARGES_RECALCULATED',
      req.user.id,
      { totalCharges: result.totalCharges, outstandingAmount: result.outstandingAmount }
    );

    res.json(result);
  } catch (error: any) {
    console.error("[Contract Lifecycle] Recalculate charges error:", error);
    res.status(500).json({ success: false, error: "Failed to recalculate charges" });
  }
});

/**
 * GET /api/contracts/lifecycle/:id/validate-transition/:targetStatus
 * Validate if a status transition is allowed
 */
router.get("/:id/validate-transition/:targetStatus", isAuthenticated, async (req: any, res) => {
  try {
    const { id, targetStatus } = req.params;
    
    // Get current contract
    const { storage } = await import("../storage");
    const contract = await storage.getContract(id);

    if (!contract) {
      return res.status(404).json({ success: false, error: "Contract not found" });
    }

    const isValid = contractLifecycleService.validateStatusTransition(
      contract.status,
      targetStatus
    );

    res.json({
      success: true,
      currentStatus: contract.status,
      targetStatus,
      isValidTransition: isValid,
    });
  } catch (error: any) {
    console.error("[Contract Lifecycle] Validate transition error:", error);
    res.status(500).json({ success: false, error: "Failed to validate transition" });
  }
});

export default router;
