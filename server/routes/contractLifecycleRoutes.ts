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

// ============================================================================
// CONTRACT AMENDMENT ROUTES - Per Master Spec §3.13-3.17
// ============================================================================

// Schema for contract extension
const extendContractSchema = z.object({
  newEndDatetime: z.string().transform(val => new Date(val)),
  reason: z.string().optional(),
  otp: z.string().optional(),
});

// Schema for early return
const earlyReturnSchema = z.object({
  actualReturnDatetime: z.string().transform(val => new Date(val)),
  returnOdometer: z.number().min(0, "Odometer reading required"),
  returnFuel: z.string().min(1, "Fuel level required"),
  reason: z.string().optional(),
});

// Schema for contract amendment
const amendContractSchema = z.object({
  amendmentType: z.enum(['RATE_CHANGE', 'TARIFF_DOWNGRADE', 'DISCOUNT', 'LIABILITY_CHANGE']),
  newTariffId: z.string().optional(),
  newDailyRate: z.number().optional(),
  discountPercent: z.number().optional(),
  discountAmount: z.number().optional(),
  reason: z.string().min(1, "Amendment reason required"),
  otp: z.string().optional(),
});

// Schema for vehicle swap
const swapVehicleSchema = z.object({
  newVehicleId: z.string().min(1, "New vehicle ID required"),
  reason: z.string().min(1, "Swap reason required"),
  returnOdometer: z.number().min(0, "Return odometer required"),
  returnFuel: z.string().min(1, "Return fuel level required"),
});

// Schema for driver change
const changeDriverSchema = z.object({
  newDriverId: z.string().min(1, "New driver ID required"),
  newHirerNameEn: z.string().optional(),
  newHirerNameAr: z.string().optional(),
  newHirerMobile: z.string().optional(),
  newHirerLicenseNumber: z.string().optional(),
  reason: z.string().min(1, "Change reason required"),
  otp: z.string().optional(),
});

/**
 * POST /api/contracts/lifecycle/:id/extend
 * Per Master Spec §3.13 - Extend contract to new end date
 */
router.post("/:id/extend", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const { id } = req.params;
    const parsed = extendContractSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: fromZodError(parsed.error).message
      });
    }

    const result = await contractLifecycleService.extendContract({
      contractId: id,
      newEndDatetime: parsed.data.newEndDatetime,
      reason: parsed.data.reason,
      extendedBy: req.user.id,
      otp: parsed.data.otp,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error("[Contract Lifecycle] Extend error:", error);
    res.status(500).json({ success: false, error: "Failed to extend contract" });
  }
});

/**
 * POST /api/contracts/lifecycle/:id/early-return
 * Per Master Spec §3.14 - Process early vehicle return
 */
router.post("/:id/early-return", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const { id } = req.params;
    const parsed = earlyReturnSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: fromZodError(parsed.error).message
      });
    }

    const result = await contractLifecycleService.processEarlyReturn({
      contractId: id,
      actualReturnDatetime: parsed.data.actualReturnDatetime,
      returnOdometer: parsed.data.returnOdometer,
      returnFuel: parsed.data.returnFuel,
      returnedBy: req.user.id,
      reason: parsed.data.reason,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error("[Contract Lifecycle] Early return error:", error);
    res.status(500).json({ success: false, error: "Failed to process early return" });
  }
});

/**
 * POST /api/contracts/lifecycle/:id/amend
 * Per Master Spec §3.15 - Amend contract (rate/tariff/discount changes)
 */
router.post("/:id/amend", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const { id } = req.params;
    const parsed = amendContractSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: fromZodError(parsed.error).message
      });
    }

    const result = await contractLifecycleService.amendContract({
      contractId: id,
      amendmentType: parsed.data.amendmentType,
      newTariffId: parsed.data.newTariffId,
      newDailyRate: parsed.data.newDailyRate,
      discountPercent: parsed.data.discountPercent,
      discountAmount: parsed.data.discountAmount,
      reason: parsed.data.reason,
      amendedBy: req.user.id,
      otp: parsed.data.otp,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error("[Contract Lifecycle] Amend error:", error);
    res.status(500).json({ success: false, error: "Failed to amend contract" });
  }
});

/**
 * POST /api/contracts/lifecycle/:id/swap-vehicle
 * Per Master Spec §3.16 - Swap vehicle on active contract
 */
router.post("/:id/swap-vehicle", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const { id } = req.params;
    const parsed = swapVehicleSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: fromZodError(parsed.error).message
      });
    }

    const result = await contractLifecycleService.swapVehicle({
      contractId: id,
      newVehicleId: parsed.data.newVehicleId,
      reason: parsed.data.reason,
      returnOdometer: parsed.data.returnOdometer,
      returnFuel: parsed.data.returnFuel,
      swappedBy: req.user.id,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error("[Contract Lifecycle] Swap vehicle error:", error);
    res.status(500).json({ success: false, error: "Failed to swap vehicle" });
  }
});

/**
 * POST /api/contracts/lifecycle/:id/change-driver
 * Per Master Spec §3.17 - Change driver on active contract
 */
router.post("/:id/change-driver", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const { id } = req.params;
    const parsed = changeDriverSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: fromZodError(parsed.error).message
      });
    }

    const result = await contractLifecycleService.changeDriver({
      contractId: id,
      newDriverId: parsed.data.newDriverId,
      newHirerNameEn: parsed.data.newHirerNameEn,
      newHirerNameAr: parsed.data.newHirerNameAr,
      newHirerMobile: parsed.data.newHirerMobile,
      newHirerLicenseNumber: parsed.data.newHirerLicenseNumber,
      reason: parsed.data.reason,
      otp: parsed.data.otp,
      changedBy: req.user.id,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error("[Contract Lifecycle] Change driver error:", error);
    res.status(500).json({ success: false, error: "Failed to change driver" });
  }
});

export default router;
