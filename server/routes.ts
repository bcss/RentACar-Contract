import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { setupAuth, isAuthenticated, requireAdmin, requireManagerOrAdmin, requireEditor, requireReportsAccess, requireContractCloseAccess, requireAppAccessReportAccess } from "./auth/localAuth";
import { insertContractSchema, insertUserSchema, insertCompanySettingsSchema, insertCustomerSchema, insertVehicleSchema, insertSponsorSchema, insertCompanySchema, insertPaymentSchema, insertVehicleInspectionSchema, insertInsuranceClaimSchema, insertRenewalRequestSchema, insertDocumentApprovalSchema, insertSupportTicketSchema, insertPushNotificationTokenSchema, insertBranchSchema, insertBranchTransferSchema, insertPublicHolidaySchema, insertDriverOutsourceCompanySchema, insertDriverSchema, insertDriverRateCardSchema, insertDriverScheduleBlockSchema, insertDriverAssignmentSchema, passwordSchema, type Customer, type Vehicle, type Sponsor, type Company, type User, vehicleInspections } from "@shared/schema";
import { count, sql } from "drizzle-orm";
import { hashPassword, verifyPassword, validatePasswordStrength } from "./auth/passwordUtils";
import { seedSuperAdmin } from "./auth/seedSuperAdmin";
import { seedCompanySettings } from "./seedCompanySettings";
import { sanitizeRequestData } from "./index";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { getGeolocation } from "./services/geolocation";
import { validateEditReason } from "./utils/validation";
import { calculateContractDriverCosts } from "./utils/driverCostCalculator";
import { format } from "date-fns";
import os from "os";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { csrfTokenGenerator, csrfProtection } from "./middleware/csrf";
import {
  parseCSV,
  parseJSON,
  validateWithSchema,
  customerImportSchema,
  vehicleImportSchema,
  sponsorImportSchema,
  companyImportSchema,
  contractImportSchema,
  checkDuplicatesInArray,
  formatValidationErrors,
  type ValidationError,
} from './importHelpers';

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

  // Helper function to log system errors to database
  async function logSystemError(error: any, req: Request, additionalContext?: Record<string, any>) {
    try {
      const userId = (req as any).user?.id;
      await storage.createSystemError({
        errorType: error.name || "UnknownError",
        errorMessage: error.message || "An unknown error occurred",
        errorStack: error.stack,
        userId: userId,
        endpoint: req.path,
        method: req.method,
        ipAddress: req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        additionalData: JSON.stringify({
          body: sanitizeRequestData(req.body),
          query: sanitizeRequestData(req.query),
          params: sanitizeRequestData(req.params),
          // Sanitize additional context to prevent bypass
          ...(additionalContext ? sanitizeRequestData(additionalContext) : {}),
        }),
      });
    } catch (dbError) {
      // If database logging fails, log to console only
      console.error("Failed to log error to database:", dbError);
    }
  }

  // SECURITY FIX 2: Helper function to validate financial inputs
  function validateFinancialInput(value: any, fieldName: string): number {
    const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
    if (!Number.isFinite(parsed)) {
      throw new Error(`Invalid ${fieldName}: must be a valid number`);
    }
    return parsed;
  }

  // P0-1: Server-side file upload validation for vehicle inspection photos
  function validateInspectionPhotos(photos: any[]): { valid: boolean; error?: string } {
    if (!Array.isArray(photos)) {
      return { valid: false, error: "Photos must be an array" };
    }
    
    for (const photo of photos) {
      if (!photo || typeof photo !== 'object') {
        return { valid: false, error: "Invalid photo object" };
      }
      
      if (!photo.data || typeof photo.data !== 'string') {
        return { valid: false, error: "Photo data must be a string" };
      }
      
      // 1. Check base64 size (10MB decoded = ~13.7MB in base64)
      const base64Size = photo.data.length * 0.75; // Approximate decoded size
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (base64Size > maxSize) {
        return { valid: false, error: `Photo ${photo.angle || 'unknown'} exceeds 10MB limit` };
      }
      
      // 2. Verify base64 format and image header
      if (!photo.data.startsWith('data:image/')) {
        return { valid: false, error: `Invalid image format for ${photo.angle || 'unknown'}` };
      }
      
      // 3. Check for valid JPEG/PNG/JPG
      const validFormats = ['data:image/jpeg', 'data:image/png', 'data:image/jpg'];
      const isValid = validFormats.some(format => photo.data.startsWith(format));
      if (!isValid) {
        return { valid: false, error: `${photo.angle || 'Photo'} must be JPEG or PNG format` };
      }
    }
    
    return { valid: true };
  }

  // P0-3: Query parameter validation functions
  const MAX_PAGE_SIZE = 1000;
  const MAX_SEARCH_LENGTH = 200;
  
  function validatePaginationParams(query: any): { limit: number; offset: number; error?: string } {
    let limit = 100; // default
    let offset = 0; // default
    
    if (query.limit !== undefined) {
      const parsedLimit = parseInt(query.limit, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return { limit: 0, offset: 0, error: "Invalid limit: must be a positive integer" };
      }
      if (parsedLimit > MAX_PAGE_SIZE) {
        return { limit: 0, offset: 0, error: `Limit cannot exceed ${MAX_PAGE_SIZE}` };
      }
      limit = parsedLimit;
    }
    
    if (query.offset !== undefined) {
      const parsedOffset = parseInt(query.offset, 10);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return { limit: 0, offset: 0, error: "Invalid offset: must be a non-negative integer" };
      }
      offset = parsedOffset;
    }
    
    return { limit, offset };
  }
  
  function validateSearchQuery(query: string | undefined): { valid: boolean; error?: string } {
    if (!query) return { valid: true };
    
    if (query.length > MAX_SEARCH_LENGTH) {
      return { valid: false, error: `Search query cannot exceed ${MAX_SEARCH_LENGTH} characters` };
    }
    
    return { valid: true };
  }
  
  // P1-3: Enum validation for status fields (combined with P0-3)
  const VALID_CONTRACT_STATUSES = ['draft', 'active', 'completed', 'closed'];
  const VALID_VEHICLE_STATUSES = ['available', 'rented', 'maintenance', 'damaged'];
  const VALID_CLAIM_STATUSES = ['pending', 'approved', 'rejected', 'settled'];
  
  function validateStatus(status: any, validStatuses: string[], fieldName: string): { valid: boolean; error?: string } {
    if (!status) return { valid: true };
    
    if (!validStatuses.includes(status)) {
      return { 
        valid: false, 
        error: `Invalid ${fieldName}: must be one of ${validStatuses.join(', ')}` 
      };
    }
    
    return { valid: true };
  }
  
  // Superadmin-only middleware for import operations
  function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = req.user as User;
    if (user.role !== 'admin' || !user.isImmutable) {
      return res.status(403).json({ message: 'Forbidden: Superadmin access required' });
    }
    next();
  }
  
  // P0-4: Date range validation for reports
  const MAX_DATE_RANGE_DAYS = 730; // 2 years
  
  function validateDateRange(startDateParam: any, endDateParam: any): { 
    startDate?: Date; 
    endDate?: Date; 
    error?: string 
  } {
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    
    if (startDateParam) {
      startDate = new Date(startDateParam as string);
      if (isNaN(startDate.getTime())) {
        return { error: "Invalid start date format" };
      }
    }
    
    if (endDateParam) {
      endDate = new Date(endDateParam as string);
      if (isNaN(endDate.getTime())) {
        return { error: "Invalid end date format" };
      }
    }
    
    if (startDate && endDate) {
      if (endDate < startDate) {
        return { error: "End date must be after start date" };
      }
      
      const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > MAX_DATE_RANGE_DAYS) {
        return { error: `Date range cannot exceed ${MAX_DATE_RANGE_DAYS} days (${Math.floor(MAX_DATE_RANGE_DAYS/365)} years)` };
      }
    }
    
    return { startDate, endDate };
  }

  // SECURITY FIX 3: Middleware to block mobile customer endpoints until customer authentication is implemented
  // These endpoints are PREP work for Phase 3 mobile apps and require customer auth to function securely
  const requireCustomerAuth = (req: any, res: any, next: any) => {
    // PRODUCTION BLOCKER: Customer authentication not yet implemented
    // These endpoints require one of:
    // 1. JWT authentication with customer claims
    // 2. Session-based customer authentication
    // 3. OAuth/OIDC customer authentication
    
    return res.status(501).json({ 
      error: "Not Implemented",
      message: "Customer authentication required. These endpoints are part of Phase 3 mobile app preparation and cannot be used in production until customer authentication is implemented.",
      documentation: "Contact system administrator to enable customer authentication before using mobile customer APIs."
    });
  };
  
  // Helper function for when customer auth IS implemented:
  // async function verifyCustomerOwnership(req: any, customerId: string): Promise<boolean> {
  //   // Extract authenticated customerId from session/JWT
  //   const authenticatedCustomerId = req.user?.customerId || req.customer?.id;
  //   
  //   if (!authenticatedCustomerId) {
  //     return false; // Not authenticated as customer
  //   }
  //   
  //   if (authenticatedCustomerId !== customerId) {
  //     return false; // Trying to access another customer's data
  //   }
  //   
  //   return true; // Ownership verified
  // }

  // P0-3: CSRF Protection - Token generation endpoint (PUBLIC - no authentication required)
  // This endpoint MUST be accessible before authentication to obtain CSRF token
  // The token is then included in all subsequent state-changing requests
  app.get('/api/csrf-token', csrfTokenGenerator);

  // P0-3: Apply CSRF protection to all state-changing endpoints AFTER this point
  // This middleware validates CSRF tokens on POST/PATCH/DELETE/PUT requests
  // Skip paths: /api/login, /api/csrf-token, /api/system-errors/log
  app.use(csrfProtection);

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
      await logSystemError(error, req);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // System health endpoint
  app.get('/api/system/health', isAuthenticated, async (req: any, res) => {
    try {
      // Get version from package.json
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));
      const appVersion = packageJson.version || '1.0.0';

      // Check database health
      let dbStatus = 'healthy';
      let dbMessage = 'Database connection is healthy';
      
      try {
        // Simple health check - try to fetch a count
        const users = await storage.getAllUsers();
        if (!users) {
          dbStatus = 'error';
          dbMessage = 'Failed to query database';
        }
      } catch (dbError) {
        dbStatus = 'error';
        dbMessage = 'Database connection error';
      }

      // Get record counts including vehicle inspections
      const [users, customers, vehicles, contracts, companies, sponsors] = await Promise.all([
        storage.getAllUsers(),
        storage.getCustomers(true),
        storage.getVehicles(true),
        storage.getAllContracts(),
        storage.getCompanies(true),
        storage.getSponsors(true),
      ]);

      // PERFORMANCE FIX: Count inspections and photos using database aggregation
      // Old approach: Load all inspections with photos (huge memory usage)
      // New approach: Aggregate counts only
      const [inspectionStats] = await db
        .select({
          inspectionCount: count(),
          totalPhotos: sql<string>`COALESCE(SUM(CASE WHEN ${vehicleInspections.photos} IS NOT NULL THEN array_length(${vehicleInspections.photos}, 1) ELSE 0 END), 0)`,
        })
        .from(vehicleInspections);

      const activeContracts = contracts.filter((c: any) => c.status === 'active').length;
      
      const totalPhotos = parseInt(inspectionStats.totalPhotos) || 0;
      const inspectionCount = inspectionStats.inspectionCount || 0;

      const totalRecords = 
        users.length + 
        customers.length + 
        vehicles.length + 
        contracts.length + 
        companies.length + 
        sponsors.length +
        inspectionCount;

      // Estimate database size including photos
      const avgRecordSize = 2; // KB per record (rough estimate)
      const avgPhotoSize = 150; // KB per photo (compressed)
      const estimatedSizeKB = (totalRecords * avgRecordSize) + (totalPhotos * avgPhotoSize);
      const estimatedSizeMB = estimatedSizeKB / 1024;
      
      let estimatedSize = '';
      if (estimatedSizeMB < 1) {
        estimatedSize = `${estimatedSizeKB.toFixed(0)} KB`;
      } else if (estimatedSizeMB < 1024) {
        estimatedSize = `${estimatedSizeMB.toFixed(2)} MB`;
      } else {
        estimatedSize = `${(estimatedSizeMB / 1024).toFixed(2)} GB`;
      }

      // Get system information
      const totalMemoryGB = (os.totalmem() / (1024 ** 3)).toFixed(2);
      const freeMemoryGB = (os.freemem() / (1024 ** 3)).toFixed(2);
      const usedMemoryGB = ((os.totalmem() - os.freemem()) / (1024 ** 3)).toFixed(2);
      const memoryUsagePercent = (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(1);
      
      const uptimeSeconds = process.uptime();
      const uptimeHours = Math.floor(uptimeSeconds / 3600);
      const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);
      const uptimeFormatted = `${uptimeHours}h ${uptimeMinutes}m`;

      // Determine webserver status dynamically
      // Server is running if we're responding to this request
      // Check if uptime is reasonable (> 0) and memory usage is not critical (< 95%)
      const memoryUsageNum = parseFloat(memoryUsagePercent);
      const webserverStatus = uptimeSeconds > 0 && memoryUsageNum < 95 ? 'running' : 'degraded';

      res.json({
        version: appVersion,
        database: {
          status: dbStatus,
          message: dbMessage,
        },
        webserver: {
          status: webserverStatus,
          nodeVersion: process.version,
          platform: os.platform(),
          architecture: os.arch(),
          hostname: os.hostname(),
          uptime: uptimeFormatted,
          uptimeSeconds: Math.floor(uptimeSeconds),
        },
        system: {
          totalMemory: `${totalMemoryGB} GB`,
          usedMemory: `${usedMemoryGB} GB`,
          freeMemory: `${freeMemoryGB} GB`,
          memoryUsage: `${memoryUsagePercent}%`,
          cpuCores: os.cpus().length,
          cpuModel: os.cpus()[0]?.model || 'Unknown',
        },
        counts: {
          users: users.length,
          customers: customers.length,
          vehicles: vehicles.length,
          contracts: contracts.length,
          activeContracts,
          companies: companies.length,
          sponsors: sponsors.length,
          vehicleInspections: inspectionCount,
          photos: totalPhotos,
        },
        storage: {
          totalRecords,
          totalPhotos,
          estimatedSize,
        },
      });
    } catch (error) {
      console.error("Error fetching system health:", error);
      res.status(500).json({ 
        database: {
          status: 'error',
          message: 'Failed to fetch system health',
        },
        counts: {
          users: 0,
          customers: 0,
          vehicles: 0,
          contracts: 0,
          activeContracts: 0,
          companies: 0,
          sponsors: 0,
        },
        storage: {
          totalRecords: 0,
          estimatedSize: '0 KB',
        },
      });
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

  app.post("/api/customers", isAuthenticated, requireEditor, async (req: any, res) => {
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

  app.patch("/api/customers/:id", isAuthenticated, requireEditor, async (req: any, res) => {
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

  app.post("/api/vehicles", isAuthenticated, requireEditor, async (req: any, res) => {
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

  app.patch("/api/vehicles/:id", isAuthenticated, requireEditor, async (req: any, res) => {
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

  app.post("/api/sponsors", isAuthenticated, requireEditor, async (req: any, res) => {
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

  app.patch("/api/sponsors/:id", isAuthenticated, requireEditor, async (req: any, res) => {
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

  app.post("/api/companies", isAuthenticated, requireEditor, async (req: any, res) => {
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

  app.patch("/api/companies/:id", isAuthenticated, requireEditor, async (req: any, res) => {
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

  app.post("/api/companies/:id/disable", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      await storage.disableCompany(req.params.id, req.user!.id);
      
      await createAuditLog(req.user!.id, "disable_company", undefined, req, `Disabled company: ${req.params.id}`);
      
      res.json({ message: "Company disabled successfully" });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to disable company" });
    }
  });

  app.post("/api/companies/:id/enable", isAuthenticated, requireAdmin, async (req: any, res) => {
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
      const contract = await storage.getContractWithDetails(req.params.id);
      
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
      
      // P0-2: Use validateFinancialInput for all financial calculations
      const totalPaid = contractPayments.reduce((sum: number, payment: any) => {
        return sum + validateFinancialInput(payment.amount || '0', 'payment amount');
      }, 0);
      const totalAmount = validateFinancialInput(contract.totalAmount || '0', 'total amount');
      const totalExtraCharges = validateFinancialInput(contract.totalExtraCharges || '0', 'extra charges');
      
      // BRANCH & DRIVER SERVICE INTEGRATION: Include driver service costs in total (VAT-inclusive)
      const driverAssignments = await storage.getDriverAssignmentsByContract(contract.id);
      const { totalDriverCharges, totalDriverSurcharges, totalDriverVat } = calculateContractDriverCosts(driverAssignments);
      
      // CRITICAL FIX: totalDriverCharges now includes VAT when applicable
      const totalDue = totalAmount + totalExtraCharges + totalDriverCharges;
      
      // Calculate precise outstanding balance
      const totalPaidRounded = Math.round(totalPaid * 100) / 100;
      const totalDueRounded = Math.round(totalDue * 100) / 100;
      const computedOutstanding = Math.max(0, totalDueRounded - totalPaidRounded);
      
      // Return contract with complete financial breakdown including VAT-inclusive driver costs
      res.json({
        ...contract,
        // Explicitly include driver service charges in response (VAT-inclusive)
        totalDriverCharges: totalDriverCharges.toFixed(2),
        totalDriverSurcharges: totalDriverSurcharges.toFixed(2),
        totalDriverVat: totalDriverVat.toFixed(2),
        // Update total due to include all charges (rental + extras + driver with VAT)
        totalDue: totalDueRounded.toFixed(2),
        // Recalculated outstanding balance includes driver charges with VAT
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

  // Get unclosed contract alerts (contracts completed 30+ days ago but not closed)
  app.get('/api/contracts/unclosed-alerts', isAuthenticated, async (req: any, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Get all completed contracts
      const allContracts = await storage.getAllContracts();
      const completedContracts = allContracts.filter((c: any) => c.status === 'completed');
      
      // Filter for contracts completed 30+ days ago
      const unclosedContracts = [];
      
      for (const contract of completedContracts) {
        if (!contract.completedAt) continue;
        
        const completedAt = new Date(contract.completedAt);
        completedAt.setHours(0, 0, 0, 0);
        
        // Check if completed more than 30 days ago
        if (completedAt <= thirtyDaysAgo) {
          // Calculate days unclosed
          const daysUnclosed = Math.floor((today.getTime() - completedAt.getTime()) / (1000 * 60 * 60 * 24));
          
          // Get payments for this contract
          const contractPayments = await storage.getPaymentsByContract(contract.id);
          
          // P0-2: Use validateFinancialInput for all financial calculations
          const totalPaid = contractPayments.reduce((sum: number, payment: any) => {
            return sum + validateFinancialInput(payment.amount || '0', 'payment amount');
          }, 0);
          
          // Calculate outstanding balance
          const totalAmount = validateFinancialInput(contract.totalAmount || '0', 'total amount');
          const totalExtraCharges = validateFinancialInput(contract.totalExtraCharges || '0', 'extra charges');
          const securityDeposit = validateFinancialInput(contract.securityDeposit || '0', 'security deposit');
          const outstandingBalance = (totalAmount + totalExtraCharges) - securityDeposit - totalPaid;
          
          // Get handler info
          const handler = await storage.getUser(contract.createdBy);
          const handlerName = handler ? `${handler.firstName || ''} ${handler.lastName || ''}`.trim() || handler.username : 'Unknown';
          
          unclosedContracts.push({
            id: contract.id,
            contractNumber: contract.contractNumber,
            customerName: (contract as any).customerNameEn || (contract as any).customerNameAr || 'N/A',
            vehicleRegistration: (contract as any).vehicleRegistration || 'N/A',
            completedAt: contract.completedAt,
            daysUnclosed,
            outstandingBalance: Math.round(outstandingBalance * 100) / 100,
            handlerName,
          });
        }
      }
      
      // Sort by daysUnclosed descending (oldest first)
      unclosedContracts.sort((a, b) => b.daysUnclosed - a.daysUnclosed);
      
      res.json(unclosedContracts);
    } catch (error) {
      console.error("Error fetching unclosed contract alerts:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: "Failed to fetch unclosed contract alerts" });
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
      await logSystemError(error, req, { action: 'create_contract' });
      res.status(400).json({ message: error.message || "Failed to create contract" });
    }
  });

  app.patch('/api/contracts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { editReason, ...contractData } = req.body;
      
      // Step 1: Fetch current contract FIRST
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // Step 2: ALWAYS require editReason (cannot be bypassed)
      if (!editReason || typeof editReason !== 'string') {
        return res.status(400).json({ 
          message: "Edit reason is required for all contract updates" 
        });
      }

      const trimmedReason = editReason.trim();
      
      if (trimmedReason === '') {
        return res.status(400).json({ 
          message: "Edit reason cannot be empty" 
        });
      }

      // Step 3: Status-based validation (BYPASS-PROOF)
      // Based on CURRENT contract status (not req.body.status)
      
      if (contract.status === 'closed') {
        // Closed contracts are completely immutable
        return res.status(403).json({ 
          message: "Cannot edit closed contract. Closed contracts are immutable and cannot be modified." 
        });
      }
      
      if (contract.status === 'active' || contract.status === 'completed') {
        // Active/Completed: Require 10+ meaningful words (3+ chars each)
        const validation = validateEditReason(trimmedReason);
        if (!validation.valid) {
          return res.status(400).json({ 
            message: validation.error,
            wordCount: validation.wordCount
          });
        }
      } else if (contract.status === 'draft') {
        // Draft: Require non-empty reason (already validated above)
        // No additional validation needed
      } else {
        // Unknown status (backward compatibility for legacy data)
        // Require validated reason to be safe
        const validation = validateEditReason(trimmedReason);
        if (!validation.valid) {
          return res.status(400).json({ 
            message: `Edit reason validation required for contract status '${contract.status}': ${validation.error}`,
            wordCount: validation.wordCount
          });
        }
      }

      // Step 4: Check if user has permission to edit
      const user = await storage.getUser(userId);
      if (user?.role !== 'admin' && contract.createdBy !== userId) {
        return res.status(403).json({ message: "Forbidden: You can only edit your own contracts" });
      }

      // Step 5: Capture state before edit
      const fieldsBefore = { ...contract };
      
      // Step 6: Update the contract including editReason field
      const updated = await storage.updateContract(req.params.id, {
        ...contractData,
        editReason: trimmedReason,
      });
      
      // Step 7: Capture state after edit
      const fieldsAfter = { ...updated };
      
      // Step 8: Generate human-readable summary of changes
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
      
      // Step 9: Create contract edit record
      await storage.createContractEdit({
        contractId: updated.id,
        editedBy: userId,
        editReason: trimmedReason,
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

  // Legacy /finalize route removed - use new state machine (draft → activate → complete → close)

  // Phase 2: State transition routes (Admin/Manager only)
  
  // Activate rental (draft → active)
  app.post('/api/contracts/:id/activate', isAuthenticated, requireEditor, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { timeOut } = req.body; // Capture actual vehicle handover time
      
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // STATUS VALIDATION: Contract must be in draft status
      if (contract.status !== 'draft') {
        return res.status(400).json({ 
          message: `Contract must be in draft status to activate. Current status: ${contract.status}` 
        });
      }

      // INSPECTION VALIDATION: Ensure pre-delivery inspection exists
      const inspections = await storage.getVehicleInspectionsByContract(req.params.id);
      const hasPreDeliveryInspection = inspections.some(i => i.inspectionType === 'pre_delivery');
      
      if (!hasPreDeliveryInspection) {
        return res.status(400).json({ 
          message: "Pre-delivery vehicle inspection is required before activating the rental. Please complete the inspection first." 
        });
      }

      // DOUBLE-BOOKING PREVENTION: Check vehicle availability
      const isAvailable = await storage.checkVehicleAvailability(
        contract.vehicleId,
        new Date(contract.rentalStartDate),
        new Date(contract.rentalEndDate),
        contract.id // Exclude current contract from availability check
      );
      
      if (!isAvailable) {
        return res.status(400).json({ 
          message: "Vehicle is not available for the selected dates. Another active or completed contract exists for this period. Please choose different dates or another vehicle." 
        });
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

      const activated = await storage.activateContract(req.params.id, userId, timeOut);
      
      // Update vehicle status to "rented"
      await storage.updateVehicle(activated.vehicleId, { status: "rented" });
      
      // Create audit log
      await createAuditLog(userId, 'activate', activated.id, req, `Activated contract #${activated.contractNumber} - vehicle handed over at ${timeOut || 'N/A'}`);
      
      res.json(activated);
    } catch (error: any) {
      console.error("Error activating contract:", error);
      res.status(400).json({ message: error.message || "Failed to activate contract" });
    }
  });

  // Complete rental with return data (active → completed)
  app.post('/api/contracts/:id/complete', isAuthenticated, requireEditor, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // CRITICAL FIX 1: Edit reason validation for completing active contracts
      if (contract.status === 'active') {
        const editReasonValidation = validateEditReason(req.body.editReason);
        if (!editReasonValidation.valid) {
          return res.status(400).json({ 
            message: editReasonValidation.error || "Edit reason required when completing active contract"
          });
        }
      }

      // VALIDATION: Ensure post-return inspection exists
      const inspections = await storage.getVehicleInspectionsByContract(req.params.id);
      const hasPostReturnInspection = inspections.some(i => i.inspectionType === 'post_return');
      
      if (!hasPostReturnInspection) {
        return res.status(400).json({ 
          message: "Post-return vehicle inspection is required before completing the rental. Please complete the inspection first." 
        });
      }

      const { timeIn, odometerEnd, fuelLevelEnd, vehicleCondition, extraKmCharge, fuelCharge: clientFuelCharge, damageCharge, trafficFineCharge, otherCharges, totalExtraCharges, outstandingBalance, extraKmDriven, fuelChargeOverride, earlyClosureReason } = req.body;
      
      // CRITICAL FIX 2: Validate all financial inputs with Number.isFinite() guards
      try {
        if (extraKmCharge !== undefined && extraKmCharge !== null && extraKmCharge !== '') {
          validateFinancialInput(extraKmCharge, 'extra km charge');
        }
        if (clientFuelCharge !== undefined && clientFuelCharge !== null && clientFuelCharge !== '') {
          validateFinancialInput(clientFuelCharge, 'fuel charge');
        }
        if (damageCharge !== undefined && damageCharge !== null && damageCharge !== '') {
          validateFinancialInput(damageCharge, 'damage charge');
        }
        if (trafficFineCharge !== undefined && trafficFineCharge !== null && trafficFineCharge !== '') {
          validateFinancialInput(trafficFineCharge, 'traffic fine charge');
        }
        if (otherCharges !== undefined && otherCharges !== null && otherCharges !== '') {
          validateFinancialInput(otherCharges, 'other charges');
        }
        if (totalExtraCharges !== undefined && totalExtraCharges !== null && totalExtraCharges !== '') {
          validateFinancialInput(totalExtraCharges, 'total extra charges');
        }
        if (odometerEnd !== undefined && odometerEnd !== null && odometerEnd !== '') {
          validateFinancialInput(odometerEnd, 'odometer reading');
        }
        if (fuelLevelEnd !== undefined && fuelLevelEnd !== null && fuelLevelEnd !== '') {
          validateFinancialInput(fuelLevelEnd, 'fuel level');
        }
      } catch (error: any) {
        return res.status(400).json({ message: error.message });
      }
      
      // SECURITY: Calculate fuel charge on backend instead of trusting client
      const vehicle = await storage.getVehicleById(contract.vehicleId);
      const settings = await storage.getCompanySettings();
      
      let calculatedFuelCharge = 0;
      let fuelChargeDetails = '';
      
      // P0-2: Parse fuel levels to numbers using validated parsing
      const fuelLevelStart = validateFinancialInput(contract.fuelLevelStart || '0', 'fuel level start');
      const fuelLevelEndNum = validateFinancialInput(fuelLevelEnd || '0', 'fuel level end');
      
      if (vehicle && settings && fuelLevelStart && fuelLevelEndNum < fuelLevelStart) {
        const tankCapacity = vehicle.tankCapacity || 0;
        const fuelType = vehicle.fuelType || 'petrol';
        
        // Only calculate if vehicle has tank capacity and uses fuel
        if (tankCapacity > 0 && (fuelType === 'petrol' || fuelType === 'diesel')) {
          const fuelConsumed = (tankCapacity * (fuelLevelStart - fuelLevelEndNum)) / 100;
          const pricePerLiter = fuelType === 'diesel' 
            ? validateFinancialInput(settings.dieselPricePerLiter || '0', 'diesel price')
            : validateFinancialInput(settings.petrolPricePerLiter || '0', 'petrol price');
          
          calculatedFuelCharge = Math.round(fuelConsumed * pricePerLiter * 100) / 100;
          fuelChargeDetails = `Fuel consumed: ${fuelConsumed.toFixed(2)}L × ${pricePerLiter} AED/L = ${calculatedFuelCharge.toFixed(2)} AED`;
        }
      }
      
      // Use calculated charge unless manual override is explicitly flagged
      let finalFuelCharge = calculatedFuelCharge.toString();
      let auditNote = `Completed contract #${contract.contractNumber} - vehicle returned`;
      
      // P0-2: Validate client fuel charge if override is used
      if (fuelChargeOverride && clientFuelCharge !== undefined && validateFinancialInput(clientFuelCharge, 'client fuel charge') !== calculatedFuelCharge) {
        finalFuelCharge = clientFuelCharge;
        auditNote += ` | FUEL CHARGE OVERRIDE: Backend calculated ${calculatedFuelCharge.toFixed(2)} AED (${fuelChargeDetails}), but manual override set to ${clientFuelCharge} AED`;
      } else if (calculatedFuelCharge > 0) {
        auditNote += ` | Fuel charge auto-calculated: ${fuelChargeDetails}`;
      }
      
      // AUTO-ADJUST SECURITY DEPOSIT: Calculate outstanding balance with automatic deposit deduction
      // P0-2: Use validateFinancialInput for all financial data
      const totalAmount = validateFinancialInput(contract.totalAmount, 'total amount');
      const totalExtraChargesNum = validateFinancialInput(totalExtraCharges || '0', 'extra charges');
      const securityDeposit = validateFinancialInput(contract.securityDeposit, 'security deposit');
      
      // Validate all values are finite numbers - reject invalid data instead of defaulting to zero
      if (!isFinite(totalAmount)) {
        return res.status(400).json({ 
          message: "Invalid total amount in contract. Contract data is corrupted or incomplete." 
        });
      }
      if (!isFinite(totalExtraChargesNum)) {
        return res.status(400).json({ 
          message: "Invalid extra charges amount. Please verify the extra charges data." 
        });
      }
      
      // Security deposit validation only if depositPaid is true
      let depositPaidAmount = 0;
      if (contract.depositPaid) {
        if (!isFinite(securityDeposit)) {
          return res.status(400).json({ 
            message: "Invalid security deposit amount. Contract marked as deposit paid but amount is missing or invalid." 
          });
        }
        depositPaidAmount = securityDeposit;
      }
      
      // Get all payments made so far
      const contractPayments = await storage.getPaymentsByContract(contract.id);
      
      // P0-2: Use validateFinancialInput in payment reduce
      const totalPaid = contractPayments.reduce((sum: number, payment: any) => {
        try {
          const amount = validateFinancialInput(payment.amount || '0', 'payment amount');
          return sum + amount;
        } catch {
          return sum; // Skip invalid payments
        }
      }, 0);
      
      // Formula: outstandingBalance = (totalAmount + totalExtraCharges) - securityDeposit - sum(payments)
      const calculatedOutstandingBalance = Math.max(0, totalAmount + totalExtraChargesNum - depositPaidAmount - totalPaid);
      const roundedOutstandingBalance = Math.round(calculatedOutstandingBalance * 100) / 100;
      
      // CRITICAL FIX: Validate outstanding balance is a valid number
      if (isNaN(roundedOutstandingBalance)) {
        console.error(`NaN outstanding balance detected for contract ${contract.id}. totalAmount: ${totalAmount}, totalExtra: ${totalExtraChargesNum}, deposit: ${depositPaidAmount}, paid: ${totalPaid}`);
        return res.status(500).json({ 
          message: "Error calculating outstanding balance. Please contact system administrator." 
        });
      }
      
      // Update audit note with deposit auto-adjustment
      if (depositPaidAmount > 0) {
        auditNote += ` | Security deposit (${depositPaidAmount.toFixed(2)} AED) automatically deducted from outstanding balance`;
      }
      
      // Prepare charge data with backend-calculated outstanding balance
      const chargeData = {
        extraKmCharge,
        extraKmDriven,
        fuelCharge: finalFuelCharge,
        damageCharge,
        trafficFineCharge,
        otherCharges,
        totalExtraCharges,
        outstandingBalance: roundedOutstandingBalance.toString(),
      };

      // Update contract with return inspection data, timeIn, and early closure reason (Task 11)
      await storage.updateContract(req.params.id, {
        timeIn, // Capture actual vehicle return time
        odometerEnd,
        fuelLevelEnd,
        vehicleCondition,
        earlyClosureReason: earlyClosureReason || null,
      });

      // Complete the contract with charge data
      const completed = await storage.completeContract(req.params.id, userId, chargeData);
      
      // Update vehicle status to "available" after return
      await storage.updateVehicle(completed.vehicleId, { status: "available" });
      
      // Create audit log with calculation details and return time
      const finalAuditNote = `${auditNote}${timeIn ? ` | Vehicle returned at ${timeIn}` : ''}`;
      await createAuditLog(userId, 'complete', completed.id, req, finalAuditNote);
      
      res.json(completed);
    } catch (error: any) {
      console.error("Error completing contract:", error);
      res.status(400).json({ message: error.message || "Failed to complete contract" });
    }
  });

  // Close contract (completed → closed) - Admin or users with canCloseContracts toggle with payment verification
  app.post('/api/contracts/:id/close', isAuthenticated, requireContractCloseAccess, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // CRITICAL FIX 1: Edit reason validation for closing completed contracts
      if (contract.status === 'completed') {
        // closureRemark is used as edit reason for close operations
        const editReasonValidation = validateEditReason(req.body.closureRemark || req.body.editReason);
        if (!editReasonValidation.valid) {
          return res.status(400).json({ 
            message: editReasonValidation.error || "Edit reason/closure remark required when closing completed contract"
          });
        }
      }

      // Verify contract is in completed status
      if (contract.status !== 'completed') {
        return res.status(400).json({ 
          message: "Contract must be in 'completed' status before closing" 
        });
      }

      // PAYMENT VERIFICATION: Query new payments table to verify settlement
      const contractPayments = await storage.getPaymentsByContract(contract.id);
      
      // P0-2: Use validateFinancialInput for all payment calculations
      const totalPaid = contractPayments.reduce((sum: number, payment: any) => {
        try {
          const amount = validateFinancialInput(payment.amount, 'payment amount');
          return sum + amount;
        } catch (error) {
          console.error(`Invalid payment amount in payment record: ${JSON.stringify(payment)}`);
          return sum;
        }
      }, 0);
      
      const totalAmount = validateFinancialInput(contract.totalAmount, 'total amount');
      const totalExtraCharges = validateFinancialInput(contract.totalExtraCharges || '0', 'extra charges');
      
      // Validate all values are finite numbers - reject invalid data instead of defaulting to zero
      if (!isFinite(totalAmount)) {
        return res.status(400).json({ 
          message: "Invalid total amount in contract. Contract data is corrupted or incomplete." 
        });
      }
      if (!isFinite(totalExtraCharges)) {
        return res.status(400).json({ 
          message: "Invalid extra charges in contract. Please verify the contract data." 
        });
      }
      
      const totalDue = totalAmount + totalExtraCharges;
      
      // SECURITY FIX: Round to currency precision (2 decimals) to prevent floating point exploits
      const totalPaidRounded = Math.round(totalPaid * 100) / 100;
      const totalDueRounded = Math.round(totalDue * 100) / 100;
      const computedOutstanding = totalDueRounded - totalPaidRounded;
      
      // CRITICAL FIX: Validate outstanding balance is a valid number
      if (isNaN(computedOutstanding)) {
        console.error(`NaN outstanding balance detected for contract ${contract.id}. totalDue: ${totalDue}, totalPaid: ${totalPaid}`);
        return res.status(500).json({ 
          message: "Error calculating outstanding balance. Please contact system administrator." 
        });
      }
      
      // Check if there's outstanding balance
      const hasOutstandingBalance = computedOutstanding > 0.001;
      
      // Admin override: Allow closing with outstanding balance if closureRemark is provided
      if (userRole === 'admin' && hasOutstandingBalance) {
        const { closureRemark } = req.body;
        
        // Validate closure remark using the same validation as edit reason
        const validation = validateEditReason(closureRemark);
        if (!validation.valid) {
          return res.status(400).json({ 
            message: validation.error || "Closure remark is required when closing with outstanding balance"
          });
        }
        
        // Close contract with closure remark
        const closed = await storage.closeContract(req.params.id, userId, closureRemark);
        
        // Ensure vehicle status is "available" after closing
        await storage.updateVehicle(closed.vehicleId, { status: "available" });
        
        // Create audit log with closure remark details
        await createAuditLog(
          userId, 
          'close', 
          closed.id, 
          req, 
          `Admin override: Closed contract #${closed.contractNumber} with outstanding balance of ${computedOutstanding.toFixed(2)} AED. Remark: ${closureRemark}`
        );
        
        return res.json(closed);
      }
      
      // Non-admin users OR admin with zero balance: Standard payment verification
      if (hasOutstandingBalance) {
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
  app.post('/api/contracts/:id/deposit', isAuthenticated, requireEditor, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      const { method } = req.body;
      
      // Get currency from settings
      const settings = await storage.getCompanySettings();
      const currency = settings.currencyEn || 'AED';
      
      // Create payment record in payments table
      const payment = await storage.createPayment({
        contractId: contract.id,
        amount: contract.securityDeposit || '0',
        paymentMethod: method || 'cash',
        currency: currency,
        notes: 'Deposit payment',
        paidAt: new Date(),
        createdBy: userId,
      } as any);
      
      await createAuditLog(userId, 'payment', contract.id, req, `Recorded deposit payment of ${contract.securityDeposit || '0'} ${currency} for contract #${contract.contractNumber}`);
      
      res.json(payment);
    } catch (error: any) {
      console.error("Error recording deposit:", error);
      res.status(400).json({ message: error.message || "Failed to record deposit" });
    }
  });
  
  // Record final payment
  app.post('/api/contracts/:id/final-payment', isAuthenticated, requireEditor, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      const { method } = req.body;
      
      // Get currency from settings
      const settings = await storage.getCompanySettings();
      const currency = settings.currencyEn || 'AED';
      
      // P0-2: Calculate final payment amount using validated inputs
      const totalAmount = validateFinancialInput(contract.totalAmount || '0', 'total amount');
      const totalExtraCharges = validateFinancialInput(contract.totalExtraCharges || '0', 'extra charges');
      const totalDue = totalAmount + totalExtraCharges;
      
      // Get existing payments
      const existingPayments = await storage.getPaymentsByContract(contract.id);
      const totalPaid = existingPayments.reduce((sum: number, p: any) => {
        return sum + validateFinancialInput(p.amount || '0', 'payment amount');
      }, 0);
      
      const finalPaymentAmount = Math.max(0, totalDue - totalPaid);
      
      // Create payment record in payments table
      const payment = await storage.createPayment({
        contractId: contract.id,
        amount: finalPaymentAmount.toString(),
        paymentMethod: method || 'cash',
        currency: currency,
        notes: 'Final payment',
        paidAt: new Date(),
        createdBy: userId,
      } as any);
      
      await createAuditLog(userId, 'payment', contract.id, req, `Recorded final payment of ${finalPaymentAmount.toFixed(2)} ${currency} for contract #${contract.contractNumber}`);
      
      res.json(payment);
    } catch (error: any) {
      console.error("Error recording final payment:", error);
      res.status(400).json({ message: error.message || "Failed to record final payment" });
    }
  });
  
  // Record deposit refund
  app.post('/api/contracts/:id/refund', isAuthenticated, requireEditor, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      const { method } = req.body;
      
      // Get currency from settings
      const settings = await storage.getCompanySettings();
      const currency = settings.currencyEn || 'AED';
      
      // Create negative payment record for refund
      const payment = await storage.createPayment({
        contractId: contract.id,
        amount: `-${contract.securityDeposit || '0'}`,
        paymentMethod: method || 'cash',
        currency: currency,
        notes: 'Deposit refund',
        paidAt: new Date(),
        createdBy: userId,
      } as any);
      
      await createAuditLog(userId, 'payment', contract.id, req, `Refunded deposit of ${contract.securityDeposit || '0'} ${currency} for contract #${contract.contractNumber}`);
      
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

      // Set permission toggles based on role
      // Admin and Manager get all permissions by default
      // Staff and Viewer get no permissions by default (can be granted later)
      const userRole = role || 'staff';
      const isPrivileged = userRole === 'admin' || userRole === 'manager';

      // Create user
      const user = await storage.createUser({
        username,
        passwordHash,
        email,
        firstName,
        lastName,
        role: userRole,
        isImmutable: false,
        canCloseContracts: isPrivileged,
        canViewAllContracts: isPrivileged,
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

  // Update user (Admin only)
  app.patch('/api/users/:id', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { 
        email, 
        firstName, 
        lastName, 
        role, 
        password, 
        canCloseContracts, 
        canViewAllContracts,
        canAccessRevenueTrends,
        canAccessFleetPerformance,
        canAccessContractAnalytics,
        canAccessCollectionPerformance,
        canAccessFinancialReports,
        canAccessOperationalReports,
        canAccessCustomerReports,
        canAccessInsuranceReports,
        canAccessAuditReports,
        canAccessUserActivityReports
      } = req.body;
      const adminId = req.user.id;
      const userId = req.params.id;

      // Get existing user
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Build update object with only provided fields
      const updates: any = {};
      if (email !== undefined) updates.email = email;
      if (firstName !== undefined) updates.firstName = firstName;
      if (lastName !== undefined) updates.lastName = lastName;
      if (role !== undefined) updates.role = role;
      if (canCloseContracts !== undefined) updates.canCloseContracts = canCloseContracts;
      if (canViewAllContracts !== undefined) updates.canViewAllContracts = canViewAllContracts;
      if (canAccessRevenueTrends !== undefined) updates.canAccessRevenueTrends = canAccessRevenueTrends;
      if (canAccessFleetPerformance !== undefined) updates.canAccessFleetPerformance = canAccessFleetPerformance;
      if (canAccessContractAnalytics !== undefined) updates.canAccessContractAnalytics = canAccessContractAnalytics;
      if (canAccessCollectionPerformance !== undefined) updates.canAccessCollectionPerformance = canAccessCollectionPerformance;
      if (canAccessFinancialReports !== undefined) updates.canAccessFinancialReports = canAccessFinancialReports;
      if (canAccessOperationalReports !== undefined) updates.canAccessOperationalReports = canAccessOperationalReports;
      if (canAccessCustomerReports !== undefined) updates.canAccessCustomerReports = canAccessCustomerReports;
      if (canAccessInsuranceReports !== undefined) updates.canAccessInsuranceReports = canAccessInsuranceReports;
      if (canAccessAuditReports !== undefined) updates.canAccessAuditReports = canAccessAuditReports;
      if (canAccessUserActivityReports !== undefined) updates.canAccessUserActivityReports = canAccessUserActivityReports;

      // Hash new password if provided
      if (password && password.trim().length > 0) {
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.valid) {
          return res.status(400).json({ message: passwordValidation.message });
        }
        updates.passwordHash = await hashPassword(password);
      }

      // Update user using storage layer (enforces immutable check)
      const updated = await storage.updateUser(userId, updates);

      // Create audit log - only log fields that were explicitly supplied AND changed
      // Include before/after values for complete audit trail
      const changes = [];
      if (email !== undefined && email !== existingUser.email) changes.push(`email from "${existingUser.email}" to "${email}"`);
      if (role !== undefined && role !== existingUser.role) changes.push(`role from "${existingUser.role}" to "${role}"`);
      if (password && password.trim().length > 0) changes.push('password (updated)');
      if (canCloseContracts !== undefined && canCloseContracts !== existingUser.canCloseContracts) {
        changes.push(`canCloseContracts from ${existingUser.canCloseContracts} to ${canCloseContracts}`);
      }
      if (canViewAllContracts !== undefined && canViewAllContracts !== existingUser.canViewAllContracts) {
        changes.push(`canViewAllContracts from ${existingUser.canViewAllContracts} to ${canViewAllContracts}`);
      }
      if (canAccessRevenueTrends !== undefined && canAccessRevenueTrends !== existingUser.canAccessRevenueTrends) {
        changes.push(`canAccessRevenueTrends from ${existingUser.canAccessRevenueTrends} to ${canAccessRevenueTrends}`);
      }
      if (canAccessFleetPerformance !== undefined && canAccessFleetPerformance !== existingUser.canAccessFleetPerformance) {
        changes.push(`canAccessFleetPerformance from ${existingUser.canAccessFleetPerformance} to ${canAccessFleetPerformance}`);
      }
      if (canAccessContractAnalytics !== undefined && canAccessContractAnalytics !== existingUser.canAccessContractAnalytics) {
        changes.push(`canAccessContractAnalytics from ${existingUser.canAccessContractAnalytics} to ${canAccessContractAnalytics}`);
      }
      if (canAccessCollectionPerformance !== undefined && canAccessCollectionPerformance !== existingUser.canAccessCollectionPerformance) {
        changes.push(`canAccessCollectionPerformance from ${existingUser.canAccessCollectionPerformance} to ${canAccessCollectionPerformance}`);
      }
      if (canAccessFinancialReports !== undefined && canAccessFinancialReports !== existingUser.canAccessFinancialReports) {
        changes.push(`canAccessFinancialReports from ${existingUser.canAccessFinancialReports} to ${canAccessFinancialReports}`);
      }
      if (canAccessOperationalReports !== undefined && canAccessOperationalReports !== existingUser.canAccessOperationalReports) {
        changes.push(`canAccessOperationalReports from ${existingUser.canAccessOperationalReports} to ${canAccessOperationalReports}`);
      }
      if (canAccessCustomerReports !== undefined && canAccessCustomerReports !== existingUser.canAccessCustomerReports) {
        changes.push(`canAccessCustomerReports from ${existingUser.canAccessCustomerReports} to ${canAccessCustomerReports}`);
      }
      if (canAccessInsuranceReports !== undefined && canAccessInsuranceReports !== existingUser.canAccessInsuranceReports) {
        changes.push(`canAccessInsuranceReports from ${existingUser.canAccessInsuranceReports} to ${canAccessInsuranceReports}`);
      }
      if (canAccessAuditReports !== undefined && canAccessAuditReports !== existingUser.canAccessAuditReports) {
        changes.push(`canAccessAuditReports from ${existingUser.canAccessAuditReports} to ${canAccessAuditReports}`);
      }
      if (canAccessUserActivityReports !== undefined && canAccessUserActivityReports !== existingUser.canAccessUserActivityReports) {
        changes.push(`canAccessUserActivityReports from ${existingUser.canAccessUserActivityReports} to ${canAccessUserActivityReports}`);
      }
      
      if (changes.length > 0) {
        await createAuditLog(adminId, 'edit', undefined, req, `Updated user ${existingUser.username}: ${changes.join(', ')}`);
      }

      // Return user without password hash
      const { passwordHash, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Error updating user:", error);
      res.status(400).json({ message: error.message || "Failed to update user" });
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
      await logSystemError(error, req, { action: 'create_payment' });
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

  // Vehicle Inspection routes
  app.post('/api/contracts/:contractId/inspections', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { contractId } = req.params;

      // Verify contract exists
      const contract = await storage.getContract(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // Get user info for inspector name
      const user = req.user;
      const inspectorName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`.trim()
        : user.username;

      // P0-1: Validate photos server-side before processing
      if (req.body.photos && Array.isArray(req.body.photos)) {
        const photoValidation = validateInspectionPhotos(req.body.photos);
        if (!photoValidation.valid) {
          return res.status(400).json({ message: photoValidation.error });
        }
      }

      // Validate inspection data
      const validatedData = insertVehicleInspectionSchema.parse({
        ...req.body,
        contractId,
        vehicleId: contract.vehicleId,
        inspectorName: req.body.inspectorName || inspectorName,
      });

      // Create inspection
      const inspection = await storage.createVehicleInspection({
        ...validatedData,
        createdBy: userId,
      } as any);

      // Create comprehensive audit log
      const inspectionType = inspection.inspectionType === 'pre_delivery' ? 'Pre-Delivery' : 'Post-Return';
      const photosCount = Array.isArray(inspection.photos) 
        ? inspection.photos.length 
        : (typeof inspection.photos === 'string' ? JSON.parse(inspection.photos).length : 0);
      await createAuditLog(
        userId,
        'create_inspection',
        contractId,
        req,
        `Created ${inspectionType} inspection for contract #${contract.contractNumber} - Odometer: ${inspection.odometerReading}km, Fuel: ${inspection.fuelLevel}%, Photos: ${photosCount}`
      );

      res.json(inspection);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating inspection:", error);
      res.status(400).json({ message: error.message || "Failed to create inspection" });
    }
  });

  app.get('/api/contracts/:contractId/inspections', isAuthenticated, async (req: any, res) => {
    try {
      const { contractId } = req.params;
      const inspections = await storage.getVehicleInspectionsByContract(contractId);
      res.json(inspections);
    } catch (error: any) {
      console.error("Error fetching inspections:", error);
      res.status(500).json({ message: error.message || "Failed to fetch inspections" });
    }
  });

  app.get('/api/inspections/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const inspection = await storage.getVehicleInspection(id);
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      res.json(inspection);
    } catch (error: any) {
      console.error("Error fetching inspection:", error);
      res.status(500).json({ message: error.message || "Failed to fetch inspection" });
    }
  });

  // Insurance Claims routes
  app.get('/api/insurance-claims', isAuthenticated, async (req: any, res) => {
    try {
      const { status, contractId } = req.query;
      const filters: any = {};
      if (status) filters.status = status as string;
      if (contractId) filters.contractId = contractId as string;
      
      const claims = await storage.getInsuranceClaims(filters);
      res.json(claims);
    } catch (error: any) {
      console.error("Error fetching insurance claims:", error);
      res.status(500).json({ message: error.message || "Failed to fetch insurance claims" });
    }
  });

  app.get('/api/insurance-claims/:id', isAuthenticated, async (req: any, res) => {
    try {
      const claim = await storage.getInsuranceClaimById(req.params.id);
      if (!claim) {
        return res.status(404).json({ message: "Insurance claim not found" });
      }
      res.json(claim);
    } catch (error: any) {
      console.error("Error fetching insurance claim:", error);
      res.status(500).json({ message: error.message || "Failed to fetch insurance claim" });
    }
  });

  app.get('/api/contracts/:contractId/insurance-claims', isAuthenticated, async (req: any, res) => {
    try {
      const { contractId } = req.params;
      const claims = await storage.getInsuranceClaims({ contractId });
      res.json(claims);
    } catch (error: any) {
      console.error("Error fetching contract insurance claims:", error);
      res.status(500).json({ message: error.message || "Failed to fetch contract insurance claims" });
    }
  });

  app.post('/api/insurance-claims', isAuthenticated, requireEditor, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const claimData = insertInsuranceClaimSchema.parse(req.body);
      
      const claim = await storage.createInsuranceClaim({
        ...claimData,
        createdBy: userId,
      } as any);
      
      await createAuditLog(
        userId,
        'create_insurance_claim',
        claim.contractId,
        req,
        `Created insurance claim ${claim.claimNumber} for ${claim.claimAmount} - ${claim.insuranceCompany}`
      );
      
      res.status(201).json(claim);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating insurance claim:", error);
      res.status(400).json({ message: error.message || "Failed to create insurance claim" });
    }
  });

  app.patch('/api/insurance-claims/:id', isAuthenticated, requireEditor, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const claimData = insertInsuranceClaimSchema.partial().parse(req.body);
      
      const claim = await storage.updateInsuranceClaim(req.params.id, claimData);
      
      await createAuditLog(
        userId,
        'update_insurance_claim',
        claim.contractId,
        req,
        `Updated insurance claim ${claim.claimNumber}`
      );
      
      res.json(claim);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error updating insurance claim:", error);
      res.status(400).json({ message: error.message || "Failed to update insurance claim" });
    }
  });

  app.delete('/api/insurance-claims/:id', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const claim = await storage.getInsuranceClaimById(req.params.id);
      
      if (!claim) {
        return res.status(404).json({ message: "Insurance claim not found" });
      }
      
      await storage.disableInsuranceClaim(req.params.id);
      
      await createAuditLog(
        userId,
        'disable_insurance_claim',
        claim.contractId,
        req,
        `Disabled insurance claim ${claim.claimNumber}`
      );
      
      res.json({ message: "Insurance claim disabled successfully" });
    } catch (error: any) {
      console.error("Error disabling insurance claim:", error);
      res.status(500).json({ message: error.message || "Failed to disable insurance claim" });
    }
  });

  // Renewal Requests routes
  app.get('/api/renewal-requests', isAuthenticated, async (req: any, res) => {
    try {
      const { status, customerId, contractId } = req.query;
      const filters: any = {};
      
      if (status) filters.status = status;
      if (customerId) filters.customerId = customerId;
      if (contractId) filters.contractId = contractId;
      
      const requests = await storage.getRenewalRequests(filters);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching renewal requests:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: "Failed to fetch renewal requests" });
    }
  });

  app.get('/api/renewal-requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const request = await storage.getRenewalRequest(req.params.id);
      
      if (!request) {
        return res.status(404).json({ message: "Renewal request not found" });
      }
      
      res.json(request);
    } catch (error) {
      console.error("Error fetching renewal request:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: "Failed to fetch renewal request" });
    }
  });

  app.post('/api/renewal-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const requestData = insertRenewalRequestSchema.parse(req.body);
      
      const request = await storage.createRenewalRequest(requestData);
      
      await createAuditLog(
        userId,
        'create_renewal_request',
        request.contractId,
        req,
        `Created renewal request for contract ${request.contractId}`
      );
      
      res.json(request);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating renewal request:", error);
      await logSystemError(error, req);
      res.status(400).json({ message: error.message || "Failed to create renewal request" });
    }
  });

  app.patch('/api/renewal-requests/:id', isAuthenticated, requireEditor, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const requestData = insertRenewalRequestSchema.partial().parse(req.body);
      
      const request = await storage.updateRenewalRequest(req.params.id, requestData);
      
      await createAuditLog(
        userId,
        'update_renewal_request',
        request.contractId,
        req,
        `Updated renewal request ${request.id}`
      );
      
      res.json(request);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error updating renewal request:", error);
      res.status(400).json({ message: error.message || "Failed to update renewal request" });
    }
  });

  app.delete('/api/renewal-requests/:id', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const request = await storage.getRenewalRequest(req.params.id);
      
      if (!request) {
        return res.status(404).json({ message: "Renewal request not found" });
      }
      
      await storage.deleteRenewalRequest(req.params.id, userId);
      
      await createAuditLog(
        userId,
        'delete_renewal_request',
        request.contractId,
        req,
        `Deleted renewal request ${request.id}`
      );
      
      res.json({ message: "Renewal request deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting renewal request:", error);
      res.status(500).json({ message: error.message || "Failed to delete renewal request" });
    }
  });

  app.post('/api/renewal-requests/:id/approve', isAuthenticated, requireEditor, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { notes } = req.body;
      
      const request = await storage.updateRenewalRequest(req.params.id, {
        status: 'approved',
        reviewedBy: userId,
        reviewedAt: new Date(),
        notes: notes || undefined,
      });
      
      await createAuditLog(
        userId,
        'approve_renewal_request',
        request.contractId,
        req,
        `Approved renewal request ${request.id}`
      );
      
      res.json(request);
    } catch (error: any) {
      console.error("Error approving renewal request:", error);
      res.status(400).json({ message: error.message || "Failed to approve renewal request" });
    }
  });

  app.post('/api/renewal-requests/:id/reject', isAuthenticated, requireEditor, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { rejectionReason } = req.body;
      
      if (!rejectionReason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }
      
      const request = await storage.updateRenewalRequest(req.params.id, {
        status: 'rejected',
        reviewedBy: userId,
        reviewedAt: new Date(),
        rejectionReason,
      });
      
      await createAuditLog(
        userId,
        'reject_renewal_request',
        request.contractId,
        req,
        `Rejected renewal request ${request.id}: ${rejectionReason}`
      );
      
      res.json(request);
    } catch (error: any) {
      console.error("Error rejecting renewal request:", error);
      res.status(400).json({ message: error.message || "Failed to reject renewal request" });
    }
  });

  // Document Approvals routes
  app.get('/api/document-approvals', isAuthenticated, async (req: any, res) => {
    try {
      const { status, customerId, documentType } = req.query;
      const filters: any = {};
      
      if (status) filters.status = status;
      if (customerId) filters.customerId = customerId;
      if (documentType) filters.documentType = documentType;
      
      const approvals = await storage.getDocumentApprovals(filters);
      res.json(approvals);
    } catch (error) {
      console.error("Error fetching document approvals:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: "Failed to fetch document approvals" });
    }
  });

  app.get('/api/document-approvals/:id', isAuthenticated, async (req: any, res) => {
    try {
      const approval = await storage.getDocumentApproval(req.params.id);
      
      if (!approval) {
        return res.status(404).json({ message: "Document approval not found" });
      }
      
      res.json(approval);
    } catch (error) {
      console.error("Error fetching document approval:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: "Failed to fetch document approval" });
    }
  });

  app.post('/api/document-approvals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const approvalData = insertDocumentApprovalSchema.parse(req.body);
      
      const approval = await storage.createDocumentApproval(approvalData);
      
      await createAuditLog(
        userId,
        'create_document_approval',
        undefined,
        req,
        `Created document approval for customer ${approval.customerId}`
      );
      
      res.json(approval);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating document approval:", error);
      await logSystemError(error, req);
      res.status(400).json({ message: error.message || "Failed to create document approval" });
    }
  });

  app.patch('/api/document-approvals/:id', isAuthenticated, requireEditor, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const approvalData = insertDocumentApprovalSchema.partial().parse(req.body);
      
      const approval = await storage.updateDocumentApproval(req.params.id, approvalData);
      
      await createAuditLog(
        userId,
        'update_document_approval',
        undefined,
        req,
        `Updated document approval ${approval.id}`
      );
      
      res.json(approval);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error updating document approval:", error);
      res.status(400).json({ message: error.message || "Failed to update document approval" });
    }
  });

  app.delete('/api/document-approvals/:id', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const approval = await storage.getDocumentApproval(req.params.id);
      
      if (!approval) {
        return res.status(404).json({ message: "Document approval not found" });
      }
      
      await storage.deleteDocumentApproval(req.params.id, userId);
      
      await createAuditLog(
        userId,
        'delete_document_approval',
        undefined,
        req,
        `Deleted document approval ${approval.id}`
      );
      
      res.json({ message: "Document approval deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting document approval:", error);
      res.status(500).json({ message: error.message || "Failed to delete document approval" });
    }
  });

  app.post('/api/document-approvals/:id/approve', isAuthenticated, requireEditor, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { notes } = req.body;
      
      const approval = await storage.updateDocumentApproval(req.params.id, {
        status: 'approved',
        reviewedBy: userId,
        reviewedAt: new Date(),
        notes: notes || undefined,
      });
      
      await createAuditLog(
        userId,
        'approve_document',
        undefined,
        req,
        `Approved document ${approval.documentType} for customer ${approval.customerId}`
      );
      
      res.json(approval);
    } catch (error: any) {
      console.error("Error approving document:", error);
      res.status(400).json({ message: error.message || "Failed to approve document" });
    }
  });

  app.post('/api/document-approvals/:id/reject', isAuthenticated, requireEditor, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { rejectionReason } = req.body;
      
      if (!rejectionReason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }
      
      const approval = await storage.updateDocumentApproval(req.params.id, {
        status: 'rejected',
        reviewedBy: userId,
        reviewedAt: new Date(),
        rejectionReason,
      });
      
      await createAuditLog(
        userId,
        'reject_document',
        undefined,
        req,
        `Rejected document ${approval.documentType} for customer ${approval.customerId}: ${rejectionReason}`
      );
      
      res.json(approval);
    } catch (error: any) {
      console.error("Error rejecting document:", error);
      res.status(400).json({ message: error.message || "Failed to reject document" });
    }
  });

  // Support Tickets routes
  app.get('/api/support-tickets', isAuthenticated, async (req: any, res) => {
    try {
      const { status, priority, category, customerId, assignedTo } = req.query;
      const filters: any = {};
      
      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (category) filters.category = category;
      if (customerId) filters.customerId = customerId;
      if (assignedTo) filters.assignedTo = assignedTo;
      
      const tickets = await storage.getSupportTickets(filters);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  app.get('/api/support-tickets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const ticket = await storage.getSupportTicket(req.params.id);
      
      if (!ticket) {
        return res.status(404).json({ message: "Support ticket not found" });
      }
      
      res.json(ticket);
    } catch (error) {
      console.error("Error fetching support ticket:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: "Failed to fetch support ticket" });
    }
  });

  app.post('/api/support-tickets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const ticketData = insertSupportTicketSchema.parse(req.body);
      
      const ticket = await storage.createSupportTicket(ticketData);
      
      await createAuditLog(
        userId,
        'create_support_ticket',
        undefined,
        req,
        `Created support ticket ${ticket.ticketNumber}`
      );
      
      res.json(ticket);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating support ticket:", error);
      await logSystemError(error, req);
      res.status(400).json({ message: error.message || "Failed to create support ticket" });
    }
  });

  app.patch('/api/support-tickets/:id', isAuthenticated, requireEditor, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const ticketData = insertSupportTicketSchema.partial().parse(req.body);
      
      const ticket = await storage.updateSupportTicket(req.params.id, ticketData);
      
      await createAuditLog(
        userId,
        'update_support_ticket',
        undefined,
        req,
        `Updated support ticket ${ticket.ticketNumber}`
      );
      
      res.json(ticket);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error updating support ticket:", error);
      res.status(400).json({ message: error.message || "Failed to update support ticket" });
    }
  });

  app.delete('/api/support-tickets/:id', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const ticket = await storage.getSupportTicket(req.params.id);
      
      if (!ticket) {
        return res.status(404).json({ message: "Support ticket not found" });
      }
      
      await storage.deleteSupportTicket(req.params.id, userId);
      
      await createAuditLog(
        userId,
        'delete_support_ticket',
        undefined,
        req,
        `Deleted support ticket ${ticket.ticketNumber}`
      );
      
      res.json({ message: "Support ticket deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting support ticket:", error);
      res.status(500).json({ message: error.message || "Failed to delete support ticket" });
    }
  });

  app.post('/api/support-tickets/:id/assign', isAuthenticated, requireEditor, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { assignedTo } = req.body;
      
      if (!assignedTo) {
        return res.status(400).json({ message: "assignedTo user ID is required" });
      }
      
      const ticket = await storage.updateSupportTicket(req.params.id, {
        assignedTo,
        status: 'in_progress',
      });
      
      await createAuditLog(
        userId,
        'assign_support_ticket',
        undefined,
        req,
        `Assigned support ticket ${ticket.ticketNumber} to user ${assignedTo}`
      );
      
      res.json(ticket);
    } catch (error: any) {
      console.error("Error assigning support ticket:", error);
      res.status(400).json({ message: error.message || "Failed to assign support ticket" });
    }
  });

  app.post('/api/support-tickets/:id/resolve', isAuthenticated, requireEditor, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { resolution } = req.body;
      
      if (!resolution) {
        return res.status(400).json({ message: "Resolution is required" });
      }
      
      const ticket = await storage.updateSupportTicket(req.params.id, {
        status: 'resolved',
        resolution,
        resolvedAt: new Date(),
      });
      
      await createAuditLog(
        userId,
        'resolve_support_ticket',
        undefined,
        req,
        `Resolved support ticket ${ticket.ticketNumber}`
      );
      
      res.json(ticket);
    } catch (error: any) {
      console.error("Error resolving support ticket:", error);
      res.status(400).json({ message: error.message || "Failed to resolve support ticket" });
    }
  });

  // Push Notification Tokens routes
  app.get('/api/push-tokens', isAuthenticated, async (req: any, res) => {
    try {
      const { userId, customerId, platform, isActive } = req.query;
      const filters: any = {};
      
      if (userId) filters.userId = userId;
      if (customerId) filters.customerId = customerId;
      if (platform) filters.platform = platform;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      
      const tokens = await storage.getPushNotificationTokens(filters);
      res.json(tokens);
    } catch (error) {
      console.error("Error fetching push tokens:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: "Failed to fetch push tokens" });
    }
  });

  app.get('/api/push-tokens/:id', isAuthenticated, async (req: any, res) => {
    try {
      const token = await storage.getPushNotificationToken(req.params.id);
      
      if (!token) {
        return res.status(404).json({ message: "Push token not found" });
      }
      
      res.json(token);
    } catch (error) {
      console.error("Error fetching push token:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: "Failed to fetch push token" });
    }
  });

  app.post('/api/push-tokens', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const tokenData = insertPushNotificationTokenSchema.parse(req.body);
      
      const token = await storage.createPushNotificationToken(tokenData);
      
      await createAuditLog(
        userId,
        'register_push_token',
        undefined,
        req,
        `Registered push notification token for ${tokenData.userId ? 'user' : 'customer'}`
      );
      
      res.json(token);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error registering push token:", error);
      await logSystemError(error, req);
      res.status(400).json({ message: error.message || "Failed to register push token" });
    }
  });

  app.patch('/api/push-tokens/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const tokenData = insertPushNotificationTokenSchema.partial().parse(req.body);
      
      const token = await storage.updatePushNotificationToken(req.params.id, tokenData);
      
      await createAuditLog(
        userId,
        'update_push_token',
        undefined,
        req,
        `Updated push notification token ${token.id}`
      );
      
      res.json(token);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error updating push token:", error);
      res.status(400).json({ message: error.message || "Failed to update push token" });
    }
  });

  app.delete('/api/push-tokens/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const token = await storage.getPushNotificationToken(req.params.id);
      
      if (!token) {
        return res.status(404).json({ message: "Push token not found" });
      }
      
      await storage.deletePushNotificationToken(req.params.id);
      
      await createAuditLog(
        userId,
        'delete_push_token',
        undefined,
        req,
        `Deleted push notification token ${token.id}`
      );
      
      res.json({ message: "Push token deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting push token:", error);
      res.status(500).json({ message: error.message || "Failed to delete push token" });
    }
  });

  app.post('/api/push-tokens/:id/activate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const token = await storage.updatePushNotificationToken(req.params.id, {
        isActive: true,
        lastUsedAt: new Date(),
      });
      
      await createAuditLog(
        userId,
        'activate_push_token',
        undefined,
        req,
        `Activated push notification token ${token.id}`
      );
      
      res.json(token);
    } catch (error: any) {
      console.error("Error activating push token:", error);
      res.status(400).json({ message: error.message || "Failed to activate push token" });
    }
  });

  app.post('/api/push-tokens/:id/deactivate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const token = await storage.updatePushNotificationToken(req.params.id, {
        isActive: false,
      });
      
      await createAuditLog(
        userId,
        'deactivate_push_token',
        undefined,
        req,
        `Deactivated push notification token ${token.id}`
      );
      
      res.json(token);
    } catch (error: any) {
      console.error("Error deactivating push token:", error);
      res.status(400).json({ message: error.message || "Failed to deactivate push token" });
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
        req,
        `Acknowledged system error ${error.id} (${error.errorType})`
      );
      
      res.json(error);
    } catch (error: any) {
      console.error("Error acknowledging system error:", error);
      res.status(400).json({ message: error.message || "Failed to acknowledge system error" });
    }
  });

  app.post('/api/system-errors/:id/mark-sent', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const error = await storage.markErrorSentToSupport(req.params.id);
      res.json(error);
    } catch (error: any) {
      console.error("Error marking system error as sent:", error);
      res.status(400).json({ message: error.message || "Failed to mark error as sent" });
    }
  });

  // Log system error with automatic screenshot (public endpoint for client-side error logging)
  app.post('/api/system-errors/log', async (req: any, res) => {
    try {
      const { errorType, errorMessage, errorStack, endpoint, method, userAgent, additionalData, screenshot } = req.body;
      
      const userId = req.user?.id; // May be null if user not authenticated
      const ipAddress = req.ip || req.connection.remoteAddress;
      
      const errorData = {
        errorType: errorType || 'ClientError',
        errorMessage: errorMessage || 'Unknown error',
        errorStack,
        userId,
        endpoint,
        method,
        ipAddress,
        userAgent,
        additionalData,
        screenshot, // Automatically captured screenshot from client
        acknowledged: false,
        sentToSupport: false,
      };
      
      const error = await storage.createSystemError(errorData);
      res.json({ success: true, errorId: error.id });
    } catch (error: any) {
      console.error("Error logging system error:", error);
      res.status(500).json({ message: error.message || "Failed to log error" });
    }
  });

  // Access log routes (Admin, Manager, or users with canAccessAppAccessReport toggle)
  app.get('/api/access-logs', isAuthenticated, requireAppAccessReportAccess, async (req: any, res) => {
    try {
      // Validate query parameters with Zod
      const accessLogFiltersSchema = z.object({
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        outcome: z.enum(['success', 'failure']).optional(),
        username: z.string().min(1).max(100).optional(),
        ipAddress: z.string().ip().optional(),
        country: z.string().min(1).max(100).optional(),
        limit: z.coerce.number().int().min(1).max(100).default(50),
        offset: z.coerce.number().int().min(0).default(0),
      });

      const validation = accessLogFiltersSchema.safeParse(req.query);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid query parameters",
          errors: fromZodError(validation.error).toString()
        });
      }

      const { startDate, endDate, outcome, username, ipAddress, country, limit, offset } = validation.data;

      const filters: any = {
        limit,
        offset,
      };
      
      if (startDate) filters.startDate = new Date(startDate);
      if (endDate) filters.endDate = new Date(endDate);
      if (outcome) filters.outcome = outcome;
      if (username) filters.username = username;
      if (ipAddress) filters.ipAddress = ipAddress;
      if (country) filters.country = country;

      const result = await storage.getAccessLogs(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching access logs:", error);
      res.status(500).json({ message: "Failed to fetch access logs" });
    }
  });

  app.delete('/api/access-logs/purge', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { beforeDate } = req.body;
      
      if (!beforeDate) {
        return res.status(400).json({ message: "beforeDate is required" });
      }

      const deleted = await storage.purgeAccessLogs(new Date(beforeDate));
      
      // Log the purge action
      await storage.createAuditLog({
        userId: req.user.id,
        action: 'purge_access_logs',
        ipAddress: req.ip || req.connection.remoteAddress,
        details: `Purged ${deleted} access log entries before ${beforeDate}`,
      });

      res.json({ success: true, deleted });
    } catch (error: any) {
      console.error("Error purging access logs:", error);
      res.status(500).json({ message: error.message || "Failed to purge access logs" });
    }
  });

  // Analytics routes (Admin and Manager, or users with canAccessReports toggle)
  app.get('/api/analytics/driver-availability', isAuthenticated, requireReportsAccess, async (req: any, res) => {
    try {
      const availability = await storage.getDriverAvailabilitySummary();
      res.json(availability);
    } catch (error) {
      console.error("Error fetching driver availability:", error);
      res.status(500).json({ message: "Failed to fetch driver availability" });
    }
  });

  app.get('/api/analytics/revenue', isAuthenticated, requireReportsAccess, async (req: any, res) => {
    try {
      const analytics = await storage.getRevenueAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ message: "Failed to fetch revenue analytics" });
    }
  });

  app.get('/api/analytics/operations', isAuthenticated, requireReportsAccess, async (req: any, res) => {
    try {
      const analytics = await storage.getOperationalAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching operational analytics:", error);
      res.status(500).json({ message: "Failed to fetch operational analytics" });
    }
  });

  app.get('/api/analytics/customers', isAuthenticated, requireReportsAccess, async (req: any, res) => {
    try {
      const analytics = await storage.getCustomerAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching customer analytics:", error);
      res.status(500).json({ message: "Failed to fetch customer analytics" });
    }
  });

  app.get('/api/analytics/revenue-trend', isAuthenticated, requireReportsAccess, async (req: any, res) => {
    try {
      const months = parseInt(req.query.months as string) || 12;
      const trend = await storage.getRevenueTrend(months);
      res.json(trend);
    } catch (error) {
      console.error("Error fetching revenue trend:", error);
      res.status(500).json({ message: "Failed to fetch revenue trend" });
    }
  });

  app.get('/api/analytics/contract-volume', isAuthenticated, requireReportsAccess, async (req: any, res) => {
    try {
      const months = parseInt(req.query.months as string) || 6;
      const volume = await storage.getContractVolumeTrend(months);
      res.json(volume);
    } catch (error) {
      console.error("Error fetching contract volume:", error);
      res.status(500).json({ message: "Failed to fetch contract volume" });
    }
  });

  // Dashboard-specific analytics endpoints (requires authentication, no specific report permission)
  app.get('/api/analytics/fleet-status', isAuthenticated, async (req: any, res) => {
    try {
      const distribution = await storage.getFleetStatusDistribution();
      res.json(distribution);
    } catch (error) {
      console.error("Error fetching fleet status distribution:", error);
      res.status(500).json({ message: "Failed to fetch fleet status distribution" });
    }
  });

  app.get('/api/analytics/geographic-distribution', isAuthenticated, async (req: any, res) => {
    try {
      const distribution = await storage.getGeographicDistribution();
      res.json(distribution);
    } catch (error) {
      console.error("Error fetching geographic distribution:", error);
      res.status(500).json({ message: "Failed to fetch geographic distribution" });
    }
  });

  app.get('/api/analytics/geographic-distribution-uae', isAuthenticated, async (req: any, res) => {
    try {
      const distribution = await storage.getGeographicDistributionUAE();
      res.json(distribution);
    } catch (error) {
      console.error("Error fetching UAE geographic distribution:", error);
      res.status(500).json({ message: "Failed to fetch UAE geographic distribution" });
    }
  });

  app.get('/api/analytics/pending-actions', isAuthenticated, async (req: any, res) => {
    try {
      const actions = await storage.getPendingActions();
      res.json(actions);
    } catch (error) {
      console.error("Error fetching pending actions:", error);
      res.status(500).json({ message: "Failed to fetch pending actions" });
    }
  });

  app.get('/api/analytics/top-performers', isAuthenticated, async (req: any, res) => {
    try {
      const performers = await storage.getTopPerformers();
      res.json(performers);
    } catch (error) {
      console.error("Error fetching top performers:", error);
      res.status(500).json({ message: "Failed to fetch top performers" });
    }
  });

  // Reports routes (Admin and Manager, or users with canAccessReports toggle) with date range support
  app.get('/api/reports/financial', isAuthenticated, requireReportsAccess, async (req: any, res) => {
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

  app.get('/api/reports/operational', isAuthenticated, requireReportsAccess, async (req: any, res) => {
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

  app.get('/api/reports/customers', isAuthenticated, requireReportsAccess, async (req: any, res) => {
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

  app.get('/api/reports/audit', isAuthenticated, requireReportsAccess, async (req: any, res) => {
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

  app.get('/api/reports/driver-utilization', isAuthenticated, requireReportsAccess, async (req: any, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const report = await storage.getDriverUtilizationReport(startDate, endDate);
      res.json(report);
    } catch (error) {
      console.error("Error fetching driver utilization report:", error);
      res.status(500).json({ message: "Failed to fetch driver utilization report" });
    }
  });

  app.get('/api/reports/driver-revenue-cost', isAuthenticated, requireReportsAccess, async (req: any, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const report = await storage.getDriverRevenueCostReport(startDate, endDate);
      res.json(report);
    } catch (error) {
      console.error("Error fetching driver revenue-cost report:", error);
      res.status(500).json({ message: "Failed to fetch driver revenue-cost report" });
    }
  });

  // Export endpoints (requires reports access)
  app.post('/api/reports/financial/export', isAuthenticated, requireReportsAccess, async (req: any, res) => {
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
          const docWithTable = doc as any;
          addPDFChartImages(doc, charts, docWithTable.lastAutoTable ? docWithTable.lastAutoTable.finalY + 10 : currentY + 10);
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

  app.post('/api/reports/operational/export', isAuthenticated, requireReportsAccess, async (req: any, res) => {
    try {
      const { format: exportFormat, startDate: startDateParam, endDate: endDateParam, lang, activeTab } = req.query; // Task 14: Get active tab
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
        // Task 14: Determine report title based on active tab
        const reportTitles = {
          utilization: 'Vehicle Utilization Report',
          status: 'Contract Status Report',
          charges: 'Extra Charges Report'
        };
        const reportTitle = reportTitles[activeTab as keyof typeof reportTitles] || 'Operational Report';
        
        const doc = createPDF(
          reportTitle,
          {
            nameEn: settings.companyNameEn,
            nameAr: settings.companyNameAr,
            phone: settings.phone || undefined,
            email: settings.email || undefined,
          },
          isRTL
        );

        let currentY = 55;

        // Task 14: Conditionally add content based on active tab
        if (activeTab === 'utilization') {
          // Add utilization summary section
          currentY = addPDFSummarySection(doc, 'Vehicle Utilization Summary', [
            { label: 'Total Vehicles', value: report.utilization.totalVehicles.toString() },
            { label: 'Active Vehicles', value: report.utilization.activeVehicles.toString() },
            { label: 'Utilization Rate', value: formatPercentage(report.utilization.utilizationRate) },
          ], currentY);

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
        } else if (activeTab === 'status') {
          // Add contract status summary
          currentY = addPDFSummarySection(doc, 'Contract Status Distribution', [
            { label: 'Draft', value: report.statusSummary.draft.toString() },
            { label: 'Active', value: report.statusSummary.active.toString() },
            { label: 'Completed', value: report.statusSummary.completed.toString() },
            { label: 'Closed', value: report.statusSummary.closed.toString() },
          ], currentY);
        } else if (activeTab === 'charges') {
          // Add extra charges summary
          currentY = addPDFSummarySection(doc, 'Extra Charges Summary', [
            { label: 'Total Extra Charges', value: `${report.extraCharges.total.toFixed(2)} ${settings.currencyEn || 'AED'}` },
            { label: 'Average per Contract', value: `${report.extraCharges.average.toFixed(2)} ${settings.currencyEn || 'AED'}` },
            { label: 'Contracts with Charges', value: report.extraCharges.contracts.length.toString() },
          ], currentY);

          // Add extra charges table
          if (report.extraCharges.contracts.length > 0) {
            currentY += 5;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Contracts with Extra Charges', 14, currentY);
            
            const chargesData = report.extraCharges.contracts.slice(0, 15).map((item: any) => [
              `#${item.contractNumber}`,
              item.customerName || 'N/A',
              item.extraKmCharge.toFixed(2),
              item.fuelCharge.toFixed(2),
              item.damageCharge.toFixed(2),
              item.otherCharges.toFixed(2),
              item.totalExtraCharges.toFixed(2)
            ]);
            
            addPDFTable(doc, ['Contract', 'Customer', 'Extra KM', 'Fuel', 'Damage', 'Other', 'Total'], chargesData, currentY + 5);
          }
        }

        // Add charts if provided
        if (charts && charts.length > 0) {
          const docWithTable = doc as any;
          addPDFChartImages(doc, charts, docWithTable.lastAutoTable ? docWithTable.lastAutoTable.finalY + 10 : currentY + 10);
        }

        // Send PDF
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="operational-report-${format(new Date(), 'yyyy-MM-dd')}.pdf"`);
        res.send(pdfBuffer);
      } else if (exportFormat === 'excel') {
        const wb = createExcelWorkbook();
        
        // Task 14: Conditionally add sheets based on active tab
        if (activeTab === 'utilization') {
          // Utilization summary sheet
          const summaryData = [
            { Metric: 'Total Vehicles', Value: report.utilization.totalVehicles },
            { Metric: 'Active Vehicles', Value: report.utilization.activeVehicles },
            { Metric: 'Utilization Rate (%)', Value: report.utilization.utilizationRate },
          ];
          addExcelSheet(wb, 'Utilization Summary', summaryData);
          
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
        } else if (activeTab === 'status') {
          // Contract status sheet only
          const statusData = [
            { Status: 'Draft', Count: report.statusSummary.draft },
            { Status: 'Active', Count: report.statusSummary.active },
            { Status: 'Completed', Count: report.statusSummary.completed },
            { Status: 'Closed', Count: report.statusSummary.closed },
          ];
          addExcelSheet(wb, 'Contract Status', statusData);
        } else if (activeTab === 'charges') {
          // Extra charges summary sheet
          const chargesSummaryData = [
            { Metric: 'Total Extra Charges', Value: report.extraCharges.total },
            { Metric: 'Average per Contract', Value: report.extraCharges.average },
            { Metric: 'Contracts with Charges', Value: report.extraCharges.contracts.length },
          ];
          addExcelSheet(wb, 'Charges Summary', chargesSummaryData);
          
          // Extra charges details sheet
          const chargesDetailsData = report.extraCharges.contracts.map((item: any) => ({
            'Contract Number': `#${item.contractNumber}`,
            Customer: item.customerName || 'N/A',
            'Extra KM Charge': item.extraKmCharge,
            'Fuel Charge': item.fuelCharge,
            'Damage Charge': item.damageCharge,
            'Other Charges': item.otherCharges,
            'Total Extra Charges': item.totalExtraCharges
          }));
          addExcelSheet(wb, 'Charges Details', chargesDetailsData);
        }
        
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

  app.post('/api/reports/customers/export', isAuthenticated, requireReportsAccess, async (req: any, res) => {
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
          
          const customerData = report.customerActivity.map(item => [
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
          const docWithTable = doc as any;
          addPDFChartImages(doc, charts, docWithTable.lastAutoTable ? docWithTable.lastAutoTable.finalY + 10 : currentY + 10);
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

  app.get('/api/reports/audit/export', isAuthenticated, requireReportsAccess, async (req: any, res) => {
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

  // Insurance Report routes (requireReportsAccess)
  app.get('/api/reports/insurance', isAuthenticated, requireReportsAccess, async (req: any, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const report = await storage.getInsuranceReport(startDate, endDate);
      res.json(report);
    } catch (error) {
      console.error("Error fetching insurance report:", error);
      res.status(500).json({ message: "Failed to fetch insurance report" });
    }
  });

  app.post('/api/reports/insurance/export', isAuthenticated, requireReportsAccess, async (req: any, res) => {
    try {
      const { format: exportFormat, startDate: startDateParam, endDate: endDateParam, lang } = req.query;
      const { charts = [] } = req.body;
      const startDate = startDateParam ? new Date(startDateParam as string) : undefined;
      const endDate = endDateParam ? new Date(endDateParam as string) : undefined;
      const isRTL = lang === 'ar';
      
      const report = await storage.getInsuranceReport(startDate, endDate);
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
          'Insurance Claims Report',
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
          { label: 'Total Claims', value: report.summary.totalClaims.toString() },
          { label: 'Pending Claims', value: report.summary.pendingClaims.toString() },
          { label: 'Approved Claims', value: report.summary.approvedClaims.toString() },
          { label: 'Settled Claims', value: report.summary.settledClaims.toString() },
          { label: 'Total Claim Amount', value: formatCurrency(report.summary.totalClaimAmount, currency) },
          { label: 'Total Settled Amount', value: formatCurrency(report.summary.totalSettledAmount, currency) },
        ], 55);

        // Add claims by status table
        if (report.claimsByStatus.length > 0) {
          currentY += 5;
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('Claims by Status', 14, currentY);
          
          const statusData = report.claimsByStatus.map(item => [
            item.status.charAt(0).toUpperCase() + item.status.slice(1),
            item.count.toString(),
            formatCurrency(item.totalAmount, currency)
          ]);
          
          addPDFTable(doc, ['Status', 'Count', 'Total Amount'], statusData, currentY + 5);
        }
        
        // Add charts if available
        if (charts && charts.length > 0) {
          const docWithTable = doc as any;
          addPDFChartImages(doc, charts, docWithTable.lastAutoTable ? docWithTable.lastAutoTable.finalY + 10 : currentY + 10);
        }

        // Send PDF
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="insurance-report-${format(new Date(), 'yyyy-MM-dd')}.pdf"`);
        res.send(pdfBuffer);
      } else if (exportFormat === 'excel') {
        const wb = createExcelWorkbook();
        
        // Summary sheet
        const summaryData = [
          { Metric: 'Total Claims', Value: report.summary.totalClaims },
          { Metric: 'Pending Claims', Value: report.summary.pendingClaims },
          { Metric: 'Approved Claims', Value: report.summary.approvedClaims },
          { Metric: 'Rejected Claims', Value: report.summary.rejectedClaims },
          { Metric: 'Settled Claims', Value: report.summary.settledClaims },
          { Metric: 'Total Claim Amount', Value: formatCurrency(report.summary.totalClaimAmount, currency) },
          { Metric: 'Total Approved Amount', Value: formatCurrency(report.summary.totalApprovedAmount, currency) },
          { Metric: 'Total Settled Amount', Value: formatCurrency(report.summary.totalSettledAmount, currency) },
        ];
        addExcelSheet(wb, 'Summary', summaryData);
        
        // Claims by status sheet
        const statusData = report.claimsByStatus.map(item => ({
          Status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
          Count: item.count,
          'Total Amount': formatCurrency(item.totalAmount, currency)
        }));
        addExcelSheet(wb, 'By Status', statusData);
        
        // Monthly trend sheet
        if (report.monthlyTrend.length > 0) {
          const trendData = report.monthlyTrend.map(item => ({
            Month: item.month,
            'Claim Count': item.claimCount,
            'Claim Amount': formatCurrency(item.claimAmount, currency)
          }));
          addExcelSheet(wb, 'Monthly Trend', trendData);
        }
        
        // Claims by insurer sheet
        if (report.claimsByInsurer.length > 0) {
          const insurerData = report.claimsByInsurer.map(item => ({
            'Insurance Company': item.insuranceCompany,
            'Claim Count': item.claimCount,
            'Total Amount': formatCurrency(item.totalAmount, currency)
          }));
          addExcelSheet(wb, 'By Insurer', insurerData);
        }
        
        // Recent claims sheet
        if (report.recentClaims.length > 0) {
          const claimsData = report.recentClaims.map(claim => ({
            'Claim Number': claim.claimNumber,
            'Contract': `#${claim.contractNumber}`,
            'Claimant': claim.claimantName,
            'Insurer': claim.insuranceCompany,
            Amount: formatCurrency(claim.claimAmount, currency),
            Status: claim.claimStatus,
            'Claim Date': formatDate(new Date(claim.claimDate)),
            'Incident Date': formatDate(new Date(claim.incidentDate))
          }));
          addExcelSheet(wb, 'Recent Claims', claimsData);
        }
        
        // Add chart images if available
        if (charts && charts.length > 0) {
          addExcelChartSheet(wb, 'Charts', charts);
        }
        
        const buffer = exportExcelToBuffer(wb);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="insurance-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx"`);
        res.send(buffer);
      } else {
        res.status(400).json({ message: 'Invalid export format. Use "pdf" or "excel".' });
      }
    } catch (error) {
      console.error("Error exporting insurance report:", error);
      res.status(500).json({ message: "Failed to export insurance report" });
    }
  });

  // Public endpoint for company branding (no auth required)
  app.get('/api/branding', async (req, res) => {
    try {
      const settings = await storage.getCompanySettings();
      // Return only safe branding information
      res.json({
        companyNameEn: settings.companyNameEn,
        companyNameAr: settings.companyNameAr,
        logoUrl: settings.logoUrl,
      });
    } catch (error) {
      console.error("Error fetching company branding:", error);
      res.status(500).json({ message: "Failed to fetch company branding" });
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

  // Insurance Claims endpoints
  app.get('/api/insurance-claims', isAuthenticated, async (req: any, res) => {
    try {
      const { contractId, vehicleId, status } = req.query;
      const filters: any = {};
      
      if (contractId) filters.contractId = contractId;
      if (vehicleId) filters.vehicleId = vehicleId;
      if (status) filters.status = status;
      
      const claims = await storage.getInsuranceClaims(filters);
      res.json(claims);
    } catch (error: any) {
      console.error("Error fetching insurance claims:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: "Failed to fetch insurance claims" });
    }
  });

  app.get('/api/insurance-claims/:id', isAuthenticated, async (req: any, res) => {
    try {
      const claim = await storage.getInsuranceClaimById(req.params.id);
      if (!claim) {
        return res.status(404).json({ message: "Insurance claim not found" });
      }
      res.json(claim);
    } catch (error: any) {
      console.error("Error fetching insurance claim:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: "Failed to fetch insurance claim" });
    }
  });

  app.post('/api/insurance-claims', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Validate the request body
      const validatedData = insertInsuranceClaimSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const claim = await storage.createInsuranceClaim(validatedData);
      
      // Create audit log
      await createAuditLog(
        userId,
        'create_insurance_claim',
        claim.contractId,
        req,
        `Created insurance claim ${claim.claimNumber}`
      );
      
      res.status(201).json(claim);
    } catch (error: any) {
      console.error("Error creating insurance claim:", error);
      await logSystemError(error, req);
      
      if (error.name === 'ZodError') {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: error.message || "Failed to create insurance claim" });
    }
  });

  app.patch('/api/insurance-claims/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const claimId = req.params.id;
      
      // Check if claim exists
      const existingClaim = await storage.getInsuranceClaimById(claimId);
      if (!existingClaim) {
        return res.status(404).json({ message: "Insurance claim not found" });
      }
      
      // Update the claim
      const updatedClaim = await storage.updateInsuranceClaim(claimId, req.body);
      
      // Create audit log
      await createAuditLog(
        userId,
        'update_insurance_claim',
        updatedClaim.contractId,
        req,
        `Updated insurance claim ${updatedClaim.claimNumber}`
      );
      
      res.json(updatedClaim);
    } catch (error: any) {
      console.error("Error updating insurance claim:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: error.message || "Failed to update insurance claim" });
    }
  });

  app.delete('/api/insurance-claims/:id', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const claimId = req.params.id;
      
      // Check if claim exists
      const existingClaim = await storage.getInsuranceClaimById(claimId);
      if (!existingClaim) {
        return res.status(404).json({ message: "Insurance claim not found" });
      }
      
      await storage.disableInsuranceClaim(claimId);
      
      // Create audit log
      await createAuditLog(
        userId,
        'delete_insurance_claim',
        existingClaim.contractId,
        req,
        `Deleted insurance claim ${existingClaim.claimNumber}`
      );
      
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting insurance claim:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: error.message || "Failed to delete insurance claim" });
    }
  });

  // ==================== MOBILE API ENDPOINTS ====================
  // NOTE: These endpoints are designed for mobile app consumption (customer & staff apps)
  // They use session-based authentication for now. Future: migrate to JWT tokens.

  // Helper middleware to verify customer authentication
  // For now, customers authenticate using the same system as staff but are stored in customers table
  // In the future, this will use JWT token authentication
  const isCustomerAuthenticated = async (req: any, res: any, next: any) => {
    // For MVP: Customers can authenticate using session (similar to staff)
    // In production: Use JWT token authentication
    // For now, we'll accept authenticated users and allow them to access customer data if they provide a customerId
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // ==================== CUSTOMER MOBILE ENDPOINTS ====================
  
  // GET /api/mobile/customer/profile - Get customer's own profile
  app.get('/api/mobile/customer/profile', requireCustomerAuth, isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.query.customerId;
      
      if (!customerId) {
        return res.status(400).json({ message: "Customer ID required" });
      }
      
      // CRITICAL FIX 3: Verify customer ownership
      const authorized = await verifyCustomerOwnership(req, customerId);
      if (!authorized) {
        return res.status(403).json({ message: "Access denied: Invalid customer ID" });
      }
      
      const customer = await storage.getCustomerById(customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Get contracts count and active rentals
      const allContracts = await storage.getAllContracts();
      const customerContracts = allContracts.filter(c => c.customerId === customerId && !c.disabled);
      const activeRentals = customerContracts.filter(c => c.status === 'active');
      
      // P0-2: Get payment history summary with validated inputs
      let totalPaid = 0;
      let totalOutstanding = 0;
      for (const contract of customerContracts) {
        const payments = await storage.getPaymentsByContract(contract.id);
        totalPaid += payments.reduce((sum, p) => {
          return sum + validateFinancialInput(p.amount || '0', 'payment amount');
        }, 0);
        totalOutstanding += validateFinancialInput(contract.outstandingBalance || '0', 'outstanding balance');
      }
      
      // Return optimized response with essential fields only
      res.json({
        id: customer.id,
        nameEn: customer.nameEn,
        nameAr: customer.nameAr,
        phone: customer.phone,
        email: customer.email,
        nationalId: customer.nationalId,
        licenseNumber: customer.licenseNumber,
        stats: {
          totalContracts: customerContracts.length,
          activeRentals: activeRentals.length,
          totalPaid: totalPaid.toFixed(2),
          totalOutstanding: totalOutstanding.toFixed(2),
        },
      });
    } catch (error: any) {
      console.error("Error fetching customer profile:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: error.message || "Failed to fetch profile" });
    }
  });

  // GET /api/mobile/customer/contracts - Get customer's own contracts
  app.get('/api/mobile/customer/contracts', requireCustomerAuth, isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.query.customerId;
      const status = req.query.status as string | undefined;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      if (!customerId) {
        return res.status(400).json({ message: "Customer ID required" });
      }
      
      // CRITICAL FIX 3: Verify customer ownership
      const authorized = await verifyCustomerOwnership(req, customerId);
      if (!authorized) {
        return res.status(403).json({ message: "Access denied: Invalid customer ID" });
      }
      
      // Get all contracts and filter by customer
      const allContracts = await storage.getAllContracts();
      let customerContracts = allContracts.filter(c => c.customerId === customerId && !c.disabled);
      
      // Filter by status if provided
      if (status) {
        customerContracts = customerContracts.filter(c => c.status === status);
      }
      
      // Sort by creation date descending
      customerContracts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Apply pagination
      const paginatedContracts = customerContracts.slice(offset, offset + limit);
      
      // Enrich with vehicle and payment info
      const enrichedContracts = await Promise.all(paginatedContracts.map(async (contract) => {
        const vehicle = contract.vehicle;
        const payments = await storage.getPaymentsByContract(contract.id);
        
        // P0-2: Validate payment amounts
        const totalPaid = payments.reduce((sum, p) => {
          return sum + validateFinancialInput(p.amount || '0', 'payment amount');
        }, 0);
        
        return {
          id: contract.id,
          contractNumber: contract.contractNumber,
          status: contract.status,
          rentalStartDate: contract.rentalStartDate,
          rentalEndDate: contract.rentalEndDate,
          totalAmount: contract.totalAmount,
          outstandingBalance: contract.outstandingBalance,
          paymentStatus: contract.paymentStatus,
          vehicle: {
            make: vehicle?.make,
            model: vehicle?.model,
            year: vehicle?.year,
            registration: vehicle?.registration,
            color: vehicle?.color,
          },
          payments: {
            total: totalPaid.toFixed(2),
            count: payments.length,
          },
        };
      }));
      
      res.json({
        contracts: enrichedContracts,
        pagination: {
          total: customerContracts.length,
          limit,
          offset,
          hasMore: offset + limit < customerContracts.length,
        },
      });
    } catch (error: any) {
      console.error("Error fetching customer contracts:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: error.message || "Failed to fetch contracts" });
    }
  });

  // GET /api/mobile/customer/contracts/:id - Get single contract details
  app.get('/api/mobile/customer/contracts/:id', requireCustomerAuth, isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.query.customerId;
      const contractId = req.params.id;
      
      if (!customerId) {
        return res.status(400).json({ message: "Customer ID required" });
      }
      
      // CRITICAL FIX 3: Verify customer ownership
      const authorized = await verifyCustomerOwnership(req, customerId);
      if (!authorized) {
        return res.status(403).json({ message: "Access denied: Invalid customer ID" });
      }
      
      const contract = await storage.getContract(contractId);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Verify customer owns this contract
      if (contract.customerId !== customerId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get related data
      const payments = await storage.getPaymentsByContract(contractId);
      const inspections = await storage.getVehicleInspectionsByContract(contractId);
      const auditLogs = await storage.getContractAuditLogs(contractId);
      
      // Return full contract with related data
      res.json({
        contract: {
          ...contract,
          customer: contract.customer,
          vehicle: contract.vehicle,
        },
        payments,
        inspections,
        timeline: auditLogs,
      });
    } catch (error: any) {
      console.error("Error fetching contract details:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: error.message || "Failed to fetch contract" });
    }
  });

  // GET /api/mobile/customer/payments - Get customer's payment history
  app.get('/api/mobile/customer/payments', requireCustomerAuth, isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.query.customerId;
      const contractId = req.query.contractId as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      if (!customerId) {
        return res.status(400).json({ message: "Customer ID required" });
      }
      
      // CRITICAL FIX 3: Verify customer ownership
      const authorized = await verifyCustomerOwnership(req, customerId);
      if (!authorized) {
        return res.status(403).json({ message: "Access denied: Invalid customer ID" });
      }
      
      // Get all customer contracts
      const allContracts = await storage.getAllContracts();
      let customerContracts = allContracts.filter(c => c.customerId === customerId && !c.disabled);
      
      // Filter by specific contract if provided
      if (contractId) {
        customerContracts = customerContracts.filter(c => c.id === contractId);
      }
      
      // Get all payments for customer's contracts
      let allPayments: any[] = [];
      for (const contract of customerContracts) {
        const payments = await storage.getPaymentsByContract(contract.id);
        allPayments.push(...payments.map(p => ({
          ...p,
          contractNumber: contract.contractNumber,
          vehicleMake: contract.vehicle?.make,
          vehicleModel: contract.vehicle?.model,
        })));
      }
      
      // Filter by date range if provided
      if (startDate || endDate) {
        allPayments = allPayments.filter(p => {
          const paymentDate = new Date(p.paymentDate);
          if (startDate && paymentDate < new Date(startDate)) return false;
          if (endDate && paymentDate > new Date(endDate)) return false;
          return true;
        });
      }
      
      // Sort by payment date descending
      allPayments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
      
      // Apply pagination
      const paginatedPayments = allPayments.slice(offset, offset + limit);
      
      res.json({
        payments: paginatedPayments,
        pagination: {
          total: allPayments.length,
          limit,
          offset,
          hasMore: offset + limit < allPayments.length,
        },
      });
    } catch (error: any) {
      console.error("Error fetching customer payments:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: error.message || "Failed to fetch payments" });
    }
  });

  // POST /api/mobile/customer/renewal-request - Submit contract renewal request
  app.post('/api/mobile/customer/renewal-request', requireCustomerAuth, isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.body.customerId;
      const userId = req.user.id;
      
      if (!customerId) {
        return res.status(400).json({ message: "Customer ID required" });
      }
      
      // CRITICAL FIX 3: Verify customer ownership
      const authorized = await verifyCustomerOwnership(req, customerId);
      if (!authorized) {
        return res.status(403).json({ message: "Access denied: Invalid customer ID" });
      }
      
      // Validate contract exists and belongs to customer
      const contract = await storage.getContract(req.body.contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      if (contract.customerId !== customerId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Create renewal request with pending status
      const requestData = insertRenewalRequestSchema.parse(req.body);
      const request = await storage.createRenewalRequest({
        ...requestData,
        status: 'pending',
      });
      
      await createAuditLog(
        userId,
        'create_renewal_request',
        contract.id,
        req,
        `Customer ${customerId} submitted renewal request for contract ${contract.contractNumber}`
      );
      
      res.status(201).json({
        message: "Renewal request submitted successfully",
        request,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating renewal request:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: error.message || "Failed to submit renewal request" });
    }
  });

  // GET /api/mobile/customer/documents - Get customer's uploaded documents
  app.get('/api/mobile/customer/documents', requireCustomerAuth, isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.query.customerId;
      const status = req.query.status as string | undefined;
      const documentType = req.query.documentType as string | undefined;
      
      if (!customerId) {
        return res.status(400).json({ message: "Customer ID required" });
      }
      
      // CRITICAL FIX 3: Verify customer ownership
      const authorized = await verifyCustomerOwnership(req, customerId);
      if (!authorized) {
        return res.status(403).json({ message: "Access denied: Invalid customer ID" });
      }
      
      const filters: any = { customerId };
      if (status) filters.status = status;
      if (documentType) filters.documentType = documentType;
      
      const documents = await storage.getDocumentApprovals(filters);
      
      // Sort by creation date descending
      documents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json(documents);
    } catch (error: any) {
      console.error("Error fetching customer documents:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: error.message || "Failed to fetch documents" });
    }
  });

  // POST /api/mobile/customer/documents - Upload document for approval
  app.post('/api/mobile/customer/documents', requireCustomerAuth, isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.body.customerId;
      const userId = req.user.id;
      
      if (!customerId) {
        return res.status(400).json({ message: "Customer ID required" });
      }
      
      // CRITICAL FIX 3: Verify customer ownership
      const authorized = await verifyCustomerOwnership(req, customerId);
      if (!authorized) {
        return res.status(403).json({ message: "Access denied: Invalid customer ID" });
      }
      
      // Validate document data
      const documentData = insertDocumentApprovalSchema.parse({
        ...req.body,
        submittedBy: customerId,
        status: 'pending',
      });
      
      const document = await storage.createDocumentApproval(documentData);
      
      await createAuditLog(
        userId,
        'create_document_approval',
        undefined,
        req,
        `Customer ${customerId} uploaded ${documentData.documentType} for approval`
      );
      
      res.status(201).json({
        message: "Document uploaded successfully",
        document,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error uploading document:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: error.message || "Failed to upload document" });
    }
  });

  // GET /api/mobile/customer/support-tickets - Get customer's support tickets
  app.get('/api/mobile/customer/support-tickets', requireCustomerAuth, isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.query.customerId;
      const status = req.query.status as string | undefined;
      const category = req.query.category as string | undefined;
      
      if (!customerId) {
        return res.status(400).json({ message: "Customer ID required" });
      }
      
      // CRITICAL FIX 3: Verify customer ownership
      const authorized = await verifyCustomerOwnership(req, customerId);
      if (!authorized) {
        return res.status(403).json({ message: "Access denied: Invalid customer ID" });
      }
      
      const filters: any = { customerId };
      if (status) filters.status = status;
      if (category) filters.category = category;
      
      const tickets = await storage.getSupportTickets(filters);
      
      // Sort by creation date descending
      tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json(tickets);
    } catch (error: any) {
      console.error("Error fetching customer support tickets:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: error.message || "Failed to fetch support tickets" });
    }
  });

  // POST /api/mobile/customer/support-tickets - Create support ticket
  app.post('/api/mobile/customer/support-tickets', requireCustomerAuth, isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.body.customerId;
      const userId = req.user.id;
      
      if (!customerId) {
        return res.status(400).json({ message: "Customer ID required" });
      }
      
      // CRITICAL FIX 3: Verify customer ownership
      const authorized = await verifyCustomerOwnership(req, customerId);
      if (!authorized) {
        return res.status(403).json({ message: "Access denied: Invalid customer ID" });
      }
      
      // Auto-generate ticket number
      const year = new Date().getFullYear();
      const allTickets = await storage.getSupportTickets({});
      const ticketCount = allTickets.length + 1;
      const ticketNumber = `TKT-${year}-${ticketCount.toString().padStart(4, '0')}`;
      
      // Create support ticket
      const ticketData = insertSupportTicketSchema.parse({
        ...req.body,
        ticketNumber,
        customerId,
        status: 'open',
      });
      
      const ticket = await storage.createSupportTicket(ticketData as any);
      
      await createAuditLog(
        userId,
        'create_support_ticket',
        undefined,
        req,
        `Customer ${customerId} created support ticket ${ticketNumber}`
      );
      
      res.status(201).json({
        message: "Support ticket created successfully",
        ticket,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating support ticket:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: error.message || "Failed to create support ticket" });
    }
  });

  // POST /api/mobile/customer/report-accident - Report vehicle accident
  app.post('/api/mobile/customer/report-accident', requireCustomerAuth, isAuthenticated, async (req: any, res) => {
    // CRITICAL FIX 4: Transaction wrapping with manual rollback
    const createdRecords: { claim: any; ticket: any; audit: any } = { claim: null, ticket: null, audit: null };
    
    try {
      const customerId = req.body.customerId;
      const userId = req.user.id;
      const {
        contractId,
        incidentDate,
        location,
        description,
        severity,
        photos,
        policeReportNumber,
        injuries,
        thirdPartyInvolved,
      } = req.body;
      
      if (!customerId) {
        return res.status(400).json({ message: "Customer ID required" });
      }
      
      // CRITICAL FIX 3: Verify customer ownership
      const authorized = await verifyCustomerOwnership(req, customerId);
      if (!authorized) {
        return res.status(403).json({ message: "Access denied: Invalid customer ID" });
      }
      
      // Validate required fields
      if (!contractId || !incidentDate || !location || !description || !severity) {
        return res.status(400).json({ 
          message: "Missing required fields: contractId, incidentDate, location, description, severity" 
        });
      }
      
      // Verify contract exists and belongs to customer
      const contract = await storage.getContract(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      if (contract.customerId !== customerId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Verify contract is active
      if (contract.status !== 'active') {
        return res.status(400).json({ message: "Contract must be active to report accident" });
      }
      
      // Create insurance claim
      const year = new Date().getFullYear();
      const allClaims = await storage.getInsuranceClaims({});
      const claimCount = allClaims.length + 1;
      const claimNumber = `CLM-${year}-${claimCount.toString().padStart(4, '0')}`;
      
      const customer = await storage.getCustomerById(customerId);
      const vehicle = contract.vehicle;
      
      const claimData = {
        contractId,
        claimNumber,
        claimDate: new Date(),
        incidentDate: new Date(incidentDate),
        claimStatus: 'pending',
        claimAmount: '0', // To be assessed
        insuranceCompany: vehicle?.policyNumber ? 'Vehicle Insurance' : 'Unknown',
        policyNumber: vehicle?.policyNumber || 'N/A',
        incidentDescription: `${description}\n\nLocation: ${location}\nSeverity: ${severity}\nPolice Report: ${policeReportNumber || 'None'}\nInjuries: ${injuries ? 'Yes' : 'No'}\nThird Party: ${thirdPartyInvolved ? 'Yes' : 'No'}`,
        damageAssessment: `Awaiting assessment. Photos: ${photos?.length || 0}`,
        claimantName: customer?.nameEn || 'Unknown',
        claimantContact: customer?.phone || 'Unknown',
        witnessDetails: thirdPartyInvolved ? 'Third party involved - details pending' : 'None',
        policeReportNumber: policeReportNumber || null,
        createdBy: userId,
      };
      
      const claim = await storage.createInsuranceClaim(claimData as any);
      createdRecords.claim = claim;
      
      // Create support ticket for follow-up
      const allTickets = await storage.getSupportTickets({});
      const ticketCount = allTickets.length + 1;
      const ticketNumber = `TKT-${year}-${ticketCount.toString().padStart(4, '0')}`;
      
      const ticketData = {
        ticketNumber,
        customerId,
        subject: `Accident Report - ${claimNumber}`,
        description: `Accident reported for contract ${contract.contractNumber}.\n\n${description}\n\nClaim Number: ${claimNumber}\nSeverity: ${severity}`,
        category: 'vehicle_issue',
        priority: severity === 'severe' ? 'urgent' : severity === 'moderate' ? 'high' : 'medium',
        status: 'open',
      };
      
      const ticket = await storage.createSupportTicket(ticketData as any);
      createdRecords.ticket = ticket;
      
      // Create audit log
      await createAuditLog(
        userId,
        'report_accident',
        contractId,
        req,
        `Customer ${customerId} reported accident - Claim: ${claimNumber}, Ticket: ${ticketNumber}`
      );
      createdRecords.audit = true;
      
      res.status(201).json({
        message: "Accident reported successfully",
        claimNumber,
        ticketNumber,
        nextSteps: "Our team will review your report and contact you within 24 hours. Please keep your vehicle safe and do not attempt repairs without authorization.",
        claim,
        ticket,
      });
    } catch (error: any) {
      // CRITICAL FIX 4: Manual rollback on error
      console.error("Error reporting accident - initiating rollback:", error);
      
      try {
        if (createdRecords.claim) {
          console.log(`Rolling back insurance claim: ${createdRecords.claim.id}`);
          await storage.deleteInsuranceClaim(createdRecords.claim.id, 'system_rollback');
        }
        if (createdRecords.ticket) {
          console.log(`Rolling back support ticket: ${createdRecords.ticket.id}`);
          await storage.deleteSupportTicket(createdRecords.ticket.id, 'system_rollback');
        }
        // Audit logs are left for debugging purposes
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
        // Log rollback failure but continue with error response
      }
      
      await logSystemError(error, req as any);
      res.status(500).json({ message: error.message || "Failed to report accident" });
    }
  });

  // PATCH /api/mobile/customer/profile - Update customer profile
  app.patch('/api/mobile/customer/profile', requireCustomerAuth, isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.body.customerId;
      const userId = req.user.id;
      
      if (!customerId) {
        return res.status(400).json({ message: "Customer ID required" });
      }
      
      // CRITICAL FIX 3: Verify customer ownership
      const authorized = await verifyCustomerOwnership(req, customerId);
      if (!authorized) {
        return res.status(403).json({ message: "Access denied: Invalid customer ID" });
      }
      
      // Only allow updating specific fields (not name, nationalId, licenseNumber)
      const allowedFields = ['phone', 'email', 'address'];
      const updates: any = {};
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      
      const customer = await storage.updateCustomer(customerId, updates);
      
      await createAuditLog(
        userId,
        'update_customer_profile',
        undefined,
        req,
        `Customer ${customerId} updated profile fields: ${Object.keys(updates).join(', ')}`
      );
      
      res.json({
        message: "Profile updated successfully",
        customer: {
          id: customer.id,
          nameEn: customer.nameEn,
          nameAr: customer.nameAr,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
        },
      });
    } catch (error: any) {
      console.error("Error updating customer profile:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: error.message || "Failed to update profile" });
    }
  });

  // POST /api/mobile/customer/change-password - Change password (placeholder for future JWT auth)
  app.post('/api/mobile/customer/change-password', requireCustomerAuth, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const customerId = req.body.customerId;
      
      // CRITICAL FIX 5: Add audit log for password change attempts
      await createAuditLog(
        userId,
        'change_password_attempt',
        undefined,
        req,
        `Customer ${customerId || 'unknown'} attempted password change - JWT auth not yet implemented`
      );
      
      // Placeholder for future JWT authentication implementation
      // Currently using session-based auth, so this endpoint returns a message
      res.json({
        message: "Password change functionality will be available when JWT authentication is implemented",
        note: "Please contact support to change your password",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: error.message || "Failed to change password" });
    }
  });

  // POST /api/mobile/customer/push-token - Register push notification token
  app.post('/api/mobile/customer/push-token', requireCustomerAuth, isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.body.customerId;
      const { token, platform, deviceId } = req.body;
      
      if (!customerId) {
        return res.status(400).json({ message: "Customer ID required" });
      }
      
      // CRITICAL FIX 3: Verify customer ownership
      const authorized = await verifyCustomerOwnership(req, customerId);
      if (!authorized) {
        return res.status(403).json({ message: "Access denied: Invalid customer ID" });
      }
      
      if (!token || !platform) {
        return res.status(400).json({ message: "Token and platform are required" });
      }
      
      // Check if token already exists
      const existingTokens = await storage.getPushNotificationTokens({ customerId });
      const existingToken = existingTokens.find(t => t.token === token);
      
      if (existingToken) {
        // Update existing token
        const updatedToken = await storage.updatePushNotificationToken(existingToken.id, {
          isActive: true,
          lastUsedAt: new Date(),
          platform,
          deviceId: deviceId || existingToken.deviceId,
        });
        
        return res.json({
          message: "Push notification token updated successfully",
          token: updatedToken,
        });
      }
      
      // Mark old tokens from same device as inactive
      if (deviceId) {
        const sameDeviceTokens = existingTokens.filter(t => t.deviceId === deviceId);
        for (const oldToken of sameDeviceTokens) {
          await storage.updatePushNotificationToken(oldToken.id, { isActive: false });
        }
      }
      
      // Create new token
      const tokenData = insertPushNotificationTokenSchema.parse({
        customerId,
        token,
        platform,
        deviceId,
        isActive: true,
      });
      
      const newToken = await storage.createPushNotificationToken(tokenData);
      
      res.status(201).json({
        message: "Push notification token registered successfully",
        token: newToken,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error registering push token:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: error.message || "Failed to register push token" });
    }
  });

  // ==================== STAFF MOBILE ENDPOINTS ====================
  
  // GET /api/mobile/staff/dashboard - Staff dashboard summary
  app.get('/api/mobile/staff/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get all contracts
      const allContracts = await storage.getAllContracts();
      const activeContracts = allContracts.filter(c => c.status === 'active' && !c.disabled);
      
      // Get pending renewal requests
      const renewalRequests = await storage.getRenewalRequests({ status: 'pending' });
      
      // Get pending document approvals
      const documentApprovals = await storage.getDocumentApprovals({ status: 'pending' });
      
      // Get open support tickets
      const supportTickets = await storage.getSupportTickets({ status: 'open' });
      
      // Get today's pickups and returns
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todaysPickups = allContracts.filter(c => {
        const startDate = new Date(c.rentalStartDate);
        startDate.setHours(0, 0, 0, 0);
        return startDate.getTime() === today.getTime() && c.status === 'confirmed';
      });
      
      const todaysReturns = allContracts.filter(c => {
        const endDate = new Date(c.rentalEndDate);
        endDate.setHours(0, 0, 0, 0);
        return endDate.getTime() === today.getTime() && c.status === 'active';
      });
      
      res.json({
        activeContracts: activeContracts.length,
        pendingRenewals: renewalRequests.length,
        pendingDocuments: documentApprovals.length,
        openTickets: supportTickets.length,
        todaysPickups: todaysPickups.length,
        todaysReturns: todaysReturns.length,
        summary: {
          pickups: todaysPickups.map(c => ({
            contractNumber: c.contractNumber,
            customerName: c.customer?.nameEn,
            vehicleMake: c.vehicle?.make,
            vehicleModel: c.vehicle?.model,
            time: c.timeIn || 'Not specified',
          })),
          returns: todaysReturns.map(c => ({
            contractNumber: c.contractNumber,
            customerName: c.customer?.nameEn,
            vehicleMake: c.vehicle?.make,
            vehicleModel: c.vehicle?.model,
            time: c.timeOut || 'Not specified',
          })),
        },
      });
    } catch (error: any) {
      console.error("Error fetching staff dashboard:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: error.message || "Failed to fetch dashboard" });
    }
  });

  // GET /api/mobile/staff/tasks - Staff task list
  app.get('/api/mobile/staff/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const priority = req.query.priority as string | undefined;
      
      // Get pending renewals
      const renewalRequests = await storage.getRenewalRequests({ status: 'pending' });
      
      // Get pending document approvals
      const documentApprovals = await storage.getDocumentApprovals({ status: 'pending' });
      
      // Get assigned support tickets
      const assignedTickets = await storage.getSupportTickets({ assignedTo: userId });
      const openAssignedTickets = assignedTickets.filter(t => t.status !== 'resolved' && t.status !== 'closed');
      
      // Get inspections due today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const allContracts = await storage.getAllContracts();
      const inspectionsDue = allContracts.filter(c => {
        const startDate = new Date(c.rentalStartDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(c.rentalEndDate);
        endDate.setHours(0, 0, 0, 0);
        
        // Inspections due for pickups (confirmed) and returns (active ending today)
        return (
          (startDate.getTime() === today.getTime() && c.status === 'confirmed') ||
          (endDate.getTime() === today.getTime() && c.status === 'active')
        );
      });
      
      // Compile all tasks
      const tasks = [
        ...renewalRequests.map(r => ({
          type: 'renewal_request',
          priority: 'medium',
          id: r.id,
          title: `Renewal Request - Contract ${r.contractId}`,
          description: `Customer requested renewal`,
          dueDate: r.createdAt,
          data: r,
        })),
        ...documentApprovals.map(d => ({
          type: 'document_approval',
          priority: 'low',
          id: d.id,
          title: `Document Approval - ${d.documentType}`,
          description: `Customer uploaded ${d.documentType}`,
          dueDate: d.createdAt,
          data: d,
        })),
        ...openAssignedTickets.map(t => ({
          type: 'support_ticket',
          priority: t.priority || 'medium',
          id: t.id,
          title: `Support Ticket - ${t.ticketNumber}`,
          description: t.subject,
          dueDate: t.createdAt,
          data: t,
        })),
        ...inspectionsDue.map(c => ({
          type: 'inspection',
          priority: 'high',
          id: c.id,
          title: `Inspection Due - Contract ${c.contractNumber}`,
          description: `Vehicle ${c.vehicle?.make} ${c.vehicle?.model}`,
          dueDate: c.rentalStartDate,
          data: c,
        })),
      ];
      
      // Filter by priority if specified
      let filteredTasks = tasks;
      if (priority) {
        filteredTasks = tasks.filter(t => t.priority === priority);
      }
      
      // Sort by priority and due date
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      filteredTasks.sort((a, b) => {
        const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
      
      res.json({
        tasks: filteredTasks,
        summary: {
          total: filteredTasks.length,
          byPriority: {
            urgent: filteredTasks.filter(t => t.priority === 'urgent').length,
            high: filteredTasks.filter(t => t.priority === 'high').length,
            medium: filteredTasks.filter(t => t.priority === 'medium').length,
            low: filteredTasks.filter(t => t.priority === 'low').length,
          },
          byType: {
            renewals: renewalRequests.length,
            documents: documentApprovals.length,
            tickets: openAssignedTickets.length,
            inspections: inspectionsDue.length,
          },
        },
      });
    } catch (error: any) {
      console.error("Error fetching staff tasks:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: error.message || "Failed to fetch tasks" });
    }
  });

  // POST /api/mobile/staff/quick-inspection - Quick vehicle inspection submit
  app.post('/api/mobile/staff/quick-inspection', isAuthenticated, requireEditor, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = req.user;
      const {
        contractId,
        vehicleId,
        inspectionType,
        odometerReading,
        fuelLevel,
        conditionNotes,
        photos,
      } = req.body;
      
      // Validate required fields
      if (!contractId || !vehicleId || !inspectionType || odometerReading === undefined || fuelLevel === undefined) {
        return res.status(400).json({ 
          message: "Missing required fields: contractId, vehicleId, inspectionType, odometerReading, fuelLevel" 
        });
      }
      
      // CRITICAL FIX 2: Validate numeric inputs with Number.isFinite() guards
      try {
        validateFinancialInput(odometerReading, 'odometer reading');
        validateFinancialInput(fuelLevel, 'fuel level');
      } catch (error: any) {
        return res.status(400).json({ message: error.message });
      }
      
      // Verify contract exists
      const contract = await storage.getContract(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // For quick inspection, we need at least 3 photos: front, back, and damage (if any)
      if (!photos || !Array.isArray(photos) || photos.length < 2) {
        return res.status(400).json({ 
          message: "At least 2 photos required (front and back). Add damage photos if applicable." 
        });
      }
      
      // Ensure required angles are present
      const photoAngles = photos.map((p: any) => p.angle);
      if (!photoAngles.includes('front') || !photoAngles.includes('back')) {
        return res.status(400).json({ 
          message: "Photos must include at least front and back angles" 
        });
      }
      
      // Add default photos for missing mandatory angles to satisfy schema
      const requiredAngles = ['front', 'back', 'left', 'right', 'top', 'dashboard'];
      const enrichedPhotos = [...photos];
      
      for (const angle of requiredAngles) {
        if (!photoAngles.includes(angle)) {
          enrichedPhotos.push({
            angle,
            data: 'placeholder', // Placeholder for quick inspection
            description: 'Quick inspection - photo not captured',
          });
        }
      }
      
      // Create inspection
      const inspectionData = {
        contractId,
        vehicleId,
        inspectionType,
        inspectorName: `${user.firstName} ${user.lastName}`,
        odometerReading: parseInt(odometerReading),
        fuelLevel: parseInt(fuelLevel),
        conditionNotes: conditionNotes || 'Quick inspection via mobile',
        photos: enrichedPhotos,
        createdBy: userId,
      };
      
      const inspection = await storage.createVehicleInspection(inspectionData);
      
      await createAuditLog(
        userId,
        'create_vehicle_inspection',
        contractId,
        req,
        `Quick inspection created for contract ${contract.contractNumber} - ${inspectionType}`
      );
      
      res.status(201).json({
        message: "Quick inspection submitted successfully",
        inspection: {
          id: inspection.id,
          contractId: inspection.contractId,
          inspectionType: inspection.inspectionType,
          odometerReading: inspection.odometerReading,
          fuelLevel: inspection.fuelLevel,
          photosCount: photos.length,
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating quick inspection:", error);
      await logSystemError(error, req);
      res.status(500).json({ message: error.message || "Failed to create inspection" });
    }
  });

  // Import Data API Endpoints (Superadmin only)
  
  // POST /api/import/customers - Import customers from CSV/JSON
  app.post('/api/import/customers', requireSuperAdmin, async (req, res, next) => {
    try {
      const { fileContent, format } = req.body;
      
      if (!fileContent || !format) {
        return res.status(400).json({ message: 'File content and format are required' });
      }
      
      if (format !== 'json' && format !== 'csv') {
        return res.status(400).json({ message: 'Format must be json or csv' });
      }
      
      // Parse file
      const parsed = format === 'json' ? parseJSON(fileContent) : parseCSV(fileContent);
      if (parsed.errors.length > 0) {
        return res.status(400).json({ message: formatValidationErrors(parsed.errors) });
      }
      
      // Validate schema
      const { validData, errors: schemaErrors } = validateWithSchema(parsed.data, customerImportSchema);
      if (schemaErrors.length > 0) {
        return res.status(400).json({ message: formatValidationErrors(schemaErrors) });
      }
      
      // Check for duplicates in file
      const duplicateErrors = checkDuplicatesInArray(validData, 'passportId', 'Passport/ID');
      if (duplicateErrors.length > 0) {
        return res.status(400).json({ message: formatValidationErrors(duplicateErrors) });
      }
      
      // Check for existing records with same unique identifiers
      const allErrors: ValidationError[] = [];
      for (let i = 0; i < validData.length; i++) {
        const item = validData[i];
        const existing = await storage.getCustomerByNationalId(item.passportId);
        if (existing) {
          allErrors.push({
            row: i + 2,
            field: 'passportId',
            message: `Customer with Passport/ID '${item.passportId}' already exists`,
          });
        }
      }
      
      if (allErrors.length > 0) {
        return res.status(400).json({ message: formatValidationErrors(allErrors) });
      }
      
      // Import all records atomically using transaction
      const userId = (req.user as User).id;
      try {
        await db.transaction(async (tx) => {
          for (const item of validData) {
            const { passportId, ...rest } = item;
            await storage.createCustomer({ 
              ...rest, 
              nationalId: passportId,
              createdBy: userId 
            }, tx);
          }
        });
      } catch (error) {
        throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}. All changes have been rolled back.`);
      }
      
      await createAuditLog(userId, 'customer_bulk_import', undefined, req, `Imported ${validData.length} customers`);
      
      res.json({ 
        success: true, 
        message: `Successfully imported ${validData.length} customers`,
        count: validData.length,
      });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/import/vehicles - Import vehicles from CSV/JSON
  app.post('/api/import/vehicles', requireSuperAdmin, async (req, res, next) => {
    try {
      const { fileContent, format } = req.body;
      
      if (!fileContent || !format) {
        return res.status(400).json({ message: 'File content and format are required' });
      }
      
      if (format !== 'json' && format !== 'csv') {
        return res.status(400).json({ message: 'Format must be json or csv' });
      }
      
      // Parse file
      const parsed = format === 'json' ? parseJSON(fileContent) : parseCSV(fileContent);
      if (parsed.errors.length > 0) {
        return res.status(400).json({ message: formatValidationErrors(parsed.errors) });
      }
      
      // Validate schema
      const { validData, errors: schemaErrors } = validateWithSchema(parsed.data, vehicleImportSchema);
      if (schemaErrors.length > 0) {
        return res.status(400).json({ message: formatValidationErrors(schemaErrors) });
      }
      
      // Check for duplicates in file
      const duplicateErrors = checkDuplicatesInArray(validData, 'registration', 'Registration');
      if (duplicateErrors.length > 0) {
        return res.status(400).json({ message: formatValidationErrors(duplicateErrors) });
      }
      
      // Check for existing records with same unique identifiers
      const allErrors: ValidationError[] = [];
      for (let i = 0; i < validData.length; i++) {
        const item = validData[i];
        const existing = await storage.getVehicleByRegistration(item.registration);
        if (existing) {
          allErrors.push({
            row: i + 2,
            field: 'registration',
            message: `Vehicle with registration '${item.registration}' already exists`,
          });
        }
      }
      
      if (allErrors.length > 0) {
        return res.status(400).json({ message: formatValidationErrors(allErrors) });
      }
      
      // Import all records atomically using transaction
      const userId = (req.user as User).id;
      try {
        await db.transaction(async (tx) => {
          for (const item of validData) {
            await storage.createVehicle({ ...item, createdBy: userId }, tx);
          }
        });
      } catch (error) {
        throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}. All changes have been rolled back.`);
      }
      
      await createAuditLog(userId, 'vehicle_bulk_import', undefined, req, `Imported ${validData.length} vehicles`);
      
      res.json({ 
        success: true, 
        message: `Successfully imported ${validData.length} vehicles`,
        count: validData.length,
      });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/import/sponsors - Import sponsors from CSV/JSON
  app.post('/api/import/sponsors', requireSuperAdmin, async (req, res, next) => {
    try {
      const { fileContent, format } = req.body;
      
      if (!fileContent || !format) {
        return res.status(400).json({ message: 'File content and format are required' });
      }
      
      if (format !== 'json' && format !== 'csv') {
        return res.status(400).json({ message: 'Format must be json or csv' });
      }
      
      // Parse file
      const parsed = format === 'json' ? parseJSON(fileContent) : parseCSV(fileContent);
      if (parsed.errors.length > 0) {
        return res.status(400).json({ message: formatValidationErrors(parsed.errors) });
      }
      
      // Validate schema
      const { validData, errors: schemaErrors } = validateWithSchema(parsed.data, sponsorImportSchema);
      if (schemaErrors.length > 0) {
        return res.status(400).json({ message: formatValidationErrors(schemaErrors) });
      }
      
      // Check for duplicates in file
      const duplicateErrors = checkDuplicatesInArray(validData, 'passportId', 'Passport/ID');
      if (duplicateErrors.length > 0) {
        return res.status(400).json({ message: formatValidationErrors(duplicateErrors) });
      }
      
      // Check for existing records with same unique identifiers
      const allErrors: ValidationError[] = [];
      for (let i = 0; i < validData.length; i++) {
        const item = validData[i];
        const existing = await storage.getSponsorByPassportId(item.passportId);
        if (existing) {
          allErrors.push({
            row: i + 2,
            field: 'passportId',
            message: `Sponsor with Passport/ID '${item.passportId}' already exists`,
          });
        }
      }
      
      if (allErrors.length > 0) {
        return res.status(400).json({ message: formatValidationErrors(allErrors) });
      }
      
      // Import all records atomically using transaction
      const userId = (req.user as User).id;
      try {
        await db.transaction(async (tx) => {
          for (const item of validData) {
            await storage.createSponsor({ ...item, createdBy: userId }, tx);
          }
        });
      } catch (error) {
        throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}. All changes have been rolled back.`);
      }
      
      await createAuditLog(userId, 'sponsor_bulk_import', undefined, req, `Imported ${validData.length} sponsors`);
      
      res.json({ 
        success: true, 
        message: `Successfully imported ${validData.length} sponsors`,
        count: validData.length,
      });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/import/companies - Import companies from CSV/JSON
  app.post('/api/import/companies', requireSuperAdmin, async (req, res, next) => {
    try {
      const { fileContent, format } = req.body;
      
      if (!fileContent || !format) {
        return res.status(400).json({ message: 'File content and format are required' });
      }
      
      if (format !== 'json' && format !== 'csv') {
        return res.status(400).json({ message: 'Format must be json or csv' });
      }
      
      // Parse file
      const parsed = format === 'json' ? parseJSON(fileContent) : parseCSV(fileContent);
      if (parsed.errors.length > 0) {
        return res.status(400).json({ message: formatValidationErrors(parsed.errors) });
      }
      
      // Validate schema
      const { validData, errors: schemaErrors } = validateWithSchema(parsed.data, companyImportSchema);
      if (schemaErrors.length > 0) {
        return res.status(400).json({ message: formatValidationErrors(schemaErrors) });
      }
      
      // Check for duplicates in file
      const duplicateErrors = checkDuplicatesInArray(validData, 'registrationNumber', 'Registration Number');
      if (duplicateErrors.length > 0) {
        return res.status(400).json({ message: formatValidationErrors(duplicateErrors) });
      }
      
      // Check for existing records with same unique identifiers
      const allErrors: ValidationError[] = [];
      for (let i = 0; i < validData.length; i++) {
        const item = validData[i];
        const existing = await storage.getCompanyByRegistrationNumber(item.registrationNumber);
        if (existing) {
          allErrors.push({
            row: i + 2,
            field: 'registrationNumber',
            message: `Company with registration number '${item.registrationNumber}' already exists`,
          });
        }
      }
      
      if (allErrors.length > 0) {
        return res.status(400).json({ message: formatValidationErrors(allErrors) });
      }
      
      // Import all records atomically using transaction
      const userId = (req.user as User).id;
      try {
        await db.transaction(async (tx) => {
          for (const item of validData) {
            await storage.createCompany({ ...item, createdBy: userId }, tx);
          }
        });
      } catch (error) {
        throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}. All changes have been rolled back.`);
      }
      
      await createAuditLog(userId, 'company_bulk_import', undefined, req, `Imported ${validData.length} companies`);
      
      res.json({ 
        success: true, 
        message: `Successfully imported ${validData.length} companies`,
        count: validData.length,
      });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/import/contracts - Import contracts from CSV/JSON (with customer/vehicle/sponsor/company resolution)
  app.post('/api/import/contracts', requireSuperAdmin, async (req, res, next) => {
    try {
      const { fileContent, format } = req.body;
      
      if (!fileContent || !format) {
        return res.status(400).json({ message: 'File content and format are required' });
      }
      
      if (format !== 'json' && format !== 'csv') {
        return res.status(400).json({ message: 'Format must be json or csv' });
      }
      
      // Parse file
      const parsed = format === 'json' ? parseJSON(fileContent) : parseCSV(fileContent);
      if (parsed.errors.length > 0) {
        return res.status(400).json({ message: formatValidationErrors(parsed.errors) });
      }
      
      // Validate schema
      const { validData, errors: schemaErrors } = validateWithSchema(parsed.data, contractImportSchema);
      if (schemaErrors.length > 0) {
        return res.status(400).json({ message: formatValidationErrors(schemaErrors) });
      }
      
      // Resolve customer IDs, vehicle IDs, sponsor IDs, and company IDs
      const allErrors: ValidationError[] = [];
      const resolvedContracts = [];
      
      for (let i = 0; i < validData.length; i++) {
        const item = validData[i];
        
        // Resolve customer ID
        const customer = await storage.getCustomerByNationalId(item.customerPassportId);
        if (!customer) {
          allErrors.push({
            row: i + 2,
            field: 'customerPassportId',
            message: `Customer with Passport/ID '${item.customerPassportId}' not found`,
          });
          continue;
        }
        
        // Resolve vehicle ID
        const vehicle = await storage.getVehicleByRegistration(item.vehicleRegistration);
        if (!vehicle) {
          allErrors.push({
            row: i + 2,
            field: 'vehicleRegistration',
            message: `Vehicle with registration '${item.vehicleRegistration}' not found`,
          });
          continue;
        }
        
        // Resolve sponsor ID if needed
        let sponsorId = null;
        if (item.hirerType === 'with_sponsor') {
          if (!item.sponsorPassportId) {
            allErrors.push({
              row: i + 2,
              field: 'sponsorPassportId',
              message: 'Sponsor Passport/ID is required when hirer type is "with_sponsor"',
            });
            continue;
          }
          const sponsor = await storage.getSponsorByPassportId(item.sponsorPassportId);
          if (!sponsor) {
            allErrors.push({
              row: i + 2,
              field: 'sponsorPassportId',
              message: `Sponsor with Passport/ID '${item.sponsorPassportId}' not found`,
            });
            continue;
          }
          sponsorId = sponsor.id;
        }
        
        // Resolve company ID if needed
        let companyId = null;
        if (item.hirerType === 'from_company') {
          if (!item.companyRegistrationNumber) {
            allErrors.push({
              row: i + 2,
              field: 'companyRegistrationNumber',
              message: 'Company registration number is required when hirer type is "from_company"',
            });
            continue;
          }
          const company = await storage.getCompanyByRegistrationNumber(item.companyRegistrationNumber);
          if (!company) {
            allErrors.push({
              row: i + 2,
              field: 'companyRegistrationNumber',
              message: `Company with registration number '${item.companyRegistrationNumber}' not found`,
            });
            continue;
          }
          companyId = company.id;
        }
        
        // Calculate rental duration and amounts
        const startDate = new Date(item.rentalStartDate);
        const endDate = new Date(item.rentalEndDate);
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Calculate subtotal based on rental type and duration
        let subtotal = 0;
        if (item.rentalType === 'daily') {
          subtotal = totalDays * item.dailyRate;
        } else if (item.rentalType === 'weekly' && item.weeklyRate) {
          const weeks = Math.ceil(totalDays / 7);
          subtotal = weeks * item.weeklyRate;
        } else if (item.rentalType === 'monthly' && item.monthlyRate) {
          const months = Math.ceil(totalDays / 30);
          subtotal = months * item.monthlyRate;
        } else {
          subtotal = totalDays * item.dailyRate;
        }
        
        // Calculate VAT and total (assuming 5% VAT)
        const vatAmount = subtotal * 0.05;
        const totalAmount = subtotal + vatAmount;
        
        // Build contract object
        const contractData = {
          customerId: customer.id,
          vehicleId: vehicle.id,
          sponsorId: sponsorId,
          companySponsorId: companyId,
          hirerType: item.hirerType,
          rentalType: item.rentalType,
          rentalStartDate: startDate,
          rentalEndDate: endDate,
          dailyRate: item.dailyRate.toString(),
          weeklyRate: item.weeklyRate ? item.weeklyRate.toString() : null,
          monthlyRate: item.monthlyRate ? item.monthlyRate.toString() : null,
          totalDays,
          subtotal: subtotal.toString(),
          vatAmount: vatAmount.toString(),
          totalAmount: totalAmount.toString(),
          pickupLocation: item.pickupLocation,
          dropoffLocation: item.dropoffLocation,
          mileageLimit: item.mileageLimit || null,
          extraKmRate: item.extraKmRate ? item.extraKmRate.toString() : null,
          securityDeposit: item.securityDeposit ? item.securityDeposit.toString() : null,
          notes: item.notes || null,
          status: 'draft',
        };
        
        resolvedContracts.push(contractData);
      }
      
      if (allErrors.length > 0) {
        return res.status(400).json({ message: formatValidationErrors(allErrors) });
      }
      
      // Import all contracts atomically using transaction
      const userId = (req.user as User).id;
      try {
        await db.transaction(async (tx) => {
          for (const contractData of resolvedContracts) {
            await storage.createContract({ ...contractData, createdBy: userId } as any, tx);
          }
        });
      } catch (error) {
        throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}. All changes have been rolled back.`);
      }
      
      await createAuditLog(userId, 'contract_bulk_import', undefined, req, `Imported ${resolvedContracts.length} contracts`);
      
      res.json({ 
        success: true, 
        message: `Successfully imported ${resolvedContracts.length} contracts`,
        count: resolvedContracts.length,
      });
    } catch (error) {
      next(error);
    }
  });

  // ==================== BRANCH MANAGEMENT API ROUTES ====================
  
  app.get("/api/branches", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      // SECURITY: Only users with canManageAllBranches or Admins can list branches
      if (!user.canManageAllBranches && user.role !== 'Admin') {
        // Regular users can only see their own branch
        if (!user.branchId) {
          return res.status(403).json({ message: "No branch assigned to user" });
        }
        const branch = await storage.getBranchById(user.branchId);
        return res.json(branch ? [branch] : []);
      }
      
      const includeDisabled = req.query.includeDisabled === 'true';
      const branches = await storage.getBranches(includeDisabled);
      res.json(branches);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/branches/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      const branch = await storage.getBranchById(req.params.id);
      
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }
      
      // SECURITY: Users can only view their own branch unless they have canManageAllBranches
      if (!user.canManageAllBranches && user.role !== 'Admin' && user.branchId !== branch.id) {
        return res.status(403).json({ message: "Insufficient permissions to view this branch" });
      }
      
      res.json(branch);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/branches", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      if (!user.canManageAllBranches && user.role !== 'Admin') {
        return res.status(403).json({ message: "Insufficient permissions to create branches" });
      }
      
      const validationResult = insertBranchSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errors = fromZodError(validationResult.error);
        return res.status(400).json({ message: errors.message });
      }
      
      const branch = await storage.createBranch({
        ...validationResult.data,
        createdBy: user.id,
      });
      
      await createAuditLog(user.id, 'branch_created', branch.id, req, `Created branch: ${branch.branchCode}`);
      res.status(201).json(branch);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/branches/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      if (!user.canManageAllBranches && user.role !== 'Admin') {
        return res.status(403).json({ message: "Insufficient permissions to update branches" });
      }
      
      // INPUT VALIDATION: Use Zod partial schema for updates
      const validationResult = insertBranchSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        const errors = fromZodError(validationResult.error);
        return res.status(400).json({ message: errors.message });
      }
      
      const branch = await storage.updateBranch(req.params.id, validationResult.data);
      await createAuditLog(user.id, 'branch_updated', branch.id, req, `Updated branch: ${branch.branchCode}`);
      res.json(branch);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/branches/:id/disable", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      if (!user.canManageAllBranches && user.role !== 'Admin') {
        return res.status(403).json({ message: "Insufficient permissions to disable branches" });
      }
      
      await storage.disableBranch(req.params.id, user.id);
      await createAuditLog(user.id, 'branch_disabled', req.params.id, req, `Disabled branch`);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/branches/:id/enable", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      if (!user.canManageAllBranches && user.role !== 'Admin') {
        return res.status(403).json({ message: "Insufficient permissions to enable branches" });
      }
      
      await storage.enableBranch(req.params.id);
      await createAuditLog(user.id, 'branch_enabled', req.params.id, req, `Enabled branch`);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Branch Transfers
  app.get("/api/branch-transfers", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        status: req.query.status as string | undefined,
        vehicleId: req.query.vehicleId as string | undefined,
        sourceBranchId: req.query.sourceBranchId as string | undefined,
        destinationBranchId: req.query.destinationBranchId as string | undefined,
      };
      const transfers = await storage.getBranchTransfers(filters);
      res.json(transfers);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/branch-transfers/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transfer = await storage.getBranchTransferById(req.params.id);
      if (!transfer) {
        return res.status(404).json({ message: "Transfer not found" });
      }
      res.json(transfer);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/branch-transfers", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      const validationResult = insertBranchTransferSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errors = fromZodError(validationResult.error);
        return res.status(400).json({ message: errors.message });
      }
      
      const transfer = await storage.createBranchTransfer({
        ...validationResult.data,
        requestedBy: user.id,
      });
      
      await createAuditLog(user.id, 'branch_transfer_initiated', transfer.id, req, `Initiated vehicle transfer`);
      res.status(201).json(transfer);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/branch-transfers/:id/approve", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      if (!user.canManageAllBranches && user.role !== 'Admin') {
        return res.status(403).json({ message: "Insufficient permissions to approve transfers" });
      }
      
      const transfer = await storage.approveBranchTransfer(req.params.id, user.id);
      await createAuditLog(user.id, 'branch_transfer_approved', transfer.id, req, `Approved vehicle transfer`);
      res.json(transfer);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/branch-transfers/:id/reject", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      if (!user.canManageAllBranches && user.role !== 'Admin') {
        return res.status(403).json({ message: "Insufficient permissions to reject transfers" });
      }
      
      const { rejectedReason } = req.body;
      if (!rejectedReason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }
      
      const transfer = await storage.rejectBranchTransfer(req.params.id, user.id, rejectedReason);
      await createAuditLog(user.id, 'branch_transfer_rejected', transfer.id, req, `Rejected vehicle transfer: ${rejectedReason}`);
      res.json(transfer);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/branch-transfers/:id/complete", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      const transfer = await storage.completeBranchTransfer(req.params.id);
      await createAuditLog(user.id, 'branch_transfer_completed', transfer.id, req, `Completed vehicle transfer`);
      res.json(transfer);
    } catch (error) {
      next(error);
    }
  });

  // Public Holidays
  app.get("/api/public-holidays", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
      };
      const holidays = await storage.getPublicHolidays(filters);
      res.json(holidays);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/public-holidays/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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

  app.post("/api/public-holidays", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      if (user.role !== 'Admin') {
        return res.status(403).json({ message: "Only admins can create public holidays" });
      }
      
      const validationResult = insertPublicHolidaySchema.safeParse(req.body);
      if (!validationResult.success) {
        const errors = fromZodError(validationResult.error);
        return res.status(400).json({ message: errors.message });
      }
      
      const holiday = await storage.createPublicHoliday({
        ...validationResult.data,
        createdBy: user.id,
      });
      
      await createAuditLog(user.id, 'public_holiday_created', holiday.id, req, `Created public holiday: ${holiday.nameEn}`);
      res.status(201).json(holiday);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/public-holidays/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      if (user.role !== 'Admin') {
        return res.status(403).json({ message: "Only admins can update public holidays" });
      }
      
      // INPUT VALIDATION
      const validationResult = insertPublicHolidaySchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        const errors = fromZodError(validationResult.error);
        return res.status(400).json({ message: errors.message });
      }
      
      const holiday = await storage.updatePublicHoliday(req.params.id, validationResult.data);
      await createAuditLog(user.id, 'public_holiday_updated', holiday.id, req, `Updated public holiday: ${holiday.nameEn}`);
      res.json(holiday);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/public-holidays/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      if (user.role !== 'Admin') {
        return res.status(403).json({ message: "Only admins can delete public holidays" });
      }
      
      await storage.deletePublicHoliday(req.params.id);
      await createAuditLog(user.id, 'public_holiday_deleted', req.params.id, req, `Deleted public holiday`);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Driver Outsource Companies
  app.get("/api/driver-companies", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const includeDisabled = req.query.includeDisabled === 'true';
      const companies = await storage.getDriverOutsourceCompanies(includeDisabled);
      res.json(companies);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/driver-companies/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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

  app.post("/api/driver-companies", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      if (!user.canManageDrivers && user.role !== 'Admin') {
        return res.status(403).json({ message: "Insufficient permissions to create driver companies" });
      }
      
      const validationResult = insertDriverOutsourceCompanySchema.safeParse(req.body);
      if (!validationResult.success) {
        const errors = fromZodError(validationResult.error);
        return res.status(400).json({ message: errors.message });
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

  app.patch("/api/driver-companies/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      if (!user.canManageDrivers && user.role !== 'Admin') {
        return res.status(403).json({ message: "Insufficient permissions to update driver companies" });
      }
      
      // INPUT VALIDATION
      const validationResult = insertDriverOutsourceCompanySchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        const errors = fromZodError(validationResult.error);
        return res.status(400).json({ message: errors.message });
      }
      
      const company = await storage.updateDriverOutsourceCompany(req.params.id, validationResult.data);
      await createAuditLog(user.id, 'driver_company_updated', undefined, req, `Updated driver company: ${company.nameEn}`);
      res.json(company);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/driver-companies/:id/disable", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      if (!user.canManageDrivers && user.role !== 'Admin') {
        return res.status(403).json({ message: "Insufficient permissions to disable driver companies" });
      }
      
      await storage.disableDriverOutsourceCompany(req.params.id, user.id);
      await createAuditLog(user.id, 'driver_company_disabled', undefined, req, `Disabled driver company`);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/driver-companies/:id/enable", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      if (!user.canManageDrivers && user.role !== 'Admin') {
        return res.status(403).json({ message: "Insufficient permissions to enable driver companies" });
      }
      
      await storage.enableDriverOutsourceCompany(req.params.id);
      await createAuditLog(user.id, 'driver_company_enabled', undefined, req, `Enabled driver company`);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Drivers
  app.get("/api/drivers", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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

  app.get("/api/drivers/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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

  app.post("/api/drivers", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      if (!user.canManageDrivers && user.role !== 'Admin') {
        return res.status(403).json({ message: "Insufficient permissions to create drivers" });
      }
      
      const validationResult = insertDriverSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errors = fromZodError(validationResult.error);
        return res.status(400).json({ message: errors.message });
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

  app.patch("/api/drivers/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      if (!user.canManageDrivers && user.role !== 'Admin') {
        return res.status(403).json({ message: "Insufficient permissions to update drivers" });
      }
      
      // INPUT VALIDATION
      const validationResult = insertDriverSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        const errors = fromZodError(validationResult.error);
        return res.status(400).json({ message: errors.message });
      }
      
      const driver = await storage.updateDriver(req.params.id, validationResult.data);
      await createAuditLog(user.id, 'driver_updated', undefined, req, `Updated driver: ${driver.driverCode}`);
      res.json(driver);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/drivers/:id/availability", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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

  app.post("/api/drivers/:id/disable", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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

  app.post("/api/drivers/:id/enable", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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

  // Driver Rate Cards
  app.get("/api/drivers/:id/rate-cards", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rateCards = await storage.getDriverRateCards(req.params.id);
      res.json(rateCards);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/drivers/:id/rate-cards", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      if (!user.canManageDrivers && user.role !== 'Admin') {
        return res.status(403).json({ message: "Insufficient permissions to manage driver rates" });
      }
      
      const validationResult = insertDriverRateCardSchema.safeParse({
        ...req.body,
        driverId: req.params.id,
      });
      if (!validationResult.success) {
        const errors = fromZodError(validationResult.error);
        return res.status(400).json({ message: errors.message });
      }
      
      const rateCard = await storage.createDriverRateCard({
        ...validationResult.data,
        createdBy: user.id,
      });
      
      await createAuditLog(user.id, 'driver_rate_card_created', undefined, req, `Created rate card for driver`);
      res.status(201).json(rateCard);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/driver-rate-cards/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      if (!user.canManageDrivers && user.role !== 'Admin') {
        return res.status(403).json({ message: "Insufficient permissions to manage driver rates" });
      }
      
      // INPUT VALIDATION
      const validationResult = insertDriverRateCardSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        const errors = fromZodError(validationResult.error);
        return res.status(400).json({ message: errors.message });
      }
      
      const rateCard = await storage.updateDriverRateCard(req.params.id, validationResult.data);
      await createAuditLog(user.id, 'driver_rate_card_updated', undefined, req, `Updated driver rate card`);
      res.json(rateCard);
    } catch (error) {
      next(error);
    }
  });

  // Driver Schedule
  app.get("/api/drivers/:id/schedule", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const blocks = await storage.getDriverScheduleBlocks(req.params.id, startDate, endDate);
      res.json(blocks);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/drivers/:id/schedule", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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
        const errors = fromZodError(validationResult.error);
        return res.status(400).json({ message: errors.message });
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

  app.delete("/api/driver-schedule-blocks/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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

  app.post("/api/drivers/:id/check-availability", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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

  // Driver Assignments
  app.get("/api/driver-assignments", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        contractId: req.query.contractId as string | undefined,
        driverId: req.query.driverId as string | undefined,
        status: req.query.status as string | undefined,
      };
      const assignments = await storage.getDriverAssignments(filters);
      res.json(assignments);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/driver-assignments/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const assignment = await storage.getDriverAssignmentById(req.params.id);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      res.json(assignment);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/driver-assignments", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      if (!user.canAssignDrivers && user.role !== 'Admin' && user.role !== 'Manager') {
        return res.status(403).json({ message: "Insufficient permissions to assign drivers" });
      }
      
      const validationResult = insertDriverAssignmentSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errors = fromZodError(validationResult.error);
        return res.status(400).json({ message: errors.message });
      }
      
      const assignment = await storage.createDriverAssignment({
        ...validationResult.data,
        assignedBy: user.id,
      });
      
      await createAuditLog(user.id, 'driver_assigned', undefined, req, `Assigned driver to contract`);
      res.status(201).json(assignment);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/driver-assignments/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      if (!user.canAssignDrivers && user.role !== 'Admin' && user.role !== 'Manager') {
        return res.status(403).json({ message: "Insufficient permissions to update driver assignments" });
      }
      
      // INPUT VALIDATION
      const validationResult = insertDriverAssignmentSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        const errors = fromZodError(validationResult.error);
        return res.status(400).json({ message: errors.message });
      }
      
      const assignment = await storage.updateDriverAssignment(req.params.id, validationResult.data);
      await createAuditLog(user.id, 'driver_assignment_updated', undefined, req, `Updated driver assignment`);
      res.json(assignment);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/driver-assignments/:id/complete", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      const { completionNotes } = req.body;
      const assignment = await storage.completeDriverAssignment(req.params.id, completionNotes || '');
      await createAuditLog(user.id, 'driver_assignment_completed', assignment.id, req, `Completed driver assignment`);
      res.json(assignment);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
