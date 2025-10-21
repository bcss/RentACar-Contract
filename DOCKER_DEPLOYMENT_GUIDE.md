# Docker Deployment Guide
## MARMAR Rental Car Contract Management System

**Containerized Deployment with Docker & Docker Compose**

---

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
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

**Minimum Specifications:**
- **OS**: Ubuntu 20.04+, Debian 11+, RHEL 8+, or Windows 10+ with WSL2
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+

**Recommended Specifications:**
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **Docker**: Latest stable version

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
mkdir -p ~/marmar-docker
cd ~/marmar-docker

# Option A: Clone from Git
git clone https://github.com/your-org/marmar-app.git .

# Option B: Upload files
# Use SCP or SFTP to upload application files
```

### 2. Project Structure

```
marmar-docker/
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

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY . .

# Build application
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
    container_name: marmar-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${PGDATABASE:-marmar_db}
      POSTGRES_USER: ${PGUSER:-marmar_user}
      POSTGRES_PASSWORD: ${PGPASSWORD:-changeme}
      POSTGRES_INITDB_ARGS: "-E UTF8 --locale=en_US.UTF-8"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d:ro
    ports:
      - "5432:5432"  # Only expose for debugging, remove in production
    networks:
      - marmar-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${PGUSER:-marmar_user} -d ${PGDATABASE:-marmar_db}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Application
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: marmar-app
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${PGUSER:-marmar_user}:${PGPASSWORD:-changeme}@postgres:5432/${PGDATABASE:-marmar_db}
      PGHOST: postgres
      PGUSER: ${PGUSER:-marmar_user}
      PGPASSWORD: ${PGPASSWORD:-changeme}
      PGDATABASE: ${PGDATABASE:-marmar_db}
      PGPORT: 5432
      SESSION_SECRET: ${SESSION_SECRET}
      PORT: 5000
      TRUST_PROXY: "true"
    ports:
      - "5000:5000"
    networks:
      - marmar-network
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
    container_name: marmar-nginx
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
      - marmar-network
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  marmar-network:
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
PGDATABASE=marmar_db
PGUSER=marmar_user
PGPASSWORD=your_secure_database_password_here_min_16_chars

# Session Secret (CRITICAL - Generate random string)
# Generate with: openssl rand -base64 32
SESSION_SECRET=your_super_secret_random_string_minimum_32_characters_long

# Application
NODE_ENV=production
PORT=5000

# Session
SESSION_MAX_AGE=604800000    # 7 days
SESSION_NAME=marmar.sid

# Security
TRUST_PROXY=true
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

-- Create default super admin user
-- Password: admin123 (bcrypt hash below)
-- CHANGE THIS PASSWORD IMMEDIATELY after first login!
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
    '$2b$10$YourBcryptHashHereFromGenerationStep',
    'admin@marmar-rental.com',
    'System',
    'Administrator',
    'admin',
    true
) ON CONFLICT (username) DO NOTHING;

-- Insert default company settings
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
    'MARMAR Car Rental',
    'شركة مرمر لتأجير السيارات',
    '+966 XX XXX XXXX',
    'info@marmar-rental.com',
    'Your Address Here',
    'عنوانك هنا',
    'CR-XXXXXXXX',
    'TAX-XXXXXXXX'
)
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO marmar_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO marmar_user;
```

**Generate Admin Password Hash:**

```bash
# Install bcrypt if needed
npm install bcrypt

# Generate hash
node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('admin123', 10));"

# Copy the output hash and replace in 01-init.sql above
```

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
```

### 3. Verify Application

```bash
# Check all containers are running
docker compose ps

# Should show:
# - marmar-postgres (healthy)
# - marmar-app (healthy)
# - marmar-nginx (healthy)

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
- Username: `admin`
- Password: `admin123`
- **CHANGE IMMEDIATELY!**

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
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/marmar_backup_$DATE.sql.gz"

mkdir -p $BACKUP_DIR

docker compose exec -T postgres pg_dump -U marmar_user marmar_db | gzip > "$BACKUP_FILE"

if [ -f "$BACKUP_FILE" ]; then
    echo "Backup successful: $BACKUP_FILE"
    find $BACKUP_DIR -name "marmar_backup_*.sql.gz" -mtime +30 -delete
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
0 2 * * * /path/to/marmar-docker/backup-database.sh >> /path/to/marmar-docker/backup.log 2>&1
```

### 2. Restore Database

```bash
# Stop application
docker compose stop app

# Restore from backup
gunzip -c backups/marmar_backup_20250121_020000.sql.gz | \
  docker compose exec -T postgres psql -U marmar_user -d marmar_db

# Start application
docker compose start app
```

### 3. Volume Management

**List Volumes:**

```bash
docker volume ls | grep marmar
```

**Backup Volumes:**

```bash
# Backup PostgreSQL data volume
docker run --rm \
  -v marmar-docker_postgres_data:/data \
  -v $(pwd)/volume-backups:/backup \
  alpine tar czf /backup/postgres_data_$(date +%Y%m%d).tar.gz -C /data .
```

**Restore Volumes:**

```bash
# Restore PostgreSQL data volume
docker run --rm \
  -v marmar-docker_postgres_data:/data \
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
docker stats marmar-app marmar-postgres marmar-nginx

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
docker inspect marmar-app | grep -A 10 Health

# Application health endpoint
curl http://localhost:5000/api/health
```

### 4. Database Monitoring

```bash
# Connect to database
docker compose exec postgres psql -U marmar_user -d marmar_db

# Check database size
docker compose exec postgres psql -U marmar_user -d marmar_db -c "SELECT pg_size_pretty(pg_database_size('marmar_db'));"

# Active connections
docker compose exec postgres psql -U marmar_user -d marmar_db -c "SELECT count(*) FROM pg_stat_activity WHERE datname='marmar_db';"
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
PGDATABASE=marmar_db
PGUSER=marmar_user
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

Your MARMAR Rental Car Contract Management System is now running in Docker containers.

**Access**: `https://your-domain.com`

**Default Login:**
- Username: `admin`
- Password: `admin123` (CHANGE IMMEDIATELY!)

For additional help, refer to the **Administrator Guide** and **Maintenance Guide**.
