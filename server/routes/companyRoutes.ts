/**
 * Company Routes Module
 * Handles all corporate sponsor (company) API endpoints
 */

import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { isAuthenticated, requireEditor, requireAdmin } from "../auth/localAuth";
import { insertCompanySchema, type Company } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const router = Router();

/**
 * Helper: Validate search query
 */
function validateSearchQuery(query: string): { valid: boolean; error?: string } {
  if (!query || query.trim().length === 0) {
    return { valid: false, error: "Search query cannot be empty" };
  }
  if (query.length < 2) {
    return { valid: false, error: "Search query must be at least 2 characters" };
  }
  if (query.length > 100) {
    return { valid: false, error: "Search query must not exceed 100 characters" };
  }
  return { valid: true };
}

/**
 * Helper: Create audit log
 */
async function createAuditLog(
  userId: string,
  action: string,
  contractId: string | undefined,
  req: Request,
  details?: string
) {
  try {
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');
    const sessionId = req.session?.id;
    
    await storage.createAuditLog({
      userId,
      action,
      contractId,
      details,
      ipAddress,
      userAgent,
      sessionId,
    } as any);
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

// GET /api/companies - List all companies
router.get("/", isAuthenticated, async (req: any, res: Response) => {
  try {
    const disabledParam = req.query.disabled;
    let companies: Company[];
    
    if (disabledParam === 'true') {
      // Get only disabled companies
      companies = await storage.getCompanies(true);
      companies = companies.filter(c => c.disabled);
    } else if (disabledParam === 'false') {
      // Get only active companies
      companies = await storage.getCompanies(false);
    } else {
      // Get all companies (for backward compatibility)
      companies = await storage.getCompanies(true);
    }
    
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch companies" });
  }
});

// GET /api/companies/search - Search companies
router.get("/search", isAuthenticated, async (req: any, res: Response) => {
  try {
    const query = req.query.q as string || '';
    
    // Validate search query length
    const searchValidation = validateSearchQuery(query);
    if (!searchValidation.valid) {
      return res.status(400).json({ message: searchValidation.error });
    }
    
    const companies = await storage.searchCompanies(query);
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to search companies" });
  }
});

// GET /api/companies/:id - Get company by ID
router.get("/:id", isAuthenticated, async (req: any, res: Response) => {
  try {
    const company = await storage.getCompanyById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch company" });
  }
});

// POST /api/companies - Create new company
router.post("/", isAuthenticated, requireEditor, async (req: any, res: Response) => {
  try {
    const companyData = insertCompanySchema.parse(req.body);
    const company = await storage.createCompany({
      ...companyData,
      createdBy: req.user!.id,
    } as any);
    
    await createAuditLog(req.user!.id, "create_company", undefined, req, `Created company: ${company.nameEn}`);
    
    res.status(201).json(company);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: fromZodError(error).message });
    }
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to create company" });
  }
});

// PATCH /api/companies/:id - Update company
router.patch("/:id", isAuthenticated, requireEditor, async (req: any, res: Response) => {
  try {
    const companyData = insertCompanySchema.partial().parse(req.body);
    const company = await storage.updateCompany(req.params.id, companyData);
    
    await createAuditLog(req.user!.id, "update_company", undefined, req, `Updated company: ${company.nameEn}`);
    
    res.json(company);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: fromZodError(error).message });
    }
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update company" });
  }
});

// POST /api/companies/:id/disable - Disable company
router.post("/:id/disable", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
  try {
    await storage.disableCompany(req.params.id, req.user!.id);
    
    await createAuditLog(req.user!.id, "disable_company", undefined, req, `Disabled company: ${req.params.id}`);
    
    res.json({ message: "Company disabled successfully" });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to disable company" });
  }
});

// POST /api/companies/:id/enable - Enable company
router.post("/:id/enable", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
  try {
    await storage.enableCompany(req.params.id);
    
    await createAuditLog(req.user!.id, "enable_company", undefined, req, `Enabled company: ${req.params.id}`);
    
    res.json({ message: "Company enabled successfully" });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to enable company" });
  }
});

export default router;
