-- Delta Migration: Add Branch Management and Driver Service entities
-- Created: 2025-11-17
-- Adds: 8 new tables + branchId columns to 5 existing tables

-- ========================================
-- NEW TABLES
-- ========================================

-- Branches table
CREATE TABLE IF NOT EXISTS "branches" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "branch_code" varchar NOT NULL UNIQUE,
        "name_en" varchar NOT NULL,
        "name_ar" varchar,
        "emirate" "emirate" NOT NULL,
        "address_en" text NOT NULL,
        "address_ar" text,
        "phone" varchar NOT NULL,
        "email" varchar,
        "manager_user_id" varchar,
        "is_headquarters" boolean DEFAULT false NOT NULL,
        "opening_hours" jsonb,
        "notes" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "disabled" boolean DEFAULT false NOT NULL,
        "disabled_by" varchar,
        "disabled_at" timestamp,
        "created_by" varchar NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
);

-- Branch Transfers table
CREATE TABLE IF NOT EXISTS "branch_transfers" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "vehicle_id" varchar NOT NULL,
        "source_branch_id" varchar NOT NULL,
        "destination_branch_id" varchar NOT NULL,
        "transfer_date" timestamp NOT NULL,
        "reason" text,
        "status" varchar(20) DEFAULT 'pending' NOT NULL,
        "approved_by" varchar,
        "approved_at" timestamp,
        "rejected_reason" text,
        "completed_at" timestamp,
        "notes" text,
        "initiated_by" varchar NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
);

-- Driver Outsource Companies table
CREATE TABLE IF NOT EXISTS "driver_outsource_companies" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name_en" varchar NOT NULL,
        "name_ar" varchar,
        "contact_person" varchar,
        "phone" varchar NOT NULL,
        "email" varchar,
        "address" text,
        "contract_number" varchar,
        "contract_start_date" timestamp,
        "contract_end_date" timestamp,
        "notes" text,
        "disabled" boolean DEFAULT false NOT NULL,
        "disabled_by" varchar,
        "disabled_at" timestamp,
        "created_by" varchar NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
);

-- Drivers table
CREATE TABLE IF NOT EXISTS "drivers" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "driver_code" varchar NOT NULL UNIQUE,
        "name_en" varchar NOT NULL,
        "name_ar" varchar,
        "mobile" varchar NOT NULL,
        "email" varchar,
        "nationality" varchar NOT NULL,
        "license_number" varchar NOT NULL,
        "license_class" varchar NOT NULL,
        "license_expiry" timestamp NOT NULL,
        "languages_spoken" text[],
        "employment_type" varchar(20) NOT NULL,
        "outsource_company_id" varchar,
        "cost_rate" varchar,
        "availability" varchar(20) DEFAULT 'available' NOT NULL,
        "emirates_id_front" text,
        "license_copy" text,
        "notes" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "disabled" boolean DEFAULT false NOT NULL,
        "disabled_by" varchar,
        "disabled_at" timestamp,
        "created_by" varchar NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
);

-- Driver Rate Cards table
CREATE TABLE IF NOT EXISTS "driver_rate_cards" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "driver_id" varchar NOT NULL,
        "rate_type" varchar(20) NOT NULL,
        "base_rate" varchar NOT NULL,
        "effective_from" timestamp NOT NULL,
        "effective_to" timestamp,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_by" varchar NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
);

-- Driver Schedule Blocks table
CREATE TABLE IF NOT EXISTS "driver_schedule_blocks" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "driver_id" varchar NOT NULL,
        "start_date_time" timestamp NOT NULL,
        "end_date_time" timestamp NOT NULL,
        "block_type" varchar(20) NOT NULL,
        "reason" text,
        "created_by" varchar NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
);

-- Driver Assignments table
CREATE TABLE IF NOT EXISTS "driver_assignments" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "contract_id" varchar NOT NULL,
        "driver_id" varchar NOT NULL,
        "start_date_time" timestamp NOT NULL,
        "end_date_time" timestamp NOT NULL,
        "service_type" varchar(20) NOT NULL,
        "base_rate" varchar NOT NULL,
        "quantity" varchar NOT NULL,
        "surcharge_breakdown" jsonb,
        "total_surcharges" varchar DEFAULT '0' NOT NULL,
        "total_charge" varchar NOT NULL,
        "status" varchar(20) DEFAULT 'scheduled' NOT NULL,
        "handover_notes" text,
        "handover_notes_ar" text,
        "completion_notes" text,
        "handover_date_time" timestamp,
        "completion_date_time" timestamp,
        "assigned_by" varchar NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
);

