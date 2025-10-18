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
  disabledBy: varchar("disabled_by").references(() => users.id),
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

// Contracts table
export const contracts = pgTable("contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractNumber: integer("contract_number").notNull().unique(),
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft, finalized
  
  // Customer Information
  customerNameEn: varchar("customer_name_en").notNull(),
  customerNameAr: varchar("customer_name_ar"),
  customerPhone: varchar("customer_phone").notNull(),
  customerEmail: varchar("customer_email"),
  customerAddress: text("customer_address"),
  licenseNumber: varchar("license_number").notNull(),
  
  // Vehicle Information
  vehicleMake: varchar("vehicle_make").notNull(),
  vehicleModel: varchar("vehicle_model").notNull(),
  vehicleYear: varchar("vehicle_year").notNull(),
  vehicleColor: varchar("vehicle_color").notNull(),
  vehiclePlate: varchar("vehicle_plate").notNull(),
  vehicleVin: varchar("vehicle_vin"),
  
  // Rental Details
  rentalStartDate: timestamp("rental_start_date").notNull(),
  rentalEndDate: timestamp("rental_end_date").notNull(),
  pickupLocation: varchar("pickup_location").notNull(),
  dropoffLocation: varchar("dropoff_location").notNull(),
  
  // Pricing
  dailyRate: varchar("daily_rate").notNull(),
  totalDays: integer("total_days").notNull(),
  totalAmount: varchar("total_amount").notNull(),
  deposit: varchar("deposit"),
  
  // Additional Information
  notes: text("notes"),
  termsAccepted: boolean("terms_accepted").notNull().default(false),
  
  // Audit fields
  createdBy: varchar("created_by").notNull().references(() => users.id),
  finalizedBy: varchar("finalized_by").references(() => users.id),
  finalizedAt: timestamp("finalized_at"),
  disabled: boolean("disabled").notNull().default(false), // Disabled contracts are hidden
  disabledBy: varchar("disabled_by").references(() => users.id),
  disabledAt: timestamp("disabled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contractsRelations = relations(contracts, ({ one }) => ({
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
  
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by").references(() => users.id),
});

export const insertCompanySettingsSchema = createInsertSchema(companySettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;
export type CompanySettings = typeof companySettings.$inferSelect;
