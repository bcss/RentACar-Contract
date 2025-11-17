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
export const users = pgTable("users", {
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
  
  // Contact Information
  phone: varchar("phone").notNull(), // REQUIRED
  email: varchar("email"),
  address: text("address"),
  
  // License Information
  licenseNumber: varchar("license_number"), // Driver's license number (required by form validation)
  licenseIssuedBy: varchar("license_issued_by"), // Issuing authority/country
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
  
  // Pricing (default rates)
  dailyRate: varchar("daily_rate").notNull(),
  weeklyRate: varchar("weekly_rate"),
  monthlyRate: varchar("monthly_rate"),
  
  // Availability Status
  status: varchar("status", { length: 20 }).notNull().default("available"), // available, rented, maintenance, damaged
  
  // Additional Information
  notes: text("notes"),
  
  // RTA (Roads & Transport Authority) Fields
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
  
  // Contact Information
  mobile: varchar("mobile"),
  address: text("address"),
  emirate: emiratesEnum("emirate"), // UAE Emirate for geographic distribution
  
  // Additional Information
  relation: varchar("relation"), // For sponsors: relationship to hirer (e.g., "Employer", "Family Member")
  notes: text("notes"),
  
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
export const branches = pgTable("branches", {
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
  phone: varchar("phone").notNull(),
  email: varchar("email"),
  address: text("address"),
  
  // Contract Information
  contractNumber: varchar("contract_number"),
  contractStartDate: timestamp("contract_start_date"),
  contractEndDate: timestamp("contract_end_date"),
  
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
  index("idx_outsource_companies_disabled").on(table.disabled),
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
  disabledBy: true,
  disabledAt: true,
  disabled: true,
}).extend({
  nameEn: z.string().min(1, "Company name (English) is required").max(200, "Name too long"),
  nameAr: z.string().max(200, "Name too long").optional(),
  phone: z.string().min(1, "Phone number is required").max(20, "Phone number too long"),
  email: z.string().email("Invalid email").max(255, "Email too long").optional(),
  contractStartDate: z.coerce.date().optional(),
  contractEndDate: z.coerce.date().optional(),
});

export type InsertDriverOutsourceCompany = z.infer<typeof insertDriverOutsourceCompanySchema>;
export type DriverOutsourceCompany = typeof driverOutsourceCompanies.$inferSelect;

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
  
  // License Information
  licenseNumber: varchar("license_number").notNull(),
  licenseClass: varchar("license_class").default("Light Vehicle"), // e.g., "Light Vehicle", "Heavy Vehicle"
  licenseExpiry: timestamp("license_expiry"),
  
  // Skills & Languages
  languagesSpoken: text("languages_spoken").array(), // ['English', 'Arabic', 'Urdu', 'Hindi']
  
  // Employment Information
  employmentType: varchar("employment_type", { length: 20 }).notNull(), // in_house, outsourced
  outsourceCompanyId: varchar("outsource_company_id").references(() => driverOutsourceCompanies.id), // If outsourced
  
  // Cost Rate (for profit tracking - internal use only)
  costRate: varchar("cost_rate"), // Daily cost rate to company
  
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
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft, active, completed, closed
  
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
  
  // Pricing
  dailyRate: varchar("daily_rate").notNull(),
  weeklyRate: varchar("weekly_rate"),
  monthlyRate: varchar("monthly_rate"),
  mileageLimit: integer("mileage_limit"), // e.g., 300 km per day
  extraKmRate: varchar("extra_km_rate"), // e.g., "0.50" AED per km
  totalDays: integer("total_days").notNull(),
  
  // Financial Breakdown (Phase 1 & 2)
  subtotal: varchar("subtotal"), // Base rental amount before VAT
  vatAmount: varchar("vat_amount"), // Calculated VAT
  totalAmount: varchar("total_amount").notNull(), // Grand total including VAT
  securityDeposit: varchar("security_deposit"), // Refundable deposit amount
  accidentLiability: varchar("accident_liability"), // e.g., "2500" AED hirer responsibility
  
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
  outstandingBalance: varchar("outstanding_balance"), // Remaining amount to be paid
  
  // Extra Charges (Phase 2) - Detailed breakdown for rental charges
  extraKmCharge: varchar("extra_km_charge"), // Calculated overage charge
  extraKmDriven: integer("extra_km_driven"), // Km over the limit
  fuelCharge: varchar("fuel_charge"), // Fuel refill charge
  salikCharge: varchar("salik_charge"), // SALIK toll charges
  trafficFineCharge: varchar("traffic_fine_charge"), // Traffic fines
  damageCharge: varchar("damage_charge"), // Total damage repair cost
  otherCharges: varchar("other_charges"), // Any additional charges
  totalExtraCharges: varchar("total_extra_charges"), // Sum of all extra charges
  
  // Delivery Service (Drop-off and Pick-up)
  dropOffEnabled: boolean("drop_off_enabled").notNull().default(false),
  dropOffCharge: varchar("drop_off_charge"), // Charge for delivering vehicle to customer
  dropOffAddressEn: text("drop_off_address_en"), // Drop-off address in English
  dropOffAddressAr: text("drop_off_address_ar"), // Drop-off address in Arabic
  pickUpEnabled: boolean("pick_up_enabled").notNull().default(false),
  pickUpCharge: varchar("pick_up_charge"), // Charge for picking up vehicle from customer
  pickUpAddressEn: text("pick_up_address_en"), // Pick-up address in English
  pickUpAddressAr: text("pick_up_address_ar"), // Pick-up address in Arabic
  
  // Driver Service (Phase 3 - Driver Assignment Integration)
  requiresDriver: boolean("requires_driver").notNull().default(false), // Whether driver service is required
  driverServiceType: varchar("driver_service_type", { length: 20 }).default("none"), // 'daily', 'hourly', 'flat', 'none'
  driverServiceRate: varchar("driver_service_rate"), // Rate per unit (day/hour/flat)
  driverServiceQuantity: varchar("driver_service_quantity"), // Number of days, hours, or trips
  driverServiceTotal: varchar("driver_service_total"), // Total driver service charge
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
  finalizedBy: true,
  finalizedAt: true,
  disabledBy: true,
  disabledAt: true,
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
}).refine((data) => {
  // Phase 1: Date validations
  // Rental end date must be after start date
  return data.rentalEndDate >= data.rentalStartDate;
}, {
  message: "Rental end date must be on or after start date",
  path: ["rentalEndDate"],
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
  
  // Payment Details
  amount: varchar("amount").notNull(), // Payment amount (stored as string for precision)
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

// Vehicle Inspections table - Track pre-delivery and post-return inspections with photos
export const vehicleInspections = pgTable("vehicle_inspections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").notNull().references(() => contracts.id),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  
  // Inspection Type
  inspectionType: varchar("inspection_type", { length: 20 }).notNull(), // 'pre_delivery' or 'post_return'
  
  // Inspector Information
  inspectorName: varchar("inspector_name").notNull(), // Auto-filled from logged-in user
  
  // Vehicle Metrics
  odometerReading: integer("odometer_reading").notNull(),
  fuelLevel: integer("fuel_level").notNull(), // 0-100%
  conditionNotes: text("condition_notes"), // Damage description
  
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

// Contract counter table for sequential numbering
export const contractCounter = pgTable("contract_counter", {
  id: varchar("id").primaryKey().default("singleton"),
  currentNumber: integer("current_number").notNull().default(15499), // Starts at 15499 so first contract is 15500
});

export type ContractCounter = typeof contractCounter.$inferSelect;

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
  companyNameEn: varchar("company_name_en").notNull().default("RCCMS"),
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
