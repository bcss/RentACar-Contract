/**
 * Contract Dispute Routes Module
 * Per Master Spec Part 4.4.5 - Contract dispute tracking
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "../db";
import { contractDisputes, contracts, users } from "@shared/schema";
import { isAuthenticated, requireEditor, requireAdmin } from "../auth/localAuth";
import { insertContractDisputeSchema, type User } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { createAuditLog } from "../utils/routeHelpers";
import { eq, and, desc, sql } from "drizzle-orm";

const router = Router();

router.get("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters: any = {};
    if (req.query.contractId) {
      filters.contractId = req.query.contractId as string;
    }
    if (req.query.status) {
      filters.status = req.query.status as string;
    }

    let query = db.select().from(contractDisputes);
    
    const whereConditions = [];
    if (req.query.contractId) {
      whereConditions.push(eq(contractDisputes.contractId, req.query.contractId as string));
    }
    if (req.query.status) {
      whereConditions.push(eq(contractDisputes.status, req.query.status as string));
    }

    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions)) as any;
    }

    const disputes = await query.orderBy(desc(contractDisputes.createdAt));
    res.json(disputes);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [dispute] = await db
      .select()
      .from(contractDisputes)
      .where(eq(contractDisputes.id, req.params.id))
      .limit(1);

    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }
    res.json(dispute);
  } catch (error) {
    next(error);
  }
});

router.post("/", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const validationResult = insertContractDisputeSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ message: fromZodError(validationResult.error).message });
    }

    const [contract] = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, validationResult.data.contractId))
      .limit(1);

    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    const [dispute] = await db
      .insert(contractDisputes)
      .values({
        ...validationResult.data,
        openedBy: user.id,
        status: 'OPEN',
      })
      .returning();

    await createAuditLog(user.id, 'dispute_created', contract.id, req, `Created dispute for contract`);
    res.status(201).json(dispute);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const validationResult = insertContractDisputeSchema.partial().safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ message: fromZodError(validationResult.error).message });
    }

    const [existing] = await db
      .select()
      .from(contractDisputes)
      .where(eq(contractDisputes.id, req.params.id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    const [dispute] = await db
      .update(contractDisputes)
      .set({
        ...validationResult.data,
        updatedAt: new Date(),
      })
      .where(eq(contractDisputes.id, req.params.id))
      .returning();

    await createAuditLog(user.id, 'dispute_updated', existing.contractId, req, `Updated dispute`);
    res.json(dispute);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/resolve", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const { outcome, resolutionNotes } = req.body;

    if (!outcome || !['UPHELD', 'REJECTED', 'PARTIAL', 'SETTLED'].includes(outcome)) {
      return res.status(400).json({ message: "Valid outcome required: UPHELD, REJECTED, PARTIAL, or SETTLED" });
    }

    const [existing] = await db
      .select()
      .from(contractDisputes)
      .where(eq(contractDisputes.id, req.params.id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    if (existing.status === 'CLOSED') {
      return res.status(400).json({ message: "Cannot resolve a closed dispute" });
    }

    const [dispute] = await db
      .update(contractDisputes)
      .set({
        status: 'RESOLVED',
        outcome,
        resolutionNotes,
        resolvedBy: user.id,
        updatedAt: new Date(),
      })
      .where(eq(contractDisputes.id, req.params.id))
      .returning();

    await createAuditLog(user.id, 'dispute_resolved', existing.contractId, req, `Resolved dispute with outcome: ${outcome}`);
    res.json(dispute);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/close", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;

    const [existing] = await db
      .select()
      .from(contractDisputes)
      .where(eq(contractDisputes.id, req.params.id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    const [dispute] = await db
      .update(contractDisputes)
      .set({
        status: 'CLOSED',
        updatedAt: new Date(),
      })
      .where(eq(contractDisputes.id, req.params.id))
      .returning();

    await createAuditLog(user.id, 'dispute_closed', existing.contractId, req, `Closed dispute`);
    res.json(dispute);
  } catch (error) {
    next(error);
  }
});

export default router;
