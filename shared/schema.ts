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
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

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
  lastPasswordChange: timestamp("last_password_change").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastPasswordChange: true,
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
  nationalId: varchar("national_id").unique(), // National ID or Passport Number
  gender: varchar("gender", { length: 10 }), // male, female
  dateOfBirth: timestamp("date_of_birth"),
  
  // Contact Information
  phone: varchar("phone").notNull(),
  email: varchar("email"),
  address: text("address"),
  
  // License Information
  licenseNumber: varchar("license_number"),
  licenseIssueDate: timestamp("license_issue_date"),
  licenseExpiryDate: timestamp("license_expiry_date"),
  
  // Additional Information
  notes: text("notes"),
  
  // Audit fields
  disabled: boolean("disabled").notNull().default(false),
  disabledBy: varchar("disabled_by").references(() => users.id),
  disabledAt: timestamp("disabled_at"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
  dateOfBirth: z.coerce.date().optional(),
  licenseIssueDate: z.coerce.date().optional(),
  licenseExpiryDate: z.coerce.date().optional(),
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
  
  // Audit fields
  disabled: boolean("disabled").notNull().default(false),
  disabledBy: varchar("disabled_by").references(() => users.id),
  disabledAt: timestamp("disabled_at"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
});

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

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
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft, confirmed, active, completed, closed
  
  // Foreign Keys to Master Data
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  
  // Hirer Type - determines which fields are required
  hirerType: varchar("hirer_type", { length: 20 }).notNull().default("direct"), // direct, with_sponsor, from_company
  
  vehicleCondition: text("vehicle_condition"), // JSON array of damaged areas/notes
  fuelLevelStart: varchar("fuel_level_start"), // e.g., "Full", "3/4", "1/2", "1/4", "Empty"
  fuelLevelEnd: varchar("fuel_level_end"),
  odometerStart: integer("odometer_start"),
  odometerEnd: integer("odometer_end"),
  
  // Rental Details
  rentalType: varchar("rental_type", { length: 20 }).notNull().default("daily"), // daily, weekly, monthly
  rentalStartDate: timestamp("rental_start_date").notNull(),
  rentalEndDate: timestamp("rental_end_date").notNull(),
  rentalStartTime: varchar("rental_start_time"), // e.g., "09:00"
  rentalEndTime: varchar("rental_end_time"),
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
  
  // Extra Charges (Phase 2)
  extraKmCharge: varchar("extra_km_charge"), // Calculated overage charge
  extraKmDriven: integer("extra_km_driven"), // Km over the limit
  fuelCharge: varchar("fuel_charge"), // Fuel refill charge
  damageCharge: varchar("damage_charge"), // Total damage repair cost
  otherCharges: varchar("other_charges"), // Any additional charges
  totalExtraCharges: varchar("total_extra_charges"), // Sum of all extra charges
  
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
  
  // Audit fields
  createdBy: varchar("created_by").notNull(),
  finalizedBy: varchar("finalized_by"),
  finalizedAt: timestamp("finalized_at"),
  disabled: boolean("disabled").notNull().default(false), // Disabled contracts are hidden
  disabledBy: varchar("disabled_by"),
  disabledAt: timestamp("disabled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contractsRelations = relations(contracts, ({ one }) => ({
  customer: one(customers, {
    fields: [contracts.customerId],
    references: [customers.id],
  }),
  vehicle: one(vehicles, {
    fields: [contracts.vehicleId],
    references: [vehicles.id],
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
  rentalStartDate: z.coerce.date(),
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

// Audit logs table
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(), // create, edit, finalize, print, delete, login, logout
  contractId: varchar("contract_id").references(() => contracts.id),
  ipAddress: varchar("ip_address"),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

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
  acknowledged: boolean("acknowledged").notNull().default(false),
  acknowledgedBy: varchar("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type InsertSystemError = typeof systemErrors.$inferInsert;
export type SystemError = typeof systemErrors.$inferSelect;

// Company settings table (singleton)
export const companySettings = pgTable("company_settings", {
  id: varchar("id").primaryKey().default("singleton"),
  // Company Names
  companyNameEn: varchar("company_name_en").notNull().default("MARMAR"),
  companyNameAr: varchar("company_name_ar").notNull().default("مــرمــر"),
  companyLegalNameEn: varchar("company_legal_name_en").notNull().default("CARS AND BUSES RENTAL LLC"),
  companyLegalNameAr: varchar("company_legal_name_ar").notNull().default("لتأجير الحافلات والسيارات ش.ذ.م.م"),
  taglineEn: varchar("tagline_en").notNull().default("RENT A CAR"),
  taglineAr: varchar("tagline_ar").notNull().default("تأجير السيارات"),
  
  // Contact Information
  phone: varchar("phone").notNull().default("07 222 12 33"),
  phoneAr: varchar("phone_ar").notNull().default("٠٧ ٢٢٢ ١٢ ٣٣"),
  mobile: varchar("mobile").notNull().default("050 50 33 786 / 050 648 24 24"),
  mobileAr: varchar("mobile_ar").notNull().default("٠٥٠ ٥٠ ٣٣ ٧٨٦ / ٠٥٠ ٦٤٨ ٢٤ ٢٤"),
  email: varchar("email").notNull().default("marmarrac@gmail.com"),
  website: varchar("website").notNull().default("www.marmarcars.com"),
  
  // Address
  addressEn: varchar("address_en").notNull().default("P.O. Box : 34088, Al Nakeel, RAK - UAE"),
  addressAr: varchar("address_ar").notNull().default("ص.ب: ٣٤٠٨٨، النخيل، رأس الخيمة - الإمارات"),
  
  // Logo (optional, can be URL or base64)
  logoUrl: varchar("logo_url"),
  
  // Currency and VAT
  currency: varchar("currency", { length: 10 }).notNull().default("AED"),
  vatPercentage: varchar("vat_percentage").notNull().default("5"),
  
  // Terms & Conditions Sections (bilingual)
  termsSection1En: text("terms_section_1_en").notNull().default(""),
  termsSection1Ar: text("terms_section_1_ar").notNull().default(""),
  termsSection2En: text("terms_section_2_en").notNull().default(""),
  termsSection2Ar: text("terms_section_2_ar").notNull().default(""),
  termsSection3En: text("terms_section_3_en").notNull().default(""),
  termsSection3Ar: text("terms_section_3_ar").notNull().default(""),
  
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by").references(() => users.id),
});

export const insertCompanySettingsSchema = createInsertSchema(companySettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;
export type CompanySettings = typeof companySettings.$inferSelect;
