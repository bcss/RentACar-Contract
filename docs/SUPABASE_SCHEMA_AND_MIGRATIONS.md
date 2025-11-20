# RCCMS Supabase Schema and Migration Plan

**Document Version:** 1.0  
**Last Updated:** November 20, 2025  
**Purpose:** Complete schema documentation and Supabase migration planning  
**Status:** PLANNING PHASE - Neon → Supabase Migration Roadmap

---

## Executive Summary

This document catalogs the complete RCCMS database schema (63 tables, 40+ specialized modules) and provides a comprehensive migration plan from Neon PostgreSQL to self-hosted Supabase/PostgreSQL. The migration enables advanced security features (Row-Level Security), enhanced backup/restore capabilities, and self-hosted infrastructure control.

### Schema Summary

**Total Tables:** 63  
**Current Database:** Neon PostgreSQL (Serverless)  
**Target Database:** Self-hosted Supabase/PostgreSQL  
**ORM:** Drizzle ORM v0.39.1  
**Migration Tool:** drizzle-kit v0.31.4

**Schema Categories:**
- Core Business (18 tables)
- Operations & Fleet (12 tables)
- Financial & Payments (6 tables)
- Driver Services (8 tables)
- Audit & Compliance (6 tables)
- Toll & Traffic (5 tables)
- Communications & Campaigns (8 tables)

---

## 1. Current Neon Schema Overview

### 1.1 Complete Table Catalog (63 Tables)

**Core Business Entities (18 tables):**
1. `users` - System users with role-based access
2. `customers` - Rental customers (individual/corporate)
3. `vehicles` - Fleet vehicles with status tracking
4. `contracts` - Rental contracts (4-state lifecycle)
5. `payments` - Payment transactions
6. `sponsors` - UAE visa sponsors
7. `companies` - Corporate customers
8. `branches` - Multi-branch operations
9. `sessions` - Express session store
10. `companySignatories` - Authorized company signers
11. `customerCompanyLinks` - Customer-company relationships
12. `vehicleInspections` - Pre/post-rental inspections
13. `damageAssessments` - Vehicle damage records
14. `contractCounter` - Sequential contract numbering (singleton)
15. `companySettings` - Global application settings (singleton)
16. `insuranceClaims` - Insurance claim tracking
17. `renewalRequests` - Contract renewal requests
18. `documentApprovals` - Document approval workflows

**Operations & Fleet Management (12 tables):**
19. `branchTransfers` - Inter-branch vehicle transfers
20. `vehicleServiceRecords` - Maintenance history
21. `vehicleAccessories` - Vehicle equipment/accessories
22. `contractAccessories` - Accessories per contract
23. `rentalRatePlans` - Pricing structures
24. `pricingRules` - Dynamic pricing rules
25. `tollSystems` - UAE toll system definitions
26. `tollGates` - Toll gate locations
27. `tollPasses` - Toll account passes
28. `trafficFines` - Traffic violation tracking
29. `incidents` - Accidents & incidents
30. `documentFiles` - Document attachment storage

**Driver Services (8 tables):**
31. `drivers` - Professional drivers
32. `driverOutsourceCompanies` - Third-party driver companies
33. `driverRateCards` - Driver service pricing
34. `driverScheduleBlocks` - Availability blocks
35. `driverAssignments` - Driver-contract assignments
36. `driverSchedules` - Daily schedules
37. `driverAttendance` - Attendance tracking
38. `publicHolidays` - UAE holiday calendar

**Audit & Compliance (6 tables):**
39. `auditLogs` - System-wide audit trail (lifecycle events)
40. `accessLogs` - User login/access tracking
41. `contractEdits` - Field-level contract change tracking
42. `systemErrors` - Error logging
43. `customerRiskScores` - Risk assessment scores
44. `customerRiskScoreHistory` - Risk score audit trail

**Financial & Payments (6 tables):**
45. `paymentGateways` - Payment processor configs
46. `paymentTransactions` - Online payment records
47. `digitalSignatures` - E-signature tracking
48. `approvalRequests` - Multi-level approval workflows
49. `approvalLogs` - Approval action audit
50. `supportTickets` - Customer support tickets

