/**
 * Vehicle Management Routes
 * 
 * Handles all vehicle-related operations including:
 * - Vehicle CRUD operations
 * - Search and filtering
 * - Availability checking
 * - Enable/disable operations
 */

import { Router } from "express";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "../storage";
import { insertVehicleSchema, type Vehicle } from "../../shared/schema";
import { isAuthenticated, requireEditor, requireAdmin } from "../auth/localAuth";
import { createAuditLog } from "../utils/auditLogger";
import { validateSearchQuery } from "../utils/validation";

const router = Router();

/**
 * GET /api/vehicles
 * List all vehicles with optional disabled filter
 */
router.get("/", isAuthenticated, async (req: any, res) => {
  try {
    const disabledParam = req.query.disabled;
    let vehicles: Vehicle[];
    
    if (disabledParam === 'true') {
      // Get only disabled vehicles
      vehicles = await storage.getVehicles(true);
      vehicles = vehicles.filter(v => v.disabled);
    } else if (disabledParam === 'false') {
      // Get only active vehicles
      vehicles = await storage.getVehicles(false);
    } else {
      // Get all vehicles (for backward compatibility)
      vehicles = await storage.getVehicles(true);
    }
    
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch vehicles" });
  }
});

/**
 * GET /api/vehicles/search
 * Search vehicles by query string
 * Validates query length to prevent abuse
 */
router.get("/search", isAuthenticated, async (req: any, res) => {
  try {
    const query = req.query.q as string || '';
    
    // Validate search query length
    const searchValidation = validateSearchQuery(query);
    if (!searchValidation.valid) {
      return res.status(400).json({ message: searchValidation.error });
    }
    
    const vehicles = await storage.searchVehicles(query);
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to search vehicles" });
  }
});

/**
 * GET /api/vehicles/:id
 * Get single vehicle by ID
 */
router.get("/:id", isAuthenticated, async (req: any, res) => {
  try {
    const vehicle = await storage.getVehicleById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch vehicle" });
  }
});

/**
 * GET /api/vehicles/:id/availability
 * Check vehicle availability for given date range
 * Query params: startDate, endDate, excludeContractId (optional)
 */
router.get("/:id/availability", isAuthenticated, async (req: any, res) => {
  try {
    const { startDate, endDate, excludeContractId } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }
    
    const isAvailable = await storage.checkVehicleAvailability(
      req.params.id,
      new Date(startDate as string),
      new Date(endDate as string),
      excludeContractId as string | undefined
    );
    
    res.json({ available: isAvailable });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to check availability" });
  }
});

/**
 * POST /api/vehicles
 * Create new vehicle
 * Requires Editor role
 */
router.post("/", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const vehicleData = insertVehicleSchema.parse(req.body);
    const vehicle = await storage.createVehicle({
      ...vehicleData,
      createdBy: req.user!.id,
    } as any);
    
    await createAuditLog(req.user!.id, "create_vehicle", undefined, req, `Created vehicle: ${vehicle.registration}`);
    
    res.status(201).json(vehicle);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: fromZodError(error).message });
    }
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to create vehicle" });
  }
});

/**
 * PATCH /api/vehicles/:id
 * Update existing vehicle
 * Requires Editor role
 */
router.patch("/:id", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const vehicleData = insertVehicleSchema.partial().parse(req.body);
    const vehicle = await storage.updateVehicle(req.params.id, vehicleData);
    
    await createAuditLog(req.user!.id, "update_vehicle", undefined, req, `Updated vehicle: ${vehicle.registration}`);
    
    res.json(vehicle);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: fromZodError(error).message });
    }
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update vehicle" });
  }
});

/**
 * POST /api/vehicles/:id/disable
 * Disable vehicle (soft delete)
 * Requires Admin role
 */
router.post("/:id/disable", isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    await storage.disableVehicle(req.params.id, req.user!.id);
    
    await createAuditLog(req.user!.id, "disable_vehicle", undefined, req, `Disabled vehicle: ${req.params.id}`);
    
    res.json({ message: "Vehicle disabled successfully" });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to disable vehicle" });
  }
});

/**
 * POST /api/vehicles/:id/enable
 * Re-enable previously disabled vehicle
 * Requires Admin role
 */
router.post("/:id/enable", isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    await storage.enableVehicle(req.params.id);
    
    await createAuditLog(req.user!.id, "enable_vehicle", undefined, req, `Enabled vehicle: ${req.params.id}`);
    
    res.json({ message: "Vehicle enabled successfully" });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to enable vehicle" });
  }
});

export default router;
