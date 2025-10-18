-- Phase 1-4: Add all new fields to contracts table

-- Make licenseNumber optional (already nullable after schema change)
ALTER TABLE contracts ALTER COLUMN license_number DROP NOT NULL;

-- Update status column comment
COMMENT ON COLUMN contracts.status IS 'draft, confirmed, active, completed, closed';

-- Financial Breakdown fields
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS subtotal VARCHAR;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS vat_amount VARCHAR;

-- Payment Tracking fields  
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS deposit_paid_date TIMESTAMP;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS deposit_paid_method VARCHAR(50);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS deposit_refunded BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS deposit_refunded_date TIMESTAMP;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS final_payment_received BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS final_payment_date TIMESTAMP;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS final_payment_method VARCHAR(50);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'pending';
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS outstanding_balance VARCHAR;

-- Extra Charges fields
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS extra_km_charge VARCHAR;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS extra_km_driven INTEGER;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS fuel_charge VARCHAR;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS damage_charge VARCHAR;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS other_charges VARCHAR;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS total_extra_charges VARCHAR;

-- State Transition Tracking fields
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS confirmed_by VARCHAR;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS activated_by VARCHAR;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS completed_by VARCHAR;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS closed_by VARCHAR;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP;

-- Remove foreign key constraints from audit fields (soft references only)
ALTER TABLE contracts DROP CONSTRAINT IF NOT EXISTS contracts_created_by_users_id_fk;
ALTER TABLE contracts DROP CONSTRAINT IF NOT EXISTS contracts_finalized_by_users_id_fk;
ALTER TABLE contracts DROP CONSTRAINT IF NOT EXISTS contracts_disabled_by_users_id_fk;

-- Remove from users table too
ALTER TABLE users DROP CONSTRAINT IF NOT EXISTS users_disabled_by_users_id_fk;