**Communications & Campaigns (8 tables):**
51. `automatedReminders` - Scheduled notification jobs
52. `notificationPreferences` - User notification settings
53. `notificationTemplates` - Message templates
54. `communicationProviders` - SMS/Email provider configs
55. `communicationLogs` - Sent message tracking
56. `notificationCampaigns` - Campaign management
57. `campaignRecipients` - Campaign delivery tracking
58. `templateAnalytics` - Template performance metrics

**Document & Progress Tracking (5 tables):**
59. `documentRegistry` - Document expiry tracking
60. `pushNotificationTokens` - Mobile push tokens
61. `claimProgressUpdates` - Insurance claim updates
62. `abTestVariants` - A/B testing configurations
63. `notificationChannelPreferences` - Channel-specific preferences

---

### 1.2 Schema Architecture Patterns

**Singleton Tables** (Single-Row Configuration):
- `contractCounter` - Global contract number sequence
- `companySettings` - Application-wide settings

**Audit Trail Pattern** (Dual-Layer):
- `auditLogs` - Lifecycle events (create, activate, complete, close)
- `contractEdits` - Field-level changes with before/after snapshots

**Multi-Tenancy Pattern** (Branch Isolation):
- Most tables include `branchId` for multi-branch data separation
- Contracts, customers, vehicles scoped to branches
- Future RLS policies will enforce branch-level access

**Disable-Only Architecture**:
- No hard deletes (all tables have `disabled` column)
- Soft delete preserves audit trail and data integrity
- Recovery possible by setting `disabled = false`

**Status-Driven Workflows**:
- `contracts.status`: draft → active → completed → closed
- `vehicles.status`: available, rented, maintenance, out_of_service
- `approvalRequests.status`: pending → approved/rejected

---

### 1.3 Drizzle Schema Configuration

**File:** `shared/schema.ts`  
**Tables:** 63 PostgreSQL tables  
**Relations:** 100+ foreign key relationships  
**Indexes:** 200+ performance indexes

**Key Features:**
- Type-safe schema definitions
- Automatic TypeScript type generation
- Zod validation schemas (`createInsertSchema`)
- Foreign key constraints with cascade rules
- JSONB columns for flexible data (`contractEdits.fieldsBefore/After`)
- UUID primary keys for distributed systems

**Example Table Structure:**
```typescript
export const contracts = pgTable("contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractNumber: integer("contract_number").notNull(),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  branchId: varchar("branch_id").notNull().references(() => branches.id),
  status: varchar("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  disabled: boolean("disabled").default(false),
});
```

---

## 2. Migration Plan: Neon → Supabase

### 2.1 Migration Overview

**Current State:** Neon PostgreSQL (Serverless)  
**Target State:** Self-hosted Supabase/PostgreSQL  
**Timeline:** Q1-Q2 2026  
**Downtime:** Planned maintenance window (< 2 hours)

**Migration Benefits:**
- ✅ Row-Level Security (RLS) for branch isolation
- ✅ Self-hosted infrastructure control
- ✅ Advanced backup/restore capabilities
- ✅ Realtime subscriptions (future feature)
- ✅ Built-in auth system (optional migration)
- ✅ Storage buckets for file uploads

---

### 2.2 Migration Strategy

**Approach:** Parallel Migration (Zero Downtime)

**Phase 1: Pre-Migration (Weeks 1-2)**
1. ✅ Export current Neon schema (this document)
2. ✅ Document all environment variables
3. ⏳ Set up self-hosted Supabase instance
4. ⏳ Test Supabase environment (dev/staging)
5. ⏳ Create RLS policies (see SUPABASE_RLS_POLICIES.md)
6. ⏳ Configure backup automation

**Phase 2: Schema Migration (Week 3)**
1. ⏳ Push Drizzle schema to Supabase (dev)
2. ⏳ Verify all tables created correctly
3. ⏳ Test foreign key constraints
4. ⏳ Verify indexes created
5. ⏳ Apply RLS policies
6. ⏳ Test RLS policy enforcement

