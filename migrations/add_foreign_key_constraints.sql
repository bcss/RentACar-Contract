-- Add Foreign Key Constraints for Branch Management and Driver Service
-- Uses DO blocks for idempotent constraint creation

-- ========================================
-- BRANCHES TABLE CONSTRAINTS
-- ========================================

DO $$ BEGIN
  ALTER TABLE branches ADD CONSTRAINT fk_branches_manager FOREIGN KEY (manager_user_id) REFERENCES users(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE branches ADD CONSTRAINT fk_branches_disabled_by FOREIGN KEY (disabled_by) REFERENCES users(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE branches ADD CONSTRAINT fk_branches_created_by FOREIGN KEY (created_by) REFERENCES users(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ========================================
-- BRANCH TRANSFERS TABLE CONSTRAINTS
-- ========================================

DO $$ BEGIN
  ALTER TABLE branch_transfers ADD CONSTRAINT fk_branch_transfers_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE branch_transfers ADD CONSTRAINT fk_branch_transfers_source FOREIGN KEY (source_branch_id) REFERENCES branches(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE branch_transfers ADD CONSTRAINT fk_branch_transfers_destination FOREIGN KEY (destination_branch_id) REFERENCES branches(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE branch_transfers ADD CONSTRAINT fk_branch_transfers_initiated_by FOREIGN KEY (initiated_by) REFERENCES users(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE branch_transfers ADD CONSTRAINT fk_branch_transfers_approved_by FOREIGN KEY (approved_by) REFERENCES users(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ========================================
-- DRIVER OUTSOURCE COMPANIES TABLE CONSTRAINTS
-- ========================================

DO $$ BEGIN
  ALTER TABLE driver_outsource_companies ADD CONSTRAINT fk_driver_companies_disabled_by FOREIGN KEY (disabled_by) REFERENCES users(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE driver_outsource_companies ADD CONSTRAINT fk_driver_companies_created_by FOREIGN KEY (created_by) REFERENCES users(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ========================================
-- DRIVERS TABLE CONSTRAINTS
-- ========================================

DO $$ BEGIN
  ALTER TABLE drivers ADD CONSTRAINT fk_drivers_outsource_company FOREIGN KEY (outsource_company_id) REFERENCES driver_outsource_companies(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE drivers ADD CONSTRAINT fk_drivers_disabled_by FOREIGN KEY (disabled_by) REFERENCES users(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE drivers ADD CONSTRAINT fk_drivers_created_by FOREIGN KEY (created_by) REFERENCES users(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ========================================
-- DRIVER RATE CARDS TABLE CONSTRAINTS
-- ========================================

DO $$ BEGIN
  ALTER TABLE driver_rate_cards ADD CONSTRAINT fk_driver_rates_driver FOREIGN KEY (driver_id) REFERENCES drivers(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE driver_rate_cards ADD CONSTRAINT fk_driver_rates_created_by FOREIGN KEY (created_by) REFERENCES users(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ========================================
-- DRIVER SCHEDULE BLOCKS TABLE CONSTRAINTS
-- ========================================

DO $$ BEGIN
  ALTER TABLE driver_schedule_blocks ADD CONSTRAINT fk_schedule_blocks_driver FOREIGN KEY (driver_id) REFERENCES drivers(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE driver_schedule_blocks ADD CONSTRAINT fk_schedule_blocks_created_by FOREIGN KEY (created_by) REFERENCES users(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ========================================
-- DRIVER ASSIGNMENTS TABLE CONSTRAINTS
-- ========================================

DO $$ BEGIN
  ALTER TABLE driver_assignments ADD CONSTRAINT fk_driver_assignments_contract FOREIGN KEY (contract_id) REFERENCES contracts(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE driver_assignments ADD CONSTRAINT fk_driver_assignments_driver FOREIGN KEY (driver_id) REFERENCES drivers(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE driver_assignments ADD CONSTRAINT fk_driver_assignments_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ========================================
-- PUBLIC HOLIDAYS TABLE CONSTRAINTS
-- ========================================

DO $$ BEGIN
  ALTER TABLE public_holidays ADD CONSTRAINT fk_public_holidays_created_by FOREIGN KEY (created_by) REFERENCES users(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ========================================
-- EXISTING TABLES - BRANCH ID CONSTRAINTS
-- ========================================

DO $$ BEGIN
  ALTER TABLE users ADD CONSTRAINT fk_users_branch FOREIGN KEY (branch_id) REFERENCES branches(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE customers ADD CONSTRAINT fk_customers_branch FOREIGN KEY (branch_id) REFERENCES branches(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE vehicles ADD CONSTRAINT fk_vehicles_branch FOREIGN KEY (branch_id) REFERENCES branches(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE contracts ADD CONSTRAINT fk_contracts_branch FOREIGN KEY (branch_id) REFERENCES branches(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE payments ADD CONSTRAINT fk_payments_branch FOREIGN KEY (branch_id) REFERENCES branches(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
