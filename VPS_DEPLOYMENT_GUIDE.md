# VPS Deployment Guide
## RCCMS - Rental Car Contract Management System

**For Ubuntu 20.04+ / Debian 11+ Servers**

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Preparation](#server-preparation)
3. [Install Dependencies](#install-dependencies)
4. [PostgreSQL Setup](#postgresql-setup)
5. [Application Installation](#application-installation)
6. [Database Initialization](#database-initialization)
7. [PM2 Process Management](#pm2-process-management)
8. [Nginx Reverse Proxy](#nginx-reverse-proxy)
9. [SSL Certificate Setup](#ssl-certificate-setup)
10. [Security Hardening](#security-hardening)
11. [Monitoring & Maintenance](#monitoring--maintenance)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Server Requirements

**Minimum Specifications:**
- **OS**: Ubuntu 20.04 LTS or Debian 11+
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **Network**: Public IP address

**Recommended Specifications:**
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **Bandwidth**: 100 Mbps+

### Domain Requirements

- Registered domain name (e.g., `your-rental-company.com`)
- DNS configured to point to your VPS IP address
- (Optional) Subdomain for staging (e.g., `staging.your-rental-company.com`)

### Access Requirements

- Root or sudo access to server
- SSH access configured
- Firewall access if behind corporate network

---

## Server Preparation

### 1. Connect to Your Server

```bash
ssh root@your-server-ip
# Or if using non-root user
ssh your-username@your-server-ip
```

### 2. Update System Packages

```bash
# Update package list
sudo apt update

# Upgrade installed packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential
```

### 3. Create Application User

**Security Best Practice**: Run applications as non-root user

```bash
# Create system user for application
sudo useradd -m -s /bin/bash marmar

# Add user to sudo group (if needed for maintenance)
sudo usermod -aG sudo marmar

# Set strong password
sudo passwd marmar
```

### 4. Configure Firewall

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH (important - don't lock yourself out!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

### 5. Configure Timezone

```bash
# Set to your local timezone (example: Asia/Riyadh)
sudo timedatectl set-timezone Asia/Riyadh

# Verify
timedatectl
```

---

## Install Dependencies

### 1. Install Node.js 20.x

**Using NodeSource Repository:**

```bash
# Download and run NodeSource setup script
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should output v20.x.x
npm --version   # Should output 10.x.x or higher
```

**Alternative - Using NVM (Node Version Manager):**

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# Reload shell configuration
source ~/.bashrc

# Install Node.js 20
nvm install 20

# Set as default
nvm alias default 20

# Verify
node --version
```

### 2. Install PostgreSQL 14+

```bash
# Add PostgreSQL repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

# Import repository signing key
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Update package list
sudo apt update

# Install PostgreSQL 14
sudo apt install -y postgresql-14 postgresql-contrib-14

# Verify installation
sudo systemctl status postgresql

# Check version
psql --version  # Should show PostgreSQL 14.x
```

### 3. Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version

# Generate startup script (run as root)
sudo pm2 startup systemd -u marmar --hp /home/marmar
```

### 4. Install Nginx

```bash
# Install Nginx web server
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx

# Verify (should see default nginx page)
curl http://localhost
```

---

## PostgreSQL Setup

### 1. Configure PostgreSQL

**Switch to postgres user:**

```bash
sudo -i -u postgres
```

**Create database and user:**

```bash
# Enter PostgreSQL shell
psql

# Run these SQL commands in psql prompt:
```

```sql
-- Create application database
CREATE DATABASE rccms_db;

-- Create application user with strong password
CREATE USER rccms_user WITH ENCRYPTED PASSWORD 'your_strong_password_here_min_16_chars';

-- Grant all privileges on database
GRANT ALL PRIVILEGES ON DATABASE rccms_db TO rccms_user;

-- Connect to the database
\c rccms_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO rccms_user;

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Exit psql
\q
```

**Exit postgres user:**

```bash
exit
```

### 2. Configure PostgreSQL for Remote Access (Optional)

**Edit postgresql.conf:**

```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

**Find and modify:**

```conf
listen_addresses = 'localhost'  # Keep as localhost if app runs on same server
# OR
listen_addresses = '*'  # Only if you need remote database access
```

**Edit pg_hba.conf for authentication:**

```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

**Add at the end:**

```conf
# Application access
host    rccms_db    rccms_user    127.0.0.1/32    md5
host    rccms_db    rccms_user    ::1/128         md5
```

**Restart PostgreSQL:**

```bash
sudo systemctl restart postgresql
```

### 3. Test Database Connection

```bash
# Test connection
psql -h localhost -U rccms_user -d rccms_db -W

# If successful, you'll see:
# rccms_db=>

# Test query
SELECT current_database(), current_user, version();

# Exit
\q
```

### 4. Configure Database Connection String

```bash
# Your DATABASE_URL will be:
DATABASE_URL=postgresql://rccms_user:your_strong_password@localhost:5432/rccms_db
```

---

## Application Installation

### 1. Switch to Application User

```bash
su - marmar
# Enter password for marmar user
```

### 2. Clone or Upload Application

**Option A - Using Git:**

```bash
# Navigate to home directory
cd ~

# Clone repository (replace with your repo URL)
git clone https://github.com/your-org/rccms-app.git

# Navigate into directory
cd rccms-app
```

**Option B - Upload Files via SCP:**

```bash
# From your local machine:
scp -r /path/to/rccms-app marmar@your-server-ip:~/rccms-app

# Then SSH into server and navigate:
cd ~/rccms-app
```

### 3. Install Application Dependencies

```bash
# Install all Node.js dependencies
npm install

# This may take 2-5 minutes
```

### 4. Configure Environment Variables

```bash
# Create .env file
nano .env
```

**Add the following configuration:**

```env
# Database Configuration
DATABASE_URL=postgresql://rccms_user:your_strong_password@localhost:5432/rccms_db

# Extract individual PostgreSQL parameters (auto-derived from DATABASE_URL)
PGHOST=localhost
PGUSER=rccms_user
PGPASSWORD=your_strong_password
PGDATABASE=rccms_db
PGPORT=5432

# Session Secret (CRITICAL - Generate a strong random string)
# Generate with: openssl rand -base64 32
SESSION_SECRET=your_super_secret_random_string_minimum_32_characters_long

# Application Configuration
NODE_ENV=production
PORT=5000

# Session Configuration
SESSION_MAX_AGE=604800000    # 7 days in milliseconds
SESSION_NAME=marmar.sid

# Security
TRUST_PROXY=true  # Important: Enable if behind nginx reverse proxy
```

**Generate Secure SESSION_SECRET:**

```bash
# Generate random secret
openssl rand -base64 32

# Copy output and paste as SESSION_SECRET value
```

**Set proper permissions:**

```bash
# Protect .env file (read/write for owner only)
chmod 600 .env
```

**Note on Recent Feature Updates:**

The latest system features require NO additional environment variables:
- ✅ Automatic fuel charge calculation (uses existing DATABASE_URL)
- ✅ Financial Settings page with 11 defaults (stored in company_settings table)
- ✅ Vehicle tank capacity tracking (stored in vehicles table)
- ✅ Automatic vehicle status synchronization (database-driven)
- ✅ Customer phone uniqueness validation (database query)
- ✅ Complete UPDATE audit logging (uses existing audit_logs table)

All new features use the existing `DATABASE_URL` connection. No configuration changes needed.

---

## Database Initialization

### 1. Initialize Database Schema

The application uses Drizzle ORM for database schema management.

```bash
# Push schema to database (creates all tables)
npm run db:push

# You should see output like:
# No config path provided, using default 'drizzle.config.ts'
# Reading config file...
# Pushing schema changes to database...
# ✓ Done!
```

**If you encounter errors, force push:**

```bash
npm run db:push --force
```

### 2. Verify Database Tables Created

```bash
# Connect to database
psql -h localhost -U rccms_user -d rccms_db -W
```

```sql
-- List all tables
\dt

-- You should see these tables:
-- - sessions
-- - users
-- - customers
-- - vehicles
-- - sponsors
-- - companies
-- - contracts
-- - payments
-- - audit_logs
-- - contract_edits
-- - system_errors
-- - contract_counter
-- - company_settings
-- - damage_assessments (if applicable)

-- Check a specific table structure
\d users

-- Exit
\q
```

### 3. Create Super Admin User

The application creates a super admin on first run, but you can also create manually:

```bash
# Option 1: Let application create default admin on first start
# Default credentials: username=admin, password=admin123
# CHANGE PASSWORD IMMEDIATELY after first login!

# Option 2: Create manually via database
psql -h localhost -U rccms_user -d rccms_db -W
```

```sql
-- Generate password hash (replace 'your_secure_password' with your chosen password)
-- Use this Node.js command first to generate hash:
-- node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('your_secure_password', 10));"

-- Then insert user:
INSERT INTO users (
  username, 
  password_hash, 
  email, 
  first_name, 
  last_name, 
  role, 
  is_immutable
) VALUES (
  'admin',
  '$2b$10$...',  -- Replace with bcrypt hash from above
  'admin@marmar-rental.com',
  'System',
  'Administrator',
  'admin',
  true  -- Immutable = cannot be deleted
);

\q
```

**Generate Bcrypt Hash:**

```bash
# From application directory
node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('YourSecurePassword123!', 10));"

# Copy the output hash and use in SQL INSERT above
```

### 4. Initialize Company Settings

```sql
psql -h localhost -U rccms_user -d rccms_db -W
```

```sql
-- Insert default company settings (customize with your company information)
INSERT INTO company_settings (
  company_name_en,
  company_name_ar,
  phone,
  email,
  address_en,
  address_ar,
  commercial_registration,
  tax_id
) VALUES (
  'Your Car Rental Company',
  'شركتك لتأجير السيارات',
  '+966 XX XXX XXXX',
  'info@your-company.com',
  'Your Address Here',
  'عنوانك هنا',
  'CR-XXXXXXXX',
  'TAX-XXXXXXXX'
)
ON CONFLICT DO NOTHING;

\q
```

### 5. Build Application

```bash
# Build frontend and backend for production
npm run build

# This creates optimized production build
# Output: dist/ directory for backend, client/dist/ for frontend
```

---

## PM2 Process Management

### 1. Create PM2 Ecosystem File

```bash
# Create PM2 configuration
nano ecosystem.config.js
```

**Add configuration:**

```javascript
module.exports = {
  apps: [{
    name: 'rccms-app',
    script: './dist/index.js',  // Compiled backend entry point
    instances: 2,  // Number of instances (CPU cores)
    exec_mode: 'cluster',  // Cluster mode for load balancing
    watch: false,  // Don't watch in production
    max_memory_restart: '1G',  // Restart if memory exceeds 1GB
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### 2. Create Logs Directory

```bash
mkdir -p ~/rccms-app/logs
```

### 3. Start Application with PM2

```bash
# Start application
pm2 start ecosystem.config.js

# Verify status
pm2 status

# View logs
pm2 logs rccms-app

# Monitor
pm2 monit
```

### 4. Configure PM2 Startup

```bash
# Save PM2 process list
pm2 save

# Already configured during PM2 installation:
# sudo pm2 startup systemd -u marmar --hp /home/marmar

# Verify startup script
sudo systemctl status pm2-marmar
```

### 5. PM2 Management Commands

```bash
# View status
pm2 status

# Restart application
pm2 restart rccms-app

# Stop application
pm2 stop rccms-app

# View logs (last 100 lines)
pm2 logs rccms-app --lines 100

# Monitor resources
pm2 monit

# Reload (zero-downtime restart)
pm2 reload rccms-app

# Delete from PM2
pm2 delete rccms-app

# Show detailed info
pm2 describe rccms-app
```

---

## Nginx Reverse Proxy

### 1. Create Nginx Configuration

```bash
# Create nginx site configuration
sudo nano /etc/nginx/sites-available/rccms-app
```

**Add configuration:**

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    
    # Let's Encrypt challenge location
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    # ssl_trusted_certificate /etc/letsencrypt/live/your-domain.com/chain.pem;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # Client Max Body Size (for uploads)
    client_max_body_size 10M;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90s;
        proxy_connect_timeout 90s;
    }

    # Access and Error Logs
    access_log /var/log/nginx/rccms-app-access.log;
    error_log /var/log/nginx/rccms-app-error.log;
}
```

### 2. Enable Site Configuration

```bash
# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/rccms-app /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Should output:
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Reload nginx
sudo systemctl reload nginx
```

---

## SSL Certificate Setup

### 1. Install Certbot

```bash
# Install Certbot and Nginx plugin
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtain SSL Certificate

```bash
# Get certificate for your domain
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

### 3. Verify SSL Certificate

```bash
# Check certificate
sudo certbot certificates

# Test auto-renewal
sudo certbot renew --dry-run
```

### 4. Configure Auto-Renewal

```bash
# Certbot auto-renewal timer should already be enabled
sudo systemctl status certbot.timer

# If not enabled:
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### 5. Test Your Site

```bash
# Should now be accessible via HTTPS
curl https://your-domain.com

# Check SSL rating at:
# https://www.ssllabs.com/ssltest/analyze.html?d=your-domain.com
```

---

## Security Hardening

### 1. Configure SSH

```bash
# Edit SSH configuration
sudo nano /etc/ssh/sshd_config
```

**Recommended settings:**

```conf
# Disable root login
PermitRootLogin no

# Disable password authentication (use SSH keys)
PasswordAuthentication no

# Enable public key authentication
PubkeyAuthentication yes

# Disable empty passwords
PermitEmptyPasswords no

# Change default SSH port (optional, reduces brute force attempts)
# Port 2222
```

**Restart SSH:**

```bash
sudo systemctl restart sshd
```

### 2. Install Fail2Ban

```bash
# Install fail2ban
sudo apt install -y fail2ban

# Create local configuration
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Edit configuration
sudo nano /etc/fail2ban/jail.local
```

**Enable SSH protection:**

```conf
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
```

**Start fail2ban:**

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Check status
sudo fail2ban-client status
```

### 3. Regular Security Updates

```bash
# Enable automatic security updates
sudo apt install -y unattended-upgrades

# Configure
sudo dpkg-reconfigure --priority=low unattended-upgrades

# Select "Yes" to enable
```

### 4. Database Security

```bash
# Secure PostgreSQL (already done during setup)
# - Strong passwords ✓
# - Limited access ✓
# - localhost only ✓

# Verify postgres not accessible externally
sudo netstat -plnt | grep 5432
# Should show 127.0.0.1:5432 only
```

---

## Monitoring & Maintenance

### 1. Monitor Application Logs

```bash
# PM2 logs
pm2 logs rccms-app

# Nginx access log
sudo tail -f /var/log/nginx/rccms-app-access.log

# Nginx error log
sudo tail -f /var/log/nginx/rccms-app-error.log

# PostgreSQL log
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### 2. Monitor System Resources

```bash
# CPU and Memory
htop

# Disk usage
df -h

# PM2 monitoring
pm2 monit

# Database connections
psql -U rccms_user -d rccms_db -c "SELECT count(*) FROM pg_stat_activity WHERE datname='rccms_db';"
```

### 3. Database Backups

**Create Backup Script:**

```bash
nano ~/backup-database.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/marmar/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/marmar_backup_$DATE.sql.gz"

mkdir -p $BACKUP_DIR

export PGPASSWORD='your_strong_password'
pg_dump -h localhost -U rccms_user -d rccms_db | gzip > "$BACKUP_FILE"

if [ -f "$BACKUP_FILE" ]; then
    echo "Backup successful: $BACKUP_FILE"
    find $BACKUP_DIR -name "marmar_backup_*.sql.gz" -mtime +30 -delete
else
    echo "Backup failed!"
    exit 1
fi
```

**Make executable:**

```bash
chmod +x ~/backup-database.sh
```

**Schedule with Cron:**

```bash
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/marmar/backup-database.sh >> /home/marmar/backup.log 2>&1
```

### 4. Application Updates

```bash
# Pull latest code
cd ~/rccms-app
git pull origin main

# Install dependencies
npm install

# Run database migrations (if any)
npm run db:push

# Rebuild
npm run build

# Reload with zero downtime
pm2 reload rccms-app

# Check logs
pm2 logs rccms-app --lines 50
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs rccms-app --lines 100

# Check if port 5000 is in use
sudo lsof -i :5000

# Check database connection
psql -h localhost -U rccms_user -d rccms_db -W
```

### Nginx Errors

```bash
# Test nginx configuration
sudo nginx -t

# Check nginx error log
sudo tail -50 /var/log/nginx/rccms-app-error.log

# Restart nginx
sudo systemctl restart nginx
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
psql -U rccms_user -d rccms_db -c "SELECT current_database();"

# Verify DATABASE_URL in .env
cat ~/rccms-app/.env | grep DATABASE_URL
```

### High Memory Usage

```bash
# Check PM2 memory
pm2 status

# Restart application
pm2 restart rccms-app

# Reduce PM2 instances if needed
pm2 scale rccms-app 1
```

---

## Final Checklist

- [ ] Server updated and secured
- [ ] PostgreSQL installed and configured
- [ ] Database created and initialized
- [ ] Application deployed and built
- [ ] PM2 running and auto-starting
- [ ] Nginx configured and tested
- [ ] SSL certificate installed
- [ ] Default admin password changed
- [ ] Firewall configured
- [ ] Backups scheduled
- [ ] Monitoring configured
- [ ] DNS pointing to server
- [ ] Application accessible via HTTPS

---

## Quick Reference Commands

```bash
# Application Management
pm2 status                    # Check app status
pm2 restart rccms-app        # Restart app
pm2 logs rccms-app          # View logs
pm2 monit                    # Monitor resources

# Nginx
sudo systemctl status nginx   # Check nginx status
sudo nginx -t                # Test configuration
sudo systemctl reload nginx  # Reload nginx

# Database
psql -U rccms_user -d rccms_db  # Connect to DB
sudo systemctl status postgresql   # Check PostgreSQL

# System
sudo ufw status              # Check firewall
htop                        # System resources
df -h                       # Disk space
```

---

**Deployment Complete!**

Your RCCMS Rental Car Contract Management System should now be running at `https://your-domain.com`

**Default Login:**
- Username: `admin`
- Password: `admin123` (CHANGE IMMEDIATELY!)

For additional help, refer to the **Administrator Guide** and **Maintenance Guide**.