**Phase 3: Data Migration (Week 4)**
1. ⏳ Create data export script (pg_dump)
2. ⏳ Export Neon database to SQL file
3. ⏳ Import to Supabase (staging)
4. ⏳ Verify data integrity (row counts, checksums)
5. ⏳ Test application against Supabase (staging)
6. ⏳ Performance testing

**Phase 4: Production Cutover (Week 5)**
1. ⏳ Schedule maintenance window
2. ⏳ Final data export from Neon
3. ⏳ Import to Supabase (production)
4. ⏳ Update DATABASE_URL environment variable
5. ⏳ Restart application
6. ⏳ Verify all functionality
7. ⏳ Monitor for issues
8. ⏳ Keep Neon as backup for 30 days

---

### 2.3 Migration Commands

#### Export Neon Schema (SQL)
```bash
# SAFE: Export schema using pg_dump (READ-ONLY operation)
pg_dump $DATABASE_URL --schema-only --no-owner --no-acl > schema.sql

# Export full backup (schema + data)
pg_dump $DATABASE_URL --no-owner --no-acl > full_backup.sql

# Alternative: Use Drizzle Kit introspection (READ-ONLY)
npx drizzle-kit introspect:pg --connectionString=$DATABASE_URL --out=./migrations
```

#### Import to Supabase (PRODUCTION - SAFE METHOD ONLY)
```bash
# Set Supabase DATABASE_URL environment variable
export DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres

# SAFE: Import vetted schema SQL file (recommended for production)
psql $DATABASE_URL < schema.sql

# SAFE: Import data SQL file
psql $DATABASE_URL < full_backup.sql

# ALTERNATIVE FOR STAGING/DEV ONLY:
# Use Drizzle Kit ONLY in isolated staging environment with backups
# export DATABASE_URL=<staging-db-url>
# npm run db:push  # Use with caution - applies local schema changes
```

#### Verify Migration
```bash
# Row count comparison
psql $DATABASE_URL -c "SELECT 'customers' as table, COUNT(*) FROM customers UNION ALL SELECT 'contracts', COUNT(*) FROM contracts;"

psql $SUPABASE_DB_URL -c "SELECT 'customers' as table, COUNT(*) FROM customers UNION ALL SELECT 'contracts', COUNT(*) FROM contracts;"

# Schema verification
psql $SUPABASE_DB_URL -c "\dt"  # List all tables
psql $SUPABASE_DB_URL -c "\d contracts"  # Describe contracts table
```

---

### 2.4 Environment Variable Changes

**Update Required:**
```bash
# Old (Neon)
DATABASE_URL=postgresql://user@ep-xxx.us-east-1.aws.neon.tech/rccms

# New (Supabase)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Optional (if using Supabase Auth)
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1...
```

**No Code Changes Required:**
- Application uses `DATABASE_URL` via Drizzle ORM
- Connection pooling handled by Drizzle
- No Supabase client SDK required (using raw PostgreSQL)

---

## 3. Schema Export

### 3.1 Generate Schema SQL

**Using Drizzle Kit (SAFE READ-ONLY OPERATIONS):**
```bash
# SAFE: Introspect current database and generate SQL (READ-ONLY)
npx drizzle-kit introspect:pg --out=./migrations --connectionString=$DATABASE_URL

# SAFE: Generate migration from schema.ts (local only, no DB writes)
npx drizzle-kit generate:pg --out=./migrations --schema=./shared/schema.ts

# PRODUCTION: Use generated SQL files with psql (recommended)
psql $NEW_DB_URL < ./migrations/schema.sql

# STAGING/DEV ONLY: Direct schema push (DANGEROUS - use with backups)
# npx drizzle-kit push:pg --schema=./shared/schema.ts --connectionString=$STAGING_DB_URL
```

**Using pg_dump:**
```bash
# Full schema export
pg_dump $DATABASE_URL \
  --schema-only \
  --no-owner \
  --no-acl \
  --no-tablespaces \
  --no-security-labels \
  --no-comments \
  > rccms_schema.sql

# Data-only export (for migration)
pg_dump $DATABASE_URL \
  --data-only \
  --no-owner \
  --no-acl \
  --column-inserts \
  > rccms_data.sql

# Full backup (schema + data)
pg_dump $DATABASE_URL \
  --no-owner \
  --no-acl \
  > rccms_full_backup_$(date +%Y%m%d).sql
```

