import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  pgEnum,
  numeric,
  serial,
  uniqueIndex,
  unique,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User roles enum
export const UserRole = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  VIEWER: 'viewer',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Zod enum for validation
export const userRoleEnum = z.enum([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.VIEWER]);

// UAE Emirates enum - For geographic distribution tracking
export const emiratesEnum = pgEnum('emirate', [
  'abu_dhabi',
  'dubai',
  'sharjah',
  'ajman',
  'umm_al_quwain',
  'ras_al_khaimah',
  'fujairah'
]);

// Emirate labels for UI display (bilingual)
export const EmirateLabels: Record<string, { en: string; ar: string }> = {
  abu_dhabi: { en: 'Abu Dhabi', ar: 'أبوظبي' },
  dubai: { en: 'Dubai', ar: 'دبي' },
  sharjah: { en: 'Sharjah', ar: 'الشارقة' },
  ajman: { en: 'Ajman', ar: 'عجمان' },
  umm_al_quwain: { en: 'Umm Al Quwain', ar: 'أم القيوين' },
  ras_al_khaimah: { en: 'Ras Al Khaimah', ar: 'رأس الخيمة' },
  fujairah: { en: 'Fujairah', ar: 'الفجيرة' },
};

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Internal authentication with username/password
export const users: ReturnType<typeof pgTable> = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  passwordHash: varchar("password_hash").notNull(),
  email: varchar("email"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 20 }).notNull().default("staff"), // admin, manager, staff, viewer
  isImmutable: boolean("is_immutable").notNull().default(false), // Super admin cannot be deleted
  disabled: boolean("disabled").notNull().default(false), // Disabled users cannot login
  disabledBy: varchar("disabled_by"),
  disabledAt: timestamp("disabled_at"),
  
  // Permission toggles - Fine-grained access control
  canCloseContracts: boolean("can_close_contracts").notNull().default(false), // Close completed contracts
  canViewAllContracts: boolean("can_view_all_contracts").notNull().default(false), // View all contracts (not just own)
  
  // Granular Report Permissions - Individual access control per report type
  canAccessRevenueTrends: boolean("can_access_revenue_trends").notNull().default(false), // Revenue Trends Report
  canAccessFleetPerformance: boolean("can_access_fleet_performance").notNull().default(false), // Fleet Performance Report
  canAccessContractAnalytics: boolean("can_access_contract_analytics").notNull().default(false), // Contract Analytics Report
  canAccessCollectionPerformance: boolean("can_access_collection_performance").notNull().default(false), // Collection Performance Report
  canAccessFinancialReports: boolean("can_access_financial_reports").notNull().default(false), // Financial Reports
  canAccessOperationalReports: boolean("can_access_operational_reports").notNull().default(false), // Operational Reports
  canAccessCustomerReports: boolean("can_access_customer_reports").notNull().default(false), // Customer Reports
  canAccessInsuranceReports: boolean("can_access_insurance_reports").notNull().default(false), // Insurance Reports
  canAccessAuditReports: boolean("can_access_audit_reports").notNull().default(false), // Audit Reports
  canAccessUserActivityReports: boolean("can_access_user_activity_reports").notNull().default(false), // User Activity Reports
  canAccessAppAccessReport: boolean("can_access_app_access_report").notNull().default(false), // App Access Report (login attempts)
  
  // Branch & Driver Service Permissions
  canManageAllBranches: boolean("can_manage_all_branches").notNull().default(false), // Manage all branches (super admin only)
  canManageDrivers: boolean("can_manage_drivers").notNull().default(false), // Create/edit/disable drivers
  canAssignDrivers: boolean("can_assign_drivers").notNull().default(false), // Assign drivers to contracts
  canViewDriverCosts: boolean("can_view_driver_costs").notNull().default(false), // View driver cost rates
  
  // Branch Assignment
  branchId: varchar("branch_id").references(() => branches.id),
  
  lastPasswordChange: timestamp("last_password_change").defaultNow(),
  lastLoginAt: timestamp("last_login_at"), // Track last successful login for dashboard display
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_users_username").on(table.username),
  index("idx_users_branch").on(table.branchId),
  index("idx_users_disabled").on(table.disabled),
  index("idx_users_created_at").on(table.createdAt),
]);

// P1-3: Password complexity validation
export const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
  .refine((pwd) => {
    // Check against common passwords
    const commonPasswords = ['password', '12345678', 'admin123', 'qwerty', 'letmein'];
    return !commonPasswords.some(common => pwd.toLowerCase().includes(common));
  }, 'Password is too common. Please choose a stronger password');

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastPasswordChange: true,
}).extend({
  // P1-3: Add password validation when creating users
  password: passwordSchema.optional(), // Optional because we use passwordHash in actual schema
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Customers table - Master data for all customers/hirers
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Basic Information (bilingual)
  nameEn: varchar("name_en").notNull(),
  nameAr: varchar("name_ar"),
  
  // Identification
  nationalId: varchar("national_id").unique(), // National ID or Passport Number (required by form validation)
  gender: varchar("gender", { length: 10 }), // male, female
  dateOfBirth: timestamp("date_of_birth"),
  
  // Phase 1: UAE Compliance - Customer Type Classification (nullable)
  customerType: varchar("customer_type", { length: 20 }), // resident, tourist, gcc, corporate
  
  // UAE Residents - Emirates ID
  emiratesIdNumber: varchar("emirates_id_number"),
  emiratesIdExpiry: timestamp("emirates_id_expiry"),
  
  // Tourists / Visitors - Passport & Visa
  passportNumber: varchar("passport_number"),
  passportExpiry: timestamp("passport_expiry"),
  visaNumber: varchar("visa_number"),
  visaType: varchar("visa_type"), // tourist, visit, residence, etc.
  visaExpiry: timestamp("visa_expiry"),
  dateOfEntry: timestamp("date_of_entry"),
  portOfEntry: varchar("port_of_entry"), // DXB, AUH, etc.
  
  // Contact Information
  phone: varchar("phone").notNull(), // REQUIRED
  email: varchar("email"),
  address: text("address"),
  
  // Phase 4-5: Location-Based Analytics
  area: varchar("area"), // Area within emirate (Dubai Marina, JLT, etc.)
  latitude: numeric("latitude", { precision: 10, scale: 6 }), // GPS coordinates
  longitude: numeric("longitude", { precision: 10, scale: 6 }),
  
  // License Information
  licenseNumber: varchar("license_number"), // Driver's license number (required by form validation)
  licenseIssuedBy: varchar("license_issued_by"), // Issuing authority/country
  licenseIssuingCountry: varchar("license_issuing_country"), // Phase 1: Country of issuance
  licenseIssuingEmirate: emiratesEnum("license_issuing_emirate"), // Phase 1: UAE emirate if applicable
  hasIDP: boolean("has_idp").default(false), // Phase 1: International Driving Permit
  licenseIssueDate: timestamp("license_issue_date"),
  licenseExpiryDate: timestamp("license_expiry_date"),
  nationality: varchar("nationality"), // Required by form validation
  emirate: emiratesEnum("emirate"), // UAE Emirate for geographic distribution
  
  // RTA License Fields (from RTA license document)
  licensePermittedVehicles: varchar("license_permitted_vehicles"), // Types of vehicles allowed
  licenseTransmissionType: varchar("license_transmission_type"), // "automatic", "manual", or "both"
  licenseWearingGlasses: boolean("license_wearing_glasses"), // Whether glasses required
  licensePlaceOfIssue: varchar("license_place_of_issue"), // Where license was issued
  licenseLicensingAuthority: varchar("license_licensing_authority"), // Licensing authority
  licenseTrafficCodeNo: varchar("license_traffic_code_no"), // Traffic code number on license
  licenseDateOfBirth: timestamp("license_date_of_birth"), // Date of birth from license
  licenseDateOfIssue: timestamp("license_date_of_issue"), // License issue date
  licenseDateOfExpiry: timestamp("license_date_of_expiry"), // License expiry date
  
  // Additional Information
  notes: text("notes"),
  
  // Driver Service Preferences (Phase 1 - Customer Preferences)
  preferredDriverService: boolean("preferred_driver_service").notNull().default(false),
  preferredDriverServiceType: varchar("preferred_driver_service_type", { length: 20 }).default("none"), // 'daily', 'hourly', 'flat', 'none'
  
  // Branch Assignment
  branchId: varchar("branch_id").references(() => branches.id),
  
  // Audit fields
  disabled: boolean("disabled").notNull().default(false),
  disabledBy: varchar("disabled_by").references(() => users.id),
  disabledAt: timestamp("disabled_at"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_customers_branch").on(table.branchId),
  index("idx_customers_disabled").on(table.disabled),
  index("idx_customers_created_at").on(table.createdAt),
  index("idx_customers_national_id").on(table.nationalId),
  index("idx_customers_phone").on(table.phone),
]);

export const customersRelations = relations(customers, ({ one }) => ({
  creator: one(users, {
    fields: [customers.createdBy],
    references: [users.id],
    relationName: "customerCreator",
  }),
}));

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  disabledBy: true,
  disabledAt: true,
  disabled: true,
}).extend({
  // P0-6: Add max string length validation (using actual field names from schema)
  nameEn: z.string().max(200, "Name too long"),
  nameAr: z.string().max(200, "Name too long").optional(),
  phone: z.string().min(1, "Phone number is required").max(20, "Phone number too long"),
  email: z.string().email().max(255, "Email too long").optional(),
  nationalId: z.string().min(1, "National ID is required").max(50, "National ID too long"),
  nationality: z.string().min(1, "Nationality is required").max(100, "Nationality too long"),
  licenseNumber: z.string().min(1, "License number is required").max(50, "License number too long"),
  address: z.string().max(500, "Address too long").optional(),
  notes: z.string().max(2000, "Notes too long").optional(),
  dateOfBirth: z.coerce.date().optional(),
  licenseIssueDate: z.coerce.date().optional(),
  licenseExpiryDate: z.coerce.date().optional(),
  licenseDateOfBirth: z.coerce.date().optional(),
  licenseDateOfIssue: z.coerce.date().optional(),
  licenseDateOfExpiry: z.coerce.date().optional(),
});

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

// Vehicles table - Master data for all rental vehicles
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Vehicle Identification
  registration: varchar("registration").notNull().unique(), // Plate number
  vin: varchar("vin"), // Vehicle Identification Number
  
  // Vehicle Details
  make: varchar("make").notNull(), // e.g., Toyota, Honda
  model: varchar("model").notNull(), // e.g., Camry, Accord
  year: varchar("year").notNull(),
  color: varchar("color").notNull(),
  fuelType: varchar("fuel_type"), // petrol, diesel, electric, hybrid
  tankCapacity: integer("tank_capacity"), // Fuel tank capacity in liters
  
  // Tracking
  odometer: integer("odometer"), // Current mileage
  
  // Phase 1: UAE Compliance - GPS & Tracking (nullable)
  gpsDeviceId: varchar("gps_device_id"),
  trackerSerial: varchar("tracker_serial"),
  
  // Pricing (default rates) - Per Master Spec Part 5.2 DECIMAL(12,2) requirement
  dailyRate: numeric("daily_rate", { precision: 12, scale: 2 }).notNull(),
  weeklyRate: numeric("weekly_rate", { precision: 12, scale: 2 }),
  monthlyRate: numeric("monthly_rate", { precision: 12, scale: 2 }),
  
  // Availability Status - Per Master Spec Part 2.10 Vehicle Status Enums
  status: varchar("status", { length: 20 }).notNull().default("available"), // available, reserved, out, under_maintenance, under_repair, in_transfer, retired, lost_stolen
  
  // Additional Information
  notes: text("notes"),
  
  // RTA (Roads & Transport Authority) Fields
  rtaFileNumber: varchar("rta_file_number"), // Phase 1: RTA File Reference Number
  tcNumber: varchar("tc_number"), // Traffic plate number
  placeOfIssue: varchar("place_of_issue"), // Where registration was issued
  trafficCodeNo: varchar("traffic_code_no"), // Traffic code number
  ownerName: varchar("owner_name"), // Vehicle owner name
  ownerNationality: varchar("owner_nationality"), // Owner nationality
  registrationExpiry: timestamp("registration_expiry"), // Registration expiry date
  insuranceExpiry: timestamp("insurance_expiry"), // Insurance expiry date
  policyNumber: varchar("policy_number"), // Insurance policy number
  mortgagedBy: varchar("mortgaged_by"), // Mortgaged by (if applicable)
  modelOrigin: varchar("model_origin"), // Model origin (e.g., "Japanese", "German")
  vehicleType: varchar("vehicle_type"), // Vehicle type (e.g., "Sedan", "SUV")
  grossVehicleWeight: varchar("gross_vehicle_weight"), // Gross weight
  grossVehicleWeightType: varchar("gross_vehicle_weight_type"), // Weight unit (e.g., "kg", "lbs")
  engineNo: varchar("engine_no"), // Engine number
  chassisNo: varchar("chassis_no"), // Chassis number
  licensingAuthority: varchar("licensing_authority"), // Licensing authority
  emirate: emiratesEnum("emirate"), // UAE Emirate for geographic distribution
  
  // Master Spec Part 4.3: Vehicle Classification (FK to lookup tables)
  vehicleClassId: varchar("vehicle_class_id"), // FK to vehicle_classes - will be added after table created
  vehicleGroupId: varchar("vehicle_group_id"), // FK to vehicle_groups - will be added after table created
  
  // Branch Assignment
  branchId: varchar("branch_id").references(() => branches.id),
  
  // Audit fields
  disabled: boolean("disabled").notNull().default(false),
  disabledBy: varchar("disabled_by").references(() => users.id),
  disabledAt: timestamp("disabled_at"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_vehicles_registration").on(table.registration),
  index("idx_vehicles_status").on(table.status),
  index("idx_vehicles_branch").on(table.branchId),
  index("idx_vehicles_disabled").on(table.disabled),
  index("idx_vehicles_created_at").on(table.createdAt),
]);

export const vehiclesRelations = relations(vehicles, ({ one }) => ({
  creator: one(users, {
    fields: [vehicles.createdBy],
    references: [users.id],
    relationName: "vehicleCreator",
  }),
}));

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  disabledBy: true,
  disabledAt: true,
  disabled: true,
}).extend({
  // P0-6: Add max string length validation
  registration: z.string().max(20, "Registration too long"),
  vin: z.string().max(50, "VIN too long").optional(),
  make: z.string().max(100, "Make too long"),
  model: z.string().max(100, "Model too long"),
  year: z.string().max(4, "Year invalid"),
  color: z.string().max(50, "Color too long"),
  notes: z.string().max(2000, "Notes too long").optional(),
  registrationExpiry: z.coerce.date().optional(),
  insuranceExpiry: z.coerce.date().optional(),
});

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

// Sponsors table - Master data for sponsors and drivers
export const sponsors = pgTable("sponsors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Basic Information (bilingual)
  nameEn: varchar("name_en").notNull(),
  nameAr: varchar("name_ar"),
  
  // Identification
  nationality: varchar("nationality"),
  passportId: varchar("passport_id"), // Passport or National ID
  licenseNumber: varchar("license_number"),
  
  // Phase 1: UAE Compliance - Emirates ID (nullable but unique)
  emiratesIdNumber: varchar("emirates_id_number").unique(), // Unique constraint for UAE compliance
  emiratesIdExpiry: timestamp("emirates_id_expiry"),
  
  // Contact Information
  mobile: varchar("mobile"),
  address: text("address"),
  emirate: emiratesEnum("emirate"), // UAE Emirate for geographic distribution
  
  // Additional Information
  relation: varchar("relation"), // For sponsors: relationship to hirer (e.g., "Employer", "Family Member")
  notes: text("notes"),
  
  // Phase 1: Financial & Risk Management (nullable)
  maxExposureAmount: numeric("max_exposure_amount", { precision: 12, scale: 2 }), // Numeric for exposure limit calculations
  blacklistReason: text("blacklist_reason"), // Reason for blacklisting if disabled
  
  // Audit fields
  disabled: boolean("disabled").notNull().default(false),
  disabledBy: varchar("disabled_by").references(() => users.id),
  disabledAt: timestamp("disabled_at"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_sponsors_disabled").on(table.disabled),
  index("idx_sponsors_created_at").on(table.createdAt),
]);

export const sponsorsRelations = relations(sponsors, ({ one }) => ({
  creator: one(users, {
    fields: [sponsors.createdBy],
    references: [users.id],
    relationName: "sponsorCreator",
  }),
}));

export const insertSponsorSchema = createInsertSchema(sponsors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  disabledBy: true,
  disabledAt: true,
  disabled: true,
});

export type InsertSponsor = z.infer<typeof insertSponsorSchema>;
export type Sponsor = typeof sponsors.$inferSelect;

// Companies table - Master data for corporate sponsors
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Basic Information (bilingual)
  nameEn: varchar("name_en").notNull(),
  nameAr: varchar("name_ar"),
  
  // Registration Information
  registrationNumber: varchar("registration_number"),
  registrationValidity: timestamp("registration_validity"),
  taxId: varchar("tax_id"),
  taxValidity: timestamp("tax_validity"),
  
  // Contact Information
  contactPerson: varchar("contact_person"),
  phone: varchar("phone"),
  email: varchar("email"),
  address: text("address"),
  emirate: emiratesEnum("emirate"), // UAE Emirate for geographic distribution
  
  // Additional Information
  notes: text("notes"),
  
  // Audit fields
  disabled: boolean("disabled").notNull().default(false),
  disabledBy: varchar("disabled_by").references(() => users.id),
  disabledAt: timestamp("disabled_at"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_companies_disabled").on(table.disabled),
  index("idx_companies_created_at").on(table.createdAt),
]);

export const companiesRelations = relations(companies, ({ one }) => ({
  creator: one(users, {
    fields: [companies.createdBy],
    references: [users.id],
    relationName: "companyCreator",
  }),
}));

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  disabledBy: true,
  disabledAt: true,
  disabled: true,
}).extend({
  taxId: z.string().min(1, "Tax ID is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email").min(1, "Email is required"),
  registrationValidity: z.coerce.date().optional(),
  taxValidity: z.coerce.date().optional(),
});

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

// ========================================
// BRANCH MANAGEMENT ENTITIES
// ========================================

// Branches table - Multi-location branch management
export const branches: ReturnType<typeof pgTable> = pgTable("branches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Branch Identification
  branchCode: varchar("branch_code").notNull().unique(), // e.g., "DXB-001", "SHJ-001"
  
  // Basic Information (bilingual)
  nameEn: varchar("name_en").notNull(),
  nameAr: varchar("name_ar"),
  
  // Location
  emirate: emiratesEnum("emirate").notNull(),
  addressEn: text("address_en").notNull(),
  addressAr: text("address_ar"),
  
  // Contact Information
  phone: varchar("phone").notNull(),
  email: varchar("email"),
  
  // Management
  managerUserId: varchar("manager_user_id").references(() => users.id), // Branch manager
  
  // Settings
  isHeadquarters: boolean("is_headquarters").notNull().default(false),
  openingHours: jsonb("opening_hours"), // {mon: "8:00-20:00", tue: "8:00-20:00", ...}
  
  // Additional Information
  notes: text("notes"),
  
  // Audit fields
  isActive: boolean("is_active").notNull().default(true),
  disabled: boolean("disabled").notNull().default(false),
  disabledBy: varchar("disabled_by").references(() => users.id),
  disabledAt: timestamp("disabled_at"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_branches_code").on(table.branchCode),
  index("idx_branches_emirate").on(table.emirate),
  index("idx_branches_active").on(table.isActive),
  index("idx_branches_disabled").on(table.disabled),
  index("idx_branches_created_at").on(table.createdAt),
]);

export const branchesRelations = relations(branches, ({ one }) => ({
  manager: one(users, {
    fields: [branches.managerUserId],
    references: [users.id],
    relationName: "branchManager",
  }),
  creator: one(users, {
    fields: [branches.createdBy],
    references: [users.id],
    relationName: "branchCreator",
  }),
}));

export const insertBranchSchema = createInsertSchema(branches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  disabledBy: true,
  disabledAt: true,
  disabled: true,
}).extend({
  branchCode: z.string().min(1, "Branch code is required").max(50, "Branch code too long"),
  nameEn: z.string().min(1, "Branch name (English) is required").max(200, "Name too long"),
  nameAr: z.string().max(200, "Name too long").optional(),
  addressEn: z.string().min(1, "Address (English) is required").max(500, "Address too long"),
  addressAr: z.string().max(500, "Address too long").optional(),
  phone: z.string().min(1, "Phone number is required").max(20, "Phone number too long"),
  email: z.string().email("Invalid email").max(255, "Email too long").optional(),
  notes: z.string().max(2000, "Notes too long").optional(),
});

export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type Branch = typeof branches.$inferSelect;

// Branch Transfers table - Track vehicle transfers between branches
export const branchTransfers = pgTable("branch_transfers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Transfer Details
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  sourceBranchId: varchar("source_branch_id").notNull().references(() => branches.id),
  destinationBranchId: varchar("destination_branch_id").notNull().references(() => branches.id),
  
  // Transfer Information
  transferDate: timestamp("transfer_date").notNull(),
  reason: text("reason"),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, rejected, completed
  
  // Approval
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectedReason: text("rejected_reason"),
  
  // Completion
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  
  // Audit fields
  initiatedBy: varchar("initiated_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const branchTransfersRelations = relations(branchTransfers, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [branchTransfers.vehicleId],
    references: [vehicles.id],
  }),
  sourceBranch: one(branches, {
    fields: [branchTransfers.sourceBranchId],
    references: [branches.id],
    relationName: "transferSourceBranch",
  }),
  destinationBranch: one(branches, {
    fields: [branchTransfers.destinationBranchId],
    references: [branches.id],
    relationName: "transferDestinationBranch",
  }),
  initiator: one(users, {
    fields: [branchTransfers.initiatedBy],
    references: [users.id],
    relationName: "transferInitiator",
  }),
  approver: one(users, {
    fields: [branchTransfers.approvedBy],
    references: [users.id],
    relationName: "transferApprover",
  }),
}));

export const insertBranchTransferSchema = createInsertSchema(branchTransfers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  initiatedBy: true,
  approvedBy: true,
  approvedAt: true,
  completedAt: true,
}).extend({
  vehicleId: z.string().min(1, "Vehicle is required"),
  sourceBranchId: z.string().min(1, "Source branch is required"),
  destinationBranchId: z.string().min(1, "Destination branch is required"),
  transferDate: z.coerce.date(),
  reason: z.string().max(1000, "Reason too long").optional(),
});

export type InsertBranchTransfer = z.infer<typeof insertBranchTransferSchema>;
export type BranchTransfer = typeof branchTransfers.$inferSelect;

// ========================================
// DRIVER SERVICE ENTITIES
// ========================================

// Driver Outsource Companies table - Companies providing outsourced drivers
export const driverOutsourceCompanies = pgTable("driver_outsource_companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Company Information (bilingual)
  nameEn: varchar("name_en").notNull(),
  nameAr: varchar("name_ar"),
  
  // Contact Information
  contactPerson: varchar("contact_person"),
  mobile: varchar("mobile").notNull(),
  email: varchar("email"),
  address: text("address"),
  
  // Additional Information
  notes: text("notes"),
  
  // Audit fields
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_outsource_companies_active").on(table.isActive),
  index("idx_outsource_companies_created_at").on(table.createdAt),
]);

export const driverOutsourceCompaniesRelations = relations(driverOutsourceCompanies, ({ one }) => ({
  creator: one(users, {
    fields: [driverOutsourceCompanies.createdBy],
    references: [users.id],
    relationName: "outsourceCompanyCreator",
  }),
}));

export const insertDriverOutsourceCompanySchema = createInsertSchema(driverOutsourceCompanies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
}).extend({
  nameEn: z.string().min(1, "Company name (English) is required").max(200, "Name too long"),
  nameAr: z.string().max(200, "Name too long").optional(),
  mobile: z.string().min(1, "Mobile number is required").max(20, "Mobile number too long"),
  email: z.string().email("Invalid email").max(255, "Email too long").optional(),
  isActive: z.boolean().default(true).optional(),
});

