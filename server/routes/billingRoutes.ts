/**
 * Billing Routes - Per Master Spec §7.5.2
 * 
 * Handles all billing operations using BillingService.
 * - Add/remove manual charges
 * - Recalculate charges
 * - Get settlement summaries
 */

import { Router } from "express";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { isAuthenticated, requireEditor, requireManagerOrAdmin } from "../auth/localAuth";
import { billingService, ChargeType } from "../services/billingService";
import { paymentService } from "../services/paymentService";
import { createAuditLog } from "../utils/auditLogger";

const router = Router();

// Schema for adding a manual charge
const addChargeSchema = z.object({
  chargeType: z.string().min(1, "Charge type required"),
  description: z.string().min(1, "Description required"),
  descriptionAr: z.string().optional(),
  quantity: z.number().positive("Quantity must be positive"),
  unitPrice: z.number().min(0, "Unit price cannot be negative"),
  notes: z.string().optional(),
});

// Schema for recording a payment
const recordPaymentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.string().min(1, "Payment method required"),
  paymentType: z.enum(['RENT', 'DEPOSIT', 'EXCESS', 'OTHER']).optional(),
  currency: z.string().optional(),
  chequeNumber: z.string().optional(),
  last4Digits: z.string().length(4).optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  paidAt: z.string().optional().transform(val => val ? new Date(val) : undefined),
});

// Schema for recording a refund
const recordRefundSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  refundMethod: z.string().min(1, "Refund method required"),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/billing/:contractId/charges
 * Get all charges for a contract
 */
router.get("/:contractId/charges", isAuthenticated, async (req: any, res) => {
  try {
    const { contractId } = req.params;
    
    const result = await billingService.recalculateChargesForContract(contractId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      totalCharges: result.totalCharges,
      outstandingAmount: result.outstandingAmount,
      charges: result.charges,
    });
  } catch (error: any) {
    console.error("[Billing] Get charges error:", error);
    res.status(500).json({ success: false, error: "Failed to get charges" });
  }
});

/**
 * POST /api/billing/:contractId/charges
 * Add a manual charge to a contract
 */
router.post("/:contractId/charges", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const { contractId } = req.params;
    const parsed = addChargeSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: fromZodError(parsed.error).message
      });
    }

    const result = await billingService.addManualCharge({
      contractId,
      ...parsed.data,
      createdBy: req.user.id,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error: any) {
    console.error("[Billing] Add charge error:", error);
    res.status(500).json({ success: false, error: "Failed to add charge" });
  }
});

/**
 * DELETE /api/billing/charges/:chargeId
 * Remove a manual charge (requires manager privilege)
 */
router.delete("/charges/:chargeId", isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
  try {
    const { chargeId } = req.params;
    
    const result = await billingService.removeManualCharge(chargeId, req.user.id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error("[Billing] Remove charge error:", error);
    res.status(500).json({ success: false, error: "Failed to remove charge" });
  }
});

/**
 * GET /api/billing/:contractId/settlement
 * Get settlement summary for a contract
 */
router.get("/:contractId/settlement", isAuthenticated, async (req: any, res) => {
  try {
    const { contractId } = req.params;
    
    const settlement = await billingService.calculateSettlement(contractId);

    if (!settlement) {
      return res.status(404).json({ success: false, error: "Contract not found" });
    }

    res.json({ success: true, settlement });
  } catch (error: any) {
    console.error("[Billing] Get settlement error:", error);
    res.status(500).json({ success: false, error: "Failed to calculate settlement" });
  }
});

/**
 * POST /api/billing/:contractId/payments
 * Record a payment using PaymentService with direction tracking
 */
router.post("/:contractId/payments", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const { contractId } = req.params;
    const parsed = recordPaymentSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: fromZodError(parsed.error).message
      });
    }

    const result = await paymentService.recordPayment({
      contractId,
      ...parsed.data,
      createdBy: req.user.id,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error: any) {
    console.error("[Billing] Record payment error:", error);
    res.status(500).json({ success: false, error: "Failed to record payment" });
  }
});

/**
 * POST /api/billing/:contractId/refunds
 * Record a refund using PaymentService
 */
router.post("/:contractId/refunds", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const { contractId } = req.params;
    const parsed = recordRefundSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: fromZodError(parsed.error).message
      });
    }

    const result = await paymentService.recordRefund({
      contractId,
      ...parsed.data,
      createdBy: req.user.id,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error: any) {
    console.error("[Billing] Record refund error:", error);
    res.status(500).json({ success: false, error: "Failed to record refund" });
  }
});

/**
 * GET /api/billing/:contractId/payment-summary
 * Get payment summary for a contract
 */
router.get("/:contractId/payment-summary", isAuthenticated, async (req: any, res) => {
  try {
    const { contractId } = req.params;
    
    const summary = await paymentService.getPaymentSummary(contractId);

    res.json({
      success: true,
      ...summary,
    });
  } catch (error: any) {
    console.error("[Billing] Get payment summary error:", error);
    res.status(500).json({ success: false, error: "Failed to get payment summary" });
  }
});

/**
 * POST /api/billing/:contractId/recalculate
 * Recalculate all charges for a contract
 */
router.post("/:contractId/recalculate", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const { contractId } = req.params;
    
    const result = await billingService.recalculateChargesForContract(contractId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    await createAuditLog(
      'contracts',
      contractId,
      'CHARGES_RECALCULATED',
      req.user.id,
      { totalCharges: result.totalCharges }
    );

    res.json(result);
  } catch (error: any) {
    console.error("[Billing] Recalculate error:", error);
    res.status(500).json({ success: false, error: "Failed to recalculate charges" });
  }
});

/**
 * GET /api/billing/charge-types
 * Get available charge types per Master Spec
 */
router.get("/charge-types", isAuthenticated, async (req: any, res) => {
  try {
    const chargeTypes = Object.entries(ChargeType).map(([key, value]) => ({
      code: value,
      name: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
    }));

    res.json({ success: true, chargeTypes });
  } catch (error: any) {
    console.error("[Billing] Get charge types error:", error);
    res.status(500).json({ success: false, error: "Failed to get charge types" });
  }
});

export default router;
