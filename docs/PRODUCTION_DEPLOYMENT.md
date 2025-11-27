# KarāraOS Production Deployment Guide

## Table of Contents
1. [Overview](#overview)
2. [Security Fixes Applied](#security-fixes-applied)
3. [Environment Variables](#environment-variables)
4. [Pre-Deployment Checklist](#pre-deployment-checklist)
5. [Deployment Steps](#deployment-steps)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Health Checks](#health-checks)
8. [Troubleshooting](#troubleshooting)
9. [Rollback Procedures](#rollback-procedures)

---

## Overview

This guide provides comprehensive instructions for deploying KarāraOS (Rental Car Contract Management System) to a production environment. The application is designed to run on Linux servers behind a reverse proxy (Nginx, Apache, or cloud load balancer).

**Architecture:**
- **Frontend**: React + TypeScript (served as static files in production)
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Neon serverless or self-hosted)
- **Session Store**: PostgreSQL-backed sessions
- **Deployment**: Single server with reverse proxy + SSL/TLS

---

## Security Fixes Applied

### Critical Security Improvements (Nov 16, 2025)

#### 1. **Mandatory Super Admin Password in Production**
- **Issue**: Previously allowed weak default password (`Admin@123456`) in production
- **Fix**: Production deployment now **REQUIRES** `SUPER_ADMIN_PASSWORD` environment variable
- **Impact**: Application will fail to start if not set in production
- **Action Required**: Generate and set a strong password before deployment

#### 2. **Configurable Session Timeout**
- **Issue**: Session TTL was hard-coded (1 hour for local auth, 7 days for Replit auth)
- **Fix**: Added `SESSION_MAX_AGE` environment variable
- **Default**: 1 hour (3600000 ms) for security
- **Action Required**: Configure based on your security requirements

#### 3. **Environment-Specific Security Controls**
- `NODE_ENV=production` enables:
  - Static file serving (no Vite dev server)
  - Secure cookies (HTTPS-only)
  - HSTS headers
  - Production logging

---

## Environment Variables

### Required Variables

These variables **MUST** be set for production deployment:

#### **DATABASE_URL** (CRITICAL)
- **Purpose**: PostgreSQL connection string for all database operations
- **Format**: `postgresql://username:password@host:port/database`
- **Example**: `postgresql://rccms_user:SecurePass123!@db.example.com:5432/rccms_production`
- **Security**: 
  - Use strong database password (min 16 characters)
  - Never commit to version control
  - Restrict database access to application server IP only
- **Notes**: All PG* variables are auto-derived from this on Replit

#### **SESSION_SECRET** (CRITICAL)
- **Purpose**: Encryption key for session cookies and CSRF tokens
- **Format**: Random string (minimum 32 characters)
- **Generate**: `openssl rand -base64 32`
- **Example**: `K8vN2xP9mQ5fR7tY3zL6wJ4hG1dS8aB0cE+uI/oM=`
- **Security**:
  - MUST be cryptographically random
  - Change this when rotating secrets
  - Never reuse across environments
- **Impact**: Changing this invalidates all active sessions

#### **SUPER_ADMIN_PASSWORD** (NEW - REQUIRED IN PRODUCTION)
- **Purpose**: Initial super administrator password
- **Format**: Strong password meeting complexity requirements
- **Generate**: `openssl rand -base64 24`
- **Example**: `xK8#mP2$vL9@nQ5!rT7%wJ4&hG1`
- **Security**:
  - Minimum 8 characters
  - Must include: uppercase, lowercase, number, special character
  - Cannot contain common passwords
  - **CRITICAL**: Application will fail to start in production if not set
- **Username**: Defaults to `superadmin` (configurable via SUPER_ADMIN_USERNAME)
- **Post-Deployment**: 
  - Login immediately and change password via UI
  - Consider creating individual admin accounts
  - Disable or rotate this account after setup

#### **NODE_ENV**
- **Purpose**: Environment mode (development/production)
- **Required Value**: `production`
- **Example**: `NODE_ENV=production`
- **Impact**:
  - Enables static file serving
  - Disables Vite dev server
  - Enables secure cookies
  - Optimizes logging
- **Warning**: Do NOT use `development` in production

---

### Optional Variables (With Recommended Defaults)

#### **PORT**
- **Purpose**: HTTP server listening port
- **Default**: `5000`
- **Example**: `PORT=5000`
- **Notes**: 
  - Application binds to `0.0.0.0` (all interfaces)
  - Reverse proxy should forward to this port
  - Do not expose directly to internet

#### **SESSION_MAX_AGE** (NEW)
- **Purpose**: Session cookie lifetime in milliseconds
- **Default**: `3600000` (1 hour)
- **Valid Range**: `300000` (5 minutes) to `2592000000` (30 days)
- **Common Values**:
  - 1 hour: `3600000` (recommended for high security)
  - 8 hours: `28800000` (business day)
  - 24 hours: `86400000` (full day)
  - 7 days: `604800000` (convenience, lower security)
- **Example**: `SESSION_MAX_AGE=28800000`
- **Notes**: 
  - Shorter = more secure, less convenient
  - Also enforces 15-minute idle timeout regardless of max age
  - Invalid values (NaN, too short, too long) will default to 1 hour with warning
  - Application will log warning if misconfigured
  - Balance security with user experience

#### **SUPER_ADMIN_USERNAME**
- **Purpose**: Username for initial super administrator
- **Default**: `superadmin`
- **Example**: `SUPER_ADMIN_USERNAME=admin`
- **Notes**: Only used on first startup or when creating super admin

#### **TRUST_PROXY**
- **Purpose**: Trust X-Forwarded-* headers from reverse proxy
- **Default**: Not set (should be enabled)
- **Example**: `TRUST_PROXY=true`
- **Required When**: Behind Nginx, Apache, cloud load balancer
- **Impact**: Enables correct client IP logging and HTTPS detection

---

### PostgreSQL Connection Variables (Auto-Derived on Replit)

These are automatically extracted from `DATABASE_URL` on Replit. For manual deployment, you may need to set them:

- **PGHOST**: Database server hostname
- **PGPORT**: Database server port (usually `5432`)
- **PGUSER**: Database username
- **PGPASSWORD**: Database password
- **PGDATABASE**: Database name

**Example:**
```bash
PGHOST=db.example.com
PGPORT=5432
PGUSER=rccms_user
PGPASSWORD=SecurePass123!
PGDATABASE=rccms_production
```

---

### Replit-Specific Variables (Not Required for Standard Deployments)

Only needed if deploying on Replit platform:

- **REPLIT_DOMAINS**: Replit domain configuration
- **ISSUER_URL**: OIDC issuer URL (defaults to `https://replit.com/oidc`)
- **REPL_ID**: Replit application ID

---

## Pre-Deployment Checklist

### 1. Infrastructure Preparation

- [ ] **Provision Linux server** (Ubuntu 20.04+ or similar)
  - Minimum: 2 vCPU, 4GB RAM, 40GB storage
  - Recommended: 4 vCPU, 8GB RAM, 100GB storage
  
- [ ] **Set up PostgreSQL database**
  - Version: PostgreSQL 14+ recommended
  - Create database: `rccms_production`
  - Create user with full permissions
  - Configure `pg_hba.conf` to allow application server access
  - Test connection from application server

- [ ] **Install required software**
  ```bash
  # Update system
  sudo apt update && sudo apt upgrade -y
  
  # Install Node.js 20.x
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
  
  # Install PostgreSQL client tools
  sudo apt install -y postgresql-client
  
  # Install Nginx (reverse proxy)
  sudo apt install -y nginx
  
  # Install certbot for SSL
  sudo apt install -y certbot python3-certbot-nginx
  ```

- [ ] **Configure firewall**
  ```bash
  sudo ufw allow 22/tcp    # SSH
  sudo ufw allow 80/tcp    # HTTP
  sudo ufw allow 443/tcp   # HTTPS
  sudo ufw enable
  ```

### 2. Security Preparation

- [ ] **Generate strong secrets**
  ```bash
  # Database password (save this!)
  openssl rand -base64 24
  
  # Session secret (save this!)
  openssl rand -base64 32
  
  # Super admin password (save this!)
  openssl rand -base64 24
  ```

- [ ] **Prepare SSL/TLS certificate**
  - Option A: Let's Encrypt (free, recommended)
    ```bash
    sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
    ```
  - Option B: Commercial certificate
  - Option C: Cloud load balancer handles SSL

- [ ] **Secure environment variables**
  - Create `.env.production` file (NOT in git)
  - Set appropriate file permissions: `chmod 600 .env.production`
  - Consider using secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.)

### 3. Application Preparation

- [ ] **Clone repository**
  ```bash
  cd /var/www
  sudo mkdir rccms
  sudo chown $USER:$USER rccms
  cd rccms
  git clone <your-repo-url> .
  ```

- [ ] **Install dependencies**
  ```bash
  npm ci --production
  ```

- [ ] **Build application**
  ```bash
  npm run build
  ```

- [ ] **Create environment file**
  ```bash
  cat > .env.production << 'EOF'
  # Database
  DATABASE_URL=postgresql://rccms_user:YOUR_DB_PASSWORD@localhost:5432/rccms_production
  
  # Session Security
  SESSION_SECRET=YOUR_GENERATED_SESSION_SECRET
  SESSION_MAX_AGE=28800000
  
  # Super Admin (REQUIRED)
  SUPER_ADMIN_PASSWORD=YOUR_GENERATED_ADMIN_PASSWORD
  SUPER_ADMIN_USERNAME=superadmin
  
  # Application
  NODE_ENV=production
  PORT=5000
  TRUST_PROXY=true
  
  # PostgreSQL Details (auto-derived from DATABASE_URL on Replit)
  PGHOST=localhost
  PGPORT=5432
  PGUSER=rccms_user
  PGPASSWORD=YOUR_DB_PASSWORD
  PGDATABASE=rccms_production
  EOF
  
  chmod 600 .env.production
  ```

---

## Deployment Steps

### Step 1: Database Setup

```bash
# Connect to PostgreSQL
psql "postgresql://rccms_user:YOUR_DB_PASSWORD@localhost:5432/rccms_production"

# Verify connection
\conninfo
\dt

# Exit
\q
```

### Step 2: Run Database Migrations

```bash
# Load environment variables
export $(cat .env.production | xargs)

# Run migrations (creates all tables and indexes)
npm run db:push

# Verify tables were created
psql "$DATABASE_URL" -c "\dt"
```

Expected tables:
- users
- customers
- vehicles
- contracts
- payments
- contract_edits
- audit_logs
- insurance_claims
- system_errors
- company_settings
- financial_settings
- sponsors
- companies
- sessions

### Step 3: Seed Initial Data

The super admin account is automatically created on first startup.

**Optional**: Seed company settings
```bash
# The application will create default settings on first run
# You can customize them later via the admin UI
```

### Step 4: Configure Process Manager (PM2)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'rccms',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    env_production: {
      NODE_ENV: 'production'
    },
    instances: 2,
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup systemd
# Follow the command output instructions

# Monitor application
pm2 status
pm2 logs rccms --lines 50
```

### Step 5: Configure Nginx Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/rccms

# Paste the following configuration:
```

```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;

# Upstream application servers
upstream rccms_backend {
    least_conn;
    server 127.0.0.1:5000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# HTTP -> HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Allow Let's Encrypt validation
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Logging
    access_log /var/log/nginx/rccms_access.log;
    error_log /var/log/nginx/rccms_error.log;
    
    # Client upload limit (for vehicle photos)
    client_max_body_size 20M;
    client_body_timeout 60s;
    
    # Proxy timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # Rate limiting for auth endpoints
    location ~ ^/api/(login|users/change-password) {
        limit_req zone=auth_limit burst=10 nodelay;
        limit_req_status 429;
        
        proxy_pass http://rccms_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Rate limiting for API endpoints
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        limit_req_status 429;
        
        proxy_pass http://rccms_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files (frontend)
    location / {
        proxy_pass http://rccms_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://rccms_backend;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

```bash
# Enable site and test configuration
sudo ln -s /etc/nginx/sites-available/rccms /etc/nginx/sites-enabled/
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 6: Start Application

```bash
# Ensure environment variables are loaded
export $(cat .env.production | xargs)

# Start with PM2
pm2 restart rccms

# Check status
pm2 status
pm2 logs rccms --lines 100
```

**Expected startup output:**
```
✓ Super admin created successfully
  Username: superadmin
Company settings seeded successfully
serving on port 5000
```

**⚠️ CRITICAL**: If you see an error about `SUPER_ADMIN_PASSWORD`, the environment variable is not set correctly.

---

## Post-Deployment Verification

### Step 1: Health Check

```bash
# Internal health check (from server)
curl http://localhost:5000/api/health

# Expected response:
# {"status":"ok"}

# External health check (from your computer)
curl https://yourdomain.com/api/health
```

### Step 2: Test Super Admin Login

1. Open browser: `https://yourdomain.com`
2. Login with:
   - Username: `superadmin` (or your custom SUPER_ADMIN_USERNAME)
   - Password: (value from SUPER_ADMIN_PASSWORD)
3. Verify you can access admin dashboard
4. **IMPORTANT**: Change password immediately via Settings → Change Password

### Step 3: Verify Database Connection

```bash
# Check active database connections
psql "$DATABASE_URL" -c "SELECT count(*) FROM pg_stat_activity WHERE datname='rccms_production';"

# Check sessions table
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM sessions;"

# Check users table
psql "$DATABASE_URL" -c "SELECT id, username, role FROM users;"
```

### Step 4: Test Core Features

- [ ] User authentication (login/logout)
- [ ] Create customer
- [ ] Create vehicle
- [ ] Create contract
- [ ] Record payment
- [ ] Generate PDF
- [ ] Export to Excel
- [ ] View reports (if admin)
- [ ] Audit logs visible
- [ ] System errors logged

### Step 5: Security Verification

```bash
# Verify HTTPS is enforced
curl -I http://yourdomain.com
# Should return 301 redirect to HTTPS

# Verify security headers
curl -I https://yourdomain.com
# Check for:
# - Strict-Transport-Security
# - X-Frame-Options
# - X-Content-Type-Options

# Verify rate limiting
for i in {1..20}; do curl https://yourdomain.com/api/health; done
# Should eventually return 429 Too Many Requests
```

### Step 6: Monitor Logs

```bash
# Application logs
pm2 logs rccms --lines 100

# Nginx access logs
sudo tail -f /var/log/nginx/rccms_access.log

# Nginx error logs
sudo tail -f /var/log/nginx/rccms_error.log

# System errors (database)
psql "$DATABASE_URL" -c "SELECT * FROM system_errors ORDER BY timestamp DESC LIMIT 10;"
```

---

## Health Checks

### Application Health Endpoint

**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "status": "ok"
}
```

**Status Codes**:
- `200`: Application is healthy
- `5xx`: Application error (check logs)

### Database Health

```bash
# Connection test
psql "$DATABASE_URL" -c "SELECT NOW();"

# Table count
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';"

# Session count
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM sessions;"

# Active users
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM users WHERE disabled=false;"
```

### System Resources

```bash
# CPU and Memory
pm2 status

# Disk space
df -h

# Database size
psql "$DATABASE_URL" -c "SELECT pg_size_pretty(pg_database_size('rccms_production'));"

# Network connections
sudo netstat -tulpn | grep :5000
```

---

## Troubleshooting

### Issue: Application Fails to Start

**Error**: `SUPER_ADMIN_PASSWORD environment variable is REQUIRED in production`

**Solution**:
```bash
# Check environment variable is set
echo $SUPER_ADMIN_PASSWORD

# If empty, add to .env.production
echo "SUPER_ADMIN_PASSWORD=$(openssl rand -base64 24)" >> .env.production

# Reload environment and restart
export $(cat .env.production | xargs)
pm2 restart rccms
```

### Issue: Database Connection Failed

**Error**: `DATABASE_URL must be set`

**Solution**:
```bash
# Verify DATABASE_URL is set
echo $DATABASE_URL

# Test database connection manually
psql "$DATABASE_URL" -c "SELECT NOW();"

# Check PostgreSQL is running
sudo systemctl status postgresql

# Check firewall allows connection
sudo ufw status
```

### Issue: Nginx 502 Bad Gateway

**Cause**: Application not running or port mismatch

**Solution**:
```bash
# Check application is running
pm2 status
curl http://localhost:5000/api/health

# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/rccms_error.log

# Restart services
pm2 restart rccms
sudo systemctl restart nginx
```

### Issue: Session Cookie Not Set (Login Fails)

**Cause**: HTTPS mismatch or TRUST_PROXY not set

**Solution**:
```bash
# Verify TRUST_PROXY is enabled
grep TRUST_PROXY .env.production

# Add if missing
echo "TRUST_PROXY=true" >> .env.production

# Restart application
export $(cat .env.production | xargs)
pm2 restart rccms

# Verify secure cookies work over HTTPS
curl -I https://yourdomain.com/api/health
```

### Issue: High Memory Usage

**Solution**:
```bash
# Check PM2 memory usage
pm2 status

# Restart application (clears memory)
pm2 restart rccms

# Reduce PM2 instances if needed
pm2 scale rccms 1

# Configure memory limit in ecosystem.config.js
# max_memory_restart: '1G'
```

### Issue: Database Performance Degradation

**Solution**:
```bash
# Check database size
psql "$DATABASE_URL" -c "SELECT pg_size_pretty(pg_database_size('rccms_production'));"

# Check table sizes
psql "$DATABASE_URL" -c "
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"

# Vacuum and analyze
psql "$DATABASE_URL" -c "VACUUM ANALYZE;"

# Check for missing indexes (already optimized with 40 indexes)
psql "$DATABASE_URL" -c "\di"
```

---

## Rollback Procedures

### Emergency Rollback

If deployment fails or critical issues arise:

```bash
# Stop application
pm2 stop rccms

# Restore database from backup
gunzip -c /var/backups/rccms/backup_TIMESTAMP.sql.gz | psql "$DATABASE_URL"

# Revert to previous code version
git checkout <previous-commit-hash>
npm ci --production
npm run build

# Restart application
pm2 restart rccms

# Verify health
curl http://localhost:5000/api/health
```

### Database Backup

**Before deployment, always backup:**

```bash
# Create backup directory
sudo mkdir -p /var/backups/rccms
sudo chown $USER:$USER /var/backups/rccms

# Backup database
pg_dump "$DATABASE_URL" | gzip > /var/backups/rccms/backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Verify backup
gunzip -c /var/backups/rccms/backup_*.sql.gz | head -n 20
```

**Automated daily backups:**

```bash
# Create backup script
cat > /usr/local/bin/rccms-backup.sh << 'EOF'
#!/bin/bash
export $(cat /var/www/rccms/.env.production | xargs)
BACKUP_DIR="/var/backups/rccms"
BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz"
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"
# Keep only last 30 days
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30 -delete
EOF

sudo chmod +x /usr/local/bin/rccms-backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/rccms-backup.sh") | crontab -
```

---

## Security Best Practices

### 1. Secret Management

- ✅ Never commit secrets to version control
- ✅ Use `.gitignore` for `.env.production`
- ✅ Rotate `SESSION_SECRET` periodically (invalidates all sessions)
- ✅ Use secrets manager in production (AWS Secrets Manager, Azure Key Vault, etc.)

### 2. Database Security

- ✅ Use strong database password (min 16 characters)
- ✅ Restrict database access to application server IP only
- ✅ Enable SSL/TLS for database connections
- ✅ Regular backups (automated daily)
- ✅ Test backup restoration quarterly

### 3. Network Security

- ✅ Firewall: Allow only ports 22, 80, 443
- ✅ SSH: Use key-based authentication, disable password login
- ✅ HTTPS: Use Let's Encrypt or commercial certificate
- ✅ Rate limiting: Already configured in application and Nginx

### 4. Application Security

- ✅ Keep Node.js and npm packages updated
- ✅ Run security audits: `npm audit`
- ✅ Monitor error logs for suspicious activity
- ✅ Enable audit logging (already implemented)
- ✅ Regular password rotation policy for users
- ✅ Multi-factor authentication (future enhancement)

### 5. Monitoring

- ✅ Set up alerts for application errors
- ✅ Monitor disk space, memory, CPU
- ✅ Track failed login attempts
- ✅ Monitor database connection pool
- ✅ Log rotation to prevent disk fill

---

## Summary

### Critical Actions Before Production

1. ✅ Generate strong `SUPER_ADMIN_PASSWORD`
2. ✅ Generate secure `SESSION_SECRET`
3. ✅ Set `NODE_ENV=production`
4. ✅ Configure `DATABASE_URL` with production database
5. ✅ Set `TRUST_PROXY=true` if behind reverse proxy
6. ✅ Run database migrations
7. ✅ Configure SSL/TLS certificate
8. ✅ Set up automated backups
9. ✅ Configure monitoring and alerting
10. ✅ Test all core features

### Post-Deployment Actions

1. ✅ Login as super admin
2. ✅ Change super admin password via UI
3. ✅ Create individual admin/manager accounts
4. ✅ Configure company settings
5. ✅ Configure financial settings
6. ✅ Test end-to-end workflows
7. ✅ Verify backups are working
8. ✅ Monitor logs for 24-48 hours

---

## Support

For issues or questions:
- Check application logs: `pm2 logs rccms`
- Check database logs: `psql "$DATABASE_URL" -c "SELECT * FROM system_errors ORDER BY timestamp DESC LIMIT 20;"`
- Review this guide's [Troubleshooting](#troubleshooting) section
- Check Nginx logs: `sudo tail -f /var/log/nginx/rccms_error.log`

---

**Document Version**: 1.0  
**Last Updated**: November 16, 2025  
**Security Fixes**: Super admin password enforcement, configurable session TTL

---

## 📱 Communications Platform Setup

### Provider Configuration

**Required Environment Variables:**

```bash
# Twilio SMS (Primary)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+971xxxxxxxxx

# SendGrid Email (Primary)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME="KarāraOS Notifications"

# Gmail SMTP (Fallback Email)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
GMAIL_HOST=smtp.gmail.com
GMAIL_PORT=587
```

### Provider Setup Steps

**1. Twilio SMS Setup:**
```bash
1. Create account at twilio.com
2. Verify phone number
3. Purchase Twilio phone number
4. Get Account SID and Auth Token
5. Add to Replit Secrets:
   - TWILIO_ACCOUNT_SID
   - TWILIO_AUTH_TOKEN
   - TWILIO_PHONE_NUMBER
```

**2. SendGrid Email Setup:**
```bash
1. Create account at sendgrid.com
2. Verify sender email domain
3. Create API key with "Mail Send" permissions
4. Add to Replit Secrets:
   - SENDGRID_API_KEY
   - SENDGRID_FROM_EMAIL
   - SENDGRID_FROM_NAME
```

**3. Gmail SMTP Setup (Optional Fallback):**
```bash
1. Enable 2-factor authentication on Gmail
2. Generate app-specific password
3. Add to Replit Secrets:
   - GMAIL_USER
   - GMAIL_APP_PASSWORD
   - GMAIL_HOST=smtp.gmail.com
   - GMAIL_PORT=587
```

### Database Seeding

**Initial Provider Configuration:**
```sql
-- Run after deployment to seed providers

-- SMS Provider (Twilio)
INSERT INTO communication_providers (
  name, provider_type, channel, is_active, priority, 
  account_sid, auth_token, from_number
) VALUES (
  'Twilio SMS', 'twilio', 'sms', true, 10,
  'ACxxxxxxxx', 'your_token', '+971xxxxxxx'
);

-- Email Provider (SendGrid)
INSERT INTO communication_providers (
  name, provider_type, channel, is_active, priority,
  api_key, from_email, from_name
) VALUES (
  'SendGrid', 'sendgrid', 'email', true, 10,
  'SG.xxxxxxxx', 'noreply@domain.com', 'KarāraOS Notifications'
);

-- Gmail Fallback (Optional)
INSERT INTO communication_providers (
  name, provider_type, channel, is_active, priority,
  smtp_host, smtp_port, smtp_user, smtp_password,
  from_email, from_name
) VALUES (
  'Gmail SMTP', 'gmail', 'email', true, 5,
  'smtp.gmail.com', 587, 'user@gmail.com', 'app_password',
  'user@gmail.com', 'KarāraOS Notifications'
);
```

### Post-Deployment Testing

**1. Test SMS Delivery:**
```bash
1. Navigate to Notifications → Send
2. Select template "Contract Activated"
3. Channel: SMS
4. Enter test phone number
5. Send and verify receipt
6. Check Communication Logs for delivery status
```

**2. Test Email Delivery:**
```bash
1. Navigate to Notifications → Send
2. Select template "Payment Received"
3. Channel: Email
4. Enter test email address
5. Send and verify receipt
6. Check spam folder if not received
7. Check Communication Logs
```

**3. Test Fallback Routing:**
```bash
1. Disable primary provider (set is_active = false)
2. Send test notification
3. Verify fallback provider used
4. Check Communication Logs for provider switch
5. Re-enable primary provider
```

### Production Monitoring

**Health Checks:**
- Monitor provider health status daily
- Set up alerts for provider failures
- Track delivery rates (target >95%)
- Monitor API quota usage

**Cost Management:**
- Twilio: ~$0.0075/SMS (UAE)
- SendGrid: Free tier 100 emails/day, then $19.95/mo for 50k
- Gmail: Free (with daily limits)

**Scaling Considerations:**
- Twilio: 1 message/second default, increase via API
- SendGrid: Rate limits based on plan
- Consider provider load balancing for high volume

### Troubleshooting

**SMS Not Delivered:**
- Verify Twilio account balance
- Check phone number format (+971xxxxxxxxx)
- Review Twilio logs at twilio.com/console
- Verify sender phone number is verified

**Email Not Delivered:**
- Check SendGrid domain verification
- Review SendGrid activity feed
- Verify recipient email format
- Check spam/junk folders
- Review SPF/DKIM records

**Provider Authentication Failed:**
- Verify environment variables set correctly
- Check API key/token expiry
- Test credentials directly with provider
- Review provider account status

---
