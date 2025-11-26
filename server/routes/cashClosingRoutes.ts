/**
 * Cash Closing Routes Module
 * Per Master Spec Part 9.4.1 - Daily branch reconciliation
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "../db";
import { cashClosings, branches, users, payments } from "@shared/schema";
import { isAuthenticated, requireEditor, requireAdmin } from "../auth/localAuth";
import { insertCashClosingSchema, type User } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { createAuditLog } from "../utils/routeHelpers";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

const router = Router();

router.get("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const whereConditions = [];
    
    if (req.query.branchId) {
      whereConditions.push(eq(cashClosings.branchId, req.query.branchId as string));
    }
    if (req.query.clerkUserId) {
      whereConditions.push(eq(cashClosings.clerkUserId, req.query.clerkUserId as string));
    }
    if (req.query.startDate) {
      whereConditions.push(gte(cashClosings.shiftEndAt, new Date(req.query.startDate as string)));
    }
    if (req.query.endDate) {
      whereConditions.push(lte(cashClosings.shiftEndAt, new Date(req.query.endDate as string)));
    }

    let query = db.select().from(cashClosings);
    
    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions)) as any;
    }

    const closings = await query.orderBy(desc(cashClosings.createdAt));
    res.json(closings);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [closing] = await db
      .select()
      .from(cashClosings)
      .where(eq(cashClosings.id, req.params.id))
      .limit(1);

    if (!closing) {
      return res.status(404).json({ message: "Cash closing not found" });
    }
    res.json(closing);
  } catch (error) {
    next(error);
  }
});

router.get("/branch/:branchId/system-totals", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { branchId } = req.params;
    const { startDate, endDate } = req.query;

    const [branch] = await db
      .select()
      .from(branches)
      .where(eq(branches.id, branchId))
      .limit(1);

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    const whereConditions = [
      eq(payments.branchId, branchId),
      eq(payments.status, 'completed'),
    ];

    if (startDate) {
      whereConditions.push(gte(payments.createdAt, new Date(startDate as string)));
    }
    if (endDate) {
      whereConditions.push(lte(payments.createdAt, new Date(endDate as string)));
    }

    const totals = await db
      .select({
        method: payments.method,
        total: sql<string>`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL(12,2))), 0)`,
      })
      .from(payments)
      .where(and(...whereConditions))
      .groupBy(payments.method);

    const result = {
      cash: '0',
      card: '0',
      bank: '0',
    };

    for (const row of totals) {
      if (row.method === 'cash') result.cash = row.total;
      else if (row.method === 'card') result.card = row.total;
      else if (row.method === 'bank') result.bank = row.total;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const validationResult = insertCashClosingSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ message: fromZodError(validationResult.error).message });
    }

    const [branch] = await db
      .select()
      .from(branches)
      .where(eq(branches.id, validationResult.data.branchId))
      .limit(1);

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    const systemCash = parseFloat(validationResult.data.systemCashTotal as string) || 0;
    const countedCash = parseFloat(validationResult.data.countedCashTotal as string) || 0;
    const differenceCash = countedCash - systemCash;

    const [closing] = await db
      .insert(cashClosings)
      .values({
        ...validationResult.data,
        differenceCash: String(differenceCash),
        clerkUserId: user.id,
      })
      .returning();

    await createAuditLog(user.id, 'cash_closing_created', undefined, req, `Created cash closing for branch ${branch.name}`);
    res.status(201).json(closing);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const validationResult = insertCashClosingSchema.partial().safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ message: fromZodError(validationResult.error).message });
    }

    const [existing] = await db
      .select()
      .from(cashClosings)
      .where(eq(cashClosings.id, req.params.id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ message: "Cash closing not found" });
    }

    if (existing.approvedBy) {
      return res.status(400).json({ message: "Cannot modify an approved cash closing" });
    }

    let updateData = { ...validationResult.data };

    if (validationResult.data.systemCashTotal || validationResult.data.countedCashTotal) {
      const systemCash = parseFloat((validationResult.data.systemCashTotal || existing.systemCashTotal) as string) || 0;
      const countedCash = parseFloat((validationResult.data.countedCashTotal || existing.countedCashTotal) as string) || 0;
      (updateData as any).differenceCash = String(countedCash - systemCash);
    }

    const [closing] = await db
      .update(cashClosings)
      .set(updateData)
      .where(eq(cashClosings.id, req.params.id))
      .returning();

    await createAuditLog(user.id, 'cash_closing_updated', undefined, req, `Updated cash closing`);
    res.json(closing);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/approve", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;

    const [existing] = await db
      .select()
      .from(cashClosings)
      .where(eq(cashClosings.id, req.params.id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ message: "Cash closing not found" });
    }

    if (existing.approvedBy) {
      return res.status(400).json({ message: "Cash closing already approved" });
    }

    const [closing] = await db
      .update(cashClosings)
      .set({
        approvedBy: user.id,
        approvedAt: new Date(),
      })
      .where(eq(cashClosings.id, req.params.id))
      .returning();

    await createAuditLog(user.id, 'cash_closing_approved', undefined, req, `Approved cash closing`);
    res.json(closing);
  } catch (error) {
    next(error);
  }
});

export default router;
