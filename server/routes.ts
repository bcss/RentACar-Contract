import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, requireAdmin, requireManagerOrAdmin } from "./auth/localAuth";
import { insertContractSchema, insertUserSchema, insertCompanySettingsSchema, insertCustomerSchema, insertVehicleSchema, insertSponsorSchema, insertCompanySchema, insertPaymentSchema, type Customer, type Vehicle, type Sponsor, type Company } from "@shared/schema";
import { hashPassword, verifyPassword, validatePasswordStrength } from "./auth/passwordUtils";
import { seedSuperAdmin } from "./auth/seedSuperAdmin";
import { seedCompanySettings } from "./seedCompanySettings";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { getGeolocation } from "./services/geolocation";
import { format } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Seed super admin on startup
  await seedSuperAdmin();
  
  // Seed company settings on startup
  await seedCompanySettings();

  // Helper function to create audit log with enhanced tracking
  async function createAuditLog(userId: string, action: string, contractId: string | undefined, req: Request, details?: string) {
    try {
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');
      const sessionId = req.session?.id;
      
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

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Customer routes
  app.get("/api/customers", isAuthenticated, async (req: any, res) => {
    try {
      const disabledParam = req.query.disabled;
      let customers: Customer[];
      
      if (disabledParam === 'true') {
        // Get only disabled customers
        customers = await storage.getCustomers(true);
        customers = customers.filter(c => c.disabled);
      } else if (disabledParam === 'false') {
        // Get only active customers
        customers = await storage.getCustomers(false);
      } else {
        // Get all customers (for backward compatibility)
        customers = await storage.getCustomers(true);
      }
      
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/search", isAuthenticated, async (req: any, res) => {
    try {
      const query = req.query.q as string || '';
      const customers = await storage.searchCustomers(query);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to search customers" });
    }
  });

  app.get("/api/customers/:id", isAuthenticated, async (req: any, res) => {
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

  app.post("/api/customers", isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
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

  app.patch("/api/customers/:id", isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, customerData);
      
      await createAuditLog(req.user!.id, "update_customer", undefined, req, `Updated customer: ${customer.nameEn}`);
      
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update customer" });
    }
  });

  app.post("/api/customers/:id/disable", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      await storage.disableCustomer(req.params.id, req.user!.id);
      
      await createAuditLog(req.user!.id, "disable_customer", undefined, req, `Disabled customer: ${req.params.id}`);
      
      res.json({ message: "Customer disabled successfully" });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to disable customer" });
    }
  });

  app.post("/api/customers/:id/enable", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      await storage.enableCustomer(req.params.id);
      
      await createAuditLog(req.user!.id, "enable_customer", undefined, req, `Enabled customer: ${req.params.id}`);
      
      res.json({ message: "Customer enabled successfully" });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to enable customer" });
    }
  });

  // Check for duplicate phone number
  app.get("/api/customers/check-phone/:phone", isAuthenticated, async (req: any, res) => {
    try {
      const phone = req.params.phone;
      const excludeId = req.query.excludeId as string | undefined;
      
      const customers = await storage.getCustomers(false);
      const duplicates = customers.filter(c => 
        c.phone === phone && c.id !== excludeId
      );
      
      res.json({ 
        hasDuplicate: duplicates.length > 0,
        duplicateCount: duplicates.length,
        duplicateCustomers: duplicates.map(c => ({
          id: c.id,
          nameEn: c.nameEn,
          nameAr: c.nameAr,
        }))
      });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to check phone" });
    }
  });

  // Vehicle routes
  app.get("/api/vehicles", isAuthenticated, async (req: any, res) => {
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

  app.get("/api/vehicles/search", isAuthenticated, async (req: any, res) => {
    try {
      const query = req.query.q as string || '';
      const vehicles = await storage.searchVehicles(query);
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to search vehicles" });
    }
  });

  app.get("/api/vehicles/:id", isAuthenticated, async (req: any, res) => {
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

  app.get("/api/vehicles/:id/availability", isAuthenticated, async (req: any, res) => {
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

  app.post("/api/vehicles", isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
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

  app.patch("/api/vehicles/:id", isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
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

  app.post("/api/vehicles/:id/disable", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      await storage.disableVehicle(req.params.id, req.user!.id);
      
      await createAuditLog(req.user!.id, "disable_vehicle", undefined, req, `Disabled vehicle: ${req.params.id}`);
      
      res.json({ message: "Vehicle disabled successfully" });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to disable vehicle" });
    }
  });

  app.post("/api/vehicles/:id/enable", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      await storage.enableVehicle(req.params.id);
      
      await createAuditLog(req.user!.id, "enable_vehicle", undefined, req, `Enabled vehicle: ${req.params.id}`);
      
      res.json({ message: "Vehicle enabled successfully" });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to enable vehicle" });
    }
  });

  // Sponsor routes (individual sponsors)
  app.get("/api/sponsors", isAuthenticated, async (req: any, res) => {
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

  app.get("/api/sponsors/search", isAuthenticated, async (req: any, res) => {
    try {
      const query = req.query.q as string || '';
      const sponsors = await storage.searchSponsors(query);
      res.json(sponsors);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to search sponsors" });
    }
  });

  app.get("/api/sponsors/:id", isAuthenticated, async (req: any, res) => {
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

  app.post("/api/sponsors", isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
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

  app.patch("/api/sponsors/:id", isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
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

  app.post("/api/sponsors/:id/disable", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      await storage.disableSponsor(req.params.id, req.user!.id);
      
      await createAuditLog(req.user!.id, "disable_sponsor", undefined, req, `Disabled sponsor: ${req.params.id}`);
      
      res.json({ message: "Sponsor disabled successfully" });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to disable sponsor" });
    }
  });

  app.post("/api/sponsors/:id/enable", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      await storage.enableSponsor(req.params.id);
      
      await createAuditLog(req.user!.id, "enable_sponsor", undefined, req, `Enabled sponsor: ${req.params.id}`);
      
      res.json({ message: "Sponsor enabled successfully" });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to enable sponsor" });
    }
  });

  // Company routes (corporate sponsors)
  app.get("/api/companies", isAuthenticated, async (req: any, res) => {
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

  app.get("/api/companies/search", isAuthenticated, async (req: any, res) => {
    try {
      const query = req.query.q as string || '';
      const companies = await storage.searchCompanies(query);
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to search companies" });
    }
  });

  app.get("/api/companies/:id", isAuthenticated, async (req: any, res) => {
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

  app.post("/api/companies", isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
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

  app.patch("/api/companies/:id", isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
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

  app.patch("/api/companies/:id/disable", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      await storage.disableCompany(req.params.id, req.user!.id);
      
      await createAuditLog(req.user!.id, "disable_company", undefined, req, `Disabled company: ${req.params.id}`);
      
      res.json({ message: "Company disabled successfully" });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to disable company" });
    }
  });

  app.patch("/api/companies/:id/enable", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      await storage.enableCompany(req.params.id);
      
      await createAuditLog(req.user!.id, "enable_company", undefined, req, `Enabled company: ${req.params.id}`);
      
      res.json({ message: "Company enabled successfully" });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to enable company" });
    }
  });

  // Contract routes
  app.get('/api/contracts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Phase 1.5: Filter contracts based on user role
      // Admin, Manager, Viewer: See all contracts
      // Staff: Only see their own contracts
      let contracts = await storage.getAllContracts();
      
      if (user.role === 'staff') {
        contracts = contracts.filter(contract => contract.createdBy === userId);
      }
      
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  // Get disabled contracts (Admin only) - MUST be before :id route
  app.get('/api/contracts/disabled', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const contracts = await storage.getDisabledContracts();
      res.json(contracts);
    } catch (error: any) {
      console.error("Error fetching disabled contracts:", error);
      res.status(500).json({ message: "Failed to fetch disabled contracts" });
    }
  });

  app.get('/api/contracts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Phase 1.5: Staff can only view their own contracts
      if (user?.role === 'staff' && contract.createdBy !== userId) {
        return res.status(403).json({ message: "Forbidden: You can only view your own contracts" });
      }
      
      // CRITICAL FIX: Calculate real-time outstanding balance based on actual payments
      // The stored outstandingBalance can become stale when payments are added
      const contractPayments = await storage.getPaymentsByContract(contract.id);
      const totalPaid = contractPayments.reduce((sum: number, payment: any) => sum + parseFloat(payment.amount || '0'), 0);
      const totalAmount = parseFloat(contract.totalAmount || '0');
      const totalExtraCharges = parseFloat(contract.totalExtraCharges || '0');
      const totalDue = totalAmount + totalExtraCharges;
      
      // Calculate precise outstanding balance
      const totalPaidRounded = Math.round(totalPaid * 100) / 100;
      const totalDueRounded = Math.round(totalDue * 100) / 100;
      const computedOutstanding = Math.max(0, totalDueRounded - totalPaidRounded);
      
      // Return contract with dynamically calculated outstanding balance
      res.json({
        ...contract,
        outstandingBalance: computedOutstanding.toFixed(2),
      });
    } catch (error) {
      console.error("Error fetching contract:", error);
      res.status(500).json({ message: "Failed to fetch contract" });
    }
  });

  // Get contract edit history/timeline
  app.get('/api/contracts/:id/edits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Staff can only view edit history for their own contracts
      if (user?.role === 'staff' && contract.createdBy !== userId) {
        return res.status(403).json({ message: "Forbidden: You can only view your own contracts" });
      }
      
      const edits = await storage.getContractEdits(req.params.id);
      res.json(edits);
    } catch (error) {
      console.error("Error fetching contract edits:", error);
      res.status(500).json({ message: "Failed to fetch contract edit history" });
    }
  });

  // Get contract audit logs (lifecycle events for timeline)
  app.get('/api/contracts/:id/audit-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Staff can only view audit logs for their own contracts
      if (user?.role === 'staff' && contract.createdBy !== userId) {
        return res.status(403).json({ message: "Forbidden: You can only view your own contracts" });
      }
      
      const logs = await storage.getContractAuditLogs(req.params.id);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching contract audit logs:", error);
      res.status(500).json({ message: "Failed to fetch contract audit logs" });
    }
  });

  app.post('/api/contracts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertContractSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const contract = await storage.createContract(validatedData);
      
      // Create audit log
      await createAuditLog(userId, 'create', contract.id, req, `Created contract #${contract.contractNumber}`);
      
      res.json(contract);
    } catch (error: any) {
      console.error("Error creating contract:", error);
      res.status(400).json({ message: error.message || "Failed to create contract" });
    }
  });

  app.patch('/api/contracts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { editReason, ...contractData } = req.body;
      
      // Require edit reason for all contract edits
      if (!editReason || editReason.trim() === '') {
        return res.status(400).json({ message: "Edit reason is required" });
      }
      
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // Phase 1-2: Only allow editing draft contracts - protect lifecycle integrity
      if (contract.status !== 'draft') {
        return res.status(403).json({ 
          message: `Cannot edit ${contract.status} contract. Only draft contracts can be edited. Use state transition endpoints to advance the contract.` 
        });
      }

      // Check if user has permission to edit
      const user = await storage.getUser(userId);
      if (user?.role !== 'admin' && contract.createdBy !== userId) {
        return res.status(403).json({ message: "Forbidden: You can only edit your own contracts" });
      }

      // Capture state before edit
      const fieldsBefore = { ...contract };
      
      // Update the contract
      const updated = await storage.updateContract(req.params.id, contractData);
      
      // Capture state after edit
      const fieldsAfter = { ...updated };
      
      // Generate human-readable summary of changes
      const changedFields: string[] = [];
      Object.keys(contractData).forEach(key => {
        const beforeValue = (fieldsBefore as any)[key];
        const afterValue = (fieldsAfter as any)[key];
        if (beforeValue !== afterValue) {
          changedFields.push(`${key}: ${beforeValue} → ${afterValue}`);
        }
      });
      const changesSummary = changedFields.length > 0 
        ? `Changed ${changedFields.length} field(s): ${changedFields.join(', ')}`
        : 'No changes detected';
      
      // Create contract edit record
      await storage.createContractEdit({
        contractId: updated.id,
        editedBy: userId,
        editReason: editReason.trim(),
        changesSummary,
        fieldsBefore,
        fieldsAfter,
        ipAddress: req.ip,
      });
      
      // Create audit log
      await createAuditLog(userId, 'edit', updated.id, req, `Updated contract #${updated.contractNumber} - Reason: ${editReason.trim()}`);
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating contract:", error);
      res.status(400).json({ message: error.message || "Failed to update contract" });
    }
  });

  // Legacy /finalize route removed - use new state machine (confirm → activate → complete → close)

  // Phase 2: State transition routes (Admin/Manager only)
  
  // Confirm contract (draft → confirmed)
  app.post('/api/contracts/:id/confirm', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // DOUBLE-BOOKING PREVENTION: Check vehicle availability before confirming
      const isAvailable = await storage.checkVehicleAvailability(
        contract.vehicleId,
        new Date(contract.rentalStartDate),
        new Date(contract.rentalEndDate),
        contract.id // Exclude current contract from availability check
      );
      
      if (!isAvailable) {
        return res.status(400).json({ 
          message: "Vehicle is not available for the selected dates. Another confirmed, active, or completed contract exists for this period. Please choose different dates or another vehicle." 
        });
      }

      const confirmed = await storage.confirmContract(req.params.id, userId);
      
      // Update vehicle status to "rented"
      await storage.updateVehicle(confirmed.vehicleId, { status: "rented" });
      
      // Create audit log
      await createAuditLog(userId, 'confirm', confirmed.id, req, `Confirmed contract #${confirmed.contractNumber}`);
      
      res.json(confirmed);
    } catch (error: any) {
      console.error("Error confirming contract:", error);
      res.status(400).json({ message: error.message || "Failed to confirm contract" });
    }
  });

  // Activate rental (confirmed → active)
  app.post('/api/contracts/:id/activate', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // DATE VALIDATION: Prevent activation before rental start date
      const now = new Date();
      const startDate = new Date(contract.rentalStartDate);
      now.setHours(0, 0, 0, 0); // Compare dates only, ignore time
      startDate.setHours(0, 0, 0, 0);
      
      if (now < startDate) {
        return res.status(400).json({ 
          message: `Cannot activate contract before rental start date. Start date is ${contract.rentalStartDate}, but today is ${new Date().toISOString().split('T')[0]}. Please wait until the start date to activate.` 
        });
      }

      const activated = await storage.activateContract(req.params.id, userId);
      
      // Update vehicle status to "rented" (in case it wasn't set during confirm)
      await storage.updateVehicle(activated.vehicleId, { status: "rented" });
      
      // Create audit log
      await createAuditLog(userId, 'activate', activated.id, req, `Activated contract #${activated.contractNumber} - vehicle handed over`);
      
      res.json(activated);
    } catch (error: any) {
      console.error("Error activating contract:", error);
      res.status(400).json({ message: error.message || "Failed to activate contract" });
    }
  });

  // Complete rental with return data (active → completed)
  app.post('/api/contracts/:id/complete', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      const { odometerEnd, fuelLevelEnd, vehicleCondition, extraKmCharge, fuelCharge: clientFuelCharge, damageCharge, otherCharges, totalExtraCharges, outstandingBalance, extraKmDriven, fuelChargeOverride } = req.body;
      
      // SECURITY: Calculate fuel charge on backend instead of trusting client
      const vehicle = await storage.getVehicleById(contract.vehicleId);
      const settings = await storage.getCompanySettings();
      
      let calculatedFuelCharge = 0;
      let fuelChargeDetails = '';
      
      // Parse fuel levels to numbers (they're stored as strings)
      const fuelLevelStart = parseFloat(contract.fuelLevelStart || '0');
      const fuelLevelEndNum = parseFloat(fuelLevelEnd || '0');
      
      if (vehicle && settings && fuelLevelStart && fuelLevelEndNum < fuelLevelStart) {
        const tankCapacity = vehicle.tankCapacity || 0;
        const fuelType = vehicle.fuelType || 'petrol';
        
        // Only calculate if vehicle has tank capacity and uses fuel
        if (tankCapacity > 0 && (fuelType === 'petrol' || fuelType === 'diesel')) {
          const fuelConsumed = (tankCapacity * (fuelLevelStart - fuelLevelEndNum)) / 100;
          const pricePerLiter = fuelType === 'diesel' 
            ? parseFloat(settings.dieselPricePerLiter || '0')
            : parseFloat(settings.petrolPricePerLiter || '0');
          
          calculatedFuelCharge = Math.round(fuelConsumed * pricePerLiter * 100) / 100;
          fuelChargeDetails = `Fuel consumed: ${fuelConsumed.toFixed(2)}L × ${pricePerLiter} AED/L = ${calculatedFuelCharge.toFixed(2)} AED`;
        }
      }
      
      // Use calculated charge unless manual override is explicitly flagged
      let finalFuelCharge = calculatedFuelCharge.toString();
      let auditNote = `Completed contract #${contract.contractNumber} - vehicle returned`;
      
      if (fuelChargeOverride && clientFuelCharge !== undefined && parseFloat(clientFuelCharge) !== calculatedFuelCharge) {
        finalFuelCharge = clientFuelCharge;
        auditNote += ` | FUEL CHARGE OVERRIDE: Backend calculated ${calculatedFuelCharge.toFixed(2)} AED (${fuelChargeDetails}), but manual override set to ${clientFuelCharge} AED`;
      } else if (calculatedFuelCharge > 0) {
        auditNote += ` | Fuel charge auto-calculated: ${fuelChargeDetails}`;
      }
      
      // Prepare charge data
      const chargeData = {
        extraKmCharge,
        extraKmDriven,
        fuelCharge: finalFuelCharge,
        damageCharge,
        otherCharges,
        totalExtraCharges,
        outstandingBalance,
      };

      // Update contract with return inspection data
      await storage.updateContract(req.params.id, {
        odometerEnd,
        fuelLevelEnd,
        vehicleCondition,
      });

      // Complete the contract with charge data
      const completed = await storage.completeContract(req.params.id, userId, chargeData);
      
      // Update vehicle status to "available" after return
      await storage.updateVehicle(completed.vehicleId, { status: "available" });
      
      // Create audit log with calculation details
      await createAuditLog(userId, 'complete', completed.id, req, auditNote);
      
      res.json(completed);
    } catch (error: any) {
      console.error("Error completing contract:", error);
      res.status(400).json({ message: error.message || "Failed to complete contract" });
    }
  });

  // Close contract (completed → closed) - ADMIN ONLY with payment verification
  app.post('/api/contracts/:id/close', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // Verify contract is in completed status
      if (contract.status !== 'completed') {
        return res.status(400).json({ 
          message: "Contract must be in 'completed' status before closing" 
        });
      }

      // PAYMENT VERIFICATION: Query new payments table to verify settlement
      const contractPayments = await storage.getPaymentsByContract(contract.id);
      const totalPaid = contractPayments.reduce((sum: number, payment: any) => sum + parseFloat(payment.amount || '0'), 0);
      const totalAmount = parseFloat(contract.totalAmount || '0');
      const totalExtraCharges = parseFloat(contract.totalExtraCharges || '0');
      const totalDue = totalAmount + totalExtraCharges;
      
      // SECURITY FIX: Round to currency precision (2 decimals) to prevent floating point exploits
      const totalPaidRounded = Math.round(totalPaid * 100) / 100;
      const totalDueRounded = Math.round(totalDue * 100) / 100;
      const computedOutstanding = totalDueRounded - totalPaidRounded;
      
      // Block closing if there's any outstanding balance (using minimal threshold for precision)
      if (computedOutstanding > 0.001) { // 0.001 threshold ensures even 1 fils (0.01 AED/100) is caught
        return res.status(400).json({ 
          message: `Cannot close contract with outstanding balance of ${computedOutstanding.toFixed(2)} AED. Total due: ${totalDueRounded.toFixed(2)} AED, Total paid: ${totalPaidRounded.toFixed(2)} AED. Please record remaining payment first.` 
        });
      }

      // Note: Deposit handling (refund or retention) is at admin discretion
      // Admins may retain deposit for damages, extra charges, or other valid business reasons
      // The system trusts admin judgment on deposit resolution before closing

      const closed = await storage.closeContract(req.params.id, userId);
      
      // Ensure vehicle status is "available" after closing
      await storage.updateVehicle(closed.vehicleId, { status: "available" });
      
      // Create audit log
      await createAuditLog(userId, 'close', closed.id, req, `Closed contract #${closed.contractNumber} - all payments settled and verified`);
      
      res.json(closed);
    } catch (error: any) {
      console.error("Error closing contract:", error);
      res.status(400).json({ message: error.message || "Failed to close contract" });
    }
  });

  // LEGACY PAYMENT ROUTES - Backward compatibility wrappers using new payments table
  // These routes maintain compatibility with existing frontend code
  // They create payment records in the payments table with appropriate types
  
  // Record deposit payment
  app.post('/api/contracts/:id/deposit', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      const { method } = req.body;
      
      // Create payment record in payments table
      const payment = await storage.createPayment({
        contractId: contract.id,
        amount: contract.securityDeposit || '0',
        paymentMethod: method || 'cash',
        currency: 'SAR',
        notes: 'Deposit payment',
        paidAt: new Date(),
        createdBy: userId,
      } as any);
      
      await createAuditLog(userId, 'payment', contract.id, req, `Recorded deposit payment of ${contract.securityDeposit || '0'} SAR for contract #${contract.contractNumber}`);
      
      res.json(payment);
    } catch (error: any) {
      console.error("Error recording deposit:", error);
      res.status(400).json({ message: error.message || "Failed to record deposit" });
    }
  });
  
  // Record final payment
  app.post('/api/contracts/:id/final-payment', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      const { method } = req.body;
      
      // Calculate final payment amount (total amount + extra charges - already paid)
      const totalAmount = parseFloat(contract.totalAmount || '0');
      const totalExtraCharges = parseFloat(contract.totalExtraCharges || '0');
      const totalDue = totalAmount + totalExtraCharges;
      
      // Get existing payments
      const existingPayments = await storage.getPaymentsByContract(contract.id);
      const totalPaid = existingPayments.reduce((sum: number, p: any) => sum + parseFloat(p.amount || '0'), 0);
      
      const finalPaymentAmount = Math.max(0, totalDue - totalPaid);
      
      // Create payment record in payments table
      const payment = await storage.createPayment({
        contractId: contract.id,
        amount: finalPaymentAmount.toString(),
        paymentMethod: method || 'cash',
        currency: 'SAR',
        notes: 'Final payment',
        paidAt: new Date(),
        createdBy: userId,
      } as any);
      
      await createAuditLog(userId, 'payment', contract.id, req, `Recorded final payment of ${finalPaymentAmount.toFixed(2)} SAR for contract #${contract.contractNumber}`);
      
      res.json(payment);
    } catch (error: any) {
      console.error("Error recording final payment:", error);
      res.status(400).json({ message: error.message || "Failed to record final payment" });
    }
  });
  
  // Record deposit refund
  app.post('/api/contracts/:id/refund', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      const { method } = req.body;
      
      // Create negative payment record for refund
      const payment = await storage.createPayment({
        contractId: contract.id,
        amount: `-${contract.securityDeposit || '0'}`,
        paymentMethod: method || 'cash',
        currency: 'SAR',
        notes: 'Deposit refund',
        paidAt: new Date(),
        createdBy: userId,
      } as any);
      
      await createAuditLog(userId, 'payment', contract.id, req, `Refunded deposit of ${contract.securityDeposit || '0'} SAR for contract #${contract.contractNumber}`);
      
      res.json(payment);
    } catch (error: any) {
      console.error("Error recording refund:", error);
      res.status(400).json({ message: error.message || "Failed to record refund" });
    }
  });

  // Disable contract (Admin only)
  app.post('/api/contracts/:id/disable', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.disableContract(req.params.id, userId);
      
      // Create audit log
      await createAuditLog(userId, 'disable', contract.id, req, `Disabled contract #${contract.contractNumber}`);
      
      res.json(contract);
    } catch (error: any) {
      console.error("Error disabling contract:", error);
      res.status(400).json({ message: error.message || "Failed to disable contract" });
    }
  });

  // Enable contract (Admin only)
  app.post('/api/contracts/:id/enable', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.enableContract(req.params.id);
      
      // Create audit log
      await createAuditLog(userId, 'enable', contract.id, req, `Enabled contract #${contract.contractNumber}`);
      
      res.json(contract);
    } catch (error: any) {
      console.error("Error enabling contract:", error);
      res.status(400).json({ message: error.message || "Failed to enable contract" });
    }
  });

  // User management routes (Admin only)
  app.get('/api/users', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get single user by ID (any authenticated user can view user info for timeline/audit display)
  app.get('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Return user info without sensitive data
      const { passwordHash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch('/api/users/:id/role', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { role } = req.body;
      const adminId = req.user.id;
      
      if (!['admin', 'manager', 'staff', 'viewer'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const updated = await storage.updateUserRole(req.params.id, role);
      
      // Create audit log
      await createAuditLog(adminId, 'edit', undefined, req, `Changed user ${req.params.id} role to ${role}`);
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating user role:", error);
      res.status(400).json({ message: error.message || "Failed to update user role" });
    }
  });

  // Create user (Admin only)
  app.post('/api/users', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { username, password, email, firstName, lastName, role } = req.body;
      const adminId = req.user.id;

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const user = await storage.createUser({
        username,
        passwordHash,
        email,
        firstName,
        lastName,
        role: role || 'staff',
        isImmutable: false,
      });

      // Create audit log
      await createAuditLog(adminId, 'create', undefined, req, `Created user ${username} with role ${role}`);

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    } catch (error: any) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: error.message || "Failed to create user" });
    }
  });

  // Disable user (Admin only, cannot disable immutable users)
  app.post('/api/users/:id/disable', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const adminId = req.user.id;
      const user = await storage.disableUser(req.params.id, adminId);
      
      // Create audit log
      await createAuditLog(adminId, 'disable', undefined, req, `Disabled user ${user.username}`);
      
      res.json(user);
    } catch (error: any) {
      console.error("Error disabling user:", error);
      res.status(400).json({ message: error.message || "Failed to disable user" });
    }
  });

  // Enable user (Admin only)
  app.post('/api/users/:id/enable', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const adminId = req.user.id;
      const user = await storage.enableUser(req.params.id);
      
      // Create audit log
      await createAuditLog(adminId, 'enable', undefined, req, `Enabled user ${user.username}`);
      
      res.json(user);
    } catch (error: any) {
      console.error("Error enabling user:", error);
      res.status(400).json({ message: error.message || "Failed to enable user" });
    }
  });

  // Get disabled users (Admin only)
  app.get('/api/users/disabled', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const users = await storage.getDisabledUsers();
      res.json(users);
    } catch (error: any) {
      console.error("Error fetching disabled users:", error);
      res.status(500).json({ message: "Failed to fetch disabled users" });
    }
  });

  // Change password (authenticated users can change their own password)
  app.post('/api/users/change-password', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isValid = await verifyPassword(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Validate new password strength
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
      }

      // Hash and update password
      const passwordHash = await hashPassword(newPassword);
      await storage.updateUserPassword(userId, passwordHash);

      // Create audit log
      await createAuditLog(userId, 'edit', undefined, req, `Changed password`);

      res.json({ message: "Password changed successfully" });
    } catch (error: any) {
      console.error("Error changing password:", error);
      res.status(400).json({ message: error.message || "Failed to change password" });
    }
  });

  // Print contract audit logging
  app.post('/api/contracts/:id/print', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // Create audit log
      await createAuditLog(userId, 'print', contract.id, req, `Printed contract #${contract.contractNumber}`);
      
      res.json({ message: "Print action logged" });
    } catch (error: any) {
      console.error("Error logging print action:", error);
      res.status(400).json({ message: error.message || "Failed to log print action" });
    }
  });

  // Payment routes
  app.post('/api/contracts/:contractId/payments', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { contractId } = req.params;

      // Verify contract exists
      const contract = await storage.getContract(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // Validate and transform payment data using schema
      const validatedData = insertPaymentSchema.parse({
        ...req.body,
        contractId,
      });

      // Create payment
      const payment = await storage.createPayment({
        ...validatedData,
        createdBy: userId,
      } as any);

      // Create audit log
      await createAuditLog(userId, 'create', contractId, req, `Added payment of ${payment.amount} ${payment.currency} via ${payment.paymentMethod}`);

      res.json(payment);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating payment:", error);
      res.status(400).json({ message: error.message || "Failed to create payment" });
    }
  });

  app.get('/api/contracts/:contractId/payments', isAuthenticated, async (req: any, res) => {
    try {
      const { contractId } = req.params;
      const payments = await storage.getPaymentsByContract(contractId);
      res.json(payments);
    } catch (error: any) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: error.message || "Failed to fetch payments" });
    }
  });

  app.delete('/api/payments/:id', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Get payment info before deletion for audit log and verification
      const payment = await storage.getPaymentById(id);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      // Delete the payment
      await storage.deletePayment(id);

      // Create audit log with payment details
      await createAuditLog(userId, 'delete', payment.contractId, req, `Deleted payment of ${payment.amount} ${payment.currency} for contract`);

      res.json({ message: "Payment deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting payment:", error);
      res.status(400).json({ message: error.message || "Failed to delete payment" });
    }
  });

  // Audit log routes (Admin and Manager)
  app.get('/api/audit-logs', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const logs = await storage.getAllAuditLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  app.get('/api/audit-logs/recent', isAuthenticated, async (req: any, res) => {
    try {
      const logs = await storage.getRecentAuditLogs(10);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching recent audit logs:", error);
      res.status(500).json({ message: "Failed to fetch recent audit logs" });
    }
  });

  // System error routes (Admin only)
  app.get('/api/system-errors', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const errors = await storage.getAllSystemErrors();
      res.json(errors);
    } catch (error) {
      console.error("Error fetching system errors:", error);
      res.status(500).json({ message: "Failed to fetch system errors" });
    }
  });

  app.get('/api/system-errors/unacknowledged', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const errors = await storage.getUnacknowledgedSystemErrors();
      res.json(errors);
    } catch (error) {
      console.error("Error fetching unacknowledged system errors:", error);
      res.status(500).json({ message: "Failed to fetch unacknowledged system errors" });
    }
  });

  app.post('/api/system-errors/:id/acknowledge', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const error = await storage.acknowledgeSystemError(req.params.id, userId);
      
      await createAuditLog(
        userId,
        'acknowledge_error',
        undefined,
        req.ip,
        `Acknowledged system error ${error.id} (${error.errorType})`
      );
      
      res.json(error);
    } catch (error: any) {
      console.error("Error acknowledging system error:", error);
      res.status(400).json({ message: error.message || "Failed to acknowledge system error" });
    }
  });

  // Analytics routes (Admin and Manager)
  app.get('/api/analytics/revenue', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const analytics = await storage.getRevenueAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ message: "Failed to fetch revenue analytics" });
    }
  });

  app.get('/api/analytics/operations', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const analytics = await storage.getOperationalAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching operational analytics:", error);
      res.status(500).json({ message: "Failed to fetch operational analytics" });
    }
  });

  app.get('/api/analytics/customers', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const analytics = await storage.getCustomerAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching customer analytics:", error);
      res.status(500).json({ message: "Failed to fetch customer analytics" });
    }
  });

  // Reports routes (Admin and Manager) with date range support
  app.get('/api/reports/financial', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const report = await storage.getFinancialReport(startDate, endDate);
      res.json(report);
    } catch (error) {
      console.error("Error fetching financial report:", error);
      res.status(500).json({ message: "Failed to fetch financial report" });
    }
  });

  app.get('/api/reports/operational', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const report = await storage.getOperationalReport(startDate, endDate);
      res.json(report);
    } catch (error) {
      console.error("Error fetching operational report:", error);
      res.status(500).json({ message: "Failed to fetch operational report" });
    }
  });

  app.get('/api/reports/customers', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const report = await storage.getCustomerReport(startDate, endDate);
      res.json(report);
    } catch (error) {
      console.error("Error fetching customer report:", error);
      res.status(500).json({ message: "Failed to fetch customer report" });
    }
  });

  app.get('/api/reports/audit', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const report = await storage.getAuditReport(startDate, endDate);
      res.json(report);
    } catch (error) {
      console.error("Error fetching audit report:", error);
      res.status(500).json({ message: "Failed to fetch audit report" });
    }
  });

  // Export endpoints
  app.post('/api/reports/financial/export', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const { format: exportFormat, startDate: startDateParam, endDate: endDateParam, lang } = req.query;
      const { charts = [] } = req.body;
      const startDate = startDateParam ? new Date(startDateParam as string) : undefined;
      const endDate = endDateParam ? new Date(endDateParam as string) : undefined;
      const isRTL = lang === 'ar';
      
      const report = await storage.getFinancialReport(startDate, endDate);
      const settings = await storage.getCompanySettings();
      const currency = isRTL ? settings.currencyAr : settings.currencyEn;
      
      const { 
        createPDF, 
        addPDFSummarySection, 
        addPDFTable, 
        addPDFChartImages,
        createExcelWorkbook, 
        addExcelSheet,
        addExcelChartSheet,
        exportExcelToBuffer,
        formatCurrency,
        formatDate 
      } = await import('./utils/exportHelpers');

      if (exportFormat === 'pdf') {
        const doc = createPDF(
          'Financial Report',
          {
            nameEn: settings.companyNameEn,
            nameAr: settings.companyNameAr,
            phone: settings.phone || undefined,
            email: settings.email || undefined,
          },
          isRTL
        );

        // Add summary section
        let currentY = addPDFSummarySection(doc, 'Summary', [
          { label: 'Total Revenue', value: formatCurrency(report.summary.totalRevenue, currency) },
          { label: 'All-Time Revenue', value: formatCurrency(report.summary.allTimeRevenue, currency) },
          { label: 'Collection Rate', value: `${report.summary.collectionRate.toFixed(1)}%` },
          { label: 'Total Collected', value: formatCurrency(report.summary.totalCollected, currency) },
          { label: 'Outstanding', value: formatCurrency(report.summary.totalOutstanding, currency) },
        ], 55);

        // Add monthly breakdown table
        if (report.monthlyBreakdown.length > 0) {
          currentY += 5;
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('Monthly Breakdown', 14, currentY);
          
          const monthlyData = report.monthlyBreakdown.map(item => [
            item.month,
            formatCurrency(item.revenue, currency),
            item.contractCount.toString()
          ]);
          
          addPDFTable(doc, ['Month', 'Revenue', 'Contracts'], monthlyData, currentY + 5);
        }
        
        // Add charts if available
        if (charts && charts.length > 0) {
          addPDFChartImages(doc, charts, doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : currentY + 10);
        }

        // Send PDF
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="financial-report-${format(new Date(), 'yyyy-MM-dd')}.pdf"`);
        res.send(pdfBuffer);
      } else if (exportFormat === 'excel') {
        const wb = createExcelWorkbook();
        
        // Summary sheet
        const summaryData = [
          { Metric: 'Total Revenue', Value: report.summary.totalRevenue },
          { Metric: 'All-Time Revenue', Value: report.summary.allTimeRevenue },
          { Metric: 'Collection Rate (%)', Value: report.summary.collectionRate },
          { Metric: 'Total Collected', Value: report.summary.totalCollected },
          { Metric: 'Total Outstanding', Value: report.summary.totalOutstanding },
        ];
        addExcelSheet(wb, 'Summary', summaryData);
        
        // Monthly breakdown sheet
        const monthlyData = report.monthlyBreakdown.map(item => ({
          Month: item.month,
          Revenue: item.revenue,
          'Contract Count': item.contractCount
        }));
        addExcelSheet(wb, 'Monthly Breakdown', monthlyData);
        
        // Recent payments sheet
        const paymentsData = report.recentPayments.map(p => ({
          'Contract Number': p.contractNumber,
          Amount: p.amount,
          Method: p.method,
          Date: formatDate(p.date)
        }));
        addExcelSheet(wb, 'Recent Payments', paymentsData);
        
        // Outstanding payments sheet
        const outstandingData = report.outstandingPayments.map(p => ({
          'Contract Number': p.contractNumber,
          Customer: p.customerName,
          'Total Amount': p.totalAmount,
          Collected: p.collected,
          Outstanding: p.outstanding,
          Status: p.status,
          'Due Date': formatDate(p.dueDate)
        }));
        addExcelSheet(wb, 'Outstanding Payments', outstandingData);
        
        // Add charts sheet if available
        if (charts && charts.length > 0) {
          addExcelChartSheet(wb, charts);
        }
        
        const buffer = exportExcelToBuffer(wb);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="financial-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx"`);
        res.send(buffer);
      } else {
        res.status(400).json({ message: 'Invalid export format. Use "pdf" or "excel".' });
      }
    } catch (error) {
      console.error("Error exporting financial report:", error);
      res.status(500).json({ message: "Failed to export financial report" });
    }
  });

  app.post('/api/reports/operational/export', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const { format: exportFormat, startDate: startDateParam, endDate: endDateParam, lang } = req.query;
      const { charts = [] } = req.body;
      const startDate = startDateParam ? new Date(startDateParam as string) : undefined;
      const endDate = endDateParam ? new Date(endDateParam as string) : undefined;
      const isRTL = lang === 'ar';
      
      const report = await storage.getOperationalReport(startDate, endDate);
      const settings = await storage.getCompanySettings();
      
      const { 
        createPDF, 
        addPDFSummarySection, 
        addPDFTable,
        addPDFChartImages,
        createExcelWorkbook, 
        addExcelSheet,
        addExcelChartSheet,
        exportExcelToBuffer,
        formatPercentage
      } = await import('./utils/exportHelpers');

      if (exportFormat === 'pdf') {
        const doc = createPDF(
          'Operational Report',
          {
            nameEn: settings.companyNameEn,
            nameAr: settings.companyNameAr,
            phone: settings.phone || undefined,
            email: settings.email || undefined,
          },
          isRTL
        );

        // Add summary section
        let currentY = addPDFSummarySection(doc, 'Summary', [
          { label: 'Total Vehicles', value: report.utilization.totalVehicles.toString() },
          { label: 'Active Vehicles', value: report.utilization.activeVehicles.toString() },
          { label: 'Utilization Rate', value: formatPercentage(report.utilization.utilizationRate) },
        ], 55);

        // Add vehicle stats table
        if (report.vehicleStats.length > 0) {
          currentY += 5;
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('Vehicle Statistics', 14, currentY);
          
          const statsData = report.vehicleStats.slice(0, 15).map((item: any) => [
            item.registration || 'N/A',
            `${item.make} ${item.model}`,
            item.contractCount.toString(),
            item.totalDays.toString(),
            item.isActive ? 'Rented' : 'Available'
          ]);
          
          addPDFTable(doc, ['Registration', 'Vehicle', 'Contracts', 'Total Days', 'Status'], statsData, currentY + 5);
        }

        // Add charts if provided
        if (charts && charts.length > 0) {
          addPDFChartImages(doc, charts, doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : currentY + 10);
        }

        // Send PDF
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="operational-report-${format(new Date(), 'yyyy-MM-dd')}.pdf"`);
        res.send(pdfBuffer);
      } else if (exportFormat === 'excel') {
        const wb = createExcelWorkbook();
        
        // Summary sheet
        const summaryData = [
          { Metric: 'Total Vehicles', Value: report.utilization.totalVehicles },
          { Metric: 'Active Vehicles', Value: report.utilization.activeVehicles },
          { Metric: 'Utilization Rate (%)', Value: report.utilization.utilizationRate },
        ];
        addExcelSheet(wb, 'Summary', summaryData);
        
        // Vehicle stats sheet
        const statsData = report.vehicleStats.map((item: any) => ({
          Registration: item.registration || 'N/A',
          Make: item.make,
          Model: item.model,
          'Contract Count': item.contractCount,
          'Total Revenue': item.totalRevenue,
          'Total Days': item.totalDays,
          Status: item.isActive ? 'Rented' : 'Available'
        }));
        addExcelSheet(wb, 'Vehicle Statistics', statsData);
        
        // Contract status sheet
        const statusData = [
          { Status: 'Draft', Count: report.statusSummary.draft },
          { Status: 'Confirmed', Count: report.statusSummary.confirmed },
          { Status: 'Active', Count: report.statusSummary.active },
          { Status: 'Completed', Count: report.statusSummary.completed },
          { Status: 'Closed', Count: report.statusSummary.closed },
        ];
        addExcelSheet(wb, 'Contract Status', statusData);
        
        // Add charts sheet if available
        if (charts && charts.length > 0) {
          addExcelChartSheet(wb, charts);
        }
        
        const buffer = exportExcelToBuffer(wb);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="operational-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx"`);
        res.send(buffer);
      } else {
        res.status(400).json({ message: 'Invalid export format. Use "pdf" or "excel".' });
      }
    } catch (error) {
      console.error("Error exporting operational report:", error);
      res.status(500).json({ message: "Failed to export operational report" });
    }
  });

  app.post('/api/reports/customers/export', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const { format: exportFormat, startDate: startDateParam, endDate: endDateParam, lang } = req.query;
      const { charts = [] } = req.body;
      const startDate = startDateParam ? new Date(startDateParam as string) : undefined;
      const endDate = endDateParam ? new Date(endDateParam as string) : undefined;
      const isRTL = lang === 'ar';
      
      const report = await storage.getCustomerReport(startDate, endDate);
      const settings = await storage.getCompanySettings();
      const currency = isRTL ? settings.currencyAr : settings.currencyEn;
      
      const { 
        createPDF, 
        addPDFTable,
        addPDFChartImages,
        createExcelWorkbook, 
        addExcelSheet,
        addExcelChartSheet,
        exportExcelToBuffer,
        formatCurrency,
        formatDate
      } = await import('./utils/exportHelpers');

      if (exportFormat === 'pdf') {
        const doc = createPDF(
          'Customer Report',
          {
            nameEn: settings.companyNameEn,
            nameAr: settings.companyNameAr,
            phone: settings.phone || undefined,
            email: settings.email || undefined,
          },
          isRTL
        );

        let currentY = 55;

        // Top customers table
        if (report.customerActivity.length > 0) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('Top Customers by Revenue', 14, currentY);
          
          const topCustomers = report.customerActivity.slice(0, 10);
          const customerData = topCustomers.map(item => [
            item.nameEn || item.nameAr || 'N/A',
            item.contractCount.toString(),
            formatCurrency(item.totalRevenue, currency),
            item.totalDays.toString(),
            formatDate(item.lastRental)
          ]);
          
          addPDFTable(doc, ['Customer', 'Contracts', 'Revenue', 'Days', 'Last Rental'], customerData, currentY + 5);
        }

        // Add charts if provided
        if (charts && charts.length > 0) {
          addPDFChartImages(doc, charts, doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : currentY + 10);
        }

        // Send PDF
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="customer-report-${format(new Date(), 'yyyy-MM-dd')}.pdf"`);
        res.send(pdfBuffer);
      } else if (exportFormat === 'excel') {
        const wb = createExcelWorkbook();
        
        // Customer activity sheet
        const activityData = report.customerActivity.map(item => ({
          Customer: item.nameEn || item.nameAr || 'N/A',
          'Contract Count': item.contractCount,
          'Total Revenue': item.totalRevenue,
          'Total Days': item.totalDays,
          'Last Rental': formatDate(item.lastRental)
        }));
        addExcelSheet(wb, 'Customer Activity', activityData);
        
        // Repeat customers sheet
        const repeatData = report.repeatCustomers.map(item => ({
          Customer: item.nameEn || item.nameAr || 'N/A',
          'Contract Count': item.contractCount,
          'Total Revenue': item.totalRevenue,
          'Total Days': item.totalDays,
          'Last Rental': formatDate(item.lastRental)
        }));
        addExcelSheet(wb, 'Repeat Customers', repeatData);
        
        // New customers sheet
        const newData = report.newCustomers.map(item => ({
          Customer: item.nameEn || item.nameAr || 'N/A',
          'Contract Count': item.contractCount,
          'Total Revenue': item.totalRevenue,
          'Total Days': item.totalDays,
          'First Rental': formatDate(item.lastRental)
        }));
        addExcelSheet(wb, 'New Customers', newData);
        
        // Add charts sheet if available
        if (charts && charts.length > 0) {
          addExcelChartSheet(wb, charts);
        }
        
        const buffer = exportExcelToBuffer(wb);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="customer-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx"`);
        res.send(buffer);
      } else {
        res.status(400).json({ message: 'Invalid export format. Use "pdf" or "excel".' });
      }
    } catch (error) {
      console.error("Error exporting customer report:", error);
      res.status(500).json({ message: "Failed to export customer report" });
    }
  });

  app.get('/api/reports/audit/export', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const { format: exportFormat, startDate: startDateParam, endDate: endDateParam, lang } = req.query;
      const startDate = startDateParam ? new Date(startDateParam as string) : undefined;
      const endDate = endDateParam ? new Date(endDateParam as string) : undefined;
      const isRTL = lang === 'ar';
      
      const report = await storage.getAuditReport(startDate, endDate);
      const settings = await storage.getCompanySettings();
      
      const { 
        createPDF, 
        addPDFTable, 
        createExcelWorkbook, 
        addExcelSheet, 
        exportExcelToBuffer,
        formatDate
      } = await import('./utils/exportHelpers');

      if (exportFormat === 'pdf') {
        const doc = createPDF(
          'Audit Report',
          {
            nameEn: settings.companyNameEn,
            nameAr: settings.companyNameAr,
            phone: settings.phone || undefined,
            email: settings.email || undefined,
          },
          isRTL
        );

        let currentY = 55;

        // Audit modifications table
        if (report.modifications.length > 0) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('Contract Modifications', 14, currentY);
          
          const topModifications = report.modifications.slice(0, 30); // Limit to 30 for PDF
          const modificationsData = topModifications.map((item: any) => [
            formatDate(item.editedAt),
            item.editorUsername || 'Unknown',
            item.fieldName || '',
            item.reason?.substring(0, 30) || ''
          ]);
          
          addPDFTable(doc, ['Date', 'User', 'Field', 'Reason'], modificationsData, currentY + 5);
        }

        // Send PDF
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="audit-report-${format(new Date(), 'yyyy-MM-dd')}.pdf"`);
        res.send(pdfBuffer);
      } else if (exportFormat === 'excel') {
        const wb = createExcelWorkbook();
        
        // Modifications sheet
        const modificationsData = report.modifications.map((item: any) => ({
          Date: formatDate(item.editedAt),
          User: item.editorUsername || 'Unknown',
          'Contract ID': item.contractId,
          Field: item.fieldName || '',
          'Old Value': item.oldValue?.substring(0, 50) || '',
          'New Value': item.newValue?.substring(0, 50) || '',
          Reason: item.reason || '',
          'IP Address': item.ipAddress || 'N/A'
        }));
        addExcelSheet(wb, 'Modifications', modificationsData);
        
        // User activity sheet
        const userActivityData = report.userActivity.map((item: any) => ({
          User: item.userName,
          'Modifications': item.modificationCount,
          'Contracts Modified': item.contractsModified
        }));
        addExcelSheet(wb, 'User Activity', userActivityData);
        
        const buffer = exportExcelToBuffer(wb);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="audit-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx"`);
        res.send(buffer);
      } else {
        res.status(400).json({ message: 'Invalid export format. Use "pdf" or "excel".' });
      }
    } catch (error) {
      console.error("Error exporting audit report:", error);
      res.status(500).json({ message: "Failed to export audit report" });
    }
  });

  // Company settings routes (Admin only)
  app.get('/api/settings', isAuthenticated, async (req: any, res) => {
    try {
      const settings = await storage.getCompanySettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching company settings:", error);
      res.status(500).json({ message: "Failed to fetch company settings" });
    }
  });

  app.put('/api/settings', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Validate request body
      const validatedData = insertCompanySettingsSchema.parse(req.body);
      
      const settings = await storage.updateCompanySettings(validatedData, userId);
      
      // Create audit log
      await createAuditLog(
        userId,
        'update_settings',
        undefined,
        req.ip,
        'Updated company settings'
      );
      
      res.json(settings);
    } catch (error: any) {
      console.error("Error updating company settings:", error);
      res.status(400).json({ message: error.message || "Failed to update company settings" });
    }
  });

  // Financial Settings routes (subset of company settings)
  app.get('/api/settings/financial', isAuthenticated, async (req: any, res) => {
    try {
      const settings = await storage.getCompanySettings();
      
      // Return only financial-related fields
      const financialSettings = {
        defaultDailyRate: settings.defaultDailyRate,
        defaultWeeklyRate: settings.defaultWeeklyRate,
        defaultMonthlyRate: settings.defaultMonthlyRate,
        insurancePerDay: settings.insurancePerDay,
        gpsPerDay: settings.gpsPerDay,
        babySeatPerDay: settings.babySeatPerDay,
        additionalDriverFee: settings.additionalDriverFee,
        defaultExtraKmRate: settings.defaultExtraKmRate,
        defaultSecurityDeposit: settings.defaultSecurityDeposit,
        petrolPricePerLiter: settings.petrolPricePerLiter,
        dieselPricePerLiter: settings.dieselPricePerLiter,
        vatPercentage: settings.vatPercentage,
        currencyEn: settings.currencyEn,
        currencyAr: settings.currencyAr,
      };
      
      res.json(financialSettings);
    } catch (error) {
      console.error("Error fetching financial settings:", error);
      res.status(500).json({ message: "Failed to fetch financial settings" });
    }
  });

  app.put('/api/settings/financial', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get current settings first
      const currentSettings = await storage.getCompanySettings();
      
      // Merge financial updates with current settings
      const updatedSettings = {
        ...currentSettings,
        ...req.body, // Only financial fields should be in req.body
      };
      
      // Validate and update
      const validatedData = insertCompanySettingsSchema.parse(updatedSettings);
      const settings = await storage.updateCompanySettings(validatedData, userId);
      
      // Create audit log
      await createAuditLog(
        userId,
        'update_settings',
        undefined,
        req.ip,
        'Updated financial settings'
      );
      
      res.json(settings);
    } catch (error: any) {
      console.error("Error updating financial settings:", error);
      res.status(400).json({ message: error.message || "Failed to update financial settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