---

### 3.2 Schema SQL File Structure

**Expected Output: `rccms_schema.sql`**

```sql
-- PostgreSQL database dump
-- Dumped from database version 15.x
-- Dumped by pg_dump version 15.x

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';

-- Table: sessions
CREATE TABLE sessions (
    sid varchar NOT NULL PRIMARY KEY,
    sess json NOT NULL,
    expire timestamp(6) NOT NULL
);
CREATE INDEX "IDX_session_expire" ON sessions (expire);

-- Table: users
CREATE TABLE users (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    username varchar NOT NULL UNIQUE,
    password varchar NOT NULL,
    role varchar NOT NULL DEFAULT 'viewer',
    branch_id varchar,
    created_at timestamp DEFAULT now(),
    disabled boolean DEFAULT false
);

-- ... (61 more tables)

-- Foreign Keys
ALTER TABLE contracts 
    ADD CONSTRAINT contracts_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES customers(id);

-- ... (100+ foreign key constraints)

-- Indexes
CREATE INDEX idx_contracts_customer_id ON contracts(customer_id);
CREATE INDEX idx_contracts_vehicle_id ON contracts(vehicle_id);
CREATE INDEX idx_contracts_status ON contracts(status);
-- ... (200+ indexes)
```

---

## 4. Data Integrity Verification

### 4.1 Pre-Migration Checks

**Row Count Baseline:**
```sql
-- Create row count report
SELECT 
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

**Foreign Key Validation:**
```sql
-- Find orphaned records (should be zero)
SELECT 'contracts' as table_name, COUNT(*) as orphans
FROM contracts c
LEFT JOIN customers cu ON c.customer_id = cu.id
WHERE cu.id IS NULL

UNION ALL

SELECT 'payments', COUNT(*)
FROM payments p
LEFT JOIN contracts c ON p.contract_id = c.id
WHERE c.id IS NULL;
```

**Data Type Verification:**
```sql
-- Verify ID column types (should all be varchar with UUID default)
SELECT 
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE column_name = 'id' AND table_schema = 'public'
ORDER BY table_name;
```

---

### 4.2 Post-Migration Verification

**Row Count Comparison:**
```bash
# Export row counts from Neon
psql $NEON_URL -c "COPY (SELECT tablename, n_live_tup FROM pg_stat_user_tables ORDER BY tablename) TO STDOUT CSV" > neon_counts.csv

# Export row counts from Supabase
psql $SUPABASE_URL -c "COPY (SELECT tablename, n_live_tup FROM pg_stat_user_tables ORDER BY tablename) TO STDOUT CSV" > supabase_counts.csv

# Compare
diff neon_counts.csv supabase_counts.csv
```

**Data Checksums:**
```sql
-- Create checksum for critical tables
SELECT 
  'customers' as table_name,
  COUNT(*) as row_count,
  MD5(STRING_AGG(id::text, ',' ORDER BY id)) as id_checksum
FROM customers

UNION ALL

SELECT 
  'contracts',
  COUNT(*),
  MD5(STRING_AGG(id::text, ',' ORDER BY id))
FROM contracts;
```

**Foreign Key Integrity:**
```sql
-- Verify all foreign keys exist and are valid
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
```

---

## 5. Rollback Plan

### 5.1 Immediate Rollback (< 1 Hour)

**If Migration Fails:**
```bash
# Revert DATABASE_URL to Neon
export DATABASE_URL=postgresql://...neon.tech/rccms

# Restart application
npm restart

# Verify application connects to Neon
psql $DATABASE_URL -c "SELECT version();"
```

**Success Criteria:**
- Application starts without errors
- Users can access system
- Data is current (no data loss)

---

### 5.2 Recovery from Backup (> 1 Hour)

**If Supabase Data Corrupted:**
```bash
# Restore from most recent Neon backup
pg_restore -d $SUPABASE_URL --clean --no-owner neon_backup_20260115.sql

