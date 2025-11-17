-- Data Migration: Create Headquarters Branch and Backfill Existing Records
-- This script assigns all existing records to a default "Headquarters" branch

-- Step 1: Create Headquarters Branch (if doesn't exist)
DO $$ 
DECLARE
  hq_branch_id varchar;
  super_admin_id varchar;
BEGIN
  -- Get the super admin user (immutable admin)
  SELECT id INTO super_admin_id FROM users WHERE is_immutable = true LIMIT 1;
  
  -- Create Headquarters branch if it doesn't exist
  INSERT INTO branches (
    id,
    branch_code,
    name_en,
    name_ar,
    emirate,
    address_en,
    address_ar,
    phone,
    email,
    is_headquarters,
    is_active,
    created_by,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    'HQ001',
    'Headquarters',
    'المقر الرئيسي',
    'dubai',
    'Main Office - Dubai',
    'المكتب الرئيسي - دبي',
    '+971-4-XXXXXXX',
    'hq@company.com',
    true,
    true,
    super_admin_id,
    NOW(),
    NOW()
  )
  ON CONFLICT (branch_code) DO NOTHING
  RETURNING id INTO hq_branch_id;
  
  -- If branch already exists, get its ID
  IF hq_branch_id IS NULL THEN
    SELECT id INTO hq_branch_id FROM branches WHERE branch_code = 'HQ001';
  END IF;
  
  -- Step 2: Update all users with null branch_id
  UPDATE users
  SET branch_id = hq_branch_id,
      updated_at = NOW()
  WHERE branch_id IS NULL;
  
  -- Step 3: Update all customers with null branch_id
  UPDATE customers
  SET branch_id = hq_branch_id,
      updated_at = NOW()
  WHERE branch_id IS NULL;
  
  -- Step 4: Update all vehicles with null branch_id
  UPDATE vehicles
  SET branch_id = hq_branch_id,
      updated_at = NOW()
  WHERE branch_id IS NULL;
  
  -- Step 5: Update all contracts with null branch_id
  UPDATE contracts
  SET branch_id = hq_branch_id,
      updated_at = NOW()
  WHERE branch_id IS NULL;
  
  -- Step 6: Update all payments with null branch_id
  UPDATE payments
  SET branch_id = hq_branch_id,
      updated_at = NOW()
  WHERE branch_id IS NULL;
  
  -- Report results
  RAISE NOTICE 'Headquarters branch created/verified: %', hq_branch_id;
  RAISE NOTICE 'Data migration complete!';
  
END $$;

-- Verification queries
SELECT 
  'Users' as entity,
  COUNT(*) as total,
  COUNT(branch_id) as with_branch,
  COUNT(*) - COUNT(branch_id) as without_branch
FROM users
UNION ALL
SELECT 
  'Customers',
  COUNT(*),
  COUNT(branch_id),
  COUNT(*) - COUNT(branch_id)
FROM customers
UNION ALL
SELECT 
  'Vehicles',
  COUNT(*),
  COUNT(branch_id),
  COUNT(*) - COUNT(branch_id)
FROM vehicles
UNION ALL
SELECT 
  'Contracts',
  COUNT(*),
  COUNT(branch_id),
  COUNT(*) - COUNT(branch_id)
FROM contracts
UNION ALL
SELECT 
  'Payments',
  COUNT(*),
  COUNT(branch_id),
  COUNT(*) - COUNT(branch_id)
FROM payments;