export type InsertDriverOutsourceCompany = z.infer<typeof insertDriverOutsourceCompanySchema>;
export type DriverOutsourceCompany = typeof driverOutsourceCompanies.$inferSelect;

// Phase 1: Company Authorized Signatories - Track authorized signatories with identity documents
export const companySignatories = pgTable("company_signatories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Company Reference
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Signatory Information (bilingual)
  nameEn: varchar("name_en").notNull(),
  nameAr: varchar("name_ar"),
  
  // Position & Authority
  position: varchar("position").notNull(), // e.g., "Managing Director", "Authorized Signatory"
  authorizationLevel: varchar("authorization_level"), // e.g., "Level 1", "Level 2", "Unlimited"
  
  // Emirates ID
  emiratesIdNumber: varchar("emirates_id_number"),
  emiratesIdExpiry: timestamp("emirates_id_expiry"),
  
  // Passport Information
  passportNumber: varchar("passport_number"),
  passportExpiry: timestamp("passport_expiry"),
  nationality: varchar("nationality"),
  
  // Contact Information
  mobile: varchar("mobile"),
  email: varchar("email"),
  
  // Documents (file paths)
  emiratesIdCopy: text("emirates_id_copy"),
  passportCopy: text("passport_copy"),
  authorizationLetterCopy: text("authorization_letter_copy"),
  
  // Additional Information
  notes: text("notes"),
  
  // Audit fields
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_signatories_company").on(table.companyId),
  index("idx_signatories_active").on(table.isActive),
  index("idx_signatories_created_at").on(table.createdAt),
]);

export const companySignatoriesRelations = relations(companySignatories, ({ one }) => ({
  company: one(companies, {
    fields: [companySignatories.companyId],
    references: [companies.id],
  }),
  creator: one(users, {
    fields: [companySignatories.createdBy],
    references: [users.id],
    relationName: "signatoryCreator",
  }),
}));

export const insertCompanySignatorySchema = createInsertSchema(companySignatories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
}).extend({
  nameEn: z.string().min(1, "Signatory name (English) is required").max(200, "Name too long"),
  nameAr: z.string().max(200, "Name too long").optional(),
  position: z.string().min(1, "Position is required").max(100, "Position too long"),
  mobile: z.string().max(20, "Mobile number too long").optional(),
  email: z.string().email("Invalid email").max(255, "Email too long").optional(),
  isActive: z.boolean().default(true).optional(),
});

export type InsertCompanySignatory = z.infer<typeof insertCompanySignatorySchema>;
export type CompanySignatory = typeof companySignatories.$inferSelect;

// Phase 1: Customer-Company Links - Track corporate customer relationships (employees, contractors, etc.)
export const customerCompanyLinks = pgTable("customer_company_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Customer & Company References
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Relationship Details
  relationshipType: varchar("relationship_type", { length: 30 }).notNull().default("employee"), // employee, contractor, partner, affiliate
  employeeId: varchar("employee_id"), // Employee badge/ID number
  department: varchar("department"),
  
  // Financial Limits (for corporate exposure tracking)
  creditLimit: varchar("credit_limit"), // Maximum rental exposure allowed
  currentExposure: varchar("current_exposure").default("0"), // Current outstanding amount
  
  // Effective Period
  effectiveFrom: timestamp("effective_from").notNull().defaultNow(),
  effectiveTo: timestamp("effective_to"),
  
  // Additional Information
  notes: text("notes"),
  
  // Audit fields
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_customer_company_customer").on(table.customerId),
  index("idx_customer_company_company").on(table.companyId),
  index("idx_customer_company_active").on(table.isActive),
  index("idx_customer_company_created_at").on(table.createdAt),
]);

export const customerCompanyLinksRelations = relations(customerCompanyLinks, ({ one }) => ({
  customer: one(customers, {
    fields: [customerCompanyLinks.customerId],
    references: [customers.id],
  }),
  company: one(companies, {
    fields: [customerCompanyLinks.companyId],
    references: [companies.id],
  }),
  creator: one(users, {
    fields: [customerCompanyLinks.createdBy],
    references: [users.id],
    relationName: "customerCompanyLinkCreator",
  }),
}));

export const insertCustomerCompanyLinkSchema = createInsertSchema(customerCompanyLinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
}).extend({
  relationshipType: z.enum(["employee", "contractor", "partner", "affiliate"]).default("employee"),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional(),
  isActive: z.boolean().default(true).optional(),
});

export type InsertCustomerCompanyLink = z.infer<typeof insertCustomerCompanyLinkSchema>;
export type CustomerCompanyLink = typeof customerCompanyLinks.$inferSelect;

// Drivers table - Master data for all drivers (in-house and outsourced)
export const drivers = pgTable("drivers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Driver Identification
  driverCode: varchar("driver_code").notNull().unique(), // e.g., "DRV-001"
  
  // Basic Information (bilingual)
  nameEn: varchar("name_en").notNull(),
  nameAr: varchar("name_ar"),
  
  // Contact Information
  mobile: varchar("mobile").notNull(),
  email: varchar("email"),
  nationality: varchar("nationality").notNull(),
  
  // Phase 1: UAE Compliance - Identity & Legal Documents (nullable)
  dateOfBirth: timestamp("date_of_birth"),
  gender: varchar("gender", { length: 10 }), // male, female
  
  // Emirates ID
  emiratesIdNumber: varchar("emirates_id_number"),
  emiratesIdExpiry: timestamp("emirates_id_expiry"),
  
  // UID (Unique Identification Number)
  uidNumber: varchar("uid_number"),
  
  // Visa Information
  visaNumber: varchar("visa_number"),
  visaIssuer: varchar("visa_issuer"),
  visaExpiry: timestamp("visa_expiry"),
  
  // Passport Information
  passportNumber: varchar("passport_number"),
  passportExpiry: timestamp("passport_expiry"),
  
  // RTA (Roads & Transport Authority)
  rtaFileNumber: varchar("rta_file_number"),
  
  // License Information
  licenseNumber: varchar("license_number").notNull(),
  licenseClass: varchar("license_class").default("Light Vehicle"), // e.g., "Light Vehicle", "Heavy Vehicle"
  licenseExpiry: timestamp("license_expiry"),
  
  // Skills & Languages
  languagesSpoken: text("languages_spoken").array(), // ['English', 'Arabic', 'Urdu', 'Hindi']
  
  // Employment Information
  employmentType: varchar("employment_type", { length: 20 }).notNull(), // in_house, outsourced
  outsourceCompanyId: varchar("outsource_company_id").references(() => driverOutsourceCompanies.id), // If outsourced
  
  // Cost Rate (for profit tracking - internal use only) - Per Master Spec Part 5.5.1 DECIMAL(12,2)
  costRate: numeric("cost_rate", { precision: 12, scale: 2 }), // Daily cost rate to company
  
  // Availability
  availability: varchar("availability", { length: 20 }).notNull().default("available"), // available, on_assignment, off_duty, on_leave
  
  // Documents (file paths)
  emiratesIdFront: text("emirates_id_front"), // File path
  licenseCopy: text("license_copy"), // File path
  
  // Additional Information
  notes: text("notes"),
  
  // Audit fields
  isActive: boolean("is_active").notNull().default(true),
  disabled: boolean("disabled").notNull().default(false),
  disabledBy: varchar("disabled_by").references(() => users.id),
  disabledAt: timestamp("disabled_at"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_drivers_code").on(table.driverCode),
  index("idx_drivers_availability").on(table.availability),
  index("idx_drivers_employment_type").on(table.employmentType),
  index("idx_drivers_active").on(table.isActive),
  index("idx_drivers_disabled").on(table.disabled),
  index("idx_drivers_created_at").on(table.createdAt),
]);

export const driversRelations = relations(drivers, ({ one }) => ({
  outsourceCompany: one(driverOutsourceCompanies, {
    fields: [drivers.outsourceCompanyId],
    references: [driverOutsourceCompanies.id],
  }),
  creator: one(users, {
    fields: [drivers.createdBy],
    references: [users.id],
    relationName: "driverCreator",
  }),
}));

export const insertDriverSchema = createInsertSchema(drivers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  disabledBy: true,
  disabledAt: true,
  disabled: true,
  driverCode: true, // Auto-generated on backend
}).extend({
  nameEn: z.string().min(1, "Driver name (English) is required").max(200, "Name too long"),
  nameAr: z.string().max(200, "Name too long").optional(),
  mobile: z.string().min(1, "Mobile number is required").max(20, "Mobile number too long"),
  email: z.string().email("Invalid email").max(255, "Email too long").optional(),
  nationality: z.string().min(1, "Nationality is required").max(100, "Nationality too long"),
  licenseNumber: z.string().min(1, "License number is required").max(100, "License number too long"),
  licenseClass: z.string().max(50, "License class too long").default("Light Vehicle"), // Optional with default
  licenseExpiry: z.coerce.date().optional(), // Optional for now
  employmentType: z.enum(["in_house", "outsourced"]),
  notes: z.string().max(2000, "Notes too long").optional(),
});

export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Driver = typeof drivers.$inferSelect;

// Driver Rate Cards table - Pricing structure for drivers (daily/hourly rates)
export const driverRateCards = pgTable("driver_rate_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Driver Reference
  driverId: varchar("driver_id").notNull().references(() => drivers.id),
  
  // Rate Information
  rateType: varchar("rate_type", { length: 20 }).notNull(), // daily, hourly
  baseRate: varchar("base_rate").notNull(), // Base customer rate
  
  // Effective Period
  effectiveFrom: timestamp("effective_from").notNull(),
  effectiveTo: timestamp("effective_to"),
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  
  // Audit fields
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_driver_rates_driver").on(table.driverId),
  index("idx_driver_rates_active").on(table.isActive),
  index("idx_driver_rates_effective").on(table.effectiveFrom),
]);

export const driverRateCardsRelations = relations(driverRateCards, ({ one }) => ({
  driver: one(drivers, {
    fields: [driverRateCards.driverId],
    references: [drivers.id],
  }),
  creator: one(users, {
    fields: [driverRateCards.createdBy],
    references: [users.id],
  }),
}));

export const insertDriverRateCardSchema = createInsertSchema(driverRateCards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
}).extend({
  driverId: z.string().min(1, "Driver is required"),
  rateType: z.enum(["daily", "hourly"]),
  baseRate: z.string().min(1, "Base rate is required"),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional(),
});

export type InsertDriverRateCard = z.infer<typeof insertDriverRateCardSchema>;
export type DriverRateCard = typeof driverRateCards.$inferSelect;

// Driver Schedule Blocks table - Recurring availability/unavailability windows
export const driverScheduleBlocks = pgTable("driver_schedule_blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Driver Reference
  driverId: varchar("driver_id").notNull().references(() => drivers.id),
  
  // Schedule Window
  startDateTime: timestamp("start_date_time").notNull(),
  endDateTime: timestamp("end_date_time").notNull(),
  
  // Block Type
  blockType: varchar("block_type", { length: 20 }).notNull(), // unavailable, on_leave, maintenance
  reason: text("reason"),
  
  // Audit fields
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_schedule_blocks_driver").on(table.driverId),
  index("idx_schedule_blocks_start").on(table.startDateTime),
  index("idx_schedule_blocks_end").on(table.endDateTime),
]);

export const driverScheduleBlocksRelations = relations(driverScheduleBlocks, ({ one }) => ({
  driver: one(drivers, {
    fields: [driverScheduleBlocks.driverId],
    references: [drivers.id],
  }),
  creator: one(users, {
    fields: [driverScheduleBlocks.createdBy],
    references: [users.id],
  }),
}));

export const insertDriverScheduleBlockSchema = createInsertSchema(driverScheduleBlocks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
}).extend({
  driverId: z.string().min(1, "Driver is required"),
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date(),
  blockType: z.enum(["unavailable", "on_leave", "maintenance"]),
  reason: z.string().max(500, "Reason too long").optional(),
});

export type InsertDriverScheduleBlock = z.infer<typeof insertDriverScheduleBlockSchema>;
export type DriverScheduleBlock = typeof driverScheduleBlocks.$inferSelect;

// Driver Assignments table - Link drivers to contracts with scheduling and surcharges
export const driverAssignments = pgTable("driver_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Assignment References
  contractId: varchar("contract_id").notNull().references(() => contracts.id),
  driverId: varchar("driver_id").notNull().references(() => drivers.id),
  
  // Assignment Period
  startDateTime: timestamp("start_date_time").notNull(),
  endDateTime: timestamp("end_date_time").notNull(),
  
  // Service Type & Charges
  serviceType: varchar("service_type", { length: 20 }).notNull(), // daily, hourly
  baseRate: varchar("base_rate").notNull(),
  quantity: varchar("quantity").notNull(), // Days or hours
  
  // Surcharges (calculated breakdown stored as JSON)
  surchargeBreakdown: jsonb("surcharge_breakdown"), // {night: 100, weekend: 200, holiday: 150}
  totalSurcharges: varchar("total_surcharges").notNull().default('0'),
  totalCharge: varchar("total_charge").notNull(), // base + surcharges
  
  // Assignment Status
  status: varchar("status", { length: 20 }).notNull().default("scheduled"), // scheduled, active, completed, cancelled
  
  // Handover Information
  handoverNotes: text("handover_notes"),
  handoverNotesAr: text("handover_notes_ar"),
  completionNotes: text("completion_notes"),
  handoverDateTime: timestamp("handover_date_time"),
  completionDateTime: timestamp("completion_date_time"),
  
  // Audit fields
  assignedBy: varchar("assigned_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_driver_assignments_contract").on(table.contractId),
  index("idx_driver_assignments_driver").on(table.driverId),
  index("idx_driver_assignments_status").on(table.status),
  index("idx_driver_assignments_start").on(table.startDateTime),
  index("idx_driver_assignments_end").on(table.endDateTime),
]);

export const driverAssignmentsRelations = relations(driverAssignments, ({ one }) => ({
  contract: one(contracts, {
    fields: [driverAssignments.contractId],
    references: [contracts.id],
  }),
  driver: one(drivers, {
    fields: [driverAssignments.driverId],
    references: [drivers.id],
  }),
  assigner: one(users, {
    fields: [driverAssignments.assignedBy],
    references: [users.id],
  }),
}));

export const insertDriverAssignmentSchema = createInsertSchema(driverAssignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  assignedBy: true,
  handoverDateTime: true,
  completionDateTime: true,
}).extend({
  contractId: z.string().min(1, "Contract is required"),
  driverId: z.string().min(1, "Driver is required"),
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date(),
  serviceType: z.enum(["daily", "hourly"]),
  baseRate: z.string().min(1, "Base rate is required"),
  quantity: z.string().min(1, "Quantity is required"),
  totalSurcharges: z.string(),
  totalCharge: z.string().min(1, "Total charge is required"),
});

export type InsertDriverAssignment = z.infer<typeof insertDriverAssignmentSchema>;
export type DriverAssignment = typeof driverAssignments.$inferSelect;

// ========================================
// PUBLIC HOLIDAYS CALENDAR
// ========================================

// Public Holidays table - UAE public holidays calendar for surcharge calculation
export const publicHolidays = pgTable("public_holidays", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Holiday Information (bilingual)
  nameEn: varchar("name_en").notNull(),
  nameAr: varchar("name_ar"),
  
  // Date
  holidayDate: timestamp("holiday_date").notNull(),
  
  // Recurrence
  isRecurring: boolean("is_recurring").notNull().default(false), // Annually recurring
  recurrenceType: varchar("recurrence_type", { length: 20 }), // gregorian, hijri
  
  // Surcharge Configuration
  surchargeRate: varchar("surcharge_rate"), // Specific surcharge for this holiday
  
  // Additional Information
  notes: text("notes"),
  
  // Audit fields
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_public_holidays_date").on(table.holidayDate),
  index("idx_public_holidays_active").on(table.isActive),
]);

export const publicHolidaysRelations = relations(publicHolidays, ({ one }) => ({
  creator: one(users, {
    fields: [publicHolidays.createdBy],
    references: [users.id],
  }),
}));

export const insertPublicHolidaySchema = createInsertSchema(publicHolidays).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
}).extend({
  nameEn: z.string().min(1, "Holiday name (English) is required").max(200, "Name too long"),
  nameAr: z.string().max(200, "Name too long").optional(),
  holidayDate: z.coerce.date(),
  recurrenceType: z.enum(["gregorian", "hijri"]).optional(),
  notes: z.string().max(500, "Notes too long").optional(),
});

export type InsertPublicHoliday = z.infer<typeof insertPublicHolidaySchema>;
export type PublicHoliday = typeof publicHolidays.$inferSelect;

// Damage Assessments table - Structured damage tracking for completed rentals
export const damageAssessments = pgTable("damage_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").notNull().references(() => contracts.id),
  
  // Damage Details
  location: varchar("location").notNull(), // e.g., "Front Bumper", "Left Door", "Windshield"
  damageType: varchar("damage_type").notNull(), // scratch, dent, crack, broken, missing
  severity: varchar("severity").notNull(), // minor, moderate, major
  description: text("description"),
  
  // Cost Information
  estimatedCost: varchar("estimated_cost"),
  actualCost: varchar("actual_cost"),
  
  // Documentation
  photos: text("photos").array(), // Array of photo URLs/paths
  
  // Audit fields
  recordedBy: varchar("recorded_by").notNull().references(() => users.id),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

export const damageAssessmentsRelations = relations(damageAssessments, ({ one }) => ({
  contract: one(contracts, {
    fields: [damageAssessments.contractId],
    references: [contracts.id],
  }),
  recorder: one(users, {
    fields: [damageAssessments.recordedBy],
    references: [users.id],
  }),
}));

export const insertDamageAssessmentSchema = createInsertSchema(damageAssessments).omit({
  id: true,
  recordedAt: true,
});

export type InsertDamageAssessment = z.infer<typeof insertDamageAssessmentSchema>;
export type DamageAssessment = typeof damageAssessments.$inferSelect;

// Contracts table
export const contracts = pgTable("contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractNumber: integer("contract_number").notNull().unique(),
  status: varchar("status", { length: 35 }).notNull().default("draft"), // draft, active, completed, completed_pending_accident, closed, cancelled
  
  // Foreign Keys to Master Data
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  
  // Branch Assignment
  branchId: varchar("branch_id").references(() => branches.id),
  
  // Hirer Type - determines which fields are required
  hirerType: varchar("hirer_type", { length: 20 }).notNull().default("direct"), // direct, with_sponsor, from_company
  
  // Foreign Keys to Sponsors and Companies (Master Data) - Preferred approach for new contracts
  sponsorId: varchar("sponsor_id").references(() => sponsors.id), // Reference to individual sponsor
  companySponsorId: varchar("company_sponsor_id").references(() => companies.id), // Reference to company sponsor (for from_company)
  
  // Sponsor Information (when hirerType is 'with_sponsor') - Legacy inline fields for backward compatibility
  sponsorName: varchar("sponsor_name"),
  sponsorNationality: varchar("sponsor_nationality"),
  sponsorPassportId: varchar("sponsor_passport_id"),
  sponsorAddress: text("sponsor_address"),
  sponsorMobile: varchar("sponsor_mobile"),
  sponsorCreditCard: varchar("sponsor_credit_card"),
  
  // Company Hirer Information (when hirerType is 'from_company')
  // When a company rents, customer record = company, these fields = individual driver
  hirerNameEn: varchar("hirer_name_en"),
  hirerNameAr: varchar("hirer_name_ar"),
  hirerNationality: varchar("hirer_nationality"),
  hirerPassportId: varchar("hirer_passport_id"),
  hirerLicenseNumber: varchar("hirer_license_number"),
  hirerMobile: varchar("hirer_mobile"),
  hirerAddress: text("hirer_address"),
  
  // Vehicle Inspection Checklist
  inspectionTools: boolean("inspection_tools"), // Tools present Y/N
  inspectionSpareTyre: boolean("inspection_spare_tyre"), // Spare tyre present Y/N
  inspectionGps: boolean("inspection_gps"), // GPS present Y/N
  inspectionFuelPercentage: integer("inspection_fuel_percentage"), // Fuel % at start
  inspectionDamageNotes: text("inspection_damage_notes"), // Any damage notes
  
  vehicleCondition: text("vehicle_condition"), // JSON array of damaged areas/notes (legacy)
  fuelLevelStart: varchar("fuel_level_start"), // e.g., "Full", "3/4", "1/2", "1/4", "Empty" (legacy)
  fuelLevelEnd: varchar("fuel_level_end"),
  odometerStart: integer("odometer_start"),
  odometerEnd: integer("odometer_end"),
  
  // Rental Details
  rentalType: varchar("rental_type", { length: 20 }).notNull().default("daily"), // daily, weekly, monthly
  rentalStartDate: timestamp("rental_start_date").notNull(),
  rentalEndDate: timestamp("rental_end_date").notNull(),
  timeIn: varchar("time_in"), // Time In (e.g., "09:00")
  timeOut: varchar("time_out"), // Time Out (e.g., "17:00")
  rentalStartTime: varchar("rental_start_time"), // e.g., "09:00" (legacy)
  rentalEndTime: varchar("rental_end_time"), // (legacy)
  pickupLocation: varchar("pickup_location").notNull(),
  dropoffLocation: varchar("dropoff_location").notNull(),
  
  // Pricing - Per Master Spec Part 5.5.1 DECIMAL(12,2) requirement
  dailyRate: numeric("daily_rate", { precision: 12, scale: 2 }).notNull(),
  weeklyRate: numeric("weekly_rate", { precision: 12, scale: 2 }),
  monthlyRate: numeric("monthly_rate", { precision: 12, scale: 2 }),
  mileageLimit: integer("mileage_limit"), // e.g., 300 km per day
  extraKmRate: numeric("extra_km_rate", { precision: 12, scale: 4 }), // Per Master Spec: DECIMAL(12,4) for rates
  totalDays: integer("total_days").notNull(),
  
  // Financial Breakdown - Per Master Spec Part 5.5.1 DECIMAL(12,2) requirement
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }), // Base rental amount before VAT
  vatAmount: numeric("vat_amount", { precision: 12, scale: 2 }), // Calculated VAT
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(), // Grand total including VAT
  securityDeposit: numeric("security_deposit", { precision: 12, scale: 2 }), // Refundable deposit amount
  accidentLiability: numeric("accident_liability", { precision: 12, scale: 2 }), // e.g., "2500" AED hirer responsibility
  
  // Payment Tracking (Phase 1)
  depositPaid: boolean("deposit_paid").notNull().default(false),
  depositPaidDate: timestamp("deposit_paid_date"),
  depositPaidMethod: varchar("deposit_paid_method", { length: 50 }), // cash, card, bank_transfer
  depositRefunded: boolean("deposit_refunded").notNull().default(false),
  depositRefundedDate: timestamp("deposit_refunded_date"),
  finalPaymentReceived: boolean("final_payment_received").notNull().default(false),
  finalPaymentDate: timestamp("final_payment_date"),
  finalPaymentMethod: varchar("final_payment_method", { length: 50 }),
  paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("pending"), // pending, partial, paid, refunded
  outstandingBalance: numeric("outstanding_balance", { precision: 12, scale: 2 }), // Remaining amount to be paid
  
  // Payment Summary - Per Master Spec Part 5.5.1
  depositExpected: numeric("deposit_expected", { precision: 12, scale: 2 }), // Expected deposit amount
  totalPaymentsIn: numeric("total_payments_in", { precision: 12, scale: 2 }).default("0"), // Total payments received
  totalPaymentsOut: numeric("total_payments_out", { precision: 12, scale: 2 }).default("0"), // Total refunds/payouts
  hasPendingIncident: boolean("has_pending_incident").default(false), // Flag for pending accidents/incidents
  
  // Extra Charges (Phase 2) - Per Master Spec Part 5.5.1 DECIMAL(12,2) requirement
  extraKmCharge: numeric("extra_km_charge", { precision: 12, scale: 2 }), // Calculated overage charge
  extraKmDriven: integer("extra_km_driven"), // Km over the limit
  fuelCharge: numeric("fuel_charge", { precision: 12, scale: 2 }), // Fuel refill charge
  salikCharge: numeric("salik_charge", { precision: 12, scale: 2 }), // SALIK toll charges
  trafficFineCharge: numeric("traffic_fine_charge", { precision: 12, scale: 2 }), // Traffic fines
  damageCharge: numeric("damage_charge", { precision: 12, scale: 2 }), // Total damage repair cost
  otherCharges: numeric("other_charges", { precision: 12, scale: 2 }), // Any additional charges
  totalExtraCharges: numeric("total_extra_charges", { precision: 12, scale: 2 }), // Sum of all extra charges
  
  // Delivery Service (Drop-off and Pick-up)
  dropOffEnabled: boolean("drop_off_enabled").notNull().default(false),
  dropOffCharge: numeric("drop_off_charge", { precision: 12, scale: 2 }), // Charge for delivering vehicle to customer
  dropOffAddressEn: text("drop_off_address_en"), // Drop-off address in English
  dropOffAddressAr: text("drop_off_address_ar"), // Drop-off address in Arabic
  pickUpEnabled: boolean("pick_up_enabled").notNull().default(false),
  pickUpCharge: numeric("pick_up_charge", { precision: 12, scale: 2 }), // Charge for picking up vehicle from customer
  pickUpAddressEn: text("pick_up_address_en"), // Pick-up address in English
  pickUpAddressAr: text("pick_up_address_ar"), // Pick-up address in Arabic
  
  // Driver Service (Phase 3 - Driver Assignment Integration)
  requiresDriver: boolean("requires_driver").notNull().default(false), // Whether driver service is required
  driverServiceType: varchar("driver_service_type", { length: 20 }).default("none"), // 'daily', 'hourly', 'flat', 'none'
  driverServiceRate: numeric("driver_service_rate", { precision: 12, scale: 2 }), // Rate per unit (day/hour/flat)
  driverServiceQuantity: numeric("driver_service_quantity", { precision: 10, scale: 2 }), // Number of days, hours, or trips
  driverServiceTotal: numeric("driver_service_total", { precision: 12, scale: 2 }), // Total driver service charge
  assignedDriverId: varchar("assigned_driver_id").references(() => drivers.id), // FK to drivers table
  driverServiceNotes: text("driver_service_notes"), // Driver service notes in English
  driverServiceNotesAr: text("driver_service_notes_ar"), // Driver service notes in Arabic
  
  // Additional Information
  notes: text("notes"),
  termsAccepted: boolean("terms_accepted").notNull().default(false),
  
  // State Transition Tracking (Phase 2)
  confirmedBy: varchar("confirmed_by"),
  confirmedAt: timestamp("confirmed_at"),
  activatedBy: varchar("activated_by"),
  activatedAt: timestamp("activated_at"),
  completedBy: varchar("completed_by"),
  completedAt: timestamp("completed_at"),
  closedBy: varchar("closed_by"),
  closedAt: timestamp("closed_at"),
  closureRemark: text("closure_remark"), // Admin override remark when closing with outstanding balance
  
  // Cancellation Tracking - Per Master Spec Part 5.5.1
  cancelledBy: varchar("cancelled_by"),
  cancelledAt: timestamp("cancelled_at"),
  cancellationReason: text("cancellation_reason"), // Required reason for cancellation
  
  // Vehicle Handover Lifecycle Tracking - Per Master Spec Part 3
  vehicleCheckoutAt: timestamp("vehicle_checkout_at"), // When vehicle was physically handed over
  lastCheckoutInspectionId: varchar("last_checkout_inspection_id"), // Reference to checkout inspection
  vehicleReturnedAt: timestamp("vehicle_returned_at"), // When vehicle was physically returned
  lastReturnInspectionId: varchar("last_return_inspection_id"), // Reference to return inspection
  
  earlyClosureReason: text("early_closure_reason"), // Task 11: Optional reason for early completion
  editReason: text("edit_reason"), // Reason for edits made in Active/Completed stages
  
  // Audit fields
  createdBy: varchar("created_by").notNull(),
  finalizedBy: varchar("finalized_by"),
  finalizedAt: timestamp("finalized_at"),
  disabled: boolean("disabled").notNull().default(false), // Disabled contracts are hidden
  disabledBy: varchar("disabled_by"),
  disabledAt: timestamp("disabled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  
  // Optimistic Locking - Per Master Spec Part 6.5.2 and A.3
  version: integer("version").notNull().default(1),
}, (table) => [
  index("idx_contracts_customer_id").on(table.customerId),
  index("idx_contracts_vehicle_id").on(table.vehicleId),
  index("idx_contracts_branch").on(table.branchId),
  index("idx_contracts_created_by").on(table.createdBy),
  index("idx_contracts_status").on(table.status),
  index("idx_contracts_disabled").on(table.disabled),
  index("idx_contracts_created_at").on(table.createdAt),
  index("idx_contracts_status_disabled").on(table.status, table.disabled),
  index("idx_contracts_contract_number").on(table.contractNumber),
]);

