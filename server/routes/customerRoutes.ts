import { Router } from "express";
import type { Request, Response } from "express";
import { storage } from "../storage";
import { isAuthenticated, requireEditor } from "../auth/localAuth";
import { insertCustomerSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { validateSearchQuery } from "../utils/validation";

const router = Router();

// Helper for audit logging (will be imported from shared utilities)
async function createAuditLog(userId: string, action: string, contractId: string | undefined, req: Request, details?: string) {
  const { getGeolocation } = await import("../services/geolocation");
  try {
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');
    const sessionId = (req as any).session?.id;
    
    const geolocation = ipAddress ? await getGeolocation(ipAddress) : {};
    
    await storage.createAuditLog({
      userId,
      action,
      contractId,
      ipAddress,
      userAgent,
      sessionId,
      country: geolocation.country,
      city: geolocation.city,
      region: geolocation.region,
      details,
    });
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
}

// GET /api/customers - List all customers
router.get("/", isAuthenticated, async (req: any, res: Response) => {
  try {
    const disabledParam = req.query.disabled;
    let customers;
    
    if (disabledParam === 'true') {
      customers = await storage.getCustomers(true);
      customers = customers.filter((c: any) => c.disabled);
    } else if (disabledParam === 'false') {
      customers = await storage.getCustomers(false);
    } else {
      customers = await storage.getCustomers(true);
    }
    
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch customers" });
  }
});

// GET /api/customers/search - Search customers
router.get("/search", isAuthenticated, async (req: any, res: Response) => {
  try {
    const query = req.query.q as string || '';
    
    const searchValidation = validateSearchQuery(query);
    if (!searchValidation.valid) {
      return res.status(400).json({ message: searchValidation.error });
    }
    
    const customers = await storage.searchCustomers(query);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to search customers" });
  }
});

// GET /api/customers/:id - Get customer by ID
router.get("/:id", isAuthenticated, async (req: any, res: Response) => {
  try {
    const customer = await storage.getCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch customer" });
  }
});

// POST /api/customers - Create new customer
router.post("/", isAuthenticated, requireEditor, async (req: any, res: Response) => {
  try {
    const customerData = insertCustomerSchema.parse(req.body);
    const customer = await storage.createCustomer({
      ...customerData,
      createdBy: req.user!.id,
    } as any);
    
    await createAuditLog(req.user!.id, "create_customer", undefined, req, `Created customer: ${customer.nameEn}`);
    
    res.status(201).json(customer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: fromZodError(error).message });
    }
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to create customer" });
  }
});

// PATCH /api/customers/:id - Update customer
router.patch("/:id", isAuthenticated, requireEditor, async (req: any, res: Response) => {
  try {
    const customerData = insertCustomerSchema.partial().parse(req.body);
    const customer = await storage.updateCustomer(req.params.id, customerData as any);
    
    await createAuditLog(req.user!.id, "update_customer", undefined, req, `Updated customer: ${customer.nameEn}`);
    
    res.json(customer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: fromZodError(error).message });
    }
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update customer" });
  }
});

// POST /api/customers/:id/disable - Disable customer
router.post("/:id/disable", isAuthenticated, requireEditor, async (req: any, res: Response) => {
  try {
    const customer = await storage.disableCustomer(req.params.id, req.user!.id);
    
    await createAuditLog(req.user!.id, "disable_customer", undefined, req, `Disabled customer: ${customer.nameEn}`);
    
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to disable customer" });
  }
});

// POST /api/customers/:id/enable - Enable customer
router.post("/:id/enable", isAuthenticated, requireEditor, async (req: any, res: Response) => {
  try {
    const customer = await storage.enableCustomer(req.params.id);
    
    await createAuditLog(req.user!.id, "enable_customer", undefined, req, `Enabled customer: ${customer.nameEn}`);
    
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to enable customer" });
  }
});

// GET /api/customers/check-phone/:phone - Check phone uniqueness
router.get("/check-phone/:phone", isAuthenticated, async (req: any, res: Response) => {
  try {
    const { phone } = req.params;
    const { excludeId } = req.query;
    
    const customers = await storage.getCustomers(true);
    const existing = customers.find((c: any) => 
      c.phone === phone && (!excludeId || c.id !== excludeId)
    );
    
    res.json({ exists: !!existing });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to check phone" });
  }
});

export default router;
