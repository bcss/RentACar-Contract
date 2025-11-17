-- Add Branch & Driver Service Permissions to Users Table
-- Adds 4 new permission fields for branch management and driver service

ALTER TABLE users
ADD COLUMN IF NOT EXISTS can_manage_all_branches boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS can_manage_drivers boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS can_assign_drivers boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS can_view_driver_costs boolean DEFAULT false NOT NULL;

-- Grant all branch/driver permissions to existing super admin
UPDATE users
SET 
  can_manage_all_branches = true,
  can_manage_drivers = true,
  can_assign_drivers = true,
  can_view_driver_costs = true
WHERE is_immutable = true;
