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
  canAccessReports: boolean("can_access_reports").notNull().default(false), // Access to analytics and reports
  canCloseContracts: boolean("can_close_contracts").notNull().default(false), // Close completed contracts
  canViewAllContracts: boolean("can_view_all_contracts").notNull().default(false), // View all contracts (not just own)
  
  lastPasswordChange: timestamp("last_password_change").defaultNow(),
  lastLoginAt: timestamp("last_login_at"), // Track last successful login for dashboard display
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
  phone: z.string().min(1, "Phone number is required"),
  nationalId: z.string().min(1, "National ID is required"),
  nationality: z.string().min(1, "Nationality is required"),
  licenseNumber: z.string().min(1, "License number is required"),
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
});

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
  earlyClosureReason: text("early_closure_reason"), // Task 11: Optional reason for early completion
  
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
});

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
});

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
    angle: z.enum(['front', 'back', 'left', 'right', 'top', 'dashboard']),
    data: z.string().min(1, "Photo data required"), // base64 encoded image
  }))
    .length(6, "Exactly 6 photos required (front, back, left, right, top, dashboard)")
    .refine((photos) => {
      const angles = photos.map(p => p.angle);
      const uniqueAngles = new Set(angles);
      return uniqueAngles.size === 6;
    }, { message: "All 6 unique photo angles must be provided" })
    .refine((photos) => {
      const requiredAngles: Array<'front' | 'back' | 'left' | 'right' | 'top' | 'dashboard'> = 
        ['front', 'back', 'left', 'right', 'top', 'dashboard'];
      const angles = photos.map(p => p.angle);
      return requiredAngles.every(angle => angles.includes(angle));
    }, { message: "Missing required photo angles" }),
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
});

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
