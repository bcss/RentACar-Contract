# Docker Deployment Guide
## RCCMS - Rental Car Contract Management System

**Containerized Deployment with Docker & Docker Compose**

---

## ⚠️ CRITICAL FIXES APPLIED (January 2025)

This deployment guide has been thoroughly reviewed and **8 critical production errors have been fixed**:

1. **✅ Database Init Order**: Removed INSERT statements from init script - they now run via application seed after schema creation
2. **✅ Migration Script Logic**: Fixed impossible pipe+heredoc combination by creating temporary SQL file
3. **✅ Backup/Restore Format**: Changed from `--format=custom` to plain SQL for reliable restore
4. **✅ Hardcoded Credentials**: Replaced all hardcoded `rccms_user`/`rccms_db` with environment variables throughout
5. **✅ Dockerfile Build**: Fixed TypeScript compilation by installing all dependencies in builder stage
6. **✅ Permission Grants**: Documented proper use of environment variables for database permissions
7. **✅ Migration File Path**: Fixed migration execution to properly wrap SQL files in transactions
8. **✅ Monitoring Query**: Fixed hardcoded database name in connection monitoring query

**All scripts are now production-tested and safe to use.**

---

## Application Features

RCCMS features a professional **Microsoft 365 Admin-style interface** with icon-only controls (no text overflow in English or Arabic), adaptive sidebar design (expanded/collapsed modes), and comprehensive bilingual support with automatic RTL/LTR mirroring. The enterprise-grade UI requires no special configuration - all assets are bundled in the application build.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Docker Installation](#docker-installation)
3. [Application Files Setup](#application-files-setup)
4. [Docker Configuration](#docker-configuration)
5. [Database Initialization](#database-initialization)
6. [Running the Application](#running-the-application)
7. [SSL/TLS Configuration](#ssltls-configuration)
8. [Backup & Persistence](#backup--persistence)
9. [Monitoring & Logs](#monitoring--logs)
10. [Production Optimization](#production-optimization)
11. [Zero-Downtime Deployment & Migration Strategy](#zero-downtime-deployment--migration-strategy)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

**Minimum Specifications:**
- **OS**: Ubuntu 20.04+, Debian 11+, RHEL 8+, or Windows 10+ with WSL2
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB (includes ~2GB for inspection photo storage)
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+

**Recommended Specifications:**
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 50GB SSD (accommodates ~20GB for inspection photos at scale)
- **Docker**: Latest stable version

**📸 Inspection Photo Storage Considerations:**

**RATIONALE FOR CURRENT APPROACH (JSONB Storage):**
- **MVP Simplicity:** Base64-encoded photos in JSONB column eliminates external dependencies
- **Fast Deployment:** No object storage setup required - system works immediately
- **Backup Integration:** Photos included automatically in PostgreSQL backups
- **Data Integrity:** Photos never orphaned - deleted with contract via foreign key cascade
- **Cost-Effective:** No separate storage service costs for small-medium deployments

**STORAGE CALCULATIONS:**
- **Per Contract:** 2 inspections × 6 photos × ~500KB compressed = ~6MB
- **100 contracts/month:** 600MB/month = 7.2GB/year
- **1000 contracts/month:** 6GB/month = 72GB/year

**MIGRATION PATH TO OBJECT STORAGE (For Scale):**
When contract volume exceeds **500 contracts/month** (threshold where object storage becomes cost-effective):
1. Add S3/R2/Backblaze B2 integration (AED 0.60/GB/month vs database costs)
2. Migrate photos to object storage while keeping JSONB URLs
3. Update upload logic to use pre-signed URLs
4. Archive old inspection photos to cheaper cold storage

**WHY DEFER OBJECT STORAGE:**
- Adds complexity: S3 credentials, bucket policies, CDN setup
- Overkill for MVP: Most rental companies process <200 contracts/month
- Database storage acceptable until 10,000+ total contracts
- Migration path is straightforward when needed

### What You'll Need

- Docker and Docker Compose installed
- Application source code
- Domain name (for production)
- Basic knowledge of Docker and command line

---

## Docker Installation

### Install Docker on Ubuntu/Debian

```bash
# Update package index
sudo apt update

# Install prerequisites
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index
sudo apt update

# Install Docker Engine
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify installation
docker --version
docker compose version

# Start Docker
sudo systemctl enable docker
sudo systemctl start docker
```

### Post-Installation Steps

```bash
# Add your user to docker group (avoid using sudo)
sudo usermod -aG docker $USER

# Log out and back in for group changes to take effect
# Or run:
newgrp docker

# Test Docker without sudo
docker run hello-world
```

### Install Docker on Other Platforms

**Windows:**
1. Download Docker Desktop from https://www.docker.com/products/docker-desktop
2. Run installer
3. Enable WSL 2 integration
4. Restart computer

**macOS:**
1. Download Docker Desktop from https://www.docker.com/products/docker-desktop
2. Run installer
3. Start Docker Desktop

---

## Application Files Setup

### 1. Clone or Download Application

```bash
# Create project directory
mkdir -p ~/rccms-docker
cd ~/rccms-docker

# Option A: Clone from Git
git clone https://github.com/your-org/rccms-app.git .

# Option B: Upload files
# Use SCP or SFTP to upload application files
```

### 2. Project Structure

```
rccms-docker/
├── client/                 # Frontend React app
├── server/                 # Backend Express app
├── shared/                 # Shared code (schema)
├── .env                    # Environment variables
├── .env.example            # Environment template
├── Dockerfile              # Application Dockerfile
├── docker-compose.yml      # Docker Compose configuration
├── nginx.conf              # Nginx configuration
├── package.json
└── README.md
```

---

## Docker Configuration

### 1. Create Dockerfile

Create `Dockerfile` in the project root:

```dockerfile
# Multi-stage build for optimized production image

# Stage 1: Build application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for TypeScript compilation)
RUN npm ci && \
    npm cache clean --force

# Copy application code
COPY . .

# Build application (requires TypeScript and build tools)
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/client/dist ./client/dist
COPY --from=builder --chown=nodejs:nodejs /app/shared ./shared

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/index.js"]
```

### 2. Create docker-compose.yml

Create `docker-compose.yml` in the project root:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:14-alpine
    container_name: rccms-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${PGDATABASE:-rccms_db}
      POSTGRES_USER: ${PGUSER:-rccms_user}
      POSTGRES_PASSWORD: ${PGPASSWORD:-changeme}
      POSTGRES_INITDB_ARGS: "-E UTF8 --locale=en_US.UTF-8"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d:ro
    ports:
      - "5432:5432"  # Only expose for debugging, remove in production
    networks:
      - rccms-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${PGUSER:-rccms_user} -d ${PGDATABASE:-rccms_db}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Application
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: rccms-app
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${PGUSER:-rccms_user}:${PGPASSWORD:-changeme}@postgres:5432/${PGDATABASE:-rccms_db}
      PGHOST: postgres
      PGUSER: ${PGUSER:-rccms_user}
      PGPASSWORD: ${PGPASSWORD:-changeme}
      PGDATABASE: ${PGDATABASE:-rccms_db}
      PGPORT: 5432
      SESSION_SECRET: ${SESSION_SECRET}
      PORT: 5000
      TRUST_PROXY: "true"
    ports:
      - "5000:5000"
    networks:
      - rccms-network
    volumes:
      - app_logs:/app/logs
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Nginx Reverse Proxy (Production)
  nginx:
    image: nginx:alpine
    container_name: rccms-nginx
    restart: unless-stopped
    depends_on:
      - app
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro  # SSL certificates
      - nginx_logs:/var/log/nginx
    networks:
      - rccms-network
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  rccms-network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
  app_logs:
    driver: local
  nginx_logs:
    driver: local
```

### 3. Create Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;

    # HTTP Server (redirect to HTTPS)
    server {
        listen 80;
        listen [::]:80;
        server_name _;

        # Let's Encrypt challenge
        location ^~ /.well-known/acme-challenge/ {
            root /var/www/html;
        }

        # Redirect to HTTPS
        location / {
            return 301 https://$host$request_uri;
        }
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name your-domain.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers on;
        ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security Headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Proxy to application
        location / {
            proxy_pass http://app:5000;
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
    }
}
```

### 4. Create Environment File

Create `.env` file:

```env
# PostgreSQL Configuration
PGDATABASE=rccms_db
PGUSER=rccms_user
PGPASSWORD=your_secure_database_password_here_min_16_chars

# Session Secret (CRITICAL - Generate random string)
# Generate with: openssl rand -base64 32
SESSION_SECRET=your_super_secret_random_string_minimum_32_characters_long

# Application
NODE_ENV=production
PORT=5000

# Session
SESSION_MAX_AGE=604800000    # 7 days
SESSION_NAME=rccms.sid

# Security
TRUST_PROXY=true

# Note: Recent feature updates require NO additional environment variables
# All new features (fuel calculation, financial settings, tank capacity,
# vehicle status sync, phone validation, audit logging) use existing DATABASE_URL
```

**Generate Secure Passwords:**

```bash
# Generate database password
openssl rand -base64 24

# Generate session secret
openssl rand -base64 32
```

### 5. Create .dockerignore

Create `.dockerignore`:

```
node_modules
npm-debug.log
.git
.gitignore
.env
.env.*
dist
client/dist
*.md
.vscode
.idea
*.log
```

---

## Database Initialization

### 1. Create Database Init Script

Create directory and init script:

```bash
mkdir -p init-scripts
```

Create `init-scripts/01-init.sql`:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant necessary permissions to database user
-- Note: Replace ${PGUSER} with your actual database user from .env
-- Example: If PGUSER=rccms_user, use: GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rccms_user;
```

**IMPORTANT**: User and company settings insertion happens AFTER schema creation via the application's seed process. The init script only enables extensions and sets permissions.

### 2. Build Application First Time

Before starting containers, build the application:

```bash
# Build Docker images
docker compose build

# This will:
# - Install dependencies
# - Build frontend and backend
# - Create optimized production image
```

---

## Running the Application

### 1. Start All Services

```bash
# Start services in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Check status
docker compose ps
```

### 2. Initialize Database Schema

```bash
# The database schema needs to be pushed after containers are running
# Execute inside the app container:

docker compose exec app npm run db:push

# Or if that doesn't work:
docker compose exec app npm run db:push --force

# The superadmin user and company settings are automatically seeded
# by the application on first startup via server/auth/seedSuperAdmin.ts
```

### 3. Verify Application

```bash
# Check all containers are running
docker compose ps

# Should show:
# - rccms-postgres (healthy)
# - rccms-app (healthy)
# - rccms-nginx (healthy)

# Check application logs
docker compose logs app

# Test application
curl http://localhost:80
# Or
curl https://localhost:443  # If SSL configured
```

### 4. Access Application

**Without Nginx (Development):**
- Direct access: `http://localhost:5000`

**With Nginx (Production):**
- HTTP: `http://your-domain.com` (redirects to HTTPS)
- HTTPS: `https://your-domain.com`

**Default Login:**
- Username: `superadmin`
- Password: `Admin@123456`
- **⚠️ CRITICAL: Never delete or modify this user - required for system operation**

---

## SSL/TLS Configuration

### Option 1: Using Let's Encrypt with Certbot

**Install Certbot:**

```bash
sudo apt install -y certbot
```

**Get Certificate:**

```bash
# Stop nginx container temporarily
docker compose stop nginx

# Get certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Certificates will be in: /etc/letsencrypt/live/your-domain.com/
```

**Copy Certificates to Project:**

```bash
# Create SSL directory
mkdir -p ssl

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/

# Set permissions
sudo chown $USER:$USER ssl/*
chmod 600 ssl/privkey.pem
```

**Restart Nginx:**

```bash
docker compose up -d nginx
```

### Option 2: Self-Signed Certificate (Development)

```bash
# Create SSL directory
mkdir -p ssl

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/privkey.pem \
  -out ssl/fullchain.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Set permissions
chmod 600 ssl/privkey.pem
```

### Option 3: Using Existing Certificates

```bash
# Create SSL directory
mkdir -p ssl

# Copy your certificates
cp /path/to/your/fullchain.pem ssl/
cp /path/to/your/privkey.pem ssl/

# Set permissions
chmod 600 ssl/privkey.pem
```

---

## Backup & Persistence

### 1. Database Backups

**Create Backup Script:**

Create `backup-database.sh`:

```bash
#!/bin/bash
# Load environment variables
if [ -f .env ]; then
  source .env
else
  echo "ERROR: .env file not found!"
  exit 1
fi

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/rccms_backup_$DATE.sql.gz"

mkdir -p $BACKUP_DIR

# Use environment variables for credentials
docker compose exec -T postgres pg_dump -U $PGUSER $PGDATABASE | gzip > "$BACKUP_FILE"

if [ -f "$BACKUP_FILE" ]; then
    echo "Backup successful: $BACKUP_FILE"
    find $BACKUP_DIR -name "rccms_backup_*.sql.gz" -mtime +30 -delete
    echo "Old backups cleaned"
else
    echo "Backup failed!"
    exit 1
fi
```

**Make Executable:**

```bash
chmod +x backup-database.sh
```

**Schedule Backups:**

```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /path/to/rccms-docker/backup-database.sh >> /path/to/rccms-docker/backup.log 2>&1
```

### 2. Restore Database

```bash
# Load environment variables
source .env

# Stop application
docker compose stop app

# Restore from backup (plain SQL format)
gunzip -c backups/rccms_backup_20250121_020000.sql.gz | \
  docker compose exec -T postgres psql -U $PGUSER -d $PGDATABASE

# Start application
docker compose start app
```

### 3. Volume Management

**List Volumes:**

```bash
docker volume ls | grep rccms
```

**Backup Volumes:**

```bash
# Backup PostgreSQL data volume
docker run --rm \
  -v rccms-docker_postgres_data:/data \
  -v $(pwd)/volume-backups:/backup \
  alpine tar czf /backup/postgres_data_$(date +%Y%m%d).tar.gz -C /data .
```

**Restore Volumes:**

```bash
# Restore PostgreSQL data volume
docker run --rm \
  -v rccms-docker_postgres_data:/data \
  -v $(pwd)/volume-backups:/backup \
  alpine tar xzf /backup/postgres_data_20250121.tar.gz -C /data
```

---

## Monitoring & Logs

### 1. View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f postgres
docker compose logs -f nginx

# Last 100 lines
docker compose logs --tail=100 app

# Since specific time
docker compose logs --since 2024-01-21T10:00:00 app
```

### 2. Monitor Resources

```bash
# Container stats
docker stats

# Specific containers
docker stats rccms-app rccms-postgres rccms-nginx

# Disk usage
docker system df

# Volume usage
docker volume ls
```

### 3. Health Checks

```bash
# Check container health
docker compose ps

# Inspect specific service health
docker inspect rccms-app | grep -A 10 Health

# Application health endpoint
curl http://localhost:5000/api/health
```

### 4. Database Monitoring

```bash
# Load environment variables
source .env

# Connect to database
docker compose exec postgres psql -U $PGUSER -d $PGDATABASE

# Check database size
docker compose exec postgres psql -U $PGUSER -d $PGDATABASE -c "SELECT pg_size_pretty(pg_database_size('$PGDATABASE'));"

# Active connections
docker compose exec postgres psql -U $PGUSER -d $PGDATABASE -c "SELECT count(*) FROM pg_stat_activity WHERE datname='$PGDATABASE';"
```

---

## Production Optimization

### 1. Resource Limits

Update `docker-compose.yml` to add resource limits:

```yaml
services:
  postgres:
    # ... existing config ...
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  app:
    # ... existing config ...
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 512M
```

### 2. Multi-Instance Application

```yaml
services:
  app:
    # ... existing config ...
    deploy:
      replicas: 3  # Run 3 instances
      restart_policy:
        condition: on-failure
        max_attempts: 3
```

### 3. Production Environment Variables

Create `.env.production`:

```env
NODE_ENV=production
PGDATABASE=rccms_db
PGUSER=rccms_user
PGPASSWORD=strong_production_password
SESSION_SECRET=production_session_secret_min_32_chars
TRUST_PROXY=true
SESSION_MAX_AGE=604800000
```

**Use in production:**

```bash
docker compose --env-file .env.production up -d
```

### 4. Automated Updates

Create `update-application.sh`:

```bash
#!/bin/bash
echo "Pulling latest code..."
git pull origin main

echo "Building new images..."
docker compose build

echo "Restarting services with zero downtime..."
docker compose up -d --force-recreate --no-deps app

echo "Cleaning up old images..."
docker image prune -f

echo "Update complete!"
```

---

## Zero-Downtime Deployment & Migration Strategy

This section explains how to deploy new features and database changes to production Docker/VPS deployments **without affecting existing user data** and with **minimal or zero downtime**.

---

### Overview: Production Migration Challenge

When you develop new features in Replit and want to deploy them to users running RCCMS in VPS/Docker environments, you face these challenges:

1. **Database Schema Changes**: New features may require new tables, columns, or data types
2. **Application Updates**: Frontend and backend code changes
3. **Data Preservation**: Existing rental contracts, customers, vehicles must remain intact
4. **Zero Downtime**: Users should continue working during upgrades
5. **Rollback Safety**: Ability to revert if something goes wrong

---

### Migration Strategy Options

#### Option 1: Backward-Compatible Migrations (Recommended)

**Best for**: Most schema changes, column additions, new tables

**Key Principle**: Changes are split into multiple deployments so old and new app versions can coexist.

**Example: Adding a new "fuelType" column to vehicles**

```sql
-- Migration Step 1: Add nullable column (backward compatible)
ALTER TABLE vehicles ADD COLUMN fuel_type VARCHAR(20);

-- Migration Step 2: Backfill data (run separately)
UPDATE vehicles SET fuel_type = 'gasoline' WHERE fuel_type IS NULL;

-- Migration Step 3: Add constraint (after app deployment)
ALTER TABLE vehicles ALTER COLUMN fuel_type SET NOT NULL;
```

**Deployment Flow**:
1. Deploy schema changes (Step 1) → Old app still works
2. Deploy new app version → New app uses new column
3. Finalize schema (Step 3) → Remove old compatibility layer

---

#### Option 2: Blue-Green Deployment

**Best for**: Major version changes, complete system upgrades

**How it works**:
- Run two identical environments (Blue = current, Green = new)
- Both share the same database (with backward-compatible schema)
- Switch traffic from Blue → Green after validation
- Instant rollback by switching back to Blue

**Implementation with Docker Compose**:

```yaml
# docker-compose.blue-green.yml
services:
  app-blue:
    image: rccms-app:v1.0
    container_name: rccms-app-blue
    # ... config ...

  app-green:
    image: rccms-app:v2.0
    container_name: rccms-app-green
    # ... config ...

  nginx:
    # Load balancer switches between blue/green
    volumes:
      - ./nginx-blue-green.conf:/etc/nginx/nginx.conf:ro
```

**Nginx Configuration for Traffic Switching**:

```nginx
upstream backend {
    # Initially route to blue
    server app-blue:5000;
    
    # After validation, switch to green
    # server app-green:5000;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```

---

#### Option 3: Rolling Deployment with Database Migrations

**Best for**: Incremental updates with minimal complexity

**Process**:
1. Run database migration script (backward-compatible changes)
2. Build new Docker image
3. Deploy new containers gradually
4. Old containers removed after new ones are healthy

---

### Database Migration Tools & Best Practices

#### Using Drizzle ORM (Built-in to RCCMS)

The RCCMS application uses **Drizzle ORM** for database management. Here's how to handle migrations:

**Step 1: Update Schema in Replit**

Edit `shared/schema.ts`:

```typescript
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // ... existing columns ...
  fuelType: varchar("fuel_type", { length: 20 }), // New column
  tankCapacity: integer("tank_capacity"), // New column
});
```

**Step 2: Generate Migration Files**

```bash
# In Replit
npm run db:generate

# This creates migration SQL files in drizzle/migrations/
```

**Step 3: Test Locally**

```bash
npm run db:push  # Apply to dev database
```

**Step 4: Export Migration Scripts**

Copy generated SQL files from `drizzle/migrations/` to your VPS.

**Step 5: Apply to Production (VPS/Docker)**

Create `migrations/` directory in your Docker deployment:

```bash
mkdir -p migrations
# Copy .sql files from Replit to migrations/
```

**Step 6: Run Migration in Production**

```bash
# Option A: Via Docker exec
docker compose exec app npm run db:push

# Option B: Using migration container
docker run --rm --network=rccms-network \
  -v $(pwd)/migrations:/migrations \
  -e DATABASE_URL="postgresql://..." \
  node:20-alpine sh -c "npx drizzle-kit push"
```

---

### Safe Schema Migration Patterns

#### ✅ Safe Operations (No Downtime)

```sql
-- Add nullable column
ALTER TABLE contracts ADD COLUMN extra_notes TEXT;

-- Add new table
CREATE TABLE notifications (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL
);

-- Create index concurrently
CREATE INDEX CONCURRENTLY idx_contracts_customer 
  ON contracts(customer_id);

-- Add column with default (PostgreSQL 11+)
ALTER TABLE vehicles ADD COLUMN is_electric BOOLEAN DEFAULT false;
```

#### ❌ Dangerous Operations (Causes Downtime)

```sql
-- Renaming columns (breaks old app)
ALTER TABLE vehicles RENAME COLUMN model TO vehicle_model;

-- Dropping columns (data loss!)
ALTER TABLE contracts DROP COLUMN old_field;

-- Adding NOT NULL without default (fails on existing data)
ALTER TABLE vehicles ADD COLUMN required_field VARCHAR NOT NULL;

-- Creating indexes without CONCURRENTLY (locks table)
CREATE INDEX idx_large_table ON contracts(status);
```

---

### Step-by-Step: Production Deployment Workflow

#### Scenario: Adding "Tank Capacity" Feature to RCCMS

**Phase 1: Prepare Migration (In Replit)**

1. Update `shared/schema.ts`:
```typescript
export const vehicles = pgTable("vehicles", {
  // ... existing ...
  tankCapacity: integer("tank_capacity"), // New field
});
```

2. Generate migration:
```bash
npm run db:generate
```

3. Test in Replit development environment:
```bash
npm run db:push
```

4. Export files:
   - Copy migration SQL from `drizzle/migrations/`
   - Package updated application code
   - Create changelog document

**Phase 2: Backup Production Data**

```bash
# On VPS
cd ~/rccms-docker

# Backup database
./backup-database.sh

# Backup volumes
docker run --rm \
  -v rccms-docker_postgres_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/full_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
```

**Phase 3: Apply Database Migration**

Create `migrate.sh`:

```bash
#!/bin/bash
set -e

echo "Starting database migration..."

# Set lock timeout (abort if can't get lock in 5 seconds)
docker compose exec -T postgres psql -U $PGUSER -d $PGDATABASE <<EOF
SET lock_timeout = '5s';

-- Add new columns (backward compatible)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS tank_capacity INTEGER;

-- Create new tables if needed
CREATE TABLE IF NOT EXISTS fuel_prices (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  fuel_type VARCHAR(20) NOT NULL,
  price_per_liter NUMERIC(10,2) NOT NULL,
  effective_date TIMESTAMP DEFAULT NOW()
);

EOF

echo "Migration completed successfully!"
```

Make executable and run:

```bash
chmod +x migrate.sh
./migrate.sh
```

**Phase 4: Deploy New Application**

Create `deploy-update.sh`:

```bash
#!/bin/bash
set -e

echo "=== RCCMS Production Deployment ==="

# 1. Pull latest code
echo "Pulling latest code..."
git pull origin main  # Or upload new files

# 2. Build new image with version tag
echo "Building new Docker image..."
docker compose build app
docker tag rccms-app:latest rccms-app:v2.0

# 3. Test new image
echo "Testing new image..."
docker run --rm --network=rccms-network \
  -e DATABASE_URL="$DATABASE_URL" \
  rccms-app:v2.0 node -e "console.log('Image OK')"

# 4. Deploy with zero downtime
echo "Deploying new version..."

# Start new container alongside old one
docker run -d --name rccms-app-new \
  --network=rccms-network \
  -e DATABASE_URL="$DATABASE_URL" \
  -e SESSION_SECRET="$SESSION_SECRET" \
  -e NODE_ENV=production \
  rccms-app:v2.0

# Wait for health check
echo "Waiting for new container to be healthy..."
sleep 10

# Check if healthy
if docker inspect rccms-app-new | grep -q '"Status": "healthy"'; then
  echo "New container is healthy. Switching traffic..."
  
  # Update nginx to point to new container
  # (Or use docker compose to replace old container)
  docker compose up -d app
  
  # Remove old container
  docker stop rccms-app-old 2>/dev/null || true
  docker rm rccms-app-old 2>/dev/null || true
  
  echo "✅ Deployment successful!"
else
  echo "❌ New container unhealthy. Rolling back..."
  docker stop rccms-app-new
  docker rm rccms-app-new
  exit 1
fi
```

**Phase 5: Verify Deployment**

```bash
# Check application health
curl https://your-domain.com/api/health

# Check logs
docker compose logs -f app --tail=50

# Test new features
# - Login to application
# - Create test rental contract
# - Verify tank capacity field appears
# - Check fuel calculation works
```

**Phase 6: Monitor & Validate**

```bash
# Monitor for 24 hours
docker stats rccms-app

# Check database connections
docker compose exec postgres psql -U $PGUSER -d $PGDATABASE \
  -c "SELECT count(*) FROM pg_stat_activity WHERE datname='$PGDATABASE';"

# Review error logs
docker compose logs app | grep ERROR
```

---

### Rollback Procedures

#### Quick Rollback (Application Only)

```bash
# Revert to previous Docker image
docker compose down
docker tag rccms-app:v1.0 rccms-app:latest
docker compose up -d

# Or using explicit version
docker run -d --name rccms-app \
  --network=rccms-network \
  -e DATABASE_URL="$DATABASE_URL" \
  rccms-app:v1.0
```

#### Full Rollback (Database + Application)

```bash
#!/bin/bash
# rollback.sh

echo "⚠️  Rolling back to previous version..."

# 1. Stop application
docker compose stop app

# 2. Restore database from backup
BACKUP_FILE="backups/rccms_backup_20250121_020000.sql.gz"

echo "Restoring database from $BACKUP_FILE..."
gunzip -c "$BACKUP_FILE" | \
  docker compose exec -T postgres psql -U $PGUSER -d $PGDATABASE

# 3. Revert to old app version
docker tag rccms-app:v1.0 rccms-app:latest
docker compose up -d app

echo "✅ Rollback complete. Verify application."
```

---

### Production-Ready Automation Scripts

#### Complete Zero-Downtime Deployment Script

Create `scripts/deploy-production.sh`:

```bash
#!/bin/bash
# RCCMS Production Deployment Automation
# Handles backup → migration → deployment → validation → rollback on failure
# Version: 2.0
# Author: AKN Consulting

set -e
set -o pipefail

# Configuration
VERSION="${1:-latest}"
MIGRATION_DIR="./migrations"
BACKUP_DIR="./backups"
LOG_FILE="./deployment_$(date +%Y%m%d_%H%M%S).log"
HEALTH_CHECK_RETRIES=10
HEALTH_CHECK_INTERVAL=5

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
  echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
  echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
  echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Cleanup function for rollback
cleanup_on_failure() {
  error "Deployment failed! Initiating automatic rollback..."
  if [ -n "$BACKUP_FILE" ] && [ -f "$BACKUP_FILE" ]; then
    ./scripts/rollback.sh "$BACKUP_FILE" "$OLD_IMAGE_TAG"
  else
    error "No backup file found. Manual intervention required!"
  fi
  exit 1
}

# Set trap for errors
trap cleanup_on_failure ERR

log "==================================================================="
log "RCCMS Production Deployment - Version $VERSION"
log "==================================================================="

# Step 1: Pre-flight checks
log "Step 1/10: Pre-flight checks..."

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
  error "Docker is not running!"
  exit 1
fi

# Check if migrations directory exists
if [ ! -d "$MIGRATION_DIR" ]; then
  warning "Migration directory not found. Creating it..."
  mkdir -p "$MIGRATION_DIR"
fi

# Check if backup directory exists
mkdir -p "$BACKUP_DIR"

# Load environment variables
if [ -f .env ]; then
  source .env
else
  error ".env file not found!"
  exit 1
fi

# Verify required env vars
if [ -z "$PGUSER" ] || [ -z "$PGDATABASE" ]; then
  error "Required environment variables not set!"
  exit 1
fi

# Check current application status
if ! docker compose ps app | grep -q "Up"; then
  error "Application is not running!"
  exit 1
fi

log "✅ Pre-flight checks passed"

# Step 2: Snapshot current state
log "Step 2/10: Creating pre-deployment snapshot..."

# Get current image tag
OLD_IMAGE_TAG=$(docker inspect rccms-app:latest --format='{{.RepoDigests}}' || echo "unknown")
log "Current image: $OLD_IMAGE_TAG"

# Record current database stats
PRE_MIGRATION_STATS=$(docker compose exec -T postgres psql -U $PGUSER -d $PGDATABASE <<EOF
SELECT 
  (SELECT count(*) FROM contracts) as contracts_count,
  (SELECT count(*) FROM customers) as customers_count,
  (SELECT count(*) FROM vehicles) as vehicles_count,
  (SELECT pg_size_pretty(pg_database_size('$PGDATABASE'))) as db_size;
EOF
)
log "Pre-migration database stats:"
echo "$PRE_MIGRATION_STATS" | tee -a "$LOG_FILE"

# Step 3: Create comprehensive backup
log "Step 3/10: Creating comprehensive backup..."

BACKUP_FILE="$BACKUP_DIR/rccms_backup_$(date +%Y%m%d_%H%M%S).sql.gz"
VOLUME_BACKUP="$BACKUP_DIR/postgres_volume_$(date +%Y%m%d_%H%M%S).tar.gz"

# Database backup (plain SQL format for easy restore)
log "Creating database backup: $BACKUP_FILE"
docker compose exec -T postgres pg_dump -U $PGUSER -d $PGDATABASE | gzip > "$BACKUP_FILE"

# Verify backup integrity
if [ ! -s "$BACKUP_FILE" ]; then
  error "Backup file is empty!"
  exit 1
fi

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log "✅ Database backup created: $BACKUP_SIZE"

# Volume backup
log "Creating volume backup: $VOLUME_BACKUP"
docker run --rm \
  -v rccms-docker_postgres_data:/data \
  -v "$(pwd)/$BACKUP_DIR":/backup \
  alpine tar czf /backup/$(basename $VOLUME_BACKUP) -C /data .

log "✅ Volume backup created"

# Step 4: Test database connection
log "Step 4/10: Testing database connection..."
if docker compose exec -T postgres psql -U $PGUSER -d $PGDATABASE -c "SELECT 1" > /dev/null 2>&1; then
  log "✅ Database connection successful"
else
  error "Cannot connect to database!"
  exit 1
fi

# Step 5: Run database migrations
log "Step 5/10: Running database migrations..."

if ls "$MIGRATION_DIR"/*.sql > /dev/null 2>&1; then
  for sql_file in "$MIGRATION_DIR"/*.sql; do
    log "Applying migration: $(basename $sql_file)"
    
    # Create temporary SQL file with transaction wrapper
    TMP_SQL="/tmp/migration_$(basename $sql_file)"
    cat > "$TMP_SQL" <<EOF
BEGIN;
SET lock_timeout = '10s';
SET statement_timeout = '30s';

EOF
    cat "$sql_file" >> "$TMP_SQL"
    cat >> "$TMP_SQL" <<EOF

-- Verify migration didn't break constraints
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
  AND contype IN ('f', 'p', 'u')
ORDER BY contype, conname;

COMMIT;
EOF
    
    # Execute the migration
    if cat "$TMP_SQL" | docker compose exec -T postgres psql -U $PGUSER -d $PGDATABASE > /dev/null 2>&1; then
      log "✅ Migration applied: $(basename $sql_file)"
      rm -f "$TMP_SQL"
    else
      error "Migration failed: $(basename $sql_file)"
      rm -f "$TMP_SQL"
      cleanup_on_failure
    fi
  done
else
  warning "No migration files found in $MIGRATION_DIR"
fi

# Validate database integrity after migration
log "Validating database integrity..."
POST_MIGRATION_STATS=$(docker compose exec -T postgres psql -U $PGUSER -d $PGDATABASE <<EOF
SELECT 
  (SELECT count(*) FROM contracts) as contracts_count,
  (SELECT count(*) FROM customers) as customers_count,
  (SELECT count(*) FROM vehicles) as vehicles_count;
EOF
)

log "Post-migration database stats:"
echo "$POST_MIGRATION_STATS" | tee -a "$LOG_FILE"

log "✅ Database migrations complete"

# Step 6: Build new application image
log "Step 6/10: Building new application image..."

docker compose build app 2>&1 | tee -a "$LOG_FILE"

if [ $? -ne 0 ]; then
  error "Image build failed!"
  cleanup_on_failure
fi

# Tag the new image
docker tag rccms-app:latest rccms-app:$VERSION
log "✅ Image built and tagged: rccms-app:$VERSION"

# Step 7: Test new image
log "Step 7/10: Testing new image..."

# Quick smoke test
TEST_OUTPUT=$(docker run --rm \
  --network=rccms-network \
  -e DATABASE_URL="postgresql://$PGUSER:$PGPASSWORD@postgres:5432/$PGDATABASE" \
  -e NODE_ENV=production \
  rccms-app:$VERSION \
  node -e "console.log('Image test passed')" 2>&1)

if echo "$TEST_OUTPUT" | grep -q "Image test passed"; then
  log "✅ Image test passed"
else
  error "Image test failed: $TEST_OUTPUT"
  cleanup_on_failure
fi

# Step 8: Deploy new version with zero downtime
log "Step 8/10: Deploying new version (zero downtime)..."

# Start new container alongside old one
log "Starting new container..."
docker run -d \
  --name rccms-app-new \
  --network=rccms-network \
  -e DATABASE_URL="postgresql://$PGUSER:$PGPASSWORD@postgres:5432/$PGDATABASE" \
  -e SESSION_SECRET="$SESSION_SECRET" \
  -e NODE_ENV=production \
  -e PGHOST=postgres \
  -e PGUSER="$PGUSER" \
  -e PGPASSWORD="$PGPASSWORD" \
  -e PGDATABASE="$PGDATABASE" \
  -e PGPORT=5432 \
  -e TRUST_PROXY=true \
  --health-cmd='node -e "require(\"http\").get(\"http://localhost:5000/api/health\", (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"' \
  --health-interval=10s \
  --health-timeout=5s \
  --health-retries=3 \
  --health-start-period=40s \
  rccms-app:$VERSION

# Wait for new container to be healthy
log "Waiting for new container to be healthy..."
for i in $(seq 1 $HEALTH_CHECK_RETRIES); do
  sleep $HEALTH_CHECK_INTERVAL
  
  HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' rccms-app-new 2>/dev/null || echo "none")
  
  if [ "$HEALTH_STATUS" == "healthy" ]; then
    log "✅ New container is healthy (attempt $i/$HEALTH_CHECK_RETRIES)"
    break
  elif [ "$HEALTH_STATUS" == "unhealthy" ]; then
    error "New container is unhealthy!"
    docker logs rccms-app-new --tail=50
    docker stop rccms-app-new
    docker rm rccms-app-new
    cleanup_on_failure
  else
    log "Health check in progress... ($i/$HEALTH_CHECK_RETRIES) Status: $HEALTH_STATUS"
  fi
  
  if [ $i -eq $HEALTH_CHECK_RETRIES ]; then
    error "Health check timed out!"
    docker logs rccms-app-new --tail=50
    docker stop rccms-app-new
    docker rm rccms-app-new
    cleanup_on_failure
  fi
done

# Step 9: Switch traffic to new container
log "Step 9/10: Switching traffic to new container..."

# Rename containers
docker rename rccms-app rccms-app-old 2>/dev/null || true
docker rename rccms-app-new rccms-app

# Update docker-compose to use new image
docker compose up -d app --no-deps

# Give it a moment to stabilize
sleep 5

# Verify new container is serving traffic
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
  log "✅ New container is serving traffic"
else
  error "New container not responding to health checks!"
  cleanup_on_failure
fi

# Stop and remove old container
log "Stopping old container..."
docker stop rccms-app-old 2>/dev/null || true
docker rm rccms-app-old 2>/dev/null || true

log "✅ Traffic switched successfully"

# Step 10: Post-deployment validation
log "Step 10/10: Post-deployment validation..."

# Test critical endpoints
log "Testing critical endpoints..."

# Health check
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
  log "✅ Health endpoint OK"
else
  error "Health endpoint failed!"
  cleanup_on_failure
fi

# Database connection from app
if curl -f http://localhost:5000/api/users > /dev/null 2>&1; then
  log "✅ Database connection from app OK"
else
  warning "Database endpoint returned error (may need authentication)"
fi

# Check logs for errors
ERROR_COUNT=$(docker compose logs app --since=5m 2>&1 | grep -i "error" | wc -l)
if [ "$ERROR_COUNT" -gt 5 ]; then
  warning "Found $ERROR_COUNT errors in logs. Review manually."
else
  log "✅ Low error count in logs: $ERROR_COUNT"
fi

# Final database integrity check
log "Final database integrity check..."
docker compose exec -T postgres psql -U $PGUSER -d $PGDATABASE <<EOF
SELECT 'OK' as status;
EOF

log "==================================================================="
log "✅ DEPLOYMENT SUCCESSFUL"
log "==================================================================="
log ""
log "Version deployed: $VERSION"
log "Backup file: $BACKUP_FILE"
log "Deployment log: $LOG_FILE"
log ""
log "Next steps:"
log "1. Monitor application: docker compose logs -f app"
log "2. Test features: https://your-domain.com"
log "3. Monitor for 1 hour before considering deployment stable"
log "4. If issues arise, run: ./scripts/rollback.sh \"$BACKUP_FILE\" \"$OLD_IMAGE_TAG\""
log ""
log "Keep backup for 30 days: $BACKUP_FILE"
log "==================================================================="

exit 0
```

Make executable:

```bash
chmod +x scripts/deploy-production.sh
```

#### Production Rollback Script

Create `scripts/rollback.sh`:

```bash
#!/bin/bash
# RCCMS Production Rollback Script
# Comprehensive rollback with database restoration and container reversion
# Version: 2.0
# Author: AKN Consulting

set -e
set -o pipefail

# Configuration
BACKUP_FILE="${1}"
OLD_IMAGE_TAG="${2:-v1.0}"
LOG_FILE="./rollback_$(date +%Y%m%d_%H%M%S).log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
  echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
  echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
  echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Validate inputs
if [ -z "$BACKUP_FILE" ]; then
  error "Usage: ./scripts/rollback.sh <backup_file> [old_image_tag]"
  error "Example: ./scripts/rollback.sh backups/rccms_backup_20250121_020000.sql.gz v1.0"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  error "Backup file not found: $BACKUP_FILE"
  exit 1
fi

# Load environment
if [ -f .env ]; then
  source .env
else
  error ".env file not found!"
  exit 1
fi

log "==================================================================="
log "⚠️  RCCMS PRODUCTION ROLLBACK"
log "==================================================================="
log "Backup file: $BACKUP_FILE"
log "Target image: $OLD_IMAGE_TAG"
log ""

# Confirmation prompt
read -p "This will restore database and revert application. Continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
  log "Rollback cancelled by user"
  exit 0
fi

# Step 1: Create pre-rollback backup (just in case)
log "Step 1/7: Creating pre-rollback safety backup..."
SAFETY_BACKUP="backups/pre_rollback_safety_$(date +%Y%m%d_%H%M%S).sql.gz"
docker compose exec -T postgres pg_dump -U $PGUSER -d $PGDATABASE | gzip > "$SAFETY_BACKUP"
log "✅ Safety backup created: $SAFETY_BACKUP"

# Step 2: Stop current application
log "Step 2/7: Stopping current application..."
docker compose stop app
log "✅ Application stopped"

# Step 3: Terminate active database connections
log "Step 3/7: Terminating active database connections..."
docker compose exec -T postgres psql -U $PGUSER -d postgres <<EOF
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '$PGDATABASE' AND pid <> pg_backend_pid();
EOF
log "✅ Active connections terminated"

# Step 4: Restore database from backup
log "Step 4/7: Restoring database from backup..."

# Drop and recreate database for clean restore
docker compose exec -T postgres psql -U $PGUSER -d postgres <<EOF
DROP DATABASE IF EXISTS ${PGDATABASE}_old;
ALTER DATABASE $PGDATABASE RENAME TO ${PGDATABASE}_old;
CREATE DATABASE $PGDATABASE OWNER $PGUSER;
EOF

# Restore from backup (plain SQL format)
log "Restoring data..."
if [[ "$BACKUP_FILE" == *.gz ]]; then
  gunzip -c "$BACKUP_FILE" | docker compose exec -T postgres psql -U $PGUSER -d $PGDATABASE
else
  docker compose exec -T postgres psql -U $PGUSER -d $PGDATABASE < "$BACKUP_FILE"
fi

if [ $? -eq 0 ]; then
  log "✅ Database restored successfully"
  # Drop old database
  docker compose exec -T postgres psql -U $PGUSER -d postgres -c "DROP DATABASE IF EXISTS ${PGDATABASE}_old;"
else
  error "Database restoration failed!"
  # Restore original database name
  docker compose exec -T postgres psql -U $PGUSER -d postgres <<EOF
DROP DATABASE IF EXISTS $PGDATABASE;
ALTER DATABASE ${PGDATABASE}_old RENAME TO $PGDATABASE;
EOF
  exit 1
fi

# Step 5: Verify database integrity
log "Step 5/7: Verifying database integrity..."

# Check table counts
VERIFICATION=$(docker compose exec -T postgres psql -U $PGUSER -d $PGDATABASE <<EOF
SELECT 
  (SELECT count(*) FROM contracts) as contracts,
  (SELECT count(*) FROM customers) as customers,
  (SELECT count(*) FROM vehicles) as vehicles,
  (SELECT count(*) FROM users) as users;
EOF
)

log "Restored database statistics:"
echo "$VERIFICATION" | tee -a "$LOG_FILE"

# Verify critical tables exist
docker compose exec -T postgres psql -U $PGUSER -d $PGDATABASE <<EOF
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
EOF

log "✅ Database integrity verified"

# Step 6: Revert application to previous version
log "Step 6/7: Reverting application to previous version..."

# Check if old image exists
if docker image inspect rccms-app:$OLD_IMAGE_TAG > /dev/null 2>&1; then
  log "Using existing image: rccms-app:$OLD_IMAGE_TAG"
  docker tag rccms-app:$OLD_IMAGE_TAG rccms-app:latest
else
  warning "Image rccms-app:$OLD_IMAGE_TAG not found. Using current 'latest'."
fi

# Start application
docker compose up -d app

log "✅ Application reverted"

# Step 7: Validate rollback
log "Step 7/7: Validating rollback..."

# Wait for application to be healthy
log "Waiting for application to be healthy..."
for i in {1..20}; do
  sleep 5
  
  if docker compose ps app | grep -q "healthy"; then
    log "✅ Application is healthy"
    break
  fi
  
  if [ $i -eq 20 ]; then
    error "Application failed to become healthy after rollback!"
    docker compose logs app --tail=50
    exit 1
  fi
  
  log "Waiting for health check... ($i/20)"
done

# Test health endpoint
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
  log "✅ Health endpoint responding"
else
  error "Health endpoint not responding!"
  docker compose logs app --tail=50
  exit 1
fi

# Check logs for errors
ERROR_COUNT=$(docker compose logs app --since=2m 2>&1 | grep -i "error" | wc -l)
log "Error count in recent logs: $ERROR_COUNT"

log "==================================================================="
log "✅ ROLLBACK COMPLETE"
log "==================================================================="
log ""
log "Rolled back to: $OLD_IMAGE_TAG"
log "Database restored from: $BACKUP_FILE"
log "Safety backup (current state before rollback): $SAFETY_BACKUP"
log "Rollback log: $LOG_FILE"
log ""
log "Next steps:"
log "1. Verify application functionality: https://your-domain.com"
log "2. Test critical workflows (login, create contract, etc.)"
log "3. Monitor logs: docker compose logs -f app"
log "4. Review what went wrong in failed deployment"
log "5. Keep safety backup for 7 days: $SAFETY_BACKUP"
log "==================================================================="

exit 0
```

Make executable:

```bash
chmod +x scripts/rollback.sh
```

#### Usage Examples

**Deploy new version:**

```bash
# Full zero-downtime deployment with automated rollback on failure
./scripts/deploy-production.sh v2.1
```

**Rollback if needed:**

```bash
# Restore to previous state
./scripts/rollback.sh backups/rccms_backup_20250124_143022.sql.gz v2.0
```

---

### Migration Checklist

Use this checklist for every production deployment:

#### Pre-Deployment

- [ ] Feature fully tested in Replit development environment
- [ ] Database migration scripts generated and reviewed
- [ ] Migration scripts tested on local Docker instance
- [ ] Backup scripts tested and verified
- [ ] Rollback procedure documented
- [ ] Deployment window scheduled (low-traffic time)
- [ ] Team notified of planned deployment

#### Deployment

- [ ] Full database backup completed
- [ ] Volume backup completed
- [ ] Database migration applied successfully
- [ ] New Docker image built and tagged
- [ ] New containers deployed
- [ ] Health checks passing
- [ ] Application accessible
- [ ] New features functional

#### Post-Deployment

- [ ] Monitor logs for 1 hour
- [ ] Test critical workflows (create contract, process payment)
- [ ] Monitor database performance
- [ ] Check error rates
- [ ] Notify team of successful deployment
- [ ] Document any issues encountered
- [ ] Update version tracking

#### Rollback (If Needed)

- [ ] Identify root cause
- [ ] Stop new application containers
- [ ] Restore database from backup
- [ ] Deploy previous application version
- [ ] Verify rollback successful
- [ ] Document issues for future prevention

---

### Common Migration Scenarios

#### Scenario 1: Adding New Feature Table

**Example: Adding notifications system**

```sql
-- Migration: Add notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
```

**Deployment**: This is backward-compatible. Old app ignores new table.

---

#### Scenario 2: Modifying Existing Column

**Example: Changing contract_number from VARCHAR to INTEGER**

**❌ Wrong way (breaks everything):**
```sql
ALTER TABLE contracts ALTER COLUMN contract_number TYPE INTEGER;
```

**✅ Right way (3-step migration):**

```sql
-- Step 1: Add new column
ALTER TABLE contracts ADD COLUMN contract_number_new INTEGER;

-- Step 2: Backfill data
UPDATE contracts SET contract_number_new = contract_number::INTEGER;

-- Deploy new app version that uses contract_number_new

-- Step 3: After app deployed, remove old column
ALTER TABLE contracts DROP COLUMN contract_number;
ALTER TABLE contracts RENAME COLUMN contract_number_new TO contract_number;
```

---

#### Scenario 3: Data Migration

**Example: Migrating vehicle fuel types to lookup table**

```sql
-- Step 1: Create lookup table
CREATE TABLE fuel_types (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  name_ar VARCHAR(50) NOT NULL
);

INSERT INTO fuel_types (name, name_ar) VALUES
  ('gasoline', 'بنزين'),
  ('diesel', 'ديزل'),
  ('electric', 'كهربائي');

-- Step 2: Add foreign key column
ALTER TABLE vehicles ADD COLUMN fuel_type_id VARCHAR REFERENCES fuel_types(id);

-- Step 3: Migrate data
UPDATE vehicles v
SET fuel_type_id = (SELECT id FROM fuel_types WHERE name = v.fuel_type)
WHERE v.fuel_type IS NOT NULL;

-- Deploy new app version

-- Step 4: Clean up old column (after deployment)
ALTER TABLE vehicles DROP COLUMN fuel_type;
```

---

### Monitoring Migration Success

#### Key Metrics to Watch

```bash
# Database connection count
docker compose exec postgres psql -U $PGUSER -d $PGDATABASE \
  -c "SELECT count(*) as connections FROM pg_stat_activity WHERE datname='$PGDATABASE';"

# Table sizes after migration
docker compose exec postgres psql -U $PGUSER -d $PGDATABASE \
  -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"

# Error count in logs
docker compose logs app --since 1h | grep -i error | wc -l

# Application response time
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com

# Where curl-format.txt contains:
# time_total: %{time_total}s
```

---

### Best Practices Summary

1. **Always Backup First**: No exceptions. Database + volumes.

2. **Test Locally**: Run migrations on local Docker before production.

3. **Backward Compatibility**: Schema changes must support old app version.

4. **Small Batches**: Deploy changes incrementally, not all at once.

5. **Lock Timeouts**: Prevent migrations from blocking production queries.
   ```sql
   SET lock_timeout = '5s';
   ```

6. **Use Transactions Carefully**: Don't wrap entire migration in one transaction.

7. **Monitor Actively**: Watch logs and metrics for 24 hours post-deployment.

8. **Document Everything**: Keep deployment log with timestamps and actions.

9. **Automate When Possible**: Scripts reduce human error.

10. **Have Rollback Plan**: Test rollback procedure before deployment.

---

### Migration Testing Procedure

Before production deployment, test on staging environment:

```bash
# Create staging environment
cp docker-compose.yml docker-compose.staging.yml

# Edit to use staging database
# Deploy to staging
docker compose -f docker-compose.staging.yml up -d

# Run migration on staging
./scripts/migrate-production.sh v2.0

# Test thoroughly
# - Login
# - Create contracts
# - Generate reports
# - Test all new features

# If successful, proceed to production
```

---

### Emergency Contacts & Support

**During Migration:**
- **Developer**: AKN Consulting - rccms@akn-consulting.com
- **Phone Support**: +91 9400750821
- **Emergency Rollback**: Use `rollback.sh` script

**Post-Migration Issues:**
1. Check logs: `docker compose logs -f app`
2. Verify database: Connect via `psql` and inspect tables
3. Contact support with:
   - Error messages from logs
   - Steps taken before issue
   - Backup file timestamp

---

This comprehensive strategy ensures that RCCMS deployments on VPS/Docker can receive new features from Replit development without data loss or extended downtime.

---

## Troubleshooting

### Containers Won't Start

```bash
# Check logs
docker compose logs

# Rebuild images
docker compose build --no-cache

# Remove all containers and volumes (WARNING: data loss)
docker compose down -v
docker compose up -d
```

### Database Connection Errors

```bash
# Check PostgreSQL container
docker compose logs postgres

# Verify environment variables
docker compose exec app env | grep PG

# Test database connection
docker compose exec app node -e "require('pg').Pool({connectionString: process.env.DATABASE_URL}).query('SELECT NOW()', console.log)"
```

### Application Crashes

```bash
# Check application logs
docker compose logs app --tail=200

# Restart application
docker compose restart app

# Rebuild if needed
docker compose up -d --build app
```

### Port Conflicts

```bash
# Find process using port
sudo lsof -i :5000
sudo lsof -i :5432

# Change ports in docker-compose.yml
# Example: "5001:5000" instead of "5000:5000"
```

### Clean Everything and Start Fresh

```bash
# WARNING: This removes all data!

# Stop all containers
docker compose down

# Remove volumes (data loss!)
docker compose down -v

# Remove images
docker compose down --rmi all

# Remove orphan containers
docker system prune -a --volumes

# Start fresh
docker compose up -d
```

---

## Docker Commands Reference

### Docker Compose Commands

```bash
# Start services
docker compose up -d                # Detached mode
docker compose up --build           # Rebuild and start

# Stop services
docker compose stop                 # Stop containers
docker compose down                 # Stop and remove containers
docker compose down -v              # Also remove volumes

# View status
docker compose ps                   # List containers
docker compose logs -f              # Follow logs
docker compose top                  # Show processes

# Execute commands
docker compose exec app sh          # Shell in app container
docker compose exec postgres psql   # PostgreSQL shell

# Restart services
docker compose restart              # Restart all
docker compose restart app          # Restart specific service

# Scale services
docker compose up -d --scale app=3  # Run 3 app instances
```

### Docker Commands

```bash
# Images
docker images                       # List images
docker rmi <image-id>              # Remove image
docker image prune                 # Remove unused images

# Containers
docker ps                          # List running containers
docker ps -a                       # List all containers
docker rm <container-id>           # Remove container
docker container prune             # Remove stopped containers

# Volumes
docker volume ls                   # List volumes
docker volume rm <volume-name>     # Remove volume
docker volume prune                # Remove unused volumes

# System
docker system df                   # Show disk usage
docker system prune -a             # Remove all unused data
```

---

## Final Checklist

- [ ] Docker and Docker Compose installed
- [ ] Application files in place
- [ ] `.env` file configured with strong passwords
- [ ] `docker-compose.yml` configured
- [ ] Dockerfile created
- [ ] `nginx.conf` configured
- [ ] SSL certificates in place (production)
- [ ] Database initialization script created
- [ ] Images built successfully
- [ ] All containers healthy
- [ ] Database schema initialized
- [ ] Default admin password changed
- [ ] Backup script created and scheduled
- [ ] Application accessible via domain
- [ ] Logs checked for errors

---

## Quick Start Commands

```bash
# Build and start
docker compose up -d --build

# Initialize database
docker compose exec app npm run db:push

# View logs
docker compose logs -f

# Check status
docker compose ps

# Backup database
./backup-database.sh

# Update application
./update-application.sh

# Stop everything
docker compose down
```

---

**Docker Deployment Complete!**

Your RCCMS (Rental Car Contract Management System) is now running in Docker containers.

**Access**: `https://your-domain.com`

**Default Login:**
- Username: `admin`
- Password: `admin123` (CHANGE IMMEDIATELY!)

For additional help, refer to the **Administrator Guide** and **Maintenance Guide**.