-- Public Holidays table
CREATE TABLE IF NOT EXISTS "public_holidays" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name_en" varchar NOT NULL,
        "name_ar" varchar,
        "holiday_date" timestamp NOT NULL,
        "is_recurring" boolean DEFAULT false NOT NULL,
        "recurrence_type" varchar(20),
        "surcharge_rate" varchar,
        "notes" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_by" varchar NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
);

-- ========================================
-- ALTER EXISTING TABLES - Add branchId
-- ========================================

-- Add branch_id to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS branch_id varchar;

-- Add branch_id to customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS branch_id varchar;

-- Add branch_id to vehicles
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS branch_id varchar;

-- Add branch_id to contracts
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS branch_id varchar;

-- Add branch_id to payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS branch_id varchar;

-- ========================================
-- INDEXES
-- ========================================

-- Branches indexes
CREATE INDEX IF NOT EXISTS idx_branches_code ON branches(branch_code);
CREATE INDEX IF NOT EXISTS idx_branches_emirate ON branches(emirate);
CREATE INDEX IF NOT EXISTS idx_branches_active ON branches(is_active);
CREATE INDEX IF NOT EXISTS idx_branches_disabled ON branches(disabled);
CREATE INDEX IF NOT EXISTS idx_branches_created_at ON branches(created_at);

-- Drivers indexes
CREATE INDEX IF NOT EXISTS idx_drivers_code ON drivers(driver_code);
CREATE INDEX IF NOT EXISTS idx_drivers_availability ON drivers(availability);
CREATE INDEX IF NOT EXISTS idx_drivers_employment_type ON drivers(employment_type);
CREATE INDEX IF NOT EXISTS idx_drivers_active ON drivers(is_active);
CREATE INDEX IF NOT EXISTS idx_drivers_disabled ON drivers(disabled);
CREATE INDEX IF NOT EXISTS idx_drivers_created_at ON drivers(created_at);

-- Driver Rate Cards indexes
CREATE INDEX IF NOT EXISTS idx_driver_rates_driver ON driver_rate_cards(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_rates_active ON driver_rate_cards(is_active);
CREATE INDEX IF NOT EXISTS idx_driver_rates_effective ON driver_rate_cards(effective_from);

-- Driver Schedule Blocks indexes
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_driver ON driver_schedule_blocks(driver_id);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_start ON driver_schedule_blocks(start_date_time);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_end ON driver_schedule_blocks(end_date_time);

-- Driver Assignments indexes
CREATE INDEX IF NOT EXISTS idx_driver_assignments_contract ON driver_assignments(contract_id);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_driver ON driver_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_status ON driver_assignments(status);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_start ON driver_assignments(start_date_time);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_end ON driver_assignments(end_date_time);

-- Public Holidays indexes
CREATE INDEX IF NOT EXISTS idx_public_holidays_date ON public_holidays(holiday_date);
CREATE INDEX IF NOT EXISTS idx_public_holidays_active ON public_holidays(is_active);

-- Driver Outsource Companies indexes
CREATE INDEX IF NOT EXISTS idx_outsource_companies_disabled ON driver_outsource_companies(disabled);
CREATE INDEX IF NOT EXISTS idx_outsource_companies_created_at ON driver_outsource_companies(created_at);

-- Branch-related indexes on existing tables
CREATE INDEX IF NOT EXISTS idx_users_branch ON users(branch_id);
CREATE INDEX IF NOT EXISTS idx_customers_branch ON customers(branch_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_branch ON vehicles(branch_id);
CREATE INDEX IF NOT EXISTS idx_contracts_branch ON contracts(branch_id);
CREATE INDEX IF NOT EXISTS idx_payments_branch ON payments(branch_id);

-- ========================================
-- FOREIGN KEY CONSTRAINTS
-- ========================================
-- NOTE: Foreign key constraints are defined in a separate migration file
-- (add_foreign_key_constraints.sql) using PostgreSQL DO blocks for idempotency.
-- This separation ensures clean migration execution on fresh databases.
