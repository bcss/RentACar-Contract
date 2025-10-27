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
9. [Common Issues & Solutions](#common-issues--solutions)

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

For any discrepancies, replit.md and MASTER_FEATURE_LIST.md take precedence.

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
SESSION_NAME=marmar.sid      # Session cookie name

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

BACKUP_DIR="/var/backups/marmar"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/marmar_backup_$DATE.sql.gz"

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
find $BACKUP_DIR -name "marmar_backup_*.sql.gz" -mtime +30 -delete

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
0 2 * * * /path/to/backup-database.sh >> /var/log/marmar-backup.log 2>&1
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
gunzip -c marmar_backup_20250121_020000.sql.gz | psql "$DATABASE_URL"
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
gunzip -c /var/backups/marmar/latest.sql.gz | psql test_restore

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
find /var/backups/marmar -mtime +30 -delete

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
gunzip -c /var/backups/marmar/latest.sql.gz | psql "$DATABASE_URL"

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

