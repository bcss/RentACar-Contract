/**
 * Reservation Routes - Per Master Spec §3.24-3.25
 * 
 * Handles reservation management:
 * - Create vehicle/group reservations
 * - Confirm, cancel, expire reservations
 * - Convert reservation to contract
 */

import { Router } from "express";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { isAuthenticated, requireEditor, requireManagerOrAdmin } from "../auth/localAuth";
import { reservationService, ReservationStatus } from "../services/reservationService";
import { createAuditLog } from "../utils/auditLogger";

const router = Router();

// Schema for creating a reservation
const createReservationSchema = z.object({
  branchId: z.string().min(1, "Branch ID required"),
  hirerId: z.string().min(1, "Customer/Hirer ID required"),
  vehicleId: z.string().optional(),
  vehicleGroupId: z.string().optional(),
  tariffId: z.string().optional(),
  startDatetime: z.string().transform(val => new Date(val)),
  endDatetime: z.string().transform(val => new Date(val)),
  depositExpected: z.number().optional(),
  notes: z.string().optional(),
}).refine(data => data.vehicleId || data.vehicleGroupId, {
  message: "Either vehicleId or vehicleGroupId is required"
});

// Schema for confirming a reservation
const confirmReservationSchema = z.object({
  depositReceived: z.number().min(0, "Deposit amount required"),
});

// Schema for cancelling a reservation
const cancelReservationSchema = z.object({
  reason: z.string().min(1, "Cancellation reason required"),
});

// Schema for converting to contract
const convertToContractSchema = z.object({
  vehicleId: z.string().optional(), // Override vehicle if group reservation
});

/**
 * POST /api/reservations
 * Per Master Spec §3.24 - Create a new reservation
 */
router.post("/", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const parsed = createReservationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: fromZodError(parsed.error).message
      });
    }

    const result = await reservationService.createReservation({
      ...parsed.data,
      createdBy: req.user.id,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error: any) {
    console.error("[Reservations] Create error:", error);
    res.status(500).json({ success: false, error: "Failed to create reservation" });
  }
});

/**
 * GET /api/reservations
 * List reservations with optional filters
 */
router.get("/", isAuthenticated, async (req: any, res) => {
  try {
    const { branchId, startDate, endDate, status } = req.query;

    const reservations = await reservationService.getReservations(
      branchId as string | undefined,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
      status as string | undefined
    );

    res.json({ success: true, reservations });
  } catch (error: any) {
    console.error("[Reservations] List error:", error);
    res.status(500).json({ success: false, error: "Failed to list reservations" });
  }
});

/**
 * GET /api/reservations/:id
 * Get a specific reservation
 */
router.get("/:id", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    const { db } = await import("../db");
    const { reservations } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    const reservation = await db.query.reservations.findFirst({
      where: eq(reservations.id, id),
      with: {
        branch: true,
        hirer: true,
        vehicle: true,
        tariff: true,
      }
    });

    if (!reservation) {
      return res.status(404).json({ success: false, error: "Reservation not found" });
    }

    res.json({ success: true, reservation });
  } catch (error: any) {
    console.error("[Reservations] Get error:", error);
    res.status(500).json({ success: false, error: "Failed to get reservation" });
  }
});

/**
 * POST /api/reservations/:id/confirm
 * Per Master Spec §3.24 - Confirm a pending reservation
 */
router.post("/:id/confirm", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const { id } = req.params;
    const parsed = confirmReservationSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: fromZodError(parsed.error).message
      });
    }

    const result = await reservationService.confirmReservation(
      id,
      parsed.data.depositReceived,
      req.user.id
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error("[Reservations] Confirm error:", error);
    res.status(500).json({ success: false, error: "Failed to confirm reservation" });
  }
});

/**
 * POST /api/reservations/:id/cancel
 * Cancel a reservation
 */
router.post("/:id/cancel", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const { id } = req.params;
    const parsed = cancelReservationSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: fromZodError(parsed.error).message
      });
    }

    const result = await reservationService.cancelReservation(
      id,
      parsed.data.reason,
      req.user.id
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error("[Reservations] Cancel error:", error);
    res.status(500).json({ success: false, error: "Failed to cancel reservation" });
  }
});

/**
 * POST /api/reservations/:id/convert
 * Per Master Spec §3.25 - Convert reservation to contract
 */
router.post("/:id/convert", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const { id } = req.params;
    const parsed = convertToContractSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: fromZodError(parsed.error).message
      });
    }

    const result = await reservationService.convertToContract({
      reservationId: id,
      vehicleId: parsed.data.vehicleId,
      convertedBy: req.user.id,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error("[Reservations] Convert error:", error);
    res.status(500).json({ success: false, error: "Failed to convert reservation" });
  }
});

/**
 * POST /api/reservations/:id/no-show
 * Mark a reservation as no-show
 */
router.post("/:id/no-show", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const { id } = req.params;

    const result = await reservationService.markNoShow(id, req.user.id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error("[Reservations] No-show error:", error);
    res.status(500).json({ success: false, error: "Failed to mark no-show" });
  }
});

/**
 * POST /api/reservations/expire-unclaimed
 * Admin endpoint to manually expire unclaimed reservations
 */
router.post("/expire-unclaimed", isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
  try {
    const { expiryHours } = req.body;

    const result = await reservationService.expireUnclaimed(expiryHours || 24);

    await createAuditLog(
      'reservations',
      'SYSTEM',
      'RESERVATIONS_EXPIRED',
      req.user.id,
      { expiredCount: result.expiredCount }
    );

    res.json(result);
  } catch (error: any) {
    console.error("[Reservations] Expire unclaimed error:", error);
    res.status(500).json({ success: false, error: "Failed to expire reservations" });
  }
});

export default router;