# Verify restoration
psql $SUPABASE_URL -c "SELECT COUNT(*) FROM customers;"

# Update application
npm restart
```

---

## 6. Supabase-Specific Features

### 6.1 Row-Level Security (RLS)

**Enable RLS on All Tables:**
```sql
-- Enable RLS for multi-branch isolation
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
-- ... (repeat for all 63 tables)
```

**Note:** Complete RLS policy definitions will be documented in `SUPABASE_RLS_POLICIES.md` (to be created in Phase 1 of migration)

---

### 6.2 Realtime Subscriptions (Future Feature)

**Enable Realtime for Tables:**
```sql
-- Enable realtime for contract updates
ALTER PUBLICATION supabase_realtime ADD TABLE contracts;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
```

**Frontend Subscription Example:**
```typescript
// Future: Subscribe to contract updates
const { data, error } = await supabase
  .from('contracts')
  .select('*')
  .eq('status', 'active')
  .subscribe();
```

---

### 6.3 Storage Buckets (Future Feature)

**File Upload Storage:**
```sql
-- Create bucket for document uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('contract-documents', 'contract-documents', false);

-- Set bucket policy
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'contract-documents');
```

---

## 7. Performance Optimization

### 7.1 Connection Pooling

**Supabase Connection Pool:**
```typescript
// Update Drizzle connection pool settings
import { Pool } from '@neondatabase/serverless';

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20,           // Maximum pool size
  idleTimeout: 30000,  // 30 seconds
  connectionTimeout: 10000, // 10 seconds
});
```

---

### 7.2 Index Optimization

**Verify Critical Indexes:**
```sql
-- Check missing indexes (should be none)
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
ORDER BY n_distinct DESC;

-- Add missing indexes if identified
CREATE INDEX idx_contracts_created_at ON contracts(created_at);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
```

---

## 8. Backup & Restore

### 8.1 Automated Backups

**Supabase Native Backups:**
- Daily automated backups (retained for 30 days)
- Point-in-time recovery (PITR) available
- Backup scheduling via Supabase dashboard

**Custom Backup Script:**
```bash
#!/bin/bash
# backup.sh - Daily PostgreSQL backup

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/rccms"
DB_URL="$DATABASE_URL"

# Full backup
pg_dump $DB_URL --no-owner --no-acl > "$BACKUP_DIR/rccms_$DATE.sql"

# Compress
gzip "$BACKUP_DIR/rccms_$DATE.sql"

# Upload to S3 (optional)
aws s3 cp "$BACKUP_DIR/rccms_$DATE.sql.gz" s3://rccms-backups/

# Retain last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

**Cron Schedule:**
```bash
# Daily backup at 2 AM
0 2 * * * /scripts/backup.sh
```

---

### 8.2 Restore Procedures

**Full Restore:**
```bash
# Decompress backup
gunzip rccms_20260115.sql.gz

# Restore to Supabase
psql $DATABASE_URL < rccms_20260115.sql

# Verify
psql $DATABASE_URL -c "SELECT COUNT(*) FROM contracts;"
```

**Point-in-Time Recovery:**
```bash
# Via Supabase dashboard
1. Navigate to Database → Backups
2. Select backup timestamp
3. Click "Restore"
4. Confirm restoration
```

**Selective Restore (Single Table):**
```bash
# Extract single table from backup
pg_restore -d $DATABASE_URL --table=contracts rccms_backup.sql
```

---

## 9. Testing Checklist

### 9.1 Pre-Migration Testing

**Development Environment:**
- [ ] Supabase instance created
- [ ] DATABASE_URL updated to Supabase (dev)
- [ ] Schema pushed successfully
- [ ] Sample data imported
- [ ] Application connects successfully
- [ ] All CRUD operations work
- [ ] RLS policies tested
- [ ] Performance benchmarked

