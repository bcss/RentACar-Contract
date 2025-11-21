# Maintenance Guide
## RCCMS - Rental Car Contract Management System

**Version 1.0** | **For System Administrators & Technical Staff**

---

## Table of Contents

1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Database Management](#database-management)
4. [Backup & Recovery](#backup--recovery)
5. [Performance Monitoring](#performance-monitoring)
6. [Troubleshooting](#troubleshooting)
7. [Security Maintenance](#security-maintenance)
8. [Update & Upgrade Procedures](#update--upgrade-procedures)
9. [Legal Documentation Maintenance](#legal-documentation-maintenance)
10. [Common Issues & Solutions](#common-issues--solutions)

---

## Introduction

### Purpose
This guide provides technical information for maintaining, troubleshooting, and optimizing the RCCMS Rental Car Contract Management System in production environments.

### Target Audience
- System Administrators
- DevOps Engineers
- Database Administrators
- IT Support Staff
- Technical Consultants

### Prerequisites
- Linux server administration knowledge
- PostgreSQL database experience
- Node.js application understanding
- Network and security basics
- Command line proficiency

### Authoritative Documentation

This guide should be read in conjunction with:
- **replit.md** - Authoritative source for system architecture, user preferences, and technical decisions
- **MASTER_FEATURE_LIST.md** - Comprehensive feature inventory (15 tables, 100+ endpoints, 22 pages)
- **PROJECT_ANALYSIS.md** - Complete system analysis including recent bug fixes and prevention strategies

For any discrepancies, replit.md and MASTER_FEATURE_LIST.md take precedence.

### Recent Bug Fixes & Maintenance Notes

#### November 21, 2025 - P1 Critical Fixes & CSRF Verification

**TypeScript LSP Errors Fixed (server/routes/contractRoutes.ts):**

Three critical type errors discovered and resolved in contract creation endpoint:

**Fix #1: Driver Assignments Method Name**
- **Issue**: Calling non-existent `getDriverAssignmentsByContract()` method
- **Fix**: Corrected to `getDriverAssignments({ contractId: contract.id })`
- **Impact**: Driver costs now calculated correctly in contract details endpoint
- **Location**: Line 182

**Fix #2: VAT Field Schema Mismatch**
- **Issue**: Code tried to store `vatRate` field which doesn't exist in contracts schema
- **Fix**: Removed `vatRate` storage, VAT now fetched dynamically from `companySettings.vatPercentage` table
- **Impact**: VAT calculations now centralized and admin-configurable
- **Location**: Lines 306-316

**Fix #3: Financial Calculation Consistency**
- **Issue**: Inconsistent outstanding balance formulas across POST/GET/report endpoints
- **Fix**: Standardized formula: `(totalAmount + totalExtraCharges + totalDriverCharges) - securityDeposit - totalPaid`
- **Impact**: Financial reports now show accurate outstanding balances across all views
- **Additional Fix**: Contract creation now honors `totalExtraCharges` from request body (was hard-coded to 0)
- **Locations**: Lines 316, 319, 324-325, 333

**CSRF Protection Verification:**
- **User Concern**: Claimed "CSRF is completely missing" in system
- **Verification**: Confirmed CSRF fully implemented with:
  - Endpoint `/api/csrf-token` active at multiple routes
  - Global middleware `csrfProtection` enforcing double-submit cookie pattern
  - 9 comprehensive integration tests in `tests/integration/csrf.integration.test.ts`
  - Timing-safe comparison preventing side-channel attacks
- **Status**: User concern invalid - CSRF protection fully operational

**Prevention Strategies:**
1. Run `npm run typecheck` before all commits to catch LSP errors
2. Cross-reference all schema field access with `shared/schema.ts`
3. Standardize financial formulas in centralized utility (future enhancement)
4. Execute integration test suites after any contract/financial endpoint changes

**No Database Migrations Required:**
All fixes were code-only changes. Full backward compatibility maintained.

---

#### October 27, 2025 - Schema Mismatch Bugs

**Schema Mismatch Bugs Resolved:**

During comprehensive documentation review, systematic codebase analysis uncovered 4 hidden data contract violations that existed since initial development:

**Bug #1: Payment Method Field Access (server/storage.ts)**
- **Issue**: Code accessed `payment.method` but schema defines `payment.paymentMethod`
- **Fix**: Corrected property access in 2 locations (lines 1307, 1334)
- **Impact**: Financial reports now show accurate payment method breakdowns
- **Detection**: Manual schema comparison vs business logic code review

**Bug #2: Missing i18n Translation Keys (client/src/lib/i18n.ts)**
- **Issue**: 16+ audit log actions lacked English/Arabic translations
- **Fix**: Added 26 translation keys for all lifecycle and master data operations
- **Impact**: Audit logs now fully bilingual for compliance
- **Detection**: Frontend code review revealed untranslated action keys

**Bug #3: ContractEdits Property Access (server/storage.ts)**
- **Issue**: Code accessed non-existent `m.fieldName` property
- **Fix**: Removed incorrect field breakdown logic (schema uses JSONB snapshots)
- **Impact**: Prevented runtime errors in audit report endpoint
- **Detection**: LSP diagnostics + schema cross-reference

**Bug #4: Undefined Variable Reference (server/storage.ts)**
- **Issue**: Return statement referenced undefined `userActivity` variable
- **Fix**: Implemented userActivity calculation from modification counts
- **Impact**: Audit report endpoint now returns complete data
- **Detection**: LSP diagnostics flagged undefined variable

**Prevention Strategies Implemented:**
1. TypeScript strict mode enforcement for database access
2. LSP diagnostics review before commits
3. Schema validation checklist for code reviews
4. Integration testing for report endpoints

**Maintenance Implications:**
- Always cross-reference property access with `shared/schema.ts`
- Run LSP diagnostics (`npm run typecheck`) before deployments
- Test reports with real data patterns, not just happy paths
- Document all field mappings between frontend and backend

**No Database Migrations Required:**
All fixes were code-only changes in application layer. No schema modifications or data migrations needed. Full backward compatibility maintained.

### Dashboard Bilingual Enhancements (October 30, 2025)

**UI/UX Improvements:**

Complete i18n integration for Dashboard user-facing elements to eliminate any remaining hard-coded English strings:

**Enhancement #1: Time-Ago Translation Support**
- **Implementation**: Refactored `getTimeAgo()` helper in `client/src/utils/timeGreeting.ts`
- **Change**: Returns `{key: string, count?: number}` structure instead of hard-coded strings
- **Impact**: Last login timestamps now properly bilingual ("2 hours ago"/"منذ ساعتين")
- **Files Modified**: `client/src/utils/timeGreeting.ts`, `client/src/pages/Dashboard.tsx`

**Enhancement #2: System Errors Banner i18n**
- **Implementation**: Converted hard-coded error banner text to translation keys
- **Change**: Uses `t('systemErrors.unacknowledgedCount')` and `t('systemErrors.clickToView')`
- **Impact**: Error notifications now fully bilingual with proper pluralization
- **Files Modified**: `client/src/pages/Dashboard.tsx`, `client/src/lib/i18n.ts`

**Enhancement #3: Translation Keys Added**
- **English**: timeAgo.* (7 keys), systemErrors.* (2 keys), greeting.lastLogin
- **Arabic**: Corresponding translations with proper pluralization
- **Impact**: Complete bilingual coverage for all Dashboard UI elements

**Enhancement #4: React Component Fixes**
- **Issue**: React ref warnings in SidebarMenuButton component
- **Fix**: Converted to `React.forwardRef()` pattern
- **Change**: Created ref-forwarding Link wrapper for Radix UI compatibility
- **Impact**: Clean console output, production-ready React patterns
- **Files Modified**: `client/src/components/ui/sidebar.tsx`, `client/src/components/AppSidebar.tsx`

**Maintenance Implications:**
- No database changes required
- No API changes required
- Fully backward compatible
- Automatic language switching works seamlessly
- Professional bilingual experience for all users

---

## System Architecture

### Technology Stack

**Frontend:**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter
- **State Management**: TanStack Query v5
- **Styling**: Tailwind CSS, Shadcn/UI components
- **UI Pattern**: Microsoft 365 Admin-style sidebar with icon-only controls
- **Internationalization**: i18next
- **Form Validation**: React Hook Form + Zod

**Backend:**
- **Runtime**: Node.js v18+ / v20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: Passport.js (passport-local strategy)
- **ORM**: Drizzle ORM
- **Session Store**: PostgreSQL (connect-pg-simple)
- **Password Hashing**: Bcrypt

**Database:**
- **Engine**: PostgreSQL v14+
- **Hosting Options**: Self-hosted, Neon, AWS RDS, etc.
- **Connection**: @neondatabase/serverless driver
- **Migrations**: Drizzle Kit

**Infrastructure:**
- **Process Manager**: PM2 (recommended)
- **Reverse Proxy**: Nginx (recommended)
- **SSL/TLS**: Let's Encrypt
- **Deployment**: VPS or Docker

### Application Structure

```
project-root/
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── components/      # Reusable UI components (AppSidebar.tsx - Microsoft 365-style)
│   │   ├── pages/           # Page components
│   │   ├── lib/             # Utilities and helpers
│   │   └── hooks/           # Custom React hooks
│   └── index.html
├── server/                  # Backend Express application
│   ├── routes.ts            # API routes
│   ├── storage.ts           # Data access layer
│   ├── auth/                # Authentication logic
│   ├── services/            # Business logic services
│   └── index.ts             # Server entry point
├── shared/                  # Shared code
│   └── schema.ts            # Database schema (Drizzle)
├── db/                      # Database directory
├── .env                     # Environment variables
└── package.json
```

### Environment Variables

**Required:**
```bash
# Database Connection
DATABASE_URL=postgresql://user:password@host:port/database

# Session Secret (CRITICAL - must be cryptographically random)
SESSION_SECRET=your-super-secret-random-string-min-32-chars

# PostgreSQL Connection Details (auto-extracted from DATABASE_URL)
PGHOST=hostname
PGUSER=username
PGPASSWORD=password
PGDATABASE=database_name
PGPORT=5432
```

**Optional:**
```bash
# Server Configuration
PORT=5000                    # Application port (default: 5000)
NODE_ENV=production          # Environment (production|development)

# Session Configuration
SESSION_MAX_AGE=604800000    # 7 days in milliseconds
SESSION_NAME=rccms.sid      # Session cookie name

# Security
TRUST_PROXY=true             # Enable if behind reverse proxy
```

---

## Database Management

### Database Schema

**Core Tables:**

1. **users** - System users
2. **customers** - Customer master data
3. **vehicles** - Vehicle master data (includes tankCapacity, fuelType for automatic fuel calculations)
4. **sponsors** - Individual sponsor master data
5. **companies** - Company sponsor master data
6. **contracts** - Rental contracts
7. **payments** - Payment history
8. **audit_logs** - System audit trail (includes ALL master data updates)
9. **contract_edits** - Field-level contract changes with before/after snapshots
10. **system_errors** - Application errors
11. **contract_counter** - Auto-increment for contract numbers
12. **company_settings** - Global company configuration (includes 11 financial defaults)
13. **sessions** - User sessions (managed by connect-pg-simple)

**New Fields Added:**

**vehicles table:**
- `tankCapacity` (numeric) - Fuel tank size in liters for automatic fuel charge calculation
- `fuelType` (text) - "petrol" or "diesel" to match correct fuel price

**company_settings table (Financial Settings):**
- `defaultDailyRate` (numeric) - Default daily rental rate
- `defaultWeeklyRate` (numeric) - Default weekly rental rate
- `defaultMonthlyRate` (numeric) - Default monthly rental rate
- `insurancePerDay` (numeric) - Insurance cost per day
- `gpsPerDay` (numeric) - GPS rental per day
- `babySeatPerDay` (numeric) - Baby seat rental per day
- `additionalDriverFee` (numeric) - One-time additional driver fee
- `defaultExtraKmRate` (numeric) - Charge per extra kilometer
- `defaultSecurityDeposit` (numeric) - Default security deposit amount
- `petrolPricePerLiter` (numeric) - Current petrol price per liter
- `dieselPricePerLiter` (numeric) - Current diesel price per liter

### Schema Initialization

**First Deployment:**
```bash
# Push schema to database
npm run db:push

# Or with force (if conflicts)
npm run db:push --force
```

**Generate Migrations (Advanced):**
```bash
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate
```

### Database Connections

**Connection Pooling:**
- Uses `@neondatabase/serverless` driver
- Automatic connection pooling
- Supports WebSocket connections (for Neon)
- Handles connection retries

**Connection Limits:**
- Default PostgreSQL: 100 concurrent connections
- Neon Free Tier: Limited connections
- Configure based on load

**Testing Connection:**
```bash
# Using psql
psql "$DATABASE_URL"

# Test query
SELECT current_database(), current_user, version();
```

### Database Maintenance

**Vacuum Database:**
```sql
-- Analyze all tables
VACUUM ANALYZE;

-- Full vacuum (locks tables)
VACUUM FULL;
```

**Update Statistics:**
```sql
ANALYZE;
```

**Check Database Size:**
```sql
SELECT 
  pg_database.datname,
  pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE datname = current_database();
```

**Table Sizes:**
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY bytes DESC;
```

**Index Health:**
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

### Data Cleanup

**Old Sessions:**
```sql
-- Delete expired sessions (older than 30 days)
DELETE FROM sessions 
WHERE expire < NOW() - INTERVAL '30 days';
```

**Audit Log Retention:**

**Complete Audit Coverage:**
The system now logs ALL data modifications including:
- User authentication events (login, logout, password changes)
- Contract lifecycle events (create, confirm, activate, complete, close)
- Payment transactions (all payment records)
- **Master data updates** (customers, vehicles, sponsors, companies, users)
- **Field-level changes** (before/after values in contract_edits table)

**Query Audit Logs:**
```sql
-- View master data updates
SELECT 
  action,
  entity_type,
  entity_id,
  user_name,
  details,
  ip_address,
  created_at
FROM audit_logs
WHERE action = 'update'
AND entity_type IN ('customer', 'vehicle', 'sponsor', 'company', 'user')
ORDER BY created_at DESC
LIMIT 100;

-- View contract edits with field-level changes
SELECT 
  ce.contract_id,
  ce.edited_by,
  ce.edit_reason,
  ce.changes_made,
  ce.created_at,
  al.ip_address,
  al.country
FROM contract_edits ce
LEFT JOIN audit_logs al ON ce.contract_id::text = al.entity_id
WHERE al.action = 'edit_contract'
ORDER BY ce.created_at DESC;
```

**Archive and Retention:**
```sql
-- Archive audit logs older than 1 year
-- (Recommend export before deletion)

-- View old logs count
SELECT COUNT(*) FROM audit_logs 
WHERE created_at < NOW() - INTERVAL '1 year';

-- Delete (after backup!)
DELETE FROM audit_logs 
WHERE created_at < NOW() - INTERVAL '1 year';
```

**System Errors Cleanup:**
```sql
-- Delete acknowledged errors older than 90 days
DELETE FROM system_errors 
WHERE acknowledged = true 
AND acknowledged_at < NOW() - INTERVAL '90 days';
```

### Vehicle Inspection Photo Storage

**Overview:**
RCCMS implements a two-stage vehicle inspection workflow (pre-delivery and post-return) with mandatory photo documentation. Photos are stored as base64-encoded JSONB data in PostgreSQL.

**Storage Architecture:**

**Table Structure:**
```sql
CREATE TABLE vehicle_inspections (
  id SERIAL PRIMARY KEY,
  contract_id INTEGER NOT NULL REFERENCES contracts(id),
  inspection_type VARCHAR(20) NOT NULL, -- 'pre_delivery' or 'post_return'
  inspector_name VARCHAR(255) NOT NULL,
  odometer_reading INTEGER NOT NULL,
  fuel_level INTEGER NOT NULL,
  condition_notes TEXT,
  photos JSONB NOT NULL, -- Array of {angle, data} objects
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id)
);
```

**Photo Format:**
```json
{
  "photos": [
    {"angle": "front", "data": "data:image/jpeg;base64,/9j/4AAQ..."},
    {"angle": "back", "data": "data:image/jpeg;base64,/9j/4AAQ..."},
    {"angle": "left", "data": "data:image/jpeg;base64,/9j/4AAQ..."},
    {"angle": "right", "data": "data:image/jpeg;base64,/9j/4AAQ..."},
    {"angle": "top", "data": "data:image/jpeg;base64,/9j/4AAQ..."},
    {"angle": "dashboard", "data": "data:image/jpeg;base64,/9j/4AAQ..."}
  ]
}
```

**Photo Compression:**
- All photos automatically compressed to 1920x1080 resolution
- JPEG format at 0.85 quality
- Average compressed photo size: ~800KB - 1MB
- Total per inspection: ~6MB (6 photos)

**Storage Estimates:**

| Contracts | Inspections | Storage Required |
|-----------|-------------|------------------|
| 100       | 200         | ~1.2 GB          |
| 500       | 1,000       | ~6 GB            |
| 1,000     | 2,000       | ~12 GB           |
| 5,000     | 10,000      | ~60 GB           |

**Monitor Photo Storage:**
```sql
-- Check total inspection photo storage
SELECT 
  COUNT(*) as total_inspections,
  pg_size_pretty(SUM(pg_column_size(photos))) as photos_storage_size,
  pg_size_pretty(pg_total_relation_size('vehicle_inspections')) as total_table_size
FROM vehicle_inspections;

-- Check by inspection type
SELECT 
  inspection_type,
  COUNT(*) as count,
  pg_size_pretty(SUM(pg_column_size(photos))) as photos_size
FROM vehicle_inspections
GROUP BY inspection_type;

-- Find largest inspection records
SELECT 
  id,
  contract_id,
  inspection_type,
  pg_size_pretty(pg_column_size(photos)) as photo_size,
  jsonb_array_length(photos) as photo_count,
  created_at
FROM vehicle_inspections
ORDER BY pg_column_size(photos) DESC
LIMIT 20;
```

**Photo Validation Queries:**
```sql
-- Verify all inspections have 6 photos
SELECT 
  id,
  contract_id,
  inspection_type,
  jsonb_array_length(photos) as photo_count
FROM vehicle_inspections
WHERE jsonb_array_length(photos) != 6;

-- Check for missing photo angles
SELECT 
  id,
  contract_id,
  inspection_type,
  jsonb_agg(photo->>'angle') as angles
FROM vehicle_inspections,
  jsonb_array_elements(photos) as photo
GROUP BY id, contract_id, inspection_type
HAVING jsonb_agg(photo->>'angle') != 
  '["front", "back", "left", "right", "top", "dashboard"]'::jsonb;
```

**Performance Optimization:**

**Index on Contract ID:**
```sql
CREATE INDEX idx_inspections_contract 
ON vehicle_inspections(contract_id);

CREATE INDEX idx_inspections_type 
ON vehicle_inspections(inspection_type);
```

**JSONB Indexing (if needed for search):**
```sql
-- GIN index for photo angle searches
CREATE INDEX idx_inspections_photos_gin 
ON vehicle_inspections USING GIN (photos);
```

**Storage Maintenance:**

**Vacuum JSONB Data:**
```sql
-- Regular vacuum to reclaim space
VACUUM ANALYZE vehicle_inspections;

-- Check bloat
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - 
                 pg_relation_size(schemaname||'.'||tablename)) AS external_size
FROM pg_tables
WHERE tablename = 'vehicle_inspections';
```

**Migration to Object Storage:**

When database size exceeds 50GB or you hit ~5,000 active contracts, consider migrating to object storage:

**Recommended Services:**
- AWS S3
- Cloudflare R2 (cheaper egress)
- Digital Ocean Spaces
- Backblaze B2

**Migration Strategy:**
1. Set up object storage bucket
2. Create new `photo_url` column in `vehicle_inspections`
3. Write migration script to:
   - Extract base64 photos from JSONB
   - Upload to object storage
   - Store URLs in `photo_url` column
   - Remove base64 data from `photos` column
4. Update application code to fetch from URLs
5. Test thoroughly before removing JSONB data
6. Archive JSONB backup before final cleanup

**Example Migration Script (Pseudo-code):**
```typescript
// migration-to-s3.ts
async function migratePhotosToS3() {
  const inspections = await db.select().from(vehicleInspections);
  
  for (const inspection of inspections) {
    const photoUrls = [];
    
    for (const photo of inspection.photos) {
      // Extract base64 data
      const buffer = Buffer.from(photo.data.split(',')[1], 'base64');
      
      // Upload to S3
      const key = `inspections/${inspection.id}/${photo.angle}.jpg`;
      await s3.upload(bucket, key, buffer);
      
      photoUrls.push({
        angle: photo.angle,
        url: `https://cdn.example.com/${key}`
      });
    }
    
    // Update record with URLs
    await db.update(vehicleInspections)
      .set({ photo_urls: photoUrls })
      .where(eq(vehicleInspections.id, inspection.id));
  }
}
```

**Backup Considerations:**

⚠️ **CRITICAL**: Inspection photos are legal evidence and MUST be included in backups

**Verify Photo Data in Backups:**
```bash
# Test restore and verify photo data
pg_restore -d test_database backup.dump
psql test_database -c "SELECT COUNT(*), 
  pg_size_pretty(SUM(pg_column_size(photos))) 
  FROM vehicle_inspections;"
```

**Photo Retention Policy:**
- **Minimum**: Keep inspection photos for duration of contract + 2 years
- **Recommended**: Keep indefinitely for legal protection
- **Never delete** without legal counsel approval
- Archive old photos to cold storage if needed

**Troubleshooting Photo Issues:**

**Problem: Database size growing too fast**
- Solution: Check photo compression settings
- Verify compression is working (photos should be ~1MB each)
- Consider migration to object storage

**Problem: Slow query performance on inspections table**
- Solution: Add indexes on contract_id and inspection_type
- Run VACUUM ANALYZE regularly
- Consider partitioning table by year

**Problem: Backup restoration very slow**
- Solution: Large JSONB data takes time to restore
- Test restoration process regularly
- Consider incremental backups
- Plan migration to object storage

**Problem: Photo data corrupted**
- Solution: Verify base64 encoding
- Check for truncated data
- Ensure backups are valid
- Implement photo validation on upload

---

## Backup & Recovery

### Backup Strategy

**Recommended Schedule:**
- **Full Backup**: Daily at 2 AM (low traffic)
- **Incremental**: Every 6 hours
- **Retention**: 30 days minimum
- **Off-site Copy**: Weekly to remote storage

### PostgreSQL Backup

**Full Database Backup:**
```bash
#!/bin/bash
# backup-database.sh

BACKUP_DIR="/var/backups/rccms"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/rccms_backup_$DATE.sql.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup with compression
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"

# Verify backup
if [ -f "$BACKUP_FILE" ]; then
    echo "Backup successful: $BACKUP_FILE"
    echo "Size: $(du -h $BACKUP_FILE | cut -f1)"
else
    echo "Backup failed!"
    exit 1
fi

# Delete backups older than 30 days
find $BACKUP_DIR -name "rccms_backup_*.sql.gz" -mtime +30 -delete

echo "Old backups cleaned up"
```

**Make Script Executable:**
```bash
chmod +x backup-database.sh
```

**Schedule with Cron:**
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup-database.sh >> /var/log/rccms-backup.log 2>&1
```

**Specific Tables Backup:**
```bash
# Backup only contracts and payments
pg_dump "$DATABASE_URL" \
  -t contracts \
  -t payments \
  -t customers \
  -t vehicles \
  | gzip > contracts_backup.sql.gz
```

### Restore Procedures

**Full Database Restore:**
```bash
# Extract and restore
gunzip -c rccms_backup_20250121_020000.sql.gz | psql "$DATABASE_URL"
```

**Restore Specific Tables:**
```bash
# Drop existing table (WARNING: data loss)
psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS contracts CASCADE;"

# Restore from backup
gunzip -c backup.sql.gz | psql "$DATABASE_URL"
```

**Point-in-Time Recovery (if WAL enabled):**
```bash
# Requires PostgreSQL WAL archiving configured
# Contact DBA for PITR setup
```

### Backup Verification

**Test Restore Monthly:**
```bash
#!/bin/bash
# test-restore.sh

# Create test database
createdb test_restore

# Restore latest backup
gunzip -c /var/backups/rccms/latest.sql.gz | psql test_restore

# Run verification queries
psql test_restore -c "SELECT COUNT(*) FROM contracts;"
psql test_restore -c "SELECT COUNT(*) FROM customers;"
psql test_restore -c "SELECT COUNT(*) FROM vehicles;"

# Cleanup
dropdb test_restore

echo "Restore test completed successfully"
```

### Application Data Backup

**Environment Variables:**
```bash
# Backup .env file (encrypt if contains secrets)
cp .env .env.backup.$(date +%Y%m%d)

# Encrypt backup
gpg --symmetric --cipher-algo AES256 .env.backup.20250121
```

**Uploaded Files (if any):**
```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /path/to/uploads/
```

---

## Performance Monitoring

### Application Monitoring

**PM2 Monitoring:**
```bash
# View process status
pm2 status

# Monitor CPU and memory
pm2 monit

# View logs
pm2 logs rccms-app

# Application metrics
pm2 describe rccms-app
```

**Node.js Process Health:**
```bash
# Check memory usage
ps aux | grep node

# Monitor in real-time
top -p $(pgrep -f "node.*server")
```

### Database Performance

**Active Connections:**
```sql
SELECT 
  count(*),
  state,
  wait_event_type
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state, wait_event_type;
```

**Slow Queries:**
```sql
-- Enable slow query logging
ALTER DATABASE rccms_db SET log_min_duration_statement = 1000; -- 1 second

-- View current queries
SELECT 
  pid,
  usename,
  application_name,
  client_addr,
  state,
  query_start,
  state_change,
  query
FROM pg_stat_activity
WHERE state != 'idle'
AND query_start < now() - interval '5 seconds'
ORDER BY query_start;
```

**Query Statistics:**
```sql
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;
```

**Cache Hit Ratio:**
```sql
SELECT 
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit)  as heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM pg_statio_user_tables;
```

### Server Resource Monitoring

**Disk Space:**
```bash
# Check disk usage
df -h

# Database directory size
du -sh /var/lib/postgresql/data

# Application directory
du -sh /opt/rccms-app
```

**Memory Usage:**
```bash
# System memory
free -h

# PostgreSQL memory
ps aux | grep postgres | awk '{sum+=$6} END {print sum/1024 " MB"}'
```

**CPU Usage:**
```bash
# Top CPU consumers
top -bn1 | head -20

# PostgreSQL CPU
ps aux | grep postgres | awk '{print $3}' | paste -sd+ | bc
```

**Network:**
```bash
# Active connections to port 5000
netstat -an | grep :5000 | wc -l

# PostgreSQL connections
netstat -an | grep :5432 | wc -l
```

### Performance Optimization

**Frontend Performance (December 2025):**

The application features advanced lazy loading for optimal performance:

**Monitoring Frontend Performance:**
```bash
# Check initial bundle size
ls -lh dist/assets/index-*.js

# Verify lazy chunks are generated
ls -lh dist/assets/*.js | grep -v index

# Expected: Main bundle ~50KB, lazy chunks for each page
```

**Performance Metrics to Track:**
- Initial bundle size: Should be ~50KB (down from ~744KB)
- Time to Interactive (TTI): Should be 1-2 seconds
- Page transition times: Should show professional loading spinner
- Browser cache hits: Previously visited pages load instantly

**Performance Validation:**
1. Clear browser cache
2. Navigate to application
3. Check browser DevTools → Network tab
4. Verify initial JavaScript < 60KB
5. Navigate to dashboard - confirm separate chunk loads
6. Return to dashboard - confirm loads from cache

**Database Indexes:**
```sql
-- Ensure critical indexes exist

-- Contracts by status
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

-- Contracts by dates
CREATE INDEX IF NOT EXISTS idx_contracts_dates ON contracts(start_date, end_date);

-- Audit logs by user and date
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_date ON audit_logs(user_id, created_at);

-- Payments by contract
CREATE INDEX IF NOT EXISTS idx_payments_contract ON payments(contract_id);
```

**Query Optimization:**
```sql
-- Analyze query plan
EXPLAIN ANALYZE
SELECT * FROM contracts 
WHERE status = 'active' 
AND start_date >= CURRENT_DATE - INTERVAL '30 days';
```

**Connection Pooling:**
```typescript
// In production, consider using pg-pool
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // Maximum connections
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Connection timeout
});
```

---

## Troubleshooting

### Application Won't Start

**Check Logs:**
```bash
# PM2 logs
pm2 logs rccms-app --lines 100

# System logs
journalctl -u rccms-app -n 100 --no-pager
```

**Common Causes:**

**1. Port Already in Use**
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm start
```

**2. Database Connection Failed**
```bash
# Test database connectivity
psql "$DATABASE_URL"

# Check DATABASE_URL format
echo $DATABASE_URL

# Verify PostgreSQL is running
sudo systemctl status postgresql
```

**3. Missing Environment Variables**
```bash
# Check .env file exists
ls -la .env

# Verify required variables
grep -E "DATABASE_URL|SESSION_SECRET" .env

# Check environment
env | grep -E "DATABASE_URL|SESSION_SECRET"
```

**4. Node Modules Missing**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**5. Build Errors**
```bash
# Clean build
rm -rf dist client/dist

# Rebuild
npm run build
```

### Users Cannot Log In

**Check User Account:**
```sql
-- Verify user exists and is not disabled
SELECT id, username, email, role, disabled 
FROM users 
WHERE username = 'target_username';
```

**Reset Password:**
```sql
-- Generate new bcrypt hash (use Node.js)
-- bcrypt.hashSync('newpassword123', 10)

UPDATE users 
SET password = '$2b$10$...' 
WHERE username = 'username';
```

**Session Issues:**
```sql
-- Clear user sessions
DELETE FROM sessions WHERE sess::text LIKE '%"userId":"USER_ID"%';

-- Clear all sessions (force all users to re-login)
TRUNCATE sessions;
```

**Check Session Store:**
```bash
# Verify sessions table exists
psql "$DATABASE_URL" -c "\dt sessions"

# Check session count
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM sessions;"
```

### Performance Degradation

**Database Locks:**
```sql
-- Check for locks
SELECT 
  pg_stat_activity.pid,
  pg_stat_activity.query,
  pg_locks.mode,
  pg_locks.granted
FROM pg_stat_activity
JOIN pg_locks ON pg_stat_activity.pid = pg_locks.pid
WHERE NOT pg_locks.granted;
```

**Long-Running Queries:**
```sql
-- Kill long-running query
SELECT pg_cancel_backend(pid);

-- Force terminate
SELECT pg_terminate_backend(pid);
```

**Memory Issues:**
```bash
# Restart application
pm2 restart rccms-app

# Check memory leaks
pm2 monit
```

**Disk Space Full:**
```bash
# Free up space
sudo apt clean
sudo journalctl --vacuum-time=7d

# Remove old backups
find /var/backups/rccms -mtime +30 -delete

# Analyze disk usage
du -sh /* | sort -rh | head -20
```

### PDF Generation Failures

**Check System Errors:**
```sql
SELECT * FROM system_errors 
WHERE error_message LIKE '%PDF%' 
OR endpoint LIKE '%print%'
ORDER BY created_at DESC 
LIMIT 10;
```

**Verify Dependencies:**
```bash
# Ensure all packages installed
npm install

# Check for PDF library issues
npm list | grep -i pdf
```

**Memory Issues:**
```bash
# PDF generation can be memory-intensive
# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=2048" pm2 restart rccms-app
```

### Geolocation Service Failures

**Check Service Status:**
```bash
# Test API directly
curl "http://ip-api.com/json/8.8.8.8"

# Check rate limits
curl -H "X-RateLimit-Limit" "http://ip-api.com/json/"
```

**Rate Limit Exceeded:**
- Free tier: 45 requests/minute
- Solution: Implement caching or upgrade plan
- Audit logs will still save (location fields nullable)

**Service Timeout:**
- Default timeout: 3 seconds
- Increase in `server/services/geolocation.ts` if needed
- Or disable geolocation to improve performance

---

## Security Maintenance

### Security Checklist

**Monthly:**
- [ ] Review user accounts and disable inactive
- [ ] Audit administrator access logs
- [ ] Check for failed login attempts
- [ ] Review system error logs
- [ ] Update SSL certificates (if expiring)

**Quarterly:**
- [ ] Force password changes for admin accounts
- [ ] Review and update firewall rules
- [ ] Security audit of audit logs
- [ ] Update dependencies (`npm audit`)
- [ ] Review and rotate SESSION_SECRET

**Annually:**
- [ ] Full security assessment
- [ ] Penetration testing
- [ ] Review and update security policies
- [ ] Disaster recovery drill

### Monitoring Failed Logins

```sql
-- Check failed login attempts
SELECT 
  details,
  ip_address,
  country,
  city,
  user_agent,
  created_at
FROM audit_logs
WHERE action = 'login'
AND details LIKE '%failed%'
AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Session Management

**Force Logout All Users:**
```sql
TRUNCATE sessions;
```

**Force Logout Specific User:**
```sql
DELETE FROM sessions 
WHERE sess::text LIKE '%"userId":"<user-id>"%';
```

**Session Monitoring:**
```sql
-- Active sessions
SELECT 
  sid,
  sess,
  expire
FROM sessions
WHERE expire > NOW()
ORDER BY expire DESC;
```

### SSL/TLS Certificate Renewal

**Let's Encrypt (Certbot):**
```bash
# Renew certificates
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run

# Auto-renewal (should already be configured)
sudo systemctl status certbot.timer
```

**Manual Certificate Update:**
```bash
# Update nginx configuration
sudo nano /etc/nginx/sites-available/rccms-app

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Dependency Security

**Check Vulnerabilities:**
```bash
# Audit dependencies
npm audit

# Fix automatically
npm audit fix

# Force fix (may break compatibility)
npm audit fix --force
```

**Update Dependencies:**
```bash
# Update minor/patch versions
npm update

# Update major versions (carefully!)
npm install <package>@latest

# After updates, test thoroughly
npm test
npm run build
```

---

## Update & Upgrade Procedures

### Application Updates

**Pre-Update Checklist:**
1. [ ] Backup database
2. [ ] Backup application files
3. [ ] Backup .env file
4. [ ] Note current version
5. [ ] Read changelog/release notes
6. [ ] Schedule maintenance window
7. [ ] Notify users

**Update Process:**
```bash
# 1. Backup
./backup-database.sh
cp -r /opt/rccms-app /opt/rccms-app.backup.$(date +%Y%m%d)

# 2. Pull latest code
cd /opt/rccms-app
git pull origin main

# 3. Install dependencies
npm install

# 4. Run database migrations (if any)
npm run db:push

# 5. Build application
npm run build

# 6. Restart application
pm2 restart rccms-app

# 7. Verify
pm2 logs rccms-app --lines 50
curl http://localhost:5000/api/health

# 8. Monitor
pm2 monit
```

**Rollback Procedure:**
```bash
# Stop application
pm2 stop rccms-app

# Restore application files
rm -rf /opt/rccms-app
cp -r /opt/rccms-app.backup.20250121 /opt/rccms-app

# Restore database (if schema changed)
gunzip -c /var/backups/rccms/latest.sql.gz | psql "$DATABASE_URL"

# Restart
pm2 start rccms-app

# Verify
pm2 logs rccms-app
```

### PostgreSQL Upgrades

**Minor Version Updates:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt upgrade postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

**Major Version Upgrades:**
- Requires careful planning
- Use pg_upgrade utility
- Test in staging environment first
- Consult PostgreSQL documentation

### Node.js Upgrades

**Using NVM:**
```bash
# Install new version
nvm install 20

# Use new version
nvm use 20

# Set as default
nvm alias default 20

# Rebuild application
npm install
npm run build

# Test
npm start
```

**System-Wide:**
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

---

## Legal Documentation Maintenance

### Overview

The RCCMS system includes comprehensive legal documentation accessible to all users through dedicated pages for Privacy Policy and Terms of Service. These documents are critical for regulatory compliance, user transparency, and legal protection. This section provides maintenance procedures for keeping these documents current, accurate, and compliant with evolving regulations and system features.

**File Locations:**
- Privacy Policy: `client/src/pages/PrivacyPolicyPage.tsx`
- Terms of Service: `client/src/pages/TermsOfServicePage.tsx`

**Current Version Date:** December 2025

### Document Structure & Architecture

Both legal documents follow a consistent architectural pattern designed for maintainability and user experience. Each document is structured using Shadcn/UI's Accordion component system, which allows for organized, collapsible sections that improve readability while maintaining comprehensive coverage.

**Privacy Policy Structure:**
The Privacy Policy page contains 13 major sections including Introduction, Information Collection (with sub-accordions for Personal Information, Customer & Business Data, Contract & Financial Data, and Vehicle & Inspection Data), How We Use Information, Data Security, Data Retention, User Rights (with sub-accordions for access, correction, deletion, and data portability rights), Cookies & Tracking, Data Sharing, International Transfers, Children's Privacy, GDPR Compliance, Policy Updates, and Contact information. The accordion-based design allows users to expand only the sections relevant to their inquiry while maintaining full disclosure compliance.

**Terms of Service Structure:**
The Terms of Service page includes 14 comprehensive sections covering Acceptance of Terms, System License and Usage Rights (with sub-accordions for License Grant, Usage Restrictions, and Scope of Use), User Accounts, User Responsibilities, Data Accuracy, System Availability, Prohibited Activities, Intellectual Property, Limitation of Liability, Legal Compliance, Termination, Dispute Resolution, Modifications, and Contact information. Each section uses AccordionItem components with descriptive AccordionTrigger elements for easy navigation.

**Technical Implementation:**
Both pages implement a sticky table of contents (TOC) on desktop layouts, scroll-spy functionality to highlight the active section, smooth scrolling to sections on TOC click, and responsive design that adapts for mobile devices. The pages use Material Design 3 icons from lucide-react, follow the application's bilingual design patterns (though currently English-only for legal precision), and maintain consistent styling with the rest of the RCCMS interface.

### Annual Review Schedule

Legal documentation must be reviewed annually to ensure ongoing compliance with regulations, accuracy regarding system features, and alignment with industry best practices. The annual review cycle ensures proactive maintenance rather than reactive updates during regulatory audits or user complaints.

**Recommended Review Schedule:**

**Q1 (January-March):** Conduct comprehensive annual review of both Privacy Policy and Terms of Service. This timing aligns with New Year regulatory updates in many jurisdictions and allows implementation of any required changes before the busy rental season. Review should include verification of data collection practices against actual system implementation, confirmation that all new features from the previous year are reflected in documentation, assessment of regulatory changes (GDPR, CCPA, local privacy laws), and benchmarking against industry standards and competitor policies.

**Q2 (April-June):** Mid-year compliance check focusing on any new features deployed in Q1-Q2. Verify that vehicle inspection photo storage practices match Privacy Policy disclosures, confirm payment processing descriptions remain accurate, and review audit logging practices against stated retention policies. This is also the time to verify that bilingual consistency is maintained if Arabic translations are added.

**Q3 (July-September):** Review of system availability and service level expectations in Terms of Service. Assess whether stated system availability metrics match actual uptime, review any incidents or service disruptions from H1 and determine if policy updates are needed, and verify that support contact information remains current and responsive.

**Q4 (October-December):** Year-end review and preparation for upcoming annual cycle. Document all changes made throughout the year in audit logs, schedule legal review for Q1 of following year, prepare summary of policy changes for stakeholder review, and verify version dating is accurate across all legal pages.

### Compliance Update Triggers

Beyond annual reviews, certain events should trigger immediate review and potential updates to legal documentation. These triggers ensure the system remains compliant as regulations evolve and features change.

**Regulatory Triggers:**

**New Privacy Regulations:** When new data protection laws are enacted or existing laws are amended (e.g., changes to GDPR enforcement guidelines, new state privacy laws in jurisdictions where customers operate, or industry-specific regulations affecting car rental businesses), legal documentation must be reviewed within 30 days of the regulation taking effect. Common regulatory changes affecting rental car systems include data retention requirements, right-to-deletion procedures, cross-border data transfer rules, and consent management for marketing communications.

**Data Breach or Security Incident:** If the system experiences a security incident, even if no data was compromised, the Privacy Policy's Data Security section and incident response procedures must be reviewed to ensure accuracy. The Audit Logs section should be updated to reflect any enhanced monitoring implemented post-incident.

**Legal Action or Complaint:** If the organization receives legal complaints, regulatory inquiries, or customer disputes citing the Privacy Policy or Terms of Service, immediate review is required to identify gaps, ambiguities, or inaccuracies that may have contributed to the issue.

**Feature Change Triggers:**

**New Data Collection:** Any feature that collects new types of personal data requires immediate Privacy Policy updates. Examples include adding biometric data collection, implementing GPS tracking for vehicles, collecting social media account information, or introducing credit scoring or risk assessment features. The Information We Collect section must be updated before the feature is deployed to production.

**New Third-Party Integrations:** When integrating with external services (payment processors, mapping services, analytics platforms, marketing tools), the Data Sharing and Cookies & Tracking sections must be updated to disclose these integrations, the data shared with third parties, and the purpose of sharing.

**Changes to Data Retention:** If database cleanup policies change, backup retention periods are modified, or audit log retention is adjusted, the Data Retention section must be updated to reflect new timelines and provide clear justification for retention periods.

**New User Roles or Permissions:** Adding new user roles (e.g., regional managers, franchise operators) or changing access control policies requires updates to the User Accounts and User Responsibilities sections of the Terms of Service.

**Pricing or Billing Changes:** Modifications to subscription models, pricing structures, or billing practices trigger updates to the System License and Usage Rights sections, even if the core license terms remain unchanged.

### Updating Document Content

The accordion-based architecture of both legal documents makes updates straightforward but requires careful attention to structure and consistency. This section provides step-by-step procedures for common update scenarios.

**Updating Accordion Content:**

To modify existing accordion content, first identify the specific AccordionItem by its data-testid attribute (e.g., `data-testid="accordion-personal-info"` for Personal Information section in Privacy Policy). Each AccordionItem contains an AccordionTrigger (the clickable header) and AccordionContent (the expandable content area). Most updates will modify the AccordionContent section.

**Example: Adding a new data collection practice to Privacy Policy:**

```typescript
<AccordionItem value="personal" data-testid="accordion-personal-info">
  <AccordionTrigger>Personal Information</AccordionTrigger>
  <AccordionContent className="space-y-3 text-sm">
    <p>We collect the following personal information:</p>
    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
      <li>User account credentials (username, email, password hash)</li>
      <li>Full name and contact details</li>
      <li>Role and permission levels</li>
      <li>Last login timestamps and session information</li>
      {/* ADD NEW DATA COLLECTION HERE */}
      <li>Two-factor authentication preferences and backup codes</li>
    </ul>
  </AccordionContent>
</AccordionItem>
```

When adding new list items, maintain consistent formatting with existing entries, use clear, non-technical language for user understanding, and be specific about what data is collected and why.

**Adding New Accordion Sections:**

If a new major policy section is needed (e.g., "Artificial Intelligence Usage Policy" or "Video Surveillance Disclosure"), create a new AccordionItem following the established pattern. Add a corresponding entry to the sections array at the top of the component file, assign a unique icon from lucide-react, create a unique data-section attribute for scroll-spy functionality, and add the section to the table of contents navigation array.

**Example: Adding a new section for AI/ML usage:**

```typescript
// 1. Add to sections array (around line 30-50)
const sections = [
  // ... existing sections
  { id: 'ai-usage', title: 'AI & Machine Learning', icon: Brain },
  { id: 'contact', title: 'Contact Us', icon: Mail },
];

// 2. Add new Card component with accordion
<Card data-section="ai-usage">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Brain className="h-5 w-5 text-primary" />
      AI & Machine Learning Usage
    </CardTitle>
  </CardHeader>
  <CardContent>
    <Accordion type="multiple" className="w-full">
      <AccordionItem value="ai-predictions" data-testid="accordion-ai-predictions">
        <AccordionTrigger>Predictive Analytics</AccordionTrigger>
        <AccordionContent className="space-y-3 text-sm">
          <p>RCCMS uses machine learning algorithms to...</p>
          {/* Additional content */}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </CardContent>
</Card>
```

**Updating Introduction or Static Content:**

Non-accordion sections like the Introduction are simpler to update. Modify the CardContent directly while maintaining consistent paragraph spacing and text hierarchy. Update the "Last updated" date in the page header whenever any content changes are made.

**Updating Table of Contents:**

The table of contents automatically updates based on the sections array. When adding or removing sections, update this array with the correct id (matching data-section attribute), title (display name in TOC), and icon (from lucide-react). The scroll-spy functionality and navigation will update automatically.

### Best Practices for Legal Documentation Updates

Maintaining legal documentation requires a disciplined approach that balances legal accuracy, user readability, and technical precision. These best practices ensure updates are thorough, compliant, and professionally executed.

**Legal Review Requirements:**

**Never deploy legal document changes without legal counsel review.** All substantive changes to Privacy Policy or Terms of Service must be reviewed by qualified legal counsel familiar with data protection law, contract law, and the jurisdictions where the system operates. Legal review should assess regulatory compliance, contract enforceability, clarity and comprehensibility for average users, and risk exposure from ambiguous or overly broad language.

**Minor vs. Major Changes:** Minor changes (typo corrections, contact information updates, clarifications that don't change meaning) may be made without full legal review but should still be documented. Major changes (new data collection practices, new limitations of liability, changes to dispute resolution, modifications to user rights) always require legal counsel approval before deployment.

**Legal Review Documentation:** Maintain records of all legal reviews including date of review, reviewing attorney name and credentials, version reviewed (git commit hash or date), approval status, and any recommended modifications. This documentation is critical for regulatory audits and demonstrates due diligence.

**Version Dating and Change Tracking:**

Every update to legal documentation must include updating the "Last updated" date prominently displayed on the page header. The format should be consistent (e.g., "Last updated: January 2026") and reflect the month and year of the most recent substantive change. Version dating is legally significant as it establishes when users were on notice of policy terms.

**Change Tracking in Git:** Use descriptive commit messages that summarize the nature of changes. Examples of good commit messages include "Update Privacy Policy: Add disclosure for new GPS vehicle tracking feature (legal review approved 2026-01-15)" or "Terms of Service: Update dispute resolution section per new arbitration clause (counsel review: J. Smith, 2026-02-10)." Tag releases with version numbers following semantic versioning for legal documents (e.g., v2.0.0 for major policy overhaul, v2.1.0 for new section addition, v2.1.1 for minor clarification).

**Maintain Version History:** Consider keeping a separate LEGAL_CHANGELOG.md file that documents all substantive changes to legal documents with dates, nature of change, reason for change, and legal reviewer approval. This provides an audit trail separate from git commit history.

**User Notification of Changes:** When making substantive changes to Terms of Service, users should be notified and may need to re-accept terms. The Modifications section of the Terms of Service specifies the notification procedure. Privacy Policy changes may require notification depending on jurisdiction and materiality of changes. GDPR requires notification for significant privacy policy changes.

**Bilingual Consistency Requirements:**

While the current legal documents are English-only for legal precision, if Arabic translations are added in the future, strict bilingual consistency procedures must be implemented. Both language versions must be legally reviewed by counsel fluent in both languages, maintain identical substantive meaning (not just literal translation), and be updated simultaneously to prevent version drift.

**Translation Best Practices:** Use professional legal translators, not automated translation. Legal terminology requires expertise in both languages and legal systems. Both versions should state which language version controls in case of discrepancy (typically English for international software). Version dates must match exactly between English and Arabic versions. If translations lag behind English updates, display a notice indicating the Arabic version is pending update.

**Audit Logging of Changes:**

All changes to legal documentation should be logged in the system's audit_logs table even though these are code changes rather than database changes. This creates a permanent, timestamped record of policy modifications.

**Manual Audit Log Entry:** After deploying legal documentation updates, create an audit log entry documenting the change:

```sql
INSERT INTO audit_logs (action, entity_type, entity_id, user_name, details, ip_address, created_at)
VALUES (
  'update_legal_documents',
  'privacy_policy', -- or 'terms_of_service'
  'privacy_policy_page',
  'admin_username',
  '{
    "sections_modified": ["Data Collection", "Third-Party Sharing"],
    "change_summary": "Added disclosure for new payment processor integration",
    "legal_review_date": "2026-01-15",
    "legal_reviewer": "Jane Smith, General Counsel",
    "version": "2.1.0",
    "git_commit": "a7f3e9c2"
  }'::jsonb,
  '192.168.1.100',
  NOW()
);
```

This audit log entry provides compliance evidence showing when policies were updated, who approved changes, what was modified, and the business justification for changes.

### Testing Procedures After Updates

After making any changes to legal documentation, comprehensive testing ensures the updates render correctly, function properly, and maintain user experience quality. Never deploy legal document changes directly to production without testing.

**Pre-Deployment Testing Checklist:**

**Visual Rendering Tests:** Verify all accordion sections expand and collapse correctly without JavaScript errors. Check that scroll-spy functionality correctly highlights active sections in the table of contents. Confirm smooth scrolling to sections when clicking TOC links. Ensure icons display correctly next to section headings. Verify text formatting, spacing, and alignment match design guidelines. Test on multiple screen sizes (mobile, tablet, desktop) to ensure responsive design works correctly.

**Content Accuracy Tests:** Proofread all modified content for typos, grammatical errors, and formatting inconsistencies. Verify all internal references are accurate (e.g., "see Section 4 above" still points to correct section). Confirm all data-testid attributes are unique and descriptive. Check that list items use consistent punctuation and capitalization. Ensure legal terminology is used consistently throughout the document.

**Functional Tests:** Test navigation between Privacy Policy and Terms of Service pages. Verify the "Back to Dashboard" button returns users to the correct location. Confirm all external links (if any) open in new tabs and use correct URLs. Test keyboard navigation through accordion sections for accessibility. Verify that the table of contents remains sticky on desktop and scrolls appropriately on mobile.

**Cross-Browser Testing:** Test on major browsers including Chrome, Firefox, Safari, and Edge. Verify that accordion animations work smoothly in all browsers. Check that Shadcn/UI components render correctly across browsers. Confirm that CSS custom properties are supported and display correctly.

**Accessibility Testing:** Run automated accessibility testing tools (e.g., axe DevTools, WAVE) to identify WCAG violations. Test keyboard navigation through all interactive elements. Verify screen reader compatibility by testing with NVDA or JAWS. Ensure sufficient color contrast for all text elements. Confirm that accordion states are announced correctly to assistive technologies.

**Performance Testing:** Verify page load time is acceptable (target: <2 seconds). Check that no JavaScript errors appear in browser console. Confirm that smooth scrolling doesn't cause performance issues on low-end devices. Test with browser DevTools Network throttling to simulate slow connections.

**Bilingual Testing (if applicable):** If Arabic translations are added, verify text direction (RTL) is correctly applied. Confirm Arabic text renders correctly in all accordion sections. Test language switching functionality. Verify that dates format correctly in both languages. Ensure both versions have identical content structure.

**Regression Testing:** After updates, verify that no unrelated functionality broke. Test that the sidebar navigation still works correctly. Confirm that the theme toggle (dark/light mode) still affects legal pages appropriately. Verify that user authentication state is maintained when navigating to/from legal pages.

### Compliance Documentation and Record Keeping

Maintaining thorough documentation of legal policy updates is essential for regulatory compliance, audit readiness, and liability protection. This documentation demonstrates organizational diligence and provides evidence of good-faith compliance efforts.

**Required Documentation Records:**

**Legal Review Records:** For each legal document update, maintain a file containing the document version reviewed (PDF or git commit hash), date submitted for legal review, name and credentials of reviewing attorney, date of legal approval, any concerns or modifications requested by counsel, and final approval signature or email confirmation. Store these records in a secure location separate from the git repository (e.g., secure document management system, encrypted cloud storage, or legal department files).

**Change Justification Records:** Document the business or regulatory reason for each change. Examples include "Added GPS tracking disclosure due to new fleet management feature deployment (feature spec: FT-2026-045)" or "Updated GDPR compliance section to reflect 2026 EU Court of Justice ruling on data retention (case reference: C-123/2026)." These justifications demonstrate that changes were made proactively to maintain compliance rather than reactively after incidents.

**User Notification Records:** If users were notified of policy changes (via email, in-app notifications, or required re-acceptance), maintain records showing the date notifications were sent, content of notification message, list of users notified (or SQL query used to generate list), and evidence of delivery (email delivery logs, notification system logs). For Terms of Service changes requiring re-acceptance, maintain logs of which users accepted new terms and when.

**Regulatory Compliance Mapping:** Maintain a document mapping each section of the Privacy Policy and Terms of Service to specific regulatory requirements. Examples include "Section 2.3 (Information Collection - Customer Data) satisfies GDPR Article 13 disclosure requirements" or "Section 7 (User Rights) satisfies CCPA consumer rights disclosure per Cal. Civ. Code § 1798.100." This mapping demonstrates systematic compliance and facilitates regulatory audits.

**Version Archive:** Maintain an archive of all previous versions of legal documents with version number, effective dates (when version was live in production), superseded date (when replaced by newer version), and git commit hash or tagged release. This archive is legally significant as it establishes what terms were in effect during any given time period, which is critical for contractual disputes or regulatory inquiries.

**Audit Trail Integration:**

Legal documentation updates should be integrated into the system's comprehensive audit logging infrastructure. While code changes are tracked in git, creating corresponding audit log entries provides a queryable, timestamped record accessible to compliance officers and auditors without requiring git access.

**Query Historical Legal Changes:**

```sql
-- Retrieve all legal documentation updates
SELECT 
  action,
  entity_type,
  details->>'sections_modified' as sections,
  details->>'change_summary' as summary,
  details->>'legal_reviewer' as reviewer,
  details->>'version' as version,
  user_name,
  created_at
FROM audit_logs
WHERE action = 'update_legal_documents'
ORDER BY created_at DESC;

-- Generate compliance report for specific time period
SELECT 
  TO_CHAR(created_at, 'YYYY-MM') as month,
  COUNT(*) as legal_updates,
  jsonb_agg(
    jsonb_build_object(
      'type', entity_type,
      'summary', details->>'change_summary',
      'reviewer', details->>'legal_reviewer'
    )
  ) as changes
FROM audit_logs
WHERE action = 'update_legal_documents'
  AND created_at >= '2025-01-01'
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY month DESC;
```

These queries provide compliance officers with quick access to legal documentation change history without requiring technical knowledge of git or code repositories.

### Emergency Update Procedures

In rare situations, legal documentation may require emergency updates outside the normal review cycle. Examples include discovery of material inaccuracy, regulatory enforcement action, imminent legal threat, or critical security incident disclosure. Emergency updates require expedited procedures while maintaining compliance standards.

**Emergency Update Protocol:**

**Assessment (0-2 hours):** Immediately assess the severity and legal risk of the issue. Contact legal counsel immediately if issue involves regulatory non-compliance, potential legal liability, or security incident disclosure. Determine if issue requires immediate policy update or can wait for next scheduled review cycle. Document the issue and assessment in audit logs.

**Legal Review (2-24 hours):** For true emergencies, request expedited legal review from counsel. Provide clear description of issue and proposed policy language changes. Obtain written approval (email acceptable) before proceeding. If counsel is unavailable and issue is critical, consult with senior management and document decision-making process.

**Implementation (24-48 hours):** Make minimum necessary changes to address the emergency issue. Update "Last updated" date. Create detailed git commit message explaining emergency nature and approval chain. Deploy to production following abbreviated testing procedures (visual check, basic functionality only). Full regression testing can occur post-deployment for genuine emergencies.

**User Notification (48 hours):** Notify affected users of policy changes if legally required or materially affecting their rights. Use in-app notifications, email, or account login notices as appropriate. Document notification method and reach.

**Post-Emergency Review (1 week):** Conduct comprehensive testing of emergency changes. Schedule follow-up legal review to confirm emergency changes are sufficient. Document lessons learned and update emergency procedures if needed. Consider whether emergency change should be refined or expanded in next scheduled review.

**Emergency Contact Information:**

Maintain an emergency contact list for legal documentation issues including primary legal counsel (name, phone, email), backup legal counsel, senior management approvals (CEO, CTO), compliance officer (if applicable), and technical deployment contacts (DevOps, system administrator). This list should be accessible 24/7 to authorized personnel.

### Localization and International Compliance

As RCCMS expands to serve customers in multiple jurisdictions, legal documentation may require localization beyond simple translation. Different countries have varying privacy laws, contractual requirements, and consumer protection standards that may necessitate jurisdiction-specific policy variations.

**Jurisdiction-Specific Requirements:**

**European Union (GDPR):** The Privacy Policy must include specific GDPR disclosures: legal basis for processing (consent, contract, legitimate interest), data protection officer contact (if appointed), right to lodge complaint with supervisory authority, existence of automated decision-making, and data transfer safeguards for non-EU processing. The Terms of Service must comply with EU consumer protection directives if serving EU consumers.

**California (CCPA/CPRA):** For California users, Privacy Policy must disclose categories of personal information collected, categories of sources, business purposes for collection, categories of third parties with whom data is shared, and specific consumer rights under CCPA. A "Do Not Sell My Personal Information" link may be required depending on data practices.

**United Kingdom (UK GDPR):** Post-Brexit UK maintains GDPR-like requirements with minor variations. Privacy Policy should specify compliance with UK GDPR and identify UK data protection registration if applicable.

**Middle East (Saudi Arabia, UAE):** These jurisdictions have emerging data protection laws that may require specific disclosures about data localization, cross-border transfers, and government access to data. Arabic translations are essential for serving customers in these markets.

**Managing Multi-Jurisdiction Policies:**

For organizations serving multiple jurisdictions, consider implementing jurisdiction-specific policy versions or a comprehensive global policy with jurisdiction-specific sections. Use geolocation or user account settings to display appropriate policy version. Maintain separate legal review for each jurisdiction by local counsel. Document compliance with each jurisdiction's requirements in the regulatory compliance mapping.

---

## Common Issues & Solutions

### High CPU Usage

**Cause**: Inefficient queries, too many concurrent requests

**Solution:**
```sql
-- Identify expensive queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Optimize queries with indexes
-- Reduce concurrent request limit in nginx
-- Scale horizontally if needed
```

### High Memory Usage

**Cause**: Memory leaks, too many connections

**Solution:**
```bash
# Restart application to clear memory
pm2 restart rccms-app

# Reduce max connections
# Check for memory leaks in custom code
# Monitor with: pm2 monit
```

### Slow Page Loads

**Cause**: Database query performance, network latency

**Solution:**
- Enable query caching
- Optimize database indexes
- Use CDN for static assets
- Enable gzip compression in nginx
- Implement pagination for large lists

### Session Expiration Issues

**Cause**: Session store misconfiguration, clock skew

**Solution:**
```javascript
// Verify session configuration in server/index.ts
{
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  rolling: true,  // Reset expiry on activity
}

// Check server time
date

// Sync time if needed
sudo ntpdate -s time.nist.gov
```

### Audit Log Gaps

**Cause**: Geolocation service failures, database errors

**Solution:**
- Audit logs still created (location fields nullable)
- Check system_errors for failures
- Verify geolocation service connectivity
- Consider caching frequently accessed IPs

---

### Permission Toggle Issues (Production System - November 2025)

**Issue**: User cannot access features despite correct role

**Diagnosis Steps:**

1. **Verify Permission Toggle State:**
```sql
-- Check user's current permissions
SELECT username, role, can_access_reports, can_close_contracts, can_view_all_contracts
FROM users
WHERE username = 'affected_username';
```

2. **Check Frontend Session:**
```javascript
// Ask user to check browser console
// Logged user object should show permissions:
{
  canAccessReports: true/false,
  canCloseContracts: true/false,
  canViewAllContracts: true/false
}
```

3. **Verify Backend Middleware:**
```bash
# Check server logs for 403 Forbidden responses
grep "403" logs/app.log | tail -20

# Common 403 patterns:
# "Forbidden: You do not have permission to access reports"
# "Forbidden: You do not have permission to close contracts"
# "Forbidden: You can only view your own contracts"
```

**Common Scenarios:**

**Scenario 1: User sees menu item but gets 403 on access**
- **Cause**: Frontend cache not refreshed after permission grant
- **Solution**: User logout → clear browser cache → login again

**Scenario 2: Permission toggle granted but user still denied**
- **Cause**: Session still has old user object
- **Solution**: User must logout and login again to refresh session

**Scenario 3: Close Contract button not visible**
- **Diagnosis**: Check contract status and payment status
```sql
-- Contract must be:
-- 1. status = 'completed'
-- 2. totalPaid >= totalDue
SELECT id, status, total_amount, total_extra_charges, outstanding_balance
FROM contracts
WHERE id = 'contract_id';
```

**Scenario 4: Staff can see other users' contracts unexpectedly**
- **Diagnosis**: Check canViewAllContracts toggle
```sql
SELECT username, role, can_view_all_contracts
FROM users
WHERE username = 'staff_username';
```
- **Fix**: If toggle incorrectly set, revoke via Admin panel or SQL:
```sql
UPDATE users
SET can_view_all_contracts = false
WHERE username = 'staff_username' AND role = 'staff';
```

**Scenario 5: Permission toggle won't save**
- **Cause**: Attempting to edit immutable user (superadmin)
- **Solution**: Check isImmutable flag:
```sql
SELECT username, is_immutable FROM users WHERE username = 'username';
```
- Immutable users cannot have permissions edited

**Scenario 6: Self-escalation security test**
- **Expected**: Staff PATCH /api/users/:id should return 403 Forbidden
- **Diagnosis**: Check requireAdmin middleware is active
```bash
# Test via curl:
curl -X PATCH https://your-domain.com/api/users/user-id \
  -H "Content-Type: application/json" \
  -d '{"canCloseContracts": true}' \
  --cookie "session-cookie"

# Expected: 403 Forbidden
# Message: "Forbidden: Admin access required"
```

**Prevention:**
- ✅ Always log permission changes in audit trail
- ✅ Require users to re-login after permission changes
- ✅ Use Admin panel UI instead of direct SQL updates
- ✅ Document permission changes in change log

**Emergency Reset:**
```sql
-- Reset all Staff toggles to defaults (all false)
UPDATE users
SET can_access_reports = false,
    can_close_contracts = false,
    can_view_all_contracts = false
WHERE role = 'staff' AND is_immutable = false;

-- Grant specific permission to user
UPDATE users
SET can_close_contracts = true
WHERE username = 'senior_staff_username';
```

**Verification Query:**
```sql
-- Check all non-default permission configurations
SELECT 
  username, 
  role,
  can_access_reports,
  can_close_contracts,
  can_view_all_contracts
FROM users
WHERE 
  (role = 'staff' AND (can_access_reports = true OR can_close_contracts = true OR can_view_all_contracts = true))
  OR (role = 'viewer' AND (can_access_reports = true OR can_close_contracts = true OR can_view_all_contracts = true))
ORDER BY username;
```

**Documentation References:**
- **ROLE_PERMISSIONS.md** - Complete permission matrix and business scenarios
- **OPERATIONAL_RUNBOOK.md** - Step-by-step permission management procedures
- **QA_COMPREHENSIVE_REPORT.md** - Test cases for permission validation

---

## Appendix A: Useful Commands

### Database
```bash
# Connect to database
psql "$DATABASE_URL"

# Database size
psql "$DATABASE_URL" -c "SELECT pg_size_pretty(pg_database_size(current_database()));"

# Table row counts
psql "$DATABASE_URL" -c "SELECT schemaname,tablename,n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC;"

# Active queries
psql "$DATABASE_URL" -c "SELECT pid, query, state FROM pg_stat_activity WHERE state != 'idle';"
```

### Application
```bash
# PM2 commands
pm2 start rccms-app
pm2 stop rccms-app
pm2 restart rccms-app
pm2 reload rccms-app       # Zero-downtime restart
pm2 delete rccms-app
pm2 logs rccms-app
pm2 monit
pm2 describe rccms-app

# Build and start
npm run build
npm start

# Development mode
npm run dev
```

### System
```bash
# Service management (systemd)
sudo systemctl status rccms-app
sudo systemctl start rccms-app
sudo systemctl stop rccms-app
sudo systemctl restart rccms-app
sudo systemctl enable rccms-app

# Nginx
sudo systemctl status nginx
sudo systemctl reload nginx
sudo nginx -t

# PostgreSQL
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

---

## Appendix B: Log Locations

**Application Logs:**
- PM2 logs: `~/.pm2/logs/rccms-app-*.log`
- PM2 error logs: `~/.pm2/logs/rccms-app-error.log`
- PM2 out logs: `~/.pm2/logs/rccms-app-out.log`

**System Logs:**
- Nginx access: `/var/log/nginx/access.log`
- Nginx error: `/var/log/nginx/error.log`
- PostgreSQL: `/var/log/postgresql/postgresql-14-main.log`
- Systemd: `journalctl -u rccms-app`

**Audit Logs:**
- Stored in `audit_logs` database table
- Access via admin panel or SQL queries

---

## Appendix C: Emergency Contacts

**System Administrator:**
- Name: __________________
- Email: __________________
- Phone: __________________

**Database Administrator:**
- Name: __________________
- Email: __________________
- Phone: __________________

**Hosting Provider Support:**
- Provider: __________________
- Support URL: __________________
- Phone: __________________

---

**End of Maintenance Guide**

For deployment procedures, refer to:
- **VPS Deployment Guide**
- **Docker Deployment Guide**

For user operations, refer to:
- **Administrator Guide**
- **User Guide**

---

## Vehicle Inspection Photo Storage Maintenance

### Overview

**Feature:** Two-stage vehicle inspection system with mandatory 6-photo documentation
**Storage Implementation:** JSONB column in PostgreSQL `vehicle_inspections` table
**Maintenance Focus:** Storage optimization, backup procedures, performance monitoring

**RATIONALE FOR MAINTENANCE PROCEDURES:**
- **Storage Growth:** Photos accumulate rapidly (3MB per inspection × 2 per contract)
- **Backup Impact:** Photos significantly increase backup size and duration
- **Performance:** Large JSONB columns can slow queries if not properly indexed
- **Cost:** Database storage more expensive than object storage at scale

### Photo Storage Architecture

**Current Implementation (MVP):**
```typescript
// shared/schema.ts
export const vehicleInspections = pgTable('vehicle_inspections', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar('contract_id').notNull().references(() => contracts.id),
  inspection_type: varchar('inspection_type', { length: 20 }).notNull(), // 'pre_delivery' or 'post_return'
  inspector_name: varchar('inspector_name', { length: 255 }).notNull(),
  odometer_reading: integer('odometer_reading').notNull(),
  fuel_level: integer('fuel_level').notNull(),
  condition_notes: text('condition_notes'),
  photos: jsonb('photos').notNull(), // Array of base64 encoded photos
  created_by: varchar('created_by').references(() => users.id),
  created_at: timestamp('created_at').defaultNow()
});
```

**Photo Structure in JSONB:**
```json
[
  {"angle": "front", "data": "data:image/jpeg;base64,/9j/4AAQ..."},
  {"angle": "back", "data": "data:image/jpeg;base64,/9j/4AAQ..."},
  {"angle": "left", "data": "data:image/jpeg;base64,/9j/4AAQ..."},
  {"angle": "right", "data": "data:image/jpeg;base64,/9j/4AAQ..."},
  {"angle": "top", "data": "data:image/jpeg;base64,/9j/4AAQ..."},
  {"angle": "dashboard", "data": "data:image/jpeg;base64,/9j/4AAQ..."}
]
```

**Storage Characteristics:**
- **Compression:** Client-side JPEG compression to ~500KB per photo
- **Total per Inspection:** ~3MB (6 photos × 500KB)
- **Total per Contract:** ~6MB (2 inspections)
- **Encoding:** Base64 (increases size by ~33% over binary)

### Storage Monitoring

**Check Current Storage Usage:**
```sql
-- Total storage by inspection photos
SELECT 
  COUNT(*) as inspection_count,
  COUNT(*) * 6 as photo_count,
  pg_size_pretty(pg_total_relation_size('vehicle_inspections')) as table_size,
  pg_size_pretty(pg_total_relation_size('vehicle_inspections') - pg_relation_size('vehicle_inspections')) as index_size,
  pg_size_pretty(pg_relation_size('vehicle_inspections')) as data_size
FROM vehicle_inspections;

-- Storage breakdown by inspection type
SELECT 
  inspection_type,
  COUNT(*) as count,
  pg_size_pretty(SUM(pg_column_size(photos))) as photos_size
FROM vehicle_inspections
GROUP BY inspection_type;

-- Largest inspections (potential compression issues)
SELECT 
  id,
  contract_id,
  inspection_type,
  pg_size_pretty(pg_column_size(photos)) as photo_column_size,
  jsonb_array_length(photos) as photo_count,
  created_at
FROM vehicle_inspections
ORDER BY pg_column_size(photos) DESC
LIMIT 10;
```

**Expected Results:**
- **Per Inspection:** ~3-4MB
- **If >6MB:** Photo compression failed, investigate
- **If <2MB:** Unusually good compression or low quality

**Growth Projection:**
```sql
-- Calculate monthly growth rate
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as inspections_created,
  COUNT(*) * 3 as estimated_mb_added
FROM vehicle_inspections
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

### Performance Optimization

**Query Performance:**
```sql
-- Check query performance on inspections table
EXPLAIN ANALYZE
SELECT * FROM vehicle_inspections
WHERE contract_id = '[some-uuid]'
AND inspection_type = 'pre_delivery';

-- Expected: Index scan on contract_id, <10ms execution
```

**Create Required Indexes:**
```sql
-- Contract lookup index (if not exists)
CREATE INDEX IF NOT EXISTS idx_inspections_contract_id 
ON vehicle_inspections(contract_id);

-- Type filter index
CREATE INDEX IF NOT EXISTS idx_inspections_type 
ON vehicle_inspections(inspection_type);

-- Created date index (for time-series queries)
CREATE INDEX IF NOT EXISTS idx_inspections_created_at 
ON vehicle_inspections(created_at DESC);
```

**RATIONALE FOR INDEXES:**
- `contract_id`: Most common query pattern (fetch all inspections for contract)
- `inspection_type`: Filter pre/post inspections
- `created_at`: Time-series analysis and archival queries

**JSONB Optimization:**
```sql
-- Vacuum to reclaim space after deletes
VACUUM ANALYZE vehicle_inspections;

-- Reindex if query performance degrades
REINDEX TABLE vehicle_inspections;
```

### Backup Procedures

**Backup Considerations:**
- **With Photos:** Full backup including inspection photos (recommended)
- **Without Photos:** Schema-only or data without JSONB (NOT recommended)

**Full Backup (Recommended):**
```bash
# Complete backup including photos
pg_dump -h $PGHOST -U $PGUSER -d $PGDATABASE \
  --format=custom \
  --compress=9 \
  -f rccms_backup_$(date +%Y%m%d_%H%M%S).dump

# Estimated backup size with 1000 inspections:
# - Database structure: ~5MB
# - Contract data: ~50MB
# - Inspection photos: ~6GB (1000 inspections × 6MB)
# - Total: ~6GB
```

**Backup Frequency:**
- **Daily:** Incremental backup (changed data only)
- **Weekly:** Full backup including all photos
- **Monthly:** Archival backup with verification

**Restore Test:**
```bash
# Test restore to verify backup integrity
pg_restore -h localhost -U postgres -d rccms_test \
  --clean --if-exists \
  rccms_backup_20251027.dump

# Verify photo restoration
psql -h localhost -U postgres -d rccms_test -c \
  "SELECT COUNT(*), pg_size_pretty(pg_total_relation_size('vehicle_inspections')) 
   FROM vehicle_inspections;"
```

**CRITICAL:** Test restore monthly to ensure photos are recoverable

### Storage Scaling Strategy

**When to Migrate to Object Storage:**

**Triggers:**
- Database size >50GB due to photos
- Backup time >30 minutes
- Backup cost >$50/month
- Photo retrieval latency >2 seconds

**Migration Path (JSONB → S3/Object Storage):**

1. **Setup Object Storage:**
   - AWS S3, DigitalOcean Spaces, or Cloudflare R2
   - Configure CORS for direct upload
   - Create separate bucket for inspection photos

2. **Schema Migration:**
```sql
-- Add new column for object storage URLs
ALTER TABLE vehicle_inspections 
ADD COLUMN photo_urls JSONB;

-- Example structure:
-- [
--   {"angle": "front", "url": "https://s3.../inspection-123-front.jpg"},
--   ...
-- ]
```

3. **Data Migration Script:**
```javascript
// Migrate existing base64 photos to object storage
const inspections = await db.select().from(vehicleInspections);
for (const inspection of inspections) {
  const photoUrls = [];
  for (const photo of inspection.photos) {
    // Decode base64
    const buffer = Buffer.from(photo.data.split(',')[1], 'base64');
    // Upload to S3
    const url = await uploadToS3(buffer, `inspection-${inspection.id}-${photo.angle}.jpg`);
    photoUrls.push({angle: photo.angle, url});
  }
  // Update record
  await db.update(vehicleInspections)
    .set({photo_urls: photoUrls})
    .where(eq(vehicleInspections.id, inspection.id));
}
```

4. **Remove Base64 Column:**
```sql
-- After verifying migration success
ALTER TABLE vehicle_inspections DROP COLUMN photos;
```

**Post-Migration Benefits:**
- **Storage Cost:** ~90% reduction ($10/TB S3 vs $100/TB database)
- **Backup Speed:** 10x faster (database smaller)
- **Scalability:** Unlimited photo storage
- **CDN:** Faster photo delivery worldwide

**RATIONALE:** JSONB storage is perfect for MVP (simple, atomic, included in backups). Migrate to object storage when scale demands it (typically >50GB photos).

### Monitoring & Alerting

**Setup Monitoring:**
```sql
-- Create monitoring view
CREATE OR REPLACE VIEW inspection_storage_metrics AS
SELECT 
  COUNT(*) as total_inspections,
  COUNT(*) * 6 as total_photos,
  pg_size_pretty(pg_total_relation_size('vehicle_inspections')) as total_size,
  pg_size_pretty(pg_total_relation_size('vehicle_inspections') / COUNT(*)) as avg_size_per_inspection,
  DATE_TRUNC('month', NOW()) as report_month
FROM vehicle_inspections;
```

**Alert Thresholds:**
- **Database Size:** Alert if >40GB (approaching 50GB migration trigger)
- **Backup Duration:** Alert if >25 minutes
- **Query Performance:** Alert if inspection queries >500ms

**Monthly Report:**
```sql
-- Generate monthly storage report
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as new_inspections,
  COUNT(*) * 6 as new_photos,
  pg_size_pretty(SUM(pg_column_size(photos))) as storage_added
FROM vehicle_inspections
WHERE created_at >= DATE_TRUNC('month', NOW() - INTERVAL '12 months')
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

### Troubleshooting Storage Issues

**Issue: Database Growing Too Fast**

**Diagnosis:**
```sql
SELECT 
  pg_size_pretty(pg_database_size(current_database())) as db_size,
  pg_size_pretty(pg_total_relation_size('vehicle_inspections')) as inspections_size,
  ROUND(100.0 * pg_total_relation_size('vehicle_inspections') / pg_database_size(current_database()), 2) as pct_of_db
FROM vehicle_inspections
LIMIT 1;
```

**Solutions:**
- If inspections >70% of database: Consider object storage migration
- Run VACUUM to reclaim space
- Archive old inspections (>2 years) to separate table

**Issue: Backup Failures**

**Common Causes:**
- Backup size exceeds storage quota
- Backup duration exceeds time window
- Network timeout during transfer

**Solutions:**
```bash
# Compress backup more aggressively
pg_dump --compress=9 ...

# Split backup into chunks
pg_dump --table=vehicle_inspections > inspections.sql
pg_dump --exclude-table=vehicle_inspections > other.sql

# Use parallel backup
pg_dump --jobs=4 --format=directory ...
```

**MAINTENANCE CHECKLIST:**

**Daily:**
- ✅ Monitor database size growth
- ✅ Check backup completion

**Weekly:**
- ✅ Verify inspection creation rate
- ✅ Review query performance
- ✅ Check for failed photo uploads

**Monthly:**
- ✅ Test backup restore with photos
- ✅ Analyze storage growth trends
- ✅ Review migration timeline to object storage
- ✅ Vacuum and analyze database

**Quarterly:**
- ✅ Capacity planning for next 12 months
- ✅ Evaluate object storage migration
- ✅ Update backup retention policy


---

## Future Enterprise Features

### System Administrator Suite (Planned)

**Status:** ✅ Fully Specified - Awaiting Implementation Approval  
**Documentation:** `SYSTEM_ADMINISTRATOR_SUITE.md` (100+ pages)  
**Investment:** $170-260 USD + $35-45/month operations  
**Timeline:** 6-8 weeks from approval

---

### Overview for Technical Staff

The System Administrator Suite adds enterprise-grade disaster recovery, business continuity, and data migration capabilities to RCCMS. This section provides technical context for maintenance staff to understand the planned architecture.

---

### 🔑 Component 1: Backdoor Super Admin

**Technical Architecture:**

**Authentication Layer:**
- Environment variable: `BACKDOOR_ADMIN_PASSWORD` (SHA-256 hashed)
- TOTP implementation using `speakeasy` library
- IP allowlist checking via Express middleware
- Separate authentication route: `/api/backdoor/auth/login`
- JWT token with 1-hour expiration
- Rate limiting: 5 attempts per 15 minutes per IP

**Database Schema:**
```sql
CREATE TABLE backdoor_audit_logs (
  id SERIAL PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  target_user_id INTEGER,
  details JSONB,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP DEFAULT NOW(),
  previous_hash VARCHAR(64),
  current_hash VARCHAR(64) NOT NULL
);

CREATE OR REPLACE FUNCTION prevent_backdoor_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Backdoor audit logs are immutable';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_update_backdoor_audit
BEFORE UPDATE ON backdoor_audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_backdoor_audit_modification();

CREATE TRIGGER prevent_delete_backdoor_audit
BEFORE DELETE ON backdoor_audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_backdoor_audit_modification();
```

**Hash Chain Implementation:**
```typescript
function calculateHash(entry: AuditLogEntry, previousHash: string): string {
  const data = JSON.stringify({
    previousHash,
    action: entry.action,
    userId: entry.userId,
    timestamp: entry.timestamp,
    details: entry.details
  });
  return crypto.createHash('sha256').update(data).digest('hex');
}
```

**Maintenance Tasks:**
- Monitor failed login attempts (check logs)
- Rotate TOTP secret annually
- Review and update IP allowlist quarterly
- Verify hash chain integrity monthly
- Test emergency access procedures quarterly

---

### 💾 Component 2: Automated Backup System

**Technical Implementation:**

**Backup Creation Process:**
```bash
# 1. Create PostgreSQL dump
pg_dump $DATABASE_URL --format=custom --file=/tmp/backup_${timestamp}.dump

# 2. Compress backup
gzip /tmp/backup_${timestamp}.dump

# 3. Encrypt backup (AES-256)
openssl enc -aes-256-cbc -salt -in backup.dump.gz -out backup.dump.gz.enc -k $ENCRYPTION_KEY

# 4. Calculate SHA-256 hash
sha256sum backup.dump.gz.enc > backup.dump.gz.enc.sha256

# 5. Upload to storage (S3/local/NFS)
aws s3 cp backup.dump.gz.enc s3://bucket/backups/
```

**Backup Metadata Table:**
```sql
CREATE TABLE backups (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  size_bytes BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  backup_type VARCHAR(20), -- 'scheduled', 'manual', 'pre_cleanup'
  sha256_hash VARCHAR(64) NOT NULL,
  encryption_algorithm VARCHAR(50) DEFAULT 'AES-256-CBC',
  storage_location TEXT,
  retention_days INTEGER DEFAULT 30,
  delete_after TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE
);
```

**Cron Job Configuration:**
```cron
# Daily backup at 2 AM UTC
0 2 * * * /usr/local/bin/rccms-backup.sh scheduled >> /var/log/rccms-backup.log 2>&1
```

**Restore Process:**
```bash
# 1. Download backup
aws s3 cp s3://bucket/backups/backup_${id}.dump.gz.enc /tmp/

# 2. Verify hash
sha256sum -c backup.dump.gz.enc.sha256

# 3. Decrypt backup
openssl enc -d -aes-256-cbc -in backup.dump.gz.enc -out backup.dump.gz -k $ENCRYPTION_KEY

# 4. Decompress
gunzip backup.dump.gz

# 5. Restore to database
pg_restore --clean --if-exists --dbname=$DATABASE_URL /tmp/backup_${timestamp}.dump
```

**Maintenance Tasks:**
- Monitor backup completion (check logs daily)
- Verify backup integrity weekly (hash verification)
- Test restore procedure monthly
- Monitor disk space usage (backup storage)
- Rotate encryption keys annually
- Clean up expired backups automatically (cron job)

**Disk Space Estimation:**
```
Database size: 1GB uncompressed
Compressed: ~300MB (70% reduction)
Encrypted: ~310MB (minimal overhead)
30-day retention: 310MB × 30 = ~9.3GB
90-day retention: 310MB × 90 = ~27.9GB
```

**Performance Impact:**
- Backup duration: 2-5 minutes for 1GB database
- CPU spike: 50-80% during compression/encryption
- Disk I/O: High during pg_dump
- Network bandwidth: ~310MB upload (if external storage)

---

### 🗑️ Component 3: Clean Slate System

**Three-Tier Deletion Strategy:**

**Level 1: Operational Data Only**
```sql
BEGIN;
-- Mandatory backup checkpoint
INSERT INTO backups (filename, backup_type, retention_days)
VALUES ('pre_cleanup_level1_${timestamp}', 'pre_cleanup', 365);

-- Delete operational data
DELETE FROM vehicle_inspections;
DELETE FROM payments;
DELETE FROM contract_edits;
DELETE FROM contracts;
DELETE FROM audit_logs WHERE action_type IN ('contract', 'payment', 'inspection');

COMMIT;
```

**Level 2: Operational + Master Data**
```sql
BEGIN;
-- Mandatory backup checkpoint
INSERT INTO backups (filename, backup_type, retention_days)
VALUES ('pre_cleanup_level2_${timestamp}', 'pre_cleanup', 365);

-- Delete operational + master data
DELETE FROM vehicle_inspections;
DELETE FROM payments;
DELETE FROM contract_edits;
DELETE FROM contracts;
DELETE FROM vehicles;
DELETE FROM customers;
DELETE FROM sponsors;
DELETE FROM companies;
DELETE FROM audit_logs WHERE action_type NOT IN ('system', 'user');

COMMIT;
```

**Level 3: Complete Reset**
```sql
BEGIN;
-- Mandatory backup checkpoint
INSERT INTO backups (filename, backup_type, retention_days)
VALUES ('pre_cleanup_level3_${timestamp}', 'pre_cleanup', 365);

-- Delete everything except superadmin and backdoor admin
DELETE FROM vehicle_inspections;
DELETE FROM payments;
DELETE FROM contract_edits;
DELETE FROM contracts;
DELETE FROM vehicles;
DELETE FROM customers;
DELETE FROM sponsors;
DELETE FROM companies;
DELETE FROM users WHERE username NOT IN ('admin', 'backdoor_admin');
DELETE FROM company_settings;
DELETE FROM audit_logs;
DELETE FROM system_errors;

-- Reset sequences
ALTER SEQUENCE contracts_contract_number_seq RESTART WITH 1;

COMMIT;
```

**Safety Mechanisms:**
- Atomic transaction (backup + cleanup)
- Backup verification before proceeding
- Double confirmation via exact phrase typing
- 30-day rollback window (restore from pre-cleanup backup)

**Maintenance Tasks:**
- Review cleanup requests monthly
- Audit pre-cleanup backup retention (365 days)
- Test rollback procedures quarterly
- Monitor disk space for long-term cleanup backups

---

### 📥 Component 4: CSV Import System

**Import Pipeline Architecture:**

**1. File Upload & Validation:**
```typescript
// CSV parsing (papaparse library)
const results = Papa.parse(file, {
  header: true,
  skipEmptyLines: true,
  transformHeader: (header) => header.trim()
});

// Schema validation (Zod)
const customerSchema = z.object({
  nationalId: z.string().min(1),
  nameEnglish: z.string().min(1),
  nameArabic: z.string().optional(),
  phone: z.string().min(1),
  licenseNumber: z.string().min(1),
  // ... more fields
});

// Validate all rows
const validationErrors = [];
for (let i = 0; i < results.data.length; i++) {
  const result = customerSchema.safeParse(results.data[i]);
  if (!result.success) {
    validationErrors.push({
      row: i + 2, // +2 for header + 0-index
      errors: result.error.errors
    });
  }
}
```

**2. Dry-Run Preview:**
```typescript
// Generate preview (first 10 rows)
const preview = validatedData.slice(0, 10).map(row => ({
  ...row,
  _importStatus: 'will_create', // or 'will_update', 'duplicate', 'error'
  _conflicts: checkDuplicates(row)
}));

// Return to frontend for user review
return { preview, totalRows, validationErrors };
```

**3. Batch Processing:**
```typescript
// Process in batches of 500
const BATCH_SIZE = 500;
for (let i = 0; i < validatedData.length; i += BATCH_SIZE) {
  const batch = validatedData.slice(i, i + BATCH_SIZE);
  
  await db.transaction(async (tx) => {
    for (const row of batch) {
      await tx.insert(customers).values(row);
    }
  });
  
  // Emit progress event
  emitProgress({ processed: i + batch.length, total: validatedData.length });
}
```

**4. Error Handling & Rollback:**
```sql
BEGIN;
-- Import attempt
INSERT INTO csv_import_jobs (entity_type, filename, status, started_at)
VALUES ('customers', 'import.csv', 'in_progress', NOW());

-- If error occurs within 24 hours
ROLLBACK TO SAVEPOINT before_import;

-- If successful
UPDATE csv_import_jobs SET status = 'completed', completed_at = NOW();
COMMIT;
```

**CSV Templates Location:**
- `templates/customers_import_template.csv`
- `templates/vehicles_import_template.csv`
- `templates/sponsors_import_template.csv`
- `templates/companies_import_template.csv`
- `templates/contracts_import_template.csv`
- `templates/payments_import_template.csv`

**Maintenance Tasks:**
- Monitor import job status
- Review import error logs
- Test CSV templates quarterly with sample data
- Validate referential integrity after imports
- Clean up failed import jobs monthly

---

### 📋 Component 5: Immutable Audit Logging

**Hash Chain Verification Algorithm:**
```typescript
async function verifyHashChain(): Promise<boolean> {
  const logs = await db.select().from(backdoorAuditLogs).orderBy(asc(id));
  
  let previousHash = '0'.repeat(64); // Genesis hash
  
  for (const log of logs) {
    const expectedHash = calculateHash(log, previousHash);
    
    if (log.currentHash !== expectedHash) {
      console.error(`Hash chain broken at log ID: ${log.id}`);
      return false;
    }
    
    previousHash = log.currentHash;
  }
  
  return true; // Chain intact
}
```

**Audit Log Entry Structure:**
```typescript
interface BackdoorAuditLog {
  id: number;
  action: string; // 'LOGIN', 'PASSWORD_RESET', 'BACKUP_CREATE', etc.
  targetUserId: number | null;
  details: Record<string, any>;
  ipAddress: string;
  timestamp: Date;
  previousHash: string;
  currentHash: string;
}
```

**Database Triggers (Immutability):**
- `prevent_update_backdoor_audit` - Blocks UPDATE operations
- `prevent_delete_backdoor_audit` - Blocks DELETE operations
- Regular admin users cannot access `backdoorAuditLogs` table

**Maintenance Tasks:**
- Run hash chain verification weekly
- Review backdoor audit logs monthly
- Monitor for failed verification attempts
- Export audit logs quarterly for compliance
- Ensure database backups include audit tables

---

### Deployment Considerations

**Environment Variables Required:**
```bash
# Backdoor Admin
BACKDOOR_ADMIN_USERNAME=backdoor_admin
BACKDOOR_ADMIN_PASSWORD=<secure_password>
BACKDOOR_TOTP_SECRET=<base32_secret>
BACKDOOR_IP_ALLOWLIST=192.168.1.0/24,10.0.0.5

# Backup System
BACKUP_STORAGE_TYPE=s3  # or 'local' or 'nfs'
BACKUP_S3_BUCKET=rccms-backups
BACKUP_S3_REGION=us-east-1
BACKUP_ENCRYPTION_KEY=<secure_key>
BACKUP_RETENTION_DAYS=30

# Email Notifications
BACKUP_EMAIL_ALERTS=admin@company.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=alerts@company.com
SMTP_PASS=<app_password>
```

**System Requirements:**
- Disk space: 10-30GB (depends on retention period)
- CPU: 2+ cores (backup compression)
- RAM: 4GB+ minimum (8GB+ recommended)
- Network: Stable connection for S3 uploads (if external storage)
- PostgreSQL 14+ with superuser access (for database dumps)

**Monitoring & Alerts:**
- Backup success/failure notifications via email
- Disk space monitoring (80% threshold)
- Hash chain verification status
- Failed login attempts (rate limit violations)
- CSV import job failures

---

### Testing Procedures

**Backup & Restore Test:**
```bash
# 1. Create manual backup
curl -X POST http://localhost:5000/api/backdoor/backups \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{"type": "manual"}'

# 2. Verify backup exists
ls -lh /backups/

# 3. Create test data
psql $DATABASE_URL -c "INSERT INTO customers (...) VALUES (...);"

# 4. Restore from backup
curl -X POST http://localhost:5000/api/backdoor/backups/${BACKUP_ID}/restore \
  -H "Authorization: Bearer ${JWT_TOKEN}"

# 5. Verify test data is gone
psql $DATABASE_URL -c "SELECT * FROM customers WHERE ..."
```

**Hash Chain Verification Test:**
```bash
# Run verification
curl -X POST http://localhost:5000/api/backdoor/audit/verify \
  -H "Authorization: Bearer ${JWT_TOKEN}"

# Expected response: {"valid": true, "totalLogs": 150}
```

**CSV Import Test:**
```bash
# 1. Download template
curl http://localhost:5000/api/backdoor/csv/templates/customers -o customers_template.csv

# 2. Fill with test data (10 rows)

# 3. Upload and validate
curl -X POST http://localhost:5000/api/backdoor/csv/import/validate \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -F "file=@customers_template.csv" \
  -F "entity_type=customers"

# 4. Review dry-run preview

# 5. Confirm import
curl -X POST http://localhost:5000/api/backdoor/csv/import/execute \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{"jobId": "${JOB_ID}"}'
```

---

### Rollback & Disaster Recovery

**Rollback Scenarios:**

**Scenario 1: Accidental Cleanup**
```bash
# 1. Identify pre-cleanup backup
SELECT * FROM backups WHERE backup_type = 'pre_cleanup' ORDER BY created_at DESC LIMIT 1;

# 2. Restore from backup (see restore procedure above)

# 3. Verify data restored
SELECT COUNT(*) FROM contracts; -- Should match pre-cleanup count
```

**Scenario 2: Failed CSV Import**
```bash
# Within 24 hours of import
curl -X POST http://localhost:5000/api/backdoor/csv/import/${JOB_ID}/rollback \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

**Scenario 3: Ransomware Attack**
```bash
# 1. Identify last known good backup (before attack)
SELECT * FROM backups WHERE created_at < '2025-01-15 10:00:00' ORDER BY created_at DESC LIMIT 1;

# 2. Restore from backup

# 3. Change all passwords (via backdoor admin)

# 4. Review audit logs for breach timeline
```

---

### Performance Optimization

**Backup Performance:**
- Use `pg_dump --jobs=4` for parallel dumping (4-core systems)
- Compress with `pigz` instead of `gzip` for multi-core compression
- Schedule backups during low-traffic periods (2-4 AM)
- Use incremental backups if database > 10GB

**CSV Import Performance:**
- Batch size: 500 rows (adjustable based on row complexity)
- Use database transactions for rollback capability
- Disable indexes during large imports, rebuild after
- Use `COPY` instead of `INSERT` for 10,000+ rows

**Audit Log Performance:**
- Index on `timestamp` and `action` columns
- Partition table by month if logs > 1 million rows
- Archive old logs (> 1 year) to separate table

---

### Security Hardening

**Backdoor Admin Access:**
- Generate strong TOTP secret: `speakeasy.generateSecret({length: 32})`
- Rotate TOTP secret annually
- Use IP allowlist (never allow 0.0.0.0/0)
- Implement rate limiting (5 attempts / 15 minutes)
- Monitor failed login attempts

**Backup Encryption:**
- Use strong encryption key (32+ random bytes)
- Rotate encryption keys annually
- Store encryption keys in secure vault (AWS Secrets Manager, HashiCorp Vault)
- Never commit encryption keys to git

**Database Access:**
- Use read-only database user for backups (if possible)
- Restrict backdoor_audit_logs table to backdoor admin only
- Enable PostgreSQL audit logging for superuser actions

---

### Compliance & Audit Support

**SOC 2 Type II Requirements:**
- ✅ Complete audit trail of administrative actions
- ✅ Immutable logs with tamper detection
- ✅ Access controls (IP allowlist, MFA)
- ✅ Regular backup testing and verification

**ISO 27001 Requirements:**
- ✅ Security event logging
- ✅ Incident response procedures (disaster recovery)
- ✅ Access control monitoring
- ✅ Cryptographic controls (AES-256, SHA-256)

**GDPR Requirements:**
- ✅ Data processing records (audit logs)
- ✅ Right to erasure capability (cleanup system)
- ✅ Data export capability (CSV export)
- ✅ Accountability mechanisms (immutable audit trail)

**Audit Deliverables:**
- Backup verification reports (monthly)
- Hash chain verification reports (weekly)
- Backdoor access logs (monthly review)
- Disaster recovery test results (quarterly)

---

### Troubleshooting Guide

**Problem: Backup fails with "insufficient disk space"**
```bash
# Check disk usage
df -h /backups/

# Clean up old backups
find /backups/ -name "*.dump.gz.enc" -mtime +30 -delete

# Or increase backup retention from 30 to 7 days
UPDATE backups SET retention_days = 7 WHERE backup_type = 'scheduled';
```

**Problem: Hash chain verification fails**
```bash
# Identify broken link
SELECT id, action, timestamp FROM backdoor_audit_logs ORDER BY id;

# Check logs before and after break
SELECT * FROM backdoor_audit_logs WHERE id BETWEEN ${broken_id - 1} AND ${broken_id + 1};

# This indicates tampering - contact security team immediately
```

**Problem: CSV import hangs at 50%**
```bash
# Check import job status
SELECT * FROM csv_import_jobs WHERE id = ${JOB_ID};

# Check for database locks
SELECT * FROM pg_stat_activity WHERE state = 'active';

# Kill long-running query if needed
SELECT pg_terminate_backend(${PID});

# Rollback import
curl -X POST .../csv/import/${JOB_ID}/rollback
```

**Problem: Backdoor admin cannot login**
```bash
# Verify environment variables
echo $BACKDOOR_ADMIN_PASSWORD
echo $BACKDOOR_TOTP_SECRET

# Check IP allowlist
echo $BACKDOOR_IP_ALLOWLIST

# Verify current IP is allowed
curl ifconfig.me  # Check your public IP

# Temporarily disable IP check (emergency only)
# Edit environment variable: BACKDOOR_IP_ALLOWLIST=0.0.0.0/0
```

---

### Future Enhancements (Post-Implementation)

**Potential Additions:**
- Point-in-time recovery (transaction log replay)
- Incremental backups (reduce storage costs)
- Multi-region backup replication
- Automated disaster recovery testing
- Backup compression optimization (zstd instead of gzip)
- Backup lifecycle management (automatic archival to glacier)

**Integration Opportunities:**
- Slack/Teams notifications for backup failures
- PagerDuty integration for critical alerts
- Grafana dashboards for monitoring
- AWS Lambda for serverless backup orchestration

---

**For More Information:**
- Full specification: `SYSTEM_ADMINISTRATOR_SUITE.md`
- Customer presentation: `SYSTEM_ADMIN_SUITE_CUSTOMER_SUMMARY.md`
- Feature tracking: `MISSING_FEATURES.md` (Feature #20)

---

**End of Maintenance Guide**

