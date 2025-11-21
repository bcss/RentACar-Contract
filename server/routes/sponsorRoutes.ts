/**
 * Sponsor Routes Module
 * Handles all sponsor-related API endpoints
 */

import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { isAuthenticated, requireEditor, requireAdmin } from "../auth/localAuth";
import { insertSponsorSchema, type Sponsor } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { createAuditLog, validateSearchQuery } from "../utils/routeHelpers";

const router = Router();

// GET /api/sponsors - List all sponsors
router.get("/", isAuthenticated, async (req: any, res: Response) => {
  try {
    const disabledParam = req.query.disabled;
    let sponsors: Sponsor[];
    
    if (disabledParam === 'true') {
      // Get only disabled sponsors
      sponsors = await storage.getSponsors(true);
      sponsors = sponsors.filter(p => p.disabled);
    } else if (disabledParam === 'false') {
      // Get only active sponsors
      sponsors = await storage.getSponsors(false);
    } else {
      // Get all sponsors
      sponsors = await storage.getSponsors(true);
    }
    
    res.json(sponsors);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch sponsors" });
  }
});

// GET /api/sponsors/search - Search sponsors
router.get("/search", isAuthenticated, async (req: any, res: Response) => {
  try {
    const query = req.query.q as string || '';
    
    // Validate search query length
    const searchValidation = validateSearchQuery(query);
    if (!searchValidation.valid) {
      return res.status(400).json({ message: searchValidation.error });
    }
    
    const sponsors = await storage.searchSponsors(query);
    res.json(sponsors);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to search sponsors" });
  }
});

// GET /api/sponsors/:id - Get sponsor by ID
router.get("/:id", isAuthenticated, async (req: any, res: Response) => {
  try {
    const sponsor = await storage.getSponsorById(req.params.id);
    if (!sponsor) {
      return res.status(404).json({ message: "Sponsor not found" });
    }
    res.json(sponsor);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch sponsor" });
  }
});

// POST /api/sponsors - Create new sponsor
router.post("/", isAuthenticated, requireEditor, async (req: any, res: Response) => {
  try {
    const sponsorData = insertSponsorSchema.parse(req.body);
    const sponsor = await storage.createSponsor({
      ...sponsorData,
      createdBy: req.user!.id,
    } as any);
    
    await createAuditLog(req.user!.id, "create_sponsor", undefined, req, `Created sponsor: ${sponsor.nameEn}`);
    
    res.status(201).json(sponsor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: fromZodError(error).message });
    }
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to create sponsor" });
  }
});

// PATCH /api/sponsors/:id - Update sponsor
router.patch("/:id", isAuthenticated, requireEditor, async (req: any, res: Response) => {
  try {
    const sponsorData = insertSponsorSchema.partial().parse(req.body);
    const sponsor = await storage.updateSponsor(req.params.id, sponsorData);
    
    await createAuditLog(req.user!.id, "update_sponsor", undefined, req, `Updated sponsor: ${sponsor.nameEn}`);
    
    res.json(sponsor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: fromZodError(error).message });
    }
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update sponsor" });
  }
});

// POST /api/sponsors/:id/disable - Disable sponsor
router.post("/:id/disable", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
  try {
    await storage.disableSponsor(req.params.id, req.user!.id);
    
    await createAuditLog(req.user!.id, "disable_sponsor", undefined, req, `Disabled sponsor: ${req.params.id}`);
    
    res.json({ message: "Sponsor disabled successfully" });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to disable sponsor" });
  }
});

// POST /api/sponsors/:id/enable - Enable sponsor
router.post("/:id/enable", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
  try {
    await storage.enableSponsor(req.params.id);
    
    await createAuditLog(req.user!.id, "enable_sponsor", undefined, req, `Enabled sponsor: ${req.params.id}`);
    
    res.json({ message: "Sponsor enabled successfully" });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to enable sponsor" });
  }
});

export default router;
