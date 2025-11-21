/**
 * Public Holiday Routes Module
 * Handles public holiday management for UAE rental calendar
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated, requireManagerOrAdmin, requireAdmin } from "../auth/localAuth";
import { insertPublicHolidaySchema, type User } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { createAuditLog } from "../utils/routeHelpers";
import {
  getCachedPublicHolidays,
  setCachedPublicHolidays,
  invalidatePublicHolidaysCache,
} from "../utils/cache";

const router = Router();

// GET /api/public-holidays - List all public holidays
router.get("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      year: req.query.year ? parseInt(req.query.year as string) : undefined,
    };
    
    // Try cache first (with year scoping)
    let holidays = await getCachedPublicHolidays(filters.year);
    
    if (!holidays) {
      holidays = await storage.getPublicHolidays(filters);
      await setCachedPublicHolidays(holidays, filters.year);
    }
    
    res.json(holidays);
  } catch (error) {
    next(error);
  }
});

// GET /api/public-holidays/:id - Get holiday by ID
router.get("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const holiday = await storage.getPublicHolidayById(req.params.id);
    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }
    res.json(holiday);
  } catch (error) {
    next(error);
  }
});

// POST /api/public-holidays - Create new public holiday
router.post("/", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    
    const validationResult = insertPublicHolidaySchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = fromZodError(validationResult.error);
      return res.status(400).json({ message: errors.message });
    }
    
    const holiday = await storage.createPublicHoliday({
      ...validationResult.data,
      createdBy: user.id,
    });
    
    // Invalidate holidays cache
    await invalidatePublicHolidaysCache();
    
    await createAuditLog(user.id, 'public_holiday_created', holiday.id, req, `Created public holiday: ${holiday.nameEn}`);
    res.status(201).json(holiday);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/public-holidays/:id - Update holiday
router.patch("/:id", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    
    // INPUT VALIDATION
    const validationResult = insertPublicHolidaySchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      const errors = fromZodError(validationResult.error);
      return res.status(400).json({ message: errors.message });
    }
    
    const holiday = await storage.updatePublicHoliday(req.params.id, validationResult.data);
    
    // Invalidate holidays cache
    await invalidatePublicHolidaysCache();
    
    await createAuditLog(user.id, 'public_holiday_updated', holiday.id, req, `Updated public holiday: ${holiday.nameEn}`);
    res.json(holiday);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/public-holidays/:id - Delete holiday
router.delete("/:id", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    
    await storage.deletePublicHoliday(req.params.id);
    await createAuditLog(user.id, 'public_holiday_deleted', req.params.id, req, `Deleted public holiday`);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
