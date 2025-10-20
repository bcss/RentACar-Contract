import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, requireAdmin, requireManagerOrAdmin } from "./auth/localAuth";
import { insertContractSchema, insertUserSchema, insertCompanySettingsSchema, insertCustomerSchema, insertVehicleSchema, insertPersonSchema, insertCompanySchema, type Customer, type Vehicle, type Person, type Company } from "@shared/schema";
import { hashPassword, verifyPassword, validatePasswordStrength } from "./auth/passwordUtils";
import { seedSuperAdmin } from "./auth/seedSuperAdmin";
import { seedCompanySettings } from "./seedCompanySettings";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Seed super admin on startup
  await seedSuperAdmin();
  
  // Seed company settings on startup
  await seedCompanySettings();

  // Helper function to create audit log
  async function createAuditLog(userId: string, action: string, contractId?: string, ipAddress?: string, details?: string) {
    try {
      await storage.createAuditLog({
        userId,
        action,
        contractId,
        ipAddress,
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
      
      await createAuditLog(req.user!.id, "create_customer", undefined, req.ip, `Created customer: ${customer.nameEn}`);
      
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
      
      await createAuditLog(req.user!.id, "update_customer", undefined, req.ip, `Updated customer: ${customer.nameEn}`);
      
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
      
      await createAuditLog(req.user!.id, "disable_customer", undefined, req.ip, `Disabled customer: ${req.params.id}`);
      
      res.json({ message: "Customer disabled successfully" });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to disable customer" });
    }
  });

  app.post("/api/customers/:id/enable", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      await storage.enableCustomer(req.params.id);
      
      await createAuditLog(req.user!.id, "enable_customer", undefined, req.ip, `Enabled customer: ${req.params.id}`);
      
      res.json({ message: "Customer enabled successfully" });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to enable customer" });
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
      
      await createAuditLog(req.user!.id, "create_vehicle", undefined, req.ip, `Created vehicle: ${vehicle.registration}`);
      
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
      
      await createAuditLog(req.user!.id, "update_vehicle", undefined, req.ip, `Updated vehicle: ${vehicle.registration}`);
      
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
      
      await createAuditLog(req.user!.id, "disable_vehicle", undefined, req.ip, `Disabled vehicle: ${req.params.id}`);
      
      res.json({ message: "Vehicle disabled successfully" });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to disable vehicle" });
    }
  });

  app.post("/api/vehicles/:id/enable", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      await storage.enableVehicle(req.params.id);
      
      await createAuditLog(req.user!.id, "enable_vehicle", undefined, req.ip, `Enabled vehicle: ${req.params.id}`);
      
      res.json({ message: "Vehicle enabled successfully" });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to enable vehicle" });
    }
  });

  // Person routes (sponsors/drivers)
  app.get("/api/persons", isAuthenticated, async (req: any, res) => {
    try {
      const disabledParam = req.query.disabled;
      let persons: Person[];
      
      if (disabledParam === 'true') {
        // Get only disabled persons
        persons = await storage.getPersons(true);
        persons = persons.filter(p => p.disabled);
      } else if (disabledParam === 'false') {
        // Get only active persons
        persons = await storage.getPersons(false);
      } else {
        // Get all persons (for backward compatibility)
        persons = await storage.getPersons(true);
      }
      
      res.json(persons);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch persons" });
    }
  });

  app.get("/api/persons/search", isAuthenticated, async (req: any, res) => {
    try {
      const query = req.query.q as string || '';
      const persons = await storage.searchPersons(query);
      res.json(persons);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to search persons" });
    }
  });

  app.get("/api/persons/:id", isAuthenticated, async (req: any, res) => {
    try {
      const person = await storage.getPersonById(req.params.id);
      if (!person) {
        return res.status(404).json({ message: "Person not found" });
      }
      res.json(person);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch person" });
    }
  });

  app.post("/api/persons", isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const personData = insertPersonSchema.parse(req.body);
      const person = await storage.createPerson({
        ...personData,
        createdBy: req.user!.id,
      } as any);
      
      await createAuditLog(req.user!.id, "create_person", undefined, req.ip, `Created person: ${person.nameEn}`);
      
      res.status(201).json(person);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to create person" });
    }
  });

  app.patch("/api/persons/:id", isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const personData = insertPersonSchema.partial().parse(req.body);
      const person = await storage.updatePerson(req.params.id, personData);
      
      await createAuditLog(req.user!.id, "update_person", undefined, req.ip, `Updated person: ${person.nameEn}`);
      
      res.json(person);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update person" });
    }
  });

  app.post("/api/persons/:id/disable", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      await storage.disablePerson(req.params.id, req.user!.id);
      
      await createAuditLog(req.user!.id, "disable_person", undefined, req.ip, `Disabled person: ${req.params.id}`);
      
      res.json({ message: "Person disabled successfully" });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to disable person" });
    }
  });

  app.post("/api/persons/:id/enable", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      await storage.enablePerson(req.params.id);
      
      await createAuditLog(req.user!.id, "enable_person", undefined, req.ip, `Enabled person: ${req.params.id}`);
      
      res.json({ message: "Person enabled successfully" });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to enable person" });
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
      
      await createAuditLog(req.user!.id, "create_company", undefined, req.ip, `Created company: ${company.nameEn}`);
      
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
      
      await createAuditLog(req.user!.id, "update_company", undefined, req.ip, `Updated company: ${company.nameEn}`);
      
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
      
      await createAuditLog(req.user!.id, "disable_company", undefined, req.ip, `Disabled company: ${req.params.id}`);
      
      res.json({ message: "Company disabled successfully" });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to disable company" });
    }
  });

  app.patch("/api/companies/:id/enable", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      await storage.enableCompany(req.params.id);
      
      await createAuditLog(req.user!.id, "enable_company", undefined, req.ip, `Enabled company: ${req.params.id}`);
      
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
      
      res.json(contract);
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
      await createAuditLog(userId, 'create', contract.id, req.ip, `Created contract #${contract.contractNumber}`);
      
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
      await createAuditLog(userId, 'edit', updated.id, req.ip, `Updated contract #${updated.contractNumber} - Reason: ${editReason.trim()}`);
      
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

      const confirmed = await storage.confirmContract(req.params.id, userId);
      
      // Create audit log
      await createAuditLog(userId, 'confirm', confirmed.id, req.ip, `Confirmed contract #${confirmed.contractNumber}`);
      
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

      const activated = await storage.activateContract(req.params.id, userId);
      
      // Create audit log
      await createAuditLog(userId, 'activate', activated.id, req.ip, `Activated contract #${activated.contractNumber} - vehicle handed over`);
      
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

      const { odometerEnd, fuelLevelEnd, vehicleCondition, extraKmCharge, fuelCharge, damageCharge, otherCharges, totalExtraCharges, outstandingBalance, extraKmDriven } = req.body;
      
      // Prepare charge data
      const chargeData = {
        extraKmCharge,
        extraKmDriven,
        fuelCharge,
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
      
      // Create audit log
      await createAuditLog(userId, 'complete', completed.id, req.ip, `Completed contract #${completed.contractNumber} - vehicle returned`);
      
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

      // Verify all payments are settled
      const outstandingBalance = parseFloat(contract.outstandingBalance || '0');
      if (outstandingBalance > 0 && !contract.finalPaymentReceived) {
        return res.status(400).json({ 
          message: `Cannot close contract with outstanding balance of ${outstandingBalance}. Please record final payment first.` 
        });
      }

      // Note: Deposit handling (refund or retention) is at admin discretion
      // Admins may retain deposit for damages, extra charges, or other valid business reasons
      // The system trusts admin judgment on deposit resolution before closing

      const closed = await storage.closeContract(req.params.id, userId);
      
      // Create audit log
      await createAuditLog(userId, 'close', closed.id, req.ip, `Closed contract #${closed.contractNumber} - all payments settled and verified`);
      
      res.json(closed);
    } catch (error: any) {
      console.error("Error closing contract:", error);
      res.status(400).json({ message: error.message || "Failed to close contract" });
    }
  });

  // Phase 2: Payment recording routes (Admin/Manager only)
  
  // Record deposit payment
  app.post('/api/contracts/:id/deposit', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      const { method } = req.body;
      
      if (!method) {
        return res.status(400).json({ message: "Payment method is required" });
      }

      const updated = await storage.recordDepositPayment(req.params.id, method);
      
      // Create audit log
      await createAuditLog(userId, 'payment', updated.id, req.ip, `Recorded deposit payment for contract #${updated.contractNumber} via ${method}`);
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error recording deposit payment:", error);
      res.status(400).json({ message: error.message || "Failed to record deposit payment" });
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
      
      if (!method) {
        return res.status(400).json({ message: "Payment method is required" });
      }

      const updated = await storage.recordFinalPayment(req.params.id, method);
      
      // Create audit log
      await createAuditLog(userId, 'payment', updated.id, req.ip, `Recorded final payment for contract #${updated.contractNumber} via ${method}`);
      
      res.json(updated);
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

      const updated = await storage.recordDepositRefund(req.params.id);
      
      // Create audit log
      await createAuditLog(userId, 'refund', updated.id, req.ip, `Refunded deposit for contract #${updated.contractNumber}`);
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error recording deposit refund:", error);
      res.status(400).json({ message: error.message || "Failed to record deposit refund" });
    }
  });

  // Disable contract (Admin only)
  app.post('/api/contracts/:id/disable', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.disableContract(req.params.id, userId);
      
      // Create audit log
      await createAuditLog(userId, 'disable', contract.id, req.ip, `Disabled contract #${contract.contractNumber}`);
      
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
      await createAuditLog(userId, 'enable', contract.id, req.ip, `Enabled contract #${contract.contractNumber}`);
      
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
      await createAuditLog(adminId, 'edit', undefined, req.ip, `Changed user ${req.params.id} role to ${role}`);
      
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
      await createAuditLog(adminId, 'create', undefined, req.ip, `Created user ${username} with role ${role}`);

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
      await createAuditLog(adminId, 'disable', undefined, req.ip, `Disabled user ${user.username}`);
      
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
      await createAuditLog(adminId, 'enable', undefined, req.ip, `Enabled user ${user.username}`);
      
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
      await createAuditLog(userId, 'edit', undefined, req.ip, `Changed password`);

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
      await createAuditLog(userId, 'print', contract.id, req.ip, `Printed contract #${contract.contractNumber}`);
      
      res.json({ message: "Print action logged" });
    } catch (error: any) {
      console.error("Error logging print action:", error);
      res.status(400).json({ message: error.message || "Failed to log print action" });
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

  const httpServer = createServer(app);
  return httpServer;
}