**Staging Environment:**
- [ ] Full data migration completed
- [ ] Row counts match Neon
- [ ] Foreign key constraints verified
- [ ] Indexes created correctly
- [ ] RLS policies enforced
- [ ] End-to-end testing passed
- [ ] Load testing completed
- [ ] Backup/restore tested

---

### 9.2 Production Migration Checklist

**Pre-Cutover:**
- [ ] Maintenance window scheduled
- [ ] Users notified
- [ ] Final Neon backup created
- [ ] Rollback plan documented
- [ ] Team on standby

**During Cutover:**
- [ ] Application stopped
- [ ] Final Neon data export
- [ ] Import to Supabase production
- [ ] Row counts verified
- [ ] DATABASE_URL updated
- [ ] Application restarted
- [ ] Smoke tests passed

**Post-Cutover:**
- [ ] All functionality verified
- [ ] Performance monitored
- [ ] Error logs checked
- [ ] User acceptance testing
- [ ] Neon kept as backup (30 days)
- [ ] Team notified of success

---

## 10. Cost Analysis

### 10.1 Neon vs. Supabase Comparison

**Neon (Current):**
- Serverless PostgreSQL
- Pay-per-use scaling
- ~$50-100/month (estimated)
- Limited backup retention
- No RLS
- No built-in auth

**Supabase (Target):**
- Self-hosted PostgreSQL
- Fixed infrastructure cost
- ~$25-75/month (estimated, self-hosted)
- Custom backup retention
- Built-in RLS
- Built-in auth, storage, realtime

**Migration Cost:**
- Development time: 2-3 weeks
- Testing time: 1 week
- Downtime: < 2 hours
- Risk mitigation: Keep Neon active for 30 days (~$50)

**Total Migration Investment:** ~$200-500 (one-time cost)

---

## 11. Risk Assessment

### 11.1 Migration Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Data loss during migration | LOW | CRITICAL | Multiple backups, verification checksums |
| Downtime exceeds window | MEDIUM | HIGH | Parallel migration, rollback plan |
| Foreign key conflicts | LOW | HIGH | Pre-migration validation scripts |
| Performance degradation | MEDIUM | MEDIUM | Load testing, connection pool tuning |
| RLS policy errors | MEDIUM | HIGH | Extensive testing in dev/staging |

---

## 12. Success Criteria

**Migration Considered Successful When:**
- ✅ All 63 tables migrated with correct row counts
- ✅ All foreign key constraints intact
- ✅ All indexes created and optimized
- ✅ Application functionality 100% operational
- ✅ RLS policies enforced correctly
- ✅ Performance meets or exceeds Neon baseline
- ✅ Backup/restore procedures tested and documented
- ✅ Zero data loss
- ✅ Downtime < 2 hours
- ✅ Team trained on Supabase operations

---

## 13. Timeline

**Estimated Timeline:** 5 weeks

| Week | Phase | Activities |
|------|-------|-----------|
| 1-2 | Pre-Migration | Setup Supabase, export schema, create RLS policies |
| 3 | Schema Migration | Push schema to dev/staging, test RLS |
| 4 | Data Migration | Export Neon data, import to staging, verify |
| 5 | Production Cutover | Final migration, verify, monitor |

---

## Changelog

### Version 1.0 (November 20, 2025)
- Initial schema documentation (63 tables cataloged)
- Migration plan created (Neon → Supabase)
- Export procedures documented
- Data integrity verification scripts provided
- Rollback plan established
- Testing checklist created
- Cost analysis completed

---

**Document Status:** ✅ PLANNING PHASE  
**Next Steps:** 
1. Create SUPABASE_RLS_POLICIES.md (Row-Level Security policies)
2. Set up Supabase development instance
3. Export Neon schema to SQL file
4. Begin dev/staging testing

**Prepared By:** RCCMS Architecture Team  
**Last Verified:** November 20, 2025

---

**Related Documents:**
- `SUPABASE_RLS_POLICIES.md` - Row-Level Security policy definitions
- `SUPABASE_BACKUP_RESTORE.md` - Backup/restore procedures
- `ENVIRONMENT_VARIABLES_CATALOG.md` - Environment configuration
- `shared/schema.ts` - Drizzle ORM schema source of truth
