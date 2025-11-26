/**
 * Driver Management Routes Module
 * Comprehensive driver service module: companies, drivers, rates, schedules, assignments, attendance
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq, and, or } from "drizzle-orm";
import { isAuthenticated, requireManagerOrAdmin, requireAdmin } from "../auth/localAuth";
import {
  insertDriverOutsourceCompanySchema,
  insertDriverSchema,
  insertDriverRatePlanSchema, // Per Master Spec §4.10.2
  insertDriverScheduleBlockSchema,
  insertContractDriverSchema, // Per Master Spec §4.10.3
  insertDriverScheduleSchema,
  insertDriverAttendanceSchema,
  type User,
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { notificationService } from "../services/notificationService";
import { createAuditLog } from "../utils/routeHelpers";

const router = Router();

// ==================== DRIVER OUTSOURCE COMPANIES ====================

router.get("/companies", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const includeDisabled = req.query.includeDisabled === 'true';
    const companies = await storage.getDriverOutsourceCompanies(includeDisabled);
    res.json(companies);
  } catch (error) {
    next(error);
  }
});

router.get("/companies/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = await storage.getDriverOutsourceCompanyById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json(company);
  } catch (error) {
    next(error);
  }
});

router.post("/companies", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const validationResult = insertDriverOutsourceCompanySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: fromZodError(validationResult.error).message });
    }
    
    const company = await storage.createDriverOutsourceCompany({
      ...validationResult.data,
      createdBy: user.id,
    });
    
    await createAuditLog(user.id, 'driver_company_created', undefined, req, `Created driver company: ${company.nameEn}`);
    res.status(201).json(company);
  } catch (error) {
    next(error);
  }
});

router.patch("/companies/:id", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const validationResult = insertDriverOutsourceCompanySchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: fromZodError(validationResult.error).message });
    }
    
    const company = await storage.updateDriverOutsourceCompany(req.params.id, validationResult.data);
    await createAuditLog(user.id, 'driver_company_updated', undefined, req, `Updated driver company: ${company.nameEn}`);
    res.json(company);
  } catch (error) {
    next(error);
  }
});

router.post("/companies/:id/disable", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    await storage.disableDriverOutsourceCompany(req.params.id, user.id);
    await createAuditLog(user.id, 'driver_company_disabled', undefined, req, `Disabled driver company`);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/companies/:id/enable", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    await storage.enableDriverOutsourceCompany(req.params.id);
    await createAuditLog(user.id, 'driver_company_enabled', undefined, req, `Enabled driver company`);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// ==================== DRIVERS ====================

router.get("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      availability: req.query.availability as string | undefined,
      employmentType: req.query.employmentType as string | undefined,
      includeDisabled: req.query.includeDisabled === 'true',
    };
    const drivers = await storage.getDrivers(filters);
    res.json(drivers);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driver = await storage.getDriverById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    res.json(driver);
  } catch (error) {
    next(error);
  }
});

router.post("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    if (!user.canManageDrivers && user.role !== 'Admin') {
      return res.status(403).json({ message: "Insufficient permissions to create drivers" });
    }
    
    const validationResult = insertDriverSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: fromZodError(validationResult.error).message });
    }
    
    const driver = await storage.createDriver({
      ...validationResult.data,
      createdBy: user.id,
    });
    
    await createAuditLog(user.id, 'driver_created', undefined, req, `Created driver: ${driver.driverCode}`);
    res.status(201).json(driver);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    if (!user.canManageDrivers && user.role !== 'Admin') {
      return res.status(403).json({ message: "Insufficient permissions to update drivers" });
    }
    
    const validationResult = insertDriverSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: fromZodError(validationResult.error).message });
    }
    
    const driver = await storage.updateDriver(req.params.id, validationResult.data);
    await createAuditLog(user.id, 'driver_updated', undefined, req, `Updated driver: ${driver.driverCode}`);
    res.json(driver);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/availability", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const { availability } = req.body;
    if (!availability) {
      return res.status(400).json({ message: "Availability is required" });
    }
    
    const driver = await storage.updateDriverAvailability(req.params.id, availability);
    await createAuditLog(user.id, 'driver_availability_updated', undefined, req, `Updated driver availability to: ${availability}`);
    res.json(driver);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/disable", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    if (!user.canManageDrivers && user.role !== 'Admin') {
      return res.status(403).json({ message: "Insufficient permissions to disable drivers" });
    }
    
    await storage.disableDriver(req.params.id, user.id);
    await createAuditLog(user.id, 'driver_disabled', undefined, req, `Disabled driver`);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/enable", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    if (!user.canManageDrivers && user.role !== 'Admin') {
      return res.status(403).json({ message: "Insufficient permissions to enable drivers" });
    }
    
    await storage.enableDriver(req.params.id);
    await createAuditLog(user.id, 'driver_enabled', undefined, req, `Enabled driver`);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// ==================== DRIVER RATE PLANS (Per Master Spec §4.10.2) ====================

router.get("/:id/rate-plans", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ratePlans = await storage.getDriverRatePlans(req.params.id);
    res.json(ratePlans);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/rate-plans", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    if (!user.canManageDrivers && user.role !== 'Admin') {
      return res.status(403).json({ message: "Insufficient permissions to manage driver rates" });
    }
    
    const validationResult = insertDriverRatePlanSchema.safeParse({
      ...req.body,
      driverId: req.params.id,
    });
    if (!validationResult.success) {
      return res.status(400).json({ message: fromZodError(validationResult.error).message });
    }
    
    const ratePlan = await storage.createDriverRatePlan({
      ...validationResult.data,
      createdBy: user.id,
    });
    
    await createAuditLog(user.id, 'driver_rate_plan_created', undefined, req, `Created rate plan for driver`);
    res.status(201).json(ratePlan);
  } catch (error) {
    next(error);
  }
});

router.patch("/rate-plans/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    if (!user.canManageDrivers && user.role !== 'Admin') {
      return res.status(403).json({ message: "Insufficient permissions to manage driver rates" });
    }
    
    const validationResult = insertDriverRatePlanSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: fromZodError(validationResult.error).message });
    }
    
    const ratePlan = await storage.updateDriverRatePlan(req.params.id, validationResult.data);
    await createAuditLog(user.id, 'driver_rate_plan_updated', undefined, req, `Updated driver rate plan`);
    res.json(ratePlan);
  } catch (error) {
    next(error);
  }
});

// ==================== DRIVER SCHEDULE BLOCKS ====================

router.get("/:id/schedule", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const blocks = await storage.getDriverScheduleBlocks(req.params.id, startDate, endDate);
    res.json(blocks);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/schedule", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    if (!user.canManageDrivers && user.role !== 'Admin') {
      return res.status(403).json({ message: "Insufficient permissions to manage driver schedule" });
    }
    
    const validationResult = insertDriverScheduleBlockSchema.safeParse({
      ...req.body,
      driverId: req.params.id,
    });
    if (!validationResult.success) {
      return res.status(400).json({ message: fromZodError(validationResult.error).message });
    }
    
    const block = await storage.createDriverScheduleBlock({
      ...validationResult.data,
      createdBy: user.id,
    });
    
    await createAuditLog(user.id, 'driver_schedule_block_created', undefined, req, `Created schedule block for driver`);
    res.status(201).json(block);
  } catch (error) {
    next(error);
  }
});

router.delete("/schedule-blocks/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    if (!user.canManageDrivers && user.role !== 'Admin') {
      return res.status(403).json({ message: "Insufficient permissions to manage driver schedule" });
    }
    
    await storage.deleteDriverScheduleBlock(req.params.id);
    await createAuditLog(user.id, 'driver_schedule_block_deleted', undefined, req, `Deleted driver schedule block`);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/check-availability", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDateTime, endDateTime } = req.body;
    if (!startDateTime || !endDateTime) {
      return res.status(400).json({ message: "Start and end date/time required" });
    }
    
    const isAvailable = await storage.checkDriverAvailability(
      req.params.id,
      new Date(startDateTime),
      new Date(endDateTime)
    );
    
    res.json({ isAvailable });
  } catch (error) {
    next(error);
  }
});

// ==================== CONTRACT DRIVERS (Per Master Spec §4.10.3) ====================

router.get("/contract-drivers", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      contractId: req.query.contractId as string | undefined,
      driverId: req.query.driverId as string | undefined,
      status: req.query.status as string | undefined,
    };
    const assignments = await storage.getContractDrivers(filters);
    res.json(assignments);
  } catch (error) {
    next(error);
  }
});

router.get("/contract-drivers/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignment = await storage.getContractDriverById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Contract driver assignment not found" });
    }
    res.json(assignment);
  } catch (error) {
    next(error);
  }
});

router.post("/contract-drivers", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    if (!user.canAssignDrivers && user.role !== 'Admin' && user.role !== 'Manager') {
      return res.status(403).json({ message: "Insufficient permissions to assign drivers" });
    }
    
    const validationResult = insertContractDriverSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: fromZodError(validationResult.error).message });
    }
    
    const assignment = await storage.createContractDriver(validationResult.data);
    
    await createAuditLog(user.id, 'contract_driver_created', undefined, req, `Assigned driver to contract`);
    
    // Send driver assignment notification
    try {
      const driver = await storage.getDriverById(assignment.driverId);
      const contract = assignment.contractId ? await storage.getContract(assignment.contractId) : null;
      if (driver) {
        await notificationService.sendNotification({
          templateCode: 'DRIVER_ASSIGNMENT_CREATED',
          channel: 'sms',
          recipientType: 'driver',
          recipientId: driver.id,
          variables: {
            driverName: driver.nameEn || '',
            assignmentDate: assignment.assignmentStart ? new Date(assignment.assignmentStart).toLocaleDateString('en-AE') : 'N/A',
            contractNumber: contract?.contractNumber.toString() || 'N/A',
            assignmentType: 'driver_service',
          },
          language: 'en',
          triggerType: 'event_driven',
          triggeredBy: user.id,
          entityType: 'contract_driver',
          entityId: assignment.id,
        });
      }
    } catch (notifError) {
      console.error('[Notification] Failed to send driver assignment notification:', notifError);
    }
    
    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
});

router.patch("/contract-drivers/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    if (!user.canAssignDrivers && user.role !== 'Admin' && user.role !== 'Manager') {
      return res.status(403).json({ message: "Insufficient permissions to update driver assignments" });
    }
    
    const validationResult = insertContractDriverSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: fromZodError(validationResult.error).message });
    }
    
    const assignment = await storage.updateContractDriver(req.params.id, validationResult.data);
    await createAuditLog(user.id, 'contract_driver_updated', undefined, req, `Updated contract driver assignment`);
    res.json(assignment);
  } catch (error) {
    next(error);
  }
});

router.post("/contract-drivers/:id/complete", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const { completionNotes } = req.body;
    const assignment = await storage.completeContractDriver(req.params.id, completionNotes || '');
    await createAuditLog(user.id, 'contract_driver_completed', assignment.id, req, `Completed contract driver assignment`);
    res.json(assignment);
  } catch (error) {
    next(error);
  }
});

// ==================== DRIVER SCHEDULES ====================

router.get("/schedules", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters: any = {};
    if (req.query.driverId) filters.driverId = req.query.driverId;
    if (req.query.branchId) filters.branchId = req.query.branchId;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);
    
    const schedules = await storage.getDriverSchedules(filters);
    res.json(schedules);
  } catch (error) {
    next(error);
  }
});

router.get("/schedules/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schedule = await storage.getDriverScheduleById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: "Driver schedule not found" });
    }
    res.json(schedule);
  } catch (error) {
    next(error);
  }
});

router.post("/schedules", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const data = insertDriverScheduleSchema.parse(req.body);
    const schedule = await storage.createDriverSchedule({
      ...data,
      createdBy: user.id,
    } as any);
    
    await createAuditLog(user.id, 'driver_schedule_created', undefined, req, `Created driver schedule`);
    res.status(201).json(schedule);
  } catch (error) {
    next(error);
  }
});

router.patch("/schedules/:id", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const validationResult = insertDriverScheduleSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: fromZodError(validationResult.error).message });
    }
    
    const schedule = await storage.updateDriverSchedule(req.params.id, validationResult.data);
    await createAuditLog(user.id, 'driver_schedule_updated', undefined, req, `Updated driver schedule`);
    res.json(schedule);
  } catch (error) {
    next(error);
  }
});

router.delete("/schedules/:id", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    await storage.deleteDriverSchedule(req.params.id);
    await createAuditLog(user.id, 'driver_schedule_deleted', undefined, req, `Deleted driver schedule`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ==================== DRIVER ATTENDANCE ====================

router.get("/attendance", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters: any = {};
    if (req.query.driverId) filters.driverId = req.query.driverId;
    if (req.query.scheduleId) filters.scheduleId = req.query.scheduleId;
    if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);
    
    const attendance = await storage.getDriverAttendance(filters);
    res.json(attendance);
  } catch (error) {
    next(error);
  }
});

router.get("/attendance/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attendance = await storage.getDriverAttendanceById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    res.json(attendance);
  } catch (error) {
    next(error);
  }
});

router.post("/attendance", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const data = insertDriverAttendanceSchema.parse(req.body);
    const attendance = await storage.createDriverAttendance({
      ...data,
      createdBy: user.id,
    } as any);
    
    await createAuditLog(user.id, 'driver_checked_in', undefined, req, `Driver checked in`);
    res.status(201).json(attendance);
  } catch (error) {
    next(error);
  }
});

router.patch("/attendance/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const validationResult = insertDriverAttendanceSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: fromZodError(validationResult.error).message });
    }
    
    const attendance = await storage.updateDriverAttendance(req.params.id, validationResult.data);
    await createAuditLog(user.id, 'driver_attendance_updated', undefined, req, `Updated driver attendance`);
    res.json(attendance);
  } catch (error) {
    next(error);
  }
});

router.post("/attendance/:id/checkout", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const attendance = await storage.checkOutDriver(req.params.id);
    await createAuditLog(user.id, 'driver_checked_out', undefined, req, `Driver checked out`);
    res.json(attendance);
  } catch (error) {
    next(error);
  }
});

router.delete("/attendance/:id", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    await storage.deleteDriverAttendance(req.params.id);
    await createAuditLog(user.id, 'driver_attendance_deleted', undefined, req, `Deleted attendance record`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
