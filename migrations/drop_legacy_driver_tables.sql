-- Migration: Drop Legacy Driver Tables
-- Purpose: Clean up deprecated driver tables replaced by Master Spec compliant schema
-- Date: November 27, 2025
-- 
-- BACKGROUND:
--   - driver_rate_cards and driver_assignments were superseded by:
--     - driverRatePlans (Master Spec §4.10.2)
--     - contractDrivers (Master Spec §4.10.3)
--   - Both legacy tables contain 0 records (verified)
--   - Table definitions removed from shared/schema.ts
--
-- EXECUTION:
--   Run this migration AFTER initial database setup to align with Master Spec

-- Drop legacy indexes first
DROP INDEX IF EXISTS idx_driver_rates_driver;
DROP INDEX IF EXISTS idx_driver_rates_active;
DROP INDEX IF EXISTS idx_driver_rates_effective;
DROP INDEX IF EXISTS idx_driver_assignments_contract;
DROP INDEX IF EXISTS idx_driver_assignments_driver;
DROP INDEX IF EXISTS idx_driver_assignments_status;
DROP INDEX IF EXISTS idx_driver_assignments_start;
DROP INDEX IF EXISTS idx_driver_assignments_end;

-- Drop legacy foreign key constraints
ALTER TABLE IF EXISTS driver_rate_cards DROP CONSTRAINT IF EXISTS fk_driver_rates_driver;
ALTER TABLE IF EXISTS driver_rate_cards DROP CONSTRAINT IF EXISTS fk_driver_rates_created_by;
ALTER TABLE IF EXISTS driver_assignments DROP CONSTRAINT IF EXISTS fk_driver_assignments_contract;
ALTER TABLE IF EXISTS driver_assignments DROP CONSTRAINT IF EXISTS fk_driver_assignments_driver;
ALTER TABLE IF EXISTS driver_assignments DROP CONSTRAINT IF EXISTS fk_driver_assignments_assigned_by;

-- Drop legacy tables
DROP TABLE IF EXISTS driver_rate_cards CASCADE;
DROP TABLE IF EXISTS driver_assignments CASCADE;

-- Verification: These tables should no longer exist
-- SELECT table_name FROM information_schema.tables WHERE table_name IN ('driver_rate_cards', 'driver_assignments');
