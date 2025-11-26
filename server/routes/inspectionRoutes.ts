/**
 * Inspection & Service Routes Module
 * Vehicle inspections and service records
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated, requireEditor } from "../auth/localAuth";
import { insertVehicleInspectionSchema, insertVehicleServiceRecordSchema, type User } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { createAuditLog } from "../utils/routeHelpers";

const router = Router();

// ==================== VEHICLE INSPECTIONS ====================

router.get("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      vehicleId: req.query.vehicleId as string | undefined,
      contractId: req.query.contractId as string | undefined,
      inspectionType: req.query.inspectionType as string | undefined,
    };
    const inspections = await storage.getVehicleInspections(filters);
    res.json(inspections);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inspection = await storage.getVehicleInspection(req.params.id);
    if (!inspection) {
      return res.status(404).json({ message: "Inspection not found" });
    }
    res.json(inspection);
  } catch (error) {
    next(error);
  }
});

router.post("/", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const data = insertVehicleInspectionSchema.parse(req.body);
    
    // createVehicleInspection now atomically handles lifecycle field updates
    // Per Master Spec Part 3 - first-handover semantics handled in storage layer
    const inspection = await storage.createVehicleInspection({
      ...data,
      createdBy: user.id,
    } as any);
    
    await createAuditLog(user.id, 'inspection_created', inspection.contractId ?? undefined, req, `Created ${inspection.inspectionType} vehicle inspection`);
    res.status(201).json(inspection);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const validationResult = insertVehicleInspectionSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: fromZodError(validationResult.error).message });
    }
    
    const inspection = await storage.updateVehicleInspection(req.params.id, validationResult.data);
    await createAuditLog(user.id, 'inspection_updated', inspection.contractId ?? undefined, req, `Updated vehicle inspection`);
    res.json(inspection);
  } catch (error) {
    next(error);
  }
});

// ==================== SERVICE RECORDS ====================

router.get("/service-records", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      vehicleId: req.query.vehicleId as string | undefined,
      serviceType: req.query.serviceType as string | undefined,
    };
    const records = await storage.getVehicleServiceRecords(filters);
    res.json(records);
  } catch (error) {
    next(error);
  }
});

router.get("/service-records/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await storage.getVehicleServiceRecordById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Service record not found" });
    }
    res.json(record);
  } catch (error) {
    next(error);
  }
});

router.post("/service-records", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const data = insertVehicleServiceRecordSchema.parse(req.body);
    const record = await storage.createVehicleServiceRecord({
      ...data,
      createdBy: user.id,
    } as any);
    
    await createAuditLog(user.id, 'service_record_created', undefined, req, `Created service record for vehicle`);
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
});

router.patch("/service-records/:id", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const validationResult = insertVehicleServiceRecordSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: fromZodError(validationResult.error).message });
    }
    
    const record = await storage.updateVehicleServiceRecord(req.params.id, validationResult.data);
    await createAuditLog(user.id, 'service_record_updated', undefined, req, `Updated service record`);
    res.json(record);
  } catch (error) {
    next(error);
  }
});

export default router;