export const contractsRelations = relations(contracts, ({ one }) => ({
  customer: one(customers, {
    fields: [contracts.customerId],
    references: [customers.id],
  }),
  vehicle: one(vehicles, {
    fields: [contracts.vehicleId],
    references: [vehicles.id],
  }),
  sponsor: one(sponsors, {
    fields: [contracts.sponsorId],
    references: [sponsors.id],
    relationName: "contractSponsor",
  }),
  companySponsor: one(companies, {
    fields: [contracts.companySponsorId],
    references: [companies.id],
    relationName: "contractCompanySponsor",
  }),
  creator: one(users, {
    fields: [contracts.createdBy],
    references: [users.id],
    relationName: "creator",
  }),
  finalizer: one(users, {
    fields: [contracts.finalizedBy],
    references: [users.id],
    relationName: "finalizer",
  }),
}));

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  contractNumber: true,
  confirmedBy: true,
  confirmedAt: true,
  activatedBy: true,
  activatedAt: true,
  completedBy: true,
  completedAt: true,
  closedBy: true,
  closedAt: true,
  cancelledBy: true,  // Cancellation tracking - auto-managed
  cancelledAt: true,  // Cancellation tracking - auto-managed
  // Vehicle Handover Lifecycle - auto-managed by inspection creation
  vehicleCheckoutAt: true,
  lastCheckoutInspectionId: true,
  vehicleReturnedAt: true,
  lastReturnInspectionId: true,
  finalizedBy: true,
  finalizedAt: true,
  disabledBy: true,
  disabledAt: true,
  version: true, // Optimistic locking field - auto-managed
}).extend({
  // Coerce date strings to Date objects for all date fields
  rentalStartDate: z.coerce.date().refine((date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    return date >= today;
  }, { message: "Rental start date cannot be in the past" }),
  rentalEndDate: z.coerce.date(),
  depositPaidDate: z.coerce.date().optional(),
  depositRefundedDate: z.coerce.date().optional(),
  finalPaymentDate: z.coerce.date().optional(),
}).superRefine((data, ctx) => {
  // Phase 1: Date validations
  // Rental end date must be after start date
  if (data.rentalEndDate < data.rentalStartDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Rental end date must be on or after start date",
      path: ["rentalEndDate"],
    });
  }
  
  // Phase 2: Party-Type Validation - Per Master Spec Part 2.1
  // Validates hirer/sponsor/company combinations based on hirerType
  const hirerType = data.hirerType || "direct";
  
  switch (hirerType) {
    case "direct":
      // DIRECT_HIRER: Hirer required (customerId), Sponsor MUST BE EMPTY, Company MUST BE EMPTY
      if (data.sponsorId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Direct hirer contracts cannot have a sponsor. Remove sponsorId or change hirerType to 'with_sponsor'.",
          path: ["sponsorId"],
        });
      }
      if (data.companySponsorId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Direct hirer contracts cannot have a company sponsor. Remove companySponsorId or change hirerType to 'from_company'.",
          path: ["companySponsorId"],
        });
      }
      break;
      
    case "with_sponsor":
      // SPONSORED_INDIVIDUAL: Hirer required, Sponsor required, Company MUST BE EMPTY
      if (!data.sponsorId && !data.sponsorName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sponsored individual contracts require a sponsor. Provide sponsorId or sponsor details.",
          path: ["sponsorId"],
        });
      }
      if (data.companySponsorId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sponsored individual contracts cannot have a company sponsor. Remove companySponsorId or change hirerType to 'from_company'.",
          path: ["companySponsorId"],
        });
      }
      break;
      
    case "from_company":
      // SPONSORED_COMPANY: Hirer required (driver info), Sponsor MUST BE EMPTY, Company required
      if (!data.companySponsorId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Company contracts require a company sponsor. Provide companySponsorId.",
          path: ["companySponsorId"],
        });
      }
      if (data.sponsorId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Company contracts cannot have an individual sponsor. Remove sponsorId or change hirerType to 'with_sponsor'.",
          path: ["sponsorId"],
        });
      }
      break;
      
    default:
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid hirerType: ${hirerType}. Must be 'direct', 'with_sponsor', or 'from_company'.`,
        path: ["hirerType"],
      });
  }
});

export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contracts.$inferSelect;

// Extended contract type with joined customer and vehicle data for list views
export type ContractWithDetails = Contract & {
  customerNameEn: string | null;
  customerNameAr: string | null;
  vehicleRegistration: string | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  sponsor?: Sponsor | null;
  companySponsor?: Company | null;
  creatorName?: string | null; // Added for Task 10
  creatorFirstName?: string | null; // Added for Task 10
  creatorLastName?: string | null; // Added for Task 10
};

// Payments table - Track all payments received for contracts
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").notNull().references(() => contracts.id),
  
  // Branch Assignment
  branchId: varchar("branch_id").references(() => branches.id),
  
  // Payment Details - Per Master Spec Part 5.5.1 DECIMAL(12,2) requirement
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(), // Payment amount with proper precision
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // cash, card, bank_transfer, check, etc.
  currency: varchar("currency", { length: 10 }).notNull().default(""), // Currency from company settings
  
  // Task 12: Payment method details (conditional based on payment method)
  chequeNumber: varchar("cheque_number"), // Required for check/cheque payments
  last4Digits: varchar("last4_digits", { length: 4 }), // Required for card payments
  referenceNumber: varchar("reference_number"), // Required for non-cash/non-card payments
  
  // Payment Metadata
  paidAt: timestamp("paid_at").notNull().defaultNow(), // When payment was received
  notes: text("notes"), // Optional notes about the payment
  
  // Audit fields
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_payments_contract_id").on(table.contractId),
  index("idx_payments_branch").on(table.branchId),
  index("idx_payments_created_at").on(table.createdAt),
]);

export const paymentsRelations = relations(payments, ({ one }) => ({
  contract: one(contracts, {
    fields: [payments.contractId],
    references: [contracts.id],
  }),
  creator: one(users, {
    fields: [payments.createdBy],
    references: [users.id],
    relationName: "paymentCreator",
  }),
}));

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
}).extend({
  paidAt: z.coerce.date(),
  amount: z.string().min(1, "Amount is required"),
}).superRefine((data, ctx) => {
  // Task 12: Conditional validation based on payment method
  const method = data.paymentMethod?.toLowerCase();
  
  if (method === 'check' || method === 'cheque') {
    if (!data.chequeNumber || data.chequeNumber.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cheque number is required for cheque payments",
        path: ['chequeNumber'],
      });
    }
  }
  
  if (method === 'card' || method === 'credit_card' || method === 'debit_card') {
    if (!data.last4Digits || data.last4Digits.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Last 4 digits are required for card payments",
        path: ['last4Digits'],
      });
    } else if (!/^\d{4}$/.test(data.last4Digits)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Last 4 digits must be exactly 4 digits",
        path: ['last4Digits'],
      });
    }
  }
  
  if (method && method !== 'cash' && method !== 'check' && method !== 'cheque' && 
      method !== 'card' && method !== 'credit_card' && method !== 'debit_card') {
    if (!data.referenceNumber || data.referenceNumber.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Reference number is required for this payment method",
        path: ['referenceNumber'],
      });
    }
  }
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// ============================================================================
// MASTER SPEC COMPLIANCE TABLES - Per Part 4 & 5 of Master System Specification
// ============================================================================

// Contract Charges table - Per Master Spec Part 5.5.1 - Itemized charges per contract
export const contractCharges = pgTable("contract_charges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").notNull().references(() => contracts.id),
  
  // Charge Details - Per Master Spec Part 5.5.1
  type: varchar("type", { length: 64 }).notNull(), // 'RENT', 'EXTRA_KM', 'FUEL', 'PENALTY', 'ADDON', 'DAMAGE', 'SALIK', 'FINE', 'ONE_WAY', 'DRIVER', 'OTHER'
  description: varchar("description", { length: 255 }),
  quantity: numeric("quantity", { precision: 10, scale: 2 }),
  unitPrice: numeric("unit_price", { precision: 12, scale: 4 }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  taxCategory: varchar("tax_category", { length: 64 }), // 'VAT', 'EXEMPT', etc.
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }),
  isManual: boolean("is_manual").notNull().default(false), // Manual override by manager
  
  // Audit fields
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_contract_charges_contract_id").on(table.contractId),
  index("idx_contract_charges_type").on(table.type),
]);

export const contractChargesRelations = relations(contractCharges, ({ one }) => ({
  contract: one(contracts, {
    fields: [contractCharges.contractId],
    references: [contracts.id],
  }),
  creator: one(users, {
    fields: [contractCharges.createdBy],
    references: [users.id],
    relationName: "chargeCreator",
  }),
}));

export const insertContractChargeSchema = createInsertSchema(contractCharges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

export type InsertContractCharge = z.infer<typeof insertContractChargeSchema>;
export type ContractCharge = typeof contractCharges.$inferSelect;

// Contract Amendments table - Per Master Spec Part 5.5.1 - Track all contract changes
export const contractAmendments = pgTable("contract_amendments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").notNull().references(() => contracts.id),
  
  // Amendment Details - Per Master Spec Part 7.1.2
  type: varchar("type", { length: 64 }).notNull(), // 'EXTENSION', 'RATE_CHANGE', 'VEHICLE_SWAP', 'DRIVER_CHANGE', 'EARLY_RETURN', 'TARIFF_DOWNGRADE', 'DISCOUNT'
  oldValueJson: jsonb("old_value_json"),
  newValueJson: jsonb("new_value_json"),
  penaltyAmount: numeric("penalty_amount", { precision: 12, scale: 2 }),
  reason: text("reason"),
  
  // Approval tracking - Per Master Spec Part 13
  requiresApproval: boolean("requires_approval").notNull().default(false),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  
  // Audit fields
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_contract_amendments_contract_id").on(table.contractId),
  index("idx_contract_amendments_type").on(table.type),
]);

export const contractAmendmentsRelations = relations(contractAmendments, ({ one }) => ({
  contract: one(contracts, {
    fields: [contractAmendments.contractId],
    references: [contracts.id],
  }),
  creator: one(users, {
    fields: [contractAmendments.createdBy],
    references: [users.id],
    relationName: "amendmentCreator",
  }),
  approver: one(users, {
    fields: [contractAmendments.approvedBy],
    references: [users.id],
    relationName: "amendmentApprover",
  }),
}));

export const insertContractAmendmentSchema = createInsertSchema(contractAmendments).omit({
  id: true,
  createdAt: true,
  createdBy: true,
  approvedBy: true,
  approvedAt: true,
});

export type InsertContractAmendment = z.infer<typeof insertContractAmendmentSchema>;
export type ContractAmendment = typeof contractAmendments.$inferSelect;

// Contract Status History table - Per Master Spec Part 5.5.1 - Track lifecycle transitions
export const contractStatusHistory = pgTable("contract_status_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").notNull().references(() => contracts.id),
  
  // Status Change Details - Per Master Spec Part 3
  fromStatus: varchar("from_status", { length: 35 }),
  toStatus: varchar("to_status", { length: 35 }).notNull(),
  reason: text("reason"),
  
  // Audit fields
  changedBy: varchar("changed_by").notNull().references(() => users.id),
  changedAt: timestamp("changed_at").defaultNow(),
}, (table) => [
  index("idx_contract_status_history_contract_id").on(table.contractId),
  index("idx_contract_status_history_changed_at").on(table.changedAt),
]);

export const contractStatusHistoryRelations = relations(contractStatusHistory, ({ one }) => ({
  contract: one(contracts, {
    fields: [contractStatusHistory.contractId],
    references: [contracts.id],
  }),
  changer: one(users, {
    fields: [contractStatusHistory.changedBy],
    references: [users.id],
    relationName: "statusChanger",
  }),
}));

export const insertContractStatusHistorySchema = createInsertSchema(contractStatusHistory).omit({
  id: true,
  changedAt: true,
  changedBy: true,
});

export type InsertContractStatusHistory = z.infer<typeof insertContractStatusHistorySchema>;
export type ContractStatusHistory = typeof contractStatusHistory.$inferSelect;

// OTP Logs table - Per Master Spec Part 5.9 - 3-minute expiry, rate limiting
// Per Master Spec §4.13.6 and §11.10 - OTP logging with security audit fields
export const otpLogs = pgTable("otp_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").references(() => contracts.id),
  
  // OTP Details - Per Master Spec Part 5.9 and Part 8
  purpose: varchar("purpose", { length: 64 }).notNull(), // 'ACTIVATION', 'CLOSURE', 'DAMAGE_ACCEPTANCE', 'AMENDMENT', 'PAYMENT'
  channel: varchar("channel", { length: 32 }).notNull(), // 'SMS', 'EMAIL', 'WHATSAPP'
  target: varchar("target", { length: 255 }).notNull(), // Phone number or email
  otpHash: varchar("otp_hash", { length: 255 }).notNull(), // Hashed OTP for security
  
  // Expiry and Verification - Per Master Spec: 3-minute expiry
  expiresAt: timestamp("expires_at").notNull(),
  verifiedAt: timestamp("verified_at"),
  attempts: integer("attempts").notNull().default(0),
  
  // Per Master Spec §11.10 - Security audit fields
  ipAddress: varchar("ip_address", { length: 45 }), // IPv4 or IPv6
  deviceId: varchar("device_id", { length: 255 }), // Mobile device ID
  userAgent: varchar("user_agent", { length: 512 }), // Browser/device user agent
  
  // Audit fields
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_otp_logs_contract_id").on(table.contractId),
  index("idx_otp_logs_target").on(table.target),
  index("idx_otp_logs_expires_at").on(table.expiresAt),
  index("idx_otp_logs_ip").on(table.ipAddress),
  index("idx_otp_logs_created").on(table.createdAt),
]);

export const otpLogsRelations = relations(otpLogs, ({ one }) => ({
  contract: one(contracts, {
    fields: [otpLogs.contractId],
    references: [contracts.id],
  }),
}));

export const insertOtpLogSchema = createInsertSchema(otpLogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  verifiedAt: true,
  attempts: true,
});

export type InsertOtpLog = z.infer<typeof insertOtpLogSchema>;
export type OtpLog = typeof otpLogs.$inferSelect;

// Tariffs table - Per Master Spec Part 5.4.3 - Pricing plans
export const tariffs = pgTable("tariffs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Branch and Vehicle Class Scope - Per Master Spec Part 5.4.3
  branchId: varchar("branch_id").references(() => branches.id),
  vehicleClassId: varchar("vehicle_class_id"), // FK to vehicle_classes when created
  vehicleGroupId: varchar("vehicle_group_id"), // FK to vehicle_groups when created
  
  // Tariff Details
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  code: varchar("code", { length: 64 }).unique(),
  
  // Rates - Per Master Spec Part 5.5.1 DECIMAL(12,2) requirement
  rateHourly: numeric("rate_hourly", { precision: 12, scale: 2 }),
  rateDaily: numeric("rate_daily", { precision: 12, scale: 2 }),
  rateWeekly: numeric("rate_weekly", { precision: 12, scale: 2 }),
  rateMonthly: numeric("rate_monthly", { precision: 12, scale: 2 }),
  
  // Mileage Settings
  includedKmPerDay: numeric("included_km_per_day", { precision: 10, scale: 2 }),
  extraKmRate: numeric("extra_km_rate", { precision: 12, scale: 4 }),
  
  // Deposit Settings
  depositRequired: boolean("deposit_required").notNull().default(true),
  defaultDeposit: numeric("default_deposit", { precision: 12, scale: 2 }),
  
  // Rental Rules
  minimumRentalHours: integer("minimum_rental_hours"),
  minimumRentalDays: integer("minimum_rental_days"),
  returnGraceMinutes: integer("return_grace_minutes").default(0),
  downgradePenaltyRate: numeric("downgrade_penalty_rate", { precision: 12, scale: 2 }),
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  
  // Audit fields
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_tariffs_branch_id").on(table.branchId),
  index("idx_tariffs_vehicle_class_id").on(table.vehicleClassId),
  index("idx_tariffs_is_active").on(table.isActive),
]);

export const tariffsRelations = relations(tariffs, ({ one }) => ({
  branch: one(branches, {
    fields: [tariffs.branchId],
    references: [branches.id],
  }),
  creator: one(users, {
    fields: [tariffs.createdBy],
    references: [users.id],
    relationName: "tariffCreator",
  }),
}));

export const insertTariffSchema = createInsertSchema(tariffs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

export type InsertTariff = z.infer<typeof insertTariffSchema>;
export type Tariff = typeof tariffs.$inferSelect;

// Reservations table - Per Master Spec Part 4.5.1 - Booking before contract
export const reservations = pgTable("reservations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Reservation Number - Auto-generated
  reservationNumber: integer("reservation_number").notNull().unique(),
  
  // References - Per Master Spec Part 4.5.1
  branchId: varchar("branch_id").notNull().references(() => branches.id),
  contractId: varchar("contract_id").references(() => contracts.id), // Set when converted
  hirerId: varchar("hirer_id").notNull().references(() => customers.id),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id), // Specific vehicle
  vehicleGroupId: varchar("vehicle_group_id"), // Or vehicle group for flexibility
  tariffId: varchar("tariff_id").references(() => tariffs.id),
  
  // Reservation Details
  startDatetime: timestamp("start_datetime").notNull(),
  endDatetime: timestamp("end_datetime").notNull(),
  
  // Status - Per Master Spec Part 2.9
  status: varchar("status", { length: 32 }).notNull().default("pending"), // 'pending', 'confirmed', 'expired', 'cancelled', 'converted'
  
  // Financial
  depositExpected: numeric("deposit_expected", { precision: 12, scale: 2 }),
  depositReceived: numeric("deposit_received", { precision: 12, scale: 2 }),
  
  // Additional
  notes: text("notes"),
  cancellationReason: text("cancellation_reason"),
  
  // Audit fields
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_reservations_branch_id").on(table.branchId),
  index("idx_reservations_hirer_id").on(table.hirerId),
  index("idx_reservations_vehicle_id").on(table.vehicleId),
  index("idx_reservations_status").on(table.status),
  index("idx_reservations_start_datetime").on(table.startDatetime),
]);

export const reservationsRelations = relations(reservations, ({ one }) => ({
  branch: one(branches, {
    fields: [reservations.branchId],
    references: [branches.id],
  }),
  contract: one(contracts, {
    fields: [reservations.contractId],
    references: [contracts.id],
  }),
  hirer: one(customers, {
    fields: [reservations.hirerId],
    references: [customers.id],
  }),
  vehicle: one(vehicles, {
    fields: [reservations.vehicleId],
    references: [vehicles.id],
  }),
  tariff: one(tariffs, {
    fields: [reservations.tariffId],
    references: [tariffs.id],
  }),
  creator: one(users, {
    fields: [reservations.createdBy],
    references: [users.id],
    relationName: "reservationCreator",
  }),
}));

export const insertReservationSchema = createInsertSchema(reservations).omit({
  id: true,
  reservationNumber: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  contractId: true,
});

export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type Reservation = typeof reservations.$inferSelect;

// ============================================================================
// END MASTER SPEC COMPLIANCE TABLES
// ============================================================================

// Vehicle Inspections table - Track pre-delivery and post-return inspections with photos
export const vehicleInspections = pgTable("vehicle_inspections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").notNull().references(() => contracts.id),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  
  // Inspection Type - Per Master Spec Part 2.10
  inspectionType: varchar("inspection_type", { length: 20 }).notNull(), // checkout, return, transfer_in, transfer_out, maintenance
  
  // Inspector Information
  inspectorName: varchar("inspector_name").notNull(), // Auto-filled from logged-in user
  
  // Vehicle Metrics
  odometerReading: integer("odometer_reading").notNull(),
  fuelLevel: integer("fuel_level").notNull(), // 0-100%
  conditionNotes: text("condition_notes"), // Damage description
  
  // Damage Detection - Per Master Spec Part 2.4
  newDamagesFound: boolean("new_damages_found").notNull().default(false), // True if new damages detected vs checkout
  damageSeverity: varchar("damage_severity", { length: 20 }), // minor, moderate, major, total_loss
  
  // Photos - JSONB array of {angle: string, data: string (base64)}
  // Angles: 'front', 'back', 'left', 'right', 'top', 'dashboard'
  photos: jsonb("photos").notNull(), // Array of photo objects
  
  // Audit fields
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_vehicle_inspections_contract_id").on(table.contractId),
  index("idx_vehicle_inspections_vehicle_id").on(table.vehicleId),
]);

export const vehicleInspectionsRelations = relations(vehicleInspections, ({ one }) => ({
  contract: one(contracts, {
    fields: [vehicleInspections.contractId],
    references: [contracts.id],
  }),
  vehicle: one(vehicles, {
    fields: [vehicleInspections.vehicleId],
    references: [vehicles.id],
  }),
  creator: one(users, {
    fields: [vehicleInspections.createdBy],
    references: [users.id],
    relationName: "inspectionCreator",
  }),
}));

export const insertVehicleInspectionSchema = createInsertSchema(vehicleInspections).omit({
  id: true,
  createdAt: true,
  createdBy: true,
}).extend({
  fuelLevel: z.number().min(0).max(100),
  odometerReading: z.number().min(0),
  photos: z.array(z.object({
    angle: z.enum(['front', 'back', 'left', 'right', 'top', 'dashboard', 'extra']),
    data: z.string().min(1, "Photo data required"), // base64 encoded image
    description: z.string().optional(), // Optional description for extra photos
  }))
    .min(6, "At least 6 photos required (all mandatory angles must be covered)")
    .refine((photos) => {
      const requiredAngles: Array<'front' | 'back' | 'left' | 'right' | 'top' | 'dashboard'> = 
        ['front', 'back', 'left', 'right', 'top', 'dashboard'];
      const angles = photos.map(p => p.angle);
      return requiredAngles.every(angle => angles.includes(angle));
    }, { message: "All 6 mandatory photo angles must be provided (front, back, left, right, top, dashboard)" })
    .refine((photos) => {
      const mandatoryAngles = photos.filter(p => p.angle !== 'extra');
      const angles = mandatoryAngles.map(p => p.angle);
      const uniqueAngles = new Set(angles);
      return uniqueAngles.size === 6;
    }, { message: "Each mandatory angle must be unique" }),
});

export type InsertVehicleInspection = z.infer<typeof insertVehicleInspectionSchema>;
export type VehicleInspection = typeof vehicleInspections.$inferSelect;

// Audit logs table
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(), // create, edit, finalize, print, delete, login, logout
  contractId: varchar("contract_id").references(() => contracts.id),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  sessionId: varchar("session_id"),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  region: varchar("region", { length: 100 }),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_audit_logs_user_id").on(table.userId),
  index("idx_audit_logs_contract_id").on(table.contractId),
  index("idx_audit_logs_action").on(table.action),
  index("idx_audit_logs_created_at").on(table.createdAt),
]);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
  contract: one(contracts, {
    fields: [auditLogs.contractId],
    references: [contracts.id],
  }),
}));

export type InsertAuditLog = typeof auditLogs.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;

// Access logs table - Track all app access and login attempts
export const accessLogs = pgTable("access_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Null for failed login attempts
  usernameAttempted: varchar("username_attempted"), // Username tried (for failed attempts)
  ipAddress: varchar("ip_address").notNull(),
  country: varchar("country", { length: 100 }),
  region: varchar("region", { length: 100 }),
  city: varchar("city", { length: 100 }),
  userAgent: text("user_agent"),
  outcome: varchar("outcome", { length: 20 }).notNull(), // success, failed_credentials, failed_disabled, failed_locked
  failureReason: text("failure_reason"), // Detailed reason for failure
  metadata: jsonb("metadata"), // Additional context
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_access_logs_user_id").on(table.userId),
  index("idx_access_logs_outcome").on(table.outcome),
  index("idx_access_logs_username_attempted").on(table.usernameAttempted),
  index("idx_access_logs_created_at").on(table.createdAt),
  index("idx_access_logs_ip_address").on(table.ipAddress),
]);

export const accessLogsRelations = relations(accessLogs, ({ one }) => ({
  user: one(users, {
    fields: [accessLogs.userId],
    references: [users.id],
  }),
}));

export const insertAccessLogSchema = createInsertSchema(accessLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertAccessLog = z.infer<typeof insertAccessLogSchema>;
export type AccessLog = typeof accessLogs.$inferSelect;

// Contract edits table - Detailed tracking of all contract modifications
export const contractEdits = pgTable("contract_edits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").notNull().references(() => contracts.id),
  editedBy: varchar("edited_by").notNull().references(() => users.id),
  editedAt: timestamp("edited_at").defaultNow(),
  editReason: text("edit_reason").notNull(), // User-provided reason for the edit
  changesSummary: text("changes_summary"), // Human-readable summary of changes
  fieldsBefore: jsonb("fields_before"), // JSON snapshot of contract state before edit
  fieldsAfter: jsonb("fields_after"), // JSON snapshot of contract state after edit
  ipAddress: varchar("ip_address"),
}, (table) => [
  index("idx_contract_edits_contract_id").on(table.contractId),
  index("idx_contract_edits_edited_by").on(table.editedBy),
  index("idx_contract_edits_edited_at").on(table.editedAt),
]);

export const contractEditsRelations = relations(contractEdits, ({ one }) => ({
  contract: one(contracts, {
    fields: [contractEdits.contractId],
    references: [contracts.id],
  }),
  editor: one(users, {
    fields: [contractEdits.editedBy],
    references: [users.id],
  }),
}));

export const insertContractEditSchema = createInsertSchema(contractEdits).omit({
  id: true,
  editedAt: true,
});

export type InsertContractEdit = z.infer<typeof insertContractEditSchema>;
export type ContractEdit = typeof contractEdits.$inferSelect;

// NOTE: contractCounter table REMOVED - sequences table is now the Master Spec compliant solution
// See sequences table definition for contract/invoice/receipt numbering

// System errors table for error logging
export const systemErrors = pgTable("system_errors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  errorType: varchar("error_type", { length: 100 }).notNull(), // e.g., "DatabaseError", "AuthError", "ValidationError"
  errorMessage: text("error_message").notNull(),
  errorStack: text("error_stack"),
  userId: varchar("user_id").references(() => users.id),
  endpoint: varchar("endpoint"),
  method: varchar("method", { length: 10 }),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  additionalData: text("additional_data"), // JSON string for extra context
  screenshot: text("screenshot"), // Base64-encoded screenshot automatically captured when error occurs
  acknowledged: boolean("acknowledged").notNull().default(false),
  acknowledgedBy: varchar("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  sentToSupport: boolean("sent_to_support").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_system_errors_acknowledged").on(table.acknowledged),
  index("idx_system_errors_created_at").on(table.createdAt),
]);

export type InsertSystemError = typeof systemErrors.$inferInsert;
export type SystemError = typeof systemErrors.$inferSelect;

// Company settings table (singleton)
export const companySettings = pgTable("company_settings", {
  id: varchar("id").primaryKey().default("singleton"),
  // Company Names
  companyNameEn: varchar("company_name_en").notNull().default("KarāraOS"),
  companyNameAr: varchar("company_name_ar").notNull().default("نظام إدارة عقود تأجير السيارات"),
  companyLegalNameEn: varchar("company_legal_name_en").notNull().default("RENTAL CAR COMPANY LLC"),
  companyLegalNameAr: varchar("company_legal_name_ar").notNull().default("شركة تأجير السيارات ش.ذ.م.م"),
  taglineEn: varchar("tagline_en").notNull().default("RENT A CAR"),
  taglineAr: varchar("tagline_ar").notNull().default("تأجير السيارات"),
  
  // Contact Information
  phone: varchar("phone").notNull().default("+971 0 000 0000"),
  phoneAr: varchar("phone_ar").notNull().default("+٩٧١ ٠ ٠٠٠ ٠٠٠٠"),
  mobile: varchar("mobile").notNull().default("+971 50 000 0000"),
  mobileAr: varchar("mobile_ar").notNull().default("+٩٧١ ٥٠ ٠٠٠ ٠٠٠٠"),
  email: varchar("email").notNull().default("info@rentalcompany.com"),
  website: varchar("website").notNull().default("www.rentalcompany.com"),
  
  // Address
  addressEn: varchar("address_en").notNull().default("P.O. Box: 00000, City, UAE"),
  addressAr: varchar("address_ar").notNull().default("ص.ب: ٠٠٠٠٠، المدينة، الإمارات"),
  
  // Logo (optional, can be URL or base64)
  logoUrl: varchar("logo_url"),
  
  // Currency and VAT
  currencyEn: varchar("currency_en", { length: 10 }).notNull().default(""),
  currencyAr: varchar("currency_ar", { length: 10 }).notNull().default(""),
  vatPercentage: varchar("vat_percentage").notNull().default("5"),
  
  // Financial Settings - Default Rates and Pricing
  defaultDailyRate: varchar("default_daily_rate").notNull().default("150"),
  defaultWeeklyRate: varchar("default_weekly_rate").notNull().default("900"),
  defaultMonthlyRate: varchar("default_monthly_rate").notNull().default("3000"),
  insurancePerDay: varchar("insurance_per_day").notNull().default("25"),
  gpsPerDay: varchar("gps_per_day").notNull().default("15"),
  babySeatPerDay: varchar("baby_seat_per_day").notNull().default("20"),
  additionalDriverFee: varchar("additional_driver_fee").notNull().default("50"),
  defaultExtraKmRate: varchar("default_extra_km_rate").notNull().default("1.5"),
  defaultSecurityDeposit: varchar("default_security_deposit").notNull().default("1500"),
  
  // Fuel Pricing
  petrolPricePerLiter: varchar("petrol_price_per_liter").notNull().default("3.5"),
  dieselPricePerLiter: varchar("diesel_price_per_liter").notNull().default("3.2"),
  
  // Delivery Service Pricing
  defaultDropOffCharge: varchar("default_drop_off_charge").notNull().default("0"),
  defaultPickUpCharge: varchar("default_pick_up_charge").notNull().default("0"),
  
  // Driver Service Configuration
  driverDailyRate: varchar("driver_daily_rate").notNull().default("300"),
  driverHourlyRate: varchar("driver_hourly_rate").notNull().default("50"),
  driverNightShiftStartHour: varchar("driver_night_shift_start_hour").notNull().default("22"), // 10 PM
  driverNightShiftEndHour: varchar("driver_night_shift_end_hour").notNull().default("06"), // 6 AM
  driverNightSurchargeMultiplier: varchar("driver_night_surcharge_multiplier").notNull().default("1.5"),
  driverWeekendSurchargeMultiplier: varchar("driver_weekend_surcharge_multiplier").notNull().default("1.3"),
  driverHolidaySurchargeMultiplier: varchar("driver_holiday_surcharge_multiplier").notNull().default("2.0"),
  driverServiceVatApplicable: boolean("driver_service_vat_applicable").notNull().default(true),
  
  // Terms & Conditions Sections (bilingual)
  termsSection1En: text("terms_section_1_en").notNull().default(""),
  termsSection1Ar: text("terms_section_1_ar").notNull().default(""),
  termsSection2En: text("terms_section_2_en").notNull().default(""),
  termsSection2Ar: text("terms_section_2_ar").notNull().default(""),
  termsSection3En: text("terms_section_3_en").notNull().default(""),
  termsSection3Ar: text("terms_section_3_ar").notNull().default(""),
  
  // Payment Terms & Fine Conditions (bilingual, structured sections)
  paymentTermsFineEn: text("payment_terms_fine_en").notNull().default("The Hirer will pay AED 60/- for each fine, 20 dirhams for Dubai Govt. Knowledge Fee and 20 dirhams for paid charge"),
  paymentTermsFineAr: text("payment_terms_fine_ar").notNull().default("يدفع (المستأجر) مبلغ ٦٠ درهم عن كل غرامة، يسدد منها مبلغ ٣٠ درهم رسوم إدارية لحكومة دبي ومبلغ ٣٠ درهم رسوم غرامة."),
  
  paymentTermsBalanceEn: text("payment_terms_balance_en").notNull().default("When the Hirer return the car he/she had to clear whole balance within 48 hours if not the hirer will continuously be charged AED 25/- per day"),
  paymentTermsBalanceAr: text("payment_terms_balance_ar").notNull().default("عند إعادة السيارة على (المستأجر) سداد كافة الرصيد المطلوب منه خلال ٤٨ ساعة، والإيجارالمستأجر يسدد ٢٥ درهم عن كل يوم تأخير"),
  
  paymentTermsFineWeekEn: text("payment_terms_fine_week_en").notNull().default("In case any fine the Hirer must to be cleared within one week maximum or the Hirer will be charged AED 25/- per week"),
  paymentTermsFineWeekAr: text("payment_terms_fine_week_ar").notNull().default("في حال وجود غرامة، على (المستأجر) سداد الغرامة خلال أسبوع واحد نعطي التقارير والإنذار بسداد مبلغ ٢٥ درهما غرامة تأخير"),
  
  paymentTermsSecurityEn: text("payment_terms_security_en").notNull().default("The Hirer agrees that the Company may retain AED 1500/- for fine security for 15 days from the date of return of vehicle."),
  paymentTermsSecurityAr: text("payment_terms_security_ar").notNull().default("يتم الاحتفاظ بمبلغ ١٥٠٠ درهم من قيمة البطاقة الائتمانية من تاريخ إعادة السيارة لمدة ١٥ يوما من تاريخ إرجاع السيارة الإيجار"),
  
  paymentTermsAcknowledgeEn: text("payment_terms_acknowledge_en").notNull().default("Acknowledge the I/ we read above and reverse mentioned terms and conditions and agree to abide by them."),
  paymentTermsAcknowledgeAr: text("payment_terms_acknowledge_ar").notNull().default("إقرار بأننا اعتمدنا على الشروط والأحكام أعلاه و كذلك الشروط المنبعة بعلامة وموافق على الالتزام بها."),
  
  paymentTermsInspectionEn: text("payment_terms_inspection_en").notNull().default("It is agreed that the vehicle shall be inspected before receiving it by conducting a comprehensive inspection of all its parts from all aspects, and the hirer bears full responsibility for the consequences on the equipment."),
  paymentTermsInspectionAr: text("payment_terms_inspection_ar").notNull().default("يتفق أن يستحصن السيارة فى فبل استلامها للقيام بفحص شامل للسيارة فى جميع أجزائها من جميع الجوانب ويتحمل المسؤولية الكاملة فعل العواقب في الأجهزة"),
  
  paymentTermsRepairEn: text("payment_terms_repair_en").notNull().default("In case there is doubt about the situation, the rental contract renewal payment shall be made while the vehicle is parked in the garage for repair."),
  paymentTermsRepairAr: text("payment_terms_repair_ar").notNull().default("فى حالة إذا شكت أن الواقع مع دفع تجديد عقد إيجار السيارة في إطار وقوف السيارة في الكراج للصليح"),
  
  paymentTermsAccidentNewLicenseEn: text("payment_terms_accident_new_license_en").notNull().default("In case of an accident where the hirer holds a driving license issued less than one year ago and is the cause of the accident, they shall bear 20% of the accident value in addition to the liability amount of 2500 dirhams, plus daily rent for the number of days the vehicle is parked in the garage for repair."),
  paymentTermsAccidentNewLicenseAr: text("payment_terms_accident_new_license_ar").notNull().default("فى حالة حصول حادث وكان المستأجر يحمل رخصة قيادة ماضي على صدورها أقل من سنة وهو المسبب فى الحادث يتحمل ٪٢٠ من قيمة الحادث وإضافة إلى التحمل البالغ ٢٥٠٠ درهم الإيجار اليومي لعدد أيام وقوف السيارة في الكراج لغرض التصليح"),
  
  paymentTermsAccidentGeneralEn: text("payment_terms_accident_general_en").notNull().default("In case of an accident, they shall bear 90% of the accident value in addition to the liability amount of 2500 dirhams, plus daily rent for the period the vehicle is parked in the garage for repair."),
  paymentTermsAccidentGeneralAr: text("payment_terms_accident_general_ar").notNull().default("فى حادث يتحمل ٪٩٠ من قيمة الحادث وإضافة إلى التحمل البالغ ٢٥٠٠ درهم الإيجار اليومي لمدة أيام وقوف السيارة في الكراج لغرض التصليح"),
  
  // Additional Contract Clauses (bilingual)
  clauseWriteoffEn: text("clause_writeoff_en").notNull().default("In case of writing off the car by the concerned parties. The person who rented the car shall pay 5000 Dirhams a compensation for the full damaged of the rented cars in addition to the rent, till all procedures are completed and insurance company give the compensation. If the car is cofiscated by concerned authorities for any reason caused by the person who rented the car He/She shall pay the full value of the car in addition the rent and the above mentioned."),
  clauseWriteoffAr: text("clause_writeoff_ar").notNull().default("في حالة تسقط السيارة من الجهات منعضة يقوم المستأجر بدفع مبلغ خمسة آلف درهم (٥٠٠٠) درهما تعويضا عن أي ضرر يلحق المطالبة الايجار الإجمالي المترتب بالإضافة إلى قيمة الإيجار حتى انتهاء كافة الإجراءات بالإضافة والمصروحي في حالة مصادرة السيارة من جهات معينة بسبب قد تسبب ف"),
  
  clauseCreditAuthEn: text("clause_credit_auth_en").notNull().default("I, the undersigned authorise the Company to charge my credit card the rent value and any other additional amounts or offence and penalties (Police or Municipality adding Dhs. 20 for each fine) even after the returned back of the vehicle to the Company within the hire period through the credit card belonging to .......................... Dhs. additional"),
  clauseCreditAuthAr: text("clause_credit_auth_ar").notNull().default("أنا الموقع أدناه أفوض الشركة لتأجير السيارات بتقاضى قيمة الإيجار وأى مبالغ إضافية أو مخالفات و غرامات (سرعة و بلدية بمبلغ ٣٠ درهم على كل مخالفة) حتى بعد إعادة السيارة للشركة ضمن فترة استئجار السيارة وذلك من خلال بطاقة الائتمان الخاصة بـــ..........................درهم إضافية"),
  
  clauseDesertProhibitionEn: text("clause_desert_prohibition_en").notNull().default("Vehicle not allowed to drive in Desert Area"),
  clauseDesertProhibitionAr: text("clause_desert_prohibition_ar").notNull().default("السيـــارة لايسمح للقيـــادة فــي منــطقة صحــراويــة"),
  
  clauseAccidentHirerFaultEn: text("clause_accident_hirer_fault_en").notNull().default("In Case of accident will occur to the vehicle and the mistake from the hirer the hirer has to pay basic lump sum of Dhs. __________ in addition to the daily rent till the vehicle complete repairing"),
  clauseAccidentHirerFaultAr: text("clause_accident_hirer_fault_ar").notNull().default("في حالة حدوث حادث وكان المستأجر متسبب يكون المستأجر ملزم بدفع مبلغ قدره ................درهم إضافية في إطار قدوم للإصلاح يتم تحصيل استيفاً"),
  
  clauseAccidentNotFaultEn: text("clause_accident_not_fault_en").notNull().default("In case of any accident will occur to the vehicle and the mistake not from the hirer will pay daily rent, till the vehicle complete repairing."),
  clauseAccidentNotFaultAr: text("clause_accident_not_fault_ar").notNull().default("في حالة حدوث حادث وكان المستأجر منضرر بالدفع لإيجار فترة وقوف السيارة في الكراج لحين اصلاحها"),
  
  clauseMonthlyPaymentEn: text("clause_monthly_payment_en").notNull().default("In case monthly rent the hirer should pay amount from every 10 days in advance"),
  clauseMonthlyPaymentAr: text("clause_monthly_payment_ar").notNull().default("في حالة الإيجار الشهري يقوم المستأجر بدفع الإيجار كل ١٠ أيام"),
  
  clauseDailyKmLimitEn: text("clause_daily_km_limit_en").notNull().default("PER DAY 300 KMS AND 50 FILS EXTRA FOR ONE K.M."),
  clauseDailyKmLimitAr: text("clause_daily_km_limit_ar").notNull().default("عدد الكيلومترات المسموح بها (٣٠٠ كم) لليوم الواحد ومابزيد عن ذلك تحتسب ٥٠ إضافية لكيلومتر الواحد"),
  
  clauseMonthlyKmLimitEn: text("clause_monthly_km_limit_en").notNull().default("Monthly maximum 5000 km is allowed, 40 fils extra charged for each km"),
  clauseMonthlyKmLimitAr: text("clause_monthly_km_limit_ar").notNull().default("الحد الأقصى للشهري المسموح به هو ٥٠٠٠ كم و٤٠ فلس إضافية على كل كيلومتر"),
  
  clauseSelfRepairPenaltyEn: text("clause_self_repair_penalty_en").notNull().default("If any renter repaired the car by himself (incase of accident or other damage) will find Dhs. 5000/-"),
  clauseSelfRepairPenaltyAr: text("clause_self_repair_penalty_ar").notNull().default("فى حالة تصليح السيارة قبل اصلاح المستأجر غير الاصلاح غرامة على المستأجر قدرها (وستجرهم) تكون موزعه للشركة"),
  
  clauseDailyRateDefaultEn: text("clause_daily_rate_default_en").notNull().default("If no previous arrangement has been made for the weekly / monthly rates then the hirer is liable to pay daily rate"),
  clauseDailyRateDefaultAr: text("clause_daily_rate_default_ar").notNull().default("اذاله يكن هناك اتفاق مسبق للإيجار الأسبوعي أو الشهري فسوف يحتسب بوافع السعر اليومى"),
  
  clauseBackpageReferenceEn: text("clause_backpage_reference_en").notNull().default("Remaining 26 Terms on back page"),
  clauseBackpageReferenceAr: text("clause_backpage_reference_ar").notNull().default("يتبع خلف الصفحة ٢٦ فقرة"),
  
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by").references(() => users.id),
});

export const insertCompanySettingsSchema = createInsertSchema(companySettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;
export type CompanySettings = typeof companySettings.$inferSelect;

// Insurance Claims table - Track insurance claims linked to contract accidents
export const insuranceClaims = pgTable("insurance_claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").notNull().references(() => contracts.id),
  claimNumber: varchar("claim_number").notNull().unique(),
  
  // Dates
  claimDate: timestamp("claim_date").notNull(),
  incidentDate: timestamp("incident_date").notNull(),
  
  // Status
  claimStatus: varchar("claim_status", { length: 20 }).notNull().default("pending"),
  
  // Financial
  claimAmount: varchar("claim_amount").notNull(),
  approvedAmount: varchar("approved_amount"),
  settledAmount: varchar("settled_amount"),
  
  // Insurance Details
  insuranceCompany: varchar("insurance_company").notNull(),
  policyNumber: varchar("policy_number").notNull(),
  
  // Incident Details
  incidentDescription: text("incident_description").notNull(),
  damageAssessment: text("damage_assessment"),
  
  // Claimant Information
  claimantName: varchar("claimant_name").notNull(),
  claimantContact: varchar("claimant_contact").notNull(),
  
  // Handler
  handledBy: varchar("handled_by").references(() => users.id),
  
  // Notes
  notes: text("notes"),
  
  // Audit fields
  disabled: boolean("disabled").notNull().default(false),
  disabledBy: varchar("disabled_by").references(() => users.id),
  disabledAt: timestamp("disabled_at"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_insurance_claims_contract_id").on(table.contractId),
  index("idx_insurance_claims_status").on(table.claimStatus),
  index("idx_insurance_claims_created_at").on(table.createdAt),
  index("idx_insurance_claims_disabled").on(table.disabled),
]);

export const insuranceClaimsRelations = relations(insuranceClaims, ({ one }) => ({
  contract: one(contracts, {
    fields: [insuranceClaims.contractId],
    references: [contracts.id],
  }),
  creator: one(users, {
    fields: [insuranceClaims.createdBy],
    references: [users.id],
    relationName: "insuranceClaimCreator",
  }),
  handler: one(users, {
    fields: [insuranceClaims.handledBy],
    references: [users.id],
    relationName: "insuranceClaimHandler",
  }),
}));

export const insertInsuranceClaimSchema = createInsertSchema(insuranceClaims).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  claimNumber: true,
  disabled: true,
  disabledBy: true,
  disabledAt: true,
  createdBy: true,
}).extend({
  claimDate: z.coerce.date(),
  incidentDate: z.coerce.date(),
  claimAmount: z.string().min(1, "Claim amount is required"),
  incidentDescription: z.string().min(10, "Incident description must be at least 10 characters"),
  claimantName: z.string().min(1, "Claimant name is required"),
  claimantContact: z.string().min(1, "Claimant contact is required"),
});

export type InsertInsuranceClaim = z.infer<typeof insertInsuranceClaimSchema>;
export type InsuranceClaim = typeof insuranceClaims.$inferSelect;

// Renewal Requests table - Track customer requests to renew existing contracts
export const renewalRequests = pgTable("renewal_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").notNull().references(() => contracts.id),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  
  // Requested rental period
  requestedStartDate: timestamp("requested_start_date").notNull(),
  requestedEndDate: timestamp("requested_end_date").notNull(),
  
  // Request details
  requestedBy: varchar("requested_by").notNull(), // Can be user ID or customer ID
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, rejected
  
  // Review information
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  rejectionReason: text("rejection_reason"),
  notes: text("notes"),
  
  // Audit fields
  disabled: boolean("disabled").notNull().default(false),
  disabledBy: varchar("disabled_by").references(() => users.id),
  disabledAt: timestamp("disabled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const renewalRequestsRelations = relations(renewalRequests, ({ one }) => ({
  contract: one(contracts, {
    fields: [renewalRequests.contractId],
    references: [contracts.id],
  }),
  customer: one(customers, {
    fields: [renewalRequests.customerId],
    references: [customers.id],
  }),
  vehicle: one(vehicles, {
    fields: [renewalRequests.vehicleId],
    references: [vehicles.id],
  }),
  reviewer: one(users, {
    fields: [renewalRequests.reviewedBy],
    references: [users.id],
    relationName: "renewalRequestReviewer",
  }),
}));

export const insertRenewalRequestSchema = createInsertSchema(renewalRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reviewedBy: true,
  reviewedAt: true,
  disabled: true,
  disabledBy: true,
  disabledAt: true,
}).extend({
  requestedStartDate: z.coerce.date(),
  requestedEndDate: z.coerce.date(),
});

export type InsertRenewalRequest = z.infer<typeof insertRenewalRequestSchema>;
export type RenewalRequest = typeof renewalRequests.$inferSelect;

// Document Approvals table - Track customer document submissions for approval
export const documentApprovals = pgTable("document_approvals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  
  // Document details
  documentType: varchar("document_type", { length: 50 }).notNull(), // license, id_card, insurance_card, etc.
  documentImage: text("document_image").notNull(), // Base64 encoded image
  
  // Approval status
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, rejected
  submittedBy: varchar("submitted_by").notNull(), // Can be customer ID or user ID
  
  // Review information
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  rejectionReason: text("rejection_reason"),
  notes: text("notes"),
  
  // Audit fields
  disabled: boolean("disabled").notNull().default(false),
  disabledBy: varchar("disabled_by").references(() => users.id),
  disabledAt: timestamp("disabled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documentApprovalsRelations = relations(documentApprovals, ({ one }) => ({
  customer: one(customers, {
    fields: [documentApprovals.customerId],
    references: [customers.id],
  }),
  reviewer: one(users, {
    fields: [documentApprovals.reviewedBy],
    references: [users.id],
    relationName: "documentApprovalReviewer",
  }),
}));

export const insertDocumentApprovalSchema = createInsertSchema(documentApprovals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reviewedBy: true,
  reviewedAt: true,
  disabled: true,
  disabledBy: true,
  disabledAt: true,
}).extend({
  documentType: z.string().min(1, "Document type is required"),
  documentImage: z.string().min(1, "Document image is required"),
});

export type InsertDocumentApproval = z.infer<typeof insertDocumentApprovalSchema>;
export type DocumentApproval = typeof documentApprovals.$inferSelect;

// Support Tickets table - Customer and staff support ticket system
export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketNumber: varchar("ticket_number").notNull().unique(), // TKT-YYYY-NNNN
  
  // Submitter (either customer or staff)
  customerId: varchar("customer_id").references(() => customers.id),
  userId: varchar("user_id").references(() => users.id),
  
  // Ticket details
  subject: varchar("subject").notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 30 }).notNull(), // billing, technical, vehicle_issue, account, other
  priority: varchar("priority", { length: 20 }).notNull().default("medium"), // low, medium, high, urgent
  status: varchar("status", { length: 20 }).notNull().default("open"), // open, in_progress, resolved, closed
  
  // Assignment and resolution
  assignedTo: varchar("assigned_to").references(() => users.id),
  resolution: text("resolution"),
  resolvedAt: timestamp("resolved_at"),
  
  // Audit fields
  disabled: boolean("disabled").notNull().default(false),
  disabledBy: varchar("disabled_by").references(() => users.id),
  disabledAt: timestamp("disabled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  customer: one(customers, {
    fields: [supportTickets.customerId],
    references: [customers.id],
  }),
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id],
    relationName: "supportTicketUser",
  }),
  assignee: one(users, {
    fields: [supportTickets.assignedTo],
    references: [users.id],
    relationName: "supportTicketAssignee",
  }),
}));

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  ticketNumber: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
  disabled: true,
  disabledBy: true,
  disabledAt: true,
}).extend({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

// Push Notification Tokens table - Store device tokens for mobile push notifications
export const pushNotificationTokens = pgTable("push_notification_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Owner (either staff user or customer)
  userId: varchar("user_id").references(() => users.id),
  customerId: varchar("customer_id").references(() => customers.id),
  
  // Token details
  token: varchar("token").notNull().unique(), // FCM or APNS token
  platform: varchar("platform", { length: 20 }).notNull(), // ios, android, web
  deviceId: varchar("device_id"), // Unique device identifier
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  lastUsedAt: timestamp("last_used_at").defaultNow(),
  
  // Audit fields
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pushNotificationTokensRelations = relations(pushNotificationTokens, ({ one }) => ({
  user: one(users, {
    fields: [pushNotificationTokens.userId],
    references: [users.id],
  }),
  customer: one(customers, {
    fields: [pushNotificationTokens.customerId],
    references: [customers.id],
  }),
}));

export const insertPushNotificationTokenSchema = createInsertSchema(pushNotificationTokens).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastUsedAt: true,
}).extend({
  token: z.string().min(1, "Token is required"),
  platform: z.enum(["ios", "android", "web"]),
});

export type InsertPushNotificationToken = z.infer<typeof insertPushNotificationTokenSchema>;
export type PushNotificationToken = typeof pushNotificationTokens.$inferSelect;

// ========================================
// FUTURE-PROOFING TABLES (Structure only, no implementation)
// ========================================

// Payment Gateways table - Support for multiple payment providers
export const paymentGateways = pgTable("payment_gateways", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // stripe, paypal, square, authorize_net
  isActive: boolean("is_active").notNull().default(false),
  apiKey: varchar("api_key"),
  apiSecret: varchar("api_secret"),
  webhookSecret: varchar("webhook_secret"),
  configuration: jsonb("configuration"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPaymentGatewaySchema = createInsertSchema(paymentGateways).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPaymentGateway = z.infer<typeof insertPaymentGatewaySchema>;
export type PaymentGateway = typeof paymentGateways.$inferSelect;

// Payment Transactions table - Detailed transaction history
export const paymentTransactions = pgTable("payment_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paymentId: varchar("payment_id").references(() => payments.id).notNull(),
  gatewayId: varchar("gateway_id").references(() => paymentGateways.id),
  transactionId: varchar("transaction_id").notNull(), // External transaction ID from gateway
  amount: varchar("amount").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("AED"),
  status: varchar("status", { length: 20 }).notNull(), // pending, processing, completed, failed, refunded
  gatewayResponse: jsonb("gateway_response"),
  failureReason: text("failure_reason"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_payment_transactions_payment").on(table.paymentId),
  index("idx_payment_transactions_status").on(table.status),
  index("idx_payment_transactions_created_at").on(table.createdAt),
]);

export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;

// Pricing Rules table - Dynamic pricing and discount engine
export const pricingRules = pgTable("pricing_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  ruleType: varchar("rule_type", { length: 30 }).notNull(), // discount, surcharge, seasonal, loyalty
  target: varchar("target", { length: 30 }).notNull(), // vehicle_class, customer_segment, contract_type
  conditions: jsonb("conditions").notNull(), // Complex rule conditions
  adjustment: jsonb("adjustment").notNull(), // Percentage or fixed amount
  priority: integer("priority").notNull().default(0),
  effectiveFrom: timestamp("effective_from").notNull(),
  effectiveTo: timestamp("effective_to"),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_pricing_rules_type").on(table.ruleType),
  index("idx_pricing_rules_active").on(table.isActive),
  index("idx_pricing_rules_effective").on(table.effectiveFrom, table.effectiveTo),
]);

export const insertPricingRuleSchema = createInsertSchema(pricingRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPricingRule = z.infer<typeof insertPricingRuleSchema>;
export type PricingRule = typeof pricingRules.$inferSelect;

// Document Files table - Centralized file storage metadata
export const documentFiles = pgTable("document_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type", { length: 30 }).notNull(), // contract, vehicle, customer, claim
  entityId: varchar("entity_id").notNull(),
  fileName: varchar("file_name").notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(), // application/pdf, image/jpeg
  fileSize: integer("file_size").notNull(), // bytes
  fileUrl: text("file_url").notNull(), // Storage URL
  category: varchar("category", { length: 30 }), // inspection, license, insurance, receipt
  isPublic: boolean("is_public").notNull().default(false),
  uploadedBy: varchar("uploaded_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_document_files_entity").on(table.entityType, table.entityId),
  index("idx_document_files_uploaded_by").on(table.uploadedBy),
  index("idx_document_files_created_at").on(table.createdAt),
]);

export const insertDocumentFileSchema = createInsertSchema(documentFiles).omit({
  id: true,
  createdAt: true,
});

export type InsertDocumentFile = z.infer<typeof insertDocumentFileSchema>;
export type DocumentFile = typeof documentFiles.$inferSelect;

// Digital Signatures table - Electronic signature tracking
export const digitalSignatures = pgTable("digital_signatures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").references(() => contracts.id).notNull(),
  signerType: varchar("signer_type", { length: 20 }).notNull(), // customer, staff, sponsor
  signerId: varchar("signer_id").notNull(),
  signerName: varchar("signer_name").notNull(),
  signatureImage: text("signature_image").notNull(), // Base64 or URL
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  signedAt: timestamp("signed_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_digital_signatures_contract").on(table.contractId),
  index("idx_digital_signatures_signer").on(table.signerType, table.signerId),
  index("idx_digital_signatures_signed_at").on(table.signedAt),
]);

export const insertDigitalSignatureSchema = createInsertSchema(digitalSignatures).omit({
  id: true,
  createdAt: true,
  signedAt: true,
});

export type InsertDigitalSignature = z.infer<typeof insertDigitalSignatureSchema>;
export type DigitalSignature = typeof digitalSignatures.$inferSelect;

// ========================================
// PHASE 2: TOLLS, FINES, INCIDENTS, MAINTENANCE
// ========================================

// Toll Systems table - UAE toll system configuration (Salik, Darb, Aber)
export const tollSystems = pgTable("toll_systems", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  systemName: varchar("system_name").notNull(), // Salik, Darb, Aber
  emirate: emiratesEnum("emirate").notNull(),
  provider: varchar("provider").notNull(),
  standardFee: varchar("standard_fee").notNull().default("4"),
  holidayExempt: boolean("holiday_exempt").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_toll_systems_emirate").on(table.emirate),
  index("idx_toll_systems_active").on(table.isActive),
]);

export const insertTollSystemSchema = createInsertSchema(tollSystems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

export type InsertTollSystem = z.infer<typeof insertTollSystemSchema>;
export type TollSystem = typeof tollSystems.$inferSelect;

// Toll Gates table - Specific toll gate locations
export const tollGates = pgTable("toll_gates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tollSystemId: varchar("toll_system_id").notNull().references(() => tollSystems.id),
  gateName: varchar("gate_name").notNull(),
  gpsLocation: varchar("gps_location"),
  direction: varchar("direction"), // Northbound, Southbound, etc.
  gateType: varchar("gate_type"), // Standard, Express
  isPeakDependent: boolean("is_peak_dependent").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_toll_gates_system").on(table.tollSystemId),
  index("idx_toll_gates_active").on(table.isActive),
]);

export const insertTollGateSchema = createInsertSchema(tollGates).omit({
  id: true,
  createdAt: true,
});

export type InsertTollGate = z.infer<typeof insertTollGateSchema>;
export type TollGate = typeof tollGates.$inferSelect;

// Toll Passes table - Individual toll transactions
export const tollPasses = pgTable("toll_passes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  gateId: varchar("gate_id").notNull().references(() => tollGates.id),
  contractId: varchar("contract_id").references(() => contracts.id),
  passDateTime: timestamp("pass_date_time").notNull(),
  feeCharged: varchar("fee_charged").notNull(),
  paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("pending"), // pending, paid, waived
  paidBy: varchar("paid_by"), // customer, company
  paidDate: timestamp("paid_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_toll_passes_vehicle").on(table.vehicleId),
  index("idx_toll_passes_contract").on(table.contractId),
  index("idx_toll_passes_date").on(table.passDateTime),
  index("idx_toll_passes_status").on(table.paymentStatus),
]);

export const insertTollPassSchema = createInsertSchema(tollPasses).omit({
  id: true,
  createdAt: true,
});

export type InsertTollPass = z.infer<typeof insertTollPassSchema>;
export type TollPass = typeof tollPasses.$inferSelect;

// Traffic Fines table - Traffic violations tracking
export const trafficFines = pgTable("traffic_fines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  customerId: varchar("customer_id").references(() => customers.id),
  driverId: varchar("driver_id").references(() => drivers.id),
  contractId: varchar("contract_id").references(() => contracts.id),
  fineSource: varchar("fine_source", { length: 50 }).notNull(), // RTA, Police, Municipality
  fineCategory: varchar("fine_category", { length: 50 }).notNull(), // Traffic, Parking, Toll, Accident
  fineCode: varchar("fine_code"),
  description: text("description").notNull(),
  fineDate: timestamp("fine_date").notNull(),
  amount: varchar("amount").notNull(),
  blackPoints: integer("black_points").default(0),
  paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("pending"), // pending, paid, disputed, waived
  paidBy: varchar("paid_by"), // customer, company, driver
  paidDate: timestamp("paid_date"),
  documentUrl: text("document_url"), // Fine document/photo
  notes: text("notes"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_traffic_fines_vehicle").on(table.vehicleId),
  index("idx_traffic_fines_customer").on(table.customerId),
  index("idx_traffic_fines_contract").on(table.contractId),
  index("idx_traffic_fines_date").on(table.fineDate),
  index("idx_traffic_fines_status").on(table.paymentStatus),
  index("idx_traffic_fines_created_at").on(table.createdAt),
]);

export const insertTrafficFineSchema = createInsertSchema(trafficFines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
}).extend({
  fineDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  paidDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val).optional(),
});

export type InsertTrafficFine = z.infer<typeof insertTrafficFineSchema>;
export type TrafficFine = typeof trafficFines.$inferSelect;

// Incidents table - Accidents and incident tracking
export const incidents = pgTable("incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").references(() => contracts.id).notNull(),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  customerId: varchar("customer_id").references(() => customers.id),
  driverId: varchar("driver_id").references(() => drivers.id),
  incidentType: varchar("incident_type", { length: 50 }).notNull(), // accident, theft, damage, breakdown
  severity: varchar("severity", { length: 20 }).notNull().default("minor"), // minor, moderate, major, total_loss
  incidentDate: timestamp("incident_date").notNull(),
  location: text("location"),
  description: text("description").notNull(),
  policeReportNumber: varchar("police_report_number"),
  insuranceClaimNumber: varchar("insurance_claim_number"),
  estimatedCost: varchar("estimated_cost"),
  actualCost: varchar("actual_cost"),
  deductibleAmount: varchar("deductible_amount"),
  customerLiability: varchar("customer_liability"),
  status: varchar("status", { length: 20 }).notNull().default("reported"), // reported, under_investigation, claim_filed, resolved, closed
  photoUrls: text("photo_urls").array(), // Array of photo URLs
  documentUrls: text("document_urls").array(), // Array of document URLs
  notes: text("notes"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_incidents_contract").on(table.contractId),
  index("idx_incidents_vehicle").on(table.vehicleId),
  index("idx_incidents_customer").on(table.customerId),
  index("idx_incidents_date").on(table.incidentDate),
  index("idx_incidents_status").on(table.status),
  index("idx_incidents_created_at").on(table.createdAt),
]);

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
}).extend({
  incidentDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
});

export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Incident = typeof incidents.$inferSelect;

// Vehicle Service Records table - Maintenance and service history
export const vehicleServiceRecords = pgTable("vehicle_service_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  serviceType: varchar("service_type", { length: 50 }).notNull(), // maintenance, repair, inspection, oil_change, tire_change
  serviceDate: timestamp("service_date").notNull(),
  odometerReading: integer("odometer_reading"),
  serviceProvider: varchar("service_provider"),
  description: text("description"),
  cost: varchar("cost"),
  nextServiceDue: timestamp("next_service_due"),
  nextServiceOdometer: integer("next_service_odometer"),
  invoiceNumber: varchar("invoice_number"),
  documentUrls: text("document_urls").array(),
  notes: text("notes"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_service_records_vehicle").on(table.vehicleId),
  index("idx_service_records_date").on(table.serviceDate),
  index("idx_service_records_type").on(table.serviceType),
  index("idx_service_records_created_at").on(table.createdAt),
]);

export const insertVehicleServiceRecordSchema = createInsertSchema(vehicleServiceRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
}).extend({
  serviceDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  nextServiceDue: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val).optional(),
});

export type InsertVehicleServiceRecord = z.infer<typeof insertVehicleServiceRecordSchema>;
export type VehicleServiceRecord = typeof vehicleServiceRecords.$inferSelect;

// Rental Rate Plans table - Dynamic pricing and promotional rates
export const rentalRatePlans = pgTable("rental_rate_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planName: varchar("plan_name").notNull(),
  planType: varchar("plan_type", { length: 30 }).notNull(), // standard, seasonal, promotional, corporate
  vehicleCategory: varchar("vehicle_category"), // All, Sedan, SUV, Luxury
  dailyRate: varchar("daily_rate"),
  weeklyRate: varchar("weekly_rate"),
  monthlyRate: varchar("monthly_rate"),
  minimumDays: integer("minimum_days").default(1),
  discountPercentage: varchar("discount_percentage").default("0"),
  effectiveFrom: timestamp("effective_from").notNull(),
  effectiveTo: timestamp("effective_to"),
  isActive: boolean("is_active").notNull().default(true),
  description: text("description"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_rate_plans_type").on(table.planType),
  index("idx_rate_plans_active").on(table.isActive),
  index("idx_rate_plans_effective").on(table.effectiveFrom, table.effectiveTo),
  index("idx_rate_plans_created_at").on(table.createdAt),
]);

export const insertRentalRatePlanSchema = createInsertSchema(rentalRatePlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
}).extend({
  effectiveFrom: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  effectiveTo: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val).optional(),
});

export type InsertRentalRatePlan = z.infer<typeof insertRentalRatePlanSchema>;
export type RentalRatePlan = typeof rentalRatePlans.$inferSelect;

// Vehicle Accessories table - Accessory master data
export const vehicleAccessories = pgTable("vehicle_accessories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accessoryName: varchar("accessory_name").notNull(),
  category: varchar("category", { length: 30 }).notNull(), // safety, comfort, electronics, child_safety
  dailyRate: varchar("daily_rate").notNull(),
  weeklyRate: varchar("weekly_rate"),
  monthlyRate: varchar("monthly_rate"),
  quantity: integer("quantity").default(0),
  isActive: boolean("is_active").notNull().default(true),
  description: text("description"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_accessories_category").on(table.category),
  index("idx_accessories_active").on(table.isActive),
  index("idx_accessories_created_at").on(table.createdAt),
]);

export const insertVehicleAccessorySchema = createInsertSchema(vehicleAccessories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

export type InsertVehicleAccessory = z.infer<typeof insertVehicleAccessorySchema>;
export type VehicleAccessory = typeof vehicleAccessories.$inferSelect;

// Contract Accessories table - Accessories assigned to contracts
export const contractAccessories = pgTable("contract_accessories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").notNull().references(() => contracts.id),
  accessoryId: varchar("accessory_id").notNull().references(() => vehicleAccessories.id),
  quantity: integer("quantity").notNull().default(1),
  dailyRate: varchar("daily_rate").notNull(),
  totalCost: varchar("total_cost").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_contract_accessories_contract").on(table.contractId),
  index("idx_contract_accessories_accessory").on(table.accessoryId),
]);

export const insertContractAccessorySchema = createInsertSchema(contractAccessories).omit({
  id: true,
  createdAt: true,
});

export type InsertContractAccessory = z.infer<typeof insertContractAccessorySchema>;
export type ContractAccessory = typeof contractAccessories.$inferSelect;

// ========================================
// PHASE 3: OPERATIONS & AUTOMATION
// ========================================

// Driver Schedules table - Driver shift scheduling
export const driverSchedules = pgTable("driver_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  driverId: varchar("driver_id").notNull().references(() => drivers.id),
  scheduleDate: timestamp("schedule_date").notNull(),
  shiftStart: timestamp("shift_start").notNull(),
  shiftEnd: timestamp("shift_end").notNull(),
  breakDuration: integer("break_duration").default(0), // minutes
  branchId: varchar("branch_id").references(() => branches.id),
  vehicleAssigned: varchar("vehicle_assigned").references(() => vehicles.id),
  taskType: varchar("task_type", { length: 30 }), // rental_driver, delivery, standby
  status: varchar("status", { length: 20 }).notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  notes: text("notes"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_driver_schedules_driver").on(table.driverId),
  index("idx_driver_schedules_date").on(table.scheduleDate),
  index("idx_driver_schedules_branch").on(table.branchId),
  index("idx_driver_schedules_status").on(table.status),
  index("idx_driver_schedules_created_at").on(table.createdAt),
]);

export const insertDriverScheduleSchema = createInsertSchema(driverSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
}).extend({
  scheduleDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  shiftStart: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  shiftEnd: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
});

export type InsertDriverSchedule = z.infer<typeof insertDriverScheduleSchema>;
export type DriverSchedule = typeof driverSchedules.$inferSelect;

// Driver Attendance table - Check-in/out tracking
export const driverAttendance = pgTable("driver_attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  driverId: varchar("driver_id").notNull().references(() => drivers.id),
  scheduleId: varchar("schedule_id").references(() => driverSchedules.id),
  checkIn: timestamp("check_in").notNull(),
  checkOut: timestamp("check_out"),
  hoursWorked: varchar("hours_worked"),
  overtimeHours: varchar("overtime_hours").default("0"),
  location: varchar("location"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_driver_attendance_driver").on(table.driverId),
  index("idx_driver_attendance_schedule").on(table.scheduleId),
  index("idx_driver_attendance_check_in").on(table.checkIn),
  index("idx_driver_attendance_created_at").on(table.createdAt),
]);

export const insertDriverAttendanceSchema = createInsertSchema(driverAttendance).omit({
  id: true,
  createdAt: true,
}).extend({
  checkIn: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  checkOut: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val).optional(),
});

export type InsertDriverAttendance = z.infer<typeof insertDriverAttendanceSchema>;
export type DriverAttendance = typeof driverAttendance.$inferSelect;

// Automated Reminders table - Notification engine
export const automatedReminders = pgTable("automated_reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type", { length: 30 }).notNull(), // contract, vehicle, license, insurance, driver, customer
  entityId: varchar("entity_id").notNull(),
  reminderType: varchar("reminder_type", { length: 50 }).notNull(), // contract_expiry, license_renewal, insurance_renewal, maintenance_due
  reminderDate: timestamp("reminder_date").notNull(),
  frequency: varchar("frequency", { length: 20 }).notNull().default("once"), // once, daily, weekly, monthly
  channel: varchar("channel", { length: 20 }).notNull().default("email"), // email, sms, whatsapp, system
  channelType: varchar("channel_type", { length: 20 }).default("email"), // sms, email, both - New field
  templateId: varchar("template_id").references(() => notificationTemplates.id), // Reference to notification_templates - New field
  messageTemplate: text("message_template"),
  recipientEmail: varchar("recipient_email"),
  recipientPhone: varchar("recipient_phone"),
  isSent: boolean("is_sent").notNull().default(false),
  sentTime: timestamp("sent_time"),
  lastTriggered: timestamp("last_triggered"), // Last time reminder was triggered - New field
  sendAttempts: integer("send_attempts").default(0),
  lastError: text("last_error"),
  isSystemOwned: boolean("is_system_owned").notNull().default(false), // System-owned reminders (12 defaults)
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_reminders_entity").on(table.entityType, table.entityId),
  index("idx_reminders_date").on(table.reminderDate),
  index("idx_reminders_sent").on(table.isSent),
  index("idx_reminders_active").on(table.isActive),
  index("idx_reminders_template").on(table.templateId),
  index("idx_reminders_created_at").on(table.createdAt),
]);

export const insertAutomatedReminderSchema = createInsertSchema(automatedReminders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
}).extend({
  reminderDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  sentTime: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val).optional(),
});

export type InsertAutomatedReminder = z.infer<typeof insertAutomatedReminderSchema>;
export type AutomatedReminder = typeof automatedReminders.$inferSelect;

// Approval Requests table - Multi-level approval workflow
export const approvalRequests = pgTable("approval_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type", { length: 30 }).notNull(), // contract, discount, refund, write_off, transfer
  entityId: varchar("entity_id").notNull(),
  requestType: varchar("request_type", { length: 50 }).notNull(),
  requestedBy: varchar("requested_by").notNull().references(() => users.id),
  requiredLevel: varchar("required_level", { length: 20 }).notNull(), // manager, admin, super_admin
  currentLevel: varchar("current_level", { length: 20 }).notNull().default("pending"),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, rejected, cancelled
  amount: varchar("amount"), // If financial approval
  reason: text("reason"),
  requestData: jsonb("request_data"), // Additional context
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectedBy: varchar("rejected_by").references(() => users.id),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_approval_requests_entity").on(table.entityType, table.entityId),
  index("idx_approval_requests_requested_by").on(table.requestedBy),
  index("idx_approval_requests_status").on(table.status),
  index("idx_approval_requests_level").on(table.requiredLevel),
  index("idx_approval_requests_created_at").on(table.createdAt),
]);

export const insertApprovalRequestSchema = createInsertSchema(approvalRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertApprovalRequest = z.infer<typeof insertApprovalRequestSchema>;
export type ApprovalRequest = typeof approvalRequests.$inferSelect;

// Approval Logs table - Approval workflow history
export const approvalLogs = pgTable("approval_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  approvalId: varchar("approval_id").notNull().references(() => approvalRequests.id),
  action: varchar("action", { length: 20 }).notNull(), // submitted, approved, rejected, escalated, cancelled
  actionBy: varchar("action_by").notNull().references(() => users.id),
  actionDate: timestamp("action_date").notNull().defaultNow(),
  remarks: text("remarks"),
  previousStatus: varchar("previous_status", { length: 20 }),
  newStatus: varchar("new_status", { length: 20 }),
}, (table) => [
  index("idx_approval_logs_approval").on(table.approvalId),
  index("idx_approval_logs_action_by").on(table.actionBy),
  index("idx_approval_logs_date").on(table.actionDate),
]);

export const insertApprovalLogSchema = createInsertSchema(approvalLogs).omit({
  id: true,
  actionDate: true,
});

export type InsertApprovalLog = z.infer<typeof insertApprovalLogSchema>;
export type ApprovalLog = typeof approvalLogs.$inferSelect;

// OTP Verifications table - Digital signature verification via OTP
export const otpVerifications = pgTable("otp_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type", { length: 30 }).notNull(), // contract, amendment, extension
  entityId: varchar("entity_id").notNull(),
  purpose: varchar("purpose", { length: 50 }).notNull(), // activation, closure, amendment_approval, extension_approval
  recipientType: varchar("recipient_type", { length: 20 }).notNull(), // hirer, sponsor, driver
  recipientId: varchar("recipient_id").notNull(),
  recipientPhone: varchar("recipient_phone", { length: 20 }).notNull(),
  recipientEmail: varchar("recipient_email", { length: 255 }),
  otpCode: varchar("otp_code", { length: 100 }).notNull(), // Hashed OTP code
  expiresAt: timestamp("expires_at").notNull(),
  attempts: integer("attempts").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(3),
  verified: boolean("verified").notNull().default(false),
  verifiedAt: timestamp("verified_at"),
  deliveryChannel: varchar("delivery_channel", { length: 10 }).notNull().default("sms"), // sms, email, both
  deliveryStatus: varchar("delivery_status", { length: 20 }).notNull().default("pending"), // pending, sent, delivered, failed
  deliveryAttempts: integer("delivery_attempts").notNull().default(0),
  lastDeliveryAt: timestamp("last_delivery_at"),
  smsProviderMessageId: varchar("sms_provider_message_id", { length: 100 }),
  emailProviderMessageId: varchar("email_provider_message_id", { length: 100 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: varchar("created_by").references(() => users.id),
  branchId: varchar("branch_id").references(() => branches.id),
}, (table) => [
  index("idx_otp_entity").on(table.entityType, table.entityId),
  index("idx_otp_purpose").on(table.purpose),
  index("idx_otp_recipient").on(table.recipientType, table.recipientId),
  index("idx_otp_verified").on(table.verified),
  index("idx_otp_expires").on(table.expiresAt),
  index("idx_otp_created").on(table.createdAt),
]);

export const insertOtpVerificationSchema = createInsertSchema(otpVerifications).omit({
  id: true,
  createdAt: true,
  attempts: true,
  verified: true,
  verifiedAt: true,
  deliveryAttempts: true,
  lastDeliveryAt: true,
});

export type InsertOtpVerification = z.infer<typeof insertOtpVerificationSchema>;
export type OtpVerification = typeof otpVerifications.$inferSelect;

// Customer Risk Scores table - Risk assessment engine
export const customerRiskScores = pgTable("customer_risk_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  riskScore: integer("risk_score").notNull(), // 0-100 (0 = lowest risk, 100 = highest risk)
  riskCategory: varchar("risk_category", { length: 20 }).notNull(), // low, medium, high, critical
  scoringDate: timestamp("scoring_date").notNull().defaultNow(),
  
  // Risk Factors (0-10 scale each)
  paymentHistory: integer("payment_history").default(0), // Late payments, defaults
  contractViolations: integer("contract_violations").default(0), // Terms violations
  accidentHistory: integer("accident_history").default(0), // Number of accidents
  finesHistory: integer("fines_history").default(0), // Traffic fines count
  licenseValidity: integer("license_validity").default(0), // License issues
  identityVerification: integer("identity_verification").default(0), // ID verification status
  outstandingBalance: varchar("outstanding_balance").default("0"),
  blacklistStatus: boolean("blacklist_status").default(false),
  
  notes: text("notes"),
  calculatedBy: varchar("calculated_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_risk_scores_customer").on(table.customerId),
  index("idx_risk_scores_category").on(table.riskCategory),
  index("idx_risk_scores_date").on(table.scoringDate),
  index("idx_risk_scores_created_at").on(table.createdAt),
]);

export const insertCustomerRiskScoreSchema = createInsertSchema(customerRiskScores).omit({
  id: true,
  createdAt: true,
  scoringDate: true,
});

export type InsertCustomerRiskScore = z.infer<typeof insertCustomerRiskScoreSchema>;
export type CustomerRiskScore = typeof customerRiskScores.$inferSelect;

// Document Registry table - Centralized document management with expiry tracking
export const documentRegistry = pgTable("document_registry", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type", { length: 30 }).notNull(), // customer, driver, vehicle, contract, company, sponsor
  entityId: varchar("entity_id").notNull(),
  documentType: varchar("document_type", { length: 50 }).notNull(), // license, passport, emirates_id, visa, insurance, registration
  documentCategory: varchar("document_category", { length: 30 }), // identification, license, insurance, vehicle_docs, company_docs
  documentNumber: varchar("document_number"),
  issueDate: timestamp("issue_date"),
  expiryDate: timestamp("expiry_date"),
  issuingAuthority: varchar("issuing_authority"),
  fileUrl: text("file_url"),
  fileName: varchar("file_name"),
  fileType: varchar("file_type"),
  fileSize: integer("file_size"),
  isVerified: boolean("is_verified").notNull().default(false),
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedDate: timestamp("verified_date"),
  isRequired: boolean("is_required").notNull().default(false), // Auto-seeded required documents
  reminderDaysBefore: integer("reminder_days_before").default(30), // Days before expiry to send reminder
  reminderSent: boolean("reminder_sent").notNull().default(false), // Reminder sent flag
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, expired, renewed, cancelled
  notes: text("notes"),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_document_registry_entity").on(table.entityType, table.entityId),
  index("idx_document_registry_type").on(table.documentType),
  index("idx_document_registry_category").on(table.documentCategory),
  index("idx_document_registry_expiry").on(table.expiryDate),
  index("idx_document_registry_status").on(table.status),
  index("idx_document_registry_required").on(table.isRequired),
  index("idx_document_registry_created_at").on(table.createdAt),
]);

export const insertDocumentRegistrySchema = createInsertSchema(documentRegistry).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  uploadedBy: true,
}).extend({
  issueDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val).optional(),
  expiryDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val).optional(),
  verifiedDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val).optional(),
});

export type InsertDocumentRegistry = z.infer<typeof insertDocumentRegistrySchema>;
export type DocumentRegistryEntry = typeof documentRegistry.$inferSelect;

// ========================================
// PHASE 3: AUTOMATION & COMMUNICATIONS
// ========================================

// Customer Risk Score History table - Track risk score changes over time
export const customerRiskScoreHistory = pgTable("customer_risk_score_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  riskScore: integer("risk_score").notNull(), // 0-100
  riskLevel: varchar("risk_level", { length: 20 }).notNull(), // low, medium, high, critical
  
  // Contributing Factors (stored as JSON for detailed breakdown)
  contributingFactors: jsonb("contributing_factors"), // { payment: 45%, violations: 25%, incidents: 20%, documents: 10% }
  
  // Calculation Details
  calculationDate: timestamp("calculation_date").notNull().defaultNow(),
  calculatedBy: varchar("calculated_by").references(() => users.id), // null if automated
  isAutomated: boolean("is_automated").notNull().default(true),
  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_risk_history_customer").on(table.customerId),
  index("idx_risk_history_date").on(table.calculationDate),
  index("idx_risk_history_level").on(table.riskLevel),
  index("idx_risk_history_created_at").on(table.createdAt),
]);

export const insertCustomerRiskScoreHistorySchema = createInsertSchema(customerRiskScoreHistory).omit({
  id: true,
  createdAt: true,
  calculationDate: true,
});

export type InsertCustomerRiskScoreHistory = z.infer<typeof insertCustomerRiskScoreHistorySchema>;
export type CustomerRiskScoreHistory = typeof customerRiskScoreHistory.$inferSelect;

// Notification Preferences table - Customer/Driver communication preferences
export const notificationPreferences = pgTable("notification_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Owner (either customer or driver)
  customerId: varchar("customer_id").references(() => customers.id),
  driverId: varchar("driver_id").references(() => drivers.id),
  
  // Channel Preferences
  preferredChannel: varchar("preferred_channel", { length: 20 }).notNull().default("both"), // sms, email, both
  smsOptIn: boolean("sms_opt_in").notNull().default(true),
  emailOptIn: boolean("email_opt_in").notNull().default(true),
  
  // Contact Information
  smsNumber: varchar("sms_number"),
  emailAddress: varchar("email_address"),
  
  // Notification Types (opt-in/opt-out for each type)
  contractReminders: boolean("contract_reminders").notNull().default(true),
  paymentReminders: boolean("payment_reminders").notNull().default(true),
  documentExpiry: boolean("document_expiry").notNull().default(true),
  maintenanceAlerts: boolean("maintenance_alerts").notNull().default(false),
  marketingMessages: boolean("marketing_messages").notNull().default(false),
  
  // Language Preference
  preferredLanguage: varchar("preferred_language", { length: 5 }).notNull().default("en"), // en, ar
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_notification_prefs_customer").on(table.customerId),
  index("idx_notification_prefs_driver").on(table.driverId),
  index("idx_notification_prefs_channel").on(table.preferredChannel),
  index("idx_notification_prefs_language").on(table.preferredLanguage),
  index("idx_notification_prefs_created_at").on(table.createdAt),
]);

export const insertNotificationPreferenceSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNotificationPreference = z.infer<typeof insertNotificationPreferenceSchema>;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;

// Notification Templates table - Reusable message templates (32 types)
export const notificationTemplates = pgTable("notification_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Template Identification
  templateCode: varchar("template_code", { length: 50 }).notNull().unique(), // CONTRACT_ACTIVATED, PAYMENT_DUE, etc.
  category: varchar("category", { length: 30 }).notNull(), // contract, payment, document, compliance, fleet, workforce, approval
  name: varchar("name").notNull(),
  description: text("description"),
  
  // Template Content (Bilingual)
  subjectEn: varchar("subject_en"), // Email subject (English)
  subjectAr: varchar("subject_ar"), // Email subject (Arabic)
  bodyEn: text("body_en").notNull(), // Message body with {{variables}} (English)
  bodyAr: text("body_ar").notNull(), // Message body with {{variables}} (Arabic)
  
  // Template Variables (e.g., {{contractId}}, {{customerName}}, {{amount}})
  variables: jsonb("variables"), // ["contractId", "customerName", "amount"]
  
  // Channel Support
  supportsSms: boolean("supports_sms").notNull().default(true),
  supportsEmail: boolean("supports_email").notNull().default(true),
  
  // System Templates (non-editable core templates)
  isSystemTemplate: boolean("is_system_template").notNull().default(false),
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  
  // Audit
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_notification_templates_code").on(table.templateCode),
  index("idx_notification_templates_category").on(table.category),
  index("idx_notification_templates_active").on(table.isActive),
  index("idx_notification_templates_system").on(table.isSystemTemplate),
  index("idx_notification_templates_created_at").on(table.createdAt),
]);

export const insertNotificationTemplateSchema = createInsertSchema(notificationTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

export type InsertNotificationTemplate = z.infer<typeof insertNotificationTemplateSchema>;
export type NotificationTemplate = typeof notificationTemplates.$inferSelect;

// Communication Providers table - Unified SMS/Email provider configuration
export const communicationProviders = pgTable("communication_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Provider Type & Details
  type: varchar("type", { length: 20 }).notNull(), // sms, email
  name: varchar("name").notNull(), // Display name
  provider: varchar("provider", { length: 50 }).notNull(), // twilio, sendgrid, gmail_oauth, smtp, etc.
  
  // Priority & Health
  priority: integer("priority").notNull().default(1), // Lower = higher priority
  isActive: boolean("is_active").notNull().default(true),
  healthStatus: varchar("health_status", { length: 20 }).notNull().default("unknown"),
  lastHealthCheck: timestamp("last_health_check"),
  
  // Encrypted Credentials (JSONB for flexibility)
  // SMS: { accountSid, authToken, fromPhone }
  // Email: { apiKey, smtpHost, smtpPort, username, password, fromEmail, fromName }
  credentials: jsonb("credentials").notNull(),
  
  // Additional Configuration
  configuration: jsonb("configuration"),
  
  // Usage Statistics
  totalSent: integer("total_sent").default(0),
  totalFailed: integer("total_failed").default(0),
  lastUsed: timestamp("last_used"),
  
  // Audit
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_communication_providers_type").on(table.type),
  index("idx_communication_providers_priority").on(table.priority),
  index("idx_communication_providers_active").on(table.isActive),
  index("idx_communication_providers_health").on(table.healthStatus),
  index("idx_communication_providers_created_at").on(table.createdAt),
]);

export const insertCommunicationProviderSchema = createInsertSchema(communicationProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  lastHealthCheck: true,
  lastUsed: true,
  totalSent: true,
  totalFailed: true,
});

export type InsertCommunicationProvider = z.infer<typeof insertCommunicationProviderSchema>;
export type CommunicationProvider = typeof communicationProviders.$inferSelect;

// Communication Logs table - Comprehensive message tracking
export const communicationLogs = pgTable("communication_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Message Details
  channel: varchar("channel", { length: 20 }).notNull(), // sms, email
  recipient: varchar("recipient").notNull(), // Phone or email
  subject: varchar("subject"), // Email subject
  message: text("message").notNull(), // Message body
  
  // Provider Information
  providerId: varchar("provider_id").references(() => communicationProviders.id),
  providerName: varchar("provider_name"), // Snapshot
  
  // Status Tracking
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  failureReason: text("failure_reason"),
  
  // External References
  externalId: varchar("external_id"), // Provider message ID
  entityType: varchar("entity_type", { length: 30 }),
  entityId: varchar("entity_id"),
  
  // Template Reference
  templateId: varchar("template_id").references(() => notificationTemplates.id),
  templateCode: varchar("template_code", { length: 50 }), // For reporting
  templateVariables: jsonb("template_variables"),
  
  // Context
  triggerType: varchar("trigger_type", { length: 30 }), // manual, automated, scheduled
  triggeredBy: varchar("triggered_by").references(() => users.id),
  recipientType: varchar("recipient_type", { length: 30 }), // customer, driver, user
  recipientId: varchar("recipient_id"),
  recipientName: varchar("recipient_name"),
  language: varchar("language", { length: 5 }).default("en"),
  
  // Enhanced Delivery
  readAt: timestamp("read_at"), // Email read timestamp
  failedAt: timestamp("failed_at"),
  attemptCount: integer("attempt_count").default(1),
  lastAttemptAt: timestamp("last_attempt_at"),
  errorCode: varchar("error_code"),
  errorMessage: text("error_message"),
  
  // Metadata
  deliveryMetadata: jsonb("delivery_metadata"),
  providerResponse: jsonb("provider_response"),
  cost: varchar("cost"),
  currency: varchar("currency", { length: 5 }).default("AED"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_communication_logs_channel").on(table.channel),
  index("idx_communication_logs_recipient").on(table.recipient),
  index("idx_communication_logs_status").on(table.status),
  index("idx_communication_logs_provider").on(table.providerId),
  index("idx_communication_logs_entity").on(table.entityType, table.entityId),
  index("idx_communication_logs_template").on(table.templateId),
  index("idx_communication_logs_trigger_type").on(table.triggerType),
  index("idx_communication_logs_recipient_detail").on(table.recipientType, table.recipientId),
  index("idx_communication_logs_sent_at").on(table.sentAt),
  index("idx_communication_logs_created_at").on(table.createdAt),
]);

export const insertCommunicationLogSchema = createInsertSchema(communicationLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertCommunicationLog = z.infer<typeof insertCommunicationLogSchema>;
export type CommunicationLog = typeof communicationLogs.$inferSelect;

// ============================================================================
// PHASE 4-5: ADVANCED FEATURES - Campaign Management, Analytics, Predictions
// ============================================================================

// Claim Progress Updates table - Timeline tracking for insurance claims
export const claimProgressUpdates = pgTable("claim_progress_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  claimId: varchar("claim_id").notNull().references(() => insuranceClaims.id, { onDelete: 'cascade' }),
  
  // Update Details
  updateType: varchar("update_type", { length: 30 }).notNull(), // status_change, remark, financial_update, document_upload, approval
  
  // Status Changes
  previousStatus: varchar("previous_status", { length: 20 }),
  newStatus: varchar("new_status", { length: 20 }),
  
  // Financial Updates
  previousAmount: varchar("previous_amount"),
  newAmount: varchar("new_amount"),
  amountType: varchar("amount_type", { length: 30 }), // claim_amount, approved_amount, settled_amount
  
  // Remark/Notes
  remark: text("remark"),
  remarkAr: text("remark_ar"), // Arabic remark
  
  // Document Attachments (file paths)
  attachments: jsonb("attachments"), // Array of file paths
  
  // User Info
  updatedBy: varchar("updated_by").notNull().references(() => users.id),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_claim_progress_claim_id").on(table.claimId),
  index("idx_claim_progress_update_type").on(table.updateType),
  index("idx_claim_progress_updated_by").on(table.updatedBy),
  index("idx_claim_progress_created_at").on(table.createdAt),
]);

export const claimProgressRelations = relations(claimProgressUpdates, ({ one }) => ({
  claim: one(insuranceClaims, {
    fields: [claimProgressUpdates.claimId],
    references: [insuranceClaims.id],
  }),
  user: one(users, {
    fields: [claimProgressUpdates.updatedBy],
    references: [users.id],
  }),
}));

export const insertClaimProgressUpdateSchema = createInsertSchema(claimProgressUpdates).omit({
  id: true,
  createdAt: true,
});

export type InsertClaimProgressUpdate = z.infer<typeof insertClaimProgressUpdateSchema>;
export type ClaimProgressUpdate = typeof claimProgressUpdates.$inferSelect;

// Notification Campaigns table - Marketing & communication campaigns
export const notificationCampaigns = pgTable("notification_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Campaign Details
  name: varchar("name").notNull(),
  nameAr: varchar("name_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  
  // Status Workflow
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft, pending_approval, approved, scheduled, sending, sent, cancelled, failed
  
  // Template & Channel
  templateId: varchar("template_id").notNull().references(() => notificationTemplates.id),
  channel: varchar("channel", { length: 20 }).notNull(), // email, sms, both
  
  // Branch Scoping (RBAC)
  scope: varchar("scope", { length: 20 }).notNull().default("branch"), // branch, organization, selected_branches
  branchId: varchar("branch_id").references(() => branches.id), // For branch scope
  selectedBranches: jsonb("selected_branches"), // Array of branch IDs for selected_branches scope
  
  // Recipient Filtering
  recipientFilter: jsonb("recipient_filter").notNull(), // Complex filter criteria
  estimatedRecipients: integer("estimated_recipients").default(0),
  actualRecipients: integer("actual_recipients").default(0),
  
  // Cost Estimation & Tracking
  estimatedCost: varchar("estimated_cost"),
  actualCost: varchar("actual_cost"),
  currency: varchar("currency", { length: 5 }).default("AED"),
  
  // Scheduling
  scheduledAt: timestamp("scheduled_at"), // When to send (null = send immediately)
  sentAt: timestamp("sent_at"), // When actually sent
  
  // Delivery Tracking
  successCount: integer("success_count").default(0),
  failureCount: integer("failure_count").default(0),
  
  // Approval Workflow
  requiresApproval: boolean("requires_approval").notNull().default(true),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectedBy: varchar("rejected_by").references(() => users.id),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  
  // A/B Testing
  isAbTest: boolean("is_ab_test").notNull().default(false),
  abTestId: varchar("ab_test_id"),
  variantName: varchar("variant_name", { length: 10 }), // 'A', 'B'
  
  // Audit
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_campaigns_status").on(table.status),
  index("idx_campaigns_scope").on(table.scope),
  index("idx_campaigns_branch").on(table.branchId),
  index("idx_campaigns_template").on(table.templateId),
  index("idx_campaigns_scheduled").on(table.scheduledAt),
  index("idx_campaigns_created_by").on(table.createdBy),
  index("idx_campaigns_ab_test").on(table.abTestId),
  index("idx_campaigns_created_at").on(table.createdAt),
]);

export const campaignRelations = relations(notificationCampaigns, ({ one }) => ({
  template: one(notificationTemplates, {
    fields: [notificationCampaigns.templateId],
    references: [notificationTemplates.id],
  }),
  branch: one(branches, {
    fields: [notificationCampaigns.branchId],
    references: [branches.id],
  }),
  creator: one(users, {
    fields: [notificationCampaigns.createdBy],
    references: [users.id],
    relationName: "campaignCreator",
  }),
  approver: one(users, {
    fields: [notificationCampaigns.approvedBy],
    references: [users.id],
    relationName: "campaignApprover",
  }),
}));

export const insertCampaignSchema = createInsertSchema(notificationCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  actualRecipients: true,
  actualCost: true,
  sentAt: true,
  successCount: true,
  failureCount: true,
  approvedBy: true,
  approvedAt: true,
  rejectedBy: true,
  rejectedAt: true,
});

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof notificationCampaigns.$inferSelect;

// Campaign Recipients table - Track individual message delivery per campaign
export const campaignRecipients = pgTable("campaign_recipients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull().references(() => notificationCampaigns.id, { onDelete: 'cascade' }),
  
  // Recipient Details
  recipientType: varchar("recipient_type", { length: 30 }).notNull(), // customer, driver, user
  recipientId: varchar("recipient_id").notNull(),
  recipientName: varchar("recipient_name"),
  recipientContact: varchar("recipient_contact").notNull(), // Email or phone
  
  // Delivery Status
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, sent, delivered, failed, bounced
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"), // Email read tracking
  failureReason: text("failure_reason"),
  
  // Reference to communication log
  communicationLogId: varchar("communication_log_id").references(() => communicationLogs.id),
  
  // Metadata
  deliveryMetadata: jsonb("delivery_metadata"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_campaign_recipients_campaign").on(table.campaignId),
  index("idx_campaign_recipients_type").on(table.recipientType, table.recipientId),
  index("idx_campaign_recipients_status").on(table.status),
  index("idx_campaign_recipients_sent_at").on(table.sentAt),
  index("idx_campaign_recipients_created_at").on(table.createdAt),
]);

export const campaignRecipientRelations = relations(campaignRecipients, ({ one }) => ({
  campaign: one(notificationCampaigns, {
    fields: [campaignRecipients.campaignId],
    references: [notificationCampaigns.id],
  }),
  communicationLog: one(communicationLogs, {
    fields: [campaignRecipients.communicationLogId],
    references: [communicationLogs.id],
  }),
}));

export const insertCampaignRecipientSchema = createInsertSchema(campaignRecipients).omit({
  id: true,
  createdAt: true,
});

export type InsertCampaignRecipient = z.infer<typeof insertCampaignRecipientSchema>;
export type CampaignRecipient = typeof campaignRecipients.$inferSelect;

// Template Analytics table - Track template performance metrics
export const templateAnalytics = pgTable("template_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull().references(() => notificationTemplates.id, { onDelete: 'cascade' }),
  
  // Time Period
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  periodType: varchar("period_type", { length: 20 }).notNull(), // daily, weekly, monthly
  
  // Channel Breakdown
  channel: varchar("channel", { length: 20 }).notNull(), // email, sms, both
  
  // Volume Metrics
  sendCount: integer("send_count").notNull().default(0),
  deliverySuccessCount: integer("delivery_success_count").default(0),
  deliveryFailureCount: integer("delivery_failure_count").default(0),
  
  // Email-specific Metrics
  emailOpenCount: integer("email_open_count").default(0),
  emailClickCount: integer("email_click_count").default(0),
  emailBounceCount: integer("email_bounce_count").default(0),
  emailUnsubscribeCount: integer("email_unsubscribe_count").default(0),
  
  // Calculated Rates (stored for performance)
  deliveryRate: varchar("delivery_rate"), // Percentage
  openRate: varchar("open_rate"), // Email only
  clickRate: varchar("click_rate"), // Email only
  bounceRate: varchar("bounce_rate"),
  
  // Performance Score (0-100)
  performanceScore: integer("performance_score"),
  
  // Cost Tracking
  totalCost: varchar("total_cost"),
  currency: varchar("currency", { length: 5 }).default("AED"),
  
  // Branch Analytics (nullable for organization-wide)
  branchId: varchar("branch_id").references(() => branches.id),
  
  // Metadata
  metadata: jsonb("metadata"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_template_analytics_template").on(table.templateId),
  index("idx_template_analytics_period").on(table.periodStart, table.periodEnd),
  index("idx_template_analytics_channel").on(table.channel),
  index("idx_template_analytics_branch").on(table.branchId),
  index("idx_template_analytics_score").on(table.performanceScore),
  index("idx_template_analytics_created_at").on(table.createdAt),
]);

export const templateAnalyticsRelations = relations(templateAnalytics, ({ one }) => ({
  template: one(notificationTemplates, {
    fields: [templateAnalytics.templateId],
    references: [notificationTemplates.id],
  }),
  branch: one(branches, {
    fields: [templateAnalytics.branchId],
    references: [branches.id],
  }),
}));

export const insertTemplateAnalyticsSchema = createInsertSchema(templateAnalytics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTemplateAnalytics = z.infer<typeof insertTemplateAnalyticsSchema>;
export type TemplateAnalytics = typeof templateAnalytics.$inferSelect;

// A/B Test Variants table - A/B testing for templates
export const abTestVariants = pgTable("ab_test_variants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Test Details
  testName: varchar("test_name").notNull(),
  testDescription: text("test_description"),
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft, active, completed, cancelled
  
  // Variants
  variantATemplateId: varchar("variant_a_template_id").notNull().references(() => notificationTemplates.id),
  variantBTemplateId: varchar("variant_b_template_id").notNull().references(() => notificationTemplates.id),
  
  // Split Configuration
  splitPercentage: integer("split_percentage").notNull().default(50), // Percentage for variant A (B gets remainder)
  
  // Success Criteria
  successMetric: varchar("success_metric", { length: 30 }).notNull(), // delivery_rate, open_rate, click_rate
  minimumSampleSize: integer("minimum_sample_size").default(100),
  
  // Results Tracking
  variantASendCount: integer("variant_a_send_count").default(0),
  variantBSendCount: integer("variant_b_send_count").default(0),
  variantASuccessCount: integer("variant_a_success_count").default(0),
  variantBSuccessCount: integer("variant_b_success_count").default(0),
  variantASuccessRate: varchar("variant_a_success_rate"),
  variantBSuccessRate: varchar("variant_b_success_rate"),
  
  // Winner Declaration
  winner: varchar("winner", { length: 10 }), // 'A', 'B', 'tie', null
  winnerDeclaredAt: timestamp("winner_declared_at"),
  confidenceLevel: varchar("confidence_level"), // Statistical confidence
  
  // Test Period
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  
  // Audit
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_ab_test_status").on(table.status),
  index("idx_ab_test_variant_a").on(table.variantATemplateId),
  index("idx_ab_test_variant_b").on(table.variantBTemplateId),
  index("idx_ab_test_created_by").on(table.createdBy),
  index("idx_ab_test_created_at").on(table.createdAt),
]);

export const abTestRelations = relations(abTestVariants, ({ one }) => ({
  variantA: one(notificationTemplates, {
    fields: [abTestVariants.variantATemplateId],
    references: [notificationTemplates.id],
    relationName: "abTestVariantA",
  }),
  variantB: one(notificationTemplates, {
    fields: [abTestVariants.variantBTemplateId],
    references: [notificationTemplates.id],
    relationName: "abTestVariantB",
  }),
  creator: one(users, {
    fields: [abTestVariants.createdBy],
    references: [users.id],
  }),
}));

export const insertAbTestSchema = createInsertSchema(abTestVariants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  variantASendCount: true,
  variantBSendCount: true,
  variantASuccessCount: true,
  variantBSuccessCount: true,
  variantASuccessRate: true,
  variantBSuccessRate: true,
  winner: true,
  winnerDeclaredAt: true,
  confidenceLevel: true,
  startedAt: true,
  completedAt: true,
});

export type InsertAbTest = z.infer<typeof insertAbTestSchema>;
export type AbTest = typeof abTestVariants.$inferSelect;

// Notification Channel Preferences - Flip switches for Email/SMS selection per notification type
export const notificationChannelPreferences = pgTable("notification_channel_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Notification Type Identifier
  notificationType: varchar("notification_type", { length: 50 }).notNull().unique(), 
  // Types: contract_copy, invoice, receipt, qr_verification, payment_reminder, contract_reminder, etc.
  
  // Display Information
  nameEn: varchar("name_en").notNull(),
  nameAr: varchar("name_ar"),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  
  // Channel Preferences
  emailEnabled: boolean("email_enabled").notNull().default(true),
  smsEnabled: boolean("sms_enabled").notNull().default(false),
  
  // Cost Rates (for real-time calculation)
  emailCostPerSend: varchar("email_cost_per_send").default("0.02"), // AED
  smsCostPerSend: varchar("sms_cost_per_send").default("0.15"), // AED
  
  // Priority & Categorization
  category: varchar("category", { length: 30 }), // customer_deliverables, payment_notices, system_alerts, campaigns
  priority: varchar("priority", { length: 20 }).default("normal"), // critical, high, normal, low
  
  // System Flags
  isSystemManaged: boolean("is_system_managed").default(false), // If true, only admins can modify
  isCentralized: boolean("is_centralized").default(false), // If true, bypasses branch scope (e.g., payment notices)
  isActive: boolean("is_active").default(true),
  
  // Metadata
  metadata: jsonb("metadata"),
  
  // Audit
  createdBy: varchar("created_by").references(() => users.id),
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_channel_pref_type").on(table.notificationType),
  index("idx_channel_pref_category").on(table.category),
  index("idx_channel_pref_active").on(table.isActive),
  index("idx_channel_pref_system").on(table.isSystemManaged),
  index("idx_channel_pref_centralized").on(table.isCentralized),
]);

export const channelPreferenceRelations = relations(notificationChannelPreferences, ({ one }) => ({
  creator: one(users, {
    fields: [notificationChannelPreferences.createdBy],
    references: [users.id],
    relationName: "channelPrefCreator",
  }),
  updater: one(users, {
    fields: [notificationChannelPreferences.updatedBy],
    references: [users.id],
    relationName: "channelPrefUpdater",
  }),
}));

export const insertChannelPreferenceSchema = createInsertSchema(notificationChannelPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertChannelPreference = z.infer<typeof insertChannelPreferenceSchema>;
export type ChannelPreference = typeof notificationChannelPreferences.$inferSelect;


// ===========================
// Vehicle Availability Cache
// ===========================

export const vehicleAvailabilityCache = pgTable("vehicle_availability_cache", {
  id: serial("id").primaryKey(),
  vehicleId: varchar("vehicle_id", { length: 50 }).notNull().references(() => vehicles.id),
  branchId: varchar("branch_id", { length: 50 }).notNull().references(() => branches.id),
  date: date("date").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("available"),
  relatedEntityType: varchar("related_entity_type", { length: 30 }),
  relatedEntityId: varchar("related_entity_id", { length: 50 }),
  timeSlots: jsonb("time_slots").$type<{
    morning?: { status: string; entityId?: string };
    afternoon?: { status: string; entityId?: string };
    evening?: { status: string; entityId?: string };
  }>(),
  notes: text("notes"),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("idx_vehicle_availability_unique").on(table.vehicleId, table.date),
  index("idx_vac_branch_date").on(table.branchId, table.date),
  index("idx_vac_status_date").on(table.status, table.date),
  index("idx_vac_vehicle_status").on(table.vehicleId, table.status),
]);

export const vehicleAvailabilityCacheRelations = relations(vehicleAvailabilityCache, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [vehicleAvailabilityCache.vehicleId],
    references: [vehicles.id],
    relationName: "vehicleAvailability",
  }),
  branch: one(branches, {
    fields: [vehicleAvailabilityCache.branchId],
    references: [branches.id],
    relationName: "branchAvailability",
  }),
}));

export const insertVehicleAvailabilityCacheSchema = createInsertSchema(vehicleAvailabilityCache).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastSyncedAt: true,
});

export type InsertVehicleAvailabilityCache = z.infer<typeof insertVehicleAvailabilityCacheSchema>;
export type VehicleAvailabilityCache = typeof vehicleAvailabilityCache.$inferSelect;

// ===========================
// System Settings Table (Settings Matrix)
// ===========================

export const systemSettingsScopeEnum = pgEnum("system_settings_scope", ["GLOBAL", "BRANCH", "ORGANIZATION"]);

export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scopeType: varchar("scope_type", { length: 16 }).notNull().default("GLOBAL"),
  scopeId: varchar("scope_id", { length: 50 }),
  key: varchar("key", { length: 128 }).notNull(),
  value: text("value"),
  valueType: varchar("value_type", { length: 20 }).notNull().default("string"),
  category: varchar("category", { length: 64 }).notNull().default("general"),
  labelEn: varchar("label_en", { length: 255 }),
  labelAr: varchar("label_ar", { length: 255 }),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  isRequired: boolean("is_required").notNull().default(false),
  isReadOnly: boolean("is_read_only").notNull().default(false),
  validationRules: jsonb("validation_rules").$type<{
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  }>(),
  defaultValue: text("default_value"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
  updatedBy: varchar("updated_by", { length: 50 }).references(() => users.id),
}, (table) => [
  index("idx_system_settings_scope").on(table.scopeType, table.scopeId),
  index("idx_system_settings_key").on(table.key),
  index("idx_system_settings_category").on(table.category),
  uniqueIndex("idx_system_settings_unique").on(table.scopeType, table.scopeId, table.key),
]);

export const systemSettingsRelations = relations(systemSettings, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [systemSettings.updatedBy],
    references: [users.id],
    relationName: "settingsUpdatedBy",
  }),
}));

export const insertSystemSettingsSchema = createInsertSchema(systemSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;
export type SystemSettings = typeof systemSettings.$inferSelect;

// ===========================
// MASTER SPEC REQUIRED TABLES (9 items - Per User Requirements)
// ===========================

// 1. blacklist_entries - Separate blacklist tracking table
export const blacklistEntries = pgTable("blacklist_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type", { length: 20 }).notNull(), // 'customer', 'company', 'sponsor'
  entityId: varchar("entity_id").notNull(), // FK to customers/companies/sponsors
  blacklistStatus: varchar("blacklist_status", { length: 20 }).notNull().default('none'), // none, watch, soft_block, hard_block
  reason: text("reason"),
  reasonAr: text("reason_ar"),
  evidenceDocuments: jsonb("evidence_documents").$type<string[]>().default([]),
  blockedActions: jsonb("blocked_actions").$type<string[]>().default([]), // ['new_contract', 'extension', 'all']
  effectiveFrom: timestamp("effective_from", { withTimezone: true }).defaultNow(),
  effectiveUntil: timestamp("effective_until", { withTimezone: true }),
  addedBy: varchar("added_by").references(() => users.id),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  notes: text("notes"),
  branchId: varchar("branch_id").references(() => branches.id), // Branch scope or null for global
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_blacklist_entity").on(table.entityType, table.entityId),
  index("idx_blacklist_status").on(table.blacklistStatus),
  index("idx_blacklist_active").on(table.isActive),
  index("idx_blacklist_branch").on(table.branchId),
]);

export const insertBlacklistEntrySchema = createInsertSchema(blacklistEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBlacklistEntry = z.infer<typeof insertBlacklistEntrySchema>;
export type BlacklistEntry = typeof blacklistEntries.$inferSelect;

// 2. vehicle_classes - Lookup table for vehicle classes (Economy, Compact, SUV, Luxury, etc.)
export const vehicleClasses = pgTable("vehicle_classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 20 }).notNull().unique(), // 'ECO', 'COM', 'SUV', 'LUX', 'VAN'
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }),
  description: text("description"),
  descriptionAr: text("description_ar"),
  sortOrder: integer("sort_order").notNull().default(0),
  defaultDailyRate: numeric("default_daily_rate", { precision: 12, scale: 2 }),
  defaultWeeklyRate: numeric("default_weekly_rate", { precision: 12, scale: 2 }),
  defaultMonthlyRate: numeric("default_monthly_rate", { precision: 12, scale: 2 }),
  defaultDeposit: numeric("default_deposit", { precision: 12, scale: 2 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_vehicle_classes_code").on(table.code),
  index("idx_vehicle_classes_active").on(table.isActive),
  index("idx_vehicle_classes_sort").on(table.sortOrder),
]);

export const insertVehicleClassSchema = createInsertSchema(vehicleClasses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVehicleClass = z.infer<typeof insertVehicleClassSchema>;
export type VehicleClass = typeof vehicleClasses.$inferSelect;

// 3. vehicle_groups - Lookup table for vehicle groups/categories
export const vehicleGroups = pgTable("vehicle_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 20 }).notNull().unique(), // 'SEDAN', 'HATCH', 'CROSSOVER', 'PICKUP'
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }),
  description: text("description"),
  descriptionAr: text("description_ar"),
  vehicleClassId: varchar("vehicle_class_id").references(() => vehicleClasses.id), // Parent class
  sortOrder: integer("sort_order").notNull().default(0),
  seatCapacity: integer("seat_capacity"),
  luggageCapacity: integer("luggage_capacity"), // Number of bags
  fuelType: varchar("fuel_type", { length: 20 }), // 'petrol', 'diesel', 'electric', 'hybrid'
  transmission: varchar("transmission", { length: 20 }), // 'automatic', 'manual'
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_vehicle_groups_code").on(table.code),
  index("idx_vehicle_groups_class").on(table.vehicleClassId),
  index("idx_vehicle_groups_active").on(table.isActive),
  index("idx_vehicle_groups_sort").on(table.sortOrder),
]);

export const insertVehicleGroupSchema = createInsertSchema(vehicleGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVehicleGroup = z.infer<typeof insertVehicleGroupSchema>;
export type VehicleGroup = typeof vehicleGroups.$inferSelect;

// 4. seasonal_tariffs - Seasonal pricing configuration
export const seasonalTariffs = pgTable("seasonal_tariffs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }),
  seasonType: varchar("season_type", { length: 30 }).notNull(), // 'peak', 'off_peak', 'holiday', 'event', 'ramadan', 'eid'
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  adjustmentType: varchar("adjustment_type", { length: 20 }).notNull(), // 'percentage', 'fixed_amount'
  adjustmentValue: numeric("adjustment_value", { precision: 12, scale: 2 }).notNull(), // +20 for 20% increase, -50 for AED 50 discount
  applyTo: varchar("apply_to", { length: 20 }).notNull().default('all'), // 'all', 'daily', 'weekly', 'monthly'
  vehicleClassId: varchar("vehicle_class_id").references(() => vehicleClasses.id), // null = all classes
  vehicleGroupId: varchar("vehicle_group_id").references(() => vehicleGroups.id), // null = all groups
  branchId: varchar("branch_id").references(() => branches.id), // null = all branches
  priority: integer("priority").notNull().default(0), // Higher = takes precedence
  isStackable: boolean("is_stackable").notNull().default(false), // Can combine with other seasonal tariffs
  minimumRentalDays: integer("minimum_rental_days"),
  maximumRentalDays: integer("maximum_rental_days"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_seasonal_tariffs_dates").on(table.startDate, table.endDate),
  index("idx_seasonal_tariffs_type").on(table.seasonType),
  index("idx_seasonal_tariffs_class").on(table.vehicleClassId),
  index("idx_seasonal_tariffs_branch").on(table.branchId),
  index("idx_seasonal_tariffs_active").on(table.isActive),
  index("idx_seasonal_tariffs_priority").on(table.priority),
]);

export const insertSeasonalTariffSchema = createInsertSchema(seasonalTariffs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSeasonalTariff = z.infer<typeof insertSeasonalTariffSchema>;
export type SeasonalTariff = typeof seasonalTariffs.$inferSelect;

// 5. notification_purposes - Lookup table for notification types/purposes
export const notificationPurposes = pgTable("notification_purposes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 50 }).notNull().unique(), // 'CONTRACT_ACTIVATION', 'PAYMENT_CONFIRMATION', 'OTP_VERIFICATION'
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }),
  description: text("description"),
  category: varchar("category", { length: 30 }).notNull(), // 'contract', 'payment', 'otp', 'reminder', 'alert', 'marketing'
  defaultChannels: jsonb("default_channels").$type<string[]>().default(['sms', 'email']), // ['sms', 'email', 'push', 'whatsapp']
  isMandatory: boolean("is_mandatory").notNull().default(false), // Cannot be disabled
  isTransactional: boolean("is_transactional").notNull().default(true), // vs marketing
  requiresOtp: boolean("requires_otp").notNull().default(false),
  cooldownMinutes: integer("cooldown_minutes"), // Minimum time between same notification to same recipient
  maxRetries: integer("max_retries").notNull().default(3),
  retryDelaySeconds: integer("retry_delay_seconds").notNull().default(60),
  priority: varchar("priority", { length: 10 }).notNull().default('normal'), // 'critical', 'high', 'normal', 'low'
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_notification_purposes_code").on(table.code),
  index("idx_notification_purposes_category").on(table.category),
  index("idx_notification_purposes_active").on(table.isActive),
]);

export const insertNotificationPurposeSchema = createInsertSchema(notificationPurposes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertNotificationPurpose = z.infer<typeof insertNotificationPurposeSchema>;
export type NotificationPurpose = typeof notificationPurposes.$inferSelect;

// 6. notification_routes - Per Master Spec §4.13.3 - Configurable notification routing rules
export const notificationRoutes = pgTable("notification_routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  purposeId: varchar("purpose_id").references(() => notificationPurposes.id).notNull(),
  channel: varchar("channel", { length: 20 }).notNull(), // 'SMS', 'EMAIL', 'PUSH', 'WHATSAPP'
  // Per Master Spec §4.13.3 - primary_provider_id and secondary_provider_id
  primaryProviderId: varchar("primary_provider_id").references(() => communicationProviders.id).notNull(),
  secondaryProviderId: varchar("secondary_provider_id").references(() => communicationProviders.id), // Optional fallback
  maxRetries: integer("max_retries").notNull().default(1), // Per spec: Retries per provider
  providerId: varchar("provider_id").references(() => communicationProviders.id), // Legacy - use primaryProviderId
  priority: integer("priority").notNull().default(1), // 1 = primary, 2 = fallback, etc.
  isEnabled: boolean("is_enabled").notNull().default(true),
  conditions: jsonb("conditions").$type<Record<string, any>>(), // {"country": "AE", "time_range": "09:00-18:00"}
  rateLimit: integer("rate_limit"), // Max messages per hour via this route
  costPerMessage: numeric("cost_per_message", { precision: 10, scale: 4 }),
  branchId: varchar("branch_id").references(() => branches.id), // Branch-specific override
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_notification_routes_purpose").on(table.purposeId),
  index("idx_notification_routes_channel").on(table.channel),
  index("idx_notification_routes_provider").on(table.providerId),
  index("idx_notification_routes_primary").on(table.primaryProviderId),
  index("idx_notification_routes_secondary").on(table.secondaryProviderId),
  index("idx_notification_routes_branch").on(table.branchId),
  index("idx_notification_routes_enabled").on(table.isEnabled),
  index("idx_notification_routes_priority").on(table.priority),
]);

export const insertNotificationRouteSchema = createInsertSchema(notificationRoutes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertNotificationRoute = z.infer<typeof insertNotificationRouteSchema>;
export type NotificationRoute = typeof notificationRoutes.$inferSelect;

// 7. cron_job_definitions - Database-driven cron job configuration
export const cronJobDefinitions = pgTable("cron_job_definitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  cronExpression: varchar("cron_expression", { length: 50 }).notNull(), // '0 2 * * *' for 2 AM daily
  timezone: varchar("timezone", { length: 50 }).notNull().default('Asia/Dubai'),
  handler: varchar("handler", { length: 100 }).notNull(), // 'riskScoreCalculation', 'documentExpiryCheck'
  handlerConfig: jsonb("handler_config").$type<Record<string, any>>(), // Handler-specific configuration
  isEnabled: boolean("is_enabled").notNull().default(true),
  retryOnFailure: boolean("retry_on_failure").notNull().default(true),
  maxRetries: integer("max_retries").notNull().default(3),
  retryDelayMinutes: integer("retry_delay_minutes").notNull().default(5),
  timeoutMinutes: integer("timeout_minutes").notNull().default(30),
  alertOnFailure: boolean("alert_on_failure").notNull().default(true),
  alertRecipients: jsonb("alert_recipients").$type<string[]>().default([]), // Email addresses
  lastRunAt: timestamp("last_run_at", { withTimezone: true }),
  lastRunStatus: varchar("last_run_status", { length: 20 }), // 'success', 'failed', 'timeout', 'skipped'
  lastRunDurationMs: integer("last_run_duration_ms"),
  lastErrorMessage: text("last_error_message"),
  nextRunAt: timestamp("next_run_at", { withTimezone: true }),
  runCount: integer("run_count").notNull().default(0),
  failureCount: integer("failure_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_cron_jobs_name").on(table.name),
  index("idx_cron_jobs_enabled").on(table.isEnabled),
  index("idx_cron_jobs_next_run").on(table.nextRunAt),
  index("idx_cron_jobs_status").on(table.lastRunStatus),
]);

export const insertCronJobDefinitionSchema = createInsertSchema(cronJobDefinitions).omit({
  id: true,
  lastRunAt: true,
  lastRunStatus: true,
  lastRunDurationMs: true,
  lastErrorMessage: true,
  nextRunAt: true,
  runCount: true,
  failureCount: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCronJobDefinition = z.infer<typeof insertCronJobDefinitionSchema>;
export type CronJobDefinition = typeof cronJobDefinitions.$inferSelect;

// 8. sequences - Dedicated sequence tracking table
// Per Master Spec §5.5.2 - Configurable sequences with scope
export const sequences = pgTable("sequences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sequenceType: varchar("sequence_type", { length: 50 }).notNull(), // 'contract', 'invoice', 'receipt', 'payment', 'incident'
  prefix: varchar("prefix", { length: 20 }).notNull().default(''), // 'CNT-', 'INV-', 'RCP-'
  suffix: varchar("suffix", { length: 20 }).notNull().default(''),
  currentValue: integer("current_value").notNull().default(0),
  incrementBy: integer("increment_by").notNull().default(1),
  minValue: integer("min_value").notNull().default(1),
  maxValue: integer("max_value").notNull().default(999999999),
  paddingLength: integer("padding_length").notNull().default(6), // Zero padding: 000001
  resetPeriod: varchar("reset_period", { length: 20 }), // 'yearly', 'monthly', 'daily', null for never
  lastResetAt: timestamp("last_reset_at", { withTimezone: true }),
  includeYear: boolean("include_year").notNull().default(false), // CNT-2025-000001
  includeMonth: boolean("include_month").notNull().default(false),
  yearFormat: varchar("year_format", { length: 10 }).notNull().default('YYYY'), // 'YYYY' or 'YY'
  // Per Master Spec §5.5.2 - scope_type and scope_id for branch/global separation
  scopeType: varchar("scope_type", { length: 20 }).notNull().default('GLOBAL'), // 'GLOBAL', 'BRANCH', 'ORGANIZATION'
  scopeId: varchar("scope_id"), // Branch ID when scopeType='BRANCH', null for GLOBAL
  branchId: varchar("branch_id").references(() => branches.id), // Legacy - use scopeId instead
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_sequences_type").on(table.sequenceType),
  index("idx_sequences_branch").on(table.branchId),
  index("idx_sequences_active").on(table.isActive),
  index("idx_sequences_scope").on(table.scopeType, table.scopeId),
  uniqueIndex("idx_sequences_type_scope").on(table.sequenceType, table.scopeType, table.scopeId),
]);

export const insertSequenceSchema = createInsertSchema(sequences).omit({
  id: true,
  currentValue: true,
  lastResetAt: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSequence = z.infer<typeof insertSequenceSchema>;
export type Sequence = typeof sequences.$inferSelect;

// 9. maintenance_jobs - Per Master Spec §4.11.2 - Dedicated maintenance job tracking
export const maintenanceJobs = pgTable("maintenance_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id).notNull(),
  branchId: varchar("branch_id").references(() => branches.id).notNull(),
  jobNumber: varchar("job_number", { length: 50 }).unique(), // Auto-generated: MNT-2025-000001
  // Per Master Spec §4.11.2 - job types: SERVICE, REPAIR, INSPECTION
  jobType: varchar("job_type", { length: 30 }).notNull(), // 'SERVICE', 'REPAIR', 'INSPECTION'
  priority: varchar("priority", { length: 10 }).notNull().default('NORMAL'), // 'CRITICAL', 'HIGH', 'NORMAL', 'LOW'
  // Per Master Spec §4.11.2 - status: PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
  status: varchar("status", { length: 20 }).notNull().default('PLANNED'), // 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
  title: varchar("title", { length: 200 }).notNull(),
  titleAr: varchar("title_ar", { length: 200 }),
  description: text("description"),
  descriptionAr: text("description_ar"),
  reportedIssues: jsonb("reported_issues").$type<string[]>().default([]),
  diagnosedIssues: jsonb("diagnosed_issues").$type<string[]>().default([]),
  partsRequired: jsonb("parts_required").$type<{ partName: string; quantity: number; cost: number; }[]>().default([]),
  laborCost: numeric("labor_cost", { precision: 12, scale: 2 }),
  partsCost: numeric("parts_cost", { precision: 12, scale: 2 }),
  totalCost: numeric("total_cost", { precision: 12, scale: 2 }),
  vendorId: varchar("vendor_id"), // External service provider
  vendorName: varchar("vendor_name", { length: 200 }),
  vendorInvoice: varchar("vendor_invoice", { length: 100 }),
  odometerAtJob: integer("odometer_at_job"),
  plannedStartDate: timestamp("planned_start_date", { withTimezone: true }),
  plannedEndDate: timestamp("planned_end_date", { withTimezone: true }),
  actualStartDate: timestamp("actual_start_date", { withTimezone: true }),
  actualEndDate: timestamp("actual_end_date", { withTimezone: true }),
  assignedTo: varchar("assigned_to").references(() => users.id),
  completedBy: varchar("completed_by").references(() => users.id),
  completionNotes: text("completion_notes"),
  qualityCheckPassed: boolean("quality_check_passed"),
  qualityCheckBy: varchar("quality_check_by").references(() => users.id),
  qualityCheckAt: timestamp("quality_check_at", { withTimezone: true }),
  attachments: jsonb("attachments").$type<string[]>().default([]), // Photo/document URLs
  linkedIncidentId: varchar("linked_incident_id").references(() => incidents.id),
  linkedContractId: varchar("linked_contract_id").references(() => contracts.id),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_maintenance_jobs_vehicle").on(table.vehicleId),
  index("idx_maintenance_jobs_branch").on(table.branchId),
  index("idx_maintenance_jobs_status").on(table.status),
  index("idx_maintenance_jobs_type").on(table.jobType),
  index("idx_maintenance_jobs_priority").on(table.priority),
  index("idx_maintenance_jobs_planned").on(table.plannedStartDate),
  index("idx_maintenance_jobs_assigned").on(table.assignedTo),
  index("idx_maintenance_jobs_incident").on(table.linkedIncidentId),
]);

export const insertMaintenanceJobSchema = createInsertSchema(maintenanceJobs).omit({
  id: true,
  jobNumber: true,
  totalCost: true,
  actualStartDate: true,
  actualEndDate: true,
  completedBy: true,
  qualityCheckPassed: true,
  qualityCheckBy: true,
  qualityCheckAt: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertMaintenanceJob = z.infer<typeof insertMaintenanceJobSchema>;
export type MaintenanceJob = typeof maintenanceJobs.$inferSelect;

// ===========================
// 10. addons - Rental add-on items (GPS, baby seat, insurance upgrades, etc.)
// ===========================
export const addons = pgTable("addons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 30 }).notNull().unique(), // e.g., 'GPS', 'BABY_SEAT', 'CDW_UPGRADE'
  nameEn: varchar("name_en", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  category: varchar("category", { length: 30 }).notNull(), // 'equipment', 'insurance', 'service', 'convenience'
  pricingType: varchar("pricing_type", { length: 20 }).notNull().default('daily'), // 'daily', 'one_time', 'percentage'
  dailyRate: numeric("daily_rate", { precision: 12, scale: 2 }),
  oneTimeRate: numeric("one_time_rate", { precision: 12, scale: 2 }),
  percentageRate: numeric("percentage_rate", { precision: 5, scale: 2 }), // % of rental cost
  maxQuantity: integer("max_quantity").default(1), // How many can be added to a contract
  isStackable: boolean("is_stackable").default(false), // Can multiple be added
  requiresDeposit: boolean("requires_deposit").default(false),
  depositAmount: numeric("deposit_amount", { precision: 12, scale: 2 }),
  taxable: boolean("taxable").default(true),
  branchId: varchar("branch_id").references(() => branches.id), // null = all branches
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_addons_code").on(table.code),
  index("idx_addons_category").on(table.category),
  index("idx_addons_active").on(table.isActive),
  index("idx_addons_branch").on(table.branchId),
]);

export const insertAddonSchema = createInsertSchema(addons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAddon = z.infer<typeof insertAddonSchema>;
export type Addon = typeof addons.$inferSelect;

// ===========================
// 11. packages - Rental packages that bundle addons with special pricing
// ===========================
export const packages = pgTable("packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 30 }).notNull().unique(), // e.g., 'FAMILY_PACK', 'BUSINESS_TRAVELER'
  nameEn: varchar("name_en", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  vehicleClassId: varchar("vehicle_class_id").references(() => vehicleClasses.id), // null = all classes
  packageType: varchar("package_type", { length: 30 }).notNull(), // 'value', 'premium', 'corporate', 'promotional'
  pricingType: varchar("pricing_type", { length: 20 }).notNull().default('fixed'), // 'fixed', 'percentage_discount'
  fixedPrice: numeric("fixed_price", { precision: 12, scale: 2 }), // Total package price
  discountPercentage: numeric("discount_percentage", { precision: 5, scale: 2 }), // % off combined addon prices
  minimumRentalDays: integer("minimum_rental_days").default(1),
  maximumRentalDays: integer("maximum_rental_days"), // null = no limit
  validFrom: date("valid_from"),
  validUntil: date("valid_until"),
  branchId: varchar("branch_id").references(() => branches.id), // null = all branches
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_packages_code").on(table.code),
  index("idx_packages_type").on(table.packageType),
  index("idx_packages_class").on(table.vehicleClassId),
  index("idx_packages_active").on(table.isActive),
  index("idx_packages_valid").on(table.validFrom, table.validUntil),
]);

export const insertPackageSchema = createInsertSchema(packages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type Package = typeof packages.$inferSelect;

// ===========================
// 12. package_addons - Junction table linking packages to their included addons
// ===========================
export const packageAddons = pgTable("package_addons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  packageId: varchar("package_id").references(() => packages.id).notNull(),
  addonId: varchar("addon_id").references(() => addons.id).notNull(),
  quantity: integer("quantity").default(1),
  isRequired: boolean("is_required").default(true), // Required vs optional addon in package
  overridePrice: numeric("override_price", { precision: 12, scale: 2 }), // Override addon's default price
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_package_addons_package").on(table.packageId),
  index("idx_package_addons_addon").on(table.addonId),
  unique("uq_package_addon").on(table.packageId, table.addonId),
]);

export const insertPackageAddonSchema = createInsertSchema(packageAddons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPackageAddon = z.infer<typeof insertPackageAddonSchema>;
export type PackageAddon = typeof packageAddons.$inferSelect;

// ===========================
// MASTER SPEC COMPLIANT TABLES (Part 4 & 5)
// ===========================

// 13. notifications_sent - Per Master Spec §4.13.5 - Notification audit log
export const notificationsSent = pgTable("notifications_sent", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  purposeId: varchar("purpose_id").references(() => notificationPurposes.id).notNull(),
  channel: varchar("channel", { length: 32 }).notNull(), // 'SMS', 'EMAIL', 'WHATSAPP'
  toAddress: varchar("to_address", { length: 255 }).notNull(), // Phone or email
  language: varchar("language", { length: 8 }), // 'en', 'ar'
  subject: varchar("subject", { length: 255 }), // For email
  body: text("body"), // Final rendered body
  providerId: varchar("provider_id").references(() => communicationProviders.id),
  status: varchar("status", { length: 32 }).notNull().default('SENT'), // 'SENT', 'FAILED', 'QUEUED', 'DELIVERED'
  errorMessage: text("error_message"), // Provider error
  fallbackUsed: boolean("fallback_used").default(false),
  contractId: varchar("contract_id").references(() => contracts.id),
  paymentId: varchar("payment_id").references(() => payments.id),
  incidentId: varchar("incident_id").references(() => incidents.id),
  cronJobId: varchar("cron_job_id").references(() => cronJobDefinitions.id),
  triggeredBy: varchar("triggered_by").references(() => users.id), // If manual
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_notifications_sent_purpose").on(table.purposeId),
  index("idx_notifications_sent_status").on(table.status),
  index("idx_notifications_sent_contract").on(table.contractId),
  index("idx_notifications_sent_payment").on(table.paymentId),
  index("idx_notifications_sent_created").on(table.createdAt),
  index("idx_notifications_sent_channel").on(table.channel),
]);

export const insertNotificationsSentSchema = createInsertSchema(notificationsSent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertNotificationsSent = z.infer<typeof insertNotificationsSentSchema>;
export type NotificationsSent = typeof notificationsSent.$inferSelect;

// 14. import_jobs - Per Master Spec §4.15.1 - Import engine persistence
export const importJobs = pgTable("import_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type", { length: 64 }).notNull(), // 'CUSTOMER', 'VEHICLE', 'CONTRACT', etc.
  filename: varchar("filename", { length: 255 }).notNull(),
  totalRecords: integer("total_records"),
  successCount: integer("success_count"),
  failureCount: integer("failure_count"),
  status: varchar("status", { length: 32 }).notNull().default('PENDING'), // 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL'
  errorReportPath: varchar("error_report_path", { length: 512 }),
  initiatedBy: varchar("initiated_by").references(() => users.id).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_import_jobs_entity").on(table.entityType),
  index("idx_import_jobs_status").on(table.status),
  index("idx_import_jobs_initiated").on(table.initiatedBy),
  index("idx_import_jobs_created").on(table.createdAt),
]);

export const insertImportJobSchema = createInsertSchema(importJobs).omit({
  id: true,
  totalRecords: true,
  successCount: true,
  failureCount: true,
  errorReportPath: true,
  startedAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertImportJob = z.infer<typeof insertImportJobSchema>;
export type ImportJob = typeof importJobs.$inferSelect;

// 15. backups - Per Master Spec §4.15.2 - Backup metadata tracking
export const backups = pgTable("backups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  environment: varchar("environment", { length: 64 }).notNull(), // 'PROD', 'STAGE', 'DEV'
  backupType: varchar("backup_type", { length: 32 }).notNull(), // 'FULL', 'DB_ONLY', 'FILES_ONLY'
  storagePath: varchar("storage_path", { length: 512 }).notNull(),
  checksum: varchar("checksum", { length: 128 }),
  sizeBytes: integer("size_bytes"),
  status: varchar("status", { length: 32 }).notNull().default('SUCCESS'), // 'SUCCESS', 'FAILED', 'IN_PROGRESS'
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_backups_environment").on(table.environment),
  index("idx_backups_type").on(table.backupType),
  index("idx_backups_status").on(table.status),
  index("idx_backups_started").on(table.startedAt),
]);

export const insertBackupSchema = createInsertSchema(backups).omit({
  id: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBackup = z.infer<typeof insertBackupSchema>;
export type Backup = typeof backups.$inferSelect;

// 16. cash_closings - Per Master Spec §9.4.1 - Daily branch reconciliation
export const cashClosings = pgTable("cash_closings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  branchId: varchar("branch_id").references(() => branches.id).notNull(),
  clerkUserId: varchar("clerk_user_id").references(() => users.id).notNull(),
  shiftStartAt: timestamp("shift_start_at", { withTimezone: true }),
  shiftEndAt: timestamp("shift_end_at", { withTimezone: true }).notNull(),
  systemCashTotal: numeric("system_cash_total", { precision: 12, scale: 2 }).notNull(),
  systemCardTotal: numeric("system_card_total", { precision: 12, scale: 2 }).notNull(),
  systemBankTotal: numeric("system_bank_total", { precision: 12, scale: 2 }).notNull(),
  countedCashTotal: numeric("counted_cash_total", { precision: 12, scale: 2 }).notNull(),
  differenceCash: numeric("difference_cash", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"), // Discrepancy reasons etc.
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_cash_closings_branch").on(table.branchId),
  index("idx_cash_closings_clerk").on(table.clerkUserId),
  index("idx_cash_closings_shift_end").on(table.shiftEndAt),
  index("idx_cash_closings_created").on(table.createdAt),
]);

export const insertCashClosingSchema = createInsertSchema(cashClosings).omit({
  id: true,
  approvedBy: true,
  approvedAt: true,
  createdAt: true,
});
export type InsertCashClosing = z.infer<typeof insertCashClosingSchema>;
export type CashClosing = typeof cashClosings.$inferSelect;

// 17. cron_job_executions - Per Master Spec §4.14.2 - Cron execution history
export const cronJobExecutions = pgTable("cron_job_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cronJobId: varchar("cron_job_id").references(() => cronJobDefinitions.id).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  status: varchar("status", { length: 32 }).notNull().default('SUCCESS'), // 'SUCCESS', 'FAILED', 'TIMEOUT', 'RETRIED'
  attemptNumber: integer("attempt_number").notNull().default(1),
  errorMessage: text("error_message"),
  stackTrace: text("stack_trace"),
  durationMs: integer("duration_ms"),
  recordsProcessed: integer("records_processed"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_cron_executions_job").on(table.cronJobId),
  index("idx_cron_executions_status").on(table.status),
  index("idx_cron_executions_started").on(table.startedAt),
]);

export const insertCronJobExecutionSchema = createInsertSchema(cronJobExecutions).omit({
  id: true,
  finishedAt: true,
  durationMs: true,
  recordsProcessed: true,
  createdAt: true,
});
export type InsertCronJobExecution = z.infer<typeof insertCronJobExecutionSchema>;
export type CronJobExecution = typeof cronJobExecutions.$inferSelect;

// 18. driver_rate_plans - Per Master Spec §4.10.2 - Driver rate governance
export const driverRatePlans = pgTable("driver_rate_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  driverId: varchar("driver_id").references(() => drivers.id).notNull(),
  rateType: varchar("rate_type", { length: 32 }).notNull(), // 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY'
  rateAmount: numeric("rate_amount", { precision: 12, scale: 2 }).notNull(), // Customer-facing rate
  internalCostRate: numeric("internal_cost_rate", { precision: 12, scale: 2 }), // Internal cost
  currencyCode: varchar("currency_code", { length: 3 }).notNull().default('AED'),
  isChargeable: boolean("is_chargeable").notNull().default(true),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_driver_rate_plans_driver").on(table.driverId),
  index("idx_driver_rate_plans_type").on(table.rateType),
  index("idx_driver_rate_plans_active").on(table.isActive),
]);

export const insertDriverRatePlanSchema = createInsertSchema(driverRatePlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDriverRatePlan = z.infer<typeof insertDriverRatePlanSchema>;
export type DriverRatePlan = typeof driverRatePlans.$inferSelect;

// 19. contract_drivers - Per Master Spec §4.10.3 - Contract-driver assignments
export const contractDrivers = pgTable("contract_drivers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").references(() => contracts.id).notNull(),
  driverId: varchar("driver_id").references(() => drivers.id).notNull(),
  driverRatePlanId: varchar("driver_rate_plan_id").references(() => driverRatePlans.id).notNull(),
  assignmentStart: timestamp("assignment_start", { withTimezone: true }).notNull(),
  assignmentEnd: timestamp("assignment_end", { withTimezone: true }),
  status: varchar("status", { length: 32 }).notNull().default('ASSIGNED'), // 'ASSIGNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'
  totalCharge: numeric("total_charge", { precision: 12, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_contract_drivers_contract").on(table.contractId),
  index("idx_contract_drivers_driver").on(table.driverId),
  index("idx_contract_drivers_rate_plan").on(table.driverRatePlanId),
  index("idx_contract_drivers_status").on(table.status),
]);

export const insertContractDriverSchema = createInsertSchema(contractDrivers).omit({
  id: true,
  totalCharge: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertContractDriver = z.infer<typeof insertContractDriverSchema>;
export type ContractDriver = typeof contractDrivers.$inferSelect;

// 20. roles - Per Master Spec §5.1.3 - FK-backed RBAC
export const roles = pgTable("roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  description: text("description"),
  isSystemRole: boolean("is_system_role").notNull().default(false), // Cannot be deleted
  permissions: jsonb("permissions").$type<string[]>().default([]), // List of permission codes
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_roles_code").on(table.code),
]);

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;

// 21. role_assignments - Per Master Spec §5.1.3 - User-role linkage
export const roleAssignments = pgTable("role_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  roleId: varchar("role_id").references(() => roles.id).notNull(),
  branchId: varchar("branch_id").references(() => branches.id), // null = all branches
  assignedBy: varchar("assigned_by").references(() => users.id),
  assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }), // Optional expiry
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_role_assignments_user").on(table.userId),
  index("idx_role_assignments_role").on(table.roleId),
  index("idx_role_assignments_branch").on(table.branchId),
  index("idx_role_assignments_active").on(table.isActive),
  unique("uq_user_role_branch").on(table.userId, table.roleId, table.branchId),
]);

export const insertRoleAssignmentSchema = createInsertSchema(roleAssignments).omit({
  id: true,
  assignedAt: true,
  createdAt: true,
});
export type InsertRoleAssignment = z.infer<typeof insertRoleAssignmentSchema>;
export type RoleAssignment = typeof roleAssignments.$inferSelect;

// ===========================
// Predictive Report Response Types
// ===========================

export interface RevenueForecastReport {
  summary: {
    averageMonthlyRevenue: number;
    growthRate: number;
    forecast30Days: number;
    forecast90Days: number;
  };
  forecasts: Array<{
    forecastDate: string;
    forecastRevenue: number;
    historicalRevenue?: number;
    confidence: number;
  }>;
  warnings: string[];
}

export interface FleetUtilizationForecastReport {
  summary: {
    overallUtilization: number;
    totalFleet: number;
    vehiclesRented: number;
    availableCapacity: number;
  };
  vehicleTypes: Array<{
    vehicleType: string;
    totalFleet: number;
    currentUtilization: number;
    forecastUtilization: number;
    vehiclesRented: number;
    availableCapacity: number;
  }>;
  warnings: string[];
}

export interface CustomerChurnRiskReport {
  summary: {
    totalCustomers: number;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
    averageRiskScore: number;
    averagePaymentScore: number;
  };
  customers: Array<{
    customerId: string;
    customerName: string;
    riskScore: number;
    riskLevel: 'high' | 'medium' | 'low';
    totalContracts: number;
    daysSinceLastContract: number;
    paymentScore: number;
  }>;
}

export interface MaintenanceCostForecastReport {
  summary: {
    totalForecastCost: number;
    avgCostPerVehicle: number;
    totalVehicles: number;
    avgFleetAge: number;
  };
  vehicleTypes: Array<{
    vehicleType: string;
    totalVehicles: number;
    forecastCost: number;
    avgVehicleAge: number;
    avgMileage: number;
  }>;
  warnings: string[];
}

export interface PaymentDefaultPredictionReport {
  summary: {
    totalOutstanding: number;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
    atRiskAmount: number;
    avgDefaultProbability: number;
  };
  contracts: Array<{
    contractId: string;
    customerName: string;
    defaultProbability: number;
    riskLevel: 'high' | 'medium' | 'low';
    outstandingAmount: number;
    daysOverdue: number;
  }>;
}

export interface LocationDemandForecastReport {
  summary: {
    totalForecastDemand: number;
    totalHistorical: number;
    avgGrowthRate: number;
  };
  locations: Array<{
    emirate: string;
    historicalDemand: number;
    forecastDemand: number;
    growthRate: number;
  }>;
  warnings: string[];
}
