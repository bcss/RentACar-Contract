/**
 * Campaign Routes Module
 * Marketing campaigns and delivery tracking
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated, requireEditor, requireManagerOrAdmin } from "../auth/localAuth";
import type { User } from "@shared/schema";
import { createAuditLog } from "../utils/routeHelpers";

const router = Router();

// GET /api/campaigns - List all campaigns
router.get("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const filters = {
      scope: req.query.scope as string | undefined,
      status: req.query.status as string | undefined,
      branchId: user.role !== 'admin' && user.role !== 'manager' ? user.branchId : (req.query.branchId as string | undefined),
    };
    const campaigns = await storage.getCampaigns(filters);
    res.json(campaigns);
  } catch (error) {
    next(error);
  }
});

// GET /api/campaigns/:id - Get campaign by ID
router.get("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await storage.getCampaignById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    res.json(campaign);
  } catch (error) {
    next(error);
  }
});

// POST /api/campaigns - Create new campaign
router.post("/", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const campaign = await storage.createCampaign({ ...req.body, createdBy: user.id });
    await createAuditLog(user.id, 'campaign_created', undefined, req, `Created campaign: ${campaign.campaignName}`);
    res.status(201).json(campaign);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/campaigns/:id - Update campaign
router.patch("/:id", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const campaign = await storage.updateCampaign(req.params.id, req.body);
    await createAuditLog(user.id, 'campaign_updated', undefined, req, `Updated campaign: ${campaign.campaignName}`);
    res.json(campaign);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/campaigns/:id - Delete campaign
router.delete("/:id", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    await storage.deleteCampaign(req.params.id);
    await createAuditLog(user.id, 'campaign_deleted', undefined, req, `Deleted campaign`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// POST /api/campaigns/:id/send - Send campaign
router.post("/:id/send", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const campaign = await storage.getCampaignById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    await storage.updateCampaign(req.params.id, { status: 'sent', sentAt: new Date() });
    await createAuditLog(user.id, 'campaign_sent', undefined, req, `Sent campaign: ${campaign.campaignName}`);
    
    res.json({ message: "Campaign sent successfully" });
  } catch (error) {
    next(error);
  }
});

// GET /api/campaigns/:id/deliveries - Get campaign deliveries
router.get("/:id/deliveries", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deliveries = await storage.getCampaignDeliveries(req.params.id);
    res.json(deliveries);
  } catch (error) {
    next(error);
  }
});

export default router;
